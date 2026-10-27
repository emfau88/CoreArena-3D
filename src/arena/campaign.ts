import type { ArenaBox, ArenaDefinition } from './arena';
import { PVE_ARENA } from './pve';
import type { PickupDefinition } from '../core/pickups';
import { MONSTER, PVE_RULES, type MonsterKind, type EncounterRules } from '../core/pve';

export interface CampaignLevel {
  readonly id: string; readonly name: string; readonly enemy: string; readonly kind: MonsterKind;
  readonly intro: string; readonly victory: string; readonly hint: string;
  readonly supplies: string;
  readonly arena: ArenaDefinition; readonly rules: EncounterRules;
  readonly monster: typeof MONSTER; readonly pickups: readonly PickupDefinition[];
}
const block = (id: string, x: number, z: number, w: number, h: number, d: number, planted = false): ArenaBox =>
  ({ id, center: { x, y: h / 2, z }, size: { x: w, y: h, z: d }, material: 'stone', planted });
const boundary = PVE_ARENA.boxes.filter(b => ['floor', 'north', 'south', 'west', 'east'].includes(b.id));
const arena = (boxes: ArenaBox[]): ArenaDefinition => ({ spawn: PVE_ARENA.spawn, boxes: [...boundary, ...boxes] });
const loot = (id: string, kind: PickupDefinition['kind'], x: number, z: number, amount: number,
  y = 0, surface = 'floor'): PickupDefinition => ({ id, kind, position: { x, y, z }, surface, amount });

export const CAMPAIGN: readonly CampaignLevel[] = [
  { id: 'stone', name: 'Verfallener Steinhof', enemy: 'Der Steinwächter', kind: 'stone',
    intro: 'Unter den Ruinen erwacht der alte Kern. Sein Wächter versperrt den Abstieg. Brich das erste Siegel.',
    victory: 'Das Steinsiegel zerbricht. Kaltes Licht strömt aus einem Spalt: Der Weg in die Kristallkluft ist offen.',
    hint: 'Schockwelle überspringen oder Deckung nutzen. Den Kreis vor dem Bodenausbruch verlassen.',
    supplies: 'Pulse links vom Start. Heilung: links durch den Hof und über die zwei Stufen auf die Westmauer. Munition im Osten.',
    rules: PVE_RULES, monster: MONSTER, pickups: [loot('stone-pulse', 'pulse', -4, 8, 54),
      loot('stone-ammo', 'ammo', 10, 6, 36), loot('stone-health', 'health', -15, 5, 35, 1.1, 'broken-wall'),
      loot('stone-armor', 'armor', 0, -7, 30)],
    arena: arena([block('ruin-west', -13, -8, 8, 2.2, 4, true), block('ruin-east', 14, -8, 6, 3.4, 4, true),
      block('pillar-left', -7, 1, 2, 2.4, 2, true), block('pillar-right', 7, 1, 2, 2.4, 2, true),
      block('broken-wall', -15, 5, 4, 1.1, 2, true), block('altar', 0, -10, 6, 0.8, 3),
      block('healing-step-low', -15, 8.6, 3, 0.35, 1.2), block('healing-step-high', -15, 7.2, 3, 0.7, 1.2),
      block('courtyard-step', 14, 6, 4, 0.8, 3), block('courtyard-terrace', 15, 2, 6, 1.6, 4)]) },
  { id: 'frost', name: 'Kristallkluft', enemy: 'Die Frostspinne', kind: 'frost',
    intro: 'Die Kluft bewahrt das zweite Siegel im Eis. Eine Kristalljägerin spürt jeden Schritt auf dem gefrorenen Boden.',
    victory: 'Das Eis bricht. Tief unter der Kluft schlägt ein glühendes Herz. Nur das letzte Siegel hält es noch zurück.',
    hint: 'Dem Fächer aus drei Eissplittern seitlich ausweichen oder darüber springen. Kristallkreise rechtzeitig verlassen.',
    supplies: 'Pulse rechts vorne. Munition hinter dem westlichen Eisrücken; Heilung auf dem südlichen Eissockel.',
    rules: { ...PVE_RULES, bossHp: 650, chaseSpeed: 3.3, stopDistance: 2.5, waveSpeed: 0.16, waveDamage: 50, waveWarning: 75,
      meleeRange: 3.4, meleeWarning: 27, meleeRecovery: 18, meleeDamage: 16, meleeCooldown: 66 },
    monster: { ...MONSTER, id: 'frost-spider' }, pickups: [loot('frost-pulse', 'pulse', 4, 6, 54),
      loot('frost-ammo', 'ammo', -12, 2, 36), loot('frost-health', 'health', 6, 9, 35, 1.1, 'ice-step'),
      loot('frost-armor', 'armor', 13, -10, 30)],
    arena: arena([block('ice-spine', -9, -2, 3, 2, 14), block('ice-east', 10, 3, 4, 2.3, 6),
      block('ice-step', 6, 9, 4, 1.1, 2), block('ice-back', 7, -8, 10, 1.8, 4), block('ice-edge', -13, 8, 4, 1.1, 3)]) },
  { id: 'ember', name: 'Glutschmiede', enemy: 'Der Glutwurm', kind: 'ember',
    intro: 'Die Schmiede nährt den erwachten Kern. Ihr letzter Hüter steigt aus der Schlacke. Lösche sein Feuer und beruhige den Kern.',
    victory: 'Die drei Siegel sind gebrochen. Der Kern verstummt, und zum ersten Mal seit Jahrhunderten kehrt Ruhe in die Ruinen ein.',
    hint: 'Feueratem: seitlich aus dem markierten Fächer oder hinter Deckung. Springen schützt nicht. Glutkreise verlassen.',
    supplies: 'Pulse rechts hinten. Munition vor dem westlichen Ofen; Heilung auf der östlichen Schlackebühne.',
    rules: { ...PVE_RULES, bossHp: 700, chaseSpeed: 2.9, stopDistance: 2.6, waveWarning: 105, waveTicks: 75, waveDamage: 70, eruptionWarning: 90, eruptionRadius: 3.2,
      meleeRange: 3.8, meleeWarning: 39, meleeDamage: 24 },
    monster: { ...MONSTER, id: 'ember-wyrm' }, pickups: [loot('ember-pulse', 'pulse', 5, 10, 54),
      loot('ember-ammo', 'ammo', -5, -6, 36), loot('ember-health', 'health', 13, 6, 35, 1.1, 'slag-east'),
      loot('ember-armor', 'armor', -16, -8, 30)],
    arena: arena([block('forge-left', -10, -1, 5, 2.2, 8), block('forge-right', 11, -7, 9, 2.4, 4),
      block('anvil', 0, -10, 5, 2, 3), block('slag-west', -14, 8, 4, 1.3, 3), block('slag-east', 13, 6, 5, 1.1, 3)]) },
];
export function campaignLevel(id: string | null): CampaignLevel { return CAMPAIGN.find(level => level.id === id) ?? CAMPAIGN[0]!; }
export function nextCampaignLevel(id: string): CampaignLevel | null {
  const index = CAMPAIGN.findIndex(level => level.id === id);
  return index >= 0 ? CAMPAIGN[index + 1] ?? null : null;
}
