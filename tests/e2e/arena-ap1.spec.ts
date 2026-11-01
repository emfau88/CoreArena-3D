import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { MatchSnapshot } from '../../src/core/match';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { PickupState } from '../../src/core/pickups';

interface State {
  snapshot: Snapshot; match: MatchSnapshot; weapons: WeaponSnapshot; pickups: PickupState[];
  fixtures: { pads: { id: string; state: string; seconds: number; remaining: number; fill: number }[];
    spawns: { id: string; life: number; flashing: boolean; position: { x: number; z: number } }[] };
  frames: number[]; render: { calls: number; triangles: number };
}
const read = (page: Page): Promise<State> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });

for (const mobile of [false, true]) test(`AP1 ${mobile ? 'touch' : 'desktop'} pads, supply, cover and respawn`, async ({ playwright, channel }, info) => {
  test.setTimeout(125_000);
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const viewport = mobile ? { width: 667, height: 375 } : { width: 1366, height: 768 };
  const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await context.newPage(), errors: string[] = [], failed: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  const cdp = await context.newCDPSession(page);
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  const load = async () => { await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true'); };
  try {
    await load(); await click('#team-start');
    await expect.poll(async () => (await read(page)).fixtures.spawns.length).toBe(4);
    const team = await read(page);
    expect(team.fixtures.spawns.filter(s => s.position.x < 0).length).toBe(2);
    expect(team.fixtures.spawns.filter(s => s.position.x > 0).length).toBe(2);
    await page.screenshot({ path: info.outputPath('team-pads.png') });
    await load(); await click('#match-start');
    const stick = mobile ? (await page.locator('#touch-stick').boundingBox())! : null;
    const move = async (axis: 'x' | 'z', target: number) => {
      const delta = target - (await read(page)).snapshot.position[axis], sign = Math.sign(delta);
      if (Math.abs(delta) < .12) return;
      const key = axis === 'x' ? sign > 0 ? 'KeyD' : 'KeyA' : sign > 0 ? 'KeyS' : 'KeyW';
      if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
        { id: 1, x: stick!.x + stick!.width / 2 + (axis === 'x' ? sign * 40 : 0), y: stick!.y + stick!.height / 2 + (axis === 'z' ? sign * 40 : 0) },
      ] });
      else await page.keyboard.down(key);
      try { await page.waitForFunction(({ axis, target, sign }) =>
        ((window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position[axis] - target) * sign >= -.06,
        { axis, target, sign }, { timeout: 6000 }); }
      finally { if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.keyboard.up(key); }
    };
    // Full supplies stay available, with one notice on contact rather than a permanent toast.
    await move('x', -9); await move('z', 5);
    await expect(page.locator('#arena-notice')).toHaveText('Gesundheit voll');
    expect((await read(page)).pickups.find(p => p.kind === 'health')!.remaining).toBe(25);
    await expect(page.locator('#arena-notice')).toBeHidden({ timeout: 3000 });
    await move('z', 9); await move('x', -20); await move('z', 3);
    await expect.poll(async () => (await read(page)).weapons.railAmmo).toBe(6);
    await move('x', -18);
    const pad = async () => (await read(page)).fixtures.pads.find(p => p.id === 'rail-west')!;
    expect((await pad()).state).toBe('charging');
    expect((await pad()).seconds).toBeGreaterThan(0);
    await page.screenshot({ path: info.outputPath('pad-charging.png') });
    await click('#arena-menu'); const frozen = await pad();
    await page.waitForTimeout(300); expect(await pad()).toEqual(frozen); await click('#resume');
    await expect.poll(async () => (await pad()).state, { timeout: 12_000 }).toBe('ready');
    await page.screenshot({ path: info.outputPath('pad-ready.png') });
    await move('x', -20);
    await expect(page.locator('#arena-notice')).toHaveText('Rail-Munition voll');
    expect((await pad()).remaining).toBe(6);
    await click('#weapon-rail');
    if (mobile) await page.touchscreen.tap(viewport.width * .25, viewport.height * .3);
    else await page.mouse.click(viewport.width * .25, viewport.height * .3);
    // A real shot frees one slot; the pad transfers exactly that one round.
    await expect.poll(async () => (await pad()).remaining).toBe(5);
    expect((await read(page)).weapons.railAmmo).toBe(6);
    await move('x', -23); await move('z', 2.3);
    if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { id: 1, x: stick!.x + stick!.width / 2, y: stick!.y + stick!.height / 2 - 40 },
    ] }); else await page.keyboard.down('KeyW');
    await page.waitForTimeout(650);
    if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.keyboard.up('KeyW');
    const cover = await read(page);
    expect(cover.snapshot.position.z).toBeGreaterThan(1.7);
    expect(cover.snapshot.position.z).toBeLessThan(2.2);
    await click('#arena-menu'); await click('#camera-toggle'); await click('#resume');
    await page.screenshot({ path: info.outputPath('cover-isometric.png') });
    // Separate real duel for the life transition; no HP, position or timer writes.
    await load(); await page.locator('#bot-difficulty').selectOption('easy'); await click('#bot-start');
    await expect.poll(async () => (await read(page)).match.actors.player!.alive, { intervals: [30], timeout: 25_000 }).toBe(false);
    await expect.poll(async () => (await read(page)).fixtures.spawns.find(s => s.id === 'player')!.life,
      { intervals: [16], timeout: 7000 }).toBe(2);
    const respawn = await read(page);
    expect(respawn.fixtures.spawns.find(s => s.id === 'player')!.flashing).toBe(true);
    expect(Math.abs(respawn.snapshot.position.x - respawn.fixtures.spawns.find(s => s.id === 'player')!.position.x)).toBeLessThan(.1);
    await page.screenshot({ path: info.outputPath('respawn-pulse.png') });
    await expect.poll(async () => (await read(page)).fixtures.spawns.find(s => s.id === 'player')!.flashing).toBe(false);
    await click('#arena-menu'); await click('#match-restart');
    await expect.poll(async () => (await read(page)).fixtures.pads.every(p => p.state === 'ready')).toBe(true);
    expect(errors).toEqual([]); expect(failed).toEqual([]);
    await info.attach('AP1-results', { body: JSON.stringify({ mobile, viewport, team, cover, respawn, errors, failed }), contentType: 'application/json' });
  } catch (error) {
    await page.screenshot({ path: info.outputPath('failure.png') });
    await info.attach('failure-state', { body: JSON.stringify(await read(page)), contentType: 'application/json' }); throw error;
  } finally { await browser.close(); }
});

test('Adventure retains its separate pickup presentation', async ({ page }, info) => {
  await page.goto('./?mode=pve&level=stone&adventure=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true', { timeout: 40_000 });
  await expect(page.locator('#app')).toHaveAttribute('data-adventure', 'true');
  expect((await read(page)).fixtures).toBeUndefined();
  await page.screenshot({ path: info.outputPath('adventure-separate.png') });
});
