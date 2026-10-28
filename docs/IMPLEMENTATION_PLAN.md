# CORE ARENA 3D — Technischer Ansatz und Gates

**Einordnung vom 28.10.2026:** Dieses Starterdokument beschreibt die ursprüngliche
Arena-Planung. Der aktuelle Stand und die nächsten Schritte zum hochwertigen ersten
Adventure-Testlevel stehen in [MILESTONES_AND_QA](planning/MILESTONES_AND_QA.md) und
im [Levelplan](planning/LEVEL_1_STONE_ADVENTURE.md). L1.1–L1.3 sind umgesetzt; die
folgenden alten Phasen sind keine Aufforderung, das Fundament erneut aufzubauen.

**Ziel:** Statt Mega-Rewrite ein separat überprüfbarer 3D-Vertical-Slice. CTF-3.0 bleibt unverändert. Alle Implementierungsschritte erst nach expliziter Freigabe des ersten Audit-Plans.

## Vorentscheidungen

- **Neues Repo:** `emfau88/Core-Arena-3D` (Name zunächst nur Vorschlag), neuer Git-Verlauf, kein Fork/kein Umbenennen von CTF-3.0.
- **Referenzen:** `references/Core_Arena_3D_Obsidian_Garden_V5.html`, https://github.com/emfau88/CTF-3.0 , https://github.com/emfau88/CTF-3.0/blob/main/docs/CORE_ARENA_RELEASE_ROADMAP.md .
- **Stack-Vorschlag:** Vite + TypeScript + als lokale npm-Dependency gepinntes Three.js, Playwright plus leichte Unit-/Simulations-Tests; optional weitere Libraries nur bei begründetem Bedarf.
- **Architektur:** getrennte Simulation/Regeln und 3D-Renderer; Arena-Layout erzeugt **beide** sichtbare Meshes und kollidierende Volumes/Top-Flächen aus gemeinsamer Definition. 3D-Bewegung mit x,z-Position und y-Höhe; kein reines 2D-Topdown-Shooting unter 3D-Grafik.
- **Wichtige Evaluation:** Kapsel/Character-Controller, Stufen, Sprünge, Oberflächenauflage, Collider, Projektil-/Raycast-Verfahren, mehrere begehbare Ebenen, Bot-Weggraph mit Sprungverbindungen, Sichtlinien, fixed timestep oder andere reproduzierbare Simulation.
- **Keine CDN-Abhängigkeit** im ausgelieferten Produktionsbuild. Audio-/Bildasset-Rechte vor Import prüfen.

## Phase 0 – Audit / Planung (KEIN PRODUKTIONSCODE)

**Auftrag:** beide Quellen lesen, V5 visuell/technisch inventarisieren, Regeln/Tests im Altprojekt sichten, Feature-Portierungsmatrix erstellen.

**Ergebnis:** Bericht mit

1. tatsächlich vorliegender Funktionalität in V5 versus altem Core;
2. wiederverwendbar / adaptierbar / neu erforderlich (mit Quellpfaden);
3. konkreter Architektur und Risiken (insbesondere Höhen-Aiming, Kollision, Multi-Level-Bot-Pathfinding, Performance);
4. kleinsten Milestones und jeweils **sichtbarer Abnahme**;
5. höchstens drei wirklich entscheidungsbedürftigen Fragen.

**Gate:** Nutzer bestätigt den Vorschlag. Vorher keine Commits am Originalrepo, kein massenhafter Rewrite, kein Repository-Setup ohne Freigabe.

## M0 – Sauberer technischer Start

- Vite/TS/Three-Projekt baut lokal reproduzierbar; App öffnet im Desktop-Browser.
- V5-Look und gerade Kamera als Ausgangspunkt; mit V zurück zu isometrisch, gleiche Bewegungsausrichtung.
- V5-Datei bleibt unangetastete Referenz, 3D-Code wird **schrittweise** in Module überführt statt automatischer 1:1-Massenmigration.
- Mini-Smoketest für Szenenstart, Canvas, Ein-/Ausgabe; Dokumentation `npm install`, `npm run dev`, `npm run build`.

**Gate:** online/lokal spielbare Szene mindestens in der heutigen V5-Qualität, keine ungewollten Gameplay-Regressionen.

## M1 – 3D-Spielgefühl / Höhen / Treffer

- Reale E0/E1/E2-Bewegung und Collisions, Absprung/Landung, fairer Kamerawechsel.
- E0→E1 und E1→E2 an bestimmten Stellen möglich, E0→E2 nicht mit Standardsprung; keine Wandclips, keine unsichtbaren Barrieren an Pflanzen.
- Mausray bei E0/E1/E2 sauber, Crosshair auf Zielhöhe, Deckung blockiert entsprechend geometrisch, sichtbare Trefferfeedbacks.
- Feste Test-Bots/Dummies in drei Höhen; Diagnose-Overlay aus gemeinsamem Collider/Traversalsystem.

**Gate:** persönlicher **Spieltest des Nutzers** mindestens 5–10 Minuten, reproduzierbare Kontrollchecks und Video/Screenshots (falls Browser-Testumgebung vorhanden). Kein „fertig“ nur wegen Build-Test.

## M2 – Erstes **richtiges Match**, bewusst klein

- Eine Arena; 2v2 TDM (1 menschlicher Spieler + 1 Bot vs 2 Bots).
- Health, Armor (wenn nützlich, keine Pflicht vor sicherem Combat), Treffer, Tod, Respawn, Score, Timer, Match-Ende und Restart.
- Zwei verschiedene Waffen **Arc Lash plus Rocket oder Pulse** (Agent schlägt geeignetes Paar nach Audit vor), Pickups und Munition.
- Bots finden über Plattformen hinweg gültige Wege und können Kampfsituationen lesen; Easy ist nachweislich nicht überpräzise.
- Klare HUD-Zuordnung zu Kampf, Status, Zeit und Team; keine komplette Karriere-/Menüübernahme.

**Gate:** Mehrere vollständige lokale Matches ohne Softlock, Bot-Simulationen sowie Browser-Smoke. Spieler bestätigt nach echtem Test, dass Kampf und Movement Spaß machen.

## M3 – Objectives / Teamidentität

- Classic CTF, dann One Flag, mit vollständigem Flag Drop/Return/Score und Bot-Objective-Verhalten auf Höhenkarten.
- CTF-Matches müssen **tatsächlich Flaggenpunkte hervorbringen**; zusätzliche Bot-Aim-Stärke löst die taktische Schwäche nicht.
- Einfache Teamidentität / kosmetische Figuren, passende Audio- und FX-Rückmeldungen nach Rechte- und Performance-Prüfung.

**Gate:** reproduzierbare echte CTF-Captures mit Bots sowie Spieltest fairer Easy/Normal/Hard-Difficulty.

## M4 – Qualifier / League-Vertikalscheibe

- Ein-Klick-Qualifier mit kontextuellen Bewegungs-/Aim-/Jump-/Pickup-Hinweisen.
- Kleine Proving-Saison (beispielsweise drei kurze Matches) mit Tabelle, Ergebnisfluss, Wingman-Entscheidung und persistentem Save.
- Konzeptionell vorbereitete Contender-/Apex-Erweiterung, aber nicht automatisch alles implementieren.

**Gate:** neuer Spieler versteht Einstieg und spielt eine kleine Liga ohne Erklärung oder Softlock durch.

## M5 – Produktvalidierung / Releasevorbereitung

- Weitere zwei Premium-Arenen **nur bei positivem Kernspieltest**; Performance, Konfiguration und Asset-Rechte prüfen.
- Browser (Standalone/Portal) zuerst; Steam-Wrapper erst nach eigenem Go/No-Go.
- Kein Cloud-Account, Netzwerk-Multiplayer oder Stat-Shop.

## Regeln bei jeder Agenten-Änderung

- Nur **ein** Milestone pro Auftrag; kleine PRs/Commits, keine parallel ausufernden Branches.
- Automatische Tests plus echter Canvas-/Browsertest; vorher/nachher-Screenshot bei visuellen Änderungen.
- Jedes Report enthält: was implementiert wurde, was nicht, benutzter Branch/Commit, Start-/Play-Link, Tests, bekannte Fehler, konkrete Empfehlung.
- Kein bloßes „Tests grün“ als Beweis guten Spielgefühls. Nutzer gibt Gameplay-Gates persönlich frei.
- Vergleiche das alte Spiel **als Referenz**, aber kopiere Module nur nach Fit- und Rechteprüfung. Kein Zurückportieren oder Überschreiben im 2D-Repo.
