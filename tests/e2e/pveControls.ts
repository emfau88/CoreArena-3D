import { expect, type Page } from '@playwright/test';
import { campaignLevel } from '../../src/arena/campaign';
import type { Snapshot } from '../../src/core/types';

export async function walkTo(page: Page, x: number, z: number) {
  for (const [axis, target] of [['z', z], ['x', x]] as const) {
    const current = await page.evaluate(axis => (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot.position[axis], axis);
    if (Math.abs(current - target) < 0.15) continue;
    const direction = target > current ? 1 : -1;
    const key = axis === 'x' ? direction > 0 ? 'KeyD' : 'KeyA' : direction > 0 ? 'KeyS' : 'KeyW';
    await page.keyboard.down(key);
    try { await page.waitForFunction(({ axis, target, direction }) => {
      const s = (window as unknown as { __coreArena: { read(): { snapshot: Snapshot } } }).__coreArena.read().snapshot;
      return (s.position[axis] - target) * direction >= -0.1;
    }, { axis, target, direction }, { timeout: 5000 }); }
    finally { await page.keyboard.up(key); }
  }
}
export async function collectPulse(page: Page, levelId: string) {
  const item = campaignLevel(levelId).pickups.find(p => p.kind === 'pulse')!;
  await walkTo(page, item.position.x, item.position.z);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __coreArena: { read(): { weapons: { ownsPulse: boolean } } } }).__coreArena.read().weapons.ownsPulse)).toBe(true);
  await page.keyboard.press('Digit2');
}
