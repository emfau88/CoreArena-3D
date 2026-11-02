import { AdventureAim, AdventureMotor, BOSS_BODY } from '../core/adventureControls';
import { EnergyWhip, whipPose, type WhipSnapshot } from '../core/energyWhip';
import type { Simulation } from '../core/simulation';
import type { Ray, MoveCommand } from '../core/types';
import type { CombatTarget } from '../core/combat';
import type { RapierWorld } from '../physics/rapierWorld';
import type { StoneFeedback } from './stoneFeedback';
export { EnergyWhipView } from '../render/energyWhipView';
export { BOSS_BODY };

export const PRACTICE_TARGETS:readonly CombatTarget[]=[
  {id:'practice-near',center:{x:-1.6,y:1.2,z:-24},radius:.55},
  {id:'practice-return',center:{x:1.6,y:1.2,z:-24},radius:.55},
  {id:'practice-far',center:{x:0,y:1.2,z:-28},radius:.55},
  {id:'practice-high',center:{x:4,y:3.7,z:-24},radius:.4},
  {id:'practice-cover',center:{x:8,y:1.2,z:-28},radius:.4},
  {id:'practice-plateau',center:{x:-12,y:2.3,z:-23},radius:.4},
];
/** Created only by the development lab. No URL parsing or boss-rule changes here. */
export class AdventurePrototype {
  readonly aim=new AdventureAim();
  readonly whip=new EnergyWhip();
  readonly motor:AdventureMotor;
  private hitCounts:Record<string,number>={};
  constructor(simulation:Simulation,readonly practice:boolean) {this.motor=new AdventureMotor(simulation);}
  step(command:MoveCommand,dash:boolean,pressed:boolean,ray:Ray|null,world:RapierWorld,targets:readonly CombatTarget[],feedback:StoneFeedback,guarded=false,overhead=false) {
    const direction=this.aim.update(ray,this.motor.simulation.snapshot().position);
    const move=this.motor.step(command,dash,direction);
    if(move.started){this.whip.cancel();feedback.play('dash');}
    const oldPhase=this.whip.snapshot().phase;
    const attack=this.whip.step(move.current.tick,move.current.position,direction,(pressed||overhead)&&!move.active,world,this.practice?PRACTICE_TARGETS:targets,
      overhead?'overhead':'sweep',guarded?'stone-warden':undefined);
    if(attack.attacked&&overhead)feedback.play('whip-charge');
    if(attack.phase==='forward'&&oldPhase!=='forward')feedback.play(this.whip.snapshot().attack==='overhead'?'whip-crack':'whip-swing');
    if(attack.phase==='return'&&oldPhase!=='return')feedback.play('whip-return');
    for(const contact of attack.contacts){
      this.hitCounts[contact.target]=(this.hitCounts[contact.target]??0)+1;
      feedback.play(contact.guarded?'whip-guard':contact.attack==='overhead'?'whip-impact':contact.phase==='forward'?'whip-hit':'whip-back-hit');
    }
    return {...move,attack};
  }
  suspend(){this.motor.suspend();this.whip.cancel();}
  snapshot(){return {aim:this.aim.snapshot(),dash:this.motor.snapshot(),whip:this.whip.snapshot(),practice:this.practice,
    targets:this.practice?PRACTICE_TARGETS.map(t=>({...t,hits:this.hitCounts[t.id]??0})):[],body:BOSS_BODY};}
  presentation(w:WhipSnapshot){const dir=this.aim.snapshot();return {
    yaw:w.phase==='idle'?Math.atan2(dir.x,dir.z):w.yaw,
    whip:{angle:whipPose(w.age,w.attack).angle,attack:w.attack,age:w.age,active:w.phase!=='idle',dash:this.motor.snapshot().remaining>0},
  };}
}
