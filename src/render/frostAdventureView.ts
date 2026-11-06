import * as THREE from 'three';
import {FROST_GUARDS,FROST_MISSION} from '../arena/frostAdventure';
import {FROST_GUARD_RULES} from '../core/frostGuard';
import type {FrostAdventureState} from '../core/frostAdventureFight';
import type {RayWorld} from '../core/types';

export class FrostAdventureView {
  private readonly guards=FROST_GUARDS.map(()=>({root:new THREE.Group(),gem:new THREE.Mesh(new THREE.OctahedronGeometry(.65),new THREE.MeshStandardMaterial({color:0x91d6f1,emissive:0x247fb0,emissiveIntensity:.7,roughness:.35})),
    warning:new THREE.Mesh(new THREE.PlaneGeometry(.1,18),new THREE.MeshBasicMaterial({color:0xffbd78,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false})),
    shot:new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshBasicMaterial({color:0xf5c88d})),hp:new THREE.Mesh(new THREE.PlaneGeometry(1,.07),new THREE.MeshBasicMaterial({color:0xa9f2da}))}));
  private readonly valve=new THREE.Group();
  private readonly ringMaterial=new THREE.MeshBasicMaterial({color:0xffcf79,side:THREE.DoubleSide});
  private readonly exitSeal=new THREE.Mesh(new THREE.BoxGeometry(3,2.8,.08),new THREE.MeshBasicMaterial({color:0x68ddff,transparent:true,opacity:.32,depthWrite:false}));
  private readonly egg=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,1),new THREE.MeshStandardMaterial({color:0x7bc8e2,roughness:.3,metalness:.25}));
  constructor(scene:THREE.Scene){
    const stone=new THREE.MeshStandardMaterial({color:0x4e7d90,roughness:.85});
    this.guards.forEach((g,i)=>{const def=FROST_GUARDS[i]!;g.root.position.set(def.center.x,0,def.center.z);g.gem.position.y=1;g.root.add(g.gem);
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.48,.75,.45,6),stone);base.position.y=.23;g.root.add(base);
      for(const side of [-1,1]){const prong=new THREE.Mesh(new THREE.ConeGeometry(.18,.7,5),stone);prong.position.set(side*.55,.65,0);prong.rotation.z=-side*.4;g.root.add(prong);}
      g.warning.rotation.x=-Math.PI/2;g.hp.position.y=2.1;g.root.add(g.hp);scene.add(g.root,g.warning,g.shot);
    });
    const v=FROST_MISSION.valve;this.valve.position.set(v.x,0,v.z);
    const column=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,.9,8),stone);column.position.y=.45;this.valve.add(column);
    const wheel=new THREE.Mesh(new THREE.TorusGeometry(.48,.08,6,12),new THREE.MeshStandardMaterial({color:0xc4ab77,metalness:.6,roughness:.4}));wheel.rotation.x=-Math.PI/3;wheel.position.y=1;this.valve.add(wheel);
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.1,1.18,32),this.ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=.035;this.valve.add(ring);scene.add(this.valve);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-14,.04,-6.2),new THREE.Vector3(-14,.04,-10.5),new THREE.Vector3(-4,.04,-10.5),new THREE.Vector3(-4,.04,4)]),new THREE.LineBasicMaterial({color:0x509fae}));scene.add(line);
    const exit=FROST_MISSION.exit;this.exitSeal.position.set(exit.x,1.4,exit.z-1.2);scene.add(this.exitSeal);
    for(const x of [-1.7,1.7]){const pillar=new THREE.Mesh(new THREE.BoxGeometry(.4,3,.5),stone);pillar.position.set(exit.x+x,1.5,exit.z-1.2);scene.add(pillar);}
    const exitRing=new THREE.Mesh(new THREE.RingGeometry(1.25,1.35,40),new THREE.MeshBasicMaterial({color:0x9de8dd,side:THREE.DoubleSide}));exitRing.rotation.x=-Math.PI/2;exitRing.position.set(exit.x,.04,exit.z);scene.add(exitRing);
    this.egg.position.set(0,1.2,-1);this.egg.scale.set(1,.8,1);scene.add(this.egg);
  }
  update(state:FrostAdventureState,camera:THREE.Camera,world:RayWorld){
    this.egg.visible=!state.bossActive;this.exitSeal.visible=state.pve.outcome!=='victory';this.ringMaterial.color.setHex(state.checkpoint?0x80e4ce:0xffcf79);
    this.guards.forEach((g,i)=>{const s=state.guards[i]!;g.root.visible=s.hp>0;g.gem.rotation.y=s.facing;g.gem.scale.setScalar(s.phase==='warning'?1+s.phaseTick/FROST_GUARD_RULES.warning*.12:1);
      g.hp.quaternion.copy(camera.quaternion);g.hp.scale.x=s.hp/FROST_GUARD_RULES.hp;
      g.warning.visible=s.phase==='warning';const direction={x:Math.sin(s.facing),y:0,z:Math.cos(s.facing)};
      const length=world.raycast({origin:s.center,direction},18,true)?.distance??18;
      g.warning.position.set(s.center.x+direction.x*length/2,.045,s.center.z+direction.z*length/2);
      g.warning.rotation.set(-Math.PI/2,0,-s.facing);g.warning.scale.y=length/18;
      g.shot.visible=!!s.shot;if(s.shot){g.shot.position.set(s.shot.x,s.shot.y,s.shot.z);g.shot.rotation.y=s.facing;}
    });
  }
}
