import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {EnergyWhip,whipPose,whipStrands,whipRules,WHIP,type WhipAttack} from '../src/core/energyWhip';
import {EnergyWhipView} from '../src/render/energyWhipView';
import {resolveWhipMod,type WhipMod} from '../src/core/whipMods';
import {AdventureModTrial} from '../src/core/adventureModTrial';
import {resolveAdventureEntry,createAdventureVariant} from '../src/app/adventureVariant';
import {LAB_SPAWN,prepareBossAttempt} from '../src/app/adventureBossAttempt';
import {AdventurePrototype} from '../src/app/adventurePrototype';
import {Simulation} from '../src/core/simulation';
import {FixedClock} from '../src/core/fixedClock';
import {createSpatialWorld} from '../src/physics/rapierWorld';
import {STONE_ADVENTURE_COMBAT,STONE_ADVENTURE_JUMP} from '../src/arena/stoneAdventure';
import type {CombatTarget} from '../src/core/combat';
import type {RayWorld} from '../src/core/types';

const foot={x:0,y:0,z:0},aim={x:0,y:0,z:1},empty:RayWorld={raycast:()=>null};
const target=(id:string,x:number,z:number,radius=.15):CombatTarget=>({id,center:{x,y:1.2,z},radius});
function strike(mod:WhipMod,targets:CombatTarget[],attack:WhipAttack='sweep',world=empty){
  const whip=new EnergyWhip(mod),trace: {tick:number;target:string;amount:number}[]=[];
  for(let tick=0;tick<70;tick++)for(const d of whip.step(tick,foot,aim,tick===0,world,targets,attack).damage)trace.push({tick,target:d.target,amount:d.amount});
  return trace;
}
test('hook holds outer return reach, trades 12 extra ticks for delayed return damage; heavy/air stay unchanged',()=>{
  const outer=target('outer',-3,3.2);
  const base=strike('base',[outer]),hook=strike('hook',[outer]);
  assert.equal(base.length,0);
  assert.deepEqual(hook.map(d=>d.amount),[24]);
  assert.ok(hook[0]!.tick>=25&&hook[0]!.tick<=39);
  assert.deepEqual(strike('hook',[target('center',.28,3)]).map(d=>d.amount),[12,24]);
  assert.equal(whipPose(35,'sweep','hook').length,4.5);
  assert.equal(whipRules('sweep','hook').duration-WHIP.duration,12);
  for(const attack of ['air','overhead'] as const)for(const mod of ['hook','fork'] as const)
    assert.deepEqual(strike(mod,[target('center',.28,3)],attack),strike('base',[target('center',.28,3)],attack));
});
test('fork covers the outer flank but sacrifices reach and shares a single damage budget per target and phase',()=>{
  const targets=[target('flank',3.7,1),target('far',.28,4.9),target('shared',.28,2),target('large',.28,3,1.6)];
  const fork=strike('fork',targets),base=strike('base',targets);
  assert.ok(fork.some(d=>d.target==='flank'));assert.ok(!base.some(d=>d.target==='flank'));
  assert.ok(base.some(d=>d.target==='far'));assert.ok(!fork.some(d=>d.target==='far'));
  for(const t of targets){const hits=fork.filter(d=>d.target===t.id);assert.ok(hits.length<=2);assert.ok(hits.reduce((n,d)=>n+d.amount,0)<=32);}
  assert.deepEqual(fork.filter(d=>d.target==='large').map(d=>d.amount),[20,12]);
});
test('both mods stop at real cover, cannot cancel into free attacks and clear both visible branches',async()=>{
  const world=await createSpatialWorld({spawn:foot,boxes:[{id:'wall',center:{x:0,y:2,z:1},size:{x:12,y:4,z:.2},material:'stone'}],targets:[]});
  try{for(const mod of ['hook','fork'] as const){
    assert.equal(strike(mod,[target('covered',.28,3)],'sweep',world).length,0);
    for(let age=6;age<39;age+=.5)for(const curve of whipStrands(foot,0,age,'sweep',mod,world))assert.ok(curve.every(p=>p.z<=.901));
    for(const cancelAt of [3,12,28]){
      const whip=new EnergyWhip(mod),end=whipRules('sweep',mod).duration;
      for(let tick=0;tick<=cancelAt;tick++)whip.step(tick,foot,aim,tick===0,empty,[target('center',.28,2)]);
      whip.cancel();assert.equal(whip.snapshot().points.length,0);assert.equal(whip.snapshot().branches.length,0);assert.equal(whip.snapshot().contact,null);
      for(let tick=cancelAt+1;tick<end;tick++)assert.equal(whip.step(tick,foot,aim,true,empty,[]).attacked,false);
      assert.equal(whip.step(end,foot,aim,true,empty,[]).attacked,true);
    }
  }}finally{world.dispose();}
});
test('mod collision and render sampling are deterministic at 30/60/144 Hz',()=>{
  for(const mod of ['base','hook','fork'] as const){let reference:unknown;
    for(const hz of [30,60,144]){
      const whip=new EnergyWhip(mod),clock=new FixedClock(),trace:unknown[]=[];
      for(let frame=0;frame<hz*3;frame++)clock.advance(1/hz,()=>{
        const tick=trace.length;if(tick>=180)return;
        if(tick===25)whip.cancel();
        const result=whip.step(tick,{...foot,x:tick*.001},aim,tick%60===0,empty,[target('moving',Math.sin(tick*.02),3)]);
        const before=whip.snapshot();whip.sample(.1,empty);whip.sample(.9,empty);assert.deepEqual(whip.snapshot(),before);
        trace.push({result,state:whip.snapshot()});
      });
      assert.equal(trace.length,180);if(reference)assert.deepEqual(trace,reference);else reference=trace;
    }
  }
});
test('fork draws only its six separated links; hide/cancel/new base leave no old fork',()=>{
  const scene=new THREE.Scene(),view=new EnergyWhipView(scene,[]),hand=new THREE.Vector3(.2,1,0);
  let count=0;scene.traverse(()=>count++);
  for(const mod of ['fork','hook','base'] as const){
    const whip=new EnergyWhip(mod);
    for(let tick=0;tick<45;tick++){
      whip.step(tick,foot,aim,tick===0,empty,[]);view.update(whip.sample(.8,empty),hand,foot,aim,null,tick,false,false);
      assert.equal(view.diagnostics().forkSegments,mod==='fork'&&tick<42?6:0);
      let now=0;scene.traverse(()=>now++);assert.equal(now,count);
    }
    whip.cancel();view.update(whip.snapshot(),hand,foot,aim,null,45,false,false);
    assert.equal(view.diagnostics().forkSegments,0);assert.equal(view.diagnostics().segments,0);view.hide();
  }
});
test('ten dirty fixture resets across all profiles restore supplies, combat, clock, movement and hit sets',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  try{const fight=createAdventureVariant('prototype').fight;let reference:unknown;
    for(let i=0;i<10;i++){
      prepareBossAttempt(fight,world);const sim=new Simulation(world,LAB_SPAWN,STONE_ADVENTURE_JUMP);sim.reset();
      const prototype=new AdventurePrototype(sim,false,(['base','hook','fork'] as const)[i%3]!);
      const initial={player:sim.snapshot(),fight:fight.snapshot(),weapons:fight.combat.snapshot(),pickups:fight.pickups.snapshot()};
      if(reference)assert.deepEqual(initial,reference);else reference=initial;
      assert.equal(prototype.whip.snapshot().sequence,0);assert.equal(prototype.whip.snapshot().readyIn,0);assert.equal(prototype.whip.snapshot().forwardHits,0);
      assert.equal(prototype.motor.snapshot().uses,0);
      for(let tick=0;tick<20;tick++)prototype.whip.step(tick,foot,aim,tick===0,empty,[target('used',.28,2)]);
      assert.ok(prototype.whip.snapshot().forwardHits>0);
      fight.reserveRecovered=fight.relayActive=fight.completed=true;fight.life.step({...LAB_SPAWN,y:-9},world);
    }
  }finally{world.dispose();}
});
test('trial requires three finished profiles before explicit voluntary attempts and keeps reported intent separate',()=>{
  const trial=new AdventureModTrial(2),result={outcome:'defeat' as const,ticks:600,hp:0,armor:0,bossHp:400,forwardHits:2,returnHits:1,misses:1,cancelled:0,dashUses:2};
  assert.deepEqual(trial.order,['hook','fork','base']);assert.equal(trial.begin('hook',{},true),false);
  trial.begin('hook',{},false);assert.equal(trial.begin('base',{},false),false);trial.finish({...result,outcome:'aborted'});
  assert.equal(trial.requiredComplete,false);assert.equal(trial.nextMod,'hook');
  for(const mod of trial.order){assert.equal(trial.begin(mod,{},false),true);trial.finish(result);}
  assert.equal(trial.requiredComplete,true);assert.equal(trial.read().voluntaryStarted,0);
  assert.equal(trial.begin('fork',{},false),false);assert.equal(trial.begin('fork',{},true),true);
  trial.finish({...result,outcome:'aborted'});trial.noteLast('Breitere Spitzen ausprobieren');
  assert.equal(trial.read().voluntaryStarted,1);assert.equal(trial.read().voluntaryFinished,0);
  const copy=trial.read();copy.attempts.pop();assert.equal(trial.read().attempts.length,5);
});
test('mod route is opt-in for the prototype, and unknown selection falls back to the unchanged base',()=>{
  const route=(extra:string,allowed=true)=>resolveAdventureEntry(new URLSearchParams(`mode=pve&adventure=1&level=stone&${extra}`),true,allowed,true);
  assert.equal(route('combat=prototype&trial=mods')?.modTrial,true);
  for(const extra of ['trial=mods','combat=prototype','combat=prototype&trial=wrong','combat=prototype&trial=mods&lab=boss','combat=prototype&trial=mods&explore=1'])assert.equal(route(extra)?.modTrial,undefined);
  assert.equal(route('combat=prototype&trial=mods',false)?.modTrial,undefined);
  for(const value of ['bad',null,'base'])assert.equal(resolveWhipMod(value),'base');
  assert.equal(whipRules('sweep'),WHIP);
});
