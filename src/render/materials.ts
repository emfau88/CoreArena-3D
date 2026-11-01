import * as THREE from 'three';

function grainTexture(pavers: boolean, refined = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const pixels = ctx.createImageData(512, 512);
  let seed = 8129;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = (pavers ? refined ? 124 : 98 : 139) + (random() - 0.5) * (refined ? 14 : 26);
    pixels.data[i] = value;
    pixels.data[i + 1] = value + 2;
    pixels.data[i + 2] = value + 3;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  if (pavers) {
    for (let row = -1; row < 5; row++) {
      for (let col = -1; col < 5; col++) {
        const x = col * 128 + (row % 2 ? 64 : 0), y = row * 128;
        ctx.fillStyle = `rgba(0,0,0,${random() * (refined ? 0.045 : 0.14)})`;
        ctx.fillRect(x + 3, y + 3, 122, 122);
        ctx.strokeStyle = refined ? '#666c6d' : '#26292b';
        ctx.lineWidth = refined ? 1.2 : 3;
        ctx.strokeRect(x + 1.5, y + 1.5, 125, 125);
        ctx.strokeStyle = refined ? '#c4c8c41c' : '#b1b4b430';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 121);
        ctx.lineTo(x + 5, y + 5);
        ctx.lineTo(x + 121, y + 5);
        ctx.stroke();
      }
    }
  }
  if (refined) {
    // Quiet mineral mottling, deterministic and local: no extra texture download.
    for (let i = 0; i < 220; i++) {
      const x = random() * 512, y = random() * 512, radius = 6 + random() * 35;
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloud.addColorStop(0, i % 2 ? '#d9dbce08' : '#212b2b08'); cloud.addColorStop(1, '#00000000');
      ctx.fillStyle = cloud; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(pavers ? 5.5 : 1, pavers ? 3.5 : 1);
  texture.anisotropy = 8;
  return texture;
}

export function createMaterials(refined = false) {
  const pavers = grainTexture(true, refined), stone = grainTexture(false, refined);
  return {
    floor: new THREE.MeshStandardMaterial({ map: pavers, bumpMap: pavers, bumpScale: 0.035, color: 0xb1b6b9, roughness: 0.95, metalness: 0.04 }),
    stone: new THREE.MeshStandardMaterial({ map: stone, bumpMap: stone, bumpScale: 0.025, color: 0xb8baba, roughness: 0.86, metalness: 0.1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x363c43, roughness: 0.48, metalness: 0.7 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x979c9b, roughness: 0.45, metalness: 0.7 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xa48a5c, roughness: 0.56, metalness: 0.65 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x252b22, roughness: 1 }),
    light: new THREE.MeshBasicMaterial({ color: 0xc3dce0 }),
  };
}
export type ArenaMaterials = ReturnType<typeof createMaterials>;
