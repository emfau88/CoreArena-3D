import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STONE_CONSOLES } from '../arena/stoneDressing';

const names = ['Birch_Tree_1', 'Blackberry_Bush_1b', 'Fern_1a', 'Forest_Grass_1',
  'Fly_Agaric_Group_1', 'Bay_Bolete_Group_1', 'Tree_Stump_1', 'Woodruff_Cluster_1'] as const;
type PlantName = typeof names[number];
interface Part { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }
export interface DressingAssets { plants: Record<PlantName, Part[]>; consoles: THREE.Group[] }

/** Only the freely downloadable examples; licence files travel with the local assets. */
export async function loadDressingAssets(): Promise<DressingAssets> {
  const loader = new GLTFLoader(), base = `${import.meta.env.BASE_URL}assets/`;
  const [forest, ...computers] = await Promise.all([
    loader.loadAsync(`${base}assetquest/forest-details.glb`),
    loader.loadAsync(`${base}retro-tech/console-a.glb`),
    loader.loadAsync(`${base}retro-tech/console-b.glb`),
  ]);
  forest.scene.updateMatrixWorld(true);
  const plants = {} as DressingAssets['plants'];
  for (const name of names) {
    const root = forest.scene.getObjectByName(name);
    if (!root) throw new Error(`Missing AssetQuest model: ${name}`);
    const bounds = new THREE.Box3().setFromObject(root), center = bounds.getCenter(new THREE.Vector3());
    const parts: Part[] = [];
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
      geometry.translate(-center.x, -bounds.min.y, -center.z);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const m = material as THREE.MeshStandardMaterial;
        m.roughness = 1; m.metalness = 0;
        if (m.name === 'assetquest-leaves') {
          // Cutout leaves write real depth; no transparent cards hovering over the paving.
          m.transparent = false; m.alphaTest = .5; m.depthWrite = true; m.side = THREE.DoubleSide;
          m.color.setHex(0xd9e2bd);
        }
        if (m.map) m.map.anisotropy = 4;
        m.needsUpdate = true;
      }
      parts.push({ geometry, material: object.material });
    });
    plants[name] = parts;
  }
  const consoles = computers.map(file => {
    const root = new THREE.Group(); root.add(file.scene);
    const bounds = new THREE.Box3().setFromObject(file.scene), size = bounds.getSize(new THREE.Vector3());
    const scale = Math.min(2.2 / size.x, 1 / size.y, 1.18 / size.z);
    file.scene.scale.multiplyScalar(scale);
    bounds.setFromObject(file.scene); const center = bounds.getCenter(new THREE.Vector3());
    file.scene.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
    file.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = object.receiveShadow = true;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const m = material as THREE.MeshStandardMaterial;
        if (m.map) {
          m.map.magFilter = m.map.minFilter = THREE.NearestFilter; m.map.generateMipmaps = false;
        }
        m.roughness = .72; m.side = THREE.FrontSide;
        // Keep the pack's cream/graphite colour separation legible under the green courtyard light.
        m.emissiveMap = m.map; m.emissive.setHex(0xffffff); m.emissiveIntensity = .12;
      }
    });
    return root;
  });
  return { plants, consoles };
}

export function buildCourtyardDressing(scene: THREE.Scene, assets: DressingAssets): (dt:number)=>void {
  type Placement = [x:number,y:number,z:number,scale:number,yaw:number];
  const placements = new Map<PlantName, Placement[]>();
  const plant = (name:PlantName,x:number,z:number,scale=1,y=0,yaw=0) => {
    const list=placements.get(name)??[];list.push([x,y,z,scale,yaw]);placements.set(name,list);
  };
  // Grouped, low planting inside the courts: clear centre, steps and pickup approaches.
  const pockets: Array<[number,number,number]> = [
    [-13.7,31,.9],[-13.9,23.2,1],[-12.5,18.2,.85],[13.8,33,1],[14.2,26.5,.8],[12.8,19,.9],
    [-9.7,26.3,.65],[9.8,23.4,.6],[-14.8,9,.9],[14.8,9.3,1],[-16,-6.5,.8],
    [15.5,-10.3,.8],[9,3,.55],[-7.9,-7.8,.65],
    [-15.8,-19.2,.7],[15.5,-24,.8],[-15.9,-32.5,.9],[14.5,-35.8,.75],[-13.8,-39.7,.7],
  ];
  pockets.forEach(([x,z,s],i)=>{
    plant('Blackberry_Bush_1b',x,z,s,0,i*2.4);
    plant('Forest_Grass_1',x+.65,z+.2,s*.62,-.012,i*1.8);
    plant('Woodruff_Cluster_1',x-.6,z+.65,s*.65,0,i*1.3);
    plant('Fern_1a',x+.35,z-.7,s*.43,0,i*2.1);
    if(i%2===0) plant('Fly_Agaric_Group_1',x-.65,z-.45,s*1.25,0,i);
    else plant('Bay_Bolete_Group_1',x+.75,z-.45,s*1.4,0,i);
  });
  // Tufts grow along the foot of the walls, not as large flat overlay patches.
  for(const [edge,back,front] of [[15.1,17.5,36.5],[17.1,-10.5,10.5],[17.1,-40.5,-17.8]]) {
    for(const side of [-1,1]) for(let z=back!;z<front!;z+=3.1) {
      plant('Forest_Grass_1',side*edge!,z,.38,0,z*.5);
      plant('Woodruff_Cluster_1',side*(edge!-.3),z+.55,.42,0,z);
    }
  }
  // Sparse crowns beyond the walls frame the courts without covering enemies or landings.
  for(const [x,z,s] of [[-17.3,35,.46],[-17.3,20,.42],[-19.1,8,.48],[-19.1,-8,.46],[-19.1,-22,.44],[-19.1,-39,.48],
    [17.3,33.5,.36],[19.1,3,.36],[19.1,-34,.36]]) {
    plant('Birch_Tree_1',x!,z!,s!,-.04,z!);
    plant('Blackberry_Bush_1b',x!+.25,z!-.8,.85,-.04,z!);
    plant('Forest_Grass_1',x!-.2,z!+.8,.65,-.04,x!);
  }
  plant('Tree_Stump_1',-17.4,28,1.25,-.1,.5);
  plant('Tree_Stump_1',19.1,-6,1.3,-.1,1);
  plant('Tree_Stump_1',-19.2,-35,1.2,-.1,2);
  plant('Woodruff_Cluster_1',-14.8,5.1,.55,1.1,.7);
  plant('Woodruff_Cluster_1',-14.2,-24.6,.5,1.1,2);
  plant('Fern_1a',12.8,-8.8,.4,.8,1.2);

  for(const [name,list] of placements) for(const part of assets.plants[name]) {
    const mesh=new THREE.InstancedMesh(part.geometry,part.material,list.length),transform=new THREE.Object3D();
    list.forEach(([x,y,z,s,yaw],index)=>{
      transform.position.set(x,y,z);transform.scale.setScalar(s);transform.rotation.set(0,yaw,0);transform.updateMatrix();
      mesh.setMatrixAt(index,transform.matrix);
    });
    mesh.name=`assetquest-${name}`;mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);
  }

  const stone=new THREE.MeshStandardMaterial({color:0x7c8277,roughness:.9});
  const iron=new THREE.MeshStandardMaterial({color:0x3f514d,metalness:.45,roughness:.75});
  const brass=new THREE.MeshStandardMaterial({color:0x969c83,metalness:.25,roughness:.7});
  const glow=new THREE.MeshBasicMaterial({color:0x9bd7bb});
  const amber=new THREE.MeshBasicMaterial({color:0xe7b96f});
  const indicators:THREE.Mesh[]=[];
  const box=(parent:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);
    mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  for(const station of STONE_CONSOLES) {
    const group=new THREE.Group();group.name=station.id;group.position.set(station.x,0,station.z);group.rotation.y=station.yaw;scene.add(group);
    box(group,0,.09,0,2.4,.18,1.3,stone);
    box(group,0,.39,0,2.28,.42,1.18,iron);
    box(group,0,.615,0,2.4,.09,1.3,brass);
    const computer=assets.consoles[station.variant]!.clone(true);computer.position.y=.66;group.add(computer);
    box(group,-.76,.39,.601,.58,.16,.025,brass);
    box(group,-.76,.39,.617,.45,.045,.015,amber);
    for(let i=0;i<3;i++) indicators.push(box(group,.5+i*.16,.39,.61,.07,.07,.025,glow));
    // Short conduits are seated on the pedestal; they do not cross a walkable route.
    for(const side of [-1,1]) {
      const cable=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.4,6),iron);
      cable.position.set(side*1.04,.37,.63);group.add(cable);
    }
  }
  let elapsed=0;
  return dt=>{elapsed+=dt;indicators.forEach((mesh,i)=>{mesh.visible=Math.sin(elapsed*.8+i*.7)>-.9;});};
}
