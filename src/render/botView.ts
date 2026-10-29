import * as THREE from 'three';
import { createFighter } from './fighter';
import { CombatView } from './combatView';
import type { Snapshot } from '../core/types';
import type { Life } from '../core/match';
import type { WeaponSnapshot } from '../core/combat';
import { createWeaponModel } from './gear';

export class BotView {
  private readonly fighter = createFighter(0xd66e5c);
  private readonly ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.73, 32), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly bars = new THREE.Group();
  private readonly hp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly armor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.08), new THREE.MeshBasicMaterial({ color: 0x8ddcfa, side: THREE.DoubleSide }));
  private readonly effects: CombatView;
  private readonly guns = { arc: createWeaponModel('arc'), pulse: createWeaponModel('pulse') };
  constructor(scene: THREE.Scene) {
    for (const gun of Object.values(this.guns)) { gun.position.set(0.25, 1.1, 0.4); this.fighter.actor.add(gun); }
    this.ring.rotation.x = -Math.PI / 2; this.armor.position.y = 0.16; this.bars.add(this.hp, this.armor);
    scene.add(this.fighter.actor, this.ring, this.bars); this.effects = new CombatView(scene, []);
  }
  update(state: Snapshot | null, life: Life | undefined, weapons: WeaponSnapshot, tick: number, dt: number, camera: THREE.Camera): void {
    this.guns.arc.visible = weapons.selected === 'arc'; this.guns.pulse.visible = weapons.selected === 'pulse';
    this.fighter.actor.visible = this.ring.visible = this.bars.visible = !!state && !!life?.alive;
    this.effects.update(!!state, tick, weapons);
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
