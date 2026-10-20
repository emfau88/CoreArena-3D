import { TICK_SECONDS } from './types';

export class FixedClock {
  private accumulator = 0;
  droppedTicks = 0;
  advance(elapsedSeconds: number, step: () => void): number {
    this.accumulator += Math.max(0, elapsedSeconds);
    let count = 0;
    while (this.accumulator + 1e-10 >= TICK_SECONDS && count < 5) {
      step();
      this.accumulator -= TICK_SECONDS;
      count++;
    }
    if (this.accumulator + 1e-10 >= TICK_SECONDS) {
      const dropped = Math.floor((this.accumulator + 1e-10) / TICK_SECONDS);
      this.droppedTicks += dropped;
      this.accumulator -= dropped * TICK_SECONDS;
    }
    return Math.max(0, this.accumulator / TICK_SECONDS);
  }
  reset(): void { this.accumulator = 0; }
}
