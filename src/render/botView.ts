import * as THREE from 'three';
import { createFighter } from './fighter';
import { CombatView } from './combatView';
import type { Snapshot } from '../core/types';
import type { Life } from '../core/match';
import type { WeaponSnapshot } from '../core/combat';

export class BotView {
  private readonly fighter = createFighter(0xd66e5c);
  private readonly ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.73, 32), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly bars = new THREE.Group();
  private readonly hp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly armor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.08), new THREE.MeshBasicMaterial({ color: 0x8ddcfa, side: THREE.DoubleSide }));
  private readonly traceGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  private readonly trace = new THREE.Line(this.traceGeometry, new THREE.LineBasicMaterial({ color: 0xffa383 }));
  private readonly effects: CombatView;
  constructor(scene: THREE.Scene) {
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.65), new THREE.MeshStandardMaterial({ color: 0x424e55, metalness: 0.7, roughness: 0.35 }));
    gun.position.set(0.25, 1.1, 0.4); this.fighter.actor.add(gun);
    this.ring.rotation.x = -Math.PI / 2; this.armor.position.y = 0.16; this.bars.add(this.hp, this.armor);
    this.trace.frustumCulled = false;
    scene.add(this.fighter.actor, this.ring, this.bars, this.trace); this.effects = new CombatView(scene, []);
  }
  update(state: Snapshot | null, life: Life | undefined, weapons: WeaponSnapshot, tick: number, dt: number, camera: THREE.Camera): void {
    this.fighter.actor.visible = this.ring.visible = this.bars.visible = !!state && !!life?.alive;
    this.effects.update(!!state, tick, weapons);
    const shot = weapons.lastArc;
    this.trace.visible = !!state && !!shot && tick - shot.tick < 6;
    if (this.trace.visible && shot) {
      const points = this.traceGeometry.getAttribute('position') as THREE.BufferAttribute;
      points.setXYZ(0, shot.aim.muzzle.x, shot.aim.muzzle.y, shot.aim.muzzle.z);
      points.setXYZ(1, shot.aim.end.x, shot.aim.end.y, shot.aim.end.z); points.needsUpdate = true;
    }
    if (!state || !life) return;
    this.fighter.actor.position.set(state.position.x, state.position.y, state.position.z);
    this.fighter.actor.rotation.y = state.facing;
    this.fighter.animate(Math.hypot(state.velocity.x, state.velocity.z), dt);
    this.ring.position.set(state.position.x, state.position.y + 0.025, state.position.z);
    this.ring.material.color.setHex(life.protectionTicks > 0 ? 0xffdd88 : 0xe78770);
    this.bars.position.set(state.position.x, state.position.y + 2.2, state.position.z);
    this.bars.quaternion.copy(camera.quaternion); this.hp.scale.x = life.hp / 100; this.armor.scale.x = life.armor / 100;
  }
}
