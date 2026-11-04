import {preview} from 'vite';
import {chromium,expect,type Page} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {walkT2,defeatT2,type T2State} from '../../tests/e2e/adventureT2Controls';

const journeyOnly=process.argv.includes('--journey-only');
const performanceOnly=process.argv.includes('--performance-only');
const runs=process.argv.includes('--quick')?1:3;
const output='test-results/adventure-environment-test/'+(journeyOnly?'journey':performanceOnly?'paired-performance':'verification');mkdirSync(output,{recursive:true});
type State=T2State&{renderCalls:number;environment:{variant:string;stage?:string;animationTime?:number;rotors?:number[]};
  renderResources:{geometries:number;textures:number;objects:number;triangles:number};simulationTimes:number[]};
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
const query='?mode=pve&level=stone&adventure=1&combat=prototype';
let browser=await chromium.launch({channel:'chrome',headless:true});
const versionFile='dist-environment-test/environment-version.json';
const results:Record<string,unknown>={build:JSON.parse(readFileSync(versionFile,'utf8')),startedAt:new Date().toISOString(),runs,journeyOnly,performanceOnly};
let server:Awaited<ReturnType<typeof preview>>|undefined;
const save=()=>writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
async function start(mode:string,dir:string){
  server=await preview({mode,build:{outDir:dir},preview:{host:'127.0.0.1',port:8753,strictPort:true}});
  return 'http://127.0.0.1:8753/CoreArena-3D/'+(mode==='adventure-preview'?'adventure-preview/':'');
}
async function stop(){if(server)await new Promise<void>(r=>server!.httpServer.close(()=>r()));server=undefined;}
async function ready(page:Page,url:string){await page.goto(url);await expect(page.locator('#app')).toHaveAttribute('data-ready','true',{timeout:60000});}
async function sample(page:Page){return page.evaluate(async()=>{
  const frames:number[]=[];let last=performance.now();
  await new Promise<void>(resolve=>{const next=(now:number)=>{frames.push(now-last);last=now;if(frames.length<600)requestAnimationFrame(next);else resolve();};requestAnimationFrame(next);});
  frames.sort((a,b)=>a-b);const state=(window as unknown as {__coreArena:{read():State}}).__coreArena.read();
  const times=state.simulationTimes.slice().sort((a,b)=>a-b),gl=document.querySelector('canvas')!.getContext('webgl2')!,ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {p95:frames[Math.floor(frames.length*.95)]!,p99:frames[Math.floor(frames.length*.99)]!,simP95:times[Math.floor(times.length*.95)]??0,
    calls:state.renderCalls,resources:state.renderResources,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown',
    userAgent:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    readyMs:performance.now(),network:performance.getEntriesByType('resource').map(r=>({url:r.name,size:(r as PerformanceResourceTiming).decodedBodySize,duration:r.duration}))};
});}
try{
  // Guards exercise deployed artifacts, not just the resolver in isolation.
  const guards=[];
  for(const [mode,dir,prototype] of [['production','dist',false],['test','dist-test',true],['adventure-preview','dist-preview',true]] as const){
    const base=await start(mode,dir),page=await browser.newPage(),requests:string[]=[],errors:string[]=[];
    page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
    await ready(page,base+query+'&environment=outpost-test');
    await expect(page.locator('#environment-comparison')).toHaveCount(0);
    assert.equal(await page.locator('#whip-controls').count()>0,prototype);
    assert.equal(await page.evaluate(()=>'__coreArena' in window),mode==='test');
    assert.ok(!requests.some(r=>/environmentTest-|outpostEnvironment-/.test(r)));
    assert.ok(!readdirSync(dir+'/assets').some(f=>/environmentTest-|outpostEnvironment-/.test(f)));
    assert.deepEqual(errors,[]);guards.push({mode,prototype,errors,experimentRequests:0});await page.close();await stop();
  }
  results.guards=guards;save();console.log('Build boundaries passed');
  const base=await start('environment-test','dist-environment-test');
  const perf=[];
  if(!journeyOnly){
  // Each observation gets a fresh browser/GPU context. Reverse the middle pair
  // to expose order effects; do not let earlier build guards accumulate contexts.
  for(let run=0;run<runs;run++)for(const variant of run===1?['outpost-test','reference']:['reference','outpost-test']){
    await browser.close();browser=await chromium.launch({channel:'chrome',headless:true});
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    await context.addInitScript('window.__name = value => value');
    const page=await context.newPage(),errors:string[]=[],failed:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
    const startTime=Date.now();await ready(page,base+query+'&environment='+variant);const coldReadyMs=Date.now()-startTime;
    assert.deepEqual(await page.evaluate(()=>Object.keys((window as unknown as {__coreArena:object}).__coreArena)),['read']);
    await page.waitForTimeout(1500);const arrival=await sample(page);
    if(run===0)await page.screenshot({path:`${output}/${variant}-arrival.jpg`,quality:85});
    await walkT2(page,0,27);await defeatT2(page,0);await walkT2(page,0,27);
    const court=await sample(page);assert.equal((await read(page)).camera,'side');
    if(run===0&&!performanceOnly){
      await page.screenshot({path:`${output}/${variant}-court.jpg`,quality:85});
      for(const [name,x,z] of [['back',-12,27],['front',12,27],['exit',0,17]] as const){
        await walkT2(page,0,27);await walkT2(page,x,z);await page.waitForTimeout(250);
        await page.screenshot({path:`${output}/${variant}-${name}.jpg`,quality:85});
      }
    }
    const warmStart=Date.now();await ready(page,base+query+'&environment='+variant);const warmReadyMs=Date.now()-warmStart;
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
    if(variant==='reference')assert.ok(!arrival.network.some(r=>r.url.includes('outpostEnvironment-')));
    perf.push({variant,run,coldReadyMs,warmReadyMs,arrival,court});results.performance=perf;save();await context.close();
    console.log(variant,run,'p95',arrival.p95,court.p95,'calls',arrival.calls,court.calls);
  }
  results.performance=perf;save();
  for(let run=0;run<runs;run++){
    const a=perf.find(p=>p.run===run&&p.variant==='reference')!,b=perf.find(p=>p.run===run&&p.variant==='outpost-test')!;
    for(const point of ['arrival','court'] as const){assert.ok(b[point].p95<=20);assert.ok(b[point].p99<=33);
      assert.ok(b[point].p95-a[point].p95<=2,`${point} run ${run}: B p95 ${b[point].p95} - A ${a[point].p95} exceeds 2 ms`);assert.ok(b[point].simP95<=4);assert.ok(b[point].calls-a[point].calls<=20);}
  }
  }
  if(!performanceOnly){
  // Full real-input mission, including both kinds of death, reserve, state restoration and return.
  const context=await browser.newContext({viewport:{width:1366,height:768},deviceScaleFactor:1});
  await context.addInitScript('window.__name = value => value');
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page,base+query+'&environment=outpost-test');
  await walkT2(page,0,26);await expect.poll(async()=>(await read(page)).pve.outcome,{timeout:35000}).toBe('defeat');
  await page.locator('#pve-again').click();assert.equal((await read(page)).environment.stage,'off');
  await walkT2(page,0,27);await defeatT2(page,0);await walkT2(page,0,7);await defeatT2(page,1);
  await walkT2(page,0,2);await walkT2(page,-12.5,2);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await read(page)).mission.reserveRecovered).toBe(true);await walkT2(page,0,2);
  await walkT2(page,-1,-8);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await read(page)).environment.stage).toBe('standby');
  await walkT2(page,0,-8);await walkT2(page,0,33);await page.screenshot({path:output+'/standby-return.jpg',quality:85});
  await page.locator('#pve-pause').click();const paused=await read(page);await page.waitForTimeout(250);
  assert.equal((await read(page)).environment.animationTime,paused.environment.animationTime);await page.locator('#resume').click();
  await walkT2(page,0,-21);await expect.poll(async()=>(await read(page)).pve.outcome,{timeout:40000}).toBe('defeat');
  await page.locator('#pve-again').click();const retry=await read(page);
  assert.equal(retry.pve.armor,75);assert.equal(retry.environment.stage,'standby');assert.ok(retry.enemies.every(e=>e.hp===0));
  await walkT2(page,0,-21);const won=await defeatT2(page,'boss',false,'mixed');
  const core=won.result.core!.position;await walkT2(page,core.x,core.z);
  await expect.poll(async()=>(await read(page)).core?.collected).toBe(true);
  // x=0 is at the edge of the 3.1 m interaction radius; stand safely within it.
  await walkT2(page,0,core.z);await walkT2(page,-1,-39);await page.keyboard.press('KeyE');
  await expect.poll(async()=>(await read(page)).environment.stage).toBe('online');
  await walkT2(page,0,33);await page.screenshot({path:output+'/online-return.jpg',quality:85});
  await walkT2(page,0,-39);await page.keyboard.down('KeyD');
  try{await expect.poll(async()=>(await read(page)).completed,{timeout:10000}).toBe(true);}finally{await page.keyboard.up('KeyD');}
  await page.screenshot({path:output+'/mission-complete.jpg',quality:85});
  const complete=await read(page);await page.locator('#pve-again').click();await page.waitForTimeout(200);
  const cdp=await context.newCDPSession(page),resets=[];
  for(let i=0;i<10;i++){
    await page.locator('#pve-restart').click();await page.waitForTimeout(100);const state=await read(page);
    assert.equal(state.environment.stage,'off');assert.equal(state.mission.consoleActive,false);
    await cdp.send('HeapProfiler.collectGarbage');const counters=await cdp.send('Memory.getDOMCounters');
    resets.push({resources:state.renderResources,listeners:counters.jsEventListeners});
  }
  const last=resets.at(-1)!;
  for(const item of resets)for(const key of ['geometries','textures','objects'] as const)assert.equal(item.resources[key],resets[0]!.resources[key]);
  assert.equal(last.listeners,resets[0]!.listeners);
  await page.locator('#environment-comparison a').first().click();await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
  assert.equal((await read(page)).environment.variant,'reference');assert.equal((await read(page)).mission.consoleActive,false);
  assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});
  assert.deepEqual(errors,[]);results.mission={complete,retry,resets,errors};save();await context.close();console.log('Full mission and reset checks passed');
  const touch=[];
  for(const width of [844,667]){
    const height=width===844?390:375,ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,hasTouch:true,isMobile:true});
    await ctx.addInitScript('window.__name = value => value');const p=await ctx.newPage();
    await ready(p,base+query+'&environment=outpost-test');await p.waitForTimeout(200);
    for(const id of ['touch-stick','touch-jump','touch-heavy','touch-sprint','environment-comparison'])await expect(p.locator('#'+id)).toBeVisible();
    await p.locator('#touch-jump').tap();await p.waitForTimeout(120);await p.locator('#touch-jump').tap();
    assert.equal((await read(p)).prototype.airJump.uses,1);assert.equal((await read(p)).camera,'side');
    await p.screenshot({path:`${output}/touch-${width}.jpg`,quality:85});
    await p.locator('#pve-pause').tap();const tick=(await read(p)).snapshot.tick;await p.setViewportSize({width:height,height:width});
    await expect(p.locator('#rotate-device')).toBeVisible();await p.setViewportSize({width,height});await p.waitForTimeout(150);
    assert.equal((await read(p)).snapshot.tick,tick);await p.locator('#resume').tap();
    await p.locator('#environment-comparison a').first().tap();await expect(p.locator('#app')).toHaveAttribute('data-ready','true');
    assert.equal((await read(p)).environment.variant,'reference');touch.push({width,height,camera:(await read(p)).camera});await ctx.close();
  }
  results.touch=touch;save();console.log('Environment verification passed');
  }
}catch(error){
  results.failure=String(error);
  const failedPage=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('/CoreArena-3D/'));
  if(failedPage){results.failureState=await read(failedPage).catch(()=>null);await failedPage.screenshot({path:output+'/failure.jpg',quality:85}).catch(()=>undefined);}
  save();throw error;
}
finally{await browser.close();await stop();}
