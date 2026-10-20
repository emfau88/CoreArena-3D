# CORE ARENA 3D

Eigenständiges Desktop-Spielprojekt. **M0 und M1 sind umgesetzt und technisch
geprüft.** Erste M1-Spielrückmeldung eingearbeitet; M2 benötigt eine neue Freigabe.

Spielbar sind Bewegung, Sprint, Sprünge über E0/E1/E2, Kopf-/Wandkollision,
3D-Mausziel und Diagnosefeuer auf drei Höhenziele sowie beide V5-Kameras.
Eine goldene Testfigur zeigt dieselbe Höhenroute mit demselben Motor.
E2 ist ein massives Plateau bis zum Boden. Sprünge direkt an der Wand behalten
ihren Aufwärtsimpuls; Kantenkontakt beim Aufstieg zählt nicht als Landung.
Optik und Bewegung orientieren sich an V5. Kampfbots, Waffeninventar und Matches
folgen frühestens in M2; Mobile bleibt optional.

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
| M2 erstes Match | Nicht begonnen; separate Freigabe erforderlich |

[M1-Ergebnis und Testnachweise](docs/qa/M1_RESULT.md), [M0-Nachweise](docs/qa/M0_RESULT.md).

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
erst nach Bewährung des Spielgefühls. Mobile bleibt optional.

## Planung und Referenz

- [Architektur](docs/planning/ARCHITECTURE_DECISION.md)
- [M0-Auftrag](docs/planning/M0_IMPLEMENTATION_BRIEF.md)
- [Meilensteine und QA](docs/planning/MILESTONES_AND_QA.md)
- [Arbeitspakete und optionale Mobile-Erweiterung](docs/planning/MOBILE_AND_WORK_PACKAGES.md)
- [Unveränderte V5-Referenz](references/Core_Arena_3D_Obsidian_Garden_V5.html)

CTF-3.0 wird ausschließlich als Referenz gelesen. Die neue Runtime enthält keine
Imports aus diesem Repository und lädt keine Bibliotheken von einem CDN.
