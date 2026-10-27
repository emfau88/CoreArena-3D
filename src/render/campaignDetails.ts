import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { MonsterKind } from '../core/pve';

/** Surface dressing stays flush with collision geometry; tall scenery stays outside the walls. */
export function addCampaignDetails(scene: THREE.Scene, arena: ArenaDefinition, theme: MonsterKind): (dt: number) => void {
  let seed = 7183;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const stone = theme === 'stone', frost = theme === 'frost';
  const floor = scene.getObjectByName('floor') as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  const canvas = document.createElement('canvas'); canvas.width = 1408; canvas.height = 896;
  const ctx = canvas.getContext('2d')!;
  const source = floor.material.map!;
  // Bake into the actual opaque floor albedo, keeping its mortar and lighting.
  const tileW = canvas.width / source.repeat.x, tileH = canvas.height / source.repeat.y;
  for (let y = 0; y < source.repeat.y; y++) for (let x = 0; x < source.repeat.x; x++) {
    ctx.drawImage(source.image as HTMLCanvasElement, x * tileW, y * tileH, tileW, tileH);
  }
  ctx.scale(32, 32); ctx.translate(22, 14);
  for (let i = 0; i < 70; i++) {
    const x = (random() - 0.5) * 43, z = (random() - 0.5) * 25;
    if (Math.abs(x) < 5 || Math.hypot(x, z + 1) < 4) continue;
    const radius = 0.5 + random() * 1.3;
    ctx.save(); ctx.beginPath();
    for (let j = 0; j < 24; j++) {
      const angle = j / 24 * Math.PI * 2, r = radius * (0.5 + random() * 0.5);
      const px = x + Math.cos(angle) * r, pz = z + Math.sin(angle) * r * 0.7;
      if (j === 0) ctx.moveTo(px, pz); else ctx.lineTo(px, pz);
    }
    ctx.closePath(); ctx.clip();
    ctx.fillStyle = stone ? '#52613b38' : frost ? '#c3dce64a' : '#302c2945';
    ctx.fillRect(x - radius, z - radius, radius * 2, radius * 2);
    for (let j = 0; j < 170; j++) {
      ctx.fillStyle = stone ? (j % 2 ? '#7c8c4d50' : '#30422b60') : frost ? '#e4f3f34a' : '#bd997b30';
      const size = 0.015 + random() * 0.045;
      ctx.fillRect(x + (random() - 0.5) * radius * 2, z + (random() - 0.5) * radius * 2, size, size);
    }
    ctx.restore();
  }
  for (let i = 0; i < 45; i++) {
    const x = (random() - 0.5) * 42, z = (random() - 0.5) * 24;
    ctx.strokeStyle = frost ? '#bcecff48' : stone ? '#383c3050' : '#e6bc7b30';
    ctx.lineWidth = frost ? 0.035 : 0.025;
    ctx.beginPath(); ctx.moveTo(x, z); ctx.lineTo(x + 0.4, z + 0.6); ctx.lineTo(x + 0.2, z + 1.1);
    ctx.lineTo(x + 1, z + 1.8); ctx.moveTo(x + 0.4, z + 0.6); ctx.lineTo(x + 1, z + 0.5); ctx.stroke();
  }
  // Worn procession stones / ice facets / riveted service panels give the floor a larger rhythm.
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const x = side * 14, z = -10 + i * 4;
    ctx.fillStyle = stone ? '#d1c8a514' : frost ? '#b1e9fb18' : '#72808a30';
    ctx.strokeStyle = stone ? '#46463440' : frost ? '#e3fcff30' : '#171e2865'; ctx.lineWidth = 0.035;
    ctx.beginPath(); ctx.moveTo(x - 1.3, z - 1.4); ctx.lineTo(x + 1.2, z - 1.1);
    ctx.lineTo(x + 1.4, z + 1.4); ctx.lineTo(x - 1.4, z + 1.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (!stone && !frost) for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
      ctx.fillStyle = '#d2b582a0'; ctx.beginPath(); ctx.arc(x + dx, z + dz, 0.065, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (stone) {
    // Worn inlaid waystones lead from the weapon towards the west healing steps.
    ctx.strokeStyle = '#b5b69865'; ctx.fillStyle = '#858d6228'; ctx.lineWidth = 0.045;
    for (let x = -5.5; x >= -13; x -= 1.25) {
      ctx.fillRect(x - 0.3, 7.85, 0.6, 0.7); ctx.strokeRect(x - 0.3, 7.85, 0.6, 0.7);
    }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  floor.material = floor.material.clone(); floor.material.map = texture;

  const masonry = new THREE.MeshStandardMaterial({ color: stone ? 0x777e58 : frost ? 0x7fbaca : 0x5b5b60, roughness: 0.85 });
  const pale = new THREE.MeshStandardMaterial({ color: stone ? 0xbfb68d : frost ? 0xd7eff2 : 0xa6a5a0, roughness: 0.7 });
  const vegetation = new THREE.MeshStandardMaterial({ color: 0x426c36, roughness: 1 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x41474b, metalness: 0.7, roughness: 0.55 });
  const glow = new THREE.MeshStandardMaterial({ color: frost ? 0x85dcec : stone ? 0xbcd58d : 0xffac49,
    emissive: frost ? 0x3387a0 : stone ? 0x839840 : 0xff6516, emissiveIntensity: 0.8 });
  // Batch repeated dressing into instanced draws, including the little masonry and grille pieces.
  const cube = new THREE.BoxGeometry(1, 1, 1), shard = new THREE.ConeGeometry(0.5, 1, 5);
  const leaf = new THREE.IcosahedronGeometry(0.5, 0), cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  const batches = new Map<THREE.BufferGeometry, Map<THREE.Material, THREE.Matrix4[]>>();
  const dummy = new THREE.Object3D();
  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number,
    sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0) => {
    dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(rx, ry, rz); dummy.updateMatrix();
    if (!batches.has(geo)) batches.set(geo, new Map());
    const materials = batches.get(geo)!;
    if (!materials.has(mat)) materials.set(mat, []);
    materials.get(mat)!.push(dummy.matrix.clone());
  };
  for (const block of arena.boxes) {
    if (['floor', 'north', 'south', 'east', 'west'].includes(block.id)) continue;
    const { center: c, size: s } = block, top = c.y + s.y / 2, front = c.z + s.z / 2;
    if (stone) {
      // Mortar joints, inset crest and ivy trailing down the existing solid faces.
      for (let row = 0.25; row < top; row += 0.6) for (let x = -s.x / 2 + 0.4; x < s.x / 2; x += 0.8) {
        part(cube, masonry, c.x + x, row, front + 0.012, 0.025, 0.5, 0.02);
      }
      part(cube, pale, c.x, top * 0.58, front + 0.04, 0.5, 0.5, 0.06, 0, 0, Math.PI / 4);
      part(cube, masonry, c.x, top * 0.58, front + 0.08, 0.22, 0.22, 0.035, 0, 0, Math.PI / 4);
      for (let vine = 0; vine < Math.ceil(s.x); vine++) {
        const x = c.x + (random() - 0.5) * (s.x - 0.2), length = 2 + Math.floor(random() * 5);
        for (let j = 0; j < length; j++) part(leaf, vegetation, x + Math.sin(j * 1.8) * 0.1,
          top - j * 0.14, front + 0.06, 0.3, 0.22, 0.1, 0, 0, j);
      }
    } else if (frost) {
      // Snow shelves and translucent-looking facets anchored to the cover face.
      part(cube, pale, c.x, top - 0.06, front + 0.015, s.x, 0.14, 0.09);
      for (let i = 0; i < Math.ceil(s.x * 2); i++) {
        const h = 0.2 + random() * 0.65;
        part(shard, i % 3 ? pale : glow, c.x - s.x / 2 + 0.2 + i * 0.46, top - h / 2,
          front + 0.06, 0.14, h, 0.14, Math.PI);
      }
      for (let i = 0; i < 4; i++) part(cube, pale, c.x + (random() - 0.5) * s.x * 0.8,
        top * (0.2 + random() * 0.5), front + 0.018, 0.025, top * 0.5, 0.02, 0, 0, 0.5);
    } else {
      // Furnace mouths inset into the cover, barred vents, heavy collars and rivets.
      part(cube, metal, c.x, top * 0.42, front + 0.025, s.x * 0.7, top * 0.55, 0.06);
      part(cube, glow, c.x, top * 0.42, front + 0.061, s.x * 0.54, top * 0.32, 0.025);
      for (let i = -2; i <= 2; i++) part(cube, metal, c.x + i * s.x * 0.1,
        top * 0.42, front + 0.085, 0.1, top * 0.4, 0.07);
      for (const side of [-1, 1]) {
        part(cube, metal, c.x, top * (side < 0 ? 0.1 : 0.87), front + 0.025, s.x, 0.12, 0.06);
        for (let i = -2; i <= 2; i++) part(leaf, pale, c.x + i * s.x * 0.2,
          top * (side < 0 ? 0.1 : 0.87), front + 0.08, 0.1, 0.1, 0.06);
      }
      // Pipes run along the side, within the existing cover footprint.
      part(cylinder, metal, c.x + s.x / 2 - 0.1, top * 0.55, c.z, 0.2, s.z * 0.9, 0.2, Math.PI / 2);
    }
  }
  // Layered silhouettes along the inaccessible rim: avoid fake cover on walkable ground.
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const x = side * (22.9 + random() * 0.6), z = -12 + i * 3, h = 0.8 + random() * 2;
    if (stone) {
      part(cube, masonry, x, h / 2, z, 0.9, h, 1, 0, random(), 0.08);
      for (let j = 0; j < 3; j++) part(leaf, vegetation, x, h + j * 0.2, z, 1.5, 0.7, 1.6, 0, j, 0);
      part(cube, pale, side * 22.4, 0.12, z + 0.7, 0.5, 0.24, 0.7, 0, 0.5, 0);
    } else if (frost) {
      for (let j = 0; j < 3; j++) part(shard, j === 0 ? glow : masonry,
        x + (j - 1) * 0.3, h / 2, z + j * 0.3, 0.65, h, 0.8, 0.1, j, side * 0.2);
      part(leaf, pale, x, 0.08, z, 2, 0.25, 2.4);
    } else {
      part(cube, metal, x, 0.15, z, 1.8, 0.3, 1.6);
      part(cylinder, masonry, x, 0.7, z, 0.7, 1.2, 0.7);
      part(cylinder, glow, x, 1.31, z, 0.48, 0.035, 0.48);
      for (let j = 0; j < 3; j++) part(leaf, metal, x + (j - 1) * 0.4, 0.2, z + 0.6, 0.7, 0.5, 0.7, 0, j, 0);
    }
  }
  for (const [geometry, materials] of batches) for (const [material, matrices] of materials) {
    const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.castShadow = mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh);
  }
  // One instanced draw for restrained floating pollen, falling snow, or rising embers.
  const count = 64, particles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshBasicMaterial({ color: stone ? 0xd2e4ac : frost ? 0xe3faff : 0xffb35e,
      transparent: true, opacity: frost ? 0.55 : 0.65, depthWrite: false }), count);
  particles.frustumCulled = false; scene.add(particles);
  const seeds = Array.from({ length: count }, () => ({ x: (random() - 0.5) * 42,
    z: (random() - 0.5) * 25, phase: random() * 6, speed: 0.3 + random() * 0.4 }));
  let time = 0;
  return dt => {
    time += Math.min(dt, 0.05);
    glow.emissiveIntensity = (frost ? 0.7 : 0.85) + Math.sin(time * (frost ? 0.8 : 3)) * 0.12;
    seeds.forEach((p, i) => {
      const cycle = (p.phase + time * p.speed) % 6;
      const y = frost ? 6 - cycle : stone ? 0.7 + Math.sin(time * 0.7 + p.phase) * 0.5 : cycle * 0.6;
      dummy.position.set(p.x + Math.sin(time * 0.4 + p.phase) * 0.35, y, p.z);
      dummy.rotation.set(0, time + p.phase, 0); dummy.scale.setScalar(frost ? 0.035 : 0.025);
      dummy.updateMatrix(); particles.setMatrixAt(i, dummy.matrix);
    });
    particles.instanceMatrix.needsUpdate = true;
  };
}
