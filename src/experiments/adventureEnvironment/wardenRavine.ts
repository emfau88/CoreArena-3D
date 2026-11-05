import * as THREE from 'three';
import {STONE_ADVENTURE} from '../../arena/stoneAdventure';
import {PVE_FALL_HEIGHT} from '../../core/pve';
import type {Vec3} from '../../core/types';
import type {CourtyardAssets} from '../../render/courtyardLook';
import shaleUrl from './shale-ground.webp?url';
import {createWardenRelief} from './wardenRelief';

type Point = readonly [x:number, z:number];
const {lerp, smoothstep} = THREE.MathUtils;

// Trace the union of the actual walkable floors, including the narrow links.
// Neither the bedrock nor the fall warning should close a doorway.
const floors=STONE_ADVENTURE.boxes.filter(box=>box.material==='floor');
const ends=[...new Set(floors.flatMap(b=>[b.center.z-b.size.z/2,b.center.z+b.size.z/2]))].sort((a,b)=>a-b);
const rim:Point[]=[];
let lastWidth=0;
for(let i=1;i<ends.length;i++){
  const z=ends[i-1]!, mid=(z+ends[i]!)/2;
  const width=Math.max(0,...floors.filter(b=>Math.abs(mid-b.center.z)<b.size.z/2).map(b=>b.size.x/2));
  if(width===lastWidth) continue;
  if(lastWidth) rim.push([lastWidth,z]);
  rim.push([width,z]);lastWidth=width;
}
rim.push([lastWidth,ends.at(-1)!]);
const outline=[...rim,...[...rim].reverse().map(([x,z]):Point=>[-x,z])];

// One mineral fault turns around the headland, with shorter exposed branches
// in the cuts between courtyards. Coordinates are in the same world as the boss.
const faults:Point[][]=[
  [[12,51],[6,48],[1,48.5],[-3.3,45.2],[-7.5,45.8],[-13,42],[-18.2,42.6],[-21.8,36.4],
    [-21.2,32.4],[-24.7,27.7],[-23.4,20.7],[-21.3,16],[-22.5,9.1],[-24.6,5.9],[-23.9,-1.3],
    [-21.2,-6.5],[-23,-11.8],[-21.5,-17.1],[-24.8,-22.4],[-23.8,-28],[-26,-32],
    [-23.1,-39],[-19.4,-44.2],[-15.5,-44.9],[-11.4,-49.3],[-7.8,-49],[-3.3,-54.6],[2,-54.1],[6,-57.4],[13,-57.9]],
  [[-23.4,20.7],[-19,17.1],[-16.2,17.7],[-12.4,14.9],[-9.1,15.1],[-6.2,13.7]],
  [[-24.6,5.9],[-27.8,6.7],[-29.8,4.3],[-31.6,4.8],[-33.2,1.6]],
  [[-23,-11.8],[-18.1,-14.8],[-13.6,-14.1],[-11.2,-15.2],[-7.1,-13.6]],
  [[-11.4,-49.3],[-7.8,-51.7],[-8.1,-55],[-4.6,-58.2]],
];
function segmentDistance(x:number,z:number,a:Point,b:Point) {
  const dx=b[0]-a[0], dz=b[1]-a[1];
  const t=THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
  return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
}
function faultDistance(x:number,z:number) {
  let nearest=30;
  for(const path of faults) for(let i=1;i<path.length;i++)
    nearest=Math.min(nearest,segmentDistance(x,z,path[i-1]!,path[i]!));
  return nearest;
}
function edgeHint(p:Vec3) {
  if(outline.some((a,i)=>segmentDistance(p.x,p.z,a,outline[(i+1)%outline.length]!)<1.85))
    return 'Absturzgefahr · Ein Sturz in die Klamm ist tödlich.';
}
function buffers(positions:number[],colors:number[],uvs:number[],indices:number[]) {
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  return geo;
}

function buildTerrain(group:THREE.Group,material:THREE.Material) {
  const xs=[-140,-84,-58,-46,...Array.from({length:73},(_,i)=>i-36),46,58,84,140];
  const zs=[-155,-108,-84,-73,...Array.from({length:125},(_,i)=>i-66),67,82,108,145];
  const vertices:number[]=[], colors:number[]=[], uvs:number[]=[], indices:number[]=[];
  const heights:number[][]=[];
  const rock=new THREE.Color(0x92a6a8), moss=new THREE.Color(0x879487), deep=new THREE.Color(0x4d6870);
  const color=new THREE.Color();
  for(const [row,z] of zs.entries()){
    const line:number[]=[];heights.push(line);
    for(const [col,x] of xs.entries()){
      const d=faultDistance(x,z);
      const fold=.74*Math.sin(x*.37+z*.21)+.32*Math.cos(z*.61-x*.29);
      const ridge=Math.exp(-(((x+28+3.6*Math.sin(z*.11))/6.4)**2));
      const ripple=Math.sin(z*.14-x*.31+fold*.53);
      const gateWell=Math.exp(-(((z+54)/7.8)**2)-((x/13)**2));
      const handPocket=Math.exp(-(((x+29)/3.8)**2)-(((z+4.7)/5.4)**2));
      const relief=-13.2+fold+1.18*ripple+ridge*(3.0+1.2*ripple)-4.7*gateWell-2.8*handPocket
        -2.45*(1-smoothstep(d,0,2.9))-.85*smoothstep(Math.abs(x),33,52);
      const y=Math.min(relief,PVE_FALL_HEIGHT-1.6-.16*ripple);
      line.push(y);vertices.push(x,y,z);
      uvs.push((x+.36*y)/4,(z-.55*y)/4);
      color.copy(rock).lerp(moss,smoothstep(fold+.4*ripple,-.5,1.1)*.72)
        .lerp(deep,(1-smoothstep(d,.35,2.9))*.88);
      color.multiplyScalar((.82+.14*ripple+.08*fold)*lerp(1,.57,smoothstep(Math.abs(x),36,75)));
      color.toArray(colors,colors.length);
      if(row&&col){
        const c=row*xs.length+col, a=c-xs.length-1;
        indices.push(a,c-1,a+1,a+1,c-1,c);
      }
    }
  }
  const ground=new THREE.Mesh(buffers(vertices,colors,uvs,indices),material);
  ground.name='continuous-ravine-bed';ground.receiveShadow=true;group.add(ground);
  // Interpolate the rendered triangle, including on a steep channel bank. Ground
  // contacts and narrow mineral inlays then follow the exact same surface.
  return (x:number,z:number)=>{
    const i=THREE.MathUtils.clamp(xs.findIndex(v=>v>=x)-1,0,xs.length-2);
    const j=THREE.MathUtils.clamp(zs.findIndex(v=>v>=z)-1,0,zs.length-2);
    const u=(x-xs[i]!)/(xs[i+1]!-xs[i]!), v=(z-zs[j]!)/(zs[j+1]!-zs[j]!);
    const a=heights[j]![i]!,b=heights[j]![i+1]!,c=heights[j+1]![i]!,d=heights[j+1]![i+1]!;
    return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
  };
}
type SurfaceHeight=ReturnType<typeof buildTerrain>;

/** The courts share a rock foundation. The walls meet stone down to the valley floor. */
function buildCliff(group:THREE.Group,material:THREE.Material) {
  const bank:Point[]=[];
  for(const [i,a] of outline.entries()){
    const b=outline[(i+1)%outline.length]!, count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.3);
    for(let k=0;k<count;k++) bank.push([lerp(a[0],b[0],k/count),lerp(a[1],b[1],k/count)]);
  }
  const vertices:number[]=[],uvs:number[]=[],colors:number[]=[],indices:number[]=[];
  const color=new THREE.Color();
  let distance=0;
  for(let i=0;i<=bank.length;i++){
    const [x,z]=bank[i%bank.length]!, before=bank[(i+bank.length-1)%bank.length]!, after=bank[(i+1)%bank.length]!;
    if(i) distance+=Math.hypot(x-before[0],z-before[1]);
    const dx=after[0]-before[0],dz=after[1]-before[1],length=Math.hypot(dx,dz);
    const grain=.46*Math.sin(z*.46+x*.72)+.32*Math.cos(z*.89-x*.59);
    const layers=[[-.79,-.03,0x89918d],[-1.68+grain*.34,-.22,0x718488],[-3.05+grain*.77,-.39,0x919d97],
      [-3.48+grain*.77,-.54,0x58696c],[-6.8+grain,-.18,0x657d83],[-9.5+grain*.8,.73,0x56686b],[-23,2.8,0x404f57]] as const;
    for(const [j,[y,offset,tint]] of layers.entries()){
      vertices.push(x+dz/length*offset,y,z-dx/length*offset);uvs.push(distance/3.7,y/3.7);
      color.setHex(tint).multiplyScalar(.93+.16*grain).toArray(colors,colors.length);
      if(i&&j){const p=i*layers.length+j;indices.push(p-layers.length-1,p-1,p-layers.length,p-1,p,p-layers.length);}
    }
  }
  const cliff=new THREE.Mesh(buffers(vertices,colors,uvs,indices),material);
  cliff.name='exposed-strata-below-the-courts';cliff.receiveShadow=true;group.add(cliff);
}

function buildAmber(group:THREE.Group,height:SurfaceHeight,shale:THREE.Texture) {
  const positions:number[]=[], uvs:number[]=[], colors:number[]=[], indices:number[]=[];
  const color=new THREE.Color(), ochre=new THREE.Color(0x8b704a), amber=new THREE.Color(0xe3b675);
  for(const path of faults){
    let distance=0;
    for(let i=1;i<path.length;i++){
      const a=path[i-1]!,b=path[i]!,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      const count=Math.ceil(length/.24),start=positions.length/3;
      for(let j=0;j<=count;j++){
        const t=j/count, along=distance+t*length, pulse=Math.sin(along*1.8)+.58*Math.sin(along*.54+.2);
        const taper=.2+.8*Math.sin(Math.PI*t), width=(.034+.074*smoothstep(pulse,-.6,1))*taper;
        const offset=.45+.16*Math.sin(along*2.1)+.09*Math.cos(along*3.8);
        for(const side of [1,-1]){
          const x=a[0]+t*dx-dz/length*(offset+side*width), z=a[1]+t*dz+dx/length*(offset+side*width);
          const y=height(x,z);
          positions.push(x,y+.043,z);uvs.push((x+.36*y)/2.4,(z-.55*y)/2.4);
          color.copy(ochre).lerp(amber,smoothstep(pulse,-.7,1)).toArray(colors,colors.length);
        }
        if(j&&pulse>-.63){const p=start+j*2;indices.push(p-2,p,p-1,p-1,p,p+1);}
      }
      distance+=length;
    }
  }
  const mineral=new THREE.MeshStandardMaterial({map:shale,bumpMap:shale,bumpScale:.065,vertexColors:true,
    roughness:.79,metalness:.08,emissiveMap:shale,emissive:0xc68340,emissiveIntensity:.23});
  const inlay=new THREE.Mesh(buffers(positions,colors,uvs,indices),mineral);
  inlay.name='broken-amber-in-the-rock';inlay.receiveShadow=true;group.add(inlay);
}

/** Broken, leaning stone plates at two saddles and the split formation at the gate. */
function buildSpires(group:THREE.Group,material:THREE.Material,height:SurfaceHeight) {
  const positions:number[]=[],colors:number[]=[],uvs:number[]=[],indices:number[]=[];
  const color=new THREE.Color();
  const stones=[
    [-6.1,49.7,2.0,1.45,3.9,.30],[-10.0,49.4,1.8,1.25,2.9,.46],
    [-14.9,14.8,1.7,1.02,4.4,-.36],[-17.8,16.0,1.32,.8,3.0,-.46],[-21.2,12.6,1.84,.95,3.5,-.22],
    [-28.6,5.5,2.9,1.55,4.9,-.43],[-30.2,1.4,2.4,1.23,4.2,-.47],[-29.7,-1.3,1.48,.94,3.0,-.50],
    [-13.7,-14.6,1.9,1.2,4.65,.38],[-17.6,-13.6,1.5,1.02,3.5,.48],
    [-10.4,-49.8,3.05,1.7,7.8,-.39],[-2.1,-54.5,2.75,1.65,7.2,.34],[-13.3,-51.7,1.9,1.4,4.6,-.42],
  ] as const;
  for(const [k,[x,z,rx,rz,size,lean]] of stones.entries()){
    const foot=height(x,z)-1.35, rise=Math.min(size,PVE_FALL_HEIGHT-1.1-foot);
    const start=positions.length/3, sides=7;
    const rings=[[0,1], [.23,.98], [.57,.73], [.60,.64], [.82,.55], [1,.16]] as const;
    for(const [j,[t,radius]] of rings.entries())for(let s=0;s<=sides;s++){
      const angle=(s%sides)*2*Math.PI/sides+k*.53, weather=.93+.10*Math.sin(angle*3+k);
      const px=x+Math.cos(angle)*rx*radius*weather+rise*.16*t;
      const pz=z+Math.sin(angle)*rz*radius*weather+lean*rise*t;
      const py=foot+rise*t+.36*Math.cos(angle+.7)*radius;
      positions.push(px,py,pz);uvs.push(s/sides*rx*1.8+.29*t,py/3.2);
      color.setHex(j===2?0x919e98:j===3?0x667c80:0x8e9b95).multiplyScalar(.84+.12*Math.cos(angle)+.12*t).toArray(colors,colors.length);
      if(j&&s){const p=start+j*(sides+1)+s;indices.push(p-sides-2,p-1,p-sides-1,p-sides-1,p-1,p);}
    }
    const top=start+(rings.length-1)*(sides+1);
    for(let s=1;s<sides-1;s++) indices.push(top,top+s+1,top+s);
  }
  const rings=buffers(positions,colors,uvs,indices);
  const facets=rings.toNonIndexed();rings.dispose();facets.computeVertexNormals();
  const needles=new THREE.Mesh(facets,material);
  needles.name='fractured-gate-and-votive-stones';needles.castShadow=needles.receiveShadow=true;group.add(needles);
}

function placeScans(group:THREE.Group,assets:CourtyardAssets,height:SurfaceHeight) {
  const source=assets.rocks[2]!,transform=new THREE.Object3D();
  const courts=[
    [[-5.5,48.0,1.38,.5],[-10.2,43.3,1.24,1.2],[1.9,43.8,1.14,2.7],[20.5,25.4,1.2,.8]],
    [[-17.2,14.9,1.3,2],[-14.5,13.9,.88,1],[-21.4,1.7,2.05,1.3],[22.9,-1.4,1.35,.4]],
    [[-16,-14.9,1.25,2.6],[-21.8,-31.4,1.8,.3],[-10.6,-47.6,1.1,1.1],[-4.5,-55.3,1.5,1.3]],
  ] as const;
  const stone=(source.material as THREE.MeshStandardMaterial).clone();
  stone.color.setHex(0xc4d1d7);
  stone.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
      '#include <map_fragment>\n diffuseColor.rgb=mix(vec3(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))),diffuseColor.rgb,.26);');
  };
  const fern=assets.ferns[0]!;
  for(const sites of courts){
    const mesh=new THREE.InstancedMesh(source.geometry,stone,sites.length);
    const plants=new THREE.InstancedMesh(fern.geometry,fern.material,sites.length);
    for(const [i,[x,z,s,yaw]] of sites.entries()){
      transform.rotation.set(0,yaw,0);transform.scale.set(s*1.25,s*.84,s);
      transform.position.set(x,height(x,z)-.33*s,z);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
      const fx=x+.84*s, fz=z+.65*s;
      transform.position.set(fx,height(fx,fz)-.08,fz);transform.scale.setScalar(1.2*s);
      transform.updateMatrix();plants.setMatrixAt(i,transform.matrix);
    }
    for(const item of [mesh,plants]){item.computeBoundingSphere();item.receiveShadow=true;group.add(item);}
  }
}

export async function createWardenRavine() {
  const shale=await new THREE.TextureLoader().loadAsync(shaleUrl);
  shale.colorSpace=THREE.SRGBColorSpace;shale.wrapS=shale.wrapT=THREE.RepeatWrapping;shale.anisotropy=4;
  return {edgeHint,build(scene:THREE.Scene,assets:CourtyardAssets){
    const group=new THREE.Group();group.name='warden-ravine';scene.add(group);
    const rock=new THREE.MeshStandardMaterial({map:shale,bumpMap:shale,bumpScale:.095,vertexColors:true,
      roughness:.96,emissive:0x121b21});
    const height=buildTerrain(group,rock);
    buildCliff(group,rock);buildAmber(group,height,shale);buildSpires(group,rock,height);placeScans(group,assets,height);
    const reliefStone=rock.clone();
    reliefStone.emissiveMap=shale;reliefStone.emissive.setHex(0x869797);reliefStone.emissiveIntensity=.26;
    const relief=createWardenRelief(reliefStone,'face');
    relief.scale.setScalar(1.34);
    relief.position.set(-5.4,Math.min(-12.0,height(-5.4,44.2)+1.3),44.2);
    group.add(relief);
    const hand=createWardenRelief(reliefStone,'hand');
    hand.scale.setScalar(1.32);
    hand.position.set(-29,Math.min(-10.65,height(-29,-4.7)+.68),-4.7);
    group.add(hand);
  }};
}
