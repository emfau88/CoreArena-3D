import {writeFileSync,mkdirSync} from 'node:fs';
import {createAdventureVariant} from '../../src/app/adventureVariant';
import {prepareBossAttempt,LAB_SPAWN} from '../../src/app/adventureLab';
import {STONE_ADVENTURE_COMBAT,STONE_ADVENTURE_JUMP,ADVENTURE_BOSS} from '../../src/arena/stoneAdventure';
import {createSpatialWorld} from '../../src/physics/rapierWorld';
import {Simulation} from '../../src/core/simulation';
import {AdventureMotor,BOSS_BODY} from '../../src/core/adventureControls';
import {EnergyWhip} from '../../src/core/energyWhip';
import {directionTo} from '../../src/core/combat';
import {solveAim} from '../../src/core/aim';
import {PROTOTYPE_EXIT_SEAL} from '../../src/core/adventureBalance';

const rows:unknown[]=[];
const moves=process.argv[2]??'sweep',output=process.argv[3]??'docs/qa/adventure-a5-a7',trials=Number(process.argv[4]??9);
if(!['sweep','overhead','mixed','aerial'].includes(moves)||!Number.isInteger(trials)||trials<1||trials>9)throw new Error('Expected sweep/overhead/mixed/aerial, output directory, 1..9 trials');
for(const strategy of ['stationary','backward','circle','jump','plateau','reactive','complement',...(moves==='aerial'?['double-jump']:[])])for(let trial=0;trial<trials;trial++){
  const world=await createSpatialWorld(STONE_ADVENTURE_COMBAT,{stepHeight:.32});
  try{
    const fight=createAdventureVariant('prototype',strategy==='complement').fight;prepareBossAttempt(fight,world,'arc');
    world.setObstacleEnabled('dormant-warden',false);world.setObstacleEnabled('boss-entry-gate',true);
    world.setObstacleBox('north-gate',PROTOTYPE_EXIT_SEAL.center,PROTOTYPE_EXIT_SEAL.size);
    for(const runner of fight.runners)world.setTargetEnabled(runner.definition.id,false);
    const positionIndex=trial%3;
    const spawn=strategy==='plateau'?{x:-12+positionIndex,y:1.16,z:-23}:positionIndex===0?LAB_SPAWN:{x:positionIndex===1?-7:7,y:.06,z:-29};
    const sim=new Simulation(world,spawn,STONE_ADVENTURE_JUMP);sim.reset();const motor=new AdventureMotor(sim),whip=new EnergyWhip();
    const phases=new Set<string>();let shots=0,minimum=99,pulseDamage=0,pulseCounterDamage=0,pulseTicks=0,pulseMaxRange=0;
    for(let tick=0;tick<10800&&fight.life.snapshot().outcome==='running';tick++){
      const b=fight.life.snapshot(),p=sim.snapshot(),line=directionTo(p.position,{...b.center,y:p.position.y}),d=line.distance;
      phases.add(`${b.phase}:${b.kind}`);
      let x=0,z=0,jump=false,dash=false;
      if(strategy==='backward'&&d<6.3){x=-line.direction.x;z=-line.direction.z;}
      if(strategy==='circle'){x=line.direction.z+line.direction.x*(d-3.2);z=-line.direction.x+line.direction.z*(d-3.2);}
      if(strategy==='jump')jump=p.grounded;
      if(strategy==='double-jump')jump=p.grounded||motor.jumpSnapshot().available&&p.velocity.y<1;
      if(strategy==='reactive'||strategy==='complement'){
        if(b.phase==='melee'&&b.exchange?.window!=='counter'){
          if(b.phaseTick>12&&b.phaseTick<48){x=Math.cos(b.facing);z=-Math.sin(b.facing);dash=b.phaseTick===16;}
        }else if(b.kind==='eruption'&&(b.phase==='warning'||b.phase==='attack')){
          if(Math.hypot(p.position.x-b.target.x,p.position.z-b.target.z)<3.8){x=p.position.x<0?1:-1;}
        }else if(d>3.5){x=line.direction.x;z=line.direction.z;}
        jump=p.grounded&&b.kind==='wave'&&(b.phase==='warning'&&b.phaseTick>=78&&d<5||b.phase==='attack'&&d>b.waveRadius&&d-b.waveRadius<2.8);
      }
      world.setMovementBlocker('body',{x:b.center.x,y:BOSS_BODY.height/2,z:b.center.z},BOSS_BODY.radius,BOSS_BODY.height,true);
      world.setTargetPosition(ADVENTURE_BOSS.id,b.center);world.setTargetEnabled(ADVENTURE_BOSS.id,b.phase!=='emerging');
      const move=motor.step({x,z,jump,sprint:false},dash,line.direction);if(move.started)whip.cancel();
      const pulse=strategy==='complement'&&d>5&&fight.combat.snapshot().ammo>0&&b.phase!=='emerging';
      if(fight.combat.snapshot().selected!==(pulse?'pulse':'arc'))whip.cancel();
      fight.combat.select(pulse?'pulse':'arc');
      const origin={x:b.center.x,y:30,z:b.center.z+10},ray={origin,direction:directionTo(origin,b.center).direction};
      const shot=fight.combat.step(move.current.tick,pulse&&!move.active,solveAim(world,ray,move.current.position),ray,world,fight.targets(),move.current.position);
      if(shot.attacked){shots++;pulseMaxRange=Math.max(pulseMaxRange,d);}
      if(pulse)pulseTicks++;
      const rangedDamage=shot.damage.filter(h=>h.target===ADVENTURE_BOSS.id).reduce((n,h)=>n+h.amount,0);
      const overhead=moves==='overhead'||(moves==='mixed'||moves==='aerial')&&b.exchange?.window==='counter'&&d<5.5&&
        (b.phase==='melee'?b.phaseTick<100:b.phaseTick<64);
      const kind=moves==='aerial'&&!move.current.grounded?'air':overhead?'overhead':'sweep';
      const attack=whip.step(move.current.tick,move.current.position,line.direction,!pulse&&!move.active&&whip.snapshot().phase==='idle',world,fight.targets(),kind);
      fight.step(move.current.position,world,[...attack.damage,...shot.damage]);minimum=Math.min(minimum,d);
      // Attribute the observed HP delta, including protection/phase boundaries and overkill.
      const raw=rangedDamage+attack.damage.filter(h=>h.target===ADVENTURE_BOSS.id).reduce((n,h)=>n+h.amount,0);
      const applied=b.bossHp-fight.life.snapshot().bossHp;
      if(raw>0){pulseDamage+=applied*rangedDamage/raw;if(applied/raw>.5)pulseCounterDamage+=applied*rangedDamage/raw;}
    }
    const b=fight.life.snapshot();rows.push({strategy,moves,trial,spawn,outcome:b.outcome,seconds:(b.tick-120)/60,bossHp:b.bossHp,hp:b.hp,armor:b.armor,
      hitsTaken:b.hitsTaken,exchange:b.exchange,whip:whip.snapshot(),dash:motor.snapshot(),shots,pulseDamage,pulseCounterDamage,pulseTicks,pulseMaxRange,phases:[...phases],minimum,position:sim.snapshot().position});
    console.log(JSON.stringify({strategy,trial,outcome:b.outcome,seconds:(b.tick-120)/60,bossHp:b.bossHp,hp:b.hp,hits:b.hitsTaken}));
  }finally{world.dispose();}
}
mkdirSync(output,{recursive:true});writeFileSync(`${output}/combat-policies${moves==='sweep'?'':`-${moves}`}.json`,JSON.stringify(rows,null,2)+'\n');
