import {AdventureCampaign,freshAdventureProgress,type AdventureProgress} from '../core/adventureCampaign';
import {resolveWhipMod} from '../core/whipMods';

export const ADVENTURE_SAVE_KEY='corearena.adventure.prototype.campaign.v1';
type SaveStatus='ready'|'saved'|'corrupt'|'unsupported'|'unavailable';
type LocalStore=Pick<Storage,'getItem'|'setItem'>;
export function decodeAdventureSave(raw:string|null):{progress:AdventureProgress;status:SaveStatus}{
  const fresh=()=>({progress:freshAdventureProgress(),status:'corrupt' as const});
  if(raw===null)return {progress:freshAdventureProgress(),status:'ready'};
  try{
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))return fresh();
    if(value.version!==1)return {progress:freshAdventureProgress(),status:'unsupported'};
    if(!Array.isArray(value.completed)||!Array.isArray(value.defeated))return fresh();
    const progress=freshAdventureProgress();
    // Only a valid prefix is accepted; completing a map also proves its boss was defeated.
    if(value.defeated.includes('stone')||value.completed.includes('stone'))progress.defeated.push('stone');
    if(value.completed.includes('stone')){
      progress.completed.push('stone');
      if(value.defeated.includes('frost')||value.completed.includes('frost'))progress.defeated.push('frost');
      if(value.completed.includes('frost'))progress.completed.push('frost');
    }
    progress.next=progress.completed.includes('frost')?null:progress.completed.includes('stone')?'frost':'stone';
    const selected=resolveWhipMod(typeof value.selectedMod==='string'?value.selectedMod:null);
    progress.selectedMod=selected==='hook'&&progress.defeated.includes('stone')||selected==='fork'&&progress.defeated.includes('frost')?selected:'base';
    return {progress,status:'ready'};
  }catch{return fresh();}
}
export function createAdventureSave(storage:()=>LocalStore=()=>window.localStorage){
  let initial=freshAdventureProgress(),status:SaveStatus='ready',store:LocalStore|undefined;
  try{store=storage();const decoded=decodeAdventureSave(store.getItem(ADVENTURE_SAVE_KEY));initial=decoded.progress;status=decoded.status;}
  catch{status='unavailable';}
  const campaign=new AdventureCampaign(initial,value=>{
    // Do not destroy a save from an unknown future version.
    if(status==='unsupported'||!store)return;
    try{store.setItem(ADVENTURE_SAVE_KEY,JSON.stringify(value));status='saved';}catch{status='unavailable';}
  });
  return {campaign,status:()=>status,message:()=>status==='unavailable'?'Speicher nicht verfügbar · Fortschritt gilt nur für diese Sitzung.':
    status==='unsupported'?'Unbekannte Speicher-Version bleibt erhalten · diese Sitzung wird nicht gespeichert.':
    status==='corrupt'?'Spielstand konnte nicht gelesen werden · sicherer Neustart.':'Fortschritt wird lokal auf diesem Gerät gespeichert.'};
}
