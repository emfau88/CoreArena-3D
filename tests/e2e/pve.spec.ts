import { test, expect, type Page } from '@playwright/test';
import type { PveSnapshot } from '../../src/core/pve';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';

interface Observation { mode: string; snapshot: Snapshot; pve: PveSnapshot; weapons: WeaponSnapshot; paused: boolean;
  monsterScreen: { x: number; y: number } }
const read = (page: Page): Promise<Observation> => page.evaluate(() => {
  const { mode, snapshot, pve, weapons, paused, monsterScreen } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
  return { mode, snapshot, pve, weapons, paused, monsterScreen };
});
test.use({ headless: false });

test('warden follows a moving player, can be hit while walking and holds position during warnings', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('chasing');
  await expect.poll(async () => (await read(page)).pve.center.z, { intervals: [20] }).toBeGreaterThan(-0.5);
  const approach = await read(page);
  await page.keyboard.down('KeyA');
  await expect.poll(async () => (await read(page)).snapshot.position.x, { intervals: [20] }).toBeLessThan(-4);
  await page.keyboard.up('KeyA');
  await expect.poll(async () => (await read(page)).pve.center.x, { intervals: [20] }).toBeLessThan(-0.3);
  await page.keyboard.press('Digit2'); let walking = await read(page); expect(walking.pve.moving).toBe(true);
  await page.mouse.move(walking.monsterScreen.x, walking.monsterScreen.y); await page.mouse.click(walking.monsterScreen.x, walking.monsterScreen.y);
  await expect.poll(async () => (await read(page)).pve.bossHp, { intervals: [20] }).toBeLessThan(600);
  walking = await read(page);
  await page.screenshot({ path: info.outputPath('pursuit.png') });
  await page.locator('#pve-pause').click(); const paused = await read(page);
  await page.waitForTimeout(150); expect((await read(page)).pve.center).toEqual(paused.pve.center);
  await page.locator('#resume').click();
  await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('warning');
  const warning = await read(page); await page.waitForTimeout(180);
  expect((await read(page)).pve.center).toEqual(warning.pve.center);
  await page.locator('#pve-restart').click(); const restarted = await read(page);
  expect(restarted.pve.center).toEqual({ x: 0, y: 1.85, z: -1 }); expect(restarted.pve.phase).toBe('emerging');
  expect(errors).toEqual([]);
  await info.attach('pursuit', { body: JSON.stringify({ approach, walking, warning, restarted, errors }), contentType: 'application/json' });
});

test('basic swing hurts a stationary player but a real sidestep avoids the locked strike', async ({ page }, info) => {
  const results = [];
  for (const dodge of [false, true]) {
    await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    expect((await read(page)).weapons.ownsPulse).toBe(false);
    await page.keyboard.down('KeyW');
    await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.z < 2.2);
    await page.keyboard.up('KeyW');
    await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('melee');
    const windup = await read(page); expect(windup.pve.hitsTaken).toBe(0);
    if (dodge) await page.keyboard.down('KeyD');
    // Start the reaction before screenshot I/O consumes the short windup window.
    await page.screenshot({ path: info.outputPath(dodge ? 'melee-dodge-warning.png' : 'melee-warning.png') });
    await expect.poll(async () => (await read(page)).pve.phaseTick, { intervals: [20] }).toBeGreaterThanOrEqual(40);
    if (dodge) await page.keyboard.up('KeyD');
    const hit = await read(page); expect(hit.pve.hitsTaken).toBe(dodge ? 0 : 1);
    expect(hit.pve.armor).toBe(dodge ? 50 : 30); results.push(hit);
    await page.locator('#pve-restart').click();
    expect((await read(page)).pve.hitsTaken).toBe(0);
    expect((await read(page)).weapons.ownsPulse).toBe(false);
  }
  await page.locator('#pve-return').click(); await expect(page.locator('#bot-start')).toBeVisible();
  await info.attach('basic-attacks', { body: JSON.stringify(results), contentType: 'application/json' });
});
test('PvE: ignoring telegraphs produces real defeat; pause and retry work', async ({ page }, info) => {
  test.setTimeout(40_000);
  await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('#pve-pause').click(); const paused = await read(page);
  await page.waitForTimeout(250); expect((await read(page)).pve.tick).toBe(paused.pve.tick);
  await page.locator('#resume').click();
  await expect.poll(async () => (await read(page)).pve.outcome, { timeout: 25_000 }).toBe('defeat');
  const defeated = await read(page); expect(defeated.pve.hp).toBe(0); expect(defeated.pve.hitsTaken).toBeGreaterThanOrEqual(3);
  await page.screenshot({ path: info.outputPath('defeat.png') });
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  expect((await read(page)).pve.outcome).toBe('running'); expect((await read(page)).pve.hitsTaken).toBe(0);
  await info.attach('pve-defeat', { body: JSON.stringify(defeated), contentType: 'application/json' });
});

test.describe('PvE touch entry', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  test('enter, move, shoot the monster and return with touch', async ({ page }, info) => {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.locator('#pve-start').tap(); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await expect(page).toHaveURL(/mode=pve/);
    const cdp = await page.context().newCDPSession(page);
    const box = (await page.locator('#touch-stick').boundingBox())!;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: box.x + box.width / 2 - 40, y: box.y + box.height / 2 }] });
    await expect.poll(async () => (await read(page)).snapshot.position.x, { intervals: [20] }).toBeLessThan(-3.5);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await read(page)).weapons.ownsPulse).toBe(true);
    await page.locator('#weapon-pulse').tap();
    await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('warning');
    const target = (await read(page)).monsterScreen;
    await page.touchscreen.tap(target.x, target.y);
    await expect.poll(async () => (await read(page)).pve.bossHp, { intervals: [20] }).toBeLessThan(600);
    await page.screenshot({ path: info.outputPath('pve-mobile.png') });
    await page.locator('#pve-return').tap(); await expect(page.locator('#bot-start')).toBeVisible();
  });
});
