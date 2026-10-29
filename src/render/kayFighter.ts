import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { WeaponId } from '../core/combat';
import type { Vec3 } from '../core/types';

export interface FighterMotion { grounded:boolean; verticalSpeed:number; velocity:Vec3; facing:number; weapon:WeaponId; shot:boolean; alive:boolean; hp?:number }
let template: THREE.Group | undefined;
let clips: THREE.AnimationClip[] = [];
let loading: Promise<void> | undefined;

/** The free official animation pack includes this rigged mannequin, too. */
export function loadFighterAssets(): Promise<void> {
  return loading ??= (async()=>{
    const loader=new GLTFLoader(),base=`${import.meta.env.BASE_URL}assets/kaykit/`;
    const [model,...sets]=await Promise.all(['Mannequin_Medium','General','Movement','Ranged'].map(name=>loader.loadAsync(`${base}${name}.glb`)));
    template=model!.scene;clips=sets.flatMap(set=>set.animations);
  })();
}

export function createKayFighter(color:number) {
  if(!template) return null;
  const actor=new THREE.Group(),body=clone(template),visual=new THREE.Group();
  actor.name='kaykit-fighter';visual.add(body);actor.add(visual);
  const bounds=new THREE.Box3().setFromObject(body),scale=1.78/bounds.getSize(new THREE.Vector3()).y;
  visual.scale.setScalar(scale);body.position.y=-bounds.min.y;
  const materials=new Map<THREE.Material,THREE.MeshStandardMaterial>();
  body.traverse(object=>{
    if(!(object instanceof THREE.Mesh)) return;
    object.castShadow=object.receiveShadow=true;
    const source=object.material as THREE.MeshStandardMaterial;
    if(!materials.has(source)) {
      const mat=source.clone();mat.roughness=.78;mat.metalness=0;
      if(color!==0xc7c9c3) mat.color.setHex(color);
      // Every character owns its resources; disposing a view never invalidates the cached source.
      if(mat.map) mat.map=mat.map.clone();materials.set(source,mat);
    }
    object.material=materials.get(source)!;object.geometry=object.geometry.clone();
  });
  const mixer=new THREE.AnimationMixer(body),axis=new THREE.Vector3(0,1,0),yaw=new THREE.Quaternion();
  const hips=body.getObjectByName('hips')!,chest=body.getObjectByName('chest')!;
  const animatedPose=[hips,chest].map(bone=>({bone,rotation:bone.quaternion.clone()}));
  const updateAnimation=(dt:number)=>{
    mixer.update(dt);
    for(const pose of animatedPose)pose.rotation.copy(pose.bone.quaternion);
  };
  const upper=/^(chest|head|upperarm|lowerarm|wrist|hand)/;
  const action=(name:string,part:'full'|'lower'|'upper'='full',once=false)=>{
    const source=clips.find(clip=>clip.name===name);
    if(!source) throw new Error(`Missing KayKit animation: ${name}`);
    // Animation sets include optional weapon-slot markers absent from the mannequin.
    const tracks=source.tracks.filter(track=>body.getObjectByName(track.name.slice(0,track.name.lastIndexOf('.')))
      && (part==='full'||(part==='upper')===upper.test(track.name)));
    const clip=new THREE.AnimationClip(`${name}-${part}`,source.duration,tracks);
    const result=mixer.clipAction(clip);if(once) {result.setLoop(THREE.LoopOnce,1);result.clampWhenFinished=true;}
    return result;
  };
  const lower={idle:action('Idle_A','lower'),walk:action('Walking_A','lower'),run:action('Running_A','lower'),
    jump:action('Jump_Idle','lower')};
  const aiming={arc:action('Ranged_1H_Aiming','upper'),pulse:action('Ranged_2H_Aiming','upper')};
  const shooting={arc:action('Ranged_1H_Shoot','upper',true),pulse:action('Ranged_2H_Shoot','upper',true)};
  const hit=action('Hit_A','upper',true),death=action('Death_A','full',true);
  let lowerState='idle',upperState='arc',activeLower=lower.idle,activeUpper=aiming.arc;
  activeLower.play();activeUpper.play();
  let wasGrounded=true,alive=true,deadAge=0,previousHp=100,recoil=0,landing=0,upperAge=0,legYaw=0;
  const switchAction=(previous:THREE.AnimationAction,next:THREE.AnimationAction)=>{
    if(previous===next)return;previous.fadeOut(.1);next.reset().setEffectiveWeight(1).fadeIn(.1).play();
  };
  return {
    actor,
    get deathVisible(){return !alive && deadAge<1.5;},
    animate(speed:number,dt:number,motion?:FighterMotion) {
      // The mixer skips writes for constant tracks (Walking_A hips). Restore its
      // last unmodified pose so waist offsets never accumulate, even while paused.
      for(const pose of animatedPose)pose.bone.quaternion.copy(pose.rotation);
      const state=motion??{grounded:true,verticalSpeed:0,velocity:{x:0,y:0,z:speed},facing:0,weapon:'arc' as const,shot:false,alive:true};
      if(state.alive!==alive) {
        alive=state.alive;deadAge=0;
        if(!alive){activeLower.stop();activeUpper.stop();death.reset().play();}
        else {death.stop();activeLower.reset().play();activeUpper=aiming[state.weapon];activeUpper.reset().play();
          upperAge=0;landing=recoil=0;previousHp=state.hp??100;}
      }
      if(!alive){deadAge+=dt;updateAnimation(dt);return;}
      const nextLower=!state.grounded?'jump':speed>8?'run':speed>.2?'walk':'idle';
      switchAction(activeLower,lower[nextLower]);activeLower=lower[nextLower];lowerState=nextLower;
      const targetYaw=speed>.2?THREE.MathUtils.euclideanModulo(Math.atan2(state.velocity.x,state.velocity.z)-state.facing+Math.PI,Math.PI*2)-Math.PI:0;
      const backwards=Math.abs(targetYaw)>Math.PI/2;
      const strafe=backwards?targetYaw-Math.sign(targetYaw)*Math.PI:targetYaw;
      legYaw=THREE.MathUtils.damp(legYaw,THREE.MathUtils.clamp(strafe,-.7,.7),12,dt);
      activeLower.timeScale=(backwards && nextLower==='walk'?-1:1)*(nextLower==='walk'?Math.max(.8,speed/4.8):nextLower==='run'?1.65:1);
      upperAge=Math.max(0,upperAge-dt);
      let nextUpper:THREE.AnimationAction=aiming[state.weapon],nextUpperState:string=state.weapon;
      if((state.hp??100)<previousHp){hit.reset();upperAge=.2;upperState='hit';}
      else if(state.shot){shooting[state.weapon].reset();upperAge=.16;upperState=`shot-${state.weapon}`;recoil=1;}
      if(upperAge>0){nextUpper=upperState==='hit'?hit:shooting[state.weapon];nextUpperState=upperState;}
      switchAction(activeUpper,nextUpper);activeUpper=nextUpper;upperState=nextUpperState;
      if(!wasGrounded && state.grounded)landing=1;
      wasGrounded=state.grounded;previousHp=state.hp??100;
      recoil=Math.max(0,recoil-dt*9);landing=Math.max(0,landing-dt*7);
      updateAnimation(dt);
      // Small waist turn keeps legs responsive while shoulders continue aiming.
      yaw.setFromAxisAngle(axis,legYaw);hips.quaternion.premultiply(yaw);
      yaw.setFromAxisAngle(axis,-legYaw);chest.quaternion.premultiply(yaw);
      visual.scale.set(scale*(1+landing*.07),scale*(1-landing*.09),scale*(1+landing*.07));
      visual.position.z=-recoil*.055;
    },
    diagnostics:()=>({model:'kaykit-mannequin-medium',lower:lowerState,upper:upperState,time:mixer.time,legYaw,
      deathAge:deadAge,bones:body.getObjectsByProperty('type','Bone').length,
      hips:hips.quaternion.toArray(),chest:chest.quaternion.toArray(),
      leg:body.getObjectByName('lowerlegl')?.quaternion.toArray(),scale:visual.scale.toArray()}),
  };
}
