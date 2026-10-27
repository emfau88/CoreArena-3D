import { test, expect, type Page } from '@playwright/test';
import { collectPulse, walkTo } from './pveControls';
import type { Snapshot } from '../../src/core/types';
import type { PveSnapshot } from '../../src/core/pve';
import type { PickupState } from '../../src/core/pickups';

interface State { snapshot: Snapshot; pve: PveSnapshot; pickups: PickupState[];
  monsterScreen: { x: number; y: number }; feedback: { state: string; muted: boolean; played: number; peak: number } }
const read = (page: Page): Promise<State> => page.evaluate(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false });

test('stone feedback generates audio, can mute, and the real healing route restores damage', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  expect((await read(page)).feedback.state).toBe('locked');
  await collectPulse(page, 'stone'); await walkTo(page, 0, 8);
  await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('chasing');
  let state = await read(page); await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.mouse.down();
  await expect.poll(async () => (await read(page)).pve.bossHp).toBeLessThan(600);
  await expect(page.locator('#stone-hit-marker')).toBeVisible();
  await page.screenshot({ path: info.outputPath('stone-hit-feedback.png') }); await page.mouse.up();
  await expect.poll(async () => (await read(page)).feedback.peak).toBeGreaterThan(0.001);
  expect((await read(page)).feedback.peak).toBeLessThan(1);
  await page.locator('#stone-sound').click(); expect((await read(page)).feedback.muted).toBe(true);
  const mutedCount = (await read(page)).feedback.played;
  state = await read(page); await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.mouse.down();
  await page.waitForTimeout(250); await page.mouse.up(); expect((await read(page)).feedback.played).toBe(mutedCount);
  await page.locator('#stone-sound').click();
  await expect.poll(async () => (await read(page)).pve.hp, { timeout: 12000 }).toBeLessThan(100);
  const hurt = (await read(page)).pve.hp;
  await walkTo(page, -15, 10.3);
  await page.keyboard.press('Space'); await page.keyboard.down('KeyW');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position.z < 5.2);
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('broken-wall');
  await expect.poll(async () => (await read(page)).pve.hp).toBeGreaterThan(hurt);
  expect((await read(page)).pickups.find(p => p.id === 'stone-health')!.remaining).toBeLessThan(35);
  await page.keyboard.press('KeyV'); await page.screenshot({ path: info.outputPath('healing-route.png') });
  await page.locator('#pve-pause').click(); const paused = await read(page); await page.waitForTimeout(250);
  expect((await read(page)).pve.tick).toBe(paused.pve.tick); expect((await read(page)).feedback.played).toBe(paused.feedback.played);
  await page.locator('#resume').click(); await page.locator('#pve-restart').click();
  await expect(page.locator('#stone-hit-marker')).toBeHidden(); expect((await read(page)).pve.hp).toBe(100);
  expect(errors).toEqual([]); await info.attach('quality-flow', { body: JSON.stringify({ hurt, healed: paused, errors }), contentType: 'application/json' });
});

test('the warden routes around real courtyard cover towards the player', async ({ page }, info) => {
  await page.goto('./?mode=pve'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await walkTo(page, -7, 6);
  await expect.poll(async () => {
    const s = await read(page); return s.pve.center.x < -4.8 && s.pve.center.z > 3.8;
  }, { timeout: 20000, intervals: [50] }).toBe(true);
  const state = await read(page); expect(state.pve.outcome).toBe('running');
  await page.screenshot({ path: info.outputPath('warden-around-cover.png') });
  await info.attach('real-cover-route', { body: JSON.stringify(state), contentType: 'application/json' });
});
