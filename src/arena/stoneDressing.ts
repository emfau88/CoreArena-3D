import { ADVENTURE_MISSION } from './adventureMission';
/** Physical footprints of the abandoned consoles. Plants stay small and passable. */
export const STONE_CONSOLES = [
  { id: 'arrival-console', x: -12.8, z: 35.2, variant: 0, yaw: -Math.PI / 2 },
  { ...ADVENTURE_MISSION.console, variant: 1, yaw: -Math.PI / 2 },
  { id: 'gate-console-west', x: -10.8, z: -40.2, variant: 0, yaw: -Math.PI / 2 },
  { id: 'gate-console-east', x: 10.8, z: -40.2, variant: 1, yaw: Math.PI / 2 },
] as const;
export const CONSOLE_FOOTPRINT = { x: 1.3, y: 1.65, z: 2.4 } as const;
