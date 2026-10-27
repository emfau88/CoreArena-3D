import type { ArenaDefinition } from '../arena/arena';
import type { Vec3 } from './types';

interface Rect { left: number; right: number; back: number; front: number }
const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.z - b.z);

/** Small visibility graph for the stone courtyard. Movement still uses real swept collision. */
export class BossNavigation {
  private readonly obstacles: Rect[];
  private readonly corners: Vec3[];
  private route: Vec3[] = [];
  private target: Vec3 | null = null;
  private nextPlan = 0;
  private calls = 0;
  constructor(arena: ArenaDefinition, radius: number) {
    const floor = arena.boxes.find(b => b.id === 'floor')!;
    const margin = radius + 0.18;
    this.obstacles = arena.boxes.filter(b => b.id !== 'floor').map(b => ({
      left: b.center.x - b.size.x / 2 - margin, right: b.center.x + b.size.x / 2 + margin,
      back: b.center.z - b.size.z / 2 - margin, front: b.center.z + b.size.z / 2 + margin,
    }));
    this.corners = this.obstacles.flatMap(r => [
      { x: r.left - 0.03, y: 0, z: r.back - 0.03 }, { x: r.right + 0.03, y: 0, z: r.back - 0.03 },
      { x: r.left - 0.03, y: 0, z: r.front + 0.03 }, { x: r.right + 0.03, y: 0, z: r.front + 0.03 },
    ]).filter(p => Math.abs(p.x - floor.center.x) < floor.size.x / 2 - margin
      && Math.abs(p.z - floor.center.z) < floor.size.z / 2 - margin && this.free(p));
  }
  reset(): void { this.route = []; this.target = null; this.calls = this.nextPlan = 0; }
  private free(p: Vec3): boolean {
    return !this.obstacles.some(r => p.x > r.left && p.x < r.right && p.z > r.back && p.z < r.front);
  }
  private clear(a: Vec3, b: Vec3): boolean {
    return !this.obstacles.some(r => {
      let low = 0, high = 1;
      for (const [start, delta, min, max] of [[a.x, b.x - a.x, r.left, r.right], [a.z, b.z - a.z, r.back, r.front]]) {
        if (Math.abs(delta!) < 1e-8) { if (start! < min! || start! > max!) return false; }
        else {
          const t1 = (min! - start!) / delta!, t2 = (max! - start!) / delta!;
          low = Math.max(low, Math.min(t1, t2)); high = Math.min(high, Math.max(t1, t2));
          if (low > high) return false;
        }
      }
      return high >= 0 && low <= 1;
    });
  }
  steer(from: Vec3, player: Vec3): Vec3 {
    this.calls++;
    if (this.free(player) && this.clear(from, player)) { this.route = []; return player; }
    if (this.calls >= this.nextPlan || !this.target || distance(this.target, player) > 1.5) {
      this.nextPlan = this.calls + 30; this.target = { ...player };
      // A player on a platform gets an approach point beside it, never a path through it.
      const goal = this.free(player) ? player : [...this.corners].sort((a, b) => distance(a, player) - distance(b, player))[0];
      this.route = goal ? this.plan(from, goal) : [];
    }
    // Do not cut a corner before reaching its clearance point.
    while (this.route.length && distance(from, this.route[0]!) < 0.025) this.route.shift();
    return this.route[0] ?? from;
  }
  private plan(from: Vec3, goal: Vec3): Vec3[] {
    const nodes = [from, ...this.corners, goal], end = nodes.length - 1;
    const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1), done = new Set<number>(); costs[0] = 0;
    for (let pass = 0; pass < nodes.length; pass++) {
      let current = -1;
      for (let i = 0; i < nodes.length; i++) if (!done.has(i) && (current < 0 || costs[i]! < costs[current]!)) current = i;
      if (current < 0 || !Number.isFinite(costs[current])) break;
      if (current === end) {
        const path: Vec3[] = []; for (let i = end; i > 0; i = previous[i]!) path.unshift(nodes[i]!); return path;
      }
      done.add(current);
      for (let i = 1; i < nodes.length; i++) {
        if (done.has(i) || !this.clear(nodes[current]!, nodes[i]!)) continue;
        const cost = costs[current]! + distance(nodes[current]!, nodes[i]!);
        if (cost < costs[i]!) { costs[i] = cost; previous[i] = current; }
      }
    }
    return [];
  }
}
