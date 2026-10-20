# Kopierfertiger Erstauftrag an den Coding-Agenten

Du übernimmst die technische Planung eines **neuen eigenständigen Spielprojekts: CORE ARENA 3D**. Bitte **zunächst ausschließlich analysieren und einen konkreten Umsetzungsplan vorlegen – NICHT sofort das ganze Spiel programmieren**.

## Quellen in dieser Reihenfolge

1. Lies `docs/VISION.md` vollständig. Das ist die Produktvision und Scope-Grenze.
2. Lies `docs/IMPLEMENTATION_PLAN.md` mit den Milestones/Gates.
3. Untersuche `references/Core_Arena_3D_Obsidian_Garden_V5.html` als **maßgebliche Look-&-Feel- und Camera-/3D-Höhen-Referenz**. Die neue Standardkamera ist gerade ausgerichtet; V schaltet isometrisch. Farbpalette: dunkelgrauer Stein, neutrale Metalle, sattgrüne Pflanzen, sparsame Messing-/Technikakzente.
4. Analysiere das **bestehende** Repo `https://github.com/emfau88/CTF-3.0` auf `main`, speziell `README.md`, `docs/CORE_ARENA_RELEASE_ROADMAP.md`, `src/core/`, `src/adapters/`, `src/meta/league/` und die relevanten Tests. Dieses Repo ist **READ-ONLY**: weder umbauen noch committen noch löschen.

## Spielziel

Desktop-first 3D-Topdown-Arena-Shooter (nicht FPS/Third Person) gegen Bots im Geist von Quake/Unreal Tournament: präzise WASD/Maussteuerung, 3D-Aiming über Plattformhöhen, Springen, hochwertig lesbare Maps, unterscheidbare Waffen, TDM/CTF/One Flag und **langfristig** kompakte Liga mit Rivalenteams und verhaltensbasiertem Wingman-Recruitment. Browser zuerst, Steam später als Option; keine Online-Multiplayer-, Mobile- oder RPG-Ablenkungen im MVP.

## Wichtige technische Leitplanken

- Neuentwicklung nur im separaten Repo `Core-Arena-3D`, kein Fork/Mega-Copy des kompletten CTF-Repos.
- V5 ist ein **Proof of Concept in einer HTML-Datei**, kein produktionsreifer Code. Zielarchitektur voraussichtlich Vite + TypeScript + Three.js als lokale Dependency, mit rendererunabhängiger testbarer Simulation.
- Aus CTF-3.0 portable Game-Logic, KI-Prinzipien, Regeln und Tests selektiv übernehmen; 2D-Positionslogik/Pathfinding/Schussregeln sind nicht automatisch 3D-tauglich.
- Spielfeldoptik und Kollisionsgeometrie müssen aus einer gemeinsamen Map-Datendefinition stammen. Berücksichtige präzises Aim auf E0/E1/E2, Sichtlinien/Deckung, Sprungphysik und Bot-Routen zwischen Höhen.
- Bots sollen nicht nur gut zielen, sondern Objectives lösen. Easy/Normal/Hard fair abstufen.
- Komplexität strikt begrenzen: zuerst **eine** Map, dann **2v2 TDM mit zwei Waffen**, danach CTF, dann Liga.

## Liefere jetzt **nur**

1. Kurzes **Ist-Audit** von V5 und CTF-3.0 mit konkreten Quellpfaden.
2. Portierungstabelle **direkt wiederverwenden / adaptieren / neu bauen / vorerst weglassen**.
3. Schlüssigen Technik-/Architekturvorschlag inklusive Risiken und Performancekonzept.
4. Angepasste **Milestones M0–M4** mit messbaren funktionalen/visuellen Testkriterien, kleinem erstem Umsetzungsauftrag und voraussichtlichem Aufwand (Bandbreite, Unsicherheiten).
5. Maximal 3 gezielte Fragen, **nur falls** für die Umsetzung wirklich kritisch.

**Warte danach auf meine ausdrückliche Freigabe für M0.** Keine stillschweigende Änderung am alten Repo. Ein erfolgreiches `npm run build` oder Syntaxcheck ersetzt keinen echten grafischen und spielerischen Test.
