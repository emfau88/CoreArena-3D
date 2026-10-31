# Level 1: Der verwitterte Hof

**Spielvariante: Adventure / PvE-Kampagne.** Dieser Plan beschreibt ausschließlich
den Adventure-Ausbau. Arena, 2v2, CTF und Liga sind eine getrennte, zurückgestellte
Spielvariante und keine Voraussetzung oder automatische Fortsetzung dieses Plans.
[Gemeinsame Grundlage und Unterschiede](MILESTONES_AND_QA.md#zwei-getrennte-spielvarianten).

## Kompakter nächster Ausbau: „Der verstummte Außenposten“

**Stand 30. Oktober 2026: L1.6a, L1.6b und anschließend L1.6c freigegeben und umgesetzt.**
Die vollständige Missionskette ist spielbar; [Ergebnis und Browsernachweise](../qa/ADVENTURE_MISSION_RESULT.md).
[L1.6b: aktueller Bossvergleich und Prüfungen](../qa/BOSS_PRESSURE_RESULT.md).
[L1.6c: Ortsgestaltung und Wartungsreserve](../qa/OUTPOST_PLACES_RESULT.md).
L1.5b bleibt offen und benötigt eine neue Freigabe.

Die [ausführliche Vorbildanalyse](ADVENTURE_SHOOTER_REFERENCES.md) dokumentiert
sechs Vergleichsspiele, Quellen und konkrete Empfehlungen für diesen Ausbau.
Sie vertieft die Begründung; Umfang und Paketfolge bleiben hier festgelegt.

Ziel: Ein zusammenhängender kleiner Auftrag mit erkennbarem Anfang, Entdeckung,
Bedrohung und sichtbarem Abschluss. Grundlage bleiben die drei großen Höfe,
Links-nach-rechts-Kamera, zwei Steinläufer, Steinwächter und die beiden Waffen.

**Spielbarer Ablauf:** Ankunft an beschädigter Drohne → erster Läufer → Pulse-Fund
→ zweiter Läufer / optionale Wartungsterrasse → Konsole aktivieren → Checkpoint
→ angekündigtes Erwachen des Bosses → Steinkern bergen → Relais versorgen →
durch das geöffnete Ausgangstor gehen.

| Paket | Konkretes Ergebnis | Fertig, wenn … | Aktive Agentzeit |
| --- | --- | --- | --- |
| **L1.6a · Auftrag spielbar machen — erledigt** | Beschädigte Drohne, bedienbare Wartungskonsole, Bossfreigabe, erforderlicher Steinkern und Relais am Ausgang; Lichtreaktionen, Ton und vier kurze Meldungen. | Ganze Kette mit Maus/Tastatur und emuliertem Touch geprüft; Interaktion nur in Reichweite, auf Bodenhöhe und mit freier Sicht. Boss-Retry erhält aktivierte Konsole, Neustart setzt alles zurück. | Keine Restarbeit dieses Bulks; keine separat gemessene Istzeit |
| **L1.6b · Kampf spannend und fair machen — umgesetzt** | Aktueller Waffenvergleich; Faust: 0,5 s Vorwarnung und 30 Schaden; Schockwelle schneller bei gleicher Reichweite. Angriffsfläche, Warnklänge und Erholung deutlicher. | Dokumentierte stationäre und aktive Versuche mit gleichen Startwerten; Abstand/Höhe/Deckung bleiben wirksam. [Prüfstand](../qa/BOSS_PRESSURE_RESULT.md). | Keine geplante Restarbeit dieses Bulks; persönliche Spielrückmeldung separat |
| **L1.6c · Drei erkennbare Orte gestalten — umgesetzt** | Ladebuchten/Fracht/Waffenausgabe, Drohnen-Reparaturplatz und Relaisversorgung; optionale Wartungsreserve auf der bestehenden Terrasse. | Bestehender Hauptweg und Terrasse begehbar; Vergleichsbilder und Desktop-/Touch-Durchläufe. Reserve sichert mindestens 75 Rüstung am Checkpoint und 75 beim Boss-Retry. [Nachweis](../qa/OUTPOST_PLACES_RESULT.md). | Keine geplante Restarbeit dieses Bulks; persönliche Sichtung separat |
| **L1.5b · Gesamtabnahme — offen** | Nach den freigegebenen Ausbauten den gesamten Ablauf, Schwierigkeit und Lade-/Laufzeit prüfen; gezielte Restkorrekturen. | Desktop-/Touch-Durchlauf und technische Prüfung dokumentiert; persönlicher Handytest und Spielurteil separat. | **20–35 Min.** |

- [x] L1.6a: Auftrag, Konsole und Relaisabschluss.
- [x] L1.6b: Bossvergleich, gezielte Abstimmung und Kampflesbarkeit.
- [x] L1.6c: Ortsidentität und Erkundung.
- [ ] L1.5b: Technische Gesamtabnahme und persönliche Rückmeldung.

**Reihenfolge:** L1.6a–c sind umgesetzt. Danach nur mit eigener Freigabe
Gesamtabnahme (L1.5b).
Restplan **20–35 Minuten aktive Agent-Arbeit**, inklusive passender Tests,
Dokumentation und Commit/Push. Rückmeldung, Deployment-Wartezeit und echter
Handytest separat. Dies ist keine Freigabe der Restpakete.

Die umgesetzte Relaiskette ändert den bisherigen Abschluss: Der Steinkern
ist jetzt Missionsgegenstand, und das Nordtor öffnet erst nach
Relaisaktivierung. Nach dem Boss-Sieg öffnet die Rückzugssperre weiterhin.
Die einzige neue Bedienung ist „Interagieren“ (E am Desktop, kontextabhängige Taste
auf Touch); Kampf- und Bewegungsfinger bleiben unabhängig. Der Erkundungsmodus
bleibt zum freien Prüfen der ganzen Karte verwendbar.

Der Ausbau verwendet vorhandene kostenlose Assets und einen kleinen festen
Missionszustand. Mech-/Railgun-Gegner, weitere Räume, zusätzliche Gegnerwellen,
Inventar und allgemeines Quest-System bleiben spätere Aufgaben. Nur tatsächlich
platzierte Modelle werden vom Spiel geladen. Die neue Paketfolge erweitert die
bisherige Roadmap; L1.5b wird bei Freigabe dahinter eingeordnet, nicht doppelt gerechnet.

## Bereits umgesetzter Stand

Stand: 30. Oktober 2026. **L1.1, das verkleinerte L1.2, L1.3, L1.4a und L1.6a–c umgesetzt und technisch
geprüft.** Der Nutzer hat den Gegnerumfang ausdrücklich reduziert:
**zwei kleine Nahkämpfer und der bereits vorhandene Steinwächter**.
Der frühere Plan mit sieben kleinen Gegnern, Steinwerfer und zusätzlichen Bossphasen
ist damit überholt. Aktuelles Nutzerziel: **ein vollständig spielbares, hochwertig
ausgearbeitetes erstes Testlevel**. Dafür werden Abschluss, Gestaltung und Spielabnahme
als konkrete Pakete eingeplant. Mit „ok go“ wurde anschließend L1.3 freigegeben und
umgesetzt. Anschließend wurde L1.4a mit gewünschten Vorher/Nachher-Bildern freigegeben
und umgesetzt. Nach der Rückmeldung wurde der Material-/Ecken-/Pflanzenschritt von
L1.4b freigegeben und umgesetzt: Boden auf der ganzen Map, Pflanzen auch innen,
saubere Maueranschlüsse. L1.5a ergänzt nun Bosstempo und KayKit-Wächterpuppen.
Die kostenlose AssetQuest-/Retro-Tech-Runde ergänzt jetzt Pflanzen und vier
Konsolen in allen drei Höfen. Weitere Lichtgestaltung ist optional, die
abschließende Abnahme L1.5b bleibt offen.
Die Kampf-Nachbesserung vom 29. Oktober korrigiert die Eingangssperre, ergänzt
Plateau-Druck durch Bodenausbrüche, Beschuss-Aggro und einen damals optionalen
Steinkern als Boss-Trophäe. Seit L1.6a ist er für das Relais erforderlich.
[Historische Details und Browsernachweise](../qa/ENCOUNTER_FIXES_RESULT.md).
Der zusätzlich freigegebene KayKit-/Pickup-Schritt vom 29. Oktober ist ebenfalls
umgesetzt: geriggte Figur mit Animationen und Energie-Pickups statt schwarzer Sockel.

[Spielen](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1)
· [Ohne Gegner erkunden](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1&explore=1)
· [Aktuelle L1.3-Prüfung und Spielaufnahmen](../qa/L1_3_RESULT.md)
· [L1.4a: Vergleichsbilder und Prüfung](../qa/L1_4A_RESULT.md)
· [L1.4b: Materialien auf der ganzen Map](../qa/L1_4B_MATERIALS_RESULT.md)
· [Kostenlose Ausstattung: Vorher/Nachher](../qa/FREE_DECORATION_RESULT.md)

## Rahmen und Richtung

Drei große offene Höfe, zusammen etwa 36 × 80 Spielmeter: Ankunft/Ruinenhof
32 × 22 m, innerer Hof 36 × 24 m, Wächterhof 36 × 26 m. Kurze, gerade, 10 m
breite Verbindungen, niedrige Mauern und ein freier Hauptweg. A–H bezeichnen Orte
innerhalb dieser Höfe, keine acht Räume. Die frühere enge
[Map-Skizze](../concepts/level-1-layout-v1/README.md) bleibt verworfen.

Die vorhandene stilisierte Grafik, Waffen, Pickups und Steuerung bleiben die Basis.
Standardblick von links nach rechts; V/Ansicht wechselt auf gerade oder isometrische
Kamera. Mobile: Zoomfaktor 1,45 (nochmals rund 26 % größere Darstellung als beim
bisherigen Faktor 1,15), leichter Kameravorlauf und kompaktes Menü. Sprint wurde
auf Wunsch um 15 % auf 9,18 m/s reduziert. Arc Lash startet nun eine automatische
0,6-s-Salve mit fünf Strahlen im 60°-Fächer; Sicht, Deckung und 5-m-Reichweite bleiben
maßgeblich. [Umsetzung und Prüfung](../qa/SPRINT_ARC_MOBILE_RESULT.md).
Die gemeinsame Adventure-Sprungkurve für Desktop/Touch landet auf gleicher Ebene
nach ca. 0,72 s bei ca. 2,15 m Höhe; Treppen und Plateaus bleiben erreichbar.

Geschichte: Der Ruinenkurier findet einen verstummten Außenposten. Nach beiden
Steinläufern stellt die Wartungskonsole die Verbindung zum letzten Hof her.
Der fehlende Relaiskern steckt im Steinwächter. Kern bergen, Relais einschalten
und den Außenposten durch das geöffnete Tor verlassen. Kurze HUD-Ziele begleiten
jeden tatsächlichen Missionszustand.

## Spielbarer Ablauf und Fundorte

Koordinaten als (X; Z), Norden = negatives Z. Grundriss und Vorräte stammen aus L1.1.

| Ort | Gegner | Waffen/Vorräte | Ablauf |
| --- | --- | --- | --- |
| A · Ankunft, (0; 33) | Keine | Arc Lash, 100 HP, 50 Rüstung | Beschädigte Drohne bei (-3; 34), kurzer Auftrag; sicherer Start. |
| B · Ruinenhof | **Ein Steinläufer bei (2; 24)** | Keine Pflichtaufnahme | Er nähert sich beim Betreten des Hofs. Rückzug zum Start möglich. |
| C · Waffenfund, (-3; 18,5) | Keine | Pulse Repeater mit 54 Schuss | Sichtbar am Hauptweg vor dem breiten Durchgang. |
| D · Seitenterrasse, optional | **Keine zusätzlichen Gegner** | Medkit +35 bei (-13,5; 4), Rüstung +30 bei (-13,5; 0), Munition +27 bei (-9; -0,4) | Breite Treppe zur 1,1 m hohen Terrasse. Vorräte mitnehmen und nach E zurückkehren. |
| D · Wartungsreserve, optional, (-14,6; 2) | Keine | Einmalige Reservekiste, E/Touch in Reichweite auf der Terrasse | Am Checkpoint mindestens 75 statt 50 Rüstung; beim Boss-Retry wieder 75. Bestehende Vorräte bleiben verfügbar. |
| E · Innerer Hof | **Ein Steinläufer bei (2; -1)** | Munition +27 bei (11; 6,5) | Konsole bei (-3; -8) nach beiden Läufern mit E/Touch bedienen. Lichtleitung und Bosszugang werden aktiv. |
| F · Siegelplatz, (0; -14) | Keine | Einmalig 100 HP, mindestens 50 Rüstung, Pulse mit 54 Schuss | Nach beiden Läufern und Konsole wird der Sitzungs-Checkpoint gesichert. Rüstung über 50 bleibt erhalten; kein wiederholtes Auffüllen. |
| G · Wächterhof, (0; -29) | **Der vorhandene Steinwächter** | Munition +18 bei (-13; -37) und (13; -20); Medkit +35 auf Plateau bei (-12; -23) | Nach Freigabe löst Betreten hinter Z = -20,5 das Auftauchen aus. Eingang schließt während des Kampfes; Sieg lässt den Steinkern fallen. |
| H · Relais (-3; -39), Nordtor Z = -42 | Keine | Steinkern als Missionsgegenstand | Kern bergen und am Relais mit E/Touch einsetzen. Erst dann öffnen die Torhälften; hinter Z = -45 endet das Level. Danach Wiederholen, Spielmenü oder optional Kristallkluft. |

Hauptweg **A → B → C → E → F → G**; optional **E → D → E**.
Gesamt **zwei kleine Gegner plus ein Boss**, feste Positionen, keine Zufallsspawns,
Wellen oder zusätzlichen Bossgegner. Die beiden Läufer bleiben in ihren eigenen
Höfen; wer zurückweicht, zieht keine Gegnergruppe durch das ganze Level hinterher.

## Der kleine Gegner

Ein einziger Typ: **Steinläufer als KayKit-Wächterpuppe**. Dasselbe geriggte Mannequin
wie beim Spieler, mit eigenem Skelett, blaugrauem Stein, hellen Schulterplatten,
kräftigen Fäusten, bernsteinfarbenen Augen/Kern und etwas Moos. Lauf-, Faustschlag-,
Treffer- und Todesanimationen; kurze HP-Leiste, sichtbar kleiner als der Boss.

- 70 HP, 3,2 m/s, normaler Nahkampfschlag mit 14 Schaden und 1,8 m Reichweite.
- 0,4 s sichtbares Ausholen mit Bodenbogen, danach 0,7 s Erholung.
- Verfolgt im eigenen Hof über die bestehende Navigation; echte Kollision stoppt
  ihn an Mauern und Plateaus. Er läuft am Boden und steigt keine Treppen hinauf.
- Abstand, seitliches Ausweichen, Höhe und echte Deckung verhindern Treffer.
  Der Schlag richtet sich nach Beginn des Ausholens nicht mehr neu aus.
- Rückzug außerhalb des Hofs bricht den Angriff ab. Er läuft zurück, behält seine HP.
- Besiegte Läufer bleiben bis zum Neustart besiegt. Kein Wurf, Zauber oder Fernkampf.

## Vorhandenen Boss wiederverwenden

Auftauchen aus dem Boden, Verfolgung, Faustschlag, Schockwelle und Bodenausbruch
werden einschließlich Animationen und Navigation wiederverwendet. 600 HP wie zuvor.
Die aktuelle Abstimmung aus L1.6b gilt nur für dieses Adventure:
0,5 s Ausholen, 30 Faustschaden, 0,25 s Schlag-Erholung, 0,65 s zusätzliche Schlagpause;
0,8 s Erholung nach Spezialangriffen und 3,1 m/s Verfolgung. Die Schockwelle
läuft in 1,5 statt 2,5 s bis 20 m Radius (12 statt 7,2 m/s); ihre Vorwarnung
bleibt 1,5 s. Wellen-/Ausbruchschaden und Waffenwerte bleiben unverändert.
Simulation, Schlaganimation und Treffer-Sound verwenden dieselben Zeiten.
Während des Auftauchens ist der Boss noch nicht angreifbar. Der ruhende Steinkörper
weicht beim Erwachen dem beweglichen Boss; der Eingang bekommt sichtbar echte Kollision.

HP/Rüstung gehören zu einem gemeinsamen Zustand. Vorräte helfen unterwegs, Arc bleibt
unbegrenzt. Der einmalige Ruhepunkt vor dem Boss füllt Leben, Mindestrüstung und Pulse
auf. Vor diesem Punkt startet Tod das Level neu; danach bringt „Am Ruhepunkt versuchen“
den Spieler mit 100 HP, 50 Rüstung und 54 Pulse-Schuss zum Siegelplatz zurück. Der Boss
und seine drei Vorräte werden zurückgesetzt, die besiegten Läufer und verbrauchten
Anreise-Vorräte und die aktivierte Konsole bleiben erhalten. Kern und Relais
werden beim Boss-Retry zurückgesetzt. „Level neu starten“ setzt immer alles zurück.
Der Checkpoint gilt nur für die laufende Sitzung; Reload oder Spielmenü verlassen ihn.

**L1.6c-Erkundungsbonus:** Die optionale Wartungsreserve auf der Terrasse erhöht
die Checkpoint-Mindestrüstung und die Retry-Rüstung auf 75. Höhere vorhandene
Rüstung wird am Checkpoint nicht reduziert. Der Fund bleibt nach Boss-Tod erhalten;
Tod vor dem Checkpoint und vollständiger Neustart setzen ihn zurück. Kein Inventar,
keine dauerhafte Kontofreischaltung und kein wiederholbares Auffüllen an der Kiste.
Die sieben neuen Ausstattungsobjekte haben Kollision; Bodenmarken und Leitungen
bleiben passierbar. Bestehende Mission und L1.6b-Bosswerte bleiben erhalten.

Beim Boss-Sieg bleiben Bewegung und Kamera aktiv; die Rückzugssperre öffnet.
Der Spieler muss den Steinkern bergen und am Relais einsetzen. Dadurch öffnet
das Nordtor sichtbar und physisch; erst Durchgehen schließt das Level ab. Die bisherige Kristallkluft
steht danach als optionaler Button bereit und beginnt mit ihrer eigenen Ausrüstung.

**Aktueller Balancevergleich:** L1.6b hat den alten Befund neu gemessen:
Stationäres Auto-Arc verlor bereits; stationäres Pulse mit Arc-Fallback gewann
erneut mit 30 HP. Nach gezielter Abstimmung verliert stationäres Feuer am
definierten Zugang mit beiden Waffen, aktives Ausweichen gewinnt deutlich.
[Bedingungen und Messwerte](../qa/BOSS_PRESSURE_RESULT.md). Das ersetzt keine
persönliche Schwierigkeitsabnahme und ist keine Garantie für jede Position.

## Umsetzungsplan: vom spielbaren Kern zum fertigen Testlevel

L1.1/L1.2 bleiben erledigt; L1.3 schließt inzwischen den Levelablauf ab. Der vorige Plan vom 27. Oktober reichte für einen kleinen
Kampfversuch. Das ausdrücklich gewünschte Qualitätsziel vom 28. Oktober braucht
zusätzlich einen fertigen Abschluss und einen eigenen Gestaltungsschritt. L1.4 wird
dafür in eine sichtbare Stilprobe und ihre Übertragung unterteilt; L1.5 bündelt die
abschließende Kampf-/Spielabnahme. Arena/Liga und neue Frost-/Glut-Level warten.

| Paket | Ergebnis | Status / weitere aktive Agent-Zeit |
| --- | --- | --- |
| **L1.1 · Map begehen** | Drei Höfe, Kamera, Treppen, Terrassen und feste Vorräte | **Erledigt**; technische Erstprüfung nach ca. 35 Min. inklusive Grundrisswechsel, spätere Nacharbeiten separat |
| **L1.2 · Kleiner Kampfablauf** | Ein Läufer pro erstem/zweitem Hof, vorhandener Boss im dritten, gemeinsame HP, Sieg/Tod/Neustart | **Erledigt**; 47 Kerntests und vier Browserfälle bestanden |
| **L1.3 · Level vollständig abschließen** | Einstieg aus dem Spielmenü mit kurzem Auftrag; einmaliger Ruhe-/Checkpoint vor dem Boss; nach Sieg echtes Nordtor öffnen, hinauslaufen und Levelabschluss mit Wiederholen/Rückkehr anzeigen | **Erledigt**; 48 Kerntests und fünf Browserfälle bestanden |
| **L1.4a · Einen Hof sichtbar aufwerten** | Erster Hof als spielbare Stilprobe: Boden, Plateauwand, abgeschrägte Kanten, Farne, bemooste Felsen und eine Fackel; gleiche Vergleichskameras vor/nachher und echter Weg-/Sprungtest | **Erledigt**; vier Browserfälle bestanden, persönliche Sichtung offen |
| **L1.4b · Drei Höfe gestalten** | Materialien, Innenpflanzen, saubere Mauerecken; kostenlose AssetQuest-Pflanzen und Retro-Tech-Konsolen | **Freigegebene Schritte umgesetzt und geprüft**; persönliche Sichtung offen. Weitere Ruinen/Lichter optional nach Rückmeldung |
| **L1.5a · Bosstempo + Wächterpuppen** | Vorgeschlagene Bosszeiten/Verfolgung, KayKit-Nahkämpfer mit Steinoptik, synchronen Faustschlägen und Browserprüfung | **Umgesetzt**; [Ergebnis](../qa/BOSS_AND_GUARDS_RESULT.md) |
| **L1.6a · Missionskette** | Auftrag, Konsole, Steinkern und Relaisabschluss | **Umgesetzt und technisch geprüft**; [Nachweis](../qa/ADVENTURE_MISSION_RESULT.md) |
| **L1.6b · Kampf abstimmen** | Vergleich mit aktuellen Waffen, kürzerer Wellenablauf, angekündigter kräftigerer Faustschlag und sichtbare Erholung | **Umgesetzt**; [Nachweis](../qa/BOSS_PRESSURE_RESULT.md) |
| **L1.6c · Ortsgestaltung** | Ladestation, Reparaturplatz, Relaisversorgung und Wartungsreserve | **Umgesetzt**; [Nachweis](../qa/OUTPOST_PLACES_RESULT.md) |
| **L1.5b · Testlevel abnehmen** | Abschließende Schwierigkeit, Desktop-/Touch-Spielabnahme und Laufzeitprüfung | **Offen, nicht freigegeben**; 20–35 Min., echte Handyprüfung separat |

Die verbleibenden **20–35 Minuten** entsprechen dem kompakten Ausbau oben.
Frühere Gesamtschätzungen enthielten L1.6a–c und sind keine zusätzliche Restarbeit.
Warten auf Rückmeldung/Hosting und echte Handyprüfung kommen separat hinzu.

### L1.2 – erledigt

- [x] Ein kleiner Nahkampftyp und genau zwei feste Gegner.
- [x] Vorhandener Steinwächter mit Auftauchen und seinen bisherigen Angriffen eingebunden.
- [x] Boss nach beiden Läufern im letzten Hof aktivieren; Eingang während des Kampfes schließen.
- [x] Gemeinsame HP/Rüstung, Treffer auf bewegliche Gegner, vorhandene Waffen und Vorräte.
- [x] Sichtbares Ausholen, Treffer, Tod; Raumziele, Bossleiste, Sieg/Niederlage und Neustart.
- [x] Desktop regulär vom Spawn bis zum Sieg; Touch-Kampf, echte Niederlage und Wiederholen.
- [x] Grundriss, Treppen und Mobile-Steuerung weiterhin ohne Gegner vergleichbar geprüft.
- [ ] Persönliches Urteil zu Tempo, Lesbarkeit und Schwierigkeit auf Desktop/Handy.

Nicht mehr als Pflicht vorgesehen: Steinwerfer, sieben kleine Gegner, zweite Bossphase
und Sturmangriff. Diese Ideen sind verworfen bzw. nur bei späterem ausdrücklichem
Wunsch wieder zu planen. Die separate Arena-/Liga-Roadmap M2.4 ff. bleibt bestehen.

## L1.3 – erledigt, Gestaltung folgt

- [x] Adventure-Einstieg aus dem vorhandenen Spielmenü, kurzer Auftrag bei Ankunft.
- [x] Einmaliger Ruhepunkt mit gemeinsamer HP-/Rüstungs-/Munitionsauffüllung.
- [x] Boss-Wiederholung ab Checkpoint ohne erneute Anreise; vollständiger Neustart separat.
- [x] Sichtbar öffnendes Nordtor mit passender Kollision und begehbarem Ausgang.
- [x] Abschluss erst nach Durchgehen; Wiederholen, Spielmenü und optionale Kristallkluft.
- [x] Regulärer Desktop- und Touch-Durchlauf einschließlich Boss-Tod, Retry, Sieg und Ausgang.
- [ ] Persönliche Spielabnahme; weitere Blickfänge/Lichtgestaltung und L1.5 noch offen.

## L1.4a – erster Hof als Stilprobe erledigt

- [x] Lokal eingebundene 1K-Steinmaterialien mit Farb-, Normalen- und Rauheitskarten.
- [x] Maßstäbliche Mauerfugen, helle Steinkappen mit kleinen Fasen, dunklerer Sockel;
  beide vorhandenen Deckungen bleiben an ihren ursprünglichen Orten begehbar.
- [x] Vier Farnvarianten, drei bemooste Felsvarianten; größere Deko außerhalb der
  Umfassungsmauern, Pflanzen nur an den hinteren Deckungskanten.
- [x] Eine kleine Fackel am ersten Durchgang, Flackern und lokales warmes Licht ohne
  zusätzliche dynamische Schattenquelle.
- [x] Vorher/Nachher aus identischen seitlichen/isometrischen Vergleichskameras,
  reale Sprünge auf beide Deckungen, Desktop-Komplettkampf und mobile Wegprüfung.
- [x] Persönliche Rückmeldung: Boden auf die ganze Map übertragen, Pflanzen auch
  innerhalb der Spielfläche und geschlossene Mauerecken gewünscht.

[Ergebnis, Grenzen und Bilder](../qa/L1_4A_RESULT.md). Grundriss, Gegneranzahl,
Kampfwerte und Kollisionsdefinition blieben in L1.4a unverändert. Die anschließende
gezielte Übertragung und die neuen soliden Eckpfeiler sind unten dokumentiert.

## L1.4b – freigegebener Material-/Ecken-/Pflanzenschritt erledigt

- [x] Einheitlicher, maßstäblicher Steinboden in allen drei Höfen, beiden Verbindungen
  und am Ausgang; überlappende Bodenränder nur in der Darstellung bündig geschnitten.
- [x] Passende Materialien auf allen Mauern, Deckungen, Treppen und Terrassen;
  durchgehende Abdeckplatten statt überkreuzter Randstücke.
- [x] Kleine massive Eckpfeiler schließen sämtliche Mauerenden/-anschlüsse und
  Höhenwechsel. Ihre Geometrie und Kollision stammen aus derselben Mapdefinition.
- [x] Zusätzliche Farngruppen innerhalb jedes Hofs und an Deckungen, frei von
  Waffen-/Vorratsorten, Treppenaufgängen und dem zentralen Siegelkreis.
- [x] Neun Kameraaufnahmen, Sprünge auf beide Einstiegsdeckungen, kompletter Weg
  über Terrassen/Treppen, Desktop-Komplettkampf und mobile Bedienung geprüft.
- [ ] Persönliche Sichtung des übertragenen Looks.
- [ ] Weitere hofeigene Blickfänge/Ruinenteile und zusätzliche Lichtgestaltung.
  Dieser Rest war nicht Teil des konkreten Boden-/Pflanzen-/Eckenauftrags.

[Bilder und technische Prüfung](../qa/L1_4B_MATERIALS_RESULT.md). Keine weiteren
Gegner, Waffen oder Balanceänderungen. L1.5 wird damit nicht vorweggenommen.

## Gestaltung: verwitterter Garten einer alten Wächteranlage

### Kostenlose Ausstattung umgesetzt, 29. Oktober

- [x] AssetQuest-Demo: Birken, Brombeerbüsche, Farne, Gras, Waldmeister, zwei
  Pilzgruppen und Baumstumpf. Kleine Gruppen auch innerhalb der Höfe; höhere Bäume
  auf den bestehenden äußeren Erdstreifen, mit freier Sicht auf Treppen und Gegner.
- [x] Retro-Tech-Demo: zwei Konsolentypen auf vier niedrigen Stationen mit passender
  Kollision und Statuslichtern; Ankunft, innerer Hof und zweimal am Boss-Ausgang.
- [x] Ausschließlich kostenlose Downloadbeispiele; kein Kauf der Vollpakete.
- [x] Identische Vergleichskameras, vollständiger Desktopkampf, Sprünge, alle
  Vorratswege und Touch im Browser geprüft. [Ergebnis](../qa/FREE_DECORATION_RESULT.md).
- [ ] Persönliche Sichtung; keine neuen Quest-/Interaktionspflichten an den Konsolen.

### Zusätzlich freigegeben: Figur und Pickup-Präsentation, 29. Oktober

- [x] Kostenlose KayKit-Mannequin-Grundlage samt passenden Animationen eingebunden;
  großes Gesicht/Kopf, kurzer Körper und vorhandene Bewegungs-/Waffensteuerung.
- [x] Lauf/Sprint, Sprung, Landestauchung, Waffenhaltung, Schuss, Treffer und Tod;
  Bewegung und Zielrichtung werden bei der Darstellung getrennt berücksichtigt.
- [x] Schwarze Pickup-Sockel durch unterbrochene Leuchtringe und aufsteigende
  Partikel ersetzt; Aufnahmeimpuls und Verschwinden verbrauchter Adventure-Items.
- [x] Desktop-/Touch-Spielabläufe und Darstellungszustände im Browser geprüft.
- [x] KayKit-Skelett für beide Steinläufer mit eigener Steinoptik und Nahkampfanimationen wiederverwendet.
- [x] Vorgeschlagene Bossabstimmung umgesetzt; aktive Desktop-/Touch-Kämpfe geprüft.
- [x] Rückmeldung zur Lesbarkeit: kühler blaugrauer Stein und helle Kanten ersetzen die Boden-Farbzeichnung auf den Gegnern.
- [x] Eigener Spieler als erste Ruinenkurier-Variante: flacherer/breiterer Kopf,
  kompakter Körper, kräftigere Stiefel, Elfenbein/Korallorange/Graphit. Animationen,
  Kampf/Retry und Touch im Browser geprüft. [Aufnahmen](../qa/PLAYER_COURIER_RESULT.md).
- [ ] Persönliches Urteil zur Figur und ihren Bewegungen.
- [x] Nachbesserung zur Nutzerrückmeldung: aufaddierte Hüft-/Brustdrehung beim
  Gehen behoben; eigener Browser-Regressionsfall für acht Laufrichtungen und Pause.

[Quelle, Aufnahmen und Prüfung](../qa/KAYKIT_PRESENTATION_RESULT.md). Dieser kleine
Präsentationsschritt ersetzt nicht die abschließende Kampf-/Leistungsabnahme L1.5.

Stilisierte, ausgearbeitete 3D-Ruine mit warmgrauem Stein, gedecktem Grün und wenigen
bernsteinfarbenen Lichtquellen. Die großen Räume und klaren Laufwege bleiben bestehen.
Der aktuelle Grundriss wird gestaltet, nicht erneut verengt oder mit Zufallsdeko gefüllt.

| Bereich | Geplante Verbesserung | Lesbarkeit |
| --- | --- | --- |
| Boden | Weniger dominante Fugen, gebrochene Steinplatten, leichte Farb-/Rauheitswechsel, abgenutzter Hauptweg; Moos nur in Fugen und geschützten Randzonen | Ruhige Kampfflächen; keine schwebenden Farbflächen oder konkurrierenden Bodenwarnungen |
| Wände/Plateaus | Eigene vertikale Steinstruktur, große erkennbare Quader, kleine abgeschrägte Kanten, wenige Ausbrüche, Sockel mit Kontaktschatten | Helle Oberseite, klar abgesetzte Wand und sichtbarer Bodenkontakt; Sprungkante bleibt durchgehend |
| Pflanzen | Ausgearbeitete Farn-, Gras-, Efeu- und Buschformen in kleinen Gruppen; unterschiedliche Größen und dezente Bewegung | Ursprung sitzt in Erde/Fugen, Efeu folgt der Wand; Landeflächen und Gegner bleiben sichtbar |
| Felsen/Ruinen | Zwei bis drei passende Felsformen, einzelne Bruchsteinhaufen und ein gebrochener Pfeiler | Felsen in Boden einbetten; große Hindernisse bekommen passende Kollision, Kleindeko sitzt abseits der Route |
| Licht/Fackeln | Lesbares Tages-/Umgebungslicht, warme Fackeln oder Feuerschalen an Durchgängen, leichter Flammeneffekt, sparsame Glut | Kein dunkler Gesamtfilter; wenige lokale Lichtquellen, keine dynamischen Schatten für jede Fackel |
| Übergänge/Umgebung | Erde am Mauersockel, wurzelnde Pflanzen, Steinbruch an beschädigten Wänden, Felsen und Grün außerhalb der niedrigen Umfassung | Dekoration verbindet die Flächen; Umgebung verdeckt keine Spielfläche |

Die Grafik soll aus einem abgestimmten Satz von etwa 8–12 wiederverwendbaren Bauteilen
entstehen. Für Pflanzen und markante Felsen sind ausgearbeitete 3D-Modelle vorgesehen;
für Boden/Wände ein kleines zusammenpassendes Materialset mit Farb-, Relief- und
Rauheitsinformationen. Auswahl und Aufbereitung erfolgen zunächst nur für den Probehof.
Bestehende Three/Rapier-Basis reicht dafür aus; kein Enginewechsel erforderlich.

Für L1.4a wurden vier [Poly-Haven-Assets](../../public/assets/courtyard/CREDITS.md)
unter CC0 lokal eingebunden: Rock Tile Floor, Stone Wall 02, Fern 02 und Rock Moss
Set 01. 1K-Texturen, insgesamt rund 7,5 MiB; Farne mit expliziter Blattmaske.
Farbgebung, Reliefstärke und Platzierung sind im Renderer an die Spielansicht
angepasst. Größere Pflanzenvielfalt, Ruinenteile und weitere Lichtpunkte folgen
erst im freigegebenen Gestaltungspaket.

### Drei Höfe mit erkennbarer Identität

- **Ankunft/Ruinenhof:** teilweise überwachsen, Rest eines Torbogens außerhalb des
  Laufwegs, stillgelegter Wachplatz bei der Pulse-Waffe. Der Blick führt zum Durchgang.
- **Innerer Hof:** offener ehemaliger Garten mit einem trockenen Brunnen/Becken als
  Randmotiv; Vorratsterrasse als sichtbarer Entdeckungsort. Keine zusätzliche Raumwand.
- **Wächterhof:** strenger, älter und monumentaler; vorhandener Siegelkreis, zwei
  Feuerschalen am Zugang, beschädigte Säulen am Rand und klar erkennbares Nordtor.

Diese Blickfänge ersetzen oder gestalten passende Randbauteile; sie werden nicht in
die freien Kampfflächen oder auf die vorgesehenen Sprung-/Landestellen gesetzt.

## Wann das erste hochwertige Testlevel fertig ist

- Einstieg aus dem Spielmenü, kurzer Auftrag, zwei kleine Gegner, Waffenfund und optionaler
  Vorratsabstecher führen verständlich zum vorhandenen Boss.
- Ein Sitzungs-Checkpoint spart nach einem Boss-Tod die komplette Anreise; ein
  vollständiger Neustart bleibt möglich. Speichern über Browserneustart ist nicht nötig.
- Nach Sieg öffnet das echte Nordtor; Durchgehen schließt das Level nachvollziehbar ab.
  Die alte Kristallkluft ist danach nur ein optionaler Weiter-Link.
- Boden, Wände, Plateaus und Dekoration wirken zusammengehörig und fest verankert.
  Gegner, Warnflächen, Pickups und Sprungkanten sind in normaler Spielansicht erkennbar.
- Bossangriffe verlangen nachvollziehbare Reaktion; Ausweichen funktioniert. Keine
  zusätzlichen Gegnertypen oder Bossphasen als Voraussetzung.
- Regulärer Sieg, Tod vor/nach Checkpoint, Restart und Ausgang werden mit echten
  Browser-Eingaben geprüft. Desktop bleibt Qualitätsziel; Touch im Querformat spielbar.
- Leistung nach dem Dekopaket messen: Ziel stabile 60 FPS auf dem Testdesktop,
  mindestens 30 FPS auf einem benannten Testhandy. Diese Werte sind Zielwerte, bisher
  kein Gerätenachweis. Sichtbare Ruckler und Ladeprobleme gehören zur Abnahme.
- Persönliche Sicht-/Spielabnahme separat dokumentieren; ein bestandener automatischer
  Durchlauf allein bestätigt keine hochwertige Gestaltung oder gute Schwierigkeit.

## Technische Basis und Prüfung

`AdventureFight` koordiniert zwei `StoneRunner` und den vorhandenen `PveEncounter`.
Letzterer bleibt die einzige Zuständigkeit für HP/Rüstung; sein Bossablauf kann bis zur
Ankunft ruhen. Bestehende PvE-Aufrufer laufen unverändert aktiv an.
`Combat`, Rapier, Pickups und Desktop-/Touch-Eingabe werden gemeinsam verwendet.
Die gerichteten Gegnerbewegungen verwenden die vorhandene Hof-Navigation und echte
Shape-/Raycasts. Darstellung und Collider des Bosszugangs wechseln zusammen.
Ein allgemeines Quest-, Gruppen- oder Save-Framework ist dafür nicht nötig.

Reguläre Browser-Eingaben prüfen den vollständigen Desktopkampf, Touch-Angriff,
Tod/Wiederholen sowie die begehbaren Flächen. Tests setzen weder HP noch Munition
oder Positionen, um einen Sieg zu erzwingen. Kernprüfungen sichern Ausholen, einmaligen
Schaden, Abstand/Höhe/Deckung, gemeinsamen Lebenszustand und Reset.
Browser-Touch-Emulation ersetzt keinen Test auf einem echten Smartphone.

CTF-3.0 bleibt unverändert. Weitere Level, neue Waffen, Inventar-/Skillbaum, dauerhaftes
Speichern und zusätzliche Bossmechaniken gehören nicht zu dieser Fassung.
