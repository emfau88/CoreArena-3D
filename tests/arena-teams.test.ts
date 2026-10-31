import test from 'node:test';
import assert from 'node:assert/strict';
import { ARENA_FIGHTERS, arenaRoster } from '../src/arena/teams';
import { createCombatBot } from '../src/app/combatBot';
import { ArenaMatch, MATCH_RULES } from '../src/core/match';
import { BotBrain, BOT_RULES } from '../src/core/bot';
import { Combat } from '../src/core/combat';
import type { Snapshot } from '../src/core/types';

test('team bots choose only visible opponents; changing target restarts reaction and aim', async () => {
  const ally = await createCombatBot(ARENA_FIGHTERS[2]!, ARENA_FIGHTERS);
  const match = new ArenaMatch(arenaRoster('teams')); match.start();
  try {
    const state = match.snapshot();
    const actors = [
      { life: state.actors.player!, position: { x: -9, y: 0.06, z: 3 } },
      { life: state.actors.rival!, position: { x: -10, y: 0.06, z: 5 } },
      { life: { ...state.actors['rival-2']!, alive: false }, position: { x: -10, y: 0.06, z: 4 } },
    ];
    for (let tick = 1; tick <= 80; tick++) {
      const attack = ally.stepActors(tick, state.actors.ally!, actors);
      assert.equal(ally.decision!.targetId, 'rival');
      assert.ok(attack.damage.every(hit => hit.target !== 'player' && hit.source === 'ally'));
      if (tick <= BOT_RULES.reactionTicks) assert.equal(attack.attacked, false);
    }
    actors[1]!.life = { ...state.actors.rival!, alive: false };
    const lost = ally.stepActors(81, state.actors.ally!, actors);
    assert.equal(ally.decision!.targetId, null); assert.equal(lost.attacked, false);
  } finally { ally.dispose(); }
  const brain = new BotBrain(); const weapons = new Combat().snapshot();
  const own: Snapshot = { tick: 0, position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 },
    facing: Math.PI, grounded: true, surface: 'floor', ceiling: false };
  const a = { id: 'a', center: { x: 0, y: 1.1, z: -4 }, radius: 0.6 };
  for (let tick = 1; tick <= 30; tick++) brain.step(tick, own, a, weapons);
  const b = { ...a, id: 'b', center: { x: 2, y: 1.1, z: -4 } };
  const switched = brain.step(31, own, b, weapons);
  assert.equal(switched.targetId, 'b'); assert.equal(switched.readyAt, 31 + BOT_RULES.reactionTicks);
  assert.equal(switched.firing, false);
});

test('four actors finish a real bot-driven team match; deaths, respawns, scoring and restart stay independent', async () => {
  const bots = await Promise.all(ARENA_FIGHTERS.slice(1).map(fighter => createCombatBot(fighter, ARENA_FIGHTERS)));
  const match = new ArenaMatch(arenaRoster('teams')); match.start();
  const sources = new Set<string>(); const respawned = new Set<string>();
  try {
    for (let tick = 1; tick <= MATCH_RULES.durationTicks && match.snapshot().phase === 'running'; tick++) {
      const before = match.snapshot();
      const actors = [{ life: before.actors.player!, position: ARENA_FIGHTERS[0]!.spawn },
        ...bots.map(bot => ({ life: before.actors[bot.fighter.id]!, position: bot.snapshot().position }))];
      const attacks = bots.map(bot => ({ id: bot.fighter.id,
        ...bot.stepActors(tick, before.actors[bot.fighter.id]!, actors.filter(actor => actor.life.id !== bot.fighter.id)) }));
      for (const attack of attacks) for (const hit of attack.damage) {
        if (hit.source && before.actors[hit.target]?.team !== before.actors[hit.source]?.team) sources.add(hit.source);
      }
      match.step(attacks.flatMap(attack => attack.damage), attacks.filter(attack => attack.attacked).map(attack => attack.id));
      const after = match.snapshot();
      for (const bot of bots) {
        const id = bot.fighter.id;
        if (before.actors[id]!.alive !== after.actors[id]!.alive) {
          bot.clear();
          if (after.actors[id]!.alive) {
            respawned.add(id); bot.reset();
            assert.deepEqual(bot.snapshot().position, bot.fighter.spawn);
            assert.equal(bot.weapons.snapshot().ownsPulse, false);
          }
        }
        if (bot.decision?.targetId) assert.notEqual(before.actors[bot.decision.targetId]!.team, bot.fighter.team);
      }
    }
    const result = match.snapshot();
    assert.equal(result.phase, 'ended');
    assert.ok(result.scores.blue > 0 && result.scores.red > 0, JSON.stringify(result.scores));
    assert.ok(sources.has('ally')); assert.ok(sources.has('rival')); assert.ok(sources.has('rival-2'));
    assert.ok(respawned.size >= 2);
    match.start(); bots.forEach(bot => bot.reset());
    assert.deepEqual(match.snapshot().scores, { blue: 0, red: 0 });
    assert.equal(Object.values(match.snapshot().actors).filter(actor => actor.life === 1).length, 4);
    for (const bot of bots) assert.equal(bot.decision, null);
  } finally { bots.forEach(bot => bot.dispose()); }
});
