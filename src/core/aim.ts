import type { Ray, RayHit, RayWorld, Vec3 } from './types';

export interface AimSolution {
  readonly target: RayHit;
  readonly muzzle: Vec3;
  readonly impact: RayHit | null;
  readonly end: Vec3;
  readonly blocked: boolean;
}
const toward = (a: Vec3, b: Vec3) => {
  const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  return { distance, direction: { x: (b.x - a.x) / Math.max(distance, 1e-6),
    y: (b.y - a.y) / Math.max(distance, 1e-6), z: (b.z - a.z) / Math.max(distance, 1e-6) } };
};

export function solveAim(world: RayWorld, cameraRay: Ray, foot: Vec3): AimSolution | null {
  const target = world.raycast(cameraRay, 250);
  if (!target) return null; // No implicit E0 fallback and no target-centre snapping.
  const shoulder = { x: foot.x, y: foot.y + 1.15, z: foot.z };
  const aim = toward(shoulder, target.point);
  const reach = Math.min(0.65, aim.distance);
  const muzzle = { x: shoulder.x + aim.direction.x * reach,
    y: shoulder.y + aim.direction.y * reach, z: shoulder.z + aim.direction.z * reach };
  // First check shoulder→muzzle so a barrel reaching through cover cannot bypass it.
  const barrelHit = world.raycast({ origin: shoulder, direction: aim.direction }, reach);
  const shot = toward(muzzle, target.point);
  const impact = barrelHit ?? world.raycast({ origin: muzzle, direction: shot.direction }, shot.distance + 0.025);
  const end = impact?.point ?? target.point;
  // Camera and muzzle hit different points on a curved target. That is still a free hit;
  // only a different collider between the shooter and the selected object is cover.
  return { target, muzzle: barrelHit ? shoulder : muzzle, impact, end,
    blocked: !!impact && impact.id !== target.id };
}

export interface DiagnosticShot { readonly sequence: number; readonly tick: number; readonly aim: AimSolution }
export class DiagnosticWeapon {
  private nextTick = 0;
  private sequence = 0;
  readonly hits: Record<string, number> = {};
  lastShot: DiagnosticShot | null = null;
  step(tick: number, firing: boolean, aim: AimSolution | null): void {
    if (!firing || !aim || tick < this.nextTick) return;
    this.nextTick = tick + 8;
    this.lastShot = { sequence: ++this.sequence, tick, aim };
    const id = aim.impact?.id;
    if (id?.startsWith('dummy-')) this.hits[id] = (this.hits[id] ?? 0) + 1;
  }
}
