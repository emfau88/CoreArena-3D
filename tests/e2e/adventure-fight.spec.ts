import { test,expect,type Page } from '@playwright/test';
import type { PveSnapshot } from '../../src/core/pve';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { RunnerState } from '../../src/core/stoneRunner';

interface State { snapshot:Snapshot;pve:PveSnapshot;bossActive:boolean;weapons:WeaponSnapshot;
  enemies:(RunnerState & {screen:{x:number;y:number}})[];monsterScreen:{x:number;y:number};hp:number;armor:number }
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const url='./?mode=pve&level=stone&adventure=1';
test.use({headless:false});
async function walk(page:Page,x:number,z:number) {
  for(const [axis,target] of [['z',z],['x',x]] as const) for(let i=0;i<12;i++) {
    const delta=target-(await read(page)).snapshot.position[axis]; if(Math.abs(delta)<.3) break;
    const direction=Math.sign(delta),key=axis==='z'?(direction>0?'KeyA':'KeyD'):(direction>0?'KeyS':'KeyW');
    if(Math.abs(delta)<1.2) await page.keyboard.press(key,{delay:Math.min(85,Math.abs(delta)/7.2*800)});
    else { await page.keyboard.down(key); try {
      await page.waitForFunction(({axis,target,direction})=>{
        const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
        return (s.snapshot.position[axis]-target)*direction>=-.5;
      },{axis,target,direction},{timeout:10000});
    } finally {await page.keyboard.up(key);} }
    await page.waitForTimeout(40);
  }
  const p=(await read(page)).snapshot.position; expect(Math.hypot(p.x-x,p.z-z)).toBeLessThan(.6);
}
async function fireAt(page:Page,index:number|'boss') {
  const initial=await read(page),point=index==='boss'?initial.monsterScreen:initial.enemies[index]!.screen;
  await page.mouse.move(point.x,point.y);
  await page.mouse.down();
  try {
    for(let i=0;i<400;i++) {
      const s=await read(page); if(s.pve.outcome==='defeat') throw new Error('Player defeated during regular combat');
      if(index==='boss' ? s.pve.bossHp===0 : s.enemies[index]!.hp===0) return;
      const point=index==='boss'?s.monsterScreen:s.enemies[index]!.screen;
      await page.mouse.move(point.x,point.y); await page.waitForTimeout(50);
    }
    throw new Error('Enemy survived real fire');
  } finally {await page.mouse.up();}
}
test('regular adventure: two melee guards, supplies, existing boss, victory and reset',async({page},info)=>{
  test.setTimeout(150_000); const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await read(page)).enemies).toHaveLength(2); expect((await read(page)).bossActive).toBe(false);
  await walk(page,0,27); await page.screenshot({path:info.outputPath('runner.png')}); await fireAt(page,0);
  await walk(page,0,18.5); await walk(page,-3,18.5); await page.locator('#weapon-pulse').click();
  await walk(page,0,18.5); await walk(page,0,7); await fireAt(page,1);
  await walk(page,0,8); await walk(page,11,8); await walk(page,11,6.5);
  expect((await read(page)).weapons.ammo).toBe(54);
  await walk(page,0,6.5); await walk(page,0,-14); expect((await read(page)).bossActive).toBe(false);
  await walk(page,0,-21); expect((await read(page)).bossActive).toBe(true);
  await page.screenshot({path:info.outputPath('boss-emergence.png')});
  await expect.poll(async()=>(await read(page)).pve.phase,{timeout:5000}).not.toBe('emerging');
  await page.screenshot({path:info.outputPath('boss.png')});
  await fireAt(page,'boss');
  await expect(page.locator('#result-title')).toHaveText('Wächter bezwungen.');
  const won=await read(page); expect(won.pve.bossHp).toBe(0);expect(won.enemies.every(e=>e.hp===0)).toBe(true);
  await page.screenshot({path:info.outputPath('victory.png')});
  await page.locator('#pve-again').click();
  await expect.poll(async()=>(await read(page)).enemies.every(e=>e.hp===70)).toBe(true);
  expect((await read(page)).bossActive).toBe(false);expect((await read(page)).hp).toBe(100);
  expect((await read(page)).weapons.ownsPulse).toBe(false);expect(errors).toEqual([]);
  await info.attach('actual-victory',{body:JSON.stringify({won,errors}),contentType:'application/json'});
});

test('touch melee kill, menu restart, actual defeat and retry',async({browser},info)=>{
  test.setTimeout(75_000);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(url); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    const cdp=await context.newCDPSession(page);
    const approach=async()=>{
      const box=(await page.locator('#touch-stick').boundingBox())!;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2+42,y:box.y+box.height/2}]});
      await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position.z<27);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    await approach();
    let target=(await read(page)).enemies[0]!.screen;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,...target}]});
    for(let i=0;i<100 && (await read(page)).enemies[0]!.hp>0;i++) {
      target=(await read(page)).enemies[0]!.screen;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:2,...target}]}); await page.waitForTimeout(50);
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    expect((await read(page)).enemies[0]!.hp).toBe(0);
    await page.screenshot({path:info.outputPath('mobile-combat.png')});
    await page.locator('#pve-pause').tap(); await page.locator('#pve-restart').tap();
    await approach();
    await expect.poll(async()=>(await read(page)).pve.outcome,{timeout:25000}).toBe('defeat');
    await page.screenshot({path:info.outputPath('defeat.png')});
    await page.locator('#pve-again').tap();expect((await read(page)).hp).toBe(100);
    expect((await read(page)).armor).toBe(50);expect((await read(page)).enemies[0]!.hp).toBe(70);
    expect(errors).toEqual([]);
  } finally {await context.close();}
});
