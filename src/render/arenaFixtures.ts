import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PICKUP_RESPAWN_TICKS, type PickupDefinition, type PickupState } from '../core/pickups';
import type { MatchSnapshot } from '../core/match';
import type { Vec3 } from '../core/types';

const COLORS = { pulse: 0x89ceff, ammo: 0x89ceff, health: 0x9ee1ab, armor: 0xe4bf7e, rail: 0x65ed7d };
const TEAMS = { blue: 0x71bff1, red: 0xe89179 };
const SPAWN_IDS = ['player', 'ally', 'rival', 'rival-2'];
type Spawn = { id: string; position: Vec3 };

function ring(inner: number, outer: number, segments = 48, start = 0, length = Math.PI * 2) {
  const geometry = new THREE.RingGeometry(inner, outer, segments, 1, start, length);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** A recessed, walk-through socket: cosmetic height stays below the actor's sole offset. */
function socketGeometry(): THREE.BufferGeometry[] {
  const groups: THREE.BufferGeometry[][] = [[], [], []];
  const add = (slot: number, geometry: THREE.BufferGeometry, x = 0, y = 0, z = 0) => {
    geometry.translate(x, y, z); groups[slot]!.push(geometry);
  };
  add(0, new THREE.CylinderGeometry(.97, 1, .035, 12), 0, .012);
  add(1, ring(.83, .94, 12), 0, .032);
  add(0, new THREE.CylinderGeometry(.68, .7, .015, 12), 0, .029);
  add(2, ring(.7, .82), 0, .033);
  add(1, ring(.62, .635), 0, .039);
  for (let i = 0; i < 12; i++) {
    const angle = (i + .5) * Math.PI / 6;
    add(2, new THREE.CylinderGeometry(.026, .026, .01, 6), Math.cos(angle) * .89, .037, Math.sin(angle) * .89);
    const plate = new THREE.BoxGeometry(.12, .012, .2);
    plate.rotateY(-angle); add(1, plate, Math.cos(angle) * .52, .042, Math.sin(angle) * .52);
  }
  return groups.map(parts => { const merged = mergeGeometries(parts)!; parts.forEach(g => g.dispose()); return merged; });
}

function countdown() {
  const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false, toneMapped: false }));
  mesh.scale.set(1.2, .8, 1); mesh.position.y = .22;
  let value = '';
  return { mesh, set(text: string) {
    if (text === value) return;
    value = text; context.clearRect(0, 0, 192, 128);
    context.font = 'bold 108px Segoe UI'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.lineWidth = 8; context.strokeStyle = '#10191e'; context.strokeText(text, 96, 65);
    context.fillStyle = '#e1ebed'; context.fillText(text, 96, 65); texture.needsUpdate = true;
  } };
}

/** Arena-only pads. They observe existing lives/pickups; they never change the simulation. */
export class ArenaFixtures {
  private readonly root = new THREE.Group();
  private readonly bases: THREE.InstancedMesh[];
  private readonly trim: THREE.InstancedMesh;
  private readonly matrix = new THREE.Object3D();
  private readonly color = new THREE.Color();
  private readonly pads;
  private readonly spawns;
  private spawnLayout = '';
  private currentTick = 0;
  constructor(scene: THREE.Scene, definitions: readonly PickupDefinition[]) {
    this.root.name = 'arena-ap1-fixtures'; scene.add(this.root);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x293239, roughness: .65, metalness: .45 }),
      new THREE.MeshStandardMaterial({ color: 0xa2adb1, roughness: .43, metalness: .72 }),
      new THREE.MeshStandardMaterial({ color: 0x10191e, roughness: .84, metalness: .25 }),
    ];
    const count = definitions.length + SPAWN_IDS.length;
    this.bases = socketGeometry().map((geometry, i) => {
      const mesh = new THREE.InstancedMesh(geometry, materials[i], count);
      mesh.receiveShadow = true; mesh.frustumCulled = false; this.root.add(mesh); return mesh;
    });
    const segments = Array.from({ length: 6 }, (_, i) => ring(.95, .98, 8, i * Math.PI / 3 + .08, .65));
    this.trim = new THREE.InstancedMesh(mergeGeometries(segments), new THREE.MeshBasicMaterial({ toneMapped: false }), count);
    segments.forEach(g => g.dispose()); this.trim.frustumCulled = false; this.root.add(this.trim);
    this.pads = definitions.map((item, index) => {
      const radius = .91;
      this.place(index, item.position, radius);
      const progress = new THREE.Mesh(ring(.72 * radius, .8 * radius),
        new THREE.MeshBasicMaterial({ color: COLORS[item.kind], toneMapped: false }));
      progress.position.set(item.position.x, item.position.y + .046, item.position.z);
      const label = countdown(); label.mesh.position.add(new THREE.Vector3(item.position.x, item.position.y, item.position.z));
      this.root.add(progress, label.mesh);
      return { id: item.id, kind: item.kind, progress, label, state: 'ready', seconds: 0, remaining: item.amount, fill: 1 };
    });
    const emblem = new THREE.Shape();
    emblem.moveTo(-.34, -.24); emblem.lineTo(0, .29); emblem.lineTo(.34, -.24);
    emblem.lineTo(0, -.05); emblem.closePath();
    const emblemGeometry = new THREE.ShapeGeometry(emblem); emblemGeometry.rotateX(-Math.PI / 2);
    this.spawns = SPAWN_IDS.map((id, index) => {
      const color = TEAMS[id === 'player' || id === 'ally' ? 'blue' : 'red'];
      const badge = new THREE.Mesh(emblemGeometry, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
      const pulse = new THREE.Mesh(ring(.9, 1), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0,
        depthWrite: false, toneMapped: false }));
      this.root.add(badge, pulse); this.place(definitions.length + index, { x: 0, y: 0, z: 0 }, 0);
      return { id, index: definitions.length + index, badge, pulse, color, life: 0, flashedAt: -100, radius: 1.4 };
    });
  }
  private place(index: number, position: Vec3, radius: number) {
    this.matrix.position.set(position.x, position.y, position.z);
    this.matrix.scale.set(radius, 1, radius); this.matrix.updateMatrix();
    for (const mesh of [...this.bases, this.trim]) { mesh.setMatrixAt(index, this.matrix.matrix); mesh.instanceMatrix.needsUpdate = true; }
  }
  reset() { this.spawnLayout = ''; for (const spawn of this.spawns) { spawn.life = 0; spawn.flashedAt = -100; } }
  update(match: MatchSnapshot, pickups: readonly PickupState[], starts: readonly Spawn[], teams: boolean) {
    const tick = match.tick; this.currentTick = tick;
    this.root.visible = match.phase !== 'ready';
    const layout = `${teams}:${starts.map(s => s.id).join(',')}`;
    if (layout !== this.spawnLayout) {
      this.spawnLayout = layout;
      for (const spawn of this.spawns) {
        const start = starts.find(s => s.id === spawn.id);
        spawn.radius = teams ? 1.4 : 1.08;
        this.place(spawn.index, start ? { ...start.position, y: start.position.y - .06 } : { x: 0, y: 0, z: 0 }, start ? spawn.radius : 0);
        spawn.badge.visible = !!start;
        if (start) {
          spawn.badge.position.set(start.position.x, start.position.y + .001, start.position.z);
          spawn.badge.rotation.y = spawn.id === 'player' || spawn.id === 'ally' ? -Math.PI / 2 : Math.PI / 2;
          spawn.pulse.position.copy(spawn.badge.position); spawn.pulse.position.y += .003;
        }
      }
    }
    for (const spawn of this.spawns) {
      const life = match.actors[spawn.id], active = spawn.badge.visible && life;
      if (active && life.alive && spawn.life !== life.life) { spawn.flashedAt = tick; spawn.life = life.life; }
      const age = tick - spawn.flashedAt, strength = active && age >= 0 && age < 48 ? 1 - age / 48 : 0;
      spawn.pulse.visible = strength > 0; spawn.pulse.material.opacity = strength * .65;
      spawn.pulse.scale.setScalar(spawn.radius * (1 + (1 - strength) * .45));
      this.trim.setColorAt(spawn.index, this.color.setHex(spawn.color).multiplyScalar(.35 + strength * .65));
    }
    for (const [index, pad] of this.pads.entries()) {
      const item = pickups[index]!;
      pad.remaining = item.remaining;
      pad.seconds = Math.max(0, Math.ceil((item.respawnAt - tick) / 60));
      pad.state = item.remaining > 0 ? 'ready' : pad.seconds > 0 ? 'charging' : 'empty';
      pad.fill = item.remaining > 0 ? 1 : Math.max(0, Math.min(1, 1 - (item.respawnAt - tick) / PICKUP_RESPAWN_TICKS));
      // Draw whole radial segments; no geometry/texture allocation per frame.
      pad.progress.geometry.setDrawRange(0, Math.floor(pad.fill * 48) * 6);
      pad.label.mesh.visible = item.remaining === 0;
      pad.label.set(pad.seconds > 0 ? String(pad.seconds) : '—');
      this.trim.setColorAt(index, this.color.setHex(COLORS[pad.kind]).multiplyScalar(item.remaining > 0 ? .8 : .16));
    }
    this.trim.instanceColor!.needsUpdate = true;
  }
  diagnostics() {
    return { pads: this.pads.map(p => ({ id: p.id, state: p.state, seconds: p.seconds, remaining: p.remaining, fill: p.fill })),
      spawns: this.spawns.filter(s => s.badge.visible).map(s => ({ id: s.id, life: s.life, flashing: this.currentTick - s.flashedAt < 48,
        position: { x: s.badge.position.x, y: s.badge.position.y, z: s.badge.position.z } })) };
  }
  dispose() {
    // ArenaView owns mesh resources; Sprite textures/materials are owned here.
    for (const pad of this.pads) { pad.label.mesh.material.map?.dispose(); pad.label.mesh.material.dispose(); }
  }
}
