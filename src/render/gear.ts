import * as THREE from 'three';
import type { WeaponId } from '../core/combat';
import type { PickupDefinition } from '../core/pickups';

export function createWeaponModel(kind: WeaponId): THREE.Group {
  const group = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0x8e9ca9, metalness: 0.75, roughness: 0.3 });
  const grip = new THREE.MeshStandardMaterial({ color: 0x17212d, metalness: 0.4, roughness: 0.6 });
  const energy = new THREE.MeshStandardMaterial({ color: kind === 'arc' ? 0xd6a6ff : 0x9feeff,
    emissive: kind === 'arc' ? 0x9e47ff : 0x26b8ff, emissiveIntensity: 1.6, roughness: 0.2 });
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); mesh.position.set(x, y, z); mesh.castShadow = true; group.add(mesh);
  };
  box(0, 0, 0, 0.25, 0.2, 0.55, shell); box(0, -0.15, -0.12, 0.14, 0.25, 0.16, grip);
  box(0, 0.13, -0.08, 0.13, 0.06, 0.2, energy); box(0, 0, -0.34, 0.22, 0.13, 0.2, grip);
  if (kind === 'pulse') {
    box(0, 0, 0.45, 0.12, 0.12, 0.46, grip); box(0, 0, 0.7, 0.17, 0.17, 0.06, energy);
    box(0, -0.12, 0.12, 0.18, 0.24, 0.2, grip);
    for (const side of [-1, 1]) box(side * 0.132, 0.03, 0.08, 0.025, 0.04, 0.35, energy);
  } else {
    for (const side of [-1, 1]) {
      box(side * 0.16, 0, 0.34, 0.075, 0.12, 0.4, shell);
      box(side * 0.16, 0, 0.55, 0.08, 0.13, 0.09, energy);
    }
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 6, 12), energy); coil.position.z = 0.25; group.add(coil);
  }
  return group;
}

export function createPickupModel(kind: PickupDefinition['kind']): THREE.Group {
  const group = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0xb5c4cc, roughness: 0.35, metalness: 0.65 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x192833, roughness: 0.45, metalness: 0.6 });
  const color = kind === 'health' ? 0x88efb9 : kind === 'armor' ? 0xf4c987 : 0x74d8ff;
  const glow = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, roughness: 0.3 });
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); mesh.castShadow = true; group.add(mesh);
  };
  if (kind === 'pulse') {
    const gun = createWeaponModel('pulse'); gun.rotation.y = Math.PI / 2; gun.scale.setScalar(1.25); group.add(gun);
  } else if (kind === 'health') {
    box(0, 0, 0, 0.76, 0.46, 0.52, shell);
    for (const side of [-1, 1]) box(side * 0.3, 0, 0, 0.12, 0.5, 0.56, dark);
    box(0, 0.245, 0, 0.13, 0.025, 0.34, glow); box(0, 0.245, 0, 0.34, 0.025, 0.13, glow);
    box(0, 0, 0.265, 0.12, 0.3, 0.02, glow); box(0, 0, 0.265, 0.3, 0.1, 0.02, glow);
    box(0, 0.33, 0, 0.3, 0.08, 0.12, dark);
  } else if (kind === 'ammo') {
    box(0, -0.2, 0, 0.76, 0.12, 0.44, dark);
    for (const x of [-0.25, 0, 0.25]) {
      const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.52, 8), shell); cell.position.x = x; group.add(cell);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.25, 8), glow); core.position.x = x; group.add(core);
      box(x, 0.3, 0, 0.1, 0.08, 0.1, dark);
    }
  } else {
    const shape = new THREE.Shape(); shape.moveTo(-0.4, 0.35); shape.lineTo(0.4, 0.35); shape.lineTo(0.32, -0.18); shape.lineTo(0, -0.48); shape.lineTo(-0.32, -0.18); shape.closePath();
    const shield = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.025, bevelSegments: 1, steps: 1 }), shell);
    shield.rotation.x = -Math.PI / 3; group.add(shield);
    box(0, 0.13, 0.08, 0.1, 0.08, 0.55, glow); box(0, 0.14, 0.08, 0.42, 0.08, 0.1, glow);
  }
  return group;
}
