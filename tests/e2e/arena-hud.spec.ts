import { test, expect } from '@playwright/test';
test.use({ headless: false, trace: 'off' });
test('small landscape HUD and pause controls remain reachable', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.locator('#team-start').tap();
    for (const id of ['weapon-arc', 'arena-menu', 'touch-sprint', 'touch-jump']) {
      const bounds = await page.locator(`#${id}`).evaluate(element => {
        const rect = element.getBoundingClientRect(), hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return { width: rect.width, height: rect.height, x: rect.x, right: rect.right, bottom: rect.bottom,
          viewport: [innerWidth, innerHeight], hit: hit?.id, accepts: !!hit && element.contains(hit) };
      });
      expect(bounds.width >= 39.5 && bounds.height >= 39.5 && bounds.x >= 0 && bounds.right <= bounds.viewport[0]!
        && bounds.bottom <= bounds.viewport[1]! && bounds.accepts, `${id}: ${JSON.stringify(bounds)}`).toBe(true);
    }
    const boxes = await page.locator('#weapon-panel, #match-panel, #life-panel, #touch-stick, #touch-actions').evaluateAll(elements => elements.map(element => {
      const r = element.getBoundingClientRect(); return { id: element.id, x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!, b = boxes[j]!;
      expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, `${a.id} overlaps ${b.id}`).toBe(true);
    }
    await page.screenshot({ path: info.outputPath('small-landscape.png') });
    await page.locator('#arena-menu').tap();
    await page.locator('#bot-difficulty').selectOption('easy');
    await page.locator('#match-restart').tap();
    expect(await page.evaluate(() => (window as unknown as { __coreArena: { read(): { difficulty: string } } }).__coreArena.read().difficulty)).toBe('easy');
    await page.locator('#arena-menu').tap(); await page.screenshot({ path: info.outputPath('small-pause.png') });
    await page.locator('#arena-home').tap(); await expect(page.locator('#team-start')).toBeVisible();
    await info.attach('hud-bounds', { body: JSON.stringify(boxes), contentType: 'application/json' });
  } finally { await context.close(); }
});
