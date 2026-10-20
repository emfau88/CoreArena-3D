import type { PickupDefinition } from '../core/pickups';

export const ARENA_PICKUPS: readonly PickupDefinition[] = [
  { id: 'pulse-e0', kind: 'pulse', position: { x: -7, y: 0, z: 4 }, surface: 'floor', amount: 54 },
  { id: 'ammo-e1', kind: 'ammo', position: { x: -7, y: 2.05, z: -4 }, surface: 'e1', amount: 27 },
  { id: 'armor-e2', kind: 'armor', position: { x: -7, y: 4.1, z: -9 }, surface: 'e2', amount: 50 },
  { id: 'health-e0', kind: 'health', position: { x: -9, y: 0, z: 5 }, surface: 'floor', amount: 25 },
];
