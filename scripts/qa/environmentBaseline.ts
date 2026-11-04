import {preview} from 'vite';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

const output='test-results/adventure-environment-test/baseline';
mkdirSync(output,{recursive:true});
const server=await preview({build:{outDir:'dist-reference-baseline'},preview:{host:'127.0.0.1',port:8752,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addInitScript('window.__name = value => value');
  const rows=[];
  for(let run=0;run<3;run++) {
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:8752/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype');
    await page.waitForSelector('#app[data-ready=true]');await page.waitForTimeout(1500);
    if(run===0)await page.screenshot({path:output+'/arrival.jpg',quality:85});
    const metrics=await page.evaluate(async()=>{
      const frames:number[]=[];let last=performance.now();
      await new Promise<void>(resolve=>{const next=(now:number)=>{frames.push(now-last);last=now;if(frames.length<600)requestAnimationFrame(next);else resolve();};requestAnimationFrame(next);});
      frames.sort((a,b)=>a-b);
      const gl=document.querySelector('canvas')!.getContext('webgl2')!,ext=gl.getExtension('WEBGL_debug_renderer_info');
      return {p95:frames[Math.floor(frames.length*.95)],p99:frames[Math.floor(frames.length*.99)],
        gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown',userAgent:navigator.userAgent,
        state:(window as unknown as {__coreArena:{read():unknown}}).__coreArena.read(),
        resources:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:(r as PerformanceResourceTiming).decodedBodySize}))};
    });rows.push(metrics);await page.close();
  }
  writeFileSync(output+'/metrics.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(r=>({p95:r.p95,p99:r.p99,gpu:r.gpu}))));
} finally {await browser.close();await new Promise<void>(r=>server.httpServer.close(()=>r()));}
