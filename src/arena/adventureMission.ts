/** Fixed landmarks for this one mission, shared by collision, interaction and presentation. */
export const ADVENTURE_MISSION = {
  drone: { id:'mission-drone', x:-3, z:34, width:1.8, height:1.1, depth:1.6 },
  console: { id:'court-console', x:-3, z:-8, reach:2.8 },
  relay: { id:'mission-relay', x:-3, z:-39, width:2.2, height:2.8, depth:2.2, reach:3.1 },
} as const;
