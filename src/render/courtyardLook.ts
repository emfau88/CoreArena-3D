import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ArenaDefinition } from '../arena/arena';
import { STONE_CONSOLES } from '../arena/stoneDressing';
import { buildCourtyardDressing, loadDressingAssets, type DressingAssets } from './courtyardDressing';

const assetRoot = `${import.meta.env.BASE_URL}assets/courtyard/`;
interface Surface { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }
export interface CourtyardAssets { floor: Surface; wall: Surface; ferns: THREE.Mesh[]; rocks: THREE.Mesh[]; dressing:DressingAssets }

/** Local assets loaded only by the adventure; source/licence records live beside each pack. */
export async function loadCourtyardAssets(): Promise<CourtyardAssets> {
  const textures = new THREE.TextureLoader(), models = new GLTFLoader();
  const surface = async (folder: string): Promise<Surface> => {
    const [map, normalMap, roughnessMap] = await Promise.all(['Diffuse', 'nor_gl', 'Rough'].map(name =>
      textures.loadAsync(`${assetRoot}${folder}/${name}.jpg`)));
    for (const texture of [map!, normalMap!, roughnessMap!]) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4;
    }
    map!.colorSpace = THREE.SRGBColorSpace;
    return { map: map!, normalMap: normalMap!, roughnessMap: roughnessMap! };
  };
  const [floor, wall, fernFile, rockFile, alpha, dressing] = await Promise.all([
    surface('rock_tile_floor'), surface('stone_wall_02'),
    models.loadAsync(`${assetRoot}fern_02/fern_02.gltf`),
    models.loadAsync(`${assetRoot}rock_moss_set_01/rock_moss_set_01.gltf`),
    textures.loadAsync(`${assetRoot}fern_02/textures/fern_02_alpha_1k.png`),
    loadDressingAssets(),
  ]);
  // The source glTF references JPEG base colour; its separate leaf mask is essential.
  alpha.flipY = false; alpha.anisotropy = 4;
  const meshes = (root: THREE.Group, vegetation: boolean): THREE.Mesh[] => {
    const result: THREE.Mesh[] = [];
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material as THREE.MeshStandardMaterial;
      material.normalScale.setScalar(vegetation ? .45 : .7);
      if (vegetation) { material.alphaMap = alpha; material.alphaTest = .45; material.roughness = 1; }
      else material.side = THREE.FrontSide;
      object.geometry.computeBoundingBox();
      const bounds = object.geometry.boundingBox!, center = bounds.getCenter(new THREE.Vector3());
      // Asset-pack layout offsets are not placement offsets. Anchor every model at ground level.
      object.geometry.translate(-center.x, -bounds.min.y, -center.z);
      object.position.set(0, 0, 0); object.castShadow = object.receiveShadow = true;
      result.push(object);
    });
    return result;
  };
  return { floor, wall, ferns: meshes(fernFile.scene, true), rocks: meshes(rockFile.scene, false), dressing };
}

/** Shared materials for all three courts; arena boxes remain the collision authority. */
export function buildCourtyardLook(scene: THREE.Scene, arena: ArenaDefinition, assets: CourtyardAssets): (dt: number) => void {
  const floor = new THREE.MeshStandardMaterial({ ...assets.floor, color: 0xc7cbd2, roughness: .95, normalScale: new THREE.Vector2(.55,.55) });
  const wall = new THREE.MeshStandardMaterial({ ...assets.wall, color: 0xe6e7df, roughness: 1, normalScale: new THREE.Vector2(.55,.55),
    emissiveMap: assets.wall.map, emissive: 0xb8bec2, emissiveIntensity: .45 });
  const cap = new THREE.MeshStandardMaterial({ ...assets.floor, color: 0xe0ddcf, roughness: .9, normalScale: new THREE.Vector2(.3,.3) });
  const base = new THREE.MeshStandardMaterial({ ...assets.wall, color: 0x959e85, roughness: 1,
    emissiveMap: assets.wall.map, emissive: 0x989c89, emissiveIntensity: .3 });
  const earth = new THREE.MeshStandardMaterial({ ...assets.wall, color: 0x999b73, roughness: 1, normalScale: new THREE.Vector2(.3,.3),
    emissiveMap: assets.wall.map, emissive: 0x7a8067, emissiveIntensity: .2 });
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const box = (x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material,bevel=.035,metres=2) => {
    const geometry = bevel ? new RoundedBoxGeometry(w,h,d,1,Math.min(bevel,h/3,w/3,d/3)) : new THREE.BoxGeometry(w,h,d);
    const pos=geometry.getAttribute('position'), normal=geometry.getAttribute('normal'), uv=geometry.getAttribute('uv');
    // Project in world metres: no stretched brick texture on long thin wall segments.
    for(let i=0;i<pos.count;i++) {
      const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));
      const px=pos.getX(i)+x,py=pos.getY(i)+y,pz=pos.getZ(i)+z;
      uv.setXY(i,(ny>=nx && ny>=nz ? px : nx>nz ? pz : px)/metres,(ny>=nx && ny>=nz ? -pz : py)/metres);
    }
    geometry.translate(x,y,z);
    const group=batches.get(material)??[];group.push(geometry);batches.set(material,group);
  };
  for(const shape of arena.boxes) {
    if(['dormant-warden','north-gate','boss-entry-gate'].includes(shape.id)) continue;
    if(STONE_CONSOLES.some(station=>station.id===shape.id)) continue;
    const {center:c,size:s}=shape, top=c.y+s.y/2;
    if(shape.material==='floor') {
      // Physics floors overlap at doorways. Clip only the visible overlap; world
      // UVs keep the paving continuous through every court, link and exit.
      const exit=shape.id==='floor-exit',link=shape.id.startsWith('floor-link-');
      box(c.x,c.y,c.z-(exit ? .5 : 0),s.x,s.y,exit ? s.z-1 : link ? 4 : s.z,floor,0,4);continue;
    }
    box(c.x,c.y-.055,c.z,s.x,s.y-.11,s.z,wall);
    // A grounded darker foot and pale stone cap make the actual height readable.
    box(c.x,.055,c.z,s.x+.035,.11,s.z+.035,base,.015);
    if(Math.min(s.x,s.z)>.5) {
      // One continuous cap, including every corner; no crossing trim strips.
      box(c.x,top-.055,c.z,s.x,.11,s.z,cap,.025,3);
    } else {
      const alongX=s.x>s.z,length=alongX?s.x:s.z,count=Math.ceil(length/1.55),step=length/count;
      for(let i=0;i<count;i++) {
        const offset=-length/2+(i+.5)*step;
        box(c.x+(alongX?offset:0),top-.065,c.z+(alongX?0:offset),
          alongX?step-.025:s.x+.055,.13,alongX?s.z+.055:step-.025,cap,.035,3);
      }
    }
  }
  // Grounded exterior beds: large decorative rocks never become invisible walk-through obstacles.
  for(const side of [-1,1]) box(side*17.15,-.14,27,2.3,.22,22.7,earth,.05);
  box(0,-.14,39.1,36.6,.22,2.2,earth,.05);
  for(const side of [-1,1]) {
    box(side*19.05,-.14,0,2.1,.22,24.8,earth,.05);
    box(side*19.05,-.14,-29,2.1,.22,26.8,earth,.05);
  }
  for(const [material,geometries] of batches) {
    const geometry=mergeGeometries(geometries),mesh=new THREE.Mesh(geometry,material);
    geometries.forEach(g=>g.dispose());mesh.castShadow=material!==floor && material!==earth;mesh.receiveShadow=true;
    mesh.name='courtyard-masonry';scene.add(mesh);
  }
  const place = (source:THREE.Mesh,x:number,y:number,z:number,scale:number,turn:number) => {
    const mesh=source.clone();mesh.position.set(x,y,z);mesh.scale.setScalar(scale);mesh.rotation.y=turn;scene.add(mesh);
  };
  // Back edges of cover plus small, passable clusters INSIDE the courts. No fern
  // covers a pickup, stair approach, central route or the boss's seal circle.
  const plants: Array<[number,number,number,number]> = [
    ...arena.boxes.filter(b=>b.planted).flatMap(b=>[
      [b.center.x-b.size.x*.3,b.center.y+b.size.y/2-.025,b.center.z-b.size.z/2+.3,1.6],
      [b.center.x+b.size.x*.15,b.center.y+b.size.y/2-.025,b.center.z-b.size.z/2+.22,1.05],
    ] as Array<[number,number,number,number]>),
    [-12.7,-.025,32,2.2],[-11.6,-.025,32.6,1.45],[-10.2,-.025,25.2,1.8],
    [12.7,-.025,29.5,2],[13.5,-.025,28.5,1.35],[11.6,-.025,18.5,1.9],
    [-14,-.025,9,2.3],[-12.8,-.025,9.6,1.4],[12.6,-.025,9.2,2.1],
    [-9.5,1.075,5.15,1.5],[-7.9,-.025,-6,1.8],[-15.2,-.025,-8.7,2.2],
    [-14.2,-.025,-9.3,1.4],[15.2,-.025,-8.5,1.9],
    [-15.5,-.025,-18.4,2.1],[-14.2,-.025,-18.9,1.35],[-15.6,-.025,-32.5,2.2],
    [15.2,-.025,-29.7,2.1],[14.2,-.025,-30.6,1.4],[11.3,-.025,-39,2],
    [-10.5,-.025,-39.2,1.8],[-13.8,1.075,-24.7,1.35],
    [-17.1,-.04,36,2.5],[-17.3,-.04,34.5,1.8],[-17,-.04,27,2.2],[-17.5,-.04,20,2.5],
    [17.2,-.04,33,2.2],[17.1,-.04,31.7,1.6],[17.3,-.04,23.7,2.3],[17.1,-.04,18,1.8],
    [-12,-.04,39,2.4],[-10.8,-.04,39.5,1.7],[9.5,-.04,39.2,2.1],
  ];
  // Many clumps still cost four plant draw calls, one per shared model variant.
  assets.ferns.forEach((source,variant)=>{
    const instances=plants.map((plant,i)=>({plant,i})).filter(({i})=>i%assets.ferns.length===variant);
    const mesh=new THREE.InstancedMesh(source.geometry,source.material,instances.length),transform=new THREE.Object3D();
    instances.forEach(({plant:[x,y,z,s],i},index)=>{
      transform.position.set(x,y,z);transform.scale.setScalar(s);transform.rotation.y=i*2.4;transform.updateMatrix();
      mesh.setMatrixAt(index,transform.matrix);
    });
    mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);
  });
  const rocks = [[-17.2,31.5,1.1],[-17.2,30,.65],[-17.1,17.3,.9],[17.2,36,1.1],[17.2,35,.6],
    [17.3,26.5,1.1],[-13.5,39.1,.85],[8,39.2,1]];
  rocks.forEach(([x,z,s],i)=>place(assets.rocks[[0,2,4][i%3]!]!,x!,-.16,z!,s!,i*1.9));

  // One small iron basket on the existing doorway wall. Its warm pool is local and shadow-free.
  const torch=new THREE.Group();torch.position.set(-6,1.3,16);scene.add(torch);
  const iron=new THREE.MeshStandardMaterial({color:0x353b36,metalness:.75,roughness:.6});
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.065,.09,.75,8),iron);stem.position.y=.375;torch.add(stem);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.28,.12,.2,8,1,true),iron);bowl.position.y=.8;torch.add(bowl);
  const flame=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshBasicMaterial({color:0xff9b36}));
  flame.position.y=1.08;flame.scale.set(.16,.36,.16);torch.add(flame);
  const heart=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xffe7a0}));
  heart.position.set(.025,1.01,.02);heart.scale.set(.1,.23,.1);torch.add(heart);
  const light=new THREE.PointLight(0xffb55d,8,6,2);light.position.y=1.15;torch.add(light);
  const animateDressing=buildCourtyardDressing(scene,assets.dressing);
  let elapsed=0;
  return dt=>{ animateDressing(dt);elapsed+=dt;flame.scale.y=.36+Math.sin(elapsed*9)*.045;
    flame.position.x=Math.sin(elapsed*7)*.035;heart.scale.y=.23+Math.sin(elapsed*13)*.025;
    light.intensity=8+Math.sin(elapsed*9)*.6; };
}
