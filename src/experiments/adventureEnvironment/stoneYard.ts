import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {CourtyardAssets} from '../../render/courtyardLook';
import type {CornerPiece} from './retainingCorner';

type Placement = readonly [x: number, y: number, z: number, scale: number, rotation: number];

/** Scenery below the arrival court. The playable court uses the reference builder. */
export function buildStoneYard(scene: THREE.Scene, assets: CourtyardAssets, ground: 'terraces' | 'bank' = 'terraces',
  extraMasonry?: (emit: CornerPiece) => void): void {
  const yard = new THREE.Group();
  yard.name = 'lower-stone-yard';
  scene.add(yard);

  const masonry = new THREE.MeshStandardMaterial({
    ...assets.wall, vertexColors: true, roughness: 1, normalScale: new THREE.Vector2(.45, .45),
  });
  const paving = new THREE.MeshStandardMaterial({
    ...assets.floor, vertexColors: true, roughness: 1, normalScale: new THREE.Vector2(.4, .4),
  });
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  function add(geometry: THREE.BufferGeometry, material: THREE.Material, tint: number) {
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const uv = geometry.getAttribute('uv');
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color(tint);
    const metres = material === paving ? 4 : 2;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
      const top = ny >= nx && ny >= nz;
      uv.setXY(i, (top || nz >= nx ? x : z) / metres, (top ? -z : y) / metres);
      color.toArray(colors, i * 3);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const batch = batches.get(material) ?? [];
    batch.push(geometry);
    batches.set(material, batch);
  }
  function block(x: number, y: number, z: number, width: number, height: number, depth: number,
    material: THREE.Material, tint: number, rotation = 0) {
    const indexed = new THREE.BoxGeometry(width, height, depth);
    const geometry = indexed.toNonIndexed();
    indexed.dispose();
    add(geometry.rotateY(rotation).translate(x, y, z), material, tint);
  }

  // The retaining face joins the underside of the existing floor. All exterior
  // decks and arch crowns sit down in the lower court.
  block(0, -6.6, 27, 31.96, 12.35, 21.96, masonry, 0x929381);
  if (ground === 'terraces') block(0, -12.8, 39, 79, .6, 60, paving, 0x677063);
  for (const side of ground === 'terraces' ? [-1, 1] : []) {
    block(side * 25.2, -11.45, 29, 8.4, 2.1, 29, masonry, 0x868875);
    block(side * 25.2, -10.31, 29, 8.46, .18, 29.08, paving, 0x969884);
    // Runs of masonry end at different heights; the gaps collect fallen stone.
    for (const [z, length, height] of [[20.7, 5.3, 1.45], [26, 3.1, .65], [35.1, 8.7, 1.1]] as const) {
      block(side * 21.45, -10.22 + height / 2, z, .8, height, length, masonry, 0x929380);
      block(side * 21.45, -10.14 + height, z, .86, .16, length + .06, paving, 0xa1a08a);
    }
  }

  // An old arched service crossing behind the arrival wall. The open arches,
  // jointed ring stones and broken parapet are visible from the side camera.
  const spring = -11.34, front = -3, radius = 1.08, span = 3.24;
  function archPiece(shape: THREE.Shape, depth: number, face: number, z: number, tint: number) {
    const geometry = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: false, curveSegments: 12});
    add(geometry.rotateY(-Math.PI / 2).translate(face, spring, z), masonry, tint);
  }
  for (const z of [40.9, 40.9 + span, 40.9 + 2 * span]) {
    const face = new THREE.Shape();
    face.moveTo(-span / 2, 0);
    face.lineTo(-radius, 0);
    face.absarc(0, 0, radius, Math.PI, 0, true);
    face.lineTo(span / 2, 0);
    face.lineTo(span / 2, 1.72);
    face.lineTo(-span / 2, 1.72);
    face.closePath();
    archPiece(face, 2.3, front, z, 0xa6a38f);
    for (const side of [-1, 1]) {
      const pierWidth = span / 2 - radius;
      block(front - 1.15, spring - .58, z + side * (radius + pierWidth / 2),
        2.3, 1.16, pierWidth, masonry, 0x90917e);
    }
    for (let i = 0; i < 9; i++) {
      const start = i * Math.PI / 9 + .012, end = (i + 1) * Math.PI / 9 - .012;
      const ring = new THREE.Shape();
      ring.absarc(0, 0, radius + .26, start, end, false);
      ring.absarc(0, 0, radius, end, start, true);
      ring.closePath();
      archPiece(ring, .12, front + .1, z, i % 3 === 1 ? 0xb2af97 : 0xa4a38e);
    }
    block(front - 1.15, spring + 1.82, z, 2.44, .2, span - .025, paving, 0xb0ad97);
  }
  block(front - 2.12, -9.14, 42.16, .38, .56, 4.8, masonry, 0x909580);
  block(front - 2.12, -9.26, 47.25, .38, .32, 1.1, masonry, 0x969783);
  block(-2.2, -12.36, 45.7, .8, .28, 1.55, paving, 0x999984, .41);
  block(-2.8, -12.32, 46.9, .65, .36, .9, masonry, 0x858770, -.24);

  if (extraMasonry) {
    // Match the bounced light used on the playable courtyard walls. Their
    // shaded faces must retain joints and grain from the side camera.
    const wingWall = masonry.clone();
    wingWall.emissiveMap = assets.wall.map;
    wingWall.emissive.setHex(0xe0edf1);
    wingWall.emissiveIntensity = 1.2;
    wingWall.onBeforeCompile = shader => {
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance = mix(vec3(dot(totalEmissiveRadiance, vec3(.2126,.7152,.0722))), totalEmissiveRadiance, .3) * mix(vec3(1.0),vColor.rgb,.45);');
    };
    extraMasonry((geometry,surface,tint)=>add(geometry,surface==='cap'?paving:wingWall,tint));
  }
  for (const [material, parts] of batches) {
    const mesh = new THREE.Mesh(mergeGeometries(parts), material);
    parts.forEach(part => part.dispose());
    yard.add(mesh);
  }

  function scatter(source: THREE.Mesh, placements: readonly Placement[]) {
    const mesh = new THREE.InstancedMesh(source.geometry, source.material, placements.length);
    const transform = new THREE.Object3D();
    placements.forEach(([x, y, z, scale, rotation], i) => {
      transform.position.set(x, y, z);
      transform.scale.setScalar(scale);
      transform.rotation.y = rotation;
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });
    mesh.computeBoundingSphere();
    yard.add(mesh);
  }
  if (ground === 'bank') return;
  scatter(assets.rocks[0]!, [
    [-2.3,-12.55,39.8,.92,1.1], [2.9,-12.55,41.7,.78,.4], [-12,-12.55,44.4,1.35,2.1],
    [-22.4,-10.27,25.4,.94,1.7], [22.2,-10.27,32.5,1.1,.6],
  ]);
  scatter(assets.ferns[0]!, [
    [-2.5,-12.52,40.8,2.3,.3], [-3.1,-12.52,46.8,1.8,1.2], [2.4,-12.52,42.3,2.1,2.3],
    [-12.8,-12.52,44.9,2.5,2.8], [-22.3,-10.24,26.3,2.2,.7], [22.2,-10.24,31.9,2.4,1.4],
  ]);
}
