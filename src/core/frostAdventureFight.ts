import {FROST_ARENA,FROST_BOSS,FROST_RULES,FROST_TACTICS,FROST_GUARDS,FROST_MISSION,FROST_PICKUPS} from '../arena/frostAdventure';
import {BossNavigation} from './bossNavigation';
import {PveEncounter,type MonsterWorld} from './pve';
import {FrostGuard} from './frostGuard';
import {Pickups} from './pickups';
import {Combat,directionTo} from './combat';
import type {Vec3} from './types';
import type {Damage} from './match';
export class FrostAdventureFight {
  private readonly navigation=new BossNavigation(FROST_ARENA,FROST_RULES.movementRadius);
  readonly life=new PveEncounter(FROST_RULES,FROST_BOSS,'frost',(from,player)=>this.navigation.steer(from,player),FROST_TACTICS);
  readonly guards=FROST_GUARDS.map(g=>new FrostGuard(g));
  readonly pickups=new Pickups(FROST_PICKUPS,false);
  readonly combat=new Combat();
  checkpoint=false;bossActive=false;completed=false;
  reset(practice=false){this.navigation.reset();this.life.reset();this.pickups.reset();this.combat.reset();this.completed=false;
    this.checkpoint=this.bossActive=practice;for(const guard of this.guards){guard.reset();if(practice)guard.clear();}}
  retry(practice=false){const checkpoint=this.checkpoint;this.reset(practice);if(checkpoint){this.checkpoint=true;for(const guard of this.guards)guard.clear();}
    return checkpoint?FROST_MISSION.checkpoint:FROST_MISSION.spawn;}
  interaction(player:Vec3,world:MonsterWorld){
    const v=FROST_MISSION.valve;if(this.life.snapshot().outcome!=='running'||this.checkpoint||Math.abs(player.y)>.4||Math.hypot(player.x-v.x,player.z-v.z)>v.reach)return null;
    const line=directionTo({...player,y:player.y+.8},{...v,y:.8});
    if(world.raycast({origin:{...player,y:player.y+.8},direction:line.direction},line.distance,true))return null;
    const enabled=this.guards.every(g=>g.snapshot().hp===0);
    return {enabled,label:enabled?'Kühlventil öffnen · Ruhepunkt sichern':'Erst beide Splitterwächter ausschalten'};
  }
  interact(player:Vec3,world:MonsterWorld){if(this.interaction(player,world)?.enabled){this.checkpoint=true;this.life.restore(100);this.life.restoreArmor(Math.max(0,50-this.life.snapshot().armor));}}
  targets(){const boss=this.life.snapshot();return [...this.guards.flatMap(g=>g.snapshot().hp>0?[{...g.definition,center:g.snapshot().center}]:[]),
    ...(this.bossActive&&boss.phase!=='emerging'&&boss.outcome==='running'?[{...FROST_BOSS,center:boss.center}]:[])];}
  step(player:Vec3,world:MonsterWorld,hits:readonly Damage[]=[]){
    const p=this.life.snapshot(),exit=FROST_MISSION.exit;
    if(p.outcome==='victory'&&Math.abs(player.y)<.4&&Math.hypot(player.x-exit.x,player.z-exit.z)<exit.reach)this.completed=true;
    if(p.outcome!=='running')return;
    const damage=this.guards.reduce((n,g)=>n+g.step(player,world,hits),0);
    if(this.checkpoint&&Math.abs(player.x)<6&&player.z<3)this.bossActive=true;
    this.life.step(player,world,hits,{active:this.bossActive,incomingDamage:damage});
  }
  snapshot(){return {pve:this.life.snapshot(),guards:this.guards.map(g=>g.snapshot()),checkpoint:this.checkpoint,bossActive:this.bossActive,completed:this.completed};}
}
export type FrostAdventureState=ReturnType<FrostAdventureFight['snapshot']>;
