import { test,expect } from '@playwright/test';

test.use({headless:false});
test('all courts: fixed side, straight and isometric inspection cameras',async({page},info)=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./?mode=pve&level=stone&adventure=1&explore=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  await page.waitForTimeout(700);
  for(const [name,z] of [['entry',27],['middle',0],['boss',-29]] as const) for(const mode of ['side','straight','isometric'] as const) {
    await page.evaluate(({mode,z})=>(window as unknown as {__coreArena:{courtView(mode:string,z:number):void}}).__coreArena.courtView(mode,z),{mode,z});
    await page.mouse.move(1,1);await page.waitForTimeout(150);
    await page.screenshot({path:info.outputPath(`${name}-${mode}.png`)});
  }
  expect(errors).toEqual([]);
});

test('first court: real movement, landing on both decorated covers and weapon pickup',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./?mode=pve&level=stone&adventure=1&explore=1');
  await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  type State={snapshot:{position:{x:number;y:number;z:number};grounded:boolean;surface:string};weapons:{ownsPulse:boolean};renderCalls:number};
  const read=()=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
  const move=async(axis:'x'|'z',target:number)=>{
    for(let attempt=0;attempt<8;attempt++) {
      const delta=target-(await read()).snapshot.position[axis];if(Math.abs(delta)<.25) return;
      const sign=Math.sign(delta),key=axis==='x'?(sign>0?'KeyS':'KeyW'):(sign>0?'KeyA':'KeyD');
      await page.keyboard.down(key);
      try {await page.waitForFunction(({axis,target,sign})=>{
        const s=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
        return (s.snapshot.position[axis]-target)*sign>=-.12;
      },{axis,target,sign},{timeout:6000});}
      finally {await page.keyboard.up(key);}
      await page.waitForTimeout(50);
    }
    expect(Math.abs(target-(await read()).snapshot.position[axis])).toBeLessThan(.4);
  };
  await move('x',-8);await move('z',28.4);
  for(const [x,z,id] of [[-8,25,'entry-cover-west'],[8,22,'entry-cover-east']] as const) {
    if(x>0) {await move('z',28.4);await move('x',x);await move('z',z+3.4);}
    await page.keyboard.down('Space');await page.keyboard.down('KeyD');
    await expect.poll(async()=>(await read()).snapshot.position.y,{intervals:[20]}).toBeGreaterThan(1.3);
    await move('z',z);
    await page.keyboard.up('Space');await page.keyboard.up('KeyD');
    await expect.poll(async()=>(await read()).snapshot.grounded).toBe(true);
    expect((await read()).snapshot.surface).toBe(id);
    await page.screenshot({path:info.outputPath(`${id}.png`)});
  }
  await move('z',18.5);await move('x',-3);
  await expect.poll(async()=>(await read()).weapons.ownsPulse).toBe(true);
  await page.screenshot({path:info.outputPath('first-court-weapon.png')});
  await info.attach('court-state',{body:JSON.stringify(await read()),contentType:'application/json'});
  expect(errors).toEqual([]);
});
