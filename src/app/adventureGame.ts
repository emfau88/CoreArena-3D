import { loadMeleeAssets } from '../render/kayFighter';
import { STONE_ADVENTURE, STONE_ADVENTURE_COMBAT, ADVENTURE_BOSS, ADVENTURE_RUNNERS, STONE_ADVENTURE_PICKUPS, STONE_ADVENTURE_JUMP, stoneRoomAt } from '../arena/stoneAdventure';
import { createAdventureVariant, type AdventureEntry } from './adventureVariant';
import { AdventureFightView } from '../render/adventureFightView';
import { buildStoneAdventure } from '../render/stoneAdventureView';
import { loadCourtyardAssets } from '../render/courtyardLook';
import { ArenaView } from '../render/arenaView';
import { createSpatialWorld } from '../physics/rapierWorld';
import { Simulation } from '../core/simulation';
import type { WeaponId } from '../core/combat';
import type { Vec3 } from '../core/types';
import { FixedClock } from '../core/fixedClock';
import { solveAim, type AimSolution } from '../core/aim';
import type { MatchSnapshot } from '../core/match';
import { DesktopInput } from '../input/desktopInput';
import { lifeHud, weaponHud } from './hud';
import { StoneFeedback } from './stoneFeedback';
import { PROTOTYPE_EXIT_SEAL } from '../core/adventureBalance';
import { AdventureMissionView, loadMissionAssets } from '../render/adventureMissionView';
import { OutpostView } from '../render/outpostView';

const hints: Record<string, string> = {
  A: 'Durch den offenen Ruinenhof zum nächsten Durchgang.', B: 'Am Norddurchgang liegt die Waffe der verlassenen Wache.',
  C: 'Pulse aufnehmen · weiter zum inneren Hof.', D: 'Vorräte sichern. Die breite Treppe führt zurück in den Hof.',
  E: 'Der Nordweg führt zum Siegelplatz.', F: 'Hinter diesem Durchgang liegt der Wächterhof.',
  G: 'Der Wächter ruht. Erkunde den Hof und die seitlichen Vorräte.', H: 'Das Nordtor zur Kristallkluft ist versiegelt.',
};

/** Small adventure slice: two melee guards, then the existing stone boss. */
export async function startAdventure(host: HTMLElement, entry: AdventureEntry): Promise<() => void> {
  const exploration = entry.exploration;
  const [courtyardAssets,missionAssets] = await Promise.all([loadCourtyardAssets(),loadMissionAssets(),loadMeleeAssets()]);
  const environment=import.meta.env.MODE==='environment-test' && entry.environment
    ?await (await import('../experiments/adventureEnvironment/environmentTest')).createEnvironmentTest(host,entry.environment,courtyardAssets):undefined;
  const simulationTimes:number[]=[];
  const world = await createSpatialWorld(STONE_ADVENTURE_COMBAT, { stepHeight: .32 });
  let view: ArenaView;
  try { view = new ArenaView(host, {...STONE_ADVENTURE_COMBAT,targets:[]}, { training: false, pickups: STONE_ADVENTURE_PICKUPS,
    build: (scene,arena) => {
      const animate=buildStoneAdventure(scene,arena,courtyardAssets,environment?.style);
      environment?.build(scene);return animate;
    }, shadowSpan: 58 }); }
  catch (error) { world.dispose(); throw error; }
  view.renderer.domElement.setAttribute('aria-label', `Der verwitterte Hof – ${exploration ? 'Erkundung' : 'Adventure'}`);
  view.camera.trackPlayer(STONE_ADVENTURE.spawn,1.2,'side'); view.resize();
  let simulation = new Simulation(world, STONE_ADVENTURE.spawn, STONE_ADVENTURE_JUMP);
  let variant = createAdventureVariant(entry.profile,entry.complement), fight = variant.fight;
  const fightView = new AdventureFightView(view.scene,courtyardAssets.floor);
  const outpostView=new OutpostView(view.scene,missionAssets.drone);
  const missionView = new AdventureMissionView(view.scene,missionAssets);
  let {combat,pickups}=fight;
  const clock = new FixedClock();
  let labModule: typeof import('./adventureLab') | undefined;
  let prototypeModule: typeof import('./adventurePrototype') | undefined;
  let lab: ReturnType<typeof import('./adventureLab')['installAdventureLab']> | undefined;
  let prototype:import('./adventurePrototype').AdventurePrototype|undefined;
  let whipView:import('../render/energyWhipView').EnergyWhipView|undefined;
  const abort = new AbortController(), options = { signal: abort.signal };
  let current = simulation.snapshot(), previous = current, aim: AimSolution | null = null;
  let paused = false, menuPaused = false, overview = false, lastTime = performance.now(), frameId = 0, lastHud = 0;
  let interactPending=false, messageUntil=0, bossIntroduced=false;
  host.dataset.adventure = 'true';
  host.insertAdjacentHTML('beforeend', `<div id="hud" class="pve-hud adventure-hud">
    <header><div class="brand"><div class="brand-mark">C</div><div><span class="eyebrow">CORE ARENA · DIE DREI SIEGEL</span>
    <h1>Der verwitterte Hof</h1></div></div><span class="phase"><i></i>${exploration ? 'ERKUNDUNG' : 'DER VERSTUMMTE AUSSENPOSTEN'}</span></header>
    <div id="adventure-location"><b id="room-name">Ankunft</b><p id="room-hint">${hints.A}</p></div>
    <div id="adventure-boss" hidden><b>DER STEINWÄCHTER</b><span id="boss-hp-value">600</span>
    <progress id="boss-hp" max="600" value="600" aria-label="Steinwächter-Lebenspunkte"></progress><p id="pve-telegraph"></p></div>
    <aside id="campaign-story" aria-live="polite"><b>LIEFERDROHNE · STATUSMELDUNG</b><p id="mission-message"></p></aside>
    <button id="mission-interact" type="button" hidden></button>
    <div id="weapon-panel">${weaponHud()}<small>Arc zum Start · Pulse am Norddurchgang</small></div>
    <div id="life-panel">${lifeHud}<p id="life-status">Der Hof liegt still.</p></div>
    <div id="adventure-actions"><button id="pve-restart" type="button">Level neu starten</button>
    <button id="pve-pause" type="button">Pause</button></div>
    <footer><span><kbd>WASD</kbd> Bewegen</span><span><kbd>SHIFT</kbd> Sprint</span><span><kbd>SPACE</kbd> Springen</span>
    <button id="camera-toggle" type="button"><kbd>V</kbd> Ansicht wechseln</button></footer>
    </div><div id="pause" hidden><div><span class="eyebrow">PAUSE</span><h2>Der Hof wartet.</h2>
    <button id="resume" type="button">Weiter</button><div id="adventure-settings"></div>
    <button id="adventure-home" type="button">Zum Spielmenü</button></div></div>
    <div id="match-result" hidden><div><span class="eyebrow">DAS STEINSIEGEL</span><h2 id="result-title"></h2><p id="result-detail"></p>
    <button id="pve-next" type="button" hidden>Optional: Kristallkluft erkunden</button><button id="pve-again" type="button">Neu versuchen</button>
    <button id="result-home" type="button">Zum Spielmenü</button></div></div>`);
  const el = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
  const chooseWeapon = (id: WeaponId | 'cycle') => { if (!paused && fight.life.snapshot().outcome==='running') {
    const old=combat.snapshot().selected;
    if (id === 'cycle') combat.cycle(); else combat.select(id);
    if(combat.snapshot().selected!==old)prototype?.whip.cancel();
  } };
  const input = new DesktopInput(view.renderer.domElement, () => view.camera.toggle(), () => {}, () => {}, chooseWeapon,()=>!!prototype);
  const feedback = new StoneFeedback(host);
  const announce = (text:string,ticks=360) => { el('mission-message').textContent=text; messageUntil=current.tick+ticks; };
  const requestInteraction = () => { if(!paused && !exploration) interactPending=true; };
  window.addEventListener('keydown',event=>{
    if(event.code==='KeyE' && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();requestInteraction();
    }
  },options);
  el('mission-interact').addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    // A new interaction finger never takes ownership of movement or firing.
    event.preventDefault();requestInteraction();
  },options);
  el('mission-interact').addEventListener('click',event=>{if(event.detail===0)requestInteraction();},options);
  let touchMenuReady = false;
  const arrangeTouchMenu = () => {
    if (touchMenuReady || !input.touchEnabled) return;
    // Move the existing controls so sound/fullscreen state and their listeners stay shared.
    for (const id of ['camera-toggle','stone-sound','pve-restart','fullscreen-toggle']) {
      const button = host.querySelector<HTMLElement>(`#${id}`);
      if (button) el('adventure-settings').append(button);
    }
    el('pve-pause').textContent = 'Menü';
    // Display controls are installed by main.ts after startAdventure resolves.
    touchMenuReady = !!host.querySelector('#fullscreen-toggle'); view.resize();
  };
  const setPaused = (value: boolean) => {
    paused = value || input.touchEnabled && innerHeight > innerWidth;
    if(paused)prototype?.suspend();
    input.clear(); interactPending=false; clock.reset(); previous = current; lastTime = performance.now();
    feedback.pause(paused); el('pause').hidden = !paused;
  };
  const syncWorld = () => {
    const state=fight.snapshot();
    state.runners.forEach((r,i)=>{ world.setTargetPosition(ADVENTURE_RUNNERS[i]!.id,r.center); world.setTargetEnabled(r.id,!exploration && r.hp>0); });
    if(labModule)state.runners.forEach(r=>world.setMovementBlocker(`prototype-body-${r.id}`,
      {x:r.center.x,y:.9,z:r.center.z},.65,1.8,!!prototype&&r.hp>0));
    world.setTargetPosition(ADVENTURE_BOSS.id,state.pve.center);
    world.setTargetEnabled(ADVENTURE_BOSS.id,!exploration && state.bossActive && state.pve.phase!=='emerging' && state.pve.outcome==='running');
    world.setObstacleEnabled('dormant-warden',!state.bossActive&&!prototype?.practice);
    if(labModule)world.setMovementBlocker('prototype-boss-body',
      {x:state.pve.center.x,y:labModule.BOSS_BODY.height/2,z:state.pve.center.z},labModule.BOSS_BODY.radius,labModule.BOSS_BODY.height,
      !!prototype&&!prototype.practice&&state.bossActive&&state.pve.outcome==='running');
    world.setObstacleEnabled('boss-entry-gate',!exploration && state.entryClosed);
    world.setObstacleEnabled('north-gate',!exploration && !state.relayActive);
  };
  const placePlayer = (position:Vec3) => {
    feedback.reset(); menuPaused = false; overview = false; syncWorld();
    current = simulation.reset(position); previous = current; aim = null;
    messageUntil=0;
    el('match-result').hidden=true;
    view.resize(); view.camera.snap(current.position); view.renderer.domElement.focus(); setPaused(false); lastHud = 0;
  };
  const restart = () => {
    if (lab) { restartLab(true); return; }
    fight.reset();resetMissionPrototype();bossIntroduced=false;placePlayer(STONE_ADVENTURE.spawn);
    announce('Lieferung angekommen. Außenposten antwortet nicht. Bring die Anlage wieder zum Laufen.'+(prototype?
      input.touchEnabled?' Feld tippen: Schlag · Knall: schwerer Schlag · Sprung zweimal: Doppelsprung.':' Links: Schwung · Rechts: Überkopf-Knall · Shift: Dash · 2× Space: Doppelsprung.':''),540);
  };
  const retry = () => {
    if (lab) { restartLab(true); return; }
    if(!fight.checkpoint || fight.life.snapshot().outcome!=='defeat') restart();
    else {const spawn=fight.retry();resetMissionPrototype();placePlayer(spawn);}
  };
  const configurePresentation=()=>{
    input.setAdventure(!!prototype);
    const exit=prototype?PROTOTYPE_EXIT_SEAL:STONE_ADVENTURE_COMBAT.boxes.find(b=>b.id==='north-gate')!;
    world.setObstacleBox('north-gate',exit.center,exit.size);
    view.scene.getObjectByName('outpost-pulse-label')!.visible=!prototype;
    view.camera.combat(!!prototype);whipView?.hide();feedback.reset(true);view.resetPresentation();fightView.resetPresentation(!!prototype);
    el('weapon-panel').hidden=!!prototype&&!fight.complement;el('camera-toggle').hidden=!!prototype;
    el('weapon-arc').querySelector('.weapon-name')!.textContent=prototype?'Energiepeitsche':'Arc Lash';
    el('weapon-arc').querySelector('.weapon-type')!.textContent=prototype?'LINKS / RECHTS':'AUTO-FÄCHER';
    el('weapon-arc').title=prototype?'Linksklick: Seitenschwung · Rechtsklick: Überkopf-Knall (längere Erholung)':'Automatischer Energiefächer · kurze Reichweite · halten für weitere Salven';
    el('weapon-panel').querySelector('small')!.textContent=prototype?'Pulse: 12 Schuss pro Versuch · kein Munitionsfund':'Arc zum Start · Pulse am Norddurchgang';
    host.querySelectorAll('footer > span')[1]!.textContent=prototype?'SHIFT · Dash':'SHIFT · Sprint';
    let controls=host.querySelector<HTMLElement>('#whip-controls');
    if(!controls){controls=document.createElement('span');controls.id='whip-controls';host.querySelector('footer')!.append(controls);}
    controls.hidden=!prototype;controls.textContent='Links: Schwung · Rechts: Knall · Luft: Lufthieb · 2× Space: Doppelsprung';
  };
  const resetMissionPrototype=()=>{
    if(entry.profile!=='prototype')return;
    prototype=new prototypeModule!.AdventurePrototype(simulation,false);
    configurePresentation();view.camera.trackPlayer(STONE_ADVENTURE.spawn,1.2,'side');
  };
  const restartLab = (running: boolean) => {
    const started = performance.now(), selection = lab!.selection();
    variant = createAdventureVariant(selection.profile,selection.complement,selection.meleeOnly); fight = variant.fight;
    ({combat,pickups} = fight);
    labModule!.prepareBossAttempt(fight, world, selection.weapon);
    // Simulation.reset intentionally preserves regular-mission tick/facing. A lab attempt gets a fresh clock/state.
    simulation = new Simulation(world, labModule!.LAB_SPAWN, STONE_ADVENTURE_JUMP);
    prototype=selection.profile==='prototype'?new prototypeModule!.AdventurePrototype(simulation,selection.practice):undefined;
    if(prototype?.practice)fight.bossActive=false;
    configurePresentation();
    view.camera.trackPlayer(labModule!.LAB_SPAWN, 1.2, 'side'); bossIntroduced = true;
    placePlayer(labModule!.LAB_SPAWN);
    lab!.begin({ player: current, fight: fight.snapshot(), weapons: combat.snapshot(), pickups: pickups.snapshot(),
      camera: view.camera.mode, audioVoices: feedback.diagnostics().voices }, performance.now() - started, clock.droppedTicks, running);
  };
  window.addEventListener('blur', () => setPaused(true), options);
  window.addEventListener('focus', () => setPaused(menuPaused || document.hidden), options);
  document.addEventListener('visibilitychange', () => setPaused(menuPaused || document.hidden || !document.hasFocus()), options);
  window.addEventListener('resize', () => { view.resize(); if (input.touchEnabled) setPaused(menuPaused || document.hidden || !document.hasFocus()); }, options);
  el('resume').addEventListener('click', () => { menuPaused = false; view.renderer.domElement.focus(); setPaused(false); }, options);
  el('pve-pause').addEventListener('click', () => { menuPaused = true; setPaused(true); }, options);
  el('pve-restart').addEventListener('click', restart, options);
  el('pve-again').addEventListener('click', retry, options);
  el('pve-next').addEventListener('click', () => { if(fight.completed) location.assign(`${location.pathname}?mode=pve&level=frost`); }, options);
  for(const id of ['adventure-home','result-home']) el(id).addEventListener('click',()=>location.assign(location.pathname),options);
  el('camera-toggle').addEventListener('click', () => view.camera.toggle(), options);
  for (const id of ['arc', 'pulse'] as const) el(`weapon-${id}`).addEventListener('click', () => chooseWeapon(id), options);
  function frame(now: number) {
    arrangeTouchMenu();
    const elapsed = Math.max(0, (now-lastTime)/1000); lastTime = now;
    let alpha = 1;
    if (!paused) alpha = clock.advance(elapsed, () => {
      if (lab && !lab.running) return;
      if(fight.life.snapshot().outcome==='defeat' || fight.completed) return;
      const stepStart = lab || import.meta.env.MODE==='environment-test' ? performance.now() : 0;
      const before=fight.snapshot();
      const ray = input.pointer.active ? view.pointerRay(input.pointer.x, input.pointer.y) : null;
      previous = current;
      const pressed=prototype?input.attackPressed():false;
      const secondary=input.secondaryPressed(),canWhip=combat.snapshot().selected==='arc'&&before.pve.outcome==='running';
      const prototypeStep=prototype?.step(input.command(view.camera.basis()),input.dashPressed(),pressed&&canWhip,ray,world,fight.targets(),feedback,before.pve.exchange?.window!=='counter',secondary&&canWhip);
      current=prototypeStep?.current??simulation.step(input.command(view.camera.basis()));
      if (exploration && current.position.y < -6) { current = simulation.reset(); previous = current; view.camera.snap(current.position); }
      if (before.pve.outcome==='victory' && current.position.y < -6) {
        current=simulation.reset({x:0,y:.06,z:-37}); previous=current; view.camera.snap(current.position);
      }
      aim = (!prototype||combat.snapshot().selected==='pulse')&&ray ? solveAim(world, ray, current.position) : null;
      const selected = combat.snapshot().selected;
      const ranged=combat.step(current.tick,(input.fire()||!!prototype&&pressed)&&before.pve.outcome==='running'&&(!prototype||selected==='pulse'&&!prototypeStep!.active),aim,ray,world,exploration?[]:fight.targets(),current.position);
      const attack=prototypeStep?{attacked:prototypeStep.attack.attacked||ranged.attacked,damage:[...prototypeStep.attack.damage,...ranged.damage]}:ranged;
      if(ranged.attacked) feedback.play(selected);
      if(!exploration&&!prototype?.practice) {
        if(interactPending) fight.interact(current.position,world);
        fight.step(current.position,world,attack.damage);
      }
      interactPending=false;
      const after=fight.snapshot(); syncWorld();
      if(after.consoleActive && !before.consoleActive) {
        feedback.play('console');announce('Verbindung steht. Dem Relais fehlt sein Kern. Das Signal kommt aus dem Wächterhof.');
      }
      if(after.reserveRecovered && !before.reserveRecovered){
        feedback.play('pickup');announce('Wartungsreserve geborgen. Am Ruhepunkt gibt es jetzt 75 Rüstung – auch bei erneutem Versuch.');
      }
      if(after.bossActive && !before.bossActive && !bossIntroduced) {
        bossIntroduced=true;announce('Der Kern läuft. Leider hat er Beine.',180);
      }
      if(after.relayActive && !before.relayActive) {
        feedback.play('relay');announce('Außenposten online. Lieferung abgeschlossen. Dieses Mal fast ohne Zwischenfall.');
      }
      if(after.pve.hitsTaken>before.pve.hitsTaken) { feedback.play('hurt'); feedback.playerHit(current.tick); }
      const damage=before.pve.bossHp-after.pve.bossHp;
      if(damage>0) { if(!prototype)feedback.play('hit'); feedback.bossHit(damage,current.tick,!!prototype&&before.pve.exchange?.window!=='counter'); }
      if(after.runners.some((r,i)=>r.hp<before.runners[i]!.hp)) feedback.play('hit');
      if(after.pve.phase==='melee' && before.pve.phase!=='melee') feedback.play('boss-windup');
      if(after.pve.phase==='warning' && before.pve.phase!=='warning') feedback.play(after.pve.kind==='wave'?'wave-warning':'eruption-warning');
      if(after.pve.phase==='melee' && after.pve.phaseTick===fight.life.rules.meleeWarning
        || after.pve.phase==='attack' && before.pve.phase!=='attack') feedback.play('slam');
      if(after.pve.outcome==='victory' && before.pve.outcome!=='victory') feedback.play('victory');
      if(after.checkpoint && !before.checkpoint) feedback.play('pickup');
      if(after.core?.collected && !before.core?.collected) feedback.play('pickup');
      if (current.grounded && !previous.grounded) feedback.play('land');
      else if (previous.grounded && !current.grounded && current.velocity.y > 0) feedback.play('jump');
      else if (current.grounded && Math.hypot(current.velocity.x,current.velocity.z) > 1 && current.tick%22 === 0) feedback.play('step');
      if(after.pve.outcome==='running') pickups.step(current.tick, current, world, (kind, amount) => {
        let accepted: number;
        if (kind === 'ammo' || kind === 'pulse') accepted = combat.addAmmo(amount, kind === 'pulse');
        else if (kind === 'health') accepted=fight.life.restore(amount);
        else accepted=fight.life.restoreArmor(amount);
        if (accepted) feedback.play('pickup'); return accepted;
      });
      if(before.pve.outcome==='running' && after.pve.outcome!=='running' || after.completed && !before.completed) {
        prototype?.suspend();
        input.clear(); combat.clearEffects(); aim=null; previous=current;
      }
      lab?.step(before.pve, after.pve, current, attack.attacked, performance.now() - stepStart);
      lab?.observe(prototype?.snapshot()??null);
      if(import.meta.env.MODE==='environment-test'){
        simulationTimes.push(performance.now()-stepStart);if(simulationTimes.length>600)simulationTimes.shift();
      }
    });
    const weapons = combat.snapshot();
    const state=fight.snapshot(), {hp,armor}=state.pve;
    if (now-lastHud > 70) {
      if(prototype){
        const w=prototype.whip.snapshot();
        input.combatStatus(current.grounded,prototype.motor.jumpSnapshot().available,prototype.motor.snapshot().readyIn===0);
        el('whip-controls').textContent='Links: Schwung · Rechts: Überkopf-Knall · Luft: Lufthieb · 2× Space: Doppelsprung'+
          (weapons.selected==='arc'&&w.readyIn>0&&(w.phase==='recovery'||w.phase==='idle')?` · Erholung ${(w.readyIn/60).toFixed(1)} s`:'');
      }
      const room = stoneRoomAt(current.position);
      if (room) { el('room-name').textContent = prototype&&room.id==='C'?'Ladestation':room.name; el('room-hint').textContent = hints[room.id]!; }
      const guards=state.runners.filter(r=>r.hp>0).length;
      if(!exploration) {
        let objective=guards ? `Anlage reaktivieren · ${guards}/2 Steinläufer sichern die Wartungskonsole im zweiten Hof.` : 'Wartungskonsole im zweiten Hof starten · goldene Markierung.';
        if(!prototype&&!state.consoleActive && !state.runners[0]!.hp && !weapons.ownsPulse && room && ['B','C'].includes(room.id))
          objective='Pulse am Durchgang aufnehmen · danach zur Wartungskonsole.';
        if(state.consoleActive) objective=state.bossActive?'Steinkern bergen · Bezwinge den Wächter!':
          state.checkpoint?'Ruhepunkt gesichert · Betritt den freigegebenen Wächterhof.':'Verbindung steht · Folge der leuchtenden Leitung zum Ruhepunkt.';
        if(room?.id==='D' && !state.bossActive) objective=state.reserveRecovered?
          'Wartungsreserve geborgen · Am Ruhepunkt erhältst du 75 Rüstung.':
          'Optional: Wartungsreserve bergen · 75 Rüstung am Ruhepunkt, auch nach einem Retry.';
        if(state.pve.outcome==='victory') {
          el('room-name').textContent=state.relayActive?'Außenposten online':'Relaisanlage';
          objective=state.relayActive?'Nordtor offen · Verlasse den Außenposten.':state.core?.collected?
            'Steinkern geborgen · Am Relais vor dem Nordtor einsetzen.':'Steinkern beim besiegten Wächter einsammeln · Das Relais braucht seine Energie.';
        }
        el('room-hint').textContent=objective;
        if(prototype?.practice){el('room-name').textContent='Peitschenübung';el('room-hint').textContent=input.touchEnabled?'Feld tippen: Schlag · Knall: schwerer Schlag · Sprung zweimal: Doppelsprung · Luft: Lufthieb':'Links: Schwung · Rechts: Überkopf-Knall · Luft: Lufthieb · Leertaste erneut: Doppelsprung';}
      }
      const interaction=exploration?null:fight.interaction(current.position,world),button=el('mission-interact') as HTMLButtonElement;
      button.hidden=paused || !interaction;
      button.disabled=!interaction?.enabled;
      button.textContent=interaction?`${interaction.enabled && !input.touchEnabled?'E · ':''}${interaction.label}`:'';
      el('adventure-boss').hidden=!state.bossActive || state.pve.outcome==='victory';
      (el('boss-hp') as HTMLProgressElement).max=fight.life.rules.bossHp;el('boss-hp-value').textContent=String(Math.ceil(state.pve.bossHp)); (el('boss-hp') as HTMLProgressElement).value=state.pve.bossHp;
      const messages={emerging:'Der Boden bricht auf …',chasing:'Er verfolgt dich · Bleib in Bewegung!',melee:'FAUSTSCHLAG · Seitlich ausweichen!',
        warning:state.pve.kind==='wave'?'SCHOCKWELLE · Sprung vorbereiten!':'BODENAUSBRUCH · Kreis verlassen!',
        attack:state.pve.kind==='wave'?'JETZT SPRINGEN oder Deckung!':'Einschlag!',recovery:'ERHOLUNG · Jetzt feuern!',defeated:'Steinsiegel gebrochen.'};
      el('adventure-boss').dataset.phase=state.pve.phase;
      el('pve-telegraph').textContent=state.pve.exchange?.window==='counter'?'KERN OFFEN · Voller Schaden!' :prototype&&state.pve.phase==='melee'?'HOHER FAUSTSCHWUNG · Seitlich ausweichen!':prototype&&state.pve.phase==='chasing'?'KERN GESCHÜTZT · Angriff abwarten!':messages[state.pve.phase];
      el('life-status').textContent=exploration?'Der Hof liegt still.':state.pve.outcome==='victory'?state.relayActive?'Relais online · Ausgang offen':'Steinsiegel gebrochen · Relais versorgen':
        state.checkpoint?'Ruhepunkt gesichert':guards?`${2-guards}/2 Steinläufer besiegt`:state.consoleActive?'Weiter zum Ruhepunkt.':'Wartungskonsole starten.';
      el('match-result').hidden=state.pve.outcome!=='defeat' && !state.completed;
      el('result-title').textContent=state.completed?'Der verwitterte Hof ist frei.':'Der Hof bleibt bewacht.';
      el('result-detail').textContent=state.completed?'Steinkern eingesetzt, Relais online. Der Außenposten arbeitet wieder. Dein Weg zur Kristallkluft ist frei.':
        state.checkpoint?'Kehre mit frischen Vorräten zum Ruhepunkt zurück. Die Konsole bleibt aktiv und die beiden Höfe bleiben befreit.':'Nutze die Vorräte und weiche den angekündigten Schlägen aus.';
      if(state.reserveRecovered && (state.completed || state.checkpoint && state.pve.outcome==='defeat'))
        el('result-detail').textContent+=' Wartungsreserve geborgen: 75 Rüstung am Ruhepunkt.';
      el('pve-again').textContent=state.completed?'Level erneut spielen':state.checkpoint?'Am Ruhepunkt versuchen':'Neu versuchen';
      el('pve-next').hidden=!state.completed;
      if (lab) { el('pve-again').textContent='Bossversuch neu starten'; el('pve-next').hidden=true; }
      if (input.touchEnabled) el('camera-toggle').textContent = `Ansicht: ${{side:'seitlich',straight:'gerade',isometric:'isometrisch'}[view.camera.mode]}`;
      el('campaign-story').hidden = exploration || paused || state.completed || state.pve.outcome==='defeat' || current.tick>=messageUntil;
      el('hp-value').textContent = String(hp); el('armor-value').textContent = String(armor);
      (el('hp-bar') as HTMLProgressElement).value = hp; (el('armor-bar') as HTMLProgressElement).value = armor;
      el('ammo-count').textContent = weapons.ownsPulse ? `${weapons.ammo} / ${prototype?12:54}` : '—';
      for (const id of ['arc','pulse']) el(`weapon-${id}`).setAttribute('aria-pressed', String(weapons.selected === id));
      (el('weapon-pulse') as HTMLButtonElement).disabled = !weapons.ownsPulse || weapons.ammo === 0;
      lastHud = now;
    }
    const life: MatchSnapshot = { phase: state.pve.outcome==='defeat' || state.completed?'ended':'running', tick: current.tick, remainingTicks: 0, scores: { blue: 0, red: 0 },
      winner: null, reason: null, actors: { player: { id: 'player', team: 'blue', hp, armor, life: 1, alive: hp>0, respawnTicks: 0, protectionTicks: 0 } } };
    fightView.update(state,view.camera.camera,paused?0:Math.min(elapsed,.05),exploration||!!prototype?.practice);
    if(prototype?.practice)view.scene.getObjectByName('adventure-dormant')!.visible=false;
    missionView.update(state,paused?0:Math.min(elapsed,.05));
    outpostView.update(state);
    environment?.update(state,paused?0:Math.min(elapsed,.05));
    feedback.draw(current.tick, view.projectedPosition(state.pve.center));
    if(prototype)view.camera.combat(true,prototype.practice||!state.bossActive?null:state.pve.center);
    if(prototype)for(const item of STONE_ADVENTURE_PICKUPS)if(item.kind==='pulse'||item.kind==='ammo')view.scene.getObjectByName(`pickup-${item.id}`)!.visible=false;
    const whip=prototype?.whip.sample(alpha,world);
    view.draw(previous,current,alpha,paused ? 0 : Math.min(elapsed,.05),aim,weapons.lastArc,null,life,weapons,pickups.snapshot(),
      prototype?{...prototype.presentation(whip!),whip:weapons.selected==='arc'?prototype.presentation(whip!).whip:undefined,beforeRender:hand=>weapons.selected==='pulse'?whipView!.hide():whipView!.update(whip!,hand,view.actor.position,
        prototype!.aim.snapshot(),!prototype!.practice&&state.bossActive&&state.pve.outcome==='running'?state.pve.center:null,current.tick,prototype!.practice,lab?.reduced??false)}:undefined);
    if (lab && !paused) {
      let objects = 0; view.scene.traverse(() => objects++);
      lab.frame(elapsed * 1000, clock.droppedTicks, { objects, geometries: view.renderer.info.memory.geometries,
        textures: view.renderer.info.memory.textures, programs: view.renderer.info.programs?.length ?? 0,
        audioVoices: feedback.diagnostics().voices });
    }
    frameId = requestAnimationFrame(frame);
  }
  const readDiagnostics=() => ({ mode: 'adventure', level: 'stone', combatProfile: variant.id, combatRules: variant.rules,
      lab: lab?.read() ?? null, snapshot: current, weapons: combat.snapshot(), pickups: pickups.snapshot(),
      prototype:prototype?{...prototype.snapshot(),targetScreens:prototype.snapshot().targets.map(t=>view.projectedPosition({...t.center,y:t.center.y-1.1}))}:null,
      hp:fight.life.snapshot().hp, armor:fight.life.snapshot().armor, pve:fight.life.snapshot(), bossActive:fight.bossActive,
      checkpoint:fight.checkpoint, completed:fight.completed,core:fight.snapshot().core,
      mission:{consoleActive:fight.consoleActive,relayActive:fight.relayActive,reserveRecovered:fight.reserveRecovered,entryClosed:fight.snapshot().entryClosed,
        interaction:fight.interaction(current.position,world)},
      enemies:fight.runners.map(r=>({...r.snapshot(),screen:view.projectedPosition(r.snapshot().center)})),
      monsterScreen:view.projectedPosition({...fight.life.snapshot().center,y:.95}),
      paused, overview, camera: view.camera.mode, section: stoneRoomAt(current.position)?.id,whipVisual:whipView?.diagnostics()??null,
      playerScreen: view.projectedPosition(current.position), feedback: feedback.diagnostics(),fighter:view.fighterDiagnostics(),guards:fightView.guardDiagnostics(),pickupVisuals:view.pickupDiagnostics(),arcVisual:view.arcDiagnostics(),
      viewport: { width: innerWidth, height: innerHeight, dpr: view.renderer.getPixelRatio(), viewHeight: view.camera.camera.top-view.camera.camera.bottom }, renderCalls: view.renderer.info.render.calls,
      ...(import.meta.env.MODE==='environment-test'?{
        environment:environment?.diagnostics()??null,
        renderResources:{...view.renderer.info.memory,triangles:view.renderer.info.render.triangles,objects:(()=>{let n=0;view.scene.traverse(()=>n++);return n;})()},
        simulationTimes:[...simulationTimes],
      }:{}),
    });
  if(import.meta.env.MODE==='environment-test')Object.defineProperty(window,'__coreArena',{
    configurable:true,value:Object.freeze({read:readDiagnostics}),
  });
  if (import.meta.env.MODE === 'test') Object.defineProperty(window, '__coreArena', { configurable: true, value: Object.freeze({
    read:readDiagnostics,
    // Fixed documentation cameras only; no player/health/weapon mutation.
    combatView:(mode:'side'|'straight'|'isometric')=>view.captureCombat(mode),
    guardView:(index=0)=>{
      setPaused(true);el('pause').hidden=true;overview=true;view.camera.snap(fight.runners[index]!.snapshot().center);
      const camera=view.camera.camera;camera.top=3;camera.bottom=-3;camera.left=-3*innerWidth/innerHeight;camera.right=-camera.left;camera.updateProjectionMatrix();
    },
    fighterView:()=>{
      setPaused(true);el('pause').hidden=true;overview=true;view.camera.snap(current.position);
      const camera=view.camera.camera;camera.top=3;camera.bottom=-3;camera.left=-3*innerWidth/innerHeight;camera.right=-camera.left;camera.updateProjectionMatrix();
    },
    courtView: (mode:'side'|'straight'|'isometric'='side',z=27) => {
      setPaused(true); el('pause').hidden=true; overview=true;
      view.camera.mode=mode; view.camera.snap({x:0,y:0,z});
      const camera=view.camera.camera,halfHeight=mode==='side'?13.5:16;
      camera.top=halfHeight;camera.bottom=-halfHeight;
      camera.left=-halfHeight*innerWidth/innerHeight;camera.right=-camera.left;camera.updateProjectionMatrix();
    },
    // Documentation capture only; walkthrough tests still use normal player inputs.
    overview: () => {
      setPaused(true); el('pause').hidden = true; overview = true; view.camera.snap({ x: 0, y: 0, z: -2 });
      const camera = view.camera.camera, halfHeight = view.camera.mode === 'side' ? Math.max(22,45*innerHeight/innerWidth) : 37;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.left = -halfHeight * innerWidth/innerHeight; camera.right = -camera.left; camera.updateProjectionMatrix();
    },
  }) });
  if ((import.meta.env.DEV || import.meta.env.MODE === 'test' || import.meta.env.MODE === 'adventure-preview' || import.meta.env.MODE==='environment-test') && (entry.lab||entry.profile==='prototype')) {
    prototypeModule=await import('./adventurePrototype');
    const {EnergyWhipView}=await import('../render/energyWhipView');
    whipView=new EnergyWhipView(view.scene,prototypeModule.PRACTICE_TARGETS);
  }
  if ((import.meta.env.DEV || import.meta.env.MODE === 'test') && entry.lab) {
    labModule = await import('./adventureLab');
    lab = labModule!.installAdventureLab(host, entry.profile, restart, () => {
      const gl = view.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
      return { userAgent: navigator.userAgent, logicalCpus: navigator.hardwareConcurrency,
        gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable',
        input: input.touchEnabled ? 'touch' : 'mouse-keyboard', viewport: { width: innerWidth, height: innerHeight,
          dpr: view.renderer.getPixelRatio() }, camera: view.camera.mode };
    },entry.complement);
    el('pve-restart').textContent = 'Bossversuch neu starten';
    restartLab(false);
  } else restart();
  document.querySelector('#loading')?.remove(); host.dataset.ready = 'true';
  frameId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(frameId); abort.abort(); lab?.dispose(); environment?.dispose(); feedback.dispose(); input.dispose(); world.dispose(); view.dispose();
    host.querySelectorAll('#hud,#pause,#match-result').forEach(node => node.remove()); Reflect.deleteProperty(window,'__coreArena');
    delete host.dataset.adventure;
  };
}
