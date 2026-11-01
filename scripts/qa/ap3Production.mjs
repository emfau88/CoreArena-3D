import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const [url,tag]=process.argv.slice(2),out='docs/qa/arena-ap3/',results=[];
const expectedBundle=readFileSync('dist/index.html','utf8').match(/src="([^"]+\.js)"/)[1];
for(const mobile of [false,true]){
  const browser=await chromium.launch({headless:false});
  try{
    const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1366,height:768},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
    const page=await context.newPage(),errors=[],failed=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
    const click=id=>mobile?page.locator(id).tap():page.locator(id).click();
    const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
    await page.locator('#app[data-ready="true"]').waitFor();
    const bundle=await page.locator('script[type="module"]').getAttribute('src');assert.equal(bundle,expectedBundle);
    assert.equal(await page.evaluate(()=>typeof window.__coreArena),'undefined');
    await click('#team-start');await page.waitForTimeout(600);
    let sizes;
    if(mobile){
      sizes=await page.locator('#touch-stick,#touch-jump,#touch-sprint,#life-panel,#weapon-panel').evaluateAll(els=>Object.fromEntries(els.map(el=>{const r=el.getBoundingClientRect();return [el.id,{x:r.x,y:r.y,width:r.width,height:r.height}]})));
      assert.equal(Math.round(sizes['touch-stick'].width),88);assert.equal(Math.round(sizes['touch-jump'].height),60);assert.equal(Math.round(sizes['touch-sprint'].height),44);assert.ok(sizes['life-panel'].height<=48);
      const cdp=await context.newCDPSession(page),b=sizes['touch-stick'];
      const held={id:1,x:b.x+b.width/2+32,y:b.y+b.height/2};
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held]});
      const sprint=sizes['touch-sprint'];
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held,{id:2,x:sprint.x+sprint.width/2,y:sprint.y+sprint.height/2}]});
      await page.waitForTimeout(300);assert.equal(await page.locator('#touch-sprint').getAttribute('aria-pressed'),'true');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await click('#touch-jump');
    }else{await page.keyboard.down('KeyD');await page.waitForTimeout(400);await page.keyboard.press('Space');await page.keyboard.up('KeyD');}
    await page.waitForTimeout(180);await page.screenshot({path:out+tag+'-'+(mobile?'touch':'desktop')+'-hud.png'});
    if(mobile){await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);await page.screenshot({path:out+tag+'-touch-wide.png'});await page.setViewportSize({width:667,height:375});}
    await click('#arena-menu');await page.locator('#pause').waitFor({state:'visible'});await click('#resume');
    await click('#arena-menu');await click('#arena-home');await click('#adventure-start');
    await page.locator('#app[data-adventure="true"][data-ready="true"]').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('adventure'),'1');
    if(mobile)assert.equal(Math.round((await page.locator('#touch-stick').boundingBox()).width),116);
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
    results.push({mobile,bundle,status:response.status(),sizes,adventure:page.url(),errors,failed,testApi:'absent'});
  }finally{await browser.close();}
}
writeFileSync(out+tag+'.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));

