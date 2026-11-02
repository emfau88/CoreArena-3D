import type { Damage } from './match';
import { directionTo } from './combat';
import { TICK_SECONDS, type Ray, type RayHit, type RayWorld, type Vec3 } from './types';

export const MONSTER = { id: 'stone-warden', center: { x: 0, y: 1.85, z: -1 }, radius: 1.85, level: 'PVE' };
export const PVE_RULES = Object.freeze({ bossHp: 600, emergeTicks: 120, waveWarning: 90, eruptionWarning: 75,
  waveTicks: 150, eruptionTicks: 24, recoveryTicks: 90, waveSpeed: 0.12, waveDamage: 60, eruptionDamage: 65, eruptionRadius: 2.6,
  chaseTicks: 120, chaseSpeed: 2.6, stopDistance: 2.6, movementRadius: 1.7,
  meleeRange: 3.6, meleeWarning: 36, meleeRecovery: 24, meleeCooldown: 90, meleeDamage: 20,
  elevatedChaseTicks: 0 });
export type EncounterRules = { readonly [K in keyof typeof PVE_RULES]: number };
export type MonsterKind = 'stone' | 'frost' | 'ember';
export type MonsterPhase = 'emerging' | 'chasing' | 'melee' | 'warning' | 'attack' | 'recovery' | 'defeated';
export interface MonsterWorld extends RayWorld {
  sweepBall(ray: Ray, distance: number, radius: number, surfacesOnly?: boolean): RayHit | null;
}
export interface EncounterTactics {
  readonly meleeTrigger:number; readonly stepDistance:number; readonly stepTicks:number;
  readonly activeTicks:number; readonly meleeHeight:number; readonly meleeOnly?:boolean; readonly guardedDamage?:number;
}
export interface BossExchange { readonly serial:number; readonly window:'closed'|'warning'|'active'|'counter';
  readonly resolved:number; readonly avoided:number; readonly counters:number }
export interface PveSnapshot {
  readonly center: Vec3; readonly facing: number; readonly moving: boolean;
  readonly tick: number; readonly phase: MonsterPhase; readonly phaseTick: number;
  readonly kind: 'wave' | 'eruption'; readonly target: Vec3; readonly waveRadius: number;
  readonly hp: number; readonly armor: number; readonly bossHp: number;
  readonly outcome: 'running' | 'victory' | 'defeat'; readonly hitsTaken: number; readonly lastHit: number;
  readonly exchange?:BossExchange;
}

/** One isolated encounter. No campaign save, TDM score or respawn rule is changed. */
export class PveEncounter {
  private state: PveSnapshot;
  constructor(readonly rules: EncounterRules = PVE_RULES, readonly monster = MONSTER, readonly kind: MonsterKind = 'stone',
    private readonly steering?: (from: Vec3, player: Vec3) => Vec3, readonly tactics?:EncounterTactics) {
    this.state = this.fresh();
  }
  private attackHit = false;
  private chaseElapsed = 0;
  private nextMelee = 0;
  private serial=0;
  private resolved=0;
  private avoided=0;
  private counters=0;
  private counterRecorded=false;
  private fresh(): PveSnapshot { return { tick: 0, phase: 'emerging', phaseTick: 0, kind: 'wave',
    target: { ...this.monster.center, y: 0 }, waveRadius: 2, hp: 100, armor: 50, bossHp: this.rules.bossHp,
    outcome: 'running', hitsTaken: 0, lastHit: -100, center: { ...this.monster.center }, facing: 0, moving: false }; }
  snapshot(): PveSnapshot { return this.tactics?{...this.state,exchange:{serial:this.serial,window:this.window(),
    resolved:this.resolved,avoided:this.avoided,counters:this.counters}}:this.state; }
  private window():BossExchange['window'] {
    const s=this.state;
    if(s.outcome!=='running')return 'closed';
    if(s.phase==='recovery')return 'counter';
    if(s.phase==='warning')return 'warning';
    if(s.phase==='attack')return 'active';
    if(s.phase==='melee')return s.phaseTick<this.rules.meleeWarning?'warning':
      s.phaseTick<this.rules.meleeWarning+(this.tactics?.activeTicks??1)?'active':'counter';
    return 'closed';
  }
  reset(): void { this.state = this.fresh(); this.attackHit = false; this.chaseElapsed = this.nextMelee = 0;
    this.serial=this.resolved=this.avoided=this.counters=0;this.counterRecorded=false; }
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
  step(player: Vec3, world: MonsterWorld, hits: readonly Damage[] = [], options: { active?: boolean; incomingDamage?: number } = {}): void {
    if (this.state.outcome !== 'running') return;
    const active = options.active ?? true;
    this.state = { ...this.state, tick: this.state.tick + 1, phaseTick: this.state.phaseTick + (active ? 1 : 0), moving: false };
    if (this.state.phase !== 'emerging') {
      const raw = hits.filter(hit => hit.target === this.monster.id && hit.source === 'player' && Number.isFinite(hit.amount) && hit.amount > 0)
        .reduce((sum, hit) => sum + hit.amount, 0);
      const damage=this.tactics&&this.window()!=='counter'?Math.round(raw*(this.tactics.guardedDamage??1)*10)/10:raw;
      this.state = { ...this.state, bossHp: this.tactics?Math.max(0,Math.round((this.state.bossHp-damage)*10)/10):Math.max(0, this.state.bossHp - damage) };
      if(this.tactics&&damage>0&&this.window()==='counter'&&!this.attackHit&&!this.counterRecorded){
        this.counters++;this.counterRecorded=true;
      }
    }
    if (player.y < -8) this.hurt(1000);
    if (Number.isFinite(options.incomingDamage) && options.incomingDamage! > 0) this.hurt(options.incomingDamage!);
    if (this.state.hp === 0) return;
    if (!active) return;
    if (this.state.bossHp === 0) {
      this.state = { ...this.state, phase: 'defeated', phaseTick: 0, outcome: 'victory' }; return;
    }
    const s = this.state;
    if(this.tactics&&s.phase==='melee')this.chaseElapsed++;
    if (s.phase === 'emerging' && s.phaseTick >= this.rules.emergeTicks) this.state = { ...s, phase: 'chasing', phaseTick: 0 };
    else if (s.phase === 'chasing') {
      this.chase(player, world);
      this.chaseElapsed++;
      // A supported high surface gets an eruption, not an ineffective ground wave.
      // Ordinary jumps do not trigger this; keep the warning locked and dodgeable.
      const support = this.rules.elevatedChaseTicks > 0 ? world.raycast({
        origin: { ...player, y: player.y + .1 }, direction: { x:0, y:-1, z:0 },
      }, .3, true) : null;
      const elevated = support !== null && support.point.y > s.center.y - this.monster.center.y + .65;
      if (!this.tactics?.meleeOnly && this.chaseElapsed >= (elevated ? this.rules.elevatedChaseTicks : this.rules.chaseTicks)) {
        this.chaseElapsed = 0;
        if (elevated) this.state = { ...this.state, kind:'eruption' };
        this.warning(player, world);
      }
      else if (s.tick >= this.nextMelee && this.meleeCanReach(player, world, false)) {
        this.serial++;this.attackHit=false;this.counterRecorded=false;
        this.state = { ...this.state, phase: 'melee', phaseTick: 0, moving: false,
          facing: Math.atan2(player.x - this.state.center.x, player.z - this.state.center.z) };
      }
    }
    else if (s.phase === 'melee') {
      // The optional step happens early in the warning; both direction and final contact stay readable.
      if(this.tactics&&s.phaseTick<=this.tactics.stepTicks)this.attackStep(player,world);
      const activeTicks=this.tactics?.activeTicks??1;
      if (!this.attackHit&&s.phaseTick>=this.rules.meleeWarning&&s.phaseTick<this.rules.meleeWarning+activeTicks
        && this.meleeCanReach(player, world, true)) {this.hurt(this.rules.meleeDamage);this.attackHit=true;}
      if(this.tactics&&s.phaseTick===this.rules.meleeWarning+activeTicks){this.resolved++;if(!this.attackHit)this.avoided++;}
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
        if(this.tactics){this.resolved++;if(!this.attackHit)this.avoided++;}
        this.state = { ...this.state, phase: 'recovery', phaseTick: 0 };
      }
    } else if (s.phase === 'recovery' && s.phaseTick >= this.rules.recoveryTicks) {
      this.state = { ...s, kind: s.kind === 'wave' ? 'eruption' : 'wave', phase: 'chasing', phaseTick: 0 };
    }
  }
  private meleeCanReach(player: Vec3, world: RayWorld, directional: boolean): boolean {
    const s = this.state, groundY = s.center.y - this.monster.center.y;
    if (player.y < groundY - 0.2 || player.y > groundY + (this.tactics?.meleeHeight??1.35)) return false;
    const dx = player.x - s.center.x, dz = player.z - s.center.z;
    if (Math.hypot(dx, dz) > (!directional&&this.tactics?this.tactics.meleeTrigger:this.rules.meleeRange)) return false;
    if (directional && Math.cos(Math.atan2(dx, dz) - s.facing) < Math.cos(1.05)) return false;
    const origin = { ...s.center, y: groundY + 1.1 };
    const line = directionTo(origin, { ...player, y: player.y + 0.9 });
    return !world.raycast({ origin, direction: line.direction }, line.distance, true);
  }
  private attackStep(player:Vec3,world:MonsterWorld):void {
    const s=this.state,t=this.tactics!,direction={x:Math.sin(s.facing),y:0,z:Math.cos(s.facing)};
    const step=t.stepDistance/t.stepTicks;
    const center={x:s.center.x+direction.x*step,y:s.center.y,z:s.center.z+direction.z*step};
    if(Math.hypot(player.x-center.x,player.z-center.z)<this.rules.stopDistance
      ||world.sweepBall({origin:s.center,direction},step+.04,this.rules.movementRadius,true))return;
    if(![[0,0],[1.7,0],[-1.7,0],[0,1.7],[0,-1.7]].every(([x,z])=>world.raycast({
      origin:{x:center.x+x!,y:.3,z:center.z+z!},direction:{x:0,y:-1,z:0}},.5,true)))return;
    this.state={...s,center,moving:true};
  }
  private chase(player: Vec3, world: MonsterWorld): void {
    const s = this.state;
    const dx = player.x - s.center.x, dz = player.z - s.center.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= this.rules.stopDistance) return;
    const waypoint = this.steering?.(s.center, player) ?? player;
    const remaining = Math.hypot(waypoint.x - s.center.x, waypoint.z - s.center.z);
    if (remaining < 0.02) return;
    const angle = Math.atan2(waypoint.x - s.center.x, waypoint.z - s.center.z);
    const step = Math.min(this.rules.chaseSpeed * TICK_SECONDS, distance - this.rules.stopDistance, remaining);
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
    this.serial++;this.attackHit=false;this.counterRecorded=false;
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
