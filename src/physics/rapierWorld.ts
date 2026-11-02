import RAPIER from '@dimforge/rapier3d-compat';
import type { ArenaDefinition } from '../arena/arena';
import { CAPSULE, CAPSULE_CENTER, TICK_SECONDS } from '../core/types';
import type { MotionResult, Ray, RayHit, RayWorld, SpatialWorld, Vec3 } from '../core/types';

let ready: Promise<void> | undefined;
export async function createSpatialWorld(arena: ArenaDefinition, options: { stepHeight?: number } = {}): Promise<RapierWorld> {
  ready ??= RAPIER.init();
  await ready;
  return new RapierWorld(arena, options.stepHeight);
}

export class RapierWorld implements SpatialWorld, RayWorld {
  private readonly world = new RAPIER.World({ x: 0, y: -22.6, z: 0 });
  private readonly body: RAPIER.RigidBody;
  private readonly collider: RAPIER.Collider;
  private readonly controller: RAPIER.KinematicCharacterController;
  private readonly names = new Map<number, string>();
  private readonly targets = new Map<string, RAPIER.Collider>();
  private readonly obstacles = new Map<string, RAPIER.Collider>();
  private readonly movementBlockers = new Map<string, RAPIER.Collider>();
  private readonly movementHandles = new Set<number>();
  private readonly weaponFilter = (collider:RAPIER.Collider) => !this.movementHandles.has(collider.handle);

  constructor(arena: ArenaDefinition, stepHeight = 0) {
    this.world.timestep = TICK_SECONDS;
    for (const { id, size, center } of arena.boxes) {
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
          .setTranslation(center.x, center.y, center.z),
      );
      this.names.set(collider.handle, id);
      this.obstacles.set(id, collider);
    }
    for (const { id, center, radius } of arena.targets ?? []) {
      const collider = this.world.createCollider(RAPIER.ColliderDesc.ball(radius)
        .setTranslation(center.x, center.y, center.z).setSensor(true));
      this.names.set(collider.handle, id);
      this.targets.set(id, collider);
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
    // No ground snapping: ledges and undersides must be resolved by actual collision.
    this.controller.setNormalNudgeFactor(0.01);
    this.controller.disableAutostep();
    // Opt-in shallow stair assistance. Full ledges still require a real jump.
    if (stepHeight > 0) this.controller.enableAutostep(stepHeight, 0.2, false);
    this.controller.disableSnapToGround();
    this.controller.setSlideEnabled(true);
    this.world.step();
  }
  move(displacement: Vec3, recoverGroundSlide=false): MotionResult {
    this.controller.computeColliderMovement(this.collider, displacement,
      RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC | RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
    const movement = this.controller.computedMovement();
    let ceiling = false;
    let lateralContact=false;
    let surface: string | null = null;
    for (let i = 0; i < this.controller.numComputedCollisions(); i++) {
      const collision = this.controller.computedCollision(i);
      if (!collision) continue;
      if(collision.normal1.y<.7)lateralContact=true;
      if (collision.normal1.y < -0.5) ceiling = true;
      if (collision.normal1.y > 0.7 && collision.collider) surface = this.names.get(collision.collider.handle) ?? null;
    }
    const before = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: before.x + movement.x, y: before.y + movement.y, z: before.z + movement.z,
    });
    this.world.step();
    let position = this.body.translation();
    // The capsule can touch a ledge with its rounded underside while still rising.
    // That contact must not cancel the jump and turn forward input into a slow climb.
    let grounded = displacement.y <= 0 && this.controller.computedGrounded();
    // Rapier can consume a fast diagonal move in a near-zero floor contact while nudging up.
    // Dash-only: retry the remaining horizontal displacement from that resolved position,
    // through the same capsule solver. Never bypass a wall/body contact or add free distance.
    const requested=Math.hypot(displacement.x,displacement.z),moved=Math.hypot(movement.x,movement.z);
    if(recoverGroundSlide&&grounded&&!lateralContact&&requested>.001&&moved<requested*.9){
      this.controller.computeColliderMovement(this.collider,{x:displacement.x-movement.x,y:0,z:displacement.z-movement.z},
        RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC|RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
      const correction=this.controller.computedMovement();
      this.body.setNextKinematicTranslation({x:position.x+correction.x,y:position.y+correction.y,z:position.z+correction.z});
      this.world.step();position=this.body.translation();
      const support=this.raycast({origin:{x:position.x,y:position.y-CAPSULE_CENTER+.05,z:position.z},direction:{x:0,y:-1,z:0}},.12,true);
      grounded=!!support;surface=support?.id??null;
    }
    // Rapier can report a grounded resting contact without a new movement collision.
    // Recover its identity with a short physical support ray, never an X/Z height lookup.
    if (grounded && !surface) surface = this.raycast({
      origin: { x: position.x, y: position.y - CAPSULE_CENTER + 0.05, z: position.z },
      direction: { x: 0, y: -1, z: 0 },
    }, 0.12, true)?.id ?? null;
    return {
      position: { x: position.x, y: position.y - CAPSULE_CENTER, z: position.z },
      grounded,
      ceiling,
      surface: grounded ? surface : null,
    };
  }
  raycast(ray: Ray, distance: number, surfacesOnly = false): RayHit | null {
    const query = new RAPIER.Ray(ray.origin, ray.direction);
    const hit = this.world.castRayAndGetNormal(query, distance, true,
      surfacesOnly ? RAPIER.QueryFilterFlags.EXCLUDE_SENSORS : undefined,
      undefined, this.collider, undefined, this.weaponFilter);
    if (!hit) return null;
    return { id: this.names.get(hit.collider.handle)!, point: query.pointAt(hit.timeOfImpact),
      normal: { ...hit.normal }, distance: hit.timeOfImpact };
  }
  setTargetPosition(id: string, position: Vec3): void {
    this.targets.get(id)?.setTranslation(position);
    this.world.step();
  }
  setTargetEnabled(id: string, enabled: boolean): void {
    const collider = this.targets.get(id);
    if (collider && collider.isEnabled() !== enabled) {
      collider.setEnabled(enabled);
      this.world.step();
    }
  }
  setObstacleEnabled(id: string, enabled: boolean): void {
    const collider = this.obstacles.get(id);
    if (collider && collider.isEnabled() !== enabled) { collider.setEnabled(enabled); this.world.step(); }
  }
  setObstacleBox(id:string,center:Vec3,size:Vec3):void {
    const collider=this.obstacles.get(id);if(!collider)throw new Error(`Unknown obstacle: ${id}`);
    collider.setHalfExtents({x:size.x/2,y:size.y/2,z:size.z/2});collider.setTranslation(center);this.world.step();
  }
  sweepBall(ray: Ray, distance: number, radius: number, surfacesOnly = false): RayHit | null {
    const hit = this.world.castShape(ray.origin, { x: 0, y: 0, z: 0, w: 1 }, ray.direction,
      new RAPIER.Ball(radius), 0, distance, true,
      surfacesOnly ? RAPIER.QueryFilterFlags.EXCLUDE_SENSORS : undefined, undefined, this.collider, undefined, this.weaponFilter);
    if (!hit) return null;
    return { id: this.names.get(hit.collider.handle)!, distance: hit.time_of_impact,
      point: { x: ray.origin.x + ray.direction.x * hit.time_of_impact,
        y: ray.origin.y + ray.direction.y * hit.time_of_impact, z: ray.origin.z + ray.direction.z * hit.time_of_impact },
      normal: { ...hit.normal1 } };
  }
  reset(position: Vec3): void {
    const center = { x: position.x, y: position.y + CAPSULE_CENTER, z: position.z };
    this.body.setTranslation(center, true);
    this.body.setNextKinematicTranslation(center);
    this.world.step();
  }
  /** Movement-only cylinder: weapon rays, boss navigation and damage queries never see it. */
  setMovementBlocker(id:string, center:Vec3, radius:number, height:number, enabled:boolean):void {
    let collider=this.movementBlockers.get(id);
    if(!collider && enabled) {
      collider=this.world.createCollider(RAPIER.ColliderDesc.cylinder(height/2,radius));
      this.movementBlockers.set(id,collider);this.movementHandles.add(collider.handle);this.names.set(collider.handle,id);
    }
    if(collider) {collider.setTranslation(center);collider.setEnabled(enabled);this.world.step();}
  }
  debugLines(): { vertices: Float32Array; colors: Float32Array } {
    return this.world.debugRender();
  }
  dispose(): void { this.world.free(); }
}
