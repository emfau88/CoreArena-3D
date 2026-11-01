import { arenaHud } from './arenaHud';
import '../arenaHud.css';
import { M1_ARENA } from '../arena/arena';
import { EXPANDED_ARENA, EXPANDED_PICKUPS, TEAM_SPAWNS } from '../arena/expandedArena';
import { buildExpandedArena } from '../render/expandedArenaView';
import { FixedClock } from '../core/fixedClock';
import { Simulation } from '../core/simulation';
import { COMPACT_JUMP, SHALLOW_STEPS } from '../core/movementProfile';
import { createSpatialWorld } from '../physics/rapierWorld';
import { DesktopInput } from '../input/desktopInput';
import { ArenaView } from '../render/arenaView';
import { DiagnosticWeapon, solveAim } from '../core/aim';
import type { AimSolution } from '../core/aim';
import { TraversalProbe } from '../core/traversal';
import { ArenaMatch } from '../core/match';
import { inTrainingField, TRAINING_FIELD } from '../arena/training';
import { Combat } from '../core/combat';
import type { WeaponId } from '../core/combat';
import { Pickups } from '../core/pickups';
import { createCombatBot, type CombatBot } from './combatBot';
import { actorCenter, type BotDifficulty } from '../core/bot';
import { BotView } from '../render/botView';
import { ARENA_FIGHTERS, arenaRoster, fighterTarget, type ArenaMode } from '../arena/teams';
import { ArenaFeedback } from './arenaFeedback';
import { ArenaDeathView } from '../render/arenaDeathView';
import { ArenaFixtures } from '../render/arenaFixtures';

export async function startGame(host: HTMLElement): Promise<() => void> {
  const fighters = ARENA_FIGHTERS.filter(fighter => fighter.id !== 'player');
  const world = await createSpatialWorld({ ...EXPANDED_ARENA, targets: [...M1_ARENA.targets ?? [], ...fighters.map(fighterTarget)] }, SHALLOW_STEPS);
  const bots: CombatBot[] = [];
  try { for (const fighter of fighters) {
    world.setTargetEnabled(fighter.id, false);
    bots.push(await createCombatBot(fighter, ARENA_FIGHTERS, EXPANDED_ARENA, true));
  } } catch (error) { world.dispose(); bots.forEach(bot => bot.dispose()); throw error; }
  let arenaMode: ArenaMode = 'training';
  let difficulty: BotDifficulty = 'normal';
  const playerSpawn = () => arenaMode === 'teams' ? TEAM_SPAWNS.player! : M1_ARENA.spawn;
  const botSpawn = (bot: CombatBot) => arenaMode === 'teams' ? TEAM_SPAWNS[bot.fighter.id]! : bot.fighter.spawn;
  const activeBots = () => bots.filter(bot => arenaMode === 'teams' || arenaMode === 'duel' && bot.fighter.id === 'rival');
  // An isolated, non-blocking route probe shares the identical arena and player motor.
  const probeWorld = await createSpatialWorld(EXPANDED_ARENA, SHALLOW_STEPS);
  const probeSimulation = new Simulation(probeWorld, M1_ARENA.spawn, COMPACT_JUMP);
  let probe = new TraversalProbe(M1_ARENA.links ?? []);
  const weapon = new DiagnosticWeapon();
  const combat = new Combat('player', true);
  const pickups = new Pickups(EXPANDED_PICKUPS);
  let match = new ArenaMatch(arenaRoster(arenaMode));
  let aim: AimSolution | null = null;
  let view: ArenaView;
  try { view = new ArenaView(host, EXPANDED_ARENA, { pickups: EXPANDED_PICKUPS, build: buildExpandedArena, shadowSpan: 35,
    playerColor: 0xffffff, playerLabel: 'DU', keepDeathPose: false, arenaPads: true, arenaRole:'player' }); }
  catch (error) { world.dispose(); probeWorld.dispose(); bots.forEach(bot => bot.dispose()); throw error; }
  const botViews = bots.map(bot => new BotView(view.scene, bot.fighter.team, bot.fighter.id === 'ally' ? 'VERBÜNDETER' : 'GEGNER'));
  const deaths = new ArenaDeathView(view.scene);
  const fixtures = new ArenaFixtures(view.scene, EXPANDED_PICKUPS);
  let unavailablePickup: string | null = null;
  host.dataset.arena = 'true';
  // Arena fights need more surrounding space than the close Adventure camera.
  view.camera.trackPlayer(M1_ARENA.spawn, matchMedia('(any-pointer: coarse)').matches ? 1.4 : 1.25); view.resize();
  view.camera.containArena(29, 19);
  const simulation = new Simulation(world, M1_ARENA.spawn, COMPACT_JUMP);
  const clock = new FixedClock();
  const diagnosticsAllowed = import.meta.env.DEV || import.meta.env.MODE === 'test';
  let diagnostics = false;
  let paused = false;
  let menuPaused = false;
  let displayReady = false;
  let previous = simulation.snapshot();
  let current = previous;
  let lastTime = performance.now();
  let lastHud = 0;
  let frameId = 0;
  const frames: number[] = [];
  const steps: number[] = [];
  host.insertAdjacentHTML('beforeend', arenaHud());
  const label = host.querySelector<HTMLElement>('#camera-label')!;
  const pausePanel = host.querySelector<HTMLElement>('#pause')!;
  const diagnosticPanel = host.querySelector<HTMLElement>('#diagnostics')!;
  const hitLabel = host.querySelector<HTMLElement>('#hit-count')!;
  const heightLabel = host.querySelector<HTMLElement>('#height-status')!;
  const probeLabel = host.querySelector<HTMLElement>('#probe-status')!;
  const probeButton = host.querySelector<HTMLButtonElement>('#probe-start')!;
  const element = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const feedback = new ArenaFeedback(host, element('arena-settings'));
  const startProbe = () => {
    if (arenaMode !== 'training' || match.snapshot().phase !== 'running') return;
    probe.start(); probeButton.disabled = true; menuPaused = false; setPaused(false);
    view.renderer.domElement.focus();
  };
  const toggleCamera = () => {
    view.camera.toggle();
    label.textContent = view.camera.mode === 'straight' ? 'Gerade Ansicht' : 'Isometrische Ansicht';
  };
  const input = new DesktopInput(view.renderer.domElement, toggleCamera, () => {
    if (diagnosticsAllowed) diagnostics = !diagnostics;
    diagnosticPanel.hidden = !diagnostics;
    view.showColliders(diagnostics);
  }, startProbe, (id) => {
    if (match.snapshot().phase !== 'running' || !match.snapshot().actors.player!.alive) return;
    if (id === 'cycle') combat.cycle(); else combat.select(id);
  });
  const abort = new AbortController();
  const options = { signal: abort.signal };
  host.addEventListener('keydown', event => {
    // Native Space/Enter activation and select navigation must not reach gameplay shortcuts.
    if (event.code !== 'Tab' && event.code !== 'Escape' && event.target instanceof HTMLElement
      && event.target.closest('button, select, summary')
      && (event.code === 'Space' || event.code === 'Enter' || event.target instanceof HTMLSelectElement)) event.stopPropagation();
  }, { ...options, capture: true });
  function setPaused(value: boolean) {
    value ||= input.touchEnabled && innerHeight > innerWidth;
    paused = value;
    feedback.pause(value);
    input.clear();
    clock.reset();
    lastTime = performance.now();
    previous = current;
    // Lobby and result already stop player input; never stack a pause dialog over them.
    pausePanel.hidden = !value || match.snapshot().phase !== 'running';
    host.dataset.arenaOverlay = String(value || match.snapshot().phase !== 'running');
    if (!pausePanel.hidden) element('resume').focus({ preventScroll: true });
  }
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => { if (!document.hidden) setPaused(menuPaused); }, options);
  document.addEventListener('visibilitychange', () => setPaused(menuPaused || document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => {
    view.resize();
    if (input.touchEnabled) setPaused(menuPaused || document.hidden || !document.hasFocus());
  }, options);
  host.querySelector('#resume')!.addEventListener('click', () => {
    menuPaused = false;
    view.renderer.domElement.focus();
    setPaused(false);
  }, options);
  element('arena-menu').addEventListener('click', () => { menuPaused = true; setPaused(true); }, options);
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' && !event.repeat && match.snapshot().phase === 'running') {
      menuPaused = !paused; setPaused(menuPaused);
      if (!paused) view.renderer.domElement.focus();
    }
    // Keep keyboard focus in the active Arena screen without changing shared Adventure input.
    if (event.code === 'Tab') {
      const panel = !pausePanel.hidden ? pausePanel : !element('match-result').hidden ? element('match-result')
        : !element('arena-lobby').hidden ? element('arena-lobby') : null;
      const controls = panel ? [...panel.querySelectorAll<HTMLElement>('button, select, summary, a[href]')]
        .filter(control => control.getClientRects().length && !control.matches(':disabled')) : [];
      const first = controls[0], last = controls.at(-1);
      if (first && last && (!panel!.contains(document.activeElement) || event.shiftKey && document.activeElement === first
        || !event.shiftKey && document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      }
    }
  }, options);
  for (const id of ['arena-home', 'result-arena-home']) element(id).addEventListener('click', () => location.assign(location.pathname), options);
  host.querySelector('#camera-toggle')!.addEventListener('click', toggleCamera, options);
  probeButton.addEventListener('click', startProbe, options);
  for (const id of ['arc', 'pulse', 'rail'] as WeaponId[]) element(`weapon-${id}`).addEventListener('click', () => {
    if (match.snapshot().phase === 'running' && match.snapshot().actors.player!.alive) combat.select(id);
    view.renderer.domElement.focus();
  }, options);
  function restartMatch(mode = arenaMode) {
    const selectedDifficulty = (element('bot-difficulty') as HTMLSelectElement).value;
    difficulty = selectedDifficulty === 'easy' || selectedDifficulty === 'hard' ? selectedDifficulty : 'normal';
    menuPaused = false; feedback.reset(); deaths.reset(); fixtures.reset(); unavailablePickup = null;
    arenaMode = mode;
    host.dataset.arenaRunning = 'true';
    match = new ArenaMatch(arenaRoster(arenaMode));
    match.start(); weapon.reset(); combat.reset(); pickups.reset(); aim = null; input.clear();
    for (const bot of bots) {
      bot.setDifficulty(difficulty);
      bot.reset(botSpawn(bot)); world.setTargetPosition(bot.fighter.id, actorCenter(bot.snapshot().position));
      world.setTargetEnabled(bot.fighter.id, !!match.snapshot().actors[bot.fighter.id]);
      for (const fighter of ARENA_FIGHTERS) bot.world.setTargetEnabled(fighter.id, !!match.snapshot().actors[fighter.id]);
    }
    current = simulation.reset(playerSpawn()); previous = current; view.camera.snap(current.position);
    probeSimulation.reset(); probe = new TraversalProbe(M1_ARENA.links ?? []); probeButton.disabled = false;
    for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, arenaMode === 'training');
    element('arena-lobby').hidden = true; element('match-panel').hidden = false;
    element('arena-settings').append(element('difficulty-control'));
    element('arena-menu').hidden = false;
    element('match-restart').hidden = false;
    element('match-result').hidden = true; element('life-panel').hidden = false;
    element('weapon-panel').hidden = false;
    const modeLabel = arenaMode === 'teams' ? '2v2' : arenaMode === 'duel' ? '1v1' : 'TRAINING';
    element('match-mode').textContent = `${modeLabel} · ZIEL 10`;
    element('blue-label').textContent = arenaMode === 'teams' ? 'BLAU' : 'DU';
    element('red-label').textContent = arenaMode === 'training' ? 'ZIELE' : 'ROT';
    element('arena-training-tools').hidden = arenaMode !== 'training';
    element('team-status').hidden = arenaMode !== 'teams';
    view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  }
  element('team-start').addEventListener('click', () => restartMatch('teams'), options);
  element('bot-start').addEventListener('click', () => restartMatch('duel'), options);
  element('pve-start').addEventListener('click', () => location.assign(`${location.pathname}?mode=pve`), options);
  element('adventure-start').addEventListener('click', () => location.assign(`${location.pathname}?mode=pve&level=stone&adventure=1`), options);
  element('match-start').addEventListener('click', () => restartMatch('training'), options);
  for (const id of ['match-restart', 'result-restart']) element(id).addEventListener('click', () => restartMatch(), options);

  function frame(now: number) {
    if (!displayReady) {
      const fullscreen = host.querySelector('#fullscreen-toggle');
      if (fullscreen) { element('arena-settings').append(fullscreen); displayReady = true; }
    }
    const elapsed = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;
    let alpha = 1;
    if (!paused) {
      frames.push(elapsed * 1000);
      if (frames.length > 600) frames.shift();
      alpha = clock.advance(elapsed, () => {
        const start = performance.now();
        const before = match.snapshot();
        const playerBefore = before.actors.player!;
        const canPlay = before.phase === 'running' && playerBefore.alive;
        previous = current;
        const command = input.command(view.camera.basis());
        const firing = input.fire();
        if (canPlay) current = simulation.step(command);
        const playingBots = activeBots();
        // All brains observe the same tick snapshot, independent of bot iteration order.
        const actors = [{ life: playerBefore, position: current.position }, ...playingBots.map(bot =>
          ({ life: before.actors[bot.fighter.id]!, position: bot.snapshot().position }))];
        const botAttacks = before.phase === 'running' ? playingBots.map(bot => ({ id: bot.fighter.id,
          ...bot.stepActors(before.tick + 1, before.actors[bot.fighter.id]!, actors.filter(actor => actor.life.id !== bot.fighter.id), pickups.snapshot()) })) : [];
        for (const bot of playingBots) world.setTargetPosition(bot.fighter.id, actorCenter(bot.snapshot().position));
        // Jumping over the practice arena's low perimeter must not leave an endless fall.
        if (current.position.y < -8 && before.phase === 'ready') { current = simulation.reset(); previous = current; }
        const cameraRay = canPlay && input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
        aim = cameraRay ? solveAim(world, cameraRay, current.position) : null;
        if (before.phase === 'ready') weapon.step(current.tick, canPlay && firing, aim);
        const shotWeapon = combat.snapshot().selected;
        const attack = before.phase === 'running' ? combat.step(before.tick + 1, canPlay && firing, aim, cameraRay, world,
          arenaMode !== 'training' ? playingBots.filter(bot => bot.fighter.team !== playerBefore.team && before.actors[bot.fighter.id]!.alive)
            .map(bot => ({ ...fighterTarget(bot.fighter), center: actorCenter(bot.snapshot().position) }))
            : (M1_ARENA.targets ?? []).filter((target) => before.actors[target.id]!.alive), current.position) : { attacked: false, damage: [] };
        const damage = [...attack.damage, ...botAttacks.flatMap(attack => attack.damage)];
        if (current.position.y < -8) damage.push({ target: 'player', amount: 1000 });
        if (arenaMode === 'training' && inTrainingField(current.position) && (before.tick + 1) % TRAINING_FIELD.intervalTicks === 0)
          damage.push({ target: 'player', amount: TRAINING_FIELD.damage });
        match.step(damage, [...attack.attacked ? ['player'] : [], ...botAttacks.filter(attack => attack.attacked).map(attack => attack.id)]);
        const after = match.snapshot();
        const playerAfter = after.actors.player!;
        if (before.phase === 'running') {
          for (const life of Object.values(after.actors)) if (before.actors[life.id]?.alive && !life.alive) {
            const position = life.id === 'player' ? current.position
              : playingBots.find(bot => bot.fighter.id === life.id)?.snapshot().position;
            const dummy = M1_ARENA.targets?.find(target => target.id === life.id);
            if (position) deaths.emit(life.id, life.life, life.team, position);
            else if (dummy) deaths.emit(life.id, life.life, life.team, { ...dummy.center, y: dummy.center.y - 1.1 });
          }
          if (attack.attacked) feedback.play(shotWeapon);
          for (const attack of botAttacks.filter(attack => attack.attacked)) {
            const foot = playingBots.find(bot => bot.fighter.id === attack.id)!.snapshot().position;
            const distance = Math.hypot(foot.x - current.position.x, foot.z - current.position.z);
            if (distance < 16 && attack.weapon) feedback.play(attack.weapon, .35 * (1 - distance / 20), (foot.x - current.position.x) / 16);
          }
          const confirmed = damage.find(hit => hit.source === 'player' && before.actors[hit.target] && after.actors[hit.target]
            && after.actors[hit.target]!.hp + after.actors[hit.target]!.armor < before.actors[hit.target]!.hp + before.actors[hit.target]!.armor);
          if (confirmed) {
            const point = playingBots.find(bot => bot.fighter.id === confirmed.target)?.snapshot().position
              ?? M1_ARENA.targets?.find(target => target.id === confirmed.target)?.center;
            if (point) feedback.confirmedHit(after.tick, view.projectedPosition(point));
          }
          if (playerAfter.hp + playerAfter.armor < playerBefore.hp + playerBefore.armor) feedback.damaged(after.tick, !playerAfter.alive);
          if (after.scores.blue > before.scores.blue) feedback.announce(after.tick, 'PUNKT FÜR BLAU');
          else if (after.scores.red > before.scores.red) feedback.announce(after.tick, 'PUNKT FÜR ROT');
          if (after.phase === 'ended') feedback.play('result');
        }
        if (before.phase === 'running') {
          for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, arenaMode === 'training' && after.actors[target.id]!.alive);
          for (const bot of playingBots) {
            const id = bot.fighter.id;
            if (after.actors[id]!.alive !== before.actors[id]!.alive || after.phase === 'ended') {
              bot.clear();
              if (after.actors[id]!.alive && !before.actors[id]!.alive) bot.reset(botSpawn(bot));
            }
            world.setTargetPosition(id, actorCenter(bot.snapshot().position));
            world.setTargetEnabled(id, after.actors[id]!.alive);
          }
          if (playerAfter.alive !== playerBefore.alive || after.phase === 'ended') {
            input.clear(); aim = null; weapon.lastShot = null; combat.clearEffects();
            if (playerAfter.alive && !playerBefore.alive) { current = simulation.reset(playerSpawn()); previous = current; view.camera.snap(current.position); weapon.reset(); combat.reset(); }
          }
        }
        let blocked: string | null = null;
        if (after.phase === 'running') pickups.step(after.tick, playerAfter.alive ? current : null, world, (kind, amount, item) => {
          blocked = item.id;
          const taken = kind === 'rail' ? combat.addRailAmmo(amount) : kind === 'pulse' || kind === 'ammo' ? combat.addAmmo(amount, kind === 'pulse') : match.restore('player', kind === 'health' ? 'hp' : 'armor', amount);
          if (taken > 0) { feedback.play('pickup'); feedback.announce(after.tick,
            `${kind === 'rail' ? 'RAILGUN' : kind === 'pulse' ? 'PULSE' : kind === 'ammo' ? 'MUNITION' : kind === 'health' ? 'HEILUNG' : 'RÜSTUNG'} +${taken}`); }
          return taken;
        }, item => {
          blocked = item.id;
          if (unavailablePickup !== item.id) feedback.announce(after.tick,
            item.kind === 'ammo' && !combat.snapshot().ownsPulse ? 'Erst Pulse aufnehmen'
              : `${item.kind === 'health' ? 'Gesundheit' : item.kind === 'armor' ? 'Rüstung'
                : item.kind === 'rail' ? 'Rail-Munition' : 'Pulse-Munition'} voll`);
        });
        unavailablePickup = blocked;
        if (after.phase === 'running') for (const bot of playingBots) pickups.step(after.tick, after.actors[bot.fighter.id]!.alive ? bot.snapshot() : null, bot.world, (kind, amount) =>
          kind === 'rail' ? bot.weapons.addRailAmmo(amount) : kind === 'pulse' || kind === 'ammo' ? bot.weapons.addAmmo(amount, kind === 'pulse') : match.restore(bot.fighter.id, kind === 'health' ? 'hp' : 'armor', amount));
        if (probe.status !== 'ready' && after.phase !== 'ended') probeSimulation.step(probe.command(probeSimulation.snapshot()));
        steps.push(performance.now() - start);
        if (steps.length > 600) steps.shift();
      });
    }
    if (now - lastHud >= 100) {
      hitLabel.textContent = (M1_ARENA.targets ?? []).map((target) => weapon.hits[target.id] ?? 0).join(' / ');
      const state = match.snapshot(); const player = state.actors.player!;
      const inventory = combat.snapshot();
      if (arenaMode === 'teams') {
        const ally = state.actors.ally!;
        element('team-status').textContent = ally.alive ? `VERBÜNDETER · ${ally.hp} HP` : `VERBÜNDETER · zurück in ${(ally.respawnTicks / 60).toFixed(1)} s`;
      }
      element('ammo-count').textContent = inventory.ownsPulse ? `${inventory.ammo} / 54` : 'FINDEN';
      element('weapon-arc').setAttribute('aria-pressed', String(inventory.selected === 'arc'));
      element('weapon-pulse').setAttribute('aria-pressed', String(inventory.selected === 'pulse'));
      (element('weapon-pulse') as HTMLButtonElement).disabled = !inventory.ownsPulse || inventory.ammo === 0;
      const railWait = Math.max(0, (inventory.railReadyAt ?? 0) - state.tick);
      element('rail-ammo').textContent = inventory.ownsRail ? railWait > 0 ? `${(railWait / 60).toFixed(1)} s` : `${inventory.railAmmo} / 6` : 'FINDEN';
      element('weapon-rail').setAttribute('aria-pressed', String(inventory.selected === 'rail'));
      (element('weapon-rail') as HTMLButtonElement).disabled = !inventory.ownsRail || inventory.railAmmo === 0;
      element('weapon-hint').textContent = inventory.selected === 'rail' ? 'Railgun · 40 m · 70 Schaden · 1,4 s Nachladezeit'
        : inventory.selected === 'arc' ? 'Arc Lash · 5 m · Auto-Fächer' : 'Pulse Repeater · 32 m · Projektile';
      element('blue-score').textContent = String(state.scores.blue); element('red-score').textContent = String(state.scores.red);
      const seconds = Math.ceil(state.remainingTicks / 60);
      element('match-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      element('hp-value').textContent = String(player.hp); element('armor-value').textContent = String(player.armor);
      (element('hp-bar') as HTMLProgressElement).value = player.hp;
      (element('armor-bar') as HTMLProgressElement).value = player.armor;
      element('life-panel').dataset.low = String(player.hp > 0 && player.hp <= 30);
      element('life-status').textContent = !player.alive ? `Eliminiert · Respawn in ${(player.respawnTicks / 60).toFixed(1)} s`
        : player.protectionTicks > 0 ? `Spawn-Schutz · ${(player.protectionTicks / 60).toFixed(1)} s` : '';
      const enteringResult = state.phase === 'ended' && element('match-result').hidden;
      element('match-result').hidden = state.phase !== 'ended';
      host.dataset.arenaOverlay = String(paused || state.phase !== 'running');
      element('arena-menu').hidden = state.phase !== 'running';
      if (state.phase === 'ended') {
        element('match-result').dataset.winner = state.winner ?? 'draw';
        element('result-title').textContent = arenaMode === 'training' ? 'Training beendet.' : state.winner === 'draw' ? 'Unentschieden.' : state.winner === 'blue' ? 'Sieg für Blau.' : 'Rot gewinnt.';
        element('result-blue').textContent = String(state.scores.blue); element('result-red').textContent = String(state.scores.red);
        element('result-blue-label').textContent = arenaMode === 'teams' ? 'DEIN TEAM · BLAU' : 'DU · BLAU';
        element('result-red-label').textContent = arenaMode === 'training' ? 'TRAININGSZIELE' : 'GEGNER · ROT';
        element('result-detail').textContent = state.reason === 'score' ? '10 Abschüsse erreicht' : 'Zeit abgelaufen';
        const played = Math.floor(state.tick / 60);
        element('result-context').textContent = `${arenaMode === 'teams' ? '2v2' : arenaMode === 'duel' ? '1v1' : 'Training'} · ${difficulty === 'easy' ? 'Leicht' : difficulty === 'hard' ? 'Schwer' : 'Normal'} · ${Math.floor(played / 60)}:${String(played % 60).padStart(2, '0')} gespielt`;
        element('result-restart').textContent = arenaMode === 'training' ? 'Training wiederholen' : 'Revanche starten';
        if (enteringResult) { input.clear(); element('result-restart').focus({ preventScroll: true }); }
      }
      heightLabel.textContent = current.grounded ? `${current.surface === 'floor' ? 'E0' : current.surface?.toUpperCase() ?? 'KANTE'} · ${current.position.y.toFixed(2)} m` : `SPRUNG / FALL · ${current.position.y.toFixed(2)} m`;
      const statuses = { ready: 'Goldene Figur · E0 → E1 → E2 → E0', running: `Route läuft · ${probe.visited.join(' → ').replaceAll('floor', 'E0')}`,
        complete: 'Route geschafft · E0 → E1 → E2 → E0', failed: 'Route blockiert · Diagnose erforderlich' };
      probeLabel.textContent = statuses[probe.status];
      const p = current.position;
      diagnosticPanel.textContent = `TICK ${current.tick} · ${view.camera.mode}\n`
        + `FOOT ${p.x.toFixed(2)} / ${p.y.toFixed(2)} / ${p.z.toFixed(2)}\n`
        + `SURFACE ${current.surface ?? 'air'} · CEILING ${current.ceiling}\n`
        + `AIM ${aim?.target.id ?? '—'} · IMPACT ${aim?.impact?.id ?? '—'} · BLOCKED ${aim?.blocked ?? false}\n`
        + `FRAME ${(elapsed * 1000).toFixed(1)} ms · DROPPED ${clock.droppedTicks}\n`
        + `DRAW ${view.renderer.info.render.calls} · TRI ${view.renderer.info.render.triangles}\nF3 · Collider / Diagnose`;
      lastHud = now;
    }
    if (diagnostics) view.showColliders(true, world.debugLines());
    bots.forEach((bot, i) => botViews[i]!.update(match.snapshot().actors[bot.fighter.id] ? bot.snapshot() : null,
      match.snapshot().actors[bot.fighter.id], bot.weapons.snapshot(), match.snapshot().tick, paused?0:Math.min(elapsed, 0.05), view.camera.camera,bot.decision?.aim?.firePoint));
    // Pause freezes the burst; after the last kill it may finish behind the result panel.
    deaths.update(paused ? 0 : Math.min(elapsed, .05));
    fixtures.update(match.snapshot(), pickups.snapshot(), [{ id: 'player', position: playerSpawn() },
      ...activeBots().map(bot => ({ id: bot.fighter.id, position: botSpawn(bot) }))], arenaMode === 'teams');
    view.draw(previous, current, alpha, paused?0:Math.min(elapsed, 0.05), aim, match.snapshot().phase === 'ready' ? weapon.lastShot : combat.snapshot().lastArc,
      probe.status === 'ready' ? null : probeSimulation.snapshot(), match.snapshot(), combat.snapshot(), pickups.snapshot());
    feedback.draw(match.snapshot().tick);
    frameId = requestAnimationFrame(frame);
  }
  // Read-only observability is compiled into test builds only. No setters or result injection.
  if (import.meta.env.MODE === 'test') {
    Object.defineProperty(window, '__coreArena', {
      configurable: true,
      value: Object.freeze({
        portrait:(id='player')=>{
          const state=bots.find(bot=>bot.fighter.id===id)?.snapshot()??current;
          return view.captureFighter(state.position,id==='player'?view.actor.rotation.y:state.facing);
        },
        read: () => ({
          snapshot: current, paused, camera: view.camera.mode, basis: view.camera.basis(),
          screen: view.projectedPosition(current.position),
          weaponScreen: view.projectedPosition({ ...current.position, y: current.position.y + 0.25 }),
          rendered: { x: view.actor.position.x, y: view.actor.position.y, z: view.actor.position.z },
          marker: { x: view.marker.position.x, z: view.marker.position.z },
          aim, hits: { ...weapon.hits }, lastShot: weapon.lastShot, match: match.snapshot(),
          weapons: combat.snapshot(), pickups: pickups.snapshot(),
          arenaMode, difficulty, audio: feedback.diagnostics(), deathEffects: deaths.diagnostics(), playerVisible: view.actor.visible,
          fixtures: fixtures.diagnostics(),fighter:view.fighterDiagnostics(),
          bot: arenaMode === 'duel' ? { snapshot: bots[0]!.snapshot(), decision: bots[0]!.decision, weapons: bots[0]!.weapons.snapshot(), screen: view.projectedPosition(bots[0]!.snapshot().position) } : null,
          bots: activeBots().map(bot => ({ id: bot.fighter.id, team: bot.fighter.team, snapshot: bot.snapshot(), decision: bot.decision,
            resourceGoal: bot.resourceGoal, intent: bot.intent,
            weapons: bot.weapons.snapshot(), fighter:botViews[bots.indexOf(bot)]!.diagnostics(),screen: view.projectedPosition(bot.snapshot().position) })),
          probe: { status: probe.status, snapshot: probeSimulation.snapshot(), visited: [...probe.visited] },
          targets: (M1_ARENA.targets ?? []).map((target) => ({ ...target,
            screen: view.projectedPosition({ ...target.center, y: target.center.y - 0.9 }) })),
          droppedTicks: clock.droppedTicks, frames: [...frames], steps: [...steps],
          viewport: { width: innerWidth, height: innerHeight, dpr: view.renderer.getPixelRatio() },
          render: { ...view.renderer.info.render },
        }),
      }),
    });
  }
  document.querySelector('#loading')?.remove();
  host.dataset.ready = 'true';
  host.dataset.arenaOverlay = 'true';
  frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId);
    abort.abort();
    input.dispose();
    feedback.dispose();
    fixtures.dispose();
    world.dispose();
    probeWorld.dispose();
    bots.forEach(bot => bot.dispose());
    view.dispose();
    host.querySelectorAll('#hud, #pause, #diagnostics, #match-result').forEach((element) => element.remove());
    Reflect.deleteProperty(window, '__coreArena');
    delete host.dataset.arena;
    delete host.dataset.arenaRunning;
    delete host.dataset.arenaOverlay;
  };
}
