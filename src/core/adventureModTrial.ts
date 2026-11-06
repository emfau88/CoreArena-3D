import type { WhipMod } from './whipMods';

export const MOD_ORDERS:readonly (readonly WhipMod[])[]=[['base','hook','fork'],['hook','fork','base'],['fork','base','hook']];
export interface ModTrialResult {
  outcome:'victory'|'defeat'|'aborted'; ticks:number; hp:number; armor:number; bossHp:number;
  forwardHits:number; returnHits:number; misses:number; cancelled:number; dashUses:number;
}
export interface ModTrialAttempt {
  number:number; mod:WhipMod; kind:'comparison'|'voluntary'; start:unknown;
  result:ModTrialResult|null; reason:string;
}
/** Session-only evidence; no unlocks, rewards, persistence or network writes. */
export class AdventureModTrial {
  readonly order:readonly WhipMod[];
  private attempts:ModTrialAttempt[]=[];
  private current:ModTrialAttempt|null=null;
  constructor(order:number){this.order=MOD_ORDERS[order-1]??MOD_ORDERS[0]!;}
  get running(){return this.current!==null;}
  get requiredComplete(){return this.order.every(mod=>this.attempts.some(a=>a.mod===mod&&a.result&&a.result.outcome!=='aborted'));}
  get nextMod(){return this.order.find(mod=>!this.attempts.some(a=>a.mod===mod&&a.result&&a.result.outcome!=='aborted'))??this.order[0]!;}
  get full(){return this.attempts.length>=60;}
  begin(mod:WhipMod,start:unknown,voluntary:boolean){
    if(this.running||this.full||voluntary!==this.requiredComplete)return false;
    this.current={number:this.attempts.length+1,mod,kind:voluntary?'voluntary':'comparison',start:structuredClone(start),result:null,reason:''};
    this.attempts.push(this.current);return true;
  }
  finish(result:ModTrialResult){if(this.current){this.current.result={...result};this.current=null;}}
  noteLast(reason:string){const last=this.attempts.at(-1);if(last?.result)last.reason=reason.slice(0,600);}
  read(){return {schema:'adventure-mod-trial-v1',order:[...this.order],requiredComplete:this.requiredComplete,
    running:this.running,attempts:structuredClone(this.attempts),
    voluntaryStarted:this.attempts.filter(a=>a.kind==='voluntary').length,
    voluntaryFinished:this.attempts.filter(a=>a.kind==='voluntary'&&a.result&&a.result.outcome!=='aborted').length};}
}
