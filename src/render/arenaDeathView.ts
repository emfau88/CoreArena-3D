import * as THREE from 'three';
import type { Team } from '../core/match';
import type { Vec3 } from '../core/types';

const CAPACITY = 4, PIECES = 44, DURATION = 1.35;
const palettes = {
  blue: [0x56caff, 0x9ae9ff, 0xffffff, 0xffd76e],
  red: [0xff745f, 0xffb89d, 0xffffff, 0xffd76e],
};

/** Arena-only paper bursts. One bounded instance buffer, no assets or physics bodies. */
export class ArenaDeathView {
  private readonly paper = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), CAPACITY * PIECES);
  private readonly transform = new THREE.Object3D();
  private readonly color = new THREE.Color();
  private readonly slots;
  private emitted = 0;
  constructor(scene: THREE.Scene) {
    this.paper.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.paper.frustumCulled = false;
    scene.add(this.paper);
    this.slots = Array.from({ length: CAPACITY }, () => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(.83, 1, 40),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      const flash = new THREE.Mesh(new THREE.IcosahedronGeometry(.65, 0),
        new THREE.MeshBasicMaterial({ color: 0xfff5cf, transparent: true, opacity: 0, depthWrite: false }));
      scene.add(ring, flash);
      return { id: '', life: 0, team: 'blue' as Team, age: DURATION, position: { x: 0, y: 0, z: 0 }, ring, flash };
    });
    this.reset();
  }
  emit(id: string, life: number, team: Team, position: Vec3): void {
    const slot = this.slots.find(slot => !slot.id) ?? this.slots.reduce((oldest, slot) => slot.age > oldest.age ? slot : oldest);
    slot.id = id; slot.life = life; slot.team = team; slot.age = 0; slot.position = { ...position };
    slot.ring.position.set(position.x, position.y + .04, position.z);
    slot.ring.material.color.setHex(palettes[team][0]!);
    slot.flash.position.set(position.x, position.y + .9, position.z);
    const offset = this.slots.indexOf(slot) * PIECES;
    for (let i = 0; i < PIECES; i++) this.paper.setColorAt(offset + i, this.color.setHex(palettes[team][i % 4]!));
    this.paper.instanceColor!.needsUpdate = true;
    this.emitted++;
  }
  update(dt: number): void {
    if (!this.slots.some(slot => !!slot.id)) { this.paper.visible = false; return; }
    for (const [slotIndex, slot] of this.slots.entries()) {
      slot.age = Math.min(DURATION, slot.age + Math.max(0, dt));
      if (slot.age >= DURATION) slot.id = '';
      const t = slot.age, active = !!slot.id;
      slot.ring.visible = active && t < .32;
      slot.ring.scale.setScalar(.45 + t * 5);
      slot.ring.material.opacity = Math.max(0, 1 - t / .32) * .75;
      slot.flash.visible = active && t < .14;
      slot.flash.scale.setScalar(.7 + t * 3);
      slot.flash.material.opacity = Math.max(0, 1 - t / .14) * .85;
      for (let i = 0; i < PIECES; i++) {
        // Golden-angle scatter is stable across frames; no per-frame allocation/randomness.
        const angle = i * 2.399963 + slot.life * .7, spread = 1.2 + (i % 7) * .22;
        const travel = .12 + spread * (1 - Math.exp(-t * 1.8));
        const fade = active ? 1 - THREE.MathUtils.smoothstep(t, .85, DURATION) : 0;
        this.transform.position.set(slot.position.x + Math.cos(angle) * travel,
          slot.position.y + Math.max(.045, .55 + (i % 5) * .18 + (2.1 + (i % 4) * .4) * t - 3.6 * t * t),
          slot.position.z + Math.sin(angle) * travel);
        this.transform.rotation.set(angle + t * (3 + i % 4), t * 5 + i, angle - t * 4);
        this.transform.scale.set((.14 + (i % 3) * .035) * fade, (.25 + (i % 4) * .035) * fade, 1);
        this.transform.updateMatrix(); this.paper.setMatrixAt(slotIndex * PIECES + i, this.transform.matrix);
      }
    }
    this.paper.visible = this.slots.some(slot => !!slot.id);
    this.paper.instanceMatrix.needsUpdate = true;
  }
  reset(): void {
    this.emitted = 0;
    for (const slot of this.slots) { slot.id = ''; slot.age = DURATION; slot.ring.visible = slot.flash.visible = false; }
    this.update(0);
  }
  diagnostics() {
    return { emitted: this.emitted, capacity: CAPACITY, piecesPerBurst: PIECES,
      active: this.slots.filter(slot => !!slot.id).map(slot => ({ id: slot.id, life: slot.life, team: slot.team, age: slot.age, position: { ...slot.position } })) };
  }
}
