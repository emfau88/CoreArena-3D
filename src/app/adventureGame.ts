import { STONE_ADVENTURE, STONE_ADVENTURE_PICKUPS, stoneRoomAt } from '../arena/stoneAdventure';
import { buildStoneAdventure } from '../render/stoneAdventureView';
import { ArenaView } from '../render/arenaView';
import { createSpatialWorld } from '../physics/rapierWorld';
import { Simulation } from '../core/simulation';
import { Combat, type WeaponId } from '../core/combat';
import { Pickups } from '../core/pickups';
import { FixedClock } from '../core/fixedClock';
import { solveAim, type AimSolution } from '../core/aim';
import type { MatchSnapshot } from '../core/match';
import { DesktopInput } from '../input/desktopInput';
import { lifeHud, weaponHud } from './hud';
import { StoneFeedback } from './stoneFeedback';

const hints: Record<string, string> = {
  A: 'Durch den offenen Ruinenhof nach Norden.', B: 'Am Norddurchgang liegt die Waffe der verlassenen Wache.',
  C: 'Pulse aufnehmen · weiter zum inneren Hof.', D: 'Vorräte sichern. Die breite Treppe führt zurück in den Hof.',
  E: 'Der Nordweg führt zum Siegelplatz.', F: 'Hinter diesem Durchgang liegt der Wächterhof.',
  G: 'Der Wächter ruht. Erkunde den Hof und die seitlichen Vorräte.', H: 'Das Nordtor zur Kristallkluft ist versiegelt.',
};

/** L1.1 is an explorable level, separate from the existing single-boss mode. */
export async function startAdventure(host: HTMLElement): Promise<() => void> {
  const world = await createSpatialWorld(STONE_ADVENTURE, { stepHeight: .32 });
  let view: ArenaView;
  try { view = new ArenaView(host, STONE_ADVENTURE, { training: false, pickups: STONE_ADVENTURE_PICKUPS,
    build: buildStoneAdventure, shadowSpan: 58 }); }
  catch (error) { world.dispose(); throw error; }
  view.renderer.domElement.setAttribute('aria-label', 'Der verwitterte Hof – Erkundung');
  view.camera.trackPlayer(STONE_ADVENTURE.spawn,1.2); view.resize();
  const simulation = new Simulation(world, STONE_ADVENTURE.spawn), combat = new Combat();
  const pickups = new Pickups(STONE_ADVENTURE_PICKUPS, false), clock = new FixedClock();
  const abort = new AbortController(), options = { signal: abort.signal };
  let current = simulation.snapshot(), previous = current, aim: AimSolution | null = null;
  let hp = 100, armor = 50, paused = false, overview = false, lastTime = performance.now(), frameId = 0, lastHud = 0, startTick = 0;
  host.insertAdjacentHTML('beforeend', `<div id="hud" class="pve-hud adventure-hud">
    <header><div class="brand"><div class="brand-mark">C</div><div><span class="eyebrow">CORE ARENA · DIE DREI SIEGEL</span>
    <h1>Der verwitterte Hof</h1></div></div><span class="phase"><i></i>ERKUNDUNG</span></header>
    <div id="adventure-location"><b id="room-name">Ankunft</b><p id="room-hint">${hints.A}</p></div>
    <aside id="campaign-story"><b>DAS VERSIEGELTE NORDTOR</b><p>Hinter den Ruinen liegt die Kristallkluft.
    Folge dem Weg durch den Hof und finde die Vorräte der verlassenen Wache.</p></aside>
    <div id="weapon-panel">${weaponHud()}<small>Arc zum Start · Pulse am Norddurchgang</small></div>
    <div id="life-panel">${lifeHud}<p id="life-status">Der Hof liegt still.</p></div>
    <div id="adventure-actions"><button id="pve-restart" type="button">Neu erkunden</button>
    <button id="pve-pause" type="button">Pause</button></div>
    <footer><span><kbd>WASD</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprint</span><span><kbd>SPACE</kbd> Springen</span>
    <button id="camera-toggle" type="button"><kbd>V</kbd> Ansicht wechseln</button></footer>
    </div><div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Der Hof wartet.</h2>
    <button id="resume" type="button">Weiter</button></div></div>`);
  const el = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const chooseWeapon = (id: WeaponId | 'cycle') => { if (!paused) { if (id === 'cycle') combat.cycle(); else combat.select(id); } };
  const input = new DesktopInput(view.renderer.domElement, () => view.camera.toggle(), () => {}, () => {}, chooseWeapon);
  const feedback = new StoneFeedback(host);
  const setPaused = (value: boolean) => {
    paused = value || input.touchEnabled && innerHeight > innerWidth;
    input.clear(); clock.reset(); previous = current; lastTime = performance.now();
    feedback.pause(paused); el('pause').hidden = !paused;
  };
  const restart = () => {
    combat.reset(); pickups.reset(); feedback.reset(); hp = 100; armor = 50; overview = false;
    current = simulation.reset(); previous = current; aim = null;
    startTick = current.tick;
    view.resize(); view.camera.snap(current.position); view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  };
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => setPaused(document.hidden), options);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => { view.resize(); if (input.touchEnabled) setPaused(document.hidden || !document.hasFocus()); }, options);
  el('resume').addEventListener('click', () => { view.renderer.domElement.focus(); setPaused(false); }, options);
  el('pve-pause').addEventListener('click', () => setPaused(true), options);
  el('pve-restart').addEventListener('click', restart, options);
  el('camera-toggle').addEventListener('click', () => view.camera.toggle(), options);
  for (const id of ['arc', 'pulse'] as const) el(`weapon-${id}`).addEventListener('click', () => chooseWeapon(id), options);
  function frame(now: number) {
    const elapsed = Math.max(0, (now-lastTime)/1000); lastTime = now;
    let alpha = 1;
    if (!paused) alpha = clock.advance(elapsed, () => {
      previous = current; current = simulation.step(input.command(view.camera.basis()));
      if (current.position.y < -6) { current = simulation.reset(); previous = current; view.camera.snap(current.position); }
      const ray = input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
      aim = ray ? solveAim(world, ray, current.position) : null;
      const selected = combat.snapshot().selected;
      if (combat.step(current.tick, input.fire(), aim, ray, world, []).attacked) feedback.play(selected);
      if (current.grounded && !previous.grounded) feedback.play('land');
      else if (previous.grounded && !current.grounded && current.velocity.y > 0) feedback.play('jump');
      else if (current.grounded && Math.hypot(current.velocity.x,current.velocity.z) > 1 && current.tick%22 === 0) feedback.play('step');
      pickups.step(current.tick, current, world, (kind, amount) => {
        let accepted: number;
        if (kind === 'ammo' || kind === 'pulse') accepted = combat.addAmmo(amount, kind === 'pulse');
        else if (kind === 'health') { accepted = Math.min(amount,100-hp); hp += accepted; }
        else { accepted = Math.min(amount,100-armor); armor += accepted; }
        if (accepted) feedback.play('pickup'); return accepted;
      });
    });
    const weapons = combat.snapshot();
    if (now-lastHud > 70) {
      const room = stoneRoomAt(current.position);
      if (room) { el('room-name').textContent = room.name; el('room-hint').textContent = hints[room.id]!; }
      el('campaign-story').hidden = current.tick-startTick > 540;
      el('hp-value').textContent = String(hp); el('armor-value').textContent = String(armor);
      (el('hp-bar') as HTMLProgressElement).value = hp; (el('armor-bar') as HTMLProgressElement).value = armor;
      el('ammo-count').textContent = weapons.ownsPulse ? `${weapons.ammo} / 54` : '—';
      for (const id of ['arc','pulse']) el(`weapon-${id}`).setAttribute('aria-pressed', String(weapons.selected === id));
      (el('weapon-pulse') as HTMLButtonElement).disabled = !weapons.ownsPulse || weapons.ammo === 0;
      lastHud = now;
    }
    const life: MatchSnapshot = { phase: 'running', tick: current.tick, remainingTicks: 0, scores: { blue: 0, red: 0 },
      winner: null, reason: null, actors: { player: { id: 'player', team: 'blue', hp, armor, life: 1, alive: true, respawnTicks: 0, protectionTicks: 0 } } };
    feedback.draw(current.tick, view.projectedPosition(current.position));
    view.draw(previous,current,alpha,paused ? 0 : Math.min(elapsed,.05),aim,weapons.lastArc,null,life,weapons,pickups.snapshot());
    frameId = requestAnimationFrame(frame);
  }
  if (import.meta.env.MODE === 'test') Object.defineProperty(window, '__coreArena', { configurable: true, value: Object.freeze({
    read: () => ({ mode: 'adventure', level: 'stone', snapshot: current, weapons: combat.snapshot(), pickups: pickups.snapshot(),
      hp, armor, paused, overview, camera: view.camera.mode, section: stoneRoomAt(current.position)?.id,
      playerScreen: view.projectedPosition(current.position), feedback: feedback.diagnostics(),
      viewport: { width: innerWidth, height: innerHeight, dpr: view.renderer.getPixelRatio() }, renderCalls: view.renderer.info.render.calls }),
    // Documentation capture only; walkthrough tests still use normal player inputs.
    overview: () => {
      setPaused(true); el('pause').hidden = true; overview = true; view.camera.snap({ x: 0, y: 0, z: -2 });
      const camera = view.camera.camera, halfHeight = 37;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.left = -halfHeight * innerWidth/innerHeight; camera.right = -camera.left; camera.updateProjectionMatrix();
    },
  }) });
  document.querySelector('#loading')?.remove(); host.dataset.ready = 'true';
  restart(); frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId); abort.abort(); feedback.dispose(); input.dispose(); world.dispose(); view.dispose();
    host.querySelectorAll('#hud,#pause').forEach(node => node.remove()); Reflect.deleteProperty(window,'__coreArena');
  };
}
