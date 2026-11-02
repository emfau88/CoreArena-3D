import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation';
import {AdventureMotor} from '../src/core/adventureControls';
import {EnergyWhip,whipCurve,clipWhip} from '../src/core/energyWhip';
import {AdventurePrototype} from '../src/app/adventurePrototype';
import {createSpatialWorld} from '../src/physics/rapierWorld';
import {FixedClock} from '../src/core/fixedClock';
import {STONE_ADVENTURE_COMBAT,STONE_ADVENTURE_JUMP} from '../src/arena/stoneAdventure';
import {PROTOTYPE_EXIT_SEAL} from '../src/core/adventureBalance';
import type {ArenaDefinition} from '../src/arena/arena';
import type {StoneFeedback} from '../src/app/stoneFeedback';
const floor:ArenaDefinition={spawn:{x:0,y:.06,z:0},boxes:[{id:'floor',center:{x:0,y:-.5,z:0},size:{x:50,y:1,z:50},material:'floor'}],targets:[]};
const still={x:0,z:0,sprint:false},aim={x:0,y:0,z:1};
const feedback={play:()=>{}} as unknown as StoneFeedback;

test('double jump is one shorter impulse per landing, edge triggered, same grounded jump and no legacy air jump',async()=>{
  const world=await createSpatialWorld(floor);
  try{
    const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<20;i++)motor.step(still,false,aim);
    let highest=0,air=0;
    for(let i=0;i<100;i++){
      const s=motor.step({...still,jump:i===0||i>=21&&i<25||i===30},false,aim);if(s.airJump)air++;
      highest=Math.max(highest,s.current.position.y);
    }
    assert.equal(air,1);assert.equal(motor.jumpSnapshot().uses,1);assert.ok(highest>2.6&&highest<2.8,`${highest}`);
    assert.equal(sim.snapshot().grounded,true);
    motor.step({...still,jump:true},false,aim);motor.step(still,false,aim);
    assert.equal(motor.step({...still,jump:true},false,aim).airJump,true);
    assert.equal(motor.jumpSnapshot().uses,2);
    sim.reset();for(let i=0;i<20;i++)sim.step(still);
    let legacyHeight=0;for(let i=0;i<100;i++)legacyHeight=Math.max(legacyHeight,sim.step({...still,jump:i===0||i===21}).position.y);
    assert.ok(legacyHeight>2&&legacyHeight<2.2);
  }finally{world.dispose();}
});
test('held jump, pause and ceiling contact cannot regenerate air jumps',async()=>{
  const world=await createSpatialWorld({...floor,boxes:[...floor.boxes,{id:'ceiling',center:{x:0,y:3.1,z:0},size:{x:10,y:.2,z:10},material:'stone'}]});
  try{const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<20;i++)motor.step(still,false,aim);
    motor.step({...still,jump:true},false,aim);
    let ceiling=false;for(let i=0;i<5;i++){const s=motor.step({...still,jump:true},false,aim);ceiling ||=s.current.ceiling;}
    assert.equal(motor.jumpSnapshot().uses,0);
    motor.step(still,false,aim);motor.step({...still,jump:true},false,aim);motor.suspend();
    for(let i=0;i<8;i++){const s=motor.step({...still,jump:i%2===0},false,aim);ceiling ||=s.current.ceiling;assert.equal(motor.jumpSnapshot().uses,1);}
    assert.ok(sim.snapshot().position.y<1.3);assert.ok(ceiling||sim.snapshot().velocity.y<0,'ceiling stops upward movement');
  }finally{world.dispose();}
});
test('ground dash still has priority and air dash stays unavailable during double jump',async()=>{
  const world=await createSpatialWorld(floor);
  try{const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<20;i++)motor.step(still,false,aim);
    const dash=motor.step({...still,jump:true},true,aim);assert.equal(dash.started,true);assert.equal(dash.current.grounded,true);
    for(let i=0;i<50;i++)motor.step(still,false,aim);
    motor.step({...still,jump:true},false,aim);motor.step(still,false,aim);
    const second=motor.step({...still,jump:true},true,aim);assert.equal(second.airJump,true);assert.equal(second.started,false);
    assert.equal(motor.snapshot().invulnerable,false);
  }finally{world.dispose();}
});
test('jump plus attack chooses diagonal air move, second jump never resets attack or recovery',async()=>{
  const world=await createSpatialWorld(floor);
  try{const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const proto=new AdventurePrototype(sim,false);
    for(let i=0;i<20;i++)proto.step(still,false,false,null,world,[],feedback);
    proto.step({...still,jump:true},false,true,null,world,[],feedback);
    assert.equal(proto.snapshot().whip.attack,'air');assert.equal(proto.snapshot().whip.sequence,1);
    proto.step(still,false,false,null,world,[],feedback);
    proto.step({...still,jump:true},false,true,null,world,[],feedback);
    assert.equal(proto.snapshot().airJump.uses,1);assert.equal(proto.snapshot().whip.sequence,1);
    for(let i=0;i<38;i++)proto.step(still,false,false,null,world,[],feedback);
    proto.step(still,false,true,null,world,[],feedback);assert.equal(proto.snapshot().whip.sequence,2);
  }finally{world.dispose();}
});
test('air whip reaches below the player once, misses above/behind, is clipped by cover and has no landing explosion',async()=>{
  const world=await createSpatialWorld(floor),foot={x:0,y:2,z:0};
  const targets=[{id:'below',center:{x:.7,y:.9,z:2.7},radius:.5},{id:'above',center:{x:0,y:7,z:3},radius:.4},{id:'behind',center:{x:0,y:1,z:-3},radius:.4}];
  try{
    const whip=new EnergyWhip(),damage=[];for(let i=0;i<45;i++)damage.push(...whip.step(i,foot,aim,i===0,world,targets,'air').damage);
    assert.deepEqual(damage.map(d=>[d.target,d.amount]),[['below',30]]);
    assert.equal(whip.snapshot().returnHits,0);
  }finally{world.dispose();}
  const wall=await createSpatialWorld({...floor,boxes:[...floor.boxes,{id:'wall',center:{x:0,y:3,z:1.5},size:{x:10,y:6,z:.2},material:'stone'}]});
  try{const whip=new EnergyWhip();for(let i=0;i<45;i++){
    assert.equal(whip.step(i,foot,aim,i===0,wall,targets,'air').damage.length,0);
    if(i>=5&&i<16)assert.ok(clipWhip(whipCurve(foot,0,i,'air'),wall).every(p=>p.z<1.401));
  }}finally{wall.dispose();}
});
test('rising player keeps cursor direction anchored to the takeoff plane',async()=>{
  const world=await createSpatialWorld(floor);
  try{const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const p=new AdventurePrototype(sim,false);
    const ray={origin:{x:-1.6,y:10,z:3},direction:{x:0,y:-.8,z:-.6}};
    for(let i=0;i<20;i++)p.step(still,false,false,ray,world,[],feedback);
    const direction=p.snapshot().aim;
    for(let i=0;i<30;i++){p.step({...still,jump:i===0||i===21},false,false,ray,world,[],feedback);
      const current=p.snapshot().aim;assert.ok(Math.hypot(current.x-direction.x,current.z-direction.z)<.003);}
  }finally{world.dispose();}
});
test('double jump and moving air attacks replay identically at 30/60/144Hz',async()=>{
  const world=await createSpatialWorld(floor);let reference:unknown;
  try{for(const hz of [30,60,144]){
    const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const p=new AdventurePrototype(sim,false),clock=new FixedClock(),trace:unknown[]=[];
    for(let f=0;f<hz*2;f++)clock.advance(1/hz,()=>{const t=trace.length;if(t>=120)return;
      const result=p.step({...still,x:.2,jump:[20,41,46].includes(t)},false,[22,64].includes(t),null,world,[],feedback);
      trace.push({result,state:p.snapshot()});
    });assert.equal(p.snapshot().airJump.uses,1);if(reference)assert.deepEqual(trace,reference);else reference=trace;
  }}finally{world.dispose();}
});
test('double jump from the main floor cannot skip the closed boss or exit gate',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  world.setObstacleBox('north-gate',PROTOTYPE_EXIT_SEAL.center,PROTOTYPE_EXIT_SEAL.size);
  try{for(const [z,gate] of [[-12,-16],[-38,-42]] as const)for(const delay of [8,16,21,27]){
    const sim=new Simulation(world,{x:0,y:.06,z},STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<20;i++)motor.step(still,false,aim);
    for(let i=0;i<90;i++)motor.step({...still,z:-1,jump:i===0||i===delay},false,aim);
    assert.ok(sim.snapshot().position.z>gate,JSON.stringify({z,delay,position:sim.snapshot().position}));
  }
    world.setObstacleEnabled('north-gate',false);
    const exit=new Simulation(world,{x:0,y:.06,z:-40},STONE_ADVENTURE_JUMP);exit.reset();
    for(let i=0;i<45;i++)exit.step({...still,z:-1});assert.ok(exit.snapshot().position.z< -44);
  }finally{world.dispose();}
});
