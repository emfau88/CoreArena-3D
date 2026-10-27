# CORE ARENA 3D: Mobile-Einschätzung und Arbeitspakete

Stand: 21. Oktober 2026. **M0, M1 und M2.1–M2.3 umgesetzt und technisch geprüft. Einfacher mobiler Basiszugang zusätzlich freigegeben und umgesetzt.** M2.3 wurde durch „go nächster punkt“ freigegeben. M2.4–M2.6 und M3–M4 bleiben ohne Umsetzungsfreigabe. Desktop bleibt das erste Qualitätsziel.

## Freigegebener kleiner Mobile-Zusatz

Auf ausdrücklichen Wunsch „so simpel wie möglich“: linker analoger Joystick, direkter Touch-Zielpunkt auf der Arena mit Halten/Tippen zum Feuern, Sprungtaste, Sprint-Umschalter, Kamera und bestehende Waffenbuttons. Getrennte Finger-IDs für Bewegung und Aim, Aufräumen bei Abbruch/Fokus/Drehung/Respawn/Restart. Kompaktes Querformat-HUD und Hinweis/Pause im Hochformat. Gemeinsamer Spielkern; mobile Render-DPR auf 1, Schattenmap auf 1024 begrenzt.

Das ist ein enger spielbarer Zusatz, keine vollständige Umsetzung des unten beschriebenen größeren T0-Gerätevergleichs. Echte Android-/iPhone-Tests, alternatives Touch-Aim und Langzeit-/Wärmemessungen bleiben offen. [Aktueller Nachweis](../qa/MOBILE_BASIC_RESULT.md). Die folgenden Vorschläge bleiben historische Planung für einen späteren Ausbau.

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
| **M2.4 Teamspiel und Schwierigkeiten** | 2v2, Ressourcenwahl, Easy/Normal/Hard und blockierte Routen | M2.3 | 15–30 Min. | Alle Stufen nutzen Pflichtwege; gleiche Basisstats |
| **M2.5 Arena und Feedback** | Gesamtarena, kleines HUD, klare Teams und Feedbacksounds | M2.2–M2.4 | 10–20 Min. | Höhe/Deckung lesbar, Match ohne Diagnosehilfen |
| **M2.6 Matchprüfung und Übergabe** | Gesamtablauf, gezielte Botsimulationen, Performance und Korrekturen | M2.1–M2.5 | 15–30 Min. | Echte vollständige Browsermatches; breitere Matrix nach Bewährung |
| **M3.1 Classic CTF** | Flaggenzustände und Carrier-/Verteidigungsrollen als spielbarer Modus | M2 abgenommen, M3 freigegeben | 25–50 Min. | Capture über Höhenroute; Drop/Return korrekt |
| **M3.2 One Flag** | Neutrale Flagge, Runner/Escort/Interception auf vorhandener Basis | M3.1 geprüft | 15–30 Min. | Regulärer Transport und Capture |
| **M3.3 Objective-Übergabe** | Wege, Rollen und beide Modi unter Konkurrenz prüfen und abstimmen | M3.1–M3.2 | 20–40 Min. | Routentests und echte Spiele beider Modi; breitere Matrix später |
| **M4.1 Einstieg und Qualifier** | Ein-Klick-Start und Hinweise auf echte Aktionen | M3 abgenommen, M4 freigegeben | 10–20 Min. | Keine künstlich abgeschlossenen Lernschritte |
| **M4.2 Team und Saison** | Teamgründung, drei Matches, Tabelle und Abschluss | M4.1 | 20–40 Min. | Jedes erspielte Ergebnis zählt genau einmal |
| **M4.3 Rekrutierung und Saves** | Rekrutierung, versionierte Saves und Reload | M4.2 | 20–40 Min. | Rekrutierung erhalten, CTF-Saves unverändert |
| **M4.4 Liga-Übergabe** | Einstieg bis Saisonende, Verständlichkeit und Regression | M4.1–M4.3 | 10–20 Min. | Reale Drei-Match-Saison, Reload, Rekrutierung |

Summen: M0 und M1 **Ist jeweils ca. 30 Min. bis Erstübergabe** (Nutzerangaben); M2 **90–180 Min. (1,5–3 h)**; M3 und M4 jeweils **60–120 Min. (1–2 h)**. M1-Nacharbeit an Kantensprung und Plateau-Lesbarkeit nach der ersten Nutzerprobe ist kein Bestandteil dieser gemeldeten Erstzeiten. Der Puffer ist enthalten. Persönliche Spieltests: M1 5–10 Min., M2/M3 je ca. 10–15 Min., M4 ca. 10–20 Min.; Wartezeiten auf diese Tests und Freigaben sind keine Agent-Arbeitszeit. Nach jedem Meilenstein Schätzung und beobachtete Dauer vergleichen, keine erfundenen Paket-Istzeiten eintragen.

## Wie die Pakete bearbeitet werden

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
Als Nächstes zunächst Nutzerurteil zur PvE-Richtung einholen. M2.4 bleibt ungeöffnet.

Nacharbeit auf Spielrückmeldung vom 21. Oktober 2026: Gleichhohes Boden-Aim lenkt Arc/Pulse jetzt auf Waffenhöhe durch den Cursorstrahl, statt in den Boden. Vor und hinter den Gegner zielen funktioniert entlang der tatsächlichen Trefferbahn; echte 3D-Zielwahl auf andere Höhen bleibt erhalten. Kein Beginn von M2.4. [Prüfung](../qa/DIRECTIONAL_AIM_RESULT.md).

Nach Abschluss von M2.3 verbleiben für **M2.4–M2.6 zusammen 40–80 Minuten** aus dem bestehenden Paketplan. Keine separat gemessenen Paket-Istzeiten werden nachträglich erfunden; die ursprünglichen Schätzungen bleiben als Planwerte sichtbar. Die zusätzlich angeforderte GitHub-Pages-Veröffentlichung gehört nicht zum ursprünglichen Waffenpaket.

Jedes Paket umfasst seine passenden Tests und einen kurzen Browsernachweis, soweit es sichtbares Spielverhalten verändert. Die abschließenden Prüfblöcke bündeln Regression, längere Simulationen und Spielabnahme; sie verschieben das Testen nicht ans Ende.

Vor Beginn eines Pakets werden aus dem Ergebnis eine kurze Aufgabenliste und konkrete Erfolgskriterien abgeleitet. Innerhalb eines freigegebenen Meilensteins können die Pakete nacheinander bearbeitet werden, ohne für jede kleine Änderung eine neue Freigabe einzuholen. Meilensteingrenzen, wesentliche Scope-Änderungen und der optionale Mobile-Versuch bleiben eigenständige Entscheidungen.

Ein Paket, dessen Kernrisiko sich in der vorgesehenen Zeit nicht auflösen lässt, wird anhand des Befunds kleiner geschnitten. Es wird nicht durch zusätzliche Features erweitert. M3.3 kann beispielsweise in separate Classic- und One-Flag-Abnahmen geteilt werden, wenn sich unterschiedliche Problemursachen zeigen.

Nach jedem Paket dokumentieren: tatsächlich erreichter Zustand, ausgeführte Prüfungen, bekannte Grenzen und das nächste noch offene Risiko. „Umgesetzt“, „technisch geprüft“ und „spielerisch abgenommen“ bleiben getrennte Aussagen.

**Aktueller Stand: M0.1–M0.3, M1.1–M1.4 und M2.1–M2.3 umgesetzt und technisch geprüft; einfacher Touch-Zugang zusätzlich umgesetzt.** [M2.3-Nachweise](../qa/M2_3_RESULT.md). Vor M2.4 auf die nächste Freigabe warten. Weiterer Mobile-Ausbau bleibt optional.
