import { test, expect, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';

interface State {
  snapshot: Snapshot; weapons: WeaponSnapshot;
  enemies: {id:string;hp:number;screen:{x:number;y:number}}[];
  arcVisual: {visible:boolean;beams:number};
  playerScreen: {x:number;y:number};
}
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
test.use({headless:false});

for(const mobile of [false,true])test(`${mobile?'touch':'desktop'} Arc acquires away from pointer, continues after release and renders five strands`,async({browser},info)=>{
  const context=await browser.newContext(mobile
    ? {viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}
    : {viewport:{width:1366,height:768}});
  const page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try {
    await page.goto('./?mode=pve&level=stone&adventure=1');
    await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    const cdp=await context.newCDPSession(page);
    if(mobile){
      const box=(await page.locator('#touch-stick').boundingBox())!;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2+42,y:box.y+box.height/2}]});
    }else await page.keyboard.down('KeyD');
    await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position.z<27);
    if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    else await page.keyboard.up('KeyD');
    const before=await read(page),point=mobile?{x:250,y:150}:{x:350,y:300};
    // Fire deliberately behind the player, while the guard is ahead to the right.
    expect(point.x).toBeLessThan(before.playerScreen.x);
    expect(before.enemies[0]!.screen.x).toBeGreaterThan(before.playerScreen.x);
    if(mobile)await page.touchscreen.tap(point.x,point.y);
    else await page.mouse.click(point.x,point.y);
    await page.waitForTimeout(180);
    const active=await read(page);
    expect(active.arcVisual).toEqual({visible:true,beams:5});
    expect(active.weapons.lastArc!.targetIds).toContain(before.enemies[0]!.id);
    expect(active.enemies[0]!.hp).toBeLessThan(70);
    expect(active.snapshot.tick-active.weapons.lastArc!.tick).toBeGreaterThan(6);
    await page.screenshot({path:info.outputPath(mobile?'arc-mobile.png':'arc-desktop.png')});
    await expect.poll(async()=>(await read(page)).enemies[0]!.hp).toBe(35);
    await expect.poll(async()=>(await read(page)).arcVisual.visible).toBe(false);
    // Holding repeats salvos; the guard remains hittable without aiming at it.
    if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,...point}]});
    else await page.mouse.down();
    await expect.poll(async()=>(await read(page)).enemies[0]!.hp).toBe(0);
    if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    else await page.mouse.up();
    await page.waitForTimeout(900);
    const openPoint=mobile?{x:620,y:160}:{x:1000,y:310};
    if(mobile)await page.touchscreen.tap(openPoint.x,openPoint.y);
    else await page.mouse.click(openPoint.x,openPoint.y);
    await page.waitForTimeout(180);
    expect((await read(page)).arcVisual).toEqual({visible:true,beams:5});
    await page.screenshot({path:info.outputPath(mobile?'fan-mobile.png':'fan-desktop.png')});
    expect(errors).toEqual([]);
    await info.attach('auto-fan',{body:JSON.stringify({mobile,before,active,after:await read(page),errors}),contentType:'application/json'});
  }finally{await context.close();}
});
