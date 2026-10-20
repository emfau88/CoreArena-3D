# CORE ARENA 3D

Eigenständiges Desktop-Spielprojekt. **M0.1–M0.3 sind umgesetzt und technisch
geprüft.** Persönliches Spielurteil offen; M1 ist noch nicht freigegeben.

Spielbar sind Bewegung auf E0, Sprint, Wandkollision und beide V5-Kameras.
Optik und Bewegung orientieren sich an V5. Sprung, Waffen, Bots und Matches
gehören zu späteren Meilensteinen.

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

WASD bewegt bildschirmbezogen, Shift sprintet, V wechselt die Kamera.
Beim Fokusverlust pausiert das Spiel und löscht gehaltene Tasten.
F3 zeigt ausschließlich im Entwicklungs-/Testbuild die Diagnose und echten Collider.

## Stand und Prüfung

| Paket | Stand |
| --- | --- |
| M0.1 Projektstart | Erledigt, Build und Browserstart geprüft |
| M0.2 Bewegung/Kamera | Erledigt, Rapier-Kollision und echte Eingaben geprüft |
| M0.3 Gestaltung/Übergabe | Erledigt, Vergleichsbilder und Browsermatrix vorhanden |
| M1 Höhen/Aim | Nicht begonnen; separate Freigabe erforderlich |

[M0-Ergebnis und Testnachweise](docs/qa/M0_RESULT.md).

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

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
