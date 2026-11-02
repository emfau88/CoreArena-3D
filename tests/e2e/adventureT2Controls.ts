import {expect,type Page} from '@playwright/test';
import type {AdventurePrototype} from '../../src/app/adventurePrototype';
import type {Snapshot} from '../../src/core/types';
import type {PveSnapshot} from '../../src/core/pve';
import type {WeaponSnapshot} from '../../src/core/combat';
import type {RunnerState} from '../../src/core/stoneRunner';
export interface T2State {prototype:ReturnType<AdventurePrototype['snapshot']>;snapshot:Snapshot;pve:PveSnapshot;weapons:WeaponSnapshot;
  lab:unknown;paused:boolean;checkpoint:boolean;completed:boolean;bossActive:boolean;
  mission:{consoleActive:boolean;relayActive:boolean;reserveRecovered:boolean};core:{position:{x:number;z:number};collected:boolean}|null;
  enemies:(RunnerState&{screen:{x:number;y:number}})[];monsterScreen:{x:number;y:number};pickupVisuals:{id:string;visible:boolean}[]}
export const readT2=(page:Page):Promise<T2State>=>page.evaluate(()=>(window as unknown as {__coreArena:{read():T2State}}).__coreArena.read());
export async function walkT2(page:Page,x:number,z:number){
  for(const [axis,target] of [['z',z],['x',x]] as const){
    const delta=target-(await readT2(page)).snapshot.position[axis];if(Math.abs(delta)<.2)continue;
    const sign=Math.sign(delta),key=axis==='x'?sign>0?'KeyD':'KeyA':sign>0?'KeyS':'KeyW';
    await page.keyboard.down(key);try{await page.waitForFunction(({axis,target,sign})=>
      ((window as unknown as {__coreArena:{read():T2State}}).__coreArena.read().snapshot.position[axis]-target)*sign>=-.15,
    {axis,target,sign},{timeout:10000});}finally{await page.keyboard.up(key);}
  }
  const p=(await readT2(page)).snapshot.position;expect(Math.hypot(p.x-x,p.z-z),JSON.stringify(p)).toBeLessThan(.65);
}
export async function defeatT2(page:Page,index:'boss'|number,complement=false){
  const deadline=Date.now()+100000,frames:T2State[]=[];let lastDash=-1000;
  try{while(Date.now()<deadline){
    const s=await readT2(page),p=s.snapshot,b=s.pve;
    if(index==='boss'?b.outcome!=='running':s.enemies[index]!.hp===0)break;
    const center=index==='boss'?b.center:s.enemies[index]!.center,dx=center.x-p.position.x,dz=center.z-p.position.z,d=Math.hypot(dx,dz);
    let x=0,z=0;
    if(index==='boss'&&b.phase==='melee'&&b.exchange?.window!=='counter'){
      if(b.phaseTick>12&&b.phaseTick<48){x=Math.cos(b.facing);z=-Math.sin(b.facing);}
    }else if(index==='boss'&&b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')){
      if(Math.hypot(p.position.x-b.target.x,p.position.z-b.target.z)<3.8)x=p.position.x<0?1:-1;
    }else if(d>(index==='boss'?3.5:3)){x=dx/d;z=dz/d;}
    for(const [key,on] of [['KeyD',x>.2],['KeyA',x<-.2],['KeyS',z>.2],['KeyW',z<-.2]] as const)
      if(on)await page.keyboard.down(key);else await page.keyboard.up(key);
    if(index==='boss'&&b.phase==='melee'&&b.phaseTick>=16&&b.phaseTick<23&&p.tick-lastDash>60){await page.keyboard.press('ShiftLeft');lastDash=p.tick;}
    if(index==='boss'&&p.grounded&&b.kind==='wave'&&(b.phase==='warning'&&b.phaseTick>=76&&d<5||b.phase==='attack'&&d>b.waveRadius&&d-b.waveRadius<2.8))await page.keyboard.press('Space');
    const pulse=complement&&index==='boss'&&d>5&&s.weapons.ammo>0&&b.phase!=='emerging';
    if((pulse?'pulse':'arc')!==s.weapons.selected)await page.keyboard.press(pulse?'Digit2':'Digit1');
    const point=index==='boss'?s.monsterScreen:s.enemies[index]!.screen;
    if((s.prototype.whip.phase==='idle'||pulse)&&b.outcome==='running'&&(index!=='boss'||b.phase!=='emerging'))await page.mouse.click(point.x,point.y);
    if(frames.length===0||p.tick-frames.at(-1)!.snapshot.tick>=60)frames.push(s);
    await page.waitForTimeout(35);
  }}finally{for(const key of ['KeyW','KeyA','KeyS','KeyD'])await page.keyboard.up(key);}
  const result=await readT2(page);expect(result.pve.outcome).not.toBe('defeat');
  if(index==='boss')expect(result.pve.outcome).toBe('victory');else expect(result.enemies[index]!.hp).toBe(0);
  return {result,frames};
}
