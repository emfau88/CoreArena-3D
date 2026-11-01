import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { MatchSnapshot } from '../../src/core/match';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { PickupState } from '../../src/core/pickups';

interface State {
  snapshot: Snapshot; match: MatchSnapshot; weapons: WeaponSnapshot; pickups: PickupState[];
  screen: { x: number; y: number }; render: { calls: number; triangles: number };
}
const read = (page: Page): Promise<State> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });

for (const [width, height, mobile] of [[1920, 1080, false], [844, 390, true], [667, 375, true]] as const)
  test(`map east supply route ${width} ${mobile ? 'touch' : 'desktop'}`, async ({ playwright, channel }, info) => {
    test.setTimeout(90_000);
    const browser = await playwright.chromium.launch({ channel, headless: false });
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage(), errors: string[] = [], failed: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    const cdp = await context.newCDPSession(page);
    const click = (selector: string) => mobile ? page.locator(selector).tap() : page.locator(selector).click();
    try {
      await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
      await click('#match-start');
      const stick = mobile ? (await page.locator('#touch-stick').boundingBox())! : null;
      const jump = mobile ? (await page.locator('#touch-jump').boundingBox())! : null;
      const move = async (axis: 'x' | 'z', target: number, jumping = false) => {
        const delta = target - (await read(page)).snapshot.position[axis], sign = Math.sign(delta);
        if (Math.abs(delta) < .12) return;
        const key = axis === 'x' ? sign > 0 ? 'KeyD' : 'KeyA' : sign > 0 ? 'KeyS' : 'KeyW';
        if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
          { id: 1, x: stick!.x + stick!.width / 2 + (axis === 'x' ? sign * 40 : 0), y: stick!.y + stick!.height / 2 + (axis === 'z' ? sign * 40 : 0) },
          ...(jumping ? [{ id: 2, x: jump!.x + jump!.width / 2, y: jump!.y + jump!.height / 2 }] : []),
        ] });
        else { await page.keyboard.down(key); if (jumping) await page.keyboard.press('Space'); }
        try { await page.waitForFunction(({ axis, target, sign }) =>
          ((window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position[axis] - target) * sign >= -.06,
          { axis, target, sign }, { timeout: 7000 }); }
        finally { if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.keyboard.up(key); }
      };
      // Approach the new Pulse from the south, avoiding the original west pickup.
      await move('x', -4); await move('z', 5.5); await move('x', 7); await move('z', 4);
      await expect.poll(async () => (await read(page)).weapons.ownsPulse).toBe(true);
      expect((await read(page)).pickups.find(item => item.id === 'pulse-e0-east')!.remaining).toBe(0);
      await click('#weapon-pulse');
      if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 3, x: width * .65, y: height * .48 }] });
      else { await page.mouse.move(width * .65, height * .48); await page.mouse.down(); }
      await page.waitForTimeout(850);
      if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.mouse.up();
      expect((await read(page)).weapons.ammo).toBeLessThan(54);
      await page.screenshot({ path: info.outputPath('east-depot.png') });
      await move('z', .3); await move('z', -4, true);
      await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e1-east');
      await expect.poll(async () => (await read(page)).weapons.ammo).toBe(54);
      expect((await read(page)).pickups.find(item => item.id === 'ammo-e1-east')!.remaining).toBeLessThan(27);
      await page.screenshot({ path: info.outputPath('east-e1.png') });
      await move('z', -4.8); await move('z', -9, true);
      await expect.poll(async () => (await read(page)).snapshot.surface).toBe('e2-east');
      await expect.poll(async () => (await read(page)).match.actors.player!.armor).toBe(100);
      await expect(page.locator('#armor-value')).toContainText('100');
      const elevated = await read(page);
      expect(elevated.screen.y).toBeGreaterThan(70); expect(elevated.screen.y).toBeLessThan(height - 80);
      await page.screenshot({ path: info.outputPath('east-e2.png') });
      await move('x', 11.5); await expect.poll(async () => (await read(page)).snapshot.surface).toBe('floor');
      await move('z', 3); await move('x', 20);
      await expect.poll(async () => (await read(page)).weapons.railAmmo).toBe(6);
      await page.waitForTimeout(400); await page.screenshot({ path: info.outputPath('east-rail.png') });
      if (mobile) { await click('#arena-menu'); await click('#camera-toggle'); await click('#resume'); }
      else await page.keyboard.press('KeyV');
      await page.waitForTimeout(400); await page.screenshot({ path: info.outputPath('east-isometric.png') });
      expect(errors).toEqual([]); expect(failed).toEqual([]);
      await info.attach('map-tour', { body: JSON.stringify({ width, height, mobile, elevated, end: await read(page), errors, failed }), contentType: 'application/json' });
    } catch (error) {
      await page.screenshot({ path: info.outputPath('failure.png') });
      await info.attach('failure-state', { body: JSON.stringify(await read(page)), contentType: 'application/json' }); throw error;
    } finally { await browser.close(); }
  });
