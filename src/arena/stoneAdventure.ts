import type { ArenaBox, ArenaDefinition } from './arena';
import type { PickupDefinition } from '../core/pickups';
import type { Vec3 } from '../core/types';
import { MONSTER, PVE_RULES } from '../core/pve';
import { STONE_CONSOLES, CONSOLE_FOOTPRINT } from './stoneDressing';

// Adventure balance only; simulation, attack animation and feedback share these timings.
export const ADVENTURE_BOSS_RULES = Object.freeze({ ...PVE_RULES,
  meleeWarning:21, meleeRecovery:15, meleeCooldown:39, recoveryTicks:48, chaseSpeed:3.1,
  elevatedChaseTicks:60 });

// Shared by desktop and touch; the old arena keeps its existing height routes.
export const STONE_ADVENTURE_JUMP = { jumpSpeed: 11.8, gravity: 34 } as const;
export const ADVENTURE_CHECKPOINT = { x:0, y:.06, z:-14 } as const;

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
const stoneLayout: ArenaDefinition = {
  spawn: { x: 0, y: .06, z: 33 },
  boxes: [
    floor('floor-entry',0,27,32,22), floor('floor-middle',0,0,36,24), floor('floor-boss',0,-29,36,26),
    floor('floor-link-south',0,14,10,4.2), floor('floor-link-north',0,-14,10,4.2),
    floor('floor-exit',0,-45,10,8),
    block('exit-west',-5,-45.5,.5,1.3,7), block('exit-east',5,-45.5,.5,1.3,7),
    block('exit-north',0,-49,10,1.3,.5),
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

// Shared corner posts close the joints between perpendicular walls of different
// heights. Their visible footprint is also solid, including at corridor mouths.
const wallEnds = new Map<string, { x:number; z:number; height:number }>();
for(const wall of stoneLayout.boxes.filter(b=>b.material==='stone' && Math.min(b.size.x,b.size.z)===.5)) {
  const alongX=wall.size.x>wall.size.z;
  for(const sign of [-1,1]) {
    const x=wall.center.x+(alongX?sign*wall.size.x/2:0);
    const z=wall.center.z+(alongX?0:sign*wall.size.z/2),key=`${x}:${z}`;
    wallEnds.set(key,{x,z,height:Math.max(wallEnds.get(key)?.height??0,wall.center.y+wall.size.y/2)});
  }
}
export const STONE_ADVENTURE: ArenaDefinition = { ...stoneLayout, boxes:[...stoneLayout.boxes,
  ...[...wallEnds.values()].map(({x,z,height},i)=>block(`wall-joint-${i}`,x,z,.78,height+.14,.78)),
  ...STONE_CONSOLES.map(({id,x,z})=>block(id,x,z,CONSOLE_FOOTPRINT.x,CONSOLE_FOOTPRINT.y,CONSOLE_FOOTPRINT.z)),
] };
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
export const ADVENTURE_BOSS_PICKUPS = STONE_ADVENTURE_PICKUPS.filter(p=>p.id.startsWith('boss-')).map(p=>p.id);

export const ADVENTURE_BOSS = { ...MONSTER, center: {x:0,y:1.85,z:-29} };
export const ADVENTURE_RUNNERS = [
  { id:'courtyard-runner', center:{x:2,y:.85,z:24}, radius:.7, level:'L1', floor:'floor-entry',
    zone:{left:-15,right:15,back:16,front:29}, territory:{left:-15,right:15,back:17,front:37} },
  { id:'inner-runner', center:{x:2,y:.85,z:-1}, radius:.7, level:'L1', floor:'floor-middle',
    zone:{left:-17,right:17,back:-12,front:12} },
] as const;
export const STONE_ADVENTURE_COMBAT: ArenaDefinition = { ...STONE_ADVENTURE,
  // At the actual threshold. The visible seal continues above the low side walls.
  boxes:[...STONE_ADVENTURE.boxes,block('boss-entry-gate',0,-16,37,4.4,.4)],
  targets:[ADVENTURE_BOSS,...ADVENTURE_RUNNERS],
};
