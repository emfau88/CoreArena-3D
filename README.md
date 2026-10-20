# CORE ARENA 3D

Eigenständiges Desktop-Spielprojekt. M0 baut das technische Fundament für die
Obsidian-Garden-Arena auf. Die geplanten weiteren Meilensteine sind noch nicht
zur Umsetzung freigegeben.

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

## Planung und Referenz

- [Architektur](docs/planning/ARCHITECTURE_DECISION.md)
- [M0-Auftrag](docs/planning/M0_IMPLEMENTATION_BRIEF.md)
- [Meilensteine und QA](docs/planning/MILESTONES_AND_QA.md)
- [Arbeitspakete und optionale Mobile-Erweiterung](docs/planning/MOBILE_AND_WORK_PACKAGES.md)
- [Unveränderte V5-Referenz](references/Core_Arena_3D_Obsidian_Garden_V5.html)

CTF-3.0 wird ausschließlich als Referenz gelesen. Die neue Runtime enthält keine
Imports aus diesem Repository und lädt keine Bibliotheken von einem CDN.
