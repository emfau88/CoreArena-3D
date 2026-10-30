import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURE_RUNNERS, ADVENTURE_BOSS, ADVENTURE_BOSS_RULES, ADVENTURE_CHECKPOINT, STONE_ADVENTURE_COMBAT, STONE_ADVENTURE_JUMP } from '../src/arena/stoneAdventure';
import { Simulation } from '../src/core/simulation';
import { PveEncounter } from '../src/core/pve';
import { StoneRunner, RUNNER_RULES } from '../src/core/stoneRunner';
import { AdventureFight } from '../src/core/adventureFight';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import type { Snapshot } from '../src/core/types';
import { ADVENTURE_MISSION } from '../src/arena/adventureMission';

test('optional maintenance reserve survives refill and boss retry, is height-gated and resets with a new run',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),fight=new AdventureFight();
  const point={x:-12.5,y:1.12,z:2};
  try{
    fight.interact({...point,y:.02},world);assert.equal(fight.reserveRecovered,false);
    fight.interact({...point,x:0},world);assert.equal(fight.reserveRecovered,false);
    assert.equal(fight.interaction(point,world)?.kind,'reserve');
    fight.interact(point,world);assert.equal(fight.reserveRecovered,true);
    assert.equal(fight.life.snapshot().armor,50,'reward is applied at the checkpoint');
    assert.equal(fight.interaction(point,world)?.enabled,false);
    fight.step({x:0,y:.02,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
    fight.interact({x:-1,y:.02,z:-8},world);
    fight.step(ADVENTURE_CHECKPOINT,world,[]);assert.equal(fight.life.snapshot().armor,75);
    fight.life.step(ADVENTURE_CHECKPOINT,world,[],{active:false,incomingDamage:10});
    fight.interact(point,world);fight.step(ADVENTURE_CHECKPOINT,world,[]);
    assert.equal(fight.life.snapshot().armor,65,'no repeated collection or refill loop');
    fight.step({x:0,y:-9,z:-21},world,[]);fight.retry();
    assert.equal(fight.reserveRecovered,true);assert.equal(fight.life.snapshot().armor,75);
    assert.equal(fight.life.snapshot().hp,100);assert.equal(fight.combat.snapshot().ammo,54);
    fight.reset();assert.equal(fight.reserveRecovered,false);assert.equal(fight.life.snapshot().armor,50);
    fight.interact(point,world);fight.step({x:0,y:-9,z:2},world,[]);fight.retry();
    assert.equal(fight.reserveRecovered,false,'death before checkpoint starts a fresh run');
  }finally{world.dispose();}
});

test('reserve cannot be operated through cover; a late find raises checkpoint armor only once',async()=>{
  const barrier={id:'reserve-test-cover',center:{x:-13.5,y:1.8,z:2},size:{x:.2,y:1.4,z:3},material:'metal' as const};
  const world=await createSpatialWorld({...STONE_ADVENTURE_COMBAT,boxes:[...STONE_ADVENTURE_COMBAT.boxes,barrier]}),fight=new AdventureFight();
  try{
    const point={x:-12.5,y:1.12,z:2};fight.interact(point,world);assert.equal(fight.reserveRecovered,false);
    world.setObstacleEnabled(barrier.id,false);
    fight.step({x:0,y:.02,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
    fight.interact({x:-1,y:.02,z:-8},world);fight.step(ADVENTURE_CHECKPOINT,world,[]);
    fight.interact(point,world);assert.equal(fight.life.snapshot().armor,ADVENTURE_MISSION.reserve.armor);
    fight.life.step(point,world,[],{active:false,incomingDamage:10});fight.interact(point,world);
    assert.equal(fight.life.snapshot().armor,65);
  }finally{world.dispose();}
});

test('adventure boss warns for 0.5s, hits for 30, repeats after 1.4s and respects locked dodges and height',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT);
  world.setObstacleEnabled('dormant-warden',false);
  try {
    for(const defense of ['stay','distance','behind','height']){
      const boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS);
      const player={x:0,y:.02,z:-26};
      for(let i=0;i<120;i++)boss.step(player,world);
      boss.step(player,world);assert.equal(boss.snapshot().phase,'melee');
      const facing=boss.snapshot().facing;
      const target=defense==='distance'?{...player,x:6}:defense==='behind'?{...player,z:-32}:
        defense==='height'?{...player,y:2}:player;
      for(let i=0;i<29;i++)boss.step(target,world);
      assert.equal(boss.snapshot().hitsTaken,0);assert.equal(boss.snapshot().facing,facing);
      boss.step(target,world);assert.equal(boss.snapshot().hitsTaken,defense==='stay'?1:0);
      if(defense==='stay'){
        const first=boss.snapshot().lastHit;
        assert.equal(boss.snapshot().armor,20);
        for(let i=0;i<83;i++)boss.step(player,world);
        assert.equal(boss.snapshot().hitsTaken,1);
        boss.step(player,world);assert.equal(boss.snapshot().lastHit-first,84);
        assert.equal(boss.snapshot().hitsTaken,2);assert.equal(boss.snapshot().armor,0);assert.equal(boss.snapshot().hp,90);
      }
    }
    const boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS),far={x:0,y:.02,z:-21};
    for(let i=0;i<120;i++)boss.step(far,world);
    const start=boss.snapshot().center.z;
    for(let i=0;i<60;i++)boss.step(far,world);
    assert.ok(Math.abs(boss.snapshot().center.z-start-3.1)<.01);
    for(let i=0;i<600 && boss.snapshot().phase!=='recovery';i++)boss.step(far,world);
    assert.equal(boss.snapshot().phase,'recovery');
    for(let i=0;i<47;i++)boss.step(far,world);
    assert.equal(boss.snapshot().phase,'recovery');boss.step(far,world);
    assert.equal(boss.snapshot().phase,'chasing');
  }finally{world.dispose();}
});

test('adventure wave keeps its warning and 20m reach, hits once, then gives a real 0.8s recovery',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS);
  world.setObstacleEnabled('dormant-warden',false);world.setObstacleEnabled('boss-entry-gate',false);
  const player={x:0,y:.02,z:-9};
  try{
    for(let i=0;i<600&&boss.snapshot().phase!=='warning';i++)boss.step(player,world);
    assert.equal(boss.snapshot().phase,'warning');
    for(let i=0;i<89;i++)boss.step(player,world);
    assert.equal(boss.snapshot().phase,'warning');assert.equal(boss.snapshot().hitsTaken,0);
    boss.step(player,world);assert.equal(boss.snapshot().phase,'attack');
    for(let i=0;i<90;i++)boss.step(player,world);
    assert.equal(boss.snapshot().phase,'recovery');assert.equal(boss.snapshot().waveRadius,20);
    assert.equal(boss.snapshot().hitsTaken,1);assert.equal(boss.snapshot().hp,90);
    const center=boss.snapshot().center;
    for(let i=0;i<47;i++)boss.step(player,world);
    assert.deepEqual(boss.snapshot().center,center);assert.equal(boss.snapshot().phase,'recovery');
    boss.step(player,world);assert.equal(boss.snapshot().phase,'chasing');
  }finally{world.dispose();}
});

test('a real sidestep after 0.2s reaction escapes the locked adventure fist',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS);
  world.setObstacleEnabled('dormant-warden',false);
  const simulation=new Simulation(world,{x:0,y:.02,z:-26},STONE_ADVENTURE_JUMP);
  simulation.reset();
  try{
    for(let i=0;i<600&&boss.snapshot().phase!=='melee';i++)boss.step(simulation.step({x:0,z:0,sprint:false}).position,world);
    assert.equal(boss.snapshot().phase,'melee');
    const facing=boss.snapshot().facing;
    for(let i=0;i<30;i++)boss.step(simulation.step({x:i>=12?1:0,z:0,sprint:false}).position,world);
    assert.equal(boss.snapshot().hitsTaken,0);assert.equal(boss.snapshot().facing,facing);
    assert.ok(simulation.snapshot().position.x>2);
  }finally{world.dispose();}
});

test('small guard telegraphs one melee hit, respects dodge/height/cover, and stays dead',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT);
  try {
    const runner=new StoneRunner(ADVENTURE_RUNNERS[0],(_from,target)=>target);
    const player={x:2,y:.02,z:25.5};
    assert.equal(runner.step(player,world,[]),0); assert.equal(runner.snapshot().phase,'windup');
    for(let i=0;i<RUNNER_RULES.windup-1;i++) assert.equal(runner.step(player,world,[]),0);
    assert.equal(runner.step(player,world,[]),14);
    for(let i=0;i<RUNNER_RULES.recovery;i++) assert.equal(runner.step(player,world,[]),0);
    runner.reset(); runner.step(player,world,[]);
    for(let i=0;i<RUNNER_RULES.windup;i++) assert.equal(runner.step({...player,x:5},world,[]),0);
    runner.reset(); for(let i=0;i<60;i++) assert.equal(runner.step({...player,y:1.2},world,[]),0);
    const blocked=new StoneRunner({...ADVENTURE_RUNNERS[0],center:{x:8,y:.85,z:20.9}},(_from,target)=>target);
    for(let i=0;i<90;i++) assert.equal(blocked.step({x:8,y:.02,z:22},world,[]),0);
    runner.reset(); runner.step(player,world,[{source:'player',target:runner.definition.id,amount:35}]);
    assert.equal(runner.snapshot().hp,35);
    runner.step(player,world,[{source:'player',target:runner.definition.id,amount:35}]);
    assert.equal(runner.snapshot().phase,'dead');
    for(let i=0;i<120;i++) assert.equal(runner.step(player,world,[]),0);
    assert.equal(runner.snapshot().hp,0);
  } finally {world.dispose();}
});

test('mission console, checkpoint retry, required core and relay, physical exit and full reset',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),fight=new AdventureFight();
  const player={x:0,y:.02,z:-14};
  const consume=(id:string)=>{
    const item=fight.pickups.snapshot().find(p=>p.id===id)!;
    fight.pickups.step(1,{position:item.position,grounded:true,surface:item.surface} as Snapshot,world,(_kind,n)=>n);
  };
  try {
    fight.step(player,world,[]); assert.equal(fight.checkpoint,false);
    assert.equal(fight.snapshot().entryClosed,true);
    const consolePoint={x:-1,y:.02,z:-8};
    fight.interact(consolePoint,world);assert.equal(fight.consoleActive,false,'guards still secure the console');
    fight.step({x:0,y:0,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
    fight.step(player,world,[]);assert.equal(fight.checkpoint,false,'clearing guards alone does not power the station');
    fight.interact(player,world);assert.equal(fight.consoleActive,false,'out of range');
    fight.interact({...consolePoint,y:1.1},world);assert.equal(fight.consoleActive,false,'different height');
    fight.interact(consolePoint,world);assert.equal(fight.consoleActive,true);
    assert.equal(fight.snapshot().entryClosed,false);
    fight.life.step(player,world,[],{active:false,incomingDamage:80});
    consume('adventure-pulse'); consume('boss-ammo-east');
    fight.combat.addAmmo(9,true);
    fight.step(player,world,[]);
    assert.equal(fight.checkpoint,true); assert.equal(fight.bossActive,false);
    assert.equal(fight.life.snapshot().hp,100); assert.equal(fight.life.snapshot().armor,50);
    assert.equal(fight.combat.snapshot().ammo,54);
    fight.combat.reset(); fight.combat.addAmmo(2,true);
    fight.life.step(player,world,[],{active:false,incomingDamage:10});
    fight.step(player,world,[]);
    assert.equal(fight.life.snapshot().armor,40); assert.equal(fight.combat.snapshot().ammo,2);
    fight.step({...player,z:-21},world,[]); assert.equal(fight.bossActive,true);
    fight.step({...player,y:-9},world,[]); assert.equal(fight.life.snapshot().outcome,'defeat');
    assert.deepEqual(fight.retry(),ADVENTURE_CHECKPOINT);
    assert.equal(fight.bossActive,false); assert.equal(fight.checkpoint,true);
    assert.equal(fight.consoleActive,true);assert.equal(fight.relayActive,false);
    assert.equal(fight.life.snapshot().hp,100); assert.equal(fight.life.snapshot().armor,50);
    assert.equal(fight.life.snapshot().bossHp,600); assert.equal(fight.life.snapshot().phaseTick,0);
    assert.equal(fight.combat.snapshot().ammo,54); assert.equal(fight.combat.snapshot().selected,'pulse');
    assert.ok(fight.runners.every(r=>r.snapshot().hp===0));
    assert.equal(fight.pickups.snapshot().find(p=>p.id==='adventure-pulse')!.remaining,0);
    assert.equal(fight.pickups.snapshot().find(p=>p.id==='boss-ammo-east')!.remaining,18);
    world.setObstacleEnabled('dormant-warden',false);
    for(let i=0;i<121;i++) fight.step({...player,z:-21},world,[]);
    fight.step({...player,z:-21},world,[{source:'player',target:ADVENTURE_BOSS.id,amount:600}]);
    assert.equal(fight.life.snapshot().outcome,'victory'); assert.equal(fight.completed,false);
    const core=fight.snapshot().core!; assert.ok(core);assert.equal(core.collected,false);
    const relayPoint={x:-.8,y:.02,z:-39};
    fight.interact(relayPoint,world);assert.equal(fight.relayActive,false,'relay requires the core');
    fight.step({...player,z:-46},world,[]);assert.equal(fight.completed,false,'victory alone cannot complete');
    fight.step({...core.position,y:1.1},world,[]);assert.equal(fight.snapshot().core!.collected,false);
    fight.step(core.position,world,[]);assert.equal(fight.snapshot().core!.collected,true);
    fight.step({...player,z:-46},world,[]);assert.equal(fight.completed,false,'collected core alone cannot complete');
    fight.interact(player,world);assert.equal(fight.relayActive,false);
    fight.interact(relayPoint,world);assert.equal(fight.relayActive,true);
    fight.interact(relayPoint,world);assert.equal(fight.relayActive,true,'interaction is idempotent');
    fight.step(core.position,world,[]);assert.equal(fight.snapshot().core!.collected,true);
    fight.step({...player,z:-44},world,[]); assert.equal(fight.completed,false);
    fight.step({...player,z:-46,y:2},world,[]); assert.equal(fight.completed,false);
    fight.step({...player,z:-46},world,[]); assert.equal(fight.completed,true);
    fight.reset(); assert.equal(fight.completed,false); assert.equal(fight.checkpoint,false);
    assert.equal(fight.consoleActive,false);assert.equal(fight.relayActive,false);assert.equal(fight.snapshot().entryClosed,true);
    assert.equal(fight.snapshot().core,null);
    assert.ok(fight.runners.every(r=>r.snapshot().hp===70));
    assert.equal(fight.pickups.snapshot().find(p=>p.id==='adventure-pulse')!.remaining,54);
  } finally {world.dispose();}
});

test('closed boss threshold blocks walking, side bypass and jumps from the adjoining walls; opens on release',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),sim=new Simulation(world,STONE_ADVENTURE_COMBAT.spawn,STONE_ADVENTURE_JUMP);
  try {
    for(const x of [0,4.6,-4.6,5.8,-5.8,11.5,-11.5,17.9,-17.9]){
      for(const jump of [false,true]){
        // Include a jump from the wall top, higher than a jump from the floor.
        sim.reset({x,y:Math.abs(x)>5?1.02:.03,z:Math.abs(x)>5?-16.8:-18});
        for(let i=0;i<25;i++)sim.step({x:0,z:0,jump:false,sprint:false});
        let furthest=-Infinity;
        for(let i=0;i<90;i++) {
          const s=sim.step({x:0,z:1,jump:jump&&i%40===0,sprint:true});furthest=Math.max(furthest,s.position.z);
        }
        assert.ok(furthest<-16.45,`escaped at x=${x}, jump=${jump}: z=${furthest}`);
      }
    }
    world.setObstacleEnabled('boss-entry-gate',false);sim.reset({x:0,y:.03,z:-18});
    for(let i=0;i<45;i++)sim.step({x:0,z:1,jump:false,sprint:false});
    assert.ok(sim.snapshot().position.z>-14);
  }finally{world.dispose();}
});

test('supported plateaus provoke locked, dodgeable eruptions; a jump does not',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT);
  world.setObstacleEnabled('dormant-warden',false);
  try{
    for(const escape of [false,true]){
      const boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS),player={x:-12,y:1.12,z:-23};
      for(let i=0;i<180;i++)boss.step(player,world);
      const warning=boss.snapshot();assert.equal(warning.phase,'warning');assert.equal(warning.kind,'eruption');
      assert.ok(Math.abs(warning.target.y-1.1)<.02);
      const destination=escape?{...player,x:-6}:player;
      for(let i=0;i<75;i++)boss.step(destination,world);
      assert.deepEqual(boss.snapshot().target,warning.target);
      assert.equal(boss.snapshot().hitsTaken,0);boss.step(destination,world);
      assert.equal(boss.snapshot().hitsTaken,escape?0:1);
      if(!escape){
        const first=boss.snapshot().lastHit;
        for(let i=0;i<207;i++)boss.step(player,world);
        assert.equal(boss.snapshot().hitsTaken,2);assert.equal(boss.snapshot().lastHit-first,207);
      }
    }
    const boss=new PveEncounter(ADVENTURE_BOSS_RULES,ADVENTURE_BOSS);
    for(let i=0;i<180;i++)boss.step({x:0,y:2,z:-21},world);
    assert.equal(boss.snapshot().phase,'chasing');assert.equal(boss.snapshot().kind,'wave');
  }finally{world.dispose();}
});

test('distant player damage wakes a guard, pursues into arrival and lands melee; reset clears alert',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),fight=new AdventureFight(),player={x:2,y:.02,z:33};
  try {
    const guard=fight.runners[0]!;
    for(let i=0;i<30;i++)guard.step(player,world,[]);
    assert.equal(guard.snapshot().phase,'idle');
    guard.step(player,world,[{source:'player',target:guard.definition.id,amount:1}]);
    assert.equal(guard.snapshot().phase,'chasing');
    let damage=0;
    for(let i=0;i<240;i++)damage+=guard.step(player,world,[]);
    assert.ok(guard.snapshot().center.z>29);assert.ok(damage>=14);
    guard.reset();guard.step(player,world,[]);assert.equal(guard.snapshot().phase,'idle');
    const far={x:-14,y:.02,z:36};
    guard.step(far,world,[{source:'player',target:guard.definition.id,amount:1}]);
    assert.equal(guard.snapshot().moving,true);
  }finally{world.dispose();}
});

test('two guards share life with the dormant boss; console then entering wakes it, reset restores all',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),fight=new AdventureFight();
  try {
    const player={x:2,y:.02,z:25.5};
    for(let i=0;i<25;i++) fight.step(player,world,[]);
    assert.equal(fight.life.snapshot().armor,36); assert.equal(fight.life.snapshot().hp,100);
    assert.equal(fight.life.snapshot().phaseTick,0); assert.equal(fight.bossActive,false);
    fight.step({x:0,y:.02,z:-21},world,[{source:'player',target:ADVENTURE_BOSS.id,amount:600}]);
    assert.equal(fight.bossActive,false); assert.equal(fight.life.snapshot().bossHp,600);
    const hits=ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70}));
    fight.step(player,world,hits); assert.equal(fight.bossActive,false);
    assert.equal(fight.targets().length,0);
    fight.interact({x:-1,y:.02,z:-8},world);
    fight.step({x:0,y:.02,z:-21},world,[]); assert.equal(fight.bossActive,true);
    world.setObstacleEnabled('dormant-warden',false);
    for(let i=0;i<120;i++) fight.step({x:0,y:.02,z:-21},world,[]);
    assert.equal(fight.life.snapshot().phase,'chasing'); assert.equal(fight.targets().length,1);
    fight.step({x:0,y:.02,z:-21},world,[{source:'player',target:ADVENTURE_BOSS.id,amount:600}]);
    assert.equal(fight.life.snapshot().outcome,'victory');
    fight.reset(); assert.equal(fight.bossActive,false); assert.equal(fight.life.snapshot().armor,50);
    assert.ok(fight.runners.every(r=>r.snapshot().hp===70));
  } finally {world.dispose();}
});

test('mission interaction respects physical cover and a pre-checkpoint death resets the console',async()=>{
  const wall={id:'interaction-cover',center:{x:-1.8,y:1,z:-8},size:{x:.2,y:2,z:3},material:'stone' as const};
  const world=await createSpatialWorld({...STONE_ADVENTURE_COMBAT,boxes:[...STONE_ADVENTURE_COMBAT.boxes,wall]}),fight=new AdventureFight();
  try {
    fight.step({x:0,y:.02,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
    fight.interact({x:-1,y:.02,z:-8},world);assert.equal(fight.consoleActive,false);
    world.setObstacleEnabled(wall.id,false);
    fight.interact({x:-1,y:.02,z:-8},world);assert.equal(fight.consoleActive,true);
    fight.step({x:0,y:-9,z:-8},world,[]);assert.equal(fight.life.snapshot().outcome,'defeat');
    fight.retry();assert.equal(fight.consoleActive,false);assert.equal(fight.checkpoint,false);
    assert.ok(fight.runners.every(r=>r.snapshot().hp===70));
  }finally{world.dispose();}
});
