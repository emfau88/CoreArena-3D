import { AdventureFight } from '../core/adventureFight';

export type AdventureProfile = 'legacy' | 'prototype';
export interface AdventureEntry {
  readonly profile: AdventureProfile;
  readonly lab: boolean;
  readonly exploration: boolean;
  readonly complement?:boolean;
  readonly environment?:'reference'|'outpost-test';
}

/** The only URL boundary for Adventure variants. Other modes retain their routes. */
export function resolveAdventureEntry(params: URLSearchParams, allowLab: boolean, allowPrototype=allowLab, allowEnvironment=false): AdventureEntry | null {
  if (params.get('mode') !== 'pve' || params.get('adventure') !== '1'
    || (params.get('level') ?? 'stone') !== 'stone') return null;
  const exploration = params.get('explore') === '1';
  const lab = allowLab && !exploration && params.get('lab') === 'boss';
  const profile=allowPrototype&&!exploration&&params.get('combat')==='prototype'?'prototype':'legacy';
  const environment=allowEnvironment && profile==='prototype' && !params.has('lab')
    ? params.get('environment')==='outpost-test'?'outpost-test':'reference' : undefined;
  return { lab, exploration, profile,...(profile==='prototype'?{complement:params.get('loadout')==='pulse'}:{}),
    ...(environment?{environment}:{}) };
}

/** Explicit profile factory; default routes and all shared constants stay Legacy. */
export function createAdventureVariant(id: AdventureProfile,complement=false,meleeOnly=false) {
  return { id, rules: id==='prototype'?'prototype-a7':'legacy-a0', fight: new AdventureFight(id==='prototype',complement,meleeOnly) };
}
