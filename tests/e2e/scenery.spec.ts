import { test, expect } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';

test.use({ headless: false });
test('decorated platforms stay reachable and readable in both camera views', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const read = () => page.evaluate(() => (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot);
  await page.goto('./?mode=pve&level=stone');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.down('KeyA');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot.position.x < -6.9);
  await page.keyboard.up('KeyA'); await page.keyboard.down('KeyW');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot.position.z < 3.3);
  await page.keyboard.up('KeyW');
  await page.keyboard.press('Space'); await page.keyboard.down('KeyW');
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot.position.z < 1.3);
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await read()).surface).toBe('pillar-left');
  await page.screenshot({ path: info.outputPath('stone-platform.png') });
  await page.keyboard.press('KeyV'); await page.waitForTimeout(150);
  await page.screenshot({ path: info.outputPath('stone-platform-isometric.png') });
  await info.attach('actual-platform-landing', { body: JSON.stringify(await read()), contentType: 'application/json' });
  for (const level of ['frost', 'ember']) {
    await page.goto(`./?mode=pve&level=${level}`);
    await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: info.outputPath(`${level}-surfaces.png`) });
    await page.keyboard.press('KeyV'); await page.waitForTimeout(150);
    await page.screenshot({ path: info.outputPath(`${level}-surfaces-isometric.png`) });
  }
  expect(errors).toEqual([]);
});
