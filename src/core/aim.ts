import type { Ray, RayHit, RayWorld, Vec3 } from './types';

export interface AimSolution {
  readonly target: RayHit;
  readonly firePoint: Vec3;
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
  // Same-level ground selects a screen direction, not a bullet destination on the floor.
  // Intersect the camera ray at weapon height to avoid parallax in either camera mode.
  const directional = target.normal.y > 0.7 && Math.abs(target.point.y - foot.y) < 0.35 && cameraRay.direction.y < -1e-6;
  const planeDistance = (shoulder.y - cameraRay.origin.y) / cameraRay.direction.y;
  const firePoint = directional ? { x: cameraRay.origin.x + cameraRay.direction.x * planeDistance,
    y: shoulder.y, z: cameraRay.origin.z + cameraRay.direction.z * planeDistance } : target.point;
  const aim = toward(shoulder, firePoint);
  if (aim.distance < 0.001) return null;
  const reach = Math.min(0.65, aim.distance / 2);
  const muzzle = { x: shoulder.x + aim.direction.x * reach,
    y: shoulder.y + aim.direction.y * reach, z: shoulder.z + aim.direction.z * reach };
  // First check shoulder→muzzle so a barrel reaching through cover cannot bypass it.
  const barrelHit = world.raycast({ origin: shoulder, direction: aim.direction }, reach);
  const shot = toward(muzzle, firePoint);
  const previewRange = directional ? 32 : shot.distance + 0.025;
  const shotRay = { origin: muzzle, direction: shot.direction };
  const impact = barrelHit ?? world.raycast(shotRay, previewRange);
  const end = impact?.point ?? firePoint;
  // Camera and muzzle hit different points on a curved target. That is still a free hit;
  // only a different collider between the shooter and the selected object is cover.
  const blocked = directional
    ? !!impact && world.raycast({ origin: shoulder, direction: aim.direction }, toward(shoulder, impact.point).distance + 0.025, true)?.id === impact.id
    : !!impact && impact.id !== target.id;
  return { target, firePoint, muzzle: barrelHit ? shoulder : muzzle, impact, end, blocked };
}

export interface DiagnosticShot { readonly sequence: number; readonly tick: number; readonly aim: AimSolution }
export class DiagnosticWeapon {
  private nextTick = 0;
  private sequence = 0;
  readonly hits: Record<string, number> = {};
  lastShot: DiagnosticShot | null = null;
  reset(): void {
    this.nextTick = this.sequence = 0;
    this.lastShot = null;
    for (const id of Object.keys(this.hits)) delete this.hits[id];
  }
  step(tick: number, firing: boolean, aim: AimSolution | null): DiagnosticShot | null {
    if (!firing || !aim || tick < this.nextTick) return null;
    this.nextTick = tick + 8;
    this.lastShot = { sequence: ++this.sequence, tick, aim };
    const id = aim.impact?.id;
    if (id?.startsWith('dummy-')) this.hits[id] = (this.hits[id] ?? 0) + 1;
    return this.lastShot;
  }
}
