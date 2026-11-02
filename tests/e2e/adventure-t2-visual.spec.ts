import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {readT2,walkT2,type T2State} from './adventureT2Controls';
test.use({headless:false,trace:'off'});
const url='./?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype';
test('T2 Faust poses match warning, contact and counter; plateau eruption is elevated and dodgeable',async({page},info)=>{
  test.setTimeout(100000);await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const frames:unknown[]=[];
  await page.selectOption('#lab-scenario','melee');await page.locator('#lab-start').click();
  for(const [name,start,end] of [['warning',25,35],['contact',48,54],['counter',60,80]] as const){
    await page.waitForFunction(({start,end})=>{const s=(window as unknown as {__coreArena:{read():T2State}}).__coreArena.read();return s.pve.phase==='melee'&&s.pve.phaseTick>=start&&s.pve.phaseTick<end;},{start,end});
    const capture=await page.evaluate(()=>{const api=(window as unknown as {__coreArena:{read():T2State;combatView(mode:string):string}}).__coreArena;
      return {state:api.read(),image:api.combatView('straight')};});
    writeFileSync(info.outputPath(`faust-${name}.jpg`),Buffer.from(capture.image.split(',')[1]!,'base64'));frames.push({name,state:capture.state});
  }
  await page.selectOption('#lab-scenario','boss');
  for(const leave of [false,true]){
    await page.locator('#lab-start').click();await walkT2(page,0,-23);await walkT2(page,-12,-23);
    expect((await readT2(page)).snapshot.surface).toBe('boss-health-plateau');
    await page.waitForFunction(()=>{const b=(window as unknown as {__coreArena:{read():T2State}}).__coreArena.read().pve;
      return b.phase==='warning'&&b.kind==='eruption'&&b.phaseTick<20;},undefined,{timeout:15000});
    const before=await readT2(page);expect(before.pve.target.y).toBeCloseTo(1.1,1);
    await page.screenshot({path:info.outputPath(`plateau-${leave?'leave':'stay'}-warning.jpg`),quality:75});
    if(leave)await page.keyboard.down('KeyD');
    await page.waitForFunction(()=>{const b=(window as unknown as {__coreArena:{read():T2State}}).__coreArena.read().pve;
      return b.phase==='attack'&&b.kind==='eruption'&&b.phaseTick>=2;});
    await page.keyboard.up('KeyD');const after=await readT2(page);
    expect(after.pve.hitsTaken-before.pve.hitsTaken).toBe(leave?0:1);
    await page.screenshot({path:info.outputPath(`plateau-${leave?'leave':'stay'}-attack.jpg`),quality:75});frames.push({leave,before,after});
  }
  await info.attach('visual-sequences',{body:JSON.stringify(frames),contentType:'application/json'});
});
