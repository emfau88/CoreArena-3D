import type { Vec3 } from '../core/types';

export interface ArenaBox {
  readonly id: string;
  readonly center: Vec3;
  readonly size: Vec3;
  readonly material: 'floor' | 'stone' | 'metal';
  readonly planted?: boolean;
  readonly level?: string;
}
export interface TargetDefinition { readonly id: string; readonly center: Vec3; readonly radius: number; readonly level: string }
export interface TraversalLink {
  readonly from: string; readonly to: string; readonly kind: 'walk' | 'jump' | 'drop';
  readonly start: Vec3; readonly end: Vec3;
}
export interface ArenaDefinition {
  readonly spawn: Vec3;
  readonly boxes: readonly ArenaBox[];
  readonly targets?: readonly TargetDefinition[];
  readonly links?: readonly TraversalLink[];
}

export const M0_ARENA: ArenaDefinition = {
  spawn: { x: -7, y: 0.06, z: 2 },
  boxes: [
    { id: 'floor', center: { x: 0, y: -0.4, z: 0 }, size: { x: 44, y: 0.8, z: 28 }, material: 'floor' },
    { id: 'wall', center: { x: 0, y: 1.1, z: 0 }, size: { x: 1.2, y: 2.2, z: 8 }, material: 'stone', planted: true },
    { id: 'north', center: { x: 0, y: 0.6, z: -13.7 }, size: { x: 44, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'south', center: { x: 0, y: 0.6, z: 13.7 }, size: { x: 44, y: 1.2, z: 0.6 }, material: 'metal' },
    { id: 'west', center: { x: -21.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 27.4 }, material: 'metal' },
    { id: 'east', center: { x: 21.7, y: 0.6, z: 0 }, size: { x: 0.6, y: 1.2, z: 27.4 }, material: 'metal' },
    { id: 'garden-west', center: { x: -13, y: 1.025, z: -8.5 }, size: { x: 10, y: 2.05, z: 4 }, material: 'stone', planted: true },
    { id: 'garden-east', center: { x: 13, y: 2.05, z: -8 }, size: { x: 8, y: 4.1, z: 5 }, material: 'stone', planted: true },
    { id: 'bench-west', center: { x: -14, y: 0.5, z: 7 }, size: { x: 6, y: 1, z: 1.4 }, material: 'stone', planted: true },
    { id: 'bench-east', center: { x: 12, y: 0.5, z: 7 }, size: { x: 7, y: 1, z: 1.4 }, material: 'stone', planted: true },
  ],
};

// A small playable height route; rendering and physics consume the same geometry.
export const M1_ARENA: ArenaDefinition = {
  spawn: M0_ARENA.spawn,
  boxes: [
    ...M0_ARENA.boxes.filter((box) => box.id !== 'garden-west'),
    { id: 'garden-west', center: { x: -16, y: 1.025, z: -8.5 }, size: { x: 5, y: 2.05, z: 5 }, material: 'stone', planted: true },
    { id: 'e1', center: { x: -6, y: 1.025, z: -4 }, size: { x: 8, y: 2.05, z: 5 }, material: 'stone', level: 'E1 · 2.05' },
    { id: 'e2', center: { x: -6, y: 2.05, z: -9.5 }, size: { x: 8, y: 4.1, z: 5 }, material: 'stone', level: 'E2 · 4.10' },
  ],
  targets: [
    { id: 'dummy-e0', center: { x: 5, y: 1.1, z: 3 }, radius: 0.6, level: 'E0' },
    { id: 'dummy-e1', center: { x: -3.5, y: 3.15, z: -4 }, radius: 0.6, level: 'E1' },
    { id: 'dummy-e2', center: { x: -4.5, y: 5.2, z: -10 }, radius: 0.6, level: 'E2' },
  ],
  links: [
    { from: 'floor', to: 'e1', kind: 'jump', start: { x: -7, y: 0, z: 0.3 }, end: { x: -7, y: 2.05, z: -4 } },
    { from: 'e1', to: 'e2', kind: 'jump', start: { x: -7, y: 2.05, z: -4.8 }, end: { x: -7, y: 4.1, z: -9 } },
    { from: 'e2', to: 'floor', kind: 'drop', start: { x: -7, y: 4.1, z: -9 }, end: { x: -11.5, y: 0, z: -9 } },
  ],
};
