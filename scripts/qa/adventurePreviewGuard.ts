import assert from 'node:assert/strict';
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {preview} from 'vite';
import {chromium,expect} from '@playwright/test';

// Exercise the deployable preview through normal DOM/touch inputs, with no diagnostic hook.
const remote=process.argv[2]?.startsWith('https://')?process.argv[2]:undefined;
const output=remote?(process.argv[3]??'test-results/adventure-preview-live'):(process.argv[2]??'test-results/adventure-preview-local');
mkdirSync(output,{recursive:true});
if(!remote)for(const file of readdirSync('dist-preview/assets').filter(f=>f.endsWith('.js'))){
  const source=readFileSync(`dist-preview/assets/${file}`,'utf8');
  assert.ok(!file.includes('adventureLab')&&!source.includes('stone-boss-a0-v1')&&!source.includes('lab-start'),file);
}
const server=remote?undefined:await preview({mode:'adventure-preview',build:{outDir:'dist-preview'},preview:{host:'127.0.0.1',port:8746,strictPort:true}});
const base=remote??'http://127.0.0.1:8746/CoreArena-3D/adventure-preview/';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const rows:unknown[]=[];
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1366,height:768},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1});
    const page=await context.newPage(),errors:string[]=[],failed:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)failed.push(`${response.status()} ${response.url()}`);});
    try{
      await page.goto(base+'?mode=pve&level=stone&adventure=1&combat=prototype&lab=boss');
      await expect(page.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});
      assert.equal(await page.evaluate(()=>'__coreArena' in window),false);
      await expect(page.locator('#adventure-lab')).toHaveCount(0);
      await expect(page.locator('#whip-controls')).toContainText('Doppelsprung');
      await expect(page.locator('#pve-restart')).toHaveText('Level neu starten');
      await expect(page.locator('#adventure-boss')).toBeHidden();
      if(mobile){
        await expect(page.locator('#touch-sprint')).toHaveText('Dash');await expect(page.locator('#touch-heavy')).toBeVisible();
        await page.locator('#touch-jump').tap();await expect(page.locator('#touch-jump')).toHaveText('Luftsprung');
        await page.locator('#touch-jump').tap();await expect(page.locator('#touch-jump')).toHaveText('Landung…');
        await expect(page.locator('#touch-jump')).toHaveText('Sprung ×2');
        await page.locator('#touch-heavy').tap();await page.waitForTimeout(100);
        await page.locator('#pve-pause').tap();await page.locator('#resume').tap();
        await page.setViewportSize({width:390,height:844});await expect(page.locator('#rotate-device')).toBeVisible();
        await page.setViewportSize({width:844,height:390});await expect(page.locator('#rotate-device')).toBeHidden();
      }else{
        await page.keyboard.press('Space');await page.waitForTimeout(140);await page.mouse.click(800,350);
      }
      await page.screenshot({path:`${output}/${mobile?'touch':'desktop'}.jpg`,quality:75});
      const versionResponse=await context.request.get(new URL('preview-version.json',base).href);
      assert.equal(versionResponse.status(),200);const version=await versionResponse.json();
      assert.match(version.commit,/^[a-f0-9]{40}$/);
      assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
      rows.push({mobile,url:page.url(),version,errors,failed});
    }finally{await context.close();}
  }
  writeFileSync(`${output}/preview-guard.json`,JSON.stringify(rows,null,2)+'\n');
  console.log(JSON.stringify(rows));
}finally{
  await browser.close();if(server)await new Promise<void>((resolve,reject)=>server.httpServer.close(error=>error?reject(error):resolve()));
}
