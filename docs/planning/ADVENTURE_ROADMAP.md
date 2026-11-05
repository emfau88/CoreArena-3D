# CORE ARENA 3D — Adventure-Roadmap

Stand: **4. November 2026** · [Produktvision](ADVENTURE_VISION.md) · [Aktuelle Testversion spielen](https://emfau88.github.io/CoreArena-3D/adventure-preview/?mode=pve&level=stone&adventure=1&combat=prototype)

## Wo wir gerade stehen

**Aktuell: A7.2 — Spieltest T2 und Entscheidung über den ersten vollständigen Adventure-Kern.**
Der erste Hof samt Steinwächter ist spielbar. Deine bisherigen Rückmeldungen sind
eingearbeitet; das abschließende Urteil zu Boss, Mission und Waffenwahl steht noch aus.

| Umsetzung | Aktueller Spieltest | Noch nicht begonnen |
|---|---|---|
| **✅ 12 Pakete technisch fertig** | **🟡 1 Paket läuft: A7.2** | **⬜ 13 Pakete: A8.1–A11.5** |

**„Technisch fertig“ heißt: eingebaut und geprüft.** Es heißt nicht automatisch,
dass der Spieltest bestanden ist. Die separate Abnahme steht in der letzten
Spalte unten. Die 26 Pakete sind unterschiedlich groß; ihre Anzahl ist keine
Schätzung des verbleibenden Aufwands.

### Was bereits spielbar ist

Links-nach-rechts-Kamera, Dash, normaler Sprung und kurzer Doppelsprung;
Energiepeitsche mit Seitenschwung, Überkopf-Knall und Lufthieb samt überarbeitetem
Trefferfeedback; angepasster Steinwächter; komplette erste Mission mit Läufern,
Konsole, Checkpoint, Kern, Relais und Ausgang; begrenzter Pulse-Vergleich.
Die öffentliche Vorschau hat Touch-Bedienung. Echte Handytests stehen noch aus.

### Was jetzt noch fehlt

1. Die aktuelle erste Mission und mehrere Bossversuche spielen: Sind Steuerung,
   Treffer, Warnungen, Schwierigkeit und Wiederholungen überzeugend?
2. Waffenwahl beurteilen: Sind die drei Peitschenbewegungen sinnvoll, und soll
   die begrenzte Pulse-Ergänzung bleiben?
3. **A7.2 entscheiden:** gezielt nachbessern oder den Kern bestätigen. Dabei
   **G2 (Steinwächter)** und **G3 (erste Mission)** ausdrücklich abnehmen.

Danach können weitere Karten und gegebenenfalls Modifikationen beauftragt werden.
Ein Progressionssystem ist weiterhin offen und nicht implementiert. Die öffentliche
**Testversion** ist bereits online; der finale Release **A11.5** bleibt ein späterer Schritt.

[Aktueller Adventure-Entwicklungsstand mit Wächterklamm und Vergleich A–F](https://github.com/emfau88/CoreArena-3D/tree/codex/adventure-environment-test).

**Ursprüngliche Planung vom 4. November 2026:**
[Eigene Roadmap mit U0–U6](ADVENTURE_ENVIRONMENT_TEST_ROADMAP.md) für einen isolierten
A/B-Versuch am Ladehof: Außenraum, Architektur, Boden und sichtbare Missionszustände.
Kamera und Links-nach-rechts-Führung bleiben erhalten. Zu diesem Zeitpunkt war nur die Planung
erstellt; eigene Branch-/Build-Isolation war vorgesehen. Die 26 Pakete, A7.2,
G2/G3 und der öffentliche T2-Kanal bleiben davon unberührt.

## Alle 26 Arbeitspakete auf einen Blick

Die Paketnummer führt zum aufklappbaren Detailauftrag. **T1 ist abgeschlossen,
T2 läuft, T3 liegt noch vor uns.** Bestehende Frost-/Glut-Maps zählen nicht als
fertige Umsetzung ihrer neuen Adventure-Pakete.

| Paket | Ergebnis / Aufgabe | Umsetzungsstand | Spielabnahme / verbleibender Schritt |
|---|---|---|---|
| [A0.1](#paket-a0-1) | Alten Kampf erhalten, Varianten trennen | ✅ Technisch fertig | Referenz geprüft |
| [A0.2](#paket-a0-2) | Bosslabor, schneller Neustart, Messung | ✅ Technisch fertig | Technische Abnahme fertig |
| [A1](#paket-a1) | Kamera und gerichtetes Zielen | ✅ Technisch fertig | G1 bestanden; Links-nach-rechts-Nacharbeit in T2 prüfen |
| [A2.1](#paket-a2-1) | Bosskörper und Kollision | ✅ Technisch fertig | G1 bestanden |
| [A2.2](#paket-a2-2) | Bewegung, Dash; später Doppelsprung | ✅ Technisch fertig | G1 bestanden; Luftsprung in T2 prüfen |
| [A3](#paket-a3) | Trefferregeln der drei Peitschenbewegungen | ✅ Technisch fertig | G1 bestanden; zusätzliche Angriffe in T2 prüfen |
| [A4](#paket-a4) | Peitschenoptik, Animation und Trefferfeedback | ✅ Technisch fertig | G1 bestanden; neues Feedback in T2 prüfen |
| [A5.1](#paket-a5-1) | Steinwächter: Faust und Gegenangriff | ✅ Technisch fertig | G2-Urteil in T2 offen |
| [A5.2](#paket-a5-2) | Steinwächter: Spezialangriffe und Rhythmus | ✅ Technisch fertig | G2-Urteil in T2 offen |
| [A6.1](#paket-a6-1) | Läufer und Versorgung im ersten Hof | ✅ Technisch fertig | G3-Urteil in T2 offen |
| [A6.2](#paket-a6-2) | Erste Mission vollständig durchspielbar | ✅ Technisch fertig | G3-Urteil in T2 offen |
| [A7.1](#paket-a7-1) | Peitsche allein / begrenzte Pulse vergleichen | ✅ Technisch fertig | Entscheidung zur Waffenwahl in T2 offen |
| **[A7.2](#paket-a7-2)** | **Ersten Kern beurteilen und Richtung entscheiden** | **🟡 Spieltest läuft** | **Aktueller Schritt: G2/G3 und Gesamturteil** |
| [A8.1](#paket-a8-1) | Zwei Waffenmodifikationen erproben — optional | ⬜ Nicht begonnen | Erst nach positivem T2 und eigenem Auftrag |
| [A8.2](#paket-a8-2) | Progression wählen oder streichen — optional | ⬜ Nicht begonnen | Nutzen / Wiederspielwert prüfen; G4 in T3 |
| [A8.3](#paket-a8-3) | Kampagne fortsetzen und Bosse üben | ⬜ Nicht begonnen | Auch ohne Modifikationen möglich |
| [A9.1](#paket-a9-1) | Frostspinne zum zweiten Referenzkampf ausbauen | ⬜ Nicht begonnen | Eigenes Kampfprofil entwickeln |
| [A9.2](#paket-a9-2) | Kluftmission und Übergang aus Map 1 | ⬜ Nicht begonnen | Neue Kampfregeln in Map 2 integrieren |
| [A10.1](#paket-a10-1) | Glutwurm zum dritten Referenzkampf ausbauen | ⬜ Nicht begonnen | Eigenes Kampfprofil entwickeln |
| [A10.2](#paket-a10-2) | Schmiedemission und Kampagnenabschluss | ⬜ Nicht begonnen | Neue Kampfregeln in Map 3 integrieren |
| [A10.3](#paket-a10-3) | Drei Missionen als Gesamtlauf abstimmen | ⬜ Nicht begonnen | G5 in T3 vorbereiten |
| [A11.1](#paket-a11-1) | Einstieg, Bedienung und Lesbarkeit abschließen | ⬜ Nicht begonnen | Finale Bedienungsprüfung |
| [A11.2](#paket-a11-2) | Leistung, Laden und Browser absichern | ⬜ Nicht begonnen | Finale Drei-Map-Prüfung |
| [A11.3](#paket-a11-3) | Releaseumfang, Rechte und Kanal festlegen | ⬜ Nicht begonnen | Verbindlichen Releasekandidaten festlegen |
| [A11.4](#paket-a11-4) | Externe Spieltests und Release-Abnahme | ⬜ Nicht begonnen | T3 mit G4/G5/G6 |
| [A11.5](#paket-a11-5) | Freigegebenes fertiges Spiel veröffentlichen | ⬜ Nicht begonnen | Erst nach G6; separate Testvorschau bereits online |

## Die sechs Qualitätstore

| Gate | Was wird entschieden? | Status |
|---|---|---|
| **G1** | Grundgefühl von Bewegung und Peitsche | ✅ In T1 bestanden; spätere Nacharbeit wird in T2 geprüft |
| **G2** | Überzeugt der Steinwächter? | 🟡 Technisch geprüft, dein T2-Urteil offen |
| **G3** | Funktioniert die erste Mission als Spielerlebnis? | 🟡 Technisch geprüft, dein T2-Urteil offen |
| **G4** | Bringen Modifikationen / Progression echten Mehrwert? | ⬜ Offen, noch nicht geprüft; bewusster Verzicht möglich |
| **G5** | Überzeugt die gesamte Mini-Kampagne? | ⬜ Offen, noch nicht geprüft |
| **G6** | Ist der konkrete Kandidat bereit für den finalen Release? | ⬜ Offen, noch nicht geprüft |

Aufgaben, Abhängigkeiten und Abnahmekriterien bleiben vollständig erhalten.
Für den Tagesstand reichen die Übersichten oben; die folgenden Details lassen
sich nach Bedarf öffnen.

<details>
<summary>Bisherige Freigaben und Nacharbeiten — Verlauf und Nachweise</summary>

Stand: **2. November 2026**. Maßgebliche Quelle für zukünftige Adventure-Aufträge.
Produktziel: [ADVENTURE_VISION.md](ADVENTURE_VISION.md). Die Erstellung dieser
Dokumentation ist beauftragt; Vision und Struktur mit **26 Bulks und sechs Gates**
sind grundsätzlich freigegeben. Menschliche Prüfungen sind auf **drei Spieltermine**
gebündelt (Abschnitt 5). **A0.1–A6.2 und A7.1 sind technisch umgesetzt** auf
`codex/adventure-combat-prototype`; A7.2 ist als **T2-Kandidat vorbereitet**.
Nach bestandenem T1/G1 hat der Nutzer den empfohlenen Abschnitt A5.1–A7.2
mit „ja so machen, leg los“ freigegeben. Der A4-Feedback-Feinschliff ist umgesetzt;
seine Wirkung sowie **G2/G3 und der Richtungsentscheid bleiben menschlich offen**.
A8 und spätere Bulks sind nicht beauftragt. Legacy bleibt der reguläre Standard;
der Prototyp ist im Entwicklungs-/Testbuild und als separate öffentliche T2-Vorschau
als vollständige Mission anwählbar. Das ist keine Abnahme der Release-Gates.
[Öffentliche Vorschau](https://emfau88.github.io/CoreArena-3D/adventure-preview/?mode=pve&level=stone&adventure=1&combat=prototype).
[Ergebnis A0](../qa/ADVENTURE_A0_1_A0_2_RESULT.md) · [Ergebnis A1–A4](../qa/ADVENTURE_A1_A4_RESULT.md) ·
[T2-Kandidat A5–A7](../qa/ADVENTURE_A5_A7_RESULT.md) ·
[T2-Nacharbeit: zwei Peitschenangriffe und Darstellung](../qa/ADVENTURE_WHIP_MOVES_RESULT.md).

Im laufenden T2 meldet der Nutzer zu wenig optische Qualität und Abwechslung der
Peitsche. Ausdrücklich freigegeben ist deshalb eine begrenzte **A3/A4-Nacharbeit**:
Seitenschwung links, Überkopf-Knall rechts, hochwertigere prozedurale Darstellung
und klareres Kontaktfeedback. Die Startwaffe erhält zwei direkte Eingaben; keine
Mods/Progression. Im anschließenden Nutzerauftrag kommt gezielt **A2.2/A3/A4-Nacharbeit**
hinzu: kürzerer Doppelsprung, kontextabhängiger diagonaler Lufthieb und vollständige
Touch-Eingaben für die Prototyp-Aktionen. [Regeln und Nachweise](../qa/ADVENTURE_AIR_RESULT.md).
26 Bulks, sechs Gates und drei Spieltermine bleiben erhalten. G2/G3 und A7.2 bleiben offen.

</details>

<details>
<summary>Arbeitsregeln, Architektur, Testmatrix und vollständige Gate-Kriterien</summary>

## 1. Zuständigkeit und Arbeitsweise

Diese Roadmap ersetzt ältere Adventure-Ausbauaufträge als Planungsquelle.
Der begrenzte [Umgebungstest](ADVENTURE_ENVIRONMENT_TEST_ROADMAP.md) führt seine
eigenen Bulks separat; er ändert diese Hauptaufgabenfolge nicht.
[LEVEL_1_STONE_ADVENTURE.md](LEVEL_1_STONE_ADVENTURE.md) bleibt Bestands- und
Historiennachweis. [MILESTONES_AND_QA.md](MILESTONES_AND_QA.md) ist der gemeinsame
Index. [Arena-Bulks](MOBILE_AND_WORK_PACKAGES.md#arena-to-do-liste), historische
QA-Berichte und die Arena-Vision bleiben eigenständig.

- Ein Auftrag nennt genau einen Bulk oder eine ausdrücklich begrenzte Kombination.
  Abschluss oder bestandenes Gate erteilt keine automatische Folgefreigabe.
  Ein ausdrücklich beauftragter Arbeitsabschnitt darf mehrere benannte Bulks bis
  zum nächsten Spieltermin umfassen; innerhalb dieses Umfangs braucht es keine
  erneute Freigabe je Teilbulk. „Gesondert freigeben“ gilt nur für noch nicht
  beauftragte Folgearbeit, nicht für bereits autorisierte Schritte.
- Vor Beginn Arbeitsbaum, HEAD, betroffene Dateien und neue Nutzerentscheidungen
  prüfen. Fremde Änderungen erhalten; Plan gegen tatsächlichen Code abgleichen.
- Geplante Dateinamen sind Vorschläge, keine Aufforderung zur Vorab-Erstellung aller
  Module. `neu:` bezeichnet heute nicht vorhandene Dateien.
- Änderungen an gemeinsamen Komponenten nur mit beschriebenem Anlass, neutralem
  Standardverhalten und passenden Arena-/Legacy-Regressionsprüfungen.
- Für spätere Codearbeit ist `codex/adventure-combat-prototype` ein sinnvoller
  Branchname. Dokumentation benötigt keinen zusätzlichen Branch. Branchwahl allein
  schützt den alten Modus nicht; die Laufzeittrennung bleibt erforderlich.
- Keine pauschalen Minutenversprechen: Physik-/Kamera-/Animationspakete besitzen
  hohe Iterationsunsicherheit. Vor jedem freigegebenen Bulk eine begrenzte Schätzung
  aus seinem aktuellen Befund erstellen, menschliche Test-/Wartezeit getrennt halten.

### Status und Fertig-Definition

Die Übersicht trennt **Technisch fertig**, **Spieltest läuft** und **Nicht begonnen**.
Die interne Auftragsfolge bleibt **geplant → freigegeben → in Arbeit → abgeschlossen**;
**blockiert** nur mit konkretem Hindernis, Verantwortlichkeit und nächstem Schritt.
Eine unerfüllte spätere Abhängigkeit macht einen geplanten Bulk nicht automatisch
blockiert. Freigaben mit Datum und Auftragsbezug direkt am Bulk ergänzen.

`[x]` bedeutet nachgewiesene Aufgabe, keine vermutete Erledigung. Ein Codebulk ist
erst abgeschlossen, wenn Aufgaben, Abnahmekriterien und erforderliche Nachweise
erfüllt sind. Bei ausdrücklich auf den nächsten Spieltermin verschobener menschlicher
Abnahme darf der technische Bulk abgeschlossen werden; der Bericht nennt dann
„technisch abgeschlossen, menschliches Gate offen“. Das Gate bleibt bis zum Urteil
offen, und nur die in Abschnitt 5 erlaubte Vorbereitung darf weitergehen.
Ein Entscheidungsbulk darf mit begründetem Verwerfen abgeschlossen werden; daraus
entsteht keine Berechtigung, die gesperrten Folgearbeiten dennoch zu beginnen.

Jeder Bulk erhält einen kurzen Bericht unter `docs/qa/ADVENTURE_<ID>_RESULT.md`
(Punkte der ID durch Unterstriche ersetzen): Basis-/Ergebniscommit, Branch,
Test-/Play-Einstieg, tatsächlicher Umfang, Parameterprofil, bestandene/fehlgeschlagene
Tests, Screenshots oder kurze Sequenz bei visueller Änderung, menschliches Urteil
separat, offene Risiken, Gate-Entscheidung und nächster empfohlener Auftrag.
Keine vollständigen Logs ins Hauptdokument kopieren. Bestehende Berichte nicht umschreiben.

## 2. Reihenfolge und Abhängigkeiten

| Abschnitt | Eigenständige Bulks | Ausgang |
|---|---|---|
| Vergleichsbasis | A0.1 Referenz/Variantenwahl → A0.2 Kampflabor/Messung | Unveränderter Altmodus und schnelle, reproduzierbare Versuche |
| Kerngefühl | A1 Kamera/Zielsteuerung → A2.1 Körperkontakt → A2.2 Dash → A3 Peitschenregeln → A4 Darstellung/Feedback | **Gate 1** |
| Referenzboss | A5.1 Faust/Gegenangriff → A5.2 Spezialangriffe/Rhythmus | Technische Vorbereitung von **Gate 2** |
| Erste Mission | A6.1 Läufer/Versorgung → A6.2 vollständiger Ablauf | Technische Vorbereitung von **Gate 3** |
| Richtungsentscheidung | A7.1 begrenzter Fernkampfvergleich → A7.2 Gesamturteil | Spieltermin 2: G2/G3 entscheiden; fortsetzen, ändern oder verwerfen |
| Optionaler Fortschritt | A8.1 zwei Modifikationen → A8.2 Progressionsentscheid | **Gate 4** in Spieltermin 3, einschließlich zulässigem Verzicht |
| Kampagnenfundament | A8.3 kleine Fortsetzen-/Übungsverwaltung | Unabhängig von Waffenmodifikationen |
| Zweiter Schwerpunkt | A9.1 Frostspinne → A9.2 Kluftmission | Eigene Winkel-/Seitenwechselaufgabe |
| Höhepunkt | A10.1 Glutwurm → A10.2 Schmiedemission → A10.3 Gesamtlauf | Technische Vorbereitung von **Gate 5** |
| Release | A11.1 Bedienung → A11.2 Leistung/Browser → A11.3 Umfang/Rechte/Kanal → A11.4 externe Abnahme → A11.5 Veröffentlichung | Spieltermin 3: G4/G5/**G6**, danach gesonderter Publikationsauftrag |

Nach A7.2 können A8.3 und die Frost-Arbeit auch **ohne** A8.1/A8.2 beauftragt werden:
Der Verzicht auf Progression wird in A7.2 oder einer späteren Scope-Entscheidung
festgehalten, Gate 4 wird dann ausdrücklich „entfällt — keine Progression“ gesetzt.
A9.1 benötigt keine neuen Mods. A9.2 benötigt A8.3 für den Kampagnenübergang.
Mit Mods müssen technische Vergleichsergebnisse vor der abschließenden Kampagnenbalance
vorliegen. Ohne positives menschliches G4 bleiben sie frei verfügbare Versuchsvarianten;
keine Freischaltökonomie oder Mod-Persistenz vorwegnehmen.
A11.1–A11.3 dürfen nach technischer G5-Prüfung in anderer ausdrücklich freigegebener Reihenfolge
bearbeitet werden; A11.4 benötigt alle drei Ergebnisse.

### Aufwand und größte Unsicherheiten

Die Einstufung beschreibt relative Komplexität, keine zugesagte Bearbeitungsdauer.
Menschliche Spieltermine und Nacharbeit an negativen Gates bestimmen den Kalender
wesentlich mit. Eine belastbare Gesamtrelease-Schätzung ist vor G2 nicht möglich.

| Umfang | Erwarteter Aufwand | Begründung / Begrenzung |
|---|---|---|
| A0.1 | Klein | Ein Einstieg und Referenzwerte; keine Kampfregel ändern |
| A0.2, A2.2 | Mittel | Fixture/Reset beziehungsweise Dashzustand sind begrenzt, benötigen aber echte Browser-/Kollisionsfälle |
| A1, A2.1 | Mittel bis hoch | Kamera und bewegter Körperkontakt können bestehende räumliche Annahmen aufdecken; früh isoliert prüfen |
| A3–A5 | Hoch, iterativ | Kernregel, Animation und Bossrhythmus müssen gemeinsam menschlich überzeugen; wichtigste Entwicklungsinvestition |
| A6, A8.3 | Mittel | Mission weitgehend vorhanden; Speicherung dagegen kleiner neuer Adapter mit Fehlerfällen |
| A7, A8.2 | Vor allem Test-/Entscheidungsaufwand | Kein heimlicher Implementierungsbulk; Termine und ehrliche Beobachtung erforderlich |
| A8.1 | Mittel bis hoch, optional | Zwei Varianten vervielfachen Balancefälle; erster Kandidat für vollständige Streichung |
| A9/A10 je Map | Hoch | Vorhandene Karte spart Weltbau, aber keine eigenständige Bossabnahme; jeweils Boss und Mission getrennt liefern |
| A11.1–A11.3 | Mittel, befundabhängig | Bedienungs-, Lade- oder Rechteprobleme können eigenen Fixumfang auslösen; keine pauschale „Polish“-Reserve |
| A11.4/A11.5 | Externe Abnahme / kleiner technischer Abschluss | G6 kann Nacharbeit verlangen; Veröffentlichung selbst darf keinen neuen Spielfunktionsumfang enthalten |

Nach G2 anhand tatsächlich benötigter Iterationen neu schätzen, nach technischer
A10.3-Abnahme den Releasekandidaten für T3 begrenzen. Spätere Pakete bleiben detaillierte Arbeitsgrenzen,
keine Vorabzusage, dass alle Designkandidaten umgesetzt werden müssen.

### Zuschnitt: zusammenlegen oder getrennt halten

- A0.1/A0.2 können bei unverändert kleinem Befund gemeinsam beauftragt werden:
  gleicher Einstieg, gemeinsame Fixture, kein neues Kampfverhalten. Getrennte
  Nachweise für Routing und tatsächlich gleiche Startzustände bleiben erforderlich.
- A1 und A2.2 dürfen im selben Spieltermin verglichen werden. Implementierung
  getrennt halten, damit ein Kameraproblem nicht als Bewegungsproblem behandelt wird.
- A2.1 Körperkontakt getrennt von Dash: bestehendes Durchlaufen des Bosses ist eine
  eigene räumliche Regel; hohe Geschwindigkeit würde ihre Fehler schwerer zuzuordnen machen.
- A3/A4 benötigen bereits ab A3 eine einfache sichtbare Bahn. Mechanik und
  ausgearbeitetes Feedback bleiben getrennte Bulks; kein Spaßurteil über unsichtbare Treffer.
- A5.1/A5.2, A9.1/A9.2 und A10.1/A10.2 getrennt halten: zuerst Bossregel, dann
  Angriffskombination beziehungsweise Mission. Keine Karte und KI zugleich umfassend umbauen.
- A7.1 nicht in A3 aufnehmen. Eine Fernkampfoption darf einen schlechten Peitschenkern
  nicht kaschieren. Ein bewusster Verzicht auf den Vergleich braucht eine dokumentierte Entscheidung.
- A8.1/A8.2 dürfen zu einem kleinen Versuch samt Entscheidung verbunden werden;
  Persistenz A8.3 bleibt getrennt. Bei negativem Nutzenbeleg fallen beide Mods weg.
- A11.1/A11.2 nicht als „Polish alles“ bündeln. A11.3/A11.4/A11.5 trennen Rechte,
  externe Qualität und Veröffentlichung. Ein positiver Test ist keine Publikationsfreigabe.

## 3. Technische Integration ohne verteilte Sonderfälle

### Einmalige Auswahl am Programmeinstieg

`src/main.ts` liest einen zukünftigen, ausdrücklich gewählten `combat=prototype`-
Parameter nur für `mode=pve&adventure=1&level=stone`. Fehlender/ungültiger Parameter
verwendet die bisherige Variante. Frost/Glut werden erst in ihren eigenen Bulks für
den neuen Adventure-Pfad zugelassen. Arena und bisherige PvE-Links behalten ihre Semantik.

Ein kleiner Adventure-Kompositionspunkt (Vorschlag `src/app/adventureVariant.ts`)
stellt Eingabe-/Bewegungsregeln, Waffe, Kamera und Encounter zusammen. Keine
URL-Abfragen in Physik, Rendering oder einzelnen Schadensfunktionen. Der Altpfad
verwendet weiterhin seine bisherigen Instanzen und Werte. Ein Prototypprofil wird
pro Versuch neu erstellt; keine Mutation globaler `WEAPONS`, `PVE_RULES`,
`ADVENTURE_BOSS_RULES`, Sprungprofile oder gemeinsam gecachter Animationsclips.

Nur tatsächlich erforderliche Schnittstellen einziehen: Bewegungsbefehl/Snapshot,
Attacke/Schadensereignisse, Encounter-Zustand und Kameraansicht. Bestehende
Missionszustände und `Damage`-Verarbeitung weiterverwenden. `AdventureFight` erzeugt
heute `Combat` und `PveEncounter` selbst; begrenzte Konstruktor-Injektion mit alten
Defaults ist der bevorzugte Eingriff. Keine Kopie des gesamten `adventureGame.ts`
und kein allgemeines Plugin-/Strategie-Framework für eine einzige Variante.

| Verantwortung | Bestehende Grundlage | Geplante Abgrenzung |
|---|---|---|
| Input und Bewegung | `src/input/desktopInput.ts`, `src/core/simulation.ts`, `types.ts`, `movementProfile.ts` | Optionaler Adventure-Befehl/Profileinstieg; Dashphase im Simulationszustand, Standardpfad unverändert |
| Physik | `src/physics/rapierWorld.ts` | Vorhandene Kapsel/Rays/Sweeps; zusätzliche gefilterte Körper-/Trefferabfragen nur bei Bedarf |
| Peitsche | `src/core/combat.ts`, `aim.ts`, `match.ts` | Eigenes kleines Modul `src/core/energyWhip.ts`; bestehendes Schadensformat |
| Darstellung | `src/render/kayFighter.ts`, `arcView.ts`, `arenaView.ts`, `camera.ts` | Neue Peitschenansicht/Adventure-Kamerakonfiguration; alte Arc- und Arena-Präsentation unverändert |
| Boss | `src/core/pve.ts`, `bossNavigation.ts`, `src/arena/stoneAdventure.ts` | Prototyp-Encounter/Regelprofil; vorhandene Zustände und Navigation vor Erweiterung prüfen |
| Mission | `src/core/adventureFight.ts`, `src/arena/adventureMission.ts`, `src/app/adventureGame.ts` | Gleiche Konsole-/Checkpoint-/Abschlusslogik; Laborszenario ausdrücklich getrennt |
| Kampagne / Speichern | `src/arena/campaign.ts`, `src/app/pveGame.ts` | Bestehende Leveldefinitionen weiterverwenden; kleiner neuer lokaler Speicheradapter, kein bestehendes Save-System behaupten |

**Darstellung folgt Simulation:** Numerische Schlagbahn, Zeit, IDs und aktive
Trefferphasen sind maßgeblich. Animation interpoliert zwischen Zuständen.
Peitschensegmente und bewegte Ziele zwischen Ticks prüfen; ein ganzer sichtbarer
Bogen darf nicht bereits am Angriffsbeginn schaden. Blockierende Weltflächen und
schadensfähige Ziele brauchen passende Filter, keine zweite unabhängige Kollisionswelt.
Bosskörper dürfen Bewegung stoppen, ohne Waffen-Raycasts oder die Navigation
versehentlich am eigenen Körper zu blockieren.

### Vergleichslabor und unveränderte Referenz

Einstiege des A0-Vergleichslabors (Entwicklungs-/Testbuild):

```text
?mode=pve&level=stone&adventure=1                         reguläre bisherige Mission
?mode=pve&level=stone&adventure=1&combat=prototype        neue Mission (Entwicklungs-/Testbuild)
?mode=pve&level=stone&adventure=1&lab=boss&combat=legacy  alte Regeln im Kampflabor
?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype
```

Lab nur im Entwicklungs-/Testbuild, bis ein eigener Preview-Auftrag etwas anderes
festlegt. Es nutzt den **Wächterhof des Adventure**, nicht die ältere eigenständige
Stein-PvE-Karte. Die Fixture stellt den bereits erreichten Missionszustand explizit
her; keine Tests behaupten dadurch eine absolvierte Anreise. Der lesende
`__coreArena`-Hook bleibt lesend und nur im Testbuild. Späterer öffentlicher
Boss-Übungszugang erhält einen regulären Spieleinstieg ohne Debug-API.

Seit A6 funktioniert die ausdrücklich gewählte neue Variante auch ohne Lab im
Entwicklungs-/Testbuild. Ohne `combat=prototype`, in der Erkundung und im
Produktionsbuild bleiben die bisherigen Regeln aktiv. `loadout=pulse` ergänzt
im Prototyp zwölf Pulse-Schüsse; der Standard bleibt Peitsche allein. Im Lab
stehen zusätzlich ein Faust-Einzelversuch und Übungsziele zur Verfügung.

Legacy-Referenzprofil: Spieler am Zugang ungefähr `(0, 0.06, -21)`, 100 HP, 50 Rüstung,
Reserve aus, Boss an seiner Ausgangsposition mit 600 HP, definierte Vorräte,
Pulse-Vergleich mit 54 Schuss. Arc-Vergleich separat. Genaue Koordinaten,
Kamera, Bossphase und Messbeginn in A0.2 einfrieren. Kampfzeit ab erster aktiver
Bossphase nach dem Auftauchen; Lade-/Einlauf-/Retryzeit separat. Alte QA-Zeiten
nicht ohne Abgleich ihres Messbeginns mit neuen Werten vermischen.

Zuerst unterscheiden sich die Labvarianten nur im Profilnamen. Danach pro Bulk
genau die untersuchte Regel ändern. Ein reiner Bewegungsvergleich benutzt dieselbe
Waffe und denselben Boss. Endvergleich alter/neuer Gesamtkampf darf verschiedene
Waffen-/Bossregeln haben, muss diese aber offen ausweisen. Gleiche Eingabereplays
prüfen technische Reproduzierbarkeit, menschliche A/B-Läufe prüfen Spielgefühl.

Metriken pro Versuch: Commit/Profil, Eingabegerät, Auflösung/Hardware, Startzustand,
Sieg/Niederlage, aktive Kampfzeit, Schaden nach Ursache, Vorschwung-/Rücktreffer und
Fehlschläge, Dash-Nutzung, Bossphasen, Gegenangriffe nach Ausweichen, Abbruchgrund,
Kameraverdeckung und Framezeiten. Keine heimliche Online-Telemetrie; lokale,
explizit aufgezeichnete Versuche reichen. Keine Rangliste oder Analytics-Plattform.

## 4. Gemeinsame technische Prüfung

Die folgenden Kürzel machen die Bulk-Tests konkret, ohne dieselben Listen zu kopieren.

| Kürzel | Prüfungen |
|---|---|
| **K** | Bei jedem Codebulk `npm test`, `npm run build`, für Browserprüfung `npm run build:test`; Fehler/Flakes benennen, keine behauptete Abnahme nach bloßem Retry |
| **L** | Bisheriges Stein-Adventure: `tests/adventure-fight.test.ts`, `stone-adventure.test.ts`; Browser `adventure-fight.spec.ts`, `adventure-acceptance.spec.ts`, `arc-mobile.spec.ts`; Missionsabschluss und Tod/Retry durch echte Eingaben |
| **R** | Geteilte Technik: `physics.test.ts`, `core.test.ts`, `combat.test.ts`, `heights-aim.test.ts`, `directional-aim.test.ts`; passende neue Fälle für echte Bewegungs-/Trefferregeln |
| **A** | Arena-Schutz: `arena-teams.test.ts`, `arena-rail.test.ts`, `arena-bots.test.ts`; gezielte Browserfälle aus `arena-expansion.spec.ts`, `arena-ap2.spec.ts`, `arena-ap3.spec.ts`, `m2-4.spec.ts`; 1v1/2v2, Waffen, Tod/Respawn, Ergebnis, Desktop/Touch je nach betroffenem System |
| **P** | Alte Bosskarten: `pve.test.ts`, `melee.test.ts`, `campaign.test.ts`, `boss-navigation.test.ts`; Browser `pve.spec.ts`, `campaign.spec.ts`; keine stillen Regel-/Kameraänderungen |
| **N** | Neue Variante: regelbezogene Tests des jeweiligen Bulks, realer Browserlauf und lesende Diagnose; Fixtures nur für abgegrenzte Szenarien |

Alle `*.spec.ts` liegen in `tests/e2e/`. Bei gemeinsamen Änderungen sind A/P und
die relevanten L-Fälle Pflicht; sonst den begründeten gezielten Umfang im Bericht
nennen. Vor Gate 3, Gate 5 und Release vollständige betroffene Ablaufketten prüfen.
Dokumentations-/Entscheidungsbulks verweisen auf den geprüften identischen Codecommit;
ohne Codeänderung werden Gameplay-Tests nicht aus Formalität wiederholt.

Performance: A0.2 benennt Referenz-PC, GPU, Browser, Auflösung und DPR. Erstes
Desktop-Ziel bei 1920×1080 und festem DPR: etwa 60 FPS, Framezeit p95 ≤20 ms,
p99 ≤33 ms, Simulation p95 ≤4 ms nach Aufwärmen. Das sind Planbudgets, keine
Messbehauptungen. Bei schwächerem Referenzgerät vor Abnahme ein begründetes Profil
festhalten. Neu eingeführte Effekte dürfen bei zehn Retries keine fortlaufend
wachsenden Listener-/Mesh-/Audioressourcen erzeugen. Normale 30/60/144-Hz-Darstellung
muss dieselben Simulationsregeln liefern; überlastbedingt verworfene Ticks separat melden.

Der [L1.5b-Bericht](../qa/L1_5B_RESULT.md#lade--und-laufzeitprofil) dokumentiert
relevante Ladegrenzen: etwa 20,45 MiB Ressourcen im damaligen Touch-Einstieg sowie
11,60 s Desktop-/19,08 s Touch-Live-Kaltstart auf der damaligen Verbindung.
Nicht als aktueller Gerätebenchmark übernehmen. A11.2 setzt reproduzierbare
Netzbedingungen und ein Releasebudget fest und optimiert vor zusätzlichem Assetumfang.

## 5. Verbindliche Qualitätstore

Für jedes Gate Commit, Profil, Datum, technische Nachweise und menschliche
Teilnehmer getrennt dokumentieren. Ergebnisse: **offen, bestanden, Nacharbeit,
Kurskorrektur**; nur Gate 4 kann bei gestrichener Progression ausdrücklich entfallen.
**G1 ist bestanden**: Der Nutzer akzeptiert den Kernprototyp grundsätzlich („ok soweit ok“) und stellt härteres Peitschengefühl sowie deutlichere Treffer ausdrücklich zur späteren Verbesserung zurück. Keine numerischen Bewertungen oder Versuchszahlen angegeben. **G2–G6 bleiben offen.** Der Nutzer trifft das abschließende
Produkturteil. Kleine Testgruppen sind Entscheidungshilfe, keine statistische Marktvalidierung.

### Drei gebündelte menschliche Spieltermine

Vom Nutzer gewählter Prüfablauf; keine zusätzlichen verpflichtenden Spieltermine
zwischen den Bulks. Technische Tests, Browserbedienung und Sicht-/Klangvorprüfung
übernimmt der Agent. Diese Beobachtungen gelten nicht als menschliches Spaßurteil.

| Termin | Zeitpunkt und Umfang | Danach zulässige Arbeit im beauftragten Abschnitt |
|---|---|---|
| **T1 — Kerngefühl, ca. 10–15 Minuten** | Nach A4: Nutzer prüft G1 mit Ziel-, Bewegungs- und Ausweichversuchen. Weitere Personen willkommen, kein Pflichttermin. | Nach positivem G1 Steinwächter, erste Mission und Vergleich bis A7.2 vorbereiten. |
| **T2 — erster vollständiger Kern, ca. 20–30 Minuten** | In A7.2: Nutzer spielt die erste Mission, mehrere Bossversuche und den vorbereiteten A/B-Vergleich einschließlich Fernkampf, sofern gewählt. G2 und G3 gemeinsam entscheiden. | Erst nach positivem Urteil weitere Maps und gegebenenfalls Modifikationsversuche bearbeiten. |
| **T3 — Mini-Kampagne und Releaseprüfung** | In A11.4: vollständiger Durchlauf, Bossdarstellung aller drei Bosse; G4-Modvergleich, falls vorhanden, G5 und G6. Externe Ersttests gehören zu derselben Abnahmephase, nicht zu weiteren Zwischenstopps für den Nutzer. | Nur bestätigten Kandidaten veröffentlichen lassen; Progressionsumsetzung weiterhin eigener Entscheid. |

Die Zeiten von T1/T2 sind Gesprächs-/Testorientierung, kein Abbruchlimit. T3 richtet
sich nach tatsächlicher Spiellänge. Nach einem negativen Befund wird der betroffene
Teil nachgebessert und gezielt erneut geprüft; die drei Termine sind kein Verzicht
auf notwendige Nachprüfung. Vor einer Änderung der freigegebenen Grundrichtung
oder bei unlösbarem technischem Blocker muss der Agent weiterhin rückmelden.

**Vorbereitung trotz offenem menschlichem Gate:** Nach technischer A5.2-Abnahme dürfen
A6 und A7 den T2-Kandidaten fertigstellen. Nach technischer A9.1-/A10.1-Abnahme
dürfen die jeweiligen Missionen folgen. Nach technischer A10.3-Abnahme dürfen
A11.1–A11.3 den T3-Kandidaten vorbereiten. G2/G3/G5 gelten dabei ausdrücklich noch
nicht als menschlich bestanden. G4 ist kein Hindernis für die Kampagne ohne
Progression: optionale Mods bleiben bis T3 sofort verfügbare Versuche, A8.3 speichert
ohne positives G4 ausschließlich Kampagnenfortschritt. Ein späterer Progressionsumbau
erfordert einen eigenen Auftrag und die erneute Prüfung seiner betroffenen Flows
vor G6-Freigabe. Ein Release ohne Progression bleibt möglich.

| Gate / zuständiger Bulk | Objektiv prüfbare Technik | Menschlicher Versuch und Bewertungsfragen | Konsequenz bei negativem Ergebnis |
|---|---|---|---|
| **G1 Bewegung und Peitsche / A4** | Dash/Kollision/Reset und 30/60/144-Hz-Regeln bestanden; jeder sichtbare Schlag zur Trefferbahn passend; keine unbeabsichtigten Mehrfachtreffer oder Schläge durch Wände | T1: Nutzer absolviert etwa 5 kurze Ziel-/Ausweichversuche. Gelingt absichtliches Treffen/Verfehlen? Fühlt sich Start/Stopp präzise an? Ist der Rücklauf verständlich? Kontrolle/Feedback auf 1–5 bewerten | A1–A4 gezielt korrigieren oder vereinfachen. Kein großer Bossumbau |
| **G2 Steinwächter / A5.2, Urteil A7.2** | Ausweich- und Gegenangriffsmöglichkeit je Angriff; fünf Exploit-Szenarien ohne dominante Gewinnstrategie; Basiswaffensieg; keine unklaren Treffer/Softlocks; sieben Kriterien zur Bossdarstellung technisch/visuell vorgeprüft | T2: mehrere Bossversuche nach Eingewöhnung. Sind Schäden erklärbar, Antworten unterscheidbar und Fortschritt spürbar? Wirkt der Boss gewichtig und charaktervoll? Wunsch nach erneutem Kampf? | Reichweite, Warnung, Rhythmus oder Darstellung nacharbeiten. Keine weiteren Bosskarten |
| **G3 vollständige erste Mission / A6.2, Urteil A7.2** | Kompletter Weg mit/ohne Reserve, Tod vor/nach Checkpoint, Kern/Relais/Ausgang und Neustart in beiden Varianten; L/A/P bestanden | T2: mindestens ein vollständiger Nutzerlauf. Sind Weg, Interaktion, Bossfreigabe und Retry verständlich? Unterbricht Anreise den Spielfluss? Unabhängiges Erstverständnis zusätzlich in T3 prüfen | Erst Mission/Läufer/Versorgung korrigieren. Keine Kampagnenerweiterung |
| **G4 Progression / A8.2, Urteil in T3** | Zwei Varianten und Basis unter gleichen Bedingungen geprüft; beobachtbare Änderung an Timing/Position/Risiko/Zielwahl; kein Stat-Grind; Basis bleibt siegfähig | T3: mindestens 3 Personen aus der Abnahmegruppe probieren Basis und Varianten in wechselnder Reihenfolge. Danach freiwilliges Zusatzfenster ohne Belohnung; tatsächliche Zusatzversuche, Auswahl und Gründe erfassen | Mods vereinfachen oder streichen; keine Progressionsumsetzung ohne positives Urteil und eigenen Auftrag |
| **G5 Mini-Kampagne / A10.3, Urteil in T3** | Alle drei Maps, Fortsetzung, Tod/Retry, Ausgang und Übungszugang funktionieren; Basiswaffensieg je Boss; sieben Darstellungskriterien je Boss vorgeprüft; keine Blocker | T3: mindestens 3 vollständige menschliche Läufe einschließlich Nutzer möglich. Sind spielerische Identität und charakteristische Bewegung je Boss benennbar? Lernkurve und Schluss überzeugend? | Betroffene Map/Bossdarstellung nacharbeiten oder Umfang ehrlich auf Demo reduzieren |
| **G6 Veröffentlichung / A11.4** | K/L/A/P/N für finalen Umfang grün; G1–G5 bestanden oder G4 ausdrücklich entfallen; keine bekannten kritischen Fehler; Browser-/Leistungs-/Rechteprüfung abgeschlossen | T3: mindestens 5 neue externe Tester über regulären Einstieg, mindestens 4 verstehen Start, Angriff, Ausweichen und Retry ohne mündliche Hilfe. Dieselben Tester dürfen G4/G5 abdecken; Fehler, Abbrüche und Wiederholungswunsch erfassen | Fixumfang begrenzen, betroffene Flows erneut prüfen, Gate offen halten; keine Veröffentlichung |

Für G1/G2/G3 sind Verständlichkeit und Kontrolle mit Zielwert mindestens 4/5 im
Nutzerurteil hilfreiche Signale; zusätzliche Teilnehmer getrennt ausweisen.
Kein Durchschnitt darf einen reproduzierbaren
Fairnessfehler überstimmen. Ein Gate besteht nur mit dokumentiertem Nutzerurteil,
keinen offenen kritischen Problemen und konkret begründeter qualitativer Bewertung.
Wenn Tester fehlen, bleibt der menschliche Nachweis offen; Bots sind kein Ersatz.

Exploit-Szenarien für G2: stationäres Dauerangreifen, Rückwärtslaufen auf Maximalreichweite,
Kreisen nahe am Bosskörper, Dauerspringen und Camping auf dem Heilplateau. Jeweils
mehrere Ausgangspositionen und mindestens drei Wiederholungen prüfen. Nicht jede
einzelne ungewöhnliche Strategie muss verlieren; wiederholtes Gewinnen ohne Reaktion
auf die Angriffssignale ist der Anlass zur Nacharbeit.

### Bossdarstellung als Teil der vorhandenen Abnahmen

Verbindliche Maßstäbe: [Bossdarstellung in der Vision](ADVENTURE_VISION.md#verbindliche-qualitätskriterien-für-die-bossdarstellung).
Je Boss werden im bestehenden Ergebnisbericht dieselben sieben Punkte mit
„bestanden / Nacharbeit“ und konkreter Sequenz-/Testreferenz geführt:

1. **Timing:** Warnung, aktive Phase, Kontaktpose und Erholung passen zu den Simulationsticks bei 30/60/144 Hz.
2. **Charakterbewegung:** Mindestens eine wiedererkennbare, zur jeweiligen Gefahr passende Bewegungsphrase.
3. **Gewicht:** Vorbereitung, beschleunigte Ausführung und Abfangen; glaubhafter Bodenkontakt statt ungewolltem Gleiten.
4. **Trefferreaktion:** Klar zuordenbar und nur bei tatsächlichem Kontakt; keine verdeckten Warnungen oder ungeplanten Regelunterbrechungen.
5. **Silhouette:** Körper, Angriffsglied und Richtung bleiben in normaler Kamera, an Rändern und bei Deckung lesbar.
6. **Sound:** Warnung, Ausführung und Treffer unterscheidbar und ereignissynchron; keine Altklänge nach Reset; stummer Versuch bleibt verständlich.
7. **Optische Konsistenz:** Stil, Materialien, Licht und Effekte passen zusammen; sichtbare Reichweite und Treffer-/Kollisionsform widersprechen sich nicht.

A5.1 prüft zunächst die Faust, A5.2 den ganzen Steinwächter; A9.1 und A10.1 prüfen
die anderen Bosse. A10.3 vergleicht alle drei im selben Darstellungsprofil.
Menschliches Urteil gebündelt in T2 beziehungsweise T3. Vorhandene Assets und
Animationstechnik nutzen; kein zusätzlicher Grafik-Bulk, keine neue Assetproduktion.

</details>

## 6. Bulks: Vergleich und grundlegendes Spielgefühl

<details>
<summary>Abgeschlossener gemeinsamer Auftrag A0.1 + A0.2 — ursprünglicher Umfang</summary>

### Gemeinsamer Auftrag A0.1 + A0.2

**Status: gemeinsam freigegeben und technisch abgeschlossen am 2.11.2026.** Die beiden
Bulk-IDs und ihre getrennten Abnahmekriterien bleiben erhalten. Der kombinierte
Auftrag endet mit dem Vergleichslabor; A1 und alle neuen Kampfmechaniken sind nicht enthalten.

**Auftrag:** Auf dem zuletzt bestätigten `main` nach Prüfung des Arbeitsbaums einen
isolierten Branch, beispielsweise `codex/adventure-combat-prototype`, verwenden.
Zuerst Referenzmanifest und zentrale Variantenwahl herstellen, anschließend einen
Entwicklungs-/Test-Direkteinstieg in den vorhandenen Adventure-Wächterhof mit
Profilwahl vor dem Versuch und Ein-Klick-Neustart bereitstellen. `legacy` und
`prototype` benutzen in diesem Auftrag dieselben bisherigen Kampfregeln.

**Ergebnis und Abnahme:**

- [x] Referenzcommit, Konstanten, Start-/Messbedingungen und erlaubte URLs dokumentiert; keine verteilten URL-Sonderfälle.
- [x] Labstart mit identischer Spieler-/Bossposition, Bossphase, 100 HP, 50 Rüstung, Reserve aus und definierten Vorräten; Arc-/Pulse-Vergleich getrennt, Pulse mit 54 Schuss.
- [x] Gleiche Eingabefolge liefert in beiden Profilen gleiche Treffer, HP, Bossphasen und numerische Bewegungsresultate bei gleichem Simulationsstart; Profilkennung darf abweichen.
- [x] Zehn Neustarts je Profil ohne Zustands-/Effektreste oder fortlaufendes Ressourcenwachstum; warmes Lab in höchstens 3 s wieder steuerbar.
- [x] Je drei stationäre und aktive Referenzversuche pro Waffe mit lokalen Messdaten; noch nicht vorhandene Dash-/Peitschenmetriken als nicht anwendbar kennzeichnen.
- [x] `npm test`, `npm run build`, Testbuild und gezielte Browserfälle bestanden; reguläre Mission einschließlich Tod/Retry/Abschluss, Arena-/andere PvE-Einstiege und Legacy-Touch unverändert.
- [x] Produktionsbuild enthält weder Labzugang noch Test-API; Laborfixture ersetzt keinen vollständigen Missionsnachweis.
- [x] Ein gemeinsamer Ergebnisbericht mit getrennten A0.1-/A0.2-Nachweisen, Testlinks, Messmanifest und bekannten Grenzen; kein automatischer Beginn von A1.

**Nicht enthalten:** Dash, Peitsche, neue Kamera, veränderte Bosskörper oder Werte,
neue Assets, Progression, Kartenumbau, öffentlicher Spiele-Release. Auch das bekannte
Durchlaufen des Boss-Sensors wird in diesem Auftrag nur dokumentiert und nicht behoben.
Kein menschlicher Spieltermin nötig; die erste verbindliche Gefühlabnahme bleibt T1 nach A4.

</details>

<a id="paket-a0-1"></a>

<details>
<summary>A0.1 — Referenz sichern und Variantenwahl begrenzen · ✅ Technisch fertig</summary>

### A0.1 — Referenz sichern und Variantenwahl begrenzen

**Status:** ✅ Technisch fertig. **Freigabe:** 2.11.2026, „ok go“ zum gemeinsamen Auftrag A0.1 + A0.2.
**Nachweis:** [A0.1 im gemeinsamen Bericht](../qa/ADVENTURE_A0_1_A0_2_RESULT.md#ergebnis-a01-abgegrenzte-variantenwahl), Implementierungscommit `f78690a`.
**Voraussetzungen:** erfüllt; sauberer `main` bei `e8b730a`, eigener Branch `codex/adventure-combat-prototype`.
**Ziel/Nutzen:** Ein neuer Einstieg kann entstehen, ohne alte Spielregeln zu verändern.
**Umfang:** Referenzmanifest und ein kleiner Kompositionspunkt; beide Profile zunächst mit identischem Gameplay. Kein Dash, keine Waffe, kein Balancewechsel.

- [x] Basiscommit, bestehende URLs, Waffen-/Boss-/Bewegungswerte und aktuelle Testbefunde festhalten.
- [x] `legacy`/`prototype` am Adventure-Einstieg auswählen; unbekannte Werte fallen auf Legacy zurück.
- [x] Standardkonstruktoren und gemeinsame Konstanten unverändert wirksam halten; Profilkennung lesbar diagnostizieren.
- [x] Ungültige Kombinationen einschließlich Arena/Frost/Glut prüfen und Referenzbericht schreiben.

**Systeme/Dateien:** `src/main.ts`, `src/app/adventureGame.ts`, `src/app/adventureVariant.ts`, `tests/adventure-variant.test.ts`; QA-Manifest. `src/core/adventureFight.ts` blieb unverändert.
**Tests/Regression:** K, L-Einstieg, A/P-Routing; gleiche numerische Startzustände beider Profile, unveränderte reguläre Mission.
**Abnahme:** Kein Unterschied in Schaden, Bewegung, Bosswerten und Missionszustand; alle bisherigen URLs behalten ihren Modus; neue Parameter wirken ausschließlich im erlaubten Adventure-Pfad.
**Risiko/Gegenmaßnahme:** Breiter Umbau der App → nur tatsächlich nötige Konstruktor-Injektion; Änderungen gemeinsamer Defaults im Diff ausdrücklich ausschließen.
**Fertig:** Routing-/Referenznachweis und Diffprüfung liegen vor; kein neues Gameplay ausgeliefert.
**Danach:** Im ausdrücklich beauftragten gemeinsamen Umfang mit A0.2 fortfahren; kein menschlicher Spieltermin erforderlich.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a0-2"></a>

<details>
<summary>A0.2 — Direkteinstieg, Retry und vergleichbare Messung · ✅ Technisch fertig</summary>

### A0.2 — Direkteinstieg, Retry und vergleichbare Messung

**Status:** ✅ Technisch fertig. **Freigabe:** 2.11.2026, gemeinsamer Auftrag A0.1 + A0.2.
**Nachweis:** [A0.2 im gemeinsamen Bericht](../qa/ADVENTURE_A0_1_A0_2_RESULT.md#ergebnis-a02-reproduzierbarer-bossversuch), Implementierungscommit `f78690a`.
**Voraussetzungen:** A0.1-Nachweis im gemeinsamen Bericht; gemeinsam beauftragter Umfang.
**Ziel/Nutzen:** Bossversuche ohne wiederholte Anreise und mit überprüfbar gleichen Startwerten.
**Umfang:** Entwicklungs-/Testlabor im bestehenden Wächterhof; eine explizite Szenario-Fixture und lokale Metriken. Regulärer Missionspfad bleibt erhalten.

- [x] Labzustand mit besiegten Läufern, Konsole, Checkpoint, Vorräten und definiertem Bossstart herstellen.
- [x] Profilwahl vor Versuch und Ein-Klick-Neustart mit vollständigem Zustand-/Effekt-/Eingabereset bereitstellen.
- [x] Startmanifest, Messbeginn und Metriken aus Abschnitt 3 aufzeichnen; Referenz-PC und Leistungsbudget dokumentieren.
- [x] Je drei stationäre und aktive Legacy-Arc-/Pulse-Versuche als Baseline aufnehmen; vollständige normale Anreise separat prüfen.

**Systeme/Dateien:** `src/app/adventureGame.ts`, `src/app/adventureLab.ts`, `tests/e2e/adventure-lab.spec.ts`, `scripts/qa/adventureBuildGuard.ts`; explizite Darstellungs-/Audioresets. Kernregeln und bestehende Missionstests unverändert.
**Tests/Regression:** K/L, N-Reset; normaler Spawn und Labstart werden nicht als derselbe Test ausgegeben; Produktionsbuild ohne Lab-/Test-API.
**Abnahme:** Zehn Neustarts liefern identische Initialzustände ohne fortlaufendes Ressourcenwachstum; beide Profile starten gleich; Einstieg bis Steuerbarkeit im bereits geladenen Lab höchstens 3 s; abweichende historische Messdefinitionen benannt.
**Risiko/Gegenmaßnahme:** Fixture verdeckt Missionsfehler → Labnachweise und vollständige Wegtests getrennt halten.
**Fertig:** Reproduzierbare Startlinks, Manifest, Messdatei und Resetnachweis vorhanden.
**Danach:** Agent prüft Bedienung; A1 nur im beauftragten Umfang, noch keine Kampfqualitätsbehauptung.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a1"></a>

<details>
<summary>A1 — Kampfansicht und gerichtetes Mausziel · ✅ Technisch fertig</summary>

### A1 — Kampfansicht und gerichtetes Mausziel

**Status:** ✅ Technisch fertig. **Spielabnahme:** G1 bestanden; jüngste Nacharbeit wird in T2 erneut geprüft. **Freigabe:** 2.11.2026, gemeinsamer Auftrag bis einschließlich A4.

**Ergänzende T2-Entscheidung:** Nutzer bestätigt wieder durchgehend Links-nach-rechts
statt der A1-Geradeausansicht, einschließlich Bossarena. Nachführung bleibt erhalten;
Zoom berücksichtigt beide projizierten Figurenhöhen. [Prüfung und öffentliche Vorschau](../qa/ADVENTURE_PUBLIC_PREVIEW_RESULT.md).
**Nachweis:** [Ergebnis A1](../qa/ADVENTURE_A1_RESULT.md).
**Ziel/Nutzen:** Richtungen und Gefahren sind bei dynamischer Bewegung zuverlässig lesbar.
**Umfang:** Ein Adventure-Kameraprofil auf vorhandener Infrastruktur, Zielrichtung und einfacher Richtungsindikator. Höchstens ein zusätzlicher Perspektivvergleich bei belegter Grenze.

- [x] Vorhandene drei Ansichten an Mitte, vier Rändern, Ecken, Plateau und Bossnähe vergleichen.
- [x] Feste Blickrichtung, begrenztes Spieler-/Boss-Framing und geglättete Übergänge abstimmen.
- [x] Mausprojektion für Boden-/Höhenziel und letztes gültiges Ziel explizit regeln; Autozielwahl der neuen Waffe nicht vorwegnehmen.
- [x] Sichtbar verdeckte Gefahren protokollieren und kleinste passende Kamera-/Verdeckungsmaßnahme testen.

**Systeme/Dateien:** `src/render/camera.ts`, `arenaView.ts`, `src/input/desktopInput.ts`, `src/core/aim.ts`, Kompositionspunkt; ggf. `neu: src/render/adventureCamera.ts`.
**Tests/Regression:** K/R, A/P bei gemeinsamen Änderungen; N-Projektion und reale Mausbewegung bei 1366×768/1920×1080, gleiche Kameraposen vor/nachher.
**Abnahme:** Kein unbegründeter sprunghafter Zielwechsel; Mausprojektion folgt der tatsächlich dargestellten Kamera, eine bereits gebundene Schlagrichtung bleibt davon unabhängig. Spieler/Boss und unmittelbare Gefahr sind in definierten Kampfsituationen lesbar; keine automatische Rotation, die WASD umkehrt.
**Risiko/Gegenmaßnahme:** Zoom verliert Figur oder Höhenziel → Zoomgrenzen und explizite Fälle; Schulterkamera nicht als Nebenarbeit einführen.
**Fertig:** Ein begründetes Standardprofil, Vergleichsaufnahmen und Projektionsnachweise liegen vor.
**Danach:** Technische Sicht-/Kontrollprüfung durch Agent; menschliches Urteil gebündelt in T1/G1.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a2-1"></a>

<details>
<summary>A2.1 — Bosskörper und faire Bewegungsgrenzen · ✅ Technisch fertig</summary>

### A2.1 — Bosskörper und faire Bewegungsgrenzen

**Status:** ✅ Technisch fertig. **Spielabnahme:** G1 bestanden; jüngste Nacharbeit wird in T2 erneut geprüft. **Freigabe:** 2.11.2026, gemeinsamer Auftrag bis einschließlich A4.
**Nachweis:** [Ergebnis A2.1](../qa/ADVENTURE_A2_1_RESULT.md).
**Ziel/Nutzen:** Positionierung bleibt glaubwürdig; Spieler und Boss überlagern sich nicht beliebig.
**Umfang:** Prototyp-only Körperform des aktiven Steinwächters und definierte Kontaktauflösung; keine Bossattacken oder Kontakt-Schäden ändern.

- [x] Treffer-Sensor und Bewegungsblocker mit klaren Filtern trennen; Körperform sichtbar diagnostizieren.
- [x] Spielerbewegung gegen ruhenden und bewegten Boss begrenzen, ohne ihn durch Wände zu schieben.
- [x] Begegnung an Wänden, Ecken, Plateau und beim Auftauchen/Defeat prüfen; einen ausführbaren Fluchtweg erhalten.
- [x] Eigentreffer, Navigation gegen eigenen Collider sowie Restblocker nach Tod/Retry ausschließen.

**Systeme/Dateien:** `src/physics/rapierWorld.ts`, `src/core/pve.ts`, `src/app/adventureGame.ts`, Lab-/Encounterprofil; neue gezielte Körperkontakt-Tests.
**Tests/Regression:** K/R/A/P, N-Kontakt aus vier Richtungen und zehn Resets; alte Sensorregeln im Legacy erhalten.
**Abnahme:** Keine Körperdurchquerung oder dauerhaft festgesetzte Spielfigur in den definierten Fällen; Treffer und Bosspfade bleiben gültig; keine unsichtbare zurückbleibende Sperre.
**Risiko/Gegenmaßnahme:** Solider Boss erzeugt neue Einklemmung → einfache Bodenform, überprüfbare Kontaktregel; kein komplexes Ragdoll-/Rigid-Body-System.
**Fertig:** Körper-/Trefferformen und Kontaktregeln sind dokumentiert und im realen Browser geprüft.
**Danach:** Agent prüft Grenzfälle; menschliches Kontaktgefühl in T1, A2.2 nur im beauftragten Umfang.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a2-2"></a>

<details>
<summary>A2.2 — Gerichteter Dash und unmittelbare Bewegung · ✅ Technisch fertig</summary>

### A2.2 — Gerichteter Dash und unmittelbare Bewegung

**Status:** ✅ Technisch fertig. **Spielabnahme:** G1 bestanden; jüngste Nacharbeit wird in T2 erneut geprüft. **Freigabe:** 2.11.2026, gemeinsamer Auftrag bis einschließlich A4.
**Nachweis:** [Ergebnis A2.2](../qa/ADVENTURE_A2_2_RESULT.md).
**Ziel/Nutzen:** Ausweichen wird eine präzise, begrenzte Handlung.
**Umfang:** Ein Bodendash als Sprintalternative im Prototyp; Boden-Sprungkurve bleibt Basis. Später ausdrücklich beauftragte T2-Nacharbeit: ein kürzerer Luftsprung pro Landung, kein Luftdash oder Immunitätsfenster.

- [x] Dashbeginn auf Tastendruck, Richtung, Dauer, Reichweite und Wiederaufladung als Profil definieren.
- [x] Stillstand/Richtungswechsel vergleichen; Beschleunigung nur bei nachgewiesenem Vorteil verändern.
- [x] Bewegung durch vorhandene Kollisionsprüfung führen; Sprung-/Boden-/Abgrundverhalten festlegen.
- [x] Kleinen Bereitschaftshinweis und lesende Zeitmessung ergänzen; Pause, Tod und Retry vollständig zurücksetzen.
- [x] T2-Nacharbeit: Luftsprung nur auf neue Eingabe; kein Nachladen an Decken oder durch Pause, kein dritter Sprung. Geschlossene Missionssperren, Frameraten und Touch-Mehrfingereingaben erneut prüfen. [Nachweis](../qa/ADVENTURE_AIR_RESULT.md).

**Systeme/Dateien:** `src/core/simulation.ts`, `types.ts`, `movementProfile.ts`, `src/input/desktopInput.ts`, `src/app/adventureGame.ts`; ggf. kleines Adventure-Movement-Modul.
**Tests/Regression:** K/R/A/P; N für diagonale Richtung, gehaltene Taste, Cooldown, Wände/Treppen/Boss und 30/60/144 Hz.
**Abnahme:** Ohne Hindernis gleiche Strecke innerhalb 5 cm und gleicher Tickdauer in der Testmatrix; keine Wiederholung durch Halten; Beginn spätestens im nächsten zulässigen Simulationstick; bisherige Sprungrouten erreichbar.
**Risiko/Gegenmaßnahme:** Dash ersetzt jede Reaktion → zunächst keine I-Frames, Luftdash oder zweite Ladung; unterschiedliche Bossantworten später prüfen.
**Fertig:** Werteprofil, Reset-/Kollisionsnachweise und kurze Vergleichssequenz vorhanden.
**Danach:** Technischen Bewegungsvergleich dokumentieren; menschlicher Vergleich in T1/G1, kein zusätzlicher Zwischenstopp.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a3"></a>

<details>
<summary>A3 — Energiepeitsche: räumliche Angriffsregeln · ✅ Technisch fertig</summary>

### A3 — Energiepeitsche: räumliche Angriffsregeln

**Status:** ✅ Technisch fertig. **Spielabnahme:** G1 bestanden; jüngste Nacharbeit wird in T2 erneut geprüft. **Freigabe:** 2.11.2026, gemeinsamer Auftrag bis einschließlich A4.
**Nachweis:** [Ergebnis A3](../qa/ADVENTURE_A3_RESULT.md).
**Ziel/Nutzen:** Gerichtete Schläge machen Reichweite, Position und Zeitpunkt relevant.
**Umfang:** Ursprünglich eine Grundattacke mit Vorschwung/Rücklauf; in der freigegebenen T2-Nacharbeit zusätzlich der direkt gewählte Überkopf-Knall und der kontextabhängige Lufthieb. Alle nutzen dieselbe räumliche Schadensschnittstelle; keine Mods oder neue Waffen.

- [x] Phasen, Eingabe, Richtungsbindung und eine kontrollierte 3D-Kurve definieren.
- [x] Überstrichene Bahn zwischen Ticks prüfen; Weltblocker, Höhe und mehrere mögliche Ziele berücksichtigen.
- [x] Treffer je Ziel/Schlagphase begrenzen; Rücklauf besitzt ein eigenes Trefferfenster.
- [x] Bewegung während Angriff sowie Dash-Abbruch festlegen; ausstehenden Schaden bei Abbruch/Tod/Retry löschen.
- [x] Testziele mit Distanzen/Winkeln, Deckung und unterschiedlichen Höhen bereitstellen.
- [x] T2-Nacharbeit: schmaler Überkopfschlag mit eigenem Ausholen/Einzeltreffer/Erholung; Rechtsklick ohne Wiederholung durch Halten, keine Angriffswarteschlange, Dash-Abbruch überspringt die Erholungszeit nicht. [Nachweis](../qa/ADVENTURE_WHIP_MOVES_RESULT.md).
- [x] Ergänzender T2-Auftrag: gerichteter Abwärtshieb aus normalem Sprung und Doppelsprung, höchstens ein Treffer pro Ziel; reale Höhe und Deckung beachten, Erholung nicht durch Luftsprung zurücksetzen. Eigene Körperpose und violette Spur aus vorhandener Darstellung. [Nachweis](../qa/ADVENTURE_AIR_RESULT.md).

**Systeme/Dateien:** `src/core/energyWhip.ts`, `tests/adventure-prototype.test.ts`; `src/core/combat.ts` nur Schnittstelle, `aim.ts`, Physikadapter, Kompositionspunkt, einfache Renderbahn.
**Tests/Regression:** K/R/A/P, N für treffen/verfehlen, zwischen Ticks kreuzendes Ziel, Wand, Höhenversatz, Rücklauf, Abbruch und Mehrfachtreffer; Frameratevergleich.
**Abnahme:** Schaden nur bei aktiver durchlaufender Bahn; höchstens ein Treffer pro Ziel und Phase; keine unsichtbare Rundum-Zielwahl; absichtlicher Fehlschlag reproduzierbar.
**Risiko/Gegenmaßnahme:** Grobe Sektoren oder dünne Strahlen täuschen Präzision vor → Debugbahn und Kollisionsvolumen gemeinsam prüfen, Abtastung nach Bewegung begrenzen.
**Fertig:** Regeltests und sichtbarer Browserversuch stimmen überein; alte Arc bleibt unverändert.
**Danach:** Agent prüft Funktion im Browser, A4 nur im beauftragten Umfang; menschliche Spielgefühlabnahme in T1.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a4"></a>

<details>
<summary>A4 — Peitschenbewegung, Kontaktfeedback und Gate 1 · ✅ Technisch fertig</summary>

### A4 — Peitschenbewegung, Kontaktfeedback und Gate 1

**Status:** ✅ Technisch fertig. **Spielabnahme:** G1 bestanden; jüngste Nacharbeit wird in T2 erneut geprüft. **Freigabe:** 2.11.2026, gemeinsamer Auftrag bis einschließlich A4.
**Nachweis:** [Ergebnis A4](../qa/ADVENTURE_A4_RESULT.md).
**Ziel/Nutzen:** Die funktionierende Attacke wird als eigenständige, befriedigende Peitsche wahrgenommen.
**Umfang:** Spielerpose, kontrollierte Energieform, Kontaktreaktionen und wenige Sounds; keine neue Attackenregel ohne eigenen dokumentierten Korrekturumfang.

- [x] Geeignete vorhandene Clips oder begrenzte prozedurale Oberkörperbewegung mit Handslot verbinden.
- [x] Animation und sichtbare Spitze an Simulationsphasen koppeln, Vorschwung/Rücklauf unterscheiden.
- [x] Fehlschlag, Kontakt und Rücktreffer akustisch/visuell trennen; Gegnerwarnungen priorisieren.
- [x] Effekte begrenzen, Pause/Retry/30-Hz-Darstellung technisch prüfen.
- [x] Qualitative T1-Rückmeldung dokumentiert: Grundprototyp akzeptiert, G1 bestanden; keine Punktbewertung oder Versuchszahl behauptet.
- [x] Nicht blockierender Feinschliff vor T2 technisch umgesetzt (Wirkung in T2 prüfen): Peitsche knackiger/härter wirken lassen und tatsächliche Treffer deutlicher zeigen. Zuerst Schwungabschluss/Rückschnappen, Kontaktsound und kurze Gegnerreaktion prüfen; kein pauschaler Schadensbonus. Kein neuer Bulk.
- [x] Zusätzliche T2-Nacharbeit: schmaler heller Kern, farbiger Energiesaum, auslaufende Spitze, kurze Leuchtspur, gestalteter Griff, eigene Überkopfpose/-klänge und getrennte Panzer-/Kerntreffer. Wirkung und sinnvolle Angriffswahl bleiben menschlich zu prüfen.

**Systeme/Dateien:** `src/render/kayFighter.ts`, `arenaView.ts`, `src/app/stoneFeedback.ts`; `src/render/energyWhipView.ts`; passende Browser-/Performancefälle.
**Tests/Regression:** K/N sowie A bei gemeinsamem Rig; zehn Retries, stummes Spiel, reduzierte Effekte, sichtbare Bahn gegen tatsächliche Treffer vergleichen.
**Abnahme:** G1 bestanden; keine Warnungsverdeckung, keine visuell nachlaufenden Treffer; Leistungsbudget eingehalten oder dokumentiert nachgebessert.
**Risiko/Gegenmaßnahme:** Glanz verdeckt Mechanik → erst Silhouette/Timing/Sound, einzelne optionale Trefferpause separat vergleichen.
**Fertig:** Technische Nachweise und ausdrückliches menschliches G1-Urteil vorliegend.
**Danach:** Bei negativem Gate Nacharbeit an A1–A4; erst bei positivem Ergebnis A5.1 gesondert freigeben.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

## 7. Bulks: Steinwächter, Mission und Richtungsentscheidung

<a id="paket-a5-1"></a>

<details>
<summary>A5.1 — Faustschlag und echtes Gegenangriffsfenster · ✅ Technisch fertig</summary>

### A5.1 — Faustschlag und echtes Gegenangriffsfenster

**Status:** ✅ Technisch fertig. **Spielabnahme:** T2-Urteil offen. [Nachweis](../qa/ADVENTURE_A5_A7_RESULT.md). **Voraussetzungen:** G1 bestanden, eigener Auftrag.
**Ziel/Nutzen:** Ein einzelner Bossangriff erzeugt einen verständlichen Wechsel aus Gefahr, Ausweichen und Gegenangriff.
**Umfang:** Nur Prototyp-Faust, zugehörige Annäherung und Erholung. Spezialangriffe im Einzelangriffslabor deaktivierbar, im Legacy unverändert.

- [x] Warnpose, feste Schlagrichtung, Trefferform und aktive Zeit gemeinsam definieren.
- [x] Ausweichen durch normale Bewegung und Dash prüfen; Sprungantwort bewusst dokumentieren.
- [x] Rückweg in Waffenreichweite in die Erholung einrechnen; mindestens einen gezielten Gegenangriff ermöglichen.
- [x] Reichweiten-Kreisen untersuchen; höchstens einen angekündigten Angriffsschritt bei belegtem Bedarf ergänzen.
- [x] Die sieben Kriterien zur Bossdarstellung an der Faustsequenz prüfen; Timing, Gewicht und Reaktion durch Sequenz-/Ticknachweis belegen.

**Systeme/Dateien:** `src/core/pve.ts`, `src/render/monsterView.ts`, Encounterprofil, Lab und Feedback; ggf. `neu: src/core/adventureBoss.ts` als begrenzte Erweiterung.
**Tests/Regression:** K/N, P; Trefferfläche und Pose, festgelegte Richtung, Ausweichen mit dokumentiertem Reaktionsverzug, Körper-/Wandkontakt und echte Annäherung testen.
**Abnahme:** Eine sichtbare Gefahr trifft genau in ihrer aktiven Phase; eine ausführbare Reaktion und ein Gegenangriff mit Basiswaffe sind numerisch und im Browser nachgewiesen; kein heimliches Nachdrehen.
**Risiko/Gegenmaßnahme:** Erholung funktioniert nur bei perfektem Abstand → mehrere Startwinkel/-distanzen und menschliche Versuche; nicht nur ideale Testposition.
**Fertig:** Eine reproduzierbare Faustsequenz samt Timingdiagramm oder Ticktabelle und Spielaufnahme liegt vor.
**Danach:** Einzelnen Austausch für T2 dokumentieren; A5.2 im beauftragten Umfang vorbereiten, G2 menschlich noch offen.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a5-2"></a>

<details>
<summary>A5.2 — Spezialangriffe, Kampfrhythmus und Gate 2 · ✅ Technisch fertig</summary>

### A5.2 — Spezialangriffe, Kampfrhythmus und Gate 2

**Status:** ✅ Technisch fertig. **Spielabnahme:** T2-Urteil offen. [Nachweis](../qa/ADVENTURE_A5_A7_RESULT.md). **Voraussetzungen:** A5.1, eigener Auftrag.
**Ziel/Nutzen:** Der Steinwächter trägt einen vollständigen fairen Kampf.
**Umfang:** Vorhandene Welle/Ausbruch, begrenzte Angriffsfolge, lesbare Übergänge und Bossfeedback. Keine zusätzlichen Gegner oder generische Boss-Engine.

- [x] Welle als Sprung-/Deckungsaufgabe und Ausbruch als Ortswechsel erhalten; Dash-Durchquerung ausdrücklich prüfen.
- [x] Keine unlösbaren Überschneidungen mit Faust, Dash-Cooldown, Arena-Ecken oder Plateau erzeugen.
- [x] Gegenangriffsfenster und eine begrenzte Kombination abstimmen; erst danach HP/Schaden kalibrieren.
- [x] Die fünf G2-Exploit-Szenarien durchführen; Dauer, Phasen und Schadensursachen aufzeichnen.
- [x] Technische G2-Fälle und sieben Darstellungskriterien am vollständigen Boss vorprüfen; Sequenzen und Fragen für T2 vorbereiten, belegte Fehler nacharbeiten.

**Systeme/Dateien:** Prototyp-Encounter/Profil, `src/core/bossNavigation.ts` nur bei konkretem Befund, `src/render/monsterView.ts`, `src/app/stoneFeedback.ts`; Boss-/Browsertests.
**Tests/Regression:** K/N/P; Sprung, Deckung, feste Ausbruchposition, einmaliger Schaden, Extremnähe, Höhen und Retry; Profilvergleich zum Legacy.
**Abnahme:** Technische G2-Kriterien und Darstellungsvorprüfung bestanden; Basiswaffe siegfähig; mehrere lesbare Angriffswechsel ohne dominante reaktionslose Strategie. 45–90 s auswerten, Abweichung begründen; menschliches G2-Urteil folgt T2.
**Risiko/Gegenmaßnahme:** Neues Tempo kaschiert schlechte Warnung → Warnung/Form vor Schaden prüfen; maximal vorhandene Attacken plus freigegebener Schritt.
**Fertig:** Bossbericht mit technischen Fällen, sieben Darstellungskriterien und vorbereiteten T2-Sequenzen; menschlicher Gate-Status ausdrücklich offen.
**Danach:** A6.1 zur Vorbereitung von T2 im beauftragten Umfang möglich; Frost/Glut erst nach positivem T2-Urteil.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a6-1"></a>

<details>
<summary>A6.1 — Steinläufer und vorhandene Versorgung · ✅ Technisch fertig</summary>

### A6.1 — Steinläufer und vorhandene Versorgung

**Status:** ✅ Technisch fertig. **Spielabnahme:** T2-Urteil offen. [Nachweis](../qa/ADVENTURE_A5_A7_RESULT.md). **Voraussetzungen:** A5.2 technisch abgeschlossen, G1 bestanden, beauftragter Umfang; G2-Urteil wird in T2 gebündelt.
**Ziel/Nutzen:** Die Anreise lehrt dieselben räumlichen Regeln und unterstützt den Bossversuch.
**Umfang:** Beide vorhandenen Läufer, ihre Körper-/Trefferregeln und vorhandene Vorräte im Prototyp; keine neue Gegnerart oder zusätzlichen Räume.

- [x] Peitschenkontakt, Reaktion, Tod und territoriale Verfolgung der Läufer anpassen.
- [x] Prüfen, ob die beiden Begegnungen gerichtetes Angreifen lehren, ohne den Weg unnötig zu verlängern.
- [x] Pulse-Fund/Munition bis A7 eindeutig behandeln: in der isolierten Nahkampfvariante nicht als nötige neue Waffe anbieten; Legacy unverändert.
- [x] Heilung, Reserve und Checkpoint mit festen, dokumentierten Werten prüfen; keine wiederholbare Heil-/Ressourcenschleife schaffen.

**Systeme/Dateien:** `src/core/stoneRunner.ts`, `adventureFight.ts`, Prototyp-Versorgungsprofil, `src/render/kayGuard.ts`, `src/arena/stoneAdventure.ts` nur opt-in Datenzugang, HUD-Hinweise.
**Tests/Regression:** K/N/L, A bei Rigänderung; Höhen/Deckung, Fern-Aggro im Legacy, zwei Läufertode, einmalige Funde und Reset.
**Abnahme:** Beide Läufer mit Basiswaffe erreichbar besiegbar; keine falschen Waffen-/Munitionshinweise; Reserve bleibt optional, Bossstart ohne sie tragfähig.
**Risiko/Gegenmaßnahme:** Peitsche trifft beide Kämpfe ohne Positionierung → Winkel/Abstand prüfen, nicht mehr Gegner ergänzen; Vorräte nicht zu versteckten Pflicht-Upgrades machen.
**Fertig:** Anreisegefechte und Versorgungsregeln im regulären Weg geprüft und beschrieben.
**Danach:** Agent prüft Anreise; menschliche Missionsabnahme in T2/G3, A6.2 im beauftragten Umfang vorbereiten.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a6-2"></a>

<details>
<summary>A6.2 — Vollständige erste Mission und Gate 3 · ✅ Technisch fertig</summary>

### A6.2 — Vollständige erste Mission und Gate 3

**Status:** ✅ Technisch fertig. **Spielabnahme:** T2-Urteil offen. [Nachweis](../qa/ADVENTURE_A5_A7_RESULT.md). **Voraussetzungen:** A6.1, eigener Auftrag.
**Ziel/Nutzen:** Der neue Kampf funktioniert innerhalb des bestehenden Adventure-Ablaufs.
**Umfang:** Konsole, Checkpoint, Retry, Kern, Relais, Tor, Ergebnis und Spielerführung; nur durch Tests belegte Anpassungen, kein Quest-Neubau.

- [x] Kompletten Weg mit/ohne Wartungsreserve vom normalen Spawn spielen.
- [x] Tod vor Checkpoint und beim Boss, Retry, Levelneustart und Pause/Fokusverlust prüfen.
- [x] Bossfreigabe, Eingangsversiegelung, Kernaufnahme, Relais und physischen Ausgang erhalten.
- [x] Kurze Hinweise auf neue Bedienung abstimmen; Erkundung/Interaktion von Angriffseingaben trennen.
- [x] Alte und neue Mission sowie Arena/PvE regressieren; technische G3-Nachweise und regulären T2-Einstieg vorbereiten.

**Systeme/Dateien:** `src/app/adventureGame.ts`, `src/core/adventureFight.ts`, `src/arena/adventureMission.ts`, Missions-/HUD-Ansichten, `tests/e2e/adventure-fight.spec.ts`, `adventure-acceptance.spec.ts`.
**Tests/Regression:** K/L/A/P/N; vollständige echte Eingaben zusätzlich zu Lab-Fixtures; Legacy-Touch und Desktop prüfen.
**Abnahme:** Technische G3-Kriterien bestanden; alle vorgesehenen Enden/Neustarts erreichbar, kein aus dem Lab übernommener Fortschritt; kein verpflichtender Vorratsumweg. Menschliches Urteil in T2.
**Risiko/Gegenmaßnahme:** Neue Waffe löst Interaktionen aus oder Retry vergisst Phasen → Eingaben/Zustände explizit zurücksetzen, Start und Enden nicht nur per Button-Präsenz testen.
**Fertig:** Vollständiger technischer Missionsnachweis mit bekannten Grenzen; menschliches G3 ausdrücklich noch offen.
**Danach:** A7.1 im freigegebenen Abschnitt vorbereitet; noch keine automatische Einführung der neuen Variante als Standard.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a7-1"></a>

<details>
<summary>A7.1 — Begrenzte Fernkampfoption vergleichen · ✅ Technisch fertig</summary>

### A7.1 — Begrenzte Fernkampfoption vergleichen

**Status:** ✅ Technisch fertig. **Spielabnahme:** T2-Urteil offen. [Nachweis](../qa/ADVENTURE_A5_A7_RESULT.md). **Voraussetzungen:** A5.2/A6.2 technisch abgeschlossen, G1 bestanden, beauftragter Umfang; menschliches G2/G3 in T2.
**Ziel/Nutzen:** Entscheiden, ob der Nahkampfkern durch ein kleines Fernwerkzeug spielerisch gewinnt.
**Umfang:** Peitsche allein gegen Peitsche plus eine begrenzte Pulse-Konfiguration, zunächst im Lab. Keine zusätzliche Hauptwaffe, neue Assets oder Upgradeökonomie.

- [x] Taktische Aufgabe und Begrenzung vorab definieren, etwa wenige Schüsse pro Versuch; Schäden/Ressourcen offen protokollieren.
- [x] Vorhandene Projektil-/Aimtechnik wiederverwenden, Profile und Resets trennen.
- [x] Gleiche Boss-/Startbedingungen prüfen; Maximaldistanz, Dauerfeuer und Waffenauswahl beim Dash testen.
- [x] Technischen A/B-Vergleich durchführen und menschliche Läufe mit wechselnder Reihenfolge für T2 vorbereiten; Nutzenhypothese und zusätzliche Bedienlast festhalten.

**Systeme/Dateien:** Kompositionspunkt, Prototyp-Waffenadapter, bestehende `Combat`-Instanz ohne globale Wertmutation, HUD/Inputs, Labtests; Vergleichsbericht.
**Tests/Regression:** K/R/N/L; kein Munitions-/Cooldown-Reset durch Wechsel, keine Geschosse nach Tod/Retry, Basisvariante weiterhin siegfähig.
**Abnahme:** Reproduzierbarer Vergleich mit dokumentierten Ressourcen; klare Empfehlung beibehalten/ändern/streichen und mindestens eine belegte taktische Entscheidung, falls Beibehaltung empfohlen wird.
**Risiko/Gegenmaßnahme:** Mehr Gesamtschaden wirkt automatisch „besser“ → Gegenangriffsmöglichkeiten, Risiko und Zeitanteil aus sicherer Entfernung getrennt bewerten.
**Fertig:** Vergleich und Empfehlung vorliegend; keine voreilige Produktfestlegung.
**Danach:** Menschlicher Vergleich und endgültige Richtungsentscheidung gemeinsam in A7.2/T2; kein zusätzlicher Termin.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a7-2"></a>

<details open>
<summary>A7.2 — Gesamtvergleich und verbindlicher Richtungsentscheid · 🟡 JETZT: Spieltest T2 läuft</summary>

### A7.2 — Gesamtvergleich und verbindlicher Richtungsentscheid

**Status:** 🟡 Spieltest T2 läuft; menschlicher Gesamtentscheid und G2/G3 ausdrücklich offen. [Testablauf und Empfehlung](../qa/ADVENTURE_A5_A7_RESULT.md#spieltermin-t2). **Voraussetzungen:** A7.1 oder ausdrücklicher begründeter Verzicht; G1 bestanden, technische G2/G3-Nachweise vorhanden, beauftragter Umfang.
**Ziel/Nutzen:** Vor weiteren Inhalten klären, ob die Neuausrichtung trägt.
**Umfang:** Testorganisation, Befundauswertung, Scope-/Produktentscheidung und Dokumentation. Codekorrekturen nur als separat begrenzter Folgeauftrag.

- [ ] T2 mit dem Nutzer durchführen: vollständige erste Mission und mehrere Boss-/A/B-Versuche nach Eingewöhnung; Reihenfolge wechseln. Weitere Tester optional, unabhängige Ersttests folgen T3.
- [ ] Erste Mission in der empfohlenen Waffenvariante prüfen; bei geänderter Ausstattung betroffene G3-Fälle erneut abnehmen.
- [ ] Kontrolle, Lesbarkeit, Schadensverständnis, Schwierigkeit, freiwillige Wiederholung und beobachtete Strategien gegenüberstellen.
- [ ] Entscheidung festhalten: fortsetzen, gezielte Nacharbeit, vereinfachen oder verwerfen; Fernkampf und vorläufigen Progressionsumfang ausdrücklich benennen.
- [ ] G2 einschließlich der sieben Bossdarstellungskriterien und G3 in diesem Termin menschlich entscheiden; vor positivem Gesamturteil keine weiteren Maps beginnen.

**Systeme/Dateien:** Berichte/Versuchsprotokolle, diese Roadmap und `ADVENTURE_VISION.md`; vorhandene Lab-/Missionseinstiege. Kein neuer Gameplay-Code als Teil der Auswertung.
**Tests/Regression:** Geprüften Codecommit und G1–G3-Nachweise referenzieren; menschliche Versuche getrennt von automatisierten Replays auswerten.
**Abnahme:** Nutzerentscheid mit Begründung und klarer ausgewählter Variante; keine offenen kritischen Regel-/Fairnessprobleme bei „fortsetzen“; negative Befunde bleiben sichtbar.
**Risiko/Gegenmaßnahme:** Neuigkeitseffekt oder bereits geübte Tester → Reihenfolge wechseln, Vorerfahrung erfassen, mindestens einen unbekannten Missionslauf einbeziehen.
**Fertig:** Richtungsentscheid dokumentiert, Gate- und Variantenstatus aktualisiert; auch begründetes Verwerfen ist ein vollständiges Entscheidungsergebnis.
**Danach:** Nur nach positivem Entscheid neue Inhalte freigeben. Optional A8.1; unabhängig davon A8.3/A9.1 möglich. Kein automatischer öffentlicher Release.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

## 8. Bulks: optionale Modifikationen und kleine Kampagnenverwaltung

<a id="paket-a8-1"></a>

<details>
<summary>A8.1 — Zwei verhaltensändernde Modifikationen erproben · ⬜ Nicht begonnen · optional</summary>

### A8.1 — Zwei verhaltensändernde Modifikationen erproben

**Status:** ⬜ Nicht begonnen (geplant, optional). **Voraussetzungen:** A7.2 positiv und ausdrücklicher Modifikationsauftrag.
**Ziel/Nutzen:** Unterschiedliche Entscheidungen mit derselben Waffe statt Zahlenprogression.
**Umfang:** Basis plus höchstens zwei Alternativen, ein Auswahlplatz vor dem Versuch, zunächst alles im Lab verfügbar. Kein Save, Zufall, Loot oder Ressourcenverbrauch.

- [ ] Rückhaken und Gabelspitze auf je einen mechanischen Unterschied mit Kosten/Nachteil begrenzen.
- [ ] Zeit-/Raumverhalten und Schadensbudget pro Variante festlegen; keine stapelbaren Kombinationen.
- [ ] Basis, Variante 1 und Variante 2 am selben Boss vergleichen; Wechsel nur zwischen Versuchen.
- [ ] Je Variante eine beobachtbare Änderung von Timing, Position, Risiko oder Zielwahl nachweisen; reine Schadens-/Zeitverbesserung genügt nicht.
- [ ] Treffer-/Reset-/Unterbrechungsfälle für beide Varianten ergänzen, Aufwand und unklare Vorteile protokollieren.

**Systeme/Dateien:** `src/core/energyWhip.ts` (nach A3), Peitschenansicht, Lab-Auswahl, Modifikations-Regeltests; keine allgemeine Inventararchitektur.
**Tests/Regression:** K/N; Rücklauf-/Gabeltreffer je Phase begrenzt, keine kostenlose zusätzliche volle Schadensladung; Basiswaffensieg und zehn Resets.
**Abnahme:** Beide Varianten verändern eine beschreibbare Handlung; mindestens ein erkennbarer Nachteil/Tausch je Variante; drei Profile ohne Zustandsübernahme wechselbar.
**Risiko/Gegenmaßnahme:** Eine Variante dominiert alles → Reichweite, Bindung oder Abdeckung als Tausch; bei ausbleibendem Nutzen Kandidat streichen statt weitere Mods hinzufügen.
**Fertig:** Zwei begrenzte Versuche oder dokumentiert verworfene Kandidaten samt Kosten-/Nutzenbefund.
**Danach:** Menschliche Stil-/Wiederholungsprobe für T3 vorbereiten; noch keine dauerhaften Freischaltungen.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a8-2"></a>

<details>
<summary>A8.2 — Progressionsmodell wählen oder streichen, Gate 4 · ⬜ Nicht begonnen · optional</summary>

### A8.2 — Progressionsmodell wählen oder streichen, Gate 4

**Status:** ⬜ Nicht begonnen (geplant, optional). **Voraussetzungen:** A8.1, eigener Auftrag; bei Verzicht auf Mods entfällt dieser Bulk nach dokumentierter Scope-Entscheidung.
**Ziel/Nutzen:** Wiederholung verbessern, ohne Grind oder unnötige Verwaltung einzuführen.
**Umfang:** Vergleich ohne Progression gegen deterministische Meilensteinfreischaltung und Auswahl pro Versuch; Entscheidung, keine Ressourcenökonomie.

- [ ] Basis-/Mod-Versuche gemäß G4 für T3 vorbereiten: gleiche Startbedingungen, wechselnde Reihenfolge, alle Varianten sofort zugänglich.
- [ ] In T3 nach Pflichtversuchen ein freiwilliges Zusatzfenster ohne Freischaltung/Belohnung anbieten; Zusatzversuche, Variantenwahl und Gründe erfassen, geäußerte Absicht getrennt berichten.
- [ ] Freischaltung nach Boss 1/2 versus sofortige Auswahl beurteilen; gescheiterte Versuche niemals kostenpflichtig machen.
- [ ] Genau ein Modell oder vollständigen Verzicht festhalten; Basis bleibt wählbar, Tod verliert keine Freischaltungen.
- [ ] G4-Entscheid, spätere All-Boss-Balancepflicht und möglichen Kürzungsumfang dokumentieren.

**Systeme/Dateien:** Mod-Auswahl nur bei erforderlichem kleinen Test, ansonsten Vision/Roadmap/QA-Protokoll; Persistenz gehört zu A8.3.
**Tests/Regression:** Identischen geprüften Build verwenden; bei kleiner Test-UI Codeprüfung K/N, kein Gameplay durch simulierte Belohnungszahlen behaupten.
**Abnahme:** G4 bestanden oder ausdrückliche Streichung; mindestens drei menschliche Vergleichsbefunde; keine Pflicht zum Wiederholen leichter Begegnungen für Stärke.
**Risiko/Gegenmaßnahme:** Freischalten fühlt sich kurzfristig gut an, Kampf bleibt gleich → Varianten zuerst ohne Freischaltung testen; Spielstil und Motivation getrennt bewerten.
**Fertig:** Nach T3 liegt die Nutzerentscheidung samt genauer Freischalt-/Auswahlregel oder Wegfall vor. Bis dahin bleibt dieser Entscheidungsbulk in Arbeit, sobald seine Vorbereitung beauftragt ist.
**Danach:** Kein Hindernis für die übrige Kampagne ohne Progression; eine tatsächliche Progressions-/Mod-Speicherung erst nach positivem G4 und eigenem Auftrag, anschließend betroffene Releasefälle erneut prüfen.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a8-3"></a>

<details>
<summary>A8.3 — Kampagnenfortsetzung und Bossübung · ⬜ Nicht begonnen</summary>

### A8.3 — Kampagnenfortsetzung und Bossübung

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A7.2 positiv; für gespeicherte Mods zusätzlich positiver A8.2-Entscheid, sonst ohne Mods; eigener Auftrag.
**Ziel/Nutzen:** Eine kleine Mehrkartenkampagne lässt sich fortsetzen und gezielt üben.
**Umfang:** Kleine Level-/Freischaltverwaltung und versionierter lokaler Save; vorhandene Sitzungs-Checkpoints weiterverwenden. Keine Speicherung mitten in Bossanimationen.

- [ ] Nur abgeschlossene Maps, nächsten Einstieg, besiegte Übungsbosse und gegebenenfalls bestätigte Mod-IDs speichern.
- [ ] Eigenen Adventure-Namespace und getrennte Prototyp-/Legacy-Daten verwenden; unbekannte/defekte Daten sicher behandeln.
- [ ] Fortsetzen am Mapstart beziehungsweise freigegebenen sicheren Einstieg, Neustart mit klarer Bedeutung und Bossübung mit festen Ressourcen anbieten.
- [ ] Reload, verweigerten Speicher, Versionswechsel und doppelte Abschlussereignisse prüfen; Speicherfehler dürfen laufendes Spiel nicht blockieren.

**Systeme/Dateien:** `src/arena/campaign.ts`, Adventure-App/Missionszustand; `neu: src/core/adventureCampaign.ts`, `src/app/adventureSave.ts`, zugehörige Tests. Keine generische Save-Engine.
**Tests/Regression:** K/L/A/P/N, Browser Reload/Fortsetzen, beschädigter/leerer Speicher, keine Überschreibung fremder Schlüssel; Mods nur bei gewähltem Umfang.
**Abnahme:** Ein Abschluss wird genau einmal gewertet; Fortsetzen/Üben führen in gültige Zustände; Basiswaffe immer wählbar; ohne Speicher läuft die Sitzung weiter; Arena-/Legacy-Zustände unverändert.
**Risiko/Gegenmaßnahme:** Flüchtiger Kampfzustand wird versehentlich persistiert → kleine Schema-Whitelist, sichere Einstiegspunkte und explizite Versionierung.
**Fertig:** Speicher-/Übungsfluss einschließlich Fehlerfällen durch reale Browserbedienung nachgewiesen.
**Danach:** Agent prüft den Ablauf, menschliches Fortsetzen-/Übungsverständnis in T3; A9.2 darf den geprüften Kampagnenbaustein im beauftragten Umfang nutzen.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

## 9. Bulks: Kristallkluft und Glutschmiede

<a id="paket-a9-1"></a>

<details>
<summary>A9.1 — Frostspinne als Winkel- und Bewegungsgegner · ⬜ Nicht begonnen</summary>

### A9.1 — Frostspinne als Winkel- und Bewegungsgegner

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A7.2 positiv, G1–G3 bestanden; eigener Auftrag. Mods nicht erforderlich.
**Ziel/Nutzen:** Zweiter Boss verlangt Seitenwechsel und Winkelkontrolle statt einer Steinwächterkopie.
**Umfang:** Bestehende Frostkarte im neuen Testpfad, Splitterfächer/Biss/Ausbruch und höchstens eine angekündigte Umpositionierung. Keine ausgebaute Mission in diesem Bulk.

- [ ] Bestehende Angriffsausprägungen in getrenntes Prototypprofil übernehmen, Legacy erhalten.
- [ ] Splitterlücken und seitliche Gegenangriffe sichtbar machen; Umpositionierung mit klarer Bindung/Erholung testen.
- [ ] Reichweite, Körperkontakt und Kamera an Eisrücken/Plateaus prüfen; Basiswaffensieg nachweisen.
- [ ] Sieben Bossdarstellungskriterien technisch/visuell prüfen; typische Sequenzen und unterschiedliche Reaktionsaufgaben für den menschlichen T3-Vergleich sichern.

**Systeme/Dateien:** `src/arena/campaign.ts`, Prototyp-Encounter, `src/render/monsterView.ts`, `campaignArena.ts`, Variantenrouting; ggf. kleines Frostprofil und Tests.
**Tests/Regression:** K/P/N und G2-Fairnessfälle sinngemäß; Verfolgung, Lücken/Deckung, Abstand, Körperkontakt und Wiederholung.
**Abnahme:** Mindestens zwei klar von Stein unterscheidbare Entscheidungssituationen; lesbare Gegenangriffe und Basiswaffensieg; sieben Darstellungskriterien vorgeprüft; alte Frostkarte unverändert spielbar. Menschliches Urteil in T3/G5.
**Risiko/Gegenmaßnahme:** Schneller Boss wird nur hektisch → Bewegungsbindung und Erholung vor Tempo; maximal eine neue Bewegungsregel.
**Fertig:** Technischer Boss-/Darstellungsnachweis und T3-Prüfmaterial vorhanden; menschlicher Befund offen.
**Danach:** A9.2 im beauftragten Umfang vorbereiten, menschliche Bossabnahme in T3.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a9-2"></a>

<details>
<summary>A9.2 — Kurze Kluftmission und Übergang aus Map 1 · ⬜ Nicht begonnen</summary>

### A9.2 — Kurze Kluftmission und Übergang aus Map 1

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A9.1 technisch abgenommen, A8.3, beauftragter Umfang; menschliches Gesamturteil folgt T3.
**Ziel/Nutzen:** Map 2 entwickelt bekannte Fähigkeiten weiter und bleibt ein eigener Ort.
**Umfang:** Bestehender Grundriss, kurzer Hauptweg, ein optionaler Abstecher, kleine vorbereitende Begegnungen und eine funktionale Interaktion. Maximal ein neuer kleiner Gegnertyp.

- [ ] Seitliche Deckungswechsel im vorhandenen Gelände als Hauptaufgabe einrichten; keine obligatorische neue Mobilitätsfähigkeit.
- [ ] Höchstens 2–3 kleine Begegnungen setzen; optional einen langsamen gerichteten Splittergegner aus vorhandener Basis testen und bei fehlendem Lernnutzen streichen.
- [ ] Eine kurze Interaktion, Bosscheckpoint und Abschluss mit vorhandenen Missionsprinzipien verbinden.
- [ ] Map-1-Abschluss → Map 2 → Tod/Retry → Sieg/Fortsetzen vollständig spielen; Hinweise auf gewählte Mod-/Waffenregeln begrenzen.

**Systeme/Dateien:** `src/arena/campaign.ts`, `campaignArena.ts`, `campaignDetails.ts`, Kampagnenzustand; ggf. `neu: src/arena/frostAdventure.ts`, kleine Missionsdefinition und Gegnerprofil.
**Tests/Regression:** K/L/P/N, vollständiger Kampagnenübergang mit Basis und gewählter Ausstattung, Vorräte/Checkpoint/Reload, keine Umgehung des Bossabschlusses.
**Abnahme:** Hauptweg ohne zusätzliche Fähigkeit lösbar; Erkundung freiwillig; keine kopierte Konsole-Kern-Relais-Kette; Seitenwechsel als konkrete Reaktionsaufgabe technisch nachgewiesen, menschliche Bewertung in T3.
**Risiko/Gegenmaßnahme:** Zweite große Adventure-Map sprengt Umfang → vorhandene Karte und eine Interaktion; neuen Gegnertyp zuerst kürzen.
**Fertig:** Spielbare zweite Kurzmission mit technischem Abschluss-/Retrynachweis und Material für T3.
**Danach:** A10.1 nach technischer Map-2-Abnahme im beauftragten Umfang möglich; menschliche Kampagnenprüfung bleibt T3.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a10-1"></a>

<details>
<summary>A10.1 — Glutwurm als Raumkontrollgegner · ⬜ Nicht begonnen</summary>

### A10.1 — Glutwurm als Raumkontrollgegner

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A9.2 technisch abgenommen, beauftragter Umfang.
**Ziel/Nutzen:** Dritter Boss verbindet gelernte Reaktionen zu einem erkennbaren Höhepunkt.
**Umfang:** Bestehender Feuerfächer/Ausbruch, klare Angriffskette und höchstens ein zeitweise gefährlicher Bereich; keine neuen Grundfähigkeiten für den Spieler.

- [ ] Feuerfächer als seitliche/Deckungsaufgabe erhalten; Sprung darf nicht als universelle Antwort erscheinen.
- [ ] Höchstens eine angekündigte temporäre Raumzone aus vorhandenen Warn-/Schadensformen erproben.
- [ ] Sichere Ausweichrichtung und Gegenangriff auch bei Dash-Cooldown und Randposition garantieren.
- [ ] Reihenfolge und Erholung statt bloßer HP steigern; Basiswaffenversuche technisch vergleichen und menschlichen Vergleich für T3 vorbereiten.
- [ ] Sieben Bossdarstellungskriterien einschließlich Körpergewicht, Atemvorbereitung, Trefferreaktion und Warnsound vorprüfen.

**Systeme/Dateien:** Prototyp-Encounter, `src/arena/campaign.ts`, `src/render/monsterView.ts`, Warn-/Feedbackansicht, gezielte Gluttests.
**Tests/Regression:** K/P/N, überlappende Gefahren und Wand-/Deckungsfälle, kein unvermeidbarer Trefferzyklus, Zustand nach Tod/Retry leer.
**Abnahme:** Glut verlangt erkennbare Raumwahl und Reaktionsfolgen; jede Kombination besitzt eine ausführbare Antwort; Sieg ohne Mods möglich; sieben Darstellungskriterien vorgeprüft; Legacy unverändert. Menschliches Urteil in T3/G5.
**Risiko/Gegenmaßnahme:** Gefahren füllen die Arena oder verdecken sich → maximal eine zusätzliche Zone, freie Wege messbar prüfen, bei Bedarf Zone ganz streichen.
**Fertig:** Vollständiger Bosskampf mit technischen Fairness-/Darstellungsnachweisen und vorbereitetem T3-Vergleich.
**Danach:** A10.2 im beauftragten Umfang möglich; menschliches Urteil in T3, bei negativem Befund gezielte Nacharbeit.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a10-2"></a>

<details>
<summary>A10.2 — Schmiedemission und Kampagnenabschluss · ⬜ Nicht begonnen</summary>

### A10.2 — Schmiedemission und Kampagnenabschluss

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A10.1 technisch abgenommen, beauftragter Umfang.
**Ziel/Nutzen:** Der letzte Ort bereitet auf Raumkontrolle vor und beendet den kleinen Bogen befriedigend.
**Umfang:** Vorhandene Schmiedekarte, kurze Anreise mit bekannten Gegnertypen, eine Anlageninteraktion, Bosscheckpoint und kurzer Abschluss.

- [ ] Vorhandene Deckung/Höhen für lesbare Wegentscheidung nutzen; keine zusätzlichen Räume/Minibosse.
- [ ] Bekannte kleine Gegner in höchstens 2–3 kurzen Begegnungen einsetzen, Warnungsüberlagerung vermeiden.
- [ ] Eine funktionale Anlagenhandlung und den sichtbaren Abschluss nach Boss-Sieg verbinden.
- [ ] Übergang aus der Kluft, Tod/Retry, Reload, Abschluss und Wiederholen durchspielen.

**Systeme/Dateien:** `src/arena/campaign.ts`, Kampagnen-/Missionszustand, `campaignArena.ts`, `campaignDetails.ts`; ggf. `neu: src/arena/emberAdventure.ts`, Ergebnisansicht.
**Tests/Regression:** K/P/N/L; finales Ergebnis genau einmal, sicherer Ausgang, keine Verluste bestätigter Mapabschlüsse, Startausrüstung vollständig durchspielbar.
**Abnahme:** Klarer Anfang/Checkpoint/Abschluss technisch geprüft; keine neue Pflichtmechanik, kein langes wiederholtes Abschlussritual beim Üben. Menschlicher Höhepunkt-Befund in T3.
**Risiko/Gegenmaßnahme:** Finale wird durch zusätzliche Systeme größer statt besser → bestehende Mechaniken kombinieren, Abschluss kurz halten.
**Fertig:** Dritte Kurzmission und Ende sind regulär spielbar und durch Agent geprüft; menschliches Urteil offen bis T3.
**Danach:** A10.3 gesondert; noch keine Behauptung einer abgenommenen Gesamtkampagne.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a10-3"></a>

<details>
<summary>A10.3 — Gesamtlauf, Wiederholung und Gate 5 · ⬜ Nicht begonnen</summary>

### A10.3 — Gesamtlauf, Wiederholung und Gate 5

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A9.2/A10.2 technisch abgeschlossen, A8.3; optionale Mods technisch verglichen, G4 darf bis T3 offen bleiben; beauftragter Umfang.
**Ziel/Nutzen:** Drei gute Einzelbegegnungen ergeben eine stimmige Mini-Kampagne.
**Umfang:** Übergänge, Startwerte, geringe Balancekorrekturen und vorhandener Übungszugang; optional eine reine Drei-Boss-Sequenz derselben Encounter, keine neue Kampfvariante.

- [ ] Alle drei Missionen mit Basiswaffe ohne Farmen/Reservepflicht abschließen und Versuchszeiten erfassen.
- [ ] Gewählte Mods/Fernkampf auf allen Bossen prüfen; dominante Variante an ihrem Verhalten korrigieren oder streichen.
- [ ] Fortsetzen, Übungszugang und gesamte Wiederholung mit nachvollziehbaren Ressourcen testen.
- [ ] Technische G5-Kriterien prüfen und mindestens drei menschliche Gesamtläufe für T3 vorbereiten; alle sieben Darstellungskriterien je Boss im gemeinsamen Profil vorprüfen.

**Systeme/Dateien:** Kampagnen-/Saveadapter, ausgewählte Encounterprofile, Ergebnis-/Übungsansicht, Gesamt-E2E und QA; größere Bossänderungen zurück in eigenen begrenzten Auftrag.
**Tests/Regression:** K/L/A/P/N, kompletter neuer Lauf einschließlich Reload und Retry; keine Wertsteigerung über wiederholte Abschlüsse.
**Abnahme:** Technische G5-Kriterien bestanden; drei unterschiedliche Reaktionsprofile und Darstellungsvorprüfungen belegt; Basis auf allen Bossen siegfähig. Menschliche Erstspiel-/Wiederholungsdauer und Urteil werden in T3 ergänzt.
**Risiko/Gegenmaßnahme:** Abschlussbalancing wird unbegrenzter Umbau → pro Revision genau betroffene Parameter/Regel nennen; strukturelle Fehler separat nacharbeiten.
**Fertig:** Technischer Gesamtlaufbericht und Inhaltsumfang liegen vor; G5 bleibt bis T3 menschlich offen.
**Danach:** Releasepakete A11.1–A11.3 gesondert freigeben; keine weiteren Waffen/Maps automatisch hinzufügen.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

## 10. Bulks: begrenzte Veröffentlichungsvorbereitung

<a id="paket-a11-1"></a>

<details>
<summary>A11.1 — Einstieg, Bedienung und Lesbarkeit · ⬜ Nicht begonnen</summary>

### A11.1 — Einstieg, Bedienung und Lesbarkeit

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A10.3 technisch abgeschlossen, beauftragter Umfang; menschliches G5 in T3.
**Ziel/Nutzen:** Außenstehende verstehen das Spiel ohne mündliche Einweisung.
**Umfang:** Vorhandene Menüs/HUD verbessern, kurze kontextbezogene Einführung, grundlegende Bedienungs-/Feedbackoptionen. Kein neuer Tutoriallevel oder umfassender UI-Neubau.

- [ ] Adventure-Einstieg, Fortsetzen, Üben, Pause, Neustart und Ergebnis eindeutig benennen.
- [ ] Bewegen/Zielen/Schlagen/Dash/Sprung/Interaktion im ersten Hof schrittweise sichtbar machen; Hinweise später ausblendbar halten.
- [ ] Relevante Tastenbelegung änderbar und zurücksetzbar planen/umsetzen; Konflikte, Fokusverlust und gehaltene Eingaben prüfen.
- [ ] Ton, Effekt-/Kamerareaktion und Textlesbarkeit prüfen; Gefahren auch ohne Ton und unabhängig von Farbe vermitteln.
- [ ] Falls externe Tests Assistenzbedarf zeigen, genau eine begrenzte Option gesondert festlegen; keine versteckte Änderung des Basismodus.

**Systeme/Dateien:** Adventure-HUD/App, Eingabeadapter mit neutralen Arena-Defaults, CSS, lokaler Einstellungsadapter; passende Bedienungs-E2E.
**Tests/Regression:** K/L/A/N, Tastatur/Maus ohne Vollbildzwang, verschiedene Desktopgrößen, stumm/reduzierte Effekte, Legacy-Touch/Fokus/Pause.
**Abnahme:** Alle Pflichtaktionen erreichbar, keine unauflösbaren Belegungskonflikte, keine Warnung nur per Farbe/Ton; Agent prüft den Ablauf. Unabhängiges Erstverständnis wird in T3/G6 abgenommen.
**Risiko/Gegenmaßnahme:** Optionsmenü wächst zum neuen Projekt → nur Pflichtaktionen und belegte Hürden; Controller/Mobile-Neudesign nicht beiläufig hinzufügen.
**Fertig:** Geprüfte Bedienung und vorbereiteter Erstnutzertest; menschlicher Befund folgt T3/G6.
**Danach:** A11.2/A11.3 im beauftragten Umfang, kein zusätzlicher menschlicher Zwischenstopp.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a11-2"></a>

<details>
<summary>A11.2 — Leistung, Laden und Browserzuverlässigkeit · ⬜ Nicht begonnen</summary>

### A11.2 — Leistung, Laden und Browserzuverlässigkeit

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A10.3 technisch abgeschlossen, festgelegter Referenz-PC aus A0.2; beauftragter Umfang.
**Ziel/Nutzen:** Gutes Spielgefühl bleibt auf der angegebenen Zielplattform stabil.
**Umfang:** Gemessene Engpässe, Ladeweg, Ressourcenlebensdauer und festgelegte Browsermatrix. Keine Engine-Migration oder pauschale Physik-Neustrukturierung.

- [ ] Finale drei Maps warm/kalt profilieren; Frame-/Simulationszeit, Drawcalls, Downloads und zehn Retries erfassen.
- [ ] Größte belegte Engpässe zuerst beheben; Assetladen pro Map und wiederverwendete FX-Puffer prüfen.
- [ ] Reproduzierbares Kaltstartziel festlegen: zunächst ≤8 s bei 25 Mbit/s, 50 ms Latenz, leerem Cache auf Referenz-PC untersuchen; Ladefortschritt sichtbar und Fehler behandelbar machen.
- [ ] Aktuelles Chrome/Edge auf Windows prüfen; Firefox gesondert testen und seinen Supportstatus ehrlich festlegen. Touch-Kompatibilität der alten Variante erhalten.
- [ ] 30/60/144-Hz-Regeln, Fokus/Pause, Resize/Vollbild, Audiofreigabe und Speicherfehler im Browser prüfen.

**Systeme/Dateien:** Messhelfer, `src/app/adventureGame.ts`, Render-/Assetloader, `src/physics/rapierWorld.ts` nur bei gemessenem Bedarf, `vite.config.ts` nur bei belegtem Ladeproblem, Browsertests.
**Tests/Regression:** K/L/A/P/N, Leistungsbudgets aus Abschnitt 4, zehn Neustarts und vollständiger Kampagnenlauf; CI-Softwaregrafik nicht als GPU-Nachweis ausgeben.
**Abnahme:** Vereinbartes Geräte-/Netzprofil und Leistungs-/Ladeziele bestanden oder vor Release ausdrücklich neu begründet beschlossen; keine reproduzierbaren Ressourcenlecks oder Spielblocker; Supportmatrix benannt.
**Risiko/Gegenmaßnahme:** Durchschnitts-FPS verdeckt Aussetzer → p95/p99 und sichtbare Ruckler erfassen; Performancefixes gegen räumliche Regeln regressieren.
**Fertig:** Reproduzierbarer Leistungs-/Ladebericht mit Hardware, Browser, Build und verbleibenden Grenzen.
**Danach:** Technischer Nachweis für A11.4, menschliche Ruckel-/Bedienungssichtung in T3. Mobile-Leistungsversprechen nur mit echtem Gerätenachweis.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a11-3"></a>

<details>
<summary>A11.3 — Releaseumfang, Assetherkunft und Veröffentlichungskanal · ⬜ Nicht begonnen</summary>

### A11.3 — Releaseumfang, Assetherkunft und Veröffentlichungskanal

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A10.3 technisch abgeschlossen, beauftragter Umfang; A11.1/A11.2 spätestens vor finaler Freigabe berücksichtigen.
**Ziel/Nutzen:** Ein kleiner, ehrlicher und tatsächlich veröffentlichbarer Umfang wird festgelegt.
**Umfang:** Umfangsentscheidung, Quellen-/Lizenzinventar, vorhandene Build-/Hostingprüfung und Paketbeschreibung. Keine Veröffentlichung, Käufe, Storekonten oder neue Medienproduktion durch diesen Bulk.

- [ ] Tatsächlich fertige Maps, Waffen/Mods, Übungsumfang, Sprache, Desktopanforderungen und bekannte Grenzen festschreiben.
- [ ] Alle ausgelieferten Modelle/Texturen/Animationen/Sounds einschließlich Fonts auf Quelle, Nutzungs-/Weitergabebedingungen und Credits prüfen.
- [ ] GitHub Pages gegen HTML5-Paket auf itch.io bewerten; Assetpfade, ZIP-Einstieg, Speicher/Audio/Fokus im vorgesehenen Hosting testen.
- [ ] Kleine kostenlose Browserfassung als Ausgangsempfehlung prüfen; Kaufprodukt/Steam nur mit gesondertem Nachfrage-/Umfangs- und Verpackungsentscheid.
- [ ] Gewünschten Adventure-Standardeinstieg und Legacy-Zugang im noch unveröffentlichten Kandidaten festlegen; erforderliche kleine Routing-/Buildkonfiguration vor G6 prüfen.
- [ ] Releasekandidat und Rückkehrmöglichkeit zum vorherigen Build benennen; Umgang mit Legacy-Vergleich ausdrücklich festlegen.

**Systeme/Dateien:** `public/assets/*/CREDITS.md`, jeweilige Lizenzen, `docs/assets/hexwars/source/`, README/Releasebeschreibung, `.github/workflows/pages.yml` lesen; Routing-/Buildkonfiguration nur für den konkret freigegebenen Kandidatenumfang.
**Tests/Regression:** Vollständigkeit zwischen ausgelieferten Assets und Inventar; Paket-/Basis-URL-Smoke, keine Test-API; bei Konfigurationsänderung K sowie betroffene A/P/L-Einstiege.
**Abnahme:** Keine ungeklärte Rechteposition an ausgelieferten Assets; Paketumfang/Support/Plattform/Nutzerfreigabe klar, keine erfundenen Verkaufs-/Spielzeitversprechen. Ungeklärtes Asset austauschen/entfernen in eigenem begrenztem Auftrag.
**Risiko/Gegenmaßnahme:** Storeziel zieht neue Pflichtfeatures nach → Browser zuerst, Steam/Controller nur nach eigenem Auftrag; keine kommerzielle Eignung aus drei vorhandenen Bossen ableiten.
**Fertig:** Prüffähiges Releasebriefing, Quelleninventar und noch unveröffentlichter Kandidat liegen vor.
**Danach:** Nutzer bestätigt Umfang/Kanal für externe Abnahme; Publikation bleibt bis A11.5 separat.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a11-4"></a>

<details>
<summary>A11.4 — Externe Spieltests und Gate 6 · ⬜ Nicht begonnen</summary>

### A11.4 — Externe Spieltests und Gate 6

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** A11.1–A11.3 abgeschlossen, eigener Auftrag und verfügbare Tester.
**Ziel/Nutzen:** Letzte Produktentscheidung anhand Außenstehender, nicht allein anhand Entwicklerkenntnis.
**Umfang:** Mindestens fünf externe Ersttests, Befundtriage und Gate-Entscheid. Kein unbegrenzter Sammelauftrag „alle Probleme beheben“.

- [ ] Identischen Releasekandidaten, regulären Einstieg und kurze Testanleitung bereitstellen; Testerorganisation mit dem Nutzer, keine ungefragten Nachrichten an Dritte.
- [ ] Erstverständnis, vollständige Mission/Kampagne soweit gespielt, Fehler, Abbrüche und freiwillige Wiederholung erfassen.
- [ ] Spielspaß, Inhaltsumfang und etwaiges Kaufinteresse getrennt auswerten; Vorerfahrung und Gerät nennen.
- [ ] Fehler nach Blocker/Fairness/Bedienung/Kosmetik ordnen; notwendige Fixes als einzeln begrenzte, separat freizugebende Aufträge festhalten.
- [ ] Nach Fixes die betroffenen Flows am neuen Kandidaten erneut prüfen und G6 ausdrücklich entscheiden.
- [ ] In dieser T3-Abnahmephase G4 (falls Mods vorhanden) und G5 menschlich entscheiden; Bossdarstellung aller drei Bosse und freiwillige Wiederholungsversuche mitbewerten. Ohne Progressionsentscheid keinen entsprechenden Umbau vorwegnehmen.

**Systeme/Dateien:** Testbriefing, QA-Protokolle, Gate-/Risikoliste und Roadmap; Gameplay-Dateien nur in separat beauftragten Fixes.
**Tests/Regression:** Finalen K/L/A/P/N-Nachweis referenzieren; neue Fixes benötigen passende Regression. Keine Ersetzung fehlender Menschen durch Bots oder Touch-Emulation.
**Abnahme:** G6-Kriterien erfüllt, Nutzer akzeptiert den benannten Kandidaten; keine bekannten Absturz-/Saveverlust-/Fortschrittsblocker oder kritischen Fairnessfehler.
**Risiko/Gegenmaßnahme:** Kleine wohlwollende Testgruppe → neue Spieler und unterschiedliche Vorerfahrung, konkrete Beobachtungen statt nur „gefällt mir“; Stichprobenbegrenzung ausweisen.
**Fertig:** Dokumentierter positiver oder negativer Gate-Entscheid. Bei Nacharbeit bleibt Release gesperrt.
**Danach:** Bei positivem G6 kann A11.5 ausdrücklich beauftragt werden. Technische Abnahme allein genügt nicht.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<a id="paket-a11-5"></a>

<details>
<summary>A11.5 — Freigegebenen Build veröffentlichen und nachprüfen · ⬜ Nicht begonnen</summary>

### A11.5 — Freigegebenen Build veröffentlichen und nachprüfen

**Status:** ⬜ Nicht begonnen (geplant). **Voraussetzungen:** G6 bestanden; expliziter Veröffentlichungsauftrag für konkreten Build, Umfang und Kanal.
**Ziel/Nutzen:** Die abgenommene Fassung ist erreichbar, nachvollziehbar und bei Fehlern rücksetzbar.
**Umfang:** Gewählter Browserkanal, Releasebeschreibung, Produktions-Smoke und definierter Rückweg. Keine zusätzlichen Gameplayfunktionen oder Plattformen.

- [ ] Freigegebenen Commit/Build, Assetinventar und Rückkehrbuild abgleichen; keine ungeprüften Änderungen mitnehmen.
- [ ] Bereits im Kandidaten geprüften Adventure-Standardeinstieg und vereinbarten Legacy-Zugang abgleichen; keine neue Routingänderung nach G6 einschieben.
- [ ] Gewähltes Paket veröffentlichen; tatsächliche URL, Buildkennung und Umfang dokumentieren.
- [ ] Live Start, erste Mission, Retry, Fortsetzen und Arena-Einstieg prüfen; Cache-/Assetpfade, Fehler und Test-API-Ausschluss kontrollieren.
- [ ] Bei kritischem Livefehler auf benannten Build zurückgehen; konkreten Fehlerbericht für nächste begrenzte Wartung hinterlassen.

**Systeme/Dateien:** Release-/QA-Dokumentation, bestehende Pages-Pipeline oder gewähltes HTML5-Paket. Unveränderter abgenommener Spielbuild, keine Arena-Regeländerung.
**Tests/Regression:** Produktions-Smoke auf benannten Browsern, gültige Ressourcen/Audio/Speicher, keine Debug-API; vollständiger Kandidaten-Teststand muss zum publizierten Commit passen.
**Abnahme:** Öffentliche URL liefert den abgenommenen Umfang; getestete Kernflüsse funktionieren, Rückweg bekannt, bekannte Grenzen ehrlich sichtbar.
**Risiko/Gegenmaßnahme:** `main` löst bei Codeänderungen Pages-Deployment aus → bestehenden Workflow vor Merge prüfen, Preview-/Merge-/Publikationsfolge ausdrücklich planen; Dokumentationsänderungen sind dort bereits ausgenommen.
**Fertig:** Live-Nachweis und Abschlussbericht vorhanden; Produktbetrieb/weitere Inhalte brauchen neue begrenzte Aufträge.
**Danach:** Keine automatische Roadmapverlängerung oder wiederkehrende Automation. Wartung nach konkretem Fehler-/Nutzerbefund.

[Zur Statusübersicht](#alle-26-arbeitspakete-auf-einen-blick)

</details>

<details>
<summary>Pflegeregeln und Grenze des aktuellen Auftrags</summary>

## 11. Pflege nach Entscheidungen

Nach jedem Auftrag nur tatsächliche Aufgaben abhaken, Bulkstatus und Berichtlink
ergänzen. Ein Gate wird nur mit belegtem Urteil aktualisiert. Bei negativem Ergebnis
genau betroffene Bulks zurück zur Nacharbeit geben und Folgeabhängigkeiten sichtbar
sperren; nicht still neue Systeme als Ersatz hinzufügen.

Spätere Ideen bekommen zuerst eine kurze Nutzen-/Kosten-/Streichprüfung in der
Vision. Ohne gesonderten Auftrag werden sie keine neuen Bulks. Überschreitet ein
freigegebener Bulk seine hier beschriebene Grenze, den Rest als neuen begrenzten
Vorschlag formulieren und bereits autorisierte, unabhängige Arbeit abschließen.

Der aktuelle Implementierungsauftrag umfasst **A5.1–A7.2 bis zum T2-Kandidaten**,
einschließlich A4-Feedback-Feinschliff. Technik und Vergleich sind vorbereitet;
**T2 mit dem Nutzer läuft; die beauftragte Peitschen-Nacharbeit wird darin erneut geprüft**. A7.2, G2 und G3 sind noch nicht menschlich
abgeschlossen. Keine automatische Freigabe für A8, weitere Bosskarten oder Release.
Die ergänzend angesprochenen Charge-/Sprungangriffe des Bosses bleiben Designkandidaten.
Spieler-Lufthieb und Doppelsprung sind auf späteren ausdrücklichen Auftrag umgesetzt;
ihre Wirkung gehört zur laufenden T2-Abnahme. Die erneute Plateau-/Bossprüfung bleibt
Bestandteil von A5.2, kein weiterer Bulk.

</details>
