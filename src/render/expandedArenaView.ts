import * as THREE from 'three';
import { buildArena } from './buildArena';
import { labelMesh } from './practiceView';
import type { ArenaDefinition } from '../arena/arena';
import { EXPANDED_PICKUPS, TEAM_SPAWNS } from '../arena/expandedArena';

export function buildExpandedArena(scene: THREE.Scene, arena: ArenaDefinition): void {
  buildArena(scene, arena);
  // Team bays and route markings sit on existing surfaces, with no hidden collision.
  for (const [id, spawn] of Object.entries(TEAM_SPAWNS)) {
    const blue = id === 'player' || id === 'ally', color = blue ? 0x71bff1 : 0xe89179;
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .65, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.27, 40), material);
    ring.rotation.x = -Math.PI / 2; ring.position.set(spawn.x, .025, spawn.z); scene.add(ring);
    for (const z of [-.65, 0, .65]) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(.35, .12), material);
      stripe.rotation.x = -Math.PI / 2; stripe.position.set(spawn.x + (blue ? 1.6 : -1.6), .025, spawn.z + z); scene.add(stripe);
    }
    const label = labelMesh(blue ? 'BLAU' : 'ROT', 2.2);
    label.rotation.x = -Math.PI / 2; label.position.set(spawn.x, .03, spawn.z + 1.7); scene.add(label);
  }
  for (const shape of arena.boxes.filter(box => box.level)) {
    const body = scene.getObjectByName(shape.id) as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    body.material = body.material.clone(); body.material.color.setHex(shape.id === 'e1' ? 0xc2d1cf : 0xd4c7ad);
    const top = shape.center.y + shape.size.y / 2, front = shape.center.z + shape.size.z / 2;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(shape.size.x, .075, .04),
      new THREE.MeshBasicMaterial({ color: shape.id === 'e1' ? 0x9fd4ca : 0xe9c981 }));
    rim.position.set(shape.center.x, top - .07, front + .025); scene.add(rim);
    const label = labelMesh(shape.id === 'e1' ? 'E1 / MUNITION' : 'E2 / RÜSTUNG', 4.4);
    label.position.set(shape.center.x, top * .52, front + .035); scene.add(label);
    const tickMaterial = new THREE.MeshBasicMaterial({ color: 0xd7dfdb });
    for (let y = .5; y < top - .2; y += .5) {
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(.3, .04), tickMaterial);
      tick.position.set(shape.center.x - shape.size.x / 2 + .35, y, front + .04); scene.add(tick);
    }
  }
  for (const pickup of EXPANDED_PICKUPS.filter(item => item.kind === 'rail')) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshStandardMaterial({
      color: 0x363b3d, metalness: .6, roughness: .5, polygonOffset: true, polygonOffsetFactor: -1,
    }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(pickup.position.x, .02, pickup.position.z);
    scene.add(pad);
    const border = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.6, 3.6)),
      new THREE.LineBasicMaterial({ color: 0xe5bc78 }));
    border.rotation.x = -Math.PI / 2; border.position.copy(pad.position).y += .01; scene.add(border);
    const label = labelMesh(pickup.position.x < 0 ? 'WESTFLANKE' : 'OSTFLANKE', 4);
    label.rotation.x = -Math.PI / 2; label.position.set(pickup.position.x, .03, pickup.position.z + 2.4); scene.add(label);
  }
}
