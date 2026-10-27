import { test, expect, type Page } from '@playwright/test';
import type { PveSnapshot } from '../../src/core/pve';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';

interface State { level: string; pve: PveSnapshot; snapshot: Snapshot; weapons: WeaponSnapshot; monsterScreen: { x: number; y: number } }
const read = (page: Page): Promise<State> => page.evaluate(() => (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false });

test('three real boss victories progress through the complete mini campaign', async ({ page, browser }, info) => {
  test.setTimeout(150_000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const victories: State[] = [];
  await page.goto('./?mode=pve');
  for (const level of ['stone', 'frost', 'ember']) {
    await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await expect.poll(async () => (await read(page)).level).toBe(level);
    await expect(page.locator('#pve-next')).toBeHidden();
    await expect.poll(async () => (await read(page)).pve.phase, { intervals: [20] }).toBe('chasing');
    let state = await read(page); await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.mouse.down();
    const fireUntil = Date.now() + 1000;
    while (Date.now() < fireUntil) { state = await read(page); await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y); await page.waitForTimeout(40); }
    await page.keyboard.down('KeyA');
    await expect.poll(async () => (await read(page)).snapshot.position.x, { intervals: [20] }).toBeLessThan(-4);
    await page.keyboard.up('KeyA'); await page.keyboard.down('KeyW');
    await expect.poll(async () => (await read(page)).snapshot.position.z, { intervals: [20] }).toBeLessThan(7.3);
    await page.keyboard.up('KeyW');
    const deadline = Date.now() + 35_000; let jumped = -1, dodged = -1, captured = false;
    state = await read(page);
    while (state.pve.outcome === 'running' && Date.now() < deadline) {
      await page.mouse.move(state.monsterScreen.x, state.monsterScreen.y);
      const phaseId = state.pve.tick - state.pve.phaseTick;
      const distance = Math.hypot(state.snapshot.position.x - state.pve.center.x, state.snapshot.position.z - state.pve.center.z);
      if (state.pve.phase === 'warning' && !captured) {
        await page.screenshot({ path: info.outputPath(`${level}.png`) }); captured = true;
      }
      if (level !== 'ember' && state.pve.kind === 'wave' && state.pve.phase === 'attack' && state.pve.waveRadius >= distance - 2.5 && jumped !== phaseId) {
        await page.keyboard.press('Space'); jumped = phaseId;
      }
      if (state.pve.phase === 'warning' && dodged !== phaseId && (state.pve.kind === 'eruption' || level === 'ember')) {
        const key = state.snapshot.position.x > 5 ? 'KeyA' : 'KeyD';
        const startX = state.snapshot.position.x; await page.keyboard.down(key);
        await page.waitForFunction(x => { const s = (window as unknown as { __coreArena: { read(): State } }).__coreArena.read();
          return s.pve.outcome !== 'running' || Math.abs(s.snapshot.position.x - x) > 4.4; }, startX);
        await page.keyboard.up(key); dodged = phaseId;
      }
      await page.waitForTimeout(40); state = await read(page);
    }
    await page.mouse.up(); expect(state.pve.outcome, `${level}: ${JSON.stringify(state.pve)}`).toBe('victory');
    victories.push(state); await expect(page.locator('#pve-next')).toBeVisible();
    if (level === 'ember') {
      await expect(page.locator('#result-title')).toHaveText('Der Kern ist still.');
      await page.screenshot({ path: info.outputPath('campaign-complete.png') });
    }
    await page.locator('#pve-next').click();
    const next = level === 'stone' ? 'frost' : level === 'frost' ? 'ember' : 'stone';
    await expect(page).toHaveURL(new RegExp(`level=${next}`));
    await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
  }
  await expect.poll(async () => (await read(page)).level).toBe('stone');
  expect((await read(page)).pve.bossHp).toBe(600); expect((await read(page)).pve.hp).toBe(100);
  expect(errors).toEqual([]);
  await info.attach('campaign-playthrough', { body: JSON.stringify({ browser: browser.version(), victories, errors }), contentType: 'application/json' });
});
