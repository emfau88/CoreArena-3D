import { ADVENTURE_BOSS, ADVENTURE_RUNNERS, ADVENTURE_CHECKPOINT, ADVENTURE_BOSS_PICKUPS,
  STONE_ADVENTURE_COMBAT, STONE_ADVENTURE_PICKUPS } from '../arena/stoneAdventure';
import { BossNavigation } from './bossNavigation';
import { PveEncounter, PVE_RULES, type MonsterWorld } from './pve';
import { StoneRunner } from './stoneRunner';
import { Combat, WEAPONS } from './combat';
import { Pickups } from './pickups';
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
  readonly combat=new Combat();
  readonly pickups=new Pickups(STONE_ADVENTURE_PICKUPS,false);
  bossActive=false;
  checkpoint=false;
  completed=false;
  reset():void { this.life.reset(); this.runners.forEach(r=>r.reset()); this.bossNavigation.reset();
    this.runnerNavigation.forEach(n=>n.reset()); this.bossActive=this.checkpoint=this.completed=false;
    this.combat.reset(); this.pickups.reset(); }
  /** Retry preserves the cleared approach, but never carries boss damage/effects into a new attempt. */
  retry():Vec3 {
    if(!this.checkpoint || this.life.snapshot().outcome!=='defeat') { this.reset(); return STONE_ADVENTURE_COMBAT.spawn; }
    this.life.reset(); this.bossNavigation.reset(); this.bossActive=false;
    this.combat.reset(); this.combat.addAmmo(WEAPONS.pulse.maxAmmo,true); this.combat.select('pulse');
    this.pickups.reset(ADVENTURE_BOSS_PICKUPS);
    return ADVENTURE_CHECKPOINT;
  }
  snapshot() { return {bossActive:this.bossActive,checkpoint:this.checkpoint,completed:this.completed,
    pve:this.life.snapshot(),runners:this.runners.map(r=>r.snapshot())}; }
  targets() {
    const small=this.runners.flatMap((r,i)=>r.snapshot().hp>0 ? [{...ADVENTURE_RUNNERS[i]!,center:r.snapshot().center}] : []);
    const boss=this.life.snapshot();
    return [...small,...(this.bossActive && boss.phase!=='emerging' && boss.outcome==='running' ? [{...ADVENTURE_BOSS,center:boss.center}] : [])];
  }
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]):void {
    if(this.life.snapshot().outcome==='victory' && player.z< -45 && Math.abs(player.x)<4.5 && player.y>-.2 && player.y<.4) this.completed=true;
    if(this.life.snapshot().outcome!=='running') return;
    const damage=this.runners.reduce((sum,r)=>sum+r.step(player,world,hits),0);
    const cleared=this.runners.every(r=>!r.snapshot().hp);
    // One-time relief on reaching the seal; returning here never becomes a healing loop.
    if(!this.checkpoint && cleared && player.z< -12.5 && player.z> -41 && Math.abs(player.x)<15 && player.y>-.2 && player.y<.4) {
      this.checkpoint=true; this.life.restore(100); this.life.restoreArmor(Math.max(0,50-this.life.snapshot().armor));
      this.combat.addAmmo(WEAPONS.pulse.maxAmmo,true);
    }
    // The two visible guards release the seal. Crossing into the final court wakes the existing boss.
    if(!this.bossActive && this.checkpoint && cleared && player.z< -20.5 && player.z> -41 && Math.abs(player.x)<15) this.bossActive=true;
    this.life.step(player,world,hits,{active:this.bossActive,incomingDamage:damage});
  }
}
export type AdventureFightState=ReturnType<AdventureFight['snapshot']>;
