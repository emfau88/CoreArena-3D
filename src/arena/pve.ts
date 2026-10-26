import { M0_ARENA, type ArenaDefinition } from './arena';
import type { PickupDefinition } from '../core/pickups';

export const PVE_ARENA: ArenaDefinition = {
  spawn: { x: 0, y: 0.06, z: 8 },
  boxes: [...M0_ARENA.boxes.filter(box => !['wall', 'bench-west', 'bench-east'].includes(box.id)),
    ...[-1, 1].map(side => ({ id: `cover-${side}`, center: { x: side * 7, y: 1.2, z: 1 },
      size: { x: 2, y: 2.4, z: 2 }, material: 'stone' as const, planted: true })),
    { id: 'boss-base', center: { x: 0, y: 0.25, z: -1 }, size: { x: 2.2, y: 0.5, z: 2.2 }, material: 'stone' }],
};
export const PVE_PICKUPS: readonly PickupDefinition[] = [
  { id: 'pve-ammo-left', kind: 'ammo', position: { x: -4, y: 0, z: 7 }, surface: 'floor', amount: 27 },
  { id: 'pve-ammo-right', kind: 'ammo', position: { x: 4, y: 0, z: 7 }, surface: 'floor', amount: 27 },
  { id: 'pve-health', kind: 'health', position: { x: 0, y: 0, z: 11 }, surface: 'floor', amount: 25 },
];
