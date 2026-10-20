import type { MoveCommand, Vec3 } from '../core/types';

export interface CameraBasis { readonly right: Vec3; readonly forward: Vec3 }
export function screenMovement(
  horizontal: number, vertical: number, sprint: boolean, basis: CameraBasis,
): MoveCommand {
  const magnitude = Math.max(1, Math.hypot(horizontal, vertical));
  return {
    x: (basis.right.x * horizontal + basis.forward.x * vertical) / magnitude,
    z: (basis.right.z * horizontal + basis.forward.z * vertical) / magnitude,
    sprint,
  };
}
