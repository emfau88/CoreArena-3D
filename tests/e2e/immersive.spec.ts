import { test, expect } from '@playwright/test';
import { collectPulse } from './pveControls';

test.use({ headless: false });

test('forge remains readable with integrated HUD and native fullscreen can enter and exit', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?mode=pve&level=ember');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Vollbild aktivieren', exact: true }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { pve: { phase: string } } } }).__coreArena.read().pve.phase === 'warning');
  await page.screenshot({ path: info.outputPath('forge-fullscreen.png') });
  await page.keyboard.press('KeyF');
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await expect(page.locator('#fullscreen-toggle')).toHaveAttribute('aria-label', 'Vollbild aktivieren');
  await page.locator('#pve-restart').click();
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { pve: { phase: string } } } }).__coreArena.read().pve.phase === 'warning');
  await page.screenshot({ path: info.outputPath('forge-immersive.png') });
  const boxes = await page.evaluate(() => ['#life-panel', '#weapon-panel', '#match-panel'].map(selector => {
    const element = document.querySelector(selector)!; const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
    return { selector, width: rect.width, height: rect.height, background: style.backgroundColor };
  }));
  expect(boxes[0]!.height).toBeLessThan(110); expect(boxes[1]!.height).toBeLessThan(90);
  await page.keyboard.press('KeyV'); await page.waitForTimeout(200);
  await page.screenshot({ path: info.outputPath('forge-isometric.png') });
  expect(errors).toEqual([]);
  await info.attach('immersive-hud', { body: JSON.stringify({ nativeFullscreen: true, boxes, errors }), contentType: 'application/json' });
});

test.describe('landscape forge', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  test('touch controls and slim HUD keep the arena usable', async ({ page }, info) => {
    await page.goto('./?mode=pve&level=ember'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await collectPulse(page, 'ember');
    await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { pve: { phase: string } } } }).__coreArena.read().pve.phase === 'warning');
    const target = await page.evaluate(() => (window as unknown as { __coreArena: { read(): { monsterScreen: { x: number; y: number } } } }).__coreArena.read().monsterScreen);
    await page.touchscreen.tap(target.x, target.y);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __coreArena: { read(): { pve: { bossHp: number } } } }).__coreArena.read().pve.bossHp)).toBeLessThan(700);
    await page.screenshot({ path: info.outputPath('forge-touch.png') });
    await page.locator('#pve-return').tap(); await expect(page.locator('#bot-start')).toBeVisible();
  });
});
