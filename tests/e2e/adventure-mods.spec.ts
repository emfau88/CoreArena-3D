import {test,expect,type Page} from '@playwright/test';
import {readT2,type T2State} from './adventureT2Controls';
import type {AdventureModTrial} from '../../src/core/adventureModTrial';
import type {WhipMod} from '../../src/core/whipMods';

const url='./?mode=pve&level=stone&adventure=1&combat=prototype&environment=warden-ravine&trial=mods';
type State=T2State&{modTrial:ReturnType<AdventureModTrial['read']>;whipVisual:{segments:number;forkSegments:number;bursts:number};
  renderResources:{objects:number;geometries:number;textures:number};};
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
async function choose(page:Page,mod:WhipMod){await page.locator(`input[name="whip-mod"][value="${mod}"]`).check();await page.locator('#mod-start').click();}
async function fightBoss(page:Page){
  const deadline=Date.now()+100000,held=new Set<string>(),trace:unknown[]=[];let lastDash=-1000;
  try{while(Date.now()<deadline){
    const s=await readT2(page),p=s.snapshot,b=s.pve;if(b.outcome!=='running')break;
    const dx=b.center.x-p.position.x,dz=b.center.z-p.position.z,d=Math.hypot(dx,dz);let x=0,z=0;
    if(b.phase==='melee'&&b.exchange?.window!=='counter'){
      if(b.phaseTick>=10&&b.phaseTick<52){x=Math.cos(b.facing);z=-Math.sin(b.facing);}
    }else if(b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')){
      const tx=p.position.x-b.target.x,tz=p.position.z-b.target.z;
      if(Math.hypot(tx,tz)<4){x=Math.abs(tx)>.05?Math.sign(tx):p.position.x<0?1:-1;}
    }else if(d>(s.prototype.whip.mod==='fork'?3:3.5)){x=dx/d;z=dz/d;}
    for(const [key,on] of [['KeyD',-z>.2],['KeyA',-z<-.2],['KeyS',x>.2],['KeyW',x<-.2]] as const){
      if(on&&!held.has(key)){await page.keyboard.down(key);held.add(key);}else if(!on&&held.has(key)){await page.keyboard.up(key);held.delete(key);}
    }
    if(b.phase==='melee'&&b.phaseTick>=16&&b.phaseTick<35&&p.tick-lastDash>60){await page.keyboard.press('ShiftLeft');lastDash=p.tick;}
    if(p.grounded&&b.kind==='wave'&&(b.phase==='warning'&&b.phaseTick>=65&&d<5||b.phase==='attack'&&d>b.waveRadius&&d-b.waveRadius<3))await page.keyboard.press('Space');
    const w=s.prototype.whip;
    if(w.phase==='idle'&&w.readyIn===0&&b.phase!=='emerging'&&b.phase!=='warning'){
      const heavy=b.exchange?.window==='counter'&&d<5.5&&(b.phase==='melee'?b.phaseTick<100:b.phaseTick<64);
      await page.mouse.click(s.monsterScreen.x,s.monsterScreen.y,{button:heavy?'right':'left'});
    }
    trace.push({tick:p.tick,hp:b.hp,armor:b.armor,boss:b.bossHp,phase:b.phase,phaseTick:b.phaseTick,position:p.position});
    await page.waitForTimeout(30);
  }}finally{for(const key of held)await page.keyboard.up(key);}
  return {result:await readT2(page),trace};
}
test('mod selection freezes the fight; ten UI resets restore identical starting states without fork leftovers',async({page},info)=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const tick=(await read(page)).snapshot.tick;await page.waitForTimeout(200);expect((await read(page)).snapshot.tick).toBe(tick);
  await page.screenshot({path:info.outputPath('mod-selection-desktop.png')});
  let reference:unknown;const resets:unknown[]=[];
  for(let i=0;i<10;i++){
    const mod=(['fork','hook','base'] as const)[i%3]!;await choose(page,mod);await page.waitForTimeout(150);
    let s=await read(page);expect(s.modTrial.running).toBe(true);expect(s.prototype.whip.mod).toBe(mod);expect(s.prototype.whip.sequence).toBe(0);
    const initial=s.modTrial.attempts.at(-1)!.start as {mod:WhipMod;[key:string]:unknown};const {mod:_,...fixture}=initial;
    if(reference)expect(fixture).toEqual(reference);else reference=fixture;
    expect(s.whipVisual.forkSegments).toBe(0);expect(s.whipVisual.bursts).toBe(0);
    await page.mouse.click(s.monsterScreen.x,s.monsterScreen.y);await page.waitForTimeout(100);await page.keyboard.press('ShiftLeft');
    await page.locator('#pve-restart').click();await expect(page.locator('#mod-trial')).toBeVisible();
    s=await read(page);expect(s.modTrial.running).toBe(false);expect(s.modTrial.requiredComplete).toBe(false);
    expect(s.modTrial.attempts.at(-1)!.result!.outcome).toBe('aborted');resets.push(s.modTrial.attempts.at(-1));
  }
  expect((await read(page)).modTrial.voluntaryStarted).toBe(0);expect(errors).toEqual([]);
  await info.attach('ten-resets',{body:JSON.stringify({resets,errors}),contentType:'application/json'});
});
test('same boss with all three profiles: real input victories, optional attempt and evidence export',async({page},info)=>{
  test.setTimeout(330000);await page.goto(url+'&order=2');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const outcomes:unknown[]=[];
  for(const mod of ['base','hook','fork'] as const){
    await choose(page,mod);const result=await fightBoss(page);
    await info.attach(`trace-${mod}`,{body:JSON.stringify(result.trace),contentType:'application/json'});
    expect(result.result.pve.outcome).toBe('victory');
    await expect(page.locator('#mod-trial')).toBeVisible();await page.locator('#mod-note').fill(`Agentenlauf ${mod}; kein menschlicher Spaßbefund.`);
    outcomes.push({mod,hp:result.result.pve.hp,armor:result.result.pve.armor,ticks:result.result.snapshot.tick,whip:result.result.prototype.whip});
  }
  let s=await read(page);expect(s.modTrial.requiredComplete).toBe(true);expect(s.modTrial.voluntaryStarted).toBe(0);
  await expect(page.locator('#mod-start')).toHaveText('Freiwilligen Zusatzversuch starten');
  await choose(page,'fork');await page.waitForTimeout(500);await page.locator('#pve-restart').click();
  s=await read(page);expect(s.modTrial.voluntaryStarted).toBe(1);expect(s.modTrial.voluntaryFinished).toBe(0);
  const download=page.waitForEvent('download');await page.locator('#mod-export').click();await (await download).saveAs(info.outputPath('mod-trial.json'));
  await page.screenshot({path:info.outputPath('mod-comparison-results.png')});
  await info.attach('boss-comparison',{body:JSON.stringify(outcomes),contentType:'application/json'});
});
test('touch landscape selection starts a real fork attempt and returns to selection without overflow',async({browser},info)=>{
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const page=await context.newPage();await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const box=await page.locator('#mod-trial').boundingBox();expect(box!.width).toBeLessThanOrEqual(844);expect(box!.height).toBeLessThanOrEqual(390);
  expect(await page.locator('#mod-trial').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const start=await page.locator('#mod-start').boundingBox();expect(start!.y+start!.height).toBeLessThanOrEqual(390);
  await page.screenshot({path:info.outputPath('mod-selection-touch.png')});
  await choose(page,'fork');await page.waitForTimeout(250);expect((await readT2(page)).prototype.whip.mod).toBe('fork');
  const s=await readT2(page);await page.touchscreen.tap(s.monsterScreen.x,s.monsterScreen.y);
  await page.waitForTimeout(150);expect((await readT2(page)).prototype.whip.sequence).toBe(1);
  await page.locator('#pve-pause').tap();await page.locator('#pve-restart').tap();await expect(page.locator('#mod-trial')).toBeVisible();
  await context.close();
});
