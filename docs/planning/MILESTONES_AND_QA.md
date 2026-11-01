# CORE ARENA 3D Meilensteine und Qualitätssicherung

Stand: 1. November 2026. **Arena und Adventure bleiben getrennte Varianten.** M0/M1,
M2.1–M2.4b sind umgesetzt und technisch geprüft.
M2.4a brachte 2v2, M2.4b ergänzt Wege/Ressourcen/Schwierigkeiten und die
Adventure-Bewegung. [M2.4b-Nachweis](../qa/M2_4B_RESULT.md).
**M2.5 ist anschließend umgesetzt und technisch geprüft.**
[Arena/HUD/Feedback](../qa/M2_5_RESULT.md). **M2.6 ist technisch abgeschlossen:**
[30 Botrunden, Browsermatches, Fehlerkorrektur und Performance](../qa/M2_6_RESULT.md).
Das danach separat freigegebene [Arena-Map-Paket](../qa/ARENA_MAP_RESULT.md) gleicht
Versorgung/Höhenzugänge an und verbessert Materialien, Kanten und Ausstattung.
Persönliche Spiel-/Geräteabnahme und menschliche Seitenbalance bleiben offen.
M3–M5 bleiben gesondert freizugeben.

Der CTF-3.0-Abgleich vom 1. November ist als
[Arena-To-do-Liste mit Checkboxen](MOBILE_AND_WORK_PACKAGES.md#arena-to-do-liste)
integriert. AP1–AP5 ergänzen die Gestaltung; M3/M4 behalten ihre IDs und ihren
Freigabestatus. **AP1 wurde danach separat freigegeben und technisch abgeschlossen:**
Spawn-/Vorratssockel, Nachladeanzeige, Vollmeldungen und Deckungsmodul.
[69 Kerntests und fünf Browserfälle](../qa/AP1_RESULT.md).
**AP2 ist anschließend separat freigegeben und technisch abgeschlossen:**
Kartenübersicht/Schnellstart, Arena-HUD und Ergebnis/Revanche; vollständige
Desktop-/Touch-Matches und Menü-/Rotationsprüfung. [Nachweise](../qa/AP2_RESULT.md).
**AP3 ist danach separat freigegeben und technisch abgeschlossen:** eigene
Arena-Figuren, unterscheidbare handgeführte Waffen und passende HUD-Icons;
zusätzlich auf Nutzerwunsch kompaktere Mobile-Bedienung. [Nachweise](../qa/AP3_RESULT.md).
Als Nächstes empfohlen: M3.1 Classic CTF. Die übrigen Bulks sind nicht zur Umsetzung freigegeben.

Separater Nutzerauftrag danach: **Arena auf 56 × 36 m erweitert, Railgun und zwei
Waffenfelder ergänzt.** Teamstarts auf beiden Seiten und Boden-Umgehungen nutzen
vorhandene Systeme. [Prüfstand](../qa/ARENA_EXPANSION_RESULT.md). E0-Umgehungen,
Höhenrouten, Ressourcenwahl und die neue Waffe nicht erneut einplanen.

Adventure bleibt eine eigenständige Variante. Das Steinlevel mit L1.6a–c ist
anschließend durch L1.5b technisch geprüft; Pausenfehler und störende Bodenlinien
wurden gezielt korrigiert. Persönliche Spiel-/Handyabnahme bleibt offen.
Maßgeblich ist der [Adventure-Levelplan](LEVEL_1_STONE_ADVENTURE.md).

**L1.6a wurde freigegeben und umgesetzt:** Auftrag, Konsole und Relaisabschluss.
[Umfang und Prüfungen](../qa/ADVENTURE_MISSION_RESULT.md).
Anschließend wurde **nur L1.6b** freigegeben: aktueller Auto-Arc-/Pulse-Vergleich,
gezielte Bossabstimmung, klarere Angriffs- und Erholungsanzeige.
[Messwerte und Prüfungen](../qa/BOSS_PRESSURE_RESULT.md).
Anschließend wurde L1.6c separat freigegeben und umgesetzt: drei funktionale Orte
und eine Wartungsreserve auf der Terrasse. [Nachweis](../qa/OUTPOST_PLACES_RESULT.md).
Die technische Gesamtabnahme L1.5b wurde am 1. November freigegeben und durchgeführt.
[Ergebnisse und persönliche Grenzen](../qa/L1_5B_RESULT.md). Kein automatisch
freigegebener Kampagnenausbau; keine zusätzliche L1.5b-Restschätzung.

## Aktueller Fortschritt

### Zwei getrennte Spielvarianten

**Arena/Teamspiel und Adventure/Kampagne sind zwei eigenständige Spielvarianten,
keine aufeinanderfolgenden Phasen desselben Spielmodus.** Sie liegen im selben
Repository und verwenden Teile derselben Technik. Dieses Dokument führt beide
Stände zusammen; ihre Ausbaupläne sind getrennt zu lesen:

| Variante | Maßgeblicher Ausbauplan | Erreichter Stand | Nächster offener Umfang |
|---|---|---|---|
| **Adventure / PvE-Kampagne — eigenständig** | [Adventure-Levelplan](LEVEL_1_STONE_ADVENTURE.md) | Ein zusammenhängendes Stein-Testlevel, L1.6a–c und technische L1.5b-Abnahme | Persönliche Spiel-/Handyabnahme; danach Kampagnenausbau gesondert planen |
| **Arena / Teamspiel / CTF / Liga — aktiv** | [Arena-To-do-Liste](MOBILE_AND_WORK_PACKAGES.md#arena-to-do-liste) | Training, 1v1, 2v2; M2.1–M2.6, Map-Paket, Konfetti und AP1–AP3 technisch geprüft | Karten-/Handyabnahme; als Nächstes M3.1 Classic CTF, gesonderte Freigabe |

Die älteren Stein-/Frost-/Glut-Bosskarten sind PvE-Vorläufer. Frost und Glut sind
noch keine Adventure-Level mit der Ausarbeitung des neuen Stein-Testlevels.
Es gibt noch keinen vollständigen Paketplan für mehrere solche Adventure-Level.

**Vergleich, aktualisiert am 1. November einschließlich Arena-Map-Paket und AP1–AP3:**

| Bereich | Adventure-Stand | Arena-Stand / gemeinsame Grundlage |
|---|---|---|
| Umgebung und Materialien | Steinflächen mit Farb-, Normal- und Rauheitskarten, ausgearbeitete Kanten und massive Plateaus | Ruhigere prozedurale Steinflächen, ausgearbeitete Kanten/Sockel und beidseitige Höhenarena; echte Höhe/Kollision |
| Pflanzen und Ausstattung | AssetQuest-Pflanzen, Farne/Felsen, Retro-Tech-Konsolen, Drohne/Relais, funktionale Ausstattung und reagierende Leitungen | Prozedurale Gartenpflanzen, Teamdepots, überarbeitete Rail-Deckungsmodule und einheitliche 3D-Spawn-/Vorratssockel mit Zustandsanzeige; keine zusätzlichen Assetdownloads |
| Spielerfigur | Animierter KayKit-Ruinenkurier | Gemeinsames KayKit-Rig; eigene Arena-Helme/Rüstung, heller Spielerhelm, blauer Wingman mit zwei Helmfinnen und korallfarbene Gegner |
| Gegner | Zwei angepasste KayKit-Steinläufer mit Nahkampfanimationen plus inszenierter Steinwächter | 1v1 oder drei KayKit-Bots im 2v2, Teamkennzeichnung, Höhenwege, Ressourcenwahl und drei Stufen; CTF-Rollen fehlen |
| Waffen und Pickups | Arc/Pulse, Modelle, Effekte und leuchtende Fundstellen | Gemeinsame Kampf-/Effektgrundlage; AP3 ergänzt Arena-spezifische Arc/Pulse/Rail-Silhouetten, Handbefestigung, Zielhaltung und passende Icons/Fundmodelle |
| HUD und Rückmeldung | Orts-/Auftragsanzeige, Interaktion, Bosswarnungen, Missionsmeldungen, eigener kompakter Touch-Menüaufbau und `StoneFeedback` | AP2: eigener Arena-Einstieg mit Kartenübersicht/Schnellstart, klar gegliederte HUD-Panels und Ergebnis/Revanche; vorhandenes Arena-Ton-/Trefferfeedback |
| Kamera und Bewegung | Links-nach-rechts-Führung, volle Verfolgung mit mobilem Vorlauf, angepasste Adventure-Sprungkurve | Gemeinsame Eingabe/Physik und seit M2.4b dieselbe Sprungkurve/Treppenhilfe; Arena-spezifischer Kameraabstand und Kartenbegrenzung |
| Mapdesign und Spielablauf | Drei funktionale Orte, geführte Mission, freiwillige Terrasse, Checkpoint/Retry, Belohnung und echter Abschluss | Obsidian Garden: beidseitig gleiche Ressourcen/Höhenrouten, Training, 1v1 und 2v2 bis Ergebnis/Restart; CTF/Liga noch offen |

**Einordnung:** Das Adventure ist bei Umgebung, Inszenierung und zusammenhängendem
Spielablauf deutlich weiter ausgearbeitet. Es ist kein Nachweis höherer technischer
Leistung und keine fertige mehrteilige Kampagne. Die Arena besitzt bereits die
gemeinsamen modernen Figuren-/Waffensysteme; ihre eigene Umgebung und Teamspiel-
Systeme sind weniger weit. Ein späterer Arena-Ausbau muss deshalb gemeinsam
vorhandene Verbesserungen zuerst prüfen und nur fehlende Teile übernehmen.

Quellen im Code: [Arena-Einstieg](../../src/app/game.ts),
[Adventure-Einstieg](../../src/app/adventureGame.ts),
[gemeinsamer Modellstart](../../src/main.ts),
[gemeinsame Figur](../../src/render/kayFighter.ts),
[Arena-Umgebung](../../src/render/buildArena.ts),
[Adventure-Umgebung](../../src/render/courtyardLook.ts).
Browsernachweise: [M2.6](../qa/M2_6_RESULT.md), [Arena-Map-Paket](../qa/ARENA_MAP_RESULT.md)
und separat [L1.5b](../qa/L1_5B_RESULT.md). Keine Freigabe eines weiteren Pakets.

### Bisherige Umsetzung und Nachweise

- [x] 29. Oktober, [Adventure-Shooter-Vorbildanalyse](ADVENTURE_SHOOTER_REFERENCES.md)
  dokumentiert: Darksiders Genesis, Bastion, The Ascent, RUINER sowie Hades und
  Alienation; belegte Eigenschaften, eigene Ableitungen für Level/Kampf/Gestaltung,
  Mobile, Asseteinsatz und konkrete Prüfkriterien. Reine Dokumentation;
  Umfang und Freigabestatus von L1.6a–c bleiben unverändert.
- [x] Kompakter Adventure-Ausbauplan erstellt und mit der Roadmap abgeglichen.
- [x] L1.6a: Auftrag, Konsole, Steinkern als Missionsgegenstand und Relaisabschluss;
  vollständiger Desktop- und emulierter Touch-Ablauf technisch geprüft.
- [x] L1.6b: Bossdruck neu gemessen; Faust und Wellenablauf gezielt abgestimmt,
  Warnfläche/-klänge und Erholung verdeutlicht; Desktop und emulierter Touch geprüft.
- [x] L1.6c: Ladestation, Wartungsbereich und Relaisanlage ausgestattet;
  optionale Reserve mit Nutzen über Checkpoint und Boss-Retry hinweg.
  Anschließend L1.5b separat freigegeben und technisch geprüft.

- [x] 29. Oktober, Tempo/Zoom/Startwaffe: Sprint um 15 % reduziert, mobile Darstellung
  nochmals rund 26 % größer; Arc Lash mit automatischer Zielwahl, fünf Strahlen,
  60°-Fächer und 0,6-s-Salve. 54 Kerntests und vier Browserfälle bestanden,
  einschließlich Desktop-Levelabschluss und echter Touch-Eingaben im emulierten
  Querformat. [Nachweise](../qa/SPRINT_ARC_MOBILE_RESULT.md).
- [ ] Persönlicher Handytest der näheren Ansicht und des neuen Arc-Spielgefühls.

- [x] 29. Oktober, kostenlose Ausstattung: acht Modelle aus der freien AssetQuest-Demo,
  vier Konsolen aus zwei Retro-Tech-Demomodellen, Bodenverankerung und freie
  Lauf-/Sprungrouten in allen drei Höfen. 11 relevante Kerntests und fünf Browserfälle
  bestanden, einschließlich Desktop-Levelabschluss und Touch-Route.
  [Vorher/Nachher und Nachweise](../qa/FREE_DECORATION_RESULT.md).
- [ ] Persönliche Sichtung der kostenlosen Ausstattung. Keine kostenpflichtigen
  Assets kaufen; die Vollversionen sind nicht Teil dieser Änderung.
- [x] Hexwars-Assetrecherche: animierter Mech und vierbeinige Railgun im Branch
  `codex/lane-wars` gefunden; tatsächliche GLB-Clips geprüft. [Kandidaten und
  Missionsideen](HEXWARS_ASSET_CANDIDATES.md) bleiben Vorschläge, ohne Änderung
  am freigegebenen L1-Umfang.
- [x] Anschließend freigegebener Hexwars-Import: zehn GLBs (Mech, Railgun/LOD,
  Hover-Bot, HQ, Fabrik/Module, Relais), sechs Blender-Quellen und Herkunftsbelege
  im Repository abgelegt. 25 Quelldateien per Hash geprüft, GLB-Inhalte/Animationen
  ausgelesen; Produktionsbuild bestanden. [Assetbestand](../../public/assets/hexwars/README.md).
  L1.6a verwendet inzwischen Hover-Bot und Relais als statische Missionsobjekte.
  Weitere Platzierungen und Gegneranbindung bleiben offen.
- [x] 29. Oktober, Kampf-Nachbesserung: Eingangssperre am tatsächlichen Durchgang,
  seitliches Umgehen/Überspringen abgesichert, texturierte Boss-Austrittsstelle,
  gezielte Bodenausbrüche auf Plateaus, sammelbarer Steinkern und Beschuss-Aggro
  der kleinen Wächter. [Änderungen und Prüfungen](../qa/ENCOUNTER_FIXES_RESULT.md).
  Die abschließende persönliche Schwierigkeitsabnahme L1.5b bleibt offen.
- [x] 29. Oktober, Spieler-Look: erste Ruinenkurier-Form mit flacherem/breiterem Kopf,
  kompakterem Körper, kräftigeren Stiefeln und Elfenbein/Korallorange/Graphit.
  Vier Browserfälle inklusive Kampf/Retry und Touch bestanden. [Nachweise](../qa/PLAYER_COURIER_RESULT.md).
- [ ] Persönliche Sichtung der Spielerform und Farbaufteilung.

- [x] 29. Oktober, L1.5a: vorgeschlagene Bosszeiten und Verfolgung umgesetzt; beide kleinen Gegner als geriggte KayKit-Wächterpuppen mit Steinoberfläche, Platten, Fäusten, Augen/Kern und Moos. Synchroner Nahkampf und Desktop-/Touch-Ablauf geprüft. [Nachweise und Balancegrenze](../qa/BOSS_AND_GUARDS_RESULT.md).

- [x] 29. Oktober, KayKit-Nachbesserung: ungewolltes Drehen beim Gehen reproduziert und behoben; begrenzte Taillendrehung baut jedes Bild auf der unveränderten Animationspose auf. Browser-Regressionsprüfung für acht Laufrichtungen und Pause ergänzt. [Ursache und Prüfung](../qa/KAYKIT_PRESENTATION_RESULT.md#nachbesserung-ungewolltes-drehen-beim-laufen-29-oktober).

- [x] 29. Oktober, Zusatzfreigabe KayKit/Pickups: geriggtes Mannequin aus dem kostenlosen Animationspaket, Lauf-/Sprint-/Sprung-/Waffen-/Treffer-/Todesanimationen, Leuchtringe und Partikel statt schwarzer Sockel. Vollständige Desktop-/Touch-Spielabläufe und neuer Präsentationsfall geprüft. [Nachweise](../qa/KAYKIT_PRESENTATION_RESULT.md).
- [ ] Persönliche Abnahme der Figur/Animationen und neuen Pickup-Präsentation.

- [x] Drei [Adventure-Level-Mockups](../concepts/adventure-levels/README.md) erstellt. Nutzerfeedback: unrealistisches Produktionsniveau und zu wenig konkrete Übersicht; als Planungsgrundlage verworfen.
- [x] [Ablaufplan für Level 1](LEVEL_1_STONE_ADVENTURE.md) erstellt und anschließend verkleinert: feste Waffen-/Lootorte, zwei Nahkämpfer und vorhandener Boss. Die früher sieben kleinen Gegner sind verworfen.
- [x] [Level-1-Mockup und Map-Skizze](../concepts/level-1-layout-v1/README.md) erstellt. Der erste begehbare Grundriss wurde während L1.1 als zu eng/verwinkelt zurückgewiesen; die Skizze ist für den aktuellen Aufbau überholt.
- [x] Roadmap am 28. Oktober am aktuellen Qualitätsziel ausgerichtet: vollständiger Levelabschluss, ein gestalteter Probehof, Übertragung von Material/Deko/Licht und abschließende Spielabnahme. [Pakete und Spannen](LEVEL_1_STONE_ADVENTURE.md#umsetzungsplan-vom-spielbaren-kern-zum-fertigen-testlevel); nach L1.3 grob 2–4 Stunden aktive Agent-Arbeit für Gestaltung und Spielabstimmung.
- [x] L1.1 freigegeben, umgesetzt und technisch geprüft: drei große Höfe (32×22, 36×24, 36×26 m), 10 m breite Verbindungen, niedrige Wände, mitgeführte Kamera, Stufen und einmalige Ressourcen. 44 Kerntests und drei Browserfälle bestanden. [Nachweise](../qa/L1_1_RESULT.md).
- [ ] Persönliche Abnahme des vergrößerten, vereinfachten L1.1-Grundrisses.
- [x] L1.1-Kameranacharbeit: Adventure standardmäßig von links nach rechts; V/Ansicht schaltet zusätzlich auf den bisherigen geraden oder isometrischen Blick. Desktop-/Touch-Weg und Schussrichtung geprüft.
- [x] Mobile-Feinschliff freigegeben und technisch geprüft: 15 % Zoom, Sprint per zweitem Finger bei gehaltenem Joystick, kompaktes Adventure-HUD mit Menü und Kameravorlauf. Adventure-Sprung auf beiden Geräten von 0,98 auf 0,72 s verkürzt; Pflichtplateaus erreichbar. 45 Kerntests, drei Browserfälle. [Nachweise](../qa/MOBILE_POLISH_RESULT.md).
- [ ] Persönlicher Handytest für Zoom, Sprint und neues Sprunggefühl.
- [x] L1.2 in kleiner Fassung ausdrücklich freigegeben und umgesetzt: je ein Steinläufer im ersten/zweiten Hof, bestehender Steinwächter im dritten, gemeinsame HP/Rüstung, Sieg/Tod/Neustart und Weiter-Button. 47 Kerntests und vier Browserfälle bestanden. [Nachweise](../qa/L1_2_RESULT.md).
- [ ] Persönlicher Spieltest des kleinen Kampfablaufs und seiner Schwierigkeit.
- [x] L1.3 freigegeben und umgesetzt: Adventure im Spielmenü, kurzer Auftrag, einmaliger Sitzungs-Checkpoint, Boss-Retry mit erhaltenem Anreisefortschritt, öffnendes Nordtor und Abschluss erst nach Durchgehen. 48 Kerntests und fünf Browserfälle bestanden. [Nachweise](../qa/L1_3_RESULT.md).
- [x] L1.4a: Erster Hof mit echten Steinmaterialien, lesbaren Mauer-/Deckungskanten, Farnen, Felsgruppen und einer Fackel gestaltet. Vier Browserfälle bestanden: Vergleichskameras, beide Deckungssprünge, vollständiger Desktopkampf und mobile Wegprüfung. [Vorher/Nachher und Nachweise](../qa/L1_4A_RESULT.md).
- [x] Rückmeldung zur Stilprobe: Boden auf die ganze Map, Pflanzen auch innen, Maueranschlüsse sauber schließen.
- [x] L1.4b-Materialschritt: Steinboden in allen Höfen/Verbindungen/Ausgang, passende Wände und Terrassen, massive Eckpfeiler mit Kollision und zusätzliche Innenpflanzen. Sieben gezielte Kerntests und fünf Browserfälle bestanden. [Nachweise](../qa/L1_4B_MATERIALS_RESULT.md).
- [ ] Persönliche Sichtung einschließlich Pflanzen/Konsolen und L1.6a–c; echter Handytest separat.
- [x] L1.5b: technische Gesamtabnahme, aktueller Bossvergleich und Leistung geprüft;
  Pausenkorrektur und reduzierte Bodenlinien. [Nachweis](../qa/L1_5B_RESULT.md).
- [ ] Persönliche Adventure-Spielabnahme. Zusätzliche Gegner/Bossphasen sind kein Pflichtprogramm.

- [x] M0.1: Eigenständiger Projektstart mit lokalen Abhängigkeiten und Browser-Build.
- [x] M0.2: 60-Hz-Simulation, Kapsel/Wandkollision, WASD/Shift, beide Kameras und Fokusbehandlung.
- [x] M0.3: V5-Materialprobe, Figur/Vegetation, Diagnose, Browsernachweise und lokale Übergabe.
- [ ] Persönliches M0-Spielurteil des Nutzers.
- [x] Gesonderte M1-Freigabe durch den Nutzer.
- [x] M1.1: Höhenmotor, Sprung/Fall, Standflächen und Kopfkontakt.
- [x] M1.2: 3D-Zielwahl, Mündungsprüfung und Diagnosefeuer auf drei Dummies.
- [x] M1.3: Gerichtete Höhenroute und Testfigur mit demselben Motor.
- [x] M1.4: Gezielter integrierter Browser-Spielablauf und technische Übergabe.
- [x] Erste persönliche M1-Rückmeldung: Kantensprung und Lesbarkeit von E2.
- [x] M1-Nacharbeit: Sprungimpuls bei aufsteigendem Kantenkontakt erhalten; E2 als massives Plateau.
- [ ] Persönliche Bestätigung der M1-Nacharbeit.
- [x] Gesonderte Freigabe ausschließlich für M2.1.
- [x] M2.1: HP/Armor, Schaden, Tod/Respawn, Spawn-Schutz, TDM-Score, Timer und Restart; spielbar als Trainingsmatch mit stationären Zielen.
- [x] Gesonderte Freigabe für M2.2 einschließlich GitHub-Pages-Spielstand und README-Playlink.
- [x] M2.2: Arc Lash/Pulse, Waffenwahl, Munition und räumlich gebundene Pickups; Kern- und Browserprüfung bestanden.
- [x] GitHub Pages veröffentlicht: Actions erfolgreich, öffentliche Seite mit Start/Pickup/Waffenwahl/Feuer geprüft; Playlink in README.
- [x] Separat freigegebener einfacher Mobile-Zugang: Joystick, direktes Touch-Aim/Feuer, Sprung/Sprint, kompakte Anzeige und Querformat. Keine vorgezogene M2.3-Implementierung; echte Smartphone-Abnahme offen.
- [x] M2.3 durch „go nächster punkt“ freigegeben: Botwahrnehmung und Kampf.
- [x] M2.3: Spielbares Botduell, begrenzte 3D-Sicht, Erinnerung, Reaktion und gemeinsame Waffen; gezielte Kern- und Browserprüfung bestanden.
- [x] Spielrückmeldung nach M2.3: Boden-Aim auf derselben Höhe bestimmt die Schussrichtung auf Waffenhöhe; Cursor vor/hinter Gegner trifft entlang der Flugbahn. [Nachweis](../qa/DIRECTIONAL_AIM_RESULT.md).
- [x] M2.4a: begrenztes 2v2, Teamkennzeichnung und unabhängige Kampf-/Lebenszyklen; [Nachweis](../qa/M2_4_RESULT.md).
- [x] M2.4b: Schwierigkeiten, Routen und Ressourcenplanung; gemeinsame Adventure-Bewegung.
- [x] M2.5 Gesamtarena/HUD/Feedback umgesetzt; [Prüfstand](../qa/M2_5_RESULT.md).
- [x] M2.6 technische Matchprüfung mit Fehlerkorrektur abgeschlossen; [Nachweis](../qa/M2_6_RESULT.md).
- [ ] Persönliche Gesamtspiel-/Geräteabnahme und Bewertung der Seitenbalance offen.

Separater Versuch vom 26. Oktober 2026, außerhalb der nummerierten Roadmap:

- [x] Vorherigen Stand `24ac358` auf `checkpoint/pre-pve-test-2026-10-26` gesichert und gepusht.
- [x] PvE-Einstieg mit eigener Begegnung: auftauchender Steinwächter, angekündigte Schockwelle und fest markierter Bodenausbruch.
- [x] Vorhandene Bewegung, Waffen und Touch wiederverwendet; eigene HP-/Sieg-/Niederlageregeln, Pickups und Neustart.
- [x] Kernprüfung und echte Browserabläufe einschließlich Sieg, Niederlage, Ausweichen und Rückkehr zur Arena. [Nachweise](../qa/PVE_BASIC_RESULT.md).
- [ ] Persönliches Spielurteil: Trägt der Kampf als Richtung für kurze PvE-Level?
- [x] 27. Oktober: Positive Rückmeldung zu Auftauchen und Steinmonster; Verfolgung ergänzt, Angriffe bleiben angekündigt und ortsfest.
- [x] Drei thematische Karten mit unterschiedlichen Gegnern als kleine zusammenhängende Kampagne umgesetzt: Steinhof/Steinwächter, Kristallkluft/Frostspinne, Glutschmiede/Glutwurm.
- [x] Einleitungen, echte Sieg-Übergänge und Kampagnenabschluss; frische Ressourcen je Karte, einzelne Karten direkt testbar.
- [x] Zusätzlich freigegebene visuelle Überarbeitung: eigene Pickup-/Waffenmodelle, unterschiedliche Schusseffekte und kompakteres HUD mit HP-/Armor-/Bossbalken umgesetzt.
- [x] Mini-Kampagne und Darstellung technisch geprüft: 37 Kerntests, drei echte Boss-Siege mit Übergängen/Abschluss sowie sechs weitere Browserfälle. [Nachweis](../qa/MINI_CAMPAIGN_RESULT.md).
- [ ] Persönliche Spielabnahme der drei Karten und der neuen Darstellung.
- [x] Erneute Rückmeldung zur Plateau-Lesbarkeit eingearbeitet: vertikale Wandmaterialien vom Boden getrennt, Front-/Seitentönung, durchgehende Eckkanten und Sockel bis zum Boden. Drei Browserfälle bestanden, beide Perspektiven aller Karten gesichtet. [Nachweis](../qa/PLATEAU_WALLS_RESULT.md).
- [x] Freigegebene Steinhof-Qualitätsrunde umgesetzt und technisch geprüft: erste Tonfassung, Trefferfeedback, zum Kontaktzeitpunkt abgestimmter Faustschlag, Wegsuche um reale Deckung und Heilungsweg über zwei niedrige Stufen. 41 Kerntests und sieben Browserfälle bestanden. [Ergebnis](../qa/STONE_QUALITY_RESULT.md).
- [ ] Persönliche Abnahme der Steinhof-Qualitätsrunde; Übertragung auf Frost/Glut erst nach Bewährung.
- [x] Normale Bossangriffe zusätzlich zu den Spezialangriffen: Faustschlag/Biss/Vorstoß mit Vorbereitung, festgelegter Richtung, Einzelkontakt, Pause und echter Deckungs-/Höhenprüfung. Unterschiedliche Kartenwege und Waffen-/Vorratspositionen; Start mit Arc, Pulse als Pickup, Heilung auf niedrigen Plattformen. [Prüfung](../qa/BOSS_BASICS_RESULT.md).
- [x] Kartendetails ergänzt: Efeu/Reliefs, Eiszapfen/Frost, Ofengitter/Beschläge und dezente Umgebungsanimation. Rückmeldung zu schwebend wirkenden Bodenflecken und schlecht lesbaren Höhen eingearbeitet: Details direkt im Bodenmaterial, klare freie Oberseiten und Kanten. Vier Browserfälle mit echtem Plattformsprung, drei Boss-Siegen, Vollbild und Touch bestanden. [Nachweise](../qa/CAMPAIGN_SCENERY_RESULT.md).
- [x] Nacharbeit auf HUD-/Lava-Rückmeldung: nähere Kamera, echtes Vollbild per F/Button, schlanke Anzeigen und HP/Rüstung über der Figur; Glutschmiede deutlich aufgehellt. Vier Browserfälle einschließlich kompletter Kampagne, Vollbild und Touch bestanden. [Nachweis](../qa/IMMERSIVE_HUD_RESULT.md).
- [ ] Erst nach Rückmeldung über weiteren PvE-Ausbau oder Kampagnenplanung entscheiden. Keine Änderung der bisherigen Meilensteinfreigaben.

Nachweise: [M0-Ergebnis](../qa/M0_RESULT.md), sechs bestandene Kern-/Physiktests und 24 bestandene Browserfälle. Eine Neuinstallationsprüfung aus einem frischen Checkout wurde nicht zusätzlich durchgeführt; Installation und Build im Arbeitsverzeichnis sind geprüft.

M1-Nachweise: [M1-Ergebnis](../qa/M1_RESULT.md), insgesamt zehn bestandene Kern-/Physiktests und fünf Browserfälle in Chromium 1366×768, darunter ein vollständiger Höhen-/Treffer-/Navigationsablauf mit echten Eingaben. Keine erneute Vollmatrix über alle Browser; keine persönliche Abnahme behauptet.

Nacharbeit auf konkrete Spielrückmeldung: elf Kern-/Physiktests und zwei gezielte Browserabläufe, darunter Sprünge unmittelbar gegen beide Plateauwände. Die erste Übergabe prüfte erfolgreiche Landungen, aber nicht deren Dauer; der neue Regressionstest begrenzt die Landungszeit und erkennt das frühere langsame Hochziehen.

M2.1-Nachweise: [Ergebnis](../qa/M2_1_RESULT.md), 16 bestandene Kern-/Physiktests, sechs bestandene M0/M1-Browserregressionen und ein vollständiger neuer Matchablauf in Chromium 1366×768. Spieler-Tod/Respawn, Schutz, zehn tatsächliche Abschüsse, Ergebnis und Restart wurden durch echte Eingaben erreicht. Zeitende/Gleichstand/gleichzeitige Kills sind zusätzlich im numerischen Kern geprüft. Das vollständige 2v2-M2-Gate bleibt offen.

M2.2-Nachweise: [Ergebnis](../qa/M2_2_RESULT.md), 21 bestandene Kern-/Physiktests und acht Browserfälle (sieben Regressionen einschließlich vollständigem Match, ein neuer Waffen-/Pickup-Ablauf). Arc-Kegel/Randtreffer/Deckung, echte Pulse-Flugzeit und Kugel-Sweeps, Auswahl/Munition/Fallback, höhengebundene Teilaufnahmen und Respawn geprüft. GitHub-Playlink und Actions-Workflow ergänzt; keine persönliche Spielabnahme behauptet.

**Aktuelle Priorität nach Nutzerfeedback:** Kleine, sichtbare und spielbare Ergebnisse zuerst. Pro Änderung die relevanten Kernprüfungen ausführen. Die weiter unten geplanten umfassenden Randfall-, Langzeit- und Balance-Matrizen gelten als späterer QA-Ausbau, nicht als automatisch vorzuziehende Voraussetzung für jeden frühen Zwischenstand. Der konkrete Testumfang wird mit dem nächsten freigegebenen Paket begrenzt. V5 bleibt die Richtung für Optik und Spielgefühl; wesentliche Abweichungen werden vorab abgestimmt.

Das erste Arena-Produktziel war ein verlässlich spielbares 2v2-TDM auf einer
Höhenarena und ist bis M2.6 technisch geprüft. Der Adventure-Vorrang vom 28. Oktober
war eine frühere Priorität; inzwischen wird Arena separat fortgesetzt. Maßgeblich
für die nächste Reihenfolge ist die Arena-To-do-Liste oben. Jeder freigegebene
Schritt endet mit einem sichtbaren Ergebnis und passender Prüfung.

Die konkrete Reihenfolge der Arbeitspakete M0.1 bis M4.4 und die Einschätzung einer optionalen Mobile-Erweiterung stehen in [MOBILE_AND_WORK_PACKAGES.md](MOBILE_AND_WORK_PACKAGES.md). Die dortigen Pakete unterteilen die folgenden Aufwandsspannen; sie erweitern den Desktop-Umfang nicht. Ein Touch-Versuch wäre ein separat freizugebender Zusatz.

## Anpassung des Starterplans

Der bisherige [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) verlangt für M0 bereits eine Szene mindestens in vollständiger V5-Qualität, schiebt Höhen-/Kollisions-/Trefferkorrektheit aber nach M1. Das würde den ersten Auftrag entweder unnötig groß machen oder eine zweite vorläufige Physik festschreiben.

Freigegebener Zuschnitt: **M0 umfasst Fundament, Kameras, Figur, Basiskollision und eine repräsentative Gestaltung.** V5 bleibt unverändert daneben verfügbar. M1 liefert die begehbare Höhen-/Aim-Probe; die Gesamtarena und das erste Match folgen in M2. Die Vision bleibt unverändert. Die ursprünglichen Starterdokumente sind historischer Input; diese Roadmap führt den aktuellen freigegebenen Umfang.

## Aufwand und Reihenfolge

**Geschätzt wird aktive Agent-Arbeitszeit in Minuten/Stunden, keine menschlichen Entwicklertage.** Neue Kalibrierung: **M0 und M1 jeweils ca. 30 Minuten bis zur ersten technischen Übergabe laut Nutzer**, zusammen ca. eine Stunde. Teilpakete wurden nicht einzeln gemessen. Die vorherige M1-Schätzung von 1,5–3 Stunden lag damit um den Faktor 3–6 zu hoch. Die neue Planung reduziert auch die Folgemeilensteine, behält jedoch Reserve für die komplexeren Kampf-, Bot- und Ligaregeln. Die Spannen enthalten passende Kern-/Browsertests, eine kleinere Korrekturrunde, Dokumentation, Commit und Push. Nacharbeit aufgrund späterer Spielrückmeldungen wird separat vom historischen Erststand dokumentiert; 30 Minuten bedeuten nicht fehlerfrei oder spielerisch abgenommen.

**Separat:** persönliche Spieltests (meist 5–15 Minuten pro Meilenstein), Rückmeldung/Freigabe und deren Wartezeit. Größere Richtungswechsel, zusätzliche Inhalte, neue Assets und Gerätebeschaffung sind nicht enthalten. Die Obergrenze enthält bereits einen Korrekturpuffer; kein weiterer pauschaler 25-Prozent-Aufschlag.

| Meilenstein | Lieferumfang | Aufwand | Sichtbares Gate |
| --- | --- | --- | --- |
| **M0 Fundament — technisch erledigt** | Vite/TS/Three/Rapier, fester Takt, Figur auf E0, Wandkollision, beide Kameras, V5-Materialprobe, Start-/Buildanleitung | **Ist: ca. 30 Minuten** (Nutzerangabe) | Browsernachweise vorhanden; persönliches Spielurteil offen |
| **M1 Höhen und Aim — technisch erledigt, nachgearbeitet** | E0/E1/E2, Sprung und Fall, Körper-/Deckenfreiheit, Zielmarker und Diagnosewaffe, drei Dummies, einfache Bot-Traversalprobe | **Ist Erststand: ca. 30 Minuten** (Nutzerangabe); Nacharbeit separat | Erste Spielrückmeldung eingearbeitet; erneute persönliche Bestätigung offen |
| **M2 erstes Spiel — bis M2.6 technisch abgeschlossen** | Eine überarbeitete Arena, 2v2-TDM, Arc Lash/Pulse/Rail, Pickups, HP/Armor, Tod/Respawn, Score/Timer/Restart, Easy/Normal/Hard, kleines HUD und kurze Feedbacksounds | **1,5–3 Stunden historischer Gesamtplan; keine aktuelle Restschätzung** | Persönliche Gesamtspiel-/Geräteabnahme und Bewertung der Seitenbalance offen |
| **M3 Objectives** | Erst Classic CTF, danach One Flag; Träger-, Drop-, Return- und Capture-Regeln sowie passende Teamrollen | **1–2 Stunden** | Echte Captures durch gültige Wege; Schwierigkeit und Teams bleiben nachvollziehbar |
| **M4 kleine Liga** | Ein-Klick-Qualifier, Teamidentität, eine Proving-Saison mit drei Matches, Tabelle, ein Recruitment-Moment, sichere lokale Saves | **1–2 Stunden** | Neuer Spieler versteht den Einstieg; komplette kleine Liga einschließlich Reload und Recruitment |
| **M5 spätere Produktvalidierung** | Weitere Arenen, zusätzliche Waffen, größere Liga und Distributionsentscheidung nach Kernspielabnahme | **Noch nicht seriös schätzbar** | Eigenständiges Go/No-Go und neuer begrenzter Auftrag |

**Historischer Plan nach M2.3:** 40–80 Minuten bis einschließlich M2 beziehungsweise
2 Stunden 40 Minuten bis 5 Stunden 20 Minuten bis einschließlich M4. Nach der
Aufteilung von M2.4 sind diese Zahlen keine aktuelle Restschätzung. Den konkreten
M2.4b wurde mit zusätzlicher Bewegungsübernahme ausdrücklich freigegeben; keine erfundenen Istzeiten abziehen.

Bei einem ungelösten Grundproblem wird das Layout vereinfacht oder der laufende Meilenstein geteilt. Es werden nicht gleichzeitig zusätzliche Maps, Waffen oder Menüs begonnen.

## M0 Abnahme

Der vollständige Auftrag steht in [M0_IMPLEMENTATION_BRIEF.md](M0_IMPLEMENTATION_BRIEF.md).

- Frischer Installationslauf über `npm ci`, Typecheck, Build und Browser-Smoke funktionieren mit dokumentierter Toolchain.
- Die sichtbare Szene enthält neutralen Stein/Metall, grünes Laub, eine Figur, E0 und eine echte blockierende Wand; E1/E2 dürfen zunächst unbegehbare sichtbare Plattformkörper sein.
- WASD bewegt die Figur bildschirmbezogen, diagonal nicht schneller; Shift verändert das Tempo; V wechselt beide Kameras. Kollision, Kamera und Marker bleiben synchron.
- Fokusverlust setzt gehaltene Eingaben zurück und pausiert sauber. Fenstergröße ändern erzeugt keinen verzerrten Canvas.
- Der Test bewegt die Figur wirklich, prüft eine blockierte Bewegung und liest ihren tatsächlichen Zustand. Ein bloß sichtbarer Canvas reicht nicht.
- Der Nutzer erhält Startanleitung, Screenshots, Messumgebung und die klare Aussage, dass dies noch kein Combat- oder Höhen-Slice ist.

## M1 Abnahme

Die Pakete Motor → Aim → Traversalprobe → Browserübergabe sind technisch abgeschlossen. Nach dem Wunsch nach schnelleren Ergebnissen wurde das frühe Gate auf die folgenden konkreten Fälle begrenzt. Breitere Wiederholungs- und Formenmatrizen folgen bei Bedarf nach dem persönlichen Spieltest.

| Fall | Erwartetes Ergebnis |
| --- | --- |
| E0→E1→E2 | Bestanden: echte WASD-/Space-Eingaben im Browser; gemeinsamer Motor im Rapier-Kerntest |
| E0→E2 ohne Zwischenstand | Bestanden: direkter Standardsprung kommt nicht über die massive 4,10-m-Wand |
| Fall und Standfläche | Bestanden: Testfigur E2→E0, echte Schwerkraft und korrekte Flächen-IDs |
| Wandkontakt und Sliding | Bestanden: bestehende Rapier- und Browserregression; keine neue Vollmatrix aller Formen |
| Sprung unmittelbar an der Wand | Bestanden: Aufwärtsgeschwindigkeit bleibt erhalten; Landung auf E1/E2 innerhalb eines Sprungs statt langsamen Hochziehens |
| Überhang im Testlabor | Bestanden: Kopfkontakt beendet Aufstieg; Landung darunter statt Durchstieg. Die Spielarena selbst hat jetzt einen massiven E2-Körper |
| Zwei Flächen über gleichem X/Z | Bestanden: Rapier-Abfragen unterscheiden obere/untere Fläche in der separaten Überhang-Testszene |
| Drei Höhenziele | Bestanden: freie Diagnosetreffer an E0/E1/E2, Zielpunkt liegt auf der Oberfläche |
| Sichtbares Ziel bei verdeckter Mündung | Bestanden: Wand wird zuerst getroffen; Zielzähler bleibt unverändert |
| Kamera, Eingabe, Fokus und Größe | Bestanden: beide Ansichten, Aim nach Wechsel, Pause/Reset der Eingaben und Resize |
| 30/60/144-Hz-Renderplan | Bestehender Kerncheck weiterhin bestanden |
| Testfigur | Bestanden: E0→E1→E2→E0 ohne Positionsinjektion, gleicher Motor/gleiche Werte; isolierte Kollisionswelt |

Bewusst noch offen: zehnfache Wiederholungen je Link/Kamera, sämtliche Höhen-/Sichtkombinationen, komplexe Rundformen, Langzeit- und Geräte-/Browser-Vollmatrix. Inventar, Pickups und Schadensregeln gehören zu M2 und sind kein M1-Nachweis.

Anschließend persönlicher Nutzer-Spieltest von mindestens 5–10 Minuten. Protokoll: Wird Höhe sofort verstanden? Sind Landungen und Zielmarker zuverlässig? Bleibt die Figur sichtbar? Fühlt sich die Steuerung direkt an? Ein negatives Urteil führt zu gezielter M1-Nacharbeit.

## M2 Abnahme

Prüfstand vom 31. Oktober: [M2.6-Ergebnisse](../qa/M2_6_RESULT.md).
Technische Gates geprüft: 68 Kerntests, 30 vollständige Botmatches und zehn
Browserfälle. Drei 2v2-Runden mit regulärer 120-s-/10-Kill-Konfiguration endeten
am Abschussziel; der Zeitlimitpfad wurde zusätzlich volle 120 Sekunden geprüft.
Das persönliche Nutzerurteil und echte Mobilgeräte sind damit nicht abgenommen.
Die damals asymmetrische Versorgung zeigte eine auffällige Seitenbalance. Das
anschließende [Map-Paket](../qa/ARENA_MAP_RESULT.md) gleicht Ressourcen/Zugänge an;
der kontrollierte Botvergleich ersetzt weiterhin kein menschliches Spielurteil.

Erst zwei klar unterschiedliche Waffen und ein Matchmodus. Arc-Lash-Zielkegel und Pulse-Tracking werden vor endgültiger Abstimmung vergleichbar getestet; eine andere Arc-Lash-Zielregel benötigt eine dokumentierte Entscheidung. Rocket, Todes-Drops und weitere Waffen folgen als separate Aufträge.

Funktionale Gates:

- 1 Mensch + 1 Verbündeter gegen 2 Gegner; anfänglich 120 Sekunden oder 10 Teameliminierungen.
- HP, Armor, Trefferfeedback, genau ein Kill pro Leben, Respawn, Spawn-Schutz und dessen Ende funktionieren.
- Waffenpickup und Munition haben echte Höhenbindung. Nach leerer Pulse fällt die Auswahl korrekt auf Arc Lash zurück; kein erzwungener Wechsel beim Pickup.
- Alle Bots erreichen notwendige E0/E1/E2-Flächen und bestrittene Ressourcen. Easy verliert keine Pflichtwege.
- Matchende und Restart sind eindeutig, ohne alte Eingaben, Projektile oder HUD-Zustände.
- Friendly Fire ist für diesen Slice aus. Verbündete verursachen keine Schadensereignisse; die konkrete Projektilfilterung ist einheitlich getestet.

Automatische Simulation:

- Eine Karte × drei Difficulty-Profile × zehn Seeds = **30 vollständige 2v2-Botmatches**.
- Keine ungültigen Positionen, ungültigen HP-/Munitionswerte oder Softlocks.
- Fortschritt anhand erreichter Wegpunkte, Höhenwechsel und erfüllter Intents messen. Gewolltes Halten in Kampfentfernung ist kein „stuck“.
- Ein Bot mit unerfülltem Bewegungsauftrag darf nicht länger als fünf Sekunden ohne räumlichen Fortschritt bleiben; betroffene Seed-Traces müssen erklärt und behoben werden.
- Kontrollierte Wahrnehmungsfälle: kein Schuss vor der konfigurierten Reaktion, kein Zugriff auf aktuelle verdeckte Gegnerpositionen, keine Unterschiede bei Basisstats.
- Trefferquote und Schaden getrennt nach Waffe, Distanz, Sicht und Bewegungszustand auswerten. Ein globales Trefferquotenlimit allein beweist keine Fairness.

Echte Browser- und Nutzergates:

- Mindestens drei komplette 120-s-Matches mit normaler Eingabe und echten Ergebnissen, darunter Easy und Normal; kein injiziertes Matchende.
- Automatisierter Ablauf: starten → bewegen → springen → Pickup aufnehmen → Waffe wählen → tatsächlich treffen → Tod/Respawn beobachten → reguläres Matchende → Restart.
- Ein dokumentierter 10-Minuten-Nutzervergleich von Easy/Normal/Hard. Schwierigkeit muss sich durch Entscheidungen und Aim erklären lassen.
- Ein funktionierender Produktionsbuild unter dem späteren Pfad `/CoreArena-3D/`, ohne CDN-Laufzeitabhängigkeiten. Veröffentlichung erst als bewusster Schritt nach lokalem Gate.
- Performanceprofil auf dokumentierter Hardware und Sichtprüfung von Teamzugehörigkeit, Deckung, Höhen und Waffen.

## M3 Abnahme

Classic CTF wird abgeschlossen, bevor One Flag ergänzt wird. Bestehende Flaggenzustände bleiben die fachliche Referenz; Berührung und Capture werden in 3D geprüft.

- Eigene Flagge am Heimort als Bedingung für Classic-Capture; Drop beim Tod, Rückgabe durch eigenes Team, Timeout und sicherer Reset bei unzugänglicher Ablage.
- Keine Aufnahme oder Wertung durch eine Etage hindurch.
- Carrier, Angriff, Verteidigung und Rückholung haben sinnvolle Priorität vor optionalem Loot und ziellosem Combat.
- One Flag: genau ein sinnvoller Runner bei freier Flagge, anschließend Carrier/Escort beziehungsweise Interception.
- Pro Modus × drei Stufen × zehn Seeds = **60 vollständige Botmatches**. Mindestens 8 von 10 Spielen je Modus/Stufe produzieren einen regulären Capture; alle Ausnahmen werden als Trace geprüft. Dieser vorläufige Fortschrittswert darf nicht durch künstliche Punkte erfüllt werden.
- Zusätzlich isolierte, störungsarme Szenarien: aufnehmen → über Höhenroute tragen → gültig abgeben; 10 von 10 erfolgreich.
- Je Modus mindestens ein vollständiger menschlicher Browser-Spieltest. Graphprüfung auf zwei brauchbare alternative Wege von jeder Basis zum umkämpften Objective.

## M4 Abnahme

Ein kleiner Qualifier und ein Proving-Circuit genügen. Vorhandene Arena darf mit bereits abgenommenen Modi mehrfach verwendet werden; M4 erzwingt keine drei neuen Premium-Arenen.

- Maximal ein Klick bis zum Qualifier; Hinweise bestätigen echte Bewegung, Aim, Treffer, Pickup und Sprung.
- Kompakte Teamgründung; drei Matches; nachvollziehbare Tabelle und Abschluss.
- Nach einem Rivalensieg Wingman behalten oder rekrutieren; Unterschiede ausschließlich im Botverhalten.
- Ein regulär erspieltes Ergebnis zählt genau einmal, auch nach Reload oder wiederholter Ergebnisverarbeitung.
- Speicherfehler und unbekannte Saveversion zerstören keinen bestehenden Spielstand. Ein zweiter Tab darf keinen neueren Stand überschreiben.
- CTF-Schlüssel mit Testdaten vorbefüllen und nach allen Save-/Resetaktionen unverändert nachweisen.
- Automatisierte UI-Flows dürfen Resultate als Fixture verwenden, müssen so gekennzeichnet sein. Mindestens ein vollständiger realer Drei-Match-Durchlauf bleibt ein eigenes Gate.
- Neuer Spieler durchläuft Einstieg und kleine Saison ohne erklärende Eingriffe. Wenn zunächst nur der Owner verfügbar ist, bleibt unabhängige Erstnutzer-Evidenz ausdrücklich offen.

## Gemeinsame Teststrategie

### Regeln und räumliche Integration

Für isolierte Regeln zunächst Node-Test-Runner mit TypeScript-Ausführung wie im Vorgänger; keine zweite Testbibliothek ohne Bedarf. Integrationstests benutzen den echten Rapier-Adapter ohne Renderer. Ein Fake der Physik darf nicht das Kanten-/Treffergate erfüllen.

Wichtige Invarianten: feste Tickschritte, keine doppelten Awards, keine negativen Inventarwerte, Spawn-Schutz, Pause, korrekte Erstkollision, Schüsse und Pickups ohne Ebenendurchgriff, reproduzierbare Pflichtlinks. Beim Import einer Regel werden die passenden fachlichen Tests mit übertragen.

### Echte Browserbedienung

Playwright prüft den gebauten Preview-Build und nicht ausschließlich den Devserver. Die Standardmatrix enthält Chromium in CI sowie installierten Chrome und Edge lokal. Mindestens 1366×768 und 1920×1080 prüfen; gelegentlich 2560×1440 mit höherer Pixeldichte. Der Browserbericht nennt tatsächlichen Browser, Version, Viewport und GPU-/Rendererumgebung.

Tastatur und Maus werden über normale Browser-Eingaben bedient. Eine ausschließlich im Testbuild verfügbare lesende Diagnose darf Position, Standfläche, HP, Tick und Events liefern. Sie darf weder Treffer noch Score noch Endergebnis setzen. Separate Fixtures dürfen Ausgangsszenarien vorbereiten; sie ersetzen keinen Weg vom regulären Spawn zum Ziel.

Auf Fehler: Screenshot, Trace, relevante Konsole, fehlgeschlagene Requests, Seed und letzter Zustand sichern. Ein beim Retry grüner Test bleibt als Flake sichtbar. Software-WebGL in CI belegt Renderingfunktion, keine reale GPU-Leistung.

### Sichtprüfung und Spielgefühl

Bei visuellen Änderungen Vergleichsaufnahmen mit festgehaltener Kamerapose, Licht, Viewport und DPR. Beurteilt werden Materialtrennung, Laubfarbe, Bodenkontakt, Plattformkanten, Teamlesbarkeit und freie Sicht. Pixelidentität über unterschiedliche GPUs ist kein sinnvoller alleiniger Maßstab.

Technische Tests entscheiden über Regelkorrektheit. Der persönliche Spieltest entscheidet über Zielklarheit, Bewegungsgefühl und Spaß. Beide sind nötig; keines ersetzt das andere.

### Bericht je Meilenstein

Der Abschlussbericht enthält tatsächlichen Commit/Branch, Start-/Preview-Link oder lokale Startanleitung, implementierten Umfang, Testbefunde, Aufnahmen, bekannte Fehler und die konkrete Freigabeempfehlung. Status:

- **Umgesetzt:** Code vorhanden.
- **Technisch geprüft:** automatische und reale Browserfälle bestanden.
- **Spielerisch abgenommen:** Nutzer hat den jeweiligen Spieltest bestätigt.

Nur der letzte zutreffende Status wird behauptet. M0/M1 und M2.1–M2.6 sind
umgesetzt und technisch geprüft; [aktueller Prüfstand](../qa/M2_6_RESULT.md).
Persönliche Spielurteile und echte Handytests bleiben separat offen.
