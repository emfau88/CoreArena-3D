import { ADVENTURE_BOSS, ADVENTURE_BOSS_RULES, ADVENTURE_RUNNERS, ADVENTURE_CHECKPOINT, ADVENTURE_BOSS_PICKUPS,
  STONE_ADVENTURE_COMBAT, STONE_ADVENTURE_PICKUPS } from '../arena/stoneAdventure';
import { BossNavigation } from './bossNavigation';
import { PveEncounter, type MonsterWorld } from './pve';
import { StoneRunner } from './stoneRunner';
import { Combat, WEAPONS, directionTo } from './combat';
import { Pickups } from './pickups';
import type { Damage } from './match';
import type { Vec3 } from './types';
import { ADVENTURE_MISSION } from '../arena/adventureMission';

export interface MissionInteraction { kind:'console'|'relay'|'reserve'; enabled:boolean; label:string }

function navigationFor(floorId:string,radius:number):BossNavigation {
  const floor=STONE_ADVENTURE_COMBAT.boxes.find(b=>b.id===floorId)!;
  const boxes=STONE_ADVENTURE_COMBAT.boxes.filter(b=>b.material!=='floor' && b.id!=='dormant-warden'
    && Math.abs(b.center.x-floor.center.x)<=(b.size.x+floor.size.x)/2
    && Math.abs(b.center.z-floor.center.z)<=(b.size.z+floor.size.z)/2);
  return new BossNavigation({...STONE_ADVENTURE_COMBAT,boxes:[{...floor,id:'floor'},...boxes]},radius);
}
export class AdventureFight {
  private readonly bossNavigation=navigationFor('floor-boss',ADVENTURE_BOSS_RULES.movementRadius);
  private readonly runnerNavigation=ADVENTURE_RUNNERS.map(d=>navigationFor(d.floor,.65));
  readonly life=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS,'stone',(from,player)=>this.bossNavigation.steer(from,player));
  readonly runners=ADVENTURE_RUNNERS.map((d,i)=>new StoneRunner(d,(from,player)=>this.runnerNavigation[i]!.steer(from,player)));
  readonly combat=new Combat();
  readonly pickups=new Pickups(STONE_ADVENTURE_PICKUPS,false);
  bossActive=false;
  checkpoint=false;
  completed=false;
  consoleActive=false;
  relayActive=false;
  reserveRecovered=false;
  private core:{position:Vec3;collected:boolean}|null=null;
  reset():void { this.life.reset(); this.runners.forEach(r=>r.reset()); this.bossNavigation.reset();
    this.runnerNavigation.forEach(n=>n.reset()); this.bossActive=this.checkpoint=this.completed=false;
    this.consoleActive=this.relayActive=this.reserveRecovered=false;
    this.core=null; this.combat.reset(); this.pickups.reset(); }
  /** Retry preserves the cleared approach, but never carries boss damage/effects into a new attempt. */
  retry():Vec3 {
    if(!this.checkpoint || this.life.snapshot().outcome!=='defeat') { this.reset(); return STONE_ADVENTURE_COMBAT.spawn; }
    this.life.reset(); this.bossNavigation.reset(); this.bossActive=false; this.core=null; this.relayActive=false;
    if(this.reserveRecovered) this.life.restoreArmor(ADVENTURE_MISSION.reserve.armor-50);
    this.combat.reset(); this.combat.addAmmo(WEAPONS.pulse.maxAmmo,true); this.combat.select('pulse');
    this.pickups.reset(ADVENTURE_BOSS_PICKUPS);
    return ADVENTURE_CHECKPOINT;
  }
  snapshot() { return {bossActive:this.bossActive,checkpoint:this.checkpoint,completed:this.completed,core:this.core,
    consoleActive:this.consoleActive,relayActive:this.relayActive,reserveRecovered:this.reserveRecovered,entryClosed:!this.consoleActive || this.bossActive && this.life.snapshot().outcome==='running',
    pve:this.life.snapshot(),runners:this.runners.map(r=>r.snapshot())}; }
  interaction(player:Vec3,world:MonsterWorld):MissionInteraction|null {
    if(this.completed || this.life.snapshot().outcome==='defeat') return null;
    const reserve=ADVENTURE_MISSION.reserve;
    if(Math.abs(player.y-reserve.y)<.4 && Math.hypot(player.x-reserve.x,player.z-reserve.z)<reserve.reach){
      const origin={...player,y:player.y+.7},line=directionTo(origin,{x:reserve.x,y:reserve.y+.7,z:reserve.z});
      const obstruction=world.raycast({origin,direction:line.direction},line.distance,true);
      if(!obstruction || obstruction.id===reserve.id) return {kind:'reserve',enabled:!this.reserveRecovered,
        label:this.reserveRecovered?'Wartungsreserve geborgen':'Wartungsreserve bergen · 75 Rüstung am Ruhepunkt'};
    }
    if(Math.abs(player.y)>.4) return null;
    for(const kind of ['console','relay'] as const) {
      const object=ADVENTURE_MISSION[kind];
      if(Math.hypot(player.x-object.x,player.z-object.z)>object.reach) continue;
      const origin={...player,y:player.y+.9},line=directionTo(origin,{x:object.x,y:1.1,z:object.z});
      const obstruction=world.raycast({origin,direction:line.direction},line.distance,true);
      if(obstruction && obstruction.id!==object.id) continue;
      if(kind==='console') return {kind,enabled:!this.consoleActive && this.runners.every(r=>r.snapshot().hp===0),
        label:this.consoleActive?'Verbindung steht':this.runners.some(r=>r.snapshot().hp>0)?'Erst beide Steinläufer ausschalten':'Konsole starten'};
      return {kind,enabled:!!this.core?.collected && !this.relayActive,
        label:this.relayActive?'Relais online':this.core?.collected?'Steinkern einsetzen':'Relais · Steinkern fehlt'};
    }
    return null;
  }
  interact(player:Vec3,world:MonsterWorld):void {
    const action=this.interaction(player,world);
    if(!action?.enabled) return;
    if(action.kind==='reserve') {
      this.reserveRecovered=true;
      if(this.checkpoint) this.life.restoreArmor(Math.max(0,ADVENTURE_MISSION.reserve.armor-this.life.snapshot().armor));
    }
    else if(action.kind==='console') this.consoleActive=true;
    else this.relayActive=true;
  }
  targets() {
    const small=this.runners.flatMap((r,i)=>r.snapshot().hp>0 ? [{...ADVENTURE_RUNNERS[i]!,center:r.snapshot().center}] : []);
    const boss=this.life.snapshot();
    return [...small,...(this.bossActive && boss.phase!=='emerging' && boss.outcome==='running' ? [{...ADVENTURE_BOSS,center:boss.center}] : [])];
  }
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]):void {
    if(this.core && !this.core.collected && Math.hypot(player.x-this.core.position.x,player.z-this.core.position.z)<1.35
      && Math.abs(player.y-this.core.position.y)<.4) this.core={...this.core,collected:true};
    if(this.relayActive && this.life.snapshot().outcome==='victory' && player.z< -45 && Math.abs(player.x)<4.5 && player.y>-.2 && player.y<.4) this.completed=true;
    if(this.life.snapshot().outcome!=='running') return;
    const damage=this.runners.reduce((sum,r)=>sum+r.step(player,world,hits),0);
    const cleared=this.runners.every(r=>!r.snapshot().hp);
    // One-time relief on reaching the seal; returning here never becomes a healing loop.
    if(!this.checkpoint && this.consoleActive && cleared && player.z< -12.5 && player.z> -41 && Math.abs(player.x)<15 && player.y>-.2 && player.y<.4) {
      this.checkpoint=true; this.life.restore(100);
      this.life.restoreArmor(Math.max(0,(this.reserveRecovered?ADVENTURE_MISSION.reserve.armor:50)-this.life.snapshot().armor));
      this.combat.addAmmo(WEAPONS.pulse.maxAmmo,true);
    }
    // The powered console releases the seal. Entering still wakes the existing boss.
    if(!this.bossActive && this.checkpoint && cleared && player.z< -20.5 && player.z> -41 && Math.abs(player.x)<15) this.bossActive=true;
    this.life.step(player,world,hits,{active:this.bossActive,incomingDamage:damage});
    if(this.life.snapshot().outcome==='victory') {
      const center=this.life.snapshot().center;
      this.core={position:{x:center.x,y:0,z:center.z},collected:false};
    }
  }
}
export type AdventureFightState=ReturnType<AdventureFight['snapshot']>;
