import * as THREE from 'three';
import type { WeaponSnapshot } from '../core/combat';
import type { PickupDefinition, PickupState } from '../core/pickups';
import { labelMesh } from './practiceView';
import { createPickupModel } from './gear';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const COLORS = { pulse: 0x89ceff, ammo: 0x89ceff, health: 0x9ee1ab, armor: 0xe4bf7e };
const LABELS = { pulse: 'PULSE REPEATER', ammo: 'ENERGIE', health: 'MEDKIT', armor: 'RÜSTUNG' };
export class CombatView {
  private readonly root = new THREE.Group();
  private readonly pickups = new Map<string, { group: THREE.Group; gem: THREE.Group; label:THREE.Mesh;
    ring: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>; particles:THREE.InstancedMesh; remaining: number; flash: number }>();
  private readonly particleTransform=new THREE.Object3D();
  private lastTick=0;
  diagnostics(){return [...this.pickups].map(([id,v])=>({id,visible:v.group.visible,remaining:v.remaining,particles:v.particles.visible}));}
  private readonly bolts: THREE.Mesh[] = [];
  private readonly impact = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xa1dcff }));
  constructor(scene: THREE.Scene, definitions: readonly PickupDefinition[]) {
    for (const item of definitions) {
      const group = new THREE.Group(); group.position.set(item.position.x, item.position.y + 0.04, item.position.z);
      const arcs=Array.from({length:4},(_,i)=>new THREE.RingGeometry(.64,.68,12,1,i*Math.PI/2,Math.PI*.36));
      const ring = new THREE.Mesh(mergeGeometries(arcs),
        new THREE.MeshBasicMaterial({ color: COLORS[item.kind], transparent: true,opacity:.75,depthWrite:false,toneMapped:false }));
      arcs.forEach(arc=>arc.dispose());
      ring.rotation.x = -Math.PI / 2;
      const gem = createPickupModel(item.kind);
      const particles=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.035),
        new THREE.MeshBasicMaterial({color:COLORS[item.kind],transparent:true,opacity:.8,depthWrite:false,
          blending:THREE.AdditiveBlending,toneMapped:false}),12);
      particles.frustumCulled=false;
      gem.position.y = 0.55;
      const text = LABELS[item.kind] + (item.kind === 'health' || item.kind === 'armor' ? ` +${item.amount}` : '');
      const label = labelMesh(text, 2.4); label.rotation.x = -Math.PI / 2; label.position.z = 0.95;
      group.name=`pickup-${item.id}`;
      group.add(ring, gem, label,particles); this.root.add(group); this.pickups.set(item.id, { group, gem, ring,label,particles, remaining: item.amount, flash: -100 });
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
  update(active: boolean, tick: number, weapons?: WeaponSnapshot, pickups: readonly PickupState[] = [], sideView = false): void {
    this.root.visible = active;
    if (!active || !weapons) return;
    for (const item of pickups) {
      const visual = this.pickups.get(item.id)!;
      if(tick<this.lastTick)visual.flash=-100;
      // Keep pickup lettering horizontal when the adventure camera looks along X.
      visual.group.rotation.y = sideView ? Math.PI / 2 : 0;
      if (item.remaining < visual.remaining) visual.flash = tick;
      visual.remaining = item.remaining;
      visual.gem.visible = item.remaining > 0; visual.gem.rotation.y = Math.sin(tick / 110) * 0.35;
      visual.gem.position.y = 0.55 + Math.sin(tick / 30) * 0.07;
      const age = tick - visual.flash;
      const flash=age>=0 && age<24?1-age/24:0,available=item.remaining>0;
      visual.group.visible=available||flash>0||item.respawnAt>tick;
      visual.label.visible=available;visual.particles.visible=available||flash>0;
      visual.ring.material.opacity=available ? .65+Math.sin(tick/35)*.12 : flash>0 ? flash*.9 : .13;
      visual.ring.scale.setScalar(1+(1-flash)*(flash>0 ? .65 : 0));
      for(let i=0;i<12;i++) {
        const rise=(tick/100+i/12)%1,angle=i*2.4+tick*.003,radius=.36+Math.sin(i*1.7)*.15;
        const pulse=Math.sin(rise*Math.PI),transform=this.particleTransform;
        transform.position.set(Math.cos(angle)*radius,.1+rise*1.05,Math.sin(angle)*radius);
        transform.scale.setScalar((.5+pulse*.75)*(available?1:flash*2));transform.rotation.set(i,tick*.02,i*.7);transform.updateMatrix();
        visual.particles.setMatrixAt(i,transform.matrix);
      }
      visual.particles.instanceMatrix.needsUpdate=true;
    }
    this.lastTick=tick;
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
