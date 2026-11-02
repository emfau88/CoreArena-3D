import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdventureVariant, resolveAdventureEntry } from '../src/app/adventureVariant';
import { prepareBossAttempt, LAB_SPAWN, LabMeasurement } from '../src/app/adventureLab';
import { ADVENTURE_BOSS, ADVENTURE_RUNNERS, STONE_ADVENTURE_COMBAT, STONE_ADVENTURE_JUMP } from '../src/arena/stoneAdventure';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Simulation } from '../src/core/simulation';
import { FixedClock } from '../src/core/fixedClock';
import { directionTo } from '../src/core/combat';
import { solveAim } from '../src/core/aim';

test('Adventure routing isolates lab/profile parameters and preserves legacy defaults', () => {
  const route = (query: string, enabled = true) => resolveAdventureEntry(new URLSearchParams(query), enabled);
  const stone = 'mode=pve&adventure=1&level=stone';
  assert.deepEqual(route(stone), { profile: 'legacy', lab: false, exploration: false });
  assert.equal(route(stone+'&combat=prototype')?.profile, 'prototype');
  assert.deepEqual(route(stone+'&combat=prototype',false), route(stone));
  assert.equal(route(stone+'&lab=boss&combat=prototype')?.profile, 'prototype');
  assert.equal(route(stone+'&lab=boss&combat=typo')?.profile, 'legacy');
  assert.equal(route(stone+'&lab=typo&combat=prototype')?.lab, false);
  assert.deepEqual(route(stone+'&lab=boss&combat=prototype', false), route(stone));
  assert.deepEqual(resolveAdventureEntry(new URLSearchParams(stone+'&combat=prototype&lab=boss'),false,true),
    {profile:'prototype',lab:false,exploration:false,complement:false});
  assert.deepEqual(resolveAdventureEntry(new URLSearchParams(stone),false,true),route(stone));
  assert.equal(resolveAdventureEntry(new URLSearchParams('mode=pve&adventure=1&level=frost&combat=prototype'),false,true),null);
  assert.deepEqual(route(stone+'&lab=boss&explore=1&combat=prototype'), { profile: 'legacy', lab: false, exploration: true });
  for (const query of ['', 'mode=arena', 'mode=pve', 'mode=pve&adventure=0&level=stone',
    'mode=pve&adventure=1&level=frost', 'mode=pve&adventure=1&level=ember']) {
    assert.equal(route(query+'&lab=boss&combat=prototype'), null, query);
  }
  const a = createAdventureVariant('legacy'), b = createAdventureVariant('prototype');
  assert.equal(a.fight.snapshot().pve.exchange,undefined);assert.ok(b.fight.snapshot().pve.exchange);
  assert.equal(a.fight.life.rules.bossHp,600);assert.equal(b.fight.life.rules.bossHp,900);
  a.fight.consoleActive = true; assert.equal(b.fight.consoleActive, false);
});

for (const weapon of ['arc','pulse'] as const) test(`${weapon}: identical 30/60/144 Hz replays in Legacy and after dirty reset`, async () => {
  const world = await createSpatialWorld(STONE_ADVENTURE_COMBAT, { stepHeight: .32 });
  try {
    let reference: unknown[] | undefined;
    for (const profile of ['legacy'] as const) {
      const { fight } = createAdventureVariant(profile);
      for (const hz of [30,60,144]) {
        prepareBossAttempt(fight, world, weapon);
        const sim = new Simulation(world, LAB_SPAWN, STONE_ADVENTURE_JUMP); sim.reset();
        const initial = { player: sim.snapshot(), fight: fight.snapshot(), weapons: fight.combat.snapshot(), pickups: fight.pickups.snapshot() };
        assert.equal(initial.fight.pve.tick, 0); assert.equal(initial.fight.pve.bossHp, 600);
        assert.equal(initial.fight.reserveRecovered, false); assert.equal(initial.weapons.ammo, 54);
        assert.ok(initial.fight.runners.every(r => r.hp === 0));
        const trace: unknown[] = [initial], clock = new FixedClock();
        const sync = () => {
          const state = fight.snapshot();
          for (const runner of ADVENTURE_RUNNERS) world.setTargetEnabled(runner.id, false);
          world.setTargetPosition(ADVENTURE_BOSS.id, state.pve.center);
          world.setTargetEnabled(ADVENTURE_BOSS.id, state.pve.phase !== 'emerging' && state.pve.outcome === 'running');
          world.setObstacleEnabled('dormant-warden', false);
          world.setObstacleEnabled('boss-entry-gate', true); world.setObstacleEnabled('north-gate', true);
        };
        sync();
        for (let frame=0;frame<hz*12;frame++) clock.advance(1/hz, () => {
          const tick = sim.snapshot().tick;
          if (tick >= 720) return;
          const player = sim.step({ x: tick > 270 && tick < 290 ? 1 : tick >= 290 && tick < 310 ? -1 : 0,
            z: 0, sprint: tick > 270 && tick < 310, jump: tick === 360 });
          const boss = fight.life.snapshot(), origin = { x: boss.center.x, y: 30, z: boss.center.z+10 };
          const ray = { origin, direction: directionTo(origin, boss.center).direction };
          const result = fight.combat.step(player.tick, tick >= 120, solveAim(world, ray, player.position), ray, world, fight.targets(), player.position);
          fight.step(player.position, world, result.damage); sync();
          trace.push({ player, fight: fight.snapshot(), weapons: fight.combat.snapshot(), damage: result.damage });
        });
        assert.equal(trace.length, 721); assert.equal(clock.droppedTicks, 0);
        assert.ok(fight.life.snapshot().bossHp < 600, 'Replay must actually hit the boss');
        if (reference) assert.deepEqual(trace, reference, `${profile} at ${hz} Hz`); else reference = trace;
        // Contaminate state that must never leak into the next attempt.
        fight.reserveRecovered = true; fight.relayActive = true; fight.completed = true;
        fight.life.step({ ...LAB_SPAWN, y: -9 }, world);
      }
    }
  } finally { world.dispose(); }
});

test('lab metrics exclude emergence, freeze on result and distinguish restart from defeat', () => {
  const fight = createAdventureVariant('legacy').fight;
  const before = fight.life.snapshot();
  const player = { tick: 120, position: LAB_SPAWN, velocity: {x:0,y:0,z:0}, grounded:true, facing:0, surface:'floor-boss', ceiling:false };
  const m = new LabMeasurement({}, 'legacy', 'arc');
  m.step(before, { ...before, phase: 'chasing' }, player, false, .3);
  m.step({ ...before, phase:'melee' }, { ...before, phase:'melee', armor:20, bossHp:565 }, { ...player, tick:180 }, true, .4);
  m.step(before, { ...before, phase:'defeated', outcome:'victory', bossHp:0 }, { ...player, tick:240 }, false, .2);
  m.abort('restart');
  assert.equal(m.read().outcome, 'victory'); assert.equal(m.read().activeSeconds, 2);
  assert.equal(m.read().damageTaken.melee, 30); assert.equal(m.read().dashUses, null);
  const unfinished = new LabMeasurement({}, 'legacy', 'pulse'); unfinished.abort('restart');
  assert.equal(unfinished.read().outcome, 'aborted'); assert.equal(unfinished.read().activeSeconds, 0);
});
