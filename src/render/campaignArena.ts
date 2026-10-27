import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { MonsterKind } from '../core/pve';
import { createMaterials } from './materials';
import { addGarden } from './garden';

/** The same arena boxes remain the visible and physical cover boundaries. */
export function buildCampaignArena(scene: THREE.Scene, arena: ArenaDefinition, theme: MonsterKind): void {
  const palette = theme === 'stone' ? { floor: 0xb3ac8d, wall: 0xa7a58b, glow: 0xcce69a, dark: 0x1b2925, sky: 0xeaf4ce }
    : theme === 'frost' ? { floor: 0xb4dfef, wall: 0x79adc6, glow: 0x75edff, dark: 0x0c2339, sky: 0xc5e9ff }
      : { floor: 0xc4bdba, wall: 0xb5acaa, glow: 0xff812c, dark: 0x30333c, sky: 0xffecd9 };
  const materials = createMaterials();
  materials.floor.color.setHex(palette.floor); materials.stone.color.setHex(palette.wall);
  materials.metal.color.setHex(palette.wall).multiplyScalar(theme === 'ember' ? 0.78 : 0.4);
  if (theme === 'ember') {
    materials.floor.emissive.setHex(0x3b2920); materials.floor.emissiveIntensity = 0.22;
    materials.stone.roughness = 0.7; materials.metal.roughness = 0.58;
  }
  if (theme === 'frost') { materials.floor.roughness = 0.32; materials.stone.roughness = 0.4; materials.stone.metalness = 0.25; }
  const glow = new THREE.MeshStandardMaterial({ color: palette.glow, emissive: palette.glow, emissiveIntensity: 1.2, roughness: 0.45 });
  const dark = new THREE.MeshStandardMaterial({ color: palette.dark, roughness: 0.9 });
  let lava: THREE.Material = glow;
  if (theme === 'ember') {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!, data = ctx.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const vein = Math.abs(Math.sin(x * 0.13 + Math.sin(y * 0.12) * 2) + Math.cos(y * 0.11 + Math.sin(x * 0.08)));
      const heat = Math.max(0, 1 - vein * 2.5), i = (y * 128 + x) * 4;
      data.data[i] = 48 + heat * 207; data.data[i + 1] = 12 + heat * 106; data.data[i + 2] = 15 + heat * 12; data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(5, 2);
    lava = new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: 0xff802d, emissiveIntensity: 0.7, roughness: 0.7 });
  }
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(unit, material); mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
    mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); return mesh;
  };
  const ring = (x: number, z: number, radius: number, width: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(radius - width, radius, 64), material);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, 0.018, z); scene.add(mesh); return mesh;
  };
  scene.background = new THREE.Color(palette.dark);
  scene.traverse(object => {
    if (object instanceof THREE.HemisphereLight) {
      object.color.setHex(palette.sky); object.groundColor.setHex(palette.dark);
      if (theme === 'ember') object.intensity = 2.5;
    }
    if (object instanceof THREE.DirectionalLight) object.color.setHex(palette.sky);
  });
  if (theme === 'ember') {
    const fill = new THREE.DirectionalLight(0xc2d5f1, 1.7); fill.position.set(12, 22, -18); scene.add(fill);
  }
  // Border beds sit outside the enclosing walls, so decorative terrain is unreachable.
  for (const side of [-1, 1]) {
    box(side * 23.2, -0.05, 0, 2.5, 0.2, 30, theme === 'ember' ? lava : dark);
    box(0, -0.05, side * 15, 49, 0.2, 2, theme === 'ember' ? lava : dark);
  }
  for (const shape of arena.boxes) {
    const { center: c, size: s } = shape;
    const mesh = box(c.x, c.y, c.z, s.x, s.y, s.z, materials[shape.material]); mesh.name = shape.id;
    if (shape.id === 'floor') { mesh.castShadow = false; continue; }
    if (['north', 'south', 'east', 'west'].includes(shape.id)) continue;
    const top = c.y + s.y / 2;
    if (theme === 'stone') {
      // Broken stone courses, aged caps and moss growing over the solid ruins.
      for (let y = 0.4; y < top; y += 0.65) box(c.x, y, c.z + s.z / 2 + 0.008, s.x, 0.025, 0.012, dark);
      box(c.x, top + 0.03, c.z, s.x * 0.98, 0.06, s.z * 0.98, materials.stone);
    } else if (theme === 'frost') {
      box(c.x, top + 0.025, c.z, s.x * 0.97, 0.05, s.z * 0.97, materials.floor);
      for (let i = 0; i < 5; i++) {
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.3 + i % 2 * 0.15, 0.8 + i % 3 * 0.45, 5), i % 2 ? glow : materials.stone);
        crystal.position.set(c.x + Math.sin(i * 2) * s.x * 0.3, top + 0.4, c.z + Math.cos(i * 2) * s.z * 0.3);
        crystal.rotation.z = Math.sin(i) * 0.4; crystal.castShadow = true; scene.add(crystal);
      }
    } else {
      // Bright coping outlines the actual cover boundary against the dark forge.
      box(c.x, top + 0.04, c.z + s.z / 2 - 0.04, s.x, 0.08, 0.09, materials.stone);
      for (const side of [-1, 1]) box(c.x + side * (s.x / 2 - 0.04), top + 0.04, c.z, 0.09, 0.08, s.z, materials.stone);
      for (const side of [-1, 1]) {
        box(c.x + side * (s.x / 2 - 0.12), top / 2, c.z + s.z / 2 + 0.012, 0.24, top, 0.03, materials.metal);
        box(c.x + side * s.x * 0.3, top * 0.6, c.z + s.z / 2 + 0.04, 0.08, top * 0.55, 0.04, glow);
      }
      box(c.x, top + 0.025, c.z, s.x, 0.05, s.z, materials.metal);
    }
  }
  if (theme === 'stone') {
    addGarden(scene, arena);
    ring(0, -1, 5.2, 0.07, materials.brass); ring(0, -1, 5.65, 0.04, materials.brass);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const rune = box(Math.sin(a) * 5.45, 0.025, -1 + Math.cos(a) * 5.45, 0.12, 0.03, 0.28, materials.brass);
      rune.rotation.y = a;
    }
    for (const side of [-1, 1]) {
      // Crumbled courtyard edges and tall silhouettes beyond the playable boundary.
      for (let i = 0; i < 5; i++) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3 + i % 3, 7), materials.stone);
        column.position.set(side * (20.5 - i * 3), (3 + i % 3) / 2, -14.5); column.castShadow = true; scene.add(column);
      }
    }
  } else if (theme === 'frost') {
    for (let i = 0; i < 15; i++) {
      const x = -19 + i * 2.7, z = -11.8 + Math.sin(i * 2.1) * 0.8;
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2 + i % 4, 5), i % 3 ? materials.stone : glow);
      crystal.position.set(x, 0.5 + i % 4 * 0.4, z - 3); crystal.rotation.z = Math.sin(i) * 0.3; scene.add(crystal);
    }
    for (let i = 0; i < 8; i++) {
      const crack = box(-15 + i * 4, 0.015, -7 + i % 3 * 5, 2.8, 0.02, 0.035, materials.trim);
      crack.rotation.y = i * 0.72;
    }
    ring(0, -1, 5.5, 0.045, materials.trim);
  } else {
    for (const x of [-17, -5, 5, 17]) {
      box(x, 0.012, 0, 0.055, 0.02, 24, materials.brass);
      for (let z = -10; z <= 10; z += 4) box(x, 0.025, z, 0.55, 0.025, 0.12, materials.metal);
    }
    for (const side of [-1, 1]) {
      box(side * 18, 2.6, -14.7, 2, 5.2, 2, materials.metal);
      box(side * 18, 5.2, -14.7, 1.3, 0.1, 1.3, glow);
    }
    ring(0, -1, 5.2, 0.18, materials.metal); ring(0, -1, 5.5, 0.045, materials.brass);
  }
}
