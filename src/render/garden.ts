import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';

export function addGarden(scene: THREE.Scene, arena: ArenaDefinition): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, -0.22, 0.4, 0.12, 0, 0.5, 0.2, 0.22, 0.4, 0.12,
    -0.24, 0.85, 0.36, 0, 0.9, 0.48, 0.24, 0.85, 0.36, 0, 1.25, 0.65,
  ], 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3, 1, 4, 5, 1, 5, 2, 2, 5, 6, 2, 6, 3, 4, 7, 5, 5, 7, 6]);
  geometry.computeVertexNormals();
  const plants = arena.boxes.filter((box) => box.planted);
  const count = plants.reduce((sum, box) => sum + Math.ceil(box.size.x * box.size.z * 1.5) * 5, 0);
  const leaves = new THREE.InstancedMesh(geometry,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, side: THREE.DoubleSide }), count);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  let seed = 3219, index = 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const dummy = new THREE.Object3D();
  const shades = [0x2f6632, 0x3e7838, 0x4f8042, 0x315c30].map((hex) => new THREE.Color(hex));
  for (const box of plants) {
    const clusters = Math.ceil(box.size.x * box.size.z * 1.5);
    for (let plant = 0; plant < clusters; plant++) {
      const x = box.center.x + (random() - 0.5) * Math.max(0.1, box.size.x - 0.5);
      const z = box.center.z + (random() - 0.5) * Math.max(0.1, box.size.z - 0.5);
      const y = box.center.y + box.size.y / 2 + 0.015;
      const scale = 0.65 + random() * 0.6;
      for (let leaf = 0; leaf < 5; leaf++) {
        dummy.position.set(x, y, z);
        dummy.rotation.set(random() * 0.35, leaf * Math.PI * 2 / 5 + random(), (random() - 0.5) * 0.45);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        leaves.setMatrixAt(index, dummy.matrix);
        leaves.setColorAt(index, shades[Math.floor(random() * shades.length)]!);
        index++;
      }
    }
  }
  leaves.computeBoundingSphere();
  scene.add(leaves);
}
