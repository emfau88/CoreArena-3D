import type { ArenaDefinition, TraversalLink } from '../arena/arena';
import { BossNavigation } from './bossNavigation';
import type { MoveCommand, Snapshot, Vec3 } from './types';

const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.z - b.z);
const toward = (from: Vec3, to: Vec3, jump = false): MoveCommand => {
  const d = distance(from, to), scale = Math.min(1, d / .12) / Math.max(d, .001);
  return { x: (to.x - from.x) * scale, z: (to.z - from.z) * scale, sprint: false, jump };
};

/** Routes over the existing three surfaces; movement and landings stay in Rapier. */
export class ArenaNavigation {
  private readonly floor: BossNavigation;
  private readonly clearance;
  private readonly floorBox;
  private link: TraversalLink | null = null;
  private jumping = false;
  private ticks = 0;
  constructor(private readonly arena: ArenaDefinition) {
    this.floor = new BossNavigation(arena, .45);
    this.floorBox = arena.boxes.find(box => box.id === 'floor')!;
    this.clearance = arena.boxes.filter(box => box.id !== 'floor').map(box => ({
      left: box.center.x - box.size.x / 2, right: box.center.x + box.size.x / 2,
      back: box.center.z - box.size.z / 2, front: box.center.z + box.size.z / 2,
    }));
  }
  reset(): void { this.link = null; this.jumping = false; this.ticks = 0; this.floor.reset(); }
  surfaceAt(foot: Vec3): string {
    return this.arena.boxes.find(box => box.level && Math.abs(foot.y - box.center.y - box.size.y / 2) < .6
      && Math.abs(foot.x - box.center.x) <= box.size.x / 2 && Math.abs(foot.z - box.center.z) <= box.size.z / 2)?.id ?? 'floor';
  }
  private route(from: string, to: string): TraversalLink | null {
    const queue: { surface: string; first: TraversalLink | null }[] = [{ surface: from, first: null }], visited = new Set([from]);
    for (let i = 0; i < queue.length; i++) for (const link of this.arena.links ?? []) {
      const node = queue[i]!;
      if (link.from !== node.surface || visited.has(link.to)) continue;
      const first = node.first ?? link;
      if (link.to === to) return first;
      visited.add(link.to); queue.push({ surface: link.to, first });
    }
    return null;
  }
  private leaveClearance(foot: Vec3): Vec3 | undefined {
    // Physical collision permits getting closer than the planner's safety margin
    // after a landing or body-spacing nudge. Walk outward before planning again.
    const margin = .45 + .18, inset = .03;
    const contains = (r: typeof this.clearance[number], p: Vec3) => p.x > r.left - margin && p.x < r.right + margin
      && p.z > r.back - margin && p.z < r.front + margin;
    const candidates = this.clearance.filter(r => contains(r, foot)).flatMap(r => [
      ...foot.x < r.left ? [{ ...foot, x: r.left - margin - inset }] : [],
      ...foot.x > r.right ? [{ ...foot, x: r.right + margin + inset }] : [],
      ...foot.z < r.back ? [{ ...foot, z: r.back - margin - inset }] : [],
      ...foot.z > r.front ? [{ ...foot, z: r.front + margin + inset }] : [],
    ]).filter(p => !this.clearance.some(r => contains(r, p))
      && Math.abs(p.x - this.floorBox.center.x) < this.floorBox.size.x / 2 - margin
      && Math.abs(p.z - this.floorBox.center.z) < this.floorBox.size.z / 2 - margin);
    return candidates.sort((a, b) => distance(a, foot) - distance(b, foot))[0];
  }
  command(own: Snapshot, goal: Vec3, surface = this.surfaceAt(goal)): MoveCommand {
    if (this.link && this.jumping) {
      if (++this.ticks > 180 || own.grounded && this.ticks > 8 &&
        (own.surface !== this.link.from || distance(own.position, this.link.start) < .2)) this.reset();
      else return toward(own.position, this.link.end);
    }
    if (!own.grounded) return toward(own.position, goal);
    if (own.surface === 'floor') {
      const escape = this.leaveClearance(own.position);
      if (escape) { this.floor.reset(); return toward(own.position, escape); }
    }
    this.link = own.surface !== surface ? this.route(own.surface ?? 'floor', surface) : null;
    if (this.link) {
      if (distance(own.position, this.link.start) < .16) {
        this.jumping = true; this.ticks = 0;
        return toward(own.position, this.link.end, this.link.kind === 'jump');
      }
      goal = this.link.start;
    }
    return toward(own.position, own.surface === 'floor' ? this.floor.steer(own.position, goal) : goal);
  }
}
