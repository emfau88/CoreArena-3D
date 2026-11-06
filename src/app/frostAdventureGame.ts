import {FROST_ARENA,FROST_BOSS,FROST_RULES,FROST_MISSION,FROST_PICKUPS} from '../arena/frostAdventure';
import {FROST_PATTERN} from '../core/frostPattern';
import {FrostAdventureFight} from '../core/frostAdventureFight';
import {createSpatialWorld} from '../physics/rapierWorld';
import {Simulation} from '../core/simulation';
import {FixedClock} from '../core/fixedClock';
import {STONE_ADVENTURE_JUMP} from '../arena/stoneAdventure';
import {ArenaView} from '../render/arenaView';
import {MonsterView} from '../render/monsterView';
import {FrostAdventureView} from '../render/frostAdventureView';
import {buildCampaignArena} from '../render/campaignArena';
import {loadMeleeAssets} from '../render/kayFighter';
import {AdventurePrototype,EnergyWhipView} from './adventurePrototype';
import {DesktopInput} from '../input/desktopInput';
import {StoneFeedback} from './stoneFeedback';
import {lifeHud} from './hud';
import {adventureCampaign as campaign,adventureSave} from './adventureCampaignSession';
import {adventureUrl,navigateAdventure} from './adventureNavigation';
import {installAdventureLoadout} from './adventureLoadout';
import {WHIP_MODS,resolveWhipMod} from '../core/whipMods';
import type {FrostEntry} from './adventureVariant';
import type {MatchSnapshot} from '../core/match';

export async function startFrostAdventure(host:HTMLElement,entry:FrostEntry):Promise<()=>void>{
  if(!entry.trial&&(entry.practice?!campaign.canPractice('frost'):!campaign.canEnter('frost')))
    return (await import('./adventureHub')).startAdventureHub(host,entry.practice?'Besiege die Frostspinne zuerst in der Mission.':'Schließe den ersten Hof ab, um die Kristallkluft freizugeben.');
  await loadMeleeAssets();
  const bossOnly=entry.practice||entry.trial==='boss',progress=!entry.practice&&!entry.trial;
  let trialMod=resolveWhipMod(new URLSearchParams(location.search).get('mod'));
  const selected=()=>progress?campaign.snapshot().selectedMod:trialMod;
  const world=await createSpatialWorld(FROST_ARENA,{stepHeight:.32});
  let view:ArenaView;
  try{view=new ArenaView(host,{...FROST_ARENA,targets:[]},{training:false,pickups:FROST_PICKUPS,build:(scene,arena)=>buildCampaignArena(scene,arena,'frost')});}
  catch(error){world.dispose();throw error;}
  view.renderer.domElement.setAttribute('aria-label','Kristallkluft – Adventure');
  const monster=new MonsterView(view.scene,'frost',FROST_RULES,FROST_BOSS,undefined,true,world);
  const missionView=new FrostAdventureView(view.scene),whipView=new EnergyWhipView(view.scene,[]),feedback=new StoneFeedback(host);
  const fight=new FrostAdventureFight(),clock=new FixedClock(),abort=new AbortController(),options={signal:abort.signal};
  let sim=new Simulation(world,FROST_MISSION.spawn,STONE_ADVENTURE_JUMP),prototype=new AdventurePrototype(sim,false,selected());
  let current=sim.snapshot(),previous=current,paused=false,menuPaused=false,frameId=0,lastTime=performance.now(),lastHud=0,interact=false;
  let notice='',noticeUntil=0;
  host.dataset.adventure='true';host.dataset.adventureLevel='frost';
  host.insertAdjacentHTML('beforeend',`<div id="hud" class="pve-hud adventure-hud"><header><div class="brand"><div class="brand-mark">C</div><div><span class="eyebrow">DIE DREI SIEGEL · 2</span><h1>Kristallkluft</h1></div></div><span class="phase">${bossOnly?'BOSSÜBUNG':entry.trial?'EINZELTEST':'KAMPAGNE'}</span></header>
    <div id="adventure-location"><b id="room-name">Eisrücken</b><p id="room-hint"></p></div>
    <div id="adventure-boss" hidden><b>DIE FROSTSPINNE</b><span id="boss-hp-value">720</span><progress id="boss-hp" max="720" value="720" aria-label="Frostspinnen-Lebenspunkte"></progress><p id="pve-telegraph"></p></div>
    <aside id="campaign-story"><b>KÜHLLEITUNG</b><p id="mission-message"></p></aside><button id="mission-interact" type="button" hidden></button>
    <div id="life-panel">${lifeHud}<p id="life-status"></p></div><div id="adventure-actions"><button id="pve-restart" type="button">Mission neu starten</button><button id="pve-pause" type="button">Pause</button></div>
    <footer><span>WASD · Bewegen</span><span>Shift · Dash</span><span>2× Space · Doppelsprung</span><span id="whip-controls">Links: Schwung · Rechts: Knall · Luft: Lufthieb</span></footer></div>
    <div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Die Kluft wartet.</h2><button id="resume" type="button">Weiter</button><div id="adventure-settings"></div><button id="campaign-menu" type="button">Kampagne / Bossübung</button></div></div>
    <div id="match-result" hidden><div><h2 id="result-title"></h2><p id="result-detail"></p><button id="pve-again" type="button">Neu versuchen</button><button id="pve-next" type="button">Zur Kampagne</button><div id="result-loadout"></div></div></div>`);
  const el=(id:string)=>host.querySelector<HTMLElement>(`#${id}`)!;
  const loadout=installAdventureLoadout([el('adventure-settings'),el('result-loadout')],progress?campaign:{
    availableMods:()=>['base','hook','fork'],snapshot:()=>({selectedMod:trialMod}),select:mod=>{trialMod=mod;}},progress?adventureSave.message:()=> 'Freier Einzelversuch · keine Kampagnenfreischaltungen.');
  const input=new DesktopInput(view.renderer.domElement,()=>{},()=>{},()=>{},()=>{},()=>true);input.setAdventure(true);
  const setPaused=(value:boolean)=>{paused=value||input.touchEnabled&&innerHeight>innerWidth;prototype.suspend();input.clear();interact=false;clock.reset();previous=current;lastTime=performance.now();feedback.pause(paused);el('pause').hidden=!paused;};
  const sync=()=>{
    const state=fight.snapshot(),boss=state.pve;
    for(const guard of state.guards){world.setTargetEnabled(guard.id,guard.hp>0);world.setMovementBlocker(guard.id+'-body',{...guard.center,y:.9},.6,1.8,guard.hp>0);}
    world.setTargetPosition(FROST_BOSS.id,boss.center);world.setTargetEnabled(FROST_BOSS.id,state.bossActive&&boss.phase!=='emerging'&&boss.outcome==='running');
    world.setMovementBlocker('frost-body',{...boss.center,y:1.35},2.2,2.7,boss.outcome==='running');
  };
  const begin=(retry=false)=>{
    const spawn=retry?fight.retry(bossOnly):(fight.reset(bossOnly),bossOnly?FROST_MISSION.checkpoint:FROST_MISSION.spawn);
    sim=new Simulation(world,spawn,STONE_ADVENTURE_JUMP);prototype=new AdventurePrototype(sim,false,selected());
    sync();current=sim.reset(spawn);previous=current;menuPaused=false;
    view.resetPresentation();monster.resetPresentation();whipView.hide();feedback.reset(true);
    view.camera.trackPlayer(spawn,1.2,'side');view.camera.combat(true);view.resize();view.renderer.domElement.focus();setPaused(false);
    notice=bossOnly?'Splitterlinien verlassen · grüne Flanke angreifen · angekündigten Seitenschritt lesen.':'Folge dem Eisrücken links. Zwei Splitterwächter sichern das Kühlventil. Heilung liegt optional auf dem Eissockel rechts.';
    noticeUntil=540;lastHud=0;
  };
  for(const [id,handler] of [['pve-restart',()=>begin()],['pve-again',()=>begin(!fight.completed)],['resume',()=>{menuPaused=false;view.renderer.domElement.focus();setPaused(false);}],['pve-pause',()=>{menuPaused=true;setPaused(true);}]] as const)el(id).addEventListener('click',handler,options);
  for(const id of ['campaign-menu','pve-next'])el(id).addEventListener('click',()=>navigateAdventure(adventureUrl('menu')),options);
  const interaction=()=>{if(!paused&&!bossOnly)interact=true;};
  el('mission-interact').addEventListener('pointerdown',event=>{if(event.button===0){event.preventDefault();interaction();}},options);
  el('mission-interact').addEventListener('click',event=>{if(event.detail===0)interaction();},options);
  window.addEventListener('keydown',event=>{if(event.code==='KeyE'&&!event.repeat){event.preventDefault();interaction();}},options);
  window.addEventListener('blur',()=>setPaused(true),options);window.addEventListener('focus',()=>setPaused(menuPaused||document.hidden),options);
  document.addEventListener('visibilitychange',()=>setPaused(menuPaused||document.hidden||!document.hasFocus()),options);
  window.addEventListener('resize',()=>{view.resize();if(input.touchEnabled)setPaused(menuPaused||document.hidden||!document.hasFocus());},options);
  let touchReady=false;
  const arrangeTouch=()=>{if(!input.touchEnabled||touchReady)return;for(const id of ['pve-restart','stone-sound','fullscreen-toggle']){const button=host.querySelector('#'+id);if(button)el('adventure-settings').append(button);}el('pve-pause').textContent='Menü';touchReady=!!host.querySelector('#fullscreen-toggle');};
  function frame(now:number){
    arrangeTouch();const elapsed=Math.max(0,(now-lastTime)/1000);lastTime=now;let alpha=1;
    if(!paused)alpha=clock.advance(elapsed,()=>{
      const before=fight.snapshot(),b=before.pve;if(b.outcome==='defeat'||before.completed||bossOnly&&b.outcome==='victory')return;
      previous=current;const ray=input.pointer.active?view.pointerRay(input.pointer.x,input.pointer.y):null;
      const guarded=b.exchange?.window!=='counter'&&Math.cos(Math.atan2(current.position.x-b.center.x,current.position.z-b.center.z)-b.facing)>Math.cos(FROST_PATTERN.flankAngle);
      const move=prototype.step(input.command(view.camera.basis()),input.dashPressed(),input.attackPressed()&&b.outcome==='running',ray,world,fight.targets(),feedback,guarded,input.secondaryPressed()&&b.outcome==='running',FROST_BOSS.id);current=move.current;
      if(b.outcome==='victory'&&current.position.y<-6){current=sim.reset(FROST_MISSION.checkpoint);previous=current;}
      if(interact)fight.interact(current.position,world);interact=false;fight.step(current.position,world,move.attack.damage);sync();
      const after=fight.snapshot(),a=after.pve;
      if(after.checkpoint&&!before.checkpoint){feedback.play('console');notice='Kühlventil offen · Ruhepunkt im Zentralhof gesichert. Kehre rechts am Eisrücken zur Spinne zurück.';noticeUntil=current.tick+420;}
      if(a.phase!==b.phase){if(a.phase==='warning'||a.phase==='melee')feedback.play('frost-windup');if(a.phase==='attack')feedback.play('frost-cast');if(a.phase==='reposition')feedback.play('frost-shift');}
      if(a.phase==='melee'&&a.phaseTick===FROST_RULES.meleeWarning)feedback.play('frost-cast');
      for(let i=0;i<after.guards.length;i++){const g=after.guards[i]!,old=before.guards[i]!;if(g.phase==='warning'&&old.phase!=='warning')feedback.play('frost-windup');if(g.shot&&!old.shot)feedback.play('frost-cast');}
      if(a.hitsTaken>b.hitsTaken){feedback.play('hurt');feedback.playerHit(current.tick);}
      if(a.bossHp<b.bossHp)feedback.bossHit(b.bossHp-a.bossHp,current.tick,guarded);
      if(current.grounded&&!previous.grounded)feedback.play('land');
      else if(!current.grounded&&previous.grounded&&current.velocity.y>0)feedback.play('jump');
      if(a.outcome==='running')fight.pickups.step(current.tick,current,world,(kind,amount)=>{const accepted=kind==='health'?fight.life.restore(amount):fight.life.restoreArmor(amount);if(accepted)feedback.play('pickup');return accepted;});
      if(a.outcome!==b.outcome){prototype.suspend();input.clear();if(a.outcome==='victory'){
        feedback.play('victory');const unlocked=progress?campaign.defeat('frost'):null;loadout.refresh();
        notice=unlocked?'Gabelspitze freigeschaltet · breitere Spitzen, kürzere Reichweite. Der Ausgang liegt rechts hinter dem Eisrücken.':'Frostspinne besiegt · Ausgang im Nordosten freigegeben.';noticeUntil=current.tick+600;
      }}
      if(after.completed&&!before.completed){if(progress)campaign.complete('frost');input.clear();prototype.suspend();}
    });
    const state=fight.snapshot(),b=state.pve,w=prototype.whip.sample(alpha,world);
    if(now-lastHud>70){
      input.combatStatus(current.grounded,prototype.motor.jumpSnapshot().available,prototype.motor.snapshot().readyIn===0);
      const count=state.guards.filter(g=>g.hp>0).length;
      el('room-name').textContent=`${bossOnly?'Frostspinne üben':'Kristallkluft'} · ${WHIP_MODS[prototype.whip.mod].name}`;
      el('room-hint').textContent=b.outcome==='victory'?'Siegel gebrochen · Ausgang im Nordosten betreten.':!state.checkpoint?count?`${count}/2 Splitterwächter · Warnlinie verlassen oder Eisrücken als Deckung nutzen. Danach Kühlventil im Westgang öffnen.`:'Kühlventil im Westgang öffnen · goldener Ring.':!state.bossActive?'Ruhepunkt gesichert · Zentralhof betreten.':'Grüne Flanke: voller Schaden · orange Linien: Lücken oder Deckung nutzen.';
      const action=bossOnly?null:fight.interaction(current.position,world),button=el('mission-interact') as HTMLButtonElement;
      button.hidden=paused||!action||b.outcome!=='running';button.disabled=!action?.enabled;button.textContent=action?`${input.touchEnabled?'':'E · '}${action.label}`:'';
      el('adventure-boss').hidden=!state.bossActive||b.outcome==='victory';el('boss-hp-value').textContent=String(Math.ceil(b.bossHp));(el('boss-hp') as HTMLProgressElement).value=b.bossHp;
      const message={emerging:'Die Kristallhülle bricht …',chasing:'FRONT GESCHÜTZT · Seitlich angreifen!',melee:'BISS · Seitlich aus der schmalen Spitze!',warning:b.kind==='wave'?'SPLITTERFÄCHER · Zwischen die Linien oder hinter Deckung!':'KRISTALLAUSBRUCH · Kreis verlassen!',attack:b.kind==='wave'?'SPLITTER UNTERWEGS':'AUSBRUCH!',recovery:'ERHOLUNG · Gegenangriff!',reposition:'SEITENSCHRITT · Pfeil und Landering beachten!',defeated:'Frostsiegel gebrochen.'};
      el('pve-telegraph').textContent=b.exchange?.window==='counter'?'KÖRPER OFFEN · Gegenangriff!':message[b.phase];
      el('hp-value').textContent=String(b.hp);el('armor-value').textContent=String(b.armor);(el('hp-bar') as HTMLProgressElement).value=b.hp;(el('armor-bar') as HTMLProgressElement).value=b.armor;
      el('life-status').textContent=state.checkpoint?'Ruhepunkt gesichert': 'Optional: Heilung auf dem Eissockel rechts';
      el('mission-message').textContent=notice;el('campaign-story').hidden=paused||current.tick>=noticeUntil||b.outcome==='defeat';
      el('match-result').hidden=!(b.outcome==='defeat'||state.completed||bossOnly&&b.outcome==='victory');
      el('result-title').textContent=state.completed?'Kristallkluft durchquert.':b.outcome==='victory'?'Frostspinne bezwungen.':'Noch ein Versuch?';
      el('result-detail').textContent=state.completed?'Die ersten zwei Missionen sind abgeschlossen. Die Glutschmiede folgt im nächsten Ausbau.':bossOnly?'Bossübung mit festen Vorräten. Alle drei Profile sind frei.':state.checkpoint?'Am Ruhepunkt erneut versuchen. Ventil und gelöste Begegnungen bleiben in dieser Sitzung erhalten.':'Die Warnlinie bindet die Schussrichtung. Wechsle die Seite oder nutze Deckung.';
      el('pve-again').textContent=state.completed?'Mission erneut spielen':state.checkpoint?'Am Ruhepunkt versuchen':'Mission erneut versuchen';lastHud=now;
    }
    monster.update(b,paused?0:Math.min(elapsed,.05));missionView.update(state,view.camera.camera,world);
    view.camera.combat(true,state.bossActive?b.center:null);feedback.draw(current.tick,view.projectedPosition(b.center));
    const life:MatchSnapshot={phase:b.outcome==='defeat'||state.completed?'ended':'running',tick:current.tick,remainingTicks:0,scores:{blue:0,red:0},winner:null,reason:null,
      actors:{player:{id:'player',team:'blue',hp:b.hp,armor:b.armor,life:1,alive:b.hp>0,respawnTicks:0,protectionTicks:0}}};
    view.draw(previous,current,alpha,paused?0:Math.min(elapsed,.05),null,null,null,life,fight.combat.snapshot(),fight.pickups.snapshot(),
      {...prototype.presentation(w),beforeRender:hand=>whipView.update(w,hand,view.actor.position,prototype.aim.snapshot(),state.bossActive?b.center:null,current.tick,false,false)});
    frameId=requestAnimationFrame(frame);
  }
  if(import.meta.env.MODE==='test'||import.meta.env.MODE==='environment-test')Object.defineProperty(window,'__coreArena',{configurable:true,value:Object.freeze({read:()=>({mode:'adventure',level:'frost',
    snapshot:current,pve:fight.life.snapshot(),weapons:fight.combat.snapshot(),prototype:prototype.snapshot(),camera:view.camera.mode,paused,checkpoint:fight.checkpoint,bossActive:fight.bossActive,completed:fight.completed,
    enemies:fight.guards.map(g=>({...g.snapshot(),screen:view.projectedPosition({...g.snapshot().center,y:.2})})),
    monsterScreen:view.projectedPosition({...fight.life.snapshot().center,y:.95}),playerScreen:view.projectedPosition(current.position),pickups:fight.pickups.snapshot(),
    campaign:campaign.snapshot(),saveStatus:adventureSave.status(),practice:bossOnly,trial:entry.trial,whipVisual:whipView.diagnostics(),feedback:feedback.diagnostics(),
    renderResources:{...view.renderer.info.memory,triangles:view.renderer.info.render.triangles,calls:view.renderer.info.render.calls},viewport:{width:innerWidth,height:innerHeight}})})});
  begin();document.querySelector('#loading')?.remove();host.dataset.ready='true';frameId=requestAnimationFrame(frame);
  return ()=>{cancelAnimationFrame(frameId);abort.abort();loadout.dispose();feedback.dispose();input.dispose();world.dispose();view.dispose();
    host.querySelectorAll('#hud,#pause,#match-result').forEach(n=>n.remove());Reflect.deleteProperty(window,'__coreArena');delete host.dataset.adventure;delete host.dataset.adventureLevel;};
}
