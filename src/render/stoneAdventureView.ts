import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import { buildCampaignArena } from './campaignArena';

/** Quiet landmarks for the walkable layout; no boss/encounter simulation yet. */
export function buildStoneAdventure(scene: THREE.Scene, arena: ArenaDefinition): void {
  buildCampaignArena(scene, arena, 'stone', { adventure: true });
  const rock = new THREE.MeshStandardMaterial({ color: 0x586155, flatShading: true, roughness: .9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c2825, roughness: .95 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc3a66a, metalness: .45, roughness: .6 });
  const core = new THREE.MeshStandardMaterial({ color: 0xe1bf77, emissive: 0xbc772c, emissiveIntensity: .3 });
  const ring = (x: number, z: number, radius: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(radius-.045, radius, 48), material);
    mesh.rotation.x = -Math.PI/2; mesh.position.set(x, .012, z); scene.add(mesh);
  };
  ring(0, -29, 3.1, gold); ring(0, -17.2, .9, gold);
  ring(0, -14, .65, new THREE.MeshStandardMaterial({ color: 0x89b9a6, roughness: .7 }));
  // The dormant figure sits on a solid low foundation with matching collision.
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 2.6), dark);
  foundation.position.set(0, .575, -29); foundation.castShadow = foundation.receiveShadow = true; scene.add(foundation);
  const chunkGeometry = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 7; i++) {
    const mesh = new THREE.Mesh(chunkGeometry, i === 6 ? core : rock);
    const angle = i * 2.4;
    mesh.position.set(i === 6 ? 0 : Math.sin(angle)*.65, i === 6 ? 1.4 : .8 + i%3*.3,
      -29 + (i === 6 ? .95 : Math.cos(angle)*.65));
    mesh.scale.setScalar(i === 6 ? .23 : .85); mesh.rotation.set(i*.2, angle, .1*i);
    mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
  }
  // Solid backing means the closed gate's collision is visible even between bars.
  const backing = new THREE.Mesh(new THREE.BoxGeometry(10, 2.8, .4), dark);
  backing.position.set(0, 1.4, -42); backing.castShadow = backing.receiveShadow = true; scene.add(backing);
  for (let x = -4.5; x <= 4.6; x += .6) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.4, .1), gold);
    bar.position.set(x, 1.4, -41.78); scene.add(bar);
  }
  for (const y of [.5, 2.5]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(9.5, .13, .12), gold);
    rail.position.set(0, y, -41.76); scene.add(rail);
  }
}
