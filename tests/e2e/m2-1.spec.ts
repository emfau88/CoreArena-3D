import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { MatchSnapshot } from '../../src/core/match';
import type { Snapshot } from '../../src/core/types';
import type { AimSolution, DiagnosticShot } from '../../src/core/aim';

interface Observation {
  match: MatchSnapshot; snapshot: Snapshot; aim: AimSolution | null; lastShot: DiagnosticShot | null;
  targets: { id: string; screen: { x: number; y: number } }[];
}
const read = (page: Page): Promise<Observation> => page.evaluate(() => {
  const { match, snapshot, aim, lastShot, targets } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
  return { match, snapshot, aim, lastShot, targets };
});
async function move(page: Page, key: string, axis: 'x' | 'z', value: number, jump = false) {
  await page.keyboard.down(key); if (jump) await page.keyboard.press('Space');
  await page.waitForFunction(({ axis, value }) =>
    (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position[axis] <= value, { axis, value });
  await page.keyboard.up(key);
}
test.use({ headless: false });
test('play damage, death, protected respawns, ten real kills, match result and restart', async ({ page, browser }, info) => {
  test.setTimeout(140_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Trainingsmatch starten', exact: true }).click();
  await move(page, 'KeyA', 'x', -10.7);
  await expect.poll(async () => (await read(page)).match.actors.player!.armor, { intervals: [50] }).toBeLessThan(50);
  expect((await read(page)).match.actors.player!.hp).toBe(100);
  await expect.poll(async () => (await read(page)).match.actors.player!.alive).toBe(false);
  expect((await read(page)).match.scores).toEqual({ blue: 0, red: 0 });
  await page.screenshot({ path: info.outputPath('player-death.png') });
  await page.mouse.move(400, 350);
  await page.keyboard.down('KeyW'); await page.mouse.down();
  await expect.poll(async () => (await read(page)).match.actors.player!.life).toBe(2);
  await page.keyboard.up('KeyW'); await page.mouse.up();
  const respawn = await read(page);
  expect(respawn.snapshot.position.x).toBeCloseTo(-7, 1);
  expect(respawn.snapshot.position.z).toBeCloseTo(2, 1);
  expect(respawn.match.actors.player!.hp).toBe(100); expect(respawn.match.actors.player!.armor).toBe(0);
  expect(respawn.match.actors.player!.protectionTicks).toBeGreaterThan(0);
  expect(respawn.lastShot).toBeNull();
  await page.screenshot({ path: info.outputPath('protected-respawn.png') });

  await move(page, 'KeyW', 'z', 0.3);
  await move(page, 'KeyW', 'z', -4, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1');
  // Let the follow camera settle, then fire using the target's projected position.
  const settle = (await read(page)).match.tick + 50;
  await expect.poll(async () => (await read(page)).match.tick).toBeGreaterThanOrEqual(settle);
  const point = (await read(page)).targets.find((target) => target.id === 'dummy-e1')!.screen;
  await page.mouse.move(point.x, point.y);
  await expect.poll(async () => (await read(page)).aim?.impact?.id).toBe('dummy-e1');
  await page.mouse.down();
  await expect.poll(async () => (await read(page)).match.scores.blue).toBe(1);
  await page.mouse.up();
  expect((await read(page)).match.actors['dummy-e1']!.alive).toBe(false);
  await expect.poll(async () => (await read(page)).aim?.target.id).not.toBe('dummy-e1');
  await expect.poll(async () => (await read(page)).match.actors['dummy-e1']!.life).toBe(2);
  await page.mouse.down();
  const protectedTick = (await read(page)).match.tick + 45;
  await expect.poll(async () => (await read(page)).match.tick).toBeGreaterThanOrEqual(protectedTick);
  expect((await read(page)).match.actors['dummy-e1']!.hp).toBe(100);
  await page.screenshot({ path: info.outputPath('target-protection.png') });
  await expect.poll(async () => (await read(page)).match.phase, { timeout: 95_000 }).toBe('ended');
  await page.mouse.up();
  const result = (await read(page)).match;
  expect(result.scores).toEqual({ blue: 10, red: 0 }); expect(result.reason).toBe('score');
  await expect(page.getByText('Blau gewinnt.')).toBeVisible();
  await page.screenshot({ path: info.outputPath('match-result.png') });
  await page.getByRole('button', { name: 'Noch einmal spielen' }).click();
  const restart = await read(page);
  expect(restart.match.scores).toEqual({ blue: 0, red: 0 });
  expect(restart.match.remainingTicks).toBeGreaterThan(7100);
  expect(restart.match.actors.player!.hp).toBe(100); expect(restart.match.actors.player!.armor).toBe(50);
  expect(restart.lastShot).toBeNull(); expect(restart.snapshot.position.x).toBeCloseTo(-7, 1);
  expect(restart.snapshot.position.z).toBeCloseTo(2, 1);
  expect(Object.values(restart.match.actors).every((actor) => actor.alive && actor.life === 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('restart.png') });
  await info.attach('m2-1-playthrough', { body: JSON.stringify({ browser: browser.version(), viewport: page.viewportSize(),
    respawn, result, restart, errors }, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
