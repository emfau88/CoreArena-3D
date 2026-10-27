import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN, campaignLevel, nextCampaignLevel } from '../src/arena/campaign';
import { PveEncounter } from '../src/core/pve';
import { createSpatialWorld } from '../src/physics/rapierWorld';

test('three distinct encounters form a finite campaign with a safe default', () => {
  assert.equal(CAMPAIGN.length, 3); assert.equal(campaignLevel('unknown').id, 'stone');
  assert.equal(nextCampaignLevel('stone')?.id, 'frost'); assert.equal(nextCampaignLevel('frost')?.id, 'ember');
  assert.equal(nextCampaignLevel('ember'), null); assert.equal(nextCampaignLevel('unknown'), null);
  assert.equal(new Set(CAMPAIGN.map(l => JSON.stringify(l.arena.boxes))).size, 3);
  assert.equal(new Set(CAMPAIGN.map(l => l.monster.id)).size, 3);
});

test('frost shards can be sidestepped or jumped; ember breath requires leaving its cone', async () => {
  for (const id of ['frost', 'ember']) for (const defense of ['none', 'jump', 'side']) {
    const level = campaignLevel(id); const world = await createSpatialWorld(level.arena);
    const boss = new PveEncounter(level.rules, level.monster, level.kind);
    try {
      while (boss.snapshot().phase !== 'warning') boss.step(level.arena.spawn, world);
      const center = boss.snapshot().center;
      const player = { x: center.x + (defense === 'side' ? 7 : 0), y: defense === 'jump' ? 1.5 : 0.03, z: center.z + 7 };
      for (let i = 0; i < level.rules.waveWarning + level.rules.waveTicks; i++) boss.step(player, world);
      assert.equal(boss.snapshot().hitsTaken, defense === 'side' || defense === 'jump' && id === 'frost' ? 0 : 1, `${id}/${defense}`);
      boss.reset(); assert.equal(boss.snapshot().bossHp, level.rules.bossHp);
    } finally { world.dispose(); }
  }
});

test('real cover blocks elemental attacks; only the current monster accepts combat damage', async () => {
  for (const id of ['frost', 'ember']) {
    const level = campaignLevel(id);
    const world = await createSpatialWorld({ ...level.arena, boxes: [...level.arena.boxes,
      { id: 'cover-test', center: { x: 0, y: 2, z: 6 }, size: { x: 10, y: 4, z: 1 }, material: 'stone' }] });
    const boss = new PveEncounter(level.rules, level.monster, level.kind);
    try {
      for (let i = 0; i < level.rules.emergeTicks + level.rules.chaseTicks + level.rules.waveWarning + level.rules.waveTicks; i++) boss.step(level.arena.spawn, world);
      assert.equal(boss.snapshot().hitsTaken, 0);
      boss.step(level.arena.spawn, world, [{ source: 'player', target: 'stone-warden', amount: 1000 }]);
      assert.equal(boss.snapshot().bossHp, level.rules.bossHp);
      boss.step(level.arena.spawn, world, [{ source: 'player', target: level.monster.id, amount: level.rules.bossHp }]);
      assert.equal(boss.snapshot().outcome, 'victory');
    } finally { world.dispose(); }
  }
});
