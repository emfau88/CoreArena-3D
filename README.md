# CORE ARENA 3D

## ▶ [Jetzt im Browser spielen](https://emfau88.github.io/CoreArena-3D/)

**Neu: [Adventure-Level 1 spielen](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1)**
— drei große, offene Höfe mit breiten Verbindungen, erreichbaren Terrassen und festen
Vorratsorten. Standardmäßig führt der Weg **von links nach rechts**. **V / Ansicht**
wechselt zwischen seitlicher, gerader und isometrischer Kamera.
**L1.2 in kleiner Fassung umgesetzt:** ein Steinläufer mit Nahkampfschlag im ersten
Hof, einer im zweiten, danach der bekannte Steinwächter im dritten. Beide Läufer
besiegen und den Wächterhof betreten, um ihn zu wecken. Pulse liegt am ersten
Durchgang; Vorräte auf der Seitenterrasse helfen vor dem Boss. Sieg, Niederlage und
Neustart sind spielbar. Nach dem Sieg führt „Weiter“ zur bestehenden Kristallkluft.
[Spielaufnahmen und Browserprüfung](docs/qa/L1_2_RESULT.md).
Zum ruhigen Vergleich: [ohne Gegner erkunden](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1&explore=1).
Checkpoint und weiterer Feinschliff bleiben optionale nächste Schritte.

**Mobile-Feinschliff:** 15 % größere Darstellung, Sprint an/aus auch bei gehaltenem
Joystick. Im Adventure bündelt **Menü** Kamera, Ton, Vollbild und Neustart; die Kamera
zeigt etwas mehr in Laufrichtung. Kürzere Adventure-Sprünge gelten für Desktop und
Touch gleichermaßen. [Änderungen und Prüfung](docs/qa/MOBILE_POLISH_RESULT.md).

**Desktop: Maus + Tastatur. Mobile: Querformat + Touch.** „Botmatch starten“ für das neue 1-gegen-1 oder „Trainingsmatch starten“ für stationäre Ziele; am Desktop dann WASD/Shift/Space.
**F** oder „Vollbild“ wechselt in echtes Browser-Vollbild. Die nähere Kamera füllt
die Spielfläche; schlanke HUD-Anzeigen und HP/Rüstung direkt über der Figur halten
den Kampf im Mittelpunkt. Die Glutschmiede hat hellere Flächen und klarere Deckungskanten.
Die Kampagnenkarten ergänzen Efeu und Mauerreliefs, Eiszapfen und Frost sowie
Ofengitter und Metallbeschläge. Moos/Frost sind in die Bodentextur eingearbeitet;
helle, freie Plattformoberseiten machen die erhöhten Flächen erkennbar.
Die Plateauwände haben eigene, vom Boden abgesetzte Materialien sowie durchgehende
Eckkanten und Sockel, damit die Höhe bis zum Boden sichtbar bleibt.
Pulse liegt hinter dem Startpunkt; aufnehmen und mit **2** wählen, **1** wählt Arc Lash.
[Build & Deployment](https://github.com/emfau88/CoreArena-3D/actions/workflows/pages.yml)
veröffentlicht geprüfte Spieländerungen auf `main` automatisch über GitHub Pages.

Eigenständiges Desktop-Spielprojekt. **M0, M1 und M2.1–M2.3 sind umgesetzt und technisch
geprüft.** M2.4 und folgende Pakete benötigen die nächste Freigabe.

Spielbar sind Bewegung, Sprint, Sprünge über E0/E1/E2, Kopf-/Wandkollision,
3D-Mausziel und Diagnosefeuer auf drei Höhenziele sowie beide V5-Kameras.
Eine goldene Testfigur zeigt dieselbe Höhenroute mit demselben Motor.
E2 ist ein massives Plateau bis zum Boden. Sprünge direkt an der Wand behalten
ihren Aufwärtsimpuls; Kantenkontakt beim Aufstieg zählt nicht als Landung.
Optik und Bewegung orientieren sich an V5. M2.1 ergänzt einen Trainingsmatch mit
HP/Armor, Tod/Respawn, Spawn-Schutz, Punkten, Timer und Neustart.
M2.2 ergänzt Arc Lash, Pulse Repeater, Waffenwahl und Pickups.
M2.3 ergänzt ein Botduell mit begrenzter Sicht, Gedächtnis und Reaktionszeit.
Eine einfache mobile Touch-Steuerung ist verfügbar.

### Mini-Kampagne: Die drei Siegel

**[Kampagne starten](https://emfau88.github.io/CoreArena-3D/?mode=pve)** oder
„Mini-Kampagne: Die drei Siegel“ im Spiel wählen. Drei kurze Begegnungen verbinden
sich durch Einleitung, Siegesgeschichte und „Weiter“ zu einem abgeschlossenen Versuch:

| Karte | Gegner | Angriff und Gegenmittel |
| --- | --- | --- |
| [Verfallener Steinhof](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone) | Steinwächter | Schockwelle überspringen oder Deckung nutzen |
| [Kristallkluft](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=frost) | Frostspinne | Drei Eissplitter: seitlich ausweichen oder springen |
| [Glutschmiede](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=ember) | Glutwurm | Feueratem: aus dem Fächer oder hinter Deckung; Springen schützt nicht |

Alle Gegner kommen aus dem Boden, verfolgen dich zwischen ihren angekündigten
Angriffen und markieren zusätzliche Bodenausbrüche. Diese Kreise rechtzeitig verlassen.
Zusätzlich greifen sie in der Nähe regelmäßig normal an: Faustschlag, Spinnenbiss
oder Glutwurm-Vorstoß. Die kurze Vorbereitung und der kleine Frontbogen kündigen
den Treffer an. Abstand, seitliches Ausweichen, ausreichend hohe Sprünge oder echte
Deckung schützen; bloßes Stehenbleiben im Nahkampf kostet Leben.
Jede Karte beginnt mit frischen HP/Armor und **Arc Lash**. **Pulse aufnehmen und mit 2
oder dem Waffenbutton auswählen.** Waffen und Vorräte liegen je Karte unterschiedlich:

| Karte / Aufbau | Pulse | Weitere Vorräte |
| --- | --- | --- |
| Steinhof: offener Hof mit Säulen und östlicher Stufenterrasse | Links vom Start | Munition im Osten, Medkit auf der niedrigen Westmauer |
| Kristallkluft: langer Eisrücken und versetzte Plattformen | Rechts vorne | Munition hinter dem westlichen Eisrücken, Medkit auf dem südlichen Eissockel |
| Glutschmiede: breite Ofenblöcke und Gassen | Rechts hinten | Munition vor dem Westofen, Medkit auf der östlichen Schlackebühne |

Rüstung liegt an weiteren eigenen Positionen. Ein Leben pro Versuch, beliebig neu versuchen.

**Steinhof-Qualitätsrunde:** Der Wächter findet Wege um Deckungen und holt für seinen
Faustschlag sichtbar aus; die Faust erreicht den Kontaktpunkt zum Schadenszeitpunkt.
Treffer erhalten kurze Rückmeldung, eigener Schaden einen dezenten Randimpuls.
Eine erste synthetische Tonfassung unterscheidet Waffen, Treffer, Schritte, Landung,
Bossangriffe und Pickups. Ton startet nach der ersten Tastatur-/Touch-/Mauseingabe;
„Ton an/aus“ schaltet ihn stumm. Zwei niedrige Stufen und eingelegte Wegsteine führen
zur Heilung auf der Westmauer. Diese Qualitätsrunde gilt zunächst für den Steinhof.
[Umfang und Prüfung](docs/qa/STONE_QUALITY_RESULT.md).
Nach dem dritten Sieg ist die Mini-Geschichte abgeschlossen. Die Karten sind über
die Links auch einzeln testbar; kein Save oder Freischaltsystem nötig.

Neues HUD mit Waffen-Silhouetten, separaten HP-/Rüstungsbalken und Bossanzeige.
Pickups haben eigene Modelle: Medkit, Energiezellen, Rüstungsschild und Pulse-Gewehr.
Arc Lash zeigt einen violetten Energieblitz; Pulse feuert sichtbare blaue Geschosse
mit Leuchtspur. Kampfwerte und Trefferregeln bleiben gleich. Desktop und Touch.

„Zur Arena“ bringt dich zum bisherigen Spiel zurück. Der Stand vor dem PvE ist auf
[`checkpoint/pre-pve-test-2026-10-26`](https://github.com/emfau88/CoreArena-3D/tree/checkpoint/pre-pve-test-2026-10-26)
gesichert. Der Verfolgungsstand vor der Kampagne ist `95cb572`. Erweiterungen werden
als eigene Commits gespeichert; für eine vollständige PvE-Rücknahme die aufeinander
aufbauenden Commits in umgekehrter Reihenfolge zurücknehmen.
[Kampagne und visuelle Überarbeitung](docs/qa/MINI_CAMPAIGN_RESULT.md),
[Vollbild, integriertes HUD und hellere Glutschmiede](docs/qa/IMMERSIVE_HUD_RESULT.md),
[Kartendetails und lesbare Plattformen](docs/qa/CAMPAIGN_SCENERY_RESULT.md),
[Normale Bossangriffe und neue Kartenwege](docs/qa/BOSS_BASICS_RESULT.md),
[ursprünglicher PvE-Versuch](docs/qa/PVE_BASIC_RESULT.md).

### Einfach mobil spielen

Handy ins **Querformat** drehen. **Links unten den Joystick ziehen**, auf die Arena
**tippen oder halten**, um dort hinzuzielen und zu feuern. Ziehen mit dem Zielfinger
führt das Ziel nach. Bewegung und Feuer funktionieren gleichzeitig und unabhängig.
**Sprung** springt, **Sprint** schaltet schnelleres Laufen an/aus, **Ansicht** wechselt
die Kamera. Waffen oben links antippen. Für Pulse zunächst den blauen Pickup hinter
dem Startpunkt aufnehmen. Unterbrechung, Drehung oder Neustart löschen gehaltene Eingaben.

Die Touch-Version verwendet dieselbe Simulation und reduziert nur Renderauflösung
und Schattenauflösung. In Chromium mit echten Mehrfinger-Browserereignissen geprüft;
Bediengefühl und Leistung auf echten Android-/iPhone-Geräten sind noch nicht abgenommen.

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
Beim Zielen auf Boden derselben Höhe bestimmt der Cursor die **Schussrichtung auf
Waffenhöhe**. Du kannst vor oder hinter einen Gegner zielen: Wer innerhalb der
Waffenreichweite in der Flugbahn steht, wird getroffen. Der Cursor begrenzt die
Flugstrecke nicht. Direktes Zielen auf Gegner oder andere Höhen bleibt räumliches
3D-Zielen; Wände und Plattformkanten blockieren weiterhin. Das gilt auch für Touch.
B bzw. „Route zeigen“ startet einmal die goldene Navigationsprobe; Neuladen setzt
die Übung zurück. Die markierten Absprungstellen führen über E1 und E2. Wer über
den äußeren Rand fällt, kehrt zum Start zurück.
Beim Fokusverlust pausiert das Spiel und löscht gehaltene Tasten.
F3 zeigt ausschließlich im Entwicklungs-/Testbuild die Diagnose und echten Collider.

„Trainingsmatch starten“ aktiviert 120 Sekunden Spielzeit oder 10 Abschüsse.
Die drei roten Ziele haben wie der Spieler 100 HP und zunächst 50 Armor. Armor
fängt Schaden zuerst ab. Nach einem
Tod folgen 4 Sekunden Respawn, dann 100 HP ohne Armor und 2 Sekunden Schutz.
Schießen beendet den eigenen Schutz. Ein blauer Ring markiert geschützte Ziele,
ein goldener Ring den geschützten Spieler. Die orange Bodenfläche links vom Spawn
verursacht Schaden zum Ausprobieren des eigenen Lebenszyklus; Umwelttod gibt keine
Teampunkte. „Neu starten“ bzw. „Noch einmal spielen“ setzt die Runde zurück.
Dies ist eine Trainingsrunde gegen stationäre Ziele, noch kein 2v2 mit Kampf-Bots.

**„Botmatch starten“:** ein roter beweglicher Gegner mit denselben Lebens-, Bewegungs-
und Waffenwerten. Er sieht höchstens 18 m weit in einem 140°-Sichtfeld; echte Deckung
blockiert die Sicht. Vor dem Feuer wartet er 0,4 s, auch nach erneutem Sichtkontakt.
Er merkt sich einen verlorenen Gegner höchstens 2 s am zuletzt gesehenen Ort und
feuert ohne Sicht nicht weiter. Zielnachführung erfolgt alle 0,1 s mit begrenztem
Drehtempo und Zielabweichung. Bereits abgefeuerte Projektile fliegen weiter.
Beide starten mit Arc Lash; auch der Bot muss Pulse und Munition regulär aufnehmen.
Der Gegner patrouilliert und verfolgt lokal auf E0. Gezielte Höhenrouten, Umwege bei
Blockaden, Ressourcenplanung, Teamspiel und Schwierigkeitswahl folgen mit M2.4.

| Waffe | Bedienung und Wirkung |
| --- | --- |
| Arc Lash | **1**; unbegrenzt, 35 Schaden, 0,8 s Abstand, 5 m Reichweite; 10° Zielhilfe um den 3D-Zielstrahl, echte Sicht und Deckung |
| Pulse Repeater | **2** nach Waffenpickup; 10 Schaden, 10 Ticks (~0,167 s) Abstand, sichtbare Projektile mit 30 m/s und 32 m Reichweite; maximal 54 Schuss |

Mausrad über der Arena wechselt verfügbare Waffen. Leere Pulse fällt auf Arc Lash
zurück; ein Pickup wählt niemals automatisch eine andere Waffe. Die Pulse-Waffe
liegt auf E0 hinter dem Start, Munition auf E1, Armor auf E2 und Heilung links hinten
auf E0. Nur auf derselben Standfläche und Höhe aufnehmen; volle Ressourcen bleiben
liegen, Teilmengen bleiben erhalten. Vollständig aufgebrauchte Pickups kehren nach
10 Sekunden zurück. Tod/Respawn entfernt Pulse und Munition; Neustart setzt auch
Pickups und sämtliche Projektile zurück. Freies Training vor Matchstart behält die
M1-Diagnosewaffe zum Prüfen der Höhen.

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
| M2.1 Lebenszyklus und Match | Erledigt; kompletter Trainingsmatch im Browser geprüft |
| M2.2 Waffen und Ressourcen | Erledigt; beide Waffen, Pickups, Munition und Restart im Browser geprüft |
| M2.3 Botwahrnehmung und Kampf | Erledigt; Sicht/Reaktion/Gedächtnis, Waffenregeln und echtes Botduell geprüft |
| Separater PvE-Ausbau | Technisch geprüft: drei Karten, eigene Gegner, Mini-Geschichte, Verfolgung und neues Kampf-HUD |
| M2.4–M2.6 | Nicht begonnen; nächste Freigabe erforderlich |

[M2.3-Ergebnis und Testnachweise](docs/qa/M2_3_RESULT.md), [M2.2-Nachweise](docs/qa/M2_2_RESULT.md), [M2.1-Nachweise](docs/qa/M2_1_RESULT.md), [M1-Nachweise](docs/qa/M1_RESULT.md), [M0-Nachweise](docs/qa/M0_RESULT.md).

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
erst nach Bewährung des Spielgefühls. Weiterer Mobile-Ausbau bleibt optional.

## Planung und Referenz

- [Architektur](docs/planning/ARCHITECTURE_DECISION.md)
- [M0-Auftrag](docs/planning/M0_IMPLEMENTATION_BRIEF.md)
- [Meilensteine und QA](docs/planning/MILESTONES_AND_QA.md)
- [Arbeitspakete und optionale Mobile-Erweiterung](docs/planning/MOBILE_AND_WORK_PACKAGES.md)
- [Unveränderte V5-Referenz](references/Core_Arena_3D_Obsidian_Garden_V5.html)

CTF-3.0 wird ausschließlich als Referenz gelesen. Die neue Runtime enthält keine
Imports aus diesem Repository und lädt keine Bibliotheken von einem CDN.
