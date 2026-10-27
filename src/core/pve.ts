import type { Damage } from './match';
import { directionTo } from './combat';
import { TICK_SECONDS, type Ray, type RayHit, type RayWorld, type Vec3 } from './types';

export const MONSTER = { id: 'stone-warden', center: { x: 0, y: 1.85, z: -1 }, radius: 1.85, level: 'PVE' };
export const PVE_RULES = Object.freeze({ bossHp: 600, emergeTicks: 120, waveWarning: 90, eruptionWarning: 75,
  waveTicks: 150, eruptionTicks: 24, recoveryTicks: 90, waveSpeed: 0.12, waveDamage: 60, eruptionDamage: 65, eruptionRadius: 2.6,
  chaseTicks: 120, chaseSpeed: 2.6, stopDistance: 2.6, movementRadius: 1.7,
  meleeRange: 3.6, meleeWarning: 36, meleeRecovery: 24, meleeCooldown: 90, meleeDamage: 20 });
export type EncounterRules = { readonly [K in keyof typeof PVE_RULES]: number };
export type MonsterKind = 'stone' | 'frost' | 'ember';
export type MonsterPhase = 'emerging' | 'chasing' | 'melee' | 'warning' | 'attack' | 'recovery' | 'defeated';
interface MonsterWorld extends RayWorld {
  sweepBall(ray: Ray, distance: number, radius: number, surfacesOnly?: boolean): RayHit | null;
}
export interface PveSnapshot {
  readonly center: Vec3; readonly facing: number; readonly moving: boolean;
  readonly tick: number; readonly phase: MonsterPhase; readonly phaseTick: number;
  readonly kind: 'wave' | 'eruption'; readonly target: Vec3; readonly waveRadius: number;
  readonly hp: number; readonly armor: number; readonly bossHp: number;
  readonly outcome: 'running' | 'victory' | 'defeat'; readonly hitsTaken: number; readonly lastHit: number;
}

/** One isolated encounter. No campaign save, TDM score or respawn rule is changed. */
export class PveEncounter {
  private state: PveSnapshot;
  constructor(readonly rules: EncounterRules = PVE_RULES, readonly monster = MONSTER, readonly kind: MonsterKind = 'stone') {
    this.state = this.fresh();
  }
  private attackHit = false;
  private chaseElapsed = 0;
  private nextMelee = 0;
  private fresh(): PveSnapshot { return { tick: 0, phase: 'emerging', phaseTick: 0, kind: 'wave',
    target: { ...this.monster.center, y: 0 }, waveRadius: 2, hp: 100, armor: 50, bossHp: this.rules.bossHp,
    outcome: 'running', hitsTaken: 0, lastHit: -100, center: { ...this.monster.center }, facing: 0, moving: false }; }
  snapshot(): PveSnapshot { return this.state; }
  reset(): void { this.state = this.fresh(); this.attackHit = false; this.chaseElapsed = this.nextMelee = 0; }
  restore(amount: number): number {
    if (this.state.outcome !== 'running') return 0;
    const accepted = Math.min(Math.max(0, amount), 100 - this.state.hp);
    this.state = { ...this.state, hp: this.state.hp + accepted }; return accepted;
  }
  restoreArmor(amount: number): number {
    if (this.state.outcome !== 'running') return 0;
    const accepted = Math.min(Math.max(0, amount), 100 - this.state.armor);
    this.state = { ...this.state, armor: this.state.armor + accepted }; return accepted;
  }
  private hurt(amount: number): void {
    const hp = Math.max(0, this.state.hp - Math.max(0, amount - this.state.armor));
    this.state = { ...this.state, armor: Math.max(0, this.state.armor - amount), hp,
      hitsTaken: this.state.hitsTaken + 1, lastHit: this.state.tick, outcome: hp === 0 ? 'defeat' : 'running' };
  }
  step(player: Vec3, world: MonsterWorld, hits: readonly Damage[] = []): void {
    if (this.state.outcome !== 'running') return;
    this.state = { ...this.state, tick: this.state.tick + 1, phaseTick: this.state.phaseTick + 1, moving: false };
    if (this.state.phase !== 'emerging') {
      const damage = hits.filter(hit => hit.target === this.monster.id && hit.source === 'player' && Number.isFinite(hit.amount) && hit.amount > 0)
        .reduce((sum, hit) => sum + hit.amount, 0);
      this.state = { ...this.state, bossHp: Math.max(0, this.state.bossHp - damage) };
    }
    if (player.y < -8) this.hurt(1000);
    if (this.state.hp === 0) return;
    if (this.state.bossHp === 0) {
      this.state = { ...this.state, phase: 'defeated', phaseTick: 0, outcome: 'victory' }; return;
    }
    const s = this.state;
    if (s.phase === 'emerging' && s.phaseTick >= this.rules.emergeTicks) this.state = { ...s, phase: 'chasing', phaseTick: 0 };
    else if (s.phase === 'chasing') {
      this.chase(player, world);
      this.chaseElapsed++;
      if (this.chaseElapsed >= this.rules.chaseTicks) { this.chaseElapsed = 0; this.warning(player, world); }
      else if (s.tick >= this.nextMelee && this.meleeCanReach(player, world, false)) {
        this.state = { ...this.state, phase: 'melee', phaseTick: 0, moving: false,
          facing: Math.atan2(player.x - this.state.center.x, player.z - this.state.center.z) };
      }
    }
    else if (s.phase === 'melee') {
      // A locked swing: one contact check after the windup, never tracking the dodge.
      if (s.phaseTick === this.rules.meleeWarning && this.meleeCanReach(player, world, true)) this.hurt(this.rules.meleeDamage);
      if (s.phaseTick >= this.rules.meleeWarning + this.rules.meleeRecovery) {
        this.nextMelee = s.tick + this.rules.meleeCooldown;
        this.state = { ...this.state, phase: 'chasing', phaseTick: 0 };
      }
    }
    else if (s.phase === 'warning' && s.phaseTick >= (s.kind === 'wave' ? this.rules.waveWarning : this.rules.eruptionWarning)) {
      this.attackHit = false; this.state = { ...s, phase: 'attack', phaseTick: 0, waveRadius: 2 };
    } else if (s.phase === 'attack') {
      if (s.kind === 'wave') {
        const radius = 2 + s.phaseTick * this.rules.waveSpeed;
        this.state = { ...s, waveRadius: radius };
        const distance = Math.hypot(player.x - s.center.x, player.z - s.center.z);
        // Swept annulus: never misses a tick crossing, never damages the whole disk.
        let touching = distance >= radius - this.rules.waveSpeed - 0.55 && distance <= radius + 0.55 && player.y < 0.7;
        if (this.kind === 'frost') touching = player.y < 1.3 && frostShards(s, radius).some(point =>
          Math.hypot(player.x - point.x, player.z - point.z) < 0.85 + this.rules.waveSpeed);
        if (this.kind === 'ember') {
          const angle = Math.atan2(player.x - s.center.x, player.z - s.center.z) - s.facing;
          touching = distance < 11 && Math.cos(angle) >= Math.cos(0.48) && player.y < 3.4;
        }
        const origin = { ...s.center, y: this.kind === 'stone' ? 0.6 : 1.1 };
        const line = directionTo(origin, { ...player, y: origin.y });
        if (!this.attackHit && touching && !world.raycast({ origin, direction: line.direction }, line.distance, true)) {
          this.hurt(this.rules.waveDamage); this.attackHit = true;
        }
      } else if (!this.attackHit && s.phaseTick === 1
        && Math.hypot(player.x - s.target.x, player.z - s.target.z) <= this.rules.eruptionRadius + 0.45
        && player.y >= s.target.y - 0.2 && player.y < s.target.y + 3.4) {
        this.hurt(this.rules.eruptionDamage); this.attackHit = true;
      }
      if (s.phaseTick >= (s.kind === 'wave' ? this.rules.waveTicks : this.rules.eruptionTicks)) {
        this.state = { ...this.state, phase: 'recovery', phaseTick: 0 };
      }
    } else if (s.phase === 'recovery' && s.phaseTick >= this.rules.recoveryTicks) {
      this.state = { ...s, kind: s.kind === 'wave' ? 'eruption' : 'wave', phase: 'chasing', phaseTick: 0 };
    }
  }
  private meleeCanReach(player: Vec3, world: RayWorld, directional: boolean): boolean {
    const s = this.state, groundY = s.center.y - this.monster.center.y;
    if (player.y < groundY - 0.2 || player.y > groundY + 1.35) return false;
    const dx = player.x - s.center.x, dz = player.z - s.center.z;
    if (Math.hypot(dx, dz) > this.rules.meleeRange) return false;
    if (directional && Math.cos(Math.atan2(dx, dz) - s.facing) < Math.cos(1.05)) return false;
    const origin = { ...s.center, y: groundY + 1.1 };
    const line = directionTo(origin, { ...player, y: player.y + 0.9 });
    return !world.raycast({ origin, direction: line.direction }, line.distance, true);
  }
  private chase(player: Vec3, world: MonsterWorld): void {
    const s = this.state;
    const dx = player.x - s.center.x, dz = player.z - s.center.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= this.rules.stopDistance) return;
    const angle = Math.atan2(dx, dz);
    const step = Math.min(this.rules.chaseSpeed * TICK_SECONDS, distance - this.rules.stopDistance);
    // Small local steering: test the whole body against actual arena colliders.
    // No teleporting, climbing or full navigation system for this experiment.
    for (const offset of [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2]) {
      const facing = angle + offset;
      const direction = { x: Math.sin(facing), y: 0, z: Math.cos(facing) };
      if (world.sweepBall({ origin: s.center, direction }, step + 0.04, this.rules.movementRadius, true)) continue;
      const center = { x: s.center.x + direction.x * step, y: s.center.y, z: s.center.z + direction.z * step };
      const supported = ([[0, 0], [1.7, 0], [-1.7, 0], [0, 1.7], [0, -1.7]] as const).every(([x, z]) =>
        world.raycast({ origin: { x: center.x + x, y: 0.3, z: center.z + z }, direction: { x: 0, y: -1, z: 0 } }, 0.5, true));
      if (!supported) continue;
      this.state = { ...s, center, facing, moving: true }; return;
    }
  }
  private warning(player: Vec3, world: RayWorld): void {
    // Lock the chosen ground point once: the warning never follows the dodging player.
    const ground = world.raycast({ origin: { ...player, y: player.y + 0.1 }, direction: { x: 0, y: -1, z: 0 } }, 30, true);
    this.state = { ...this.state, phase: 'warning', phaseTick: 0, moving: false,
      facing: Math.atan2(player.x - this.state.center.x, player.z - this.state.center.z),
      target: ground ? { ...ground.point } : { ...player, y: 0 } };
  }
}

export function frostShards(state: PveSnapshot, radius = state.waveRadius): Vec3[] {
  return [-0.38, 0, 0.38].map(offset => ({ x: state.center.x + Math.sin(state.facing + offset) * radius,
    y: 0.85, z: state.center.z + Math.cos(state.facing + offset) * radius }));
}
