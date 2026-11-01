import { test, expect, type Page } from '@playwright/test';
import type { MatchSnapshot } from '../../src/core/match';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';

interface State { paused: boolean; match: MatchSnapshot; snapshot: Snapshot; weapons: WeaponSnapshot; camera: string; arenaMode: string; difficulty: string }
const read = (page: Page): Promise<State> => page.evaluate(() =>
  (window as unknown as { __coreArena: { read(): State } }).__coreArena.read());
test.use({ headless: false, trace: 'off' });

for (const mobile of [false, true]) test(`AP2 ${mobile ? 'touch' : 'desktop'} lobby, HUD, pause and separate entry`, async ({ playwright, channel }, info) => {
  test.setTimeout(65_000);
  const browser = await playwright.chromium.launch({ channel, headless: false });
  const viewport = mobile ? { width: 667, height: 375 } : { width: 1366, height: 768 };
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await context.newPage(), errors: string[] = [], failed: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  const click = (id: string) => mobile ? page.locator(id).tap() : page.locator(id).click();
  const reachable = async (ids: string[]) => {
    for (const id of ids) {
      const b = await page.locator(`#${id}`).evaluate(el => {
        const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height, visible:!!hit && el.contains(hit), vw:innerWidth, vh:innerHeight };
      });
      expect(b.x >= 0 && b.y >= 0 && b.right <= b.vw && b.bottom <= b.vh && b.width >= 40 && b.height >= 40 && b.visible, `${id}: ${JSON.stringify(b)}`).toBe(true);
    }
  };
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready', 'true');
    await reachable(['team-start', 'bot-start', 'match-start', 'bot-difficulty', 'adventure-start']);
    await expect(page.locator('.arena-map-preview svg')).toBeVisible();
    if (mobile) await expect(page.locator('#touch-stick')).toBeHidden();
    const lobby = await page.locator('#arena-lobby').evaluate(el => ({ scroll:el.scrollHeight, client:el.clientHeight }));
    await page.screenshot({ path:info.outputPath('lobby.png') });
    await page.locator('#bot-difficulty').selectOption('easy');
    if (mobile) await click('#team-start');
    else { await page.locator('#team-start').focus(); await page.keyboard.press('Space'); }
    await expect(page.locator('#arena-lobby')).toBeHidden();
    expect((await read(page)).arenaMode).toBe('teams'); expect((await read(page)).difficulty).toBe('easy');
    await reachable(['weapon-arc','arena-menu', ...(mobile ? ['touch-sprint','touch-jump'] : [])]);
    const panels = await page.locator('#weapon-panel, #match-panel, #life-panel, #arena-menu' + (mobile ? ', #touch-stick, #touch-actions' : '')).evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect(); return { id:el.id, x:r.x,y:r.y,right:r.right,bottom:r.bottom };
    }));
    for (let i=0;i<panels.length;i++) for(let j=i+1;j<panels.length;j++) {
      const a=panels[i]!,b=panels[j]!;
      expect(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y, `${a.id} overlaps ${b.id}`).toBe(true);
    }
    await expect(page.locator('#match-mode')).toHaveText('2v2 · ZIEL 10');
    await expect(page.locator('#team-status')).toContainText('VERBÜNDETER');
    await page.screenshot({ path:info.outputPath('hud.png') });
    await click('#arena-menu');
    const frozen=(await read(page)).match.tick; await page.waitForTimeout(250); expect((await read(page)).match.tick).toBe(frozen);
    await reachable(['resume','match-restart','arena-home','camera-toggle','arena-sound','bot-difficulty']);
    await page.screenshot({ path:info.outputPath('pause.png') });
    const camera=(await read(page)).camera; await click('#camera-toggle'); expect((await read(page)).camera).not.toBe(camera);
    await click('#camera-toggle');
    if(mobile) {
      await page.setViewportSize({width:375,height:667}); await expect(page.locator('#rotate-device')).toBeVisible();
      await page.waitForTimeout(250); expect((await read(page)).match.tick).toBe(frozen);
      await page.setViewportSize(viewport); await expect(page.locator('#pause')).toBeVisible();
      await click('#resume');
      await page.setViewportSize({width:375,height:667}); await expect(page.locator('#rotate-device')).toBeVisible();
      const rotated=(await read(page)).match.tick; await page.waitForTimeout(200); expect((await read(page)).match.tick).toBe(rotated);
      await page.setViewportSize({width:844,height:390}); await expect(page.locator('#pause')).toBeHidden();
      await reachable(['weapon-arc','arena-menu','touch-sprint','touch-jump']);
      await page.screenshot({path:info.outputPath('wide-touch.png')}); await page.setViewportSize(viewport);
    } else {
      await page.locator('#resume').focus(); await page.keyboard.press('Space'); await expect(page.locator('#pause')).toBeHidden();
      await page.keyboard.press('Escape'); await expect(page.locator('#pause')).toBeVisible();
      await page.locator('#resume').focus(); await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(()=>document.activeElement?.id)).toBe('bot-difficulty');
      await page.keyboard.press('Escape');
    }
    await click('#arena-menu'); await click('#arena-home'); await expect(page.locator('#arena-lobby')).toBeVisible();
    await click('#bot-start'); expect((await read(page)).arenaMode).toBe('duel');
    await expect(page.locator('#team-status')).toBeHidden();
    await click('#arena-menu'); await click('#arena-home'); await expect(page.locator('#arena-lobby')).toBeVisible();
    await click('#adventure-start'); await expect(page.locator('#app')).toHaveAttribute('data-adventure','true');
    expect(new URL(page.url()).searchParams.get('adventure')).toBe('1');
    await expect(page.locator('#arena-lobby')).toHaveCount(0);
    await page.screenshot({path:info.outputPath('adventure-separate.png')});
    expect(errors).toEqual([]); expect(failed).toEqual([]);
    await info.attach('AP2-ui-report',{body:JSON.stringify({mobile,viewport,lobby,panels,errors,failed}),contentType:'application/json'});
  } catch(error) { await page.screenshot({path:info.outputPath('failure.png')}); throw error; }
  finally { await browser.close(); }
});
