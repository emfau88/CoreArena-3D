import type { RayWorld, Snapshot, Vec3 } from './types';
import { directionTo } from './combat';

export type PickupKind = 'pulse' | 'ammo' | 'health' | 'armor';
export interface PickupDefinition { readonly id: string; readonly kind: PickupKind; readonly position: Vec3; readonly surface: string; readonly amount: number }
export interface PickupState extends PickupDefinition { readonly remaining: number; readonly respawnAt: number }
export const PICKUP_RESPAWN_TICKS = 10 * 60;
export class Pickups {
  private items: PickupState[];
  constructor(private readonly definitions: readonly PickupDefinition[]) { this.items = this.fresh(); }
  private fresh(): PickupState[] { return this.definitions.map((item) => ({ ...item, remaining: item.amount, respawnAt: 0 })); }
  reset(): void { this.items = this.fresh(); }
  snapshot(): readonly PickupState[] { return this.items; }
  step(tick: number, player: Snapshot | null, world: RayWorld, take: (kind: PickupKind, amount: number) => number): void {
    this.items = this.items.map((old) => {
      const item = old.remaining === 0 && tick >= old.respawnAt ? { ...old, remaining: old.amount, respawnAt: 0 } : old;
      if (!player?.grounded || player.surface !== item.surface || item.remaining === 0
        || Math.abs(player.position.y - item.position.y) > 0.35
        || Math.hypot(player.position.x - item.position.x, player.position.z - item.position.z) > 0.85) return item;
      const origin = { ...player.position, y: player.position.y + 0.5 };
      const line = directionTo(origin, { ...item.position, y: item.position.y + 0.5 });
      if (line.distance > 0.01 && world.raycast({ origin, direction: line.direction }, line.distance, true)) return item;
      const amount = Math.min(item.remaining, Math.max(0, take(item.kind, item.remaining)));
      if (!amount) return item;
      const remaining = item.remaining - amount;
      return { ...item, remaining, respawnAt: remaining === 0 ? tick + PICKUP_RESPAWN_TICKS : 0 };
    });
  }
}
