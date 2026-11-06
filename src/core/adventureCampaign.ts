import type {WhipMod} from './whipMods';

export const ADVENTURE_LEVELS=['stone','frost'] as const;
export type AdventureLevel=typeof ADVENTURE_LEVELS[number];
export interface AdventureProgress {
  version:1; completed:AdventureLevel[]; defeated:AdventureLevel[];
  next:AdventureLevel|null; selectedMod:WhipMod;
}
export const freshAdventureProgress=():AdventureProgress=>({version:1,completed:[],defeated:[],next:'stone',selectedMod:'base'});
/** Milestones only. Boss health, position, pickups and checkpoint animation are never saved. */
export class AdventureCampaign {
  private data:AdventureProgress;
  constructor(initial=freshAdventureProgress(),private readonly changed:(value:AdventureProgress)=>void=()=>{}){this.data=structuredClone(initial);}
  snapshot():AdventureProgress{return structuredClone(this.data);}
  availableMods():WhipMod[]{return ['base',...(this.data.defeated.includes('stone')?['hook']:[]),...(this.data.defeated.includes('frost')?['fork']:[])] as WhipMod[];}
  canEnter(level:AdventureLevel){return level==='stone'||this.data.completed.includes('stone');}
  canPractice(level:AdventureLevel){return this.data.defeated.includes(level);}
  select(mod:WhipMod){if(!this.availableMods().includes(mod)||mod===this.data.selectedMod)return false;
    this.data.selectedMod=mod;this.changed(this.snapshot());return true;}
  defeat(level:AdventureLevel):WhipMod|null {
    if(!this.canEnter(level)||this.data.defeated.includes(level))return null;
    this.data.defeated.push(level);this.changed(this.snapshot());return level==='stone'?'hook':'fork';
  }
  complete(level:AdventureLevel){
    if(!this.canEnter(level)||!this.canPractice(level)||this.data.completed.includes(level))return false;
    this.data.completed.push(level);this.data.next=ADVENTURE_LEVELS.find(id=>!this.data.completed.includes(id))??null;
    this.changed(this.snapshot());return true;
  }
}
