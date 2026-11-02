import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AdventureAim,AdventureMotor,BOSS_BODY,DASH } from '../src/core/adventureControls';
import { EnergyWhip,WHIP,whipCurve,clipWhip } from '../src/core/energyWhip';
import { Simulation } from '../src/core/simulation';
import { FixedClock } from '../src/core/fixedClock';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { ArenaCamera } from '../src/render/camera';
import type { ArenaDefinition } from '../src/arena/arena';
import type { CombatTarget } from '../src/core/combat';
import type { Vec3,RayWorld } from '../src/core/types';
import { STONE_ADVENTURE_COMBAT,STONE_ADVENTURE_JUMP } from '../src/arena/stoneAdventure';
import { createAdventureVariant } from '../src/app/adventureVariant';
import { prepareBossAttempt,LAB_SPAWN } from '../src/app/adventureLab';
const floor:ArenaDefinition={spawn:{x:0,y:.06,z:0},boxes:[{id:'floor',center:{x:0,y:-.5,z:0},size:{x:100,y:1,z:100},material:'floor'}],targets:[]};
const still={x:0,z:0,sprint:false},aim={x:0,y:0,z:1},empty:RayWorld={raycast:()=>null};
const target=(id:string,x:number,z:number,y=1.2,radius=.35):CombatTarget=>({id,center:{x,y,z},radius});
const runWhip=(targets:readonly CombatTarget[],direction=aim,world:RayWorld=empty,foot:Vec3={x:0,y:0,z:0})=>{
  const whip=new EnergyWhip(),hits:ReturnType<EnergyWhip['step']>['contacts']=[];
  for(let tick=0;tick<45;tick++)hits.push(...whip.step(tick,foot,direction,tick===0,world,targets).contacts);
  return {whip,hits};
};

test('strike-height aim uses rendered camera, retains last direction off canvas and cannot auto-acquire',()=>{
  const aim=new AdventureAim(),foot={x:0,y:2,z:0};
  assert.deepEqual(aim.update({origin:{x:3,y:10,z:0},direction:{x:0,y:-1,z:0}},foot),{x:1,y:0,z:0});
  for(const ray of [null,{origin:{x:0,y:10,z:0},direction:{x:0,y:0,z:1}},
    {origin:{x:0,y:10,z:0},direction:{x:0,y:-1,z:0}}])assert.deepEqual(aim.update(ray,foot),{x:1,y:0,z:0});
  for(const width of [1366,1920])for(const mode of ['side','straight','isometric'] as const){
    const camera=new ArenaCamera();camera.trackPlayer(foot);camera.mode=mode;camera.snap(foot);camera.resize(width,width===1366?768:1080);
    const point=new THREE.Vector3(3,foot.y+1.1,-4),screen=point.clone().project(camera.camera),caster=new THREE.Raycaster();
    caster.setFromCamera(new THREE.Vector2(screen.x,screen.y),camera.camera);
    const result=aim.update(caster.ray,foot);assert.ok(Math.abs(result.x-.6)<1e-5&&Math.abs(result.z+.8)<1e-5);
  }
});

test('combat framing keeps both figures visible at court edges, corners, plateau and melee; never rotates movement',()=>{
  for(const aspect of [1366/768,1920/1080])for(const p of [
    {x:0,y:0,z:-21},{x:-14,y:0,z:-30},{x:14,y:0,z:-30},{x:0,y:0,z:-38},
    {x:-14,y:0,z:-38},{x:14,y:0,z:-22},{x:-12,y:1.1,z:-23},{x:0,y:0,z:-27.4}]){
    const c=new ArenaCamera(),boss={x:0,y:1.85,z:-30};c.trackPlayer(p);c.resize(1080*aspect,1080);c.combat(true,boss);
    const basis=c.basis();for(let i=0;i<180;i++)c.follow(p,1/60);
    for(const position of [p,boss]){
      const s=new THREE.Vector3(position.x,position.y+1.1,position.z).project(c.camera);
      assert.ok(Math.abs(s.x)<.8&&Math.abs(s.y)<.78,JSON.stringify({p,s}));
    }
    c.toggle();assert.equal(c.mode,'straight');assert.deepEqual(c.basis(),basis);
  }
});

test('ground dash travels 3m at 30/60/144Hz, one charge, locked direction; sprint and air dash disabled',async()=>{
  const world=await createSpatialWorld(floor);
  try{let reference:unknown;
    for(const hz of [30,60,144]){
      const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();for(let i=0;i<20;i++)sim.step(still);
      const motor=new AdventureMotor(sim),clock=new FixedClock(),start=sim.snapshot().position,trace:unknown[]=[];
      for(let frame=0;frame<hz;frame++)clock.advance(1/hz,()=>{
        if(trace.length>=60)return;const tick=trace.length;
        const result=motor.step(tick===0?{...still,x:1}:{...still,z:0},tick===0||tick===10,{x:0,y:0,z:-1});trace.push(result.current);
      });
      assert.ok(Math.abs(sim.snapshot().position.x-start.x-DASH.distance)<.05);
      assert.equal(motor.snapshot().uses,1);assert.equal(motor.snapshot().invulnerable,false);
      if(reference)assert.deepEqual(trace,reference);else reference=trace;
      motor.step({...still,jump:true},false,aim);assert.equal(sim.snapshot().grounded,false);
      assert.equal(motor.step(still,true,aim).started,false);motor.suspend();assert.equal(motor.snapshot().remaining,0);
    }
    const sim=new Simulation(world,floor.spawn);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<60;i++)motor.step({...still,x:1,sprint:true},false,aim);
    assert.ok(Math.abs(sim.snapshot().position.x-7.2)<.05);
  }finally{world.dispose();}
});

test('dash recovers floor-contact stalls across 360 directions and two resting phases without changing the legacy solver',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  try{world.setObstacleEnabled('dormant-warden',false);
    for(const resting of [20,300])for(let degree=0;degree<360;degree++){
      const sim=new Simulation(world,LAB_SPAWN,STONE_ADVENTURE_JUMP);sim.reset();for(let i=0;i<resting;i++)sim.step(still);
      const start=sim.snapshot().position,motor=new AdventureMotor(sim),angle=degree*Math.PI/180;
      for(let i=0;i<9;i++)motor.step(still,i===0,{x:Math.sin(angle),y:0,z:Math.cos(angle)});
      const p=sim.snapshot().position,distance=Math.hypot(p.x-start.x,p.z-start.z);
      assert.ok(Math.abs(distance-3)<.05,JSON.stringify({degree,resting,distance}));
    }
  }finally{world.dispose();}
});

test('dash leaving a ledge ends instead of suspending gravity or allowing another air dash',async()=>{
  const world=await createSpatialWorld({...floor,boxes:[{...floor.boxes[0]!,size:{x:2,y:1,z:10}}]});
  try{const sim=new Simulation(world,floor.spawn);sim.reset();for(let i=0;i<20;i++)sim.step(still);
    const motor=new AdventureMotor(sim);for(let i=0;i<20;i++)motor.step({...still,x:1},i===0,aim);
    assert.equal(sim.snapshot().grounded,false);assert.ok(sim.snapshot().position.y<0);assert.equal(motor.snapshot().remaining,0);
    assert.equal(motor.step(still,true,aim).started,false);
  }finally{world.dispose();}
});

test('movement-only boss body blocks walk/dash from four sides, permits retreat, never blocks its own rays or weapons',async()=>{
  const world=await createSpatialWorld(floor);
  try{world.setMovementBlocker('body',{x:0,y:1.7,z:0},BOSS_BODY.radius,BOSS_BODY.height,true);
    assert.equal(world.raycast({origin:{x:0,y:1,z:0},direction:aim},5,true),null);
    assert.equal(world.sweepBall({origin:{x:0,y:1,z:0},direction:aim},5,.5,true),null);
    for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]])for(const dash of [false,true]){
      const sim=new Simulation(world,{x:x!*4,y:.06,z:z!*4});sim.reset();for(let i=0;i<20;i++)sim.step(still);
      const motor=new AdventureMotor(sim);
      for(let i=0;i<60;i++)motor.step({...still,x:-x!,z:-z!},dash&&i===0,aim);
      assert.ok(Math.hypot(sim.snapshot().position.x,sim.snapshot().position.z)>2.1);
      for(let i=0;i<20;i++)motor.step({...still,x:x!,z:z!},false,aim);
      assert.ok(Math.hypot(sim.snapshot().position.x,sim.snapshot().position.z)>4);
    }
    world.setMovementBlocker('body',{x:0,y:1.7,z:0},1.7,3.4,false);
    const sim=new Simulation(world,{x:0,y:.06,z:-4});sim.reset();for(let i=0;i<65;i++)sim.step({...still,z:1});
    assert.ok(sim.snapshot().position.z>3,'legacy/dead body must permit traversal');
  }finally{world.dispose();}
});

test('real boss can chase with body active, cannot overlap player, and dash cannot tunnel through courtyard walls',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  try{const {fight}=createAdventureVariant('prototype');prepareBossAttempt(fight,world,'arc');world.setObstacleEnabled('dormant-warden',false);
    const sim=new Simulation(world,LAB_SPAWN,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    const initial=fight.life.snapshot().center;
    for(let i=0;i<240;i++){
      const boss=fight.life.snapshot();world.setMovementBlocker('body',{...boss.center,y:1.7},1.7,3.4,true);
      const p=motor.step(still,false,aim).current;fight.step(p.position,world,[]);
      assert.ok(Math.hypot(p.position.x-fight.life.snapshot().center.x,p.position.z-fight.life.snapshot().center.z)>=2.15);
    }
    assert.ok(Math.abs(fight.life.snapshot().center.z-initial.z)>3,'boss navigation must ignore its body');
    for(const p of [{x:17,y:.06,z:-30},{x:-17,y:.06,z:-30},{x:0,y:.06,z:-40}]){
      sim.reset(p);for(let i=0;i<20;i++)sim.step(still);
      const m=new AdventureMotor(sim),direction={x:Math.sign(p.x),y:0,z:p.x===0?-1:0};
      for(let i=0;i<9;i++)m.step({...still,x:direction.x,z:direction.z},i===0,direction);
      assert.ok(Math.abs(sim.snapshot().position.x)<18&&sim.snapshot().position.z>-42);
    }
  }finally{world.dispose();}
});

test('whip has distinct forward/return contacts, no auto aim, correct reach/height, one hit per target per phase',()=>{
  const targets=[target('near',0,2.8),target('wide',1.5,3),target('far',0,7),target('high',0,3,4),target('behind',0,-3)];
  const {hits,whip}=runWhip(targets);
  assert.equal(hits.filter(h=>h.target==='near').length,2);assert.equal(hits.filter(h=>h.target==='wide').length,2);
  assert.ok(hits.every(h=>['near','wide'].includes(h.target)));
  assert.equal(new Set(hits.map(h=>h.target+h.phase)).size,hits.length);
  assert.equal(runWhip([targets[0]!],{x:0,y:0,z:-1}).hits.length,0);
  assert.equal(whip.snapshot().phase,'idle');assert.deepEqual(whip.snapshot().points,[]);
  const emptyWhip=runWhip([]).whip.snapshot();assert.equal(emptyWhip.misses,2);
});

test('wall clipping, vertical separation, moving targets between ticks and dash cancellation cannot leave ghost damage',async()=>{
  const arena:ArenaDefinition={...floor,boxes:[...floor.boxes,{id:'wall',center:{x:0,y:2,z:1.8},size:{x:10,y:4,z:.15},material:'stone'}]};
  const world=await createSpatialWorld(arena);
  try{assert.equal(runWhip([target('covered',0,3)],aim,world).hits.length,0);
    for(let age=6;age<31;age++)assert.ok(clipWhip(whipCurve({x:0,y:0,z:0},0,age),world).every(p=>p.z<=1.73));
  }finally{world.dispose();}
  const whip=new EnergyWhip(),foot={x:0,y:0,z:0};
  let crossed=false;
  for(let i=0;i<15;i++){
    const targets=[target('moving',i<11?-8:8,2.5,1.2,.15)];
    if(whip.step(i,foot,aim,i===0,empty,targets).damage.length)crossed=true;
  }
  assert.ok(crossed,'a fast moving sphere crosses the live rope between ticks');
  whip.cancel();
  for(let i=15;i<60;i++)assert.equal(whip.step(i,foot,aim,false,empty,[target('moving',0,3)]).damage.length,0);
  assert.equal(whip.snapshot().cancelled,1);
  assert.equal(runWhip([target('ground',0,3)],aim,empty,{x:0,y:3,z:0}).hits.length,0);
  const locked=new EnergyWhip();for(let i=0;i<20;i++)locked.step(i,foot,i<6?aim:{x:0,y:0,z:-1},i===0,empty,[]);
  assert.equal(locked.snapshot().yaw,0);
  assert.equal(WHIP.duration,42);
  const before=locked.snapshot(),sample=locked.sample(.5,empty);
  assert.deepEqual(sample.points,whipCurve(foot,0,18.5));assert.deepEqual(locked.snapshot(),before,'render sampling must not advance gameplay');
});

test('moving-player whip replays and dash cancellation stay identical at 30/60/144Hz',async()=>{
  const world=await createSpatialWorld(floor);let reference:unknown;
  try{for(const hz of [30,60,144]){
    const sim=new Simulation(world,floor.spawn);sim.reset();for(let i=0;i<20;i++)sim.step(still);
    const motor=new AdventureMotor(sim),whip=new EnergyWhip(),clock=new FixedClock(),trace:unknown[]=[];
    for(let frame=0;frame<hz*2;frame++)clock.advance(1/hz,()=>{
      const tick=trace.length;if(tick>=120)return;
      const move=motor.step({...still,x:tick<32?.3:0},tick===55,aim);if(move.started)whip.cancel();
      const attack=whip.step(tick,move.current.position,aim,[0,45,92].includes(tick),world,[target('one',.8,3),target('two',1.5,2)]);
      trace.push({player:move.current,damage:attack.damage,whip:whip.snapshot()});
    });
    assert.ok(whip.snapshot().forwardHits>0&&whip.snapshot().returnHits>0);
    assert.equal(whip.snapshot().cancelled,1);if(reference)assert.deepEqual(trace,reference);else reference=trace;
  }}finally{world.dispose();}
});

test('boss contact at walls, corner and plateau retains an escape route; cooldown freezes on suspension',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  try{world.setObstacleEnabled('dormant-warden',false);
    for(const p of [{x:15,y:.06,z:-39},{x:-15,y:.06,z:-39},{x:-10,y:1.16,z:-23}]){
      const boss={x:p.x,z:p.z-2.3,y:1.7};world.setMovementBlocker('body',boss,1.7,3.4,true);
      const sim=new Simulation(world,p,STONE_ADVENTURE_JUMP);sim.reset();for(let i=0;i<20;i++)sim.step(still);
      const motor=new AdventureMotor(sim),direction={x:Math.sign(-p.x),z:0,y:0};
      motor.step({...still,x:direction.x},true,direction);motor.suspend();
      const cooldown=motor.snapshot().readyIn;assert.ok(cooldown>0);assert.equal(motor.snapshot().readyIn,cooldown);
      for(let i=0;i<60;i++)motor.step({...still,x:direction.x},false,direction);
      for(let i=0;i<30;i++)motor.step({...still,z:1},false,direction);
      assert.ok(Math.hypot(sim.snapshot().position.x-boss.x,sim.snapshot().position.z-boss.z)>4,JSON.stringify({p,boss,after:sim.snapshot()}));
    }
  }finally{world.dispose();}
});
