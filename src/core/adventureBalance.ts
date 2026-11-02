import { ADVENTURE_BOSS_RULES, STONE_ADVENTURE_PICKUPS } from '../arena/stoneAdventure';
import type { EncounterTactics } from './pve';

/** Development comparison only. Never mutate shared Legacy/Arena definitions. */
export const PROTOTYPE_BOSS_RULES = Object.freeze({ ...ADVENTURE_BOSS_RULES,
  bossHp:900, chaseSpeed:4.2, chaseTicks:140, elevatedChaseTicks:90,
  meleeWarning:48, meleeRecovery:84, meleeCooldown:24, meleeDamage:35,
  waveWarning:84, waveDamage:55, eruptionWarning:78, eruptionDamage:45,
  recoveryTicks:96,
});
export const PROTOTYPE_TACTICS:EncounterTactics = Object.freeze({
  meleeTrigger:6, stepDistance:1.8, stepTicks:18, activeTicks:6, meleeHeight:3.4,guardedDamage:.1,
});
export const PROTOTYPE_PICKUPS = STONE_ADVENTURE_PICKUPS.filter(p=>p.kind==='health'||p.kind==='armor');
export const COMPLEMENT_AMMO = 12;
// Visible prototype-only seal prevents the new air jump bypassing the relay gate.
export const PROTOTYPE_EXIT_SEAL=Object.freeze({center:{x:0,y:2.6,z:-42},size:{x:37,y:5.2,z:.4}});
