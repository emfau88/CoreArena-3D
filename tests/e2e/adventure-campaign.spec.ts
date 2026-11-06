import {test,expect} from '@playwright/test';
import {readT2,walkT2,defeatCampaign} from './adventureCampaignControls';
const root='./?mode=pve&adventure=1&combat=prototype',stone=root+'&level=stone&environment=warden-ravine',hub=root+'&campaign=menu';
const saveKey='corearena.adventure.prototype.campaign.v1';
const saved=(page:import('@playwright/test').Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'null'),saveKey);
test('campaign hub handles empty, corrupt, future and blocked storage; reload preserves valid unlocks and foreign keys',async({page})=>{
  await page.goto(hub);await expect(page.locator('#adventure-hub')).toBeVisible();await expect(page.locator('[data-level="frost"]')).toBeDisabled();
  await page.evaluate(key=>{localStorage.setItem('arena-qa','keep');localStorage.setItem(key,JSON.stringify({version:1,completed:['stone'],defeated:['stone'],selectedMod:'hook',next:'frost',hp:999}));},saveKey);
  await page.reload();await expect(page.locator('#campaign-continue')).toContainText('Kristallkluft');await expect(page.locator('[data-practice="stone"]')).toBeEnabled();
  await expect(page.locator('#campaign-loadout select')).toHaveValue('hook');expect(await page.evaluate(()=>localStorage.getItem('arena-qa'))).toBe('keep');
  await page.selectOption('#practice-mod','fork');await page.locator('[data-practice="stone"]').click();await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.locator('#pve-pause').click();await page.selectOption('#adventure-settings select','base');await page.locator('#resume').click();
  await expect(page.locator('#room-name')).toContainText('Gabelspitze');expect((await readT2(page)).prototype.whip.mod).toBe('fork');
  await page.locator('#pve-restart').click();await expect(page.locator('#room-name')).toContainText('Basis');expect((await saved(page)).selectedMod).toBe('hook');
  await page.locator('#pve-pause').click();await page.getByRole('button',{name:'Kampagne / Bossübung',exact:true}).first().click();await expect(page.locator('#adventure-hub')).toBeVisible();
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});
  await page.selectOption('#campaign-loadout select','base');await expect(page.locator('#campaign-save-status')).toContainText('nicht verfügbar');await page.reload();
  await page.evaluate(key=>localStorage.setItem(key,'{'),saveKey);await page.reload();await expect(page.locator('#campaign-save-status')).toContainText('nicht gelesen');
  await page.evaluate(key=>localStorage.setItem(key,'{"version":99}'),saveKey);await page.reload();await expect(page.locator('#campaign-save-status')).toContainText('Unbekannte');
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked for QA');}}));
  await page.reload();await expect(page.locator('#campaign-save-status')).toContainText('nicht verfügbar');await page.locator('#campaign-continue').click();
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');expect((await readT2(page)).pve.hp).toBe(100);
  await page.locator('#pve-pause').click();await page.getByRole('button',{name:'Kampagne / Bossübung',exact:true}).first().click();await expect(page.locator('#adventure-hub')).toBeVisible();
});

test.describe('mobile campaign',()=>{
  test.use({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  test('touch menus, attacks, orientation and ten retries keep the same camera and resources',async({page},info)=>{
    test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(root+'&level=frost&trial=frost-mission');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    await expect(page.locator('#touch-jump')).toBeVisible();expect((await readT2(page)).camera).toBe('side');
    const initial=await page.evaluate(()=>(window as any).__coreArena.read().renderResources);
    await page.locator('#touch-jump').tap();await expect.poll(async()=>(await readT2(page)).snapshot.position.y).toBeGreaterThan(.5);
    const aim=(await readT2(page)).enemies[0]!.screen;await page.touchscreen.tap(aim.x,aim.y);
    await expect.poll(async()=>(await readT2(page)).prototype.whip.sequence).toBeGreaterThan(0);
    await page.screenshot({path:info.outputPath('frost-mobile.png')});await page.locator('#pve-pause').tap();
    await expect(page.locator('#adventure-settings select')).toBeVisible();await page.selectOption('#adventure-settings select','fork');
    expect((await readT2(page)).prototype.whip.mod).toBe('base');
    await page.screenshot({path:info.outputPath('frost-mobile-menu.png')});
    let warm=initial;
    for(let i=0;i<10;i++){
      await page.locator('#pve-restart').tap();await expect.poll(async()=>(await readT2(page)).prototype.whip.mod).toBe('fork');
      await expect.poll(async()=>(await readT2(page)).paused).toBe(false);await page.locator('#pve-pause').tap();
      if(i===0)warm=await page.evaluate(()=>(window as any).__coreArena.read().renderResources);
    }
    const final=await page.evaluate(()=>(window as any).__coreArena.read().renderResources);
    expect(final.geometries).toBe(warm.geometries);expect(final.textures).toBe(warm.textures);expect(await saved(page)).toBeNull();
    await page.locator('#resume').tap();await page.setViewportSize({width:390,height:844});await expect(page.locator('#rotate-device')).toBeVisible();
    expect((await readT2(page)).paused).toBe(true);await page.setViewportSize({width:844,height:390});await expect(page.locator('#rotate-device')).toBeHidden();
    await page.locator('#pve-pause').tap();await page.locator('#campaign-menu').tap();await expect(page.locator('#adventure-hub')).toBeVisible();
    await page.locator('#campaign-continue').tap();await expect(page.locator('#app')).toHaveAttribute('data-ready','true');await page.locator('#pve-pause').tap();
    await expect(page.locator('#adventure-settings select')).toBeVisible();await page.getByRole('button',{name:'Kampagne / Bossübung',exact:true}).first().tap();
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:info.outputPath('campaign-mobile-hub.png')});
    await expect(page.locator('#adventure-hub #fullscreen-toggle')).toHaveCount(1);
    expect(await page.evaluate(()=>document.querySelector('#adventure-hub')!.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
    await info.attach('resources',{body:JSON.stringify({initial,warm,final}),contentType:'application/json'});
  });
});

test('Legacy Frost and Arena remain available; stationary attacks cannot replace Frost dodges',async({page},info)=>{
  test.setTimeout(70000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./?mode=pve&level=frost');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#boss-hp-value')).toHaveText('650');await expect(page.locator('#campaign-menu')).toHaveCount(0);
  await page.locator('#pve-restart').click();await expect(page.locator('#boss-hp-value')).toHaveText('650');
  await page.goto('./');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Trainingsmatch starten',exact:true}).click();await expect(page.locator('#hp-value')).toHaveText('100');
  await page.goto(root+'&level=frost&trial=frost');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.locator('#stone-sound').click();const deadline=Date.now()+45000;
  while(Date.now()<deadline){const s=await readT2(page);if(s.pve.outcome!=='running')break;
    if(s.prototype.whip.phase==='idle'&&s.prototype.whip.readyIn===0)await page.mouse.click(s.monsterScreen.x,s.monsterScreen.y,{button:'right'});
    await page.waitForTimeout(50);
  }
  const s=await readT2(page);expect(s.pve.outcome).toBe('defeat');expect(s.pve.hitsTaken).toBeGreaterThan(0);expect(await saved(page)).toBeNull();
  await info.attach('stationary-counterexample',{body:JSON.stringify(s),contentType:'application/json'});expect(errors).toEqual([]);
});
test('Frost boss is beatable with base and fork through real controls, with visible phases and stable retries',async({page},info)=>{
  test.setTimeout(330000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const mod of ['base','fork']){
    await page.goto(root+'&level=frost&trial=frost&mod='+mod);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
    expect((await readT2(page)).camera).toBe('side');await defeatCampaign(page,'boss',info,'frost-'+mod);
    await expect(page.locator('#match-result')).toBeVisible();expect(await saved(page)).toBeNull();
    await page.locator('#pve-again').click();const s=await readT2(page);expect(s.pve.bossHp).toBe(720);expect(s.pve.hp).toBe(100);expect(s.prototype.whip.sequence).toBe(0);
  }expect(errors).toEqual([]);
});
test('real Stone completion unlocks hook; continue, Frost approach, checkpoint death, hook victory, exit and reload unlock fork',async({page},info)=>{
  test.setTimeout(600000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(stone);await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await walkT2(page,0,27);await defeatCampaign(page,0);await walkT2(page,0,7);await defeatCampaign(page,1);
  await walkT2(page,0,-8);await walkT2(page,-1,-8);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.consoleActive).toBe(true);
  await walkT2(page,0,-8);await walkT2(page,0,-21);const won=await defeatCampaign(page,'boss',info,'stone-base');
  console.log('Campaign: Stone boss defeated through inputs');
  expect((await saved(page)).defeated).toEqual(['stone']);expect((await saved(page)).completed).toEqual([]);
  const core=won.core!.position;await walkT2(page,core.x,core.z);await walkT2(page,0,core.z);await walkT2(page,0,-39);await page.keyboard.press('KeyE');
  await page.keyboard.down('KeyD');try{await expect.poll(async()=>(await readT2(page)).completed).toBe(true);}finally{await page.keyboard.up('KeyD');}
  await page.locator('#pve-next').click();await expect(page.locator('#app')).toHaveAttribute('data-adventure-level','frost');await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  console.log('Campaign: Stone exit and Frost transition complete');
  await page.locator('#pve-pause').click();await page.locator('#campaign-menu').click();await expect(page.locator('#adventure-hub')).toBeVisible();await page.reload();
  await expect(page.locator('#campaign-continue')).toContainText('Kristallkluft');
  await page.selectOption('#practice-mod','fork');await page.locator('[data-practice="stone"]').click();await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await readT2(page)).prototype.whip.mod).toBe('fork');expect((await readT2(page)).bossActive).toBe(true);expect((await saved(page)).selectedMod).toBe('base');
  await page.locator('#pve-pause').click();await page.getByRole('button',{name:'Kampagne / Bossübung',exact:true}).first().click();
  await page.selectOption('#campaign-loadout select','hook');await page.locator('#campaign-continue').click();await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  expect((await readT2(page)).prototype.whip.mod).toBe('hook');
  await walkT2(page,-1,8);await defeatCampaign(page,0);
  await walkT2(page,-6,7);await walkT2(page,-10,6);await walkT2(page,-14,5.8);await walkT2(page,-14,1);await defeatCampaign(page,1);
  await walkT2(page,-14,-6.2);await page.screenshot({path:info.outputPath('frost-valve.png')});await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).checkpoint).toBe(true);
  console.log('Campaign: Frost guards and valve complete');
  await walkT2(page,-14,-10.6);await walkT2(page,-4,-10.6);
  await expect.poll(async()=>(await readT2(page)).pve.outcome,{timeout:65000}).toBe('defeat');
  await page.locator('#pve-again').click();let s=await readT2(page);expect(s.checkpoint).toBe(true);expect(s.enemies.every(e=>e.hp===0)).toBe(true);expect(s.pve.hp).toBe(100);expect(s.pve.bossHp).toBe(720);
  await walkT2(page,-4,2.5);await defeatCampaign(page,'boss',info,'frost-hook');expect((await saved(page)).defeated).toEqual(['stone','frost']);
  console.log('Campaign: Frost checkpoint retry and hook victory complete');
  await walkT2(page,0,-4);await walkT2(page,15,-4);await walkT2(page,15,-10.5);
  await page.keyboard.down('KeyS');try{await expect.poll(async()=>(await readT2(page)).completed).toBe(true);}finally{await page.keyboard.up('KeyS');}
  await expect(page.locator('#result-title')).toHaveText('Kristallkluft durchquert.');expect((await saved(page)).completed).toEqual(['stone','frost']);
  await page.locator('#pve-next').click();await page.reload();await expect(page.locator('#campaign-continue')).toContainText('Beide Missionen abgeschlossen');
  await expect(page.locator('[data-practice="frost"]')).toBeEnabled();await page.selectOption('#campaign-loadout select','fork');expect((await saved(page)).selectedMod).toBe('fork');
  await page.screenshot({path:info.outputPath('campaign-completed.png')});expect(errors).toEqual([]);
});
