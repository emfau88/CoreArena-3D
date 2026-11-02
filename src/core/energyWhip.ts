import type { Damage } from './match';
import type { RayWorld, Vec3 } from './types';
import type { CombatTarget } from './combat';

export const WHIP = Object.freeze({ windup:6, forwardEnd:16, returnStart:21, returnEnd:31, duration:42,
  reach:4.8, radius:.12, segments:16, forwardDamage:22, returnDamage:14, aimTurnPerTick:.08 });
export type WhipPhase = 'idle'|'windup'|'forward'|'turn'|'return'|'recovery';
export const whipPhase = (age:number):WhipPhase => age<0||age>=WHIP.duration?'idle':age<WHIP.windup?'windup':
  age<WHIP.forwardEnd?'forward':age<WHIP.returnStart?'turn':age<WHIP.returnEnd?'return':'recovery';
const mix = (a:number,b:number,t:number) => a+(b-a)*Math.max(0,Math.min(1,t));
const lerp = (a:Vec3,b:Vec3,t:number):Vec3 => ({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t)});
const distance = (a:Vec3,b:Vec3) => Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function whipPose(age:number) {
  const phase=whipPhase(age);
  if(phase==='windup')return {angle:mix(-1.45,-1.05,age/WHIP.windup),length:mix(.65,1.5,age/WHIP.windup)};
  if(phase==='forward')return {angle:mix(-1.05,1.05,(age-WHIP.windup)/10),length:mix(1.5,WHIP.reach,(age-WHIP.windup)/4)};
  if(phase==='turn')return {angle:mix(1.05,1.2,(age-16)/5),length:mix(WHIP.reach,4.5,(age-16)/5)};
  if(phase==='return')return {angle:mix(1.2,-1.05,(age-21)/10),length:mix(4.5,2.2,(age-21)/10)};
  return {angle:mix(-1.05,-.5,(age-31)/11),length:phase==='idle'?.65:mix(2.2,.65,(age-31)/11)};
}

/** Authored curve in world space. The same function drives visible rope and collision sweeps. */
export function whipCurve(foot:Vec3,yaw:number,age:number):Vec3[] {
  const pose=whipPose(age),right={x:Math.cos(yaw),z:-Math.sin(yaw)},forward={x:Math.sin(yaw),z:Math.cos(yaw)};
  const root={x:foot.x+right.x*.28+forward.x*.32,y:foot.y+1.1,z:foot.z+right.z*.28+forward.z*.32};
  return Array.from({length:WHIP.segments+1},(_,i)=>{
    const t=i/WHIP.segments,lag=Math.sin(t*Math.PI)*.32*(whipPhase(age)==='return'?-1:1);
    const angle=yaw+pose.angle*(.35+.65*t)+lag;
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
function closestOnSegment(p:Vec3,a:Vec3,b:Vec3):Vec3 {
  const x=b.x-a.x,y=b.y-a.y,z=b.z-a.z;
  const t=((p.x-a.x)*x+(p.y-a.y)*y+(p.z-a.z)*z)/(x*x+y*y+z*z||1);
  return lerp(a,b,t);
}
export interface WhipContact { target:string; phase:'forward'|'return'; point:Vec3; tick:number }
export interface WhipSnapshot { age:number; phase:WhipPhase; yaw:number; points:readonly Vec3[];
  sequence:number; contact:WhipContact|null; forwardHits:number; returnHits:number; misses:number; cancelled:number }

export class EnergyWhip {
  private age=-1;
  private yaw=0;
  private sequence=0;
  private previousFoot:Vec3|null=null;
  private renderFrom:Vec3|null=null;
  private previousTargets=new Map<string,Vec3>();
  private hit={forward:new Set<string>(),return:new Set<string>()};
  private points:Vec3[]=[];
  private contact:WhipContact|null=null;
  private totals={forwardHits:0,returnHits:0,misses:0,cancelled:0};
  cancel() { if(this.age>=0)this.totals.cancelled++; this.age=-1;this.points=[];this.contact=null;this.previousFoot=null;this.previousTargets.clear(); }
  step(tick:number,foot:Vec3,aim:Vec3,pressed:boolean,world:RayWorld,targets:readonly CombatTarget[]) {
    this.renderFrom=this.previousFoot??foot;
    let started=false;
    if(this.age<0 && pressed) {
      this.age=0;this.yaw=Math.atan2(aim.x,aim.z);this.sequence++;started=true;
      this.hit={forward:new Set(),return:new Set()};this.previousFoot=foot;this.contact=null;
    } else if(this.age>=0) this.age++;
    if(this.age>=WHIP.duration)this.age=-1;
    const phase=whipPhase(this.age),damage:Damage[]=[],contacts:WhipContact[]=[];
    if(phase==='windup') {
      const desired=Math.atan2(aim.x,aim.z),turn=Math.atan2(Math.sin(desired-this.yaw),Math.cos(desired-this.yaw));
      this.yaw+=Math.max(-WHIP.aimTurnPerTick,Math.min(WHIP.aimTurnPerTick,turn));
    }
    if(this.age>=0) {
      this.points=clipWhip(whipCurve(foot,this.yaw,this.age),world);
      // Integrate both rope motion and target motion. Sample spacing is smaller than the contact tube.
      const previous=this.previousFoot??foot;
      const targetMotion=Math.max(0,...targets.map(t=>distance(t.center,this.previousTargets.get(t.id)??t.center)));
      const slices=Math.max(1,Math.ceil((distance(previous,foot)+targetMotion+1.4)/.08));
      for(let j=0;j<=slices;j++) {
        const t=j/slices,age=Math.max(0,this.age-1+t),active=whipPhase(age);
        if(active!=='forward'&&active!=='return')continue;
        const pose=clipWhip(whipCurve(lerp(previous,foot,t),this.yaw,age),world);
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
            if(cover || sight>WHIP.reach+target.radius+1)break;
            this.hit[active].add(target.id);this.totals[active==='forward'?'forwardHits':'returnHits']++;
            const contact={target:target.id,phase:active,point,tick} as const; contacts.push(contact);this.contact=contact;
            damage.push({source:'player',target:target.id,amount:active==='forward'?WHIP.forwardDamage:WHIP.returnDamage});break;
          }
        }
      }
      if(this.age===WHIP.forwardEnd&&!this.hit.forward.size)this.totals.misses++;
      if(this.age===WHIP.returnEnd&&!this.hit.return.size)this.totals.misses++;
    } else this.points=[];
    this.previousFoot={...foot};this.previousTargets=new Map(targets.map(t=>[t.id,{...t.center}]));
    return {attacked:started,damage,contacts,phase};
  }
  snapshot():WhipSnapshot {return {age:this.age,phase:whipPhase(this.age),yaw:this.yaw,points:this.points,sequence:this.sequence,contact:this.contact,...this.totals};}
  /** Render between fixed steps using the same authored curve and world clipping; never changes damage state. */
  sample(alpha:number,world:RayWorld):WhipSnapshot {
    const state=this.snapshot();if(this.age<0||!this.previousFoot)return state;
    const age=Math.max(0,this.age-1+Math.max(0,Math.min(1,alpha)));
    const foot=lerp(this.renderFrom??this.previousFoot,this.previousFoot,alpha);
    return {...state,age,phase:whipPhase(age),points:clipWhip(whipCurve(foot,this.yaw,age),world)};
  }
}
