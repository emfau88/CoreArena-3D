import { AdventureFight } from '../core/adventureFight';

export type AdventureProfile = 'legacy' | 'prototype';
export interface AdventureEntry {
  readonly profile: AdventureProfile;
  readonly lab: boolean;
  readonly exploration: boolean;
}

/** The only URL boundary for Adventure variants. Other modes retain their routes. */
export function resolveAdventureEntry(params: URLSearchParams, allowLab: boolean): AdventureEntry | null {
  if (params.get('mode') !== 'pve' || params.get('adventure') !== '1'
    || (params.get('level') ?? 'stone') !== 'stone') return null;
  const exploration = params.get('explore') === '1';
  const lab = allowLab && !exploration && params.get('lab') === 'boss';
  return { lab, exploration, profile: lab && params.get('combat') === 'prototype' ? 'prototype' : 'legacy' };
}

/** A0 deliberately shares the existing rules, never shared mutable encounter state. */
export function createAdventureVariant(id: AdventureProfile) {
  return { id, rules: 'legacy-a0' as const, fight: new AdventureFight() };
}
