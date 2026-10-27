import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURE_RUNNERS, ADVENTURE_BOSS, STONE_ADVENTURE_COMBAT } from '../src/arena/stoneAdventure';
import { StoneRunner, RUNNER_RULES } from '../src/core/stoneRunner';
import { AdventureFight } from '../src/core/adventureFight';
import { createSpatialWorld } from '../src/physics/rapierWorld';

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
