import * as THREE from 'three';
import { createFighter } from './fighter';
import { CombatView } from './combatView';
import type { Snapshot } from '../core/types';
import type { Life, Team } from '../core/match';
import type { WeaponSnapshot } from '../core/combat';
import type { Vec3 } from '../core/types';

export class BotView {
  private readonly fighter;
  private readonly ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.73, 32), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly bars = new THREE.Group();
  private readonly hp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xe78770, side: THREE.DoubleSide }));
  private readonly armor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.08), new THREE.MeshBasicMaterial({ color: 0x8ddcfa, side: THREE.DoubleSide }));
  private readonly effects: CombatView;
  private readonly teamColor: number;
  private lastShot=-1;
  constructor(scene: THREE.Scene, team: Team = 'red', label = 'GEGNER') {
    this.teamColor = team === 'blue' ? 0x75c9ff : 0xe78770;
    this.fighter = createFighter(team === 'blue' ? 0x609bd5 : 0xd66e5c,team==='blue'?'wingman':'rival');
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
    this.ring.rotation.x = -Math.PI / 2; this.armor.position.y = 0.16; this.bars.add(this.hp, this.armor);
    scene.add(this.fighter.actor, this.ring, this.bars); this.effects = new CombatView(scene, [],true);
  }
  diagnostics(){return this.fighter.diagnostics();}
  update(state: Snapshot | null, life: Life | undefined, weapons: WeaponSnapshot, tick: number, dt: number, camera: THREE.Camera, aimPoint?:Vec3): void {
    this.fighter.actor.visible = this.ring.visible = this.bars.visible = !!state && !!life?.alive;
    this.effects.update(!!state, tick, weapons);
    if (!state || !life) return;
    this.fighter.actor.position.set(state.position.x, state.position.y, state.position.z);
    const shot=!!weapons.lastFire&&weapons.lastFire.tick!==this.lastShot;this.lastShot=weapons.lastFire?.tick??-1;
    const target=weapons.selected==='arc'&&weapons.lastArc?weapons.lastArc.aim.firePoint:aimPoint;
    this.fighter.actor.rotation.y=target?Math.atan2(target.x-state.position.x,target.z-state.position.z):state.facing;
    this.fighter.animate(Math.hypot(state.velocity.x, state.velocity.z), dt,{grounded:state.grounded,verticalSpeed:state.velocity.y,
      velocity:state.velocity,facing:this.fighter.actor.rotation.y,weapon:weapons.selected,shot,alive:life.alive,hp:life.hp,
      aimPitch:target?Math.atan2(target.y-state.position.y-1.15,Math.hypot(target.x-state.position.x,target.z-state.position.z)):0});
    this.ring.position.set(state.position.x, state.position.y + 0.025, state.position.z);
    this.ring.material.color.setHex(life.protectionTicks > 0 ? 0xffdd88 : this.teamColor);
    this.bars.position.set(state.position.x, state.position.y + 2.2, state.position.z);
    this.bars.quaternion.copy(camera.quaternion); this.hp.scale.x = life.hp / 100; this.armor.scale.x = life.armor / 100;
  }
}
