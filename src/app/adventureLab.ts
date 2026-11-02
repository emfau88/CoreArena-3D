import { ADVENTURE_BOSS_RULES, STONE_ADVENTURE_JUMP } from '../arena/stoneAdventure';
import type { AdventureFight } from '../core/adventureFight';
import { WEAPONS } from '../core/combat';
import type { MonsterWorld, PveSnapshot } from '../core/pve';
import { WALK_SPEED, SPRINT_SPEED, type Snapshot } from '../core/types';
import type { AdventureProfile } from './adventureVariant';

export type LabWeapon = 'arc' | 'pulse';
export const LAB_SPAWN = Object.freeze({ x: 0, y: .06, z: -21 });
export const LAB_REFERENCE = Object.freeze({
  commit: 'e8b730abaa82f6bc03180989437ea4cfd0206347', fixture: 'stone-boss-a0-v1',
  rules: 'legacy-a0', walk: WALK_SPEED, sprint: SPRINT_SPEED, jump: STONE_ADVENTURE_JUMP,
  weapons: WEAPONS, boss: ADVENTURE_BOSS_RULES, camera: 'side',
  timing: 'Simulation 60 Hz; active time starts at first non-emerging boss phase (tick 120).',
  supplies: 'All existing pickups at original quantities; approach is sealed. Pulse owned with 54 rounds in both weapon profiles.',
});

/** Explicit lab fixture, never called by the regular mission or a diagnostic hook. */
export function prepareBossAttempt(fight: AdventureFight, world: MonsterWorld, weapon: LabWeapon): void {
  fight.reset();
  for (const runner of fight.runners) runner.step(LAB_SPAWN, world,
    [{ source: 'player', target: runner.definition.id, amount: runner.snapshot().hp }]);
  fight.consoleActive = fight.checkpoint = fight.bossActive = true;
  fight.combat.addAmmo(WEAPONS.pulse.maxAmmo, true);
  fight.combat.select(weapon);
}

const distribution = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (q: number) => sorted[Math.floor((sorted.length - 1) * q)] ?? 0;
  return { samples: sorted.length, p50: percentile(.5), p95: percentile(.95), p99: percentile(.99), max: sorted.at(-1) ?? 0 };
};

/** Bounded local observation. No online telemetry, no changes to simulation timing. */
export class LabMeasurement {
  private activeTick: number | null = null;
  private endTick: number | null = null;
  private tick = 0;
  private outcome = 'running';
  private abortReason: string | null = null;
  private attacks = 0;
  private damageDealt = 0;
  private damageTaken: Record<string, number> = {};
  private phases: { tick: number; phase: string; kind: string }[] = [];
  private frames: number[] = [];
  private simulationMs: number[] = [];
  private eventsTruncated = false;
  private end: unknown = null;
  constructor(readonly start: unknown, readonly profile: AdventureProfile, readonly weapon: LabWeapon) {}
  step(before: PveSnapshot, after: PveSnapshot, player: Snapshot, attacked: boolean, milliseconds: number) {
    if (this.endTick !== null) return;
    this.tick = player.tick;
    if (this.activeTick === null && after.phase !== 'emerging') this.activeTick = player.tick;
    if (this.activeTick !== null && this.simulationMs.length < 18000) this.simulationMs.push(milliseconds);
    if (attacked) this.attacks++;
    this.damageDealt += Math.max(0, before.bossHp - after.bossHp);
    const hurt = Math.max(0, before.hp + before.armor - after.hp - after.armor);
    if (hurt) {
      const cause = player.position.y < -8 ? 'fall' : after.phase === 'melee' ? 'melee' : after.kind;
      this.damageTaken[cause] = (this.damageTaken[cause] ?? 0) + hurt;
    }
    if (after.phase !== before.phase) {
      if (this.phases.length < 1000) this.phases.push({ tick: player.tick, phase: after.phase, kind: after.kind });
      else this.eventsTruncated = true;
    }
    this.end = { player, boss: after };
    if (after.outcome !== 'running') { this.outcome = after.outcome; this.endTick = player.tick; }
  }
  frame(milliseconds: number) {
    if (this.activeTick !== null && this.endTick === null && this.frames.length < 18000) this.frames.push(milliseconds);
  }
  abort(reason: string) {
    if (this.endTick === null) { this.endTick = this.tick; this.outcome = 'aborted'; this.abortReason = reason; }
  }
  read() {
    return { profile: this.profile, weapon: this.weapon, start: this.start, end: this.end,
      outcome: this.outcome, abortReason: this.abortReason, activeStartTick: this.activeTick,
      activeSeconds: this.activeTick === null ? 0 : ((this.endTick ?? this.tick) - this.activeTick) / 60,
      totalSeconds: (this.endTick ?? this.tick) / 60, attacks: this.attacks, damageDealt: this.damageDealt,
      damageTaken: { ...this.damageTaken }, phases: [...this.phases], framesMs: distribution(this.frames),
      simulationMs: distribution(this.simulationMs), samplesCapped: this.frames.length === 18000 || this.simulationMs.length === 18000,
      eventsTruncated: this.eventsTruncated,
      whipHits: null, whipMisses: null, dashUses: null, countersAfterDodge: null,
      unavailable: 'Whip/dash/counter rules do not exist in A0. Camera occlusion requires manual observation.' };
  }
}

export function installAdventureLab(host: HTMLElement, initial: AdventureProfile, restart: () => void,
  environment: () => unknown) {
  void import('./adventureLab.css');
  const panel = document.createElement('section'); panel.id = 'adventure-lab';
  panel.setAttribute('aria-label', 'Adventure Vergleichslabor');
  panel.innerHTML = `<strong>A/B · STEINWÄCHTER</strong><small>Beide Profile: bisherige Kampfregeln</small>
    <label>Nächstes Profil <select id="lab-profile"><option value="legacy">Legacy</option><option value="prototype">Prototype</option></select></label>
    <label>Startwaffe <select id="lab-weapon"><option value="arc">Arc Lash</option><option value="pulse">Pulse Repeater</option></select></label>
    <button id="lab-start" type="button">Bossversuch starten</button>
    <button id="lab-export" type="button">Messdaten speichern</button><output id="lab-status">Bereit · Auswahl gilt beim nächsten Start</output>`;
  host.append(panel);
  const profile = panel.querySelector<HTMLSelectElement>('#lab-profile')!;
  const weapon = panel.querySelector<HTMLSelectElement>('#lab-weapon')!;
  const status = panel.querySelector<HTMLOutputElement>('#lab-status')!;
  profile.value = initial;
  const abort = new AbortController(), options = { signal: abort.signal };
  let measurement: LabMeasurement | null = null, running = false, restartMs = 0, attempts = 0;
  let droppedStart = 0, dropped = 0, lastResources: unknown = null;
  const history: ReturnType<LabMeasurement['read']>[] = [];
  const read = () => ({ reference: LAB_REFERENCE, build: __ADVENTURE_BUILD__, environment: environment(),
    running, attempts, restartMs, droppedTicks: dropped, resources: lastResources,
    current: measurement?.read() ?? null, history: [...history], historyLimit: 20 });
  // Keyboard navigation in the form must not also move/jump the player.
  for (const name of ['keydown', 'keyup']) panel.addEventListener(name, event => event.stopPropagation(), options);
  panel.querySelector('#lab-start')!.addEventListener('click', restart, options);
  panel.querySelector('#lab-export')!.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(read(), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `adventure-a0-${attempts}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, options);
  return {
    get running() { return running; },
    selection: () => ({ profile: profile.value === 'prototype' ? 'prototype' as const : 'legacy' as const,
      weapon: weapon.value === 'pulse' ? 'pulse' as const : 'arc' as const }),
    begin(start: unknown, elapsed: number, clockDropped: number, startRunning: boolean) {
      if (running && measurement) { measurement.abort('restart'); history.push(measurement.read()); if (history.length > 20) history.shift(); }
      const selected = this.selection(); measurement = new LabMeasurement(start, selected.profile, selected.weapon);
      running = startRunning; if (running) attempts++;
      restartMs = elapsed; droppedStart = clockDropped; dropped = 0;
      status.textContent = `${running ? 'Läuft' : 'Bereit'} · ${selected.profile} · ${selected.weapon}`;
    },
    step: (before: PveSnapshot, after: PveSnapshot, player: Snapshot, attacked: boolean, milliseconds: number) => {
      if (running) measurement?.step(before, after, player, attacked, milliseconds);
      if (before.outcome === 'running' && after.outcome !== 'running' && measurement) {
        const result = measurement.read();
        status.textContent = `${after.outcome === 'victory' ? 'Sieg' : 'Niederlage'} · ${result.profile} · ${result.weapon} · ${result.activeSeconds.toFixed(2)} s`;
      }
    },
    frame(milliseconds: number, clockDropped: number, resources: unknown) {
      if (running) measurement?.frame(milliseconds);
      dropped = clockDropped - droppedStart; lastResources = resources;
    },
    read,
    dispose: () => { abort.abort(); panel.remove(); },
  };
}
