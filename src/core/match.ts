export type Team = 'blue' | 'red';
export interface ActorSeed { readonly id: string; readonly team: Team }
export interface Life extends ActorSeed {
  readonly life: number; readonly hp: number; readonly armor: number;
  readonly alive: boolean; readonly respawnTicks: number; readonly protectionTicks: number;
}
export interface Damage { readonly target: string; readonly source?: string; readonly amount: number }
export interface MatchSnapshot {
  readonly phase: 'ready' | 'running' | 'ended'; readonly tick: number; readonly remainingTicks: number;
  readonly scores: Readonly<Record<Team, number>>; readonly winner: Team | 'draw' | null;
  readonly reason: 'time' | 'score' | null; readonly actors: Readonly<Record<string, Life>>;
}
export const MATCH_RULES = Object.freeze({ durationTicks: 120 * 60, scoreLimit: 10,
  hp: 100, initialArmor: 50, respawnArmor: 0, respawnTicks: 4 * 60, protectionTicks: 2 * 60, damage: 35 });

/** Numeric rules only. Damage in a tick is resolved as one batch before deciding the result. */
export class ArenaMatch {
  private state: MatchSnapshot;
  constructor(private readonly seeds: readonly ActorSeed[]) { this.state = this.fresh('ready'); }
  private fresh(phase: MatchSnapshot['phase']): MatchSnapshot {
    return { phase, tick: 0, remainingTicks: MATCH_RULES.durationTicks, scores: { blue: 0, red: 0 }, winner: null, reason: null,
      actors: Object.fromEntries(this.seeds.map((seed) => [seed.id, { ...seed, life: 1, hp: MATCH_RULES.hp,
        armor: MATCH_RULES.initialArmor, alive: true, respawnTicks: 0, protectionTicks: MATCH_RULES.protectionTicks }])) };
  }
  snapshot(): MatchSnapshot { return this.state; }
  start(): void { this.state = this.fresh('running'); }
  restore(id: string, kind: 'hp' | 'armor', amount: number): number {
    const actor = this.state.actors[id];
    if (this.state.phase !== 'running' || !actor?.alive) return 0;
    const accepted = Math.min(Math.max(0, amount), 100 - actor[kind]);
    this.state = { ...this.state, actors: { ...this.state.actors, [id]: { ...actor, [kind]: actor[kind] + accepted } } };
    return accepted;
  }
  step(damage: readonly Damage[] = [], attacks: readonly string[] = []): void {
    if (this.state.phase !== 'running') return;
    const actors: Record<string, Life> = {};
    for (const [id, actor] of Object.entries(this.state.actors)) {
      actors[id] = actor.alive ? { ...actor, protectionTicks: Math.max(0, actor.protectionTicks - 1) }
        : actor.respawnTicks > 1 ? { ...actor, respawnTicks: actor.respawnTicks - 1 }
        : { ...actor, life: actor.life + 1, hp: MATCH_RULES.hp, armor: MATCH_RULES.respawnArmor,
          alive: true, respawnTicks: 0, protectionTicks: MATCH_RULES.protectionTicks };
    }
    for (const id of attacks) if (actors[id]?.alive) actors[id] = { ...actors[id], protectionTicks: 0 };
    // Simultaneous attacks remain valid even if their shooter dies earlier in this batch.
    const activeSources = new Set(Object.values(actors).filter((actor) => actor.alive).map((actor) => actor.id));
    const scores = { ...this.state.scores };
    for (const hit of damage) {
      const victim = actors[hit.target];
      const source = hit.source ? actors[hit.source] : undefined;
      if (!victim?.alive || victim.protectionTicks > 0 || !Number.isFinite(hit.amount) || hit.amount <= 0) continue;
      if (hit.source && (!source || !activeSources.has(hit.source) || source.team === victim.team)) continue;
      const armor = Math.max(0, victim.armor - hit.amount);
      const hp = Math.max(0, victim.hp - Math.max(0, hit.amount - victim.armor));
      const alive = hp > 0;
      actors[hit.target] = { ...victim, hp, armor, alive, respawnTicks: alive ? 0 : MATCH_RULES.respawnTicks, protectionTicks: 0 };
      if (!alive && source) scores[source.team]++;
    }
    const tick = this.state.tick + 1;
    const remainingTicks = Math.max(0, MATCH_RULES.durationTicks - tick);
    const reason = Math.max(scores.blue, scores.red) >= MATCH_RULES.scoreLimit ? 'score' : remainingTicks === 0 ? 'time' : null;
    this.state = { phase: reason ? 'ended' : 'running', tick, remainingTicks, scores, actors, reason,
      winner: reason ? scores.blue === scores.red ? 'draw' : scores.blue > scores.red ? 'blue' : 'red' : null };
  }
}
