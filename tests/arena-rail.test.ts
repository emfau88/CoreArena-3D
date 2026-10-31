import test from 'node:test';
import assert from 'node:assert/strict';
import { Combat, directionTo, WEAPONS } from '../src/core/combat';
import { solveAim } from '../src/core/aim';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { ArenaMatch } from '../src/core/match';
import { EXPANDED_ARENA, EXPANDED_PICKUPS, TEAM_SPAWNS } from '../src/arena/expandedArena';
import { createCombatBot } from '../src/app/combatBot';
import { Pickups } from '../src/core/pickups';

test('Rail is opt-in: Adventure defaults cannot unlock, select or cycle to it', () => {
  const adventure = new Combat();
  assert.equal(adventure.addRailAmmo(6), 0); adventure.select('rail');
  assert.equal(adventure.snapshot().selected, 'arc');
  adventure.addAmmo(54, true); adventure.select('rail');
  assert.equal(adventure.snapshot().selected, 'arc');
  adventure.cycle(); assert.equal(adventure.snapshot().selected, 'pulse');
  adventure.cycle(); assert.equal(adventure.snapshot().selected, 'arc');
  assert.equal('ownsRail' in adventure.snapshot(), false);
});

test('Rail hits at range and height, stops at the first body/wall, consumes one round and observes cooldown/reset', async () => {
  const foot = { x: 0, y: .02, z: 0 }, origin = { x: 0, y: 1.17, z: 0 };
  for (const elevated of [false, true]) for (const cover of ['none', 'wall', 'ally']) {
    const target = { id: 'enemy', center: { x: 0, y: elevated ? 5 : 1.17, z: 24 }, radius: .6, level: 'enemy' };
    const direction = directionTo(origin, target.center).direction;
    const world = await createSpatialWorld({ spawn: foot, boxes: cover === 'wall' ? [
      { id: 'wall', center: { x: 0, y: 3, z: 8 }, size: { x: 3, y: 6, z: .1 }, material: 'stone' },
    ] : [], targets: [target, ...(cover === 'ally' ? [{ id: 'ally', center: {
      x: 0, y: origin.y + direction.y * 8, z: direction.z * 8 }, radius: .6, level: 'ally' }] : [])] });
    try {
      const combat = new Combat('player', true), ray = { origin, direction }, aim = solveAim(world, ray, foot)!;
      combat.select('rail'); assert.equal(combat.snapshot().selected, 'arc');
      assert.equal(combat.addRailAmmo(99), 6); combat.select('rail');
      const attack = combat.step(1, true, aim, ray, world, [target], foot);
      assert.equal(attack.damage[0]?.target, cover === 'none' ? 'enemy' : cover);
      assert.equal(attack.damage[0]?.amount, WEAPONS.rail.damage);
      assert.equal(combat.snapshot().railAmmo, 5);
      assert.equal(combat.step(84, true, aim, ray, world, [target], foot).attacked, false);
      assert.equal(combat.step(85, true, aim, ray, world, [target], foot).attacked, true);
      if (cover === 'ally') {
        const match = new ArenaMatch([{ id: 'player', team: 'blue' }, { id: 'ally', team: 'blue' }, { id: 'enemy', team: 'red' }]);
        match.start(); for (let i = 0; i < 120; i++) match.step(); match.step(attack.damage, ['player']);
        assert.equal(match.snapshot().actors.ally!.armor, 50); assert.deepEqual(match.snapshot().scores, { blue: 0, red: 0 });
      }
      for (let tick = 169; tick <= 421; tick += 84) combat.step(tick, true, aim, ray, world, [target], foot);
      assert.equal(combat.snapshot().railAmmo, 0); assert.equal(combat.snapshot().selected, 'arc');
      combat.reset(); assert.equal(combat.snapshot().ownsRail, false); assert.equal(combat.snapshot().lastRail, null);
    } finally { world.dispose(); }
  }
});

test('expanded arena has exactly two extra weapon fields; a real bot walks both wings around cover and collects Rail', async () => {
  // Each full player capsule needs clearance from the low garden benches, too.
  for (const spawn of Object.values(TEAM_SPAWNS)) for (const box of EXPANDED_ARENA.boxes.filter(box => box.id !== 'floor'))
    assert.ok(Math.abs(spawn.x - box.center.x) > box.size.x / 2 + .45 || Math.abs(spawn.z - box.center.z) > box.size.z / 2 + .45,
      `spawn overlaps ${box.id}`);
  const fighter = { id: 'ally', team: 'blue' as const, spawn: { x: -14, y: .06, z: 3 }, facing: 0 };
  const bot = await createCombatBot(fighter, [fighter], EXPANDED_ARENA, true);
  const match = new ArenaMatch([fighter]); match.start(); const pickups = new Pickups(EXPANDED_PICKUPS);
  const visited = new Set<string>();
  try {
    assert.equal(EXPANDED_PICKUPS.length, 6);
    assert.equal(EXPANDED_PICKUPS.filter(item => item.kind === 'rail').length, 2);
    for (let tick = 1; tick < 2400 && visited.size < 2; tick++) {
      bot.stepActors(tick, match.snapshot().actors.ally!, []);
      const own = bot.snapshot();
      for (const field of EXPANDED_PICKUPS.filter(item => item.kind === 'rail'))
        if (Math.hypot(own.position.x - field.position.x, own.position.z - field.position.z) < .85) visited.add(field.id);
      pickups.step(tick, own, bot.world, (kind, amount) => kind === 'rail' ? bot.weapons.addRailAmmo(amount) : 0);
    }
    assert.deepEqual([...visited].sort(), ['rail-east', 'rail-west']);
    assert.equal(bot.weapons.snapshot().ownsRail, true); assert.equal(bot.snapshot().surface, 'floor');
  } finally { bot.dispose(); }
});
