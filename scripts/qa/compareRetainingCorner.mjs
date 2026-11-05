import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {readT2,walkT2} from '../../tests/e2e/adventureT2Controls.ts';

const base='http://127.0.0.1:8751/CoreArena-3D/';
const variants=['rocky-bank','retaining-corner'];
const views=[['ankunft',0,33],['hofrand',-12,33],['rinne',-4.3,36.8]];
const output='docs/qa/adventure-environment-test/2026-11-05/d-e';
const timing=process.argv.includes('--performance');
mkdirSync(output,{recursive:true});
const build=await (await fetch(base+'environment-version.json')).json();
const results=[];

async function frameTimes(page) {
  return page.evaluate(async()=>{
    const times=[];
    await new Promise(resolve=>{
      let last;
      function tick(now) {
        if(last!==undefined)times.push(now-last);
        last=now;
        if(times.length===600)resolve();else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    times.sort((a,b)=>a-b);
    const gl=document.querySelector('canvas').getContext('webgl2');
    const ext=gl.getExtension('WEBGL_debug_renderer_info');
    return {p50:times[299],p95:times[569],p99:times[593],
      gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown'};
  });
}

for(let run=1;run<=(timing?3:1);run++){
  for(const variant of run===2?[...variants].reverse():variants) {
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
      await page.addInitScript('window.__name = value => value');
      await page.goto(base+'?mode=pve&level=stone&adventure=1&combat=prototype&environment='+variant);
      await expect(page.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
      assert.equal((await readT2(page)).environment.variant,variant);
      const e=variant==='retaining-corner';
      assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/retainingCorner-'))),e);
      for(const [spot,x,z] of views) {
        if(spot==='rinne')await walkT2(page,-9.6,33); // Pass between the charger and the arrival console.
        if(spot!=='ankunft')await walkT2(page,x,z);
        await page.waitForTimeout(1100);
        const metrics=timing?await frameTimes(page):{};
        const s=await readT2(page);
        assert.equal(s.camera,'side');assert.equal(s.paused,false);assert.equal(s.pve.outcome,'running');
        assert.ok(Math.hypot(s.snapshot.position.x-x,s.snapshot.position.z-z)<.5);
        if(!timing)await page.screenshot({path:output+'/'+(e?'e':'d')+'-'+spot+'.jpg',quality:91});
        results.push({run,variant,spot,...metrics,position:s.snapshot.position,view:s.viewport,
          calls:s.renderCalls,triangles:s.renderResources.triangles,textures:s.renderResources.textures});
        console.log(variant,spot,metrics.p95?.toFixed(1)??'photo',s.renderCalls,s.renderResources.triangles);
      }
      if(!timing && e){
        await walkT2(page,-14.5,37.15);await walkT2(page,-14.5,36.3);
        await expect(page.locator('#room-hint')).toContainText('tödlich');
        await page.keyboard.down('KeyA');await page.keyboard.down('KeyW');
        try{
          await page.keyboard.down('Space');
          await page.waitForFunction(()=>window.__coreArena.read().snapshot.position.y>.8);
          await page.keyboard.up('Space');
          await page.waitForFunction(()=>window.__coreArena.read().snapshot.position.y>1.6);
          await page.keyboard.press('Space',{delay:90});
          await expect(page.locator('#result-title')).toHaveText('Abgestürzt',{timeout:9000});
        }finally{for(const key of ['KeyA','KeyW','Space'])await page.keyboard.up(key);}
        assert.ok((await readT2(page)).snapshot.position.y < -8);
        await page.locator('#pve-again').click();
        await expect.poll(async()=>(await readT2(page)).pve.outcome).toBe('running');
        await walkT2(page,0,14);await expect(page.locator('#room-hint')).not.toContainText('Absturz');
        const mobile=await browser.newContext({isMobile:true,hasTouch:true,viewport:{width:667,height:375},deviceScaleFactor:2});
        const touch=await mobile.newPage();
        await touch.goto(base+'?mode=pve&level=stone&adventure=1&combat=prototype&environment=retaining-corner');
        await expect(touch.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
        for(const id of ['touch-stick','touch-jump','touch-heavy','touch-sprint']){
          assert.ok(await touch.locator('#'+id).evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),id);
        }
        await touch.getByRole('link',{name:'D · Felsböschung'}).tap();
        await expect(touch.locator('#app')).toHaveAttribute('data-environment','rocky-bank');
        await touch.getByRole('link',{name:'E · Stützmauer'}).tap();
        await expect(touch.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
        assert.equal((await readT2(touch)).environment.variant,'retaining-corner');
      }
      assert.deepEqual(errors,[]);
    }finally{await browser.close();}
  }
}
writeFileSync(output+'/'+(timing?'performance':'views')+'.json',JSON.stringify({build,frames:timing?600:undefined,results},null,2)+'\n');
