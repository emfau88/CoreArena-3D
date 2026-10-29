import type { AimSolution, DiagnosticShot } from './aim';
import type { Damage } from './match';
import type { Ray, RayHit, RayWorld, Vec3 } from './types';

export type WeaponId = 'arc' | 'pulse';
export const WEAPONS = {
  arc: { name: 'Arc Lash', damage: 35, cooldown: 48, range: 5, coneDegrees: 30, burstTicks: 36, pulseTicks: 8, beams: 5 },
  pulse: { name: 'Pulse Repeater', damage: 10, cooldown: 10, range: 32, speed: 30, radius: 0.08, maxAmmo: 54 },
} as const;
export interface CombatTarget { readonly id: string; readonly center: Vec3; readonly radius: number }
export interface CombatWorld extends RayWorld { sweepBall(ray: Ray, distance: number, radius: number): RayHit | null }
export interface Projectile { readonly id: number; readonly position: Vec3; readonly direction: Vec3; readonly remaining: number }
export interface ArcShot extends DiagnosticShot {
  readonly beams: readonly { end: Vec3; hit: RayHit | null }[];
  readonly targetIds: readonly string[];
}
export interface WeaponSnapshot {
  readonly selected: WeaponId; readonly ownsPulse: boolean; readonly ammo: number;
  readonly projectiles: readonly Projectile[]; readonly lastArc: ArcShot | null;
  readonly impact: { readonly point: Vec3; readonly tick: number; readonly id: string } | null;
}
export const directionTo = (a: Vec3, b: Vec3) => {
  const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  return { distance, direction: { x: (b.x - a.x) / Math.max(distance, 1e-8),
    y: (b.y - a.y) / Math.max(distance, 1e-8), z: (b.z - a.z) / Math.max(distance, 1e-8) } };
};
const along = (origin: Vec3, direction: Vec3, distance: number): Vec3 => ({
  x: origin.x + direction.x * distance, y: origin.y + direction.y * distance, z: origin.z + direction.z * distance,
});

/** Acquire around the shooter, then spread a short fan around that target. Every beam respects 3D cover. */
function arcFan(world: RayWorld, origin: Vec3, manual: AimSolution | null, targets: readonly CombatTarget[], lockedId?: string) {
  const visible = targets.flatMap(target => {
    const line=directionTo(origin,target.center);
    if(line.distance-target.radius>WEAPONS.arc.range) return [];
    const hit=world.raycast({origin,direction:line.direction},WEAPONS.arc.range);
    return hit?.id===target.id ? [{target,hit,line}] : [];
  }).sort((a,b)=>a.hit.distance-b.hit.distance || a.target.id.localeCompare(b.target.id));
  const primary=visible.find(item=>item.target.id===lockedId)??visible[0];
  const forward=primary?.line.direction??(manual ? directionTo(origin,manual.firePoint).direction : {x:0,y:0,z:-1});
  // Start behind any close obstruction; a rotating barrel must never reach through a wall.
  const muzzle=world.raycast({origin,direction:forward},.65) ? origin : along(origin,forward,.65);
  const reach=WEAPONS.arc.range-directionTo(origin,muzzle).distance;
  const cast=(direction:Vec3)=>{
    const hit=world.raycast({origin:muzzle,direction},reach);
    return {end:hit?.point??along(muzzle,direction,reach),hit};
  };
  const halfAngle=WEAPONS.arc.coneDegrees*Math.PI/180;
  const beams=Array.from({length:WEAPONS.arc.beams},(_,i)=>{
    const angle=(i/2-1)*halfAngle,cos=Math.cos(angle),sin=Math.sin(angle);
    return cast({x:forward.x*cos+forward.z*sin,y:forward.y,z:forward.z*cos-forward.x*sin});
  });
  if(primary) {
    beams[2]=cast(directionTo(muzzle,primary.target.center).direction);
    const used=new Set([2]);
    // Two additional guided branches; the outer beams keep the wide silhouette.
    for(const item of visible.filter(item=>item!==primary &&
      item.line.direction.x*forward.x+item.line.direction.y*forward.y+item.line.direction.z*forward.z>=Math.cos(halfAngle)).slice(0,2)) {
      const angle=Math.atan2(item.line.direction.x*forward.z-item.line.direction.z*forward.x,
        item.line.direction.x*forward.x+item.line.direction.z*forward.z);
      const slot=[0,1,3,4].filter(i=>!used.has(i)).sort((a,b)=>Math.abs((a/2-1)*halfAngle-angle)-Math.abs((b/2-1)*halfAngle-angle))[0]!;
      beams[slot]=cast(directionTo(muzzle,item.target.center).direction);used.add(slot);
    }
  }
  const center=beams[2]!,firePoint=primary?.target.center??center.end;
  const target=primary?.hit??center.hit??{id:'arc-forward',point:center.end,normal:{x:0,y:1,z:0},distance:WEAPONS.arc.range};
  const aim:AimSolution={target,firePoint,muzzle,impact:center.hit,end:center.end,blocked:!!center.hit&&!targets.some(t=>t.id===center.hit!.id)};
  return {aim,beams,lockedId:primary?.target.id,
    targetIds:[...new Set(beams.flatMap(beam=>beam.hit && targets.some(t=>t.id===beam.hit!.id)?[beam.hit.id]:[]))]};
}

export class Combat {
  constructor(private readonly source = 'player') {}
  private selected: WeaponId = 'arc';
  private ownsPulse = false;
  private ammo = 0;
  private next: Record<WeaponId, number> = { arc: 0, pulse: 0 };
  private sequence = 0;
  private projectiles: Projectile[] = [];
  private lastArc: ArcShot | null = null;
  private burst: { tick:number; sequence:number; lockedId?:string } | null = null;
  private impact: WeaponSnapshot['impact'] = null;
  snapshot(): WeaponSnapshot { return { selected: this.selected, ownsPulse: this.ownsPulse, ammo: this.ammo,
    projectiles: this.projectiles, lastArc: this.lastArc, impact: this.impact }; }
  select(id: WeaponId): void { if (id === 'arc' || (this.ownsPulse && this.ammo > 0)) {
    if(id!==this.selected) this.burst=this.lastArc=null;
    this.selected = id;
  } }
  cycle(): void { this.select(this.selected === 'arc' ? 'pulse' : 'arc'); }
  addAmmo(amount: number, unlock = false): number {
    if (!this.ownsPulse && !unlock) return 0;
    this.ownsPulse = true;
    const accepted = Math.min(Math.max(0, amount), WEAPONS.pulse.maxAmmo - this.ammo);
    this.ammo += accepted; return accepted;
  }
  clearEffects(): void { this.projectiles = []; this.burst = this.lastArc = this.impact = null; }
  reset(): void { this.selected = 'arc'; this.ownsPulse = false; this.ammo = this.sequence = 0;
    this.next = { arc: 0, pulse: 0 }; this.clearEffects(); }
  step(tick: number, firing: boolean, aim: AimSolution | null, camera: Ray | null,
    world: CombatWorld, targets: readonly CombatTarget[], foot?:Vec3): { attacked: boolean; damage: Damage[] } {
    const damage: Damage[] = [];
    let attacked = false;
    const origin=foot?{x:foot.x,y:foot.y+1.15,z:foot.z}:aim?.muzzle;
    if (firing && (this.selected==='arc'?!!origin:!!aim&&!!camera) && tick >= this.next[this.selected]) {
      attacked = true;
      const kind = this.selected;
      this.next[kind] = tick + WEAPONS[kind].cooldown;
      if (kind === 'arc') {
        this.burst={tick,sequence:++this.sequence};
      } else {
        const forward=directionTo(aim!.muzzle,aim!.firePoint).direction;
        this.projectiles.push({ id: ++this.sequence, position: aim!.muzzle, direction: forward, remaining: WEAPONS.pulse.range });
        this.ammo--;
        if (this.ammo === 0) this.selected = 'arc';
      }
    }
    if(this.burst && tick-this.burst.tick>=WEAPONS.arc.burstTicks) this.burst=this.lastArc=null;
    if(this.burst && origin) {
      const fan=arcFan(world,origin,aim??this.lastArc?.aim??null,targets,this.burst.lockedId);
      this.burst.lockedId=fan.lockedId;
      this.lastArc={tick:this.burst.tick,sequence:this.burst.sequence,aim:fan.aim,beams:fan.beams,targetIds:fan.targetIds};
      if((tick-this.burst.tick)%WEAPONS.arc.pulseTicks===0) {
        for(const id of fan.targetIds) damage.push({source:this.source,target:id,amount:WEAPONS.arc.damage/5});
        const hit=fan.beams.find(beam=>beam.hit && fan.targetIds.includes(beam.hit.id))?.hit;
        if(hit) this.impact={point:hit.point,tick,id:hit.id};
      }
    }
    const flying: Projectile[] = [];
    for (const projectile of this.projectiles) {
      const distance = Math.min(WEAPONS.pulse.speed / 60, projectile.remaining);
      const hit = world.sweepBall({ origin: projectile.position, direction: projectile.direction }, distance, WEAPONS.pulse.radius);
      if (hit) {
        this.impact = { point: hit.point, tick, id: hit.id };
        damage.push({ source: this.source, target: hit.id, amount: WEAPONS.pulse.damage });
      } else if (projectile.remaining > distance) flying.push({ ...projectile,
        position: along(projectile.position, projectile.direction, distance), remaining: projectile.remaining - distance });
    }
    this.projectiles = flying;
    return { attacked, damage };
  }
}
