import { test, expect, type Page } from '@playwright/test';
import type { BotDecision } from '../../src/core/bot';
import type { Snapshot } from '../../src/core/types';
import type { MatchSnapshot } from '../../src/core/match';
import type { WeaponSnapshot } from '../../src/core/combat';

interface Observation { snapshot: Snapshot; match: MatchSnapshot; weapons: WeaponSnapshot;
  bot: { snapshot: Snapshot; decision: BotDecision | null; weapons: WeaponSnapshot; screen: { x: number; y: number } } | null }
const read = (page: Page): Promise<Observation> => page.evaluate(() => {
  const { snapshot, match, weapons, bot } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
  return { snapshot, match, weapons, bot };
});

test.use({ headless: false });
test('bot duel: real enemy damage, player respawn, moving target hit, rival respawn and clean restart', async ({ page, browser }, info) => {
  test.setTimeout(60_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Botmatch starten', exact: true }).click();
  await expect.poll(async () => (await read(page)).bot!.snapshot.position.z).toBeLessThan(8);
  await expect.poll(async () => (await read(page)).match.actors.player!.armor).toBeLessThan(50);
  const attacked = await read(page);
  await page.screenshot({ path: info.outputPath('bot-duel.png') });
  await expect.poll(async () => (await read(page)).match.scores.red, { timeout: 12_000 }).toBe(1);
  expect((await read(page)).match.actors.player!.alive).toBe(false);
  await expect.poll(async () => (await read(page)).match.actors.player!.life).toBe(2);
  const respawn = await read(page);
  expect(respawn.match.actors.player!.protectionTicks).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  await page.keyboard.down('KeyS');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position.z >= 3.4);
  await page.keyboard.up('KeyS');
  await expect.poll(async () => (await read(page)).weapons.ownsPulse).toBe(true);
  await page.keyboard.press('Digit2');
  // Track the rendered moving opponent with actual mouse input; never write game state.
  let state = await read(page);
  await page.mouse.move(state.bot!.screen.x, state.bot!.screen.y); await page.mouse.down();
  const deadline = Date.now() + 12_000;
  while (state.match.scores.blue === 0 && Date.now() < deadline) {
    await page.mouse.move(state.bot!.screen.x, state.bot!.screen.y);
    await page.waitForTimeout(70); state = await read(page);
  }
  await page.mouse.up(); expect(state.match.scores.blue).toBe(1);
  expect(state.match.actors.rival!.alive).toBe(false);
  await page.screenshot({ path: info.outputPath('bot-defeated.png') });
  await expect.poll(async () => (await read(page)).match.actors.rival!.life).toBe(2);
  const rivalRespawn = await read(page);
  expect(rivalRespawn.bot!.weapons.ammo).toBe(0);
  await page.getByRole('button', { name: 'Neu starten', exact: true }).click();
  const restarted = await read(page);
  expect(restarted.match.scores).toEqual({ blue: 0, red: 0 });
  expect(restarted.bot!.weapons.projectiles).toEqual([]); expect(restarted.bot!.weapons.lastArc).toBeNull();
  expect(restarted.bot!.weapons.ownsPulse).toBe(false); expect(restarted.match.actors.rival!.life).toBe(1);
  await info.attach('m2-3-playthrough', { body: JSON.stringify({ browser: browser.version(), attacked, respawn, defeated: state, rivalRespawn, restarted, errors }), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
