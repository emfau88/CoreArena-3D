import test from 'node:test';
import assert from 'node:assert/strict';
import { BotBrain, BOT_RULES, perceive } from '../src/core/bot';
import { Combat, directionTo } from '../src/core/combat';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { solveAim } from '../src/core/aim';
import type { Snapshot } from '../src/core/types';
import { createCombatBot } from '../src/app/combatBot';
import { ArenaMatch } from '../src/core/match';
import { M1_ARENA } from '../src/arena/arena';

const own: Snapshot = { tick: 0, position: { x: 0, y: 0.03, z: 0 }, velocity: { x: 0, y: 0, z: 0 },
  facing: Math.PI, grounded: true, surface: 'floor', ceiling: false };
const enemy = { id: 'player', center: { x: 0, y: 1.13, z: -4 }, radius: 0.6, level: 'E0' };

test('bot sensor uses real 3D cover, range and view cone; moving targets update ray queries', async () => {
  for (const cover of [false, true]) {
    const world = await createSpatialWorld({ spawn: own.position, targets: [enemy], boxes: cover
      ? [{ id: 'wall', center: { x: 0, y: 1, z: -2 }, size: { x: 3, y: 2, z: 0.1 }, material: 'stone' }] : [] });
    try {
      assert.equal(!!perceive(world, own.position, Math.PI, enemy), !cover);
      assert.equal(perceive(world, own.position, 0, enemy), null);
      const distant = { ...enemy, center: { ...enemy.center, z: -20 } };
      world.setTargetPosition(enemy.id, distant.center);
      assert.equal(perceive(world, own.position, Math.PI, distant), null);
      const elevated = { ...enemy, center: { x: 0, y: 6, z: -4 } };
      world.setTargetPosition(enemy.id, elevated.center);
      assert.equal(perceive(world, own.position, Math.PI, elevated)?.id, enemy.id);
      world.setTargetEnabled(enemy.id, false);
      assert.equal(perceive(world, own.position, Math.PI, elevated), null);
    } finally { world.dispose(); }
  }
});

test('reaction gate resets on lost sight; memory is a copied last-seen point, expires and never permits blind fire', () => {
  const brain = new BotBrain(); const weapons = new Combat().snapshot();
  for (let tick = 1; tick < 1 + BOT_RULES.reactionTicks; tick++) assert.equal(brain.step(tick, own, enemy, weapons).firing, false);
  assert.equal(brain.step(25, own, enemy, weapons).firing, true);
  const lost = brain.step(26, own, null, weapons);
  assert.equal(lost.mode, 'search'); assert.equal(lost.firing, false); assert.equal(lost.aim, null);
  assert.deepEqual(lost.remembered, enemy.center);
  for (let tick = 27; tick < 27 + BOT_RULES.reactionTicks; tick++) assert.equal(brain.step(tick, own, enemy, weapons).firing, false);
  assert.equal(brain.step(51, own, enemy, weapons).firing, true);
  const copy = { ...enemy, center: { ...enemy.center } };
  brain.step(52, own, copy, weapons); copy.center.x = 100;
  assert.equal(brain.step(53, own, null, weapons).remembered?.x, 0);
  const expired = brain.step(52 + BOT_RULES.memoryTicks, own, null, weapons);
  assert.equal(expired.remembered, null); assert.equal(expired.mode, 'patrol');
  brain.reset(); assert.equal(brain.step(1, own, enemy, weapons).firing, false);
});

test('bot and player share Arc/Pulse damage, cooldown, ammunition and real projectile collisions', async () => {
  const world = await createSpatialWorld({ spawn: own.position, boxes: [], targets: [enemy] });
  try {
    const ray = { origin: { x: 0, y: 1.13, z: 0 }, direction: directionTo({ x: 0, y: 1.13, z: 0 }, enemy.center).direction };
    const aim = solveAim(world, ray, own.position)!;
    const bot = new Combat('rival'); const human = new Combat();
    const botHit = bot.step(1, true, aim, ray, world, [enemy]);
    const humanHit = human.step(1, true, aim, ray, world, [enemy]);
    assert.equal(botHit.damage[0]?.source, 'rival'); assert.equal(botHit.damage[0]?.amount, humanHit.damage[0]?.amount);
    assert.equal(bot.step(2, true, aim, ray, world, [enemy]).attacked, false);
    bot.addAmmo(1, true); bot.select('pulse');
    assert.equal(bot.step(3, true, aim, ray, world, [enemy]).damage.length, 0);
    assert.equal(bot.snapshot().ammo, 0); assert.equal(bot.snapshot().selected, 'arc');
    const hits = [];
    for (let tick = 4; tick < 20; tick++) hits.push(...bot.step(tick, false, null, null, world, []).damage);
    assert.equal(hits.length, 1); assert.equal(hits[0]!.source, 'rival'); assert.equal(hits[0]!.amount, 10);
  } finally { world.dispose(); }
});

test('integrated bot walks with the shared motor, earns an actual kill and resets its state', async () => {
  const bot = await createCombatBot();
  const match = new ArenaMatch([{ id: 'player', team: 'blue' }, { id: 'rival', team: 'red' }]); match.start();
  try {
    for (let tick = 1; tick <= 600 && match.snapshot().scores.red === 0; tick++) {
      const state = match.snapshot();
      const attack = bot.step(tick, state.actors.rival!, state.actors.player!, M1_ARENA.spawn);
      if (tick <= BOT_RULES.reactionTicks) assert.equal(attack.attacked, false);
      match.step(attack.damage, attack.attacked ? ['rival'] : []);
    }
    assert.equal(match.snapshot().scores.red, 1); assert.equal(match.snapshot().actors.player!.alive, false);
    assert.ok(bot.snapshot().position.z < 6); assert.equal(bot.snapshot().surface, 'floor');
    bot.reset(); assert.equal(bot.decision, null); assert.equal(bot.weapons.snapshot().lastArc, null);
    assert.equal(bot.snapshot().position.z, 9);
  } finally { bot.dispose(); }
});
