import {expect,type Page,type TestInfo} from '@playwright/test';
import {readT2,walkT2,type T2State} from './adventureT2Controls';
export {readT2,walkT2};
export async function defeatCampaign(page:Page,target:'boss'|number,info?:TestInfo,label='boss'){
  const deadline=Date.now()+130000,held=new Set<string>(),frames:unknown[]=[],captured=new Set<string>();let lastDash=-1000;
  try{while(Date.now()<deadline){
    const s=await readT2(page),p=s.snapshot,b=s.pve,frost=!!b.frostProfile;
    if(b.outcome!=='running'||target!=='boss'&&s.enemies[target]!.hp<=0)break;
    const center=target==='boss'?b.center:s.enemies[target]!.center,dx=center.x-p.position.x,dz=center.z-p.position.z,d=Math.hypot(dx,dz);
    let x=0,z=0;const desired=target==='boss'?(frost?3.2:s.prototype.whip.mod==='fork'?3:3.5):3.8;
    if(target==='boss'&&(b.phase==='melee'&&b.exchange?.window!=='counter'||frost&&b.phase==='warning'&&b.kind==='wave')){
      if(frost){const goal={x:center.x+Math.sin(b.facing+1.25)*desired,z:center.z+Math.cos(b.facing+1.25)*desired},gx=goal.x-p.position.x,gz=goal.z-p.position.z,gd=Math.hypot(gx,gz);
        if(gd>.35){x=gx/gd;z=gz/gd;}}
      else if(b.phaseTick>=10&&b.phaseTick<52){x=Math.cos(b.facing);z=-Math.sin(b.facing);}
    }else if(target==='boss'&&b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')){
      const tx=p.position.x-b.target.x,tz=p.position.z-b.target.z;
      if(Math.hypot(tx,tz)<4)x=p.position.x<-17?1:p.position.x>17?-1:Math.abs(tx)>.05?Math.sign(tx):p.position.x<0?1:-1;
    }else if(d>desired){x=dx/d;z=dz/d;}
    const horizontal=s.camera==='side'?-z:x,vertical=s.camera==='side'?x:z;
    for(const [key,on] of [['KeyD',horizontal>.2],['KeyA',horizontal<-.2],['KeyS',vertical>.2],['KeyW',vertical<-.2]] as const){
      if(on&&!held.has(key)){await page.keyboard.down(key);held.add(key);}else if(!on&&held.has(key)){await page.keyboard.up(key);held.delete(key);}
    }
    if(target==='boss'&&b.phase==='melee'&&b.phaseTick>=16&&b.phaseTick<32&&p.tick-lastDash>60){await page.keyboard.press('ShiftLeft');lastDash=p.tick;}
    if(!frost&&target==='boss'&&p.grounded&&b.kind==='wave'&&(b.phase==='warning'&&b.phaseTick>=65&&d<5||b.phase==='attack'&&d>b.waveRadius&&d-b.waveRadius<3))await page.keyboard.press('Space');
    const w=s.prototype.whip;
    if(w.phase==='idle'&&w.readyIn===0&&(target!=='boss'||b.phase!=='emerging'&&(!frost?b.phase!=='warning':true))){
      const heavy=target!=='boss'||b.exchange?.window==='counter'&&d<5.5&&(b.phase==='melee'?b.phaseTick<105:b.phaseTick<64);
      const point=target==='boss'?s.monsterScreen:s.enemies[target]!.screen;await page.mouse.click(point.x,point.y,{button:heavy?'right':'left'});
    }
    if(frames.length===0||p.tick-(frames.at(-1) as T2State).snapshot.tick>60)frames.push(s);
    const key=b.phase==='warning'||b.phase==='attack'?b.phase+'-'+b.kind:b.phase;
    if(info&&target==='boss'&&!captured.has(key)&&['warning-wave','attack-wave','melee','recovery','reposition'].includes(key)){
      captured.add(key);await page.screenshot({path:info.outputPath(`${label}-${key}.png`)});
    }
    await page.waitForTimeout(25);
  }}finally{for(const key of held)await page.keyboard.up(key);}
  const result=await readT2(page);if(info)await info.attach(label,{body:JSON.stringify({result,frames}),contentType:'application/json'});
  expect(result.pve.outcome,`${label} ended with ${result.pve.bossHp} boss HP`).not.toBe('defeat');
  if(target==='boss')expect(result.pve.outcome).toBe('victory');else expect(result.enemies[target]!.hp).toBe(0);
  return result;
}
