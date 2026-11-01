import { M1_ARENA, type ArenaDefinition } from './arena';
import { ARENA_PICKUPS } from './pickups';
import type { PickupDefinition } from '../core/pickups';
import type { Vec3 } from '../core/types';

const westLinks = [...M1_ARENA.links!,
  { from: 'e1', to: 'floor', kind: 'drop' as const, start: { x: -7, y: 2.05, z: -4 }, end: { x: -11.5, y: 0, z: -4 } },
];
const eastSurface = (id: string) => id === 'floor' ? id : `${id}-east`;
const east = (point: Vec3): Vec3 => ({ ...point, x: -point.x });

/** Arena expansion only; Adventure and the historical M1 physics fixture stay intact. */
export const EXPANDED_ARENA: ArenaDefinition = {
  ...M1_ARENA,
  links: [...westLinks, ...westLinks.map(link => ({ ...link,
    from: eastSurface(link.from), to: eastSurface(link.to), start: east(link.start), end: east(link.end) }))],
  boxes: [
    ...M1_ARENA.boxes.filter(box => !['floor', 'north', 'south', 'west', 'east', 'garden-east', 'bench-east'].includes(box.id)),
    // Reuse the east garden area for the same climb and cover available in the west.
    ...M1_ARENA.boxes.filter(box => ['e1', 'e2', 'garden-west', 'bench-west'].includes(box.id))
      .map(box => ({ ...box, id: box.id.replace('-west', '') + '-east', center: east(box.center) })),
    { id: 'floor', center: { x: 0, y: -0.4, z: 0 }, size: { x: 56, y: 0.8, z: 36 }, material: 'floor' },
    { id: 'north', center: { x: 0, y: 0.6, z: -17.7 }, size: { x: 56, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'south', center: { x: 0, y: 0.6, z: 17.7 }, size: { x: 56, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'west', center: { x: -27.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 35.4 }, material: 'metal' },
    { id: 'east', center: { x: 27.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 35.4 }, material: 'metal' },
    ...[-1, 1].map(side => ({ id: `wing-cover-${side}`, center: { x: side * 23, y: 0.8, z: -1 },
      size: { x: 2, y: 1.6, z: 5 }, material: 'metal' as const })),
    { id: 'south-cover', center: { x: 0, y: 0.8, z: 12.5 }, size: { x: 6, y: 1.6, z: 1.4 }, material: 'stone', planted: true },
  ],
};
export const EXPANDED_PICKUPS: readonly PickupDefinition[] = [
  ...ARENA_PICKUPS,
  ...ARENA_PICKUPS.map(item => ({ ...item, id: `${item.id}-east`, position: east(item.position), surface: eastSurface(item.surface) })),
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
