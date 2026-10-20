import { test, expect } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { MatchSnapshot } from '../../src/core/match';

interface MobileState { snapshot: Snapshot; weapons: WeaponSnapshot; match: MatchSnapshot; paused: boolean; camera: string;
  targets: { id: string; screen: { x: number; y: number } }[]; viewport: { dpr: number } }
test.use({ headless: false, viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
test('touch joystick, independent aim finger, jump, orientation reset and restart', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  const read = () => page.evaluate(() => {
    const { snapshot, weapons, match, paused, camera, targets, viewport } = (window as unknown as { __coreArena: { read(): MobileState } }).__coreArena.read();
    return { snapshot, weapons, match, paused, camera, targets, viewport };
  });
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', points: { id: number; x: number; y: number }[]) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
  const ticks = async (n: number) => {
    const tick = (await read()).match.tick + n;
    await expect.poll(async () => (await read()).match.tick, { intervals: [20] }).toBeGreaterThanOrEqual(tick);
  };
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#touch-stick')).toBeVisible();
  await page.getByRole('button', { name: 'Trainingsmatch starten', exact: true }).tap();
  const box = (await page.locator('#touch-stick').boundingBox())!;
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const down = { id: 1, x: center.x, y: center.y + 42 };
  await touch('touchStart', [down]);
  await expect.poll(async () => (await read()).weapons.ownsPulse, { intervals: [20] }).toBe(true);
  await touch('touchEnd', []);
  await page.locator('#weapon-pulse').tap(); expect((await read()).weapons.selected).toBe('pulse');
  const aim = { id: 2, ...(await read()).targets.find((item) => item.id === 'dummy-e0')!.screen };
  const right = { id: 1, x: center.x + 42, y: center.y };
  await touch('touchStart', [right]); await touch('touchStart', [right, aim]);
  await ticks(12); const together = await read();
  expect(together.weapons.ammo).toBeLessThan(54); expect(together.snapshot.position.x).toBeGreaterThan(-6);
  // Lift only aim: movement continues, firing stops.
  await touch('touchEnd', [aim]); await ticks(12);
  const moveOnly = await read(); expect(moveOnly.snapshot.position.x).toBeGreaterThan(together.snapshot.position.x + 0.5);
  expect(moveOnly.weapons.ammo).toBe(together.weapons.ammo);
  // Add aim again, then lift only movement: fire continues while the player stops.
  await touch('touchStart', [right, aim]); await touch('touchEnd', [right]); await ticks(2);
  const beforeAim = await read(); await ticks(20); const aimOnly = await read();
  expect(aimOnly.snapshot.position.x).toBeCloseTo(beforeAim.snapshot.position.x, 2);
  expect(aimOnly.weapons.ammo).toBeLessThan(beforeAim.weapons.ammo);
  await touch('touchCancel', []); await ticks(3); const cancelled = await read(); await ticks(12);
  expect((await read()).weapons.ammo).toBe(cancelled.weapons.ammo);
  // A short tap still fires one shot, without continued fire.
  await page.touchscreen.tap(aim.x, aim.y); await ticks(12);
  expect((await read()).weapons.ammo).toBe(cancelled.weapons.ammo - 1);
  await page.locator('#touch-jump').tap();
  await expect.poll(async () => (await read()).snapshot.position.y, { intervals: [20] }).toBeGreaterThan(0.5);
  await page.locator('#touch-camera').tap(); expect((await read()).camera).toBe('isometric');
  await page.locator('#touch-sprint').tap(); await expect(page.locator('#touch-sprint')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: info.outputPath('mobile-landscape.png') });
  await touch('touchStart', [right, aim]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#rotate-device')).toBeVisible(); expect((await read()).paused).toBe(true);
  await touch('touchEnd', []);
  await page.screenshot({ path: info.outputPath('mobile-portrait.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('#rotate-device')).toBeHidden(); await ticks(3);
  const rotated = await read(); await ticks(12);
  expect((await read()).weapons.ammo).toBe(rotated.weapons.ammo);
  expect((await read()).snapshot.position.x).toBeCloseTo(rotated.snapshot.position.x, 2);
  await expect(page.locator('#touch-sprint')).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Neu starten', exact: true }).tap();
  expect((await read()).weapons.ownsPulse).toBe(false);
  expect((await read()).viewport.dpr).toBe(1);
  await info.attach('touch-result', { body: JSON.stringify({ together, moveOnly, aimOnly, rotated, errors }), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
