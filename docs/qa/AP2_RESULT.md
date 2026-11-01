# Arena AP2 — HUD und Matchfluss

Stand: 1. November 2026. **Umgesetzt und technisch geprüft.** Ausgangsstand
lokal und auf GitHub: `acbc892`, sauberes Arbeitsverzeichnis. Auftrag: nur AP2;
Adventure bleibt separat, AP3–AP5 und M3–M5 bleiben offen. Persönliches Spiel-/
Gestaltungsurteil und echter Handytest sind weiterhin keine automatische Abnahme.

## Spielergebnis

- Eigener Arena-Einstieg: Obsidian Garden mit einer schematischen Kartenübersicht
  aus den tatsächlichen Geometrie-, Vorrats- und Teamstartdaten. 2v2 startet direkt;
  Bot-Stufe, 1v1 und Training stehen daneben. Adventure ist ausdrücklich als separate
  Spielvariante verlinkt. Die älteren Bosskarten bleiben unter einer aufklappbaren Zeile erreichbar.
- Graphitfarbene, einheitliche Panels für Spielstand/Ziel/Zeit, Teamstatus,
  Vitalwerte und Waffen. Vorhandene Waffenicons bleiben erhalten; Auswahl, Name
  und Munition haben getrennte Plätze. Kein Überlagern von Name und Munitionszahl.
- Auf Touch bleiben Waffen links oben, Spielstand und Menü rechts oben, Vitalwerte
  unten mittig und die Daumenbereiche seitlich frei. Der bisherige Kameraabstand
  bleibt nach Sichtprüfung bei Desktop 1,25 / Touch 1,4; keine neue Zoomänderung.
- Ergebnis mit Gewinner, Endstand, Endegrund, Schwierigkeit und gespielter Zeit.
  Direkte Revanche übernimmt Modus und Bot-Stufe, setzt die Runde aber vollständig zurück.
- Pause bündelt Kamera/Ton/Vollbild/Bot-Stufe, Neustart und Spielauswahl. Die
  Trainingsroute ist im Training über die Trainingshilfe oder B erreichbar.
  Lobby und Ergebnis stapeln kein zusätzliches Pausenfenster. Touch-Kampfbuttons
  verschwinden hinter diesen Ansichten; Tab-Fokus bleibt im aktiven Bildschirm,
  Leertaste/Enter bedienen Buttons statt zugleich einen Sprung auszulösen.

Nur Arena-Markup, Arena-CSS und die Anbindung im Arena-Einstieg ändern sich.
Keine Änderungen an Adventure-Dateien, gemeinsamen HUD-/Touch-Steuerungsdateien,
Kampfwerten, Map, Physik, Assets oder Regeln. Keine neuen Bibliotheken/Downloads.
Die frühere frei begehbare Vorstartansicht ist jetzt eine echte Lobby; Bewegung und
Kampf beginnen über Training, 1v1 oder 2v2. Alte Einstiegstests wurden entsprechend angepasst.

## Browserprüfung

Alle Spielzustände werden ausschließlich gelesen. Eingaben über Maus/Tastatur
oder Chromium-Touch-Events; keine Positionen, HP, Munition, Zeiten oder Ergebnisse injiziert.
Frische Chromium-Sitzungen mit sichtbarem Browser, keine parallel laufenden Builds.

**Acht Hauptfälle bestanden:**

- AP2 Desktop 1366 × 768 und Touch 667 × 375: erreichbare Startauswahl und
  getrenntes Adventure, überlappungsfreie HUD-Panels, Pause mit eingefrorener Uhr,
  Kamera, Tastaturbedienung und 1v1-Einstieg. Touch zusätzlich 844 × 390 sowie
  Rotation nach Hochformat und zurück, sowohl aus manueller Pause als auch laufendem Match.
- Bestehende kleine HUD-Prüfung mit Bot-Stufenwechsel und Neustart.
- AP1 auf Desktop/Touch: Vorräte, Vollmeldungen, Teilaufnahme, Nachladen, Deckung,
  echter Tod/Respawn und Neustart. Separater Adventure-Einstieg weiterhin korrekt.
- Zwei vollständige 2v2-Runden mit realer Bewegung, Sprung, Pulse-Aufnahme/Feuer,
  Auto-Arc, Tod/Respawn, regulärem Ergebnis und Revanche. Anzeigen stimmen mit dem
  tatsächlichen Matchzustand überein; Revanche setzt Leben, Vorräte/Projektile und Score zurück.

| Runde | Viewport / Eingabe | Endstand Blau:Rot | Reguläres Ende |
|---|---|---|---|
| Leicht | 1920 × 1080 / Desktop | 10:4 | Abschussziel nach 68,15 s |
| Schwer | 667 × 375 / Touch-Emulation | 4:10 | Abschussziel nach 58,58 s |

**Neun ergänzende Einstieg-/Regressionsläufe bestanden:** die beiden AP2-UI-Fälle
erneut nach Erhalt der zugänglichen Buttonnamen sowie sieben Bewegungs-/Trainingsfälle:
beide Kameras, Wandkontakt/Gleiten, echter Fokusverlust, Resize, direkter E1/E2-Sprung,
Höhenroute mit tatsächlichen Pulse-Treffern/Deckung und Routenprobe sowie unabhängige
Touch-Finger, Abbruch, Sprung, Rotation und Neustart. Der alte M1-Test prüft jetzt
echten Pulse-Schaden statt des früheren Vorstart-Diagnosestrahls. Insgesamt 15
verschiedene Browserfälle; die zwei Wiederholungen sind keine zusätzlichen Funktionen.

[Hauptbericht](arena-ap2/browser-report.json),
[ergänzende Prüfungen](arena-ap2/entry-regression-report.json).
Keine JavaScript-/HTTP-Fehler in den AP2-UI-Abläufen, keine erfassten JavaScript-Fehler
in beiden vollständigen Runden und den Eingabeprüfungen.

Bei der ersten Sichtprüfung verdeckte die Bodenfläche der SVG-Übersicht deren
Höhenflächen; die Vorschau zeichnet nun nur Ausstattung über ihrem eigenen Boden.
Im kleinen Touch-Einstieg wurde außerdem eine redundante Überschrift entfernt
und das Adventure-Ziel auf mindestens 44 px Höhe gebracht. Die Kernaktionen sind
ohne Scrollen erreichbar; der untere Archivbereich bleibt bei kleiner Höhe scrollbar.

## Spielaufnahmen und Grenzen

[Desktop-Einstieg](arena-ap2/desktop-lobby.png), [Touch-Einstieg](arena-ap2/touch-lobby.png),
[Desktop-HUD](arena-ap2/desktop-hud.png), [Touch-HUD](arena-ap2/touch-hud.png),
[Touch-Pause](arena-ap2/touch-pause.png),
[Desktop-Kampf](arena-ap2/desktop-combat.png), [Touch-Kampf](arena-ap2/touch-combat.png),
[Desktop-Ergebnis](arena-ap2/desktop-result.png), [Touch-Ergebnis](arena-ap2/touch-result.png),
[separates Adventure](arena-ap2/touch-adventure-separate.png).
Vorher: [AP1-Aufnahmen](AP1_RESULT.md).

Renderframe-p95 in den Match-Stichproben: Desktop 8,4–11,3 ms,
Touch-Emulation 5,6–11,0 ms; 462–593 beziehungsweise 371–529 Zeichenaufrufe.
Das sind wechselnde Spielsituationen auf der PC-GPU, kein kontrollierter
Vorher/Nachher-Benchmark und keine Handy-FPS-Messung. Zwei Runden sind kein neuer
Balance-Nachweis; die vorhandene Seitenbalance-Abnahme bleibt offen.

## Kernprüfungen und Produktionsbuild

**69/69 Kerntests bestanden.** Typecheck, Testbuild und Produktionsbuild erfolgreich.
Die bestehende Vite-Warnung zum großen Hauptbundle bleibt: rund 5,116 MB / gzip
1,880 MB. AP2 ergänzt keine 3D-Assets; die Kartenübersicht ist ein kleines SVG.

Der lokale Produktionsbuild wurde zusätzlich in frischen Desktop- und
Touch-Browsern geprüft: Einstieg → 2v2 → Bewegungs-/Sprungeingaben → Pause/Weiter
→ Spielauswahl → separates Adventure mit `adventure=1`. Keine JavaScript-/HTTP-Fehler,
HTTP 200; Bundle `index-ChAzrrCz.js`, Testdiagnose `__coreArena` nicht enthalten.
[Produktionsbericht](arena-ap2/production-local.json),
[Desktop-Einstieg](arena-ap2/production-local-desktop-lobby.png),
[Touch-HUD](arena-ap2/production-local-touch-hud.png).
Das ist ein ergänzender Produktions-Smoke-Test; vollständige Runden siehe oben.

**Veröffentlicht und live geprüft:** Spielcommit
[`c1aeae3`](https://github.com/emfau88/CoreArena-3D/commit/c1aeae3ddd7dc059fc22f97c0767463756a4bd68),
[erfolgreicher GitHub-Pages-Lauf](https://github.com/emfau88/CoreArena-3D/actions/runs/41319682799).
Auf der [öffentlichen Arena](https://emfau88.github.io/CoreArena-3D/) bestanden
dieselben Produktions-Stichproben auf Desktop und Touch: identisches Bundle
`index-ChAzrrCz.js`, HTTP 200, Einstieg/2v2/Eingaben/Pause/Spielauswahl/Adventure,
keine JavaScript-/HTTP-Fehler und keine freigeschaltete Testdiagnose.
[Live-Bericht](arena-ap2/live.json), [Desktop-Einstieg](arena-ap2/live-desktop-lobby.png),
[Touch-HUD](arena-ap2/live-touch-hud.png). Kein echter Handytest.

## Reproduktion

```powershell
npm test
npm run build:test
npx playwright test tests/e2e/arena-ap2.spec.ts tests/e2e/arena-hud.spec.ts tests/e2e/m2-6.spec.ts tests/e2e/arena-ap1.spec.ts --project=chromium-1366 --grep 'AP2|small landscape|desktop easy full|touch hard full|AP1'
npx playwright test tests/e2e/m0.spec.ts tests/e2e/m1.spec.ts tests/e2e/mobile.spec.ts tests/e2e/arena-ap2.spec.ts --project=chromium-1366 --trace=off
npm run build
```

Nächster geplanter Bulk: AP3 (Figuren und Waffenpräsentation), nicht freigegeben.
