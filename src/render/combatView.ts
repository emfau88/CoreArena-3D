import * as THREE from 'three';
import type { WeaponSnapshot } from '../core/combat';
import type { PickupDefinition, PickupState } from '../core/pickups';
import { labelMesh } from './practiceView';

const COLORS = { pulse: 0x89ceff, ammo: 0x89ceff, health: 0x9ee1ab, armor: 0xe4bf7e };
const LABELS = { pulse: 'PULSE', ammo: 'MUNITION', health: 'HP +25', armor: 'ARMOR +50' };
export class CombatView {
  private readonly root = new THREE.Group();
  private readonly pickups = new Map<string, { gem: THREE.Mesh; ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> }>();
  private readonly bolts: THREE.Mesh[] = [];
  private readonly impact = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xa1dcff }));
  constructor(scene: THREE.Scene, definitions: readonly PickupDefinition[]) {
    for (const item of definitions) {
      const group = new THREE.Group(); group.position.set(item.position.x, item.position.y + 0.04, item.position.z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 6, 32),
        new THREE.MeshBasicMaterial({ color: COLORS[item.kind], transparent: true }));
      ring.rotation.x = -Math.PI / 2;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28),
        new THREE.MeshStandardMaterial({ color: COLORS[item.kind], emissive: COLORS[item.kind], emissiveIntensity: 0.45, metalness: 0.6, roughness: 0.3 }));
      gem.position.y = 0.55;
      const label = labelMesh(LABELS[item.kind], 2.4); label.rotation.x = -Math.PI / 2; label.position.z = 0.95;
      group.add(ring, gem, label); this.root.add(group); this.pickups.set(item.id, { gem, ring });
    }
    const geometry = new THREE.SphereGeometry(0.08, 8, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0x8ddcff });
    for (let i = 0; i < 64; i++) { const bolt = new THREE.Mesh(geometry, material); this.bolts.push(bolt); this.root.add(bolt); }
    this.root.add(this.impact); scene.add(this.root); this.root.visible = false;
  }
  update(active: boolean, tick: number, weapons?: WeaponSnapshot, pickups: readonly PickupState[] = []): void {
    this.root.visible = active;
    if (!active || !weapons) return;
    for (const item of pickups) {
      const visual = this.pickups.get(item.id)!;
      visual.gem.visible = item.remaining > 0; visual.gem.rotation.y = tick / 90;
      visual.gem.position.y = 0.55 + Math.sin(tick / 30) * 0.07;
      visual.ring.material.opacity = item.remaining > 0 ? 1 : 0.18;
    }
    this.bolts.forEach((bolt, index) => {
      const projectile = weapons.projectiles[index]; bolt.visible = !!projectile;
      if (projectile) bolt.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
    });
    this.impact.visible = !!weapons.impact && tick - weapons.impact.tick < 6;
    if (weapons.impact) this.impact.position.set(weapons.impact.point.x, weapons.impact.point.y, weapons.impact.point.z);
  }
}
