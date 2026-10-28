import { STONE_ADVENTURE, STONE_ADVENTURE_COMBAT, ADVENTURE_BOSS, ADVENTURE_RUNNERS, STONE_ADVENTURE_PICKUPS, STONE_ADVENTURE_JUMP, stoneRoomAt } from '../arena/stoneAdventure';
import { AdventureFight } from '../core/adventureFight';
import { AdventureFightView } from '../render/adventureFightView';
import { PVE_RULES } from '../core/pve';
import { buildStoneAdventure } from '../render/stoneAdventureView';
import { ArenaView } from '../render/arenaView';
import { createSpatialWorld } from '../physics/rapierWorld';
import { Simulation } from '../core/simulation';
import type { WeaponId } from '../core/combat';
import type { Vec3 } from '../core/types';
import { FixedClock } from '../core/fixedClock';
import { solveAim, type AimSolution } from '../core/aim';
import type { MatchSnapshot } from '../core/match';
import { DesktopInput } from '../input/desktopInput';
import { lifeHud, weaponHud } from './hud';
import { StoneFeedback } from './stoneFeedback';

const hints: Record<string, string> = {
  A: 'Durch den offenen Ruinenhof zum nächsten Durchgang.', B: 'Am Norddurchgang liegt die Waffe der verlassenen Wache.',
  C: 'Pulse aufnehmen · weiter zum inneren Hof.', D: 'Vorräte sichern. Die breite Treppe führt zurück in den Hof.',
  E: 'Der Nordweg führt zum Siegelplatz.', F: 'Hinter diesem Durchgang liegt der Wächterhof.',
  G: 'Der Wächter ruht. Erkunde den Hof und die seitlichen Vorräte.', H: 'Das Nordtor zur Kristallkluft ist versiegelt.',
};

/** Small adventure slice: two melee guards, then the existing stone boss. */
export async function startAdventure(host: HTMLElement): Promise<() => void> {
  const exploration = new URLSearchParams(location.search).get('explore') === '1';
  const world = await createSpatialWorld(STONE_ADVENTURE_COMBAT, { stepHeight: .32 });
  let view: ArenaView;
  try { view = new ArenaView(host, {...STONE_ADVENTURE_COMBAT,targets:[]}, { training: false, pickups: STONE_ADVENTURE_PICKUPS,
    build: buildStoneAdventure, shadowSpan: 58 }); }
  catch (error) { world.dispose(); throw error; }
  view.renderer.domElement.setAttribute('aria-label', `Der verwitterte Hof – ${exploration ? 'Erkundung' : 'Adventure'}`);
  view.camera.trackPlayer(STONE_ADVENTURE.spawn,1.2,'side'); view.resize();
  const simulation = new Simulation(world, STONE_ADVENTURE.spawn, STONE_ADVENTURE_JUMP);
  const fight = new AdventureFight(), fightView = new AdventureFightView(view.scene);
  const {combat,pickups}=fight, clock = new FixedClock();
  const abort = new AbortController(), options = { signal: abort.signal };
  let current = simulation.snapshot(), previous = current, aim: AimSolution | null = null;
  let paused = false, overview = false, lastTime = performance.now(), frameId = 0, lastHud = 0, startTick = 0;
  host.dataset.adventure = 'true';
  host.insertAdjacentHTML('beforeend', `<div id="hud" class="pve-hud adventure-hud">
    <header><div class="brand"><div class="brand-mark">C</div><div><span class="eyebrow">CORE ARENA · DIE DREI SIEGEL</span>
    <h1>Der verwitterte Hof</h1></div></div><span class="phase"><i></i>${exploration ? 'ERKUNDUNG' : 'DAS STEINSIEGEL'}</span></header>
    <div id="adventure-location"><b id="room-name">Ankunft</b><p id="room-hint">${hints.A}</p></div>
    <div id="adventure-boss" hidden><b>DER STEINWÄCHTER</b><span id="boss-hp-value">600</span>
    <progress id="boss-hp" max="600" value="600" aria-label="Steinwächter-Lebenspunkte"></progress><p id="pve-telegraph"></p></div>
    <aside id="campaign-story"><b>DAS VERSIEGELTE NORDTOR</b><p>Hinter den Ruinen liegt die Kristallkluft.
    Zwei Steinläufer halten das Siegel. Befreie die Höfe und stelle dich ihrem Wächter.</p></aside>
    <div id="weapon-panel">${weaponHud()}<small>Arc zum Start · Pulse am Norddurchgang</small></div>
    <div id="life-panel">${lifeHud}<p id="life-status">Der Hof liegt still.</p></div>
    <div id="adventure-actions"><button id="pve-restart" type="button">Level neu starten</button>
    <button id="pve-pause" type="button">Pause</button></div>
    <footer><span><kbd>WASD</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprint</span><span><kbd>SPACE</kbd> Springen</span>
    <button id="camera-toggle" type="button"><kbd>V</kbd> Ansicht wechseln</button></footer>
    </div><div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Der Hof wartet.</h2>
    <button id="resume" type="button">Weiter</button><div id="adventure-settings"></div>
    <button id="adventure-home" type="button">Zum Spielmenü</button></div></div>
    <div id="match-result" hidden><div><span class="eyebrow">DAS STEINSIEGEL</span><h2 id="result-title"></h2><p id="result-detail"></p>
    <button id="pve-next" type="button" hidden>Optional: Kristallkluft erkunden</button><button id="pve-again" type="button">Neu versuchen</button>
    <button id="result-home" type="button">Zum Spielmenü</button></div></div>`);
  const el = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const chooseWeapon = (id: WeaponId | 'cycle') => { if (!paused && fight.life.snapshot().outcome==='running') { if (id === 'cycle') combat.cycle(); else combat.select(id); } };
  const input = new DesktopInput(view.renderer.domElement, () => view.camera.toggle(), () => {}, () => {}, chooseWeapon);
  const feedback = new StoneFeedback(host);
  let touchMenuReady = false;
  const arrangeTouchMenu = () => {
    if (touchMenuReady || !input.touchEnabled) return;
    // Move the existing controls so sound/fullscreen state and their listeners stay shared.
    for (const id of ['camera-toggle','stone-sound','pve-restart','fullscreen-toggle']) {
      const button = host.querySelector<HTMLElement>(`#${id}`);
      if (button) el('adventure-settings').append(button);
    }
    el('pve-pause').textContent = 'Menü';
    // Display controls are installed by main.ts after startAdventure resolves.
    touchMenuReady = !!host.querySelector('#fullscreen-toggle'); view.resize();
  };
  const setPaused = (value: boolean) => {
    paused = value || input.touchEnabled && innerHeight > innerWidth;
    input.clear(); clock.reset(); previous = current; lastTime = performance.now();
    feedback.pause(paused); el('pause').hidden = !paused;
  };
  const syncWorld = () => {
    const state=fight.snapshot();
    state.runners.forEach((r,i)=>{ world.setTargetPosition(ADVENTURE_RUNNERS[i]!.id,r.center); world.setTargetEnabled(r.id,!exploration && r.hp>0); });
    world.setTargetPosition(ADVENTURE_BOSS.id,state.pve.center);
    world.setTargetEnabled(ADVENTURE_BOSS.id,!exploration && state.bossActive && state.pve.phase!=='emerging' && state.pve.outcome==='running');
    world.setObstacleEnabled('dormant-warden',!state.bossActive);
    world.setObstacleEnabled('boss-entry-gate',state.bossActive && state.pve.outcome==='running');
    world.setObstacleEnabled('north-gate',state.pve.outcome!=='victory');
  };
  const placePlayer = (position:Vec3) => {
    feedback.reset(); overview = false; syncWorld();
    current = simulation.reset(position); previous = current; aim = null;
    startTick = current.tick;
    el('match-result').hidden=true;
    view.resize(); view.camera.snap(current.position); view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  };
  const restart = () => { fight.reset(); placePlayer(STONE_ADVENTURE.spawn); };
  const retry = () => placePlayer(fight.retry());
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => setPaused(document.hidden), options);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => { view.resize(); if (input.touchEnabled) setPaused(document.hidden || !document.hasFocus()); }, options);
  el('resume').addEventListener('click', () => { view.renderer.domElement.focus(); setPaused(false); }, options);
  el('pve-pause').addEventListener('click', () => setPaused(true), options);
  el('pve-restart').addEventListener('click', restart, options);
  el('pve-again').addEventListener('click', retry, options);
  el('pve-next').addEventListener('click', () => { if(fight.completed) location.assign(`${location.pathname}?mode=pve&level=frost`); }, options);
  for(const id of ['adventure-home','result-home']) el(id).addEventListener('click',()=>location.assign(location.pathname),options);
  el('camera-toggle').addEventListener('click', () => view.camera.toggle(), options);
  for (const id of ['arc', 'pulse'] as const) el(`weapon-${id}`).addEventListener('click', () => chooseWeapon(id), options);
  function frame(now: number) {
    arrangeTouchMenu();
    const elapsed = Math.max(0, (now-lastTime)/1000); lastTime = now;
    let alpha = 1;
    if (!paused) alpha = clock.advance(elapsed, () => {
      if(fight.life.snapshot().outcome==='defeat' || fight.completed) return;
      const before=fight.snapshot();
      previous = current; current = simulation.step(input.command(view.camera.basis()));
      if (exploration && current.position.y < -6) { current = simulation.reset(); previous = current; view.camera.snap(current.position); }
      if (before.pve.outcome==='victory' && current.position.y < -6) {
        current=simulation.reset({x:0,y:.06,z:-37}); previous=current; view.camera.snap(current.position);
      }
      const ray = input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
      aim = ray ? solveAim(world, ray, current.position) : null;
      const selected = combat.snapshot().selected;
      const attack=combat.step(current.tick, input.fire() && before.pve.outcome==='running', aim, ray, world, exploration ? [] : fight.targets());
      if(attack.attacked) feedback.play(selected);
      if(!exploration) fight.step(current.position,world,attack.damage);
      const after=fight.snapshot(); syncWorld();
      if(after.pve.hitsTaken>before.pve.hitsTaken) { feedback.play('hurt'); feedback.playerHit(current.tick); }
      const damage=before.pve.bossHp-after.pve.bossHp;
      if(damage>0) { feedback.play('hit'); feedback.bossHit(damage,current.tick); }
      if(after.runners.some((r,i)=>r.hp<before.runners[i]!.hp)) feedback.play('hit');
      if(after.pve.phase==='melee' && before.pve.phase!=='melee') feedback.play('windup');
      if(after.pve.phase==='melee' && after.pve.phaseTick===PVE_RULES.meleeWarning
        || after.pve.phase==='attack' && before.pve.phase!=='attack') feedback.play('slam');
      if(after.pve.outcome==='victory' && before.pve.outcome!=='victory') feedback.play('victory');
      if(after.checkpoint && !before.checkpoint) feedback.play('pickup');
      if (current.grounded && !previous.grounded) feedback.play('land');
      else if (previous.grounded && !current.grounded && current.velocity.y > 0) feedback.play('jump');
      else if (current.grounded && Math.hypot(current.velocity.x,current.velocity.z) > 1 && current.tick%22 === 0) feedback.play('step');
      if(after.pve.outcome==='running') pickups.step(current.tick, current, world, (kind, amount) => {
        let accepted: number;
        if (kind === 'ammo' || kind === 'pulse') accepted = combat.addAmmo(amount, kind === 'pulse');
        else if (kind === 'health') accepted=fight.life.restore(amount);
        else accepted=fight.life.restoreArmor(amount);
        if (accepted) feedback.play('pickup'); return accepted;
      });
      if(before.pve.outcome==='running' && after.pve.outcome!=='running' || after.completed && !before.completed) {
        input.clear(); combat.clearEffects(); aim=null; previous=current;
      }
    });
    const weapons = combat.snapshot();
    const state=fight.snapshot(), {hp,armor}=state.pve;
    if (now-lastHud > 70) {
      const room = stoneRoomAt(current.position);
      if (room) { el('room-name').textContent = room.name; el('room-hint').textContent = hints[room.id]!; }
      const guards=state.runners.filter(r=>r.hp>0).length;
      if(!exploration) {
        if(room?.id==='A') el('room-hint').textContent='Öffne den Weg zur Kristallkluft. Befreie die Höfe und bezwinge ihren Wächter.';
        if(room?.id==='B') el('room-hint').textContent=state.runners[0]!.hp>0?'Ein Steinläufer bewacht den Durchgang. Weiche seinem Schlag aus.':'Erster Hof frei · Pulse am Durchgang aufnehmen.';
        if(room?.id==='E') el('room-hint').textContent=state.runners[1]!.hp>0?'Der zweite Steinläufer hält das Siegel.':'Innerer Hof frei · Sichere die Vorräte auf der Terrasse.';
        if(room && ['F','G','H'].includes(room.id)) el('room-hint').textContent=guards ? `Noch ${guards} Steinläufer halten das Siegel. Befreie die beiden Höfe.` : state.bossActive?'Das Tor ist versiegelt. Bezwinge den Wächter!':'Betritt den Wächterhof. Das Siegel erwacht.';
        if(room?.id==='F' && state.checkpoint && !state.bossActive) el('room-hint').textContent='Ruhepunkt gesichert · Vorräte aufgefüllt. Betritt den Wächterhof, wenn du bereit bist.';
        if(state.pve.outcome==='victory') {
          el('room-name').textContent='Das Nordtor ist offen';
          el('room-hint').textContent='Folge dem Weg durch das Tor und verlasse den Hof.';
        }
      }
      el('adventure-boss').hidden=!state.bossActive || state.pve.outcome==='victory';
      el('boss-hp-value').textContent=String(state.pve.bossHp); (el('boss-hp') as HTMLProgressElement).value=state.pve.bossHp;
      const messages={emerging:'Der Boden bricht auf …',chasing:'Er verfolgt dich · Bleib in Bewegung!',melee:'FAUSTSCHLAG · Abstand halten!',
        warning:state.pve.kind==='wave'?'SCHOCKWELLE · Sprung vorbereiten!':'BODENAUSBRUCH · Kreis verlassen!',
        attack:state.pve.kind==='wave'?'JETZT SPRINGEN oder Deckung!':'Einschlag!',recovery:'Gegenfeuer!',defeated:'Steinsiegel gebrochen.'};
      el('pve-telegraph').textContent=messages[state.pve.phase];
      el('life-status').textContent=exploration?'Der Hof liegt still.':state.pve.outcome==='victory'?'Steinsiegel gebrochen · Ausgang offen':
        state.checkpoint?'Ruhepunkt gesichert':guards?`${2-guards}/2 Steinläufer besiegt`:'Weiter zum Siegelplatz.';
      el('match-result').hidden=state.pve.outcome!=='defeat' && !state.completed;
      el('result-title').textContent=state.completed?'Der verwitterte Hof ist frei.':'Der Hof bleibt bewacht.';
      el('result-detail').textContent=state.completed?'Du hast das Steinsiegel gebrochen und den Hof verlassen. Dein Weg zur Kristallkluft ist frei.':
        state.checkpoint?'Der Ruhepunkt ist gesichert. Kehre mit frischen Vorräten zum Siegelplatz zurück. Die beiden Höfe bleiben befreit.':'Nutze die Vorräte und weiche den angekündigten Schlägen aus.';
      el('pve-again').textContent=state.completed?'Level erneut spielen':state.checkpoint?'Am Ruhepunkt versuchen':'Neu versuchen';
      el('pve-next').hidden=!state.completed;
      if (input.touchEnabled) el('camera-toggle').textContent = `Ansicht: ${{side:'seitlich',straight:'gerade',isometric:'isometrisch'}[view.camera.mode]}`;
      el('campaign-story').hidden = state.checkpoint || current.tick-startTick > 540;
      el('hp-value').textContent = String(hp); el('armor-value').textContent = String(armor);
      (el('hp-bar') as HTMLProgressElement).value = hp; (el('armor-bar') as HTMLProgressElement).value = armor;
      el('ammo-count').textContent = weapons.ownsPulse ? `${weapons.ammo} / 54` : '—';
      for (const id of ['arc','pulse']) el(`weapon-${id}`).setAttribute('aria-pressed', String(weapons.selected === id));
      (el('weapon-pulse') as HTMLButtonElement).disabled = !weapons.ownsPulse || weapons.ammo === 0;
      lastHud = now;
    }
    const life: MatchSnapshot = { phase: state.pve.outcome==='defeat' || state.completed?'ended':'running', tick: current.tick, remainingTicks: 0, scores: { blue: 0, red: 0 },
      winner: null, reason: null, actors: { player: { id: 'player', team: 'blue', hp, armor, life: 1, alive: hp>0, respawnTicks: 0, protectionTicks: 0 } } };
    fightView.update(state,view.camera.camera,paused?0:Math.min(elapsed,.05),exploration);
    feedback.draw(current.tick, view.projectedPosition(state.pve.center));
    view.draw(previous,current,alpha,paused ? 0 : Math.min(elapsed,.05),aim,weapons.lastArc,null,life,weapons,pickups.snapshot());
    frameId = requestAnimationFrame(frame);
  }
  if (import.meta.env.MODE === 'test') Object.defineProperty(window, '__coreArena', { configurable: true, value: Object.freeze({
    read: () => ({ mode: 'adventure', level: 'stone', snapshot: current, weapons: combat.snapshot(), pickups: pickups.snapshot(),
      hp:fight.life.snapshot().hp, armor:fight.life.snapshot().armor, pve:fight.life.snapshot(), bossActive:fight.bossActive,
      checkpoint:fight.checkpoint, completed:fight.completed,
      enemies:fight.runners.map(r=>({...r.snapshot(),screen:view.projectedPosition(r.snapshot().center)})),
      monsterScreen:view.projectedPosition({...fight.life.snapshot().center,y:.95}),
      paused, overview, camera: view.camera.mode, section: stoneRoomAt(current.position)?.id,
      playerScreen: view.projectedPosition(current.position), feedback: feedback.diagnostics(),
      viewport: { width: innerWidth, height: innerHeight, dpr: view.renderer.getPixelRatio(), viewHeight: view.camera.camera.top-view.camera.camera.bottom }, renderCalls: view.renderer.info.render.calls }),
    // Documentation capture only; walkthrough tests still use normal player inputs.
    overview: () => {
      setPaused(true); el('pause').hidden = true; overview = true; view.camera.snap({ x: 0, y: 0, z: -2 });
      const camera = view.camera.camera, halfHeight = view.camera.mode === 'side' ? Math.max(22,45*innerHeight/innerWidth) : 37;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.left = -halfHeight * innerWidth/innerHeight; camera.right = -camera.left; camera.updateProjectionMatrix();
    },
  }) });
  document.querySelector('#loading')?.remove(); host.dataset.ready = 'true';
  restart(); frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId); abort.abort(); feedback.dispose(); input.dispose(); world.dispose(); view.dispose();
    host.querySelectorAll('#hud,#pause,#match-result').forEach(node => node.remove()); Reflect.deleteProperty(window,'__coreArena');
    delete host.dataset.adventure;
  };
}
