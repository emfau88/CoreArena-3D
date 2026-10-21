import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { solveAim } from '../src/core/aim';
import { Combat, directionTo, type WeaponId } from '../src/core/combat';
import type { Vec3 } from '../src/core/types';

const cameraRay = (point: Vec3, iso: boolean) => {
  const origin = { x: point.x + (iso ? 8 : 0), y: point.y + 12, z: point.z + 10 };
  return { origin, direction: directionTo(origin, point).direction };
};

test('aiming before or behind an enemy shoots through it on E0/E1/E2 in both camera angles', async () => {
  for (const level of [0, 2.05, 4.1]) for (const iso of [false, true]) for (const cursorX of [2, 8]) {
    const foot = { x: 0, y: level + 0.03, z: 0 };
    const target = { id: 'enemy', center: { x: 4, y: level + 1.1, z: 0 }, radius: 0.6, level: 'test' };
    const world = await createSpatialWorld({ spawn: foot, targets: [target], boxes: [
      { id: 'floor', center: { x: 0, y: level - 0.5, z: 0 }, size: { x: 40, y: 1, z: 40 }, material: 'stone' }] });
    try {
      const ray = cameraRay({ x: cursorX, y: foot.y + 1.15, z: 0 }, iso);
      const aim = solveAim(world, ray, foot)!;
      assert.equal(aim.target.id, 'floor', 'cursor deliberately misses the enemy');
      assert.ok(Math.abs(aim.firePoint.z) < 0.0001, 'no camera parallax');
      assert.ok(Math.abs(aim.muzzle.y - aim.firePoint.y) < 0.0001, 'horizontal shot');
      assert.equal(aim.impact?.id, target.id); assert.equal(aim.blocked, false);
      for (const kind of ['arc', 'pulse'] as WeaponId[]) {
        const combat = new Combat(); if (kind === 'pulse') { combat.addAmmo(1, true); combat.select('pulse'); }
        const damage = combat.step(1, true, aim, ray, world, [target]).damage;
        for (let tick = 2; tick < 22; tick++) damage.push(...combat.step(tick, false, null, null, world, [target]).damage);
        assert.equal(damage[0]?.target, target.id, `${kind}, level ${level}, iso ${iso}, cursor ${cursorX}`);
      }
    } finally { world.dispose(); }
  }
});

test('directional ground aim still respects walls and does not pull lateral shots onto enemies', async () => {
  for (const wall of [false, true]) {
    const foot = { x: 0, y: 0.03, z: 0 };
    const target = { id: 'enemy', center: { x: 4, y: 1.1, z: 0 }, radius: 0.6, level: 'test' };
    const world = await createSpatialWorld({ spawn: foot, targets: [target], boxes: [
      { id: 'floor', center: { x: 0, y: -0.5, z: 0 }, size: { x: 40, y: 1, z: 40 }, material: 'stone' },
      ...(wall ? [{ id: 'wall', center: { x: 3, y: 1, z: 0 }, size: { x: 0.1, y: 2, z: 4 }, material: 'stone' as const }] : [])] });
    try {
      const ray = cameraRay({ x: 2, y: 1.18, z: wall ? 0 : 3 }, false);
      const aim = solveAim(world, ray, foot)!;
      assert.equal(aim.target.id, 'floor'); assert.equal(aim.blocked, wall);
      for (const kind of ['arc', 'pulse'] as WeaponId[]) {
        const combat = new Combat(); if (kind === 'pulse') { combat.addAmmo(1, true); combat.select('pulse'); }
        const damage = combat.step(1, true, aim, ray, world, [target]).damage;
        for (let tick = 2; tick < 24; tick++) damage.push(...combat.step(tick, false, null, null, world, [target]).damage);
        assert.ok(damage.every(hit => hit.target !== target.id));
        if (wall && kind === 'pulse') assert.equal(damage[0]?.target, 'wall');
      }
    } finally { world.dispose(); }
  }
});

test('aim at a different-height surface keeps its actual 3D target point', async () => {
  const world = await createSpatialWorld({ spawn: { x: 0, y: 0.03, z: 0 }, boxes: [
    { id: 'upper', center: { x: 8, y: 1, z: 0 }, size: { x: 4, y: 2, z: 4 }, material: 'stone' }] });
  try {
    const aim = solveAim(world, cameraRay({ x: 8, y: 2, z: 0 }, false), { x: 0, y: 0.03, z: 0 })!;
    assert.equal(aim.target.id, 'upper'); assert.deepEqual(aim.firePoint, aim.target.point);
    assert.ok(aim.firePoint.y > aim.muzzle.y);
  } finally { world.dispose(); }
});
