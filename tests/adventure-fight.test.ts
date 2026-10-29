import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURE_RUNNERS, ADVENTURE_BOSS, ADVENTURE_BOSS_RULES, ADVENTURE_CHECKPOINT, STONE_ADVENTURE_COMBAT } from '../src/arena/stoneAdventure';
import { PveEncounter } from '../src/core/pve';
import { StoneRunner, RUNNER_RULES } from '../src/core/stoneRunner';
import { AdventureFight } from '../src/core/adventureFight';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import type { Snapshot } from '../src/core/types';

test('adventure boss strikes after 0.35s, repeats after 1.25s and still respects locked dodges and height',async()=>{
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
      for(let i=0;i<20;i++)boss.step(target,world);
      assert.equal(boss.snapshot().hitsTaken,0);assert.equal(boss.snapshot().facing,facing);
      boss.step(target,world);assert.equal(boss.snapshot().hitsTaken,defense==='stay'?1:0);
      if(defense==='stay'){
        const first=boss.snapshot().lastHit;
        for(let i=0;i<74;i++)boss.step(player,world);
        assert.equal(boss.snapshot().hitsTaken,1);
        boss.step(player,world);assert.equal(boss.snapshot().lastHit-first,75);
        assert.equal(boss.snapshot().hitsTaken,2);assert.equal(boss.snapshot().armor,10);
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

test('checkpoint supplies only once; retry keeps cleared approach and spent loot, restores boss supplies; only leaving completes the level',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT),fight=new AdventureFight();
  const player={x:0,y:.02,z:-14};
  const consume=(id:string)=>{
    const item=fight.pickups.snapshot().find(p=>p.id===id)!;
    fight.pickups.step(1,{position:item.position,grounded:true,surface:item.surface} as Snapshot,world,(_kind,n)=>n);
  };
  try {
    fight.step(player,world,[]); assert.equal(fight.checkpoint,false);
    fight.step({x:0,y:0,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
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
    fight.step({...player,z:-44},world,[]); assert.equal(fight.completed,false);
    fight.step({...player,z:-46,y:2},world,[]); assert.equal(fight.completed,false);
    fight.step({...player,z:-46},world,[]); assert.equal(fight.completed,true);
    fight.reset(); assert.equal(fight.completed,false); assert.equal(fight.checkpoint,false);
    assert.ok(fight.runners.every(r=>r.snapshot().hp===70));
    assert.equal(fight.pickups.snapshot().find(p=>p.id==='adventure-pulse')!.remaining,54);
  } finally {world.dispose();}
});

test('two guards share player life with the dormant boss; clearing them and entering wakes the boss, reset restores all',async()=>{
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
