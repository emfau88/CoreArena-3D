import { M0_ARENA } from '../arena/arena';
import { FixedClock } from '../core/fixedClock';
import { Simulation } from '../core/simulation';
import { createSpatialWorld } from '../physics/rapierWorld';
import { DesktopInput } from '../input/desktopInput';
import { ArenaView } from '../render/arenaView';

export async function startGame(host: HTMLElement): Promise<() => void> {
  const world = await createSpatialWorld(M0_ARENA);
  let view: ArenaView;
  try { view = new ArenaView(host, M0_ARENA); }
  catch (error) { world.dispose(); throw error; }
  const simulation = new Simulation(world, M0_ARENA.spawn);
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
      <span class="phase"><i></i>M0 · FUNDAMENT</span></header>
      <div class="location"><span class="eyebrow">01 / OBSIDIAN GARDEN</span>
      <p>Erkunde die Arena.</p><small>Bewegung &amp; Kamerastudie</small></div>
      <footer><span><kbd>W A S D</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprinten</span>
      <button id="camera-toggle" type="button"><kbd>V</kbd> <span id="camera-label">Gerade Ansicht</span></button></footer>
    </div>
    <div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Bereit, wenn du es bist.</h2>
    <button id="resume" type="button">Weiter</button></div></div>
    <pre id="diagnostics" hidden></pre>`);
  const label = host.querySelector<HTMLElement>('#camera-label')!;
  const pausePanel = host.querySelector<HTMLElement>('#pause')!;
  const diagnosticPanel = host.querySelector<HTMLElement>('#diagnostics')!;
  const toggleCamera = () => {
    view.camera.toggle();
    label.textContent = view.camera.mode === 'straight' ? 'Gerade Ansicht' : 'Isometrische Ansicht';
  };
  const input = new DesktopInput(toggleCamera, () => {
    if (diagnosticsAllowed) diagnostics = !diagnostics;
    diagnosticPanel.hidden = !diagnostics;
    view.showColliders(diagnostics);
  });
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
        steps.push(performance.now() - start);
        if (steps.length > 600) steps.shift();
      });
    }
    if (diagnostics && now - lastHud >= 100) {
      const p = current.position;
      diagnosticPanel.textContent = `TICK ${current.tick} · ${view.camera.mode}\n`
        + `FOOT ${p.x.toFixed(2)} / ${p.y.toFixed(2)} / ${p.z.toFixed(2)}\n`
        + `FRAME ${(elapsed * 1000).toFixed(1)} ms · DROPPED ${clock.droppedTicks}\n`
        + `DRAW ${view.renderer.info.render.calls} · TRI ${view.renderer.info.render.triangles}\nF3 · Collider / Diagnose`;
      lastHud = now;
    }
    if (diagnostics) view.showColliders(true, world.debugLines());
    view.draw(previous, current, alpha, Math.min(elapsed, 0.05));
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
    view.dispose();
    host.querySelectorAll('#hud, #pause, #diagnostics').forEach((element) => element.remove());
    Reflect.deleteProperty(window, '__coreArena');
  };
}
