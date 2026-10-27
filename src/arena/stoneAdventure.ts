import type { ArenaBox, ArenaDefinition } from './arena';
import type { PickupDefinition } from '../core/pickups';
import type { Vec3 } from '../core/types';

// Shared by desktop and touch; the old arena keeps its existing height routes.
export const STONE_ADVENTURE_JUMP = { jumpSpeed: 11.8, gravity: 34 } as const;

interface Room { id: string; name: string; left: number; right: number; back: number; front: number }
// A-H are places within three generous courts, not eight walled rooms.
// The user rejected the first narrow, winding footprint during L1.1.
export const STONE_ROOMS: readonly Room[] = [
  { id: 'C', name: 'Waffenfund', left: -7, right: 3, back: 16, front: 21 },
  { id: 'D', name: 'Seitenterrasse', left: -16, right: -7, back: -2, front: 6 },
  { id: 'H', name: 'Nordtor', left: -7, right: 7, back: -43, front: -37 },
  { id: 'F', name: 'Siegelplatz', left: -5, right: 5, back: -17.5, front: -12 },
  { id: 'A', name: 'Ankunft', left: -16, right: 16, back: 29, front: 38 },
  { id: 'B', name: 'Ruinenhof', left: -16, right: 16, back: 16, front: 29 },
  { id: 'E', name: 'Innerer Hof', left: -18, right: 18, back: -12, front: 12 },
  { id: 'G', name: 'Wächterhof', left: -18, right: 18, back: -42, front: -16 },
];
export const stoneRoomAt = (p: Vec3): Room | undefined => STONE_ROOMS.find(r =>
  p.x > r.left && p.x < r.right && p.z > r.back && p.z < r.front);
const block = (id: string, x: number, z: number, w: number, h: number, d: number, planted = false): ArenaBox =>
  ({ id, center: { x, y: h/2, z }, size: { x: w, y: h, z: d }, material: 'stone', planted });
const floor = (id: string, x: number, z: number, w: number, d: number): ArenaBox =>
  ({ id, center: { x, y: -.4, z }, size: { x: w, y: .8, z: d }, material: 'floor' });

// 32x22 m, 36x24 m and 36x26 m courts. Connections are ten metres wide
// and only four metres long; the central route has no corners or slalom cover.
export const STONE_ADVENTURE: ArenaDefinition = {
  spawn: { x: 0, y: .06, z: 33 },
  boxes: [
    floor('floor-entry',0,27,32,22), floor('floor-middle',0,0,36,24), floor('floor-boss',0,-29,36,26),
    floor('floor-link-south',0,14,10,4.2), floor('floor-link-north',0,-14,10,4.2),
    block('entry-south',0,38,32,.9,.5),
    block('entry-west',-16,27,.5,1.3,22), block('entry-east',16,27,.5,1.3,22),
    block('entry-north-west',-10.5,16,11,1.3,.5), block('entry-north-east',10.5,16,11,1.3,.5),
    block('south-link-west',-5,14,.5,.85,4), block('south-link-east',5,14,.5,.85,4),
    block('middle-south-west',-11.5,12,13,.85,.5), block('middle-south-east',11.5,12,13,.85,.5),
    block('middle-west',-18,0,.5,1.3,24), block('middle-east',18,0,.5,1.3,24),
    block('middle-north-west',-11.5,-12,13,1.3,.5), block('middle-north-east',11.5,-12,13,1.3,.5),
    block('north-link-west',-5,-14,.5,.85,4), block('north-link-east',5,-14,.5,.85,4),
    block('boss-south-west',-11.5,-16,13,.85,.5), block('boss-south-east',11.5,-16,13,.85,.5),
    block('boss-west',-18,-29,.5,1.3,26), block('boss-east',18,-29,.5,1.3,26),
    block('boss-north-west',-11.5,-42,13,1.6,.5), block('boss-north-east',11.5,-42,13,1.6,.5),
    block('entry-cover-west',-8,25,3,1.2,2,true), block('entry-cover-east',8,22,3,1.2,2,true),
    block('side-terrace',-11.5,2,9,1.1,8),
    block('side-step-low',-4.45,2,1.2,.28,4), block('side-step-mid',-5.45,2,1.2,.55,4),
    block('side-step-high',-6.5,2,1.1,.82,4),
    block('court-cover-east',7,4.5,3,1.2,2,true), block('court-cover-back',-6,-6,3,1.4,2,true),
    block('thrower-plinth',11,-7,6,.8,5),
    block('thrower-step-low',11,-2.8,4,.27,1.2), block('thrower-step-high',11,-3.85,4,.54,1.2),
    block('boss-pillar-west',-8,-31,2.4,2.2,2.4,true), block('boss-pillar-east',8,-26,2.4,2.2,2.4,true),
    block('dormant-warden',0,-29,2.6,1.15,2.6),
    block('boss-health-plateau',-12,-23,6,1.1,5),
    block('boss-step-low',-6.45,-23,1.2,.28,3.5), block('boss-step-mid',-7.45,-23,1.2,.55,3.5),
    block('boss-step-high',-8.5,-23,1.1,.82,3.5),
    { ...block('north-gate',0,-42,10,2.8,.4), material:'metal' },
  ],
};
const loot = (id: string, kind: PickupDefinition['kind'], x: number, z: number, amount: number,
  surface: string, y = 0): PickupDefinition => ({ id, kind, position: { x,y,z }, surface, amount });
export const STONE_ADVENTURE_PICKUPS: readonly PickupDefinition[] = [
  loot('adventure-pulse','pulse',-3,18.5,54,'floor-entry'),
  loot('side-health','health',-13.5,4,35,'side-terrace',1.1),
  loot('side-armor','armor',-13.5,0,30,'side-terrace',1.1),
  loot('side-ammo','ammo',-9,-.4,27,'side-terrace',1.1),
  loot('court-ammo','ammo',11,6.5,27,'floor-middle'),
  loot('boss-ammo-west','ammo',-13,-37,18,'floor-boss'),
  loot('boss-ammo-east','ammo',13,-20,18,'floor-boss'),
  loot('boss-health','health',-12,-23,35,'boss-health-plateau',1.1),
];
