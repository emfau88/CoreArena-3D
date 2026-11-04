import {preview} from 'vite';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {walkT2,readT2,defeatT2} from '../../tests/e2e/adventureT2Controls';

const output=process.argv[2]??'test-results/adventure-environment-test/capture';mkdirSync(output,{recursive:true});
const server=await preview({mode:'environment-test',build:{outDir:'dist-environment-test'},preview:{host:'127.0.0.1',port:8752,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const rows=[];
  for(const variant of ['reference','outpost-test']){
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    await context.addInitScript('window.__name = value => value');
    const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8752/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype&environment='+variant);
    await page.waitForSelector('#app[data-ready=true]');await page.waitForTimeout(1500);
    await page.screenshot({path:`${output}/${variant}-arrival.jpg`,quality:85});
    rows.push({variant,arrival:await readT2(page)});
    if(process.argv.includes('--walk')){
      await walkT2(page,0,27);await defeatT2(page,0);
      for(const [name,x,z] of [['centre',0,27],['back',-12,27],['front',12,27],['exit',0,17]] as const){
        await walkT2(page,0,27);await walkT2(page,x,z);await page.waitForTimeout(300);
        await page.screenshot({path:`${output}/${variant}-${name}.jpg`,quality:85});
      }
    }
    rows.push({variant,errors});await context.close();
  }
  writeFileSync(output+'/state.json',JSON.stringify(rows,null,2));console.log(output);
}finally{await browser.close();await new Promise<void>(r=>server.httpServer.close(()=>r()));}
