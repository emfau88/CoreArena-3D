# Roadmap für den isolierten Adventure Umgebungstest

Stand: **4. November 2026** · [Adventure-Roadmap](ADVENTURE_ROADMAP.md) · [Produktvision](ADVENTURE_VISION.md)

**Ziel:** Am vorhandenen Ladehof erproben, wie stark eine ausgearbeitete Umgebung,
ruhigere Bodenflächen und erkennbare Architektur das Adventure verbessern.
Die bestehende Perspektive, Kameranachführung und Links-nach-rechts-Führung bleiben
erhalten. Die Varianten zeigen dieselbe spielbare Mission.

**Aktueller Stand: U0 bis U4 umgesetzt; U5 geprüft, Leistungsfreigabe offen.**
Der beauftragte Versuch liegt im eigenen Worktree und Branch
`codex/adventure-environment-test`. [Ergebnisse und Vergleich](../qa/ADVENTURE_ENVIRONMENT_TEST_RESULT.md).
Der Vergleich ist spielbar. Das relative Framezeitbudget von +2 ms wird in
einzelnen Paaren noch überschritten; U5 ist deshalb nicht vollständig abgenommen.
**U6, Rückmeldung vom 5. November 2026.** Die ursprünglichen Texturen von A
gefallen besser. B wirkt zu stark vereinfacht. Der Hintergrund soll mehr Raumtiefe
bekommen. Variante C erprobt deshalb einen verwitterten Außenhof hinter dem
Originalhof. In C wirkte das rechteckige Beet mit seiner Reihe aus Steinen und
Pflanzen aufgesetzt. D prüft am Ladehof eine modellierte Felsböschung, eine
trockene Geröllrinne und einen Warnhinweis an der überspringbaren Außenmauer.
E verbindet die linke Ecke des Hofs mit dem Hang. Eine Stützmauer reicht bis
zu einem Pfeiler im Fels. Die Geröllrinne führt von dort durch den mittleren
Bogen. Der Vergleich D/E dokumentiert diese Ecke. Variante F erprobt mit der
Wächterklamm eine durchgehende 3D-Umgebung vom Ladehof bis zum Nordtor.
[Spielbilder und Messwerte zu F](../qa/ADVENTURE_ENVIRONMENT_TEST_RESULT.md#f--wächterklamm).

Diese Roadmap ist die Aufgabenquelle für den begrenzten Umgebungstest. Die
26 Pakete und sechs Gates der Hauptroadmap bleiben unverändert; insbesondere
ersetzt der Versuch weder A7.2 noch die offenen Entscheidungen G2/G3.

## Umfang und feste Vorgaben

Der Test gestaltet den **Ladehof einschließlich Außenraum und sichtbarem Übergang
zum Wartungshof**. Wartungs- und Wächterhof behalten ihre bisherige Gestaltung;
die vollständige Mission bleibt durchspielbar. Damit lassen sich Kamera,
Materialtrennung, Missionszustände und Rückkehr in bereits besuchte Bereiche prüfen.

| Festgelegt | Konsequenz für den Versuch |
|---|---|
| Bestehende Kamera und Links-nach-rechts-Ausrichtung | Keine Änderung an Blickwinkel, Projektion, Zoomregeln, Nachführung oder Steuerung |
| Gleicher Grundriss und gleiche Physik | Keine neuen Laufwege, Hindernisse, Sprungziele, Deckungen oder Kollisionsmaße |
| Gleiche Kampf- und Missionsregeln | Gleiche Gegner, Waffen, Werte, Fundstellen, Interaktionen, Checkpoints und Abschlussbedingungen |
| Vorhandene breite, offene Höfe | Die Kampfmitte bleibt frei; prägende große Formen stehen überwiegend am kamerafernen Rand |
| Abgeschlossener Testumfang | Keine Neugestaltung aller drei Höfe, neue Bosskarte, Ökonomie oder dauerhafte Progression |
| Lokaler, isolierter Versuch | Keine Veröffentlichung, kein Merge und keine Änderung am öffentlichen T2-Kanal als Teil dieses Plans |

Kulissen dürfen keine scheinbar begehbaren Plattformen oder massiven Hindernisse
im erreichbaren Raum vortäuschen. Die niedrigen Mauern allein gelten nicht als
Beweis für Unerreichbarkeit: Dash, Sprung und Doppelsprung sind mitzuprüfen.
Wenn eine Gestaltung neue Physik benötigt, wird sie für diesen Versuch vereinfacht
oder an eine andere Stelle gesetzt.

## Gestaltungsziel aus der bestehenden Spielkamera

Der Ladehof soll als verlassene Versorgungseinheit eines überwucherten
Technikaußenpostens erkennbar werden. Sein Zustand verändert sich durch die
bereits vorhandenen Missionsschritte. Drei Gestaltungsebenen tragen das Bild:

| Ebene | Konkreter Inhalt | Grenze |
|---|---|---|
| Spielbarer Hof | Ruhigere Steinflächen, eingelassene Ladefelder, ausgearbeitete Oberseiten der vorhandenen Ausstattung | Keine verdeckten Warnungen, Interaktionspunkte oder Kanten |
| Naher Außenraum | Zusammenhängender Boden, Fundamente, beschädigte Wandfelder, gebündelte Vegetation | Keine neuen scheinbaren Wege oder erreichbaren Scheinhindernisse |
| Hintere Kulisse | Ein markanter Ladeträger oder Versorgungsturm, wenige größere Ruinen- und Technikformen | Muss aus der festen Kamera funktionieren; kein Ausbau einer unbegehbaren ganzen Stadt |

Ein eigener kleiner Baukasten liefert Wandfeld, Stütze, beschädigtes Segment,
Sockel, Technikverkleidung, Leitungssegment und Bodenrand. Das prägende Ladeobjekt
ergänzt diese Teile. Die sichtbaren Oberseiten und Silhouetten haben Vorrang vor
kleinen Details an verdeckten Fronten.

Bestehende Poly-Haven-, AssetQuest-, Retro-Tech- und Hexwars-Assets werden gezielt
weiterverwendet. Neue Modelle sind nur vorgesehen, wenn der vorhandene Bestand
das prägende Objekt oder ein benötigtes Bauteil nicht überzeugend abdeckt.
Jeder neue Bestandteil erhält einen Herkunftsvermerk; keine Übernahme fremder
10GAG-Modelle, Texturen oder Quelltextteile.

Aus Rooftop Rampage werden die **Prinzipien** einer gestaffelten Umgebung,
großer Orientierungspunkte, freigehaltener Zugänge, gemeinsam genutzter
Materialien und gezielter Kontrastführung abgeleitet. Diese Funktionen sind im
[öffentlichen Client](https://www.10gag.lol/rooftop-rampage) unter anderem in
`buildStreets`, `buildBuilding`, `buildTextures` und `brightenRoofs` erkennbar.
Die Idee sichtbaren Fortschritts aus dem Farmvergleich wird als eigener
Gestaltungsvorschlag auf die bestehende Missionsreaktivierung übertragen.
Serverlogik, interne Autorenwerkzeuge und die Wirkung auf unseren Geräten
werden daraus nicht abgeleitet.

## Isolation und Vergleich

**Planungsbasis:** lokaler Branch `codex/adventure-combat-prototype`, Commit
`2912461f86e0ef76010dafb05f336a7917e37605`. Beim Beginn von U0 den aktuellen Stand
erneut prüfen und den tatsächlich verwendeten Ausgangscommit im Ergebnisbericht
festhalten. Bestehende Nutzeränderungen bleiben erhalten.

Für Codearbeit wird ein separater Branch **`codex/adventure-environment-test`**
in einem eigenen Worktree angelegt. Die bestehende
[Pages-Pipeline](../../.github/workflows/pages.yml) baut die öffentliche T2-Vorschau
aus `codex/adventure-combat-prototype`; deshalb reicht ein URL-Schalter auf diesem
Branch als Isolation nicht aus.

Die folgenden Namen und Einstiege sind **implementiert**:

| Teil | Umsetzung |
|---|---|
| Eigener Build | Vite-Modus `environment-test`, Ausgabe `dist-environment-test` |
| Lokaler Start | Eigene Skripte `dev:environment-test` (8750), `build:environment-test`, `preview:environment-test` (8751) |
| Referenz A | `?mode=pve&level=stone&adventure=1&combat=prototype&environment=reference` |
| Versuch B | `?mode=pve&level=stone&adventure=1&combat=prototype&environment=outpost-test` |
| Aktivierungsgrenze | B nur im Modus `environment-test`, für die vollständige Stein-Adventure-Mission mit Prototypkampf; keine Erkundungs- oder Bosslabor-Variante |
| Sicherer Standard | Fehlender, ungültiger oder im falschen Build verwendeter Umgebungsschalter verändert die bisherige Darstellung nicht |
| Vergleich | A/B-Wechsel startet die Mission neu; keine Übertragung laufender Spielsitzungen oder verdeckten Zustandsänderungen |
| Speicherung | Auswahl ausschließlich im URL-Einstieg; keine neue Speicherung und keine Änderung bestehender Speicherkennungen |

`build`, `build:test` und `build:adventure-preview` behalten ihr bisheriges
Verhalten. Selbst ein expliziter B-Parameter darf dort den Versuch nicht laden.
Der neue Modus erlaubt den bestehenden Prototypkampf ausdrücklich, ohne dabei
das Bosslabor oder schreibende Diagnosezugänge allgemein freizuschalten.

Der Einstieg wählt die Darstellung einmalig aus. Der Versuch verwendet dieselbe
Simulation und erhält Missionszustände nur lesend. Ein kleiner Kompositionspunkt
in `adventureGame.ts` ist einer Kopie der kompletten Spielschleife vorzuziehen.
Das neue Umgebungsmodul wird nur für B geladen.

Materialien werden für die Testdarstellung getrennt angelegt. Gemeinsam geladene
Texturen dürfen nur unverändert geteilt werden; Änderungen an Wiederholung,
Farbwerten, Filtern oder anderen Texturparametern benötigen eigene Instanzen.
Das ist besonders wichtig, weil Bodenmaterialien auch außerhalb des Ladehofs
und bei Kampffiguren verwendet werden. Geometrieaufteilung und Materialersetzung
dürfen in A keine sichtbaren Änderungen verursachen.

Neue ausschließlich experimentelle Assets liegen außerhalb des automatisch
kopierten `public/`-Bestands, beispielsweise unter
`src/experiments/adventureEnvironment/assets/`, und werden über den Versuch importiert.
Normale Builds dürfen weder das neue Modul noch seine zusätzlichen Assets ausliefern.
Der gewählte Ort unter `src/` bleibt außerdem von der vorhandenen Build-Hash-Erfassung
in `vite.config.ts` erfasst. Es werden nur tatsächlich benötigte Dateien angelegt.

## Bulks und Reihenfolge

Die Reihenfolge lautet **U0 → U1 → U2 → U3 → U4 → U5 → U6**.
Technischer Abschluss und persönliche Bewertung werden getrennt dokumentiert.

| Bulk | Ergebnis | Abhängigkeit | Relativer Aufwand |
|---|---|---|---|
| U0 | Isolierter Einstieg und belastbare Referenz | Geprüfter Ausgangsstand | Mittel |
| U1 | Raumkomposition mit einfachen großen Formen | U0 | Mittel, gestalterisch iterativ |
| U2 | Materialpalette und kleiner Architektur-Baukasten | U1 | Mittel |
| U3 | Vollständig ausgearbeiteter Ladehof und Außenraum | U2 | Hoch, größter Gestaltungsanteil |
| U4 | Sichtbare Zustände und sparsame Bewegung | U3 | Mittel |
| U5 | Vergleich, Regressionsprüfung und Leistungsnachweis | U4 | Mittel, Nacharbeit nach Befund |
| U6 | Persönlicher Spielvergleich und dokumentierte Entscheidung | U5 | Bewertung; keine automatische Übernahme |

### U0 Isolation und Referenz

**Ergebnis:** Zwei eindeutig beschriftete lokale Testeinstiege; A und B sehen
zunächst identisch aus und verwenden dieselben Regeln.

- [x] Ausgangscommit und Arbeitsbaum prüfen; separaten Branch und Worktree anlegen.
- [x] Eigene Build-Ausgabe und Einstiegsgrenze einrichten; Standardkanäle ausschließen.
- [x] Kleine Schnittstelle für Aufbau, lesendes Zustandsupdate und Ressourcenfreigabe vorsehen.
- [x] Kamerapositionen, Spielerpositionen, Auflösung, DPR, Tages-/Animationszustand und feste Dekorationsvariante für Vergleichsaufnahmen dokumentieren.
- [x] Referenzbilder und Lade-/Frame-/Ressourcenmessungen auf dem ausgewählten Gerät aufnehmen.
- [x] Produktions-, Test- und T2-Preview-Build mit B-Parameter auf unveränderten Einstieg und ausbleibende Test-Asset-Anfragen prüfen.

**Betroffen:** `package.json`, `vite.config.ts`, `src/main.ts`,
`src/app/adventureVariant.ts`, der Kompositionspunkt in `src/app/adventureGame.ts`;
bei Bedarf ein kleines neues Modul unter `src/experiments/adventureEnvironment/`.

**Abnahme:** Referenz A entspricht dem eingefrorenen Ausgangsstand. Im Testmodus
funktionieren beide Einstiege; in allen anderen Modi bleibt B wirkungslos.
Ein Verzeichnisvergleich der Build-Artefakte bestätigt die Assettrennung.
Ergebnisnachweis unter `docs/qa/ADVENTURE_ENVIRONMENT_TEST_RESULT.md` beginnen.

### U1 Raumkomposition und Sichtbarkeit

**Ergebnis:** Der Hof besitzt bereits mit einfachen Formen einen erkennbaren
Außenraum und ein prägendes Ladeobjekt. Detailproduktion beginnt erst nach dieser Probe.

- [x] Hintere, mittlere und vordere Bildebene aus der unveränderten Spielkamera platzieren.
- [x] Zwei einfache Anordnungen des Ladeobjekts vergleichen und die überzeugendere wählen; keine zweite fertige Stilvariante ausbauen.
- [x] Unerreichbare Kulissenpositionen und freizuhaltende Kampf-, Interaktions- und Bewegungsbereiche markieren.
- [x] Boden, Rand und Übergang so anschließen, dass keine schwebenden Fundamente oder sichtbaren Lücken entstehen.
- [x] Blick vom Start, beiden Hofrändern, der Drohne und dem Ausgang prüfen; Sprung, Doppelsprung, Nahkampf und kleine Bildschirmbreite einschließen.

**Betroffen:** Neues Umgebungsmodul und seine Platzierungsdaten. `camera.ts`,
`stoneAdventure.ts` und Physikdefinitionen bleiben Referenz, keine Gestaltungswerkzeuge.

**Abnahme:** Das Ladeobjekt ist auch in kleiner Darstellung erkennbar. Spieler,
Gegner, Interaktionen und Landeflächen bleiben sichtbar. Alle begehbaren Flächen
und massiven Hindernisse stimmen weiterhin mit der bisherigen Kollision überein.
Eine Zwischenansicht dokumentiert die gewählte Komposition. Bei beauftragtem
Gesamtabschnitt U0–U5 ist sie kein zusätzlicher Freigabestopp.

### U2 Materialien und Architektur-Baukasten

**Ergebnis:** Ein zusammenpassendes Set einfacher Bauteile und ruhiger Oberflächen.

- [x] Stein, dunkle Technik, helle Abdeckungen und begrenzte Akzente auf bestehende Figur und Vegetation abstimmen.
- [x] Wandfeld, Stütze, Bruchsegment, Sockel, Verkleidung, Leitung und Bodenrand mit einheitlichen Anschlüssen erproben.
- [x] Boden in größere ruhige Flächen und Ladefelder gliedern; vorhandene Weltmaß-UVs und die Höhenlesbarkeit erhalten.
- [x] Große Oberseiten und Silhouetten vor Kleindetails ausarbeiten; Varianten über Proportionen und Materialverteilung erzeugen.
- [x] Materialbesitz und Entsorgung festlegen; weder Referenzmaterialien noch Wächter-/Wartungshofdarstellung verändern.

**Betroffen:** Versuchsmodule; minimaler Erweiterungspunkt in
`src/render/courtyardLook.ts`, falls für den getrennten Aufbau erforderlich.

**Abnahme:** A bleibt unverändert. B verbessert die Unterscheidung von Boden,
Kanten und Ausstattung; durchgehende Fugen und Übergänge bleiben stimmig.
Es gibt keine übereinandergelegten Bodenflächen mit Flimmern und keine
versehentlich angepassten Materialien außerhalb des Testbereichs.

### U3 Ladehof und Außenraum fertig gestalten

**Ergebnis:** Ein vollständig gestalteter Testausschnitt mit erkennbarem Zweck.

- [x] Gewähltes Ladeobjekt fertigstellen und in Fundamente, Versorgung und vorhandene Ladebuchten einbinden.
- [x] Bestehende Ladestation, Fracht und Waffenausgabe zu lesbaren Gruppen zusammenführen; ihre physischen Standorte und Maße erhalten.
- [x] Außenboden, Wandreste, Technikformen und Vegetation zu zusammenhängenden Randbereichen ausarbeiten.
- [x] Bewuchs und Abnutzung an Fugen, Rändern und beschädigten Stellen konzentrieren; freie Hofmitte bewahren.
- [x] Sichtbaren Übergang zum unveränderten Wartungshof sauber abschließen.
- [x] Herkunft und tatsächliche Verwendung aller neuen Assets dokumentieren; ungenutzte Testimporte nicht mitliefern.

**Betroffen:** Versuchsmodule und gegebenenfalls experimentelle Assetdateien;
gezielte Integration der bestehenden `courtyardDressing.ts`-/`outpostView.ts`-Darstellung.

**Abnahme:** Der Ort ist als Lade-/Versorgungsbereich erkennbar und wirkt räumlich
eingebettet. Originale Kollisionskörper, Fundstellen und Interaktionsradien bleiben
unverändert. Neue Details bieten keine irreführenden Interaktionssignale oder Wege.
Der Übergang funktioniert bei normalem Durchlaufen in beide Richtungen.

### U4 Missionszustände und Bewegung

**Ergebnis:** Die Umgebung reagiert auf den Spielverlauf und besitzt wenige
gezielte Bewegungen. Dafür werden keine neuen Missionsregeln eingeführt.

- [x] Vorhandene Zustände auf drei Darstellungen abbilden: Versorgung aus, Wartung aktiviert, Relais online.
- [x] Ladeanzeigen, kurze lokale Leitungsstücke und das Ladeobjekt lesbar reagieren lassen; keine langen Bodenleitungen quer durch Kampfflächen ergänzen.
- [x] Höchstens zwei Arten von Umgebungsbewegung auswählen, etwa langsam laufender Lüfter und geringe Vegetationsbewegung.
- [x] Bestehende Signalfarben für Gegnerwarnungen, Treffer, Vorräte und Interaktionen respektieren.
- [x] Pause, vollständigen Neustart, Tod/Retry und erneuten Szeneneinstieg ohne doppelte Animationen oder Ressourcen prüfen.

**Betroffen:** Lesender Anschluss an `AdventureFightState` in `adventureGame.ts`,
Update-/Dispose-Funktionen der Versuchsdarstellung. Keine Änderung an `AdventureFight`.

**Abnahme:** Die Darstellung folgt dem tatsächlichen Missionszustand, auch nach
Retry. Vollständiger Neustart zeigt wieder den Anfang. Die Wartungs-/Relaisreaktion
im Ladehof wird bei regulärer Rückkehr geprüft; es entsteht keine Pflicht zum
Zurücklaufen. Falls ein Zustand nicht sinnvoll sichtbar ist, wird seine Wirkung
vereinfacht statt die Mission oder Kamera umzubauen. Einzelne Zustandsbilder
dürfen zusätzlich mit klar benannten Fixtures entstehen; sie ersetzen keinen Missionslauf.

### U5 Vergleich und technische Absicherung

**Prüfstatus:** Funktions-, Isolations- und Regressionstests bestanden. Die letzte
Messreihe hält die absoluten Frame- und Drawcall-Budgets ein, überschreitet aber
in einzelnen A/B-Paaren das relative p95-Budget (+2,7 statt höchstens +2 ms).
Der [Ergebnisbericht](../qa/ADVENTURE_ENVIRONMENT_TEST_RESULT.md) dokumentiert
alle Werte und die noch offene Leistungsnacharbeit. Die folgenden Häkchen
kennzeichnen ausgeführte Prüfaufgaben, keine uneingeschränkte technische Freigabe.

**Ergebnis:** Ein stabiler Kandidat mit nachvollziehbaren Vorher-/Nachher-Bildern
und Messwerten. Nur befundbezogene Korrekturen, kein weiterer Gestaltungsumfang.

- [x] Referenz A gegen Ausgangsstand und Versuch B gegen A an identischen Vergleichspunkten prüfen.
- [x] Ganze Prototypmission mit normalen Eingaben abschließen; Reserve, Sprungwege, Tod/Retry, Pause und Neustart einschließen.
- [x] Legacy-Adventure, Arena und öffentliche T2-Buildvariante nach den berührten Integrationsstellen prüfen.
- [x] Desktop- und Touch-Ansichten auf Verdeckung, Flimmern, Schatten, Texturen und Assetfehler prüfen.
- [x] Leistung, Kalt-/Warmstart, Netzwerkressourcen und Ressourcenfreigabe mit dem U0-Profil vergleichen.
- [x] Resultate, Bilder, bekannte Grenzen und exakt getesteten Commit im Ergebnisbericht zusammenführen.

**Abnahme:** Die nachfolgenden technischen Grenzen sind eingehalten oder der
Kandidat bleibt mit konkretem Befund in Nacharbeit. Der Bericht trennt technische
Prüfung, visuelle Eigenkontrolle und noch offene persönliche Bewertung.

### U6 Persönlicher Vergleich und Entscheidung

**Ergebnis:** Dokumentierte Entscheidung über den getesteten Ausschnitt.

- [ ] A und B auf derselben Bildschirmgröße und mit denselben Kameraeinstellungen spielen.
- [ ] Ortswirkung, Wiedererkennbarkeit, Lesbarkeit und Bewegungsfreiheit vergleichen.
- [ ] Entscheiden: **beibehalten**, **gezielt nacharbeiten** oder **verwerfen**.
- [ ] Nur überzeugende Bauteile und Regeln als mögliche Grundlage für Wartungs-/Relaisgestaltung festhalten.

**Abnahme:** Der Nutzer beurteilt den konkreten Kandidaten. Ein positives Ergebnis
ist keine automatische Veröffentlichung oder Umstellung des regulären Adventure.
Eine spätere Übernahme erhält einen getrennten Auftrag mit Zielbranch, Umfang
und Kanal. Bei Verwerfen bleibt der Versuch isoliert; die Referenz funktioniert weiter.

## Prüfungen und Grenzen

Die folgenden Zahlen sind **Planbudgets für den Versuch**, keine gemessenen
Ergebnisse. U0 erfasst ein vergleichbares Ausgangsprofil und benennt Gerät,
Browser, Viewport, DPR, Netzbedingungen und Messablauf. Wenn bereits A ein Budget
verfehlt, muss das vor der Gestaltungsarbeit erklärt und ein passendes Prüfprofil
festgelegt werden; Grenzwerte werden nicht nachträglich zur Freigabe passend gemacht.

| Bereich | Kriterium |
|---|---|
| Vergleichspunkte | Start bei Drohne, Hofmitte mit Läufer, beide Seitenränder, Übergang zum Wartungshof und Rückblick; dazu vorhandene Boss-/Missionskontrolle |
| Desktop | 1920 × 1080 und 1366 × 768; A/B mit identischem DPR und denselben Einstellungen |
| Touch | 844 × 390 und 667 × 375, Rotation/Pause; Emulation als Emulation kennzeichnen, echte Geräte getrennt dokumentieren |
| Framezeiten | Nach Aufwärmen Desktop p95 ≤20 ms, p99 ≤33 ms; B darf p95 gegenüber A auf demselben Gerät um höchstens 2 ms erhöhen |
| Messablauf | Drei vergleichbare Durchläufe je A/B, gleicher Laufweg und Kampfausschnitt; Messwerte pro Lauf berichten, Schwankungen sichtbar halten |
| Simulation | p95 ≤4 ms im Referenzprofil; keine Änderung an Simulationsregeln oder absichtliche Verlangsamung |
| Zusätzliche Assets | Neue ausschließlich für B ausgelieferte Assetdateien zusammen zunächst ≤2 MiB; bevorzugt vorhandene Texturen, keine neuen 4K-Dateien |
| Rendering | Im vergleichbaren Blick höchstens 20 zusätzliche Renderaufrufe als Anfangsbudget; Dreiecke und Texturanzahl mitprotokollieren |
| Licht | Keine neue Schattenlichtquelle oder Nachbearbeitungskette; höchstens eine zusätzliche lokale Lichtquelle ohne Schatten, falls sichtbar erforderlich |
| Ressourcen | Zehn vollständige Neustarts nach Aufwärmen ohne fortlaufenden Anstieg von Listenern, Szenenobjekten, Geometrien oder Texturen |
| Speicherung | A/B-Auswahl erzeugt keine neuen persistenten Einträge; bestehende Einstellungen und Speicherkennungen bleiben erhalten |
| Isolation | Standard-, Test- und T2-Preview-Build aktivieren B auch mit Testparameter nicht und enthalten keine neuen exklusiven Test-Assets |

`npm test` und `npm run build` bleiben die technischen Grundprüfungen der
Codebulks; ergänzt werden der eigene Versuchsbuild und gezielte Browserfälle.
U0 und U5 prüfen zusätzlich `build:test` und `build:adventure-preview` sowie deren
Einstiegsgrenzen. Änderungen an diesen Grenzen erfordern den erneuten Grenztest
bereits im betreffenden Bulk. Für gemeinsame Komponenten werden die tatsächlich
betroffenen Arena-/Legacy-Fälle ausgeführt; keine neuen Tests allein für
dekorative Objektzahlen oder die Existenz einzelner Bauteile.

Die vorhandenen lesenden Metriken unter
`tests/e2e/adventureMetrics.ts` können angepasst werden. Frameintervalle allein
belegen weder GPU-Auslastung noch freien Leistungsraum; deshalb Renderaufrufe,
Simulation, Ressourcen und sichtbare Störungen gemeinsam beurteilen.

Die persönliche Bewertung in U6 beantwortet fünf konkrete Fragen:

1. Wirkt der Hof wie Teil einer größeren Anlage?
2. Ist seine Funktion auch ohne die Ortsüberschrift erkennbar?
3. Bleiben Figur, Gegner, Gefahren und Interaktionen mindestens so gut lesbar wie in A?
4. Fühlen sich Kamera und Bewegung unverändert an?
5. Ist der Qualitätsgewinn groß genug, um den Baukasten später weiterzuverwenden?

Eine verdeckte Figur, irreführende begehbare Fläche, unklare Warnung oder Änderung
am Referenzpfad ist ein konkreter Fehler. Solche Fehler werden vor U6 behoben;
ein schöneres Einzelbild gleicht sie nicht aus.

## Nachweise und anschließende Nutzung

`docs/qa/ADVENTURE_ENVIRONMENT_TEST_RESULT.md` enthält pro Bulk den getesteten
Commit, tatsächlichen Umfang, Abnahmebefund und offene Punkte. Vergleichsbilder
liegen unter `docs/qa/adventure-environment-test/`, umfangreiche lokale Messungen
unter `test-results/adventure-environment-test/`. Diese Dateien entstehen erst,
wenn entsprechende Ergebnisse vorliegen; geplante Pfade sind keine Testnachweise.

Nach positivem U6 können Wartungshof und Relaisbereich mit dem erprobten Baukasten
als eigener Abschnitt geplant werden. Dabei werden deren große Erkennungsobjekte
und Bodengliederungen separat gestaltet. Der Ladehof-Test beauftragt diesen
Folgeausbau nicht und verändert die bestehende Adventure-Aufgabenfolge nicht.

## Quellen im Projekt

- [Feste Kamera und Links-nach-rechts-Vorgabe](ADVENTURE_VISION.md#3-bewegung-kamera-und-eingabe)
- [Grundriss und physische Ausstattung](../../src/arena/stoneAdventure.ts)
- [Lade-, Wartungs- und Relaisobjekte](../../src/arena/stoneDressing.ts)
- [Materialien und Architektur](../../src/render/courtyardLook.ts)
- [Vegetation und Konsolen](../../src/render/courtyardDressing.ts)
- [Vorhandene Ortsgestaltung und Zustandsreaktionen](../../src/render/outpostView.ts)
- [Missionsintegration](../../src/app/adventureGame.ts)
- [Öffentliche Vorschau und ihre Prüfung](../../scripts/qa/adventurePreviewGuard.ts)
