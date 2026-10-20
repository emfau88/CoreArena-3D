import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { AimSolution } from '../../src/core/aim';

interface M1Observation {
  snapshot: Snapshot; camera: string; aim: AimSolution | null; hits: Record<string, number>;
  probe: { status: string; visited: string[]; snapshot: Snapshot };
  targets: { id: string; screen: { x: number; y: number } }[];
}
const read = (page: Page): Promise<M1Observation> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): M1Observation } }).__coreArena.read());
const waitTicks = async (page: Page, count: number) => {
  const tick = (await read(page)).snapshot.tick + count;
  await expect.poll(async () => (await read(page)).snapshot.tick).toBeGreaterThanOrEqual(tick);
};
async function walkNorth(page: Page, z: number, jump = false) {
  await page.keyboard.down('KeyW');
  if (jump) await page.keyboard.press('Space');
  await page.waitForFunction((target) => {
    const state = (window as unknown as { __coreArena: { read(): M1Observation } }).__coreArena.read();
    return state.snapshot.position.z <= target;
  }, z);
  await page.keyboard.up('KeyW');
}
async function target(page: Page, id: string) {
  await waitTicks(page, 50);
  const point = (await read(page)).targets.find((item) => item.id === id)!.screen;
  await page.mouse.move(point.x, point.y);
  await expect.poll(async () => (await read(page)).aim?.target.id).toBe(id);
  return point;
}
test.use({ headless: false });
test('play the height route, hit three height targets, respect cover and show the route probe', async ({ page, browser }, info) => {
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:8744') external.push(request.url()); });
  await page.goto('./');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('canvas').click();
  await waitTicks(page, 15);
  const blockedPoint = await target(page, 'dummy-e0');
  expect((await read(page)).aim?.impact?.id).toBe('wall');
  await page.mouse.click(blockedPoint.x, blockedPoint.y);
  await waitTicks(page, 10);
  expect((await read(page)).hits['dummy-e0'] ?? 0).toBe(0);
  await page.screenshot({ path: info.outputPath('e0-cover.png') });

  await walkNorth(page, 0.3);
  await walkNorth(page, -4, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1');
  let point = await target(page, 'dummy-e1');
  await page.mouse.click(point.x, point.y);
  await expect.poll(async () => (await read(page)).hits['dummy-e1'] ?? 0).toBeGreaterThan(0);
  await page.screenshot({ path: info.outputPath('e1-hit.png') });

  await walkNorth(page, -4.8);
  await walkNorth(page, -9, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e2');
  point = await target(page, 'dummy-e2');
  await page.mouse.down();
  await waitTicks(page, 30);
  await page.mouse.up();
  expect((await read(page)).hits['dummy-e2']).toBeGreaterThan(2);
  await page.screenshot({ path: info.outputPath('e2-hit.png') });
  await page.keyboard.press('KeyV');
  expect((await read(page)).camera).toBe('isometric');
  point = await target(page, 'dummy-e2');
  expect((await read(page)).aim?.impact?.id).toBe('dummy-e2');
  expect((await read(page)).aim?.blocked).toBe(false);
  await page.mouse.click(point.x, point.y);
  await page.screenshot({ path: info.outputPath('isometric.png') });
  // From the upper platform this target has a free line over the central wall.
  point = await target(page, 'dummy-e0');
  await page.mouse.click(point.x, point.y);
  await expect.poll(async () => (await read(page)).hits['dummy-e0'] ?? 0).toBeGreaterThan(0);

  await page.keyboard.press('KeyB');
  await expect.poll(async () => (await read(page)).probe.status, { timeout: 15_000 }).toBe('complete');
  expect((await read(page)).probe.visited).toEqual(['floor', 'e1', 'e2', 'floor']);
  await page.keyboard.press('F3');
  await page.screenshot({ path: info.outputPath('route-complete.png') });
  await info.attach('m1-playthrough', { body: JSON.stringify({ browser: browser.version(), viewport: page.viewportSize(),
    observation: await read(page), errors, external }, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]); expect(external).toEqual([]);
});
