import * as THREE from 'three';
import { buildArena } from './buildArena';
import { labelMesh } from './practiceView';
import type { ArenaDefinition } from '../arena/arena';
import { EXPANDED_PICKUPS } from '../arena/expandedArena';

export function buildExpandedArena(scene: THREE.Scene, arena: ArenaDefinition): void {
  buildArena(scene, arena);
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
