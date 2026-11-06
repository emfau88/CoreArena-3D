import type { AdventureFight } from '../core/adventureFight';
import { WEAPONS } from '../core/combat';
import type { MonsterWorld } from '../core/pve';

export type LabWeapon = 'arc' | 'pulse';
export const LAB_SPAWN = Object.freeze({x:0,y:.06,z:-21});
/** Shared, explicit comparison fixture. Never used by the regular mission. */
export function prepareBossAttempt(fight:AdventureFight,world:MonsterWorld,weapon:LabWeapon='arc'){
  fight.reset();
  for(const runner of fight.runners)runner.step(LAB_SPAWN,world,
    [{source:'player',target:runner.definition.id,amount:runner.snapshot().hp}]);
  fight.consoleActive=fight.checkpoint=fight.bossActive=true;
  if(!fight.prototype){fight.combat.addAmmo(WEAPONS.pulse.maxAmmo,true);fight.combat.select(weapon);}
}
