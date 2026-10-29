import * as THREE from 'three';
import { WEAPONS, type ArcShot } from '../core/combat';

/** Five branching, animated electric strands. Fixed buffers; no per-frame mesh allocation. */
export class ArcView {
  private readonly root=new THREE.Group();
  private readonly core:THREE.InstancedMesh;
  private readonly glow:THREE.InstancedMesh;
  private readonly transform=new THREE.Object3D();
  private readonly from=new THREE.Vector3();
  private readonly to=new THREE.Vector3();
  private readonly delta=new THREE.Vector3();
  private readonly up=new THREE.Vector3(0,1,0);
  private beamCount=0;
  constructor(parent:THREE.Group) {
    const geometry=new THREE.CylinderGeometry(1,1,1,5);
    this.core=new THREE.InstancedMesh(geometry,new THREE.MeshBasicMaterial({color:0xeaddff,toneMapped:false}),40);
    this.glow=new THREE.InstancedMesh(geometry,new THREE.MeshBasicMaterial({color:0xa95bff,
      transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),40);
    this.core.frustumCulled=this.glow.frustumCulled=false;
    this.root.add(this.glow,this.core);parent.add(this.root);this.root.visible=false;
  }
  diagnostics(){return {visible:this.root.visible,beams:this.beamCount};}
  update(tick:number,shot:ArcShot|null):void {
    const age=shot?tick-shot.tick:-1;
    this.root.visible=!!shot && age>=0 && age<WEAPONS.arc.burstTicks;
    this.beamCount=this.root.visible?shot!.beams.length:0;
    if(!this.root.visible || !shot)return;
    const muzzle=shot.aim.muzzle;
    let instance=0;
    for(let beam=0;beam<shot.beams.length;beam++) {
      const end=shot.beams[beam]!.end;
      this.from.set(muzzle.x,muzzle.y,muzzle.z);
      for(let segment=1;segment<=8;segment++) {
        const t=segment/8,envelope=Math.sin(t*Math.PI),phase=segment*13+beam*7+Math.floor(tick/2)*2.3;
        this.to.set(muzzle.x+(end.x-muzzle.x)*t+Math.sin(phase)*.11*envelope,
          muzzle.y+(end.y-muzzle.y)*t+Math.cos(phase*1.7)*.1*envelope,
          muzzle.z+(end.z-muzzle.z)*t+Math.sin(phase*1.3)*.11*envelope);
        this.delta.subVectors(this.to,this.from);const length=this.delta.length();
        this.transform.position.copy(this.from).add(this.to).multiplyScalar(.5);
        this.transform.quaternion.setFromUnitVectors(this.up,this.delta.normalize());
        const width=(beam===2?.026:.019)*(1+Math.sin(phase)*.15);
        this.transform.scale.set(width,length,width);this.transform.updateMatrix();this.core.setMatrixAt(instance,this.transform.matrix);
        this.transform.scale.set(width*3.4,length,width*3.4);this.transform.updateMatrix();this.glow.setMatrixAt(instance,this.transform.matrix);
        instance++;this.from.copy(this.to);
      }
    }
    this.core.count=this.glow.count=instance;
    this.core.instanceMatrix.needsUpdate=this.glow.instanceMatrix.needsUpdate=true;
  }
}
