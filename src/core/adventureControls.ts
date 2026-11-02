import { Simulation } from './simulation';
import type { MoveCommand, Ray, Vec3 } from './types';

export const DASH = Object.freeze({ speed: 20, ticks: 9, cooldown: 48, distance: 3 });
export const AIR_JUMP = Object.freeze({ speed:6 });
export const BOSS_BODY = Object.freeze({ radius: 1.7, height: 3.4 });

/** Project onto the player's strike-height plane. Never acquire an enemy or snap to a collider. */
export class AdventureAim {
  private direction: Vec3 = { x:0, y:0, z:-1 };
  update(ray: Ray | null, foot: Vec3): Vec3 {
    if (ray && ray.direction.y < -1e-5) {
      const t = (foot.y + 1.1 - ray.origin.y) / ray.direction.y;
      const dx = ray.origin.x + ray.direction.x*t - foot.x, dz = ray.origin.z + ray.direction.z*t - foot.z;
      const length = Math.hypot(dx,dz);
      if (t > 0 && length > .2 && Number.isFinite(length)) this.direction = {x:dx/length,y:0,z:dz/length};
    }
    return this.direction;
  }
  snapshot() { return this.direction; }
}

/** Optional Adventure state around the same capsule motor and jump curve. */
export class AdventureMotor {
  private remaining = 0;
  private readyAt = 0;
  private uses = 0;
  private direction: Vec3 = {x:0,y:0,z:-1};
  private lastStart = -1;
  private airAvailable=false;
  private jumpHeld=false;
  private airUses=0;
  private lastAirJump=-100;
  constructor(readonly simulation: Simulation) {}
  step(command: MoveCommand, dashPressed: boolean, aim: Vec3) {
    const before = this.simulation.snapshot(), tick = before.tick + 1;
    if(before.grounded)this.airAvailable=true;
    const jumpPressed=!!command.jump&&!this.jumpHeld;this.jumpHeld=!!command.jump;
    const started = dashPressed && before.grounded && this.remaining===0 && tick>=this.readyAt;
    if (started) {
      const length = Math.hypot(command.x,command.z);
      this.direction = length>.01 ? {x:command.x/length,y:0,z:command.z/length} : {...aim};
      this.remaining=DASH.ticks; this.readyAt=tick+DASH.cooldown; this.lastStart=tick; this.uses++;
    }
    const active = this.remaining>0;
    const airJump=jumpPressed&&!before.grounded&&this.airAvailable&&!active;
    if(airJump){this.airAvailable=false;this.airUses++;this.lastAirJump=tick;}
    const current = this.simulation.step(active
      ? {x:this.direction.x,z:this.direction.z,sprint:false,jump:false} : {...command,jump:jumpPressed,sprint:false}, active?DASH.speed:undefined,airJump?AIR_JUMP.speed:undefined);
    if(active) this.remaining--;
    if(!current.grounded) this.remaining=0; // Leaving a ledge never creates an air dash or suspends gravity.
    return { current, started, active, airJump };
  }
  suspend() { this.remaining=0;this.jumpHeld=false; }
  snapshot() { return { remaining:this.remaining, readyIn:Math.max(0,this.readyAt-this.simulation.snapshot().tick),
    direction:this.direction, uses:this.uses, lastStart:this.lastStart, invulnerable:false }; }
  jumpSnapshot(){return {available:this.airAvailable&&!this.simulation.snapshot().grounded,uses:this.airUses,lastTick:this.lastAirJump};}
}
