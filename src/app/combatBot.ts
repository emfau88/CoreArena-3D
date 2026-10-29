import { M1_ARENA } from '../arena/arena';
import { BotBrain, BOT_SPAWN, actorCenter, perceive, type BotDecision } from '../core/bot';
import { Combat, directionTo } from '../core/combat';
import type { Life } from '../core/match';
import { Simulation } from '../core/simulation';
import type { Vec3 } from '../core/types';
import { createSpatialWorld, type RapierWorld } from '../physics/rapierWorld';

export async function createCombatBot(): Promise<CombatBot> {
  const world = await createSpatialWorld({ ...M1_ARENA, spawn: BOT_SPAWN,
    targets: [{ id: 'player', center: actorCenter(M1_ARENA.spawn), radius: 0.6, level: 'PLAYER' }] });
  return new CombatBot(world);
}
export class CombatBot {
  readonly weapons = new Combat('rival');
  readonly simulation: Simulation;
  private readonly brain = new BotBrain();
  decision: BotDecision | null = null;
  constructor(readonly world: RapierWorld) { this.simulation = new Simulation(world, BOT_SPAWN); }
  snapshot() { return { ...this.simulation.snapshot(), facing: this.brain.heading() }; }
  reset(): void { this.simulation.reset(); this.weapons.reset(); this.brain.reset(); this.decision = null; }
  clear(): void { this.weapons.clearEffects(); this.brain.reset(); this.decision = null; }
  step(tick: number, life: Life, enemyLife: Life, enemyFoot: Vec3) {
    this.world.setTargetPosition('player', actorCenter(enemyFoot));
    this.world.setTargetEnabled('player', enemyLife.alive);
    if (!life.alive) return { attacked: false, damage: [] };
    const target = { id: 'player', center: actorCenter(enemyFoot), radius: 0.6 };
    const own = this.snapshot();
    const visible = perceive(this.world, own.position, this.brain.heading(), enemyLife.alive ? target : null);
    const inventory = this.weapons.snapshot();
    if (visible) this.weapons.select(inventory.ownsPulse && inventory.ammo > 0 && directionTo(own.position, visible.center).distance > 4.4 ? 'pulse' : 'arc');
    this.decision = this.brain.step(tick, own, visible, this.weapons.snapshot());
    const attack = this.weapons.step(tick, this.decision.firing, this.decision.aim, this.decision.ray,
      this.world, visible ? [visible] : [], own.position);
    this.simulation.step(this.decision.movement);
    if (this.snapshot().position.y < -8) attack.damage.push({ target: 'rival', amount: 1000 });
    return attack;
  }
  dispose(): void { this.world.dispose(); }
}
