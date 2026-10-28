import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import { buildCampaignArena } from './campaignArena';
import { buildCourtyardLook, isFirstCourt, type CourtyardAssets } from './courtyardLook';

/** Shared landmarks; named groups let the encounter switch the sleeping figure and gate. */
export function buildStoneAdventure(scene: THREE.Scene, arena: ArenaDefinition, assets: CourtyardAssets): (dt: number) => void {
  buildCampaignArena(scene, arena, 'stone', { adventure: true, skipShape: isFirstCourt });
  const animateCourt = buildCourtyardLook(scene, arena, assets);
  const rock = new THREE.MeshStandardMaterial({ color: 0x586155, flatShading: true, roughness: .9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c2825, roughness: .95 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc3a66a, metalness: .45, roughness: .6 });
  const core = new THREE.MeshStandardMaterial({ color: 0xe1bf77, emissive: 0xbc772c, emissiveIntensity: .3 });
  const ring = (x: number, z: number, radius: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(radius-.045, radius, 48), material);
    mesh.rotation.x = -Math.PI/2; mesh.position.set(x, .012, z); scene.add(mesh); return mesh;
  };
  ring(0, -29, 3.1, gold); ring(0, -17.2, .9, gold);
  ring(0, -14, .65, new THREE.MeshStandardMaterial({ color: 0x89b9a6, emissive:0x89b9a6, emissiveIntensity:0, roughness: .7 })).name='adventure-checkpoint';
  const exitMarker=ring(0,-46,.85,new THREE.MeshBasicMaterial({color:0x9be8ca}));
  exitMarker.name='adventure-exit-beacon'; exitMarker.visible=false;
  // The dormant figure sits on a solid low foundation with matching collision.
  const dormant = new THREE.Group(); dormant.name = 'adventure-dormant'; scene.add(dormant);
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 2.6), dark);
  foundation.position.set(0, .575, -29); foundation.castShadow = foundation.receiveShadow = true; dormant.add(foundation);
  const chunkGeometry = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 7; i++) {
    const mesh = new THREE.Mesh(chunkGeometry, i === 6 ? core : rock);
    const angle = i * 2.4;
    mesh.position.set(i === 6 ? 0 : Math.sin(angle)*.65, i === 6 ? 1.4 : .8 + i%3*.3,
      -29 + (i === 6 ? .95 : Math.cos(angle)*.65));
    mesh.scale.setScalar(i === 6 ? .23 : .85); mesh.rotation.set(i*.2, angle, .1*i);
    mesh.castShadow = mesh.receiveShadow = true; dormant.add(mesh);
  }
  // Solid backing means the closed gate's collision is visible even between bars.
  const exitGate=new THREE.Group(); exitGate.name='adventure-exit-gate'; scene.add(exitGate);
  for(const side of [-1,1]) {
    const leaf=new THREE.Group(); exitGate.add(leaf);
    const backing = new THREE.Mesh(new THREE.BoxGeometry(5, 2.8, .4), dark);
    backing.position.set(side*2.5,1.4,-42); backing.castShadow=backing.receiveShadow=true; leaf.add(backing);
    for(let i=0;i<8;i++) {
      const bar=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.1),gold);
      bar.position.set(side*(.3+i*.6),1.4,-41.78); leaf.add(bar);
    }
    for(const y of [.5,2.5]) {
      const rail=new THREE.Mesh(new THREE.BoxGeometry(4.8,.13,.12),gold);
      rail.position.set(side*2.5,y,-41.76); leaf.add(rail);
    }
  }
  const entry = new THREE.Group(); entry.name='adventure-entry-gate'; entry.visible=false; scene.add(entry);
  const door = new THREE.Mesh(new THREE.BoxGeometry(10,2.8,.4),dark);
  door.position.set(0,1.4,-18); door.castShadow=door.receiveShadow=true; entry.add(door);
  for(let x=-4.5;x<=4.6;x+=.6) {
    const bar=new THREE.Mesh(new THREE.BoxGeometry(.12,2.5,.5),gold); bar.position.set(x,1.4,-18); entry.add(bar);
  }
  return animateCourt;
}
