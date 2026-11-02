import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {readT2,defeatT2,type T2State} from './adventureT2Controls';

test.use({headless:false,trace:'off'});
const url='./?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype&loadout=pulse';
type State=T2State&{prototype:T2State['prototype']&{targetScreens:{x:number;y:number}[]};
  feedback:{played:number;muted:boolean;voices:number};whipVisual:{trail:boolean;bursts:number;guarded:boolean};
  lab:{environment:{sourceHash:string};resources:{objects:number;geometries:number;textures:number;audioVoices:number};current:{framesMs:{p95:number};simulationMs:{p95:number}}}};
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
async function practice(page:Page){await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.selectOption('#lab-scenario','targets');await page.locator('#lab-start').click();await page.waitForTimeout(250);}

test('whip move selection: clicks, holds, context menu, cancellation, pause, Pulse and reset',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await practice(page);
  await expect(page.locator('#whip-controls')).toContainText('Rechts: Überkopf-Knall');
  const point=(await read(page)).prototype.targetScreens[0]!;
  await page.mouse.move(point.x,point.y);await page.mouse.down({button:'right'});await page.waitForTimeout(1400);await page.mouse.up({button:'right'});
  let s=await read(page);expect(s.prototype.whip.attack).toBe('overhead');expect(s.prototype.whip.sequence).toBe(1);
  expect(s.prototype.whip.forwardHits).toBe(1);expect(s.prototype.whip.returnHits).toBe(0);
  await page.mouse.click(point.x,point.y);await page.waitForTimeout(750);s=await read(page);
  expect(s.prototype.whip.attack).toBe('sweep');expect(s.prototype.whip.sequence).toBe(2);expect(s.prototype.whip.returnHits).toBeGreaterThan(0);
  const menu=await page.locator('canvas').first().evaluate(canvas=>{
    const event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});canvas.dispatchEvent(event);return event.defaultPrevented;
  });expect(menu).toBe(true);
  await page.mouse.click(point.x,point.y,{button:'right'});
  await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().prototype.whip.phase==='windup');
  await page.keyboard.press('ShiftLeft');await page.waitForTimeout(180);
  const cancelled=await read(page);expect(cancelled.prototype.whip.cancelled).toBe(1);expect(cancelled.prototype.whip.readyIn).toBeGreaterThan(0);
  await page.mouse.click(point.x,point.y);expect((await read(page)).prototype.whip.sequence).toBe(3);
  await page.locator('#pve-pause').click();const frozen=await read(page);await page.waitForTimeout(250);
  expect((await read(page)).prototype.whip.readyIn).toBe(frozen.prototype.whip.readyIn);await page.locator('#resume').click();
  await page.keyboard.press('Digit2');const ammo=(await read(page)).weapons.ammo;
  await page.mouse.click(point.x,point.y,{button:'right'});await page.waitForTimeout(150);expect((await read(page)).weapons.ammo).toBe(ammo);
  await page.mouse.click(point.x,point.y);await page.waitForTimeout(150);expect((await read(page)).weapons.ammo).toBeLessThan(ammo);
  await page.locator('#lab-start').click();s=await read(page);expect(s.prototype.whip.readyIn).toBe(0);expect(s.prototype.whip.sequence).toBe(0);
  expect(s.whipVisual.bursts).toBe(0);expect(s.whipVisual.trail).toBe(false);
  await page.selectOption('#lab-profile','legacy');await page.locator('#lab-start').click();
  const legacy=await read(page);await page.mouse.click(point.x,point.y,{button:'right'});await page.waitForTimeout(150);
  expect((await read(page)).prototype).toBeNull();expect((await read(page)).weapons.ammo).toBe(legacy.weapons.ammo);
  expect(errors).toEqual([]);await info.attach('input-result',{body:JSON.stringify({cancelled,reset:s,errors}),contentType:'application/json'});
});

test('whip presentation: visible anticipation, sweep, overhead, real contact, reduced effects and bounded resources',async({page},info)=>{
  test.setTimeout(90000);await practice(page);const captures:unknown[]=[];
  for(const button of ['left','right'] as const){
    for(const phase of ['windup','forward','recovery'] as const){
      await page.locator('#lab-start').click();await page.waitForTimeout(250);const point=(await read(page)).prototype.targetScreens[0]!;
      // Arm an observer before real input; capture the rendered active phase without changing simulation.
      await page.evaluate(phase=>{
        const api=(window as unknown as {__coreArena:{read():State;combatView(mode:string):string}}).__coreArena;
        (window as unknown as {whipCapture:Promise<unknown>}).whipCapture=new Promise(resolve=>{
          const start=performance.now();const poll=()=>{const s=api.read(),w=s.prototype.whip;
            const ready=phase==='forward'?w.age>=(w.attack==='overhead'?18:10):phase==='windup'?w.age>=(w.attack==='overhead'?10:3):true;
            if(w.sequence>0&&w.phase===phase&&ready){resolve({state:s,image:api.combatView('straight')});return;}
            if(performance.now()-start>5000){resolve(null);return;}requestAnimationFrame(poll);};requestAnimationFrame(poll);
        });
      },phase);
      await page.mouse.click(point.x,point.y,{button});
      const capture=await page.evaluate(()=>(window as unknown as {whipCapture:Promise<{state:State;image:string}|null>}).whipCapture);
      expect(capture).not.toBeNull();captures.push({button,phase,state:capture!.state});
      writeFileSync(info.outputPath(`${button}-${phase}.jpg`),Buffer.from(capture!.image.split(',')[1]!,'base64'));
    }
  }
  await page.locator('#lab-reduced').check();await page.locator('#stone-sound').click();
  const played=(await read(page)).feedback.played;await page.waitForTimeout(1100);
  const point=(await read(page)).prototype.targetScreens[0]!;await page.mouse.click(point.x,point.y,{button:'right'});await page.waitForTimeout(500);
  expect((await read(page)).feedback.played).toBe(played);expect((await read(page)).whipVisual.trail).toBe(false);
  await page.locator('#lab-reduced').uncheck();await page.locator('#lab-start').click();
  // Warm both moves, then repeat the same workload. Geometry/texture counts must settle.
  const resources:State['lab'][]=[];
  for(let run=0;run<3;run++){
    for(let n=0;n<8;n++){const p=(await read(page)).prototype.targetScreens[0]!;await page.mouse.click(p.x,p.y,{button:n%2?'right':'left'});await page.waitForTimeout(n%2?1100:750);}
    resources.push((await read(page)).lab);await page.locator('#lab-start').click();
  }
  for(const result of resources.slice(1)){
    expect(result.resources.objects).toBe(resources[0]!.resources.objects);expect(result.resources.geometries).toBe(resources[0]!.resources.geometries);
    expect(result.resources.textures).toBe(resources[0]!.resources.textures);expect(result.resources.audioVoices).toBe(0);
    expect(result.current.framesMs.p95).toBeLessThan(34);expect(result.current.simulationMs.p95).toBeLessThan(8);
  }
  await info.attach('presentation',{body:JSON.stringify({captures,resources}),contentType:'application/json'});
});

test('mixed whip moves defeat the real warden, preserve warnings and distinguish guard from open-core contact',async({page},info)=>{
  test.setTimeout(130000);await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');await page.locator('#lab-start').click();
  await page.evaluate(()=>{
    const api=(window as unknown as {__coreArena:{read():State;combatView(mode:string):string}}).__coreArena;
    const captures:{guarded:boolean;state:State;image:string}[]=[];(window as unknown as {whipBossCaptures:unknown}).whipBossCaptures=captures;
    const poll=()=>{const s=api.read(),c=s.prototype.whip.contact;
      if(c&&c.attack==='overhead'&&s.snapshot.tick-c.tick<5&&!captures.some(v=>v.guarded===c.guarded))
        captures.push({guarded:c.guarded,state:s,image:api.combatView('straight')});
      if(s.pve.outcome==='running')requestAnimationFrame(poll);};requestAnimationFrame(poll);
  });
  const result=await defeatT2(page,'boss',false,'mixed');
  expect(result.frames.some(s=>s.prototype.whip.attack==='overhead')).toBe(true);expect(result.frames.some(s=>s.prototype.whip.attack==='sweep')).toBe(true);
  const captures=await page.evaluate(()=>(window as unknown as {whipBossCaptures:{guarded:boolean;state:State;image:string}[]}).whipBossCaptures);
  expect(captures.some(c=>!c.guarded)).toBe(true);
  for(const c of captures)writeFileSync(info.outputPath(`boss-${c.guarded?'guard':'core'}.jpg`),Buffer.from(c.image.split(',')[1]!,'base64'));
  await info.attach('mixed-boss',{body:JSON.stringify({result,captures:captures.map(({image,...rest})=>rest)}),contentType:'application/json'});
});

test('regular prototype mission accepts ground attacks and a single extra air jump',async({page})=>{
  await page.goto('./?mode=pve&level=stone&adventure=1&combat=prototype');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const s=await readT2(page),point=s.enemies[0]!.screen;
  await page.mouse.click(point.x,point.y,{button:'right'});await page.waitForTimeout(60);
  expect((await readT2(page)).prototype.whip.attack).toBe('overhead');
  await page.keyboard.press('Space');await page.waitForTimeout(100);const jump=await readT2(page);
  await page.keyboard.press('Space');await page.waitForTimeout(60);const after=await readT2(page);
  expect(after.prototype.airJump.uses).toBe(1);expect(after.prototype.airJump.available).toBe(false);expect(after.prototype.whip.sequence).toBe(1);
  expect(after.snapshot.position.y).toBeGreaterThan(jump.snapshot.position.y);
  await page.locator('#pve-restart').click();expect((await readT2(page)).prototype.whip.readyIn).toBe(0);
  await page.mouse.click(point.x,point.y);await page.waitForTimeout(60);expect((await readT2(page)).prototype.whip.attack).toBe('sweep');
});
