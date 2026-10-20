import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import { createMaterials } from './materials';
import { addGarden } from './garden';

export function buildArena(scene: THREE.Scene, arena: ArenaDefinition): void {
  const materials = createMaterials();
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(unit, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  for (const shape of arena.boxes) {
    const { center: c, size: s } = shape;
    const mesh = box(c.x, c.y, c.z, s.x, s.y, s.z, materials[shape.material]);
    mesh.name = shape.id;
    if (shape.id === 'floor') { mesh.castShadow = false; continue; }
    const top = c.y + s.y / 2;
    if (shape.planted) {
      // Decorative insets stay inside the shared visible/collision boundary.
      box(c.x, top + 0.008, c.z, s.x - 0.22, 0.016, s.z - 0.22, materials.soil);
      for (const side of [-1, 1]) {
        box(c.x, top + 0.015, c.z + side * (s.z / 2 - 0.055), s.x, 0.03, 0.11, materials.trim);
        box(c.x + side * (s.x / 2 - 0.055), top + 0.015, c.z, 0.11, 0.03, s.z, materials.trim);
      }
      // Metal base bands make the contact boundary visible.
      box(c.x, 0.14, c.z + s.z / 2 + 0.005, s.x, 0.16, 0.01, materials.metal);
      box(c.x, top * 0.65, c.z + s.z / 2 + 0.008, s.x * 0.6, 0.035, 0.015, materials.brass);
    }
  }
  // Floor inlays and perimeter lights are decoration, not extra walkable geometry.
  for (const z of [-11.5, 11.5]) {
    box(0, 0.008, z, 40, 0.016, 0.035, materials.brass).castShadow = false;
    for (let x = -18; x <= 18; x += 6) {
      box(x, 0.63, Math.sign(z) * 13.38, 0.7, 0.045, 0.02, materials.light).castShadow = false;
    }
  }
  for (const x of [-19.5, 19.5]) box(x, 0.008, 0, 0.035, 0.016, 23, materials.brass).castShadow = false;
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xa4aca6, transparent: true, opacity: 0.18, depthWrite: false });
  for (const x of [-7, 7]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.48, 2.52, 64), ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.012, 2);
    scene.add(ring);
  }
  const lettering = document.createElement('canvas');
  lettering.width = 1024; lettering.height = 128;
  const context = lettering.getContext('2d')!;
  context.fillStyle = '#b6bdb1';
  context.font = '600 55px Segoe UI';
  context.textAlign = 'center';
  context.fillText('O B S I D I A N   / /   0 1', 512, 85);
  const texture = new THREE.CanvasTexture(lettering);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.625),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.28, depthWrite: false }));
  sign.rotation.x = -Math.PI / 2;
  sign.position.set(0, 0.014, 9.8);
  scene.add(sign);
  addGarden(scene, arena);
}
