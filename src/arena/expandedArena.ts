import { M1_ARENA, type ArenaDefinition } from './arena';
import { ARENA_PICKUPS } from './pickups';
import type { PickupDefinition } from '../core/pickups';
import type { Vec3 } from '../core/types';

/** Arena expansion only; Adventure and the historical M1 physics fixture stay intact. */
export const EXPANDED_ARENA: ArenaDefinition = {
  ...M1_ARENA,
  links: [...M1_ARENA.links!,
    { from: 'e1', to: 'floor', kind: 'drop', start: { x: -7, y: 2.05, z: -4 }, end: { x: -11.5, y: 0, z: -4 } },
  ],
  boxes: [
    ...M1_ARENA.boxes.filter(box => !['floor', 'north', 'south', 'west', 'east'].includes(box.id)),
    { id: 'floor', center: { x: 0, y: -0.4, z: 0 }, size: { x: 56, y: 0.8, z: 36 }, material: 'floor' },
    { id: 'north', center: { x: 0, y: 0.6, z: -17.7 }, size: { x: 56, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'south', center: { x: 0, y: 0.6, z: 17.7 }, size: { x: 56, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'west', center: { x: -27.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 35.4 }, material: 'metal' },
    { id: 'east', center: { x: 27.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 35.4 }, material: 'metal' },
    ...[-1, 1].map(side => ({ id: `wing-cover-${side}`, center: { x: side * 23, y: 0.8, z: -1 },
      size: { x: 2, y: 1.6, z: 5 }, material: 'stone' as const, planted: true })),
    { id: 'south-cover', center: { x: 0, y: 0.8, z: 12.5 }, size: { x: 6, y: 1.6, z: 1.4 }, material: 'stone', planted: true },
  ],
};
export const EXPANDED_PICKUPS: readonly PickupDefinition[] = [
  ...ARENA_PICKUPS,
  { id: 'rail-west', kind: 'rail', position: { x: -20, y: 0, z: 3 }, surface: 'floor', amount: 6 },
  { id: 'rail-east', kind: 'rail', position: { x: 20, y: 0, z: 3 }, surface: 'floor', amount: 6 },
];
export const TEAM_SPAWNS: Readonly<Record<string, Vec3>> = {
  player: { x: -14, y: 0.06, z: 3 }, ally: { x: -14, y: 0.06, z: 9 },
  rival: { x: 14, y: 0.06, z: 3 }, 'rival-2': { x: 14, y: 0.06, z: 9 },
};
export function wingPatrol(team: 'blue' | 'red'): readonly Vec3[] {
  const side = team === 'blue' ? -1 : 1;
  return [{ x: side * 20, y: 0, z: 3 }, { x: side * 10, y: 0, z: 10 },
    { x: -side * 10, y: 0, z: 10 }, { x: -side * 20, y: 0, z: 3 }];
}
