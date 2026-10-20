import type { Vec3 } from '../core/types';

// A visible, optional floor hazard exercises player damage before combat bots exist.
export const TRAINING_FIELD = Object.freeze({ x: -11, z: 2, width: 3, depth: 3, damage: 35, intervalTicks: 30 });
export function inTrainingField(foot: Vec3): boolean {
  return Math.abs(foot.x - TRAINING_FIELD.x) <= TRAINING_FIELD.width / 2
    && Math.abs(foot.z - TRAINING_FIELD.z) <= TRAINING_FIELD.depth / 2 && foot.y >= -0.1 && foot.y < 0.4;
}
