# CORE ARENA 3D erster Umsetzungsauftrag M0

Stand: 20. Oktober 2026. **M0.1–M0.3 umgesetzt und technisch geprüft. M1 inzwischen gesondert freigegeben.** Dieses Dokument bewahrt den damaligen M0-Auftrag; den aktuellen Fortschritt führt die [Roadmap](MILESTONES_AND_QA.md).

Ergebnis: [M0_RESULT.md](../qa/M0_RESULT.md). Der folgende Auftrag dokumentiert den freigegebenen Umfang. Nach Nutzerfeedback werden zusätzliche Randfallprüfungen zurückgestellt, um schneller spielbare Ergebnisse zu liefern.

## Ziel

Eine kleine, sauber aufgebaute 3D-Szene im neuen Repository `https://github.com/emfau88/CoreArena-3D.git`: Eine Figur lässt sich auf einer Ebene präzise bewegen, eine Wand blockiert sie korrekt, und beide V5-Kameraperspektiven funktionieren. Eine repräsentative Materialprobe zeigt die gewünschte Obsidian-Garden-Richtung.

M0 liefert noch kein Spielmatch und verspricht keine vollständige V5-Funktionsparität. Die unveränderte V5-Datei bleibt die spielbare Vergleichsreferenz. Echte Höhen-Traversals und Combat werden mit M1 beziehungsweise M2 abgenommen.

## Voraussetzungen

1. Ausdrückliche Freigabe dieses M0-Zuschnitts einschließlich [Architekturentscheidung](ARCHITECTURE_DECISION.md).
2. Remote-Stand erneut lesen: Das Repository war beim Audit leer. Falls inzwischen Inhalte vorliegen, mit dem Starterpaket abgleichen und erhalten.
3. Projektwurzel festlegen: vorgesehen ist `C:\Users\madde\Documents\CoreArena 3D`. Starterdateien nach Freigabe ohne Inhaltsänderung als `docs/` und `references/` in die Repo-Struktur übernehmen; Quellpaket erhalten, keine pauschale Ordnerbereinigung.
4. CTF ausschließlich als Quelle am dokumentierten Commit lesen. Kein Fetch, Checkout, Schreiben oder Testlauf im alten Arbeitsverzeichnis.

## Erlaubter Umfang

1. **Toolchain:** Vite, TypeScript strict, Three.js und Rapier 3D lokal installieren und exakt festschreiben; passende Three-Typen, Lockfile, dokumentierte Node-Version. Scripts für Entwicklung, Typecheck, Build, Regeln und Browser-Smoke.
2. **Kleiner Kern:** Numerischer Zustand mit Vec3/Fußpunkt, 60-Hz-Loop, lesender Snapshot, Pause/Fokusbehandlung. Kein allgemeines ECS oder Netzwerkfundament.
3. **Räumlicher Adapter:** Rapier initialisieren; Boden, eine Wand und eine Kapsel. Derselbe Formdatensatz erzeugt sichtbare Wand und Collider. Kapselbewegung inklusive Abgleiten an der Wand. Ein Basis-Wandtest genügt; keine vollständige Höhenmechanik.
4. **Eingabe:** WASD, normierte Diagonalen und Shift. Bildschirmbasis folgt dem aktuellen Kamerawinkel. Gehaltene Eingaben bei Fokusverlust löschen.
5. **Kamera:** Gerade orthografische V5-Perspektive als Standard, V für isometrisch, weiches Follow und korrekte Größenanpassung. Kamera verändert keine Simulationspositionen.
6. **Darstellung:** Grauer Stein, neutrales Metall, grüne Vegetation, sparsame warme Akzente, Kontakt/Schatten. Eine kleine Probe genügt; keine komplette Detailrekonstruktion der V5-Arena.
7. **Diagnose:** Kleines im Entwicklungsmodus sichtbares Overlay mit Tick, Position, Bildzeit und Collideransicht. Keine Diagnoseknöpfe im späteren Produktfluss vorwegnehmen.
8. **Nachweis:** Browser-Smoke mit echter Bewegung und blockierter Wandpassage; Vergleichsaufnahmen beider Kameras; dokumentierter lokaler Start und Build.

Die erste Codeänderung enthält nur Projektstart und minimale Szene. Danach folgen Motor/Kamera und schließlich Darstellung/Tests in überschaubaren Änderungen. Kein automatisches Zerlegen des gesamten HTML-Skripts und kein Import des alten `src/core`-Baums.

## Ausgeschlossen

- E0→E1→E2-Sprünge als fertiges Feature, komplexe Trogkollisionen und Überhänge;
- produktive Waffen, Treffer-/Damage-System, Dummies mit Combatlogik;
- Kampf-Bots, Navmesh, Teamrollen oder Objectives;
- Pickups, HP/Armor, Respawn, Score, Timer und Matchende;
- Liga, Karriere, Saves, Onboarding oder vollständige Menüs;
- Audioimport, neue kostenpflichtige Assets, weitere Arenen;
- Online-Multiplayer, Touch-Steuerung, Accounts, Portale und Steam;
- Änderungen an CTF oder an der V5-Referenz;
- Veröffentlichung oder automatische Fortsetzung zu M1.

## Prüfliste für die technische Abnahme

| Prüfung | Erfolgskriterium |
| --- | --- |
| Installation und Build | `npm ci`, Typecheck, Regeltests und `npm run build` erfolgreich; Startanleitung aus frischem Checkout nachvollziehbar |
| Eigenständigkeit | Kein Import aus dem alten Repository, keine Phaser-Abhängigkeit und keine CDN-Anforderung der neuen Runtime |
| Bewegung | Echte WASD-Eingabe verändert Simulationsposition und sichtbare Figur; Diagonale hat gleiches Gesamttempo |
| Kamera | W bewegt bildschirmbezogen nach oben, D nach rechts, in beiden Ansichten; V vertauscht keine Achsen |
| Kollision | Bei mindestens zehn Anläufen pro Seite keine Wanddurchdringung; Collideransicht deckt sich mit Wandform |
| Zeit | Gleiche Folge von Simulationsticks ergibt bei verschiedenen Renderplänen dieselben Zustände; Pause setzt keine aufgelaufene Zeit um |
| Fokus | Nach Fokusverlust keine weiterlaufende Figur; Fortsetzung benötigt neue Eingabe |
| Browser | Gebauter Preview-Build in Chromium; lokaler Chrome-/Edge-Start, soweit verfügbar; 1366×768 und 1920×1080 |
| Darstellung | Stein bleibt neutral, Pflanzen grün, Figur/Bodenkontakt lesbar; beide Kameras aufgenommen |
| Messung | Browser, Viewport, DPR, CPU/GPU soweit verfügbar sowie erste Bildzeiten dokumentiert; keine unbelegte FPS-Zusage |
| Referenzschutz | SHA-256 der V5-Datei weiterhin `74786c9b7a0ac1e228a6d4a9f126d0787f45a7a97046f02bb27a8243e7f84642` |

Die Tests müssen in einem separaten Browserkontext ohne bestehende CTF-Spielstände laufen. M0 benötigt keinen Zugriff auf persönliche Saves.

## Abbruchgrenzen und Übergabe

Aufwand **Ist: ca. 30 Minuten Agent-Arbeitszeit insgesamt laut Nutzer**, keine getrennt gemessenen Paketzeiten. Die ursprüngliche Schätzung von 3–5 menschlichen Arbeitstagen war für diesen Arbeitsmodus ungeeignet und ist ersetzt. Künftige Controllerprobleme zuerst in einer gezielten Zeitbox von 30–60 Minuten eingrenzen, dann den Befund und eine kleine Alternative vorlegen. Keinen zweiten vollständigen Physikmotor parallel beginnen.

Am Ende liefern:

- überprüfbaren Branch-/Commitstand, sofern im freigegebenen neuen Repo gearbeitet wurde;
- lokale Startanleitung und getesteten Preview-Pfad;
- Testresultate, zwei Kameraaufnahmen und bekannte Grenzen;
- kurze Einschätzung zu Controller, Materialwirkung und nächstem M1-Risiko.

Danach **stoppen und die M0-Abnahme beziehungsweise den gesonderten M1-Auftrag abwarten**. Ein grüner Build alleine ist kein Abschlussnachweis.
