import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ADVENTURE_MISSION } from '../arena/adventureMission';
import type { AdventureFightState } from '../core/adventureFight';
import { labelMesh } from './practiceView';

/** Load just the two reused props. The original Hexwars GLBs remain unchanged. */
export async function loadMissionAssets() {
  const loader=new GLTFLoader(),base=`${import.meta.env.BASE_URL}assets/hexwars/`;
  const [drone,relay]=await Promise.all(['hoverbot.glb','relay.glb'].map(file=>loader.loadAsync(base+file)));
  return {drone:drone!.scene,relay:relay!.scene};
}
type Assets=Awaited<ReturnType<typeof loadMissionAssets>>;

export class AdventureMissionView {
  private readonly lineMaterial=new THREE.MeshStandardMaterial({color:0x354e48,emissive:0x83e6c1,emissiveIntensity:0,roughness:.7});
  private readonly relayMaterial=new THREE.MeshStandardMaterial({color:0x58655d,emissive:0xffd188,emissiveIntensity:0,roughness:.6});
  private readonly consoleMarker:THREE.Group;
  private readonly relayMarker:THREE.Group;
  private readonly socket:THREE.Mesh;
  private readonly droneLamp:THREE.Mesh<THREE.SphereGeometry,THREE.MeshBasicMaterial>;
  private readonly consoleLamp:THREE.Mesh<THREE.SphereGeometry,THREE.MeshBasicMaterial>;
  private time=0;
  constructor(scene:THREE.Scene,assets:Assets) {
    const fit=(model:THREE.Group,definition:typeof ADVENTURE_MISSION.drone|typeof ADVENTURE_MISSION.relay,tilt=0)=>{
      model.rotation.z=tilt;model.rotation.y=-Math.PI/2;
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
      model.scale.multiplyScalar(Math.min(definition.width/size.x,definition.height/size.y,definition.depth/size.z));
      bounds.setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());
      model.position.set(definition.x-center.x,-bounds.min.y,definition.z-center.z);model.name=definition.id;
      model.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=object.receiveShadow=true;}});
      scene.add(model);
    };
    fit(assets.drone,ADVENTURE_MISSION.drone,.32);fit(assets.relay,ADVENTURE_MISSION.relay);
    const lamp=(x:number,y:number,z:number,color:number)=>{
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.13,10,6),new THREE.MeshBasicMaterial({color}));
      mesh.position.set(x,y,z);scene.add(mesh);return mesh;
    };
    this.droneLamp=lamp(-2.2,.55,34,0xf2ae78);
    this.consoleLamp=lamp(-2.3,1.3,-8,0xf2ae78);
    // Thin grounded conduits show the exact connection to the boss and the final relay.
    const segment=(ax:number,az:number,bx:number,bz:number,material:THREE.Material)=>{
      const length=Math.hypot(bx-ax,bz-az),mesh=new THREE.Mesh(new THREE.BoxGeometry(.11,.035,length),material);
      mesh.position.set((ax+bx)/2,.025,(az+bz)/2);mesh.rotation.y=Math.atan2(bx-ax,bz-az);scene.add(mesh);
    };
    segment(-3,-8,-1.5,-10,this.lineMaterial);segment(-1.5,-10,-1.5,-26,this.lineMaterial);
    segment(-1.5,-26,0,-29,this.lineMaterial);segment(0,-29,-3,-39,this.relayMaterial);
    segment(-3,-39,0,-42,this.relayMaterial);
    const marker=(x:number,z:number,text:string)=>{
      const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
      const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.58,40),new THREE.MeshBasicMaterial({color:0xffd188,side:THREE.DoubleSide,depthWrite:false}));
      ring.rotation.x=-Math.PI/2;ring.position.y=.04;group.add(ring);
      const arrow=new THREE.Mesh(new THREE.ConeGeometry(.22,.5,4),new THREE.MeshBasicMaterial({color:0xffd188}));
      arrow.rotation.z=Math.PI;arrow.position.y=2.7;group.add(arrow);
      const label=labelMesh(text,3.5);label.rotation.x=-Math.PI/2;label.rotation.z=Math.PI/2;
      label.position.set(2,.045,0);group.add(label);return group;
    };
    this.consoleMarker=marker(-3,-8,'KONSOLE');this.relayMarker=marker(-3,-39,'RELAIS');
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.48,.58,.22,8),new THREE.MeshStandardMaterial({color:0x455650,roughness:.8}));
    plinth.position.set(-1.8,.11,-39);scene.add(plinth);
    this.socket=new THREE.Mesh(new THREE.OctahedronGeometry(.3),this.relayMaterial);this.socket.position.set(-1.8,.65,-39);scene.add(this.socket);
  }
  update(state:AdventureFightState,dt:number):void {
    this.time+=dt;
    this.lineMaterial.emissiveIntensity=state.consoleActive?.9:0;
    this.relayMaterial.emissiveIntensity=state.relayActive?1.5:0;
    this.socket.visible=state.relayActive;
    this.consoleLamp.material.color.setHex(state.consoleActive?0x9bf2d0:0xf2ae78);
    this.droneLamp.material.color.setHex(state.relayActive?0x9bf2d0:0xf2ae78);
    this.droneLamp.scale.setScalar(state.relayActive?1:.8+Math.sin(this.time*2)*.15);
    this.consoleMarker.visible=!state.consoleActive;
    this.relayMarker.visible=state.pve.outcome==='victory' && !state.relayActive;
    for(const marker of [this.consoleMarker,this.relayMarker])marker.children[1]!.position.y=2.7+Math.sin(this.time*2)*.1;
  }
}
