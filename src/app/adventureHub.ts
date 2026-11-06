import {adventureCampaign as campaign,adventureSave} from './adventureCampaignSession';
import {adventureUrl,navigateAdventure} from './adventureNavigation';
import {installAdventureLoadout} from './adventureLoadout';
import {WHIP_MODS,resolveWhipMod} from '../core/whipMods';
import './adventureHub.css';

export function startAdventureHub(host:HTMLElement,note=''):()=>void{
  const state=campaign.snapshot(),abort=new AbortController(),options={signal:abort.signal};
  const panel=document.createElement('section');panel.id='adventure-hub';
  panel.innerHTML=`<div class="campaign-card"><span class="eyebrow">CORE ARENA · ADVENTURE</span><h1>Die drei Siegel</h1>
    <p>${note||'Zwei spielbare Missionen: der verwitterte Hof und die Kristallkluft.'}</p>
    <p id="campaign-save-status"></p><div id="campaign-loadout"></div>
    <button id="campaign-continue" type="button">${state.next?'Fortsetzen · '+(state.next==='stone'?'Der verwitterte Hof':'Kristallkluft'):'Beide Missionen abgeschlossen · Kristallkluft erneut spielen'}</button>
    <small>Fortsetzen beginnt sicher am Missionsanfang. Boss-Checkpoints gelten bis zum Verlassen der Mission. Neustarten behält Freischaltungen.</small>
    <div class="campaign-missions">${(['stone','frost'] as const).map(level=>`<article><h2>${level==='stone'?'1 · Der verwitterte Hof':'2 · Kristallkluft'}</h2>
      <p>${state.completed.includes(level)?'Abgeschlossen':campaign.canEnter(level)?'Spielbar':'Nach Abschluss des ersten Hofs'}</p>
      <button type="button" data-level="${level}" ${campaign.canEnter(level)?'':'disabled'}>Mission von vorn</button>
      <button type="button" data-practice="${level}" ${campaign.canPractice(level)?'':'disabled'}>${level==='stone'?'Steinwächter':'Frostspinne'} üben</button></article>`).join('')}</div>
    <label>Profil für Bossübungen <select id="practice-mod">${Object.entries(WHIP_MODS).map(([id,mod])=>`<option value="${id}">${mod.name}</option>`).join('')}</select></label>
    <small>Besiegte Bosse gezielt üben: alle drei Profile frei, feste Vorräte, keine zusätzlichen Freischaltungen. Die Glutschmiede folgt in einem späteren Paket.</small>
    <button id="campaign-home" type="button">Zum Spielmenü</button></div>`;
  host.append(panel);host.dataset.adventure='true';
  panel.querySelector('#campaign-save-status')!.textContent=adventureSave.message();
  const loadout=installAdventureLoadout([panel.querySelector<HTMLElement>('#campaign-loadout')!],{
    availableMods:()=>campaign.availableMods(),snapshot:()=>campaign.snapshot(),select:mod=>{
      campaign.select(mod);panel.querySelector('#campaign-save-status')!.textContent=adventureSave.message();
    }});
  panel.querySelector('#campaign-continue')!.addEventListener('click',()=>navigateAdventure(adventureUrl(state.next??'frost')),options);
  for(const button of panel.querySelectorAll<HTMLButtonElement>('[data-level]'))button.addEventListener('click',()=>{
    const level=button.dataset.level==='frost'?'frost':'stone';if(campaign.canEnter(level))navigateAdventure(adventureUrl(level));},options);
  for(const button of panel.querySelectorAll<HTMLButtonElement>('[data-practice]'))button.addEventListener('click',()=>{
    const level=button.dataset.practice==='frost'?'frost':'stone',mod=resolveWhipMod(panel.querySelector<HTMLSelectElement>('#practice-mod')!.value);
    if(campaign.canPractice(level))navigateAdventure(adventureUrl(level,{practice:'1',mod}));},options);
  panel.querySelector('#campaign-home')!.addEventListener('click',()=>location.assign(location.pathname),options);
  document.querySelector('#loading')?.remove();host.dataset.ready='true';
  return ()=>{abort.abort();loadout.dispose();panel.remove();delete host.dataset.adventure;};
}
