import type { TraversalLink } from '../arena/arena';
import type { MoveCommand, Snapshot, Vec3 } from './types';

/** A directed route probe, not combat AI. It can only issue the player's move/jump commands. */
export class TraversalProbe {
  private linkIndex = 0;
  private traversing = false;
  private ticks = 0;
  status: 'ready' | 'running' | 'complete' | 'failed' = 'ready';
  readonly visited: string[] = ['floor'];
  constructor(private readonly links: readonly TraversalLink[]) {}
  start(): void { if (this.status === 'ready') this.status = 'running'; }
  command(state: Snapshot): MoveCommand {
    const idle = { x: 0, z: 0, sprint: false };
    if (this.status !== 'running') return idle;
    if (++this.ticks > 1800) { this.status = 'failed'; return idle; }
    const link = this.links[this.linkIndex];
    if (!link) { this.status = 'complete'; return idle; }
    const distance = (point: Vec3) => Math.hypot(point.x - state.position.x, point.z - state.position.z);
    if (this.traversing && state.grounded && state.surface === link.to && distance(link.end) < 0.22) {
      this.visited.push(link.to);
      this.linkIndex++;
      this.traversing = false;
      return idle;
    }
    let jump = false;
    if (!this.traversing && distance(link.start) < 0.16 && state.grounded && state.surface === link.from) {
      this.traversing = true;
      jump = link.kind === 'jump';
    }
    const point = this.traversing ? link.end : link.start;
    const length = distance(point);
    const scale = Math.min(1, length / 0.12) / Math.max(length, 1e-6);
    return { x: (point.x - state.position.x) * scale, z: (point.z - state.position.z) * scale,
      sprint: false, jump };
  }
}
