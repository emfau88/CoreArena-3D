import type { Life } from './match';
import type { WeaponSnapshot } from './combat';
import type { PickupState } from './pickups';
import type { Vec3 } from './types';

/** Public item locations, own needs and walking distance; never hidden enemy data. */
export function chooseBotResource(items: readonly PickupState[], life: Life, weapons: WeaponSnapshot, foot: Vec3): PickupState | null {
  const value = (item: PickupState) => {
    if (item.remaining <= 0) return 0;
    switch (item.kind) {
      case 'health': return life.hp < 75 ? (100 - life.hp) * 3 : 0;
      case 'armor': return life.armor < 75 ? (100 - life.armor) * 1.4 : 0;
      case 'pulse': return !weapons.ownsPulse ? 100 : weapons.ammo < 18 ? 75 : 0;
      case 'ammo': return weapons.ownsPulse && weapons.ammo < 36 ? 100 - weapons.ammo : 0;
      case 'rail': return !weapons.ownsRail ? 95 : (weapons.railAmmo ?? 0) < 2 ? 80 : 0;
    }
  };
  const scored = items.map(item => ({ item, score: value(item) / (1 + .08 * (Math.hypot(item.position.x - foot.x, item.position.z - foot.z)
    + Math.abs(item.position.y - foot.y) * 4)) })).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? null;
}
