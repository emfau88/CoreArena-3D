import type { Damage } from './match';
import type { RayWorld, Vec3 } from './types';
import type { CombatTarget } from './combat';
import type { WhipMod } from './whipMods';

export const WHIP = Object.freeze({ windup:6, forwardEnd:16, returnStart:21, returnEnd:31, duration:42,
  reach:4.8, radius:.12, segments:16, forwardDamage:22, returnDamage:14, aimTurnPerTick:.08 });
// More burst and reach, but lower sustained damage than the broad 22+14 sweep.
export const OVERHEAD = Object.freeze({ ...WHIP, windup:14, forwardEnd:24, returnStart:24, returnEnd:24,
  duration:64, reach:5.6, forwardDamage:46, returnDamage:0, aimTurnPerTick:.045 });
export const AIR_WHIP = Object.freeze({ ...WHIP, windup:5, forwardEnd:16, returnStart:16, returnEnd:16,
  duration:38, reach:4.5, forwardDamage:30, returnDamage:0, aimTurnPerTick:.06 });
export type WhipAttack = 'sweep'|'overhead'|'air';
export const HOOK = Object.freeze({...WHIP,returnStart:25,returnEnd:39,duration:54,forwardDamage:12,returnDamage:24});
export const FORK = Object.freeze({...WHIP,reach:3.8,forwardDamage:20,returnDamage:12});
export const whipRules = (attack:WhipAttack,mod:WhipMod='base') =>
  attack==='overhead'?OVERHEAD:attack==='air'?AIR_WHIP:mod==='hook'?HOOK:mod==='fork'?FORK:WHIP;
export type WhipPhase = 'idle'|'windup'|'forward'|'turn'|'return'|'recovery';
export const whipPhase = (age:number,attack:WhipAttack='sweep',mod:WhipMod='base'):WhipPhase => {
  const r=whipRules(attack,mod);
  return age<0||age>=r.duration?'idle':age<r.windup?'windup':
    age<r.forwardEnd?'forward':age<r.returnStart?'turn':age<r.returnEnd?'return':'recovery';
};
const mix = (a:number,b:number,t:number) => a+(b-a)*Math.max(0,Math.min(1,t));
const lerp = (a:Vec3,b:Vec3,t:number):Vec3 => ({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t)});
const distance = (a:Vec3,b:Vec3) => Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const snap=(t:number)=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
export function whipPose(age:number,attack:WhipAttack='sweep',mod:WhipMod='base') {
  const phase=whipPhase(age,attack,mod),r=whipRules(attack,mod);
  if(attack==='air'){
    if(phase==='windup')return {angle:mix(.3,.65,age/5),length:mix(.65,1.4,age/5)};
    if(phase==='forward')return {angle:mix(.65,-.9,snap((age-5)/11)),length:mix(1.4,AIR_WHIP.reach,(age-5)/3)};
    return {angle:mix(-.9,.1,(age-16)/22),length:phase==='idle'?.65:mix(AIR_WHIP.reach,.65,(age-16)/16)};
  }
  if(attack==='overhead') {
    if(phase==='windup')return {angle:mix(.25,1.45,age/14),length:mix(.65,2.2,age/14)};
    if(phase==='forward')return {angle:mix(1.45,-.13,snap((age-14)/10)),length:mix(2.2,OVERHEAD.reach,(age-14)/3)};
    return {angle:mix(-.13,.25,(age-24)/40),length:phase==='idle'?.65:mix(OVERHEAD.reach,.65,(age-24)/24)};
  }
  const turnLength=r.reach-.3,returnLength=mod==='hook'?4.5:2.2;
  if(phase==='windup')return {angle:mix(-1.45,-1.05,age/r.windup),length:mix(.65,1.5,age/r.windup)};
  if(phase==='forward')return {angle:mix(-1.05,1.05,snap((age-r.windup)/(r.forwardEnd-r.windup))),length:mix(1.5,r.reach,(age-r.windup)/2)};
  if(phase==='turn')return {angle:mix(1.05,1.2,(age-r.forwardEnd)/(r.returnStart-r.forwardEnd)),length:mix(r.reach,turnLength,(age-r.forwardEnd)/(r.returnStart-r.forwardEnd))};
  if(phase==='return')return {angle:mix(1.2,-1.05,snap((age-r.returnStart)/(r.returnEnd-r.returnStart))),length:mix(turnLength,returnLength,(age-r.returnStart)/(r.returnEnd-r.returnStart))};
  return {angle:mix(-1.05,-.5,(age-r.returnEnd)/(r.duration-r.returnEnd)),length:phase==='idle'?.65:mix(returnLength,.65,(age-r.returnEnd)/(r.duration-r.returnEnd))};
}

/** Authored curve in world space. The same function drives visible rope and collision sweeps. */
export function whipCurve(foot:Vec3,yaw:number,age:number,attack:WhipAttack='sweep',mod:WhipMod='base',branch=-1):Vec3[] {
  const pose=whipPose(age,attack,mod),right={x:Math.cos(yaw),z:-Math.sin(yaw)},forward={x:Math.sin(yaw),z:Math.cos(yaw)};
  const root={x:foot.x+right.x*.28+forward.x*.32,y:foot.y+1.1,z:foot.z+right.z*.28+forward.z*.32};
  return Array.from({length:WHIP.segments+1},(_,i)=>{
    if(attack==='overhead') {
      const t=i/WHIP.segments,pitch=pose.angle+Math.sin(t*Math.PI)*.24;
      const reach=Math.cos(pitch)*pose.length*t;
      return {x:root.x+forward.x*reach,y:root.y+Math.sin(pitch)*pose.length*t,z:root.z+forward.z*reach};
    }
    if(attack==='air'){
      const t=i/WHIP.segments,phase=whipPhase(age,attack);
      const sweep=phase==='forward'?mix(-.6,.08,snap((age-5)/11)):phase==='windup'?-.6:.08;
      const angle=yaw+sweep*t,pitch=pose.angle+Math.sin(t*Math.PI)*.16,reach=Math.cos(pitch)*pose.length*t;
      return {x:root.x+Math.sin(angle)*reach,y:root.y+Math.sin(pitch)*pose.length*t,z:root.z+Math.cos(angle)*reach};
    }
    const t=i/WHIP.segments,lag=Math.sin(t*Math.PI)*.32*(whipPhase(age,attack,mod)==='return'?-1:1);
    const spread=mod==='fork'?branch*.28*Math.max(0,(t-.625)/.375):0;
    const angle=yaw+pose.angle*(.35+.65*t)+lag+spread;
    return {x:root.x+Math.sin(angle)*pose.length*t,y:root.y+Math.sin(t*Math.PI)*.18,
      z:root.z+Math.cos(angle)*pose.length*t};
  });
}

/** Stop the whole rope at its first solid world contact; no ribbon on the far side of a wall. */
export function clipWhip(points:readonly Vec3[],world:RayWorld):Vec3[] {
  const result=[points[0]!];
  for(let i=1;i<points.length;i++) {
    const a=points[i-1]!,b=points[i]!,length=distance(a,b);
    if(length<1e-6) {result.push(b);continue;}
    const hit=world.raycast({origin:a,direction:{x:(b.x-a.x)/length,y:(b.y-a.y)/length,z:(b.z-a.z)/length}},length,true);
    if(hit) {result.push(hit.point);break;} result.push(b);
  }
  return result;
}
/** Each fork is clipped from the shared root, including cover before the split. */
export function whipStrands(foot:Vec3,yaw:number,age:number,attack:WhipAttack,mod:WhipMod,world:RayWorld):Vec3[][] {
  const branches=mod==='fork'&&attack==='sweep'?[-1,1]:[-1];
  return branches.map(branch=>clipWhip(whipCurve(foot,yaw,age,attack,mod,branch),world));
}
function closestOnSegment(p:Vec3,a:Vec3,b:Vec3):Vec3 {
  const x=b.x-a.x,y=b.y-a.y,z=b.z-a.z;
  const t=((p.x-a.x)*x+(p.y-a.y)*y+(p.z-a.z)*z)/(x*x+y*y+z*z||1);
  return lerp(a,b,t);
}
export interface WhipContact { target:string; phase:'forward'|'return'; attack:WhipAttack; point:Vec3; tick:number; guarded:boolean }
export interface WhipSnapshot { age:number; phase:WhipPhase; yaw:number; points:readonly Vec3[];
  mod:WhipMod; branches:readonly (readonly Vec3[])[];
  attack:WhipAttack; readyIn:number; sequence:number; contact:WhipContact|null; forwardHits:number; returnHits:number; misses:number; cancelled:number }

export class EnergyWhip {
  constructor(readonly mod:WhipMod='base') {}
  private age=-1;
  private yaw=0;
  private sequence=0;
  private attack:WhipAttack='sweep';
  private readyAt=0;
  private tick=0;
  private previousFoot:Vec3|null=null;
  private renderFrom:Vec3|null=null;
  private previousTargets=new Map<string,Vec3>();
  private hit={forward:new Set<string>(),return:new Set<string>()};
  private points:Vec3[]=[];
  private branches:Vec3[][]=[];
  private contact:WhipContact|null=null;
  private totals={forwardHits:0,returnHits:0,misses:0,cancelled:0};
  cancel() { if(this.age>=0)this.totals.cancelled++; this.age=-1;this.points=[];this.branches=[];this.contact=null;this.previousFoot=null;this.previousTargets.clear(); }
  step(tick:number,foot:Vec3,aim:Vec3,pressed:boolean,world:RayWorld,targets:readonly CombatTarget[],attack:WhipAttack='sweep',guardedTarget?:string) {
    this.tick=tick;
    this.renderFrom=this.previousFoot??foot;
    let started=false;
    if(this.age<0 && pressed && tick>=this.readyAt) {
      this.attack=attack;
      // Dash/weapon switching can cancel the animation, never erase heavy/air/mod recovery.
      if(attack!=='sweep'||this.mod!=='base')this.readyAt=tick+whipRules(attack,this.mod).duration;
      this.age=0;this.yaw=Math.atan2(aim.x,aim.z);this.sequence++;started=true;
      this.hit={forward:new Set(),return:new Set()};this.previousFoot=foot;this.contact=null;
    } else if(this.age>=0) this.age++;
    const rules=whipRules(this.attack,this.mod);
    if(this.age>=rules.duration)this.age=-1;
    const phase=whipPhase(this.age,this.attack,this.mod),damage:Damage[]=[],contacts:WhipContact[]=[];
    if(phase==='windup') {
      const desired=Math.atan2(aim.x,aim.z),turn=Math.atan2(Math.sin(desired-this.yaw),Math.cos(desired-this.yaw));
      this.yaw+=Math.max(-rules.aimTurnPerTick,Math.min(rules.aimTurnPerTick,turn));
    }
    if(this.age>=0) {
      const strands=whipStrands(foot,this.yaw,this.age,this.attack,this.mod,world);
      this.points=strands[0]!;this.branches=strands.slice(1);
      // Integrate both rope motion and target motion. Sample spacing is smaller than the contact tube.
      const previous=this.previousFoot??foot;
      const targetMotion=Math.max(0,...targets.map(t=>distance(t.center,this.previousTargets.get(t.id)??t.center)));
      const fromPose=whipPose(Math.max(0,this.age-1),this.attack,this.mod),toPose=whipPose(this.age,this.attack,this.mod);
      // Cubic snap has a bounded derivative; 1.4 covers its largest within-tick/average ratio.
      const ropeMotion=1.4*(rules.reach*Math.abs(toPose.angle-fromPose.angle)+Math.abs(toPose.length-fromPose.length));
      const slices=Math.max(1,Math.ceil((distance(previous,foot)+targetMotion+ropeMotion+.1)/.06));
      for(let j=0;j<=slices;j++) {
        const t=j/slices,age=Math.max(0,this.age-1+t),active=whipPhase(age,this.attack,this.mod);
        if(active!=='forward'&&active!=='return')continue;
        for(const pose of whipStrands(lerp(previous,foot,t),this.yaw,age,this.attack,this.mod,world)){
          for(const target of targets) {
            if(this.hit[active].has(target.id))continue;
            const center=lerp(this.previousTargets.get(target.id)??target.center,target.center,t);
            // The short hand connector never deals damage.
            for(let i=2;i<pose.length;i++) {
              const point=closestOnSegment(center,pose[i-1]!,pose[i]!);
              if(distance(center,point)>target.radius+WHIP.radius)continue;
              const sight=distance(foot,center),origin={...foot,y:foot.y+1.1};
              const length=distance(origin,point);
              const cover=length>1e-6?world.raycast({origin,direction:{x:(point.x-origin.x)/length,y:(point.y-origin.y)/length,z:(point.z-origin.z)/length}},length,true):null;
              if(cover || sight>rules.reach+target.radius+1)break;
              this.hit[active].add(target.id);this.totals[active==='forward'?'forwardHits':'returnHits']++;
              const contact={target:target.id,phase:active,attack:this.attack,point,tick,guarded:target.id===guardedTarget} as const; contacts.push(contact);this.contact=contact;
              damage.push({source:'player',target:target.id,amount:active==='forward'?rules.forwardDamage:rules.returnDamage});break;
            }
          }
        }
      }
      if(this.age===rules.forwardEnd&&!this.hit.forward.size)this.totals.misses++;
      if(rules.returnDamage>0&&this.age===rules.returnEnd&&!this.hit.return.size)this.totals.misses++;
    } else {this.points=[];this.branches=[];}
    this.previousFoot={...foot};this.previousTargets=new Map(targets.map(t=>[t.id,{...t.center}]));
    return {attacked:started,damage,contacts,phase};
  }
  snapshot():WhipSnapshot {return {age:this.age,phase:whipPhase(this.age,this.attack,this.mod),mod:this.mod,branches:this.branches,attack:this.attack,readyIn:Math.max(0,this.readyAt-this.tick),yaw:this.yaw,points:this.points,sequence:this.sequence,contact:this.contact,...this.totals};}
  /** Render between fixed steps using the same authored curve and world clipping; never changes damage state. */
  sample(alpha:number,world:RayWorld):WhipSnapshot {
    const state=this.snapshot();if(this.age<0||!this.previousFoot)return state;
    const age=Math.max(0,this.age-1+Math.max(0,Math.min(1,alpha)));
    const foot=lerp(this.renderFrom??this.previousFoot,this.previousFoot,alpha);
    const strands=whipStrands(foot,this.yaw,age,this.attack,this.mod,world);
    return {...state,age,phase:whipPhase(age,this.attack,this.mod),points:strands[0]!,branches:strands.slice(1)};
  }
}
