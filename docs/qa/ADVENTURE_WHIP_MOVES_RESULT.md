# T2-Nacharbeit — zwei Peitschenangriffe und Darstellung

Stand: 2. November 2026. Begrenzter Nutzerauftrag auf
`codex/adventure-combat-prototype`, ausgehend von `8126d07`.
Die Rückmeldung im laufenden T2 war: Peitsche optisch zu einfach und mit einer
Angriffseingabe zu eintönig. Der Nutzer hat zwei direkte Angriffe und eine deutliche
Darstellungsverbesserung freigegeben. A3/A4 werden gezielt nachgearbeitet;
26 Bulks, sechs Gates und drei Spieltermine bleiben erhalten. A7.2/G2/G3 bleiben
menschlich offen. Keine automatische Freigabe für A8 oder weitere Karten.

## Bedienung und Regeln

| | Linksklick: Seitenschwung | Rechtsklick: Überkopf-Knall |
|---|---|---|
| Bahn | breiter horizontaler Bogen mit Rücklauf | schmale vertikale Bahn vor dem Spieler |
| Ausholen | 6 Ticks / 0,10 s | 14 Ticks / 0,23 s |
| Schaden | 22 vorwärts + 14 rückwärts | einmal 46, kein schädigender Rücklauf |
| Schnurlänge | bis 4,8 m | bis 5,6 m |
| Ablauf | 42 Ticks / 0,70 s | 64 Ticks / 1,07 s |
| Zweck | Breite, Bewegung, kurze Gelegenheiten | gezielter Einzeltreffer in ausreichend langen Öffnungen |

Die Längen sind Kurvenlängen; Handansatz, Winkel, Höhe und Zielradius bestimmen
die tatsächliche Reichweite. Gleicher Schaden gegen geschützten/offenen Kern
wie im bisherigen Prototyp: geschützt 10 %, offen 100 %. Die höhere Einzelwirkung
des Überkopfschlags ist kein höherer theoretischer Dauerschaden.

- Ein Tastendruck startet genau einen Angriff. Halten wiederholt nicht; Eingaben
  während einer laufenden Attacke werden nicht für später gespeichert.
- Gleichzeitige linke/rechte Eingabe wählt rechts; Dash im selben Tick hat Vorrang.
- Begrenzte Richtungskorrektur beim Ausholen, danach feste Schlagrichtung.
- Dash/Pause/Waffenwechsel brechen die Bahn ab. Die Erholungszeit eines begonnenen
  Überkopfschlags bleibt bestehen, auch bei frühem Abbruch. Pause hält sie an;
  ein neuer Versuch setzt sie zurück. Ein kurzer HUD-Hinweis zeigt die Erholung.
- Rechtsklick bei gewählter Pulse feuert keine Waffe und verbraucht keine Munition.
- Normales Springen bleibt möglich; Angriffe folgen der tatsächlichen Spielerhöhe.
  Kein eigener Luftangriff, Doppelsprung, Luftdash, Rückhaken oder Kombobaum.
- Zusätzliche Eingabe nur im Entwicklungs-/Test-Prototyp. Legacy-/Arena-Regeln
  und normale Linksklick-Bedienung bleiben unverändert. Touch hat vorerst weiterhin
  nur den Basisangriff; Desktop bleibt der vereinbarte Qualitätsfokus.

## Darstellung

Prozeduraler Griff mit Metallringen/Energiezelle, verjüngter heller Kern und
farbiger Energiesaum. Türkis/blau kennzeichnet Hin-/Rückschwung, warmes Gold den
Überkopfschlag. Kurze, ausblendende Leuchtspuren folgen bereits durchlaufenen
Kurven; sie verursachen keinen Schaden. Eigene Oberkörperbewegung und
Aushol-/Knall-/Kontaktklänge unterstützen den neuen Schlag.

Kontakte erhalten einen örtlichen Impuls, kurzen Ring und wenige gerichtete
Splitter. Geschützter Steinpanzer reagiert kleiner und gedämpfter als ein offener
Kern. Reduzierte Effekte lassen die Trefferanzeige bestehen und entfernen
Nachleuchten/Splitter. Kein globaler Bloom, keine neue Assetproduktion, keine
Trefferpause oder Änderung an Boss-Betäubung/Angriffstiming.

Bildprüfung fand zunächst eine falsch kopierte Y/Z-Koordinate in der Leuchtspur.
Sie ist korrigiert und mit einem Test weit außerhalb des Weltursprungs abgesichert.
Die finale Spur bleibt am Schlagbogen; Bilder beider Angriffe und echter
Bosskontakte liegen unter [adventure-whip-moves](adventure-whip-moves/).

## Technischer Nachweis

- 96/96 Unit-Tests; sieben neue Fälle für Unterschied der Bahnen, Reichweite,
  Einzeltreffer, Ausholen/Erholung, Richtungsbindung, Abbruch, Deckung/Höhe,
  30/60/144-Hz-Replay und begrenzte Renderobjekte einschließlich Spurkoordinaten.
- Typecheck, Testbuild und Produktionsbuild erfolgreich; bestehende Warnung zum
  großen Hauptbundle unverändert.
- Vier zusätzliche Browserregressionen bestanden: bisherige Peitschen-Eingaben,
  30-Hz-Präsentation, Arena-Einstieg/Bedienung und Legacy-Pause bei Fokus/Resize.
  Produktionsguard bestanden: kein Lab, kein Testhook, regulärer Missionsstart
  trotz angeforderter Prototyp-URL. Insgesamt zwölf unterschiedliche Browserfälle
  mit abschließend erfolgreichem Nachweis; die zwei korrigierten Fälle sind unten erklärt.
- Neue Browserfälle für beide Eingaben, Halten, Kontextmenü, Dash/Pause,
  Pulse/Legacy-Wechsel, Neustart, normale Mission/Sprung, Darstellung und
  Ressourcen in den Projekten Chrome 1366 und 1920 geprüft.
- Im ersten Gesamtlauf 6/8 bestanden. Der Abbruchtest drückte Angriff und Dash
  teilweise im selben Tick; er wartet jetzt ausdrücklich auf das Ausholen.
  Ein gemischter automatisierter Bosslauf verlor bei 31 verbleibenden Boss-HP.
  Die Teststrategie wählt den langsamen Schlag jetzt nur in hinreichend langen
  nahen Konterfenstern. Beide betroffenen Fälle anschließend bestanden;
  dafür keine Spieler-/Bosswerte verändert. Vollständige Berichte bleiben erhalten.
- Reale gemischte Boss-Siege in beiden Auflösungen; letzter 1920-Lauf: 45,9 s
  aktive Kampfzeit, 60 HP übrig, zwei erlittene Treffer. Kein Beleg für Spielspaß.
- Je drei aufgewärmte Serien mit beiden Attacken: Frame-p95 5,7–8,3 ms im
  1366-Projekt (tatsächlich 1367×768 CSS-Pixel bei gemeldetem DPR knapp unter 1),
  8,3–8,4 ms bei 1920×1080; Simulations-p95 1,3–1,9 ms.
  Konstant 878 Szeneobjekte, 273 geladene Geometrien und 41 Texturen im Übungsraum;
  nach Abklingen keine Audiostimmen. Kein Ressourcenwachstum zwischen den Serien.
- 42 zusätzliche Rapier-Versuche: sieben Strategien × drei Startpositionen ×
  Überkopf allein/gemischte Angriffe. Stehenbleiben, Rückwärtslaufen, enges Kreisen,
  Dauerspringen und Plateau-Stand verlieren in allen 30 Fällen; reaktives Spielen
  und begrenzter Pulse-Vergleich gewinnen alle zwölf. Das ist eine gezielte
  Stichprobe, kein vollständiger Exploit-Beweis. Alte A5/A7-Rohdaten bleiben erhalten.

Quellhash des geprüften Gameplay-Stands:
`4d58ab1a53ac7eafad21247546e4e90133dc846ec835ee2f3a2e6018c0afa1b2`.
Die Buildberichte nennen den Elterncommit `8126d07`, weil vor dem Sicherungscommit
gebaut wurde. Änderungen an Tests/Dokumentation verändern diesen Quellhash nicht.

## Menschliche Fortsetzung von T2

Im bereits vorgesehenen Spieltermin beide Tasten zunächst an Übungszielen, dann
am Steinwächter vergleichen. Wird der schmale Schlag bewusst für offene Fenster
gewählt? Bleibt der Seitenschwung nützlich? Sind Kontakt, Gewicht und Erholung
verständlich, und bleiben Bosswarnungen sichtbar? Falls rechts immer gewinnt
oder nur stört, zuerst Timing/Reichweite/Erholung nacharbeiten.

Empfehlung zu Luftkombos: später zunächst ein gezielter Angriff aus dem normalen
Sprung, mit klarer Landung und ohne automatisches Schweben/Unverwundbarkeit.
Erst bei belegtem spielerischem Nutzen über einen Doppelsprung entscheiden;
dieser verändert zusätzlich die Fairness und Umgehbarkeit der Bodenattacken.
Diese Kandidaten sind in diesem Auftrag nicht implementiert.

Lokaler Einstieg: [Mission](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype)
oder [Boss-/Übungslabor](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype).
