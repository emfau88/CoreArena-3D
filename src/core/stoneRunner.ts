import type { Damage } from './match';
import { directionTo } from './combat';
import type { MonsterWorld } from './pve';
import type { Vec3 } from './types';

export interface RunnerDefinition {
  readonly id:string; readonly center:Vec3; readonly radius:number; readonly floor:string;
  readonly zone:{readonly left:number;readonly right:number;readonly back:number;readonly front:number};
}
export const RUNNER_RULES = { hp:70, speed:3.2, range:1.8, windup:24, recovery:42, damage:14 } as const;
export interface RunnerState {
  readonly id:string; readonly center:Vec3; readonly hp:number; readonly facing:number;
  readonly phase:'idle'|'chasing'|'windup'|'recovery'|'dead'; readonly phaseTick:number; readonly moving:boolean;
}

/** One small ground melee enemy: fixed home court, locked swing, no special attacks. */
export class StoneRunner {
  private state:RunnerState;
  constructor(readonly definition:RunnerDefinition, private readonly steer:(from:Vec3,target:Vec3)=>Vec3) { this.state=this.fresh(); }
  private fresh():RunnerState { return {id:this.definition.id,center:{...this.definition.center},hp:RUNNER_RULES.hp,
    facing:0,phase:'idle',phaseTick:0,moving:false}; }
  snapshot():RunnerState { return this.state; }
  reset():void { this.state=this.fresh(); }
  private inCourt(p:Vec3):boolean { const z=this.definition.zone;
    return p.x>z.left && p.x<z.right && p.z>z.back && p.z<z.front; }
  private canHit(player:Vec3,world:MonsterWorld,directional:boolean):boolean {
    const s=this.state, dx=player.x-s.center.x,dz=player.z-s.center.z;
    if(player.y<-.2 || player.y>1.05 || Math.hypot(dx,dz)>RUNNER_RULES.range) return false;
    if(directional && Math.cos(Math.atan2(dx,dz)-s.facing)<Math.cos(.95)) return false;
    const line=directionTo(s.center,{...player,y:player.y+.85});
    return !world.raycast({origin:s.center,direction:line.direction},line.distance,true);
  }
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]):number {
    if(this.state.phase==='dead') { this.state={...this.state,phaseTick:this.state.phaseTick+1}; return 0; }
    const damage=hits.filter(h=>h.target===this.definition.id && h.source==='player' && Number.isFinite(h.amount) && h.amount>0)
      .reduce((total,h)=>total+h.amount,0);
    this.state={...this.state,hp:Math.max(0,this.state.hp-damage),phaseTick:this.state.phaseTick+1,moving:false};
    if(!this.state.hp) { this.state={...this.state,phase:'dead',phaseTick:0}; return 0; }
    const engaged=this.inCourt(player), s=this.state;
    if(!engaged && (s.phase==='windup'||s.phase==='recovery')) this.state={...s,phase:'idle',phaseTick:0};
    if(engaged && s.phase==='windup') {
      const hit=s.phaseTick===RUNNER_RULES.windup && this.canHit(player,world,true);
      if(s.phaseTick>=RUNNER_RULES.windup) this.state={...s,phase:'recovery',phaseTick:0};
      return hit ? RUNNER_RULES.damage : 0;
    }
    if(engaged && s.phase==='recovery') {
      if(s.phaseTick>=RUNNER_RULES.recovery) this.state={...s,phase:'chasing',phaseTick:0};
      return 0;
    }
    if(engaged && this.canHit(player,world,false)) {
      this.state={...this.state,phase:'windup',phaseTick:0,facing:Math.atan2(player.x-s.center.x,player.z-s.center.z)};
      return 0;
    }
    const goal=engaged ? player : this.definition.center;
    const distance=Math.hypot(goal.x-s.center.x,goal.z-s.center.z);
    if(distance<.15 || engaged && distance>14) { this.state={...this.state,phase:'idle'}; return 0; }
    const waypoint=this.steer(s.center,goal), remaining=Math.hypot(waypoint.x-s.center.x,waypoint.z-s.center.z);
    if(remaining<.02) return 0;
    const angle=Math.atan2(waypoint.x-s.center.x,waypoint.z-s.center.z), step=Math.min(RUNNER_RULES.speed/60,remaining);
    for(const turn of [0,Math.PI/4,-Math.PI/4]) {
      const facing=angle+turn,direction={x:Math.sin(facing),y:0,z:Math.cos(facing)};
      if(world.sweepBall({origin:s.center,direction},step+.03,.65,true)) continue;
      const center={x:s.center.x+direction.x*step,y:s.center.y,z:s.center.z+direction.z*step};
      if(!this.inCourt(center) || !world.raycast({origin:{...center,y:.2},direction:{x:0,y:-1,z:0}},.4,true)) continue;
      this.state={...this.state,center,facing,moving:true,phase:'chasing'}; break;
    }
    return 0;
  }
}
