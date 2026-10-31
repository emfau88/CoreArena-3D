# Arena-Ausbau: Karte, Railgun und Teamstarts

Stand: 31. Oktober 2026. Umgesetzt und technisch geprüft, persönliche Handyabnahme offen.

- Spielfläche 56 × 36 statt 44 × 28 m: rund 64 % mehr Fläche. Zwei zusätzliche
  Railgun-Felder auf den Außenflanken; vorhandene Höhenflächen bleiben bestehen.
- Blau startet links, Rot rechts. Teammitglieder stehen 6 m auseinander;
  gespiegelte Startplätze liegen 28 m auseinander und sind frei von Deckung.
- Railgun: 70 Schaden, 40 m Reichweite, sechs Schuss, 1,4 s Schussabstand.
  Direkter räumlicher Trefferstrahl; erste Wand/Figur stoppt ihn. Kein Freundschaden.
  Taste 3, Mausrad oder Touch-Waffenbutton. Leerfeuern fällt auf Arc zurück.
- Spieler und Bots können beide Felder sammeln. Bestehende Bodennavigation
  führt Bots um Hindernisse. Höhen, Ressourcenplanung und Schwierigkeiten folgen
  mit dem inzwischen freigegebenen M2.4b.
- Kamera folgt der größeren Karte. Sichtfeld gegenüber dem früheren Arena-Stand
  linear um 25 % auf Desktop und 40 % auf Touch erweitert. Spielendes HUD leichter.
  Vollständiger HUD-/Arena-Feinschliff folgt im freigegebenen M2.5.
- Rail ist ausdrücklich für Arena aktiviert; Adventure behält Arc/Pulse und seine
  Missionskette. Keine Änderungen an CTF-3.0 oder Hexwars. Eigenes prozedurales Waffenmodell.

## Prüfungen

64 Kerntests bestanden; zusätzliche Prüfung der endgültigen Spawn-Abstände und
Hindernisfreiheit bestanden. Typecheck und Produktionsbuild bestanden.

Drei Browserfälle bestanden: Desktop (1366 × 768), Touch-Emulation (844 × 390,
DPR 2) sowie Adventure-Einstieg ohne Rail. Echte Tastatur-/Maus- bzw. Mehrfinger-
Touch-Eingaben, keine Positions-/Lebens-/Munitionsmanipulation.

Beide Außenflanken tatsächlich angelaufen, Rail gesammelt, erhöhtes Ziel getroffen,
Munition verbraucht und neu gesammelt. Vollständige 2v2-Runden endeten jeweils
10:8; auch Bots sammelten Rail. Neustart setzt Inventare zurück, keine Browserfehler.

Ein früherer Touch-Lauf zeigte ein erhöhtes Ziel außerhalb des Bildes. Größeres
Sichtfeld korrigiert; endgültiger Test prüft Sichtbarkeit und tatsächlichen Treffer.
Die ursprüngliche Erwartung eines weiterhin toten Trainingsziels nach sechs
langsamen Schüssen wurde korrigiert: sein regulärer Respawn war bereits erfolgt.

[Browserbericht](arena-expansion/browser-report.json),
[Desktop-Messung](arena-expansion/desktop-match.json),
[Touch-Messung](arena-expansion/touch-match.json),
[Touch-Kampf](arena-expansion/touch-team-combat.png),
[Touch-Railtreffer](arena-expansion/touch-rail-shot.png).

Kein echter Smartphone-Test. M2.6-Gesamtabnahme bleibt offen.
