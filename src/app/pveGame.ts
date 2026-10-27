import { weaponHud, lifeHud } from './hud';
import { CAMPAIGN, campaignLevel, nextCampaignLevel } from '../arena/campaign';
import { buildCampaignArena } from '../render/campaignArena';
import { createSpatialWorld } from '../physics/rapierWorld';
import { Simulation } from '../core/simulation';
import { FixedClock } from '../core/fixedClock';
import { Combat, type WeaponId } from '../core/combat';
import { solveAim, type AimSolution } from '../core/aim';
import { Pickups } from '../core/pickups';
import { PveEncounter, type PveSnapshot } from '../core/pve';
import type { MatchSnapshot } from '../core/match';
import { DesktopInput } from '../input/desktopInput';
import { ArenaView } from '../render/arenaView';
import { MonsterView } from '../render/monsterView';

// Presentation adapter only: the experiment never advances or changes ArenaMatch.
function viewState(state: PveSnapshot): MatchSnapshot {
  return { phase: state.outcome === 'running' ? 'running' : 'ended', tick: state.tick, remainingTicks: 0,
    scores: { blue: 0, red: 0 }, winner: null, reason: null, actors: {
      player: { id: 'player', team: 'blue', hp: state.hp, armor: state.armor, life: 1, alive: state.hp > 0, respawnTicks: 0, protectionTicks: 0 },
    } };
}

export async function startPve(host: HTMLElement): Promise<() => void> {
  const level = campaignLevel(new URLSearchParams(location.search).get('level'));
  const nextLevel = nextCampaignLevel(level.id);
  const chapter = CAMPAIGN.indexOf(level) + 1;
  const world = await createSpatialWorld({ ...level.arena, targets: [level.monster] });
  let view: ArenaView;
  try { view = new ArenaView(host, level.arena, { training: false, pickups: level.pickups, build: (scene, arena) => buildCampaignArena(scene, arena, level.kind) }); }
  catch (error) { world.dispose(); throw error; }
  const monsterView = new MonsterView(view.scene, level.kind, level.rules, level.monster);
  const simulation = new Simulation(world, level.arena.spawn);
  const encounter = new PveEncounter(level.rules, level.monster, level.kind); const combat = new Combat(); const pickups = new Pickups(level.pickups);
  const clock = new FixedClock(); const abort = new AbortController(); const options = { signal: abort.signal };
  let current = simulation.snapshot(), previous = current;
  let paused = false, aim: AimSolution | null = null, frameId = 0, lastTime = performance.now(), lastHud = 0;
  host.insertAdjacentHTML('beforeend', `
    <div id="hud" class="pve-hud">
      <header><div class="brand"><div class="brand-mark">C</div><div><span class="eyebrow">CORE ARENA · DIE DREI SIEGEL</span><h1>${level.name}</h1></div></div><span class="phase"><i></i>KAPITEL ${chapter} / 3</span></header>
      <div id="match-panel"><div class="eyebrow">${level.enemy}</div>
        <div id="pve-health-label"><b id="boss-hp-value">${level.rules.bossHp}</b> / ${level.rules.bossHp}</div>
        <progress id="boss-hp" max="${level.rules.bossHp}" value="${level.rules.bossHp}" aria-label="Monster-Lebenspunkte"></progress>
        <p id="pve-telegraph" role="status">Der Boden bricht auf …</p>
        <small>${level.hint}</small>
        <button id="pve-restart" type="button">Neu versuchen</button> <button id="pve-return" type="button">Zur Arena</button>
      </div>
      <aside id="campaign-story"><b>DIE DREI SIEGEL · ${chapter}/3</b><p>${level.intro}</p></aside>
      <div id="weapon-panel">${weaponHud(true) }<small>Pulse zum Start · Munition links und rechts</small><small>Nach dem Angriff: Zeit zum Gegenfeuer.</small></div>
      <div id="life-panel">${lifeHud}<p id="life-status">Ein Leben · Ein Monster</p><small>Heilung hinter dir. Bleib in Bewegung.</small></div>
      <footer><span><kbd>W A S D</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprint</span><span><kbd>SPACE</kbd> Springen</span>
        <button id="camera-toggle" type="button"><kbd>V</kbd> Ansicht wechseln</button><button id="pve-pause" type="button">Pause</button></footer>
    </div>
    <div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Der Kampf wartet.</h2><button id="resume" type="button">Weiter</button></div></div>
    <div id="match-result" hidden><div><span class="eyebrow">DIE DREI SIEGEL · ${chapter} / 3</span><h2 id="result-title"></h2><p id="result-detail"></p>
      <button id="pve-next" type="button" hidden>${nextLevel ? `Weiter: ${nextLevel.name}` : "Kampagne von vorn"}</button>
      <button id="pve-again" type="button">Noch einmal</button> <button id="pve-exit" type="button">Zur Arena</button></div></div>`);
  const element = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const chooseWeapon = (id: WeaponId | 'cycle') => {
    if (encounter.snapshot().outcome === 'running') { if (id === 'cycle') combat.cycle(); else combat.select(id); }
  };
  const input = new DesktopInput(view.renderer.domElement, () => view.camera.toggle(), () => {}, () => {}, chooseWeapon);
  const setPaused = (value: boolean) => {
    paused = value || input.touchEnabled && innerHeight > innerWidth;
    input.clear(); clock.reset(); previous = current; lastTime = performance.now(); element('pause').hidden = !paused;
  };
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => setPaused(document.hidden), options);
  document.addEventListener('visibilitychange', () => setPaused(document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => { view.resize(); if (input.touchEnabled) setPaused(document.hidden || !document.hasFocus()); }, options);
  element('resume').addEventListener('click', () => { view.renderer.domElement.focus(); setPaused(false); }, options);
  element('pve-pause').addEventListener('click', () => setPaused(true), options);
  element('camera-toggle').addEventListener('click', () => view.camera.toggle(), options);
  for (const id of ['arc', 'pulse'] as const) element(`weapon-${id}`).addEventListener('click', () => chooseWeapon(id), options);
  element('pve-next').addEventListener('click', () => {
    if (encounter.snapshot().outcome === 'victory') location.assign(`${location.pathname}?mode=pve&level=${nextLevel?.id ?? 'stone'}`);
  }, options);
  for (const id of ['pve-return', 'pve-exit']) element(id).addEventListener('click', () => location.assign(location.pathname), options);
  function restart() {
    encounter.reset(); combat.reset(); combat.addAmmo(54, true); combat.select('pulse'); pickups.reset();
    current = simulation.reset(); previous = current; aim = null; world.setTargetEnabled(level.monster.id, false);
    world.setTargetPosition(level.monster.id, encounter.snapshot().center);
    element('match-result').hidden = true; view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  }
  for (const id of ['pve-restart', 'pve-again']) element(id).addEventListener('click', restart, options);
  function frame(now: number) {
    const elapsed = Math.max(0, (now - lastTime) / 1000); lastTime = now;
    let alpha = 1;
    if (!paused) alpha = clock.advance(elapsed, () => {
      const before = encounter.snapshot();
      if (before.outcome !== 'running') return;
      previous = current; current = simulation.step(input.command(view.camera.basis()));
      const ray = input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
      aim = ray ? solveAim(world, ray, current.position) : null;
      const attack = combat.step(before.tick + 1, input.fire(), aim, ray, world, before.phase === 'emerging' ? [] : [{ ...level.monster, center: before.center }]);
      encounter.step(current.position, world, attack.damage);
      const after = encounter.snapshot();
      if (after.center !== before.center) world.setTargetPosition(level.monster.id, after.center);
      world.setTargetEnabled(level.monster.id, after.phase !== 'emerging' && after.outcome === 'running');
      if (after.outcome === 'running') pickups.step(after.tick, current, world, (kind, amount) =>
        kind === 'ammo' ? combat.addAmmo(amount) : encounter.restore(amount));
      else { input.clear(); combat.clearEffects(); aim = null; previous = current; }
    });
    const state = encounter.snapshot(); const weapons = combat.snapshot();
    if (now - lastHud >= 70) {
      element('boss-hp-value').textContent = String(state.bossHp); (element('boss-hp') as HTMLProgressElement).value = state.bossHp;
      element('hp-value').textContent = String(state.hp); element('armor-value').textContent = String(state.armor);
      (element('hp-bar') as HTMLProgressElement).value = state.hp;
      (element('armor-bar') as HTMLProgressElement).value = state.armor;
      element('life-panel').dataset.low = String(state.hp > 0 && state.hp <= 30);
      element('ammo-count').textContent = `${weapons.ammo} / 54`;
      for (const id of ['arc', 'pulse']) element(`weapon-${id}`).setAttribute('aria-pressed', String(weapons.selected === id));
      (element('weapon-pulse') as HTMLButtonElement).disabled = weapons.ammo === 0;
      const messages = { emerging: 'Der Boden bricht auf …', chasing: 'Er verfolgt dich · Bleib in Bewegung!', warning: state.kind === 'wave' ? 'SCHOCKWELLE · Sprung vorbereiten!' : 'BODENAUSBRUCH · Kreis verlassen!',
        attack: state.kind === 'wave' ? 'JETZT SPRINGEN oder Deckung suchen!' : 'Einschlag!', recovery: 'Kurze Pause · Gegenfeuer!', defeated: 'Siegel gebrochen.' };
      if (level.kind !== 'stone' && state.kind === 'wave') {
        messages.warning = level.kind === 'frost' ? 'EISSPLITTER · Fächer ausweichen!' : 'FEUERATEM · Seitlich raus oder Deckung!';
        messages.attack = level.kind === 'frost' ? 'Eissplitter! Ausweichen oder springen.' : 'Feueratem! Springen schützt nicht.';
      }
      element('pve-telegraph').textContent = messages[state.phase];
      element('campaign-story').hidden = state.tick > 480;
      element('pve-next').hidden = state.outcome !== 'victory';
      element('life-status').textContent = state.tick - state.lastHit < 50 ? 'Getroffen! Achte auf die Warnung.' : 'Ein Leben · Ein Monster';
      element('match-result').hidden = state.outcome === 'running';
      element('result-title').textContent = state.outcome === 'victory' ? (level.kind === 'stone' ? 'Wächter bezwungen.' : nextLevel ? 'Siegel gebrochen.' : 'Der Kern ist still.') : `${level.enemy} bleibt.`;
      element('result-detail').textContent = `${(state.tick / 60).toFixed(1)} Sekunden · ${state.hitsTaken} Treffer eingesteckt. ${state.outcome === 'victory' ? level.victory : level.hint}`;
      lastHud = now;
    }
    monsterView.update(state, paused ? 0 : Math.min(elapsed, 0.05));
    view.draw(previous, current, alpha, Math.min(elapsed, 0.05), aim, weapons.lastArc, null, viewState(state), weapons, pickups.snapshot());
    frameId = requestAnimationFrame(frame);
  }
  if (import.meta.env.MODE === 'test') Object.defineProperty(window, '__coreArena', { configurable: true,
    value: Object.freeze({ read: () => ({ mode: 'pve', level: level.id, snapshot: current, pve: encounter.snapshot(), weapons: combat.snapshot(),
      pickups: pickups.snapshot(), paused, aim, camera: view.camera.mode,
      monsterScreen: view.projectedPosition({ ...encounter.snapshot().center, y: encounter.snapshot().center.y - 0.9 }),
      viewport: { width: innerWidth, height: innerHeight, dpr: view.renderer.getPixelRatio() } }) }) });
  document.querySelector('#loading')?.remove(); host.dataset.ready = 'true';
  restart(); frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId); abort.abort(); input.dispose(); world.dispose(); view.dispose();
    host.querySelectorAll('#hud, #pause, #match-result').forEach(item => item.remove());
    Reflect.deleteProperty(window, '__coreArena');
  };
}
