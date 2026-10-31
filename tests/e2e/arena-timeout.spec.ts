import { test, expect } from '@playwright/test';
test.use({ headless: false, trace: 'off' });
test('training runs to the real two-minute timer and resets cleanly', async ({ page }, info) => {
  test.setTimeout(155_000);
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('#match-start').click();
  // Ordinary movement and jump; no clock, match, position or HP writes.
  await page.keyboard.down('KeyS'); await page.waitForTimeout(280); await page.keyboard.up('KeyS');
  await page.keyboard.press('Space');
  await expect(page.locator('#weapon-pulse')).toBeEnabled();
  await page.locator('#weapon-pulse').click();
  await page.mouse.click(1000, 350);
  await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): { match: { phase: string } } } }).__coreArena.read().match.phase === 'ended', undefined, { timeout: 140_000, polling: 1000 });
  const result = await page.evaluate(() => (window as unknown as { __coreArena: { read(): { match: { phase: string; tick: number; reason: string; remainingTicks: number; scores: {blue: number; red: number} } } } }).__coreArena.read().match);
  expect(result.tick).toBe(7200); expect(result.reason).toBe('time'); expect(result.remainingTicks).toBe(0);
  await expect(page.locator('#match-time')).toHaveText('00:00');
  await page.screenshot({ path: info.outputPath('time-limit.png') });
  await page.locator('#result-restart').click(); await expect(page.locator('#match-result')).toBeHidden();
  await expect(page.locator('#weapon-pulse')).toBeDisabled();
  await info.attach('time-limit', { body: JSON.stringify(result), contentType: 'application/json' });
});
