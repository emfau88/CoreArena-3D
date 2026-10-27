import type { ArenaBox, ArenaDefinition } from './arena';
import { PVE_ARENA, PVE_PICKUPS } from './pve';
import { MONSTER, PVE_RULES, type MonsterKind, type EncounterRules } from '../core/pve';

export interface CampaignLevel {
  readonly id: string; readonly name: string; readonly enemy: string; readonly kind: MonsterKind;
  readonly intro: string; readonly victory: string; readonly hint: string;
  readonly arena: ArenaDefinition; readonly rules: EncounterRules;
  readonly monster: typeof MONSTER; readonly pickups: typeof PVE_PICKUPS;
}
const block = (id: string, x: number, z: number, w: number, h: number, d: number, planted = false): ArenaBox =>
  ({ id, center: { x, y: h / 2, z }, size: { x: w, y: h, z: d }, material: 'stone', planted });
const boundary = PVE_ARENA.boxes.filter(b => ['floor', 'north', 'south', 'west', 'east'].includes(b.id));
const arena = (boxes: ArenaBox[]): ArenaDefinition => ({ spawn: PVE_ARENA.spawn, boxes: [...boundary, ...boxes] });

export const CAMPAIGN: readonly CampaignLevel[] = [
  { id: 'stone', name: 'Verfallener Steinhof', enemy: 'Der Steinwächter', kind: 'stone',
    intro: 'Unter den Ruinen erwacht der alte Kern. Sein Wächter versperrt den Abstieg. Brich das erste Siegel.',
    victory: 'Das Steinsiegel zerbricht. Kaltes Licht strömt aus einem Spalt: Der Weg in die Kristallkluft ist offen.',
    hint: 'Schockwelle überspringen oder Deckung nutzen. Den Kreis vor dem Bodenausbruch verlassen.',
    rules: PVE_RULES, monster: MONSTER, pickups: PVE_PICKUPS,
    arena: arena([block('ruin-west', -13, -8, 8, 2.2, 4, true), block('ruin-east', 14, -8, 6, 3.4, 4, true),
      block('pillar-left', -7, 1, 2, 2.4, 2, true), block('pillar-right', 7, 1, 2, 2.4, 2, true),
      block('broken-wall', -15, 5, 4, 1.1, 2, true), block('altar', 0, -10, 6, 0.8, 3)]) },
  { id: 'frost', name: 'Kristallkluft', enemy: 'Die Frostspinne', kind: 'frost',
    intro: 'Die Kluft bewahrt das zweite Siegel im Eis. Eine Kristalljägerin spürt jeden Schritt auf dem gefrorenen Boden.',
    victory: 'Das Eis bricht. Tief unter der Kluft schlägt ein glühendes Herz. Nur das letzte Siegel hält es noch zurück.',
    hint: 'Dem Fächer aus drei Eissplittern seitlich ausweichen oder darüber springen. Kristallkreise rechtzeitig verlassen.',
    rules: { ...PVE_RULES, bossHp: 650, chaseSpeed: 3.3, stopDistance: 5.5, waveSpeed: 0.16, waveDamage: 50, waveWarning: 75 },
    monster: { ...MONSTER, id: 'frost-spider' }, pickups: PVE_PICKUPS,
    arena: arena([block('ice-west', -11, -5, 4, 3, 6), block('ice-east', 12, -1, 4, 2.7, 5),
      block('ice-cover', -8, 5, 2.8, 1.8, 2.8), block('ice-back', 6, -10, 6, 2, 3), block('ice-edge', -17, -10, 4, 2, 3)]) },
  { id: 'ember', name: 'Glutschmiede', enemy: 'Der Glutwurm', kind: 'ember',
    intro: 'Die Schmiede nährt den erwachten Kern. Ihr letzter Hüter steigt aus der Schlacke. Lösche sein Feuer und beruhige den Kern.',
    victory: 'Die drei Siegel sind gebrochen. Der Kern verstummt, und zum ersten Mal seit Jahrhunderten kehrt Ruhe in die Ruinen ein.',
    hint: 'Feueratem: seitlich aus dem markierten Fächer oder hinter Deckung. Springen schützt nicht. Glutkreise verlassen.',
    rules: { ...PVE_RULES, bossHp: 700, chaseSpeed: 2.9, stopDistance: 6, waveWarning: 105, waveTicks: 75, waveDamage: 70, eruptionWarning: 90, eruptionRadius: 3.2 },
    monster: { ...MONSTER, id: 'ember-wyrm' }, pickups: PVE_PICKUPS,
    arena: arena([block('forge-left', -9, 0, 3, 3, 6), block('forge-right', 9, 3, 3, 2.6, 6),
      block('anvil', 0, -10, 7, 2, 3), block('slag-west', -16, -8, 5, 1.4, 4), block('slag-east', 16, -8, 5, 1.4, 4)]) },
];
export function campaignLevel(id: string | null): CampaignLevel { return CAMPAIGN.find(level => level.id === id) ?? CAMPAIGN[0]!; }
export function nextCampaignLevel(id: string): CampaignLevel | null {
  const index = CAMPAIGN.findIndex(level => level.id === id);
  return index >= 0 ? CAMPAIGN[index + 1] ?? null : null;
}
