# Öffentliche T2-Vorschau und Links-nach-rechts-Kamera

Stand: 2. November 2026. Nutzerauftrag: die neue Version über einen öffentlichen
README-Link auch außerhalb des eigenen WLANs spielen. Anschließend ausdrücklich
bestätigt: Mission und Bossarena wieder durchgehend von links nach rechts.

## Einstieg und aktueller Roadmapstand

[Adventure-Vorschau öffnen](https://emfau88.github.io/CoreArena-3D/adventure-preview/?mode=pve&level=stone&adventure=1&combat=prototype).
Der Link steht oben in der README auf `main` und im Entwicklungsbranch.
Handy im Querformat; der Entwicklungs-PC muss nicht laufen. Touch bietet Bewegung,
normalen Schlag, schweren Schlag, Dash und Sprung/Doppelsprung. Echte iOS-/Android-
Spieltests bleiben offen; die Browseremulation ist kein Ersatz dafür.

Maßgeblich bleibt die [Roadmap im Entwicklungsbranch](https://github.com/emfau88/CoreArena-3D/blob/codex/adventure-combat-prototype/docs/planning/ADVENTURE_ROADMAP.md):
A0–A6.2 und A7.1 technisch umgesetzt; T1/G1 bestanden. Der laufende Spieltermin
T2 / A7.2 beurteilt erste Mission, Steinwächter und Waffenvergleich. G2/G3 und
der Gesamtentscheid bleiben offen. A8, Progression und weitere Bosskarten sind
nicht beauftragt. Öffentliche Testbarkeit ist keine Release-Abnahme und ändert
weder die 26 Bulks noch die sechs Gates oder drei Spieltermine.

## Kamera

Die `side`-Ansicht wird für die neue Mission und das Labor wieder fest verwendet.
Der Weg Richtung Nordtor verläuft dadurch auf dem Bildschirm nach rechts. Maus
und Touch-Bewegung nutzen weiterhin die tatsächliche Kamerabasis; Weltgeometrie,
Kampfwerte, Dash-/Sprungregeln und Bossangriffe sind unverändert.

Nachführung und begrenzter Versatz zum Boss bleiben bestehen. Die erste Prüfung
fand den Boss bei großem Abstand quer über den Hof zu nahe am oberen Bildrand.
Der Zoom richtet sich deshalb nach den projizierten Höhen und Abständen beider
Figuren, mit 18–36 m Bildhöhe, statt nur nach ihrer horizontalen Weltdistanz.
Keine automatische Kameradrehung beim Betreten der Bossarena. Die bisherigen
Geradeausbilder in A1/A4 und früheren Nachweisen bleiben historische Aufnahmen.

## Veröffentlichung und Trennung

`npm run build:adventure-preview` erzeugt einen eigenen optimierten Vite-Build mit
Assetbasis `/CoreArena-3D/adventure-preview/`. Nur dieser zusätzliche Buildmodus
erlaubt den Prototyp in einer öffentlichen Version. Das reguläre `npm run build`
behält Legacy; Arena und andere Karten behalten ihre bisherigen Routen.

Prototyp-Komposition und Laborimport wurden getrennt: öffentliche Vorschau ohne
Laboroberfläche, Diagnose-Hook oder Lab-Fixture. `preview-version.json` nennt den
gebauten Commit und Quellhash zur überprüfbaren Versionszuordnung.

Der bestehende Pages-Workflow läuft weiterhin auf `main`. Er baut den bisherigen
Live-Code aus `main` und die Vorschau aus `codex/adventure-combat-prototype` und
veröffentlicht sie gemeinsam unter Hauptpfad beziehungsweise Unterordner.
Auf `main` werden ausschließlich README und Workflow geändert, kein Gameplay-Code
des Entwicklungsbranches übernommen. Die bestehende Pages-Beschränkung auf
Deployments von `main` bleibt erhalten.

Spätere Vorschau-Aktualisierung nach geprüftem Push auf den Entwicklungsbranch:
GitHub → Actions → **Build and deploy game** → **Run workflow** auf `main`, oder
`gh workflow run pages.yml --ref main`. Ein reiner Push auf den Entwicklungsbranch
startet absichtlich kein Deployment. Jeder reguläre Pages-Lauf baut beide Pfade,
damit ein späterer Hauptbuild die Vorschau nicht entfernt.

## Nachweise

- 105/105 Unit-/Physiktests bestanden. Routing testet gesonderte Prototyp-Freigabe
  bei gesperrtem Lab, Legacy-Standard und unveränderte andere Maps. Kameratest
  prüft Bildränder, vier Seitenverhältnisse und die Links-nach-rechts-Projektion.
- Typecheck, regulärer Produktionsbuild, Testbuild und Vorschau-Build bestanden.
- Acht Browserfälle bestanden: Luftangriff auf Desktop, Touch bei 667/844 Pixeln,
  bewusste Angriffs-/Dash-Eingaben, Kamerarundgang an Rändern/Ecken/Plateau,
  Legacy-Kamerawahl, vollständige Mission ohne Reserve und beide Bodenangriffe
  einschließlich Pulse-/Legacy-Wechsel. Die Wegautomation verwendet nun die
  gewählte Kamerabasis statt fest angenommener Weltachsen.
- Fertiger Vorschau-Build lokal auf Desktop und Touch bestanden, ohne Testhook:
  Laden sämtlicher benötigter Assets, neue Aktionen, Doppelsprung, Pause und
  Orientierung. Regulärer Produktionsguard ebenfalls bestanden.
- Die externe Pages-Abnahme folgt unmittelbar nach Push/Deployment mit demselben
  `scripts/qa/adventurePreviewGuard.ts` gegen die öffentliche HTTPS-Adresse.

Rohdaten und Bilder: [adventure-public-preview](adventure-public-preview/).
Die Buildberichte vor dem Sicherungscommit nennen `40f4c96`; der öffentlich
ausgelieferte Versionsnachweis nennt anschließend den tatsächlich gebauten Commit.
