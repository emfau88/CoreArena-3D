import * as THREE from 'three';
import type { WhipSnapshot } from '../core/energyWhip';
import type { Vec3 } from '../core/types';
import type { CombatTarget } from '../core/combat';

/** A fixed allocation per lab session. All damaging segments are the core's clipped curve. */
export class EnergyWhipView {
  readonly group=new THREE.Group();
  private readonly links:THREE.Mesh[]=[];
  private readonly sparks:THREE.Mesh[]=[];
  private readonly dummies:THREE.Mesh[]=[];
  private readonly core=new THREE.MeshBasicMaterial({color:0xffdf83});
  private readonly sparkMaterial=new THREE.MeshBasicMaterial({color:0xfff2ca});
  private readonly ring=new THREE.Mesh(new THREE.RingGeometry(1.63,1.7,48),new THREE.MeshBasicMaterial({color:0xc1ae8a,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false}));
  private readonly arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(),1.25,0xa6ece5,.3,.16);
  private readonly handle=new THREE.Mesh(new THREE.CylinderGeometry(.065,.08,.34,6),new THREE.MeshStandardMaterial({color:0x36545a,roughness:.6}));
  private readonly tip=new THREE.Mesh(new THREE.OctahedronGeometry(.1),this.core);
  private readonly contactRing=new THREE.Mesh(new THREE.RingGeometry(.13,.2,12),new THREE.MeshBasicMaterial({color:0xfff4db,side:THREE.DoubleSide,transparent:true,depthWrite:false}));
  private readonly scratch=new THREE.Vector3();
  private readonly a=new THREE.Vector3();
  private readonly b=new THREE.Vector3();
  private readonly up=new THREE.Vector3(0,1,0);
  constructor(scene:THREE.Scene,targets:readonly CombatTarget[]){
    this.group.name='prototype-whip';scene.add(this.group);this.group.add(this.ring,this.arrow,this.handle,this.tip,this.contactRing);
    this.ring.rotation.x=-Math.PI/2;
    const segment=new THREE.CylinderGeometry(.035,.035,1,6),spark=new THREE.SphereGeometry(.065,5,4);
    for(let i=0;i<18;i++){const mesh=new THREE.Mesh(segment,this.core);this.links.push(mesh);this.group.add(mesh);}
    for(let i=0;i<6;i++){const mesh=new THREE.Mesh(spark,this.sparkMaterial);this.sparks.push(mesh);this.group.add(mesh);}
    const ball=new THREE.SphereGeometry(1,12,8);
    for(const target of targets){const mesh=new THREE.Mesh(ball,new THREE.MeshStandardMaterial({color:0x72b7b6,roughness:.7,wireframe:true}));
      mesh.position.set(target.center.x,target.center.y,target.center.z);mesh.scale.setScalar(target.radius);this.dummies.push(mesh);this.group.add(mesh);}
    this.hide();
  }
  hide(){this.group.visible=false;}
  update(w:WhipSnapshot,hand:THREE.Vector3,foot:Vec3,aim:Vec3,boss:Vec3|null,tick:number,practice:boolean,reduced:boolean){
    this.group.visible=true;this.core.color.setHex(w.phase==='return'?0x95efee:0xffdf83);
    this.handle.position.copy(hand);this.handle.rotation.set(0,w.yaw,Math.PI/3);
    // Hand connector is visual only; collision starts after the short core anchor segment.
    const points=w.points.length?[hand,...w.points]:[];
    this.tip.visible=points.length>1;if(this.tip.visible){const p=points.at(-1)!;this.tip.position.set(p.x,p.y,p.z);}
    this.links.forEach((mesh,i)=>{mesh.visible=i<points.length-1;if(!mesh.visible)return;
      const p=points[i]!,q=points[i+1]!;this.a.set(p.x,p.y,p.z);this.b.set(q.x,q.y,q.z);
      this.scratch.subVectors(this.b,this.a);mesh.position.copy(this.a).add(this.b).multiplyScalar(.5);
      mesh.scale.set(1,this.scratch.length(),1);mesh.quaternion.setFromUnitVectors(this.up,this.scratch.normalize());});
    this.ring.visible=!!boss;if(boss)this.ring.position.set(boss.x,.025,boss.z);
    this.arrow.position.set(foot.x,foot.y+.035,foot.z);this.arrow.setDirection(this.scratch.set(aim.x,0,aim.z));
    this.dummies.forEach(m=>{m.visible=practice;});
    const age=w.contact?(tick-w.contact.tick)/60:1;
    this.contactRing.visible=age>=0&&age<.18;
    if(this.contactRing.visible){const p=w.contact!.point;this.contactRing.position.set(p.x,p.y,p.z);
      this.contactRing.lookAt(foot.x,foot.y+3,foot.z);this.contactRing.scale.setScalar(1+age*8);this.contactRing.material.opacity=1-age/.18;}
    this.sparks.forEach((mesh,i)=>{mesh.visible=!reduced&&age>=0&&age<.14;if(!mesh.visible)return;
      const angle=i*Math.PI/3,point=w.contact!.point;mesh.position.set(point.x+Math.cos(angle)*age*2,point.y+age,point.z+Math.sin(angle)*age*2);mesh.scale.setScalar(1-age/.14);});
  }
}
