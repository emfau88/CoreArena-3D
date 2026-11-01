import type { Page } from '@playwright/test';

/** Browser-only observer: never writes game state, timing, camera or resources. */
export async function observeAdventure(page: Page) {
  await page.addInitScript(() => {
    const frames: number[] = [], samples: unknown[] = [];
    let previous = 0, readyMs = 0, longFrames = 0;
    const root = window as unknown as { __adventureMetrics: unknown; __coreArena?: { read(): {
      mode: string; paused: boolean; section: string; snapshot: { tick: number }; renderCalls: number;
      viewport: unknown; hp: number; armor: number; pve: { phase: string; outcome: string }; mission: unknown;
    } } };
    const ready = new MutationObserver(() => {
      if (!readyMs && document.querySelector('#app')?.getAttribute('data-ready') === 'true') readyMs = performance.now();
    });
    ready.observe(document, { attributes: true, subtree: true, attributeFilter: ['data-ready'] });
    const frame = (now: number) => {
      if (readyMs && previous) { const elapsed = now - previous; frames.push(elapsed); if (elapsed > 50) longFrames++; if (frames.length > 600) frames.shift(); }
      previous = now; requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    setInterval(() => {
      const state = root.__coreArena?.read();
      if (state?.mode !== 'adventure') return;
      if (!readyMs || state.paused) return;
      const sorted = [...frames].sort((a, b) => a - b);
      samples.push({ ms: performance.now(), tick: state.snapshot.tick, section: state.section, phase: state.pve.phase,
        outcome: state.pve.outcome, hp: state.hp, armor: state.armor, mission: state.mission, viewport: state.viewport,
        p50: sorted[Math.floor((sorted.length - 1) * .5)] ?? 0, p95: sorted[Math.floor((sorted.length - 1) * .95)] ?? 0,
        max: sorted.at(-1) ?? 0, longFrames, renderCalls: state.renderCalls });
    }, 1000);
    root.__adventureMetrics = { samples, get readyMs() { return readyMs; } };
  });
  return () => page.evaluate(() => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!, ext = gl.getExtension('WEBGL_debug_renderer_info');
    return { ...(window as unknown as { __adventureMetrics: object }).__adventureMetrics,
      environment: { userAgent: navigator.userAgent, logicalCpus: navigator.hardwareConcurrency,
        gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable' },
      resources: performance.getEntriesByType('resource').map(r => { const p = r as PerformanceResourceTiming;
        return { name: p.name, duration: p.duration, transferSize: p.transferSize, decodedBodySize: p.decodedBodySize }; }) };
  });
}
