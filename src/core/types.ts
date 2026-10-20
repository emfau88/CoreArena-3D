export interface Vec3 { readonly x: number; readonly y: number; readonly z: number }
export interface MoveCommand { readonly x: number; readonly z: number; readonly sprint: boolean; readonly jump?: boolean }
export interface MotionResult {
  readonly position: Vec3;
  readonly grounded: boolean;
  readonly ceiling: boolean;
  readonly surface: string | null;
}
export interface Ray { readonly origin: Vec3; readonly direction: Vec3 }
export interface RayHit { readonly id: string; readonly point: Vec3; readonly normal: Vec3; readonly distance: number }
export interface RayWorld { raycast(ray: Ray, distance: number, surfacesOnly?: boolean): RayHit | null }
export interface SpatialWorld {
  move(displacement: Vec3): MotionResult;
  reset(position: Vec3): void;
  dispose(): void;
}
export interface Snapshot {
  readonly tick: number;
  readonly position: Vec3;
  readonly velocity: Vec3;
  readonly grounded: boolean;
  readonly surface: string | null;
  readonly ceiling: boolean;
  readonly facing: number;
}
export const TICK_SECONDS = 1 / 60;
export const WALK_SPEED = 7.2;
export const SPRINT_SPEED = 10.8;
export const JUMP_SPEED = 10.8;
export const GRAVITY = 22.6;
export const CAPSULE = { radius: 0.45, halfHeight: 0.45, offset: 0.02 } as const;
export const CAPSULE_CENTER = CAPSULE.radius + CAPSULE.halfHeight;
