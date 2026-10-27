import { weaponHud, lifeHud } from './hud';
import { M1_ARENA } from '../arena/arena';
import { FixedClock } from '../core/fixedClock';
import { Simulation } from '../core/simulation';
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
import { ARENA_PICKUPS } from '../arena/pickups';
import { createCombatBot } from './combatBot';
import { BOT_TARGET, actorCenter } from '../core/bot';
import { BotView } from '../render/botView';

export async function startGame(host: HTMLElement): Promise<() => void> {
  const world = await createSpatialWorld({ ...M1_ARENA, targets: [...M1_ARENA.targets ?? [], BOT_TARGET] });
  world.setTargetEnabled('rival', false);
  const rival = await createCombatBot();
  let botMode = false;
  // An isolated, non-blocking route probe shares the identical arena and player motor.
  const probeWorld = await createSpatialWorld(M1_ARENA);
  const probeSimulation = new Simulation(probeWorld, M1_ARENA.spawn);
  let probe = new TraversalProbe(M1_ARENA.links ?? []);
  const weapon = new DiagnosticWeapon();
  const combat = new Combat();
  const pickups = new Pickups(ARENA_PICKUPS);
  let match = new ArenaMatch([{ id: 'player', team: 'blue' },
    ...(M1_ARENA.targets ?? []).map((target) => ({ id: target.id, team: 'red' as const }))]);
  let aim: AimSolution | null = null;
  let view: ArenaView;
  try { view = new ArenaView(host, M1_ARENA); }
  catch (error) { world.dispose(); probeWorld.dispose(); rival.dispose(); throw error; }
  const botView = new BotView(view.scene);
  const simulation = new Simulation(world, M1_ARENA.spawn);
  const clock = new FixedClock();
  const diagnosticsAllowed = import.meta.env.DEV || import.meta.env.MODE === 'test';
  let diagnostics = false;
  let paused = false;
  let previous = simulation.snapshot();
  let current = previous;
  let lastTime = performance.now();
  let lastHud = 0;
  let frameId = 0;
  const frames: number[] = [];
  const steps: number[] = [];
  host.insertAdjacentHTML('beforeend', `
    <div id="hud">
      <header><div class="brand"><div class="brand-mark" aria-hidden="true">C</div><div>
      <span class="eyebrow">CORE ARENA</span><h1>Obsidian Garden</h1></div></div>
      <span class="phase"><i></i>TRAININGSARENA</span></header>
      <div id="match-panel"><div class="eyebrow" id="match-mode">10 ABSCHÜSSE / 2 MINUTEN</div>
      <div id="match-score"><span class="blue">BLAU <b id="blue-score">0</b></span><time id="match-time">02:00</time><span class="red"><b id="red-score">0</b> ROT</span></div>
      <button id="bot-start" type="button">Botmatch starten</button>
      <button id="pve-start" type="button">Mini-Kampagne: Die drei Siegel</button>
      <button id="match-start" type="button">Trainingsmatch starten</button><button id="match-restart" type="button" hidden>Neu starten</button>
      <small id="match-hint">1 gegen 1 mit Bot oder Training mit drei stationären Zielen.</small></div>
      <div id="weapon-panel" hidden>${weaponHud(false) }
      <small id="weapon-hint">Arc Lash · 5 m · enger Zielkegel</small><small>1 / 2 oder Mausrad · Pulse-Pickup hinter dem Start</small></div>
      <div id="life-panel" hidden>${lifeHud}<p id="life-status"></p>
      <small id="life-hint">Orange Fläche links: Schaden testen.<br>Goldener Ring: Spawn-Schutz · Feuer beendet ihn.</small></div>
      <div class="location"><span class="eyebrow">01 / OBSIDIAN GARDEN</span>
      <p>Hoch hinaus.</p><small>Folge den Sprungmarkierungen zu E1 und E2.</small>
      <div id="practice-status"><span id="height-status">E0</span> · Treffer <span id="hit-count">0 / 0 / 0</span></div>
      <button id="probe-start" type="button"><kbd>B</kbd> Route zeigen</button><small id="probe-status">Goldene Figur · E0 → E1 → E2 → E0</small></div>
      <footer><span><kbd>W A S D</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprinten</span>
      <span><kbd>SPACE</kbd> Springen</span><span><kbd>MAUS</kbd> Zielen / Feuer halten</span>
      <button id="camera-toggle" type="button"><kbd>V</kbd> <span id="camera-label">Gerade Ansicht</span></button></footer>
    </div>
    <div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Bereit, wenn du es bist.</h2>
    <button id="resume" type="button">Weiter</button></div></div>
    <div id="match-result" hidden><div><span class="eyebrow">RUNDE BEENDET</span><h2 id="result-title"></h2>
    <p id="result-detail"></p><button id="result-restart" type="button">Noch einmal spielen</button></div></div>
    <pre id="diagnostics" hidden></pre>`);
  const label = host.querySelector<HTMLElement>('#camera-label')!;
  const pausePanel = host.querySelector<HTMLElement>('#pause')!;
  const diagnosticPanel = host.querySelector<HTMLElement>('#diagnostics')!;
  const hitLabel = host.querySelector<HTMLElement>('#hit-count')!;
  const heightLabel = host.querySelector<HTMLElement>('#height-status')!;
  const probeLabel = host.querySelector<HTMLElement>('#probe-status')!;
  const probeButton = host.querySelector<HTMLButtonElement>('#probe-start')!;
  const element = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const startProbe = () => { if (botMode) return; probe.start(); probeButton.disabled = true; };
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
  function setPaused(value: boolean) {
    value ||= input.touchEnabled && innerHeight > innerWidth;
    paused = value;
    input.clear();
    clock.reset();
    lastTime = performance.now();
    previous = current;
    pausePanel.hidden = !value;
  }
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => { if (!document.hidden) setPaused(false); }, options);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => {
    view.resize();
    if (input.touchEnabled) setPaused(document.hidden || !document.hasFocus());
  }, options);
  host.querySelector('#resume')!.addEventListener('click', () => {
    view.renderer.domElement.focus();
    setPaused(false);
  }, options);
  host.querySelector('#camera-toggle')!.addEventListener('click', toggleCamera, options);
  probeButton.addEventListener('click', startProbe, options);
  for (const id of ['arc', 'pulse'] as WeaponId[]) element(`weapon-${id}`).addEventListener('click', () => {
    if (match.snapshot().phase === 'running' && match.snapshot().actors.player!.alive) combat.select(id);
  }, options);
  function restartMatch(withBot = botMode) {
    botMode = withBot;
    match = new ArenaMatch([{ id: 'player', team: 'blue' }, ...(botMode ? [{ id: 'rival', team: 'red' as const }]
      : (M1_ARENA.targets ?? []).map((target) => ({ id: target.id, team: 'red' as const })))]);
    match.start(); weapon.reset(); combat.reset(); pickups.reset(); aim = null; input.clear();
    rival.reset(); world.setTargetPosition('rival', actorCenter(rival.snapshot().position)); world.setTargetEnabled('rival', botMode);
    current = simulation.reset(); previous = current;
    probeSimulation.reset(); probe = new TraversalProbe(M1_ARENA.links ?? []); probeButton.disabled = false;
    for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, !botMode);
    element('bot-start').hidden = true;
    element('match-start').hidden = true; element('match-restart').hidden = false;
    element('match-result').hidden = true; element('life-panel').hidden = false;
    element('weapon-panel').hidden = false;
    host.querySelector<HTMLElement>('.location')!.hidden = true;
    element('match-mode').textContent = `${botMode ? 'BOTDUELL' : 'TRAINING'} · 10 ABSCHÜSSE / 2 MINUTEN`;
    host.querySelector<HTMLElement>('.phase')!.innerHTML = `<i></i>${botMode ? 'BOTDUELL · 1 GEGEN 1' : 'TRAININGSARENA'}`;
    element('match-hint').textContent = botMode ? 'Roter Gegner · Deckung unterbricht seine Sicht.' : 'Arc Lash: kurz & unbegrenzt · Pulse: Projektile & Munition';
    element('life-hint').innerHTML = `${botMode ? 'Rot ist dein Gegner.' : 'Orange Fläche links: Schaden testen.'}<br>Goldener Ring: Spawn-Schutz · Feuer beendet ihn.`;
    view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  }
  element('bot-start').addEventListener('click', () => restartMatch(true), options);
  element('pve-start').addEventListener('click', () => location.assign(`${location.pathname}?mode=pve`), options);
  element('match-start').addEventListener('click', () => restartMatch(false), options);
  for (const id of ['match-restart', 'result-restart']) element(id).addEventListener('click', () => restartMatch(), options);

  function frame(now: number) {
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
        const canPlay = before.phase === 'ready' || (before.phase === 'running' && playerBefore.alive);
        previous = current;
        const command = input.command(view.camera.basis());
        const firing = input.fire();
        if (canPlay) current = simulation.step(command);
        const botAttack = botMode && before.phase === 'running'
          ? rival.step(before.tick + 1, before.actors.rival!, playerBefore, current.position) : { attacked: false, damage: [] };
        if (botMode) world.setTargetPosition('rival', actorCenter(rival.snapshot().position));
        // Jumping over the practice arena's low perimeter must not leave an endless fall.
        if (current.position.y < -8 && before.phase === 'ready') { current = simulation.reset(); previous = current; }
        const cameraRay = canPlay && input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
        aim = cameraRay ? solveAim(world, cameraRay, current.position) : null;
        if (before.phase === 'ready') weapon.step(current.tick, canPlay && firing, aim);
        const attack = before.phase === 'running' ? combat.step(before.tick + 1, canPlay && firing, aim, cameraRay, world,
          botMode ? before.actors.rival!.alive ? [{ ...BOT_TARGET, center: actorCenter(rival.snapshot().position) }] : []
            : (M1_ARENA.targets ?? []).filter((target) => before.actors[target.id]!.alive)) : { attacked: false, damage: [] };
        const damage = [...attack.damage, ...botAttack.damage];
        if (current.position.y < -8) damage.push({ target: 'player', amount: 1000 });
        if (!botMode && inTrainingField(current.position) && (before.tick + 1) % TRAINING_FIELD.intervalTicks === 0)
          damage.push({ target: 'player', amount: TRAINING_FIELD.damage });
        match.step(damage, [...attack.attacked ? ['player'] : [], ...botAttack.attacked ? ['rival'] : []]);
        const after = match.snapshot();
        const playerAfter = after.actors.player!;
        if (before.phase === 'running') {
          for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, !botMode && after.actors[target.id]!.alive);
          if (botMode) {
            if (after.actors.rival!.alive !== before.actors.rival!.alive || after.phase === 'ended') {
              rival.clear();
              if (after.actors.rival!.alive && !before.actors.rival!.alive) rival.reset();
            }
            world.setTargetPosition('rival', actorCenter(rival.snapshot().position));
            world.setTargetEnabled('rival', after.actors.rival!.alive);
          }
          if (playerAfter.alive !== playerBefore.alive || after.phase === 'ended') {
            input.clear(); aim = null; weapon.lastShot = null; combat.clearEffects();
            if (playerAfter.alive && !playerBefore.alive) { current = simulation.reset(); previous = current; weapon.reset(); combat.reset(); }
          }
        }
        if (after.phase === 'running') pickups.step(after.tick, playerAfter.alive ? current : null, world, (kind, amount) =>
          kind === 'pulse' || kind === 'ammo' ? combat.addAmmo(amount, kind === 'pulse') : match.restore('player', kind === 'health' ? 'hp' : 'armor', amount));
        if (botMode && after.phase === 'running') pickups.step(after.tick, after.actors.rival!.alive ? rival.snapshot() : null, rival.world, (kind, amount) =>
          kind === 'pulse' || kind === 'ammo' ? rival.weapons.addAmmo(amount, kind === 'pulse') : match.restore('rival', kind === 'health' ? 'hp' : 'armor', amount));
        if (probe.status !== 'ready' && after.phase !== 'ended') probeSimulation.step(probe.command(probeSimulation.snapshot()));
        steps.push(performance.now() - start);
        if (steps.length > 600) steps.shift();
      });
    }
    if (now - lastHud >= 100) {
      hitLabel.textContent = (M1_ARENA.targets ?? []).map((target) => weapon.hits[target.id] ?? 0).join(' / ');
      const state = match.snapshot(); const player = state.actors.player!;
      const inventory = combat.snapshot();
      element('ammo-count').textContent = inventory.ownsPulse ? `${inventory.ammo} / 54` : 'FINDEN';
      element('weapon-arc').setAttribute('aria-pressed', String(inventory.selected === 'arc'));
      element('weapon-pulse').setAttribute('aria-pressed', String(inventory.selected === 'pulse'));
      (element('weapon-pulse') as HTMLButtonElement).disabled = !inventory.ownsPulse || inventory.ammo === 0;
      element('weapon-hint').textContent = inventory.selected === 'arc' ? 'Arc Lash · 5 m · enger Zielkegel' : 'Pulse Repeater · 32 m · Projektile';
      element('blue-score').textContent = String(state.scores.blue); element('red-score').textContent = String(state.scores.red);
      const seconds = Math.ceil(state.remainingTicks / 60);
      element('match-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      element('hp-value').textContent = String(player.hp); element('armor-value').textContent = String(player.armor);
      (element('hp-bar') as HTMLProgressElement).value = player.hp;
      (element('armor-bar') as HTMLProgressElement).value = player.armor;
      element('life-panel').dataset.low = String(player.hp > 0 && player.hp <= 30);
      element('life-status').textContent = !player.alive ? `Eliminiert · Respawn in ${(player.respawnTicks / 60).toFixed(1)} s`
        : player.protectionTicks > 0 ? `Spawn-Schutz · ${(player.protectionTicks / 60).toFixed(1)} s` : 'Bereit';
      element('match-result').hidden = state.phase !== 'ended';
      if (state.phase === 'ended') {
        element('result-title').textContent = state.winner === 'draw' ? 'Unentschieden.' : state.winner === 'blue' ? 'Blau gewinnt.' : 'Rot gewinnt.';
        element('result-detail').textContent = `${state.scores.blue} : ${state.scores.red} · ${state.reason === 'score' ? 'Abschussziel erreicht' : 'Zeit abgelaufen'}`;
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
    botView.update(botMode ? rival.snapshot() : null, match.snapshot().actors.rival, rival.weapons.snapshot(), match.snapshot().tick, Math.min(elapsed, 0.05), view.camera.camera);
    view.draw(previous, current, alpha, Math.min(elapsed, 0.05), aim, match.snapshot().phase === 'ready' ? weapon.lastShot : combat.snapshot().lastArc,
      probe.status === 'ready' ? null : probeSimulation.snapshot(), match.snapshot(), combat.snapshot(), pickups.snapshot());
    frameId = requestAnimationFrame(frame);
  }
  // Read-only observability is compiled into test builds only. No setters or result injection.
  if (import.meta.env.MODE === 'test') {
    Object.defineProperty(window, '__coreArena', {
      configurable: true,
      value: Object.freeze({
        read: () => ({
          snapshot: current, paused, camera: view.camera.mode, basis: view.camera.basis(),
          screen: view.projectedPosition(current.position),
          weaponScreen: view.projectedPosition({ ...current.position, y: current.position.y + 0.25 }),
          rendered: { x: view.actor.position.x, y: view.actor.position.y, z: view.actor.position.z },
          marker: { x: view.marker.position.x, z: view.marker.position.z },
          aim, hits: { ...weapon.hits }, lastShot: weapon.lastShot, match: match.snapshot(),
          weapons: combat.snapshot(), pickups: pickups.snapshot(),
          bot: botMode ? { snapshot: rival.snapshot(), decision: rival.decision, weapons: rival.weapons.snapshot(), screen: view.projectedPosition(rival.snapshot().position) } : null,
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
  frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId);
    abort.abort();
    input.dispose();
    world.dispose();
    probeWorld.dispose();
    rival.dispose();
    view.dispose();
    host.querySelectorAll('#hud, #pause, #diagnostics, #match-result').forEach((element) => element.remove());
    Reflect.deleteProperty(window, '__coreArena');
  };
}
