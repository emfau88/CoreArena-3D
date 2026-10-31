import { M1_ARENA } from '../arena/arena';
import { BotBrain, actorCenter, perceive, type BotDecision } from '../core/bot';
import { Combat, directionTo } from '../core/combat';
import type { Life } from '../core/match';
import { Simulation } from '../core/simulation';
import type { Vec3 } from '../core/types';
import { createSpatialWorld, type RapierWorld } from '../physics/rapierWorld';
import { ARENA_FIGHTERS, fighterTarget, type ArenaFighter } from '../arena/teams';

export interface BotActor { readonly life: Life; readonly position: Vec3 }
export async function createCombatBot(fighter: ArenaFighter = ARENA_FIGHTERS[1]!, roster: readonly ArenaFighter[] = ARENA_FIGHTERS.slice(0, 2)): Promise<CombatBot> {
  const world = await createSpatialWorld({ ...M1_ARENA, spawn: fighter.spawn,
    targets: roster.filter(actor => actor.id !== fighter.id).map(fighterTarget) });
  return new CombatBot(world, fighter);
}
export class CombatBot {
  readonly weapons: Combat;
  readonly simulation: Simulation;
  private readonly brain: BotBrain;
  decision: BotDecision | null = null;
  constructor(readonly world: RapierWorld, readonly fighter: ArenaFighter = ARENA_FIGHTERS[1]!) {
    this.simulation = new Simulation(world, fighter.spawn);
    this.weapons = new Combat(fighter.id); this.brain = new BotBrain(fighter.facing);
  }
  snapshot() { return { ...this.simulation.snapshot(), facing: this.brain.heading() }; }
  reset(): void { this.simulation.reset(); this.weapons.reset(); this.brain.reset(); this.decision = null; }
  clear(): void { this.weapons.clearEffects(); this.brain.reset(); this.decision = null; }
  step(tick: number, life: Life, enemyLife: Life, enemyFoot: Vec3) {
    return this.stepActors(tick, life, [{ life: enemyLife, position: enemyFoot }]);
  }
  stepActors(tick: number, life: Life, actors: readonly BotActor[]) {
    for (const actor of actors) {
      this.world.setTargetPosition(actor.life.id, actorCenter(actor.position));
      this.world.setTargetEnabled(actor.life.id, actor.life.alive);
    }
    if (!life.alive) return { attacked: false, damage: [] };
    const own = this.snapshot();
    const enemies = actors.filter(actor => actor.life.alive && actor.life.team !== life.team);
    const seen = enemies.map(actor => perceive(this.world, own.position, this.brain.heading(),
      { id: actor.life.id, center: actorCenter(actor.position), radius: 0.6 }))
      .filter(target => target !== null);
    // Keep a visible target to avoid flickering and repeatedly restarting reaction time.
    const visible = seen.find(target => target.id === this.decision?.targetId)
      ?? seen.sort((a, b) => directionTo(own.position, a.center).distance - directionTo(own.position, b.center).distance)[0] ?? null;
    const inventory = this.weapons.snapshot();
    if (visible) this.weapons.select(inventory.ownsPulse && inventory.ammo > 0 && directionTo(own.position, visible.center).distance > 4.4 ? 'pulse' : 'arc');
    this.decision = this.brain.step(tick, own, visible, this.weapons.snapshot());
    const attack = this.weapons.step(tick, this.decision.firing, this.decision.aim, this.decision.ray,
      this.world, seen, own.position);
    let movement = this.decision.movement;
    if (actors.length > 1) {
      // Local body spacing keeps several bots readable around respawns. This only
      // steers movement at contact distance; it never supplies hidden aiming data.
      let x = movement.x, z = movement.z;
      for (const actor of actors) {
        if (!actor.life.alive || Math.abs(actor.position.y - own.position.y) > 1.2) continue;
        const dx = own.position.x - actor.position.x, dz = own.position.z - actor.position.z;
        const distance = Math.hypot(dx, dz);
        if (distance >= 1.4) continue;
        const strength = (1.4 - distance) / 1.4 * 2;
        x += (distance > 0.01 ? dx / distance : this.fighter.id.localeCompare(actor.life.id) < 0 ? -1 : 1) * strength;
        z += (distance > 0.01 ? dz / distance : 0) * strength;
      }
      const scale = Math.max(1, Math.hypot(x, z));
      movement = { ...movement, x: x / scale, z: z / scale };
    }
    this.simulation.step(movement);
    if (this.snapshot().position.y < -8) attack.damage.push({ target: this.fighter.id, amount: 1000 });
    return attack;
  }
  dispose(): void { this.world.dispose(); }
}
