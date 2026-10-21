import { test, expect, type Page } from '@playwright/test';
import type { AimSolution } from '../../src/core/aim';
import type { MatchSnapshot } from '../../src/core/match';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';

interface Observation { snapshot: Snapshot; match: MatchSnapshot; weapons: WeaponSnapshot; aim: AimSolution;
  weaponScreen: { x: number; y: number }; targets: { id: string; screen: { x: number; y: number } }[] }
const read = (page: Page): Promise<Observation> => page.evaluate(() => {
  const { snapshot, match, weapons, aim, weaponScreen, targets } = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read();
  return { snapshot, match, weapons, aim, weaponScreen, targets };
});
test.use({ headless: false });
test('Pulse hits with cursor before and behind a same-level enemy in both cameras; Arc uses the same direction', async ({ page, browser }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Trainingsmatch starten', exact: true }).click();
  async function move(key: string, z: number, jump = false) {
    await page.keyboard.down(key); if (jump) await page.keyboard.press('Space');
    await page.waitForFunction(({ key, z }) => {
      const p = (window as unknown as { __coreArena: { read(): Observation } }).__coreArena.read().snapshot.position;
      return key === 'KeyS' ? p.z >= z : p.z <= z;
    }, { key, z });
    await page.keyboard.up(key);
  }
  await move('KeyS', 3.4); await expect.poll(async () => (await read(page)).weapons.ownsPulse).toBe(true);
  await move('KeyW', 0.3); await move('KeyW', -4, true);
  await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1');
  await page.keyboard.press('Digit2');
  const cases = [];
  for (const camera of ['straight', 'isometric']) {
    if (camera === 'isometric') await page.keyboard.press('KeyV');
    await page.waitForTimeout(450);
    for (const [name, factor] of [['before', 0.45], ['behind', 1.26]] as const) {
      const before = await read(page);
      const target = before.targets.find(t => t.id === 'dummy-e1')!.screen;
      const point = { x: before.weaponScreen.x + (target.x - before.weaponScreen.x) * factor,
        y: before.weaponScreen.y + (target.y - before.weaponScreen.y) * factor };
      await page.mouse.move(point.x, point.y);
      await expect.poll(async () => (await read(page)).aim.target.id).toBe('e1');
      const aim = (await read(page)).aim;
      expect(Math.abs(aim.firePoint.y - aim.muzzle.y)).toBeLessThan(0.001);
      await page.mouse.click(point.x, point.y);
      const life = before.match.actors['dummy-e1']!;
      await expect.poll(async () => {
        const next = (await read(page)).match.actors['dummy-e1']!; return next.hp + next.armor;
      }).toBe(life.hp + life.armor - 10);
      cases.push({ camera, cursor: name, aim, targetLife: (await read(page)).match.actors['dummy-e1'] });
      await page.screenshot({ path: info.outputPath(`${camera}-${name}.png`) });
    }
  }
  await page.keyboard.press('Digit1');
  const beforeArc = await read(page); const life = beforeArc.match.actors['dummy-e1']!;
  await page.mouse.click(beforeArc.weaponScreen.x + (beforeArc.targets[1]!.screen.x - beforeArc.weaponScreen.x) * 0.45,
    beforeArc.weaponScreen.y + (beforeArc.targets[1]!.screen.y - beforeArc.weaponScreen.y) * 0.45);
  await expect.poll(async () => { const next = (await read(page)).match.actors['dummy-e1']!; return next.hp + next.armor; }).toBe(life.hp + life.armor - 35);
  expect(errors).toEqual([]);
  await info.attach('directional-aim', { body: JSON.stringify({ browser: browser.version(), cases, errors }), contentType: 'application/json' });
});
