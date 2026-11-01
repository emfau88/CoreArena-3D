# L1.5b — Adventure-Gesamtprüfung

Stand: **1. November 2026**. Ausgangsstand lokal und GitHub `80da368`, sauberer
Arbeitsordner. L1.5b anschließend ausdrücklich freigegeben. Geprüft wird das
Stein-Adventure mit **`mode=pve&level=stone&adventure=1`**, nach L1.6a–c.
Arena bleibt eine getrennte Spielvariante; CTF-3.0 und Hexwars bleiben unverändert.

**L1.5b technisch abgeschlossen.** Vollständige Missionsläufe auf Desktop und in
Touch-Emulation, mit und ohne Reserve, dazu neun aktuelle Bossvergleiche.
Persönliche Spiel-/Handyabnahme bleibt ausdrücklich offen.

## Gezielte Korrektur

Eine manuell geöffnete Adventure-Pause wurde auf Touch nach Hoch-/Querformatwechsel
automatisch geschlossen: `resize` berechnete die Pause nur aus Fokus und Ausrichtung.
Der bestätigte Fehler ist im [Ausgangstest](l1-5b/pause-before.json) dokumentiert.

Adventure merkt nun den ausdrücklich geöffneten Menü-/Pausenzustand. Er bleibt
bei Fokuswechsel und Rotation erhalten, bis „Weiter“ oder ein Neustart gewählt
wird. Die automatische Hochformatpause während des laufenden Spiels funktioniert
weiter; beim Zurückdrehen läuft nur ein zuvor nicht manuell pausiertes Spiel an.
Alle Eingaben werden beim Übergang weiterhin freigegeben. Die Änderung liegt
ausschließlich im Adventure-Einstieg, ohne Änderung an Arena oder gemeinsamer Physik.

Während der Arbeit kam Spielrückmeldung zu störenden Bodenlinien hinzu. Die langen
Missionsleitungen durch die Höfe und zusätzlichen Querleitungen bei Wartung/Relais
sind entfernt. Ladebuchten haben kurze Eckmarken statt kompletter Rahmen; die
zusätzliche Pulse-Umrandung entfällt. Treppenkanten, Reservepfeil, lokale Interaktions-
marker und Ausgangshinweis bleiben. Konsolenlampe, Relaiskern, Versorgungsschränke
und Torreaktion zeigen den Fortschritt weiterhin. Kollisionen, Waffen und Bosswerte
bleiben unverändert. Keine neuen Assets oder Abhängigkeiten.

| Hof | Vorher aus L1.6c | Nachher, gleiche seitliche Kamera |
|---|---|---|
| Ladestation | [Vorher](outpost-places/entry-after.png) | [Nachher](l1-5b/final-entry-side.png) |
| Wartung | [Vorher](outpost-places/middle-after.png) | [Nachher](l1-5b/final-middle-side.png) |
| Relais | [Vorher](outpost-places/boss-after.png) | [Nachher](l1-5b/final-boss-side.png) |

Die Figur bleibt bei diesen Übersichten am Spawn, deshalb der HUD-Ortsname
„Ladestation“. Missionstests verwenden die normale Spielkamera.

## Kriterien

- Einstieg über Spielmenü bzw. direkten Adventure-Link; sichtbarer Auftrag und
  zwei Steinläufer, Pulse-Fund, Hauptweg und optionale Wartungsterrasse.
- Konsole nach beiden Läufern, sichtbare Freigabe, einmaliger Checkpoint,
  Boss-Erwachen, tatsächlicher Tod und Retry mit korrekten Ressourcen.
- Reserve gibt am Checkpoint und Retry 75 Rüstung; ohne Fund bleiben es 50.
- Boss-Sieg allein beendet das Level nicht: Kern bergen, Relais bedienen,
  geöffnetes Nordtor physisch passieren, Abschluss und vollständiger Neustart.
- Tod vor Checkpoint, Fernbeschuss-Aggro, Rückzugssperre, Plateaugefahr und Ausweichen.
- Desktop und Touch, drei Kameras, Treppen/Höhen, Sprint, Sprung, gleichzeitige
  Bewegungs-/Feuer-/Interaktionsfinger sowie Menü/Rotation/Neustart.
- Aktueller Auto-Arc-/Pulse-Vergleich, Lade- und Laufzeitprofil, Produktionsbuild.

Die Tests verwenden echte Tastatur-/Maus- und CDP-Touch-Eingaben. Zustand wird nur
gelesen; kein Teleport, injizierter Schaden, beschleunigter Boss oder gesetzter
Missionserfolg. Übersichtskameras gehören ausschließlich zu Gestaltungsaufnahmen.

## Ergebnisse und Nachweise

68 Kerntests, Typecheck und Produktions-/Testbuild bestanden. 22 unterschiedliche
Browser-Szenarien/Varianten geprüft: zwei Pause-/Rotationsfälle, vier Kampf-/
Missionsfälle, zwei Auto-Arc-Fälle, zwei Wege-/Touch-Fälle, zwei zusätzliche
Reservevarianten, neun Bossvergleiche und eine Kamera-Sichtprüfung. Wiederholungen
nach Nacharbeit werden nicht als zusätzliche Szenarien gezählt.

- Desktop 1366 × 768: vollständiger Hauptweg ohne Reserve und vollständiger Lauf
  mit Reserve, jeweils Tod/Retry, Kern, Relais, Ausgang und vollständiger Reset.
- Touch 844 × 390 ohne Reserve sowie 667 × 375 mit Reserve: vollständige Mission,
  gleichzeitige Bewegungs-/Feuer-/Interaktionsfinger, Retry und Reset.
- Reservevarianten liefern 75 Rüstung am Checkpoint und Retry, ohne Fund sind es
  50. Der Fund ist keine Abschlussbedingung.
- Tod vor Checkpoint, Beschuss-Aggro, Rückzugssperre, Plateau-Ausbruch/Ausweichen,
  Auto-Arc, alle Höhenwege, drei Kameras und kleine Touch-Bedienelemente bestanden.
- Munitions-Nachprüfung: Pulse maximal 54 Schuss; voller Vorrat verbraucht einen
  Pack nicht. Nach Verbrauch wird der Rest aufgenommen, bei null verschwindet
  der Pack. Dieses gemeinsame Arena-/Adventure-Verhalten bleibt unverändert.

Der erste Desktop-Test verfehlte einen Wegpunkt um 0,70 m. Er verwendet jetzt
positionsabhängiges Anhalten statt geschätzter kurzer Tastendrücke und kehrt vor
dem Relais in die freie Mittelspur zurück. Die Munitions-Nachprüfung verwendet
einen sichtbaren Zielpunkt nahe der Figur. Änderungen nur an Testeingaben, keine
Teleports oder gelockerten Missions-/Pickup-Bedingungen.

[Erste Serie mit Wegprüfungsfehler](l1-5b/first-browser-report.json),
[Reservevarianten](l1-5b/reserve-report.json),
[Desktop-Abschluss, Bossvergleich und Sichtprüfung](l1-5b/boss-look-main-report.json),
[finaler kleiner Touch-Durchlauf und Munitions-/Wegprüfung](l1-5b/final-touch-pickups-report.json).
Ein abschließender [Touch-Lauf mit sichtbarer Relaismeldung](l1-5b/touch-visible-relay-report.json)
wartet vor der Aufnahme ausdrücklich auf „Außenposten online“ im HUD; reine
Missionszustände können dem gedrosselt aktualisierten HUD um einen Frame voraus sein.
Der dritte Bericht enthält auch den ersten erfolglosen Munitions-Testversuch;
der letzte Bericht weist den korrigierten Fall nach. Fehlgeschlagene Versuche
zählen nicht als Erfolg. Keine JavaScript-/HTTP-Fehler in den abschließenden
Missionstests. Playwright `retries: 0`, sichtbarer Chromium, Screenshots/JSON statt
des bei langen GLB-Läufen problematischen Trace-Exports.

[Desktop-Abschluss](l1-5b/final-completion.png),
[Touch: Relais online](l1-5b/final-mobile-online.png),
[Touch-Abschluss](l1-5b/final-mobile-completion.png),
[kleines Querformat](l1-5b/touch-pause-small-landscape.png),
[Kerntests](l1-5b/unit-tests.txt).

## Aktueller Bossvergleich

Jeder Versuch beginnt mit echter Anreise über Läufer, Pulse, Konsole und Checkpoint.
Am Zugang ungefähr (0; −21): 100 HP, 50 Rüstung, 54 Pulse-Schuss, 600 Boss-HP.
Aktiv heißt Springen bei Faust/Welle und seitliches Ausweichen beim Ausbruch.
Pulse fällt nach Verbrauch regulär auf Arc zurück. Zeiten beziehen sich auf den
Bosskampf in Simulationszeit, nicht auf die vollständige Leveldauer.

| Versuch am Zugang | Desktop | Touch 844 × 390 |
|---|---|---|
| Arc stationär | Niederlage 8,47 s; Boss 236 HP | Niederlage 8,47 s; Boss 243 HP |
| Arc aktiv | Sieg 13,93 s; 90 HP / 0 Rüstung | Sieg 14,05 s; 100 HP / 50 Rüstung |
| Pulse stationär | Niederlage 8,47 s; Boss 140 HP | Niederlage 8,47 s; Boss 90 HP |
| Pulse aktiv | Sieg 11,72 s; 90 HP / 0 Rüstung | Sieg 10,13 s; 100 HP / 50 Rüstung |

Stationäres Pulse auf dem Medkit-Plateau: Niederlage nach 8,90 s, Boss 120 HP,
drei Ausbruchtreffer. Die dortige automatische Heilung verhindert einen direkten
Vergleich mit dem Zugang. Aktive Reaktion hat einen deutlichen Vorteil; die Daten
begründen weder mehr Boss-HP noch neue Angriffe. Einzelversuche mit präzisen
automatisierten Eingaben sind keine allgemeine Schwierigkeits-/Spaßabnahme.
[Startwerte und Treffertraces](l1-5b/boss-comparison.json).

## Lade- und Laufzeitprofil

[Testrechner](l1-5b/hardware.json): Ryzen 7 6800H, 16 logische CPUs, 15,3 GiB RAM,
Windows 10.0.26200; AMD Radeon Graphics über ANGLE/D3D11, Chromium 156.
Keine parallelen Builds/Simulationen während der Messrunden. Touch-Geräte-DPR 2,
Spielrenderer auf DPR 1. Kein Handy-Leistungsnachweis.

Browserseitiger Beobachter liest einmal pro Sekunde Zustand und die letzten
600 Frameabstände. Ladezeit bis `data-ready` per MutationObserver ab Navigation.
Auswertung laufender Abschnitte ab fünf Sekunden nach Bereitschaft; p95-Bereiche
sind Bereiche der Stichproben, keine Perzentile über den gesamten Lauf.

| Lokaler Lauf | Bis spielbereit | Frame-p95 | Draw Calls |
|---|---|---|---|
| Desktop Hauptweg, finale Darstellung | 0,82 s | 8,4–14,0 ms | 273–456 |
| Desktop Reserve, vor Linienreduktion | 0,81 s | 8,4–11,3 ms | 275–467 |
| Touch 844 × 390 Hauptweg, vor Linienreduktion | 3,01 s | 8,3–11,1 ms | 214–335 |
| Touch 667 × 375 Reserve, finale Darstellung | 1,37 s | 5,7–13,9 ms | 224–333 |

Der Desktop-p95 liegt unter dem 16,7-ms-Budget für 60 FPS. Einzelne Frames über
50 ms sind vorhanden (unter anderem in Läufen mit Screenshots), deshalb kein
Nachweis ausnahmslos ruckelfreier Darstellung. Cache und lokaler Preview beeinflussen
Ladezeiten; keine Internet-/Mobilnetz-Prognose. Der direkte 844er Touch-Einstieg
übertrug ca. 20,45 MiB Ressourcen, unkomprimiert 23,61 MiB.

[Desktop Hauptweg](l1-5b/desktop-main-performance.json),
[Desktop Reserve](l1-5b/desktop-reserve-performance.json),
[Touch Hauptweg](l1-5b/touch-main-performance.json),
[finale kleine Touch-Reserve](l1-5b/final-touch-performance.json).

Der fertige Produktionsbuild wurde separat auf Desktop und Touch geladen: Auftrag,
Bewegung/Sprung bzw. Pause/Rotation, keine Test-API und keine externen CDN-Anfragen.
Der getrennte Arena-2v2-Einstieg und sein Menü bleiben erreichbar.
[Produktionsnachweis](l1-5b/production-local.json). Die bekannte Vite-Warnung zum
großen Three-/Rapier-Hauptbundle bleibt bestehen (ca. 5,10 MB / gzip 1,87 MB).

**Live-Nachtrag:** Spielcommit `5b7a14e`, GitHub-Pages-Lauf `41296120868` erfolgreich.
Der direkte Einstieg über GitHub Pages brauchte in frischen Browserkontexten
**11,60 s Desktop und 19,08 s Touch-Emulation** bis spielbereit. Dieselbe Windows-
Verbindung, keine Netz-Drosselung; die Werte messen keinen echten Handyprozessor.
Der erste Live-Test hatte nach fünf Sekunden zu früh abgebrochen. Mit gemessener
vollständiger Ladephase: HTTP 200, erwartetes Adventure-Bundle, keine Asset-/JS-
Fehler, keine externe CDN-Anfrage und keine Test-API. Touch-Pause/Rotation und der
separate Arena-2v2-Einstieg bestanden. [Live-Nachweis](l1-5b/production-live.json).
Der Downloadumfang bleibt damit eine sichtbare Qualitätsgrenze: Vor zusätzlichem
Adventure-Inhalt wäre eine begrenzte Ladezeit-/Assetbudget-Optimierung sinnvoll.
Es wird kein schneller Internet-Kaltstart als bestanden behauptet.

Reproduktion: `npm test`, `npm run build`, `npm run build:test`.
Browser: `npx playwright test tests/e2e/adventure-acceptance.spec.ts
tests/e2e/adventure-fight.spec.ts tests/e2e/arc-mobile.spec.ts
tests/e2e/stone-adventure.spec.ts tests/e2e/boss-pressure.spec.ts
tests/e2e/courtyard-look.spec.ts --project=chromium-1366` (als eine Zeile).
Reservevarianten: Umgebungsvariable `OUTPOST_RESERVE=1`; kleines Querformat:
`ADVENTURE_TOUCH_SMALL=1`. Danach die beiden Missionsfälle aus `adventure-fight`
ausführen. Der Befund nutzt gezielte Serien; keine gesamte Browser-/Gerätematrix.

## Grenzen und persönliche Abnahme

Touch-Emulation auf diesem Windows-PC ist kein tatsächlicher Android-/iPhone-Test.
Das Ziel von mindestens 30 FPS auf einem benannten Handy ist damit nicht belegt.
Daumenverdeckung, Wärme, Klang, Orientierung ohne Anleitung und Spaß/Schwierigkeit
brauchen weiterhin einen persönlichen Durchlauf. Automatisiertes präzises Zielen
und Ausweichen beweisen keine menschliche Erfolgsquote.

Ein sinnvoller persönlicher Durchlauf: Mission ohne zusätzliche Erklärung beginnen,
Terrasse nach eigener Wahrnehmung erkunden, nach einem Boss-Tod erneut versuchen,
Kern/Relais/Ausgang abschließen. Festhalten, wo Auftrag oder Warnung unklar waren
und ob sich der optionale Fund lohnte. Weitere Level, Gegner, Waffen und ein
Kampagnen-/Save-System sind kein Bestandteil dieser Abnahme und nicht freigegeben.
