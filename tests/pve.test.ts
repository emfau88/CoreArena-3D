import test from 'node:test';
import assert from 'node:assert/strict';
import { PveEncounter, PVE_RULES, MONSTER } from '../src/core/pve';
import { PVE_ARENA } from '../src/arena/pve';
import { createSpatialWorld } from '../src/physics/rapierWorld';

test('monster emergence/warning cannot deal damage; expanding wave hits once per attack', async () => {
  const world = await createSpatialWorld(PVE_ARENA); const boss = new PveEncounter();
  try {
    for (let i = 0; i < PVE_RULES.emergeTicks + PVE_RULES.waveWarning; i++) boss.step(PVE_ARENA.spawn, world);
    assert.equal(boss.snapshot().phase, 'attack'); assert.equal(boss.snapshot().hitsTaken, 0);
    for (let i = 0; i < PVE_RULES.waveTicks; i++) boss.step(PVE_ARENA.spawn, world);
    assert.equal(boss.snapshot().phase, 'recovery'); assert.equal(boss.snapshot().hitsTaken, 1);
    assert.equal(boss.snapshot().armor, 0); assert.equal(boss.snapshot().hp, 90);
  } finally { world.dispose(); }
});

test('real cover and sufficient jump height protect against the shockwave', async () => {
  const world = await createSpatialWorld(PVE_ARENA);
  try {
    for (const player of [{ x: 0, y: 1.3, z: 8 }, { x: 14, y: 0.03, z: 3 }]) {
      const boss = new PveEncounter();
      for (let i = 0; i < PVE_RULES.emergeTicks + PVE_RULES.waveWarning + PVE_RULES.waveTicks; i++) boss.step(player, world);
      assert.equal(boss.snapshot().hitsTaken, 0, JSON.stringify(player));
    }
  } finally { world.dispose(); }
});

test('eruption locks its ground warning; walking away avoids it, staying or jumping inside takes one hit', async () => {
  const world = await createSpatialWorld(PVE_ARENA);
  try {
    for (const dodge of [false, true]) {
      const boss = new PveEncounter(); const start = { x: 0, y: 1.3, z: 8 };
      while (!(boss.snapshot().kind === 'eruption' && boss.snapshot().phase === 'warning')) boss.step(start, world);
      const target = { ...boss.snapshot().target };
      assert.ok(Math.abs(target.y) < 0.001);
      for (let i = 0; i < PVE_RULES.eruptionWarning + PVE_RULES.eruptionTicks; i++) boss.step({ ...start, x: dodge ? 5 : 0 }, world);
      assert.deepEqual(boss.snapshot().target, target);
      assert.equal(boss.snapshot().hitsTaken, dodge ? 0 : 1);
      assert.equal(boss.snapshot().hp, dodge ? 100 : 85);
    }
  } finally { world.dispose(); }
});

test('boss kill/player death end the encounter without respawn; reset restores all encounter state', async () => {
  const world = await createSpatialWorld(PVE_ARENA);
  try {
    const boss = new PveEncounter(); const damage = [{ source: 'player', target: MONSTER.id, amount: PVE_RULES.bossHp }];
    boss.step(PVE_ARENA.spawn, world, damage); assert.equal(boss.snapshot().bossHp, PVE_RULES.bossHp);
    for (let i = 1; i < PVE_RULES.emergeTicks; i++) boss.step(PVE_ARENA.spawn, world);
    boss.step(PVE_ARENA.spawn, world, damage); assert.equal(boss.snapshot().outcome, 'victory');
    const won = boss.snapshot(); for (let i = 0; i < 400; i++) boss.step(PVE_ARENA.spawn, world);
    assert.deepEqual(boss.snapshot(), won);
    boss.reset(); assert.equal(boss.snapshot().tick, 0); assert.equal(boss.snapshot().bossHp, PVE_RULES.bossHp);
    for (let i = 0; i < 1800 && boss.snapshot().outcome === 'running'; i++) boss.step(PVE_ARENA.spawn, world);
    assert.equal(boss.snapshot().outcome, 'defeat'); assert.equal(boss.snapshot().hp, 0);
    const dead = boss.snapshot(); boss.step(PVE_ARENA.spawn, world); assert.deepEqual(boss.snapshot(), dead);
  } finally { world.dispose(); }
});
