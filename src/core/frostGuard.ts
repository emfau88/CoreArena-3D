import type {Vec3} from './types';
import type {Damage} from './match';
import type {MonsterWorld} from './pve';
import {directionTo} from './combat';
export interface FrostGuardDefinition {readonly id:string;readonly center:Vec3;readonly radius:number;readonly activateZ:number}
export interface FrostGuardState {id:string;center:Vec3;hp:number;phase:'idle'|'warning'|'recovery'|'dead';phaseTick:number;facing:number;shot:Vec3|null}
export const FROST_GUARD_RULES={hp:72,warning:60,recovery:90,speed:.18,range:18,damage:18,radius:.24};
/** One deliberately slow, fixed-direction projectile teaches leaving a line or using real cover. */
export class FrostGuard {
  private state:FrostGuardState;private traveled=0;
  constructor(readonly definition:FrostGuardDefinition){this.state=this.fresh();}
  private fresh():FrostGuardState{return {id:this.definition.id,center:{...this.definition.center},hp:FROST_GUARD_RULES.hp,phase:'idle',phaseTick:0,facing:0,shot:null};}
  snapshot(){return this.state;}
  reset(){this.state=this.fresh();this.traveled=0;}
  clear(){this.state={...this.fresh(),hp:0,phase:'dead'};}
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]=[]){
    const r=FROST_GUARD_RULES;let damage=0;
    if(this.state.hp<=0)return 0;
    const hp=Math.max(0,this.state.hp-hits.filter(h=>h.source==='player'&&h.target===this.state.id&&Number.isFinite(h.amount)&&h.amount>0).reduce((n,h)=>n+h.amount,0));
    this.state={...this.state,hp,phaseTick:this.state.phaseTick+1};
    if(hp===0){this.clear();return 0;}
    let s=this.state;
    if(s.shot){
      const direction={x:Math.sin(s.facing),y:0,z:Math.cos(s.facing)},next={x:s.shot.x+direction.x*r.speed,y:.85,z:s.shot.z+direction.z*r.speed};
      this.traveled+=r.speed;
      const covered=world.raycast({origin:s.shot,direction},r.speed,true);
      const touching=player.y<1.4&&player.y>-.4&&Math.hypot(next.x-player.x,next.z-player.z)<r.radius+.4+r.speed;
      if(touching&&!covered)damage=r.damage;
      this.state={...s,shot:covered||touching||this.traveled>=r.range?null:next};s=this.state;
    }
    if(s.phase==='idle'&&player.z<this.definition.activateZ&&Math.hypot(player.x-s.center.x,player.z-s.center.z)<18){
      const ray=directionTo(s.center,{...player,y:1});
      if(!world.raycast({origin:s.center,direction:ray.direction},ray.distance,true))this.state={...s,phase:'warning',phaseTick:0,facing:Math.atan2(player.x-s.center.x,player.z-s.center.z)};
    }else if(s.phase==='warning'&&s.phaseTick>=r.warning){
      this.traveled=0;this.state={...s,phase:'recovery',phaseTick:0,shot:{...s.center,y:.85}};
    }else if(s.phase==='recovery'&&s.phaseTick>=r.recovery&&!s.shot)this.state={...s,phase:'idle',phaseTick:0};
    return damage;
  }
}
