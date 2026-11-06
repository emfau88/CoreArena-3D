import { AdventureModTrial, type ModTrialResult } from '../core/adventureModTrial';
import { WHIP_MODS, resolveWhipMod, type WhipMod } from '../core/whipMods';
import './adventureModTrial.css';

export function installModTrial(host:HTMLElement,start:(mod:WhipMod)=>unknown){
  const state=new AdventureModTrial(Number(new URLSearchParams(location.search).get('order')));
  const dialog=document.createElement('dialog');dialog.id='mod-trial';
  const back=new URL(location.href);back.searchParams.delete('trial');back.searchParams.delete('order');
  dialog.innerHTML=`<form method="dialog">
    <span class="eyebrow">WAFFENVERGLEICH · STEINWÄCHTER</span><h2 id="mod-title">Welcher Schwung passt zu dir?</h2>
    <p id="mod-status" aria-live="polite"></p>
    <p class="mod-help">Ein Slot pro Versuch. Alle drei sind frei verfügbar. Gleicher Boss, gleiche Vorräte. Die Modifikation verändert den Seitenschwung; Knall und Lufthieb bleiben gleich.</p>
    <fieldset><legend>Modifikation für den nächsten Versuch</legend><div class="mod-options">${state.order.map(mod=>
      `<label><input type="radio" name="whip-mod" value="${mod}"><strong>${WHIP_MODS[mod].name}</strong><span>${WHIP_MODS[mod].description}</span></label>`).join('')}</div></fieldset>
    <p class="mod-help mod-input-help">Maus: links Schwung · rechts Knall · Shift Dash. Touch: Feld tippen · Knall / Dash. Sprung zweimal: Doppelsprung.</p>
    <label id="mod-note-label" hidden>Was war im letzten Versuch anders? Warum diese Wahl?<textarea id="mod-note" maxlength="600" rows="2"></textarea></label>
    <details id="mod-survey"><summary>Deine Einschätzung · getrennt von gespielten Versuchen</summary>
      <label>Würdest du freiwillig noch einmal spielen? <select id="mod-intent"><option value="unanswered">Noch keine Angabe</option value="yes">Ja</option><option value="no">Nein</option><option value="unsure">Unsicher</option></select></label>
      <label>Welche Auswahlregel wäre besser? <select id="mod-model"><option value="unanswered">Noch keine Angabe</option><option value="none">Nur Basis, ohne Modifikationen</option><option value="free">Alle sofort frei wie hier</option><option value="milestones">Rückhaken nach Boss 1, Gabelspitze nach Boss 2</option></select></label>
      <small>Die Freischaltregel ist hier nur eine Frage. Es gibt noch keine Kampagnenfreischaltung.</small>
    </details>
    <div class="mod-actions"><button id="mod-start" type="button"></button><button id="mod-export" type="button">Ergebnisse exportieren</button><a id="mod-exit">Test beenden · zur Mission</a></div>
    <small>Keine Belohnung für Zusatzversuche. Ergebnisse bleiben nur in dieser Sitzung; Export vor dem Verlassen. Höchstens 60 Versuche pro Sitzung.</small>
  </form>`;
  host.append(dialog);dialog.setAttribute('aria-labelledby','mod-title');
  const el=<T extends HTMLElement=HTMLElement>(id:string)=>dialog.querySelector<T>(`#${id}`)!;
  el<HTMLAnchorElement>('mod-exit').href=back.href;
  const note=el<HTMLTextAreaElement>('mod-note');
  const open=()=>{
    const data=state.read(),last=data.attempts.at(-1);
    const tried=state.order.filter(mod=>data.attempts.some(a=>a.mod===mod&&a.result&&a.result.outcome!=='aborted'));
    el('mod-status').textContent=last?.result?
      `${WHIP_MODS[last.mod].name}: ${{victory:'Sieg',defeat:'Niederlage',aborted:'Abgebrochen'}[last.result.outcome]} nach ${(last.result.ticks/60).toFixed(1)} s · Boss ${Math.ceil(last.result.bossHp)} LP. ${tried.length}/3 verglichen.`:
      `Empfohlene Reihenfolge: ${state.order.map(mod=>WHIP_MODS[mod].name).join(' → ')}. Pro Profil ein Versuch bis Sieg oder Niederlage.`;
    el('mod-title').textContent=state.requiredComplete?'Vergleich geschafft. Noch eine Runde aus eigenem Antrieb?':'Welcher Schwung passt zu dir?';
    el<HTMLButtonElement>('mod-start').disabled=state.full;
    el('mod-start').textContent=state.full?'Sitzung voll · bitte exportieren':state.requiredComplete?'Freiwilligen Zusatzversuch starten':'Vergleichsversuch starten';
    el('mod-note-label').hidden=!last?.result;note.value=last?.reason??'';
    dialog.querySelector<HTMLInputElement>(`input[value="${state.nextMod}"]`)!.checked=true;
    if(!dialog.open)dialog.showModal();
  };
  note.addEventListener('input',()=>state.noteLast(note.value));
  for(const name of ['keydown','keyup'])dialog.addEventListener(name,event=>event.stopPropagation());
  dialog.addEventListener('cancel',event=>event.preventDefault());
  dialog.querySelector('form')!.addEventListener('submit',event=>event.preventDefault());
  el('mod-start').addEventListener('click',()=>{
    if(state.running||state.full)return;
    const mod=resolveWhipMod(dialog.querySelector<HTMLInputElement>('input[name="whip-mod"]:checked')!.value);
    dialog.close();const snapshot=start(mod);state.begin(mod,snapshot,state.requiredComplete);
  });
  const read=()=>({...state.read(),reportedIntent:el<HTMLSelectElement>('mod-intent').value,
    preferredModel:el<HTMLSelectElement>('mod-model').value,input:matchMedia('(pointer:coarse)').matches?'touch':'mouse-keyboard',
    viewport:{width:innerWidth,height:innerHeight},fixture:'stone-boss-a8-v1',
    rules:'60 Hz; sweep only; no complement; all original supplies; no rewards or unlocks',
    build:__ADVENTURE_BUILD__,limitations:'Agent checks are not human enjoyment evidence. Milestone preference is hypothetical.'});
  el('mod-export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(read(),null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=`core-arena-mods-${Date.now()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  open();
  return {get running(){return state.running;},finish(result:ModTrialResult){state.finish(result);open();},read,dispose:()=>dialog.remove()};
}
