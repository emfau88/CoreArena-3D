import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { WeaponId } from '../core/combat';
import type { Vec3 } from '../core/types';
import { applyCourierLook } from './courierLook';
import { applyArenaLook, createArenaWeapon, type ArenaRole } from './arenaEquipment';

export interface FighterMotion { grounded:boolean; verticalSpeed:number; velocity:Vec3; facing:number; weapon:WeaponId; shot:boolean; alive:boolean; hp?:number; aimPitch?:number }
let template: THREE.Group | undefined;
let handSlot: THREE.Object3D | undefined;
let clips: THREE.AnimationClip[] = [];
let loading: Promise<void> | undefined;
let meleeLoading: Promise<void> | undefined;

/** The free official animation pack includes this rigged mannequin, too. */
export function loadFighterAssets(): Promise<void> {
  return loading ??= (async()=>{
    const loader=new GLTFLoader(),base=`${import.meta.env.BASE_URL}assets/kaykit/`;
    const [model,...sets]=await Promise.all(['Mannequin_Medium','General','Movement','Ranged'].map(name=>loader.loadAsync(`${base}${name}.glb`)));
    template=model!.scene;clips=sets.flatMap(set=>set.animations);
    handSlot=sets[2]!.scene.getObjectByName('handslotr');
  })();
}

export function loadMeleeAssets():Promise<void> {
  return meleeLoading??=(async()=>{
    await loadFighterAssets();
    const set=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/kaykit/Melee.glb`);
    clips.push(...set.animations);
  })();
}

/** Independent skeleton and owned resources for each player or guard. */
export function createKayRig(color:number,height=1.78) {
  if(!template)throw new Error('KayKit assets must be loaded before creating a character');
  const actor=new THREE.Group(),body=clone(template),visual=new THREE.Group();
  actor.name='kaykit-fighter';visual.add(body);actor.add(visual);
  const bounds=new THREE.Box3().setFromObject(body),scale=height/bounds.getSize(new THREE.Vector3()).y;
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
  return {actor,body,visual,scale};
}

export function kayClip(body:THREE.Object3D,name:string):THREE.AnimationClip {
  const source=clips.find(clip=>clip.name===name);
  if(!source)throw new Error(`Missing KayKit animation: ${name}`);
  // Animation sets include optional weapon-slot markers absent from the mannequin.
  return new THREE.AnimationClip(name,source.duration,source.tracks.filter(track=>
    body.getObjectByName(track.name.slice(0,track.name.lastIndexOf('.')))));
}

export function createKayFighter(color:number, arenaRole?:ArenaRole) {
  if(!template) return null;
  const {actor,body,visual,scale}=createKayRig(color);
  const courier=color===0xc7c9c3;
  if(courier)applyCourierLook(body);
  let equipment:ReturnType<typeof createArenaEquipment>|undefined;
  if(arenaRole) { applyArenaLook(body,arenaRole);equipment=createArenaEquipment(body); }
  const mixer=new THREE.AnimationMixer(body),axis=new THREE.Vector3(0,1,0),yaw=new THREE.Quaternion();
  const hips=body.getObjectByName('hips')!,chest=body.getObjectByName('chest')!;
  const animatedPose=[hips,chest,...arenaRole?[body.getObjectByName('upperarml')!,body.getObjectByName('lowerarml')!]:[]]
    .map(bone=>({bone,rotation:bone.quaternion.clone()}));
  const updateAnimation=(dt:number)=>{
    mixer.update(dt);
    for(const pose of animatedPose)pose.rotation.copy(pose.bone.quaternion);
  };
  const upper=/^(chest|head|upperarm|lowerarm|wrist|hand)/;
  const action=(name:string,part:'full'|'lower'|'upper'='full',once=false)=>{
    const source=kayClip(body,name);
    let tracks=source.tracks.filter(track=>part==='full'||(part==='upper')===upper.test(track.name));
    // Arena holds the authored settled aim pose; looping the raise-up intro made
    // the weapon repeatedly dip. Adventure retains its existing animation clips.
    if(arenaRole && name.endsWith('_Aiming')) tracks=tracks.map(track=>{
      const held=track.clone(),interpolant=track instanceof THREE.QuaternionKeyframeTrack
        ?new THREE.QuaternionLinearInterpolant(track.times,track.values,track.getValueSize())
        :new THREE.LinearInterpolant(track.times,track.values,track.getValueSize());
      const sample=Array.from(interpolant.evaluate(.7) as Float32Array);
      held.times=new Float32Array([0,1]);held.values=new Float32Array([...sample,...sample]);return held;
    });
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
    resetPresentation() {
      mixer.stopAllAction(); mixer.time=0;
      lowerState='idle'; upperState='arc'; activeLower=lower.idle; activeUpper=aiming.arc;
      activeLower.reset().setEffectiveWeight(1).play(); activeUpper.reset().setEffectiveWeight(1).play();
      wasGrounded=true; alive=true; previousHp=100;
      deadAge=recoil=landing=upperAge=legYaw=0;
      visual.scale.setScalar(scale); visual.position.z=0;
    },
    animate(speed:number,dt:number,motion?:FighterMotion) {
      // The mixer skips writes for constant tracks (Walking_A hips). Restore its
      // last unmodified pose so waist offsets never accumulate, even while paused.
      for(const pose of animatedPose)pose.bone.quaternion.copy(pose.rotation);
      const state=motion??{grounded:true,verticalSpeed:0,velocity:{x:0,y:0,z:speed},facing:0,weapon:'arc' as const,shot:false,alive:true};
      const weapon=state.weapon==='rail'?'pulse':state.weapon;
      if(state.alive!==alive) {
        alive=state.alive;deadAge=0;
        if(!alive){activeLower.stop();activeUpper.stop();death.reset().play();}
        else {death.stop();activeLower.reset().play();activeUpper=aiming[weapon];activeUpper.reset().play();
          upperAge=0;landing=recoil=0;previousHp=state.hp??100;}
      }
      if(!alive){deadAge+=dt;updateAnimation(dt);equipment?.update(state.weapon,false);return;}
      const nextLower=!state.grounded?'jump':speed>8?'run':speed>.2?'walk':'idle';
      switchAction(activeLower,lower[nextLower]);activeLower=lower[nextLower];lowerState=nextLower;
      const targetYaw=speed>.2?THREE.MathUtils.euclideanModulo(Math.atan2(state.velocity.x,state.velocity.z)-state.facing+Math.PI,Math.PI*2)-Math.PI:0;
      const backwards=Math.abs(targetYaw)>Math.PI/2;
      const strafe=backwards?targetYaw-Math.sign(targetYaw)*Math.PI:targetYaw;
      legYaw=THREE.MathUtils.damp(legYaw,THREE.MathUtils.clamp(strafe,-.7,.7),12,dt);
      activeLower.timeScale=(backwards && nextLower==='walk'?-1:1)*(nextLower==='walk'?Math.max(.8,speed/4.8):nextLower==='run'?1.65:1);
      upperAge=Math.max(0,upperAge-dt);
      let nextUpper:THREE.AnimationAction=aiming[weapon],nextUpperState:string=state.weapon;
      if((state.hp??100)<previousHp){hit.reset();upperAge=.2;upperState='hit';}
      else if(state.shot){shooting[weapon].reset();upperAge=.16;upperState=`shot-${state.weapon}`;recoil=1;}
      if(upperAge>0){nextUpper=upperState==='hit'?hit:arenaRole?aiming[weapon]:shooting[weapon];nextUpperState=upperState;}
      switchAction(activeUpper,nextUpper);activeUpper=nextUpper;upperState=nextUpperState;
      if(!wasGrounded && state.grounded)landing=1;
      wasGrounded=state.grounded;previousHp=state.hp??100;
      recoil=Math.max(0,recoil-dt*9);landing=Math.max(0,landing-dt*7);
      updateAnimation(dt);
      // Small waist turn keeps legs responsive while shoulders continue aiming.
      yaw.setFromAxisAngle(axis,legYaw);hips.quaternion.premultiply(yaw);
      yaw.setFromAxisAngle(axis,-legYaw);chest.quaternion.premultiply(yaw);
      if(arenaRole){
        // Shoulder a two-handed rifle across the torso, with the barrel still
        // pointing along aim. This also keeps the foregrip inside the left arm's reach.
        if(state.weapon!=='arc')chest.rotateY(-Math.PI/6);
      }
      visual.scale.set(scale*(1+landing*.07),scale*(1-landing*.09),scale*(1+landing*.07));
      visual.position.z=-recoil*.055;
      equipment?.update(state.weapon,true,upperState==='hit'?undefined:{yaw:actor.rotation.y,pitch:THREE.MathUtils.clamp(state.aimPitch??0,-.55,.55)});
    },
    diagnostics:()=>({model:'kaykit-mannequin-medium',style:arenaRole?`arena-${arenaRole}`:courier?'ruins-courier':'mannequin',lower:lowerState,upper:upperState,time:mixer.time,legYaw,
      deathAge:deadAge,facing:actor.rotation.y,bones:body.getObjectsByProperty('type','Bone').length,
      hips:hips.quaternion.toArray(),chest:chest.quaternion.toArray(),
      leg:body.getObjectByName('lowerlegl')?.quaternion.toArray(),scale:visual.scale.toArray(),
      ...(equipment?{equipment:equipment.diagnostics()}: {})}),
  };
}

/** Authored KayKit hand slot, plus a small visual-only support-hand correction. */
function createArenaEquipment(body:THREE.Object3D) {
  if(!handSlot)throw new Error('KayKit ranged hand slot missing');
  const slot=handSlot.clone(false);body.getObjectByName('handr')!.add(slot);
  const mount=new THREE.Group();mount.rotation.y=Math.PI/2;slot.add(mount); // Slot +X is barrel-forward.
  const guns={arc:createArenaWeapon('arc'),pulse:createArenaWeapon('pulse'),rail:createArenaWeapon('rail')};
  mount.add(...Object.values(guns));
  const left=body.getObjectByName('handl')!;
  const chest=body.getObjectByName('chest')!;
  const joints=[body.getObjectByName('lowerarml')!,body.getObjectByName('upperarml')!];
  const target=new THREE.Vector3(),origin=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3();
  const delta=new THREE.Quaternion(),worldRotation=new THREE.Quaternion(),parentRotation=new THREE.Quaternion();
  let selected:WeaponId='arc',visible=true;
  return {
    update(weapon:WeaponId,alive:boolean,aim?:{yaw:number;pitch:number}) {
      selected=weapon;visible=alive;mount.visible=alive;
      mount.rotation.y=Math.PI/2+(weapon==='arc'?0:Math.PI/6);
      for(const [id,gun] of Object.entries(guns))gun.visible=id===weapon;
      if(!alive)return;
      // The source poses point diagonally relative to the rig. Rotate shoulders
      // together with both hands so the actual barrel follows the gameplay aim.
      body.updateWorldMatrix(true,true);
      if(aim){
        mount.getWorldPosition(origin);mount.localToWorld(end.set(0,0,1));end.sub(origin).normalize();
        direction.set(Math.sin(aim.yaw)*Math.cos(aim.pitch),Math.sin(aim.pitch),Math.cos(aim.yaw)*Math.cos(aim.pitch));
        delta.setFromUnitVectors(end,direction);
        chest.getWorldQuaternion(worldRotation);chest.parent!.getWorldQuaternion(parentRotation);
        chest.quaternion.copy(parentRotation.invert().multiply(delta).multiply(worldRotation));
        chest.updateWorldMatrix(false,true);
      }
      if(weapon==='arc')return;
      // Keep the left hand on the foregrip while recoil/waist/aim animate. All
      // offsets are restored before the next mixer sample; no cumulative twisting.
      body.updateWorldMatrix(true,true);
      target.set(0,-.015,weapon==='rail'?.55:.48);mount.localToWorld(target);
      for(let pass=0;pass<4;pass++)for(const joint of joints) {
        joint.getWorldPosition(origin);left.getWorldPosition(end);
        end.sub(origin).normalize();direction.copy(target).sub(origin).normalize();
        delta.setFromUnitVectors(end,direction);
        joint.getWorldQuaternion(worldRotation);joint.parent!.getWorldQuaternion(parentRotation);
        joint.quaternion.copy(parentRotation.invert().multiply(delta).multiply(worldRotation));
        joint.updateWorldMatrix(false,true);
      }
    },
    diagnostics() {
      body.updateWorldMatrix(true,true);
      const grip=slot.getWorldPosition(new THREE.Vector3()),weapon=mount.getWorldPosition(new THREE.Vector3());
      const support=mount.localToWorld(new THREE.Vector3(0,-.015,selected==='rail'?.55:.48));
      return {weapon:selected,parent:slot.parent!.name,slot:slot.name,visible,grip:grip.toArray(),
        gripError:grip.distanceTo(weapon),supportError:selected==='arc'?null:left.getWorldPosition(new THREE.Vector3()).distanceTo(support),
        forward:mount.localToWorld(new THREE.Vector3(0,0,1)).sub(weapon).normalize().toArray()};
    },
  };
}
