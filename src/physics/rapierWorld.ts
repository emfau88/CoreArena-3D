import RAPIER from '@dimforge/rapier3d-compat';
import type { ArenaDefinition } from '../arena/arena';
import { CAPSULE, CAPSULE_CENTER, TICK_SECONDS } from '../core/types';
import type { MotionResult, SpatialWorld, Vec3 } from '../core/types';

let ready: Promise<void> | undefined;
export async function createSpatialWorld(arena: ArenaDefinition): Promise<RapierWorld> {
  ready ??= RAPIER.init();
  await ready;
  return new RapierWorld(arena);
}

export class RapierWorld implements SpatialWorld {
  private readonly world = new RAPIER.World({ x: 0, y: -22.6, z: 0 });
  private readonly body: RAPIER.RigidBody;
  private readonly collider: RAPIER.Collider;
  private readonly controller: RAPIER.KinematicCharacterController;

  constructor(arena: ArenaDefinition) {
    this.world.timestep = TICK_SECONDS;
    for (const { size, center } of arena.boxes) {
      this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
          .setTranslation(center.x, center.y, center.z),
      );
    }
    this.body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(arena.spawn.x, arena.spawn.y + CAPSULE_CENTER, arena.spawn.z),
    );
    this.collider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(CAPSULE.halfHeight, CAPSULE.radius), this.body,
    );
    this.controller = this.world.createCharacterController(CAPSULE.offset);
    // A 1 cm normal nudge prevents zero-distance floor contacts consuming a tick.
    // M0 has only flat traversal: snapping is unnecessary and caused intermittent stalls.
    this.controller.setNormalNudgeFactor(0.01);
    this.controller.disableAutostep();
    this.controller.disableSnapToGround();
    this.controller.setSlideEnabled(true);
    this.world.step();
  }
  move(displacement: Vec3): MotionResult {
    this.controller.computeColliderMovement(this.collider, displacement,
      RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC | RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
    const movement = this.controller.computedMovement();
    const before = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: before.x + movement.x, y: before.y + movement.y, z: before.z + movement.z,
    });
    this.world.step();
    const position = this.body.translation();
    return {
      position: { x: position.x, y: position.y - CAPSULE_CENTER, z: position.z },
      grounded: this.controller.computedGrounded(),
    };
  }
  debugLines(): { vertices: Float32Array; colors: Float32Array } {
    return this.world.debugRender();
  }
  dispose(): void { this.world.free(); }
}
