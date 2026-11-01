import { test, expect } from '@playwright/test';

test.use({ headless: false, trace: 'off' });
for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'desktop'} Adventure manual pause survives focus and resize`, async ({ playwright, channel }, info) => {
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const context = await browser.newContext(mobile
    ? { viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1366, height: 768 } });
  const page = await context.newPage(), errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const read = () => page.evaluate(() => (window as unknown as { __coreArena: { read(): { paused: boolean; snapshot: { tick: number }; mode: string } } }).__coreArena.read());
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  try {
    await page.goto('http://127.0.0.1:8744/CoreArena-3D/?mode=pve&level=stone&adventure=1');
    await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    expect((await read()).mode).toBe('adventure');
    await click('#pve-pause'); const tick = (await read()).snapshot.tick;
    const other = await context.newPage(); await other.goto('about:blank'); await other.bringToFront();
    await page.bringToFront(); await other.close(); await page.waitForTimeout(300);
    expect((await read()).paused, 'Explicit pause must survive a tab change').toBe(true);
    expect((await read()).snapshot.tick).toBe(tick);
    await page.setViewportSize(mobile ? { width: 375, height: 667 } : { width: 1280, height: 720 });
    await page.setViewportSize(mobile ? { width: 667, height: 375 } : { width: 1366, height: 768 });
    await page.waitForTimeout(200);
    expect((await read()).paused, 'Explicit pause must survive a resize/rotation').toBe(true);
    expect((await read()).snapshot.tick).toBe(tick);
    await page.screenshot({ path: info.outputPath('manual-pause.png') });
    await click('#resume'); await expect.poll(async () => (await read()).snapshot.tick).toBeGreaterThan(tick);
    if (mobile) {
      await page.setViewportSize({ width: 375, height: 667 }); await expect.poll(async () => (await read()).paused).toBe(true);
      const portraitTick = (await read()).snapshot.tick; await page.waitForTimeout(200);
      expect((await read()).snapshot.tick).toBe(portraitTick);
      await page.setViewportSize({ width: 667, height: 375 });
      await expect.poll(async () => (await read()).snapshot.tick).toBeGreaterThan(portraitTick);
      const ids = ['#pve-pause', '#touch-jump', '#touch-sprint', '#weapon-arc', '#weapon-pulse'];
      for (const id of ids) { const box = await page.locator(id).boundingBox(); expect(box, id).not.toBeNull(); expect(box!.width, id).toBeGreaterThanOrEqual(39.9); expect(box!.height, id).toBeGreaterThanOrEqual(39.9); }
      await page.screenshot({ path: info.outputPath('small-landscape.png') });
    }
    expect(errors).toEqual([]);
    await info.attach('pause-check', { body: JSON.stringify({ mobile, tick, final: await read(), errors }), contentType: 'application/json' });
  } finally { await browser.close(); }
});
