import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {EnergyWhip,OVERHEAD,WHIP,whipCurve,clipWhip,type WhipAttack} from '../src/core/energyWhip';
import {EnergyWhipView} from '../src/render/energyWhipView';
import {createSpatialWorld} from '../src/physics/rapierWorld';
import {FixedClock} from '../src/core/fixedClock';
import type {CombatTarget} from '../src/core/combat';
import type {RayWorld} from '../src/core/types';

const foot={x:0,y:0,z:0},aim={x:0,y:0,z:1},empty:RayWorld={raycast:()=>null};
const target=(id:string,x:number,z:number,y=1.2):CombatTarget=>({id,center:{x,y,z},radius:.3});
function attack(kind:WhipAttack,targets:CombatTarget[],world=empty){
  const whip=new EnergyWhip(),damage:ReturnType<EnergyWhip['step']>['damage']=[];
  for(let tick=0;tick<70;tick++)damage.push(...whip.step(tick,foot,aim,tick===0,world,targets,kind).damage);
  return {whip,damage};
}
test('overhead hits once in a narrow vertical plane, reaches farther, and retains sweep tradeoffs',()=>{
  const targets=[target('front',.28,3),target('reach',.28,5.8),target('side',1.6,3),target('behind',0,-2),target('far',.28,7)];
  const heavy=attack('overhead',targets),light=attack('sweep',targets);
  assert.deepEqual(heavy.damage.map(d=>[d.target,d.amount]).sort(),[['front',46],['reach',46]]);
  assert.ok(light.damage.some(d=>d.target==='side'));
  assert.ok(!light.damage.some(d=>d.target==='reach'));
  assert.equal(heavy.whip.snapshot().returnHits,0);
  assert.ok(OVERHEAD.forwardDamage/OVERHEAD.duration<(WHIP.forwardDamage+WHIP.returnDamage)/WHIP.duration);
});
test('overhead anticipation and recovery do not damage, direction locks, clicks do not queue',()=>{
  const whip=new EnergyWhip();let hits=0;
  for(let tick=0;tick<64;tick++){
    const result=whip.step(tick,foot,tick<14?aim:{x:1,y:0,z:0},[0,8,30,60].includes(tick),empty,[target('front',.28,3)],'overhead');
    if(tick<14||tick>24)assert.equal(result.damage.length,0);
    hits+=result.damage.length;
  }
  assert.equal(hits,1);assert.equal(whip.snapshot().sequence,1);assert.equal(whip.snapshot().yaw,0);
  whip.step(64,foot,aim,false,empty,[]);assert.equal(whip.snapshot().phase,'idle');
  whip.step(65,foot,aim,true,empty,[]);assert.equal(whip.snapshot().attack,'sweep');assert.equal(whip.snapshot().sequence,2);
});
test('dash, pause or weapon cancel clears contacts but cannot skip overhead recovery',()=>{
  for(const cancelAt of [8,20,32]){
    const whip=new EnergyWhip();
    for(let tick=0;tick<=cancelAt;tick++)whip.step(tick,foot,aim,tick===0,empty,[target('front',.28,3)],'overhead');
    whip.cancel();assert.equal(whip.snapshot().contact,null);
    for(let tick=cancelAt+1;tick<64;tick++){
      const result=whip.step(tick,foot,aim,true,empty,[target('front',.28,3)]);
      assert.equal(result.attacked,false);assert.equal(result.damage.length,0);
    }
    assert.equal(whip.step(64,foot,aim,true,empty,[]).attacked,true);
  }
});
test('overhead is blocked by real walls, retains vertical separation and has no damaging visual tail',async()=>{
  const world=await createSpatialWorld({spawn:foot,boxes:[{id:'wall',center:{x:0,y:2,z:2},size:{x:6,y:4,z:.2},material:'stone'}],targets:[]});
  try{
    assert.equal(attack('overhead',[target('covered',.28,3)],world).damage.length,0);
    for(let age=14;age<24;age+=.25)assert.ok(clipWhip(whipCurve(foot,0,age,'overhead'),world).every(p=>p.z<=1.901));
    assert.equal(attack('overhead',[target('lower',.28,3,-2)]).damage.length,0);
  }finally{world.dispose();}
});
test('both attacks, moving targets and cancellation replay identically at 30/60/144Hz',()=>{
  let reference:unknown;
  for(const hz of [30,60,144]){
    const clock=new FixedClock(),whip=new EnergyWhip(),trace:unknown[]=[];
    for(let frame=0;frame<hz*3;frame++)clock.advance(1/hz,()=>{
      const tick=trace.length;if(tick>=180)return;
      if(tick===28)whip.cancel();
      const result=whip.step(tick,{...foot,x:tick*.002},aim,[0,40,68,115].includes(tick),empty,[target('moving',tick<16?-2:2,3)],tick<68?'overhead':'sweep');
      trace.push({result,snapshot:whip.snapshot()});
    });
    assert.equal(trace.length,180);if(reference)assert.deepEqual(trace,reference);else reference=trace;
  }
});
test('procedural whip effects are bounded, reduced effects preserve contacts, cancel/reset clears history',()=>{
  const scene=new THREE.Scene(),view=new EnergyWhipView(scene,[]),whip=new EnergyWhip(),hand=new THREE.Vector3(.2,1,0);
  const objects=()=>{let n=0;scene.traverse(()=>n++);return n;},count=objects();let sawTrail=false,sawContact=false;
  for(let tick=0;tick<120;tick++){
    whip.step(tick,foot,aim,tick===0||tick===70,empty,[target('guard',.28,3)],'overhead','guard');
    const state=whip.sample(.8,empty);view.update(state,hand,foot,aim,null,tick,true,false);
    sawTrail ||=view.diagnostics().trail;sawContact ||=view.diagnostics().guarded;
    assert.ok(view.diagnostics().bursts<=4);assert.equal(objects(),count);
    if(view.diagnostics().bursts){view.update(state,hand,foot,aim,null,tick,true,true);assert.ok(view.diagnostics().bursts>0);assert.equal(view.diagnostics().trail,false);}
  }
  assert.ok(sawTrail&&sawContact);
  whip.cancel();view.update(whip.snapshot(),hand,foot,aim,null,120,true,false);
  assert.equal(view.diagnostics().bursts,0);assert.equal(view.diagnostics().segments,0);assert.equal(view.diagnostics().trail,false);
  view.hide();assert.equal(view.diagnostics().visible,false);
});

test('trail vertices remain local to a translated attack, including its first rendered frames',()=>{
  const scene=new THREE.Scene(),view=new EnergyWhipView(scene,[]),whip=new EnergyWhip(),position={x:0,y:.06,z:-21};
  const hand=new THREE.Vector3(.2,1.1,-21),trail=scene.getObjectByName('whip-trail') as THREE.Mesh;
  for(let tick=0;tick<45;tick++){
    whip.step(tick,position,{x:0,y:0,z:-1},tick===0,empty,[]);
    for(const alpha of [.1,.5,.9]){
      view.update(whip.sample(alpha,empty),hand,position,aim,null,tick,true,false);
      if(!trail.visible)continue;
      const points=trail.geometry.getAttribute('position');
      for(let i=0;i<trail.geometry.drawRange.count;i++)assert.ok(Math.abs(points.getZ(i)+21)<7,`tick ${tick}, vertex ${i}: ${points.getZ(i)}`);
    }
  }
});
