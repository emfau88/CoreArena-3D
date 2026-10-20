export interface Vec3 { readonly x: number; readonly y: number; readonly z: number }
export interface MoveCommand { readonly x: number; readonly z: number; readonly sprint: boolean }
export interface MotionResult { readonly position: Vec3; readonly grounded: boolean }
export interface SpatialWorld {
  move(displacement: Vec3): MotionResult;
  dispose(): void;
}
export interface Snapshot {
  readonly tick: number;
  readonly position: Vec3;
  readonly velocity: Vec3;
  readonly grounded: boolean;
  readonly facing: number;
}
export const TICK_SECONDS = 1 / 60;
export const WALK_SPEED = 7.2;
export const SPRINT_SPEED = 10.8;
export const CAPSULE = { radius: 0.45, halfHeight: 0.45, offset: 0.02 } as const;
export const CAPSULE_CENTER = CAPSULE.radius + CAPSULE.halfHeight;
