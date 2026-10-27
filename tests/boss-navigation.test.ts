import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignLevel } from '../src/arena/campaign';
import { BossNavigation } from '../src/core/bossNavigation';
import { PveEncounter } from '../src/core/pve';
import { createSpatialWorld } from '../src/physics/rapierWorld';

test('courtyard routing walks the real boss around a pillar without clipping through it', async () => {
  const level = campaignLevel('stone'), world = await createSpatialWorld(level.arena);
  const monster = { ...level.monster, center: { x: -7, y: 1.85, z: -4 } };
  const nav = new BossNavigation(level.arena, level.rules.movementRadius);
  const boss = new PveEncounter({ ...level.rules, emergeTicks: 1, chaseTicks: 1200, meleeRange: 0 }, monster, 'stone', (from, player) => nav.steer(from, player));
  const target = { x: -7, y: 0.03, z: 6 };
  let detoured = false;
  try {
    for (let i = 0; i < 900; i++) {
      boss.step(target, world); const p = boss.snapshot().center;
      if (Math.abs(p.x + 7) > 2.7) detoured = true;
      assert.ok(!(Math.abs(p.x + 7) < 2.65 && Math.abs(p.z - 1) < 2.65), 'boss never enters expanded pillar');
    }
    assert.ok(detoured); assert.ok(Math.hypot(boss.snapshot().center.x + 7, boss.snapshot().center.z - 6) < 2.7, JSON.stringify(boss.snapshot()));
    nav.reset(); assert.ok(Number.isFinite(nav.steer(monster.center, target).x));
  } finally { world.dispose(); }
});

test('a player on the healing platform produces a reachable ground approach, not a path through the platform', () => {
  const level = campaignLevel('stone'), nav = new BossNavigation(level.arena, level.rules.movementRadius);
  let from = { x: -8, y: 1.85, z: 9 };
  for (let i = 0; i < 500; i++) {
    const next = nav.steer(from, { x: -15, y: 1.1, z: 5 });
    const d = Math.hypot(next.x - from.x, next.z - from.z);
    if (d < 0.01) break;
    from = { x: from.x + (next.x - from.x) / d * Math.min(d, 0.05), y: 1.85, z: from.z + (next.z - from.z) / d * Math.min(d, 0.05) };
  }
  assert.ok(Math.hypot(from.x + 15, from.z - 5) < 6);
  assert.ok(Math.abs(from.x + 15) > 3.7 || Math.abs(from.z - 5) > 2.7);
});
