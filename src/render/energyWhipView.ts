import * as THREE from 'three';
import type { WhipSnapshot } from '../core/energyWhip';
import type { Vec3 } from '../core/types';
import type { CombatTarget } from '../core/combat';

const LINKS=18, HISTORY=4;
const glow=(color:number,opacity:number)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,
  blending:THREE.AdditiveBlending,depthWrite:false});

/** Fixed-size procedural effects. The bright strand is always the core's clipped collision curve. */
export class EnergyWhipView {
  readonly group=new THREE.Group();
  private readonly links:THREE.Mesh[]=[];
  private readonly sheaths:THREE.Mesh[]=[];
  private readonly dummies:THREE.Mesh[]=[];
  private readonly core=new THREE.MeshBasicMaterial({color:0xf0fffd});
  private readonly energy=glow(0x53e5dc,.24);
  private readonly ring=new THREE.Mesh(new THREE.RingGeometry(1.63,1.7,48),new THREE.MeshBasicMaterial({color:0xc1ae8a,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false}));
  private readonly arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(),1.25,0xa6ece5,.3,.16);
  private readonly handle=new THREE.Group();
  private readonly tip=new THREE.Group();
  private readonly trailPositions=new Float32Array(HISTORY*(LINKS-1)*6*3);
  private readonly trailColors=new Float32Array(this.trailPositions.length);
  private readonly trailGeometry=new THREE.BufferGeometry();
  private readonly trailMaterial=Object.assign(glow(0x53e5dc,.22),{side:THREE.DoubleSide,vertexColors:true});
  private readonly trail=new THREE.Mesh(this.trailGeometry,this.trailMaterial);
  private readonly history=Array.from({length:HISTORY},()=>({time:-100,points:Array.from({length:LINKS},()=>new THREE.Vector3())}));
  private readonly bursts=Array.from({length:4},()=>{
    const material=glow(0xc7fff2,.9),root=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.RingGeometry(.13,.19,24),material);
    const flash=new THREE.Mesh(new THREE.OctahedronGeometry(.14),material);
    const shards=Array.from({length:7},()=>new THREE.Mesh(new THREE.ConeGeometry(.027,.21,4),material));
    root.add(ring,flash,...shards);return {root,ring,flash,shards,material,tick:-100,guarded:false,heavy:false};
  });
  private burstIndex=0;
  private lastContact='';
  private sequence=-1;
  private readonly scratch=new THREE.Vector3();
  private readonly a=new THREE.Vector3();
  private readonly b=new THREE.Vector3();
  private readonly up=new THREE.Vector3(0,1,0);
  constructor(scene:THREE.Scene,targets:readonly CombatTarget[]){
    this.group.name='prototype-whip';scene.add(this.group);
    this.group.add(this.ring,this.arrow,this.handle,this.tip,this.trail,...this.bursts.map(b=>b.root));
    this.ring.rotation.x=-Math.PI/2;
    const segment=new THREE.CylinderGeometry(1,1,1,8);
    for(let i=0;i<LINKS;i++){
      const mesh=new THREE.Mesh(segment,this.core),aura=new THREE.Mesh(segment,this.energy);
      this.links.push(mesh);this.sheaths.push(aura);this.group.add(aura,mesh);
    }
    // Dark grip, warm metal collars and an inset energy cell; no external asset or global bloom pass.
    const metal=new THREE.MeshStandardMaterial({color:0xb59662,metalness:.7,roughness:.32});
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,.32,10),new THREE.MeshStandardMaterial({color:0x203d49,metalness:.3,roughness:.55}));
    this.handle.add(grip);
    for(const y of [-.15,.14]){const collar=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.055,10),metal);collar.position.y=y;this.handle.add(collar);}
    const cell=new THREE.Mesh(new THREE.OctahedronGeometry(.075),this.core);cell.scale.set(.65,1.5,.65);cell.position.set(0,.03,.055);this.handle.add(cell);
    for(let i=0;i<3;i++){const band=new THREE.Mesh(new THREE.TorusGeometry(.074,.008,4,10),metal);band.rotation.x=Math.PI/2;band.position.y=-.09+i*.06;this.handle.add(band);}
    const tipCore=new THREE.Mesh(new THREE.OctahedronGeometry(.09),this.core);tipCore.scale.set(.65,2.4,.65);this.tip.add(tipCore);
    const tipGlow=new THREE.Mesh(new THREE.OctahedronGeometry(.15),this.energy);tipGlow.scale.set(.6,2,.6);this.tip.add(tipGlow);
    this.trailGeometry.setAttribute('position',new THREE.BufferAttribute(this.trailPositions,3).setUsage(THREE.DynamicDrawUsage));
    this.trailGeometry.setAttribute('color',new THREE.BufferAttribute(this.trailColors,3).setUsage(THREE.DynamicDrawUsage));
    this.trail.frustumCulled=false;this.trail.name='whip-trail';
    const ball=new THREE.SphereGeometry(1,12,8);
    for(const target of targets){const mesh=new THREE.Mesh(ball,new THREE.MeshStandardMaterial({color:0x72b7b6,roughness:.7,wireframe:true}));
      mesh.position.set(target.center.x,target.center.y,target.center.z);mesh.scale.setScalar(target.radius);this.dummies.push(mesh);this.group.add(mesh);}
    this.hide();
  }
  hide(){this.group.visible=false;this.clearHistory();this.lastContact='';for(const b of this.bursts){b.tick=-100;b.root.visible=false;}}
  private clearHistory(){for(const h of this.history)h.time=-100;this.trail.visible=false;}
  private drawTrail(points:readonly Vec3[],time:number,active:boolean){
    if(!active){this.clearHistory();return;}
    let vertex=0;
    for(let row=0;row<HISTORY;row++){
      const old=this.history[row]!;
      if(time-old.time>7)continue;
      const newer=row===0?points:this.history[row-1]!.points;
      for(let i=1;i<points.length;i++)for(const [side,index] of [[0,i-1],[1,i-1],[0,i],[0,i],[1,i-1],[1,i]] as const){
        const p=side?old.points[index]!:(newer[index]??newer[newer.length-1])!;
        const strength=Math.max(0,1-(time-(side?old.time:row?this.history[row-1]!.time:time))/7)*(index/(points.length-1));
        this.trailPositions.set([p.x,p.y,p.z],vertex*3);this.trailColors.fill(strength,vertex*3,vertex*3+3);vertex++;
      }
    }
    this.trailGeometry.setDrawRange(0,vertex);this.trailGeometry.attributes.position!.needsUpdate=true;this.trailGeometry.attributes.color!.needsUpdate=true;
    this.trail.visible=vertex>0;
    if(time-this.history[0]!.time>=1.5){
      const slot=this.history.pop()!;slot.time=time;
      slot.points.forEach((p,i)=>{const v=points[Math.min(i,points.length-1)]!;p.set(v.x,v.y,v.z);});this.history.unshift(slot);
    }
  }
  update(w:WhipSnapshot,hand:THREE.Vector3,foot:Vec3,aim:Vec3,boss:Vec3|null,tick:number,practice:boolean,reduced:boolean){
    this.group.visible=true;
    if(w.sequence!==this.sequence){this.clearHistory();this.sequence=w.sequence;}
    const heavy=w.attack==='overhead',color=heavy?0xffbf69:w.phase==='return'?0x87bfff:0x53e5dc;
    this.energy.color.setHex(color);this.trailMaterial.color.setHex(color);
    this.energy.opacity=reduced?.12:.24;
    this.handle.position.copy(hand);this.handle.rotation.set(0,w.yaw,Math.PI/3);
    const points=w.points.length?[hand,...w.points]:[];
    this.tip.visible=points.length>1;
    if(this.tip.visible){const p=points.at(-1)!,q=points.at(-2)!;this.tip.position.set(p.x,p.y,p.z);
      this.scratch.set(p.x-q.x,p.y-q.y,p.z-q.z);if(this.scratch.lengthSq()>1e-8)this.tip.quaternion.setFromUnitVectors(this.up,this.scratch.normalize());
      this.tip.scale.setScalar(heavy?1.25:1);}
    this.links.forEach((mesh,i)=>{
      const aura=this.sheaths[i]!;mesh.visible=aura.visible=i<points.length-1;if(!mesh.visible)return;
      const p=points[i]!,q=points[i+1]!;this.a.set(p.x,p.y,p.z);this.b.set(q.x,q.y,q.z);
      this.scratch.subVectors(this.b,this.a);const length=this.scratch.length(),t=i/Math.max(1,points.length-2);
      const radius=(.034-.019*t)*(heavy?1.15:1);
      mesh.position.copy(this.a).add(this.b).multiplyScalar(.5);mesh.scale.set(radius,length,radius);
      if(length>1e-8)mesh.quaternion.setFromUnitVectors(this.up,this.scratch.normalize());
      aura.position.copy(mesh.position);aura.quaternion.copy(mesh.quaternion);aura.scale.set(radius*2.7,length,radius*2.7);
    });
    // Short, dim history only during damage windows; it never adds collision or survives a cancel.
    this.drawTrail(points,tick+(w.age%1),!reduced&&points.length>1&&(w.phase==='forward'||w.phase==='return'));
    this.ring.visible=!!boss;if(boss)this.ring.position.set(boss.x,.025,boss.z);
    this.arrow.position.set(foot.x,foot.y+.035,foot.z);this.arrow.setDirection(this.scratch.set(aim.x,0,aim.z));
    this.dummies.forEach(m=>{m.visible=practice;});
    if(!w.contact){this.lastContact='';for(const b of this.bursts)b.tick=-100;}
    else {
      const key=`${w.sequence}:${w.contact.tick}:${w.contact.target}:${w.contact.phase}`;
      if(key!==this.lastContact){
        const b=this.bursts[this.burstIndex++%this.bursts.length]!,p=w.contact.point;
        b.tick=w.contact.tick;b.guarded=w.contact.guarded;b.heavy=w.contact.attack==='overhead';b.root.position.set(p.x,p.y,p.z);
        b.ring.lookAt(foot.x,foot.y+3,foot.z);b.material.color.setHex(b.guarded?0x9badc4:b.heavy?0xffdf94:0xb6fff0);
        this.lastContact=key;
      }
    }
    for(const b of this.bursts){
      const age=(tick-b.tick)/60,duration=b.guarded?.12:.2;
      b.root.visible=age>=0&&age<duration;if(!b.root.visible)continue;
      const fade=1-age/duration,force=(b.guarded?.65:b.heavy?1.4:1)*(reduced?.65:1);
      b.material.opacity=fade*(b.guarded?.6:1);b.ring.scale.setScalar(force*(1+age*12));
      b.flash.visible=age<.06;b.flash.scale.setScalar(force*(.5+fade));
      b.shards.forEach((shard,i)=>{
        shard.visible=!reduced;
        const angle=i*Math.PI*2/b.shards.length,r=age*(b.guarded?1.7:3.6);
        shard.position.set(Math.cos(angle)*r,.04+Math.sin(angle)*r,Math.sin(angle*2)*r*.5);
        shard.rotation.set(angle,angle*.5,-angle);shard.scale.set(fade,force*fade,fade);
      });
    }
  }
  diagnostics(){return {visible:this.group.visible,trail:this.trail.visible,segments:this.links.filter(l=>l.visible).length,
    bursts:this.bursts.filter(b=>b.root.visible).length,guarded:this.bursts.some(b=>b.root.visible&&b.guarded)};}
}
