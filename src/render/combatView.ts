import * as THREE from 'three';
import type { WeaponSnapshot } from '../core/combat';
import type { PickupDefinition, PickupState } from '../core/pickups';
import { labelMesh } from './practiceView';
import { createPickupModel } from './gear';

const COLORS = { pulse: 0x89ceff, ammo: 0x89ceff, health: 0x9ee1ab, armor: 0xe4bf7e };
const LABELS = { pulse: 'PULSE REPEATER', ammo: 'ENERGIE', health: 'MEDKIT +25', armor: 'RÜSTUNG +50' };
export class CombatView {
  private readonly root = new THREE.Group();
  private readonly pickups = new Map<string, { gem: THREE.Group; ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>; remaining: number; flash: number }>();
  private readonly bolts: THREE.Mesh[] = [];
  private readonly impact = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xa1dcff }));
  constructor(scene: THREE.Scene, definitions: readonly PickupDefinition[]) {
    for (const item of definitions) {
      const group = new THREE.Group(); group.position.set(item.position.x, item.position.y + 0.04, item.position.z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.025, 6, 48),
        new THREE.MeshBasicMaterial({ color: COLORS[item.kind], transparent: true }));
      ring.rotation.x = -Math.PI / 2;
      const gem = createPickupModel(item.kind);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.66, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x1d2a35, roughness: 0.5, metalness: 0.7 }));
      gem.position.y = 0.55;
      const label = labelMesh(LABELS[item.kind], 2.4); label.rotation.x = -Math.PI / 2; label.position.z = 0.95;
      group.add(base, ring, gem, label); this.root.add(group); this.pickups.set(item.id, { gem, ring, remaining: item.amount, flash: -100 });
    }
    const geometry = new THREE.CapsuleGeometry(0.065, 0.22, 3, 6); geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xe7fbff });
    const trailGeometry = new THREE.ConeGeometry(0.085, 0.85, 6); trailGeometry.rotateX(-Math.PI / 2);
    const trailMaterial = new THREE.MeshBasicMaterial({ color: 0x4dc5ff, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 64; i++) {
      const bolt = new THREE.Mesh(geometry, material); const trail = new THREE.Mesh(trailGeometry, trailMaterial); trail.position.z = -0.45;
      bolt.add(trail); this.bolts.push(bolt); this.root.add(bolt);
    }
    for (let i = 0; i < 6; i++) {
      const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.055), material);
      spark.position.set(Math.sin(i * 2.4) * 0.27, Math.cos(i * 1.3) * 0.2, Math.cos(i * 2.4) * 0.27); this.impact.add(spark);
    }
    this.root.add(this.impact); scene.add(this.root); this.root.visible = false;
  }
  update(active: boolean, tick: number, weapons?: WeaponSnapshot, pickups: readonly PickupState[] = []): void {
    this.root.visible = active;
    if (!active || !weapons) return;
    for (const item of pickups) {
      const visual = this.pickups.get(item.id)!;
      if (item.remaining < visual.remaining) visual.flash = tick;
      visual.remaining = item.remaining;
      visual.gem.visible = item.remaining > 0; visual.gem.rotation.y = Math.sin(tick / 110) * 0.35;
      visual.gem.position.y = 0.55 + Math.sin(tick / 30) * 0.07;
      visual.ring.material.opacity = item.remaining > 0 ? 1 : 0.18;
      const age = tick - visual.flash;
      visual.ring.scale.setScalar(age >= 0 && age < 18 ? 1 + Math.sin(age / 18 * Math.PI) * 0.4 : 1);
    }
    this.bolts.forEach((bolt, index) => {
      const projectile = weapons.projectiles[index]; bolt.visible = !!projectile;
      if (projectile) {
        bolt.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
        bolt.lookAt(projectile.position.x + projectile.direction.x, projectile.position.y + projectile.direction.y, projectile.position.z + projectile.direction.z);
      }
    });
    this.impact.visible = !!weapons.impact && tick - weapons.impact.tick < 6;
    if (weapons.impact) { this.impact.position.set(weapons.impact.point.x, weapons.impact.point.y, weapons.impact.point.z); this.impact.scale.setScalar(0.5 + Math.max(0, tick - weapons.impact.tick) * 0.2); }
  }
}
