import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M1_ARENA } from '../src/arena/arena';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Simulation } from '../src/core/simulation';
import { TraversalProbe } from '../src/core/traversal';
import { DiagnosticWeapon, solveAim } from '../src/core/aim';
import type { Vec3 } from '../src/core/types';

const idle = { x: 0, z: 0, sprint: false };
// Headroom/stacked-surface coverage stays in a fixture, not a floating gameplay plateau.
const overhang = { ...M1_ARENA, boxes: M1_ARENA.boxes.map((box) => box.id === 'e2'
  ? { ...box, center: { x: -6, y: 3.875, z: -9.5 }, size: { x: 8, y: 0.45, z: 5 } } : box) };
const rayTo = (origin: Vec3, point: Vec3) => {
  const d = Math.hypot(point.x - origin.x, point.y - origin.y, point.z - origin.z);
  return { origin, direction: { x: (point.x - origin.x) / d, y: (point.y - origin.y) / d, z: (point.z - origin.z) / d } };
};

test('shared player motor traverses E0→E1→E2→E0 using directed jump/drop links', async () => {
  const world = await createSpatialWorld(M1_ARENA);
  try {
    const sim = new Simulation(world, M1_ARENA.spawn);
    const route = new TraversalProbe(M1_ARENA.links!);
    route.start();
    for (let tick = 0; tick < 1801 && route.status === 'running'; tick++) sim.step(route.command(sim.snapshot()));
    assert.equal(route.status, 'complete', JSON.stringify({ state: sim.snapshot(), visited: route.visited }));
    assert.deepEqual(route.visited, ['floor', 'e1', 'e2', 'floor']);
    assert.ok(sim.snapshot().position.y < 0.05);
    const tick = sim.snapshot().tick;
    sim.reset();
    assert.deepEqual(sim.snapshot().position, M1_ARENA.spawn);
    assert.equal(sim.snapshot().tick, tick, 'return to spawn preserves simulation time');
    for (let i = 0; i < 15; i++) sim.step(idle);
    assert.equal(sim.snapshot().surface, 'floor');
  } finally { world.dispose(); }
});

test('a test-only overhang blocks a head from below, then gravity returns the player to E0', async () => {
  const spawn = { x: -7, y: 0.06, z: -9 };
  const world = await createSpatialWorld({ ...overhang, spawn });
  try {
    const sim = new Simulation(world, spawn);
    for (let i = 0; i < 15; i++) sim.step(idle);
    sim.step({ ...idle, jump: true });
    let ceiling = false, maximum = 0;
    for (let i = 0; i < 100; i++) {
      const state = sim.step(idle);
      ceiling ||= state.ceiling; maximum = Math.max(maximum, state.position.y);
      assert.notEqual(state.surface, 'e2', 'never lands through the underside');
    }
    assert.ok(ceiling); assert.ok(maximum < 1.87);
    assert.equal(sim.snapshot().surface, 'floor', JSON.stringify(sim.snapshot()));
    assert.equal(world.raycast({ origin: { x: -7, y: 15, z: -9 }, direction: { x: 0, y: -1, z: 0 } }, 30)?.id, 'e2');
    assert.equal(world.raycast({ origin: { x: -7, y: 1, z: -9 }, direction: { x: 0, y: -1, z: 0 } }, 30)?.id, 'floor');
  } finally { world.dispose(); }
});

test('a direct standard jump from E0 cannot climb the full-height E2 wall', async () => {
  const world = await createSpatialWorld({ ...M1_ARENA, spawn: { x: -11.5, y: 0.06, z: -9 } });
  try {
    const sim = new Simulation(world, { x: -11.5, y: 0.06, z: -9 });
    for (let i = 0; i < 15; i++) sim.step(idle);
    let maximum = 0;
    for (let i = 0; i < 110; i++) {
      const state = sim.step({ x: 1, z: 0, sprint: false, jump: i === 0 });
      maximum = Math.max(maximum, state.position.y);
      assert.notEqual(state.surface, 'e2');
    }
    assert.ok(maximum > 2.4 && maximum < 2.8, JSON.stringify({ maximum, state: sim.snapshot() }));
  } finally { world.dispose(); }
});

test('3D target selection and muzzle obstruction use the actual first Rapier collision', async () => {
  const world = await createSpatialWorld(M1_ARENA);
  try {
    const weapon = new DiagnosticWeapon();
    for (const [i, target] of M1_ARENA.targets!.entries()) {
      const ray = rayTo({ x: target.center.x, y: target.center.y + 12, z: target.center.z + 10 }, target.center);
      const foot = { x: target.center.x, y: target.center.y - 1.1 + 0.02, z: target.center.z + 1.8 };
      const aim = solveAim(world, ray, foot)!;
      assert.equal(aim.target.id, target.id);
      assert.equal(aim.impact?.id, target.id);
      assert.equal(aim.blocked, false);
      assert.ok(Math.hypot(aim.target.point.x - target.center.x, aim.target.point.y - target.center.y, aim.target.point.z - target.center.z) > 0.5, 'surface point, not centre snap');
      weapon.step(i * 10, true, aim);
      assert.equal(weapon.hits[target.id], 1);
    }
    const target = M1_ARENA.targets![0]!;
    const upper = M1_ARENA.targets![2]!;
    const sideHit = solveAim(world, rayTo({ x: upper.center.x + 30, y: upper.center.y + 52, z: upper.center.z + 41 }, upper.center),
      { x: -7, y: 4.12, z: -9 })!;
    assert.equal(sideHit.impact?.id, upper.id);
    assert.equal(sideHit.blocked, false, 'different contact points on the same curved target are not cover');
    const ray = rayTo({ x: 5, y: 14, z: 13 }, target.center);
    const blocked = solveAim(world, ray, { x: -1.08, y: 0.02, z: 3 })!;
    assert.equal(blocked.target.id, target.id);
    assert.equal(blocked.impact?.id, 'wall');
    assert.ok(blocked.blocked);
    weapon.step(100, true, blocked);
    assert.equal(weapon.hits[target.id], 1, 'cover absorbs the shot');
    const top = world.raycast({ origin: { x: -7, y: 15, z: -9 }, direction: { x: 0, y: -1, z: 0 } }, 30)!;
    assert.equal(top.id, 'e2'); assert.ok(Math.abs(top.point.y - 4.1) < 0.001);
    const inside = world.raycast({ origin: { x: -7, y: 1, z: -9 }, direction: { x: 0, y: -1, z: 0 } }, 30)!;
    assert.equal(inside.id, 'e2', 'the gameplay plateau is solid down to E0');
  } finally { world.dispose(); }
});

test('jumping against either plateau keeps its upward momentum and lands within one second', async () => {
  for (const { z, y, surface, stop } of [
    { z: 0.3, y: 0.06, surface: 'e1', stop: -4 },
    { z: -1.02, y: 0.06, surface: 'e1', stop: -4 },
    { z: -4.8, y: 2.11, surface: 'e2', stop: -9 },
    { z: -6.5, y: 2.11, surface: 'e2', stop: -9 },
  ]) {
    const spawn = { x: -7, y, z };
    const world = await createSpatialWorld({ ...M1_ARENA, spawn });
    try {
      const sim = new Simulation(world, spawn);
      for (let i = 0; i < 15; i++) sim.step(idle);
      assert.ok(sim.snapshot().grounded, 'begins on its lower floor');
      let landed = false;
      for (let tick = 0; tick < 60; tick++) {
        const before = sim.snapshot();
        const state = sim.step({ ...idle, z: before.position.z > stop ? -1 : 0, jump: tick === 0 });
        if (tick > 0 && before.velocity.y > 0.4) {
          assert.equal(state.grounded, false, 'a rising capsule touching the lip is not a landing');
          assert.ok(state.velocity.y > 0, `jump was cancelled at ${JSON.stringify(state.position)}`);
        }
        if (state.grounded && state.surface === surface) { landed = true; break; }
      }
      assert.ok(landed, `one jump must land on ${surface} from z=${z}: ${JSON.stringify(sim.snapshot())}`);
    } finally { world.dispose(); }
  }
});
