# CORE ARENA 3D Architekturentscheidung

ADR 001. Stand: 20. Oktober 2026. Status: M0 und M1 freigegeben und umgesetzt. Weiterführende M2–M4-Systeme bleiben Planung und benötigen ihre jeweiligen Aufträge.

M1 konkretisiert diese Entscheidung: numerische Ziel-/Trefferdaten in `core/aim.ts`, gemeinsame Sprung-/Fallbefehle und gerichtete Verbindungen in der Arena-Beschreibung. Die goldene Navigationsprobe nutzt denselben Motor und eine identische, isolierte Rapier-Welt; sie blockiert den Spieler nicht und ist noch kein Kampfbotsystem. Die drei Dummies sind feste Treffer-Sensoren. Waffenschaden, Inventar und Kampf-KI folgen frühestens in M2.

M1-Spielrückmeldung: E2 ist als massiver Baukörper bis E0 ausgeführt, um seine Höhe wie in V5 klar zu vermitteln. Überhänge bleiben eine separate Physik-Testszene. Der Adapter darf einen aufsteigenden Kantenkontakt nicht als Landung melden; sonst beendet die Kapsel ihren Sprung vorzeitig und klettert langsam am Rand hoch.

Entscheidung: **Vite und TypeScript, Three.js für Darstellung, Rapier 3D für räumliche Abfragen und einen kinematischen Figurenmotor, ein rendererunabhängiger Spielkern mit 60 festen Simulationstakten pro Sekunde.** Eine gemeinsame Arena-Beschreibung erzeugt Kollisionskörper, spielrelevante sichtbare Formen und Navigationsflächen. CTF-Regeln werden gezielt in diesen Kern übernommen.

## Begründung und Alternativen

| Ansatz | Bewertung |
| --- | --- |
| Phaser behalten, 3D nur darüberzeichnen | Die bestehenden 2D-Kollisionen, Höhen- und Trefferregeln erfüllen die Vision nicht. Zu viele Sonderfälle zwischen Bild und Simulation. |
| V5 direkt zerlegen und erweitern | Schnell für weitere Versuche; erhält aber Rendererabhängigkeit, variable Zeit, getrennte Kollisionswelten und fehlende Körperfreiheit. Kein geeignetes Fundament. |
| Vollständige eigene 3D-Physik | Kleine erste Demo möglich, aber hoher Aufwand für Sweeps, Kanten, Decken, Sliding und stabile Kontaktzustände. Nicht die sinnvollste Eigenleistung. |
| **Three.js plus Rapier und kleiner eigener Spielkern** | Behält Browser/TypeScript, deckt räumliche Grundprobleme ab und lässt Movement und Regeln kontrollierbar. Ausgewählter Ansatz. |
| Unity/Godot, umfassendes ECS oder Netzwerkframework | Für dieses Browserexperiment zusätzliche Migration beziehungsweise Infrastruktur ohne belegten Nutzen. |

Rapier wird hinter einem schmalen `SpatialWorld`-Port gekapselt. Sein Character-Controller bietet Hindernisbehandlung und Bewegung entlang Oberflächen; das gewünschte Arcade-Movement muss trotzdem eigens abgestimmt werden. Die offizielle Dokumentation weist ausdrücklich auf diese spielspezifische Abstimmung hin. [Rapier Character Controller](https://rapier.rs/docs/user_guides/javascript/character_controller/)

Ray- und Shape-Casts dienen als gemeinsame Basis für Sicht, Treffer und Sweeps. Sie werden gegen die Simulationscollider ausgeführt. [Rapier Scene Queries](https://rapier.rs/docs/user_guides/javascript/scene_queries/)

Die Pakete werden bei M0 auf konkret geprüfte Versionen festgeschrieben, einschließlich passender Three-Typen, Lockfile und dokumentierter Node-Version. Der Produktionsbuild enthält lokale Abhängigkeiten; Three.js empfiehlt den npm-/Build-Tool-Weg. [Three.js Installation](https://threejs.org/manual/pages/installation.html)

Für M0 ist `@dimforge/rapier3d-compat` ein pragmatischer Einstieg, um zusätzliche WASM-Bundlerkonfiguration klein zu halten. Die eingebettete WASM-Datei erhöht allerdings die JS-Auslieferungsgröße; diese wird gemessen. Ein späterer Wechsel auf eine separate WASM-Datei benötigt einen belegten Ladezeitvorteil. [Rapier Initialisierung](https://rapier.rs/docs/user_guides/javascript/getting_started_js/)

## Verantwortlichkeiten

```text
Browser-Eingabe → Kamera-Basis / Mausstrahl → PlayerCommand
Bot-Beobachtung → Ziel / Route / Entscheidung → BotCommand
                                      ↓
                           feste Simulationstakte
                  Bewegung → Kampf → Regeln → Ereignisse
                         ↕ SpatialWorld / Rapier
                                      ↓
                          Snapshot und GameEvents
                     ↙              ↓              ↘
                  Three.js       HTML-HUD        Audioadapter

ArenaDefinition → Collider und begehbare Flächen
                → sichtbare spielrelevante Geometrie
                → Navigationsflächen und Verbindungen

MatchResult → später Liga / Recruitment → separater Saveadapter
```

Der Kern importiert weder Three.js noch DOM, Phaser oder Browserstorage. Rapier-Typen bleiben im Physikadapter. Kamera und Eingabe übersetzen Bildschirmdaten in numerische Weltbefehle. Die Simulation entscheidet, ob Bewegung, Treffer, Pickup oder Capture gültig sind. Rendering darf keine HP, Positionen oder Ergebnisse verändern.

Anfangs genügt eine modulare Anwendung ohne ECS-Framework, Worker und globalen Eventbus. Ein lesender Snapshot und eine Ereignisliste pro Tick reichen. Ports werden erst angelegt, wenn es einen tatsächlichen Aufrufer gibt.

Vorgesehene Gliederung, schrittweise zu erstellen:

| Bereich | Verantwortung |
| --- | --- |
| `src/app/` | Start, Laden, Loop, Pause und Zusammenschalten |
| `src/core/` | Numerische Zustände, Befehle, Movementregeln, Combat und Match |
| `src/physics/` | Rapier-Welt, Character-Controller und räumliche Abfragen |
| `src/arena/` | Daten, Geometrieerzeugung, Flächen und Validierung |
| `src/render/` | Three-Szene, Kamera, Material-, Actor- und Effektansichten |
| `src/input/`, `src/ui/` | Desktopadapter und kleines HUD |
| `src/ai/` | Ab M2 Wahrnehmung, Entscheidungen und Navigation |
| `src/meta/`, `src/platform/` | Liga und Speicherung erst bei Bedarf |

## Raum, Bewegung und Zeit

**Konvention:** X/Z bilden die Bodenebene, Y zeigt nach oben; eine Welteinheit entspricht konzeptionell einem Meter. Eine Actor-Position bezeichnet den Fußpunkt. Die Kapselmitte wird daraus abgeleitet. Position, Geschwindigkeit, Ziel und Projektil sind immer echte 3D-Werte; E0/E1/E2 sind Namen von Flächen, keine globalen Höhen-Schalter.

Der Figurenmotor erhält Zielbewegung, Sprint und Sprung. Er berechnet Beschleunigung/Bremsung, Gravitation, begrenzte Luftsteuerung und später Knockback. Der kinematische Controller begrenzt die gewünschte Verschiebung an Collidern. Spieler und Bots benutzen denselben Motor und dieselben Werte.

Aus V5 werden 7,2 m/s, 10,8 m/s Sprint, 10,8 m/s Absprung und 22,6 m/s² Gravitation als **erste Vergleichswerte** verwendet. Sie sind keine fertigen Balancewerte. Automatisches Erklimmen darf nur kleine Stufen überbrücken, keine E1-Plattform. Ground-Snap nur bei geeigneter Abwärtsbewegung; keine Rückkopplung, die einen Sprung an den Boden klebt. Nach Deckenkontakt endet die Aufwärtsgeschwindigkeit.

Ein Standard-Sprung beginnt auf der Tastendruckflanke; Halten löst nicht automatisch einen neuen Sprung nach jeder Landung aus. Das weicht von V5s gehaltenem Space ab und wird im M1-Test ausdrücklich verglichen. Kurze Coyote-Time und Sprungpuffer werden erst nach dem Grundnachweis mit kleinen dokumentierten Werten abgestimmt.

Die Loop sammelt reale Zeit und führt 1/60-s-Ticks aus. Pro Renderframe höchstens fünf Nachholticks; Überlast wird gezählt und sichtbar diagnostiziert. Beim Fokusverlust pausieren Match und Eingabe; beim Resume wird keine Minutenlange Nachholsimulation ausgeführt. Normale 30-/60-/144-Hz-Darstellung muss dieselbe Simulationsstrecke und Waffenrate ergeben. Renderinterpolation glättet zwischen zwei Zuständen.

Feste Reihenfolge: Eingabe übernehmen → fällige Botentscheidungen → Movement/Kollision → Schüsse/Projektilbewegung → Schaden/Tod → Pickups/Objectives → Wertung/Matchende → Snapshot/Events. Grenzfälle am Zeitlimit und gleichzeitige Kills erhalten explizite Tests. Treffer werden gesammelt und vor dem endgültigen Ergebnis gemeinsam aufgelöst.

Ein Seed, feste Einfügereihenfolge und eine Simulationsuhr ermöglichen reproduzierbare Tests. Die gesamte App wird dadurch nicht automatisch browserübergreifend bitidentisch. Rapier nennt identische Initialisierung und Operationsreihenfolge als Voraussetzungen; eigene Zufalls- und Mathematikpfade müssen ebenfalls kontrolliert werden. [Rapier Determinismus](https://www.rapier.rs/docs/user_guides/javascript/determinism/)

## Gemeinsame Arena-Beschreibung

Eine `ArenaDefinition` enthält:

- stabile IDs und Transformationen für Boden, Plattformen, Wände, Säulen und gebogene Tröge;
- Form und Abmessungen der spielrelevanten Geometrie;
- Materialreferenzen und ausdrücklich nicht kollidierende Dekoration;
- begehbare Flächen mit IDs, Spawnpunkte, später Pickup-/Objective-Volumen;
- gerichtete Verbindungen mit Anlauf, Absprung, Landefläche und benötigten Fähigkeiten.

Wand-/Plattformkörper werden aus derselben Formbeschreibung für Physik und sichtbares Grundmesh erzeugt. Gebogene Tröge erhalten eine festgelegte Segmentierung beziehungsweise konvexe Teilkörper; ihre sichtbare Kollisionshülle wird daraus aufgebaut. Blätter sind Dekoration und blockieren weder Spieler noch Schüsse. Der Renderer darf Kontaktränder dekorieren, aber keine begehbar wirkende Fläche ohne entsprechenden Untergrund hinzufügen.

Die Physikwelt ist maßgeblich für `castRay`, `sweep`, Standkontakt und Triggerüberlappung. Zielmarker, Schüsse und Bot-Sicht benutzen passende Filter desselben Colliderbestands. Die Prüfansicht zeichnet die tatsächlichen Physikformen.

Mehrere Flächen können dieselben X/Z-Koordinaten haben. Ein pauschales `groundHeight(x,z)` reicht daher nicht. Standkontakt und Navigation enthalten die Flächen-ID; Körper- und Deckenfreiheit gehören zur Gültigkeit. M1 prüft einen kleinen Überhangfall im Testlabor, auch wenn die erste Arena noch keine begehbare Brücke besitzt.

## Mausziel und Treffer

1. Der Eingabeadapter berechnet aus der sichtbaren Kamera und Mausposition einen Weltstrahl. Kamerabasis und Mausprojektion stammen aus derselben dargestellten Pose.
2. Die Zielabfrage findet den vordersten zulässigen Actor-Hitbereich oder die sichtbare Weltoberfläche; dekoratives Laub wird ignoriert. Der Punkt bleibt dreidimensional. Der Cursor springt nicht pauschal zum E0-Boden oder zur Gegnermitte.
3. Ein weiterer Test von Körper/Mündung zum Ziel verhindert Schießen durch die eigene Deckung oder aus einer in einer Wand liegenden Mündung. Der tatsächliche erste Einschlag wird angezeigt.
4. Ein Hitscan endet am ersten Treffer; ein Projektil prüft pro Tick seinen gesamten Weg als Sweep mit Radius. Nur die Endposition zu testen ist bei schnellen Geschossen unzureichend.

Schussrichtung und Trefferberechnung reagieren sofort auf die Eingabe. Ein weich nachdrehendes Körpermodell darf das Ziel nicht verzögern. Zwischen Plattformkanten ist der erste sichtbare Oberflächentreffer eindeutig; verdeckte Unterseiten bekommen keine unsichtbare Zielhilfe.

M2 startet mit **Arc Lash und Pulse Repeater**. Arc Lash bietet unbegrenzte kurze Reichweite und begrenzte Zielhilfe im Mauszielkegel; Pulse verlangt kontinuierliches Tracking mit sichtbaren Geschossen und Munition. Damit werden zwei Spielweisen ohne zusätzliche Splash-/Selbstschaden-/Knockbackkomplexität geprüft. Rocket ist der nächste sinnvolle Waffenauftrag nach dem positiven M2-Gate, kein heimliches drittes M2-Feature.

## Bots und Navigation

Für eine erste handgebaute Arena genügt ein Flächengraph mit kleinen Rastern pro zusammenhängender Standfläche und A* über gerichtete Verbindungen. Der Schlüssel enthält Flächen-ID und Rasterzelle. Gleiches X/Z auf verschiedenen Etagen darf keine Verbindung erzeugen.

Normale Wege werden mit Kapsel-Clearance geprüft. Höhenübergänge sind ausdrücklich als Gehen, Rampe, Sprung oder zulässiger Drop markiert. Ein Sprunglink enthält Anlaufzone, Startzustand und Landefläche. Seine Gültigkeit wird mit dem echten Figurenmotor getestet, nicht nur mit einer Distanzformel.

Vor vollständiger Kampf-KI fährt in M1 ein einfacher Controller die notwendigen Höhenverbindungen ab. Wenn das nicht robust gelingt, wird das Layout vereinfacht, bevor Rollen und Waffenverhalten hinzukommen. Recast/Navmesh ist eine spätere Option bei komplexerer Geometrie, kein zusätzlicher M0-Stack.

In M2 bestehen Bots aus Wahrnehmung, kurz gebundener Ziel-/Intentwahl, Wegverfolgung, lokaler Ausweichbewegung und Waffenentscheidung. Entscheidungen laufen anfänglich mit 5–10 Hz, Bewegung und Combatregeln mit 60 Hz. Pfadberechnungen werden zeitlich verteilt und nur bei Bedarf erneuert.

Wahrnehmung liefert sichtbare Ziele und zeitlich begrenzte letzte Beobachtungen. Nahe, aber verdeckte Gegner dürfen einen Suchhinweis auslösen, keine exakten aktuellen Zielkoordinaten. Teamwissen über ein Objective autorisiert keine Treffer durch Deckung. Zielvorhalt stammt aus beobachteter Bewegung, nicht aus künftigen Spielerbefehlen.

Easy/Normal/Hard unterscheiden Reaktionsverzug, begrenzte Dreh-/Zielkorrektur, zeitlich zusammenhängenden Aimfehler, Planung und Risiko. Keine zusätzliche Gesundheit, Geschwindigkeit, Reichweite oder Schadensboni. Für notwendige Wege besitzen alle dieselbe Sprungfähigkeit. Bei Stillstand: neu planen → Anlauf/Wegpunkt korrigieren → lokal befreien; kein Bot-Teleport.

## Darstellung und Performance

Der Zielstil bleibt neutraler dunkler Stein, unterscheidbares Metall, grünes Laub und sparsame warme Akzente. Die gerade Kamera bleibt Standard; V schaltet zur isometrischen Ansicht. Hohe Vordergrundobjekte dürfen die Spielfigur nicht dauerhaft verbergen; zunächst Layout und Kameraführung verbessern, erst bei belegtem Bedarf gezieltes Ausblenden. Ausgeblendete Wände verlieren ihre Kollision nicht.

Anfangs: eine schattenwerfende Hauptlichtquelle, begrenzte Schattenfläche, instanzierte Pflanzen, geteilte Materialien/Geometrien, wiederverwendete Projektil-/FX-Objekte und Puffer. HUD-Werte nur bei Änderung beziehungsweise begrenzt aktualisieren. Kein teures flächiges Postprocessing, bevor Lesbarkeit und Bildzeit stimmen.

Vorläufiges Ziel für den ersten 2v2-Slice auf einem in M0 dokumentierten Desktop: 1920×1080, DPR maximal 1,5, ungefähr 60 FPS; nach Aufwärmen Bildzeit p95 ≤20 ms und p99 ≤33 ms, Simulationsschritt p95 ≤4 ms. Zusätzlich Drawcalls, Dreiecke, aktive Effekte, Collider und Nachholticks erfassen. Diese Zahlen sind Projektbudgets, keine bereits gemessene V5-Leistung. Die Zielhardware muss vor einer verbindlichen Performanceabnahme feststehen.

Qualitätsstufen reduzieren zuerst Schatten, Laub und Effekte. Kollision, Tickrate und Botreaktion bleiben gleich. Über zehn Matchneustarts dürfen keine fortlaufend wachsenden Mesh-/Material-/Listenerbestände entstehen.

## Risiken und Gegenmaßnahmen

| Risiko | Auswirkung | Frühester Nachweis und Reaktion |
| --- | --- | --- |
| Maus trifft falsche Höhe oder schießt durch Deckung | Kernspiel unpräzise | M1: E0/E1/E2, Kanten, Mündung hinter Wand und beide Kameras; Zielmodell vor weiteren Waffen korrigieren |
| Rapier fühlt sich rutschig oder klebrig an | Movement verliert die Referenzqualität | Gezielter Wand-/Kantentest; Werte/Step/Snap in 30–60 Minuten Agent-Zeit eingrenzen, dann Befund und begrenzte Alternative vorlegen |
| Eigenbau umgeht bei Problemen die Physik | Doppelte räumliche Wahrheit | Kein zweiter Kollisionstopf; bei ungelöstem Controllerproblem ADR erneut öffnen |
| Botgraph erlaubt physisch unmögliche Wege | Bots hängen fest, Objectives versagen | M1-Linkprobe; ungültige Kante sperren und Layout korrigieren |
| Easy erreicht wichtige Orte nicht | Schwierigkeit wird unfair statt leichter | Erreichbarkeit aller Pflichtziele mit Easy-Profil, sichere Routen auf jeder Höhe |
| Aktuelles Three verändert V5-Farb-/Lichtwirkung | Optische Regression | Screenshots unter gleicher Kamera/Licht/DPR; Material-/Farbraum-Abgleich in M0 |
| Zu viele Schatten, Objekte und Allokationen | Spürbare Eingabelatenz | Ab M0 Messwerte, in M2 vollständiges Matchprofil; zuerst Darstellung vereinfachen |
| Daten- und Quellcodeübernahme zieht Altlasten mit | 2D-Annahmen verbreiten sich | Pro Import konkrete Regel, Quellcommit und Portierungstest; keine Barrel-/Core-Komplettkopie |
| Saves kollidieren mit CTF | Verlust alter Karriere | Eigenständiger Namespace von Beginn an; in M4 Schutztest mit vorhandenen CTF-Schlüsseln |
| Ungeklärte Assetherkunft | Späterer Austausch blockiert Release | Nur einzeln belegte Assets in Runtime; V5-Gestaltung zunächst prozedural |
| Frühe Liga-/Contentarbeit | Gute Menüs über schlechtem Combat | M2-Spielgefühl als Pflichtgate vor M3/M4; gesonderte Aufträge |

Die Architektur ist nach bestandenem M1 erneut kurz zu prüfen. Ein solcher Review darf konkrete Probleme lösen, soll aber keine pauschale zweite Neuentwicklung auslösen.

## Umsetzung M2.1: numerischer Lebenszyklus und Match

`src/core/match.ts` führt HP, Armor, Leben, Respawn, Spawn-Schutz, Teamscore und Matchende im festen 60-Hz-Takt. Das Modul importiert weder Renderer noch Physik noch Eingabe. Die App übergibt tatsächliche Treffer aus der vorhandenen 3D-Mündungsprüfung und Umweltschaden. Tod deaktiviert den Zielcollider und die sichtbare Figur; Respawn stellt beide wieder her. Spieler-Respawn setzt zusätzlich den Motor an den Spawn zurück und verwirft gehaltene Eingaben.

Übernommen als angepasste Regeln aus CTF-3.0: Armor vor HP, 4 Sekunden Respawn, 2 Sekunden Spawn-Schutz, Schutzende beim Angriff, Friendly Fire aus, keine Punkte für Umwelttod, genau ein Kill pro Opferleben. Alle Treffer eines Ticks werden vor Scorelimit/Zeitende ausgewertet; gleichzeitige tödliche Treffer bleiben möglich. Referenzquellen: `actors/actorLifecycle.ts`, `actors/ActorLifecycleConfig.ts`, `modes/TeamDeathmatchMode.ts` und `scoring/scoreBoard.ts`; Quellstand siehe Übernahmeaudit. Keine Runtime-Imports aus CTF.

Der separat freigegebene M2.1-Stand nutzte einen Trainingsmatch mit drei stationären roten Zielen und der Diagnosewaffe: 120 Sekunden oder 10 Abschüsse, 100 HP, zunächst 50 Armor, nach Respawn 0 Armor, 35 Schaden pro Treffer. Das markierte Schadensfeld links vom Spawn prüft den Spieler-Lebenszyklus ohne vorgezogene Kampf-KI; es wirkt ausschließlich bodennah und nur im laufenden Match. Freies Höhentraining bleibt vor Matchstart verfügbar. M2.2 ersetzt die Diagnosewaffe im Match; echte 2v2-Bots und endgültige Arena-/HUD-Abstimmung folgen später.

## M2.2: Waffen und räumlich gebundene Ressourcen

`core/combat.ts` führt Auswahl, unabhängige Cooldowns, Pulse-Munition und Projektile. `core/pickups.ts` prüft tatsächliche Standfläche, Höhe, Abstand und freie Verbindung zur Ressource. `render/combatView.ts` stellt wiederverwendete Projektilmeshes und Pickup-Symbole dar. Der freie M1-Übungsmodus behält seine Diagnosewaffe; Trainingsmatches benutzen ausschließlich Arc Lash und Pulse.

Arc Lash, aktualisiert auf Nutzerwunsch am 29. Oktober: 35 Schaden pro getroffenem
Gegner, 48 Ticks Cooldown (0,8 s), 5 m Reichweite, unbegrenzt. Ein Tippen startet
36 Ticks (0,6 s) elektrische Salve; Halten wiederholt sie. Der Kern wählt unabhängig
vom Mausziel das nächste lebende Ziel mit freiem 3D-Strahl vom Spieler und hält
dieses Ziel während der Salve, solange es erreichbar bleibt. Fünf Strahlen bilden
einen 60°-Fächer; bis zu zwei zusätzliche Ziele darin erhalten geführte Zweige.
Jeder Strahl endet an seiner ersten tatsächlichen Kollision. Schaden entsteht bei
Salvenalter 0/8/16/24/32, jeweils 7 pro getroffenem Gegner; mehrere Strahlen stapeln
den Schaden nicht. Bewegung und Deckung werden fortlaufend neu geprüft.
Waffenwechsel, Tod und Reset brechen die Salve ab. `render/arcView.ts` zeichnet die
Strahlen aus dem gemeinsamen Snapshot; Pulse behält manuelles Zielen und Projektile.
Damit ersetzt die Freigabe die ursprüngliche Entscheidung für nur 10° Mauszielhilfe.

Pulse: 10 Schaden, 10 Ticks Cooldown (~0,167 s), 54 Schuss Maximum. 30 m/s schnelle Projektile mit 8 cm Radius fliegen maximal 32 m; Rapier prüft den gesamten Tickweg als Kugel-Sweep und beendet das Projektil beim ersten Treffer. Keine Hitscan-Vorwegnahme. Schäden und Identitäten orientieren sich am CTF-Katalog des Auditcommits; Meterwerte sind neue 3D-Trainingswerte, keine blind umgerechneten Pixelwerte. Beide Waffen halten ihren eigenen Cooldown beim Wechsel. Leere Pulse fällt auf Arc zurück; Aufnehmen schaltet nicht um.

Waffenpickup E0 (54 Schuss), Munition E1 (27), Armor E2 (+50), HP E0 (+25). Der Spieler muss geerdet auf derselben Flächen-ID stehen, höchstens 35 cm Höhenabweichung und 85 cm horizontalen Abstand haben; eine Wand zwischen Spieler und Pickup blockiert. HP und Armor sind auf 100 begrenzt. Nur tatsächlich benötigte Mengen werden entnommen; der Rest bleibt. Nach vollständiger Entnahme erfolgt Respawn nach 600 Ticks. Beim Spielertod werden eigene Projektile entfernt, beim Respawn startet das Inventar wieder mit Arc. Ein Matchneustart leert alle Effekte und stellt alle Ressourcen wieder her.

Publikation: GitHub Pages ist vom Nutzer für M2.2 freigegeben. `.github/workflows/pages.yml` baut mit der gepinnten Node-Version, `npm ci`, Kerntests und Typecheck, veröffentlicht ausschließlich `dist` über die offiziellen Pages-Actions. Produktion enthält keine Testdiagnose; Testbuilds und Quellreferenzen werden nicht mit veröffentlicht.
