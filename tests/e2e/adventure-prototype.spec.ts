import {defeatT2,worldKeyT2} from './adventureT2Controls';
import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import type {AdventurePrototype} from '../../src/app/adventurePrototype';
import type {Snapshot} from '../../src/core/types';
import type {PveSnapshot} from '../../src/core/pve';
type Prototype=ReturnType<AdventurePrototype['snapshot']>&{targetScreens:{x:number;y:number}[]};
interface State {prototype:Prototype;snapshot:Snapshot;pve:PveSnapshot;paused:boolean;camera:string;combatRules:string;
  lab:{current:unknown;resources:unknown;restartMs:number;environment:unknown};playerScreen:{x:number;y:number};monsterScreen:{x:number;y:number};feedback:{muted:boolean;played:number;voices:number}}
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const url='./?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype';
test.use({headless:false,trace:'off'});

test('prototype real input: directed whip, return, miss, dash cancel, held keys, pause, mute and practice reset',async({page},info)=>{
  test.setTimeout(90_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();await page.waitForTimeout(600);
  expect((await read(page)).combatRules).toBe('prototype-a7');expect((await read(page)).camera).toBe('side');
  const target=(await read(page)).prototype.targetScreens[0]!;
  await page.mouse.click(target.x,target.y);await page.waitForTimeout(750);
  let state=await read(page);expect(state.prototype.whip.forwardHits).toBeGreaterThan(0);expect(state.prototype.whip.returnHits).toBeGreaterThan(0);
  const hits=state.prototype.whip.forwardHits+state.prototype.whip.returnHits;
  // Aim away from every dummy. Holding mouse produces one explicitly triggered swing.
  await page.mouse.move(state.playerScreen.x-160,state.playerScreen.y);await page.mouse.down();await page.waitForTimeout(1500);await page.mouse.up();
  state=await read(page);expect(state.prototype.whip.sequence).toBe(2);
  expect(state.prototype.whip.forwardHits+state.prototype.whip.returnHits).toBe(hits);expect(state.prototype.whip.misses).toBeGreaterThanOrEqual(2);
  const before=state.snapshot.position;
  await page.mouse.move(state.playerScreen.x+250,state.playerScreen.y);await page.keyboard.down('ShiftLeft');await page.waitForTimeout(1200);await page.keyboard.up('ShiftLeft');
  state=await read(page);expect(state.prototype.dash.uses).toBe(1);expect(state.prototype.dash.invulnerable).toBe(false);
  expect(Math.hypot(state.snapshot.position.x-before.x,state.snapshot.position.z-before.z)).toBeCloseTo(3,1);
  await page.keyboard.press('KeyV');expect((await read(page)).camera).toBe('side');
  await page.locator('#lab-start').click();await page.waitForTimeout(300);
  const aim=(await read(page)).prototype.targetScreens[0]!;
  await page.mouse.click(aim.x,aim.y);
  await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().prototype.whip.phase==='windup');
  await page.keyboard.press('ShiftLeft');await page.waitForTimeout(700);
  state=await read(page);expect(state.prototype.whip.cancelled).toBe(1);expect(state.prototype.whip.returnHits).toBe(0);
  await page.locator('#lab-start').click();await page.waitForTimeout(300);
  await page.locator('#stone-sound').click();await page.locator('#lab-reduced').check();
  state=await read(page);const played=state.feedback.played;
  const p=state.prototype.targetScreens[0]!;await page.mouse.click(p.x,p.y);
  await page.waitForTimeout(180);await page.screenshot({path:info.outputPath('whip-forward.jpg'),quality:75});
  await page.waitForTimeout(200);await page.screenshot({path:info.outputPath('whip-return.jpg'),quality:75});
  await page.waitForTimeout(400);state=await read(page);
  expect(state.feedback.muted).toBe(true);expect(state.feedback.played).toBe(played);expect(state.prototype.whip.forwardHits).toBeGreaterThan(0);
  await page.locator('#pve-pause').click();const tick=(await read(page)).snapshot.tick;await page.waitForTimeout(250);
  expect((await read(page)).snapshot.tick).toBe(tick);await page.locator('#resume').click();
  await info.attach('prototype-input',{body:JSON.stringify({state,errors}),contentType:'application/json'});expect(errors).toEqual([]);
});

test('prototype boss combat and camera remain readable during real movement, attacks and restart',async({page},info)=>{
  test.setTimeout(90_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');await page.locator('#lab-start').click();
  await page.waitForTimeout(2500);
  for(const mode of ['side','straight','isometric'] as const){
    const png=await page.evaluate(mode=>(window as unknown as {__coreArena:{combatView(mode:string):string}}).__coreArena.combatView(mode),mode);
    writeFileSync(info.outputPath(`camera-${mode}.jpg`),Buffer.from(png.split(',')[1]!,'base64'));
  }
  const snapshots:State[]=[];
  for(let i=0;i<10;i++){
    const state=await read(page);if(state.pve.outcome!=='running')break;
    const boss=state.monsterScreen;await page.mouse.click(boss.x,boss.y);
    if(i%3===0)await page.keyboard.press('Space');
    await page.waitForTimeout(750);snapshots.push(await read(page));
  }
  expect(snapshots.some(s=>s.pve.bossHp<900)).toBe(true);
  const state=await read(page);expect(state.prototype.whip.sequence).toBeGreaterThan(0);
  await page.screenshot({path:info.outputPath('boss-combat.jpg'),quality:75});
  // Lab restart remains reachable after a defeat overlay appears during capture.
  await page.locator('#lab-start').click();const restarted=await read(page);
  expect(restarted.prototype.whip.forwardHits).toBe(0);expect(restarted.prototype.dash.uses).toBe(0);expect(restarted.pve.bossHp).toBe(900);
  expect(restarted.lab.restartMs).toBeLessThan(3000);
  await info.attach('prototype-boss',{body:JSON.stringify({snapshots,errors}),contentType:'application/json'});expect(errors).toEqual([]);
});

test('prototype camera tour through edges, corners and plateau with three documentation views',async({page},info)=>{
  test.setTimeout(120_000);await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();
  const positions:unknown[]=[];
  const walk=async(x:number,z:number)=>{
    for(const [axis,target] of [['x',x],['z',z]] as const){
      const delta=target-(await read(page)).snapshot.position[axis];if(Math.abs(delta)<.2)continue;
      const sign=Math.sign(delta),key=worldKeyT2(axis,sign,(await read(page)).camera);
      await page.keyboard.down(key);
      try{await page.waitForFunction(({axis,target,sign})=>((window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position[axis]-target)*sign>-.15,
        {axis,target,sign},{timeout:9000});}finally{await page.keyboard.up(key);}
    }
  };
  for(const [name,x,z] of [['middle',0,-29],['west',-16,-29],['north-west',-16,-37],['north-approach',0,-37],['north',0,-40],
    ['north-return',0,-37],['north-east',16,-37],['east',16,-29],['south-east',16,-18],['south',0,-18],['stairs',0,-23],['plateau',-12,-23]] as const){
    await walk(x,z);await page.waitForTimeout(300);const state=await read(page);positions.push({name,position:state.snapshot.position,surface:state.snapshot.surface});
    expect(state.playerScreen.x).toBeGreaterThan(180);expect(state.playerScreen.y).toBeGreaterThan(150);
    expect(state.playerScreen.x).toBeLessThan(page.viewportSize()!.width-250);expect(state.playerScreen.y).toBeLessThan(page.viewportSize()!.height-130);
    if(['north-approach','north-return','stairs'].includes(name))continue;
    for(const mode of ['side','straight','isometric'] as const){
      const data=await page.evaluate(mode=>(window as unknown as {__coreArena:{combatView(mode:string):string}}).__coreArena.combatView(mode),mode);
      writeFileSync(info.outputPath(`${name}-${mode}.jpg`),Buffer.from(data.split(',')[1]!,'base64'));
    }
  }
  expect((await read(page)).snapshot.surface).toBe('boss-health-plateau');
  await info.attach('camera-tour',{body:JSON.stringify(positions),contentType:'application/json'});
});

test('prototype warmed performance with sustained attacks and bounded effects',async({page},info)=>{
  test.setTimeout(90_000);await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();await page.waitForTimeout(1500);
  const records:unknown[]=[];
  for(let attempt=0;attempt<3;attempt++){
    await page.locator('#lab-start').click();await page.waitForTimeout(500);
    for(let i=0;i<20;i++){
      const s=await read(page),target=s.prototype.targetScreens[i%2]!;await page.mouse.click(target.x,target.y);await page.waitForTimeout(725);
    }
    const s=await read(page);records.push(s.lab);
    expect(s.prototype.whip.forwardHits).toBeGreaterThan(10);expect(s.prototype.whip.returnHits).toBeGreaterThan(10);
  }
  await info.attach('performance',{body:JSON.stringify(records),contentType:'application/json'});
});

test('prototype 30Hz presentation preserves attacks, pause and resume',async({page},info)=>{
  await page.addInitScript(()=>{
    const native=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window);
    let next=0,last=0;const pending=new Map<number,{timer:number;frame:number}>();
    window.requestAnimationFrame=callback=>{
      const id=++next,entry={timer:0,frame:0};pending.set(id,entry);
      entry.timer=window.setTimeout(()=>{entry.frame=native(now=>{last=now;pending.delete(id);callback(now);});},Math.max(0,1000/30-(performance.now()-last)));
      return id;
    };
    window.cancelAnimationFrame=id=>{const entry=pending.get(id);if(entry){clearTimeout(entry.timer);cancel(entry.frame);pending.delete(id);}};
  });
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();await page.waitForTimeout(500);
  for(let i=0;i<5;i++){const p=(await read(page)).prototype.targetScreens[0]!;await page.mouse.click(p.x,p.y);await page.waitForTimeout(800);}
  const s=await read(page);expect(s.prototype.whip.forwardHits).toBeGreaterThanOrEqual(5);expect(s.prototype.whip.returnHits).toBeGreaterThanOrEqual(5);
  await page.locator('#pve-pause').click();const tick=(await read(page)).snapshot.tick;await page.waitForTimeout(200);expect((await read(page)).snapshot.tick).toBe(tick);
  await page.locator('#resume').click();await page.waitForTimeout(150);expect((await read(page)).snapshot.tick).toBeGreaterThan(tick);
  await info.attach('30hz',{body:JSON.stringify(s.lab),contentType:'application/json'});
});

test('prototype real reactive boss victory removes body and retry restores fresh state',async({page},info)=>{
  test.setTimeout(120_000);await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');await page.locator('#lab-start').click();
  const {result}=await defeatT2(page,'boss');
  await info.attach('reactive-boss',{body:JSON.stringify(result),contentType:'application/json'});
  expect(result.pve.outcome).toBe('victory');
  // Walk through the defeated boss's former cylinder using ordinary controls.
  await page.keyboard.down('KeyD');await page.waitForTimeout(1100);await page.keyboard.up('KeyD');
  expect((await read(page)).snapshot.position.z).toBeLessThan(result.pve.center.z-1.7);
  await page.locator('#lab-start').click();const reset=await read(page);expect(reset.pve.bossHp).toBe(900);expect(reset.prototype.whip.sequence).toBe(0);
});
