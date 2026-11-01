import * as THREE from 'three';
import { buildArena } from './buildArena';
import { labelMesh } from './practiceView';
import type { ArenaDefinition } from '../arena/arena';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function buildExpandedArena(scene: THREE.Scene, arena: ArenaDefinition): void {
  buildArena(scene, arena, true);
  // Spawn/pickup sockets are handled by the Arena-only live fixture renderer.
  for (const shape of arena.boxes.filter(box => box.level)) {
    const lower = shape.level!.startsWith('E1');
    const body = scene.getObjectByName(shape.id) as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    body.material = body.material.clone(); body.material.color.setHex(lower ? 0xb4c3c1 : 0xc7bdab);
    const top = shape.center.y + shape.size.y / 2, front = shape.center.z + shape.size.z / 2;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(shape.size.x, .075, .04),
      new THREE.MeshBasicMaterial({ color: lower ? 0x9fd4ca : 0xe9c981 }));
    rim.position.set(shape.center.x, top - .07, front + .025); scene.add(rim);
    const label = labelMesh(lower ? 'E1 / MUNITION' : 'E2 / RÜSTUNG', 4.4);
    label.position.set(shape.center.x, top * .52, front + .035); scene.add(label);
    const tickMaterial = new THREE.MeshBasicMaterial({ color: 0xd7dfdb });
    for (let y = .5; y < top - .2; y += .5) {
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(.3, .04), tickMaterial);
      tick.position.set(shape.center.x - shape.size.x / 2 + .35, y, front + .04); scene.add(tick);
    }
  }
  addServiceBays(scene, arena);
}

/** Equipment is built into existing solid cover, never invisible extra blockers. */
function addServiceBays(scene: THREE.Scene, arena: ArenaDefinition): void {
  const shell = new THREE.MeshStandardMaterial({ color: 0x737e83, roughness: .53, metalness: .6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x202d32, roughness: .7, metalness: .45 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x9baca6, roughness: .6, metalness: .45 });
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const batches = new Map<THREE.Material, THREE.Matrix4[]>();
  const instance = new THREE.Object3D();
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    instance.position.set(x, y, z); instance.scale.set(w, h, d); instance.updateMatrix();
    const matrices = batches.get(material) ?? []; matrices.push(instance.matrix.clone()); batches.set(material, matrices);
  };
  for (const side of [-1, 1]) {
    const light = new THREE.MeshBasicMaterial({ color: side < 0 ? 0x71bff1 : 0xe89179 });
    const bench = arena.boxes.find(shape => shape.id === (side < 0 ? 'bench-west' : 'bench-east'))!;
    const front = bench.center.z + bench.size.z / 2;
    // Low supply lockers beneath the planted canopy; team colour is local to the bay.
    for (const offset of [-1.8, 0, 1.8]) {
      const x = bench.center.x + offset;
      box(x, .49, front + .012, 1.45, .62, .024, shell);
      box(x, .48, front + .027, 1.2, .42, .008, dark);
      box(x, .71, front + .034, .55, .045, .012, light);
      box(x + .4, .48, front + .038, .07, .16, .016, trim);
    }
    const label = labelMesh(side < 0 ? 'BLAU / DEPOT' : 'ROT / DEPOT', 3.6);
    label.position.set(bench.center.x, .48, bench.center.z - bench.size.z / 2 - .03);
    label.rotation.y = Math.PI; scene.add(label);
    // Existing flank cover becomes a power cabinet for the adjacent Rail pickup.
    const cabinet = arena.boxes.find(shape => shape.id === `wing-cover-${side}`)!;
    const c = cabinet.center, s = cabinet.size;
    const body = scene.getObjectByName(cabinet.id) as THREE.Mesh;
    // Bevel the visual skin by 4 cm; extents and the existing solid collision stay fixed.
    // The original unit geometry is shared by other boxes and must not be disposed here.
    body.geometry = new RoundedBoxGeometry(s.x, s.y, s.z, 2, .04);
    body.scale.set(1, 1, 1);
    body.material = new THREE.MeshStandardMaterial({ color: 0x39454b, roughness: .68, metalness: .4 });
    box(c.x, .12, c.z, s.x, .24, s.z, dark);
    box(c.x, 1.53, c.z, s.x - .08, .12, s.z - .08, shell);
    // Repeated lid and armour ribs make the same module readable from either camera.
    for (const end of [-1, 1]) {
      box(c.x, .78, c.z + end * (s.z / 2 - .055), s.x - .04, 1.25, .11, shell);
      box(c.x, .78, c.z + end * (s.z / 2 + .002), s.x - .36, .8, .01, dark);
      box(c.x, .95, c.z + end * (s.z / 2 + .01), .64, .05, .012, light);
    }
    for (const sideFace of [-1, 1]) for (const offset of [-1.8, 1.8])
      box(c.x + sideFace * (s.x / 2 - .035), .8, c.z + offset, .07, 1.4, .14, trim);
    // Top access hatches remain readable from the overhead combat camera.
    for (const offset of [-1.35, 1.35]) {
      box(c.x, 1.608, c.z + offset, 1.55, .016, 1.9, dark);
      for (const vent of [-.55, -.28, 0, .28, .55])
        box(c.x, 1.622, c.z + offset + vent, 1.1, .012, .07, trim);
    }
    box(c.x, 1.625, c.z, 1.3, .016, .12, light);
    const faceX = c.x - side * (s.x / 2 + .015);
    box(faceX, .8, c.z, .03, 1.15, 4.5, shell);
    for (const offset of [-1.4, 0, 1.4]) {
      box(faceX - side * .02, .8, c.z + offset, .015, .85, 1.08, dark);
      for (const height of [.55, .73, .91])
        box(faceX - side * .03, height, c.z + offset, .012, .045, .8, trim);
      box(faceX - side * .035, 1.12, c.z + offset, .015, .055, .35, light);
    }
    const railLabel = labelMesh('RAIL / ENERGIE', 2.3);
    railLabel.position.set(c.x, .84, c.z + s.z / 2 + .025); scene.add(railLabel);
    // Inset panels and drainage on the high retaining wall reinforce its full height.
    const high = arena.boxes.find(shape => shape.id === (side < 0 ? 'e2' : 'e2-east'))!;
    for (const offset of [-2.8, 0, 2.8]) {
      const back = high.center.z - high.size.z / 2 - .01;
      box(high.center.x + offset, 2.05, back, 2.2, 3.3, .02, shell);
      box(high.center.x + offset, .4, back - .012, 1.75, .16, .012, dark);
    }
  }
  // Cabinet details share five instance batches, including both team colours.
  for (const [material, matrices] of batches) {
    const mesh = new THREE.InstancedMesh(unit, material, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    // The solid cover already casts the silhouette; millimetre-thin insets need
    // no extra self-shadow pass (and no shadow acne on the cabinet lids).
    mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh);
  }
}
