import type { CameraBasis } from './movement';
import { screenMovement } from './movement';
import type { MoveCommand } from '../core/types';
import { TouchControls } from './touchControls';

export class DesktopInput {
  private readonly keys = new Set<string>();
  private readonly abort = new AbortController();
  private jumpPending = false;
  private firePending = false;
  private firing = false;
  private readonly mouse = { x: 0, y: 0, active: false };
  private readonly touch: TouchControls;
  get pointer() { return this.touch.pointer.active ? this.touch.pointer : this.mouse; }
  get touchEnabled(): boolean { return this.touch.enabled; }
  constructor(canvas: HTMLCanvasElement, onCamera: () => void, onDiagnostics: () => void, onProbe: () => void,
    onWeapon: (id: 'arc' | 'pulse' | 'cycle') => void = () => {}) {
    this.touch = new TouchControls(canvas, onCamera);
    const options = { signal: this.abort.signal };
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyV', 'KeyB', 'F3', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'KeyV' && !event.repeat) onCamera();
      if (event.code === 'F3' && !event.repeat) onDiagnostics();
      if (event.code === 'KeyB' && !event.repeat) onProbe();
      if (event.code === 'Digit1' && !event.repeat) onWeapon('arc');
      if (event.code === 'Digit2' && !event.repeat) onWeapon('pulse');
      if (event.code === 'Space' && !event.repeat) this.jumpPending = true;
      this.keys.add(event.code);
    }, options);
    canvas.addEventListener('wheel', (event) => { event.preventDefault(); if (event.deltaY) onWeapon('cycle'); }, { ...options, passive: false });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code), options);
    canvas.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      Object.assign(this.mouse, { x: event.clientX, y: event.clientY, active: true });
    }, options);
    canvas.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      canvas.focus();
      canvas.setPointerCapture(event.pointerId);
      Object.assign(this.mouse, { x: event.clientX, y: event.clientY, active: true });
      this.firing = this.firePending = true;
    }, options);
    window.addEventListener('pointerup', (event) => { if (event.pointerType !== 'touch' && event.button === 0) this.firing = false; }, options);
    canvas.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') this.mouse.active = false; }, options);
    canvas.addEventListener('pointercancel', (event) => { if (event.pointerType !== 'touch') this.clear(); }, options);
    window.addEventListener('blur', () => this.clear(), options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    }, options);
  }
  command(basis: CameraBasis): MoveCommand {
    const jump = this.touch.jump() || this.jumpPending;
    this.jumpPending = false;
    return { ...screenMovement(
      Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')) || this.touch.x,
      Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS')) || this.touch.up,
      this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.touch.sprint, basis,
    ), jump };
  }
  fire(): boolean {
    const fire = this.touch.fire() || this.firing || this.firePending;
    this.firePending = false;
    return fire;
  }
  clear(): void { this.keys.clear(); this.jumpPending = this.firePending = this.firing = false; this.mouse.active = false; this.touch.clear(); }
  dispose(): void { this.abort.abort(); this.clear(); this.touch.dispose(); }
}
