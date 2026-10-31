import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { MatchSnapshot } from '../../src/core/match';
interface State {
  snapshot: Snapshot; match: MatchSnapshot; difficulty: string;
  probe: { status: string; visited: string[] };
  bots: { resourceGoal: string | null; snapshot: Snapshot }[];
}
const read = (page: Page): Promise<State> => page.evaluate(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });
for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'desktop'} Adventure jump in Arena and selectable fair bots`, async ({ playwright, channel }, info) => {
  test.setTimeout(100_000);
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const context = await browser.newContext(mobile ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1366, height: 768 } });
  const page = await context.newPage(), errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.keyboard.press('KeyB');
    await expect.poll(async () => (await read(page)).probe.status, { timeout: 15_000 }).toBe('complete');
    expect((await read(page)).probe.visited).toEqual(['floor', 'e1', 'e2', 'floor']);
    if (mobile) await page.locator('#match-start').tap(); else await page.locator('#match-start').click();
    const cdp = await context.newCDPSession(page);
    const stick = mobile ? (await page.locator('#touch-stick').boundingBox())! : null;
    const jump = mobile ? (await page.locator('#touch-jump').boundingBox())! : null;
    const north = async (z: number, jumping = false) => {
      if (mobile) {
        const finger = { id: 1, x: stick!.x + stick!.width / 2, y: stick!.y + stick!.height / 2 - 40 };
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [finger,
          ...(jumping ? [{ id: 2, x: jump!.x + jump!.width / 2, y: jump!.y + jump!.height / 2 }] : [])] });
      } else { await page.keyboard.down('KeyW'); if (jumping) await page.keyboard.press('Space'); }
      try { await page.waitForFunction(z => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position.z <= z, z, { timeout: 5000 }); }
      finally { if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.keyboard.up('KeyW'); }
    };
    await north(.3); await north(-4, true);
    await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1');
    await page.screenshot({ path: info.outputPath('e1.png') });
    await north(-4.8); await north(-9, true);
    await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e2');
    await expect.poll(async () => (await read(page)).match.actors.player!.armor).toBe(100);
    await page.screenshot({ path: info.outputPath('e2-supply.png') });
    const route = await read(page);
    const choices = [];
    for (const difficulty of ['easy', 'hard']) {
      await page.reload(); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
      await page.locator('#bot-difficulty').selectOption(difficulty);
      if (mobile) await page.locator('#team-start').tap(); else await page.locator('#team-start').click();
      await expect.poll(async () => (await read(page)).bots.some(bot => !!bot.resourceGoal)).toBe(true);
      expect((await read(page)).difficulty).toBe(difficulty);
      await page.waitForTimeout(3000); choices.push(await read(page));
    }
    await page.screenshot({ path: info.outputPath('bot-supplies.png') });
    expect(errors).toEqual([]);
    await info.attach('arena-navigation', { body: JSON.stringify({ mobile, route, choices, errors }), contentType: 'application/json' });
  } catch (error) {
    await page.screenshot({ path: info.outputPath('failure.png') });
    await info.attach('failure-state', { body: JSON.stringify(await read(page)), contentType: 'application/json' });
    throw error;
  } finally { await browser.close(); }
});
