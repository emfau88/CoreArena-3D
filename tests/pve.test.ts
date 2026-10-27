import test from 'node:test';
import assert from 'node:assert/strict';
import { PveEncounter, PVE_RULES, MONSTER } from '../src/core/pve';
import { PVE_ARENA } from '../src/arena/pve';
import { createSpatialWorld } from '../src/physics/rapierWorld';

test('warden pursues, changes direction, stops for attacks and resets its real hit position', async () => {
  const world = await createSpatialWorld({ ...PVE_ARENA, targets: [MONSTER] }); const boss = new PveEncounter();
  try {
    for (let i = 0; i < PVE_RULES.emergeTicks; i++) boss.step(PVE_ARENA.spawn, world);
    assert.deepEqual(boss.snapshot().center, MONSTER.center);
    for (let i = 0; i < 60; i++) boss.step(PVE_ARENA.spawn, world);
    const forward = boss.snapshot().center;
    assert.ok(forward.z > MONSTER.center.z + 2.5);
    for (let i = 0; i < 60; i++) boss.step({ x: 10, y: 0.03, z: 8 }, world);
    const stopped = boss.snapshot().center;
    assert.ok(stopped.x > forward.x + 1.5); assert.equal(boss.snapshot().phase, 'warning');
    for (let i = 0; i < PVE_RULES.waveWarning + PVE_RULES.waveTicks + 10; i++) boss.step({ x: 10, y: 1.3, z: 8 }, world);
    assert.deepEqual(boss.snapshot().center, stopped);
    world.setTargetPosition(MONSTER.id, stopped);
    const ray = { origin: { x: stopped.x, y: stopped.y, z: stopped.z + 5 }, direction: { x: 0, y: 0, z: -1 } };
    assert.equal(world.sweepBall(ray, 5, 0.08)?.id, MONSTER.id);
    boss.reset(); world.setTargetPosition(MONSTER.id, boss.snapshot().center);
    assert.deepEqual(boss.snapshot().center, MONSTER.center); assert.equal(boss.snapshot().moving, false);
  } finally { world.dispose(); }
});

test('warden body cannot pass through a real wall or walk off unsupported ground', async () => {
  for (const wall of [false, true]) {
    const arena = { ...PVE_ARENA, boxes: wall ? [...PVE_ARENA.boxes,
      { id: 'pursuit-wall', center: { x: 0, y: 2, z: 3 }, size: { x: 40, y: 4, z: 1 }, material: 'stone' as const }] : PVE_ARENA.boxes };
    const world = await createSpatialWorld(arena); const boss = new PveEncounter();
    try {
      const player = { x: 0, y: 1.3, z: 40 };
      for (let i = 0; i < 4000; i++) {
        boss.step(player, world);
        assert.ok(boss.snapshot().center.z <= (wall ? 0.81 : 12.3));
      }
      assert.ok(boss.snapshot().center.z > (wall ? 0.5 : 10));
    } finally { world.dispose(); }
  }
});

test('monster emergence/warning cannot deal damage; expanding wave hits once per attack', async () => {
  const world = await createSpatialWorld(PVE_ARENA); const boss = new PveEncounter();
  try {
    for (let i = 0; i < PVE_RULES.emergeTicks + PVE_RULES.chaseTicks + PVE_RULES.waveWarning; i++) boss.step(PVE_ARENA.spawn, world);
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
      for (let i = 0; i < PVE_RULES.emergeTicks + PVE_RULES.chaseTicks + PVE_RULES.waveWarning + PVE_RULES.waveTicks; i++) boss.step(player, world);
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
