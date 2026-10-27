import type { Damage } from './match';
import { directionTo } from './combat';
import { TICK_SECONDS, type Ray, type RayHit, type RayWorld, type Vec3 } from './types';

export const MONSTER = { id: 'stone-warden', center: { x: 0, y: 1.85, z: -1 }, radius: 1.85, level: 'PVE' };
export const PVE_RULES = Object.freeze({ bossHp: 600, emergeTicks: 120, waveWarning: 90, eruptionWarning: 75,
  waveTicks: 150, eruptionTicks: 24, recoveryTicks: 90, waveSpeed: 0.12, waveDamage: 60, eruptionDamage: 65, eruptionRadius: 2.6,
  chaseTicks: 120, chaseSpeed: 2.6, stopDistance: 3.6, movementRadius: 1.7 });
export type MonsterPhase = 'emerging' | 'chasing' | 'warning' | 'attack' | 'recovery' | 'defeated';
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
  private state: PveSnapshot = this.fresh();
  private attackHit = false;
  private fresh(): PveSnapshot { return { tick: 0, phase: 'emerging', phaseTick: 0, kind: 'wave',
    target: { x: 0, y: 0, z: -1 }, waveRadius: 2, hp: 100, armor: 50, bossHp: PVE_RULES.bossHp,
    outcome: 'running', hitsTaken: 0, lastHit: -100, center: { ...MONSTER.center }, facing: 0, moving: false }; }
  snapshot(): PveSnapshot { return this.state; }
  reset(): void { this.state = this.fresh(); this.attackHit = false; }
  restore(amount: number): number {
    if (this.state.outcome !== 'running') return 0;
    const accepted = Math.min(Math.max(0, amount), 100 - this.state.hp);
    this.state = { ...this.state, hp: this.state.hp + accepted }; return accepted;
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
      const damage = hits.filter(hit => hit.target === MONSTER.id && hit.source === 'player' && Number.isFinite(hit.amount) && hit.amount > 0)
        .reduce((sum, hit) => sum + hit.amount, 0);
      this.state = { ...this.state, bossHp: Math.max(0, this.state.bossHp - damage) };
    }
    if (player.y < -8) this.hurt(1000);
    if (this.state.hp === 0) return;
    if (this.state.bossHp === 0) {
      this.state = { ...this.state, phase: 'defeated', phaseTick: 0, outcome: 'victory' }; return;
    }
    const s = this.state;
    if (s.phase === 'emerging' && s.phaseTick >= PVE_RULES.emergeTicks) this.state = { ...s, phase: 'chasing', phaseTick: 0 };
    else if (s.phase === 'chasing') {
      this.chase(player, world);
      if (s.phaseTick >= PVE_RULES.chaseTicks) this.warning(player, world);
    }
    else if (s.phase === 'warning' && s.phaseTick >= (s.kind === 'wave' ? PVE_RULES.waveWarning : PVE_RULES.eruptionWarning)) {
      this.attackHit = false; this.state = { ...s, phase: 'attack', phaseTick: 0, waveRadius: 2 };
    } else if (s.phase === 'attack') {
      if (s.kind === 'wave') {
        const radius = 2 + s.phaseTick * PVE_RULES.waveSpeed;
        this.state = { ...s, waveRadius: radius };
        const distance = Math.hypot(player.x - s.center.x, player.z - s.center.z);
        // Swept annulus: never misses a tick crossing, never damages the whole disk.
        const touching = distance >= radius - PVE_RULES.waveSpeed - 0.55 && distance <= radius + 0.55;
        const origin = { ...s.center, y: 0.6 };
        const line = directionTo(origin, { ...player, y: 0.6 });
        if (!this.attackHit && touching && player.y < 0.7 && !world.raycast({ origin, direction: line.direction }, line.distance, true)) {
          this.hurt(PVE_RULES.waveDamage); this.attackHit = true;
        }
      } else if (!this.attackHit && s.phaseTick === 1
        && Math.hypot(player.x - s.target.x, player.z - s.target.z) <= PVE_RULES.eruptionRadius + 0.45
        && player.y >= s.target.y - 0.2 && player.y < s.target.y + 3.4) {
        this.hurt(PVE_RULES.eruptionDamage); this.attackHit = true;
      }
      if (s.phaseTick >= (s.kind === 'wave' ? PVE_RULES.waveTicks : PVE_RULES.eruptionTicks)) {
        this.state = { ...this.state, phase: 'recovery', phaseTick: 0 };
      }
    } else if (s.phase === 'recovery' && s.phaseTick >= PVE_RULES.recoveryTicks) {
      this.state = { ...s, kind: s.kind === 'wave' ? 'eruption' : 'wave', phase: 'chasing', phaseTick: 0 };
    }
  }
  private chase(player: Vec3, world: MonsterWorld): void {
    const s = this.state;
    const dx = player.x - s.center.x, dz = player.z - s.center.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= PVE_RULES.stopDistance) return;
    const angle = Math.atan2(dx, dz);
    const step = Math.min(PVE_RULES.chaseSpeed * TICK_SECONDS, distance - PVE_RULES.stopDistance);
    // Small local steering: test the whole body against actual arena colliders.
    // No teleporting, climbing or full navigation system for this experiment.
    for (const offset of [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2]) {
      const facing = angle + offset;
      const direction = { x: Math.sin(facing), y: 0, z: Math.cos(facing) };
      if (world.sweepBall({ origin: s.center, direction }, step + 0.04, PVE_RULES.movementRadius, true)) continue;
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
