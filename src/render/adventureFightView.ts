import * as THREE from 'three';
import { ADVENTURE_BOSS } from '../arena/stoneAdventure';
import { PVE_RULES } from '../core/pve';
import { RUNNER_RULES, type RunnerState } from '../core/stoneRunner';
import type { AdventureFightState } from '../core/adventureFight';
import { MonsterView } from './monsterView';

class RunnerView {
  readonly root=new THREE.Group();
  private readonly body=new THREE.Group();
  private readonly arm=new THREE.Group();
  private readonly feet:THREE.Mesh[]=[];
  private readonly vitals=new THREE.Group();
  private readonly hp=new THREE.Mesh(new THREE.PlaneGeometry(1,.07),new THREE.MeshBasicMaterial({color:0xf3b487}));
  private readonly core=new THREE.MeshStandardMaterial({color:0xf2cb83,emissive:0xba742a,emissiveIntensity:1.6});
  private readonly warning=new THREE.Mesh(new THREE.RingGeometry(1.66,RUNNER_RULES.range,24,1,Math.PI/2-.95,1.9),
    new THREE.MeshBasicMaterial({color:0xffac75,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));
  private lastHp=RUNNER_RULES.hp as number;
  private flash=0;
  constructor(scene:THREE.Object3D) {
    const stone=new THREE.MeshStandardMaterial({color:0x788176,roughness:.9,flatShading:true});
    const chunk=(parent:THREE.Group,x:number,y:number,z:number,size:number,material:THREE.Material=stone)=> {
      const m=new THREE.Mesh(new THREE.IcosahedronGeometry(size,0),material); m.position.set(x,y,z);
      m.castShadow=m.receiveShadow=true; parent.add(m); return m;
    };
    chunk(this.body,0,.85,0,.65).scale.set(.85,1,.7);
    chunk(this.body,0,1.5,.12,.35); chunk(this.body,0,.92,.46,.18,this.core);
    chunk(this.body,-.12,1.55,.4,.055,this.core); chunk(this.body,.12,1.55,.4,.055,this.core);
    for(const side of [-1,1]) { this.feet.push(chunk(this.body,side*.27,.15,.1,.23));
      const arm=side<0?this.arm:new THREE.Group(); arm.position.set(side*.55,1.03,0); this.body.add(arm);
      chunk(arm,0,-.3,.08,.25); chunk(arm,0,-.55,.18,.28); }
    const back=new THREE.Mesh(new THREE.PlaneGeometry(1.12,.16),new THREE.MeshBasicMaterial({color:0x172022}));
    back.position.z=-.01; this.vitals.add(back,this.hp);
    this.warning.rotation.x=Math.PI/2; this.warning.position.y=.05;
    this.root.add(this.body,this.warning,this.vitals); scene.add(this.root);
  }
  update(s:RunnerState,camera:THREE.Camera,dt:number):void {
    this.root.position.set(s.center.x,0,s.center.z);
    this.body.rotation.y=s.facing; this.warning.rotation.z=-s.facing;
    const dead=s.phase==='dead', collapse=dead?Math.min(1,s.phaseTick/30):0;
    this.root.visible=!dead || collapse<1;
    this.body.scale.y=1-collapse*.9; this.body.position.y=-collapse*.2;
    const stride=s.moving?Math.sin(s.center.x*4+s.center.z*4):0;
    this.feet.forEach((f,i)=>{f.position.y=.15+Math.max(0,stride*(i?1:-1))*.13;});
    const windup=s.phase==='windup'?s.phaseTick/RUNNER_RULES.windup:0;
    const strike=s.phase==='recovery'?Math.max(0,1-s.phaseTick/12):0;
    this.arm.rotation.x=windup*.9-strike*1.4; this.arm.position.z=strike*.65;
    this.warning.visible=s.phase==='windup';
    this.vitals.visible=!dead; this.vitals.position.set(0,2.05,0); this.vitals.quaternion.copy(camera.quaternion);
    this.hp.scale.x=s.hp/RUNNER_RULES.hp; this.hp.position.x=-(1-this.hp.scale.x)*.5;
    if(s.hp<this.lastHp) this.flash=.12;
    this.lastHp=s.hp; this.flash=Math.max(0,this.flash-dt); this.core.emissiveIntensity=this.flash>0?5:1.6;
  }
}
export class AdventureFightView {
  private readonly root=new THREE.Group();
  private readonly bossRoot=new THREE.Group();
  private readonly boss:MonsterView;
  private readonly runners:RunnerView[];
  private exitOpening=0;
  constructor(private readonly scene:THREE.Scene) {
    scene.add(this.root); this.root.add(this.bossRoot);
    this.boss=new MonsterView(this.bossRoot,'stone',PVE_RULES,ADVENTURE_BOSS);
    this.runners=[new RunnerView(this.root),new RunnerView(this.root)];
  }
  update(state:AdventureFightState,camera:THREE.Camera,dt:number,exploration=false):void {
    this.root.visible=!exploration;
    this.bossRoot.visible=state.bossActive;
    this.scene.getObjectByName('adventure-dormant')!.visible=!state.bossActive;
    this.scene.getObjectByName('adventure-entry-gate')!.visible=state.bossActive && state.pve.outcome==='running';
    const exitOpen=state.pve.outcome==='victory';
    this.exitOpening=exitOpen ? Math.min(1,this.exitOpening+dt*1.5) : 0;
    const slide=this.exitOpening*this.exitOpening*(3-2*this.exitOpening)*5.1;
    this.scene.getObjectByName('adventure-exit-gate')!.children.forEach((leaf,i)=>leaf.position.x=(i?1:-1)*slide);
    this.scene.getObjectByName('adventure-exit-beacon')!.visible=exitOpen;
    const checkpoint=this.scene.getObjectByName('adventure-checkpoint') as THREE.Mesh<THREE.RingGeometry,THREE.MeshStandardMaterial>;
    checkpoint.material.emissiveIntensity=state.checkpoint?.8:0;
    this.boss.update(state.pve,dt);
    this.runners.forEach((v,i)=>v.update(state.runners[i]!,camera,dt));
  }
}
