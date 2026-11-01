# Arena — klarere Eliminierungen mit Konfetti

Stand: 1. November 2026. Ausgangsstand lokal/GitHub `b6cb7bf`, sauberer
Arbeitsordner. Nutzerwunsch: deutlichere Todesanimation, gern Konfetti.

Die Figur verschwindet beim Tod in einem kurzen Lichtimpuls mit Bodenring und
44 taumelnden Papierstücken: Blau/Cyan beziehungsweise Rot/Koralle, ergänzt um
Weiß und Gold. Die Partikel fliegen auseinander, sinken und verschwinden nach
1,35 Sekunden. Das gilt für Spieler, Verbündete, Gegner und Trainingsziele.
Der bestehende Respawn-Countdown und die vier Sekunden Wartezeit bleiben erhalten.

Ein Effekt pro tatsächlichem Tod; maximal vier gleichzeitig, ein gemeinsamer
Instanzpuffer, keine Schatten, Physikobjekte, zusätzlichen Downloads oder Lichter.
Pause friert den Effekt ein, Neustart entfernt ihn. Die Animation läuft außerhalb
der Match-Uhr und kann deshalb auch nach dem letzten Abschuss ausklingen.

Arena blendet die alte Spieler-Todespose zugunsten der Explosion aus. Adventure
behält seine bestehende Darstellung; dort wird der Konfetti-Renderer nicht erzeugt.
Keine Änderung an HP, Waffen, Kollisionen, Killwertung oder Respawn-Regeln.

## Prüfung

- 69 Kerntests sowie Typecheck, Test- und Produktionsbuild bestanden.
- Desktop 1366 × 768 und Touch-Emulation 667 × 375: tatsächlicher Tod durch den
  Duell-Bot, Teamfarbe/Position, einmaliger Effekt, unsichtbare tote Spielerfigur,
  Pause/Weiter, Partikelende, regulärer Respawn und erneute sichtbare Figur.
- Tatsächlicher Gegnerkill mit Auto-Arc; rotes Konfetti, korrekter Punkt und
  Neustart während der Animation ohne zurückbleibende Partikel.
- 2v2: reguläre Bot-Eliminierung und begrenzte aktive Effekte. Adventure über
  `adventure=1` separat geladen, keine Arena-Todeseffekt-API vorhanden.

Drei Browserfälle bestanden; ausschließlich echte Maus-/Tastatur-/Touch-Eingaben
und lesende Diagnose, keine HP-/Positions-/Ergebnisinjektion.
[Browserbericht](arena-death/browser-report.json),
[Gegnerexplosion Desktop](arena-death/desktop-rival.png),
[Spielertod Touch](arena-death/touch-player.png),
[Respawn Touch](arena-death/touch-respawn.png).
Touch läuft auf der PC-GPU; kein echter Handytest und keine neue Performance-Abnahme.

Reproduktion: `npm test`, `npm run build:test`,
`npx playwright test tests/e2e/arena-death.spec.ts --project=chromium-1366`,
`npm run build`. CTF-3.0, Hexwars und die Adventure-Roadmap bleiben unverändert.

## Veröffentlichter Stand

Spielcode `7be95a3` ist auf `main`; [Pages-Run 41307707782](https://github.com/emfau88/CoreArena-3D/actions/runs/41307707782)
war erfolgreich. Der Live-Build lädt `index-Dvsk0iYH.js` ohne Test-API.
Desktop 1366 × 768 und Touch-Emulation 667 × 375 wurden anschließend erneut mit
echtem Bot-Kill und regulärem Respawn geprüft: keine JavaScript- oder HTTP-Fehler.
[Live-Bericht](arena-death/live.json), [Desktop](arena-death/live-desktop.png),
[Touch-Emulation](arena-death/live-touch.png). Weiterhin kein echter Handytest.
