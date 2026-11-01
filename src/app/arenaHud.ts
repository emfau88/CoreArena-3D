import { EXPANDED_ARENA, EXPANDED_PICKUPS, TEAM_SPAWNS } from '../arena/expandedArena';
import { weaponHud, lifeHud } from './hud';

/** A static overview from the playable map data, not a second map definition. */
function mapPreview(): string {
  const blocks = EXPANDED_ARENA.boxes.filter(b => b.material !== 'floor').map(b => `<rect x="${b.center.x - b.size.x / 2}" y="${b.center.z - b.size.z / 2}" width="${b.size.x}" height="${b.size.z}" rx=".2" fill="${b.planted ? '#617866' : b.level?.startsWith('E2') ? '#81928d' : b.level ? '#52666e' : '#36444b'}" stroke="#afc3c144" stroke-width=".15"/>
    ${b.level ? `<text x="${b.center.x}" y="${b.center.z + b.size.z / 2 - .6}" text-anchor="middle" fill="#e1ece6" font-size="1.2">${b.level.slice(0, 2)}</text>` : ''}`).join('');
  const supplies = EXPANDED_PICKUPS.map(p => `<circle cx="${p.position.x}" cy="${p.position.z}" r=".55" fill="${p.kind === 'rail' ? '#edc783' : p.kind === 'health' ? '#a6d7b5' : '#b9d8e4'}"/>`).join('');
  const spawns = Object.entries(TEAM_SPAWNS).map(([id, p]) => `<circle cx="${p.x}" cy="${p.z}" r="1.2" fill="none" stroke="${id === 'player' || id === 'ally' ? '#8fceef' : '#e7a28c'}" stroke-width=".4"/>`).join('');
  return `<svg viewBox="-29 -19 58 38" role="img" aria-label="Obsidian Garden: zwei Teamstarts je Seite, Höhenflächen in der Mitte und Railgun auf beiden Flanken">
    <rect x="-28" y="-18" width="56" height="36" rx=".7" fill="#1a252b" stroke="#82948e" stroke-width=".3"/>
    <path d="M-27 -17H-17V17H-27Z" fill="#86caff0a"/><path d="M17 -17H27V17H17Z" fill="#efa2800a"/>
    ${blocks}${supplies}${spawns}
    <text x="-24" y="15" fill="#8fceef" font-size="1.5">BLAU</text><text x="20" y="15" fill="#e7a28c" font-size="1.5">ROT</text>
  </svg>`;
}

export function arenaHud(): string {
  return `<div id="hud">
    <section id="arena-lobby" aria-labelledby="arena-title">
      <div class="arena-map-card"><span class="eyebrow">CORE ARENA / 01</span><h1 id="arena-title">Obsidian Garden</h1>
        <p class="arena-tagline">Deckung nutzen. Höhe gewinnen.</p>
        <div class="arena-map-preview">${mapPreview()}</div>
        <div class="arena-map-facts"><span>56 × 36 m</span><span>3 Höhenebenen</span><span>3 Waffen</span></div>
        <p class="arena-map-key"><i></i> Teamstarts <i></i> Vorräte · Railgun außen</p>
      </div>
      <div class="arena-start-card"><span class="eyebrow">ARENA / GEGEN BOTS</span><h2>Dein nächstes Match.</h2>
        <p class="arena-rules">Du + ein blauer Verbündeter gegen zwei rote Bots.<br>10 Teamabschüsse oder 2 Minuten · kein Freundschaden.</p>
        <label id="difficulty-control">Bot-Stufe <select id="bot-difficulty" aria-label="Bot-Schwierigkeit"><option value="easy">Leicht</option><option value="normal" selected>Normal</option><option value="hard">Schwer</option></select></label>
        <button id="team-start" class="arena-primary" type="button">2v2-Teamspiel starten <span aria-hidden="true">→</span></button>
        <div class="arena-alternatives"><button id="bot-start" type="button" aria-label="Botmatch starten">1v1 · Botduell</button><button id="match-start" type="button" aria-label="Trainingsmatch starten">Training</button></div>
        <p class="arena-input-hint"><span class="desktop-copy">WASD bewegen · Maus halten zum Feuern · Leertaste springen</span><span class="touch-copy">Links bewegen · Spielfeld halten zum Feuern · rechts springen</span></p>
        <div class="arena-other-mode"><span class="eyebrow">SEPARATE SPIELVARIANTE</span><button id="adventure-start" type="button">Adventure: Der verwitterte Hof <span aria-hidden="true">↗</span></button>
          <details><summary>Ältere Bosskarten</summary><button id="pve-start" type="button">Mini-Kampagne: Die drei Siegel</button></details></div>
      </div>
    </section>
    <div id="match-panel" hidden><div class="eyebrow" id="match-mode">2v2 · ZIEL 10</div>
      <div id="match-score"><span class="blue"><span id="blue-label">BLAU</span><b id="blue-score">0</b></span><time id="match-time">02:00</time><span class="red"><b id="red-score">0</b><span id="red-label">ROT</span></span></div>
      <small id="team-status" hidden></small></div>
    <div id="weapon-panel" hidden aria-label="Waffenauswahl">${weaponHud(false, true)}<small id="weapon-hint"></small></div>
    <div id="life-panel" hidden aria-label="Lebenspunkte und Rüstung">${lifeHud}<p id="life-status" role="status"></p></div>
    <button id="arena-menu" type="button" hidden aria-label="Spiel pausieren und Menü öffnen">Menü <kbd>Esc</kbd></button>
  </div>
  <div id="pause" role="dialog" aria-modal="true" aria-labelledby="pause-title" hidden><div><span class="eyebrow">ARENA / PAUSE</span><h2 id="pause-title">Kurz durchatmen.</h2>
    <button id="resume" class="arena-primary" type="button">Weiterspielen</button>
    <div id="arena-settings"><button id="match-restart" type="button" hidden>Runde neu starten</button><button id="arena-home" type="button">Spielauswahl</button>
      <button id="camera-toggle" type="button"><span id="camera-label">Gerade Ansicht</span></button></div>
    <p class="arena-controls"><span class="desktop-copy">WASD · Bewegung / Shift · Sprint / Leertaste · Sprung<br>1–3 · Waffen / V · Ansicht / F · Vollbild</span><span class="touch-copy">Links bewegen · rechts springen / Sprint umschalten<br>Spielfeld halten · feuern / Waffen oben wählen</span></p>
    <small>Bot-Stufe gilt ab der nächsten Runde.</small>
    <details id="arena-training-tools" hidden><summary>Trainingshilfe</summary><div id="practice-status"><span id="height-status">E0</span><span id="hit-count" hidden></span></div><button id="probe-start" type="button">Route zeigen</button><small id="probe-status">Goldene Figur · E0 → E1 → E2 → E0</small></details>
  </div></div>
  <div id="match-result" role="dialog" aria-modal="true" aria-labelledby="result-title" hidden><div><span class="eyebrow">OBSIDIAN GARDEN / ERGEBNIS</span><h2 id="result-title"></h2>
    <div class="arena-result-score" aria-label="Endstand"><span class="blue"><small id="result-blue-label">DEIN TEAM</small><b id="result-blue">0</b></span><span class="result-divider">:</span><span class="red"><small id="result-red-label">GEGNER</small><b id="result-red">0</b></span></div>
    <p id="result-detail"></p><p id="result-context"></p><div class="arena-result-actions"><button id="result-restart" class="arena-primary" type="button">Revanche starten</button><button id="result-arena-home" type="button">Spielauswahl</button></div>
  </div></div><pre id="diagnostics" hidden></pre>`;
}
