import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FixedClock } from '../src/core/fixedClock';
import { screenMovement } from '../src/input/movement';
import { ArenaCamera } from '../src/render/camera';

test('30, 60 and 144 Hz rendering produce exactly 120 fixed ticks over two seconds', () => {
  for (const hz of [30, 60, 144]) {
    const clock = new FixedClock();
    let ticks = 0;
    for (let frame = 0; frame < hz * 2; frame++) clock.advance(1 / hz, () => ticks++);
    assert.equal(ticks, 120, `${hz} Hz`);
    assert.equal(clock.droppedTicks, 0);
  }
});

test('catch-up is bounded and reset prevents carrying partial time across a pause', () => {
  const clock = new FixedClock();
  let ticks = 0;
  clock.advance(1, () => ticks++);
  assert.equal(ticks, 5);
  assert.equal(clock.droppedTicks, 55);
  clock.advance(0.01, () => ticks++);
  clock.reset();
  clock.advance(0.01, () => ticks++);
  assert.equal(ticks, 5);
});

test('both camera views preserve screen directions, diagonal speed and analog magnitude', () => {
  const camera = new ArenaCamera();
  for (const mode of ['straight', 'isometric']) {
    assert.equal(camera.mode, mode);
    const basis = camera.basis();
    const right = screenMovement(1, 0, false, basis);
    const up = screenMovement(0, 1, false, basis);
    assert.ok(right.x * basis.right.x + right.z * basis.right.z > 0.999);
    assert.ok(up.x * basis.forward.x + up.z * basis.forward.z > 0.999);
    assert.ok(Math.abs(right.x * up.x + right.z * up.z) < 1e-10);
    const diagonal = screenMovement(1, 1, true, basis);
    assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z) - 1) < 1e-10);
    const analog = screenMovement(0.25, 0, false, basis);
    assert.ok(Math.abs(Math.hypot(analog.x, analog.z) - 0.25) < 1e-10);
    camera.toggle();
  }
});
