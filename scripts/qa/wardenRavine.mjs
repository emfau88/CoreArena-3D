import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {readT2,walkT2,defeatT2} from '../../tests/e2e/adventureT2Controls.ts';

const base='http://127.0.0.1:8751/CoreArena-3D/';
const route=base+'?mode=pve&level=stone&adventure=1&combat=prototype&environment=';
const output='docs/qa/adventure-environment-test/2026-11-05/f';
mkdirSync(output,{recursive:true});
const build=JSON.parse(readFileSync('dist-environment-test/environment-version.json','utf8'));
assert.deepEqual(await (await fetch(base+'environment-version.json')).json(),build);
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  await page.addInitScript('window.__name = value => value');
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const ready=()=>expect(page.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
  const photo=async name=>{
    await page.waitForTimeout(380);
    const state=await readT2(page);
    assert.equal(state.environment.variant,'warden-ravine');assert.equal(state.camera,'side');
    assert.equal(state.paused,false);assert.notEqual(state.pve.outcome,'defeat');
    await page.screenshot({path:output+'/'+name+'.jpg',quality:90});
    console.log(name,JSON.stringify(state.snapshot.position),state.renderCalls,state.renderResources.triangles);
  };
  await page.goto(route+'reference');await ready();
  const hasRavine=()=>page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/wardenRavine-')));
  assert.equal(await hasRavine(),false);
  await page.getByRole('link',{name:'F · Wächterklamm'}).click();await ready();
  assert.equal(await hasRavine(),true);
  await photo('ankunft');
  await walkT2(page,0,36.6);
  await expect(page.locator('#room-hint')).toContainText('tödlich');
  await page.keyboard.down('KeyA');
  try{
    await page.keyboard.press('Space',{delay:90});
    await page.waitForFunction(()=>window.__coreArena.read().snapshot.position.y>1.45);
    await page.keyboard.press('Space',{delay:90});
    await expect(page.locator('#result-title')).toHaveText('Abgestürzt',{timeout:10000});
  } finally {await page.keyboard.up('KeyA');}
  await page.locator('#pve-again').click();
  await expect.poll(async()=>(await readT2(page)).pve.outcome).toBe('running');
  await walkT2(page,0,27);await defeatT2(page,0);
  await walkT2(page,0,14);await walkT2(page,-3.5,14);await photo('durchgang');
  await walkT2(page,0,14);await walkT2(page,0,7);await defeatT2(page,1);
  await walkT2(page,0,2);await walkT2(page,-12.5,2);await photo('terrasse');await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.reserveRecovered).toBe(true);
  await walkT2(page,0,2);
  await walkT2(page,-1,-8);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.consoleActive).toBe(true);
  await walkT2(page,0,-8);await walkT2(page,0,-14);
  await expect(page.locator('#room-hint')).not.toContainText('Absturz');
  await walkT2(page,0,-21);
  // Returning at the checkpoint restores the armour earned on the terrace.
  await expect.poll(async()=>(await readT2(page)).pve.outcome,{timeout:40000}).toBe('defeat');
  await page.locator('#pve-again').click();
  assert.equal((await readT2(page)).pve.armor,75);
  for(let attempt=1;;attempt++){
    await walkT2(page,0,-21);
    try{await defeatT2(page,'boss',false,'mixed');break;}
    catch(error){
      if(attempt===3||(await readT2(page)).pve.outcome!=='defeat')throw error;
      await page.locator('#pve-again').click();
    }
  }
  const core=(await readT2(page)).core.position;await walkT2(page,core.x,core.z);
  await expect.poll(async()=>(await readT2(page)).core?.collected).toBe(true);
  await walkT2(page,0,core.z);await walkT2(page,-1,-39);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await readT2(page)).mission.relayActive).toBe(true);
  await walkT2(page,0,-39);await walkT2(page,2.6,-44.1);await photo('nordtor');
  await page.keyboard.down('KeyD');
  try{await expect.poll(async()=>(await readT2(page)).completed).toBe(true);}
  finally{await page.keyboard.up('KeyD');}

  const touch=await browser.newContext({isMobile:true,hasTouch:true,viewport:{width:667,height:375},deviceScaleFactor:2});
  const mobile=await touch.newPage();
  await mobile.goto(route+'warden-ravine');
  await expect(mobile.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
  for(const id of ['touch-stick','touch-jump','touch-heavy','touch-sprint']){
    assert.ok(await mobile.locator('#'+id).evaluate(el=>{const r=el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),id);
  }
  await mobile.getByRole('link',{name:'A · Bisheriger Hof'}).tap();
  await expect(mobile.locator('#app')).toHaveAttribute('data-environment','reference');
  await touch.close();assert.deepEqual(errors,[]);
  console.log('Mission, isolation, side camera and touch controls OK');
  if(process.argv.includes('--timing')){
    const samples=[];
    for(const variant of ['reference','warden-ravine','warden-ravine','reference','reference','warden-ravine']){
      await page.goto(route+variant);await ready();await page.waitForTimeout(1400);
      const frame=await page.evaluate(async()=>{
        const intervals=[];let previous;
        await new Promise(resolve=>{
          function tick(time){
            if(previous!==undefined)intervals.push(time-previous);
            previous=time;
            if(intervals.length===300)resolve();else requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        const gl=document.querySelector('canvas').getContext('webgl2'), ext=gl.getExtension('WEBGL_debug_renderer_info');
        intervals.sort((a,b)=>a-b);
        return {p50:intervals[149],p95:intervals[284],p99:intervals[296],gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown'};
      });
      const state=await readT2(page);
      samples.push({variant,...frame,calls:state.renderCalls,triangles:state.renderResources.triangles,textures:state.renderResources.textures});
      console.log(variant,'spawn p95',frame.p95.toFixed(1),'ms');
    }
    writeFileSync(output+'/performance.json',JSON.stringify({build,spot:'spawn',viewport:[1600,900],frames:300,samples},null,2)+'\n');
  }
} finally {await browser.close();}
