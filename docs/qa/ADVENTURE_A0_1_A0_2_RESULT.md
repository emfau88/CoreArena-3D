# Adventure A0.1 + A0.2 — gemeinsames Vergleichslabor

Stand: 2. November 2026. Auftrag: „ok go“ zum vorbereiteten gemeinsamen Umfang.
Branch: `codex/adventure-combat-prototype`; Basis: `e8b730abaa82f6bc03180989437ea4cfd0206347`.
Implementierungscommit: `f78690a78eead08b273a6cf9779797f67769ee21`.
**A0.1 und A0.2 technisch abgeschlossen.** Regel-/Browser-/Produktionsprüfungen bestanden;
isolierte Leistungsnachmessung unten ausgewiesen. Kein Merge nach `main`, kein öffentlicher Spiele-Release.

## Ergebnis A0.1: abgegrenzte Variantenwahl

- `src/main.ts` verwendet einmalig `resolveAdventureEntry` aus `src/app/adventureVariant.ts`.
  Nur Stein-Adventure mit `lab=boss` im Entwicklungs-/Testbuild darf `prototype` wählen.
  Unbekannte Profile fallen auf Legacy zurück. Erkundung, Arena, Frost/Glut und
  Prototype ohne Lab behalten ihren bisherigen Pfad beziehungsweise ihre bisherigen Regeln.
- Beide Profile erzeugen einen eigenen `AdventureFight` mit den alten Defaults.
  Kein neues Waffen-, Bewegungs-, Kamera- oder Bossregelprofil; keine globalen Mutationen.
  `Combat`, `PveEncounter`, `Simulation`, Rapier und Missionsregeln bleiben unverändert.
- Lesende Diagnose nennt Profil und Regelkennung. Kein Setter, Teleport oder Schadensknopf
  wurde dem bestehenden Testhook hinzugefügt. Das Labor ist kein Produktionsfeature.

## Ergebnis A0.2: reproduzierbarer Bossversuch

Die Fixture stellt ausdrücklich den erreichten Wächterhof her: beide Läufer besiegt,
Konsole/Checkpoint aktiv, Reserve aus, Relais aus, Zugang geschlossen, Boss aktiv in
`emerging`, Tick/Phasentick 0, 600 Boss-HP. Spieler `(0, 0.06, -21)`, Blickrichtung 0,
100 HP/50 Rüstung, Seitenkamera mit bisherigem Abstand. Pulse ist in beiden Profilen
mit 54 Schuss verfügbar; Arc/Pulse werden als getrennte Startwaffen ausgewählt.
Alle vorhandenen Pickups stehen mit Originalmengen bereit; die Anreise liegt hinter
dem geschlossenen Zugang. Das ist ein definierter Laborzustand, kein absolvierter Missionslauf.

Beim Öffnen wartet das Labor auf „Bossversuch starten“. Profil-/Waffenänderungen gelten
erst beim nächsten Start. Jeder Neustart erzeugt frischen Kampf- und Simulationszustand
in derselben Welt, setzt Eingaben, Kamera, Effekte und Figuren-/Bossdarstellung zurück
und stoppt alte Klangstimmen. Assets und Renderer werden weiterverwendet.

Die bestehenden Neustart- und Retryknöpfe verwenden im Lab denselben Ablauf. Außerhalb
des Labs bleibt das bisherige Retryverhalten erhalten, einschließlich Missionscheckpoint.
Explizite Darstellungsreset-Methoden werden nur vom Lab aufgerufen. Beendete Audiostimmen
entfernen zusätzlich ihren `onended`-Callback; Klangwerte und Auslöser bleiben gleich.

## Starten und vergleichen

```powershell
npm run dev
```

- Legacy-Lab: <http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=legacy>
- Prototype-Lab: <http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype>
- Reguläre Mission: <http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1>

Alternativ `npm run build:test` und `npm run preview:test`, Port 8744. Nur der Testbuild
enthält den vorhandenen Diagnosehook. „Messdaten speichern“ lädt eine lokale JSON-Datei;
keine Telemetrie, Persistenz, Serverübertragung oder Kampagnenfreischaltung.

## Messvertrag und Referenz

Fixturekennung `stone-boss-a0-v1`, Regelkennung `legacy-a0`. Das Startmanifest enthält
sämtliche Waffen-/Bosswerte, Sprungprofil, Startzustand und Vorräte. Buildkennung:
Git-HEAD beim Build plus SHA-256 über `src`, Vite-Konfiguration und Lockfile; damit
bleiben auch noch nicht committete Quellstände unterscheidbar.
Der geprüfte Build entstand vor dem Implementierungscommit und nennt deshalb den
Basiscommit. Sein Quellhash identifiziert den im Implementierungscommit gesicherten Code.

Aktive Kampfzeit beginnt beim ersten Nicht-`emerging`-Zustand, exakt Tick 120.
Auftauchen dauert vorher 2 Simulationssekunden. Endzeit friert bei Sieg/Niederlage ein.
Neustart eines offenen Versuchs wird als Abbruch erfasst. Die letzten 20 Versuche
bleiben im Arbeitsspeicher, Messreihen/Ereignislisten sind begrenzt und markieren Abschneidung.
Frame-/Simulationszeiten werden während aktiver Kämpfe, ohne Pausen, gemessen.
Verworfene Clock-Ticks werden separat ausgewiesen. Messdaten enthalten HP-Schaden nach
Ursache, Bossphasen, Waffenaktivierungen, Start-/Endzustand und Geräte-/Viewportdaten.
Peitschen-, Dash- und Gegenangriffsmetriken sind ausdrücklich nicht anwendbar;
Kameraverdeckung ist noch eine Beobachtung, keine automatisiert behauptete Messung.

Referenz-PC: Windows 11 (`10.0.26200`), AMD Ryzen 7 6800H, 16 logische CPUs,
15,26 GiB nutzbarer RAM. Browser, tatsächlich verwendete GPU, DPR und Auflösung stehen
direkt in den Messdateien. Desktop-Baseline: 1920×1080, DPR 1, Chrome.
Keine künstliche CPU-/Netzdrosselung. Kein echter Handybenchmark.

Die alten QA-Zeiten sind nicht derselbe Versuch: Sie folgten einer realen Anreise und
beginnen nach browserseitigem Abwarten des Auftauchens. Hier beginnen alle Läufe mit
derselben Fixture; Messbeginn wird in der Simulation erfasst. Keine Kampfwerte wurden
angepasst, um die alten Zeitangaben zu reproduzieren.

## Prüfungen und Grenzen

- `npm test`: 73/73 bestanden. Neue Tests prüfen Routing, getrennte Instanzen,
  kontaminierte Resets und tatsächlich treffende Arc-/Pulse-Replays bei 30/60/144 Hz.
  Sämtliche 720 Tickzustände pro Replay sind zwischen Profilen und Frequenzen identisch.
- Produktions- und Testbuild einschließlich TypeScript bestanden. Die bekannte
  Größenwarnung zum Hauptbundle bleibt; dies ist keine neue Engine-/Assetoptimierung.
- Zwanzig echte Browserneustarts: gleiche Initialzustände, Eingaben/Projektile/Arc
  zurückgesetzt; GPU-Ressourcen und Listener nach Speicherbereinigung bleiben konstant.
  Die explizite Speicherbereinigung erfolgt nur im Ressourcenversuch, nie in Zeitmessungen.
- Zwölf Browserfälle auf Chrome bestanden: vollständige reguläre Mission mit
  Tod/Retry/Abschluss auf Desktop und Touch; Pause/Fokus/Resize auf beiden Eingaben;
  Arc auf beiden Eingaben; Lab-Reset und Referenzreihe; beide vollständigen 2v2-Läufe
  mit Rail/Ergebnis/Neustart; alle drei alten Bosskarten sowie PvE-Niederlage/Pause/Retry.
- Separater Produktionsguard bestanden: Labparameter führen zur normalen Ladestation,
  kein Labfenster, kein Diagnosehook. Kein Lab-JS-/CSS-Chunk im Produktionsartefakt.
- Die zwölf Referenzläufe sind automatisierte reale Tastatur-/Mauseingaben. Sie sind
  weder menschliche Spieltests noch ein Nachweis für Spaß, Fairness oder neue Qualitätstore.

Bekannte Grenze bleibt das Durchlaufen des aktiven Boss-Sensors. Das wird in A2.1
behandelt und wurde nicht vorgezogen. Keine neue Kamera, kein Dash, keine Peitsche,
keine Bossbalance, kein Progressionssystem und kein öffentlicher Release.

### Nachweise

- [Referenzmanifest](adventure-a0/reference-manifest.json), [lokale Baseline](adventure-a0/baseline.json).
- [Zwanzig Neustarts](adventure-a0/reset-results.json): maximal 4 ms synchroner Setup,
  maximal 558 ms inklusive Browserbedienung und 300-ms-Wartefenster; deutlich unter 3 s.
  Konstant 779 Szenenobjekte, 334 Geometrien, 52 Texturen, 35 Shaderprogramme;
  nach Bereinigung 71 Listener, keine alten Audio-Stimmen.
- [73 Regeltests](adventure-a0/unit-summary.json), [12 Browserfälle](adventure-a0/browser-summary.json),
  [Produktionsguard](adventure-a0/production-guard.json), [Testkorrekturen](adventure-a0/test-iterations.json).
- [Laboransicht](adventure-a0/lab.png).

### Referenzzeiten und Leistungsprofil

| Waffe / Verhalten | Drei Ergebnisse | Aktive Kampfzeit |
|---|---|---|
| Arc, stationär feuern | 3 Niederlagen | jeweils 8,47 s |
| Arc, reaktiv springen/ausweichen | 3 Siege | jeweils 14,05 s |
| Pulse, stationär feuern | 3 Niederlagen | jeweils 8,47 s |
| Pulse, reaktiv springen/ausweichen | 3 Siege | jeweils 10,12 s |

Die [isolierte Nachmessung](adventure-a0/performance-summary.json) verwendet Chrome 156,
AMD Radeon Graphics über ANGLE/D3D11, 1920×1080 und DPR 1. Framezeit p95 je Versuch
13,9–19,4 ms, p99 16,8–25,0 ms; Simulationsschritt p95 0,6–0,9 ms. Die aktiven
Kampfabschnitte erfüllen damit die Planbudgets 20/33/4 ms auf diesem Referenz-PC.
Im ersten Versuch wurden über den gesamten Versuch einschließlich Auftauchen 16
Clock-Ticks verworfen; in den folgenden elf keiner. Der Start ohne Aufwärmen ist
damit ausdrücklich nicht als ruckelfrei abgenommen.

Die [vorherige Messreihe unter gleichzeitiger Testlast](adventure-a0/baseline-under-load.json)
bleibt erhalten: zwei p95-Werte über 20 ms, einmal p99 über 33 ms. Hintergrundlast ist
eine plausible Ursache, kein bewiesener alleiniger Grund. Die Nachmessung lief ohne
weitere Build-/Regel-/Browser-Testprozesse; die Kampfregeln wurden dafür nicht geändert.

## Testkorrekturen offen ausgewiesen

Der erste Audioreset-Test zählte den neuen Landeklang am 0,06-m-Start als Altklang.
Die Prüfung erfasst nun den stummen Resetzeitpunkt und wartet den kurzen neuen
Landeklang ab. Die rohe CDP-Listenerzahl enthielt außerdem noch nicht eingesammelte
Objekte; nach Garbage Collection bleibt sie über 20 Starts konstant bei 71.
Beendete Audio-Callbacks werden nun ausdrücklich entfernt.

Ein weiterer Browserbefund war die Überlagerung des vorhandenen Neustartknopfs durch
das Labfenster; dessen Position wurde korrigiert. Ein Zwischenlauf verlor während
gleichzeitigen Neubauens seinen Diagnosekontext; er gilt nicht als bestanden. Die
Abschlussprüfung verwendet deshalb einen während des Laufs unveränderten Build.

## Gates und Fortsetzung

Alle sechs Qualitätstore bleiben offen. Für A0 ist kein menschlicher Spieltermin
vorgesehen; T1 folgt nach A4. Nächster empfohlener Auftrag: A1 (Kamera/Zielsteuerung)
im Labor, nur nach entsprechender Beauftragung. A0 startet keine Folgearbeit automatisch.
