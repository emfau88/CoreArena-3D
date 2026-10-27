import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { PickupState } from '../../src/core/pickups';

interface State { mode:string; snapshot:Snapshot; weapons:WeaponSnapshot; pickups:PickupState[]; armor:number; paused:boolean;
  camera:string; section:string; playerScreen:{x:number;y:number}; viewport:{width:number;height:number;dpr:number}; renderCalls:number }
const read = (page:Page):Promise<State> => page.evaluate(() => (window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const walkTo = async(page:Page,x:number,z:number) => {
  // Real input with small corrections, like a player stopping at a pickup.
  // A single long key hold can overshoot under browser/OS scheduling jitter.
  for(const [axis,target] of [['z',z],['x',x]] as const) for(let correction=0;correction<10;correction++) {
    const delta=target-(await read(page)).snapshot.position[axis];
    if(Math.abs(delta)<.25) break;
    const direction=Math.sign(delta), key=axis==='x' ? direction>0?'KeyS':'KeyW' : direction>0?'KeyA':'KeyD';
    if(Math.abs(delta)<1.2) await page.keyboard.press(key,{delay:Math.min(85,Math.abs(delta)/7.2*800)});
    else {
      await page.keyboard.down(key);
      try { await page.waitForFunction(({axis,target,direction})=>{
        const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
        return (s.snapshot.position[axis]-target)*direction>=-.55;
      },{axis,target,direction},{timeout:10000}); }
      finally { await page.keyboard.up(key); }
    }
    await page.waitForTimeout(40);
  }
  const p=(await read(page)).snapshot.position;
  expect(Math.hypot(p.x-x,p.z-z),`Route to (${x}, ${z}), actual ${JSON.stringify(p)}`).toBeLessThan(.5);
};
const url = './?mode=pve&level=stone&adventure=1';
test.use({headless:false});
test.afterEach(async({page},info)=>{
  if(info.status!==info.expectedStatus && !page.isClosed()) {
    const state=await read(page).catch(()=>null);
    await info.attach('failure-state',{body:JSON.stringify(state),contentType:'application/json'});
  }
});

test('walk every room, collect supplies, climb real stairs, aim/fire, pause and restart', async ({page},info) => {
  test.setTimeout(150_000);
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await read(page)).mode).toBe('adventure');
  expect((await read(page)).camera).toBe('side');
  await page.screenshot({path:info.outputPath('arrival.png')});
  await page.evaluate(()=>(window as unknown as {__coreArena:{overview():void}}).__coreArena.overview());
  await page.screenshot({path:info.outputPath('level-overview.png')}); await page.locator('#pve-restart').click();
  await walkTo(page,0,26); await walkTo(page,0,18.5); await walkTo(page,-3,18.5);
  await expect.poll(async()=>(await read(page)).weapons.ownsPulse).toBe(true);
  await page.keyboard.press('Digit2'); await page.mouse.move(1100,400); await page.mouse.down();
  await expect.poll(async()=> (await read(page)).weapons.projectiles.some(p=>p.direction.z<-.5)).toBe(true);
  await expect.poll(async()=>(await read(page)).weapons.ammo).toBeLessThan(40); await page.mouse.up();
  await walkTo(page,0,18.5); await walkTo(page,0,8); await walkTo(page,0,2); await walkTo(page,-10,2);
  await expect.poll(async()=>(await read(page)).snapshot.surface).toBe('side-terrace');
  await walkTo(page,-13.5,4); await walkTo(page,-13.5,0);
  await expect.poll(async()=>(await read(page)).armor).toBe(80);
  await walkTo(page,-9,-.4);
  expect((await read(page)).pickups.find(p=>p.id==='side-ammo')!.remaining).toBeLessThan(27);
  await page.screenshot({path:info.outputPath('side-terrace.png')});
  await page.keyboard.press('KeyV'); expect((await read(page)).camera).toBe('straight');
  await page.keyboard.press('KeyV'); await page.screenshot({path:info.outputPath('side-terrace-isometric.png')});
  // Physically move using the rotated camera basis, then return for the route.
  const rotated = await read(page); await page.keyboard.down('KeyD'); await page.waitForTimeout(200); await page.keyboard.up('KeyD');
  expect(Math.hypot((await read(page)).snapshot.position.x-rotated.snapshot.position.x,(await read(page)).snapshot.position.z-rotated.snapshot.position.z)).toBeGreaterThan(.5);
  await page.keyboard.press('KeyV');
  await walkTo(page,-10,2); await walkTo(page,0,2); await walkTo(page,0,8);
  await walkTo(page,11,8); await walkTo(page,11,6.5); await walkTo(page,11,-1); await walkTo(page,11,-7);
  await expect.poll(async()=>(await read(page)).snapshot.surface).toBe('thrower-plinth');
  await page.screenshot({path:info.outputPath('inner-court.png')});
  await walkTo(page,11,-1); await walkTo(page,0,-1); await walkTo(page,0,-14); await walkTo(page,0,-19);
  await walkTo(page,13,-19); await walkTo(page,13,-20); await walkTo(page,0,-20); await walkTo(page,0,-23); await walkTo(page,-12,-23);
  await expect.poll(async()=>(await read(page)).snapshot.surface).toBe('boss-health-plateau');
  await page.keyboard.press('KeyV'); await page.keyboard.press('KeyV');
  await page.screenshot({path:info.outputPath('warden-court-isometric.png')}); await page.keyboard.press('KeyV');
  await walkTo(page,0,-23); await walkTo(page,0,-19); await walkTo(page,-16,-19); await walkTo(page,-16,-37);
  await walkTo(page,-13,-37); await walkTo(page,0,-38.5); await walkTo(page,0,-40);
  await expect(page.locator('#room-name')).toHaveText('Nordtor');
  const end = await read(page); expect(end.playerScreen.x).toBeGreaterThan(200); expect(end.playerScreen.x).toBeLessThan(end.viewport.width-200);
  expect(end.playerScreen.y).toBeGreaterThan(100); expect(end.playerScreen.y).toBeLessThan(end.viewport.height-120);
  expect(end.pickups.find(p=>p.id==='adventure-pulse')!.remaining).toBe(0);
  expect(end.snapshot.tick).toBeGreaterThan(600);
  await page.locator('#pve-pause').click(); const tick=(await read(page)).snapshot.tick;
  await page.waitForTimeout(150); expect((await read(page)).snapshot.tick).toBe(tick);
  await page.locator('#resume').click();
  await page.evaluate(()=>(window as unknown as {__coreArena:{overview():void}}).__coreArena.overview());
  await page.screenshot({path:info.outputPath('level-overview.png')});
  await page.locator('#pve-restart').click();
  await expect.poll(async()=>(await read(page)).section).toBe('A');
  expect((await read(page)).weapons.ownsPulse).toBe(false); expect((await read(page)).armor).toBe(50);
  expect((await read(page)).pickups.every(p=>p.remaining===p.amount)).toBe(true);
  await page.screenshot({path:info.outputPath('restart.png')});
  expect(errors).toEqual([]);
  await info.attach('walkthrough',{body:JSON.stringify({end,errors}),contentType:'application/json'});
});

test('touch joystick reaches weapon and side terrace; jump, camera and restart remain usable', async ({browser},info) => {
  test.setTimeout(90_000);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage(), errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(url); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    const cdp=await context.newCDPSession(page);
    const box=(await page.locator('#touch-stick').boundingBox())!;
    const center={x:box.x+box.width/2,y:box.y+box.height/2};
    const go=async(x:number,z:number)=>{
      for(const [axis,target] of [['z',z],['x',x]] as const) {
        const current=(await read(page)).snapshot.position[axis]; if(Math.abs(current-target)<.2) continue;
        const sign=target>current?1:-1;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:center.x+(axis==='z'?-42*sign:0),y:center.y+(axis==='x'?42*sign:0)}]});
        try {await page.waitForFunction(({axis,target,sign})=>{
          const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
          return (s.snapshot.position[axis]-target)*sign>=-.12;
        },{axis,target,sign},{timeout:6000});}
        finally {await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
      }
    };
    await go(0,26); await go(0,18.5); await go(-3,18.5);
    await info.attach('touch-weapon-position',{body:JSON.stringify(await read(page)),contentType:'application/json'});
    await expect.poll(async()=>(await read(page)).weapons.ownsPulse).toBe(true);
    await page.locator('#weapon-pulse').tap(); await page.touchscreen.tap(600,220);
    await expect.poll(async()=>(await read(page)).weapons.ammo).toBeLessThan(54);
    await go(0,18.5); await go(0,8); await go(0,2); await go(-10,2);
    await expect.poll(async()=>(await read(page)).snapshot.surface).toBe('side-terrace');
    await page.locator('#touch-jump').tap(); await expect.poll(async()=>(await read(page)).snapshot.position.y,{intervals:[20]}).toBeGreaterThan(1.6);
    await page.locator('#touch-camera').tap(); expect((await read(page)).camera).toBe('straight');
    await page.locator('#touch-camera').tap(); expect((await read(page)).camera).toBe('isometric');
    await page.screenshot({path:info.outputPath('mobile-terrace.png')});
    await page.locator('#pve-restart').tap(); await expect.poll(async()=>(await read(page)).section).toBe('A');
    expect((await read(page)).viewport.dpr).toBe(1); expect(errors).toEqual([]);
  } finally {await context.close();}
});
