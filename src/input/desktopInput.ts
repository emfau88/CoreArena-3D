import type { CameraBasis } from './movement';
import { screenMovement } from './movement';
import type { MoveCommand } from '../core/types';

export class DesktopInput {
  private readonly keys = new Set<string>();
  private readonly abort = new AbortController();
  private jumpPending = false;
  private firePending = false;
  private firing = false;
  readonly pointer = { x: 0, y: 0, active: false };
  constructor(canvas: HTMLCanvasElement, onCamera: () => void, onDiagnostics: () => void, onProbe: () => void) {
    const options = { signal: this.abort.signal };
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyV', 'KeyB', 'F3', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'KeyV' && !event.repeat) onCamera();
      if (event.code === 'F3' && !event.repeat) onDiagnostics();
      if (event.code === 'KeyB' && !event.repeat) onProbe();
      if (event.code === 'Space' && !event.repeat) this.jumpPending = true;
      this.keys.add(event.code);
    }, options);
    window.addEventListener('keyup', (event) => this.keys.delete(event.code), options);
    canvas.addEventListener('pointermove', (event) => {
      Object.assign(this.pointer, { x: event.clientX, y: event.clientY, active: true });
    }, options);
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      canvas.focus();
      canvas.setPointerCapture(event.pointerId);
      Object.assign(this.pointer, { x: event.clientX, y: event.clientY, active: true });
      this.firing = this.firePending = true;
    }, options);
    window.addEventListener('pointerup', (event) => { if (event.button === 0) this.firing = false; }, options);
    canvas.addEventListener('pointerleave', () => { this.pointer.active = false; }, options);
    canvas.addEventListener('pointercancel', () => this.clear(), options);
    window.addEventListener('blur', () => this.clear(), options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    }, options);
  }
  command(basis: CameraBasis): MoveCommand {
    const jump = this.jumpPending;
    this.jumpPending = false;
    return { ...screenMovement(
      Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')),
      Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS')),
      this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'), basis,
    ), jump };
  }
  fire(): boolean {
    const fire = this.firing || this.firePending;
    this.firePending = false;
    return fire;
  }
  clear(): void { this.keys.clear(); this.jumpPending = this.firePending = this.firing = false; }
  dispose(): void { this.abort.abort(); this.clear(); }
}
