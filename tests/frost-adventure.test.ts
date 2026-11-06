import test from 'node:test';
import assert from 'node:assert/strict';
import {FROST_ARENA,FROST_BOSS,FROST_RULES,FROST_TACTICS,FROST_MISSION} from '../src/arena/frostAdventure';
import {PveEncounter,frostShards,type MonsterWorld,type MonsterPhase} from '../src/core/pve';
import {FROST_PATTERN} from '../src/core/frostPattern';
import {FrostGuard} from '../src/core/frostGuard';
import {FrostAdventureFight} from '../src/core/frostAdventureFight';
import {campaignLevel} from '../src/arena/campaign';
import {createSpatialWorld} from '../src/physics/rapierWorld';
import {resolveFrostEntry} from '../src/app/adventureVariant';
import {FixedClock} from '../src/core/fixedClock';
import type {Vec3} from '../src/core/types';
const floor:MonsterWorld={raycast:(ray,max)=>{const d=-ray.origin.y/ray.direction.y;if(ray.direction.y>=0||d<0||d>max)return null;
  return {id:'floor',point:{x:ray.origin.x+ray.direction.x*d,y:0,z:ray.origin.z+ray.direction.z*d},normal:{x:0,y:1,z:0},distance:d};},sweepBall:()=>null};
const rules={...FROST_RULES,emergeTicks:1,chaseTicks:1,chaseSpeed:0};
const encounter=()=>new PveEncounter(rules,FROST_BOSS,'frost',undefined,{...FROST_TACTICS,meleeTrigger:0});
function until(b:PveEncounter,phase:MonsterPhase,p:Vec3,world=floor){for(let t=0;t<3000;t++){if(b.snapshot().phase===phase)return;b.step(p,world);b.restore(100);b.restoreArmor(100);}throw new Error('Missing phase '+phase);}
test('Frost profile has traversable shard gaps, fixed aim and cover; legacy shard shape and rules stay unchanged',async()=>{
  const run=(angle:number,world=floor)=>{const b=encounter(),p={x:Math.sin(angle)*7,y:0,z:-1+Math.cos(angle)*7};
    until(b,'warning',{x:0,y:0,z:8},world);const facing=b.snapshot().facing;
    for(let t=0;t<180;t++)b.step(p,world);
    assert.equal(b.snapshot().facing,facing);return b.snapshot();};
  assert.ok(run(0).hitsTaken>0);assert.equal(run(.3).hitsTaken,0);
  const world=await createSpatialWorld({spawn:{x:0,y:.06,z:8},boxes:[{id:'cover',material:'stone',center:{x:0,y:1,z:2},size:{x:2,y:2,z:.4}}],targets:[]});
  try{assert.equal(run(0,world).hitsTaken,0);}finally{world.dispose();}
  const legacy=new PveEncounter(campaignLevel('frost').rules,campaignLevel('frost').monster,'frost').snapshot();
  assert.equal(legacy.frostProfile,undefined);assert.equal(campaignLevel('frost').rules.bossHp,650);
  assert.notDeepEqual(frostShards({...legacy,frostProfile:true}),frostShards(legacy));
});
test('Frost rewards flank position outside global recovery; bite direction locks and never damages during windup',()=>{
  for(const [angle,expected] of [[0,3.3],[Math.PI/2,22]] as const){const b=encounter();until(b,'chasing',{x:0,y:0,z:5});
    b.step({x:Math.sin(angle)*3,y:0,z:-1+Math.cos(angle)*3},floor,[{source:'player',target:FROST_BOSS.id,amount:22}]);
    assert.ok(Math.abs(FROST_RULES.bossHp-b.snapshot().bossHp-expected)<1e-8);}
  const b=new PveEncounter({...FROST_RULES,emergeTicks:1,chaseTicks:1000,chaseSpeed:0},FROST_BOSS,'frost',undefined,FROST_TACTICS);
  until(b,'melee',{x:0,y:0,z:2});const facing=b.snapshot().facing;
  for(let tick=0;tick<FROST_RULES.meleeWarning-1;tick++){b.step({x:0,y:0,z:2},floor);assert.equal(b.snapshot().hitsTaken,0);}
  for(let tick=0;tick<10;tick++)b.step({x:3,y:0,z:-1},floor);
  assert.equal(b.snapshot().hitsTaken,0);assert.equal(b.snapshot().facing,facing);
});
test('one telegraphed side-step has anticipation, bounded movement and recovery, and stops instead of jumping through a player',()=>{
  const b=encounter(),p={x:0,y:8,z:8};until(b,'reposition',p);const start=b.snapshot(),to=start.relocation!.to;
  for(let i=0;i<FROST_PATTERN.relocateWarning;i++){b.step(p,floor);assert.deepEqual(b.snapshot().center,start.center);}
  let previous=b.snapshot().center;
  for(let i=0;i<FROST_PATTERN.relocateMove;i++){b.step(p,floor);const s=b.snapshot();assert.ok(Math.hypot(s.center.x-previous.x,s.center.z-previous.z)<.3);previous=s.center;}
  assert.ok(Math.hypot(previous.x-to.x,previous.z-to.z)<.001);assert.equal(b.snapshot().exchange?.window,'counter');
  const blocked=encounter();until(blocked,'reposition',p);const origin=blocked.snapshot().center;
  for(let i=0;i<FROST_PATTERN.relocateWarning+2;i++)blocked.step({...origin,y:0,x:origin.x+.1},floor);
  assert.deepEqual(blocked.snapshot().center,origin);assert.equal(blocked.snapshot().exchange?.window,'counter');
});
test('slow guard locks its warning, real cover destroys the projectile and death clears it',async()=>{
  const guard=new FrostGuard({id:'guard',center:{x:0,y:1,z:0},radius:.65,activateZ:10});
  guard.step({x:0,y:0,z:8},floor);for(let t=0;t<59;t++)assert.equal(guard.step({x:4,y:0,z:8},floor),0);
  assert.equal(guard.snapshot().facing,0);guard.step({x:4,y:0,z:8},floor);assert.ok(guard.snapshot().shot);
  const world=await createSpatialWorld({spawn:{x:0,y:.06,z:8},boxes:[{id:'cover',material:'stone',center:{x:0,y:1,z:2},size:{x:3,y:2,z:.4}}],targets:[]});
  try{for(let t=0;t<30;t++)assert.equal(guard.step({x:0,y:0,z:8},world),0);assert.equal(guard.snapshot().shot,null);}finally{world.dispose();}
  guard.step({x:0,y:0,z:8},floor,[{source:'player',target:'guard',amount:72}]);assert.equal(guard.snapshot().phase,'dead');assert.equal(guard.snapshot().shot,null);
  guard.reset();guard.step({x:0,y:0,z:8},floor);
  for(let t=0;t<155;t++)guard.step({x:4,y:0,z:8},floor);
  assert.ok(guard.snapshot().shot);assert.equal(guard.snapshot().facing,0);assert.equal(guard.snapshot().phase,'recovery');
});
test('mission needs both guards and the valve; checkpoint retry skips approach, exit needs victory and reset restores it all',async()=>{
  const world=await createSpatialWorld(FROST_ARENA,{stepHeight:.32});
  try{const fight=new FrostAdventureFight(),valve={...FROST_MISSION.valve,y:0};fight.reset();
    fight.step(FROST_MISSION.exit,world);assert.equal(fight.completed,false);fight.interact(valve,world);assert.equal(fight.checkpoint,false);
    fight.step(FROST_MISSION.spawn,world,fight.guards.map(g=>({source:'player',target:g.definition.id,amount:72})));
    assert.equal(fight.interaction(valve,world)?.enabled,true);fight.interact(valve,world);assert.equal(fight.checkpoint,true);
    fight.step({x:0,y:0,z:2},world);assert.equal(fight.bossActive,true);
    fight.step({x:0,y:-9,z:2},world);assert.equal(fight.life.snapshot().outcome,'defeat');
    assert.deepEqual(fight.retry(),FROST_MISSION.checkpoint);assert.ok(fight.guards.every(g=>g.snapshot().hp===0));assert.equal(fight.life.snapshot().hp,100);
    assert.equal(fight.life.snapshot().bossHp,720);assert.equal(fight.checkpoint,true);assert.equal(fight.bossActive,false);
    fight.reset();assert.equal(fight.checkpoint,false);assert.ok(fight.guards.every(g=>g.snapshot().hp===72));
  }finally{world.dispose();}
});
test('Frost encounter replays identically at 30/60/144Hz and resets all reposition state',()=>{
  let reference:unknown;
  for(const hz of [30,60,144]){const b=encounter(),clock=new FixedClock(),trace:unknown[]=[];
    for(let frame=0;frame<hz*15;frame++)clock.advance(1/hz,()=>{if(trace.length>=900)return;b.step({x:0,y:8,z:8},floor);trace.push(b.snapshot());});
    assert.equal(trace.length,900);assert.ok(trace.some(s=>(s as ReturnType<PveEncounter['snapshot']>).phase==='reposition'));
    if(reference)assert.deepEqual(trace,reference);else reference=trace;b.reset();assert.equal(b.snapshot().relocation,undefined);assert.equal(b.snapshot().tick,0);
  }
});
test('Frost prototype routing is explicit and never replaces Legacy frost or other levels',()=>{
  const q=new URLSearchParams('mode=pve&level=frost&adventure=1&combat=prototype');assert.deepEqual(resolveFrostEntry(q,true),{practice:false,trial:null});
  assert.equal(resolveFrostEntry(q,false),null);q.delete('adventure');assert.equal(resolveFrostEntry(q,true),null);
});
