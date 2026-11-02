import {test,expect} from '@playwright/test';
import {readT2,walkT2,defeatT2} from './adventureT2Controls';
test.use({headless:false,trace:'off'});
const url='./?mode=pve&level=stone&adventure=1&combat=prototype';

test('T2 Legacy preserves the chosen camera on regular level restart',async({page})=>{
  await page.goto('./?mode=pve&level=stone&adventure=1');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  const camera=()=>page.evaluate(()=>(window as unknown as {__coreArena:{read():{camera:string}}}).__coreArena.read().camera);
  expect(await camera()).toBe('side');await page.locator('#camera-toggle').click();const chosen=await camera();expect(chosen).not.toBe('side');
  await page.locator('#pve-restart').click();expect(await camera()).toBe(chosen);
  expect((await readT2(page)).prototype).toBeNull();expect((await readT2(page)).weapons.ownsPulse).toBe(false);
});

for(const reserve of [false,true])test(`T2 complete prototype mission, reserve ${reserve}, deaths, checkpoint, core, relay, exit`,async({page},info)=>{
  test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await readT2(page)).lab).toBeNull();expect((await readT2(page)).checkpoint).toBe(false);
  expect((await readT2(page)).weapons.ownsPulse).toBe(false);
  expect((await readT2(page)).pickupVisuals.filter(p=>p.visible).every(p=>!p.id.includes('ammo')&&!p.id.includes('pulse'))).toBe(true);
  // Actual pre-checkpoint death must restore both guards and arrival, without importing the lab fixture.
  await walkT2(page,0,26);await expect.poll(async()=>(await readT2(page)).pve.outcome,{timeout:30000}).toBe('defeat');
  await page.locator('#pve-again').click();expect((await readT2(page)).enemies.every(r=>r.hp===70)).toBe(true);
  expect((await readT2(page)).snapshot.position.z).toBeCloseTo(33,1);
  await page.locator('#pve-pause').click();const tick=(await readT2(page)).snapshot.tick;
  const other=await page.context().newPage();await other.goto('about:blank');await page.bringToFront();await other.close();
  await page.waitForTimeout(200);expect((await readT2(page)).snapshot.tick).toBe(tick);await page.locator('#resume').click();
  await walkT2(page,0,27);await defeatT2(page,0);await page.screenshot({path:info.outputPath('runner-cleared.jpg'),quality:75});
  await walkT2(page,0,7);await defeatT2(page,1);
  if(reserve){await walkT2(page,0,2);await walkT2(page,-12.5,2);await page.keyboard.press('KeyE');
    await expect.poll(async()=>(await readT2(page)).mission.reserveRecovered).toBe(true);await walkT2(page,0,2);}
  await walkT2(page,0,-14);await page.keyboard.press('KeyW',{delay:400});
  expect((await readT2(page)).snapshot.position.z).toBeGreaterThan(-16);expect((await readT2(page)).checkpoint).toBe(false);
  await walkT2(page,0,-8);await walkT2(page,-1,-8);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.consoleActive).toBe(true);
  await walkT2(page,0,-8);await walkT2(page,0,-14);expect((await readT2(page)).pve.armor).toBe(reserve?75:50);
  await walkT2(page,0,-21);await expect.poll(async()=>(await readT2(page)).pve.outcome,{timeout:35000}).toBe('defeat');
  await page.locator('#pve-again').click();const retry=await readT2(page);
  expect(retry.enemies.every(r=>r.hp===0)).toBe(true);expect(retry.pve.bossHp).toBe(900);expect(retry.pve.hp).toBe(100);
  expect(retry.pve.armor).toBe(reserve?75:50);expect(retry.weapons.ammo).toBe(0);expect(retry.prototype.whip.sequence).toBe(0);
  await walkT2(page,0,-21);const won=await defeatT2(page,'boss');await info.attach('boss',{body:JSON.stringify(won),contentType:'application/json'});
  await page.screenshot({path:info.outputPath('core-drop.jpg'),quality:75});expect(won.result.completed).toBe(false);
  const core=won.result.core!.position;await walkT2(page,core.x,core.z);expect((await readT2(page)).core?.collected).toBe(true);
  await walkT2(page,0,core.z);await walkT2(page,0,-39);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.relayActive).toBe(true);
  await page.keyboard.down('KeyW');try{await expect.poll(async()=>(await readT2(page)).completed).toBe(true);}finally{await page.keyboard.up('KeyW');}
  await page.screenshot({path:info.outputPath('complete.jpg'),quality:75});await page.locator('#pve-again').click();
  expect((await readT2(page)).mission.consoleActive).toBe(false);expect((await readT2(page)).mission.reserveRecovered).toBe(false);
  expect((await readT2(page)).enemies.every(r=>r.hp===70)).toBe(true);expect(errors).toEqual([]);
});

test('T2 limited Pulse comparison: same start, switch persistence, real victory, bounded restart and Legacy isolation',async({page},info)=>{
  test.setTimeout(150000);await page.goto(url+'&lab=boss&loadout=pulse');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.locator('#lab-start').click();let s=await readT2(page);expect(s.weapons.ammo).toBe(12);expect(s.pve.bossHp).toBe(900);
  await page.keyboard.press('Digit2');await page.mouse.click(s.monsterScreen.x,s.monsterScreen.y);await page.waitForTimeout(250);
  const ammo=(await readT2(page)).weapons.ammo;expect(ammo).toBeLessThan(12);
  await page.keyboard.press('Digit1');await page.keyboard.press('Digit2');expect((await readT2(page)).weapons.ammo).toBe(ammo);
  await page.locator('#lab-start').click();const result=await defeatT2(page,'boss',true);
  await info.attach('complement',{body:JSON.stringify(result),contentType:'application/json'});
  const resources:unknown[]=[];
  for(let i=0;i<20;i++){await page.locator('#lab-start').click();await page.waitForTimeout(40);s=await readT2(page);
    expect(s.weapons.ammo).toBe(12);expect(s.weapons.projectiles).toHaveLength(0);expect(s.prototype.whip.sequence).toBe(0);resources.push(s.lab);}
  await info.attach('resets',{body:JSON.stringify(resources),contentType:'application/json'});
  await page.selectOption('#lab-profile','legacy');await page.selectOption('#lab-weapon','pulse');await page.locator('#lab-start').click();s=await readT2(page);
  expect(s.pve.bossHp).toBe(600);expect(s.pve.exchange).toBeUndefined();expect(s.weapons.ammo).toBe(54);expect(s.prototype).toBeNull();
});
