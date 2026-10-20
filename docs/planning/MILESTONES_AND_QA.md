# CORE ARENA 3D Meilensteine und Qualitätssicherung

Stand: 20. Oktober 2026. Status: vorgeschlagener Plan, noch keine Umsetzungsfreigabe.

Das erste Produktziel ist ein verlässlich spielbares 2v2-TDM auf einer guten Höhenarena. Jeder Meilenstein endet mit einem sichtbaren Ergebnis und einer gesonderten Freigabe. Eine M0-Freigabe autorisiert keine automatische Weiterarbeit bis M4.

Die konkrete Reihenfolge der Arbeitspakete M0.1 bis M4.4 und die Einschätzung einer optionalen Mobile-Erweiterung stehen in [MOBILE_AND_WORK_PACKAGES.md](MOBILE_AND_WORK_PACKAGES.md). Die dortigen Pakete unterteilen die folgenden Aufwandsspannen; sie erweitern den Desktop-Umfang nicht. Ein Touch-Versuch wäre ein separat freizugebender Zusatz.

## Anpassung des Starterplans

Der bisherige [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) verlangt für M0 bereits eine Szene mindestens in vollständiger V5-Qualität, schiebt Höhen-/Kollisions-/Trefferkorrektheit aber nach M1. Das würde den ersten Auftrag entweder unnötig groß machen oder eine zweite vorläufige Physik festschreiben.

Vorschlag: **M0 auf technisches Fundament, Kameras, eine bewegliche Figur, Basiskollision und eine repräsentative Gestaltung begrenzen.** V5 bleibt unverändert daneben verfügbar. Die E0/E1/E2-Traversal- und Schussqualität wird vollständig in M1 abgenommen; die hochwertige spielbare Gesamtarena wird in M2 fertiggestellt. Diese Scope-Anpassung ist Bestandteil der vorliegenden Freigabevorlage, keine bereits beschlossene Änderung der Vision.

## Aufwand und Reihenfolge

Schätzungen für eine erfahrene alleinige Umsetzung mit verfügbaren Agentenwerkzeugen, einschließlich passender Tests, Dokumentation und einer normalen Feedbackrunde. Ein Arbeitstag entspricht ungefähr sechs konzentrierten Entwicklungs-/Teststunden. Wartezeiten auf Feedback, umfangreiche neue Assetproduktion und Veröffentlichungsvorgänge sind nicht enthalten.

| Meilenstein | Lieferumfang | Aufwand | Sichtbares Gate |
| --- | --- | --- | --- |
| **M0 Fundament** | Vite/TS/Three/Rapier, fester Takt, Figur auf E0, Wandkollision, beide Kameras, V5-Materialprobe, lokale Start-/Buildanleitung | **3–5 Tage** | Tatsächlich im Browser laufen und steuern; Referenzlook erkennbar; reproduzierbarer Build |
| **M1 Höhen und Aim** | E0/E1/E2, Sprung und Fall, Körper-/Deckenfreiheit, Zielmarker und Diagnosewaffe, drei Dummies, einfache Bot-Traversalprobe | **8–12 Tage** | Reproduzierbare Höhen- und Trefferfälle sowie 5–10 Minuten persönlicher Spieltest |
| **M2 erstes Spiel** | Eine überarbeitete Arena, 2v2-TDM, Arc Lash/Pulse, Pickups, HP/Armor, Tod/Respawn, Score/Timer/Restart, Easy/Normal/Hard, kleines HUD und belegte kurze Feedbacksounds | **12–18 Tage** | Vollständige echte Matches; Höhenbots funktionieren; Nutzer bestätigt Movement und Combat |
| **M3 Objectives** | Erst Classic CTF, danach One Flag; Träger-, Drop-, Return- und Capture-Regeln sowie passende Teamrollen | **8–12 Tage** | Echte Captures durch gültige Wege; Schwierigkeit und Teams bleiben nachvollziehbar |
| **M4 kleine Liga** | Ein-Klick-Qualifier, Teamidentität, eine Proving-Saison mit drei Matches, Tabelle, ein Recruitment-Moment, sichere lokale Saves | **8–12 Tage** | Neuer Spieler versteht den Einstieg; komplette kleine Liga einschließlich Reload und Recruitment |
| **M5 spätere Produktvalidierung** | Weitere Arenen, zusätzliche Waffen, größere Liga und Distributionsentscheidung nach Kernspielabnahme | **Noch nicht seriös schätzbar** | Eigenständiges Go/No-Go und neuer begrenzter Auftrag |

Bis M2: **23–35 Arbeitstage**; mit etwa 25 Prozent Risikopuffer **29–44 Tage**, grob 6–9 volle Arbeitswochen. Bis M4: **39–59 Tage**, mit Puffer **49–74 Tage**, grob 10–15 Wochen. Das sind Größenordnungen für ein geprüftes Spiel, keine Lieferzusage. Nach M1 werden die Schätzungen anhand von Controller-, Aim- und Navigationsbefunden aktualisiert.

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

Die Arbeit wird intern in kleine Änderungen gegliedert: Motor und Standflächen → Höhen-/Deckentests → Aim/Diagnosetreffer → Traversalprobe und Spielabnahme. Alle gehören zu M1; ein fertiges Teilstück ist noch keine Freigabe des gesamten Meilensteins.

| Fall | Erwartetes Ergebnis |
| --- | --- |
| E0→E1 und E1→E2 an markierten Stellen | Je zehn erfolgreiche Wiederholungen pro Kameramodus mit echten Bewegungs- und Sprungbefehlen |
| E0→E2 ohne Zwischenstand | Kein direkter Standardsprung auf E2 |
| Absprung, Landung, Rand verlassen | Keine schwebende Figur, kein Durchfallen, korrekter Standflächenwechsel |
| Wand, Ecke, Säule, gekrümmter Trog | Zehn Annäherungen pro Form ohne Durchdringen; sichtbarer Rand und Kollisionshülle stimmen innerhalb der festgelegten Toleranz überein |
| Niedriger Überhang im Testlabor | Figur kollidiert mit dem Kopf; keine Landung durch die Unterseite |
| Zwei Flächen über gleichem X/Z | Keine Verwechslung der Standfläche, kein Pickup oder Treffer allein wegen gleicher Bodenkoordinaten |
| Ziele auf drei Höhen | Je eine freie und eine verdeckte Konstellation aus jeder Höhe; freie Treffer funktionieren, blockierte erzeugen keinen Schaden |
| Mündung hinter Wand, Cursor auf sichtbarem Gegner | Einschlag an der Wand, kein „Schuss um die Ecke“ |
| Kamerawechsel bei Bewegung und Zielhaltung | Eingabe bleibt bildschirmbezogen, Schussmarker wechselt nicht ungewollt die Zielhöhe |
| 30/60/144-Hz-Renderplan | Gleiche Tickzahl ergibt gleiche Spielzustände innerhalb definierter numerischer Toleranz |
| Testbot auf jedem Pflichtlink | Zehn erfolgreiche Durchläufe; derselbe Motor und dieselben Bewegungswerte wie beim Menschen |

Anschließend persönlicher Nutzer-Spieltest von mindestens 5–10 Minuten. Protokoll: Wird Höhe sofort verstanden? Sind Landungen und Zielmarker zuverlässig? Bleibt die Figur sichtbar? Fühlt sich die Steuerung direkt an? Ein negatives Urteil führt zu gezielter M1-Nacharbeit.

## M2 Abnahme

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

Nur der letzte zutreffende Status wird behauptet. Aktuell ist ausschließlich die Analyse erstellt.
