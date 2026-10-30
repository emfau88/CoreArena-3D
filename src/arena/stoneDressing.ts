import { ADVENTURE_MISSION } from './adventureMission';
/** Physical footprints of the abandoned consoles. Plants stay small and passable. */
export const STONE_CONSOLES = [
  { id: 'arrival-console', x: -12.8, z: 35.2, variant: 0, yaw: -Math.PI / 2 },
  { ...ADVENTURE_MISSION.console, variant: 1, yaw: -Math.PI / 2 },
  { id: 'gate-console-west', x: -10.8, z: -40.2, variant: 0, yaw: -Math.PI / 2 },
  { id: 'gate-console-east', x: 10.8, z: -40.2, variant: 1, yaw: Math.PI / 2 },
] as const;
export const CONSOLE_FOOTPRINT = { x: 1.3, y: 1.65, z: 2.4 } as const;

/** A few functional props inside the existing courts. The renderer uses these same solid bounds. */
export const OUTPOST_PROPS = [
  {id:'outpost-charger',kind:'charger',x:-7,z:34,y:0,width:1,height:1.6,depth:1.1},
  {id:'outpost-cargo',kind:'cargo',x:7,z:32,y:0,width:3,height:.9,depth:2.2},
  {id:'outpost-weapon-bench',kind:'weapon',x:-6,z:18.5,y:0,width:1.4,height:1,depth:3},
  {id:'outpost-repair-bench',kind:'repair',x:6,z:-8,y:0,width:3.2,height:1.15,depth:2},
  {...ADVENTURE_MISSION.reserve,kind:'reserve'},
  {id:'outpost-capacitor-west',kind:'capacitor',x:-8,z:-39,y:0,width:1.6,height:2.3,depth:1.6},
  {id:'outpost-capacitor-east',kind:'capacitor',x:8,z:-39,y:0,width:1.6,height:2.3,depth:1.6},
] as const;
