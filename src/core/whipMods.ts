export const WHIP_MODS = {
  base: {name:'Basis', description:'Ausgewogener Seitenschwung. 4,8 m Reichweite und kurze Erholung.'},
  hook: {name:'Rückhaken', description:'Hält beim Rücklauf die Reichweite. Mehr Schaden hinten, längere Bindung an den Schlag.'},
  fork: {name:'Gabelspitze', description:'Zwei seitlich gespreizte Spitzen. Breitere Abdeckung bei kürzeren 3,8 m Reichweite.'},
} as const;
export type WhipMod = keyof typeof WHIP_MODS;
export function resolveWhipMod(value:string|null):WhipMod {
  return value==='hook'||value==='fork'?value:'base';
}
