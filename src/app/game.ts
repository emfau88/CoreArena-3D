import { M1_ARENA } from '../arena/arena';
import { FixedClock } from '../core/fixedClock';
import { Simulation } from '../core/simulation';
import { createSpatialWorld } from '../physics/rapierWorld';
import { DesktopInput } from '../input/desktopInput';
import { ArenaView } from '../render/arenaView';
import { DiagnosticWeapon, solveAim } from '../core/aim';
import type { AimSolution } from '../core/aim';
import { TraversalProbe } from '../core/traversal';
import { ArenaMatch, MATCH_RULES } from '../core/match';
import type { Damage } from '../core/match';
import { inTrainingField, TRAINING_FIELD } from '../arena/training';

export async function startGame(host: HTMLElement): Promise<() => void> {
  const world = await createSpatialWorld(M1_ARENA);
  // An isolated, non-blocking route probe shares the identical arena and player motor.
  const probeWorld = await createSpatialWorld(M1_ARENA);
  const probeSimulation = new Simulation(probeWorld, M1_ARENA.spawn);
  let probe = new TraversalProbe(M1_ARENA.links ?? []);
  const weapon = new DiagnosticWeapon();
  const match = new ArenaMatch([{ id: 'player', team: 'blue' },
    ...(M1_ARENA.targets ?? []).map((target) => ({ id: target.id, team: 'red' as const }))]);
  let aim: AimSolution | null = null;
  let view: ArenaView;
  try { view = new ArenaView(host, M1_ARENA); }
  catch (error) { world.dispose(); probeWorld.dispose(); throw error; }
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
      <div id="match-panel"><div class="eyebrow">TRAINING · 10 ABSCHÜSSE / 2 MINUTEN</div>
      <div id="match-score"><span class="blue">BLAU <b id="blue-score">0</b></span><time id="match-time">02:00</time><span class="red"><b id="red-score">0</b> ROT</span></div>
      <button id="match-start" type="button">Trainingsmatch starten</button><button id="match-restart" type="button" hidden>Neu starten</button>
      <small id="match-hint">Drei stationäre Ziele · Höhen und Deckung zählen.</small></div>
      <div id="life-panel" hidden><div><span id="hp-value">100</span> HP <span class="armor"><span id="armor-value">50</span> ARMOR</span></div>
      <progress id="hp-bar" max="100" value="100" aria-label="Lebenspunkte"></progress><p id="life-status"></p>
      <small>Orange Fläche links: Schaden testen.<br>Goldener Ring: Spawn-Schutz · Feuer beendet ihn.</small></div>
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
    <div id="match-result" hidden><div><span class="eyebrow">TRAINING BEENDET</span><h2 id="result-title"></h2>
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
  const startProbe = () => { probe.start(); probeButton.disabled = true; };
  const toggleCamera = () => {
    view.camera.toggle();
    label.textContent = view.camera.mode === 'straight' ? 'Gerade Ansicht' : 'Isometrische Ansicht';
  };
  const input = new DesktopInput(view.renderer.domElement, toggleCamera, () => {
    if (diagnosticsAllowed) diagnostics = !diagnostics;
    diagnosticPanel.hidden = !diagnostics;
    view.showColliders(diagnostics);
  }, startProbe);
  const abort = new AbortController();
  const options = { signal: abort.signal };
  function setPaused(value: boolean) {
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
  window.addEventListener('resize', () => view.resize(), options);
  host.querySelector('#resume')!.addEventListener('click', () => {
    view.renderer.domElement.focus();
    setPaused(false);
  }, options);
  host.querySelector('#camera-toggle')!.addEventListener('click', toggleCamera, options);
  probeButton.addEventListener('click', startProbe, options);
  function restartMatch() {
    match.start(); weapon.reset(); aim = null; input.clear();
    current = simulation.reset(); previous = current;
    probeSimulation.reset(); probe = new TraversalProbe(M1_ARENA.links ?? []); probeButton.disabled = false;
    for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, true);
    element('match-start').hidden = true; element('match-restart').hidden = false;
    element('match-result').hidden = true; element('life-panel').hidden = false;
    host.querySelector<HTMLElement>('.location')!.hidden = true;
    element('match-hint').textContent = 'HP zuerst durch Armor geschützt · Ziele respawnen nach 4 s.';
    view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  }
  for (const id of ['match-start', 'match-restart', 'result-restart']) element(id).addEventListener('click', restartMatch, options);

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
        // Jumping over the practice arena's low perimeter must not leave an endless fall.
        if (current.position.y < -8 && before.phase === 'ready') { current = simulation.reset(); previous = current; }
        aim = canPlay && input.pointer.active ? solveAim(world, view.pointerRay(input.pointer.x, input.pointer.y), current.position) : null;
        const shot = weapon.step(current.tick, canPlay && firing, aim);
        const damage: Damage[] = [];
        if (shot?.aim.impact) damage.push({ target: shot.aim.impact.id, source: 'player', amount: MATCH_RULES.damage });
        if (current.position.y < -8) damage.push({ target: 'player', amount: 1000 });
        if (inTrainingField(current.position) && (before.tick + 1) % TRAINING_FIELD.intervalTicks === 0)
          damage.push({ target: 'player', amount: TRAINING_FIELD.damage });
        match.step(damage, shot ? ['player'] : []);
        const after = match.snapshot();
        const playerAfter = after.actors.player!;
        if (before.phase === 'running') {
          for (const target of M1_ARENA.targets ?? []) world.setTargetEnabled(target.id, after.actors[target.id]!.alive);
          if (playerAfter.alive !== playerBefore.alive || after.phase === 'ended') {
            input.clear(); aim = null; weapon.lastShot = null;
            if (playerAfter.alive && !playerBefore.alive) { current = simulation.reset(); previous = current; weapon.reset(); }
          }
        }
        if (probe.status !== 'ready' && after.phase !== 'ended') probeSimulation.step(probe.command(probeSimulation.snapshot()));
        steps.push(performance.now() - start);
        if (steps.length > 600) steps.shift();
      });
    }
    if (now - lastHud >= 100) {
      hitLabel.textContent = (M1_ARENA.targets ?? []).map((target) => weapon.hits[target.id] ?? 0).join(' / ');
      const state = match.snapshot(); const player = state.actors.player!;
      element('blue-score').textContent = String(state.scores.blue); element('red-score').textContent = String(state.scores.red);
      const seconds = Math.ceil(state.remainingTicks / 60);
      element('match-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      element('hp-value').textContent = String(player.hp); element('armor-value').textContent = String(player.armor);
      (element('hp-bar') as HTMLProgressElement).value = player.hp;
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
    view.draw(previous, current, alpha, Math.min(elapsed, 0.05), aim, weapon.lastShot,
      probe.status === 'ready' ? null : probeSimulation.snapshot(), match.snapshot());
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
          rendered: { x: view.actor.position.x, y: view.actor.position.y, z: view.actor.position.z },
          marker: { x: view.marker.position.x, z: view.marker.position.z },
          aim, hits: { ...weapon.hits }, lastShot: weapon.lastShot, match: match.snapshot(),
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
    view.dispose();
    host.querySelectorAll('#hud, #pause, #diagnostics, #match-result').forEach((element) => element.remove());
    Reflect.deleteProperty(window, '__coreArena');
  };
}
