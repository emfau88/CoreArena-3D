import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { PickupState } from '../../src/core/pickups';
import type { MatchSnapshot } from '../../src/core/match';
import type { Snapshot } from '../../src/core/types';
import type { AimSolution } from '../../src/core/aim';

interface Observation { weapons: WeaponSnapshot; pickups: PickupState[]; match: MatchSnapshot; snapshot: Snapshot; aim: AimSolution | null;
  targets: { id: string; screen: { x: number; y: number } }[] }
const read = (page: Page): Promise<Observation> => page.evaluate(() => {
  const { weapons, pickups, match, snapshot, aim, targets } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
  return { weapons, pickups, match, snapshot, aim, targets };
});
async function move(page: Page, key: string, z: number, jump = false) {
  await page.keyboard.down(key); if (jump) await page.keyboard.press('Space');
  await page.waitForFunction(({ key, z }) => {
    const current = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.z;
    return key === 'KeyW' ? current <= z : current >= z;
  }, { key, z });
  await page.keyboard.up(key);
}
test.use({ headless: false });
test('collect Pulse, fire real projectiles through height route, empty ammo and restore pickups on restart', async ({ page, browser }, info) => {
  test.setTimeout(60_000);
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Trainingsmatch starten', exact: true }).click();
  await page.keyboard.press('Digit2'); expect((await read(page)).weapons.selected).toBe('arc');
  await move(page, 'KeyS', 3.4);
  await expect.poll(async () => (await read(page)).weapons.ammo).toBe(54);
  expect((await read(page)).weapons.selected).toBe('arc');
  await page.keyboard.press('Digit2'); expect((await read(page)).weapons.selected).toBe('pulse');
  await page.mouse.move(400, 350);
  await page.mouse.wheel(0, 100); await expect.poll(async () => (await read(page)).weapons.selected).toBe('arc');
  await page.keyboard.press('Digit2');
  const settle = (await read(page)).match.tick + 45;
  await expect.poll(async () => (await read(page)).match.tick).toBeGreaterThanOrEqual(settle);
  let point = (await read(page)).targets.find((target) => target.id === 'dummy-e0')!.screen;
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await expect.poll(async () => (await read(page)).weapons.ammo).toBeLessThan(50); await page.mouse.up();
  expect((await read(page)).match.actors['dummy-e0']!.armor).toBe(50);
  await move(page, 'KeyW', 0.3); await move(page, 'KeyW', -4, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1');
  await expect.poll(async () => (await read(page)).weapons.ammo).toBe(54);
  expect((await read(page)).pickups.find((item) => item.id === 'ammo-e1')!.remaining).toBeLessThan(27);
  const next = (await read(page)).match.tick + 45;
  await expect.poll(async () => (await read(page)).match.tick).toBeGreaterThanOrEqual(next);
  // Step off the ammo pad before emptying the weapon.
  await move(page, 'KeyW', -5.1);
  const aimTick = (await read(page)).match.tick + 45;
  await expect.poll(async () => (await read(page)).match.tick).toBeGreaterThanOrEqual(aimTick);
  point = (await read(page)).targets.find((target) => target.id === 'dummy-e1')!.screen;
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await expect.poll(async () => (await read(page)).weapons.projectiles.length, { intervals: [10] }).toBeGreaterThan(0);
  await page.screenshot({ path: info.outputPath('pulse-projectiles.png') });
  await expect.poll(async () => (await read(page)).match.scores.blue).toBeGreaterThan(0);
  await expect.poll(async () => (await read(page)).weapons.ammo, { timeout: 15_000 }).toBe(0);
  await page.mouse.up(); expect((await read(page)).weapons.selected).toBe('arc');
  await page.screenshot({ path: info.outputPath('arc-fallback.png') });
  const depleted = await read(page);
  await move(page, 'KeyW', -9, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e2');
  await expect.poll(async () => (await read(page)).match.actors.player!.armor).toBe(100);
  await page.screenshot({ path: info.outputPath('armor-e2.png') });
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  const restarted = await read(page);
  expect(restarted.weapons.ammo).toBe(0); expect(restarted.weapons.ownsPulse).toBe(false);
  expect(restarted.weapons.projectiles).toEqual([]); expect(restarted.weapons.lastArc).toBeNull();
  expect(restarted.pickups.every((item) => item.remaining === item.amount)).toBe(true);
  await info.attach('m2-2-playthrough', { body: JSON.stringify({ browser: browser.version(), depleted, restarted, errors }), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
