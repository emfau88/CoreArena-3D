# CORE ARENA 3D Meilensteine und Qualitätssicherung

Stand: 20. Oktober 2026. **M0 und M1 umgesetzt und technisch geprüft. M2–M5 nicht freigegeben.** Eine gesonderte persönliche Spielbewertung bleibt offen.

## Aktueller Fortschritt

- [x] M0.1: Eigenständiger Projektstart mit lokalen Abhängigkeiten und Browser-Build.
- [x] M0.2: 60-Hz-Simulation, Kapsel/Wandkollision, WASD/Shift, beide Kameras und Fokusbehandlung.
- [x] M0.3: V5-Materialprobe, Figur/Vegetation, Diagnose, Browsernachweise und lokale Übergabe.
- [ ] Persönliches M0-Spielurteil des Nutzers.
- [x] Gesonderte M1-Freigabe durch den Nutzer.
- [x] M1.1: Höhenmotor, Sprung/Fall, Standflächen und Kopfkontakt.
- [x] M1.2: 3D-Zielwahl, Mündungsprüfung und Diagnosefeuer auf drei Dummies.
- [x] M1.3: Gerichtete Höhenroute und Testfigur mit demselben Motor.
- [x] M1.4: Gezielter integrierter Browser-Spielablauf und technische Übergabe.
- [ ] Persönliches M1-Spielurteil und gesonderte M2-Freigabe.

Nachweise: [M0-Ergebnis](../qa/M0_RESULT.md), sechs bestandene Kern-/Physiktests und 24 bestandene Browserfälle. Eine Neuinstallationsprüfung aus einem frischen Checkout wurde nicht zusätzlich durchgeführt; Installation und Build im Arbeitsverzeichnis sind geprüft.

M1-Nachweise: [M1-Ergebnis](../qa/M1_RESULT.md), insgesamt zehn bestandene Kern-/Physiktests und fünf Browserfälle in Chromium 1366×768, darunter ein vollständiger Höhen-/Treffer-/Navigationsablauf mit echten Eingaben. Keine erneute Vollmatrix über alle Browser; keine persönliche Abnahme behauptet.

**Aktuelle Priorität nach Nutzerfeedback:** Kleine, sichtbare und spielbare Ergebnisse zuerst. Pro Änderung die relevanten Kernprüfungen ausführen. Die weiter unten geplanten umfassenden Randfall-, Langzeit- und Balance-Matrizen gelten als späterer QA-Ausbau, nicht als automatisch vorzuziehende Voraussetzung für jeden frühen Zwischenstand. Der konkrete Testumfang wird mit dem nächsten freigegebenen Paket begrenzt. V5 bleibt die Richtung für Optik und Spielgefühl; wesentliche Abweichungen werden vorab abgestimmt.

Das erste Produktziel ist ein verlässlich spielbares 2v2-TDM auf einer guten Höhenarena. Jeder Meilenstein endet mit einem sichtbaren Ergebnis und einer gesonderten Freigabe. Eine M0-Freigabe autorisiert keine automatische Weiterarbeit bis M4.

Die konkrete Reihenfolge der Arbeitspakete M0.1 bis M4.4 und die Einschätzung einer optionalen Mobile-Erweiterung stehen in [MOBILE_AND_WORK_PACKAGES.md](MOBILE_AND_WORK_PACKAGES.md). Die dortigen Pakete unterteilen die folgenden Aufwandsspannen; sie erweitern den Desktop-Umfang nicht. Ein Touch-Versuch wäre ein separat freizugebender Zusatz.

## Anpassung des Starterplans

Der bisherige [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) verlangt für M0 bereits eine Szene mindestens in vollständiger V5-Qualität, schiebt Höhen-/Kollisions-/Trefferkorrektheit aber nach M1. Das würde den ersten Auftrag entweder unnötig groß machen oder eine zweite vorläufige Physik festschreiben.

Freigegebener Zuschnitt: **M0 umfasst Fundament, Kameras, Figur, Basiskollision und eine repräsentative Gestaltung.** V5 bleibt unverändert daneben verfügbar. M1 liefert die begehbare Höhen-/Aim-Probe; die Gesamtarena und das erste Match folgen in M2. Die Vision bleibt unverändert. Die ursprünglichen Starterdokumente sind historischer Input; diese Roadmap führt den aktuellen freigegebenen Umfang.

## Aufwand und Reihenfolge

**Geschätzt wird aktive Agent-Arbeitszeit in Minuten/Stunden, keine menschlichen Entwicklertage.** Kalibrierung: M0 dauerte laut Nutzer ungefähr **30 Minuten insgesamt**, einschließlich der damaligen Prüfungen; eine belastbare Zeiterfassung pro Teilpaket existiert nicht. Die früheren Tages-/Wochenschätzungen sind ersetzt. Die folgenden bewusst konservativen Spannen enthalten Implementierung, passende Kern- und Browsertests, normale Korrekturen, Dokumentation, Commit und Push. Sie werden nach jedem Meilenstein mit dem beobachteten Aufwand neu kalibriert; aus M0 allein folgt kein verlässlicher linearer Faktor für Combat, Bots und Liga.

**Separat:** persönliche Spieltests (meist 5–15 Minuten pro Meilenstein), Rückmeldung/Freigabe und deren Wartezeit. Größere Richtungswechsel, zusätzliche Inhalte, neue Assets und Gerätebeschaffung sind nicht enthalten. Die Obergrenze enthält bereits einen Korrekturpuffer; kein weiterer pauschaler 25-Prozent-Aufschlag.

| Meilenstein | Lieferumfang | Aufwand | Sichtbares Gate |
| --- | --- | --- | --- |
| **M0 Fundament — technisch erledigt** | Vite/TS/Three/Rapier, fester Takt, Figur auf E0, Wandkollision, beide Kameras, V5-Materialprobe, Start-/Buildanleitung | **Ist: ca. 30 Minuten** (Nutzerangabe) | Browsernachweise vorhanden; persönliches Spielurteil offen |
| **M1 Höhen und Aim — technisch erledigt** | E0/E1/E2, Sprung und Fall, Körper-/Deckenfreiheit, Zielmarker und Diagnosewaffe, drei Dummies, einfache Bot-Traversalprobe | **Plan: 1,5–3 Stunden**; Ist nicht separat durchgängig gemessen | Höhen-/Trefferfälle geprüft; 5–10 Minuten persönlicher Spieltest offen |
| **M2 erstes Spiel** | Eine überarbeitete Arena, 2v2-TDM, Arc Lash/Pulse, Pickups, HP/Armor, Tod/Respawn, Score/Timer/Restart, Easy/Normal/Hard, kleines HUD und belegte kurze Feedbacksounds | **3–6 Stunden** | Vollständige echte Matches; Höhenbots funktionieren; Nutzer bestätigt Movement und Combat |
| **M3 Objectives** | Erst Classic CTF, danach One Flag; Träger-, Drop-, Return- und Capture-Regeln sowie passende Teamrollen | **2–4 Stunden** | Echte Captures durch gültige Wege; Schwierigkeit und Teams bleiben nachvollziehbar |
| **M4 kleine Liga** | Ein-Klick-Qualifier, Teamidentität, eine Proving-Saison mit drei Matches, Tabelle, ein Recruitment-Moment, sichere lokale Saves | **2–4 Stunden** | Neuer Spieler versteht den Einstieg; komplette kleine Liga einschließlich Reload und Recruitment |
| **M5 spätere Produktvalidierung** | Weitere Arenen, zusätzliche Waffen, größere Liga und Distributionsentscheidung nach Kernspielabnahme | **Noch nicht seriös schätzbar** | Eigenständiges Go/No-Go und neuer begrenzter Auftrag |

Planungsbasis ab M0 bis einschließlich M2: **4,5–9 Stunden Agent-Arbeitszeit**, bis einschließlich M4: **8,5–17 Stunden**. **Nach abgeschlossenem M1 verbleiben geschätzt 3–6 Stunden bis M2 beziehungsweise 7–14 Stunden bis M4.** Das sind Bereiche für den begrenzten beschriebenen Umfang, keine Lieferzusage oder Kalendertermine. M2–M4 sind unsicherer als M1 und werden vor ihrer Freigabe anhand des dann vorhandenen Spiels erneut geschätzt. M1 hat die technische Basis bestätigt; seine nicht durchgängig erfasste Istzeit wird nicht als genaue Messung ausgegeben.

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
| E0→E2 ohne Zwischenstand | Bestanden: direkter Standardsprung erreicht E2 nicht durch die Unterseite |
| Fall und Standfläche | Bestanden: Testfigur E2→E0, echte Schwerkraft und korrekte Flächen-IDs |
| Wandkontakt und Sliding | Bestanden: bestehende Rapier- und Browserregression; keine neue Vollmatrix aller Formen |
| E2-Überhang | Bestanden: Kopfkontakt beendet Aufstieg; Landung auf E0 statt Durchstieg durch E2 |
| Zwei Flächen über gleichem X/Z | Bestanden: Rapier-Abfragen unterscheiden E2 oben und E0 unter der Platte |
| Drei Höhenziele | Bestanden: freie Diagnosetreffer an E0/E1/E2, Zielpunkt liegt auf der Oberfläche |
| Sichtbares Ziel bei verdeckter Mündung | Bestanden: Wand wird zuerst getroffen; Zielzähler bleibt unverändert |
| Kamera, Eingabe, Fokus und Größe | Bestanden: beide Ansichten, Aim nach Wechsel, Pause/Reset der Eingaben und Resize |
| 30/60/144-Hz-Renderplan | Bestehender Kerncheck weiterhin bestanden |
| Testfigur | Bestanden: E0→E1→E2→E0 ohne Positionsinjektion, gleicher Motor/gleiche Werte; isolierte Kollisionswelt |

Bewusst noch offen: zehnfache Wiederholungen je Link/Kamera, sämtliche Höhen-/Sichtkombinationen, komplexe Rundformen, Langzeit- und Geräte-/Browser-Vollmatrix. Inventar, Pickups und Schadensregeln gehören zu M2 und sind kein M1-Nachweis.

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

Nur der letzte zutreffende Status wird behauptet. Aktuell sind M0 und M1 **umgesetzt und technisch geprüft**; das persönliche M1-Spielurteil sowie jede Umsetzung ab M2 stehen aus.
