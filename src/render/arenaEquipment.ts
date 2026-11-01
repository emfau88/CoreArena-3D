import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { WeaponId } from '../core/combat';

export type ArenaRole = 'player' | 'wingman' | 'rival';
export const ARENA_WEAPON_COLORS = { arc: 0xcba5ff, pulse: 0x87d9fa, rail: 0x65ed7d };

/** Three deliberately different silhouettes; origin is the trigger grip, forward is +Z. */
export function createArenaWeapon(kind: WeaponId): THREE.Group {
  const root = new THREE.Group(); root.name = `arena-weapon-${kind}`;
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x91a5ad, metalness: .65, roughness: .4 }),
    new THREE.MeshStandardMaterial({ color: 0x26343d, metalness: .35, roughness: .7 }),
    new THREE.MeshStandardMaterial({ color: ARENA_WEAPON_COLORS[kind], emissive: ARENA_WEAPON_COLORS[kind], emissiveIntensity: .75, roughness: .4 }),
  ];
  const parts: THREE.BufferGeometry[][] = [[], [], []];
  const add = (material: number, geometry: THREE.BufferGeometry, x: number, y: number, z: number) => {
    geometry.translate(x, y, z); parts[material]!.push(geometry);
  };
  const box = (m: number, w: number, h: number, d: number, x: number, y: number, z: number) =>
    add(m, new THREE.BoxGeometry(w, h, d), x, y, z);
  box(1, .13, .24, .16, 0, -.04, 0); // Trigger grip held by the authored hand slot.
  box(0, .25, .21, .45, 0, .13, .09);
  if (kind === 'arc') {
    // Short, wide fork and exposed circular emitter. No rifle stock or long barrel.
    box(1, .3, .16, .2, 0, .13, .36);
    add(2, new THREE.TorusGeometry(.17, .045, 6, 12), 0, .13, .46);
    for (const side of [-1, 1]) {
      box(0, .095, .16, .33, side * .23, .13, .43);
      box(2, .1, .13, .08, side * .23, .13, .63);
    }
  } else if (kind === 'pulse') {
    // Compact repeater with a box magazine, shoulder stock and single muzzle.
    box(1, .17, .2, .35, 0, .11, -.28);
    box(0, .22, .28, .1, 0, .11, -.48);
    box(1, .2, .32, .22, 0, -.07, .29);
    box(0, .19, .17, .48, 0, .13, .5);
    box(2, .2, .19, .06, 0, .13, .76);
    for (const side of [-1, 1]) box(2, .025, .06, .4, side * .138, .17, .18);
  } else {
    // One long barrel and one green muzzle; no twin-barrel silhouette.
    box(1, .24, .24, .45, 0, .13, -.28);
    box(0, .27, .27, .1, 0, .13, -.52);
    const barrel = new THREE.CylinderGeometry(.095, .11, 1.05, 8); barrel.rotateX(Math.PI / 2);
    add(0, barrel, 0, .15, .69);
    box(2, .035, .025, .82, 0, .25, .69);
    add(2, new THREE.TorusGeometry(.1, .025, 6, 12), 0, .15, 1.22);
    box(1, .12, .12, .025, 0, .15, 1.22);
    box(1, .13, .12, .3, 0, .31, .12);
    box(2, .08, .06, .02, 0, .31, .28);
  }
  // Three material batches per weapon instead of a draw call per detail.
  parts.forEach((list, i) => {
    const mesh = new THREE.Mesh(mergeGeometries(list)!, materials[i]);
    list.forEach(g => g.dispose()); mesh.castShadow = mesh.receiveShadow = true; root.add(mesh);
  });
  return root;
}

/** Owned meshes on the existing bones; no collider, source GLB or Adventure changes. */
export function applyArenaLook(body: THREE.Object3D, role: ArenaRole): void {
  const blue = role !== 'rival', paint = blue ? 0x6aaed2 : 0xcf7965;
  const original = new Set<THREE.Material>(), skins = new Map<string, THREE.MeshStandardMaterial>();
  body.traverse(object => {
    if (!(object instanceof THREE.SkinnedMesh)) return;
    const source = object.material as THREE.MeshStandardMaterial;
    original.add(source);
    const part = object.name.includes('Head') ? 'head' : object.name.includes('Body') ? 'body' : 'limbs';
    if (!skins.has(part)) {
      const mat = source.clone(); mat.color.setHex(0xffffff);
      const colour = new THREE.Color(part === 'head' ? role === 'player' ? 0xf0e6cf : paint : part === 'body' ? 0x8a9b9f : 0x586a76);
      // Replace the mannequin's red/blue atlas paint, retaining dark seams and face details.
      mat.onBeforeCompile = shader => {
        shader.uniforms.arenaPaint = { value: colour };
        shader.uniforms.arenaHelmet = { value: part === 'head' ? 1 : 0 };
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
          '#include <common>\nuniform vec3 arenaPaint;\nuniform float arenaHelmet;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
          float arenaHi=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
          float arenaLo=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
          float arenaMask=mix(smoothstep(.03,.12,arenaHi-arenaLo),smoothstep(.08,.28,arenaHi),arenaHelmet);
          diffuseColor.rgb=mix(diffuseColor.rgb,arenaPaint*mix(.6,1.,clamp(arenaHi*2.,0.,1.)),arenaMask);
        `);
      };
      mat.customProgramCacheKey = () => 'arena-palette-v1';
      mat.roughness = .75; mat.metalness = .1; skins.set(part, mat);
    }
    object.material = skins.get(part)!;
  });
  original.forEach(m => m.dispose()); // Textures are retained by the replacement skins.
  const team = new THREE.MeshStandardMaterial({ color: paint, metalness: .35, roughness: .55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x26343f, metalness: .35, roughness: .6 });
  const pale = new THREE.MeshStandardMaterial({ color: role === 'player' ? 0xf5e8c9 : 0xb3c8cc, metalness: .3, roughness: .5 });
  const visor = new THREE.MeshStandardMaterial({ color: blue ? 0xa0e7ef : 0xffd0a0, emissive: blue ? 0x3a8c9c : 0x9e563b, emissiveIntensity: .5, roughness: .3 });
  const box = (bone: string, material: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, bevel = .025) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 1, bevel), material);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true;
    body.getObjectByName(bone)!.add(mesh); return mesh;
  };
  box('head', team, .75, .18, .67, 0, .92, 0);
  box('head', dark, .62, .18, .1, 0, .43, .49);
  box('head', visor, .45, .04, .025, 0, .46, .548, .008);
  for (const side of [-1, 1]) {
    box('head', team, .13, .34, .35, side * .36, .56, -.04);
    box(side < 0 ? 'upperarmr' : 'upperarml', team, .32, .23, .33, 0, .045, 0);
  }
  box('chest', team, .54, .36, .16, 0, -.11, .23);
  box('chest', dark, .19, .12, .025, 0, -.1, .32, .01);
  box('chest', dark, .38, .4, .15, 0, -.12, -.24);
  if (role === 'player') {
    box('head', pale, .13, .025, .61, 0, 1.023, 0, .008);
    box('chest', pale, .06, .18, .03, 0, -.11, .34, .008);
  } else if (role === 'wingman') {
    for (const side of [-1, 1]) {
      box('head', pale, .065, .13, .24, side * .17, 1.05, -.08, .01);
      box('chest', pale, .045, .12, .03, side * .07, -.11, .34, .008);
    }
  }
}
