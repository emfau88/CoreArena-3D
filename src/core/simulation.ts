import { GRAVITY, JUMP_SPEED, SPRINT_SPEED, TICK_SECONDS, WALK_SPEED } from './types';
import type { MoveCommand, Snapshot, SpatialWorld, Vec3 } from './types';

export interface JumpProfile { readonly jumpSpeed: number; readonly gravity: number }
const DEFAULT_JUMP: JumpProfile = { jumpSpeed: JUMP_SPEED, gravity: GRAVITY };

export class Simulation {
  private state: Snapshot;
  constructor(private readonly world: SpatialWorld, private readonly spawn: Vec3, private readonly jump: JumpProfile = DEFAULT_JUMP) {
    this.state = this.freeze({
      tick: 0, position: { ...spawn }, velocity: { x: 0, y: 0, z: 0 },
      grounded: false, facing: 0, surface: null, ceiling: false,
    });
  }
  step(command: MoveCommand): Snapshot {
    const length = Math.hypot(command.x, command.z);
    const divisor = Math.max(1, length);
    const speed = command.sprint ? SPRINT_SPEED : WALK_SPEED;
    const vx = command.x / divisor * speed;
    const vz = command.z / divisor * speed;
    const vy = command.jump && this.state.grounded ? this.jump.jumpSpeed
      : this.state.grounded ? -0.1 : this.state.velocity.y - this.jump.gravity * TICK_SECONDS;
    const result = this.world.move({
      x: vx * TICK_SECONDS, y: vy * TICK_SECONDS, z: vz * TICK_SECONDS,
    });
    this.state = this.freeze({
      tick: this.state.tick + 1,
      position: result.position,
      velocity: {
        x: (result.position.x - this.state.position.x) / TICK_SECONDS,
        y: result.grounded || (result.ceiling && vy > 0) ? 0 : vy,
        z: (result.position.z - this.state.position.z) / TICK_SECONDS,
      },
      grounded: result.grounded,
      surface: result.surface,
      ceiling: result.ceiling,
      facing: length > 0.001 ? Math.atan2(vx, vz) : this.state.facing,
    });
    return this.state;
  }
  snapshot(): Snapshot { return this.state; }
  reset(position: Vec3 = this.spawn): Snapshot {
    this.world.reset(position);
    this.state = this.freeze({ ...this.state, position, velocity: { x: 0, y: 0, z: 0 },
      grounded: false, surface: null, ceiling: false });
    return this.state;
  }
  private freeze(state: Snapshot): Snapshot {
    return Object.freeze({
      ...state, position: Object.freeze({ ...state.position }),
      velocity: Object.freeze({ ...state.velocity }),
    });
  }
}
