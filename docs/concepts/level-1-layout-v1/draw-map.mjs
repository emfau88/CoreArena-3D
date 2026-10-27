import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

// Planning illustration only. These shapes do not configure the game.
const dir = dirname(fileURLToPath(import.meta.url));
const parts = [];
const X = x => 540 + x * 19;
const Y = z => 720 + z * 19;
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x, y, s, size = 20, fill = '#eae9db', extra = '') => parts.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`);
const rect = (x, y, w, h, fill, stroke = 'none', sw = 1, radius = 0) => parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const room = (x, z, w, d, fill = '#373d31') => rect(X(x), Y(z), w * 19, d * 19, fill, '#d1caaa', 7, 2);
const floor = (x, z, w, d) => rect(X(x), Y(z), w * 19, d * 19, '#373d31');
const worldRect = (x, z, w, d, fill, stroke = 'none', sw = 1) => rect(X(x), Y(z), w * 19, d * 19, fill, stroke, sw);
const path = (coords, color, dashed = false, width = 5, marker = true) => parts.push(`<polyline points="${coords.map(([x,z]) => `${X(x)},${Y(z)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="10 8"' : ''} ${marker ? `marker-end="url(#${color === '#70c7c8' ? 'blueArrow' : 'goldArrow'})"` : ''}/>`);
const badge = (x, z, letter, label, optional = false) => {
  parts.push(`<circle cx="${X(x)}" cy="${Y(z)}" r="19" fill="${optional ? '#254b51' : '#ded4ad'}" stroke="${optional ? '#70c7c8' : '#ded4ad'}" stroke-width="2"/>`);
  text(X(x), Y(z) + 7, letter, 21, optional ? '#e7ffff' : '#1b2527', 'font-weight="700" text-anchor="middle"');
  if (label) text(X(x) + 30, Y(z) + 7, label, 20);
};
const unit = (x, z, kind, optional = false) => {
  const fill = optional ? '#773f4c' : '#b74e4a';
  const cx = X(x), cy = Y(z);
  if (kind === 'W') parts.push(`<circle cx="${cx}" cy="${cy}" r="17" fill="${fill}" stroke="#f5a29a" stroke-width="2"/>`);
  else parts.push(`<path d="M ${cx} ${cy-21} L ${cx+19} ${cy} L ${cx} ${cy+21} L ${cx-19} ${cy} Z" fill="${fill}" stroke="#f5a29a" stroke-width="2"/>`);
  text(cx, cy + 6, kind, 17, '#fff3e9', 'text-anchor="middle" font-weight="700"');
};
const item = (x, z, kind, qty) => {
  const colors = { P: '#d1b2ff', M: '#e2c780', '+': '#87dab1', S: '#90c5df' };
  rect(X(x)-15, Y(z)-15, 30, 30, '#15272c', colors[kind], 2, 6);
  text(X(x), Y(z)+6, kind, 19, colors[kind], 'text-anchor="middle" font-weight="700"');
  if (qty) text(X(x)+23, Y(z)+6, qty, 17, colors[kind]);
};
const gate = (x1, x2, z, color) => {
  worldRect(x1, z-.12, x2-x1, .24, color);
  for (let x = x1; x <= x2; x += .5) worldRect(x-.06, z-.45, .12, .9, color);
};

parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1460" viewBox="0 0 1600 1460"><defs>
<pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M 38 0 H 0 V 38" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern>
<marker id="goldArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#e3bd64"/></marker>
<marker id="blueArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#70c7c8"/></marker>
</defs><g font-family="Segoe UI, Arial, sans-serif">`);
rect(0, 0, 1600, 1460, '#121f23');
text(62, 55, 'CORE ARENA / LEVEL 01', 19, '#a5c3c5', 'letter-spacing="3"');
text(62, 108, 'Der verwitterte Hof', 42, '#f1efdf', 'font-weight="700"');
text(62, 145, 'Geplante Draufsicht · feste Begegnungen · vorhandene Bausteine', 22, '#a8b4b0');
rect(60, 180, 950, 1150, '#1a2a2c', '#34464a', 1, 14);
rect(78, 198, 914, 1114, 'url(#grid)');
rect(1040, 180, 500, 1150, '#1a2a2c', '#34464a', 1, 14);

// Connected floor footprints: north is up, coordinates match the written plan.
room(-5, 17, 10, 6); // A
room(-14, 9, 10, 7); // B
room(-16, 4, 8, 4); // C
room(-21, -3, 8, 6, '#526051'); // D, raised
room(-6, -3, 18, 10); // E
room(-4, -7, 8, 3.5); // F
room(-11, -21, 22, 14); // G
room(-3, -24, 6, 3); // H
// Open passages over room outlines, with visible jambs left at each side.
floor(-9, 15, 5, 4); floor(-5, 17, 2, 2);
floor(-12, 7.7, 3, 1.6);
floor(-16, 2.7, 2.4, 1.6);
floor(-8.3, 4.1, 2.6, 2);
floor(-2, -3.8, 4, 1.1);
floor(-2, -7.3, 4, .6);
floor(-2, -21.3, 4, .6);

// Reachable platforms, clear stair treads, and small cover blocks.
for (let i = 0; i < 4; i++) worldRect(-16, 3.5-i*.45, 2.4, .28, '#b5b899', '#e2d7b4');
worldRect(6.7, -2.5, 4.5, 2.5, '#6c7460', '#d8d5b5', 3);
for (let i = 0; i < 3; i++) worldRect(7.1, .1+i*.35, 2, .21, '#c5c5a3');
worldRect(-10, -12.2, 3.1, 3.8, '#6c7460', '#d8d5b5', 3);
for (let i = 0; i < 3; i++) worldRect(-6.7+i*.35, -10.7, .2, 1.8, '#c5c5a3');
for (const [x,z,w,d] of [[-13,10,2,1],[-7,14,2,1],[-4.5,1.5,1.5,2],[5,3,1.4,2],[1,-1.5,1.3,1.3],[-6,-17,1.5,1.5],[5,-12,1.5,1.5]]) worldRect(x,z,w,d,'#b7b593','#e4ddbb',2);

// Main and optional routes avoid drawn cover; arrows indicate intended progression.
path([[0,20],[-3.5,18],[-6.5,18],[-9,14],[-9,10.5],[-10.5,8.4]], '#e3bd64');
path([[-11,6],[-7,5.2],[-1,5.2],[2,3.3],[2,0],[-1.8,0],[-1.8,-3],[0,-5]], '#e3bd64');
path([[0,-5.3],[0,-8.7],[2.5,-10],[3,-14],[2,-18.5],[0,-20],[0,-23]], '#e3bd64', true);
path([[-13,5.8],[-14.8,4.2],[-14.8,2.5],[-17,1.4]], '#70c7c8', true);
text(X(-20.5), Y(3.2), 'hin / zurück', 16, '#91d8d8');

// Exactly six runners (two optional), one thrower and one boss.
unit(-11.5, 12, 'L'); unit(-6.3, 11, 'L');
unit(-19, -.6, 'L', true); unit(-15.3, -.7, 'L', true);
unit(-1.9, 3.1, 'L'); unit(7, 2.2, 'L'); unit(9, -1.2, 'W');
parts.push(`<circle cx="${X(0)}" cy="${Y(-14)}" r="43" fill="#5b5137" stroke="#dfb971" stroke-width="3"/><path d="M${X(0)} ${Y(-14)-31} L${X(0)+27} ${Y(-14)} L${X(0)} ${Y(-14)+31} L${X(0)-27} ${Y(-14)} Z" fill="#bba77b"/>`);
text(X(0), Y(-14)+7, 'B', 22, '#222b27', 'font-weight="700" text-anchor="middle"');
text(X(0), Y(-16.9), 'STEINWÄCHTER', 19, '#e6d29a', 'text-anchor="middle" font-weight="700"');
text(X(0), Y(-11.1), 'erscheint nach Aktivierung', 16, '#bfc2af', 'text-anchor="middle"');

item(-14.1, 6, 'P', '54');
item(-19.7, 1.4, '+', '35'); item(-19.7, -2, 'S', '30'); item(-15.9, -2, 'M', '27');
item(8.3, 5.7, 'M', '27');
item(-8.5, -18.6, 'M', '18'); item(8.3, -9, 'M', '18'); item(-8.4, -10.2, '+', '35');

gate(-2,2,-21,'#d8bf79'); gate(-2,2,-7,'#d58e68');
parts.push(`<circle cx="${X(0)}" cy="${Y(-8.2)}" r="15" fill="#342d23" stroke="#eac474" stroke-width="3"/>`);
text(X(0), Y(-8.2)+6, 'E', 17, '#eac474', 'text-anchor="middle" font-weight="700"');
parts.push(`<circle cx="${X(0)}" cy="${Y(20)}" r="17" fill="#82d5c2" stroke="#e2fff4" stroke-width="3"/>`);
text(X(0), Y(20)+6, '▶', 17, '#183e3a', 'text-anchor="middle"');

badge(-3.7, 21.8, 'A', 'Start');
badge(-13, 15, 'B', '2 Läufer');
badge(-15, 4.6, 'C', 'Pulse');
badge(-20, -4.5, 'D', 'OPTIONAL · +1,1 m', true);
badge(-5, 7.9, 'E', '2 Läufer + 1 Werfer');
badge(5.4, -5.4, 'F', 'Checkpoint');
badge(-10, -19.9, 'G', 'Wächterhof');
badge(4, -23, 'H', 'Nordtor');
text(X(9), Y(-3.6), '+0,8 m', 16, '#e1d9b5', 'text-anchor="middle"');
text(X(-8.4), Y(-12.7), '+1,1 m', 16, '#e1d9b5', 'text-anchor="middle"');
path([[1,-8.2],[11.7,-8.2]], '#eccd8f', false, 1, false);
text(X(12.1), Y(-8.6), 'Siegel: E / Touch', 17, '#eccd8f');
text(X(12.1), Y(-7.4), 'Zugang schließt', 16, '#d0a28a');
text(X(-3.7), Y(23.9), 'Arc · 100 HP · 50 Rüstung', 18, '#9ed5c7');
text(X(-.5), Y(-24.7), '→ Kristallkluft nach Sieg', 18, '#ead7a3', 'text-anchor="middle"');

text(875, 230, 'N', 24, '#d9dbc7', 'text-anchor="middle" font-weight="700"');
parts.push('<path d="M875 242 V293 M865 255 L875 242 L885 255" fill="none" stroke="#a9bcb8" stroke-width="3"/>');
text(91, 1248, 'Planungsraster: 2 m', 17, '#8fa5a3');
text(91, 1279, 'Zielgröße ca. 44 × 48 m · Grundriss / Abstände noch abstimmbar', 17, '#a9b9b3');

// The right column supplies precise counts and pickup rules without map clutter.
text(1070, 225, 'SPIELABLAUF', 19, '#9fbfc0', 'letter-spacing="2" font-weight="700"');
text(1070, 266, '5 Pflichtgegner + 2 optional + Boss', 23, '#f1dfb6', 'font-weight="700"');
text(1070, 299, 'Hauptweg: A → B → C → E → F → G → H', 19);
text(1070, 329, 'Erkunden: C → D → C', 19, '#92d9d9');
const notes = [
  ['A   Sicher ankommen', ['Arc ausgerüstet. Ruinen und Nordtor', 'geben von Beginn an die Richtung vor.']],
  ['B / C   Erste Begegnung & Waffe', ['2 Steinläufer hinter niedriger Deckung.', 'Danach Pulse mit 54 Schuss am Hauptweg.']],
  ['D   Kleiner lohnender Umweg', ['Sichtbare Stufen auf die Seitenterrasse.', '2 Läufer · +35 HP / +30 Rüstung / +27 Ammo.']],
  ['E   Gemischte Dreiergruppe', ['2 Läufer + 1 Werfer auf niedrigem Sockel.', 'Seitenmauern blocken Würfe. +27 Ammo.']],
  ['F   Ruhepunkt vor dem Boss', ['Öffnet nach den 5 Pflichtgegnern.', 'Checkpoint: 100 HP / 50 Rüstung / 54 Ammo.']],
  ['G   Boss bewusst wecken', ['E / Touch am Siegel startet den Kampf.', '2 × 18 Ammo; +35 HP auf Seitenplateau.']],
  ['H   Weiterreise', ['Nach dem Sieg öffnet sich das Nordtor.', 'Durchgehen führt in die Kristallkluft.']],
];
let y = 385;
for (const [heading, lines] of notes) {
  text(1070, y, heading, 21, '#e5e2cc', 'font-weight="700"');
  text(1070, y+29, lines[0], 18, '#b9c7c0');
  text(1070, y+55, lines[1], 18, '#b9c7c0');
  y += 99;
}
rect(1070, 1088, 440, 1, '#3c5051');
text(1070, 1120, 'LEGENDE', 18, '#9fbfc0', 'letter-spacing="2" font-weight="700"');
text(1070, 1154, '◆ L  Steinläufer       ● W  Steinwerfer', 18, '#f2a49b');
text(1070, 1187, 'P  Pulse   M  Munition   +  HP   S  Rüstung', 18, '#cbd8c1');
text(1070, 1220, 'Gold: Hauptweg   Türkis: optional', 18, '#c9cba8');
text(1070, 1253, 'Helle Flächen: Plateau mit sichtbaren Stufen', 17, '#d0d0b6');
text(1070, 1286, 'Boss + kleine Gegner hier nur als Planmarker.', 17, '#a3b5ae');
text(62, 1382, 'ENTWURF · noch nicht im Spiel umgesetzt', 22, '#e0c086', 'font-weight="700"');
text(62, 1419, 'Alle Gegnerpositionen zur Übersicht sichtbar. Im Spiel werden nur die jeweiligen Abschnitte aktiv; der Boss ruht bis zum Siegel.', 20, '#a6b8b1');
parts.push('</g></svg>');
await writeFile(join(dir, 'map-sketch.svg'), parts.join('\n'));

if (process.argv.includes('--render')) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1460 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body {margin:0;background:#121f23}</style>${await readFile(join(dir, 'map-sketch.svg'), 'utf8')}`);
  await page.screenshot({ path: join(dir, 'map-sketch.png'), fullPage: true });
  await browser.close();
}
