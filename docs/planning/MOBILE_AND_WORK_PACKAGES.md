# CORE ARENA 3D: Arena-Roadmap und Arbeitspakete

Arena-Stand: 1. November 2026; Adventure-Verweise aktualisiert am 2. November.
**Die M-Paketfolge dieses Dokuments gehört zur eigenständigen
Spielvariante Arena / Teamspiel / CTF / Liga.** M0, M1 und M2.1–M2.3 sind technisch
umgesetzt. **M2.4a (kleines 2v2) ist umgesetzt.** Die Arena-Reihenfolge gilt nur für Arena.
M2.4b (Routen/Ressourcen/Schwierigkeiten) ist umgesetzt und technisch geprüft.
**M2.5 ist umgesetzt und technisch geprüft; M2.6 technisch abgeschlossen.**
[M2.6-Nachweise](../qa/M2_6_RESULT.md). Persönliche Spiel-/Geräteabnahme und
Bewertung der menschlichen Seitenbalance bleiben offen; M3–M5 sind nicht freigegeben.

**Arena-Map-Paket, am 1. November separat freigegeben, umgesetzt und technisch geprüft:**
Die 56 × 36-m-Karte hat nun beidseitig gleiche Deckung, E1/E2-Zugänge und
Pulse-/Heilungs-/Höhenvorräte. Ruhigere Steinflächen, klarere Kanten, kleinere
Pflanzenblätter, eingebaute Teamdepots und Rail-Energiekästen ergänzen die Gestaltung.
Die neue Versorgung wird vor/nach dem Umbau einschließlich gespiegelter Karte
mit denselben Bot-Startvarianten verglichen. [Umfang und Prüfstand](../qa/ARENA_MAP_RESULT.md).
Freie Kampfwege und vorhandene Systeme bleiben maßgeblich. Die Arena hat eine
eigene Gestaltung; die Adventure-Assetpakete werden nicht zusätzlich geladen.
M3 ist weiterhin nicht freigegeben. Der CTF-3.0-Abgleich ergänzt die untenstehende
[Arena-To-do-Liste](#arena-to-do-liste) um gezielte Gestaltungs-Bulks.
**AP1 Premium-Bauteile ist separat freigegeben, umgesetzt und technisch geprüft:**
3D-Spawn-/Vorratssockel, Nachladeanzeige, Vollmeldungen und überarbeitete
Rail-Deckungen. [Desktop-/Touch-Nachweise](../qa/AP1_RESULT.md).
**AP2 Arena-HUD und Matchfluss ist ebenfalls separat freigegeben und technisch umgesetzt:**
Arena-Einstieg mit Kartenübersicht, Schnellstart, klareren Kampf-Panels und
Ergebnis/Revanche. [Desktop-/Touch-Nachweise](../qa/AP2_RESULT.md).
**AP3 Figuren und Waffenpräsentation ist danach separat freigegeben und technisch umgesetzt:**
Arena-Helme/Rüstung, handgeführte Arc/Pulse/Rail und passende Icons. Auf zusätzlichen
Nutzerwunsch sind Mobile-Steuerung und Vitalanzeige kompakter. [Nachweise](../qa/AP3_RESULT.md).
Empfohlener nächster Bulk: **M3.1 Classic CTF**, noch nicht freigegeben.

**Kleiner Arena-Feedback-Nachtrag, umgesetzt und geprüft:** klarere Eliminierungen
mit kurzem Lichtimpuls und Konfetti in Teamfarben. Spieler/Bots, Pause und Respawn
auf Desktop/Touch geprüft; keine Regeländerung und kein Beginn von M3.
[Nachweis](../qa/ARENA_DEATH_RESULT.md).

**Separat angeforderter Arena-Zusatz:** 56 × 36 m, zwei Railgun-Felder, Railgun und
getrennte Teamstarts umgesetzt. Vorhandene Boden-Umgehungslogik wiederverwendet;
Höhennavigation, bedarfsgerechte Ressourcenwahl und Schwierigkeit wurden danach
mit M2.4b ergänzt; zusätzlich die Adventure-Sprungkurve und Treppenhilfe übernommen.
[Ausbau/Prüfung](../qa/ARENA_EXPANSION_RESULT.md). Adventure bleibt unverändert.

**Adventure / PvE-Kampagne bleibt eine separate Spielvariante.**
Für ihren Ausbau gelten die [neue Produktvision](ADVENTURE_VISION.md) und allein die
[Adventure-Roadmap](ADVENTURE_ROADMAP.md). Neue Richtung: Desktop-first-Action-Adventure
mit Boss-Rush-Schwerpunkt; A0.1–A4 sind separat beauftragt und technisch abgeschlossen.
T1/G1 qualitativ bestanden; Peitschen-/Trefferfeedback bleibt als Feinschliff offen.
Weitere Adventure-Bulks bleiben geplant.
Der [L1-Levelplan](LEVEL_1_STONE_ADVENTURE.md) ist Bestands-/Historiennachweis:
L1.6a–c sind umgesetzt, L1.5b ist technisch abgeschlossen; persönliche Abnahme offen.
Arena-Pakete sind keine nächsten
Adventure-Schritte. [Vergleich und gemeinsame Systeme](MILESTONES_AND_QA.md#zwei-getrennte-spielvarianten).

## Arena-To-do-Liste

Stand: 1. November 2026. Integrierter Ausbauplan aus dem CTF-3.0-Abgleich mit
20 Verbesserungshebeln; keine zusätzliche konkurrierende Roadmap.
**AP1–AP3 wurden separat freigegeben und sind umgesetzt und technisch geprüft.**
Alle offenen Bulks sind geplant und benötigen einen eigenen Umsetzungsauftrag.

**Ziel:** ein hochwertiger 3D-Arena-Shooter gegen Bot-Teams mit einer gut lesbaren
Höhenkarte, unterscheidbaren Waffen, CTF/One Flag und einer kurzen Liga mit
Rivalen und verhaltensbasiertem Wingman-Recruitment. Skill statt Stat-Grind.
Adventure bleibt eine eigenständige Variante; CTF-3.0 und Hexwars werden nicht verändert.
Nur kostenlose beziehungsweise eigene Assets mit dokumentierter Herkunft verwenden.

**Pflege:** `[x]` bedeutet umgesetzt und technisch geprüft, nicht automatisch
persönlich abgenommen. Nach jedem Bulk Datum, Nachweis und verbleibende Grenzen
ergänzen. `H1` bis `H20` verweisen auf die Nummern der Analyse vom 1. November.
AP1–AP5 sind neue Gestaltungszusätze; M3/M4 behalten ihre bestehenden IDs.
Die älteren M-Zeitspannen weiter unten sind Vorabwerte, keine Zusage für den
hier konkretisierten Umfang. Aktive Agent-Zeit vor dem jeweiligen Auftrag neu
schätzen; Geräte-/Nutzerwartezeit separat halten.

### Bereits vorhanden — nicht erneut entwickeln

- [x] M0/M1 und M2.1–M2.6: echte Höhen/Deckung, Sprung und Treppenhilfe,
  Training/1v1/2v2, Bot-Höhenwege/Ressourcenwahl und drei Schwierigkeitsstufen.
- [x] Arc Lash, Pulse und Railgun mit Modellen, Munition, Auswahl und räumlichen Treffern.
- [x] 56 × 36-m-Arena mit getrennten Teamstarts, beidseitigen E1/E2-Routen,
  symmetrischer Versorgung, zwei Rail-Feldern, überarbeiteten Materialien und Depots.
- [x] Geriggte Figuren, kompaktes Desktop-/Touch-HUD, Pause, Treffer-/Tonfeedback,
  Tod mit Konfetti, regulärer Respawn, Matchwertung und Neustart.
- [ ] Persönliche Karten-/Spielabnahme, menschliche Seitenbalance und echtes Handy prüfen.

Nachweise: [M2.6](../qa/M2_6_RESULT.md), [Map-Paket](../qa/ARENA_MAP_RESULT.md),
[Konfetti](../qa/ARENA_DEATH_RESULT.md). Die offenen Gestaltungspunkte verfeinern
diese Grundlagen; sie erklären bereits vorhandene Systeme nicht wieder zu fehlenden.

### Empfohlene Reihenfolge

**AP1 ✅ → AP2 ✅ → AP3 ✅ → M3.1 → M3.2 → M3.3 → AP4 → AP5 → M4.1–M4.4.**
M5.W1 bleibt ein optionaler späterer Versuch. AP1–AP5 sind keine technische
Startbedingung für M3; bei Vorrang für Objectives kann M3.1 nach Kartenabnahme
direkt freigegeben werden. Keine automatische Freigabe nach Abschluss eines Bulks.

| Bulk | Ergebnis | Analyse-Hebel |
| --- | --- | --- |
| **AP1 — technisch erledigt** | Gestaltung, Spawn-/Pickup-Pads und Deckungsmodul | H2, H4, H5, H8 |
| **AP2 — technisch erledigt** | Arena-HUD, Touch-Lesbarkeit, Start/Ergebnis/Revanche | H3, H12, H16 |
| **AP3 — technisch erledigt** | Figuren und Waffenpräsentation | H6, H7 |
| **M3.1 — als Nächstes empfohlen, offen** | Classic CTF und erste Objective-Rollen | H1, Grundlage H11 |
| M3.2 | One Flag | H17 |
| M3.3 | Teamkommandos, Ressourcen und Objective-Abnahme | H11, H14 |
| AP4 | Licht und gestaltete Umgebung | H9, H10 |
| AP5 | Kampfereignisse und Klang | H13 |
| M4.1 | Qualifier | H15 |
| M4.2 | Team und Drei-Match-Saison | H18 |
| M4.3 | Rekrutierung und lokale Saves | H19, Abschluss H18 |
| M4.4 | Gesamtabnahme bis Reload; persönlicher Geräte-Nachweis separat | Übergreifende Abnahme |
| M5.W1 — optional | Eine zusätzliche taktische Waffe | H20 |

### AP1 — Premium-Bauteile (H2, H4, H5, H8)

Spielergebnis: Basen, Versorgung und Deckung wirken wie Teile einer gestalteten Arena.

**Am 1. November umgesetzt und technisch geprüft.** [Ergebnis, Bilder und Tests](../qa/AP1_RESULT.md).
69 Kerntests und fünf Browserfälle bestanden; persönliches Gestaltungsurteil und
echter Handytest bleiben offen. AP2 wurde danach separat beauftragt; weitere Bulks bleiben offen.

- [x] **H2:** Obsidian-Garden-Gestaltung in einer tatsächlichen Spielkamera festlegen:
  Graphit/Stein, neutrales Metall, Grün und sparsame Team-/Energiefarben.
- [x] **H4:** Ein flaches 3D-Spawnpad mit Teamemblem und kurzem Respawn-Licht bauen;
  denselben Typ an den bestehenden blauen/roten Startplätzen verwenden.
- [x] **H5:** Einen gemeinsamen Pickup-Sockel mit Zuständen bereit/leer/nachladend,
  Wiederkehranzeige und kurzer Rückmeldung bei vollem Inventar ausarbeiten.
- [x] **H8:** Einen wiederverwendbaren Deckungstyp mit Kanten, Sockel und abgestimmten
  Materialien aufwerten; anschließend an passenden bestehenden Deckungen einsetzen.
- [x] Technische Abnahme: Desktop und kleines Touch-Querformat; Spawn, Aufnahme/Nachladen,
  voller Vorrat und Deckung verständlich, Wege und Kollision unverändert.

Basis: vorhandene Spawn-/Pickupdaten, Modelle und Map-Paket. Grenze: erster
repräsentativer Bauteilsatz, keine komplette Helix-Rekonstruktion, neue Räume
oder Kampfregeln. Das Helix-Gesamtbild ist eine 2D-Referenz, kein fertiges 3D-Level.

### AP2 — Arena-HUD und Matchfluss (H3, H12, H16)

Spielergebnis: Match starten, Zustand lesen und erneut spielen gelingt ohne Sucharbeit.

**Am 1. November umgesetzt und technisch geprüft.** [Ergebnis und Spielaufnahmen](../qa/AP2_RESULT.md).
Vollständige Desktop-/Touch-2v2-Runden mit Ergebnis/Revanche, Startauswahl, Pause,
kleines Querformat und Rotation geprüft. Kameraabstand nach Sichtprüfung beibehalten.
Persönliches Spiel-/Gestaltungsurteil und echter Handytest bleiben offen.

- [x] **H3:** Bestehende Anzeigen mit einheitlicher Typografie, Icons und ruhigen
  Panels gestalten; Spielstand/Ziel, Vitalwerte und Waffen klar priorisieren.
- [x] **H12:** Kleines Querformat mit lesbaren Anzeigen, freien Daumenbereichen und
  passendem Kameraabstand abstimmen; nur begründete Kameraänderungen übernehmen.
- [x] **H16:** Arena-Einstieg mit Schnellstart, kompakter Matchwahl/Kartenbild sowie
  verständlichem Ergebnis/Revanche gestalten; Adventure als separaten Einstieg führen.
- [x] Technische Abnahme: Start → vollständiger TDM → Ergebnis → Revanche auf Desktop/Touch;
  Waffenwechsel, Pause und Rotation ohne verdeckte Bedienelemente.

Abhängigkeit: AP1-Gestaltung. Vorhandene HUD-/Menü- und Eingabesysteme nutzen.
Grenze: bestehende Modi/Teamgrößen; noch keine Ligaoberfläche oder allgemeines UI-Framework.
CTF-Zustände werden erst mit M3 ergänzt. Echter Handy-Nachweis bleibt separat offen.

### AP3 — Figuren und Waffenpräsentation (H6, H7)

Spielergebnis: Eigene Figur, Wingman und aktive Waffe sind sofort erkennbar.

**Am 1. November umgesetzt und technisch geprüft.** [Ergebnis und Spielaufnahmen](../qa/AP3_RESULT.md).
Desktop und Touch: drei Waffen, Handkontakt/Zielrichtung, Bewegung/Sprung/Feuer,
Teams, Tod/Respawn und Pause geprüft. Zusätzlicher Nutzerwunsch: kleinere
Mobile-Tasten, 88-px-Joystick und kompakte Vitalanzeige. Persönliche Gestaltung-/
Geräteabnahme bleibt offen; keine Freigabe weiterer Bulks.

- [x] **H6:** Arc/Pulse/Rail durch Silhouette und passende HUD-Icons unterscheiden;
  Waffen an Händen befestigen und passende Ziel-/Schusshaltungen auch bei Bots nutzen.
- [x] **H7:** Vorhandene KayKit-Figuren mit wenigen Arena-spezifischen Helm-/Rüstungsteilen
  individualisieren; Teamfarbe und Spieler-/Wingman-Unterscheidung erhalten.
- [x] Abnahme: Alle drei Waffen bei Bewegung, Sprung, Feuer und Respawn auf Desktop/Touch;
  erkennbare Teams und saubere Haltung ohne geänderte Trefferkörper.

Abhängigkeit: AP1/AP2-Gestaltung; vorhandene Rigs/Animationen und Waffenmodelle nutzen.
Grenze: kosmetische Varianten, keine neuen Waffen, Charakterwerte oder Adventure-Kostüme.

### M3.1 — Classic CTF (H1, Grundlage für H11)

- [ ] **H1:** Flaggen aufnehmen, tragen, fallen lassen, zurückbringen und erobern;
  eigene Flagge muss für Capture zu Hause sein, Rückkehr nach Zeitablauf unterstützen.
- [ ] Träger-/Verteidigungsrollen als spielbare Bot-Grundlage und klare Flaggen-/Carrier-Anzeige ergänzen.
- [ ] Abnahme: reguläres Desktop-/Touch-CTF mit Capture über Höhenroute, Tod/Drop,
  Return, Matchende und Neustart; keine Capture-Auslösung auf der falschen Ebene.

Abhängigkeit: geprüfter M2-Kern, Kartenabnahme und Freigabe. Vorhandene Teams,
Physik, Navigation und Matchregeln erweitern; keine neue Karte oder Liga.

### M3.2 — One Flag (H17)

- [ ] **H17:** Neutrale Flagge, gültigen Zielpunkt und Runner-/Escort-/Interception-Rollen
  auf der geprüften CTF-Grundlage ergänzen.
- [ ] Abnahme: echter Transport, Abfangen, Drop und Capture bis Matchende auf Desktop/Touch.

Abhängigkeit: M3.1. Grenze: zweite Objective-Variante auf derselben Arena.

### M3.3 — Teamspiel, Ressourcenkontrolle und Objective-Abnahme (H11, H14)

- [ ] **H11:** Rollenwechsel zwischen Träger, Begleiter und Verteidiger abstimmen;
  einfache Kommandos Folgen/Angreifen/Verteidigen mit sichtbarer Rückmeldung ergänzen.
- [ ] **H14:** Risiko/Nutzen von Rail, Höhenrüstung und Heilung im Objective-Spiel prüfen;
  bestehende Versorgung, sichere Spawn-Ausgänge und faire Gegenwege gezielt abstimmen.
- [ ] Abnahme: beide Objective-Modi mit echten Spieler-/Bot-Captures, Rollenwechseln,
  Seitenwechselvergleich und Desktop-/Touch-Kommandos; TDM bleibt spielbar.

Abhängigkeit: M3.1/M3.2. Grenze: keine zusätzlichen Pads ohne Spieltestbefund.
Kurzlebige Waffenreste nach Kills sind ein **optionaler Folgeversuch** zu H14,
kein Pflichtumfang dieser Abnahme und keine Wiederholung der fertigen Konfetti-Arbeit.

### AP4 — Licht und Umgebung (H9, H10)

- [ ] **H9:** Boden/Figuren/Pickups durch Material- und Lichtkontrast trennen;
  Höhenkanten, Bodenkontakt und sparsame lokale Leuchtflächen ausarbeiten.
- [ ] **H10:** Randarchitektur und wenige unterschiedliche Pflanzengruppen komponieren;
  ein charakteristisches Motiv ergänzen, freie Laufwege und ruhige Böden bewahren.
- [ ] Abnahme: beide Kameras und kleines Touch-Querformat; Gegner/Höhen/Deckung lesbar,
  keine verdeckten Wege oder neuen unsichtbaren Hindernisse; Renderkosten vergleichen.

Abhängigkeit: AP1, vorzugsweise nach M3.3. Bestehende Geometrie und wiederverwendbare
Assets nutzen; keine Rundumerneuerung des Grundrisses oder flächige Bodenleitsysteme.

### AP5 — Kampfereignisse und Klang (H13)

- [ ] **H13:** Kurzen Killfeed, unterscheidbare Rüstungstreffer und charakteristischere
  Waffengeräusche auf dem vorhandenen Treffer-/Tonfeedback aufbauen.
- [ ] Abnahme: Kampf mit mehreren Beteiligten auf Desktop/Touch verständlich;
  keine Meldungsflut, Tonübersteuerung oder Vermischung von Team-/Waffenfarben.

Abhängigkeit: AP2/AP3. Konfetti, Respawn und vorhandenes Feedback erhalten;
eigene Synthese oder nachweisbar freie Sounds verwenden, Original-WAVs nicht ungeprüft kopieren.

### M4.1 — Einstieg und Qualifier (H15)

- [ ] **H15:** Kurzen Ein-Klick-Qualifier mit tatsächlich bestätigter Bewegung,
  Sprung, Waffenaufnahme, Kampf und Objective-Aktion auf bestehender Karte anbieten.
- [ ] Abnahme: frischer Desktop-/Touch-Einstieg bis Qualifier-Ende; keine automatisch
  abgehakten Lernaktionen. Verständlichkeit anschließend persönlich prüfen.

Abhängigkeit: M3 und AP2. Vorhandenes Training nutzen; kein separater Tutorial-Level.

### M4.2 — Team und kleine Saison (H18, erster Teil)

- [ ] **H18:** Teamidentität, benannte Rivalen, drei Matches, Tabelle und Saisonabschluss verbinden.
- [ ] Abnahme: drei tatsächlich gespielte Matches zählen jeweils genau einmal;
  Sieg und Niederlage erlauben einen nachvollziehbaren nächsten Schritt.

Abhängigkeit: M4.1. Grenze: eine Proving-Saison, keine große Karriere oder Online-Liga.

### M4.3 — Rekrutierung und lokale Saves (H19; H18, Fortsetzung)

- [ ] **H19:** Einen Rekrutierungsmoment und unterscheidbare Wingman-Rollenpräferenzen
  anbieten; Verhalten statt HP, Schaden oder Geschwindigkeit verändern.
- [ ] **H18:** Team, Saison und Rekrutierung versioniert lokal speichern und nach Reload fortsetzen.
- [ ] Abnahme: neuer Begleiter verhält sich erkennbar anders; Reload erhält Fortschritt,
  doppelte Ergebniswertung ausgeschlossen; Adventure-/CTF-3.0-Spielstände bleiben getrennt.

Abhängigkeit: M4.2 und M3-Teamrollen. Bestehende Figurenvarianten verwenden;
keine Accounts, Cloud-Saves oder Stat-Grind-Systeme.

### M4.4 — Gesamtabnahme der kleinen Arena-Liga

- [ ] Qualifier → Teamgründung → drei Matches → Abschluss → Rekrutierung → Reload
  als zusammenhängenden Desktop-/Touch-Ablauf prüfen und gefundene Fehler beheben.
- [ ] Persönliche First-Run-Rückmeldung und echte Handy-Prüfung getrennt dokumentieren;
  Lesbarkeit, Bedienung und Leistung als bestanden/offen mit Gerät und Messumgebung ausweisen.

Abhängigkeit: M4.1–M4.3. Kein automatischer Beginn von M5.

### M5.W1 — Optional: eine weitere taktische Waffenrolle (H20)

- [ ] **H20:** Nach Kernspielabnahme genau eine Rakete **oder** Lobgranate auswählen;
  Flächenkontrolle, Warn-/Projektilbild und Gegenmöglichkeiten begrenzen.
- [ ] Abnahme: 3D-Deckung/Höhen, Eigen-/Teamschadensregel, Bot-Bedienung und
  Desktop-/Touch-Spielgefühl im Vergleich zu Arc/Pulse/Rail prüfen.

Abhängigkeit: M3.3, vorzugsweise nach M4.4 und eigener Freigabe. Kein Auftrag für
das komplette Originalarsenal. Weitere Premium-Karten, größere Teams und Ligen
bleiben M5-Optionen; keine zusätzlichen Maps allein für optische Abwechslung vorziehen.

### Gemeinsame Fertig-Kriterien und Referenzen

Für jeden freigegebenen Bulk: passender echter Browser-Spielablauf auf Desktop
und Touch-Emulation, gezielte Kernprüfungen bei Regeländerungen sowie Build/Typecheck
bei Codeänderungen. Reine Dokumentationspflege benötigt keinen neuen Spieltest.
Bei Grafikänderungen Sichtvergleich und Renderkosten protokollieren; Emulator-FPS
auf der PC-GPU sind kein Handy-Nachweis. Keine vollständige neue QA-Matrix ohne Anlass.

Grundlage: unsere Arena `7be95a3` mit [Live-Nachweis](../qa/ARENA_DEATH_RESULT.md),
[CTF-3.0-Vision/Umfang](https://github.com/emfau88/CTF-3.0/blob/9794575fa6241f47845fb85352316564789e8d1c/README.md),
[Helix-Aufbau](https://github.com/emfau88/CTF-3.0/blob/9794575fa6241f47845fb85352316564789e8d1c/docs/qa/phase-1-helix-v2-1/README.md)
und [Original-Pickupdarstellung](https://github.com/emfau88/CTF-3.0/blob/9794575fa6241f47845fb85352316564789e8d1c/src/adapters/phaser/PhaserArenaPickupRenderer.ts).
Die Hebel sind Designempfehlungen; der Originalcode und dessen historischer
Freigabestatus erteilen keinen Umsetzungsauftrag für dieses Repository.

## Historische Mobile-/PvE-Notizen

Die folgenden datierten Mobile-/PvE-Notizen dokumentieren frühere Zusatzaufträge.
Sie sind historische Nachweise und keine zweite aktuelle Adventure-Roadmap.
Ihre Aussagen über damalige „aktuelle Levelpläne“, Freigaben und Prioritäten gelten
für den genannten Zeitpunkt. Heute bestimmt ausschließlich
[ADVENTURE_ROADMAP.md](ADVENTURE_ROADMAP.md) neue Adventure-Arbeit.

## Freigegebener kleiner Mobile-Zusatz

**29. Oktober, L1.5a:** Schnellere Boss-Faustschläge und KayKit-Wächterpuppen gelten
auch auf Touch. Ein zusätzliches Nahkampf-GLB (0,95 MiB) nur beim Adventure-Einstieg.
[Abstimmung, Browserprüfung und Grenzen](../qa/BOSS_AND_GUARDS_RESULT.md).

**29. Oktober, KayKit-/Pickup-Präsentation ✅:** Geriggtes Mannequin mit vorhandener
Touch-Steuerung, fertigen Animationen und kleinen Partikeleffekten. Vier lokale GLBs
fügen rund 2,82 MiB Download hinzu; zwölf instanzierte Funken je Pickup, keine neuen
Licht-/Schattenquellen. Vollständiger Touch-Abschluss und Joystick-/Sprint-/Menüablauf
im Browser geprüft. [Aufnahmen und Grenzen](../qa/KAYKIT_PRESENTATION_RESULT.md).

**28. Oktober, L1.3 ✅:** Einstieg aus dem Spielmenü, Sitzungs-Checkpoint, Boss-Retry,
physisch geöffnetes Nordtor und tatsächlicher Levelabschluss mit Desktop und Touch
geprüft. Die zwei kleinen Gegner bleiben die einzigen Anreisegegner. 48 Kerntests,
fünf Browserfälle bestanden. [Nachweise](../qa/L1_3_RESULT.md).

**L1.4a ✅:** Erster Hof mit Steinmaterialien, Farnen, Felsen und Fackel gestaltet.
Vier Browserfälle einschließlich Touch-Weg, Waffenfund, Sprung, Sprint-Umschaltung
und Menü bestanden. 1K-Assets werden lokal nur beim Adventure-Einstieg geladen;
rund 7,5 MiB zusätzlicher Download. [Vergleich und Prüfung](../qa/L1_4A_RESULT.md).
Persönlicher Handy-Leistungstest bleibt offen.

**L1.4b-Materialschritt ✅:** Steinboden, Wände, Terrassen und Treppen auf der ganzen
Map; geschlossene Mauerecken und Pflanzen auch innen. Farninstanzen verwenden vier
gemeinsame Modelldurchläufe statt eines pro Pflanze. Kein zusätzlicher Assetdownload.
Sieben gezielte Kerntests und fünf Browserfälle einschließlich Touch bestanden.
[Aktuelle Prüfung](../qa/L1_4B_MATERIALS_RESULT.md). Weitere Blickfänge/Licht offen.

Auf ausdrücklichen Wunsch „so simpel wie möglich“: linker analoger Joystick, direkter Touch-Zielpunkt auf der Arena mit Halten/Tippen zum Feuern, Sprungtaste, Sprint-Umschalter, Kamera und bestehende Waffenbuttons. Getrennte Finger-IDs für Bewegung und Aim, Aufräumen bei Abbruch/Fokus/Drehung/Respawn/Restart. Kompaktes Querformat-HUD und Hinweis/Pause im Hochformat. Gemeinsamer Spielkern; mobile Render-DPR auf 1, Schattenmap auf 1024 begrenzt.

Das ist ein enger spielbarer Zusatz, keine vollständige Umsetzung des unten beschriebenen größeren T0-Gerätevergleichs. Echte Android-/iPhone-Tests, alternatives Touch-Aim und Langzeit-/Wärmemessungen bleiben offen. [Basisnachweis](../qa/MOBILE_BASIC_RESULT.md). Die folgenden Vorschläge bleiben historische Planung für einen späteren Ausbau.

**29. Oktober: weitere Abstimmung ✅ technisch erledigt.** Zoomfaktor von 1,15 auf
1,45 erhöht (rund 26 % größere Darstellung gegenüber dem vorherigen Stand), Sprint
auf 9,18 m/s reduziert. Arc Lash erfasst beim Tippen automatisch ein freies Ziel
innerhalb von 5 m und führt die volle 0,6-s-Salve aus; Halten wiederholt sie.
[Prüfung und aktuelle Bilder](../qa/SPRINT_ARC_MOBILE_RESULT.md). Echter Handytest offen.

**27. Oktober: vorheriger Feinschliff ✅ technisch erledigt.** Mobile-Darstellung
15 % größer, Sprint direkt beim Fingerdruck auch mit gehaltenem Joystick. Adventure:
kleiner Kameravorlauf, aufgeräumtes HUD mit Kamera/Ton/Vollbild/Neustart im Pausenmenü.
Gemeinsame Adventure-Sprungkurve für Desktop/Touch: gemessen 0,72 s und 2,15 m statt
0,98 s und 2,67 m. Alte Arena-/Bosskarten behalten ihre bisherigen Höhenrouten.
45 Kernprüfungen und drei Browserabläufe bestanden. [Aktueller Nachweis](../qa/MOBILE_POLISH_RESULT.md).
Persönlicher Handytest steht aus. Beweglicher Joystick, zusätzlicher Zielring und
Sprungpuffer bleiben spätere Optionen nach diesem Spieltest.

**27. Oktober, reduziertes L1.2 ✅ umgesetzt und technisch geprüft:** Auf direkten
Nutzerwunsch nur zwei Steinläufer mit normalen Nahkampfschlägen (je einer im ersten
und zweiten Hof) und der vorhandene Steinwächter im dritten. Gemeinsame HP/Rüstung,
Bossauftauchen, Sieg/Tod/Neustart und Weiter-Button zur Kristallkluft. 47 Kerntests,
vier Browserfälle einschließlich Touch bestanden. [Nachweis](../qa/L1_2_RESULT.md).
Der Sieben-Gegner-/Werferplan ist überholt. Die anschließende Zielklärung vom
28. Oktober plant L1.3–L1.5 einschließlich eigener Gestaltungspakete; maßgeblich sind
deren aktuelle Umfangs-/Zeitschätzungen im Levelplan. L1.3 wurde anschließend freigegeben
und abgeschlossen; anschließend auch L1.4a und der Material-/Ecken-/Pflanzenschritt
von L1.4b. Weitere Blickfänge/Lichtgestaltung bleiben offen.

Nachweise: [M0_RESULT.md](../qa/M0_RESULT.md). Nach aktuellem Nutzerfeedback haben schnelle spielbare Zwischenstände Vorrang; zusätzliche Randfallmatrizen folgen erst nach Bewährung des Spielgefühls.

## Entscheidungsvorschlag zu Mobile

CORE ARENA kann mit derselben Spielbasis zusätzlich im mobilen Browser spielbar werden. Die geplante Trennung von Eingabe, Simulation und Darstellung unterstützt das. Ob die gewünschte Qualität auf bestimmten Smartphones erreichbar ist, muss ein Geräteversuch zeigen. Eine native App oder Veröffentlichung in App-Stores ist eine spätere, eigenständige Entscheidung.

Empfehlung: Geräteunabhängige Spielbefehle beibehalten, Desktop-Movement und Höhen-Aim zuerst prüfen und nach M1 einen optionalen, begrenzten Touch-Versuch durchführen. Einen vollständigen Mobile-Auftrag erst anhand dieses Versuchs und des spielbaren M2-Kerns schätzen. Mobile ist damit eine offene Erweiterungsmöglichkeit, keine zusätzliche Lieferpflicht für M0–M4.

### Vorgeschlagene Bedienung

- Querformat, linker Daumen auf einem analogen Bewegungsstick.
- Rechter Daumen wählt durch Berührung einen Bildschirmpunkt; Halten feuert entsprechend der Waffenregeln, Ziehen führt das Ziel nach, Loslassen beendet das Feuer. Ein kurzes Tippen löst bei schussbereiter Waffe einen Schuss aus. Cooldown und Munition bleiben unverändert.
- Die Auswahl des 3D-Ziels nutzt dieselbe Höhen- und Deckungslogik wie die Maus. Berührung darf keine Wand oder Plattform umgehen.
- Sprung, Sprint und Waffenwechsel brauchen eine eigens geprüfte Belegung. Gerade der Sprung ist ein Kernbestandteil des Spiels und darf nicht nur deshalb automatisch werden, weil die erste Touch-Belegung unpraktisch ist.

Diese Bedienung ist ein sinnvoller Kandidat, aber noch keine abgenommene Lösung:

1. Der Finger verdeckt kleine Gegner und Plattformkanten.
2. Gegner links im Bild sind mit dem rechten Daumen schwer erreichbar. Eine strikt auf die rechte Bildschirmhälfte beschränkte direkte Zielwahl würde diese Ziele ausschließen.
3. Bewegen, Zielen/Feuern und Springen konkurrieren um zwei Daumen. Das muss im tatsächlichen Gefecht getestet werden.
4. Eine mitlaufende Kamera verschiebt das Ziel unter einem ruhenden Finger. Es muss klar bleiben, ob auf den aktuellen Bildschirmpunkt oder einen gehaltenen Weltpunkt gezielt wird.
5. Überlappende Ebenen sind auch auf Touch eindeutig aufzulösen; kleinere Bildschirme verschärfen die Lesbarkeitsfrage.

Als Vergleich empfiehlt sich eine relative Zielsteuerung: Der rechte Daumen bewegt einen sichtbaren Zielcursor aus einer bequemen Zone heraus. Ein zweiter Stick nur für die Schussrichtung erreicht zwar alle Richtungen, entscheidet aber allein noch nicht über die Zielhöhe. Auch diese Alternative benötigt deshalb eine explizite Höhenregel. Keine automatische Zielhilfe oder veränderte Waffenwirkung ohne gesonderten Spieltest.

### Vorhandene Evidenz

Die unveränderte [V5-Referenz](../../references/Core_Arena_3D_Obsidian_Garden_V5.html) enthält bereits Touch-CSS, einen linken Joystick sowie Sprung-/Feuertasten und Zeigeeingaben auf dem Canvas (insbesondere Zeilen 65–83, 101 und 803–827). Das belegt vorhandene Ansätze, keine geprüfte mobile Qualität. Beispielsweise beendet der globale `pointerup`-Handler das Feuer unabhängig davon, welcher Finger losgelassen wurde. Die Eingaben müssen künftig pro Finger unabhängig verfolgt werden.

Browser-Pointer-Events unterstützen mehrere gleichzeitige Berührungen; Ereigniszuordnung und Abbruchbehandlung gehören trotzdem zur Anwendung. Siehe [MDN: Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction).

### Aufwand: gemeinsame Basis, zusätzliche Oberflächen und Tests

| Bereich | Wiederverwendung beziehungsweise Mehrarbeit |
| --- | --- |
| Physik, Höhen, Treffer, Waffenregeln, Matchregeln | Dieselbe Simulation und dieselben fachlichen Tests |
| Bots, Teamrollen, Liga, Rekrutierung | Dieselben Systeme; mobile Menüs benötigen eine passende Darstellung |
| Arena und Assets | Gemeinsame Inhalte; Details, Schatten und Effekte gegebenenfalls je Qualitätsstufe reduzieren |
| Eingabe | Eigener Touch-Adapter, analoge Stärke, unabhängige Fingerzustände, Abbruch/Fokusverlust |
| HUD und Kamera | Erreichbare Bedienelemente, größere Ziele, Safe Areas und sinnvolle Sicht auf kleinen Querformaten |
| Laufzeit und Grafik | Geräteprofile für Auflösung, Schatten und Effekte; reale Speicher-, Wärme- und Laufzeitmessungen |
| Qualitätssicherung | Zusätzliche echte Geräte- und Browserläufe bei späteren relevanten Änderungen |

Das ist grundsätzlich keine zweite Entwicklung des gesamten Spiels. Es ist jedoch mehr als das Einblenden eines Joysticks. Eine belastbare prozentuale Aufwandsschätzung ist ohne Zielgeräte und Steuerungsversuch nicht möglich. Reduzierte Renderauflösung und gebündelte Zeichenaufrufe sind mögliche Maßnahmen, keine bereits nachgewiesene Lösung für dieses Spiel; technische Grundlage: [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

Schon die Desktop-Architektur sollte Bewegungsrichtung samt Stärke und getrennte Befehle für Zielen, Feuer, Sprung und Sprint verarbeiten können. Dafür braucht M0 weder Touch-UI noch ein allgemeines Eingabeframework. Entscheidend ist, dass der Spielkern keine DOM-, Maus- oder Tastaturereignisse direkt auswertet.

### Optionaler Versuch T0 nach M1

**Separat freizugeben, nicht Teil der Desktop-Aufwandssummen.** Zeitbox: **30–60 Minuten Agent-Arbeitszeit** für den ersten Touch-Versuch und technische Korrekturen. Dazu **je 15–30 Minuten tatsächliche Bedienung auf Android und iPhone** durch eine Person mit Gerätezugriff; Bereitstellung und Wartezeit separat. Das Zeitlimit verspricht Erkenntnisse, keine fertige Mobile-Version. Wenn die grundlegende Bedienung innerhalb der Zeitbox nicht funktioniert, den Befund dokumentieren und Desktop fortsetzen.

Liefergegenstand: M1-Testarena auf einem realen Android-Gerät mit Chrome und einem realen iPhone mit Safari; je ein kurzer Versuch mit direkter Zielwahl und relativer Cursorsteuerung. Falls ein Gerät fehlt, den fehlenden Plattformnachweis offen ausweisen.

Prüffälle:

- Gleichzeitig bewegen und feuern; jeden Finger einzeln lösen und erneut aufsetzen, ohne den anderen Befehl zu verlieren.
- E0/E1/E2 erreichen und auf Ziele aller drei Höhen schießen, einschließlich blockierter Schusslinien.
- Ziele links, rechts und am oberen Bildrand erreichen; Fingerverdeckung und Fehlziele protokollieren.
- Springen während einer Verfolgung, Sprint und Waffenwechsel auf praktische Erreichbarkeit prüfen.
- App-Wechsel, unterbrochene Berührung und Orientierung ändern; keine hängenbleibende Bewegung und kein Dauerfeuer.
- Mindestens zehn Minuten am Stück auf beiden Geräten spielen; Browser, Gerät, Auflösung, Bildzeiten und sichtbare Erwärmung beziehungsweise Leistungsabfall dokumentieren. Ein Emulator ersetzt diese Prüfung nicht.

Ergebnis: bevorzugte Steuerung, verbleibende Probleme, vorläufige Zielgeräteklasse, messbare Grafikgrenzen und ein Go/No-Go für weitere mobile Arbeit. Die Leistung des späteren M2-Matches mit Bots und Effekten ist anschließend erneut zu prüfen.

## Arbeitspakete der Desktop-Roadmap

Die [Meilenstein-Roadmap](MILESTONES_AND_QA.md) definiert Umfang und Abnahme. Die folgenden Pakete verteilen dieselben Aufwandsspannen; sie kommen nicht zusätzlich dazu. **Minuten/Stunden bezeichnen aktive Agent-Arbeitszeit einschließlich gezielter Prüfungen und Korrekturpuffer.** Nutzer-Spieltests und Freigabewartezeit sind separat. M0 und M1 dauerten laut Nutzer jeweils ca. 30 Minuten bis zur ersten technischen Übergabe. Paketzeiten wurden nicht einzeln gemessen; spätere M1-Nacharbeit ist separat dokumentiert.

M0 und M1 sind umgesetzt; die erste Spielrückmeldung zu M1 wurde nachgearbeitet. M2–M4 sind anhand beider Erststände neu geschätzte Planungsannahmen. Ein im Voraus endgültig „optimaler“ Zuschnitt wäre angesichts ungeprüfter 3D-Steuerung und Navigation nicht seriös.

| Paket | Ergebnis und Abgrenzung | Voraussetzung | Agent-Zeit | Konkreter Nachweis |
| --- | --- | --- | --- | --- |
| **M0.1 ✅ technisch geprüft** | Toolchain, lokale Abhängigkeiten und sichtbare Szene | Erledigt | Anteil an ca. 30 Min. M0 gesamt | Installation, Typecheck, Build und Browserstart bestanden |
| **M0.2 ✅ technisch geprüft** | Kapsel auf E0, Wandkontakt, WASD/Shift, fester Takt, Kameras und Fokus | Erledigt | Anteil an ca. 30 Min. M0 gesamt | Kern-/Physiktests und echte Browser-Eingaben bestanden |
| **M0.3 ✅ technisch geprüft** | V5-Materialprobe, Diagnose, Aufnahmen und Übergabe | Erledigt; Nutzerurteil offen | Anteil an ca. 30 Min. M0 gesamt | 24 Browserfälle bestanden; Bilder und Startanleitung vorhanden |
| **M1.1 ✅ Höhenmotor** | Sprung/Fall, Standflächen, E0/E1/E2, Unterseiten und Kopfkontakt | M1 freigegeben | Anteil an ca. 30 Min. M1-Erststand | Auf-/Abstieg und Kopfkontakt mit echter Physik |
| **M1.2 ✅ Zielwahl und Diagnosefeuer** | 3D-Zielpunkt, Mündungsprüfung, Diagnosewaffe und drei Dummies; kein Waffeninventar | M1.1 | Anteil an ca. 30 Min. M1-Erststand | Treffer auf drei Höhen; Wand blockiert den Schuss |
| **M1.3 ✅ Navigationsprobe** | Flächenverbindungen und einfacher Bot mit demselben Motor | M1.1; M1.2 für gemeinsame Diagnose | Anteil an ca. 30 Min. M1-Erststand | E0→E1→E2→E0 durch normale Bewegungsbefehle |
| **M1.4 ✅ Technische Übergabe** | Kamera, Motor, Aim und Navigation zusammen prüfen und gezielt nacharbeiten | M1.1–M1.3 | Anteil an ca. 30 Min. M1-Erststand | Browser-Spielablauf, Aufnahmen; Nutzer-Test separat |
| **M2.1 ✅ Lebenszyklus und Match** | HP/Armor, Schaden, Tod/Respawn, Spawn-Schutz, TDM-Score, Timer und Restart; Trainingsmatch mit vorhandenen Zielen | Erledigt; Nutzer-Spielurteil offen | 10–20 Min. ursprünglicher Planwert; keine separat gemessene Ist-Zeit | 16 Kern-/Physiktests, vollständiger Browsermatch mit 10 Abschüssen, Respawn und Restart; [Nachweis](../qa/M2_1_RESULT.md) |
| **M2.2 ✅ Waffen und Ressourcen** | Arc Lash/Pulse, Auswahl, Munition und Pickups; Zielregel dokumentiert | Erledigt; Nutzer-Spielurteil offen | 15–30 Min. ursprünglicher Planwert | 21 Kern-/Physiktests und acht Browserfälle einschließlich Waffenwahl, Pulse-Treffern, Fallback und Armor auf E2; [Nachweis](../qa/M2_2_RESULT.md) |
| **M2.3 ✅ Botwahrnehmung und Kampf** | Spielbares 1v1, begrenzte 3D-Sicht, kopierte Erinnerung, Reaktion und gemeinsame Waffenbedienung | Erledigt; Nutzer-Spielurteil offen | 25–50 Min. ursprünglicher Planwert | Verdeckte Gegner verborgen; keine vorzeitige Reaktion; echtes Duell mit Schaden/Kills/Respawns; [Nachweis](../qa/M2_3_RESULT.md) |
| **M2.4a ✅ Begrenztes Teamspiel** | 2v2, sichtbare Gegnerwahl, Teamkennzeichnung, unabhängige Leben/Waffen/Respawns und Teamwertung | M2.3; separat von Adventure umgesetzt | Keine separat gemessene Istzeit | Vollständiger Desktop-/Touch-Match, Neustart, 1v1-Regression; [Nachweis](../qa/M2_4_RESULT.md) |
| **Arena-Zusatz ✅ Map und Railgun** | Größere Spielfläche, zwei Railgun-Felder, dritte Arena-Waffe, E0-Umgehungen und Außenpatrouillen | Separater Nutzerauftrag nach M2.4a | Keine separat gemessene Istzeit | Beide Felder, räumliche Treffer und Desktop-/Touch-Spiel; [Nachweis](../qa/ARENA_EXPANSION_RESULT.md) |
| **M2.4b Bot-Wege, Ressourcen und Schwierigkeit — umgesetzt und technisch geprüft** | Höhenrouten, bedarfsgerechte Ressourcenwahl, Easy/Normal/Hard ohne Stat-Vorteile; gemeinsame Adventure-Bewegung | M2.4a und Arena-Zusatz; ausdrücklich freigegeben | Keine getrennt gemessene Istzeit | Pflichtwege und bedarfsgerechte Pickup-Anreise durch echte Bewegungsbefehle; faire Stufen |
| **M2.5 Arena und Feedback — umgesetzt und technisch geprüft** | Klare Teams/Höhen, kleines HUD, Pausenmenü und Feedbacksounds | M2.2–M2.4 | Keine getrennt gemessene Istzeit | [Prüfstand und Bilder](../qa/M2_5_RESULT.md); persönliche Abnahme separat |
| **M2.6 Matchprüfung und Übergabe — technisch abgeschlossen** | 30 Botmatches, vollständige Desktop-/Touch-Matches, Zeitlimit, Performance; Deckungs-Stillstand behoben | M2.1–M2.5; ausdrücklich freigegeben | Historischer Plan: 15–30 Min.; keine getrennt gemessene Istzeit | [Prüfstand](../qa/M2_6_RESULT.md); persönliche Spiel-/Geräteabnahme und Bewertung der Seitenbalance offen |
| **Arena-Map-Paket — umgesetzt und technisch geprüft** | Gleiche Versorgung und Höhenzugänge auf beiden Seiten; ruhigere Materialien, Kanten, Teamdepots und Rail-Energiekästen; 56 × 36 m beibehalten | Nach M2.6 separat freigegeben | Keine getrennt gemessene reine Coding-Zeit | [Vergleich und Browserprüfung](../qa/ARENA_MAP_RESULT.md); menschliches Spielurteil und echtes Handy separat |
| **M3.1 Classic CTF** | Flaggenzustände und Carrier-/Verteidigungsrollen als spielbarer Modus | M2 abgenommen, M3 freigegeben | 25–50 Min. | Capture über Höhenroute; Drop/Return korrekt |
| **M3.2 One Flag** | Neutrale Flagge, Runner/Escort/Interception auf vorhandener Basis | M3.1 geprüft | 15–30 Min. | Regulärer Transport und Capture |
| **M3.3 Objective-Übergabe** | Wege, Rollen und beide Modi unter Konkurrenz prüfen und abstimmen | M3.1–M3.2 | 20–40 Min. | Routentests und echte Spiele beider Modi; breitere Matrix später |
| **M4.1 Einstieg und Qualifier** | Ein-Klick-Start und Hinweise auf echte Aktionen | M3 abgenommen, M4 freigegeben | 10–20 Min. | Keine künstlich abgeschlossenen Lernschritte |
| **M4.2 Team und Saison** | Teamgründung, drei Matches, Tabelle und Abschluss | M4.1 | 20–40 Min. | Jedes erspielte Ergebnis zählt genau einmal |
| **M4.3 Rekrutierung und Saves** | Rekrutierung, versionierte Saves und Reload | M4.2 | 20–40 Min. | Rekrutierung erhalten, CTF-Saves unverändert |
| **M4.4 Liga-Übergabe** | Einstieg bis Saisonende, Verständlichkeit und Regression | M4.1–M4.3 | 10–20 Min. | Reale Drei-Match-Saison, Reload, Rekrutierung |

Historische Summen des ursprünglichen Zuschnitts: M0 und M1 **Ist jeweils ca. 30 Min. bis Erstübergabe** (Nutzerangaben); M2 **90–180 Min. (1,5–3 h)**; M3 und M4 jeweils **60–120 Min. (1–2 h)**. AP1–AP5 und die Konkretisierungen der To-do-Liste sind darin nicht neu geschätzt; keine aktuelle Restaufwandssumme daraus ableiten. M1-Nacharbeit an Kantensprung und Plateau-Lesbarkeit nach der ersten Nutzerprobe ist kein Bestandteil dieser gemeldeten Erstzeiten. Persönliche Spieltests und Freigabewartezeit sind separat. Nach jedem Meilenstein Schätzung und beobachtete Dauer vergleichen, keine erfundenen Paket-Istzeiten eintragen.

## Wie die Pakete bearbeitet werden

**27. Oktober, L1.1-Kamera nach Nutzerwunsch:** Standardblick seitlich, sodass die
drei Höfe von links nach rechts durchlaufen werden. V/Touch-Ansicht behält die beiden
anderen Perspektiven als Wahlmöglichkeiten. Richtungsbezogene Bewegung und Aim geprüft;
keine Erweiterung des L1.1-Umfangs und keine Freigabe für L1.2.

**27. Oktober, L1.1 ✅ umgesetzt und technisch geprüft:** Nach Freigabe begehbares
Adventure-Level gebaut. Direkte Rückmeldung „zu eng/verwinkelt“ während der Arbeit
eingearbeitet: drei große Höfe, kurze 10-m-Verbindungen und weniger verdeckende Wände.
Kamera, drei erreichbare erhöhte Flächen, alle Vorratsorte und Einmal-Pickups stehen.
44 Kerntests und drei Browserfälle bestanden, einschließlich echtem Desktop-Durchlauf
und Touch-Eingaben. [Ergebnis und aktuelle Map](../qa/L1_1_RESULT.md).
Beobachtete Bearbeitungszeit bis zur technischen Prüfung etwa 35 Minuten inklusive
Grundrisswechsel; Dokumentation/Commit/Veröffentlichung anschließend. Keine getrennt
gemessene reine Coding-Zeit. Die damalige Restschätzung von 2,5–5 Stunden für
L1.2–L1.4 wurde durch die anschließende ausdrückliche Umfangsreduktion ersetzt;
maßgeblich war anschließend der oben verlinkte historische Levelplan. Neue Aufträge
folgen heute der Adventure-Roadmap.

**27. Oktober, Umsetzungsplan für Adventure-Level 1:** Nach positiver Rückmeldung
zum neuen Mockup zunächst vier Pakete L1.1–L1.4 geplant (inzwischen durch den
[aktuellen Levelplan](LEVEL_1_STONE_ADVENTURE.md#umsetzungsplan-vom-spielbaren-kern-zum-fertigen-testlevel) ersetzt).
Damals: Map → Gegner → vollständiger Ablauf → Boss/Abstimmung. Insgesamt vorläufig
3–6 Stunden aktive Agent-Arbeit mit passenden Prüfungen, erster begehbarer Stand in
30–60 Minuten. Separat von M2.4; Planung fertig, Umsetzungspakete noch nicht freigegeben.
Aufwand nach jedem Paket aktualisieren.

**27. Oktober, Level-1-Visualisierung:** [Neues Mockup und genaue Map-Skizze](../concepts/level-1-layout-v1/README.md)
zum konkreten Ablaufplan erstellt. Tatsächliche Spieloptik als Referenz, Raumfolge,
Gegner und Fundorte in der Skizze geprüft. Die Freigabe umfasst weiterhin nur Planung
und Visualisierung; der Adventure-Level ist noch nicht umgesetzt.

**27. Oktober, konkreter Level-1-Plan:** Die generierten Mockups wurden vom Nutzer
als unrealistisch und nicht hilfreich für die Raum-/Begegnungsplanung zurückgewiesen.
Maßgeblich ist jetzt der [Ablaufplan für den Steinhof](LEVEL_1_STONE_ADVENTURE.md)
auf vorhandenem Produktionsniveau. Geplant, noch nicht zur Umsetzung freigegeben.

**27. Oktober, Adventure-Konzeptbilder:** Drei [Mockups](../concepts/adventure-levels/README.md)
für eigenständige Boss-Level mit Vorhof, kleineren Gegnern und Nebenwegen erstellt.
Nur visuelle Planung; der Adventure-Umbau ist noch nicht umgesetzt oder freigegeben.

**27. Oktober, Plateauwände ✅ umgesetzt und technisch geprüft:** Auf erneute
Lesbarkeitsrückmeldung eigene hellere Wandmaterialien, unterschiedliche Front-/Seiten-
tönung, durchgehende Ecken und Sockel ergänzt. Beide Perspektiven aller drei Karten
gesichtet; drei Browserfälle bestanden. [Nachweise](../qa/PLATEAU_WALLS_RESULT.md).

**27. Oktober, Steinhof-Qualitätsrunde ✅ umgesetzt und technisch geprüft:** Nach
Freigabe des vorgeschlagenen kleinen Qualitätspakets: synthetische erste Tonfassung
und Trefferreaktionen, abgestimmte Faustbewegung, Umwege um Deckung und klarer
Heilungsweg über niedrige Stufen. 41 Kern-/Physiktests, sieben echte Browserfälle.
Persönliche Klang- und Spielabnahme offen; keine automatische Ausweitung auf die
anderen Karten. [Nachweise](../qa/STONE_QUALITY_RESULT.md).

**27. Oktober, Bosskampf und Kartenwege:** Separat beauftragte normale Nahkampfangriffe
für alle drei Bosse sowie unterschiedliche Innenaufbauten und Pickup-Positionen
umgesetzt. Arc bleibt Startwaffe, Pulse wird pro Karte an eigener Position gesammelt;
Heilung belohnt Sprünge auf niedrige Flächen. [Abnahme und QA](../qa/BOSS_BASICS_RESULT.md).
Keine Freigabe oder Vorwegnahme von M2.4; persönliche Spielbalance-Abnahme offen.

**27. Oktober, Kartengestaltung ✅ umgesetzt und technisch geprüft:** Thematische
Details und dezente Animation auf allen drei PvE-Karten. Nach direkter Rückmeldung
Moos/Frost ins feste Bodenmaterial eingearbeitet und Plattformoberseiten freigeräumt,
aufgehellt sowie mit klaren Kanten versehen. Vier Browserfälle bestanden, darunter
ein tatsächlicher Sprung auf die dekorierte Plattform und die komplette Kampagne.
[Ergebnis](../qa/CAMPAIGN_SCENERY_RESULT.md). Persönliche Sichtabnahme offen.

**27. Oktober, visuelle Nacharbeit ✅ umgesetzt und technisch geprüft:** Spielfläche
durch nähere Kamera stärker ausgefüllt, natives Vollbild per F/Button, HUD ohne große
Kartenflächen, HP/Rüstung über der Spielfigur. Glutschmiede mit helleren Materialien,
Fülllicht und deutlicheren Deckungskanten. Vier echte Browserfälle bestanden, darunter
alle drei Kampagnensiege und Touch; persönliche Bewertung offen.
[Aufnahmen und QA](../qa/IMMERSIVE_HUD_RESULT.md).

**27. Oktober 2026:** Verfolgung des Steinwächters umgesetzt: langsame Schritte,
lokales Ausweichen vor Hindernissen, Stillstand für Warnung/Angriff, bewegter
Trefferkörper und Reset. Kernprüfung und vier PvE-Browserfälle bestanden.
Anschließend separat freigegeben: drei thematische Karten mit jeweils eigenem
Gegner und einfacher Mini-Kampagnenfolge, nun umgesetzt. Zusätzlich beauftragt und
umgesetzt: eigene Waffen-/Pickupmodelle, Arc-/Pulse-Effekte und übersichtlicheres
Kampf-HUD einschließlich Touch. [Ergebnis und QA](../qa/MINI_CAMPAIGN_RESULT.md).
Das ersetzt keine M2.4-Freigabe; persönliche Abnahme dieser Zusatzpakete steht aus.

**Zusatz vom 26. Oktober 2026: kleiner PvE-Versuch ✅ umgesetzt und technisch geprüft.**
Eine separate Begegnung mit einem Steinwächter, Auftauchen, zwei angekündigten
Angriffen, Sieg/Niederlage, Pickups und Neustart. Gemeinsame Waffen, Bewegung und
Touch; keine Kampagnenstruktur, Speicherung oder neue Gegnernavigation.
Vorheriger Stand auf `checkpoint/pre-pve-test-2026-10-26` gesichert, Umsetzung als
separater rücknehmbarer Commit. [Browsernachweise](../qa/PVE_BASIC_RESULT.md).
Keine separat gemessene Ist-Zeit; kein nachträglich erfundener Planwert.
Damals als nächster Schritt vorgesehen: Nutzerurteil zur PvE-Richtung; M2.4 war noch ungeöffnet.

Nacharbeit auf Spielrückmeldung vom 21. Oktober 2026: Gleichhohes Boden-Aim lenkt Arc/Pulse jetzt auf Waffenhöhe durch den Cursorstrahl, statt in den Boden. Vor und hinter den Gegner zielen funktioniert entlang der tatsächlichen Trefferbahn; echte 3D-Zielwahl auf andere Höhen bleibt erhalten. Kein Beginn von M2.4. [Prüfung](../qa/DIRECTIONAL_AIM_RESULT.md).

Historischer Plan nach M2.3: **M2.4–M2.6 zusammen 40–80 Minuten**. Diese inzwischen erledigten Pakete sind kein Restaufwand. Keine separat gemessenen Paket-Istzeiten werden nachträglich erfunden; die ursprünglichen Schätzungen bleiben als Planwerte sichtbar. Die zusätzlich angeforderte GitHub-Pages-Veröffentlichung gehörte nicht zum ursprünglichen Waffenpaket.

Jedes Paket umfasst seine passenden Tests und einen kurzen Browsernachweis, soweit es sichtbares Spielverhalten verändert. Die abschließenden Prüfblöcke bündeln Regression, längere Simulationen und Spielabnahme; sie verschieben das Testen nicht ans Ende.

Vor Beginn eines Pakets werden aus dem Ergebnis eine kurze Aufgabenliste und konkrete Erfolgskriterien abgeleitet. Innerhalb eines freigegebenen Meilensteins können die Pakete nacheinander bearbeitet werden, ohne für jede kleine Änderung eine neue Freigabe einzuholen. Meilensteingrenzen, wesentliche Scope-Änderungen und der optionale Mobile-Versuch bleiben eigenständige Entscheidungen.

Ein Paket, dessen Kernrisiko sich in der vorgesehenen Zeit nicht auflösen lässt, wird anhand des Befunds kleiner geschnitten. Es wird nicht durch zusätzliche Features erweitert. M3.3 kann beispielsweise in separate Classic- und One-Flag-Abnahmen geteilt werden, wenn sich unterschiedliche Problemursachen zeigen.

Nach jedem Paket dokumentieren: tatsächlich erreichter Zustand, ausgeführte Prüfungen, bekannte Grenzen und das nächste noch offene Risiko. „Umgesetzt“, „technisch geprüft“ und „spielerisch abgenommen“ bleiben getrennte Aussagen.

**Aktueller Stand, 1. November:** M0/M1, M2.1–M2.6, Map-Paket, Konfetti und AP1–AP3 technisch
geprüft; Touch-Zugang vorhanden. Maßgebliche offene Aufgaben und Reihenfolge stehen
in der [Arena-To-do-Liste](#arena-to-do-liste). Persönlicher Vergleich der
Schwierigkeiten/Seitenversorgung und echte Handyabnahme bleiben separat offen.
AP4/AP5, CTF/Teamrollen (M3) und Liga (M4) sind geplant, nicht freigegeben.
Adventure-L1.5b ist separat technisch abgeschlossen;
[Prüfstand und persönliche Grenzen](../qa/L1_5B_RESULT.md).
Die datierten älteren Meldungen und Summen oben dokumentieren den damaligen Plan;
sie sind keine aktuelle Restschätzung und keine Freigabe weiterer Pakete.
