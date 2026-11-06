import type {AdventureCampaign} from '../core/adventureCampaign';
import {WHIP_MODS,resolveWhipMod} from '../core/whipMods';

/** A pending selection only; the running prototype is replaced exclusively by a restart/retry. */
export function installAdventureLoadout(containers:HTMLElement[],campaign:AdventureCampaign,status:()=>string=()=>''){
  const selects:HTMLSelectElement[]=[],labels:HTMLElement[]=[],notes:HTMLElement[]=[];
  const refresh=()=>{for(const select of selects){
    for(const option of select.options)option.disabled=!campaign.availableMods().includes(resolveWhipMod(option.value));
    select.value=campaign.snapshot().selectedMod;
  }for(const note of notes)note.textContent=status();};
  for(const container of containers){
    const label=document.createElement('label');label.className='adventure-loadout';
    label.textContent='Modifikation für den nächsten Versuch';
    const select=document.createElement('select');select.setAttribute('aria-label','Modifikation für den nächsten Versuch');
    for(const [id,mod] of Object.entries(WHIP_MODS)){const option=new Option(mod.name+(id==='hook'?' · nach Steinwächter':id==='fork'?' · nach Frostspinne':''),id);option.title=mod.description;select.add(option);}
    select.addEventListener('change',()=>{campaign.select(resolveWhipMod(select.value));refresh();});
    const note=document.createElement('small');notes.push(note);
    label.append(select,note);container.append(label);selects.push(select);labels.push(label);
  }
  refresh();return {refresh,dispose:()=>labels.forEach(label=>label.remove())};
}
