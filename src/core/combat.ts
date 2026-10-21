import type { AimSolution, DiagnosticShot } from './aim';
import type { Damage } from './match';
import type { Ray, RayHit, RayWorld, Vec3 } from './types';

export type WeaponId = 'arc' | 'pulse';
export const WEAPONS = {
  arc: { name: 'Arc Lash', damage: 35, cooldown: 48, range: 5, coneDegrees: 10 },
  pulse: { name: 'Pulse Repeater', damage: 10, cooldown: 10, range: 32, speed: 30, radius: 0.08, maxAmmo: 54 },
} as const;
export interface CombatTarget { readonly id: string; readonly center: Vec3; readonly radius: number }
export interface CombatWorld extends RayWorld { sweepBall(ray: Ray, distance: number, radius: number): RayHit | null }
export interface Projectile { readonly id: number; readonly position: Vec3; readonly direction: Vec3; readonly remaining: number }
export interface WeaponSnapshot {
  readonly selected: WeaponId; readonly ownsPulse: boolean; readonly ammo: number;
  readonly projectiles: readonly Projectile[]; readonly lastArc: DiagnosticShot | null;
  readonly impact: { readonly point: Vec3; readonly tick: number; readonly id: string } | null;
}
export const directionTo = (a: Vec3, b: Vec3) => {
  const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  return { distance, direction: { x: (b.x - a.x) / Math.max(distance, 1e-8),
    y: (b.y - a.y) / Math.max(distance, 1e-8), z: (b.z - a.z) / Math.max(distance, 1e-8) } };
};
const along = (origin: Vec3, direction: Vec3, distance: number): Vec3 => ({
  x: origin.x + direction.x * distance, y: origin.y + direction.y * distance, z: origin.z + direction.z * distance,
});

/** Arc assistance uses a bounded 3D cone and two real visibility rays, never a screen-wide nearest enemy. */
export function arcHit(world: RayWorld, aim: AimSolution, camera: Ray, targets: readonly CombatTarget[]): RayHit | null {
  const forward = directionTo(aim.muzzle, aim.firePoint).direction;
  let best: { hit: RayHit; dot: number } | null = null;
  for (const target of targets) {
    const line = directionTo(aim.muzzle, target.center);
    if (line.distance - target.radius > WEAPONS.arc.range) continue;
    const dot = forward.x * line.direction.x + forward.y * line.direction.y + forward.z * line.direction.z;
    // Intersect the cone with the target sphere, so aiming at its visible rim is a valid hit too.
    const angularRadius = Math.asin(Math.min(1, target.radius / Math.max(line.distance, target.radius)));
    if (dot < Math.cos(WEAPONS.arc.coneDegrees * Math.PI / 180 + angularRadius)) continue;
    const visibility = directionTo(camera.origin, target.center);
    if (world.raycast({ origin: camera.origin, direction: visibility.direction }, visibility.distance + target.radius)?.id !== target.id) continue;
    const hit = world.raycast({ origin: aim.muzzle, direction: line.direction }, Math.min(WEAPONS.arc.range, line.distance + target.radius));
    if (hit?.id === target.id && (!best || dot > best.dot || (dot === best.dot && hit.distance < best.hit.distance))) best = { hit, dot };
  }
  return best?.hit ?? null;
}

export class Combat {
  constructor(private readonly source = 'player') {}
  private selected: WeaponId = 'arc';
  private ownsPulse = false;
  private ammo = 0;
  private next: Record<WeaponId, number> = { arc: 0, pulse: 0 };
  private sequence = 0;
  private projectiles: Projectile[] = [];
  private lastArc: DiagnosticShot | null = null;
  private impact: WeaponSnapshot['impact'] = null;
  snapshot(): WeaponSnapshot { return { selected: this.selected, ownsPulse: this.ownsPulse, ammo: this.ammo,
    projectiles: this.projectiles, lastArc: this.lastArc, impact: this.impact }; }
  select(id: WeaponId): void { if (id === 'arc' || (this.ownsPulse && this.ammo > 0)) this.selected = id; }
  cycle(): void { this.select(this.selected === 'arc' ? 'pulse' : 'arc'); }
  addAmmo(amount: number, unlock = false): number {
    if (!this.ownsPulse && !unlock) return 0;
    this.ownsPulse = true;
    const accepted = Math.min(Math.max(0, amount), WEAPONS.pulse.maxAmmo - this.ammo);
    this.ammo += accepted; return accepted;
  }
  clearEffects(): void { this.projectiles = []; this.lastArc = this.impact = null; }
  reset(): void { this.selected = 'arc'; this.ownsPulse = false; this.ammo = this.sequence = 0;
    this.next = { arc: 0, pulse: 0 }; this.clearEffects(); }
  step(tick: number, firing: boolean, aim: AimSolution | null, camera: Ray | null,
    world: CombatWorld, targets: readonly CombatTarget[]): { attacked: boolean; damage: Damage[] } {
    const damage: Damage[] = [];
    let attacked = false;
    if (firing && aim && camera && tick >= this.next[this.selected]) {
      attacked = true;
      const kind = this.selected;
      this.next[kind] = tick + WEAPONS[kind].cooldown;
      const forward = directionTo(aim.muzzle, aim.firePoint).direction;
      if (kind === 'arc') {
        const hit = arcHit(world, aim, camera, targets);
        const obstruction = world.raycast({ origin: aim.muzzle, direction: forward }, WEAPONS.arc.range);
        const end = hit?.point ?? obstruction?.point ?? along(aim.muzzle, forward, WEAPONS.arc.range);
        this.lastArc = { sequence: ++this.sequence, tick, aim: { ...aim, impact: hit ?? obstruction, end } };
        if (hit) { damage.push({ source: this.source, target: hit.id, amount: WEAPONS.arc.damage }); this.impact = { point: hit.point, tick, id: hit.id }; }
      } else {
        this.projectiles.push({ id: ++this.sequence, position: aim.muzzle, direction: forward, remaining: WEAPONS.pulse.range });
        this.ammo--;
        if (this.ammo === 0) this.selected = 'arc';
      }
    }
    const flying: Projectile[] = [];
    for (const projectile of this.projectiles) {
      const distance = Math.min(WEAPONS.pulse.speed / 60, projectile.remaining);
      const hit = world.sweepBall({ origin: projectile.position, direction: projectile.direction }, distance, WEAPONS.pulse.radius);
      if (hit) {
        this.impact = { point: hit.point, tick, id: hit.id };
        damage.push({ source: this.source, target: hit.id, amount: WEAPONS.pulse.damage });
      } else if (projectile.remaining > distance) flying.push({ ...projectile,
        position: along(projectile.position, projectile.direction, distance), remaining: projectile.remaining - distance });
    }
    this.projectiles = flying;
    return { attacked, damage };
  }
}
