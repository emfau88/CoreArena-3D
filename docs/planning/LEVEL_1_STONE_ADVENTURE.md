# Level 1: Der verwitterte Hof

Stand: 29. Oktober 2026. **L1.1, das verkleinerte L1.2, L1.3 und L1.4a umgesetzt und technisch
geprüft.** Der Nutzer hat den Gegnerumfang ausdrücklich reduziert:
**zwei kleine Nahkämpfer und der bereits vorhandene Steinwächter**.
Der frühere Plan mit sieben kleinen Gegnern, Steinwerfer und zusätzlichen Bossphasen
ist damit überholt. Aktuelles Nutzerziel: **ein vollständig spielbares, hochwertig
ausgearbeitetes erstes Testlevel**. Dafür werden Abschluss, Gestaltung und Spielabnahme
als konkrete Pakete eingeplant. Mit „ok go“ wurde anschließend L1.3 freigegeben und
umgesetzt. Anschließend wurde L1.4a mit gewünschten Vorher/Nachher-Bildern freigegeben
und umgesetzt. Nach der Rückmeldung wurde der Material-/Ecken-/Pflanzenschritt von
L1.4b freigegeben und umgesetzt: Boden auf der ganzen Map, Pflanzen auch innen,
saubere Maueranschlüsse. Weitere Blickfänge/Lichtgestaltung und L1.5 bleiben offen.
Der zusätzlich freigegebene KayKit-/Pickup-Schritt vom 29. Oktober ist ebenfalls
umgesetzt: geriggte Figur mit Animationen und Energie-Pickups statt schwarzer Sockel.

[Spielen](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1)
· [Ohne Gegner erkunden](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1&explore=1)
· [Aktuelle L1.3-Prüfung und Spielaufnahmen](../qa/L1_3_RESULT.md)
· [L1.4a: Vergleichsbilder und Prüfung](../qa/L1_4A_RESULT.md)
· [L1.4b: Materialien auf der ganzen Map](../qa/L1_4B_MATERIALS_RESULT.md)

## Rahmen und Richtung

Drei große offene Höfe, zusammen etwa 36 × 80 Spielmeter: Ankunft/Ruinenhof
32 × 22 m, innerer Hof 36 × 24 m, Wächterhof 36 × 26 m. Kurze, gerade, 10 m
breite Verbindungen, niedrige Mauern und ein freier Hauptweg. A–H bezeichnen Orte
innerhalb dieser Höfe, keine acht Räume. Die frühere enge
[Map-Skizze](../concepts/level-1-layout-v1/README.md) bleibt verworfen.

Die vorhandene stilisierte Grafik, Waffen, Pickups und Steuerung bleiben die Basis.
Standardblick von links nach rechts; V/Ansicht wechselt auf gerade oder isometrische
Kamera. Mobile: 15 % größere Darstellung, leichter Kameravorlauf und kompaktes Menü.
Die gemeinsame Adventure-Sprungkurve für Desktop/Touch landet auf gleicher Ebene
nach ca. 0,72 s bei ca. 2,15 m Höhe; Treppen und Plateaus bleiben erreichbar.

Geschichte: Zwei Steinläufer halten das Siegel der Höfe. Hinter ihnen bewacht der
Steinwächter den Weg zur Kristallkluft. Erst beide Läufer besiegen, dann den letzten
Hof betreten und den Wächter wecken. Kurze Ziele im HUD begleiten diesen Ablauf.

## Spielbarer Ablauf und Fundorte

Koordinaten als (X; Z), Norden = negatives Z. Grundriss und Vorräte stammen aus L1.1.

| Ort | Gegner | Waffen/Vorräte | Ablauf |
| --- | --- | --- | --- |
| A · Ankunft, (0; 33) | Keine | Arc Lash, 100 HP, 50 Rüstung | Sicherer Start im ersten Hof. |
| B · Ruinenhof | **Ein Steinläufer bei (2; 24)** | Keine Pflichtaufnahme | Er nähert sich beim Betreten des Hofs. Rückzug zum Start möglich. |
| C · Waffenfund, (-3; 18,5) | Keine | Pulse Repeater mit 54 Schuss | Sichtbar am Hauptweg vor dem breiten Durchgang. |
| D · Seitenterrasse, optional | **Keine zusätzlichen Gegner** | Medkit +35 bei (-13,5; 4), Rüstung +30 bei (-13,5; 0), Munition +27 bei (-9; -0,4) | Breite Treppe zur 1,1 m hohen Terrasse. Vorräte mitnehmen und nach E zurückkehren. |
| E · Innerer Hof | **Ein Steinläufer bei (2; -1)** | Munition +27 bei (11; 6,5) | Viel Platz zum Ausweichen. Der ehemalige Werfersockel bleibt eine freie erhöhte Fläche. |
| F · Siegelplatz, (0; -14) | Keine | Einmalig 100 HP, mindestens 50 Rüstung, Pulse mit 54 Schuss | Nach beiden Läufern wird der Sitzungs-Checkpoint gesichert. Bereits gesammelte Rüstung über 50 bleibt erhalten. Zurücklaufen füllt nicht erneut auf. |
| G · Wächterhof, (0; -29) | **Der vorhandene Steinwächter** | Munition +18 bei (-13; -37) und (13; -20); Medkit +35 auf Plateau bei (-12; -23) | Nach beiden Läufern löst das Betreten hinter Z = -20,5 das Auftauchen aus. Eingang schließt während des Kampfes. |
| H · Nordtor, Z = -42 | Keine | Keine | Nach Sieg schieben sich beide Torhälften auf. Durchgehen und hinter Z = -45 ankommen beendet das Level. Danach Wiederholen, Spielmenü oder optional die bisherige Kristallkluft wählen. |

Hauptweg **A → B → C → E → F → G**; optional **E → D → E**.
Gesamt **zwei kleine Gegner plus ein Boss**, feste Positionen, keine Zufallsspawns,
Wellen oder zusätzlichen Bossgegner. Die beiden Läufer bleiben in ihren eigenen
Höfen; wer zurückweicht, zieht keine Gegnergruppe durch das ganze Level hinterher.

## Der kleine Gegner

Ein einziger Typ: **Steinläufer**, aus kleinen kantigen Steinformen, mit Armen,
Beinen, leuchtendem Kern und einer kurzen HP-Leiste. Sichtbar kleiner als der Boss.

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
Während des Auftauchens ist der Boss noch nicht angreifbar. Der ruhende Steinkörper
weicht beim Erwachen dem beweglichen Boss; der Eingang bekommt sichtbar echte Kollision.

HP/Rüstung gehören zu einem gemeinsamen Zustand. Vorräte helfen unterwegs, Arc bleibt
unbegrenzt. Der einmalige Ruhepunkt vor dem Boss füllt Leben, Mindestrüstung und Pulse
auf. Vor diesem Punkt startet Tod das Level neu; danach bringt „Am Ruhepunkt versuchen“
den Spieler mit 100 HP, 50 Rüstung und 54 Pulse-Schuss zum Siegelplatz zurück. Der Boss
und seine drei Vorräte werden zurückgesetzt, die besiegten Läufer und verbrauchten
Anreise-Vorräte bleiben erhalten. „Level neu starten“ setzt dagegen immer alles zurück.
Der Checkpoint gilt nur für die laufende Sitzung; Reload oder Spielmenü verlassen ihn.

Beim Boss-Sieg bleiben Bewegung und Kamera aktiv. Das Nordtor öffnet sichtbar und
physisch; erst tatsächliches Durchgehen schließt das Level ab. Die bisherige Kristallkluft
steht danach als optionaler Button bereit und beginnt mit ihrer eigenen Ausrüstung.

**Balance bleibt vorläufig:** Der frühere L1.2-Browserdurchlauf gewann mit 36 HP
und ohne Rüstung. Stehendes, präzises Dauerfeuer konnte den Boss noch besiegen.
Das belegt den funktionierenden Ablauf, keine fertige Herausforderung. Zusätzliche
Bossphasen oder pauschal mehr Gegner sind nicht Teil dieses Auftrags.

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
| **L1.4b · Drei Höfe gestalten** | Materialien überall übernehmen, Innenpflanzen und saubere Mauerecken; weitere Blickfänge/Lichtgestaltung separat | **Material-/Ecken-/Pflanzenschritt erledigt**; weitere Blickfänge/Licht noch offen, ggf. 30–60 Min. |
| **L1.5 · Kampf und Testlevel abnehmen** | Bestehende Angriffe abstimmen, sinnvolles Ausweichen, Treffer-/Tod-/Siegfeedback, kompletter Desktop-/Touch-Durchlauf und Laufzeitprüfung | **Geplant, nicht umgesetzt**; 30–60 Min. |

Die Spannen enthalten gezielte Tests, Roadmap und Commit/Push. Als Planungsrahmen
für die übrige Gestaltung in L1.4b und L1.5 **rund 1–2 Stunden aktive Agent-Arbeit**, keine menschlichen
Arbeitstage und keine Qualitäts-/Liefergarantie. Stilprobe und Rückmeldung entscheiden
über die tatsächliche Gestaltung; Warten auf Rückmeldung/Hosting kommt hinzu.
Die frühere Restschätzung von 1–2 Stunden galt nur für Abschluss und einfache Balance,
nicht für die jetzt zusätzlich gewünschte Material-, Modell- und Lichtüberarbeitung.

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

### Zusätzlich freigegeben: Figur und Pickup-Präsentation, 29. Oktober

- [x] Kostenlose KayKit-Mannequin-Grundlage samt passenden Animationen eingebunden;
  großes Gesicht/Kopf, kurzer Körper und vorhandene Bewegungs-/Waffensteuerung.
- [x] Lauf/Sprint, Sprung, Landestauchung, Waffenhaltung, Schuss, Treffer und Tod;
  Bewegung und Zielrichtung werden bei der Darstellung getrennt berücksichtigt.
- [x] Schwarze Pickup-Sockel durch unterbrochene Leuchtringe und aufsteigende
  Partikel ersetzt; Aufnahmeimpuls und Verschwinden verbrauchter Adventure-Items.
- [x] Desktop-/Touch-Spielabläufe und Darstellungszustände im Browser geprüft.
- [ ] Persönliches Urteil zur Figur und ihren Bewegungen.

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
