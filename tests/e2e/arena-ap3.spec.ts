import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { MatchSnapshot } from '../../src/core/match';
interface Fighter { style:string;lower:string;upper:string;time:number;hips:number[];facing:number;equipment:{weapon:string;parent:string;visible:boolean;gripError:number;supportError:number|null;forward:number[]} }
interface State {snapshot:Snapshot;weapons:WeaponSnapshot;match:MatchSnapshot;fighter:Fighter;camera:string;paused:boolean;render:{calls:number};frames:number[];
  bots:{id:string;fighter:Fighter;weapons:WeaponSnapshot;snapshot:Snapshot}[]}
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
function checkAim(fighter:Fighter){
  const [x,,z]=fighter.equipment.forward;
  const error=Math.atan2(Math.sin(Math.atan2(x!,z!)-fighter.facing),Math.cos(Math.atan2(x!,z!)-fighter.facing));
  expect(Math.abs(error)).toBeLessThan(.02);
  if(fighter.equipment.weapon!=='arc')expect(fighter.equipment.supportError).toBeLessThan(.04);
}
test.use({headless:false,trace:'off'});

for(const mobile of [false,true])test(`AP3 ${mobile?'touch':'desktop'} hand weapons, motion, teams and respawn`,async({playwright,channel},info)=>{
  test.setTimeout(110_000);
  const browser=await playwright.chromium.launch({channel,headless:false});
  const viewport=mobile?{width:667,height:375}:{width:1366,height:768};
  const context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1});
  const page=await context.newPage(),errors:string[]=[],failed:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.text().includes('THREE.PropertyBinding'))errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  const click=(id:string)=>mobile?page.locator(id).tap():page.locator(id).click();
  const cdp=await context.newCDPSession(page);let touches=false;
  const touch=async(points:{id:number;x:number;y:number}[])=>{if(touches)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    if(points.length)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});touches=!!points.length;};
  const capture=async(name:string,id='player')=>{
    const data=await page.evaluate(id=>(window as unknown as {__coreArena:{portrait(id:string):string}}).__coreArena.portrait(id),id);
    writeFileSync(info.outputPath(name+'.png'),Buffer.from(data.split(',')[1]!,'base64'));
  };
  try{
    await page.goto('./');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');await click('#match-start');
    const box=mobile?(await page.locator('#touch-stick').boundingBox())!:null;
    const center=box?{x:box.x+box.width/2,y:box.y+box.height/2}:{x:0,y:0};
    const move=async(axis:'x'|'z',target:number)=>{
      const sign=Math.sign(target-(await read(page)).snapshot.position[axis]);
      const key=axis==='x'?sign>0?'KeyD':'KeyA':sign>0?'KeyS':'KeyW';
      if(mobile)await touch([{id:1,x:center.x+(axis==='x'?sign*40:0),y:center.y+(axis==='z'?sign*40:0)}]);else await page.keyboard.down(key);
      try{await page.waitForFunction(({axis,target,sign})=>((window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position[axis]-target)*sign>=-.08,{axis,target,sign},{timeout:6000});}
      finally{if(mobile)await touch([]);else await page.keyboard.up(key);}
    };
    // Collect both real weapon fields. No inventory, position or HP writes.
    await move('z',4);await expect(page.locator('#weapon-pulse')).toBeEnabled();
    await move('z',10);await move('x',-20);await move('z',3);await expect(page.locator('#weapon-rail')).toBeEnabled();await move('x',-18);
    const samples:unknown[]=[];
    for(const weapon of ['arc','pulse','rail']){
      await click(`#weapon-${weapon}`);await page.waitForTimeout(350);
      let state=await read(page);expect(state.fighter.style).toBe('arena-player');expect(state.fighter.equipment.weapon).toBe(weapon);
      expect(state.fighter.equipment.parent).toBe('handr');expect(state.fighter.equipment.gripError).toBeLessThan(.001);
      checkAim(state.fighter);
      await capture(weapon+'-detail');
      if(mobile)await click('#touch-jump');else await page.keyboard.press('Space');
      await expect.poll(async()=>(await read(page)).fighter.lower,{intervals:[16]}).toBe('jump');
      state=await read(page);expect(state.fighter.equipment.gripError).toBeLessThan(.001);samples.push({weapon,jump:state.fighter});
      await expect.poll(async()=>(await read(page)).snapshot.grounded).toBe(true);
      const aim={x:viewport.width*.55,y:viewport.height*.45};
      if(mobile)await touch([{id:2,...aim}]);else{await page.mouse.move(aim.x,aim.y);await page.mouse.down();}
      try{await expect.poll(async()=>(await read(page)).fighter.upper,{intervals:[16]}).toBe(`shot-${weapon}`);checkAim((await read(page)).fighter);}
      finally{if(mobile)await touch([]);else await page.mouse.up();}
      await page.screenshot({path:info.outputPath(weapon+'-play.png')});
      await move('x',-17.4);await move('x',-18);
      await click('#arena-menu');const frozen=await read(page);await page.waitForTimeout(250);
      expect((await read(page)).fighter).toEqual(frozen.fighter);await click('#resume');
      samples.push({weapon,pose:frozen.fighter});
    }
    await click('#arena-menu');await click('#camera-toggle');await click('#resume');await capture('isometric-detail');
    await click('#arena-menu');await click('#arena-home');await expect(page.locator('#team-start')).toBeVisible();
    await page.locator('#bot-difficulty').selectOption('hard');await click('#team-start');await page.waitForTimeout(500);
    const team=await read(page);expect(team.bots.find(b=>b.id==='ally')!.fighter.style).toBe('arena-wingman');
    expect(team.bots.filter(b=>b.id!=='ally').every(b=>b.fighter.style==='arena-rival')).toBe(true);
    await capture('wingman-detail','ally');await capture('rival-detail','rival');await page.screenshot({path:info.outputPath('team-play.png')});
    const botShots:unknown[]=[];let sawBotJump=false;
    const until=Date.now()+25_000;
    while(Date.now()<until){const s=await read(page);
      for(const b of s.bots){sawBotJump ||= b.fighter.lower==='jump';if(b.fighter.upper.startsWith('shot-')){checkAim(b.fighter);botShots.push({id:b.id,weapon:b.weapons.selected,fighter:b.fighter});}}
      if(!s.match.actors.player!.alive)break;await page.waitForTimeout(45);
    }
    expect(botShots.length).toBeGreaterThan(0);await expect.poll(async()=>(await read(page)).match.actors.player!.alive,{timeout:20000}).toBe(false);
    expect((await read(page)).fighter.equipment.visible).toBe(false);
    await expect.poll(async()=>(await read(page)).match.actors.player!.life,{timeout:7000}).toBeGreaterThan(1);
    expect((await read(page)).fighter.equipment.visible).toBe(true);expect((await read(page)).fighter.equipment.weapon).toBe('arc');
    await page.screenshot({path:info.outputPath('respawn.png')});
    await click('#arena-menu');const paused=await read(page);await page.waitForTimeout(250);
    expect((await read(page)).bots.map(b=>b.fighter)).toEqual(paused.bots.map(b=>b.fighter));
    await click('#match-restart');expect((await read(page)).fighter.equipment.weapon).toBe('arc');
    expect(errors).toEqual([]);expect(failed).toEqual([]);
    await info.attach('AP3-results',{body:JSON.stringify({mobile,viewport,samples,team,botShots,sawBotJump,final:await read(page),errors,failed}),contentType:'application/json'});
  }catch(error){await page.screenshot({path:info.outputPath('failure.png')});await info.attach('failure-state',{body:JSON.stringify(await read(page)),contentType:'application/json'});throw error;}
  finally{await browser.close();}
});
