import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN } from '../src/arena/campaign';
import { PveEncounter } from '../src/core/pve';
import { createSpatialWorld } from '../src/physics/rapierWorld';

test('each boss winds up, hits once, respects dodges/height and resets its basic attack', async () => {
  for (const level of CAMPAIGN) for (const defense of ['stay', 'distance', 'behind', 'height']) {
    const world = await createSpatialWorld(level.arena);
    const rules = { ...level.rules, chaseTicks: 600 };
    const boss = new PveEncounter(rules, level.monster, level.kind);
    const player = { x: 0, y: 0.03, z: 2 };
    try {
      for (let i = 0; i < 180 && boss.snapshot().phase !== 'melee'; i++) boss.step(player, world);
      assert.equal(boss.snapshot().phase, 'melee');
      const facing = boss.snapshot().facing;
      const target = defense === 'distance' ? { ...player, x: 7 } : defense === 'behind' ? { ...player, z: -4 }
        : defense === 'height' ? { ...player, y: 2 } : player;
      for (let i = 1; i < rules.meleeWarning; i++) boss.step(target, world);
      assert.equal(boss.snapshot().hitsTaken, 0); assert.equal(boss.snapshot().facing, facing);
      boss.step(target, world);
      assert.equal(boss.snapshot().hitsTaken, defense === 'stay' ? 1 : 0);
      assert.equal(boss.snapshot().armor, defense === 'stay' ? 50 - rules.meleeDamage : 50);
      for (let i = 0; i < rules.meleeRecovery + rules.meleeCooldown - 1; i++) boss.step(target, world);
      assert.equal(boss.snapshot().hitsTaken, defense === 'stay' ? 1 : 0);
      if (defense === 'stay') {
        for (let i = 0; i < rules.meleeWarning + 2; i++) boss.step(target, world);
        assert.equal(boss.snapshot().hitsTaken, 2, 'basic attacks repeat after their cooldown');
      }
      boss.reset(); assert.equal(boss.snapshot().hitsTaken, 0); assert.equal(boss.snapshot().phase, 'emerging');
      assert.equal(boss.restoreArmor(80), 50); assert.equal(boss.snapshot().armor, 100);
    } finally { world.dispose(); }
  }
});

test('actual solid cover blocks basic attacks and all campaign pickups rest on their named surface', async () => {
  for (const level of CAMPAIGN) {
    const world = await createSpatialWorld(level.arena);
    const cover = await createSpatialWorld({ ...level.arena, boxes: [...level.arena.boxes,
      { id: 'melee-wall', center: { x: 0, y: 1.5, z: 0.5 }, size: { x: 12, y: 3, z: 0.4 }, material: 'stone' }] });
    try {
      const boss = new PveEncounter({ ...level.rules, chaseTicks: 600 }, level.monster, level.kind);
      for (let i = 0; i < 300; i++) boss.step({ x: 0, y: 0.03, z: 2 }, cover);
      assert.equal(boss.snapshot().hitsTaken, 0);
      for (const item of level.pickups) {
        const hit = world.raycast({ origin: { ...item.position, y: item.position.y + 0.1 }, direction: { x: 0, y: -1, z: 0 } }, 0.2, true);
        assert.equal(hit?.id, item.surface, `${level.id}/${item.id}`);
      }
    } finally { world.dispose(); cover.dispose(); }
  }
  assert.equal(new Set(CAMPAIGN.map(l => JSON.stringify(l.pickups.map(p => p.position)))).size, 3);
});
