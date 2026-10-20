import { M1_ARENA } from '../arena/arena';
import { FixedClock } from '../core/fixedClock';
import { Simulation } from '../core/simulation';
import { createSpatialWorld } from '../physics/rapierWorld';
import { DesktopInput } from '../input/desktopInput';
import { ArenaView } from '../render/arenaView';
import { DiagnosticWeapon, solveAim } from '../core/aim';
import type { AimSolution } from '../core/aim';
import { TraversalProbe } from '../core/traversal';

export async function startGame(host: HTMLElement): Promise<() => void> {
  const world = await createSpatialWorld(M1_ARENA);
  // An isolated, non-blocking route probe shares the identical arena and player motor.
  const probeWorld = await createSpatialWorld(M1_ARENA);
  const probeSimulation = new Simulation(probeWorld, M1_ARENA.spawn);
  const probe = new TraversalProbe(M1_ARENA.links ?? []);
  const weapon = new DiagnosticWeapon();
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
      <span class="phase"><i></i>M1 · HÖHEN &amp; ZIELEN</span></header>
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
    <pre id="diagnostics" hidden></pre>`);
  const label = host.querySelector<HTMLElement>('#camera-label')!;
  const pausePanel = host.querySelector<HTMLElement>('#pause')!;
  const diagnosticPanel = host.querySelector<HTMLElement>('#diagnostics')!;
  const hitLabel = host.querySelector<HTMLElement>('#hit-count')!;
  const heightLabel = host.querySelector<HTMLElement>('#height-status')!;
  const probeLabel = host.querySelector<HTMLElement>('#probe-status')!;
  const probeButton = host.querySelector<HTMLButtonElement>('#probe-start')!;
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

  function frame(now: number) {
    const elapsed = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;
    let alpha = 1;
    if (!paused) {
      frames.push(elapsed * 1000);
      if (frames.length > 600) frames.shift();
      alpha = clock.advance(elapsed, () => {
        const start = performance.now();
        previous = current;
        current = simulation.step(input.command(view.camera.basis()));
        // Jumping over the practice arena's low perimeter must not leave an endless fall.
        if (current.position.y < -8) { current = simulation.reset(); previous = current; }
        aim = input.pointer.active ? solveAim(world, view.pointerRay(input.pointer.x, input.pointer.y), current.position) : null;
        weapon.step(current.tick, input.fire(), aim);
        if (probe.status !== 'ready') probeSimulation.step(probe.command(probeSimulation.snapshot()));
        steps.push(performance.now() - start);
        if (steps.length > 600) steps.shift();
      });
    }
    if (now - lastHud >= 100) {
      hitLabel.textContent = (M1_ARENA.targets ?? []).map((target) => weapon.hits[target.id] ?? 0).join(' / ');
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
      probe.status === 'ready' ? null : probeSimulation.snapshot());
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
          aim, hits: { ...weapon.hits }, lastShot: weapon.lastShot,
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
    host.querySelectorAll('#hud, #pause, #diagnostics').forEach((element) => element.remove());
    Reflect.deleteProperty(window, '__coreArena');
  };
}
