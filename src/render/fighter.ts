import * as THREE from 'three';

export function createFighter() {
  const actor = new THREE.Group();
  const armor = new THREE.MeshStandardMaterial({ color: 0xc7c9c3, roughness: 0.48, metalness: 0.45 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x343b42, roughness: 0.65, metalness: 0.3 });
  const visor = new THREE.MeshStandardMaterial({ color: 0x7db9ca, emissive: 0x427a8b, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.5 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    actor.add(mesh);
    return mesh;
  };
  const legs = [-1, 1].map((side) => add(new THREE.CapsuleGeometry(0.13, 0.35, 3, 6), dark, side * 0.18, 0.35, 0));
  add(new THREE.CylinderGeometry(0.31, 0.24, 0.6, 6), armor, 0, 0.96, 0);
  add(new THREE.BoxGeometry(0.4, 0.16, 0.45), dark, 0, 0.68, 0);
  add(new THREE.BoxGeometry(0.34, 0.3, 0.16), dark, 0, 1.05, -0.27);
  add(new THREE.SphereGeometry(0.25, 10, 6), armor, 0, 1.53, 0);
  add(new THREE.BoxGeometry(0.34, 0.09, 0.12), visor, 0, 1.55, 0.21);
  for (const side of [-1, 1]) {
    add(new THREE.SphereGeometry(0.19, 8, 6), armor, side * 0.34, 1.15, 0);
    add(new THREE.CapsuleGeometry(0.095, 0.28, 3, 6), dark, side * 0.36, 0.87, 0.08);
  }
  let phase = 0;
  return {
    actor,
    animate(speed: number, dt: number) {
      phase += speed * dt * 2.2;
      const amount = Math.min(speed / 7.2, 1) * 0.45;
      legs.forEach((leg, i) => { leg.rotation.x = Math.sin(phase + i * Math.PI) * amount; });
    },
  };
}
