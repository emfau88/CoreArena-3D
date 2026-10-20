import type { Vec3 } from '../core/types';

export interface ArenaBox {
  readonly id: string;
  readonly center: Vec3;
  readonly size: Vec3;
  readonly material: 'floor' | 'stone' | 'metal';
  readonly planted?: boolean;
}
export interface ArenaDefinition {
  readonly spawn: Vec3;
  readonly boxes: readonly ArenaBox[];
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
