import { test, expect, type Page } from '@playwright/test';
import type { MatchSnapshot } from '../../src/core/match';
import type { Snapshot } from '../../src/core/types';
import type { BotDecision } from '../../src/core/bot';
import type { WeaponSnapshot } from '../../src/core/combat';

interface State {
  arenaMode: string; snapshot: Snapshot; match: MatchSnapshot; weapons: WeaponSnapshot; paused: boolean;
  bots: { id: string; team: string; snapshot: Snapshot; decision: BotDecision | null;
    screen: { x: number; y: number }; weapons: WeaponSnapshot }[];
}
const read = (page: Page): Promise<State> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
// Full GLB-loaded sessions can overflow Chromium's trace blob stream on teardown.
// Keep explicit screenshots, state samples and errors instead of recording a trace.
test.use({ headless: false, trace: 'off' });

test('before: published Arena menu and 1v1 presentation', async ({ page }, info) => {
  test.skip(process.env.ARENA_CAPTURE_BEFORE !== '1', 'Optional live reference capture, not a local regression gate');
  await page.goto('https://emfau88.github.io/CoreArena-3D/');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.screenshot({ path: info.outputPath('before-menu.png') });
  await page.getByRole('button', { name: 'Botmatch starten', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: info.outputPath('before-duel.png') });
});

for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'desktop'} 2v2 full match, respawns and restart`, async ({ browser }, info) => {
  test.setTimeout(180_000);
  const context = await browser.newContext(mobile
    ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1366, height: 768 } });
  const page = await context.newPage(); const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  let touching = false;
  const touch = async (type: 'touchStart' | 'touchEnd', touchPoints: { id: number; x: number; y: number }[]) => {
    if (type === 'touchEnd' && !touching) return;
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    touching = touchPoints.length > 0;
  };
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  const keys = ['KeyA', 'KeyD', 'KeyW', 'KeyS'];
  const release = async () => {
    if (mobile) await touch('touchEnd', []);
    else { await page.mouse.up(); for (const key of keys) await page.keyboard.up(key); }
  };
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.screenshot({ path: info.outputPath('menu.png') });
    await click('#team-start');
    let state = await read(page);
    expect(state.arenaMode).toBe('teams'); expect(Object.keys(state.match.actors)).toHaveLength(4);
    expect(state.bots.map(bot => bot.team).sort()).toEqual(['blue', 'red', 'red']);
    await expect(page.locator('#team-status')).toContainText('VERBÜNDETER');
    await page.screenshot({ path: info.outputPath('teams.png') });
    // Observe genuine combat and independent life cycles before the active playthrough.
    await expect.poll(async () => Math.max(...Object.values((await read(page)).match.actors).map(actor => actor.life)),
      { timeout: 25_000, intervals: [100] }).toBeGreaterThan(1);
    const respawn = await read(page);
    expect(respawn.match.scores.blue + respawn.match.scores.red).toBeGreaterThan(0);
    await click('#arena-menu'); await click('#match-restart');
    state = await read(page);
    expect(state.match.scores).toEqual({ blue: 0, red: 0 });
    expect(state.bots.every(bot => bot.weapons.projectiles.length === 0 && !bot.weapons.ownsPulse)).toBe(true);
    const stick = mobile ? (await page.locator('#touch-stick').boundingBox())! : null;
    const center = stick ? { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2 } : { x: 0, y: 0 };
    // Walk over the existing Pulse pickup with real keyboard/joystick input.
    // The expanded team's west spawn starts farther from the original pickup.
    if (mobile) await touch('touchStart', [{ id: 1, x: center.x + 42, y: center.y }]);
    else await page.keyboard.down('KeyD');
    await expect.poll(async () => (await read(page)).snapshot.position.x, { intervals: [20] }).toBeGreaterThan(-7.3);
    await release();
    if (mobile) await touch('touchStart', [{ id: 1, x: center.x, y: center.y + 42 }]);
    else await page.keyboard.down('KeyS');
    await page.waitForFunction(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read().snapshot.position.z >= 3.9);
    await release();
    await expect.poll(async () => (await read(page)).weapons.ownsPulse, { intervals: [50], timeout: 13_000 }).toBe(true);
    await click('#weapon-pulse');
    const samples: unknown[] = []; let usedPulse = false; let usedArc = false; let captured = false;
    const started = Date.now(); let previousSample = -1;
    while ((state = await read(page)).match.phase === 'running' && Date.now() - started < 135_000) {
      for (const bot of state.bots) if (bot.decision?.targetId)
        expect(state.match.actors[bot.decision.targetId]!.team).not.toBe(bot.team);
      usedPulse ||= state.weapons.ownsPulse && state.weapons.ammo < 54;
      usedArc ||= !!state.weapons.lastArc;
      const elapsed = Math.floor(state.match.tick / 60);
      if (elapsed >= previousSample + 5) { samples.push({ seconds: elapsed, match: state.match, bots: state.bots.map(bot =>
        ({ id: bot.id, position: bot.snapshot.position, target: bot.decision?.targetId })) }); previousSample = elapsed; }
      const target = state.bots.filter(bot => bot.team === 'red' && state.match.actors[bot.id]!.alive)
        .sort((a, b) => Math.hypot(a.snapshot.position.x - state.snapshot.position.x, a.snapshot.position.z - state.snapshot.position.z)
          - Math.hypot(b.snapshot.position.x - state.snapshot.position.x, b.snapshot.position.z - state.snapshot.position.z))[0];
      if (!target || !state.match.actors.player!.alive) { await release(); await page.waitForTimeout(150); continue; }
      // Pulse first, then close in with Auto-Arc. No HP, ammo, clock or position writes.
      if (state.match.tick > 360 && state.weapons.selected !== 'arc') { await release(); await click('#weapon-arc'); }
      const dx = target.snapshot.position.x - state.snapshot.position.x;
      const dz = target.snapshot.position.z - state.snapshot.position.z;
      const move = Math.hypot(dx, dz) > (state.weapons.selected === 'pulse' ? 7 : 3.5);
      const sx = move && Math.abs(dx) > 0.4 ? Math.sign(dx) : 0;
      const sz = move && Math.abs(dz) > 0.4 ? Math.sign(dz) : 0;
      const viewport = page.viewportSize()!;
      const aim = { x: Math.max(300, Math.min(viewport.width - 260, target.screen.x)),
        y: Math.max(110, Math.min(viewport.height - 135, target.screen.y)) };
      if (mobile) {
        await touch('touchEnd', []);
        const points = [{ id: 2, ...aim }, ...(move ? [{ id: 1, x: center.x + sx * 35, y: center.y + sz * 35 }] : [])];
        await touch('touchStart', points);
      } else {
        for (const [key, pressed] of [['KeyA', sx < 0], ['KeyD', sx > 0], ['KeyW', sz < 0], ['KeyS', sz > 0]] as const)
          if (pressed) await page.keyboard.down(key); else await page.keyboard.up(key);
        await page.mouse.move(aim.x, aim.y); await page.mouse.down();
      }
      if (!captured && state.match.tick > 400) {
        await page.screenshot({ path: info.outputPath('combat.png') }); captured = true;
      }
      await page.waitForTimeout(160);
    }
    await release();
    expect(state.match.phase).toBe('ended'); expect(state.match.scores.blue).toBeGreaterThan(0);
    expect(usedPulse).toBe(true); expect(usedArc).toBe(true);
    await expect(page.locator('#match-result')).toBeVisible();
    await page.screenshot({ path: info.outputPath('result.png') });
    const result = state.match; await page.waitForTimeout(250);
    expect((await read(page)).match).toEqual(result);
    await click('#result-restart'); const restarted = await read(page);
    expect(restarted.match.phase).toBe('running'); expect(restarted.match.scores).toEqual({ blue: 0, red: 0 });
    expect(Object.values(restarted.match.actors).every(actor => actor.life === 1)).toBe(true);
    expect(restarted.bots.every(bot => !bot.weapons.ownsPulse && bot.weapons.projectiles.length === 0)).toBe(true);
    await info.attach('team-match-report', { body: JSON.stringify({ mobile, respawn, result, restarted, usedArc, usedPulse, samples, errors }), contentType: 'application/json' });
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

test('Adventure stays a separate mode with its existing mission HUD', async ({ page }) => {
  await page.goto('./?mode=pve&level=stone&adventure=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#team-start')).toHaveCount(0);
  expect(await page.locator('#app').getAttribute('data-arena')).toBeNull();
  await expect(page.locator('#app')).toHaveAttribute('data-adventure', 'true');
});
