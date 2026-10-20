import test from 'node:test';
import assert from 'node:assert/strict';
import { ArenaMatch, MATCH_RULES } from '../src/core/match';
import { inTrainingField } from '../src/arena/training';

function setup() {
  const match = new ArenaMatch([{ id: 'player', team: 'blue' }, { id: 'ally', team: 'blue' }, { id: 'enemy', team: 'red' }]);
  match.start(); return match;
}
function ticks(match: ArenaMatch, count: number) { for (let i = 0; i < count; i++) match.step(); }
const kill = { target: 'enemy', source: 'player', amount: 1000 };

test('protection blocks damage; attacking removes it; armor absorbs before HP', () => {
  const match = setup();
  match.step([{ target: 'player', amount: 35 }]);
  assert.equal(match.snapshot().actors.player!.armor, 50);
  match.step([{ target: 'player', amount: 35 }], ['player']);
  assert.equal(match.snapshot().actors.player!.armor, 15);
  assert.equal(match.snapshot().actors.player!.hp, 100);
  match.step([{ target: 'player', amount: 35 }]);
  assert.equal(match.snapshot().actors.player!.armor, 0);
  assert.equal(match.snapshot().actors.player!.hp, 80);
});

test('death scores once, dead targets ignore damage, respawn restores life after four seconds', () => {
  const match = setup(); ticks(match, MATCH_RULES.protectionTicks);
  match.step([kill, kill]);
  assert.equal(match.snapshot().scores.blue, 1);
  assert.equal(match.snapshot().actors.enemy!.hp, 0);
  ticks(match, MATCH_RULES.respawnTicks - 1);
  assert.equal(match.snapshot().actors.enemy!.alive, false);
  match.step([kill]);
  const enemy = match.snapshot().actors.enemy!;
  assert.equal(enemy.alive, true); assert.equal(enemy.life, 2);
  assert.equal(enemy.hp, 100); assert.equal(enemy.armor, 0); assert.equal(enemy.protectionTicks, 120);
  assert.equal(match.snapshot().scores.blue, 1);
});

test('friendly fire is off and environmental death awards no team point; hazard respects height', () => {
  const match = setup(); ticks(match, MATCH_RULES.protectionTicks);
  match.step([{ target: 'ally', source: 'player', amount: 1000 }]);
  assert.equal(match.snapshot().actors.ally!.hp, 100);
  match.step([{ target: 'player', amount: 1000 }]);
  assert.equal(match.snapshot().actors.player!.alive, false);
  assert.deepEqual(match.snapshot().scores, { blue: 0, red: 0 });
  assert.equal(inTrainingField({ x: -11, y: 0.02, z: 2 }), true);
  assert.equal(inTrainingField({ x: -11, y: 2.05, z: 2 }), false);
});

test('simultaneous score-limit kills resolve the whole tick, freeze result and restart cleanly', () => {
  const match = setup(); ticks(match, MATCH_RULES.protectionTicks);
  const exchange = [kill, { target: 'player', source: 'enemy', amount: 1000 }];
  for (let i = 0; i < 10; i++) {
    match.step(exchange);
    if (i < 9) ticks(match, MATCH_RULES.respawnTicks + MATCH_RULES.protectionTicks);
  }
  assert.equal(match.snapshot().phase, 'ended'); assert.equal(match.snapshot().reason, 'score');
  assert.equal(match.snapshot().winner, 'draw');
  assert.deepEqual(match.snapshot().scores, { blue: 10, red: 10 });
  const result = match.snapshot(); ticks(match, 10); assert.equal(match.snapshot(), result);
  match.start(); assert.equal(match.snapshot().phase, 'running');
  assert.equal(match.snapshot().tick, 0); assert.equal(match.snapshot().actors.player!.life, 1);
  assert.equal(match.snapshot().actors.player!.armor, 50); assert.equal(match.snapshot().actors.player!.hp, 100);
  assert.deepEqual(match.snapshot().scores, { blue: 0, red: 0 });
});

test('last-tick kill counts before timeout; an empty match ends in a draw', () => {
  const match = setup(); ticks(match, MATCH_RULES.durationTicks - 1); match.step([kill]);
  assert.equal(match.snapshot().winner, 'blue'); assert.equal(match.snapshot().reason, 'time');
  assert.equal(match.snapshot().remainingTicks, 0); assert.equal(match.snapshot().scores.blue, 1);
  match.start(); ticks(match, MATCH_RULES.durationTicks);
  assert.equal(match.snapshot().winner, 'draw');
});
