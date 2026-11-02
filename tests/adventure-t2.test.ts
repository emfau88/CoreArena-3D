import test from 'node:test';
import assert from 'node:assert/strict';
import {PveEncounter} from '../src/core/pve';
import {AdventureFight} from '../src/core/adventureFight';
import {PROTOTYPE_BOSS_RULES as rules,PROTOTYPE_TACTICS as tactics} from '../src/core/adventureBalance';
import {ADVENTURE_BOSS,STONE_ADVENTURE_COMBAT,STONE_ADVENTURE_JUMP,ADVENTURE_RUNNERS,ADVENTURE_CHECKPOINT} from '../src/arena/stoneAdventure';
import {createSpatialWorld} from '../src/physics/rapierWorld';
import {Simulation} from '../src/core/simulation';
import {AdventureMotor} from '../src/core/adventureControls';
import {EnergyWhip} from '../src/core/energyWhip';
import {directionTo} from '../src/core/combat';
import {solveAim} from '../src/core/aim';
import {FixedClock} from '../src/core/fixedClock';
import {prepareBossAttempt,LAB_SPAWN} from '../src/app/adventureLab';

test('prototype Faust: 0.2s reaction, walk/dash escape, jump is not protection, one active contact and full counter',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});world.setObstacleEnabled('dormant-warden',false);
  try{for(const defense of ['stay','walk','dash','jump']){
    const boss=new PveEncounter(rules,ADVENTURE_BOSS,'stone',undefined,{...tactics,meleeOnly:true});
    const sim=new Simulation(world,{x:0,y:.06,z:-25},STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim),whip=new EnergyWhip();
    for(let i=0;i<130&&boss.snapshot().phase!=='melee';i++){motor.step({x:0,z:0,sprint:false},false,{x:0,y:0,z:-1});boss.step(sim.snapshot().position,world);}
    assert.equal(boss.snapshot().phase,'melee');const facing=boss.snapshot().facing;let counter=0,firstHit=-1;
    for(let i=0;i<rules.meleeWarning+rules.meleeRecovery;i++){
      const b=boss.snapshot(),p=sim.snapshot(),direction=directionTo(p.position,{...b.center,y:p.position.y}).direction;
      const dodge=i>=12&&i<48&&(defense==='walk'||defense==='dash');
      const back=i>=54&&Math.hypot(p.position.x-b.center.x,p.position.z-b.center.z)>3.5;
      const move=motor.step({x:dodge?1:back?direction.x:0,z:back?direction.z:0,sprint:false,jump:defense==='jump'&&i===35},defense==='dash'&&i===16,direction);
      const attack=whip.step(move.current.tick,move.current.position,direction,i>=60&&whip.snapshot().phase==='idle',world,[{...ADVENTURE_BOSS,center:b.center}]);
      const before=b.bossHp;boss.step(move.current.position,world,attack.damage);
      if(boss.snapshot().hitsTaken&&firstHit<0)firstHit=boss.snapshot().phaseTick;
      if(b.exchange?.window==='counter')counter+=before-boss.snapshot().bossHp;
      assert.equal(boss.snapshot().facing,facing);
    }
    assert.equal(boss.snapshot().hitsTaken,defense==='stay'||defense==='jump'?1:0,defense);
    if(firstHit>=0)assert.equal(firstHit,48);
    assert.ok(counter>=36,`${defense}: return to range allows a complete whip (${counter})`);
  }}finally{world.dispose();}
});

test('platform height: wave stays on floor; supported plateau receives a locked elevated eruption, walking out works',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});world.setObstacleEnabled('dormant-warden',false);
  const evidence:unknown[]=[];
  try{
    // Open floor isolates height from cover; the same swept annulus must spare the elevated foot.
    const open={raycast:()=>null,sweepBall:()=>null};
    for(const y of [.02,1.12,2.1]){
      const boss=new PveEncounter({...rules,emergeTicks:1,chaseTicks:1,elevatedChaseTicks:0,chaseSpeed:0},ADVENTURE_BOSS,'stone',undefined,tactics);
      for(let i=0;i<200;i++)boss.step({x:0,y,z:-24},open);
      assert.equal(boss.snapshot().hitsTaken,y<.7?1:0,`wave at foot height ${y}`);
    }
    for(const x of [-13,-12,-10])for(const leave of [false,true]){
      const boss=new PveEncounter(rules,ADVENTURE_BOSS,'stone',undefined,tactics),spawn={x,y:1.12,z:-23};
      const sim=new Simulation(world,spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
      for(let i=0;i<450&&boss.snapshot().phase!=='warning';i++){
        motor.step({x:0,z:0,sprint:false},false,{x:1,y:0,z:0});boss.step(sim.snapshot().position,world);
      }
      const warning=boss.snapshot();assert.equal(warning.phase,'warning');assert.equal(warning.kind,'eruption');
      assert.ok(Math.abs(warning.target.y-1.1)<.03,JSON.stringify(warning.target));
      const before=warning.hitsTaken;
      for(let i=0;i<80;i++){
        const move=motor.step({x:leave&&i>=12?1:0,z:0,sprint:false},false,{x:1,y:0,z:0});boss.step(move.current.position,world);
        assert.deepEqual(boss.snapshot().target,warning.target);
      }
      assert.equal(boss.snapshot().hitsTaken-before,leave?0:1,`${x}, leave=${leave}`);
      evidence.push({x,leave,target:warning.target,hits:boss.snapshot().hitsTaken-before});
    }
    console.log(JSON.stringify({plateau:evidence}));
  }finally{world.dispose();}
});

test('prototype mission supplies/retries: no phantom ammo, optional reserve, no checkpoint refill loop, reset effects and progress',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT);
  try{for(const reserve of [false,true])for(const complement of [false,true]){
    const fight=new AdventureFight(true,complement);
    assert.ok(fight.pickups.snapshot().every(p=>p.kind==='health'||p.kind==='armor'));
    if(reserve)fight.interact({x:-12.5,y:1.12,z:2},world);
    fight.step({x:0,y:.02,z:33},world,ADVENTURE_RUNNERS.map(r=>({source:'player',target:r.id,amount:70})));
    fight.interact({x:-1,y:.02,z:-8},world);fight.step(ADVENTURE_CHECKPOINT,world,[]);
    assert.equal(fight.checkpoint,true);assert.equal(fight.life.snapshot().armor,reserve?75:50);
    assert.equal(fight.combat.snapshot().ammo,complement?12:0);
    if(complement){
      const origin={x:0,y:30,z:-21},ray={origin,direction:{x:0,y:-1,z:0}};
      const aim=solveAim(world,ray,ADVENTURE_CHECKPOINT);fight.combat.select('pulse');
      assert.equal(fight.combat.step(200,true,aim,ray,world,[],ADVENTURE_CHECKPOINT).attacked,true);
      fight.combat.select('arc');fight.combat.select('pulse');
      assert.equal(fight.combat.step(201,true,aim,ray,world,[],ADVENTURE_CHECKPOINT).attacked,false);
      fight.step(ADVENTURE_CHECKPOINT,world,[]);assert.equal(fight.combat.snapshot().ammo,11);
    }
    fight.step({x:0,y:-9,z:-21},world,[]);fight.retry();
    assert.equal(fight.combat.snapshot().projectiles.length,0);assert.equal(fight.combat.snapshot().ammo,complement?12:0);
    assert.equal(fight.life.snapshot().bossHp,900);assert.equal(fight.reserveRecovered,reserve);assert.equal(fight.consoleActive,true);
    fight.reset();assert.equal(fight.consoleActive,false);assert.equal(fight.reserveRecovered,false);assert.equal(fight.checkpoint,false);
    fight.step({x:0,y:-9,z:33},world,[]);fight.retry();assert.ok(fight.runners.every(r=>r.snapshot().hp===70));
  }}finally{world.dispose();}
});

test('new boss/whip replay is deterministic at 30/60/144Hz and dirty reset',async()=>{
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});let reference:unknown;
  try{for(const hz of [30,60,144]){
    const fight=new AdventureFight(true);prepareBossAttempt(fight,world,'arc');world.setObstacleEnabled('dormant-warden',false);
    const sim=new Simulation(world,LAB_SPAWN,STONE_ADVENTURE_JUMP);sim.reset();const whip=new EnergyWhip(),clock=new FixedClock();const trace:unknown[]=[];
    for(let f=0;f<hz*12;f++)clock.advance(1/hz,()=>{
      if(trace.length>=720)return;
      const player=sim.step({x:0,z:0,sprint:false}),b=fight.life.snapshot(),dir=directionTo(player.position,b.center).direction;
      const attack=whip.step(player.tick,player.position,{...dir,y:0},whip.snapshot().phase==='idle',world,fight.targets());
      fight.step(player.position,world,attack.damage);trace.push(fight.snapshot());
    });
    assert.equal(trace.length,720);assert.ok(fight.life.snapshot().bossHp<900);
    if(reference)assert.deepEqual(trace,reference);else reference=trace;
    fight.reserveRecovered=true;fight.completed=true;fight.life.step({...LAB_SPAWN,y:-9},world);
    prepareBossAttempt(fight,world,'arc');assert.equal(fight.life.snapshot().bossHp,900);assert.equal(fight.completed,false);
  }}finally{world.dispose();}
});

test('wave crossing: grounded dash has no immunity; jump clears annulus; repeated jump cannot add an air jump',async()=>{
  const floor={spawn:{x:0,y:.06,z:6},boxes:[{id:'floor',center:{x:0,y:-.5,z:0},size:{x:50,y:1,z:50},material:'floor' as const}],targets:[]};
  const world=await createSpatialWorld(floor);
  try{for(const jumping of [false,true]){
    const boss=new PveEncounter({...rules,emergeTicks:1,chaseTicks:1,elevatedChaseTicks:0,chaseSpeed:0},
      {...ADVENTURE_BOSS,center:{x:0,y:1.85,z:0}},'stone',undefined,tactics);
    const sim=new Simulation(world,floor.spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim);
    for(let i=0;i<100&&boss.snapshot().phase!=='attack';i++){
      const p=motor.step({x:0,z:0,sprint:false},false,{x:0,y:0,z:-1}).current;boss.step(p.position,world);
    }
    let jumped=false,highest=0;
    for(let i=0;i<90;i++){
      const b=boss.snapshot(),p=sim.snapshot(),distance=Math.hypot(p.position.x,p.position.z);
      const leap=jumping&&!jumped&&distance-b.waveRadius<2.8;
      const move=motor.step({x:0,z:jumping?0:-1,sprint:false,jump:leap||jumped&&!p.grounded},!jumping&&i===0,{x:0,y:0,z:-1});
      if(leap)jumped=true;highest=Math.max(highest,move.current.position.y);boss.step(move.current.position,world);
    }
    assert.equal(boss.snapshot().hitsTaken,jumping?0:1);if(jumping)assert.ok(highest>2&&highest<2.2);
  }}finally{world.dispose();}
});
