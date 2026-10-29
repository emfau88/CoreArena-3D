import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M0_ARENA } from '../src/arena/arena';
import type { ArenaDefinition } from '../src/arena/arena';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Simulation } from '../src/core/simulation';
import { FixedClock } from '../src/core/fixedClock';
import { CAPSULE, TICK_SECONDS } from '../src/core/types';
import type { MoveCommand, Vec3 } from '../src/core/types';

const floor = M0_ARENA.boxes.find((box) => box.id === 'floor')!;
const wall = M0_ARENA.boxes.find((box) => box.id === 'wall')!;
const idle: MoveCommand = { x: 0, z: 0, sprint: false };

async function setup(spawn: Vec3, withWall = true) {
  spawn = { ...spawn, y: 0.06 };
  const arena: ArenaDefinition = { spawn, boxes: withWall ? [floor, wall] : [floor] };
  const world = await createSpatialWorld(arena);
  const simulation = new Simulation(world, spawn);
  for (let tick = 0; tick < 15; tick++) simulation.step(idle);
  return { world, simulation };
}

test('ten real capsule approaches from each of four wall sides never penetrate', async () => {
  const approaches = [
    { spawn: { x: -4, y: 0.03, z: 0 }, x: 1, z: 0, axis: 'x' as const, bound: -1.05, side: -1 },
    { spawn: { x: 4, y: 0.03, z: 0 }, x: -1, z: 0, axis: 'x' as const, bound: 1.05, side: 1 },
    { spawn: { x: 0, y: 0.03, z: -7 }, x: 0, z: 1, axis: 'z' as const, bound: -4.45, side: -1 },
    { spawn: { x: 0, y: 0.03, z: 7 }, x: 0, z: -1, axis: 'z' as const, bound: 4.45, side: 1 },
  ];
  for (const approach of approaches) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const { world, simulation } = await setup(approach.spawn);
      try {
        for (let tick = 0; tick < 120; tick++) {
          const state = simulation.step({ x: approach.x, z: approach.z, sprint: attempt % 2 === 0 });
          assert.ok(state.position[approach.axis] * approach.side >= Math.abs(approach.bound) - 0.005);
          assert.ok(state.position.y > -0.01 && state.position.y < 0.06,
            `foot stays on E0: ${JSON.stringify({ approach, attempt, tick, state })}`);
        }
        assert.ok(Math.abs(simulation.snapshot().position[approach.axis] - approach.bound) < 0.06, 'reaches wall');
      } finally { world.dispose(); }
    }
  }
});

test('wall contact preserves tangential movement instead of sticking', async () => {
  const { world, simulation } = await setup({ x: -1.08, y: 0.03, z: -2 });
  try {
    for (let tick = 0; tick < 30; tick++) simulation.step({ x: 1, z: 1, sprint: false });
    const p = simulation.snapshot().position;
    assert.ok(p.x < -0.6 - CAPSULE.radius + 0.005);
    assert.ok(p.z > 0.3, 'slides more than two metres along wall');
  } finally { world.dispose(); }
});

test('real physics travel is independent of render rate, sprint and diagonal are correctly scaled', async () => {
  const positions: number[] = [];
  for (const hz of [30, 60, 144]) {
    const { world, simulation } = await setup({ x: -10, y: 0.03, z: 0 }, false);
    try {
      const clock = new FixedClock();
      for (let frame = 0; frame < hz; frame++) {
        clock.advance(1 / hz, () => simulation.step({ x: 1, z: 0, sprint: false }));
      }
      positions.push(simulation.snapshot().position.x);
      assert.ok(Math.abs(simulation.snapshot().position.x + 2.8) < 0.005,
        `${hz} Hz: ${JSON.stringify(simulation.snapshot())}`);
    } finally { world.dispose(); }
  }
  assert.ok(Math.max(...positions) - Math.min(...positions) < 1e-5);
  for (const sprint of [false, true]) {
    const { world, simulation } = await setup({ x: 0, y: 0.03, z: 0 }, false);
    try {
      for (let tick = 0; tick < 1 / TICK_SECONDS; tick++) simulation.step({ x: 1, z: 1, sprint });
      const p = simulation.snapshot().position;
      const speed = sprint ? 9.18 : 7.2;
      // Rapier can spend one fixed step resolving a diagonal resting floor contact.
      assert.ok(Math.abs(Math.hypot(p.x, p.z) - speed) < speed * TICK_SECONDS + 0.005,
        `${sprint ? 'sprint' : 'walk'} diagonal: ${JSON.stringify(p)}, distance=${Math.hypot(p.x, p.z)}`);
      const snapshot = simulation.snapshot();
      assert.ok(Math.abs(Math.hypot(snapshot.velocity.x, snapshot.velocity.z) - speed) < 0.01);
      assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.position));
    } finally { world.dispose(); }
  }
});
