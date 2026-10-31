import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPACT_JUMP, SHALLOW_STEPS } from '../src/core/movementProfile';
import { STONE_ADVENTURE_JUMP } from '../src/arena/stoneAdventure';
import { EXPANDED_ARENA, EXPANDED_PICKUPS } from '../src/arena/expandedArena';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Simulation } from '../src/core/simulation';
import { TraversalProbe } from '../src/core/traversal';
import { ArenaMatch } from '../src/core/match';
import { Combat } from '../src/core/combat';
import { Pickups } from '../src/core/pickups';
import { createCombatBot } from '../src/app/combatBot';
import { chooseBotResource } from '../src/core/botResources';
import { BOT_DIFFICULTIES, BotBrain, type BotDifficulty } from '../src/core/bot';

test('shared Adventure motor keeps E0/E1/E2 route reachable, steps .3m but blocks a full ledge', async () => {
  assert.equal(COMPACT_JUMP, STONE_ADVENTURE_JUMP);
  const world = await createSpatialWorld(EXPANDED_ARENA, SHALLOW_STEPS);
  try {
    const sim = new Simulation(world, EXPANDED_ARENA.spawn, COMPACT_JUMP), probe = new TraversalProbe(EXPANDED_ARENA.links!.slice(0, 3));
    probe.start();
    for (let i = 0; i < 1802 && probe.status === 'running'; i++) sim.step(probe.command(sim.snapshot()));
    assert.equal(probe.status, 'complete', JSON.stringify(sim.snapshot()));
    assert.deepEqual(probe.visited, ['floor', 'e1', 'e2', 'floor']);
  } finally { world.dispose(); }
  for (const height of [.3, 1]) {
    const spawn = { x: 0, y: .06, z: 2 };
    const steps = await createSpatialWorld({ spawn, boxes: [
      { id: 'floor', center: { x: 0, y: -.5, z: 0 }, size: { x: 10, y: 1, z: 10 }, material: 'floor' },
      { id: 'step', center: { x: 0, y: height / 2, z: -1 }, size: { x: 4, y: height, z: 2 }, material: 'stone' },
    ] }, SHALLOW_STEPS);
    try {
      const sim = new Simulation(steps, spawn, COMPACT_JUMP);
      for (let i = 0; i < 30; i++) sim.step({ x: 0, z: -1, sprint: false });
      if (height === .3) assert.equal(sim.snapshot().surface, 'step');
      else assert.ok(sim.snapshot().position.z > .4);
    } finally { steps.dispose(); }
  }
});

test('all difficulties physically reach high supplies and return; resources apply through normal pickups', async () => {
  for (const difficulty of Object.keys(BOT_DIFFICULTIES) as BotDifficulty[]) {
    const fighter = { id: 'ally', team: 'blue' as const, spawn: { x: -14, y: .06, z: 3 }, facing: 0 };
    const bot = await createCombatBot(fighter, [fighter], EXPANDED_ARENA, true);
    try {
      bot.setDifficulty(difficulty); bot.weapons.addAmmo(10, true);
      const match = new ArenaMatch([fighter]); match.start();
      const pickups = new Pickups(EXPANDED_PICKUPS.filter(item => item.surface !== 'floor'), false);
      const visited = new Set<string>(), collected: string[] = [];
      for (let tick = 1; tick < 2000; tick++) {
        bot.stepActors(tick, match.snapshot().actors.ally!, [], pickups.snapshot());
        if (bot.snapshot().surface) visited.add(bot.snapshot().surface!);
        pickups.step(tick, bot.snapshot(), bot.world, (kind, amount) => {
          collected.push(kind);
          return kind === 'ammo' ? bot.weapons.addAmmo(amount) : match.restore('ally', 'armor', amount);
        });
        if (collected.length >= 2 && bot.snapshot().surface === 'floor') break;
      }
      assert.ok(visited.has('e1') && visited.has('e2'), JSON.stringify({ difficulty, visited: [...visited], state: bot.snapshot(), goal: bot.resourceGoal }));
      assert.deepEqual(collected.sort(), ['ammo', 'armor']);
      assert.equal(bot.weapons.snapshot().ammo, 37); assert.equal(match.snapshot().actors.ally!.armor, 100);
      assert.equal(bot.snapshot().surface, 'floor');
    } finally { bot.dispose(); }
  }
});

test('resource choice ignores full inventories and unavailable pickups; difficulty gates reaction without stat buffs', () => {
  const match = new ArenaMatch([{ id: 'player', team: 'blue' }]); match.start();
  const combat = new Combat('player', true); combat.addAmmo(54, true); combat.addRailAmmo(6);
  const items = new Pickups(EXPANDED_PICKUPS).snapshot();
  const full = { ...match.snapshot().actors.player!, hp: 100, armor: 100 };
  assert.equal(chooseBotResource(items, full, combat.snapshot(), EXPANDED_ARENA.spawn), null);
  assert.equal(chooseBotResource(items, { ...full, hp: 20 }, combat.snapshot(), EXPANDED_ARENA.spawn)?.kind, 'health');
  assert.equal(chooseBotResource(items.map(item => ({ ...item, remaining: 0 })), { ...full, hp: 20 }, combat.snapshot(), EXPANDED_ARENA.spawn), null);
  const own = { tick: 0, position: { x: 0, y: .03, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, grounded: true, surface: 'floor', ceiling: false, facing: Math.PI };
  const enemy = { id: 'rival', center: { x: 0, y: 1.13, z: -4 }, radius: .6 };
  for (const difficulty of Object.keys(BOT_DIFFICULTIES) as BotDifficulty[]) {
    const brain = new BotBrain(); brain.setDifficulty(difficulty);
    const reaction = BOT_DIFFICULTIES[difficulty].reactionTicks;
    for (let tick = 1; tick <= reaction; tick++) assert.equal(brain.step(tick, own, enemy, combat.snapshot()).firing, false);
    assert.equal(brain.step(reaction + 1, own, enemy, combat.snapshot()).firing, true);
  }
});
