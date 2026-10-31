import * as THREE from 'three';
import { createFighter } from './fighter';
import { CombatView } from './combatView';
import type { Snapshot } from '../core/types';
import type { Life, Team } from '../core/match';
import type { WeaponSnapshot } from '../core/combat';
import { createWeaponModel } from './gear';

export class BotView {
  private readonly fighter;
  private readonly ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.73, 32), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly bars = new THREE.Group();
  private readonly hp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly armor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.08), new THREE.MeshBasicMaterial({ color: 0x8ddcfa, side: THREE.DoubleSide }));
  private readonly effects: CombatView;
  private readonly guns = { arc: createWeaponModel('arc'), pulse: createWeaponModel('pulse'), rail: createWeaponModel('rail') };
  private readonly teamColor: number;
  constructor(scene: THREE.Scene, team: Team = 'red', label = 'GEGNER') {
    this.teamColor = team === 'blue' ? 0x75c9ff : 0xe78770;
    this.fighter = createFighter(team === 'blue' ? 0x609bd5 : 0xd66e5c);
    this.hp.material.color.setHex(this.teamColor);
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 48;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#111b23dd'; context.fillRect(0, 0, 256, 48);
    context.font = 'bold 24px Segoe UI'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillStyle = team === 'blue' ? '#9adaff' : '#ffac96'; context.fillText(label, 128, 24);
    const name = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.375), new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, side: THREE.DoubleSide,
    }));
    name.position.y = 0.46; this.bars.add(name);
    for (const gun of Object.values(this.guns)) { gun.position.set(0.25, 1.1, 0.4); this.fighter.actor.add(gun); }
    this.ring.rotation.x = -Math.PI / 2; this.armor.position.y = 0.16; this.bars.add(this.hp, this.armor);
    scene.add(this.fighter.actor, this.ring, this.bars); this.effects = new CombatView(scene, []);
  }
  update(state: Snapshot | null, life: Life | undefined, weapons: WeaponSnapshot, tick: number, dt: number, camera: THREE.Camera): void {
    this.guns.arc.visible = weapons.selected === 'arc'; this.guns.pulse.visible = weapons.selected === 'pulse';
    this.guns.rail.visible = weapons.selected === 'rail';
    this.fighter.actor.visible = this.ring.visible = this.bars.visible = !!state && !!life?.alive;
    this.effects.update(!!state, tick, weapons);
    if (!state || !life) return;
    this.fighter.actor.position.set(state.position.x, state.position.y, state.position.z);
    this.fighter.actor.rotation.y = state.facing;
    this.fighter.animate(Math.hypot(state.velocity.x, state.velocity.z), dt);
    this.ring.position.set(state.position.x, state.position.y + 0.025, state.position.z);
    this.ring.material.color.setHex(life.protectionTicks > 0 ? 0xffdd88 : this.teamColor);
    this.bars.position.set(state.position.x, state.position.y + 2.2, state.position.z);
    this.bars.quaternion.copy(camera.quaternion); this.hp.scale.x = life.hp / 100; this.armor.scale.x = life.armor / 100;
  }
}
