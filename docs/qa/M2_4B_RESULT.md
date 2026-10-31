# M2.4b — Arena-Bewegung, Bot-Routen und Schwierigkeit

Stand: 31. Oktober 2026. Umgesetzt und technisch geprüft; persönliche Spielabnahme offen.

## Spielergebnis

Arena-Spieler und aktive Arena-Bots nutzen jetzt dieselbe kurze Sprungkurve wie
Adventure: 11,8 m/s Sprungimpuls, 34 m/s² Schwerkraft, rund 0,72 s Flug und 2,15 m
Scheitelhöhe. 32-cm-Treppenhilfe überwindet flache Stufen, keine ganzen Mauern.
Adventure-Werte bleiben identisch, die historische M1-Physikfixture bleibt erhalten.

Bots verbinden Bodenwege mit den vorhandenen Sprungverbindungen E0 → E1 → E2
und Abwürfen zurück auf E0. Eine zusätzliche Rückverbindung führt von E1 zum
Boden; keine neuen Plattformen/Räume. Bewegung, Sprung und Landung laufen durch
dieselbe Rapier-Kollision wie beim Spieler, ohne Teleportieren.

Ohne sichtbaren Gegner suchen Bots benötigte Heilung, Rüstung, Waffen oder Munition.
Priorität berücksichtigt den eigenen Zustand und Entfernung/Höhenweg. Volle
Inventare und leere Felder sind keine Ziele. Sichtbarer Kampf unterbricht die Suche;
kritische Heilung darf eine Suche nach dem zuletzt gesehenen Gegner verdrängen.
Aufnahme und Wiederauffüllen folgen den normalen Pickup-Regeln.

Vor dem Match stehen Leicht / Normal / Schwer zur Wahl. Reaktionszeit 0,70 / 0,40 /
0,25 s; unterschiedliche Zielabweichung und Drehgeschwindigkeit, auf Leicht zusätzliche
Feuerpausen. Keine zusätzlichen HP, Rüstung, Munition, Sichtweite oder Waffenschäden.
Alle Bots einschließlich des Verbündeten verwenden die gewählte Stufe.

## Prüfung

67 Kerntests bestanden. Neue Fälle prüfen die komplette Höhenroute mit kompakter
Sprungkurve, flache Stufen versus volle Kante, tatsächliche erhöhte Vorratsaufnahme
und Rückweg auf allen drei Schwierigkeiten, Bedarf/Verfügbarkeit und Reaktionszeiten.
Bestehende räumliche Sicht-/Deckungs-, Waffen-, Team- und Adventure-Prüfungen grün.

Fünf Browserfälle bestanden: Desktop (1366 × 768) und Touch-Emulation (844 × 390),
jeweils Höhenroute mit tatsächlichen Spieler-Sprüngen und Rüstungsfund auf E2,
Stufenauswahl und Bot-Vorratssuche. Zusätzlich komplette 2v2-Runden einschließlich
Rail-Funden/Schüssen und Neustart; Adventure-Einstieg ohne Rail geprüft. Keine Browserfehler.

[Browserbericht](m2-4b/browser-report.json), [Desktop-Höhenroute](m2-4b/desktop-e2-supply.png),
[Touch-Höhenroute](m2-4b/touch-e2-supply.png), [Touch-Match](m2-4b/touch-team-result.png).
Testbuild/Typecheck erfolgreich. Touch-Emulation ist kein tatsächlicher Handytest.

## Grenzen

Gezielte Navigation für diese Arena und ihre expliziten Höhenverbindungen;
kein allgemeiner Navmesh-Generator, kein vorgetäuschtes Wissen über verdeckte Gegner.
Schwierigkeitsgefühl und echte Smartphone-Leistung brauchen persönliche Abnahme.
M2.5 ist ausdrücklich freigegeben und folgt separat. M2.6 und Adventure-L1.5b offen.
CTF-3.0 und Hexwars unverändert.
