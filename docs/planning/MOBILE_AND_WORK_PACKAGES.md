# CORE ARENA 3D: Mobile-Einschätzung und Arbeitspakete

Stand: 20. Oktober 2026. Ergänzung zur Analyse, **keine Umsetzungsfreigabe**. Desktop bleibt das erste Qualitätsziel. Der [M0-Auftrag](M0_IMPLEMENTATION_BRIEF.md) bleibt unverändert begrenzt; Touch gehört nicht zu M0.

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

**Separat freizugeben, nicht Teil der bisherigen Aufwandssummen.** Zeitbox: zwei konzentrierte Arbeitstage als erster Untersuchungsrahmen, vorausgesetzt zwei konkrete Testgeräte sind verfügbar. Das Zeitlimit verspricht Erkenntnisse, keine fertige Mobile-Version. Wenn die grundlegende Bedienung innerhalb der Zeitbox nicht funktioniert, den Befund dokumentieren und Desktop fortsetzen.

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

Die bisherige [Meilenstein-Roadmap](MILESTONES_AND_QA.md) definiert Umfang und Abnahme. Die folgenden Pakete ergänzen die konkrete Arbeitsreihenfolge. Sie verteilen dieselben Aufwandsspannen; sie kommen nicht zusätzlich dazu. Arbeitstage und Puffer haben dieselbe Bedeutung wie dort.

M0 ist ausführungsnah beschrieben. M1 ist nach Risiken gegliedert. M2–M4 bleiben überprüfbare Planungsannahmen und werden nach M1 anhand der Befunde neu geschätzt. Ein im Voraus endgültig „optimaler“ Zuschnitt wäre angesichts ungeprüfter 3D-Steuerung und Navigation nicht seriös.

| Paket | Ergebnis und Abgrenzung | Voraussetzung | Tage | Konkreter Nachweis |
| --- | --- | --- | --- | --- |
| **M0.1 Startfähiges Projekt** | Toolchain, lokale Abhängigkeiten, minimaler Simulationsstart und sichtbare Szene; keine sSpielsysteme | M0-Freigabe und Remote-Abgleich | 1 | Frische Installation, Typecheck, Build, Browserstart |
| **M0.2 Bewegung und Kamera** | Kapsel auf E0, Wandkontakt, WASD/Shift, fester Takt, beide Kameras und Fokusbehandlung | M0.1 | 1–2 | Echte Eingaben, normierte Diagonalen, Wandtest in beiden Ansichten |
| **M0.3 Gestaltung und Übergabe** | Kleine V5-Materialprobe, Diagnose und vollständige M0-Abnahme | M0.2 | 1–2 | Gebauter Browserlauf, zwei Vergleichsaufnahmen, Startanleitung |
| **M1.1 Höhenmotor** | Sprung/Fall, Standflächen, E0/E1/E2, Unterseiten und Kopfkontakt | M0 abgenommen, M1 freigegeben | 2–3 | Wiederholbare Auf-/Abstiege, Überhang- und Überlappungsfälle |
| **M1.2 Zielwahl und Diagnosefeuer** | 3D-Zielpunkt, Mündungsprüfung, Diagnosewaffe und drei Dummies; kein Waffeninventar | M1.1 | 2–3 | Freie/verdeckte Treffer aus allen Höhen, kein Schuss um die Ecke |
| **M1.3 Navigationsprobe** | Flächenverbindungen und ein einfacher Bot, der Pflichtwege mit demselben Motor durchläuft | M1.1; M1.2 für gemeinsame Diagnose | 2–3 | Zehn Durchläufe je Pflichtlink, Fehlertrace bei Scheitern |
| **M1.4 Zusammenspiel und Spielabnahme** | Kamera, Höhenmotor, Aim und Navigation zusammen prüfen und gezielt nacharbeiten | M1.1–M1.3 | 2–3 | Vollständige M1-Matrix und persönlicher 5–10-Minuten-Test |
| **M2.1 Lebenszyklus und Match** | HP/Armor, Schaden, Tod/Respawn, Spawn-Schutz, TDM-Score, Timer und Restart | M1 abgenommen, M2 freigegeben | 2–3 | Echte Zustandsübergänge; pro Leben höchstens ein Kill |
| **M2.2 Waffen und Ressourcen** | Arc Lash/Pulse, Auswahl, Munition und Pickups; Zielregel vor Abstimmung festhalten | M2.1 und M1.2 | 3–4 | Unterscheidbares Waffenverhalten; keine Aufnahme durch Etagen |
| **M2.3 Botwahrnehmung und Kampf** | Begrenzte Wahrnehmung, Gedächtnis, Reaktion und Waffenbedienung über gemeinsame Befehle | M2.2 und M1.3 | 2–3 | Verdeckte Gegner bleiben verborgen; keine vorzeitige Reaktion |
| **M2.4 Teamspiel und Schwierigkeiten** | 2v2-Verhalten, Ressourcenwahl, Easy/Normal/Hard und Erholung nach blockierter Route | M2.3 | 1–2 | Alle Stufen nutzen Pflichtwege; keine Vorteile durch höhere Basisstats |
| **M2.5 Arena und Feedback** | Eine spielbare Gesamtarena, kleines HUD, klare Teams und belegte Feedbacksounds | M2.2–M2.4 | 2–3 | Höhe/Deckung lesbar, reguläres Match ohne Diagnosehilfen spielbar |
| **M2.6 Matchprüfung und Abnahme** | Gesamtablauf, Botsimulationen, Performance und gezielte Korrekturen | M2.1–M2.5 | 2–3 | 30 Botmatches, drei echte Browsermatches und Nutzerurteil |
| **M3.1 Classic CTF** | Flaggenzustände und erste Carrier-/Verteidigungsrollen gemeinsam als spielbarer Modus | M2 abgenommen, M3 freigegeben | 3–4 | Gültiger Capture über Höhenroute; Drop/Return korrekt |
| **M3.2 One Flag** | Neutrale Flagge, Runner/Escort/Interception auf vorhandener Basis | M3.1 technisch und spielerisch geprüft | 2–3 | Regulärer Transport und Capture; keine konkurrierenden Zustandsbesitzer |
| **M3.3 Objective-Abnahme** | Wege, Rollen und zwei Modi unter Konkurrenz prüfen und abstimmen | M3.1–M3.2 | 3–5 | 60 Botmatches, isolierte Routentests und echte Spiele beider Modi |
| **M4.1 Einstieg und Qualifier** | Ein-Klick-Start und Hinweise, die auf echte Aktionen reagieren | M3 abgenommen, M4 freigegeben | 2–3 | Einstieg ohne künstlich abgeschlossene Lernschritte |
| **M4.2 Team und Saison** | Teamgründung, drei Matches, Tabelle und Abschluss | M4.1 | 3–4 | Jedes tatsächlich erspielte Ergebnis zählt genau einmal |
| **M4.3 Rekrutierung und Saves** | Ein Rekrutierungsentscheid, versionierte Saves, Reload und sichere Fehlerfälle | M4.2 | 2–3 | Rekrutierung bleibt erhalten, alte CTF-Saves bleiben unverändert |
| **M4.4 Liga-Abnahme** | Kompletter Einstieg bis Saisonende, Verständlichkeit und Regression | M4.1–M4.3 | 1–2 | Reale Drei-Match-Saison, Reload, Rekrutierung und Nutzertest |

Summen unverändert: M0 **3–5**, M1 **8–12**, M2 **12–18**, M3 **8–12**, M4 **8–12** Arbeitstage, jeweils vor dem im Hauptplan beschriebenen Risikopuffer.

## Wie die Pakete bearbeitet werden

Jedes Paket umfasst seine passenden Tests und einen kurzen Browsernachweis, soweit es sichtbares Spielverhalten verändert. Die abschließenden Prüfblöcke bündeln Regression, längere Simulationen und Spielabnahme; sie verschieben das Testen nicht ans Ende.

Vor Beginn eines Pakets werden aus dem Ergebnis eine kurze Aufgabenliste und konkrete Erfolgskriterien abgeleitet. Innerhalb eines freigegebenen Meilensteins können die Pakete nacheinander bearbeitet werden, ohne für jede kleine Änderung eine neue Freigabe einzuholen. Meilensteingrenzen, wesentliche Scope-Änderungen und der optionale Mobile-Versuch bleiben eigenständige Entscheidungen.

Ein Paket, dessen Kernrisiko sich in der vorgesehenen Zeit nicht auflösen lässt, wird anhand des Befunds kleiner geschnitten. Es wird nicht durch zusätzliche Features erweitert. M3.3 kann beispielsweise in separate Classic- und One-Flag-Abnahmen geteilt werden, wenn sich unterschiedliche Problemursachen zeigen.

Nach jedem Paket dokumentieren: tatsächlich erreichter Zustand, ausgeführte Prüfungen, bekannte Grenzen und das nächste noch offene Risiko. „Umgesetzt“, „technisch geprüft“ und „spielerisch abgenommen“ bleiben getrennte Aussagen.

**Aktueller Stand: ausschließlich Planung. Kein M0-Code und keine Mobile-Implementierung sind durch diese Ergänzung autorisiert oder begonnen.**
