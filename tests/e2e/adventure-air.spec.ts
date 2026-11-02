import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import type {T2State} from './adventureT2Controls';
test.use({headless:false,trace:'off'});
const mission='./?mode=pve&level=stone&adventure=1&combat=prototype';
type State=T2State&{prototype:T2State['prototype']&{targetScreens:{x:number;y:number}[]};viewport:unknown};
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());

test('desktop air strike, double jump, no third jump, landing, pause and restart',async({page},info)=>{
  await page.goto(mission+'&lab=boss');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();await page.waitForTimeout(200);
  await page.keyboard.press('Space');await page.waitForTimeout(150);
  const before=await read(page);expect(before.snapshot.grounded).toBe(false);
  const point=before.prototype.targetScreens[0]!;await page.mouse.click(point.x,point.y);
  await page.waitForFunction(()=>{const w=(window as unknown as {__coreArena:{read():State}}).__coreArena.read().prototype.whip;return w.attack==='air'&&w.phase==='forward'&&w.age>=10;});
  const capture=await page.evaluate(()=>{const api=(window as unknown as {__coreArena:{read():State;combatView(mode:string):string}}).__coreArena;return {state:api.read(),image:api.combatView('straight')};});
  writeFileSync(info.outputPath('air-strike.jpg'),Buffer.from(capture.image.split(',')[1]!,'base64'));
  await page.keyboard.press('Space');await expect.poll(async()=>(await read(page)).prototype.airJump.uses).toBe(1);
  await page.keyboard.press('Space');await page.waitForTimeout(80);expect((await read(page)).prototype.airJump.uses).toBe(1);
  await page.locator('#pve-pause').click();const tick=(await read(page)).snapshot.tick;await page.waitForTimeout(200);
  expect((await read(page)).snapshot.tick).toBe(tick);await page.locator('#resume').click();
  await expect.poll(async()=>(await read(page)).snapshot.grounded).toBe(true);
  expect((await read(page)).prototype.whip.forwardHits).toBeGreaterThan(0);
  await page.mouse.click(point.x,point.y,{button:'right'});await page.waitForTimeout(40);expect((await read(page)).prototype.whip.attack).toBe('overhead');
  await page.locator('#lab-start').click();expect((await read(page)).prototype.airJump.uses).toBe(0);expect((await read(page)).prototype.whip.sequence).toBe(0);
  await info.attach('air-state',{body:JSON.stringify(capture.state),contentType:'application/json'});
});

for(const width of [667,844])test(`touch ${width}: independent fingers, dash, both ground moves, air strike and double jump`,async({browser},info)=>{
  test.setTimeout(60000);
  const context=await browser.newContext({viewport:{width,height:width===667?375:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(mission);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    await expect(page.locator('#touch-sprint')).toHaveText('Dash');await expect(page.locator('#touch-heavy')).toBeVisible();
    for(const id of ['touch-stick','touch-jump','touch-heavy','touch-sprint','pve-pause']){
      const rect=await page.locator('#'+id).evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,reachable:!!hit&&el.contains(hit),vw:innerWidth,vh:innerHeight};});
      expect(rect.reachable,id).toBe(true);expect(Math.round(rect.w)).toBeGreaterThanOrEqual(44);expect(Math.round(rect.h)).toBeGreaterThanOrEqual(44);
      expect(rect.x>=0&&rect.y>=0&&rect.right<=rect.vw&&rect.bottom<=rect.vh,id).toBe(true);
    }
    const cdp=await context.newCDPSession(page),stick=(await page.locator('#touch-stick').boundingBox())!;
    await page.evaluate(()=>{const events:unknown[]=[];(window as unknown as {touchEvents:unknown[]}).touchEvents=events;
      window.addEventListener('pointerdown',e=>events.push({id:(e.target as HTMLElement).id,button:e.button,pointer:e.pointerId}));});
    const finger={id:1,x:stick.x+stick.width/2+30,y:stick.y+stick.height/2};
    const send=(type:'touchStart'|'touchEnd'|'touchMove',points:{id:number;x:number;y:number}[])=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
    const button=async(id:string)=>{const b=(await page.locator('#'+id).boundingBox())!;return {id:2,x:b.x+b.width/2,y:b.y+b.height/2};};
    // Aim once by a real canvas tap; then retain that direction while another finger uses buttons.
    await page.touchscreen.tap(width/2,160);await page.waitForTimeout(750);expect((await read(page)).prototype.whip.attack).toBe('sweep');
    await send('touchStart',[finger]);await page.waitForTimeout(120);const before=(await read(page)).snapshot.position;
    const heavy=await button('touch-heavy'),dash=await button('touch-sprint');
    await send('touchStart',[finger,heavy]);await page.waitForTimeout(80);
    expect((await read(page)).prototype.whip.attack).toBe('overhead');await send('touchEnd',[heavy]);
    await send('touchStart',[finger,dash]);await page.waitForTimeout(160);await send('touchEnd',[dash]);
    const dashed=await read(page),events=await page.evaluate(()=>(window as unknown as {touchEvents:unknown[]}).touchEvents);
    expect(dashed.prototype.dash.uses,JSON.stringify({events,player:dashed.snapshot,dash:dashed.prototype.dash})).toBe(1);expect(dashed.snapshot.position.x-before.x).toBeGreaterThan(2.5);
    await send('touchEnd',[]);await page.waitForTimeout(1000);
    await page.locator('#touch-jump').tap();await page.waitForTimeout(120);
    await page.touchscreen.tap(width/2,160);await page.waitForTimeout(50);expect((await read(page)).prototype.whip.attack).toBe('air');
    await page.locator('#touch-jump').tap();await page.waitForTimeout(50);expect((await read(page)).prototype.airJump.uses).toBe(1);
    await page.locator('#touch-jump').tap();expect((await read(page)).prototype.airJump.uses).toBe(1);
    await page.screenshot({path:info.outputPath('touch-air.jpg'),quality:75});
    await page.locator('#pve-pause').tap();const paused=await read(page);await page.waitForTimeout(200);expect((await read(page)).snapshot.tick).toBe(paused.snapshot.tick);
    await page.locator('#resume').tap();await page.waitForTimeout(700);await page.locator('#touch-heavy').tap();await page.waitForTimeout(80);
    expect((await read(page)).prototype.whip.attack).toBe('overhead');
    await page.locator('#pve-pause').tap();await page.locator('#pve-restart').tap();expect((await read(page)).prototype.airJump.uses).toBe(0);
    await page.setViewportSize({width:375,height:667});await expect(page.locator('#rotate-device')).toBeVisible();expect((await read(page)).paused).toBe(true);
    await page.setViewportSize({width,height:width===667?375:390});await page.waitForTimeout(100);
    await page.goto('./?mode=pve&level=stone&adventure=1');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    await expect(page.locator('#touch-heavy')).toBeHidden();await expect(page.locator('#touch-sprint')).toHaveText('Sprint aus');
    await page.locator('#touch-sprint').tap();await expect(page.locator('#touch-sprint')).toHaveText('Sprint an');
    expect(errors).toEqual([]);await info.attach('touch-state',{body:JSON.stringify({dashed,paused,errors}),contentType:'application/json'});
  }finally{await context.close();}
});
