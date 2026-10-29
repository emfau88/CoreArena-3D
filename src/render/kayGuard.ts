import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createKayRig, kayClip } from './kayFighter';
import type { CourtyardAssets } from './courtyardLook';
import { RUNNER_RULES, type RunnerState } from '../core/stoneRunner';

// Punch_A reaches maximum forward hand extension at 0.5s in the source clip.
const CONTACT_TIME=.5;

function stoneUV(geometry:THREE.BufferGeometry):void {
  const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal');
  const uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){
    const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));
    // Sample the interior of one stone tile, without masonry seams or atlas gaps.
    uv[i*2]=.39+(y>x&&y>z?p.getX(i):x>z?p.getZ(i):p.getX(i))*.08;
    uv[i*2+1]=.24+(y>x&&y>z?p.getZ(i):p.getY(i))*.06;
  }
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}

/** Same KayKit skeleton, separate stone skin and full-body melee animation. */
export function createKayGuard(surface:CourtyardAssets['floor']) {
  const {actor,body,visual,scale}=createKayRig(0xc7c9c3,1.72);
  actor.name='kaykit-stone-guard';visual.scale.set(scale*1.12,scale,scale*1.08);
  const material=(color:number)=>{
    // Keep the fine stone relief, but not the floor's camouflage-like colour pattern.
    const m=new THREE.MeshStandardMaterial({normalMap:surface.normalMap,roughnessMap:surface.roughnessMap,
      color,roughness:.93,metalness:0,normalScale:new THREE.Vector2(.18,.18)});
    // Own copies keep guard disposal independent of the courtyard asset cache.
    for(const key of ['normalMap','roughnessMap'] as const)if(m[key]){
      m[key]=m[key]!.clone();m[key]!.wrapS=m[key]!.wrapT=THREE.RepeatWrapping;
    }
    m.emissive.setHex(color);m.emissiveIntensity=.1;
    return m;
  };
  const stone=material(0x526b84),pale=material(0x99b2c6),dark=material(0x33495f);
  const rim=material(0xc2d1d8);
  const oldMaterials=new Set<THREE.MeshStandardMaterial>();
  body.traverse(o=>{
    if(!(o instanceof THREE.Mesh))return;
    oldMaterials.add(o.material as THREE.MeshStandardMaterial);stoneUV(o.geometry);
    o.material=o.name.includes('Head')?pale:o.name.includes('Leg')?dark:stone;
  });
  oldMaterials.forEach(m=>{m.map?.dispose();m.dispose();});
  const glow=new THREE.MeshStandardMaterial({color:0xffd991,emissive:0xff9f36,emissiveIntensity:1.7,roughness:.45});
  const recess=new THREE.MeshStandardMaterial({color:0x363b32,roughness:1});
  const moss=new THREE.MeshStandardMaterial({color:0x647f51,roughness:1,flatShading:true});
  const add=(boneName:string,g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{
    stoneUV(g);const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;
    body.getObjectByName(boneName)!.add(mesh);return mesh;
  };
  const plate=(bone:string,w:number,h:number,d:number,x:number,y:number,z:number,m=stone)=>
    add(bone,new RoundedBoxGeometry(w,h,d,1,.045),m,x,y,z);
  plate('chest',.62,.5,.18,0,-.1,.24);
  add('chest',new THREE.OctahedronGeometry(.17),glow,0,-.06,.39).scale.set(1,1.18,.45);
  plate('head',.67,.16,.15,0,.58,.48,rim);
  plate('head',.58,.16,.09,0,.41,.56,recess);
  for(const side of [-1,1]){
    add('head',new THREE.SphereGeometry(.075,8,6),glow,side*.17,.42,.615).scale.set(1.25,.65,.55);
    const suffix=side<0?'r':'l';
    plate(`upperarm${suffix}`,.43,.34,.4,0,.07,0,rim);
    plate(`lowerarm${suffix}`,.3,.27,.32,0,.16,0);
    add(`hand${suffix}`,new THREE.DodecahedronGeometry(.25),stone,0,.1,0).scale.set(1,1.12,1.05);
  }
  // Sparse anchored moss on crown/shoulder; no floating foliage or extra lights.
  for(const [bone,x,y,z,r] of [['head',-.22,.94,.02,.16],['head',-.09,.98,.07,.11],
    ['upperarml',.13,.03,.03,.14]] as const){
    add(bone,new THREE.IcosahedronGeometry(r,1),moss,x,y,z).scale.set(1,.35,1);
  }
  const mixer=new THREE.AnimationMixer(body);
  const make=(name:string,once=false)=>{
    const a=mixer.clipAction(kayClip(body,name));
    if(once){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}
    return a;
  };
  const actions={idle:make('Melee_Unarmed_Idle'),walk:make('Walking_B'),
    punch:make('Melee_Unarmed_Attack_Punch_A',true),hit:make('Hit_A',true),dead:make('Death_A',true)};
  actions.punch.paused=actions.dead.paused=true;
  let current:keyof typeof actions='idle',active=actions.idle,lastHp=RUNNER_RULES.hp as number,flash=0;
  active.play();
  const hand=new THREE.Vector3();
  return {
    actor,
    update(s:RunnerState,dt:number){
      const hurt=s.hp<lastHp&&s.hp>0;
      if(s.hp>lastHp)flash=0;
      flash=Math.max(0,flash-dt);if(hurt)flash=.16;lastHp=s.hp;
      const next=s.phase==='dead'?'dead':s.phase==='windup'||s.phase==='recovery'?'punch':flash>0?'hit':s.moving?'walk':'idle';
      if(next!==current){
        active.fadeOut(.08);active=actions[next];active.reset().setEffectiveWeight(1).fadeIn(.08).play();current=next;
      }
      if(next==='punch'){
        active.paused=true;
        active.time=s.phase==='windup'?CONTACT_TIME*s.phaseTick/RUNNER_RULES.windup:
          CONTACT_TIME+(active.getClip().duration-CONTACT_TIME)*s.phaseTick/RUNNER_RULES.recovery;
      }else if(next==='dead'){
        active.paused=true;active.time=Math.min(active.getClip().duration,s.phaseTick/60);
      }else active.timeScale=next==='walk'?.95:1;
      mixer.update(dt);
      glow.emissiveIntensity=flash>0?3.5:s.phase==='windup'?2.3:1.7;
      actor.rotation.y=s.facing;
      actor.visible=s.phase!=='dead'||s.phaseTick<75;
    },
    diagnostics:()=>{
      body.updateWorldMatrix(true,true);body.getObjectByName('handr')!.getWorldPosition(hand);
      return {model:'kaykit-stone-guard',state:current,clipTime:active.time,contactTime:CONTACT_TIME,
        bones:body.getObjectsByProperty('type','Bone').length,hand:hand.toArray(),visible:actor.visible};
    },
  };
}
