import { ADVENTURE_BOSS, ADVENTURE_RUNNERS, STONE_ADVENTURE_COMBAT } from '../arena/stoneAdventure';
import { BossNavigation } from './bossNavigation';
import { PveEncounter, PVE_RULES, type MonsterWorld } from './pve';
import { StoneRunner } from './stoneRunner';
import type { Damage } from './match';
import type { Vec3 } from './types';

function navigationFor(floorId:string,radius:number):BossNavigation {
  const floor=STONE_ADVENTURE_COMBAT.boxes.find(b=>b.id===floorId)!;
  const boxes=STONE_ADVENTURE_COMBAT.boxes.filter(b=>b.material!=='floor' && b.id!=='dormant-warden'
    && Math.abs(b.center.x-floor.center.x)<=(b.size.x+floor.size.x)/2
    && Math.abs(b.center.z-floor.center.z)<=(b.size.z+floor.size.z)/2);
  return new BossNavigation({...STONE_ADVENTURE_COMBAT,boxes:[{...floor,id:'floor'},...boxes]},radius);
}
export class AdventureFight {
  private readonly bossNavigation=navigationFor('floor-boss',PVE_RULES.movementRadius);
  private readonly runnerNavigation=ADVENTURE_RUNNERS.map(d=>navigationFor(d.floor,.65));
  readonly life=new PveEncounter(PVE_RULES,ADVENTURE_BOSS,'stone',(from,player)=>this.bossNavigation.steer(from,player));
  readonly runners=ADVENTURE_RUNNERS.map((d,i)=>new StoneRunner(d,(from,player)=>this.runnerNavigation[i]!.steer(from,player)));
  bossActive=false;
  reset():void { this.life.reset(); this.runners.forEach(r=>r.reset()); this.bossNavigation.reset();
    this.runnerNavigation.forEach(n=>n.reset()); this.bossActive=false; }
  snapshot() { return {bossActive:this.bossActive,pve:this.life.snapshot(),runners:this.runners.map(r=>r.snapshot())}; }
  targets() {
    const small=this.runners.flatMap((r,i)=>r.snapshot().hp>0 ? [{...ADVENTURE_RUNNERS[i]!,center:r.snapshot().center}] : []);
    const boss=this.life.snapshot();
    return [...small,...(this.bossActive && boss.phase!=='emerging' && boss.outcome==='running' ? [{...ADVENTURE_BOSS,center:boss.center}] : [])];
  }
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]):void {
    if(this.life.snapshot().outcome!=='running') return;
    const damage=this.runners.reduce((sum,r)=>sum+r.step(player,world,hits),0);
    // The two visible guards release the seal. Crossing into the final court wakes the existing boss.
    if(!this.bossActive && this.runners.every(r=>!r.snapshot().hp) && player.z< -20.5 && Math.abs(player.x)<15) this.bossActive=true;
    this.life.step(player,world,hits,{active:this.bossActive,incomingDamage:damage});
  }
}
export type AdventureFightState=ReturnType<AdventureFight['snapshot']>;
