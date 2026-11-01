import { test, expect, type Page } from '@playwright/test';
import type { MatchSnapshot } from '../../src/core/match';
import type { Vec3 } from '../../src/core/types';

interface State {
  match: MatchSnapshot; playerVisible: boolean; snapshot: { position: Vec3 };
  deathEffects: { emitted: number; capacity: number; piecesPerBurst: number;
    active: { id: string; life: number; team: string; age: number; position: Vec3 }[] };
}
const read = (page: Page): Promise<State> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });

for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'desktop'} death burst, pause, respawn and reset`, async ({ playwright, channel }, info) => {
  test.setTimeout(65_000);
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const context = await browser.newContext({ viewport: mobile ? { width: 667, height: 375 } : { width: 1366, height: 768 }, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await context.newPage(), errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await page.locator('#bot-difficulty').selectOption('easy'); await click('#bot-start');
    // Let the actual enemy kill us, then inspect the live visual without state writes.
    await expect.poll(async () => (await read(page)).match.actors.player!.alive, { intervals: [16], timeout: 25_000 }).toBe(false);
    await page.waitForTimeout(250);
    const dead = await read(page), burst = dead.deathEffects.active.find(effect => effect.id === 'player')!;
    expect(burst.team).toBe('blue'); expect(burst.life).toBe(1);
    expect(Math.hypot(burst.position.x - dead.snapshot.position.x, burst.position.z - dead.snapshot.position.z)).toBeLessThan(.1);
    expect(dead.playerVisible).toBe(false); expect(dead.deathEffects.emitted).toBe(1);
    await page.screenshot({ path: info.outputPath('player-confetti.png') });
    await click('#arena-menu'); const paused = (await read(page)).deathEffects;
    await page.waitForTimeout(250); expect((await read(page)).deathEffects).toEqual(paused);
    await click('#resume');
    await expect.poll(async () => (await read(page)).deathEffects.active.length, { intervals: [30] }).toBe(0);
    expect((await read(page)).deathEffects.emitted).toBe(1);
    await expect.poll(async () => (await read(page)).match.actors.player!.life).toBe(2);
    await expect.poll(async () => (await read(page)).playerVisible).toBe(true);
    await page.screenshot({ path: info.outputPath('respawn.png') });
    await click('#arena-menu'); await click('#match-restart');
    expect((await read(page)).deathEffects).toMatchObject({ emitted: 0, active: [] });
    // Auto-Arc acquires the approaching rival through normal fire input.
    const viewport = page.viewportSize()!, aim = { x: viewport.width * .53, y: viewport.height * .5 };
    const cdp = await context.newCDPSession(page);
    if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, ...aim }] });
    else { await page.mouse.move(aim.x, aim.y); await page.mouse.down(); }
    try { await expect.poll(async () => (await read(page)).match.actors.rival!.alive, { intervals: [16], timeout: 18_000 }).toBe(false); }
    finally { if (mobile) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.mouse.up(); }
    await page.waitForTimeout(250);
    const rival = await read(page);
    expect(rival.deathEffects.active.some(effect => effect.id === 'rival' && effect.team === 'red')).toBe(true);
    expect(rival.match.scores.blue).toBe(1);
    await page.screenshot({ path: info.outputPath('rival-confetti.png') });
    // Restart during the burst: no particles may carry into the next round.
    await click('#arena-menu'); await click('#match-restart');
    expect((await read(page)).deathEffects).toMatchObject({ emitted: 0, active: [] });
    await expect.poll(async () => (await read(page)).playerVisible).toBe(true);
    expect(errors).toEqual([]);
    await info.attach('death-playthrough', { body: JSON.stringify({ mobile, dead, rival, reset: await read(page), errors }), contentType: 'application/json' });
  } catch (error) { await page.screenshot({ path: info.outputPath('failure.png') }); throw error; }
  finally { await browser.close(); }
});

test('team bots emit bounded bursts and Adventure keeps its separate presentation', async ({ page }, info) => {
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await page.locator('#bot-difficulty').selectOption('hard'); await page.locator('#team-start').click();
  await expect.poll(async () => (await read(page)).deathEffects.active.some(effect => effect.id !== 'player'),
    { intervals: [30], timeout: 30_000 }).toBe(true);
  const state = await read(page);
  expect(state.deathEffects.active.length).toBeLessThanOrEqual(4);
  expect(state.deathEffects.active.every(effect => !state.match.actors[effect.id]!.alive)).toBe(true);
  await info.attach('team-death', { body: JSON.stringify(state.deathEffects), contentType: 'application/json' });
  await page.goto('./?mode=pve&level=stone&adventure=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#app')).toHaveAttribute('data-adventure', 'true');
  expect((await read(page)).deathEffects).toBeUndefined();
});
