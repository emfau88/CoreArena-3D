# M2.6 — Technische Arena-Gesamtprüfung

Stand: 31. Oktober 2026. Ausgangsstand lokal und GitHub: `43079cd`, sauberer
Arbeitsordner. Vom Nutzer ausdrücklich freigegeben: Desktop, Touch-Emulation,
Fehlerkorrekturen, Commit und Push. Adventure bleibt separat, L1.5b offen.

**M2.6 technisch abgeschlossen.** 68/68 Kerntests, 30/30 vollständige Botmatches
und 10/10 Browserfälle bestanden. Typecheck inklusive QA-Skript, Testbuild und
Produktionsbuild erfolgreich. Persönliche Spiel-/Geräteabnahme bleibt offen.

## Gefundener und behobener Fehler

Bots konnten nach einer Landung oder einer seitlichen Ausweichbewegung zwischen
physischer Deckung und dem größeren Sicherheitsabstand des Wegplaners stehen.
Der Planer fand dann keinen Startweg und lieferte keine Bewegung, obwohl der
Auftrag noch offen war. In sechs von 30 Ausgangsrunden traten neun Stillstände
von mindestens fünf Sekunden auf: an beiden Gartenbänken und an E1-Kanten.

Die Arena-Navigation führt einen betroffenen Bot nun zuerst aus diesem kleinen
Sicherheitsbereich und plant danach neu. Sie verwendet normale Bewegungsbefehle
mit echter Rapier-Kollision. Keine Teleports, keine andere Sprungkurve, keine
zusätzlichen Stat-Vorteile. Der gemeinsame Boss-Wegplaner und Adventure bleiben
unverändert. Sechs gemessene Problempositionen bilden einen eigenen Regressionstest.

Ein Testablauf lief außerdem über ein kurz zuvor vom Verbündeten geleertes
Pulse-Feld hinweg. Das war kein Pickup-Fehler: Der Ablauf hält nun tatsächlich
auf dem Feld und wartet bei Bedarf auf den normalen Vorrats-Respawn.
[Erster Browserlauf mit diesem Testfehler](m2-6/initial-browser-report.json).
Ältere Menü-/Touch-Tests wurden an das seit M2.5 vorhandene Pausenmenü angepasst.

## Bot-Simulationen

Reproduzierbar mit `npm run qa:arena:soak`. Eine Karte, drei Stufen, jeweils zehn
festgelegte Seeds. Die Seeds variieren ausschließlich sichere Startpositionen
und Blickrichtungen; Regeln und Physik entsprechen dem Spiel. Vier KI-gesteuerte
Akteure testen denselben 2v2-Lebenszyklus; das ersetzt keinen menschlichen Spieler.

Prüfung von Positionen, HP/Rüstung, Munition, gegnerischen Ziel-IDs, echten
Ressourcenaufnahmen, besuchten Höhen und vollständigem Matchende. Stillstand
bedeutet: offener Bewegungsauftrag, mindestens fünf Sekunden ohne 0,5 m räumlichen
Fortschritt. Gewolltes Halten in Schussreichweite zählt nicht als Fehler.
Auch ein Planer, der trotz Auftrag keinen Bewegungsbefehl liefert, wird erfasst.

[Ausgangsrunden mit Fehlerpositionen](m2-6/baseline-soak.json),
[korrigierte Runden und Einzeltraces](m2-6/soak.json).

Nach der Korrektur: **null Stillstände ab fünf Sekunden in allen 30 Runden**,
gültige Positionen und Werte, jedes Match regulär am Abschussziel beendet.
Insgesamt 37,2 Minuten simulierte Spielzeit. Die sechs Problempositionen bestehen
zusätzlich den gezielten Physiktest. [68 Kerntests](m2-6/unit-tests.txt) prüfen
unter anderem Höhenrouten/Ressourcen, faire Reaktionszeiten/Sicht, Teamfilter,
einmalige Killwertung, Respawn-Schutz und Waffen-/Munitionsregeln.

Die Kampfstatistik trennt Waffe, Nähe/Ferne (6 m), aktuelle Sicht und Bewegung.
Schüsse, physische Gegnerkontakte und tatsächlich abgezogene HP/Rüstung werden
getrennt ausgewiesen. Pulse-Kontakte können nach Sichtverlust eintreffen;
Arc erzeugt mehrere Kontakte pro Salve, deshalb ist Kontakte/Salven keine
gewöhnliche Trefferquote. Overkill wird nicht mehrfach als Schaden gezählt.

| Stufe | Rail: Schüsse / Kontakte / Schaden | Pulse: Schüsse / Kontakte / Schaden | Arc: Salven / Kontakte / Schaden |
|---|---|---|---|
| Leicht | 278 / 96 / 5179 | 290 / 140 / 1310 | 678 / 2625 / 17521 |
| Normal | 245 / 170 / 9324 | 334 / 206 / 1871 | 490 / 1640 / 10911 |
| Schwer | 198 / 189 / 10032 | 212 / 148 / 1225 | 401 / 1303 / 8544 |

Aufteilung nach Distanz, Sicht und Bewegung steht je Runde im JSON. Besonders die
Rail wird auf Schwer sehr treffsicher; zusammen mit den kürzeren Runden ist das
ein Grund für den noch offenen persönlichen Schwierigkeitsvergleich. Verdeckte
Kontakte sind keine erlaubte Sicht durch Deckung: fliegende Projektile und der
Zeitpunkt der Kontaktmessung sind getrennt von der Wahrnehmung beim Schuss.

## Browserprüfung

Alle Eingaben per Tastatur/Maus oder echten Chromium-Touch-Events. Die Test-API
ist ausschließlich lesend; kein Schreiben von Positionen, Inventar, HP, Uhr oder
Matchresultat. Browserläufe werden mit Screenshots und JSON-Berichten belegt.

| Vollständige 2v2-Runde | Eingabe / Viewport | Ergebnis Blau:Rot | Reguläres Ende |
|---|---|---|---|
| Leicht | Desktop, 1920 × 1080 | 10:7 | Abschussziel nach 61,0 s |
| Normal | Touch-Emulation, 844 × 390 | 10:2 | Abschussziel nach 42,2 s |
| Schwer | Touch-Emulation, 667 × 375 | 10:4 | Abschussziel nach 46,5 s |

Alle drei Runden mit unveränderten 120-s-/10-Kill-Regeln: Start, tatsächlicher
Tod/Respawn, sauberer Neustart, Bewegung zum Pulse-Feld, Sprung, Waffenwahl,
Schüsse mit Pulse und Arc, Treffer, reguläres Ergebnis und erneuter Neustart.
Zusätzlich durchlief das Training die vollen **7200 Ticks / 120 Sekunden** bis
`00:00` und ließ sich sauber neu starten. Keine beschleunigte Spieluhr.

Die weiteren Fälle prüfen Desktop-/Touch-Höhenrouten E0/E1/E2, Rüstung auf E2,
beide Kameras, Stufenwahl, Menü und überlappungsfreie erreichbare Bedienelemente
bei 667 × 375. 1v1: echter Schaden, eigener Tod/Respawn, Treffer auf bewegten
Gegner, Gegner-Respawn und Neustart. Adventure lädt weiterhin mit `adventure=1`
als separater Modus. Das ist ein Einstiegstest, keine L1.5b-Abnahme.

[Acht abschließende Browserfälle](m2-6/browser-report.json),
[1v1-Regression](m2-6/duel-report.json),
[Desktop-Runde](m2-6/desktop-easy.json),
[Touch Normal](m2-6/touch-normal.json), [Touch Schwer](m2-6/touch-hard.json).
Keine erfassten JavaScript-Fehler in den Match-/Touch-/1v1-Läufen.

Sichtgeprüfte Bilder: [Desktop-Kampf](m2-6/desktop-easy-combat.png),
[Desktop-Ergebnis](m2-6/desktop-easy-result.png),
[Touch-Kampf](m2-6/touch-hard-combat.png),
[kleines Querformat](m2-6/small-hud-small-landscape.png),
[Zeitlimit](m2-6/timeout-time-limit.png).

Der separate Mehrfinger-Test hat bestanden: gleichzeitig bewegen/feuern,
jeweils einen Finger lösen, Touch-Abbruch, Einzeltipp, Sprung, Sprint, Kameramenü,
Hochformatpause und Rückkehr ins Querformat, keine hängenden Eingaben,
manuelle Pause über Tabwechsel sowie Neustart.
[Touch-Steuerungsbericht](m2-6/touch-controls-report.json).

## Laufzeitprofil und Reproduktion

Windows 10.0.26200, AMD Ryzen 7 6800H, 16 logische CPUs, 15,3 GiB RAM,
AMD Radeon Graphics über ANGLE/D3D11, Chromium 156, Node 22.17.1.
Sichtbarer Browser; keine parallele Simulation oder Builds während der finalen
Messrunden. Touch-Geräte-DPR 2, Spielrenderer auf DPR 1 begrenzt.
Das Layout rundet den gemessenen Innenraum teilweise auf 844 × 391 bzw. 668 × 375.

| Runde | Frame-p95 über Stichproben | Simulationsschritt-p95 | Draw Calls |
|---|---|---|---|
| Desktop Leicht | 8,4–11,2 ms | 1,3–1,6 ms | 361–486 |
| Touch Normal | 5,7–8,4 ms | 1,2–1,4 ms | 296–410 |
| Touch Schwer | 5,7–8,4 ms | 1,2–1,5 ms | 309–452 |

Alle fünf Spielsekunden werden die letzten 600 Frame-/Schrittzeiten ausgewertet;
das sind Bereiche der Stichproben, keine Perzentile über den gesamten Lauf.
Der seit Seitenstart kumulierte Dropped-Tick-Zähler endet bei 135/79/65.
Er enthält auch Laden, die vorgelagerte Respawn-Runde und Screenshot-Pausen;
gegenüber der ersten Spielstichprobe kommen 26/13/7 Ticks hinzu. Ab Spielsekunde
14 bleiben alle drei Zähler konstant. Seltene Anlaufhänger sind damit nicht als
abwesend bewiesen. Keine Aussage über echte Smartphone-FPS oder Wärmeverhalten.
Der Produktionsbuild meldet weiterhin die bekannte Bundle-Größenwarnung
(Haupt-JS ca. 5,10 MB, gzip ca. 1,87 MB); kein Buildfehler.

Der fertige Produktionsbuild wurde zusätzlich im Browser unter `/CoreArena-3D/`
gestartet: 2v2, Bewegung, Sprung und Pausenmenü. HTTP 200, keine JavaScript-/HTTP-
Fehler, keine externe CDN-Anfrage und keine `window.__coreArena`-Test-API.
[Produktionsprüfung](m2-6/production-local.json), Hauptbundle `index-B-W8eLcI.js`.

Reproduktion mit `npm test`, `npm run build`, `npm run build:test` und
`npm run qa:arena:soak`. Browser: `npx playwright test tests/e2e/m2-6.spec.ts
tests/e2e/arena-timeout.spec.ts tests/e2e/arena-navigation.spec.ts
tests/e2e/arena-hud.spec.ts tests/e2e/mobile.spec.ts tests/e2e/m2-3.spec.ts
--project=chromium-1366` (als eine Zeile). Preview nutzt `/CoreArena-3D/`.
Screenshots und JSON statt Chromium-Trace: lange GLB-Läufe hatten beim Trace-Export
einen Browser-Blob-Fehler. Die finale Prüfserie lief mit Playwright `retries: 0`.

## Grenzen und nächste Entscheidung

- Die Arena ist asymmetrisch: Pulse, Heilung und beide Höhenvorräte liegen westlich.
  In den korrigierten gleichstarken Botduellen gewinnt Blau bei Leicht 2/10,
  Normal 8/10 und Schwer 10/10. Das ist ein Hinweis auf Zusammenspiel von
  Versorgung, Wegen und KI; kein isolierter Kausalnachweis und keine allgemeine
  menschliche Gewinnwahrscheinlichkeit. Kein ausgewogener Liga-Stand behauptet.
- Der persönliche 10-Minuten-Vergleich Leicht/Normal/Schwer bleibt offen. Er soll
  vor einer größeren CTF-/Liga-Erweiterung insbesondere Versorgung und
  Schwierigkeitsgefühl beurteilen. Map und Waffenwerte wurden hier nicht umgebaut.
- Touch-Emulation läuft auf diesem Windows-Rechner. Echte Android-/iPhone-Tests,
  Wärmeverhalten und persönliche Klang-/Spielabnahme bleiben offen.
- Keine Erweiterung zu M3, keine Adventure-Abnahme. L1.5b, CTF-3.0 und Hexwars
  bleiben unverändert beziehungsweise offen.
