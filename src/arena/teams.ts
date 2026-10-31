import { M1_ARENA } from './arena';
import { BOT_SPAWN, actorCenter } from '../core/bot';
import type { ActorSeed } from '../core/match';
import type { Vec3 } from '../core/types';

export type ArenaMode = 'training' | 'duel' | 'teams';
export interface ArenaFighter extends ActorSeed { readonly spawn: Vec3; readonly facing: number }

// Arena-only roster. PvE encounters and Adventure keep their own actors and rules.
export const ARENA_FIGHTERS: readonly ArenaFighter[] = [
  { id: 'player', team: 'blue', spawn: M1_ARENA.spawn, facing: 0 },
  { id: 'rival', team: 'red', spawn: BOT_SPAWN, facing: Math.PI },
  { id: 'ally', team: 'blue', spawn: { x: -10, y: 0.06, z: 2 }, facing: 0 },
  { id: 'rival-2', team: 'red', spawn: { x: -3, y: 0.06, z: 9 }, facing: Math.PI },
];
export const fighterTarget = (fighter: ArenaFighter) => ({
  id: fighter.id, center: actorCenter(fighter.spawn), radius: 0.6, level: fighter.team.toUpperCase(),
});
export function arenaRoster(mode: ArenaMode): readonly ActorSeed[] {
  return mode === 'teams' ? ARENA_FIGHTERS : mode === 'duel' ? ARENA_FIGHTERS.slice(0, 2)
    : [{ id: 'player', team: 'blue' }, ...(M1_ARENA.targets ?? []).map(target => ({ id: target.id, team: 'red' as const }))];
}
