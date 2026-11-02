# Adventure A5–A7 — Kandidat für Spieltermin T2

2. November 2026 · Auftrag: „ja so machen, leg los“ zum empfohlenen Abschnitt
A5.1–A7.2 einschließlich A4-Feedback-Feinschliff. Ergänzung: Plateau-Angriffe prüfen.
Branch: `codex/adventure-combat-prototype`; Ausgangspunkt: `6e0029d`.
Codecommit: `1b4a7c1d710e49136955de42956abce593a70c7f`.
`main` bleibt unverändert; Code und Nachweise sind lokal auf dem Entwicklungsbranch gesichert.

**A5.1/A5.2, A6.1/A6.2 und A7.1 technisch umgesetzt; A7.2 vorbereitet.**
T1/G1 wurde bereits qualitativ akzeptiert. **T2, G2/G3 und die verbindliche
Richtungsentscheidung bleiben menschlich offen.** Keine Umsetzung von A8,
Progression, neuen Assets, Doppelsprung oder weiteren Bosskarten.

## Start und Abgrenzung

`npm run dev`, Desktop mit Maus/Tastatur:

- [Vollständige neue Mission](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype)
- [Neuer Boss direkt](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype)
- [Boss mit optionalem Pulse](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype&loadout=pulse)
- [Legacy-Labor](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=legacy)
- [Bisherige Mission](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1)

Im Lab **Bossversuch starten** drücken. Dort gibt es auch „Nur Faust / Gegenangriff“
und Übungsziele. Auswahl wird erst beim nächsten Start übernommen. Klick löst
einen Peitschenschlag aus; Shift ist der gerichtete Boden-Dash, Leertaste der
normale Sprung. Keine Unverwundbarkeit und kein Doppelsprung. Mit Pulse: 1/2 wechseln.
Kalter/blauer Kern: 10 % Schaden. Heller grüner Kern in Erholung: voller Schaden.

Legacy ist weiterhin Standard; die neue vollständige Mission ist ausschließlich
im Entwicklungs-/Testbuild ausdrücklich anwählbar. Produktionsbuild und Erkundung
ignorieren diese Prototyp-Auswahl. Das Lab erzeugt seinen Missionsfortschritt nur
in seiner eigenen Fixture; normale Mission startet mit beiden lebenden Läufern.

## A5 — Steinwächter und Peitschenfeedback

Optionales Encounterprofil statt duplizierter Boss-Engine. Grundform, Deckung,
Navigation und vorhandene drei Angriffsarten bleiben erhalten. Neues Profil:

| Abschnitt | Verbindliche Regel im Kandidaten |
|---|---|
| Faustbeginn | Richtung bei Start festgelegt; höchstens 1,8 m Schritt in den ersten 18 Ticks, mit Körper-/Wand-/Bodentest |
| Faustwarnung | 48 Ticks / 0,8 s, bis zum Ende erkennbare Sektorwarnung |
| Faustkontakt | Ticks 48–53, maximal ein Schaden von 35; Reichweite 3,6 m, Halbwinkel 1,05 rad, hohe Faust trifft auch springende Spieler |
| Faustkonter | Ticks 54–131: 78 Ticks / 1,3 s, voller Schaden, sichtbares Abfangen des Arms; dann Verfolgung oder nächste angekündigte Spezialattacke |
| Bodenwelle | 84 Ticks Warnung, 90 Ticks Ausbreitung bis 20 m, 55 Schaden maximal einmal; Sprung oder reale Deckung schützt |
| Bodenausbruch | 78 Ticks Warnung auf festgelegter Oberfläche, einmaliger Einschlag, 24 Ticks sichtbarer Ausbruch, 45 Schaden |
| Spezialerholung | 96 Ticks / 1,6 s; keine Überlagerung mit Faust oder weiterer Spezialattacke |
| Kern | Außerhalb der Konterfenster 10 % Schaden, in Erholung 100 %; Kernfarbe, „SCHUTZ“-Treffertext und gedämpfter Kontaktklang unterscheiden die Fälle |

Walk und Dash entkommen der Faust nach 0,2 s Reaktionsverzug; Rückkehr und ein
vollständiger Hin-/Rücktreffer passen in die Erholung. Ein Bodendash durch eine
Welle nimmt Schaden; ein rechtzeitig ausgeführter Sprung schützt. Wiederholte
Sprungeingaben erzeugen keinen Luftsprung. Dash-Cooldown bleibt 0,8 s, Reichweite 3 m.

Peitsche: beschleunigter Schwung und Rückschnappen über dieselbe Kurve für Bild und
Trefferprüfung; angepasste zeitliche Abtastung gegen übersprungene Kontakte.
Keine Schadenssteigerung: weiterhin 22 + 14 pro vollständigem Schlag.
Klarer Kontaktring, kurze Funken, kräftigere Trefferreaktion und schärferer Klang;
Armortreffer sind bewusst schwächer als volle Konter. Kein Hitstop, Kamerarütteln
oder Regel-Stagger eingeführt. Ob das jetzt ausreichend „knackig“ wirkt, entscheidet T2.

### Kalibrierung und Grenzen der Messung

Zuerst blieben 600 HP und voller Schaden erhalten: **alle fünf einfachen
Dauerstrategien gewannen in etwa 12–20 s**. Kernschutz allein beseitigte vier
Probleme, ließ aber enges Kreisen vom mittleren Start weiterhin gewinnen.
Darauf folgten eine kürzere Folge bis zum nächsten Spezialangriff, 55 Wellenschaden
und erst danach 900 Boss-HP. Das ist eine Erhöhung um 50 %, kein Ersatz für die
Ausweich-/Konterregeln. Die beiden verworfenen Messstände bleiben erhalten.

Finale numerische Replays: jede Strategie an drei Startpositionen, jede Position
dreimal; reale Rapier-Bewegung und Peitschenkontakte, keine Lebenspunkte-Manipulation
innerhalb eines Versuchs, keine Vorratsnutzung. Dieselbe deterministische Policy
wird wiederholt; das ist keine Stichprobe unterschiedlicher Menschen.

| Strategie | Ergebnis von 9 Versuchen | Aktive Sekunden |
|---|---|---|
| Stationär angreifen | 9 Niederlagen | 13,42–13,65 |
| Rückwärts auf Reichweite | 9 Niederlagen | 16,52–18,30 |
| Enges Dauerkreisen | 9 Niederlagen | 28,73 |
| Dauerspringen | 9 Niederlagen | 16,60–20,25 |
| Heilplateau campen | 9 Niederlagen | 19,50–19,97 |
| Auf Warnungen reagieren, Peitsche | 9 Siege | 36,62 |
| Gleiche Reaktion, plus Pulse | 9 Siege | 33,05–33,28 |

Ein Browserlauf mit echten Eingaben gewann den Peitschenkampf in **39,6 s**.
Die vollständigen Missionsläufe gewannen ebenfalls. 45–90 s bleiben Orientierung:
optimierte automatische Reaktion ist schneller. Vor einem weiteren HP-Aufschlag
stehen reale menschliche Versuche. Die Matrix belegt die untersuchten Policies,
keine mathematische Unmöglichkeit sämtlicher Exploits. Reserve/Heilung können
Fehler verzeihen; sie sind keine notwendige Siegbedingung.

### Plateau-Prüfung

Die Bodenwelle prüft die Spielerfußhöhe unter 0,7 m; das 1,1 m hohe Plateau ist
geschützt. Ein isolierter offener Bodentest trennt diesen Höhenschutz von Deckung.
Auf drei realen Plateaupositionen erkennt der Boss die unterstützte erhöhte Fläche
und wählt einen Ausbruch. Warnfläche und Spitzen liegen auf **y = 1,1 m**.
Stehenbleiben verursacht genau einen Treffer, Weglaufen nach 0,2 s verhindert ihn.
Beide Fälle wurden zusätzlich im Browser durchlaufen und bebildert.

Ein hoher Faustschwung kann am nahen Plateaurand treffen, wenn Höhe, Reichweite
und Sichtlinie passen; er trifft nicht pauschal die gesamte Plattform. Vom Zentrum
des Plateaus erzeugt der Ausbruch die Bedrohung. Charge/Sprungangriff bleiben
Designkandidaten für eine belegte spätere Lücke; derzeit nicht hinzugefügt.

### Sieben Kriterien zur Bossdarstellung

Technische/visuelle Vorprüfung bestanden; menschliches Qualitätsurteil jeweils T2:

| Kriterium | Beleg / verbleibende menschliche Frage |
|---|---|
| Animationstiming | Aufnahmen bei Fausttick 25 (Warnung), 48 (Kontakt), 60 (Konter); 30/60/144-Hz-Regelvergleich. Erfasst die Pose die Gefahr sofort verständlich? |
| Charakterbewegung | Schwerer kurzer Schritt, hoher einarmiger Schwung, beidarmige Spezialvorbereitung. Sind diese Bewegungen wiedererkennbar? |
| Gewicht | Beschleunigter Kontakt, geneigter Körper, über die Erholung abgefangener Arm; keine nachträgliche Zielverfolgung. Wirkt der Schlag schwer genug? |
| Trefferreaktion | Rückstoß des Bosskörpers/Kernflash nur bei Schaden; kleinerer Reiz bei Schutz, Konter heller. Keine Änderung der aktiven Angriffsticks. Ist der Treffer eindeutig und kräftig genug? |
| Silhouette | Bestehender kompakter Steinkörper; Faust vor dem Spieler, Warnsektor und Erholung getrennt sichtbar. Kann man auch in Bewegung klar lesen? |
| Sound | Warn-/Schlagcues an denselben Regeln; Peitsche, Rücktreffer und Schutz haben unterschiedliche synthetische Cues. Mute/Reset/Voicelimit geprüft; Klangwirkung menschlich offen. |
| Konsistenz | Bestehende Geometrie, Steinmaterialien und Energiepalette; keine neuen Assets/Lichter. Bodenausbruch sitzt auf der gewählten Oberfläche. Passt die Darstellung zur gewünschten Identität? |

## A6 — Läufer, Versorgung und vollständige Mission

Die beiden Läufer verwenden unveränderte HP-/Angriffswerte, vorhandene Reaktions-
und Todesanimationen, aber im Prototyp eigene Bewegungskörper und einen Mindestabstand.
Beide sind mit der gerichteten Peitsche auf dem regulären Weg erreichbar besiegbar.
Pulse-/Munitionsfunde und deren Hinweise werden dort nicht angeboten; auch die alte
PULSE-Bodenbeschriftung ist ausgeblendet. Gesundheits-/Rüstungsfunde bleiben einmalig.

Checkpoint: 100 HP und mindestens 50 Rüstung, mit optional geborgener Reserve 75.
Keine wiederholte Heilung durch Hin-/Herlaufen. Boss-Retry erhält Konsole und besiegte
Läufer, stellt Boss/Bewegung/Waffe/Effekte neu her; kompletter Neustart setzt alles
zurück. Kamerafokus folgt auf der Anreise dem Spieler, erst im Kampf zusätzlich dem Boss.

Browsernachweis mit/ohne Reserve: echter Tod vor Checkpoint, erneute Anreise,
zwei Läufer, gesperrtes Tor, Konsole, Checkpoint, Boss-Tod, Retry, Basiswaffensieg,
Kernaufnahme, Relais und physischer Ausgang; anschließend kompletter Neustart.
Manuelle Pause bleibt bei Fokuswechsel erhalten. Die alte Mission wird separat regressiert.

## A7.1 — Begrenzter Pulse-Vergleich

Hypothese: Ein kurzer Schussvorrat nutzt ein Konterfenster, wenn der Rückweg in
Peitschenreichweite zu lange dauert. Bestehende Projektile, Aimtechnik und 10 Schaden
pro Schuss bleiben erhalten. Zwölf Schuss pro Lab-/neuem Missionsversuch bzw.
Boss-Retry; **kein Auffüllen beim Waffenwechsel oder Checkpointübertritt**.
Eine erste Missionsanreise kann den Vorrat also bereits verbrauchen.

Wechsel setzt keinen Cooldown zurück, bricht aber einen laufenden Peitschenschlag ab.
Fliegende Geschosse bleiben beim Wechsel aktiv, verschwinden bei Tod/Retry.
Während Dash kein neuer Schuss. Bei leerem Magazin zurück zur Peitsche; kein
automatischer alter Arc-Angriff. Beide neuen Lab-Varianten starten mit demselben
900-HP-Boss, 100 HP/50 Rüstung, gleichen Positionen und Gegenständen.

In den numerischen Vergleichsläufen wurden alle zwölf Schüsse genutzt: circa
75–93 tatsächlich angerechneter Schaden, davon 70–90 im Konterfenster; größte
Schussentfernung ungefähr 6,6 m. Sie verkürzten den Kampf um rund drei bis vier Sekunden.
Der Browservergleich gewann ebenfalls, allerdings mit mehr erlittenen Treffern
als der Peitschenlauf. Das belegt keinen generellen Qualitätsgewinn.

**Empfehlung für T2: Peitsche als Haupt-/Startvariante beibehalten. Pulse nur als
Vergleichsoption lassen.** Entfernung überbrücken ist eine belegte taktische
Möglichkeit, aber zusätzliche Tasten und Ressourcen müssen ihren Nutzen erst
im menschlichen Vergleich rechtfertigen. Keine Progressionsentscheidung ableiten.

## Technische Nachweise

- Vollständige Unitsuite: 89/89, einschließlich Wellen-Dash und fehlendem
  Doppelsprung; T2-Regeltests 5/5.
- `npm run build` und `npm run build:test` erfolgreich. Bestehende Warnung zum
  großen Hauptbundle bleibt; keine Engine-/Bundle-Neustrukturierung in diesem Auftrag.
- Produktionsprüfung: kein Lab, kein Testhook, regulärer Missionsstart trotz
  angeforderter Prototyp-/Lab-URL.
- Legacy-/Arena-/PvE-Regression: 10/10 Browserfälle bestanden, einschließlich
  vollständiger alter Mission auf Desktop/Touch, 2v2 auf Desktop/Touch, drei Boss-Siegen
  der alten Mini-Kampagne sowie Tod/Pause/Retry.
- 1920×1080: fünf Browserfälle für Eingaben, Boss, zwei Missionen und Pulse bestanden;
  vier weitere für 20 Profilwechsel/Resets, Performance, 30-Hz-Präsentation und Boss-/Plateau-Sequenzen.
- 1366×768: vier weitere Browserfälle für Mission ohne Reserve, Pulse-Vergleich,
  Boss-/Plateau-Darstellung und Performance bestanden.
- Abschließende Neustartkorrekturen: Legacy behält seine gewählte Ansicht;
  Profilwechsel setzt den Boss-Flash mit dem richtigen HP-Profil zurück.
  Zwei gezielte Browserfälle (inklusive 20 Profilwechseln) und Produktionsguard bestanden.
- Aufgewärmte Peitschenversuche (Chrome 156, AMD Radeon Graphics, DPR 1):
  Frame-p95 8,3 ms, p99 11 ms; Simulations-p95 1,7–1,8 ms; keine verworfenen Ticks.
  Bei 1366×768: Frame-p95 5,6 ms, p99 8,2–8,3 ms; Simulation-p95 1,7–1,9 ms.
- 20 Profilwechsel/Resets: nach GC konstant 72 Listener, 817 Szeneobjekte,
  340/342 Geometrien je Profil, 52 Texturen, keine laufenden Audiostimmen;
  längstes Setup 2,8 ms. Übungsraum hat wegen ausgeblendeter Szene weniger GPU-Ressourcen.

Die 25 Browserfälle sind ohne fehlgeschlagene Fälle bestanden.
[Rohdaten und neue Boss-/Missionsaufnahmen](adventure-a5-a7/) enthalten auch die verworfenen
Balanceversuche. Große PNG-Originale der Regression/Exports liegen lokal unter
`test-results/a5-a7-original-png`; ihr Pfad und SHA-256 stehen im Artefaktindex.
Sie werden nicht zusätzlich in Git dupliziert. Die JSON-Berichte behalten ihre
ursprünglichen Playwright-Pfade; Bilder des neuen Kandidaten sind als JPG mitgesichert.
Buildkennung wird aus Commit und Quelldatei-Hash gebildet;
die Messungen vor dem Sicherungscommit nennen deshalb dessen Elterncommit.
Der finale Quellhash ist `c246db070cf968fb0e362fa28e51d70f9191a76fa0247d3d8ff969c153cf77b9`.
Die großen Missions-/Regressions-/Performanceläufe gehören zum Stand
`9449811b3517d2ecf9f4bb7d9aa8c1887a0dd7fa71837a61f35ee055adb95c39`;
die abschließenden Kamera-/Flash-Resetkorrekturen sind im finalen Stand gezielt geprüft.
Die ersten Missionsnachweise liegen vor den abschließenden reinen Präsentations-
und Exportkorrekturen; diese sind gesondert nachgeprüft.

## Spieltermin T2

Etwa 20–30 Minuten, keine zusätzliche Planungsrunde:

1. Neue Mission mit Peitsche einmal vom Anfang spielen, einschließlich Retry bei Bedarf.
2. Zwei bis drei neue Bossversuche: Faust seitlich umgehen, Welle springen/Deckung,
   Ausbruch verlassen; einmal bewusst das Plateau prüfen.
3. Je einen Bossversuch mit Peitsche allein und optionalem Pulse, danach Reihenfolge
   wechseln. Bei Bedarf einen Legacy-Versuch als direkten Vergleich ergänzen.
4. Kurz bewerten: Kontrolle/Kamera, erkennbare Treffer und Schadensursachen,
   Bossgewicht/Charakter, Kernschutz und Konterfenster, freiwilliger weiterer Versuch.
   Explizit prüfen, ob der Kernschutz gutes Timing belohnt oder nur Wartezeiten erzeugt.

Danach gemeinsam G2/G3 und A7.2 entscheiden: fortsetzen, gezielt nacharbeiten,
vereinfachen oder verwerfen; Pulse beibehalten/ändern/streichen. Progression bleibt
offen. Ohne dieses Urteil keine automatische Freigabe weiterer Maps oder A8.
