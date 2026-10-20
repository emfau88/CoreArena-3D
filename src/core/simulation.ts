import { SPRINT_SPEED, TICK_SECONDS, WALK_SPEED } from './types';
import type { MoveCommand, Snapshot, SpatialWorld, Vec3 } from './types';

export class Simulation {
  private state: Snapshot;
  constructor(private readonly world: SpatialWorld, spawn: Vec3) {
    this.state = this.freeze({
      tick: 0, position: { ...spawn }, velocity: { x: 0, y: 0, z: 0 },
      grounded: false, facing: 0,
    });
  }
  step(command: MoveCommand): Snapshot {
    const length = Math.hypot(command.x, command.z);
    const divisor = Math.max(1, length);
    const speed = command.sprint ? SPRINT_SPEED : WALK_SPEED;
    const vx = command.x / divisor * speed;
    const vz = command.z / divisor * speed;
    // M0 only settles onto E0. Jump, airborne control and stand-surface IDs belong to M1.
    const vy = this.state.grounded ? -0.1 : this.state.velocity.y - 22.6 * TICK_SECONDS;
    const result = this.world.move({
      x: vx * TICK_SECONDS, y: vy * TICK_SECONDS, z: vz * TICK_SECONDS,
    });
    this.state = this.freeze({
      tick: this.state.tick + 1,
      position: result.position,
      velocity: {
        x: (result.position.x - this.state.position.x) / TICK_SECONDS,
        y: result.grounded ? 0 : vy,
        z: (result.position.z - this.state.position.z) / TICK_SECONDS,
      },
      grounded: result.grounded,
      facing: length > 0.001 ? Math.atan2(vx, vz) : this.state.facing,
    });
    return this.state;
  }
  snapshot(): Snapshot { return this.state; }
  private freeze(state: Snapshot): Snapshot {
    return Object.freeze({
      ...state, position: Object.freeze({ ...state.position }),
      velocity: Object.freeze({ ...state.velocity }),
    });
  }
}
