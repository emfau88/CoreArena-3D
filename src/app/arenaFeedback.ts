type Cue = 'arc' | 'pulse' | 'rail' | 'hit' | 'hurt' | 'pickup' | 'death' | 'result';
const tones: Record<Cue, readonly [number, number, number, number]> = {
  arc: [160, 75, .4, .07], pulse: [520, 150, .08, .08], rail: [1100, 80, .28, .12],
  hit: [760, 420, .065, .075], hurt: [110, 45, .18, .12], pickup: [450, 900, .16, .08],
  death: [170, 35, .4, .11], result: [330, 660, .55, .1],
};

/** Arena-only synthesized cues: no extra assets or changes to Adventure audio. */
export class ArenaFeedback {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private readonly samples = new Float32Array(256);
  private readonly abort = new AbortController();
  private readonly sound = document.createElement('button');
  private readonly hit = document.createElement('div');
  private readonly hurt = document.createElement('div');
  private readonly notice = document.createElement('div');
  private muted = false;
  private paused = false;
  private voices = 0;
  private peak = 0;
  private hitUntil = 0;
  private hurtUntil = 0;
  private noticeUntil = 0;
  private readonly played: Partial<Record<Cue, number>> = {};
  constructor(host: HTMLElement, settings: HTMLElement) {
    this.sound.id = 'arena-sound'; this.sound.type = 'button'; this.label(); settings.append(this.sound);
    this.hit.id = 'arena-hit'; this.hurt.id = 'arena-hurt'; this.notice.id = 'arena-notice';
    this.hit.hidden = this.notice.hidden = true;
    for (const element of [this.hit, this.hurt, this.notice]) { element.setAttribute('aria-hidden', 'true'); host.append(element); }
    const options = { signal: this.abort.signal };
    const unlock = () => {
      try {
        if (!this.context) {
          this.context = new AudioContext(); this.master = this.context.createGain();
          this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 256;
          this.master.connect(this.analyser); this.analyser.connect(this.context.destination); this.volume();
        }
        void this.context.resume().catch(() => {});
      } catch { this.sound.textContent = 'Ton nicht verfügbar'; }
    };
    window.addEventListener('pointerdown', unlock, options); window.addEventListener('keydown', unlock, options);
    this.sound.addEventListener('click', () => { unlock(); this.muted = !this.muted; this.label(); this.volume(); }, options);
  }
  private label(): void { this.sound.textContent = this.muted ? 'Ton aus' : 'Ton an'; this.sound.setAttribute('aria-pressed', String(!this.muted)); }
  private volume(): void { if (this.context && this.master) this.master.gain.setTargetAtTime(this.muted || this.paused ? 0 : .45, this.context.currentTime, .015); }
  pause(value: boolean): void { this.paused = value; this.volume(); }
  play(cue: Cue, volume = 1, pan = 0): void {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || this.muted || this.paused || this.voices >= 12) return;
    const [start, end, duration, amplitude] = tones[cue], now = ctx.currentTime;
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), stereo = ctx.createStereoPanner();
    oscillator.type = cue === 'arc' || cue === 'rail' ? 'sawtooth' : cue === 'pulse' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(start, now); oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(amplitude * Math.max(.01, volume), now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration); stereo.pan.value = Math.max(-.8, Math.min(.8, pan));
    oscillator.connect(gain); gain.connect(stereo); stereo.connect(this.master!);
    this.voices++; this.played[cue] = (this.played[cue] ?? 0) + 1;
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); stereo.disconnect(); this.voices--; };
    oscillator.start(now); oscillator.stop(now + duration);
  }
  confirmedHit(tick: number, point: { x: number; y: number }): void {
    this.hitUntil = tick + 12; this.hit.textContent = '✣';
    this.hit.style.left = `${point.x}px`; this.hit.style.top = `${point.y - 22}px`; this.play('hit');
  }
  damaged(tick: number, dead: boolean): void { this.hurtUntil = tick + 18; this.play(dead ? 'death' : 'hurt'); }
  announce(tick: number, message: string): void { this.noticeUntil = tick + 100; this.notice.textContent = message; }
  draw(tick: number): void {
    this.hit.hidden = tick >= this.hitUntil; this.notice.hidden = tick >= this.noticeUntil;
    this.hurt.style.opacity = String(Math.max(0, (this.hurtUntil - tick) / 18) * .55);
    if (this.analyser) { this.analyser.getFloatTimeDomainData(this.samples); for (const sample of this.samples) this.peak = Math.max(this.peak, Math.abs(sample)); }
  }
  reset(): void { this.hitUntil = this.hurtUntil = this.noticeUntil = 0; this.draw(0); }
  diagnostics() { return { state: this.context?.state ?? 'locked', muted: this.muted, played: { ...this.played }, peak: this.peak }; }
  dispose(): void { this.abort.abort(); for (const element of [this.sound, this.hit, this.hurt, this.notice]) element.remove(); void this.context?.close(); }
}
