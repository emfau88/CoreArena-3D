import type { CameraBasis } from './movement';
import { screenMovement } from './movement';
import type { MoveCommand } from '../core/types';

export class DesktopInput {
  private readonly keys = new Set<string>();
  private readonly abort = new AbortController();
  constructor(onCamera: () => void, onDiagnostics: () => void) {
    const options = { signal: this.abort.signal };
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyV', 'F3', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'KeyV' && !event.repeat) onCamera();
      if (event.code === 'F3' && !event.repeat) onDiagnostics();
      this.keys.add(event.code);
    }, options);
    window.addEventListener('keyup', (event) => this.keys.delete(event.code), options);
    window.addEventListener('blur', () => this.clear(), options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    }, options);
  }
  command(basis: CameraBasis): MoveCommand {
    return screenMovement(
      Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')),
      Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS')),
      this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'), basis,
    );
  }
  clear(): void { this.keys.clear(); }
  dispose(): void { this.abort.abort(); this.clear(); }
}
