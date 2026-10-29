import { test,expect } from '@playwright/test';
test.use({headless:false});

test('KayKit walking in eight directions never accumulates a body spin',async({page},info)=>{
  test.setTimeout(60_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./?mode=pve&level=stone&adventure=1&explore=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  type State={fighter:{lower:string;hips:number[];chest:number[];legYaw:number};camera:string;paused:boolean};
  const read=()=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
  const samples:State[]=[];
  // Opposite pairs stay in the open arrival area. Aim independently of movement.
  await page.mouse.move(1100,570);
  for(const keys of [['KeyD'],['KeyA'],['KeyW'],['KeyS'],['KeyD','KeyW'],['KeyA','KeyS'],['KeyD','KeyS'],['KeyA','KeyW']]){
    for(const key of keys)await page.keyboard.down(key);
    await expect.poll(async()=>(await read()).fighter.lower).toBe('walk');
    for(let i=0;i<12;i++){
      await page.waitForTimeout(90);
      const state=await read();samples.push(state);
      // Walking_A has a constant neutral hips rotation; only the bounded .7rad waist offset may turn it.
      const angle=2*Math.acos(Math.min(1,Math.abs(state.fighter.hips[3]!)));
      expect(angle,`body rotated beyond its waist range while holding ${keys.join('+')}`).toBeLessThan(.76);
    }
    for(const key of keys)await page.keyboard.up(key);
  }
  await expect.poll(async()=>(await read()).fighter.lower).toBe('idle');
  await page.locator('#pve-pause').click();await expect.poll(async()=>(await read()).paused).toBe(true);
  const paused=await read();await page.waitForTimeout(350);
  expect((await read()).fighter.hips).toEqual(paused.fighter.hips);
  expect((await read()).fighter.chest).toEqual(paused.fighter.chest);
  await page.locator('#resume').click();
  expect((await read()).camera).toBe('side');expect(errors).toEqual([]);
  await info.attach('rotation-samples',{body:JSON.stringify(samples),contentType:'application/json'});
});

test('KayKit character walks, sprints, jumps, aims and collects a disappearing particle pickup',async({page},info)=>{
  test.setTimeout(60_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.text().includes('THREE.PropertyBinding'))errors.push(msg.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./?mode=pve&level=stone&adventure=1&explore=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  type State={snapshot:{position:{x:number;y:number;z:number};grounded:boolean};fighter:{model:string;lower:string;upper:string;time:number;bones:number;leg:number[]};
    weapons:{ownsPulse:boolean};pickupVisuals:{id:string;visible:boolean;particles:boolean}[]};
  const read=()=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
  expect((await read()).fighter.model).toBe('kaykit-mannequin-medium');expect((await read()).fighter.bones).toBeGreaterThan(15);
  await page.mouse.move(1000,400);
  await page.screenshot({path:info.outputPath('arrival.png')});
  await page.keyboard.down('KeyD');
  await expect.poll(async()=>(await read()).fighter.lower).toBe('walk');
  const walking=(await read()).fighter.leg;await page.waitForTimeout(180);
  expect((await read()).fighter.leg).not.toEqual(walking);
  await page.keyboard.down('Shift');await expect.poll(async()=>(await read()).fighter.lower).toBe('run');
  await page.keyboard.up('Shift');await page.keyboard.up('KeyD');
  await page.keyboard.press('Space');await expect.poll(async()=>(await read()).fighter.lower,{intervals:[20]}).toBe('jump');
  await page.screenshot({path:info.outputPath('jump.png')});
  await expect.poll(async()=>(await read()).snapshot.grounded).toBe(true);
  await page.mouse.down();await expect.poll(async()=>(await read()).fighter.upper,{intervals:[20]}).toBe('shot-arc');await page.mouse.up();
  await page.keyboard.down('KeyD');
  await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position.z<20.6);
  await page.keyboard.up('KeyD');
  await page.screenshot({path:info.outputPath('energy-pickup.png')});
  await page.keyboard.down('KeyD');await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position.z<18.6);await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyW');await expect.poll(async()=>(await read()).weapons.ownsPulse).toBe(true);await page.keyboard.up('KeyW');
  await expect.poll(async()=>(await read()).pickupVisuals.find(p=>p.id==='adventure-pulse')!.visible).toBe(false);
  await page.keyboard.press('Digit2');await page.mouse.down();
  await expect.poll(async()=>(await read()).fighter.upper,{intervals:[20]}).toBe('shot-pulse');await page.mouse.up();
  await page.screenshot({path:info.outputPath('collected.png')});
  await page.mouse.move(380,600);await page.waitForTimeout(250);
  await page.evaluate(()=>(window as unknown as {__coreArena:{fighterView():void}}).__coreArena.fighterView());
  await page.screenshot({path:info.outputPath('character-detail.png')});
  expect(errors).toEqual([]);await info.attach('presentation-state',{body:JSON.stringify(await read()),contentType:'application/json'});
});
