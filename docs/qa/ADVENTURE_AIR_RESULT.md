# T2-Ergänzung — Sprungangriff, Doppelsprung und Touch

Stand: 2. November 2026. Ausdrücklicher Nutzerauftrag nach `2759ae7`, umgesetzt
auf `codex/adventure-combat-prototype`. Der vorherige Bericht zu den
[zwei Bodenangriffen](ADVENTURE_WHIP_MOVES_RESULT.md) bleibt historischer Nachweis.
Die neue Freigabe ersetzt dessen Ausschluss von Luftangriff/Doppelsprung.
26 Bulks, sechs Gates und drei menschliche Spieltermine bleiben bestehen.
A7.2/G2/G3 bleiben menschlich offen; A8 und weitere Bosskarten sind nicht beauftragt.

## Bedienung und Spielregeln

| Eingabe mit Peitsche | Wirkung |
|---|---|
| Linksklick am Boden | Bisheriger Seitenschwung mit Rücklauf |
| Rechtsklick am Boden | Bisheriger Überkopf-Knall |
| Leertaste, dann links oder rechts in der Luft | Diagonaler Abwärtshieb |
| Leertaste erneut nach Loslassen | Ein kürzerer Luftsprung bis zur nächsten Landung |
| Shift am Boden | Bisheriger gerichteter Dash |

Der Luftschlag funktioniert bereits aus dem normalen Sprung. Er hat 5 Ticks
Ausholen, ein aktives Fenster bis Tick 16, insgesamt 38 Ticks (0,63 s), bis zu
4,5 m Schnurlänge und einmal 30 Schaden pro Ziel vor der bestehenden Bossprotektion.
Die sichtbare Bahn und die Trefferprüfung nutzen dieselbe Kurve. Reale Spielerhöhe,
Deckung und Blickrichtung zählen. Kein schädigender Rücklauf oder Landungs-Flächenschaden.
Eine eigene Körperpose, violetter Energiesaum und der vorhandene Knall unterstützen
die Bewegung. Keine neue Assetproduktion oder zusätzliche Renderobjekte pro Schlag.

Der Luftsprung setzt die Aufwärtsgeschwindigkeit auf 6 m/s; der normale Absprung
bleibt bei 11,8 m/s. Bei spätem zweitem Impuls liegt die Fußhöhe vom ebenen Boden
bei etwa 2,7 m statt 2,15 m. Frühzeitiges erneutes Drücken liefert weniger Höhe.
Eine echte Landung lädt den Luftsprung auf; Decke, Pause, Dash und Angriffe tun
das nicht. Nach Verlassen einer Kante steht ebenfalls eine Luftladung zur Verfügung.
Kein Luftdash, Schweben oder Unverwundbarkeit. Die Zielprojektion bleibt während
des Sprungs auf der Absprunghöhe, damit bloßes Steigen nicht das Bodenziel verschiebt.

Der zweite Sprung startet keinen neuen Angriff und setzt dessen Erholung nicht
zurück. Eine weitere bewusste Attacke kann erst nach deren Ende beginnen, auch
falls die Figur noch in der Luft ist. Eingaben während der Attacke werden nicht
gespeichert; Halten erzeugt keine automatische Kombo. Bei Pulse bleibt Schießen
erhalten; der Lufthieb gehört ausschließlich zur Peitsche.

## Missionssperren und Mobile

Die neue Bewegungsprobe fand einen tatsächlichen Fehler: Das bisherige 2,8 m hohe
Ausgangstor ließ sich mit Luftsprung und Kapselkollision überwinden. Nur im Prototyp
hat es deshalb eine sichtbare, 5,2 m hohe und 37 m breite Energiesperre. Ihre
Darstellung und Kollision verwenden dieselben Maße; das Relais öffnet sie regulär.
Legacy erhält beim Profilwechsel seine ursprünglichen Maße zurück.

Im Querformat gibt es nun auch für den Prototyp vollständige Touch-Aktionen:
Joystick zum Bewegen, Feld antippen zum Zielen/Schlagen, **Knall**, **Dash** und
**Sprung ×2**. Der Sprungknopf zeigt die verbleibende Luftaktion; Dash ist während
Sprung/Erholung optisch gedämpft. Bewegung und Aktion funktionieren mit getrennten
Fingern. Legacy/Arena behalten ihren Sprintschalter und bisheriges Feuerverhalten.

Geprüft ist Chrome-Touch-Emulation in 667×375 und 844×390 bei DPR 2, einschließlich
Mehrfingereingaben, erreichbarer Tasten, Pause, Ausrichtung und Neustart. Das ist
kein Leistungs- oder Bediennachweis auf echter iPhone-/Android-Hardware.
Der Entwicklungsbranch veröffentlicht den Prototyp nicht auf GitHub Pages;
Produktionsbuilds behalten Legacy als Standard und ignorieren Prototyp-/Lab-Parameter.

## Technische Prüfung

- 104/104 Unit-/Physiktests, Typecheck und Produktionsbuild bestanden. Acht neue
  Tests prüfen Ladung/Eingabeflanke, Decke/Pause, Dash-Priorität, Attackenwahl,
  reale Treffer/Deckung, stabile Zielrichtung, 30/60/144-Hz-Replay und Missionstore.
- Neue Desktop- und beide Touch-Abläufe bestanden; zusätzlich bestehende
  Bodenangriffe/Pulse-/Legacy-Wechsel, 30-Hz-Präsentation und Arena-Touch-Steuerung.
- Vollständige Mission ohne optionale Reserve bestanden: Tod vor/nach Checkpoint,
  beide Läufer, Boss-Sieg mit 15 HP übrig, Kern, Relais, geöffnete Sperre, Ausgang
  und vollständiger Neustart. Insgesamt neun abschließend erfolgreiche Browserfälle
  einschließlich des Luftangriffs in zwei Desktop-Auflösungen. Produktionsguard
  zusätzlich bestanden: regulärer Legacy-Start, kein Lab und kein Testhook.
- 24 Rapier-Bossversuche: acht Strategien an drei Startpositionen. Stehenbleiben,
  Rückwärtslaufen, enges Kreisen, einfaches Dauerspringen, Plateau-Stand und
  Doppelsprung-Dauerangriff verlieren alle 18 Fälle. Reaktive gemischte Peitsche
  gewinnt 3/3 in 45,68 s; mit begrenzter Pulse gewinnen 3/3 in 38,85–41,82 s.
  Keine Bosswerte für diese Ergebnisse verändert. Das ist eine gezielte Stichprobe,
  kein vollständiger Exploit-Beweis oder menschlicher Spielspaßtest.

Rohdaten, Browserberichte und Bildnachweise: [adventure-air](adventure-air/).
Die erste Browserprobe deckte ein seitliches Vorbeischwingen beim Abwärtshieb auf:
Zielhöhe und Diagonalwinkel sind korrigiert. Zwei Touch-Testprobleme wurden im
Test korrigiert: Bruchteile von CSS-Pixeln bei der Mindestgröße und falsche
Finger-IDs beim teilweisen Loslassen eines CDP-Mehrfingergestus.
Der erste vollständige Missionsautomat verlor mit nur Seitenschwung/Lufthieb
bei 74 übrigen Boss-HP. Die Abschlussprobe verwendet die bereits vorhandene
gemischte Strategie mit Überkopf-Knall in langen nahen Konterfenstern.

Geprüfter Gameplay-Quellhash:
`75bad62576539f014a276eea8c516e9930878dc77e234065ddcc55b7fa65af8d`.
Buildberichte nennen den Elterncommit `2759ae7`, weil vor dem Sicherungscommit
gebaut wurde. Änderungen an Tests/Dokumentation verändern den Quellhash nicht.

## Fortsetzung des laufenden T2

Normalen Sprung + Schlag und späteren zweiten Sprung zunächst an Übungszielen,
dann im Bosskampf vergleichen. Ist die Abwärtsbahn kontrollierbar? Lohnt sich der
Lufthieb situativ, ohne den Bodenkampf zu verdrängen? Bleiben Faust, Bodenwelle
und Plateau-Ausbruch verständlich? Falls der zweite Impuls zu schwach wirkt,
zuerst Zeitpunkt/Animation/Impuls prüfen, bevor zusätzliche Luftaktionen entstehen.

[Lokale Mission](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&combat=prototype)
· [Boss-/Übungslabor](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype).
