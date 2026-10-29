import { test,expect,type Page } from '@playwright/test';
import type { PveSnapshot } from '../../src/core/pve';
import type { Snapshot } from '../../src/core/types';
import type { WeaponSnapshot } from '../../src/core/combat';
import type { RunnerState } from '../../src/core/stoneRunner';

interface State { snapshot:Snapshot;pve:PveSnapshot;bossActive:boolean;checkpoint:boolean;completed:boolean;weapons:WeaponSnapshot;
  mission:{consoleActive:boolean;relayActive:boolean;entryClosed:boolean};
  core:{position:{x:number;y:number;z:number};collected:boolean}|null;
  enemies:(RunnerState & {screen:{x:number;y:number}})[];monsterScreen:{x:number;y:number};hp:number;armor:number }
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const url='./?mode=pve&level=stone&adventure=1';
test.use({headless:false});
// Real inputs only: jump over a close swing/wave, walk out of the locked eruption.
function bossDodge(s:State){
  const p=s.snapshot.position,b=s.pve,distance=Math.hypot(p.x-b.center.x,p.z-b.center.z);
  const eruption=b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')&&Math.hypot(p.x-b.target.x,p.z-b.target.z)<3.8;
  return {x:eruption?(b.target.x>0?-1:1):0,
    jump:s.snapshot.grounded&&(b.phase==='melee'&&b.phaseTick<12||b.kind==='wave'&&(
      b.phase==='warning'&&b.phaseTick>=84&&distance<5||b.phase==='attack'&&distance>b.waveRadius&&distance-b.waveRadius<2.8))};
}
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
      if(index==='boss'){
        const dodge=bossDodge(s);
        for(const [key,direction] of [['KeyS',1],['KeyW',-1]] as const)
          if(dodge.x===direction)await page.keyboard.down(key);else await page.keyboard.up(key);
        if(dodge.jump)await page.keyboard.press('Space');
      }
      await page.mouse.move(point.x,point.y); await page.waitForTimeout(50);
    }
    throw new Error('Enemy survived real fire');
  } finally {await page.mouse.up();await page.keyboard.up('KeyS');await page.keyboard.up('KeyW');}
}
test('menu entry, mission console, checkpoint death and retry, required core and relay, physical exit and full reset',async({page},info)=>{
  test.setTimeout(180_000); const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.screenshot({path:info.outputPath('menu.png')}); await page.locator('#adventure-start').click();
  await expect(page).toHaveURL(/adventure=1/); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await read(page)).enemies).toHaveLength(2); expect((await read(page)).bossActive).toBe(false);
  await expect(page.locator('#room-hint')).toContainText('Anlage reaktivieren');
  await page.screenshot({path:info.outputPath('mission-arrival.png')});
  await walk(page,0,27); await page.screenshot({path:info.outputPath('runner.png')}); await fireAt(page,0);
  await walk(page,0,18.5); await walk(page,-3,18.5); await page.locator('#weapon-pulse').click();
  await expect(page.locator('#room-hint')).not.toContainText('Pulse am Durchgang aufnehmen');
  await walk(page,0,18.5); await walk(page,0,7); await fireAt(page,1);
  await walk(page,0,8); await walk(page,11,8); await walk(page,11,6.5);
  expect((await read(page)).weapons.ammo).toBe(54);
  await walk(page,0,6.5); await walk(page,0,-14);
  await page.keyboard.press('KeyD',{delay:650});
  expect((await read(page)).snapshot.position.z).toBeGreaterThan(-16);
  expect((await read(page)).checkpoint).toBe(false);expect((await read(page)).bossActive).toBe(false);
  await page.keyboard.press('KeyE');expect((await read(page)).mission.consoleActive).toBe(false);
  await walk(page,0,-8);await walk(page,-1,-8);
  await expect(page.locator('#mission-interact')).toHaveText('E · Konsole starten');
  await page.screenshot({path:info.outputPath('mission-console.png')});
  await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await read(page)).mission.consoleActive).toBe(true);
  await expect(page.locator('#mission-interact')).toHaveText('Verbindung steht');
  await page.keyboard.press('KeyE');
  await page.screenshot({path:info.outputPath('mission-powered.png')});
  await walk(page,0,-8);await walk(page,0,-14); expect((await read(page)).bossActive).toBe(false);
  expect((await read(page)).checkpoint).toBe(true); expect((await read(page)).armor).toBe(50);
  await page.screenshot({path:info.outputPath('checkpoint.png')});
  await walk(page,0,-21); expect((await read(page)).bossActive).toBe(true);
  // First attempt: real boss attacks kill the stationary player, then use the checkpoint button.
  await expect.poll(async()=>(await read(page)).pve.outcome,{timeout:35000}).toBe('defeat');
  await expect(page.locator('#pve-again')).toHaveText('Am Ruhepunkt versuchen');
  await page.screenshot({path:info.outputPath('checkpoint-defeat.png')});
  await page.locator('#pve-again').click();
  const retry=await read(page); expect(retry.snapshot.position.z).toBeCloseTo(-14,1);
  expect(retry.enemies.every(e=>e.hp===0)).toBe(true); expect(retry.hp).toBe(100);expect(retry.armor).toBe(50);
  expect(retry.weapons.ammo).toBe(54);expect(retry.bossActive).toBe(false);expect(retry.pve.bossHp).toBe(600);
  expect(retry.mission.consoleActive).toBe(true);expect(retry.mission.relayActive).toBe(false);
  await expect(page.locator('#campaign-story')).toBeHidden();
  await walk(page,0,-21);
  await page.screenshot({path:info.outputPath('boss-emergence.png')});
  await expect.poll(async()=>(await read(page)).pve.phase,{timeout:5000}).not.toBe('emerging');
  await page.screenshot({path:info.outputPath('boss.png')});
  await fireAt(page,'boss');
  await expect(page.locator('#match-result')).toBeHidden();
  await expect(page.locator('#room-name')).toHaveText('Relaisanlage');
  const won=await read(page); expect(won.pve.bossHp).toBe(0);expect(won.enemies.every(e=>e.hp===0)).toBe(true);
  expect(won.completed).toBe(false);
  expect(won.core?.collected).toBe(false);
  await page.waitForTimeout(1100); // Let the defeated body settle so the drop is visible.
  await page.screenshot({path:info.outputPath('boss-core-drop.png')});
  await walk(page,won.core!.position.x,won.core!.position.z);
  expect((await read(page)).core?.collected).toBe(true);
  await expect(page.locator('#room-hint')).toContainText('Steinkern geborgen');
  await walk(page,0,-40);await page.keyboard.press('KeyD',{delay:800});
  expect((await read(page)).snapshot.position.z).toBeGreaterThan(-42);expect((await read(page)).completed).toBe(false);
  await walk(page,0,-39);await expect(page.locator('#mission-interact')).toHaveText('E · Steinkern einsetzen');
  await page.screenshot({path:info.outputPath('mission-relay.png')});
  await page.keyboard.press('KeyE');await expect.poll(async()=>(await read(page)).mission.relayActive).toBe(true);
  await expect(page.locator('#room-name')).toHaveText('Außenposten online');
  await page.screenshot({path:info.outputPath('mission-online.png')});
  await walk(page,0,-40); await page.screenshot({path:info.outputPath('open-gate.png')});
  await page.keyboard.down('KeyD');
  try { await expect(page.locator('#match-result')).toBeVisible(); } finally { await page.keyboard.up('KeyD'); }
  expect((await read(page)).snapshot.position.z).toBeLessThan(-45);expect((await read(page)).completed).toBe(true);
  await expect(page.locator('#result-title')).toHaveText('Der verwitterte Hof ist frei.');
  await page.screenshot({path:info.outputPath('completion.png')});
  await page.locator('#pve-again').click();
  await expect.poll(async()=>(await read(page)).enemies.every(e=>e.hp===70)).toBe(true);
  expect((await read(page)).bossActive).toBe(false);expect((await read(page)).hp).toBe(100);
  expect((await read(page)).weapons.ownsPulse).toBe(false);expect(errors).toEqual([]);
  expect((await read(page)).checkpoint).toBe(false);
  expect((await read(page)).core).toBeNull();
  expect((await read(page)).mission.consoleActive).toBe(false);expect((await read(page)).mission.relayActive).toBe(false);
  await expect(page.locator('#mission-message')).toContainText('Lieferung angekommen');
  await page.locator('#pve-pause').click(); await page.locator('#adventure-home').click();
  await expect(page.locator('#adventure-start')).toBeVisible();
  await info.attach('actual-victory',{body:JSON.stringify({retry,won,errors}),contentType:'application/json'});
});

test('distant shot wakes guard, entry seal blocks retreat, platform eruption hits and can be dodged',async({page},info)=>{
  test.setTimeout(120_000);const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await walk(page,0,27);await fireAt(page,0);
  await walk(page,0,18.5);await walk(page,-3,18.5);await page.locator('#weapon-pulse').click();
  await walk(page,0,18.5);await walk(page,0,12.5);
  const asleep=await read(page);expect(asleep.enemies[1]!.phase).toBe('idle');
  await page.mouse.click(asleep.enemies[1]!.screen.x,asleep.enemies[1]!.screen.y);
  await expect.poll(async()=>(await read(page)).enemies[1]!.hp).toBeLessThan(70);
  await expect.poll(async()=>(await read(page)).enemies[1]!.center.z).toBeGreaterThan(3);
  await page.screenshot({path:info.outputPath('guard-alert.png')});await fireAt(page,1);
  await walk(page,0,-8);await walk(page,-1,-8);await page.keyboard.press('KeyE');await walk(page,0,-8);
  await walk(page,0,-14);await walk(page,0,-21);
  await page.keyboard.down('KeyA');await page.keyboard.press('Space');
  await page.waitForTimeout(800);await page.keyboard.up('KeyA');
  expect((await read(page)).snapshot.position.z).toBeLessThan(-16.45);
  await page.screenshot({path:info.outputPath('closed-threshold.png')});
  // Walk the actual stairs onto the healing plateau; no position/HP mutation.
  await walk(page,0,-23);await walk(page,-12,-23);
  expect((await read(page)).snapshot.surface).toBe('boss-health-plateau');
  await page.waitForFunction(()=>{
    const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
    return s.pve.phase==='warning'&&s.pve.kind==='eruption'&&s.pve.target.y>1;
  });
  const before=await read(page);
  await expect(page.locator('#pve-telegraph')).toHaveText('BODENAUSBRUCH · Kreis verlassen!');
  await page.screenshot({path:info.outputPath('plateau-warning.png')});
  await expect.poll(async()=>(await read(page)).pve.hitsTaken).toBeGreaterThan(before.pve.hitsTaken);
  const hit=await read(page);
  await page.waitForFunction(()=>{
    const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
    return s.pve.phase==='warning'&&s.pve.kind==='eruption';
  });
  // Leave the locked circle to the right, down the same stairs.
  await page.keyboard.press('KeyS',{delay:750});
  await page.waitForTimeout(700);
  const dodged=await read(page);expect(dodged.pve.hitsTaken).toBe(hit.pve.hitsTaken);
  expect(errors).toEqual([]);
  await info.attach('encounter-checks',{body:JSON.stringify({asleep,before,hit,dodged,errors}),contentType:'application/json'});
});

test('touch melee kill, menu restart, actual defeat and retry',async({browser},info)=>{
  test.setTimeout(75_000);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto('./'); await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    await page.locator('#adventure-start').tap(); await expect(page).toHaveURL(/adventure=1/);
    await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
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

test('touch full mission: simultaneous console input, checkpoint retry, core, relay, exit and full reset',async({browser},info)=>{
  test.setTimeout(180_000);
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  try {
    await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    const cdp=await context.newCDPSession(page);
    const release=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    const move=async(x:number,z:number)=>{
      for(const [axis,target] of [['z',z],['x',x]] as const) for(let i=0;i<10;i++) {
        const delta=target-(await read(page)).snapshot.position[axis];if(Math.abs(delta)<.3) break;
        const direction=Math.sign(delta),box=(await page.locator('#touch-stick').boundingBox())!;
        const point={id:1,x:box.x+box.width/2+(axis==='z'?-direction*42:0),y:box.y+box.height/2+(axis==='x'?direction*42:0)};
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
        try { await page.waitForFunction(({axis,target,direction})=>
          ((window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position[axis]-target)*direction>=-.2,
          {axis,target,direction},{timeout:10000}); } finally {await release();}
      }
      const p=(await read(page)).snapshot.position;expect(Math.hypot(p.x-x,p.z-z)).toBeLessThan(.6);
    };
    const fire=async(index:number|'boss')=>{
      const initial=await read(page),point=index==='boss'?initial.monsterScreen:initial.enemies[index]!.screen;
      const stick=(await page.locator('#touch-stick').boundingBox())!,jump=(await page.locator('#touch-jump').boundingBox())!;
      let previousIds='2';
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,...point}]});
      try {
        for(let i=0;i<400;i++) {
          const s=await read(page);expect(s.pve.outcome).not.toBe('defeat');
          if(index==='boss'?s.pve.bossHp===0:s.enemies[index]!.hp===0) return;
          const p=index==='boss'?s.monsterScreen:s.enemies[index]!.screen;
          const dodge=index==='boss'?bossDodge(s):{x:0,jump:false};
          const points=[{id:2,...p}];
          if(dodge.x)points.push({id:1,x:stick.x+stick.width/2,y:stick.y+stick.height/2+dodge.x*42});
          if(dodge.jump)points.push({id:3,x:jump.x+jump.width/2,y:jump.y+jump.height/2});
          const ids=points.map(p=>p.id).sort().join('');
          if(ids!==previousIds){
            await release();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});previousIds=ids;
          }else await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points});
          await page.waitForTimeout(50);
        }
        throw new Error('Enemy survived touch fire');
      } finally {await release();}
    };
    await move(0,27);await fire(0);await move(0,18.5);await move(-3,18.5);await page.locator('#weapon-pulse').tap();
    await move(0,18.5);await move(0,7);await fire(1);
    await move(0,-8);await move(-1,-8);
    await expect(page.locator('#mission-interact')).toHaveText('Konsole starten');
    await page.screenshot({path:info.outputPath('mobile-console.png')});
    const stick=(await page.locator('#touch-stick').boundingBox())!,button=(await page.locator('#mission-interact').boundingBox())!;
    const fingers=[{id:1,x:stick.x+stick.width/2+12,y:stick.y+stick.height/2},{id:2,x:520,y:190}];
    const interactionFinger={id:3,x:button.x+button.width/2,y:button.y+button.height/2};
    const ammo=(await read(page)).weapons.ammo;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers});
    await expect.poll(async()=>(await read(page)).snapshot.velocity.z).toBeLessThan(-1);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...fingers,interactionFinger]});
    await expect.poll(async()=>(await read(page)).mission.consoleActive).toBe(true);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[interactionFinger]});
    await page.waitForTimeout(180);
    expect((await read(page)).snapshot.velocity.z).toBeLessThan(-1);
    expect((await read(page)).weapons.ammo).toBeLessThan(ammo);
    await release();await page.screenshot({path:info.outputPath('mobile-powered.png')});
    await move(0,-8);await move(0,-14);
    expect((await read(page)).checkpoint).toBe(true);
    await page.screenshot({path:info.outputPath('mobile-checkpoint.png')});
    await move(0,-21);
    await expect.poll(async()=>(await read(page)).pve.outcome,{timeout:35000}).toBe('defeat');
    await page.screenshot({path:info.outputPath('mobile-retry.png')});
    await page.locator('#pve-again').tap();
    const retry=await read(page);expect(retry.snapshot.position.z).toBeCloseTo(-14,1);
    expect(retry.hp).toBe(100);expect(retry.weapons.ammo).toBe(54);expect(retry.enemies.every(e=>e.hp===0)).toBe(true);
    expect(retry.mission.consoleActive).toBe(true);expect(retry.mission.relayActive).toBe(false);
    await expect(page.locator('#campaign-story')).toBeHidden();
    await move(0,-21);await expect.poll(async()=>(await read(page)).pve.phase,{timeout:5000}).not.toBe('emerging');
    await fire('boss');await expect(page.locator('#match-result')).toBeHidden();
    const won=await read(page);expect(won.mission.relayActive).toBe(false);expect(won.core?.collected).toBe(false);
    await move(won.core!.position.x,won.core!.position.z);
    expect((await read(page)).core?.collected).toBe(true);
    await move(0,-39);await expect(page.locator('#mission-interact')).toHaveText('Steinkern einsetzen');
    await page.screenshot({path:info.outputPath('mobile-relay.png')});
    await page.locator('#mission-interact').tap();
    await expect.poll(async()=>(await read(page)).mission.relayActive).toBe(true);
    await page.screenshot({path:info.outputPath('mobile-online.png')});
    await move(0,-40);
    await page.screenshot({path:info.outputPath('mobile-open-gate.png')});
    const box=(await page.locator('#touch-stick').boundingBox())!;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2+42,y:box.y+box.height/2}]});
    try {await expect(page.locator('#match-result')).toBeVisible();} finally {await release();}
    expect((await read(page)).completed).toBe(true);expect((await read(page)).snapshot.position.z).toBeLessThan(-45);
    await page.screenshot({path:info.outputPath('mobile-completion.png')});
    await page.locator('#pve-again').tap();
    const reset=await read(page);expect(reset.checkpoint).toBe(false);expect(reset.core).toBeNull();
    expect(reset.mission.consoleActive).toBe(false);expect(reset.mission.relayActive).toBe(false);
    expect(reset.enemies.every(e=>e.hp===70)).toBe(true);expect(reset.weapons.ownsPulse).toBe(false);
    await page.locator('#pve-pause').tap();await page.locator('#adventure-home').tap();
    await expect(page.locator('#adventure-start')).toBeVisible();
    await info.attach('mobile-mission',{body:JSON.stringify({retry,won,reset,errors}),contentType:'application/json'});
    expect(errors).toEqual([]);
  } finally {await context.close();}
});
