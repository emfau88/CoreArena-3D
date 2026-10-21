import type { MoveCommand, Ray, RayWorld, Snapshot, Vec3 } from './types';
import { directionTo, type CombatTarget, type WeaponSnapshot } from './combat';
import type { AimSolution } from './aim';

export const BOT_RULES = Object.freeze({ sightRange: 18, fieldOfView: 140, reactionTicks: 24,
  memoryTicks: 120, aimIntervalTicks: 6, turnPerTick: 0.07, aimErrorRadians: 0.06 });
export const BOT_SPAWN = { x: -7, y: 0.06, z: 9 };
export const BOT_TARGET = { id: 'rival', center: { x: -7, y: 1.16, z: 9 }, radius: 0.6, level: 'BOT' };
export const actorCenter = (foot: Vec3): Vec3 => ({ ...foot, y: foot.y + 1.1 });

/** Only this sensor sees live enemy positions. Hidden positions never enter the decision layer. */
export function perceive(world: RayWorld, foot: Vec3, facing: number, enemy: CombatTarget | null): CombatTarget | null {
  if (!enemy) return null;
  const origin = actorCenter(foot);
  const line = directionTo(origin, enemy.center);
  if (line.distance > BOT_RULES.sightRange) return null;
  const planar = Math.hypot(line.direction.x, line.direction.z);
  const dot = (Math.sin(facing) * line.direction.x + Math.cos(facing) * line.direction.z) / Math.max(planar, 1e-8);
  if (dot < Math.cos(BOT_RULES.fieldOfView * Math.PI / 360)) return null;
  if (world.raycast({ origin, direction: line.direction }, line.distance + enemy.radius)?.id !== enemy.id) return null;
  return { ...enemy, center: { ...enemy.center } };
}

export interface BotDecision {
  readonly movement: MoveCommand; readonly firing: boolean; readonly aim: AimSolution | null;
  readonly ray: Ray | null; readonly facing: number; readonly visible: boolean;
  readonly mode: 'patrol' | 'react' | 'fight' | 'search';
  readonly seenAt: number | null; readonly readyAt: number | null; readonly remembered: Vec3 | null;
}
const patrol = [{ x: -7, y: 0, z: 9 }, { x: -11.5, y: 0, z: 3 }, { x: -7, y: 0, z: 1 }];
const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

/** No world snapshot: decisions receive only the bot's own state and a visible observation. */
export class BotBrain {
  private memory: CombatTarget | null = null;
  private seenAt: number | null = null;
  private readyAt: number | null = null;
  private aimPoint: Vec3 | null = null;
  private facing = Math.PI;
  private waypoint = 0;
  reset(): void { this.memory = null; this.seenAt = this.readyAt = null; this.aimPoint = null; this.facing = Math.PI; this.waypoint = 0; }
  heading(): number { return this.facing; }
  step(tick: number, own: Snapshot, visible: CombatTarget | null, weapons: WeaponSnapshot): BotDecision {
    if (visible) {
      if (this.readyAt === null || this.memory?.id !== visible.id) this.readyAt = tick + BOT_RULES.reactionTicks;
      this.memory = { ...visible, center: { ...visible.center } }; this.seenAt = tick;
      if (!this.aimPoint || tick % BOT_RULES.aimIntervalTicks === 0) this.aimPoint = { ...visible.center };
    } else {
      this.readyAt = null; this.aimPoint = null;
      if (this.seenAt !== null && tick - this.seenAt >= BOT_RULES.memoryTicks) { this.memory = null; this.seenAt = null; }
    }
    const mode = visible ? tick >= this.readyAt! ? 'fight' : 'react' : this.memory ? 'search' : 'patrol';
    let destination = this.memory?.center ?? patrol[this.waypoint]!;
    let distance = Math.hypot(destination.x - own.position.x, destination.z - own.position.z);
    if (!this.memory && distance < 0.3) {
      this.waypoint = (this.waypoint + 1) % patrol.length; destination = patrol[this.waypoint]!;
      distance = Math.hypot(destination.x - own.position.x, destination.z - own.position.z);
    }
    const desired = Math.atan2(destination.x - own.position.x, destination.z - own.position.z);
    this.facing += Math.max(-BOT_RULES.turnPerTick, Math.min(BOT_RULES.turnPerTick, wrap(desired - this.facing)));
    const standoff = weapons.selected === 'pulse' ? 9 : 3.6;
    // Direct local pursuit only; route selection and recovery belong to M2.4.
    const move = mode !== 'react' && distance > (visible ? standoff : 0.25);
    const scale = move ? Math.min(1, distance / 0.12) / Math.max(distance, 1e-8) : 0;
    const movement = { x: (destination.x - own.position.x) * scale, z: (destination.z - own.position.z) * scale, sprint: false };
    let aim: AimSolution | null = null; let ray: Ray | null = null;
    if (visible && this.aimPoint) {
      const muzzle = actorCenter(own.position);
      const line = directionTo(muzzle, this.aimPoint);
      const error = Math.sin(tick * 0.083) * BOT_RULES.aimErrorRadians;
      const yaw = this.facing + error;
      const horizontal = Math.hypot(line.direction.x, line.direction.z);
      const direction = { x: Math.sin(yaw) * horizontal, y: line.direction.y, z: Math.cos(yaw) * horizontal };
      const point = { x: muzzle.x + direction.x * line.distance, y: muzzle.y + direction.y * line.distance, z: muzzle.z + direction.z * line.distance };
      ray = { origin: muzzle, direction };
      // Muzzle stays inside the shooter; the shared weapon does the actual cover/hit queries.
      aim = { muzzle, target: { id: visible.id, point, normal: { x: 0, y: 1, z: 0 }, distance: line.distance },
        impact: null, end: point, blocked: false };
    }
    return { movement, firing: mode === 'fight' && Math.abs(wrap(desired - this.facing)) < 0.15,
      aim, ray, facing: this.facing, visible: !!visible, mode, seenAt: this.seenAt, readyAt: this.readyAt,
      remembered: this.memory ? { ...this.memory.center } : null };
  }
}
