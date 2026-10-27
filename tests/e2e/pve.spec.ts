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
  let walking = await read(page); expect(walking.pve.moving).toBe(true);
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

test('optional PvE: emerge, jump wave, dodge locked eruption, shoot a real victory, restart and return to arena', async ({ page, browser }, info) => {
  test.setTimeout(65_000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('#pve-start').click();
  await expect(page).toHaveURL(/mode=pve/); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect.poll(async () => (await read(page)).pve.tick).toBeGreaterThan(45);
  await page.screenshot({ path: info.outputPath('emergence.png') });
  await expect.poll(async () => (await read(page)).pve.phase).toBe('warning');
  await page.screenshot({ path: info.outputPath('warden-warning.png') });
  await page.waitForFunction(() => {
    const { pve: s, snapshot } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
    const distance = Math.hypot(snapshot.position.x - s.center.x, snapshot.position.z - s.center.z);
    return s.phase === 'attack' && s.waveRadius >= distance - 2.5;
  });
  await page.keyboard.press('Space');
  await expect.poll(async () => (await read(page)).snapshot.position.y).toBeGreaterThan(0.7);
  await page.screenshot({ path: info.outputPath('jump-wave.png') });
  await expect.poll(async () => (await read(page)).pve.phase).toBe('recovery');
  expect((await read(page)).pve.hitsTaken).toBe(0);
  let state = await read(page);
  await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.mouse.down();
  await expect.poll(async () => { const { pve } = await read(page); return pve.kind === 'eruption' && pve.phase === 'warning'; }, { intervals: [20] }).toBe(true);
  await page.mouse.up(); const locked = (await read(page)).pve.target;
  await page.keyboard.down('KeyA');
  await page.screenshot({ path: info.outputPath('eruption-warning.png') });
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.x <= -4);
  await page.keyboard.up('KeyA'); await page.keyboard.down('KeyW');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.z <= 7.3);
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await read(page)).weapons.ammo).toBe(54);
  await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('recovery');
  expect((await read(page)).pve.target).toEqual(locked); expect((await read(page)).pve.hitsTaken).toBe(0);
  const dodged = await read(page);
  state = dodged; await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.mouse.down();
  let jumpedWave = -1;
  const deadline = Date.now() + 25_000;
  while (state.pve.outcome === 'running' && Date.now() < deadline) {
    await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y);
    const waveId = state.pve.tick - state.pve.phaseTick;
    const distance = Math.hypot(state.snapshot.position.x - state.pve.center.x, state.snapshot.position.z - state.pve.center.z);
    if (state.pve.phase === 'attack' && state.pve.kind === 'wave' && state.pve.waveRadius >= distance - 2.5 && jumpedWave !== waveId) {
      await page.keyboard.press('Space'); jumpedWave = waveId;
    }
    if (state.pve.phase === 'warning' && state.pve.kind === 'eruption'
      && Math.hypot(state.snapshot.position.x - state.pve.target.x, state.snapshot.position.z - state.pve.target.z) < 3.3) {
      const nextX = state.snapshot.position.x + 4;
      await page.keyboard.down('KeyD');
      await page.waitForFunction(x => (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.x >= x, nextX);
      await page.keyboard.up('KeyD');
    }
    await page.waitForTimeout(50); state = await read(page);
  }
  await page.mouse.up(); expect(state.pve.outcome).toBe('victory'); expect(state.pve.bossHp).toBe(0);
  await expect(page.locator('#result-title')).toHaveText('Wächter bezwungen.');
  await page.screenshot({ path: info.outputPath('victory.png') });
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  const restarted = await read(page); expect(restarted.pve.bossHp).toBe(600); expect(restarted.pve.hp).toBe(100);
  expect(restarted.weapons.ammo).toBe(54); expect(restarted.weapons.projectiles).toEqual([]);
  expect(restarted.pve.center).toEqual({ x: 0, y: 1.85, z: -1 });
  await page.locator('#pve-return').click();
  await expect(page).not.toHaveURL(/mode=pve/); await expect(page.locator('#bot-start')).toBeVisible();
  await info.attach('pve-playthrough', { body: JSON.stringify({ browser: browser.version(), dodged, won: state, restarted, errors }), contentType: 'application/json' });
  expect(errors).toEqual([]);
});

test('PvE: ignoring telegraphs produces real defeat; pause and retry work', async ({ page }, info) => {
  test.setTimeout(40_000);
  await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('#pve-pause').click(); const paused = await read(page);
  await page.waitForTimeout(250); expect((await read(page)).pve.tick).toBe(paused.pve.tick);
  await page.locator('#resume').click();
  await expect.poll(async () => (await read(page)).pve.outcome, { timeout: 25_000 }).toBe('defeat');
  const defeated = await read(page); expect(defeated.pve.hp).toBe(0); expect(defeated.pve.hitsTaken).toBe(3);
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
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: box.x + box.width / 2 + 40, y: box.y + box.height / 2 }] });
    await expect.poll(async () => (await read(page)).snapshot.position.x, { intervals: [20] }).toBeGreaterThan(1);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('warning');
    const target = (await read(page)).monsterScreen;
    await page.touchscreen.tap(target.x, target.y);
    await expect.poll(async () => (await read(page)).pve.bossHp, { intervals: [20] }).toBeLessThan(600);
    await page.screenshot({ path: info.outputPath('pve-mobile.png') });
    await page.locator('#pve-return').tap(); await expect(page.locator('#bot-start')).toBeVisible();
  });
});
