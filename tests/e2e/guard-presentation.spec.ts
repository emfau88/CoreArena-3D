import {test,expect} from '@playwright/test';
test.use({headless:false});

test('stone KayKit guards walk and time their punch to the real damage frame',async({page},info)=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.text().includes('THREE.PropertyBinding'))errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./?mode=pve&level=stone&adventure=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  type State={snapshot:{position:{z:number}};enemies:{phase:string;phaseTick:number}[];
    guards:{model:string;bones:number;state:string;clipTime:number;contactTime:number;hand:number[]}[]};
  const read=()=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
  expect((await read()).guards.map(g=>g.model)).toEqual(['kaykit-stone-guard','kaykit-stone-guard']);
  expect((await read()).guards.every(g=>g.bones===21)).toBe(true);
  await page.keyboard.press('KeyS',{delay:600});
  await page.keyboard.down('KeyD');
  await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position.z<27);
  await page.keyboard.up('KeyD');
  await expect.poll(async()=>(await read()).guards[0]!.state).toBe('walk');
  await page.screenshot({path:info.outputPath('guard-approach.png')});
  const samples=await page.evaluate(async()=>{
    const out:State[]=[];const end=performance.now()+3000;
    while(performance.now()<end){await new Promise(requestAnimationFrame);out.push((window as unknown as {__coreArena:{read():State}}).__coreArena.read());}
    return out;
  });
  const contact=samples.filter(s=>s.enemies[0]!.phase==='recovery'&&s.enemies[0]!.phaseTick<=3);
  expect(contact.length).toBeGreaterThan(0);
  for(const s of contact)expect(s.guards[0]!.clipTime).toBeCloseTo(.5+(1.1666666269302368-.5)*s.enemies[0]!.phaseTick/42,2);
  expect(samples.some(s=>s.guards[0]!.state==='punch'&&s.guards[1]!.state==='idle')).toBe(true);
  await page.waitForFunction(()=>{const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();return s.enemies[0]!.phase==='windup'&&s.enemies[0]!.phaseTick>10;});
  await page.screenshot({path:info.outputPath('guard-attack.png')});
  await page.waitForFunction(()=>{const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();return s.enemies[0]!.phase==='recovery'&&s.enemies[0]!.phaseTick>34;});
  await page.evaluate(()=>(window as unknown as {__coreArena:{guardView(i:number):void}}).__coreArena.guardView(0));
  await page.screenshot({path:info.outputPath('guard-detail.png')});
  expect(errors).toEqual([]);
  await info.attach('guard-animation-samples',{body:JSON.stringify({contact,errors}),contentType:'application/json'});
});
