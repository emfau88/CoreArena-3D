import test from 'node:test';
import assert from 'node:assert/strict';
import { Combat, WEAPONS, arcHit, directionTo } from '../src/core/combat';
import { solveAim } from '../src/core/aim';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Pickups, PICKUP_RESPAWN_TICKS } from '../src/core/pickups';
import { ArenaMatch } from '../src/core/match';
import type { ArenaDefinition } from '../src/arena/arena';
import type { Snapshot } from '../src/core/types';

const target = { id: 'dummy-test', center: { x: 4, y: 1.15, z: 0 }, radius: 0.6, level: 'E0' };
const arena: ArenaDefinition = { spawn: { x: 0, y: 0.03, z: 0 }, boxes: [], targets: [target] };
const camera = { origin: { x: 4, y: 12, z: 6 }, direction: directionTo({ x: 4, y: 12, z: 6 }, target.center).direction };

test('Arc is immediate, bounded by distance/cone and blocked by actual 3D cover', async () => {
  const world = await createSpatialWorld(arena);
  try {
    const aim = solveAim(world, camera, arena.spawn)!;
    assert.equal(arcHit(world, aim, camera, [target])?.id, target.id);
    const outside = { ...aim, target: { ...aim.target, point: { x: 4, y: 1.15, z: 2 } } };
    assert.equal(arcHit(world, outside, camera, [target]), null);
    const nearMiss = { ...aim, target: { ...aim.target, point: { x: 4, y: 1.15, z: 0.3 } } };
    assert.equal(arcHit(world, nearMiss, camera, [target])?.id, target.id);
    const far = solveAim(world, camera, { x: -5, y: 0, z: 0 })!;
    assert.equal(arcHit(world, far, camera, [target]), null);
    const combat = new Combat();
    assert.equal(combat.step(1, true, aim, camera, world, [target]).damage[0]?.amount, 35);
    combat.addAmmo(54, true); combat.select('pulse'); combat.select('arc');
    assert.equal(combat.step(2, true, aim, camera, world, [target]).attacked, false);
    assert.equal(combat.step(49, true, aim, camera, world, [target]).attacked, true);
  } finally { world.dispose(); }
  const blocked = await createSpatialWorld({ ...arena, boxes: [{ id: 'cover', center: { x: 2, y: 1, z: 0 }, size: { x: 0.05, y: 2, z: 2 }, material: 'stone' }] });
  try { assert.equal(arcHit(blocked, solveAim(blocked, camera, arena.spawn)!, camera, [target]), null); }
  finally { blocked.dispose(); }
});

test('Pulse travels before damage; its swept radius catches thin cover and each hit consumes the projectile', async () => {
  for (const withWall of [false, true]) {
    const world = await createSpatialWorld({ ...arena, boxes: withWall ? [{ id: 'thin-wall', center: { x: 2, y: 1, z: 0 }, size: { x: 0.02, y: 2, z: 2 }, material: 'stone' }] : [] });
    try {
      const combat = new Combat(); combat.addAmmo(54, true); combat.select('pulse');
      const aim = solveAim(world, camera, arena.spawn)!;
      const first = combat.step(1, true, aim, camera, world, [target]);
      assert.equal(first.damage.length, 0); assert.equal(combat.snapshot().projectiles.length, 1);
      assert.equal(combat.snapshot().ammo, 53);
      const hits = [];
      for (let tick = 2; tick < 20; tick++) hits.push(...combat.step(tick, false, aim, camera, world, [target]).damage);
      assert.equal(hits.length, 1); assert.equal(hits[0]!.target, withWall ? 'thin-wall' : target.id);
      assert.equal(hits[0]!.amount, 10); assert.equal(combat.snapshot().projectiles.length, 0);
    } finally { world.dispose(); }
  }
});

test('inventory locks Pulse until pickup; caps ammo, preserves selection, falls back and clears on reset', async () => {
  const world = await createSpatialWorld(arena);
  try {
    const combat = new Combat(); combat.select('pulse'); assert.equal(combat.snapshot().selected, 'arc');
    assert.equal(combat.addAmmo(27), 0); assert.equal(combat.addAmmo(54, true), 54);
    assert.equal(combat.snapshot().selected, 'arc'); assert.equal(combat.addAmmo(27), 0);
    combat.cycle(); assert.equal(combat.snapshot().selected, 'pulse');
    const aim = solveAim(world, camera, arena.spawn)!;
    for (let i = 0; i < 54; i++) combat.step(1 + i * WEAPONS.pulse.cooldown, true, aim, camera, world, [target]);
    assert.equal(combat.snapshot().ammo, 0); assert.equal(combat.snapshot().selected, 'arc');
    combat.select('pulse'); assert.equal(combat.snapshot().selected, 'arc');
    assert.equal(combat.addAmmo(27), 27); assert.equal(combat.snapshot().selected, 'arc');
    combat.reset(); assert.equal(combat.snapshot().ownsPulse, false); assert.equal(combat.snapshot().ammo, 0);
    assert.equal(combat.snapshot().projectiles.length, 0); assert.equal(combat.snapshot().lastArc, null);
  } finally { world.dispose(); }
});

test('pickups require correct support/height and line of sight, retain partial resources, respawn only when depleted', async () => {
  const world = await createSpatialWorld(arena);
  const pickups = new Pickups([{ id: 'ammo', kind: 'ammo', position: { x: 0, y: 2.05, z: 0 }, surface: 'e1', amount: 27 }]);
  const player: Snapshot = { tick: 0, position: { x: 0, y: 0.03, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, grounded: true, surface: 'floor', ceiling: false, facing: 0 };
  let collected = 0;
  try {
    pickups.step(1, player, world, (kind, amount) => { assert.equal(kind, 'ammo'); collected += amount; return amount; });
    assert.equal(collected, 0);
    const upstairs = { ...player, surface: 'e1', position: { x: 0, y: 2.08, z: 0 } };
    pickups.step(2, upstairs, world, () => 7); assert.equal(pickups.snapshot()[0]!.remaining, 20);
    pickups.step(3, upstairs, world, () => 0); assert.equal(pickups.snapshot()[0]!.remaining, 20);
    pickups.step(4, upstairs, world, (kind, amount) => { assert.equal(kind, 'ammo'); return amount; });
    assert.equal(pickups.snapshot()[0]!.remaining, 0);
    pickups.step(4 + PICKUP_RESPAWN_TICKS - 1, null, world, () => 0); assert.equal(pickups.snapshot()[0]!.remaining, 0);
    pickups.step(4 + PICKUP_RESPAWN_TICKS, null, world, () => 0); assert.equal(pickups.snapshot()[0]!.remaining, 27);
    pickups.reset(); assert.equal(pickups.snapshot()[0]!.respawnAt, 0);
  } finally { world.dispose(); }
  const wall = await createSpatialWorld({ ...arena, boxes: [{ id: 'wall', center: { x: 0.3, y: 1, z: 0 }, size: { x: 0.05, y: 2, z: 2 }, material: 'stone' }] });
  try {
    const behind = new Pickups([{ id: 'behind', kind: 'health', position: { x: 0.6, y: 0, z: 0 }, surface: 'floor', amount: 25 }]);
    behind.step(1, player, wall, () => { assert.fail('pickup through wall'); });
  } finally { wall.dispose(); }
});

test('health and armor pickups cap at 100 and cannot restore dead actors', () => {
  const match = new ArenaMatch([{ id: 'player', team: 'blue' }]); match.start();
  assert.equal(match.restore('player', 'hp', 25), 0); assert.equal(match.restore('player', 'armor', 70), 50);
  match.step([{ target: 'player', amount: 130 }], ['player']);
  assert.equal(match.restore('player', 'hp', 25), 25); assert.equal(match.snapshot().actors.player!.hp, 95);
  match.step([{ target: 'player', amount: 1000 }]); assert.equal(match.restore('player', 'hp', 25), 0);
});
