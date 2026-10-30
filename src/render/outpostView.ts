import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { OUTPOST_PROPS } from '../arena/stoneDressing';
import type { AdventureFightState } from '../core/adventureFight';
import { labelMesh } from './practiceView';

/** Fixed dressing for the three existing places. No additional downloads or lights. */
export class OutpostView {
  private readonly power=new THREE.MeshStandardMaterial({color:0x314b46,emissive:0x89e4cf,emissiveIntensity:0,roughness:.7});
  private readonly service=new THREE.MeshStandardMaterial({color:0x465755,emissive:0x8bc7df,emissiveIntensity:0,roughness:.7});
  private readonly reserveLid:THREE.Group;
  private readonly reserveLight=new THREE.MeshBasicMaterial({color:0x9bd4ff});
  constructor(scene:THREE.Scene,drone:THREE.Group){
    const iron=new THREE.MeshStandardMaterial({color:0x384b49,metalness:.45,roughness:.72});
    const cream=new THREE.MeshStandardMaterial({color:0xb2b49b,roughness:.8});
    const amber=new THREE.MeshStandardMaterial({color:0xc79d59,roughness:.7});
    const blue=new THREE.MeshStandardMaterial({color:0x749da7,roughness:.75});
    const batches=new Map<THREE.Material,THREE.BufferGeometry[]>();
    const solid=(geometry:THREE.BufferGeometry,x:number,y:number,z:number,material:THREE.Material,rotation=0)=>{
      geometry.rotateY(rotation).translate(x,y,z);
      const list=batches.get(material)??[];list.push(geometry);batches.set(material,list);
    };
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>solid(new THREE.BoxGeometry(w,h,d),x,y,z,m);
    const line=(ax:number,az:number,bx:number,bz:number,m:THREE.Material,y=.035,width=.08)=>
      solid(new THREE.BoxGeometry(width,.025,Math.hypot(bx-ax,bz-az)),(ax+bx)/2,y,(az+bz)/2,m,Math.atan2(bx-ax,bz-az));
    const label=(text:string,x:number,z:number,w=3,y=.065)=>{
      const mesh=labelMesh(text,w);mesh.rotation.set(-Math.PI/2,0,Math.PI/2);mesh.position.set(x,y,z);scene.add(mesh);
    };
    const pad=(x:number,z:number,w:number,d:number,m:THREE.Material)=>{
      for(const side of [-1,1]){
        line(x+side*w/2,z-d/2,x+side*w/2,z+d/2,m);
        line(x-w/2,z+side*d/2,x+w/2,z+side*d/2,m);
      }
    };
    // Two grounded charging berths: one stranded courier, one empty. Amber supply and cargo.
    pad(-3,34,3,3.4,amber);pad(-9,34,3,3.4,amber);
    line(-7,34,-4.5,34,amber);line(-7,34,-7.5,34,amber);
    label('01 · LADEN',-5.8,30.7,4.3);label('PULSE',-3,20.5,2.5);
    pad(-3,18.5,2.5,2.6,amber);line(-5.3,18.5,-4.3,18.5,amber);
    // The existing wide stair gets a low edge stripe and a visible optional destination.
    for(const [x,y]of[[-4.45,.28],[-5.45,.55],[-6.5,.82]] as const)
      for(const z of [.15,3.85])box(x,y+.025,z,.9,.035,.12,blue);
    label('RESERVE ↑',-2.6,2,3.6);label('02 · WARTUNG',4,-4.5,4.5);
    label('75 RÜSTUNG',-12.3,2,2.6,1.15);
    line(6,-8,-3,-8,this.service);line(-3,-8,-3,-10,this.service);
    label('03 · RELAIS',3,-36.3,4.2);
    for(const side of [-1,1]){
      line(side*10.8,-40.2,side*8,-39,this.power);
      line(side*8,-39,-3,-39,this.power);
    }
    this.reserveLid=new THREE.Group();scene.add(this.reserveLid);
    for(const p of OUTPOST_PROPS){
      const {x,y,z,width:w,height:h,depth:d}=p;
      const cabinet=p.kind==='repair'?h-.55:h;
      // A solid cabinet/case footprint, identical to the Rapier obstacle. Surface details stay within it.
      box(x,y+cabinet/2,z,w,cabinet,d,p.kind==='cargo'?amber:iron);
      box(x,y+cabinet-.05,z,w,.1,d,p.kind==='reserve'?iron:cream);
      if(p.kind==='charger'){
        box(x+.51,y+1.05,z,.035,.55,.65,amber);
        for(let i=0;i<3;i++)box(x+.53,y+.9+i*.14,z,.025,.05,.4,cream);
      }else if(p.kind==='cargo'){
        for(const offset of [-.95,.95])box(x+offset,y+h/2,z,.12,h+.02,d+.02,iron);
        label('FRACHT',x,z,1.8,y+h+.02);
      }else if(p.kind==='weapon'||p.kind==='repair'){
        for(const sign of [-1,1])box(x+sign*w*.35,y+cabinet+.015,z,.16,.035,d*.85,blue);
        if(p.kind==='repair'){
          for(const side of [-1,1]){
            box(x+side*(w/2-.08),y+h-.04,z,.16,.08,d,blue);
            for(const dz of [-d/2+.08,d/2-.08])box(x+side*(w/2-.08),y+cabinet+.25,z+dz,.16,.5,.16,iron);
          }
          const spare=drone.clone(true),bounds=new THREE.Box3().setFromObject(spare),size=bounds.getSize(new THREE.Vector3());
          spare.scale.multiplyScalar(Math.min(1.6/size.x,.55/size.y,1.3/size.z));
          bounds.setFromObject(spare);const center=bounds.getCenter(new THREE.Vector3());
          spare.position.add(new THREE.Vector3(x-center.x,y+cabinet-bounds.min.y,z-center.z));spare.name='outpost-drone-repair';scene.add(spare);
        }else{
          for(const dz of [-.7,.7])box(x,y+h+.08,z+dz,.65,.16,.35,blue);
        }
      }else if(p.kind==='capacitor'){
        for(let i=0;i<4;i++)box(x,y+.35+i*.45,z,w+.04,.1,d+.04,cream);
        box(x+.82,y+1.15,z,.04,1.8,.27,this.power);
        box(x-.82,y+1.15,z,.04,1.8,.27,this.power);
      }else{
        this.reserveLid.position.set(x,y+h,z-d/2);
        const lid=new THREE.Mesh(new THREE.BoxGeometry(w,.09,d),blue);lid.position.z=d/2;this.reserveLid.add(lid);
        const plate=new THREE.Mesh(new THREE.BoxGeometry(.06,.45,.65),this.reserveLight);plate.position.set(x+w/2+.025,y+.55,z);scene.add(plate);
        label('R',x,z,.75,y+h+.06);
      }
    }
    // Merge the fixed details by material: the extra dressing costs a handful of draws.
    for(const [material,parts] of batches){
      const mesh=new THREE.Mesh(mergeGeometries(parts),material);parts.forEach(g=>g.dispose());
      mesh.name='outpost-equipment';mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);
    }
  }
  update(state:AdventureFightState):void{
    this.service.emissiveIntensity=state.consoleActive?.7:0;
    this.power.emissiveIntensity=state.relayActive?1.3:0;
    this.reserveLid.rotation.x=state.reserveRecovered?-1.1:0;
    this.reserveLight.color.setHex(state.reserveRecovered?0x53615b:0x9bd4ff);
  }
}
