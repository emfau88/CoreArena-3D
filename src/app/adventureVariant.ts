import { AdventureFight } from '../core/adventureFight';

export type AdventureProfile = 'legacy' | 'prototype';
export type AdventureEnvironment = 'reference' | 'outpost-test' | 'stone-yard' | 'rocky-bank' | 'retaining-corner' | 'warden-ravine';
export interface AdventureEntry {
  readonly profile: AdventureProfile;
  readonly lab: boolean;
  readonly exploration: boolean;
  readonly complement?:boolean;
  readonly environment?: AdventureEnvironment;
  readonly modTrial?:boolean;
}

/** The only URL boundary for Adventure variants. Other modes retain their routes. */
export function resolveAdventureEntry(params: URLSearchParams, allowLab: boolean, allowPrototype=allowLab, allowEnvironment=false): AdventureEntry | null {
  if (params.get('mode') !== 'pve' || params.get('adventure') !== '1'
    || (params.get('level') ?? 'stone') !== 'stone') return null;
  const exploration = params.get('explore') === '1';
  const lab = allowLab && !exploration && params.get('lab') === 'boss';
  const profile=allowPrototype&&!exploration&&params.get('combat')==='prototype'?'prototype':'legacy';
  let environment: AdventureEnvironment | undefined;
  if (allowEnvironment && profile === 'prototype' && !params.has('lab')) {
    const requested = params.get('environment');
    environment = requested === 'outpost-test' || requested === 'stone-yard' || requested === 'rocky-bank'
      || requested === 'retaining-corner' || requested === 'warden-ravine' ? requested : 'reference';
  }
  return { lab, exploration, profile,...(profile==='prototype'?{complement:params.get('loadout')==='pulse'}:{}),
    ...(profile==='prototype'&&!lab&&params.get('trial')==='mods'?{modTrial:true}:{}),
    ...(environment?{environment}:{}) };
}

/** Explicit profile factory; default routes and all shared constants stay Legacy. */
export function createAdventureVariant(id: AdventureProfile,complement=false,meleeOnly=false) {
  return { id, rules: id==='prototype'?'prototype-a7':'legacy-a0', fight: new AdventureFight(id==='prototype',complement,meleeOnly) };
}
