import {campaignLevel} from './campaign';
import type {EncounterRules,EncounterTactics} from '../core/pve';
import type {ArenaDefinition} from './arena';
export const FROST_BASE=campaignLevel('frost');
export const FROST_BOSS={...FROST_BASE.monster,center:{x:0,y:1.45,z:-1},radius:1.55};
export const FROST_RULES:EncounterRules=Object.freeze({...FROST_BASE.rules,bossHp:720,chaseSpeed:3.6,chaseTicks:135,
  movementRadius:2.2,stopDistance:2.7,meleeRange:3.4,meleeWarning:42,meleeRecovery:72,meleeDamage:28,meleeCooldown:30,
  waveWarning:72,waveTicks:105,waveSpeed:.15,waveDamage:32,eruptionWarning:72,eruptionDamage:35,eruptionRadius:2.4,
  recoveryTicks:90,elevatedChaseTicks:100});
export const FROST_TACTICS:EncounterTactics=Object.freeze({meleeTrigger:4.5,stepDistance:0,stepTicks:0,activeTicks:6,meleeHeight:2.2,guardedDamage:.15,frostProfile:true});
export const FROST_GUARDS=[{id:'frost-guard-front',center:{x:-3,y:1,z:6},radius:.65,activateZ:10},
  {id:'frost-guard-rear',center:{x:-14,y:1,z:-2.5},radius:.65,activateZ:5}] as const;
export const FROST_MISSION=Object.freeze({spawn:{x:0,y:.06,z:11},checkpoint:{x:-4,y:.06,z:4},
  valve:{x:-14,y:0,z:-6.2,reach:1.8},exit:{x:17,y:0,z:-10.5,reach:1.5}});
export const FROST_ARENA:ArenaDefinition={...FROST_BASE.arena,spawn:FROST_MISSION.spawn,
  targets:[FROST_BOSS,...FROST_GUARDS.map(g=>({...g,level:'frost'}))]};
export const FROST_PICKUPS=FROST_BASE.pickups.filter(p=>p.kind==='health'||p.kind==='armor');
