# CORE ARENA 3D

## ▶ [Jetzt im Browser spielen](https://emfau88.github.io/CoreArena-3D/)

**Desktop: Maus + Tastatur. Mobile: Querformat + Touch.** „Trainingsmatch starten“, am Desktop dann WASD/Shift/Space.
Pulse liegt hinter dem Startpunkt; aufnehmen und mit **2** wählen, **1** wählt Arc Lash.
[Build & Deployment](https://github.com/emfau88/CoreArena-3D/actions/workflows/pages.yml)
veröffentlicht geprüfte Spieländerungen auf `main` automatisch über GitHub Pages.

Eigenständiges Desktop-Spielprojekt. **M0, M1, M2.1 und M2.2 sind umgesetzt und technisch
geprüft.** M2.3 und folgende Pakete benötigen die nächste Freigabe.

Spielbar sind Bewegung, Sprint, Sprünge über E0/E1/E2, Kopf-/Wandkollision,
3D-Mausziel und Diagnosefeuer auf drei Höhenziele sowie beide V5-Kameras.
Eine goldene Testfigur zeigt dieselbe Höhenroute mit demselben Motor.
E2 ist ein massives Plateau bis zum Boden. Sprünge direkt an der Wand behalten
ihren Aufwärtsimpuls; Kantenkontakt beim Aufstieg zählt nicht als Landung.
Optik und Bewegung orientieren sich an V5. M2.1 ergänzt einen Trainingsmatch mit
HP/Armor, Tod/Respawn, Spawn-Schutz, Punkten, Timer und Neustart.
M2.2 ergänzt Arc Lash, Pulse Repeater, Waffenwahl und Pickups.
Kampfbots folgen in späteren Paketen. Eine einfache mobile Touch-Steuerung ist verfügbar.

### Einfach mobil spielen

Handy ins **Querformat** drehen. **Links unten den Joystick ziehen**, auf die Arena
**tippen oder halten**, um dort hinzuzielen und zu feuern. Ziehen mit dem Zielfinger
führt das Ziel nach. Bewegung und Feuer funktionieren gleichzeitig und unabhängig.
**Sprung** springt, **Sprint** schaltet schnelleres Laufen an/aus, **Ansicht** wechselt
die Kamera. Waffen oben links antippen. Für Pulse zunächst den blauen Pickup hinter
dem Startpunkt aufnehmen. Unterbrechung, Drehung oder Neustart löschen gehaltene Eingaben.

Die Touch-Version verwendet dieselbe Simulation und reduziert nur Renderauflösung
und Schattenauflösung. In Chromium mit echten Mehrfinger-Browserereignissen geprüft;
Bediengefühl und Leistung auf echten Android-/iPhone-Geräten sind noch nicht abgenommen.

## Lokal starten

Geprüfte Toolchain: Node.js 22.17.1, npm 10.9.2. Alle Paketversionen sind exakt
festgeschrieben; `package-lock.json` ist Teil des Projekts.

```powershell
npm ci
npm run dev
```

Öffnen: http://127.0.0.1:8740/CoreArena-3D/

```powershell
npm run build
npm run preview
```

Gebautes Spiel: http://127.0.0.1:8743/CoreArena-3D/

WASD bewegt bildschirmbezogen, Shift sprintet, Space springt, V wechselt die Kamera.
Maus zielt; linke Maustaste tippen/halten feuert. Der Ring zeigt den tatsächlichen
3D-Zielpunkt (mint: frei, orange: Mündung verdeckt). Treffer werden pro Höhe gezählt.
B bzw. „Route zeigen“ startet einmal die goldene Navigationsprobe; Neuladen setzt
die Übung zurück. Die markierten Absprungstellen führen über E1 und E2. Wer über
den äußeren Rand fällt, kehrt zum Start zurück.
Beim Fokusverlust pausiert das Spiel und löscht gehaltene Tasten.
F3 zeigt ausschließlich im Entwicklungs-/Testbuild die Diagnose und echten Collider.

„Trainingsmatch starten“ aktiviert 120 Sekunden Spielzeit oder 10 Abschüsse.
Die drei roten Ziele haben wie der Spieler 100 HP und zunächst 50 Armor. Armor
fängt Schaden zuerst ab. Nach einem
Tod folgen 4 Sekunden Respawn, dann 100 HP ohne Armor und 2 Sekunden Schutz.
Schießen beendet den eigenen Schutz. Ein blauer Ring markiert geschützte Ziele,
ein goldener Ring den geschützten Spieler. Die orange Bodenfläche links vom Spawn
verursacht Schaden zum Ausprobieren des eigenen Lebenszyklus; Umwelttod gibt keine
Teampunkte. „Neu starten“ bzw. „Noch einmal spielen“ setzt die Runde zurück.
Dies ist eine Trainingsrunde gegen stationäre Ziele, noch kein 2v2 mit Kampf-Bots.

| Waffe | Bedienung und Wirkung |
| --- | --- |
| Arc Lash | **1**; unbegrenzt, 35 Schaden, 0,8 s Abstand, 5 m Reichweite; 10° Zielhilfe um den 3D-Zielstrahl, echte Sicht und Deckung |
| Pulse Repeater | **2** nach Waffenpickup; 10 Schaden, 10 Ticks (~0,167 s) Abstand, sichtbare Projektile mit 30 m/s und 32 m Reichweite; maximal 54 Schuss |

Mausrad über der Arena wechselt verfügbare Waffen. Leere Pulse fällt auf Arc Lash
zurück; ein Pickup wählt niemals automatisch eine andere Waffe. Die Pulse-Waffe
liegt auf E0 hinter dem Start, Munition auf E1, Armor auf E2 und Heilung links hinten
auf E0. Nur auf derselben Standfläche und Höhe aufnehmen; volle Ressourcen bleiben
liegen, Teilmengen bleiben erhalten. Vollständig aufgebrauchte Pickups kehren nach
10 Sekunden zurück. Tod/Respawn entfernt Pulse und Munition; Neustart setzt auch
Pickups und sämtliche Projektile zurück. Freies Training vor Matchstart behält die
M1-Diagnosewaffe zum Prüfen der Höhen.

## Stand und Prüfung

| Paket | Stand |
| --- | --- |
| M0.1 Projektstart | Erledigt, Build und Browserstart geprüft |
| M0.2 Bewegung/Kamera | Erledigt, Rapier-Kollision und echte Eingaben geprüft |
| M0.3 Gestaltung/Übergabe | Erledigt, Vergleichsbilder und Browsermatrix vorhanden |
| M1.1 Höhenmotor | Erledigt; Sprung, Fall, Standfläche und Kopfkontakt geprüft |
| M1.2 Aim/Diagnosefeuer | Erledigt; drei Höhenziele und Deckung geprüft |
| M1.3 Navigationsprobe | Erledigt; E0→E1→E2→E0 mit gemeinsamem Motor |
| M1.4 Zusammenspiel/Übergabe | Technisch geprüft; persönliches Spielurteil offen |
| M2.1 Lebenszyklus und Match | Erledigt; kompletter Trainingsmatch im Browser geprüft |
| M2.2 Waffen und Ressourcen | Erledigt; beide Waffen, Pickups, Munition und Restart im Browser geprüft |
| M2.3–M2.6 | Nicht begonnen; nächste Freigabe erforderlich |

[M2.2-Ergebnis und Testnachweise](docs/qa/M2_2_RESULT.md), [M2.1-Nachweise](docs/qa/M2_1_RESULT.md), [M1-Nachweise](docs/qa/M1_RESULT.md), [M0-Nachweise](docs/qa/M0_RESULT.md).

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Gezielter schneller Desktoplauf: `npm run build:test`, anschließend
`npx playwright test --project=chromium-1366`. M1 wurde mit diesem begrenzten
Umfang geprüft; die vollständige Browser-/Auflösungsmatrix bleibt optional.

Browsertests starten den gebauten Teststand auf Port 8744 in isolierten Profilen.
Sie nutzen echte Eingaben und ausschließlich lesende Diagnose. Installiertes
Chrome und Edge werden auf diesem Windows-System automatisch mitgeprüft.
Für echte Fokuswechsel nutzt die Suite sichtbare Testfenster; auf Linux benötigt
sie eine Anzeige, beispielsweise `xvfb-run`.

Arbeitsweise nach Nutzerfeedback: kleine spielbare Ergebnisse zuerst,
gezielte Kernprüfungen je Änderung; breite Randfall- und Langzeitabsicherung
erst nach Bewährung des Spielgefühls. Weiterer Mobile-Ausbau bleibt optional.

## Planung und Referenz

- [Architektur](docs/planning/ARCHITECTURE_DECISION.md)
- [M0-Auftrag](docs/planning/M0_IMPLEMENTATION_BRIEF.md)
- [Meilensteine und QA](docs/planning/MILESTONES_AND_QA.md)
- [Arbeitspakete und optionale Mobile-Erweiterung](docs/planning/MOBILE_AND_WORK_PACKAGES.md)
- [Unveränderte V5-Referenz](references/Core_Arena_3D_Obsidian_Garden_V5.html)

CTF-3.0 wird ausschließlich als Referenz gelesen. Die neue Runtime enthält keine
Imports aus diesem Repository und lädt keine Bibliotheken von einem CDN.
