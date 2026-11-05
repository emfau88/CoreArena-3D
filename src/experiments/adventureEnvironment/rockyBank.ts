import * as THREE from 'three';
import type {CourtyardAssets} from '../../render/courtyardLook';
import type {Vec3} from '../../core/types';
import {buildStoneYard} from './stoneYard';
import shaleUrl from './shale-ground.webp?url';

const {smoothstep, lerp} = THREE.MathUtils;
const runnelZ = (x: number) => 41.8 + x * .3 + 1.8 * Math.sin(x * .26);
const washAt = (x: number, z: number) => Math.exp(-((z - runnelZ(x)) ** 2) / 1.6);

function groundHeight(x: number, z: number, wash = washAt(x,z)) {
  const distance = Math.hypot(Math.max(0, Math.abs(x) - 16), Math.max(0, 16 - z, z - 38));
  const fold = .53 * Math.sin(x * .47 + z * .19) + .3 * Math.sin(z * .71 - x * .25);
  const slope = -9.15 - 4.1 * smoothstep(distance + fold, 0, 13) + fold - .72 * wash;
  // The old masonry piers stand on the bed of the wash.
  const pierDistance = Math.hypot(Math.max(0, Math.abs(x + 4.2) - 1.5),
    Math.max(0, Math.abs(z - 44.1) - 4.85));
  return lerp(-12.52, slope, smoothstep(pierDistance, 0, 4.3));
}

export function edgeHint(p: Vec3): string | undefined {
  const across = Math.abs(p.x);
  if (p.z < 15.5 || p.z > 50 || across > 29) return;
  if (across >= 12.5 || p.z >= 34.5) {
    return 'Absturzgefahr · Ein Sturz in die Schlucht ist tödlich.';
  }
}

export async function createRockyBank(corner?: typeof import('./retainingCorner')) {
  const shale = await new THREE.TextureLoader().loadAsync(shaleUrl);
  shale.colorSpace = THREE.SRGBColorSpace;
  shale.wrapS = shale.wrapT = THREE.RepeatWrapping;
  shale.anisotropy = 4;
  return (scene: THREE.Scene, assets: CourtyardAssets) => {
    const bedAt = corner ? (x:number,z:number)=>corner.carveChannel(x,z,groundHeight(x,z,0)) : groundHeight;
    buildStoneYard(scene, assets, 'bank',corner ? add=>corner.buildMasonry(add,bedAt) : undefined);
    const channelAt = corner?.channelZ ?? runnelZ;
    const material = new THREE.MeshStandardMaterial({
      map: shale, bumpMap: shale, bumpScale: .085, roughness: .98, vertexColors: true,
    });
    const earth = new THREE.Color(0xb4afa6), moss = new THREE.Color(0x92977b);
    const gravel = new THREE.Color(corner?0xe5dccc:0xd4cbbb), tint = new THREE.Color();
    const outcrops = [
      // x, z, long axis, short axis, exposed height, heading
      [-27.6,36.3,3.3,1.9,2.05,-.58], [-30.2,38.4,2.5,1.35,1.45,-.48],
      [-26.8,34.4,1.8,1.15,.83,-.63], [-29.1,19.6,2.6,1.65,1.7,-.5],
      [-31.3,20.7,1.8,1.05,1.05,-.39], [-7.9,corner?46.8:42.7,2.4,1.5,1.4,.78],
      [corner ? -17.08 : -9.3, corner ? 42.72 : 44.6, corner ? 1.9 : 1.7, 1.15, corner ? .73 : .91, .74],
      [20.1,29.8,2.8,1.8,1.45,.62],
    ] as const;
    // Model the slope as one continuous surface. Its uneven far end descends
    // into shadow below the next court instead of ending in an exposed tile.
    const land = corner?.makeTerrain() ?? new THREE.PlaneGeometry(100, 80, 150, 120).rotateX(-Math.PI / 2).translate(0, 0, 40);
    const vertices = land.getAttribute('position'), uv = land.getAttribute('uv');
    const colors = new Float32Array(vertices.count * 3);
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), z = vertices.getZ(i);
      const fade = smoothstep(z + 1.8 * Math.sin(x * .27), 1, 14);
      const y = bedAt(x, z) - (1 - fade) * 13;
      vertices.setY(i, y);
      uv.setXY(i, x / 4.1 + .16 * Math.sin(z * .39), z / 4.1 + .15 * Math.sin(x * .47));
      const growth = smoothstep(Math.sin(x * .57 + z * .24) + .6 * Math.cos(z * .66), -.2, 1);
      const wash = corner ? corner.channelWeight(z-channelAt(x)) : washAt(x,z);
      tint.copy(earth).lerp(moss, growth).lerp(gravel, wash * .9);
      if(corner){
        const bankShadow = Math.exp(-((z-channelAt(x)-1.12)**2)/.53);
        tint.multiplyScalar(1-.29*bankShadow);
      }
      for (const [cx,cz,rx,rz] of outcrops) {
        const distance = Math.hypot((x-cx)/rx, (z-cz)/rz);
        tint.multiplyScalar(lerp(.51, 1, smoothstep(distance, .55, 1.28)));
      }
      tint.multiplyScalar(.35 + .65 * fade).toArray(colors, i * 3);
    }
    land.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    land.computeVertexNormals();
    const slope = new THREE.Mesh(land, material);
    slope.name = 'shale-embankment'; slope.receiveShadow = true; scene.add(slope);

    // Embed two of the court's scanned rocks into the slope. Stretch their
    // long axes together to suggest one exposed seam rather than loose props.
    const transform = new THREE.Object3D();
    const rockMaterial = (assets.rocks[2]!.material as THREE.MeshStandardMaterial).clone();
    rockMaterial.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\n diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(.2126,.7152,.0722))), diffuseColor.rgb, .32);');
    };
    rockMaterial.color.setHex(0xd4d8d5);
    for (const [groupIndex, sourceIndex] of [2, 5].entries()) {
      const source = assets.rocks[sourceIndex]!.geometry;
      const dimensions = source.boundingBox!.getSize(new THREE.Vector3());
      const rocks = outcrops.filter((_, i) => i % 2 === groupIndex);
      const mesh = new THREE.InstancedMesh(source, rockMaterial, rocks.length);
      rocks.forEach(([x,z,rx,rz,h,heading],i) => {
        transform.position.set(x,bedAt(x,z) - h*.38,z);
        transform.rotation.set(0,heading + (i%2)*Math.PI,0);
        transform.scale.set(2*rx/dimensions.x,1.4*h/dimensions.y,2*rz/dimensions.z);
        transform.updateMatrix(); mesh.setMatrixAt(i,transform.matrix);
      });
      mesh.computeBoundingSphere(); mesh.castShadow=mesh.receiveShadow=true;
      mesh.name='weathered-rock-outcrop'; scene.add(mesh);
    }

    // Gravel gathers in pockets in the wash. Fixed samples keep every run identical.
    const sample = (i:number) => THREE.MathUtils.euclideanModulo(Math.sin(i*127.1 + 17.3)*43758.5453,1);
    const scree = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1),
      new THREE.MeshStandardMaterial({color:corner?0xa09d8f:0xb1ad99,roughness:1}), corner?156:96);
    for (let i=0;i<scree.count;i++) {
      const pocket=Math.floor(i/6), x=lerp(-37,16,sample(pocket)) + (sample(i+51)-.5)*2.4;
      const z=channelAt(x)+(sample(i+200)-.5)*1.25;
      const size=corner ? .035+.12*sample(i+301) : .045+.17*sample(i+301);
      transform.position.set(x,bedAt(x,z),z);
      transform.rotation.set(.12,sample(i+412)*Math.PI,.15);
      transform.scale.set(size,size*.52,size*.76);
      transform.updateMatrix(); scree.setMatrixAt(i,transform.matrix);
    }
    scree.computeBoundingSphere(); scree.receiveShadow=true; scene.add(scree);
    const pockets = [[-27.3,20.6,3.0],[-27.9,21.3,1.95],[-28.4,21,1.55],
      [-6.4,corner?46.4:43.7,2.6],[-6.1,corner?47.1:44.4,1.8],[-28,38.2,1.85],[20.9,28.7,1.65]] as const;
    const fern=assets.ferns[0]!, plants=new THREE.InstancedMesh(fern.geometry,fern.material,pockets.length);
    transform.rotation.set(0,0,0);
    pockets.forEach(([x,z,s],i)=>{
      transform.position.set(x,bedAt(x,z)-.12,z); transform.rotation.y=i*2.2;
      transform.scale.setScalar(s); transform.updateMatrix(); plants.setMatrixAt(i,transform.matrix);
    });
    plants.computeBoundingSphere(); plants.receiveShadow=true; scene.add(plants);
  };
}
