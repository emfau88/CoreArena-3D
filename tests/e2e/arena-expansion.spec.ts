import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { MatchSnapshot } from '../../src/core/match';
import type { PickupState } from '../../src/core/pickups';
interface State {
  snapshot: Snapshot; weapons: WeaponSnapshot; match: MatchSnapshot; paused: boolean; pickups: PickupState[];
  audio: { state: string; muted: boolean; played: Record<string, number>; peak: number };
  targets: { id: string; screen: { x: number; y: number } }[];
  bots: { id: string; team: string; snapshot: Snapshot; screen: { x: number; y: number }; weapons: WeaponSnapshot }[];
}
const read = (page: Page): Promise<State> => page.evaluate(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });

for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'desktop'} expanded wings, Rail and complete 2v2`, async ({ playwright, channel }, info) => {
  test.setTimeout(240_000);
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const context = await browser.newContext(mobile ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1366, height: 768 } });
  const page = await context.newPage(), errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const cdp = await context.newCDPSession(page); let touching = false;
  const touch = async (points: { id: number; x: number; y: number }[]) => {
    if (touching) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    if (points.length) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
    touching = points.length > 0;
  };
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  const release = async () => { if (mobile) await touch([]); else { await page.mouse.up();
    for (const key of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) await page.keyboard.up(key); } };
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await click('#match-start');
    const stick = mobile ? (await page.locator('#touch-stick').boundingBox())! : null;
    const center = stick ? { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2 } : { x: 0, y: 0 };
    const walk = async (x: number, z: number) => {
      for (const [axis, target] of [['x', x], ['z', z]] as const) for (let tries = 0; tries < 8; tries++) {
        const delta = target - (await read(page)).snapshot.position[axis]; if (Math.abs(delta) < .2) break;
        const sign = Math.sign(delta), key = axis === 'x' ? sign > 0 ? 'KeyD' : 'KeyA' : sign > 0 ? 'KeyS' : 'KeyW';
        if (mobile) await touch([{ id: 1, x: center.x + (axis === 'x' ? sign * 40 : 0), y: center.y + (axis === 'z' ? sign * 40 : 0) }]);
        else await page.keyboard.down(key);
        try { await page.waitForFunction(({ axis, target, sign }) =>
          ((window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position[axis] - target) * sign > -.12,
        { axis, target, sign }, { timeout: 10_000 }); } finally { await release(); }
      }
    };
    await walk(-17, 3); await page.waitForTimeout(350);
    await page.screenshot({ path: info.outputPath('west-field.png') });
    await walk(-20, 3); await expect.poll(async () => (await read(page)).weapons.railAmmo).toBe(6);
    await click('#weapon-rail'); expect((await read(page)).weapons.selected).toBe('rail');
    await page.screenshot({ path: info.outputPath('west-rail.png') });
    await walk(-25, 3); expect((await read(page)).snapshot.surface).toBe('floor');
    await walk(-7, 3);
    await page.waitForTimeout(450); // Let the following camera settle before a precision tap.
    const shots = [];
    // Three real shots defeat the elevated practice target; no result or position writes.
    for (let i = 0; i < 6; i++) {
      await expect.poll(async () => { const s = await read(page); return s.match.tick >= (s.weapons.railReadyAt ?? 0); }).toBe(true);
      const state = await read(page), target = state.targets.find(target => target.id === 'dummy-e1')!.screen;
      expect(target.y).toBeGreaterThan(0); expect(target.y).toBeLessThan(page.viewportSize()!.height);
      if (mobile) await page.touchscreen.tap(target.x, target.y);
      else await page.mouse.click(target.x, target.y);
      await expect.poll(async () => (await read(page)).weapons.railAmmo, { intervals: [20] }).toBe(5 - i);
      shots.push((await read(page)).weapons.lastRail);
      if (i === 0) { expect((await read(page)).match.actors['dummy-e1']!.hp).toBe(80);
        await page.screenshot({ path: info.outputPath('rail-shot.png') }); }
      if (i === 2) expect((await read(page)).match.actors['dummy-e1']!.alive).toBe(false);
    }
    expect((await read(page)).weapons.selected).toBe('arc');
    await walk(-7, 10); await walk(25, 10); await walk(25, 3); await walk(20, 3);
    expect((await read(page)).weapons.railAmmo).toBe(6);
    await page.screenshot({ path: info.outputPath('east-rail.png') });
    const tour = await read(page);
    expect(tour.audio.state).toBe('running'); expect(tour.audio.peak).toBeGreaterThan(0);
    expect(tour.audio.played.rail).toBeGreaterThanOrEqual(6); expect(tour.audio.played.hit).toBeGreaterThan(0);
    expect(tour.audio.played.pickup).toBeGreaterThan(0);
    await click('#arena-menu'); await expect(page.locator('#pause')).toBeVisible();
    const pausedTick = (await read(page)).match.tick;
    await page.waitForTimeout(300); expect((await read(page)).match.tick).toBe(pausedTick);
    await click('#arena-sound'); expect((await read(page)).audio.muted).toBe(true);
    await page.screenshot({ path: info.outputPath('pause-settings.png') });
    await click('#arena-sound'); expect((await read(page)).audio.muted).toBe(false);
    await click('#resume'); expect((await read(page)).paused).toBe(false);
    // New match with actual team spawns, Rail pickup and normal player inputs.
    await page.reload(); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true'); await click('#team-start');
    await walk(-20, 3); expect((await read(page)).weapons.railAmmo).toBe(6); await click('#weapon-rail');
    let state = await read(page), railFired = false, captured = false, botRail = false; const started = Date.now();
    while ((state = await read(page)).match.phase === 'running' && Date.now() - started < 145_000) {
      railFired ||= !!state.weapons.lastRail;
      botRail ||= state.bots.some(bot => !!bot.weapons.ownsRail);
      const enemy = state.bots.filter(bot => bot.team === 'red' && state.match.actors[bot.id]!.alive)
        .sort((a, b) => Math.hypot(a.snapshot.position.x - state.snapshot.position.x, a.snapshot.position.z - state.snapshot.position.z)
          - Math.hypot(b.snapshot.position.x - state.snapshot.position.x, b.snapshot.position.z - state.snapshot.position.z))[0];
      if (!enemy || !state.match.actors.player!.alive) { await release(); await page.waitForTimeout(150); continue; }
      const dx = enemy.snapshot.position.x - state.snapshot.position.x, dz = enemy.snapshot.position.z - state.snapshot.position.z;
      const move = Math.hypot(dx, dz) > (state.weapons.selected === 'rail' ? 11 : 3.5);
      const sx = move && Math.abs(dx) > .4 ? Math.sign(dx) : 0, sz = move && Math.abs(dz) > .4 ? Math.sign(dz) : 0;
      const viewport = page.viewportSize()!, aim = { x: Math.max(310, Math.min(viewport.width - 250, enemy.screen.x)),
        y: Math.max(100, Math.min(viewport.height - 130, enemy.screen.y)) };
      if (mobile) await touch([{ id: 2, ...aim }, ...(move ? [{ id: 1, x: center.x + sx * 35, y: center.y + sz * 35 }] : [])]);
      else { for (const [key, held] of [['KeyA', sx < 0], ['KeyD', sx > 0], ['KeyW', sz < 0], ['KeyS', sz > 0]] as const)
        if (held) await page.keyboard.down(key); else await page.keyboard.up(key);
        await page.mouse.move(aim.x, aim.y); await page.mouse.down(); }
      if (railFired && !captured) { await page.screenshot({ path: info.outputPath('team-combat.png') }); captured = true; }
      await page.waitForTimeout(160);
    }
    await release(); expect(state.match.phase).toBe('ended'); expect(railFired).toBe(true); expect(botRail).toBe(true);
    expect(state.audio.played.result).toBe(1);
    await page.screenshot({ path: info.outputPath('team-result.png') });
    const result = state.match; await click('#result-restart'); state = await read(page);
    expect(state.match.scores).toEqual({ blue: 0, red: 0 }); expect(state.weapons.ownsRail).toBe(false);
    expect(state.bots.every(bot => !bot.weapons.ownsRail && !bot.weapons.lastRail)).toBe(true);
    expect(errors).toEqual([]);
    await info.attach('arena-expansion', { body: JSON.stringify({ mobile, shots, tour, result, audio: state.audio, restarted: state.match, railFired, botRail, errors }), contentType: 'application/json' });
  } catch (error) {
    await page.screenshot({ path: info.outputPath('failure.png') });
    await info.attach('failure-state', { body: JSON.stringify(await read(page)), contentType: 'application/json' });
    throw error;
  } finally { await browser.close(); }
});

test('Adventure retains its two weapons and mission state', async ({ page }) => {
  await page.goto('./?mode=pve&level=stone&adventure=1'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#weapon-rail')).toHaveCount(0);
  await page.keyboard.press('Digit3');
  const weapons = await page.evaluate(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read().weapons);
  expect(weapons.selected).toBe('arc'); expect(weapons.ownsRail).toBeUndefined();
});
