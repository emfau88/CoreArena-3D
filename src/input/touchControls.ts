/** Small touch adapter. Movement and aim own separate fingers; lifting either never cancels the other. */
export class TouchControls {
  private readonly abort = new AbortController();
  private readonly root: HTMLElement;
  private readonly stick: HTMLElement;
  private readonly knob: HTMLElement;
  private readonly sprintButton: HTMLButtonElement;
  private moveId: number | null = null;
  private aimId: number | null = null;
  private jumpPending = false;
  private firePending = false;
  x = 0;
  up = 0;
  sprint = false;
  readonly pointer = { x: 0, y: 0, active: false };
  get enabled(): boolean { return document.documentElement.classList.contains('touch-mode'); }
  constructor(canvas: HTMLCanvasElement, onCamera: () => void) {
    if (matchMedia('(any-pointer: coarse)').matches) document.documentElement.classList.add('touch-mode');
    this.root = document.createElement('div'); this.root.id = 'touch-controls';
    this.root.innerHTML = `<div id="touch-stick" aria-label="Bewegungsjoystick"><span></span><small>BEWEGEN</small></div>
      <div id="touch-actions"><button id="touch-camera" type="button" aria-label="Kamera wechseln">Ansicht</button>
      <button id="touch-sprint" type="button" aria-pressed="false">Sprint aus</button><button id="touch-jump" type="button">Sprung</button></div>
      <div id="touch-hint">Arena berühren &amp; halten: zielen und feuern</div>
      <div id="rotate-device"><div>Bitte ins Querformat drehen.<small>Links bewegen · Arena berühren zum Feuern</small></div></div>`;
    canvas.parentElement!.append(this.root);
    this.stick = this.root.querySelector('#touch-stick')!;
    this.knob = this.stick.querySelector('span')!;
    this.sprintButton = this.root.querySelector('#touch-sprint')!;
    const options = { signal: this.abort.signal };
    window.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') document.documentElement.classList.add('touch-mode');
    }, options);
    this.stick.addEventListener('pointerdown', (event) => {
      if (this.moveId !== null) return;
      event.preventDefault(); this.moveId = event.pointerId;
      this.stick.setPointerCapture(event.pointerId); this.move(event);
    }, options);
    this.stick.addEventListener('pointermove', (event) => { if (event.pointerId === this.moveId) this.move(event); }, options);
    const releaseMove = (event: PointerEvent) => {
      if (event.pointerId !== this.moveId) return;
      this.moveId = null; this.x = this.up = 0; this.knob.style.transform = '';
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) this.stick.addEventListener(type, releaseMove, options);
    canvas.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || this.aimId !== null) return;
      event.preventDefault(); canvas.focus(); this.aimId = event.pointerId; this.firePending = true;
      canvas.setPointerCapture(event.pointerId); this.aim(event);
    }, options);
    canvas.addEventListener('pointermove', (event) => { if (event.pointerId === this.aimId) this.aim(event); }, options);
    const releaseAim = (event: PointerEvent) => {
      if (event.pointerId !== this.aimId) return;
      this.aimId = null;
      // Keep the last point for one queued tap shot; fire() clears it on the next idle tick.
      if (event.type !== 'pointerup') { this.firePending = false; this.pointer.active = false; }
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) canvas.addEventListener(type, releaseAim, options);
    this.root.querySelector('#touch-jump')!.addEventListener('pointerdown', (event) => {
      event.preventDefault(); this.jumpPending = true;
    }, options);
    const toggleSprint = () => { this.sprint = !this.sprint; this.sprintLabel(); };
    this.sprintButton.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      // Secondary touch pointers may not synthesize click while the joystick is held.
      event.preventDefault(); toggleSprint();
    }, options);
    this.sprintButton.addEventListener('click', (event) => { if (event.detail === 0) toggleSprint(); }, options);
    this.root.querySelector('#touch-camera')!.addEventListener('click', onCamera, options);
    window.addEventListener('resize', () => this.clear(), options);
  }
  private move(event: PointerEvent): void {
    const rect = this.stick.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2, dy = event.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(dx, dy), radius = rect.width * 0.34;
    const scale = length > radius ? radius / length : 1;
    this.x = length < 6 ? 0 : dx * scale / radius;
    this.up = length < 6 ? 0 : -dy * scale / radius;
    this.knob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
  }
  private aim(event: PointerEvent): void { Object.assign(this.pointer, { x: event.clientX, y: event.clientY, active: true }); }
  private sprintLabel(): void {
    this.sprintButton.setAttribute('aria-pressed', String(this.sprint));
    this.sprintButton.textContent = this.sprint ? 'Sprint an' : 'Sprint aus';
  }
  jump(): boolean { const jump = this.jumpPending; this.jumpPending = false; return jump; }
  fire(): boolean {
    const fire = this.aimId !== null || this.firePending;
    this.firePending = false;
    if (!fire) this.pointer.active = false;
    return fire;
  }
  clear(): void {
    this.moveId = this.aimId = null; this.x = this.up = 0;
    this.jumpPending = this.firePending = this.sprint = this.pointer.active = false;
    this.knob.style.transform = ''; this.sprintLabel();
  }
  dispose(): void { this.abort.abort(); this.root.remove(); }
}
