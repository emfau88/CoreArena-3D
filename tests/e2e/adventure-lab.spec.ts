import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { PveSnapshot } from '../../src/core/pve';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { installAdventureLab } from '../../src/app/adventureLab';

type Lab = ReturnType<ReturnType<typeof installAdventureLab>['read']>;
interface State {
  mode:string; combatProfile:string; lab:Lab; snapshot:Snapshot; pve:PveSnapshot; weapons:WeaponSnapshot;
  monsterScreen:{x:number;y:number}; paused:boolean; feedback:{voices:number}; arcVisual:{visible?:boolean};
  prototype:{whip:{sequence:number}}|null;
}
const read = (page: Page): Promise<State> => page.evaluate(() => (window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const url = './?mode=pve&level=stone&adventure=1&lab=boss&combat=';
test.use({ headless: false, trace: 'off', actionTimeout: 10_000 });

test('lab profiles, twenty warm resets, held-input/effect cleanup and local export', async ({ page }, info) => {
  test.setTimeout(100_000);
  const errors:string[]=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto(url+'prototype'); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const initial = await read(page);
  const cdp = await page.context().newCDPSession(page), listenerCounts:number[]=[], beforeGc:number[]=[];
  expect(initial.combatProfile).toBe('prototype'); expect(initial.lab.running).toBe(false);
  expect(initial.snapshot.tick).toBe(0); expect(initial.pve.phaseTick).toBe(0);
  await page.waitForTimeout(200); expect((await read(page)).snapshot.tick).toBe(0);
  const results:unknown[]=[], resources:unknown[]=[];const starts=new Map<string,unknown>();
  for (const profile of ['legacy','prototype']) for (let i=0;i<10;i++) {
    await page.selectOption('#lab-profile', profile);
    await page.keyboard.down('KeyS'); await page.keyboard.down('Space');
    const started=Date.now(); await page.locator('#lab-start').click();
    await expect.poll(async()=>(await read(page)).combatProfile).toBe(profile);
    const s=await read(page);
    if(starts.has(profile))expect(s.lab.current!.start).toEqual(starts.get(profile));else starts.set(profile,s.lab.current!.start);
    expect(s.lab.restartMs).toBeLessThan(3000); expect(Date.now()-started).toBeLessThan(3000);
    expect(s.pve.bossHp).toBe(profile==='prototype'?900:600); expect(s.weapons.ammo).toBe(profile==='prototype'?0:54);
    expect(s.weapons.lastArc).toBeNull(); expect(s.weapons.projectiles).toHaveLength(0);
    // Fresh .06 m spawn settles onto the floor and legitimately plays a short landing cue.
    await page.waitForTimeout(300); const still=await read(page);
    expect(Math.abs(still.snapshot.position.x)).toBeLessThan(.01);
    expect(still.snapshot.position.y).toBeLessThan(.1);
    expect(still.feedback.voices).toBe(0);
    results.push({profile, attempt:i+1, setupMs:s.lab.restartMs, browserReadyMs:Date.now()-started});
    if(i>=2)resources.push({...still.lab.resources as object,profile});
    beforeGc.push((await cdp.send('Memory.getDOMCounters')).jsEventListeners);
    // DOMCounters also counts garbage awaiting collection (including automation callbacks).
    // Force collection only in this resource test, never in baseline/performance runs.
    await cdp.send('HeapProfiler.collectGarbage');
    listenerCounts.push((await cdp.send('Memory.getDOMCounters')).jsEventListeners);
    await page.keyboard.up('KeyS'); await page.keyboard.up('Space');
    // Dirty the real weapon/audio state so the next reset proves cleanup.
    await page.mouse.click(still.monsterScreen.x,still.monsterScreen.y);
    if(profile==='legacy')await expect.poll(async()=>(await read(page)).weapons.lastArc).not.toBeNull();
    else await expect.poll(async()=>(await read(page)).prototype!.whip.sequence).toBe(1);
  }
  const stable=resources as {profile:string;objects:number;geometries:number;textures:number;programs:number;audioVoices:number}[];
  await info.attach('reset-observations',{body:JSON.stringify({results,resources:stable,listenerCounts,beforeGc}),contentType:'application/json'});
  expect(new Set(stable.map(r=>r.objects)).size).toBe(1);
  for(const profile of ['legacy','prototype'])expect(new Set(stable.filter(r=>r.profile===profile).map(r=>r.geometries)).size).toBe(1);
  expect(new Set(stable.map(r=>r.textures)).size).toBe(1);
  expect(stable.at(-1)!.programs).toBeLessThanOrEqual(stable[0]!.programs+3);
  expect(new Set(listenerCounts).size).toBe(1);
  await page.selectOption('#lab-profile','legacy');await page.selectOption('#lab-weapon','pulse');
  expect((await read(page)).lab.current!.weapon).toBe('energy-whip');
  await page.locator('#lab-start').click(); expect((await read(page)).weapons.selected).toBe('pulse');
  await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().pve.phase!=='emerging');
  const target=(await read(page)).monsterScreen; await page.mouse.click(target.x,target.y);
  await expect.poll(async()=>(await read(page)).weapons.ammo).toBeLessThan(54);
  await page.locator('#pve-restart').click();
  expect((await read(page)).weapons.projectiles).toHaveLength(0);
  expect((await read(page)).weapons.ammo).toBe(54);
  const download=page.waitForEvent('download'); await page.locator('#lab-export').click();
  await (await download).saveAs(info.outputPath('lab-export.json'));
  await page.screenshot({path:info.outputPath('lab.png')});
  await info.attach('reset-results',{body:JSON.stringify({results,resources:stable,listenerCounts,beforeGc,environment:(await read(page)).lab.environment,errors}),contentType:'application/json'});
  expect(errors).toEqual([]);
});

test('twelve legacy baseline attempts: three stationary and reactive runs per weapon', async ({ page }, info) => {
  test.setTimeout(480_000);
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'legacy'); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const records:unknown[]=[];
  for (const weapon of ['arc','pulse']) for (const active of [false,true]) for(let attempt=1;attempt<=3;attempt++) {
    await page.selectOption('#lab-weapon',weapon); await page.locator('#lab-start').click();
    await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().pve.phase!=='emerging');
    let firing=false;
    const deadline=Date.now()+60_000;
    while(Date.now()<deadline) {
      const s=await read(page); if(s.pve.outcome!=='running')break;
      const b=s.pve,p=s.snapshot.position,distance=Math.hypot(p.x-b.center.x,p.z-b.center.z);
      const eruption=active&&b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')&&Math.hypot(p.x-b.target.x,p.z-b.target.z)<3.8;
      const x=eruption?(b.target.x>0?-1:1):0;
      for(const [key,direction] of [['KeyS',1],['KeyW',-1]] as const) {
        if(x===direction)await page.keyboard.down(key);else await page.keyboard.up(key);
      }
      const leap=active&&s.snapshot.grounded&&(b.phase==='melee'&&b.phaseTick<12||b.kind==='wave'&&(
        b.phase==='warning'&&b.phaseTick>=84&&distance<5||b.phase==='attack'&&distance>b.waveRadius&&distance-b.waveRadius<2.8));
      if(leap)await page.keyboard.press('Space');
      await page.mouse.move(s.monsterScreen.x,s.monsterScreen.y);
      if(!firing){await page.mouse.down();firing=true;}
      await page.waitForTimeout(40);
    }
    await page.mouse.up(); await page.keyboard.up('KeyS'); await page.keyboard.up('KeyW');
    const result=await read(page);
    expect(result.pve.outcome).not.toBe('running');
    expect(result.lab.current!.activeStartTick).toBe(120);
    expect(result.lab.current!.outcome).toBe(result.pve.outcome);
    records.push({weapon,strategy:active?'reactive':'stationary',attempt,measurement:result.lab});
    await info.attach(`${weapon}-${active?'reactive':'stationary'}-${attempt}`,{body:JSON.stringify(records.at(-1)),contentType:'application/json'});
    if(attempt===1)await page.screenshot({path:info.outputPath(`${weapon}-${active?'reactive':'stationary'}.png`)});
  }
  await info.attach('baseline',{body:JSON.stringify({records,errors}),contentType:'application/json'});
  expect(errors).toEqual([]);
});
