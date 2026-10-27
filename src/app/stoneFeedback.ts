type Cue = 'pulse' | 'arc' | 'hit' | 'hurt' | 'step' | 'land' | 'jump' | 'windup' | 'slam' | 'pickup' | 'victory';
const tones: Record<Cue, [number, number, number, number]> = {
  pulse: [480, 120, 0.09, 0.1], arc: [180, 45, 0.18, 0.15], hit: [240, 80, 0.07, 0.08],
  hurt: [95, 40, 0.22, 0.18], step: [80, 45, 0.055, 0.035], land: [100, 35, 0.16, 0.12],
  jump: [180, 300, 0.08, 0.055], windup: [80, 165, 0.28, 0.11], slam: [110, 28, 0.28, 0.21],
  pickup: [520, 920, 0.18, 0.1], victory: [350, 700, 0.45, 0.12],
};

/** Lightweight synthesized first sound pass. No autoplay, downloads, or gameplay timing changes. */
export class StoneFeedback {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noise: AudioBuffer | null = null;
  private readonly samples = new Float32Array(256);
  private readonly abort = new AbortController();
  private muted = false;
  private paused = false;
  private voices = 0;
  private peak = 0;
  private played = 0;
  private hitUntil = 0;
  private hurtUntil = 0;
  private readonly marker = document.createElement('div');
  private readonly hurt = document.createElement('div');
  private readonly button = document.createElement('button');
  constructor(host: HTMLElement) {
    this.button.id = 'stone-sound'; this.button.type = 'button'; this.label();
    this.marker.id = 'stone-hit-marker'; this.marker.hidden = true; this.marker.setAttribute('aria-hidden', 'true');
    this.hurt.id = 'stone-hurt'; this.hurt.setAttribute('aria-hidden', 'true');
    host.append(this.button, this.marker, this.hurt);
    const options = { signal: this.abort.signal };
    const unlock = () => {
      if (!this.context) {
        try {
          this.context = new AudioContext(); this.master = this.context.createGain();
          this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 256;
          this.master.connect(this.analyser); this.analyser.connect(this.context.destination);
          this.noise = this.context.createBuffer(1, this.context.sampleRate * 0.5, this.context.sampleRate);
          const data = this.noise.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          this.volume();
        } catch { this.button.textContent = 'Ton nicht verfügbar'; return; }
      }
      void this.context.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, options); window.addEventListener('keydown', unlock, options);
    this.button.addEventListener('click', () => { unlock(); this.muted = !this.muted; this.label(); this.volume(); }, options);
  }
  private label() { this.button.textContent = this.muted ? 'Ton aus' : 'Ton an'; this.button.setAttribute('aria-pressed', String(!this.muted)); }
  private volume() { if (this.master && this.context) this.master.gain.setTargetAtTime(this.paused || this.muted ? 0 : 0.5, this.context.currentTime, 0.015); }
  pause(value: boolean): void { this.paused = value; this.volume(); }
  play(cue: Cue, pan = 0): void {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || this.muted || this.paused || this.voices >= 20) return;
    const [start, end, duration, volume] = tones[cue], now = ctx.currentTime;
    const gain = ctx.createGain(), stereo = ctx.createStereoPanner(), oscillator = ctx.createOscillator();
    stereo.pan.value = Math.max(-0.8, Math.min(0.8, pan));
    gain.gain.setValueAtTime(0.001, now); gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.type = cue === 'pulse' || cue === 'arc' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(start, now); oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
    oscillator.connect(gain); gain.connect(stereo); stereo.connect(this.master!);
    const noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter(); noise.buffer = this.noise;
    filter.type = 'lowpass'; filter.frequency.value = cue === 'pulse' ? 2200 : cue === 'hit' ? 1500 : 450;
    noise.connect(filter); filter.connect(gain);
    this.voices++; this.played++;
    oscillator.onended = () => { oscillator.disconnect(); noise.disconnect(); filter.disconnect(); gain.disconnect(); stereo.disconnect(); this.voices--; };
    oscillator.start(now); noise.start(now); oscillator.stop(now + duration); noise.stop(now + duration);
  }
  bossHit(damage: number, tick: number): void { this.marker.textContent = `✣ −${damage}`; this.hitUntil = tick + 18; }
  playerHit(tick: number): void { this.hurtUntil = tick + 18; }
  draw(tick: number, boss: { x: number; y: number }): void {
    this.marker.hidden = tick >= this.hitUntil;
    this.marker.style.left = `${boss.x}px`; this.marker.style.top = `${boss.y - 28 - (18 - this.hitUntil + tick) * 0.6}px`;
    this.hurt.style.opacity = String(Math.max(0, (this.hurtUntil - tick) / 18) * 0.65);
    if (this.analyser) { this.analyser.getFloatTimeDomainData(this.samples); for (const sample of this.samples) this.peak = Math.max(this.peak, Math.abs(sample)); }
  }
  reset(): void { this.hitUntil = this.hurtUntil = 0; this.marker.hidden = true; this.hurt.style.opacity = '0'; }
  diagnostics() { return { state: this.context?.state ?? 'locked', muted: this.muted, played: this.played, peak: this.peak }; }
  dispose(): void { this.abort.abort(); this.button.remove(); this.marker.remove(); this.hurt.remove(); void this.context?.close(); }
}
