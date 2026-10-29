import * as THREE from 'three';
import { ADVENTURE_BOSS, ADVENTURE_BOSS_RULES } from '../arena/stoneAdventure';
import { RUNNER_RULES, type RunnerState } from '../core/stoneRunner';
import type { AdventureFightState } from '../core/adventureFight';
import { MonsterView } from './monsterView';
import { createKayGuard } from './kayGuard';
import type { CourtyardAssets } from './courtyardLook';

class RunnerView {
  readonly root=new THREE.Group();
  private readonly guard:ReturnType<typeof createKayGuard>;
  private readonly vitals=new THREE.Group();
  private readonly hp=new THREE.Mesh(new THREE.PlaneGeometry(1,.07),new THREE.MeshBasicMaterial({color:0xf3b487}));
  private readonly warning=new THREE.Mesh(new THREE.RingGeometry(1.66,RUNNER_RULES.range,24,1,Math.PI/2-.95,1.9),
    new THREE.MeshBasicMaterial({color:0xffac75,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));
  constructor(scene:THREE.Object3D,stone:CourtyardAssets['floor']) {
    this.guard=createKayGuard(stone);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(1.12,.16),new THREE.MeshBasicMaterial({color:0x172022}));
    back.position.z=-.01; this.vitals.add(back,this.hp);
    this.warning.rotation.x=Math.PI/2; this.warning.position.y=.05;
    this.root.add(this.guard.actor,this.warning,this.vitals); scene.add(this.root);
  }
  diagnostics(){return this.guard.diagnostics();}
  update(s:RunnerState,camera:THREE.Camera,dt:number):void {
    this.root.position.set(s.center.x,0,s.center.z);
    this.guard.update(s,dt);
    const dead=s.phase==='dead';
    this.root.visible=this.guard.actor.visible;
    this.warning.visible=s.phase==='windup';
    this.vitals.visible=!dead; this.vitals.position.set(0,2.05,0); this.vitals.quaternion.copy(camera.quaternion);
    this.hp.scale.x=s.hp/RUNNER_RULES.hp; this.hp.position.x=-(1-this.hp.scale.x)*.5;

  }
}
export class AdventureFightView {
  private readonly root=new THREE.Group();
  private readonly bossRoot=new THREE.Group();
  private readonly boss:MonsterView;
  private readonly runners:RunnerView[];
  private exitOpening=0;
  constructor(private readonly scene:THREE.Scene,stone:CourtyardAssets['floor']) {
    scene.add(this.root); this.root.add(this.bossRoot);
    this.boss=new MonsterView(this.bossRoot,'stone',ADVENTURE_BOSS_RULES,ADVENTURE_BOSS);
    this.runners=[new RunnerView(this.root,stone),new RunnerView(this.root,stone)];
  }
  guardDiagnostics(){return this.runners.map(r=>r.diagnostics());}
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
