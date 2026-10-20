import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';

interface Observation {
  snapshot: Snapshot;
  paused: boolean;
  camera: 'straight' | 'isometric';
  screen: { x: number; y: number };
  rendered: { x: number; y: number; z: number };
  marker: { x: number; z: number };
  frames: number[];
  steps: number[];
  viewport: { width: number; height: number; dpr: number };
  render: { calls: number; triangles: number };
  droppedTicks: number;
}
declare global {
  interface Window { readonly __coreArena: { readonly read: () => Observation } }
}
const errors = new WeakMap<Page, string[]>();
const requests = new WeakMap<Page, string[]>();
async function read(page: Page): Promise<Observation> {
  return page.evaluate(() => window.__coreArena.read());
}
async function ticks(page: Page, count: number) {
  const target = (await read(page)).snapshot.tick + count;
  await page.waitForFunction((tick) => window.__coreArena.read().snapshot.tick >= tick, target);
}
async function move(page: Page, keys: string[], count: number) {
  const before = await read(page);
  for (const key of keys) await page.keyboard.down(key);
  await ticks(page, count);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
  await ticks(page, 3);
  return { before, after: await read(page) };
}
const distance = (a: Observation, b: Observation) =>
  Math.hypot(a.snapshot.position.x - b.snapshot.position.x, a.snapshot.position.z - b.snapshot.position.z);

// Real OS-backed focus is part of this suite. CI needs a display (e.g. xvfb-run).
test.use({ headless: false });

test.beforeEach(async ({ page }) => {
  const failures: string[] = [], urls: string[] = [];
  errors.set(page, failures);
  requests.set(page, urls);
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
  page.on('requestfailed', (request) => failures.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('request', (request) => urls.push(request.url()));
  await page.goto('./');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('canvas').click();
  await ticks(page, 15);
});
test.afterEach(async ({ page }, info) => {
  await info.attach('runtime-errors', { body: JSON.stringify(errors.get(page)), contentType: 'application/json' });
  expect(errors.get(page)).toEqual([]);
  expect(requests.get(page)?.filter((url) => new URL(url).origin !== 'http://127.0.0.1:8744')).toEqual([]);
});

test('real input moves the rendered actor in screen directions in both cameras', async ({ page }) => {
  for (const mode of ['straight', 'isometric']) {
    expect((await read(page)).camera).toBe(mode);
    const up = await move(page, ['KeyW'], 18);
    expect(up.after.screen.y).toBeLessThan(up.before.screen.y - 5);
    const right = await move(page, ['KeyD'], 18);
    expect(right.after.screen.x).toBeGreaterThan(right.before.screen.x + 5);
    const data = await read(page);
    expect(Math.abs(data.rendered.x - data.snapshot.position.x)).toBeLessThan(0.03);
    expect(Math.abs(data.rendered.z - data.snapshot.position.z)).toBeLessThan(0.03);
    expect(data.marker.x).toBeCloseTo(data.rendered.x, 4);
    expect(data.marker.z).toBeCloseTo(data.rendered.z, 4);
    if (mode === 'straight') await page.keyboard.press('KeyV');
  }
});

test('real keyboard collision blocks a wall and allows sliding along it', async ({ page }) => {
  const { before, after } = await move(page, ['KeyD'], 80);
  expect(distance(before, after)).toBeGreaterThan(5);
  expect(after.snapshot.position.x).toBeGreaterThan(-1.12);
  expect(after.snapshot.position.x).toBeLessThanOrEqual(-1.045);
  const slide = await move(page, ['KeyD', 'KeyW'], 28);
  expect(slide.after.snapshot.position.x).toBeLessThanOrEqual(-1.045);
  expect(slide.after.snapshot.position.z).toBeLessThan(slide.before.snapshot.position.z - 1.5);
  expect(slide.after.snapshot.position.y).toBeGreaterThanOrEqual(0);
});

test('focus loss pauses, clears held movement and does not catch up on return', async ({ page, context }) => {
  // Playwright normally emulates every tab as focused, even when another is in front.
  // Disable that emulation so this exercises real browser focus/visibility events.
  const pageSession = await context.newCDPSession(page);
  await pageSession.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await page.keyboard.down('KeyD');
  await ticks(page, 10);
  const other = await context.newPage();
  const otherSession = await context.newCDPSession(other);
  await otherSession.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await other.goto('about:blank');
  await other.bringToFront();
  await expect.poll(async () => (await read(page)).paused).toBe(true);
  const paused = await read(page);
  await other.waitForTimeout(350);
  expect((await read(page)).snapshot.tick).toBe(paused.snapshot.tick);
  await page.bringToFront();
  await expect.poll(async () => (await read(page)).paused).toBe(false);
  await ticks(page, 15);
  const resumed = await read(page);
  expect(distance(paused, resumed)).toBeLessThan(0.01);
  expect(resumed.droppedTicks).toBe(paused.droppedTicks);
  await page.keyboard.up('KeyD');
  const fresh = await move(page, ['KeyD'], 10);
  expect(distance(fresh.before, fresh.after)).toBeGreaterThan(0.8);
  await other.close();
});

test('resize, camera and collider diagnostics render correctly; capture evidence', async ({ page, browser }, info) => {
  const size = page.viewportSize()!;
  const before = await read(page);
  await page.setViewportSize({ width: 1200, height: 800 });
  await ticks(page, 5);
  const canvas = await page.locator('canvas').boundingBox();
  expect(canvas?.width).toBe(1200);
  expect(canvas?.height).toBe(800);
  expect(distance(before, await read(page))).toBeLessThan(0.01);
  await page.setViewportSize(size);
  await ticks(page, 30);
  await page.screenshot({ path: info.outputPath('straight.png') });
  await page.keyboard.press('KeyV');
  await ticks(page, 30);
  await page.screenshot({ path: info.outputPath('isometric.png') });
  await page.keyboard.press('F3');
  await expect(page.locator('#diagnostics')).toBeVisible();
  await expect(page.locator('#diagnostics')).toContainText('TICK');
  await page.screenshot({ path: info.outputPath('colliders.png') });
  await page.keyboard.press('F3');
  await ticks(page, 120);
  const observation = await read(page);
  const graphics = await page.locator('canvas').evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2')!;
    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : 'unavailable',
      renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable',
      userAgent: navigator.userAgent,
    };
  });
  await info.attach('environment-and-metrics', {
    body: JSON.stringify({ browser: browser.version(), graphics, observation }, null, 2),
    contentType: 'application/json',
  });
  expect(observation.render.calls).toBeGreaterThan(5);
  expect(observation.render.triangles).toBeGreaterThan(100);
});
