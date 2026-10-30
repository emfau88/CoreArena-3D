import {test,expect,type Page} from '@playwright/test';
import type {PveSnapshot} from '../../src/core/pve';
import type {Snapshot} from '../../src/core/types';
import type {WeaponSnapshot} from '../../src/core/combat';

interface State {snapshot:Snapshot;pve:PveSnapshot;weapons:WeaponSnapshot;checkpoint:boolean;
  enemies:{hp:number;screen:{x:number;y:number}}[];monsterScreen:{x:number;y:number}}
const read=(page:Page):Promise<State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read());
test.use({headless:false});

// Compare actual play from the normal spawn. No fixtures, teleports, damage or ammo injection.
for(const mobile of [false,true])for(const weapon of ['arc','pulse'] as const)for(const active of [false,true])
for(const plateau of !mobile&&weapon==='pulse'&&!active&&process.env.BOSS_PRESSURE_STAGE!=='before'?[false,true]:[false]) {
  test(`${mobile?'touch':'desktop'} ${weapon} ${active?'reactive':'stationary'} ${plateau?'plateau ':''}boss pressure`,async({playwright,channel},info)=>{
    test.setTimeout(120_000);
    // Each measured run gets a fresh process; repeated heavy GLB contexts can exhaust Chromium's blob budget.
    const browser=await playwright.chromium.launch({channel,headless:false});
    const context=await browser.newContext(mobile?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:
      {viewport:{width:1366,height:768}});
    const page=await context.newPage(),errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    try {
      await page.goto('./?mode=pve&level=stone&adventure=1');
      await expect(page.locator('#app')).toHaveAttribute('data-ready','true');
      const cdp=await context.newCDPSession(page),stick=(await page.locator('#touch-stick').boundingBox()),jump=(await page.locator('#touch-jump').boundingBox());
      const release=async()=>{if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        else {await page.mouse.up();for(const key of ['KeyW','KeyS','KeyA','KeyD'])await page.keyboard.up(key);}};
      const move=async(x:number,z:number)=>{
        for(const [axis,target] of [['z',z],['x',x]] as const)for(let i=0;i<12;i++){
          const delta=target-(await read(page)).snapshot.position[axis];if(Math.abs(delta)<.3)break;
          const sign=Math.sign(delta),key=axis==='z'?(sign>0?'KeyA':'KeyD'):(sign>0?'KeyS':'KeyW');
          if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,
            x:stick!.x+stick!.width/2+(axis==='z'?-sign*42:0),y:stick!.y+stick!.height/2+(axis==='x'?sign*42:0)}]});
          else await page.keyboard.down(key);
          try{await page.waitForFunction(({axis,target,sign})=>(
            (window as unknown as {__coreArena:{read():State}}).__coreArena.read().snapshot.position[axis]-target)*sign>=-.18,
            {axis,target,sign},{timeout:10000});}finally{await release();}
        }
        const p=(await read(page)).snapshot.position;expect(Math.hypot(p.x-x,p.z-z)).toBeLessThan(.6);
      };
      const fire=async(index:number|'boss',reactive=false)=>{
        const start=await read(page),events:unknown[]=[],phases:Record<string,number>={},captured=new Set<string>();let last=start,ids='';
        for(let i=0;i<900;i++){
          const s=await read(page);if(s.pve.outcome!=='running'||(index!=='boss'&&s.enemies[index]!.hp===0))break;
          const b=s.pve,p=s.snapshot.position,distance=Math.hypot(p.x-b.center.x,p.z-b.center.z);
          const eruption=reactive&&b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')&&Math.hypot(p.x-b.target.x,p.z-b.target.z)<3.8;
          const x=eruption?(b.target.x>0?-1:1):0;
          const leap=reactive&&s.snapshot.grounded&&(b.phase==='melee'&&b.phaseTick<12||b.kind==='wave'&&(
            b.phase==='warning'&&b.phaseTick>=84&&distance<5||b.phase==='attack'&&distance>b.waveRadius&&distance-b.waveRadius<2.8));
          const point=index==='boss'?s.monsterScreen:s.enemies[index]!.screen;
          if(mobile){
            const points=[{id:2,...point}];
            if(x)points.push({id:1,x:stick!.x+stick!.width/2,y:stick!.y+stick!.height/2+x*42});
            if(leap)points.push({id:3,x:jump!.x+jump!.width/2,y:jump!.y+jump!.height/2});
            const nextIds=points.map(p=>p.id).sort().join('');
            if(nextIds!==ids){if(ids)await release();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});ids=nextIds;}
            else await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points});
          }else{
            for(const [key,direction]of[['KeyS',1],['KeyW',-1]]as const)if(x===direction)await page.keyboard.down(key);else await page.keyboard.up(key);
            if(leap)await page.keyboard.press('Space');await page.mouse.move(point.x,point.y);if(!i)await page.mouse.down();
          }
          if(index==='boss'){
            const phase=b.phase==='attack'||b.phase==='warning'?`${b.kind}-${b.phase}`:b.phase;
            phases[phase]=(phases[phase]??0)+(b.tick-last.pve.tick);
            if(b.hitsTaken>last.pve.hitsTaken)events.push({tick:b.tick-start.pve.tick,phase,phaseTick:b.phaseTick,hp:b.hp,armor:b.armor,position:p});
            if(b.phase!==last.pve.phase&&b.phase==='warning')await page.screenshot({path:info.outputPath(`${b.kind}-warning.png`)});
            if(process.env.BOSS_PRESSURE_STAGE!=='before'&&!captured.has(b.phase)&&
              (b.phase==='melee'&&b.phaseTick>=10&&b.phaseTick<30||b.phase==='recovery')){
              captured.add(b.phase);await page.screenshot({path:info.outputPath(`${b.phase}.png`)});
            }
          }
          last=s;await page.waitForTimeout(40);
        }
        await release();const end=await read(page);
        if(index==='boss'&&end.pve.hitsTaken>last.pve.hitsTaken)events.push({tick:end.pve.tick-start.pve.tick,
          phase:end.pve.phase,phaseTick:end.pve.phaseTick,hp:end.pve.hp,armor:end.pve.armor,position:end.snapshot.position});
        return {start:{position:start.snapshot.position,hp:start.pve.hp,armor:start.pve.armor,ammo:start.weapons.ammo,bossHp:start.pve.bossHp,
          bossCenter:start.pve.center,phase:start.pve.phase,phaseTick:start.pve.phaseTick},
          end:{position:end.snapshot.position,hp:end.pve.hp,armor:end.pve.armor,ammo:end.weapons.ammo,bossHp:end.pve.bossHp,outcome:end.pve.outcome},
          seconds:(end.pve.tick-start.pve.tick)/60,hits:end.pve.hitsTaken-start.pve.hitsTaken,events,phases};
      };
      await move(0,27);await fire(0);await move(0,18.5);await move(-3,18.5);
      if(mobile)await page.locator('#weapon-pulse').tap();else await page.locator('#weapon-pulse').click();
      await move(0,18.5);await move(0,7);await fire(1);await move(0,-8);await move(-1,-8);
      if(mobile)await page.locator('#mission-interact').tap();else await page.keyboard.press('KeyE');
      await move(0,-8);await move(0,-14);const checkpoint=await read(page);
      expect(checkpoint.checkpoint).toBe(true);expect(checkpoint.pve.hp).toBe(100);expect(checkpoint.pve.armor).toBe(50);expect(checkpoint.weapons.ammo).toBe(54);
      if(mobile)await page.locator(`#weapon-${weapon}`).tap();else await page.keyboard.press(weapon==='arc'?'Digit1':'Digit2');
      await move(0,-21);
      if(plateau){await move(0,-23);await move(-12,-23);expect((await read(page)).snapshot.surface).toBe('boss-health-plateau');}
      await page.waitForFunction(()=>(window as unknown as {__coreArena:{read():State}}).__coreArena.read().pve.phase!=='emerging');
      const result=await fire('boss',active);
      await page.screenshot({path:info.outputPath('result.png')});
      const record={stage:process.env.BOSS_PRESSURE_STAGE??'after',mobile,weapon,location:plateau?'plateau':'entrance',strategy:active?'reactive':'stationary',...result,errors};
      expect(result.start.hp).toBe(100);expect(result.start.armor).toBe(50);expect(result.start.ammo).toBe(54);
      console.log(JSON.stringify(record));await info.attach('boss-pressure',{body:JSON.stringify(record),contentType:'application/json'});
      expect(result.end.outcome).not.toBe('running');expect(errors).toEqual([]);
      if(active)expect(result.end.outcome).toBe('victory');
      else if(process.env.BOSS_PRESSURE_STAGE!=='before')expect(result.end.outcome).toBe('defeat');
    }finally{await browser.close();}
  });
}
