# Arena-Map-Paket — Obsidian Garden

Stand: 1. November 2026. Ausgangsstand lokal und GitHub `2dff4cc`, sauberer
Arbeitsordner. Separat freigegeben mit „go map paket“, nach dem Kartenvergleich.

## Spielergebnis und Umfang

- **56 × 36 m bleiben erhalten.** Die offene Südroute, Außenflanken, Teamstarts
  und bisherige West-Sprungroute bleiben spielbar. Die Ostseite erhält denselben
  E0→E1→E2-Aufstieg und Abstieg. Ihr bisheriger Gartenblock wird dafür neu geordnet;
  Bank und Garten passen zur westlichen Deckung.
- Pulse, Heilung, Munition auf E1 und Rüstung auf E2 gibt es jetzt auch im Osten.
  Zusammen zehn Vorratsfelder statt sechs; die zwei Rail-Felder bleiben erhalten.
  Gleiche Mengen, Höhenbindung und normale 10-s-Nachfüllregel auf beiden Seiten.
- Deutlich schwächere Bodenfugen, dezente Mineralstruktur, sichtbare Abdeckungen
  und Sockel, kleinere gebogene Pflanzenblätter in gedämpften Grüntönen.
  Umlaufende Bodenlinien und überflüssige Startstreifen entfallen.
- Vorhandene Bänke erhalten eingebaute Team-Vorratsschränke. Die äußeren
  Deckungsblöcke sind nun Rail-Energiekästen mit Lüftung, Wartungsdeckeln und
  lokalen Teamlichtern. Keine zusätzlichen Hindernisse in den Kampfwegen.

Verwendet werden bestehende Arena-/Rapier-/Pickup-/Bot-Systeme und lokal erzeugte
Geometrien/Materialien. Kein neuer Modelldownload, kein gekauftes Asset, keine
neue Lichtquelle. Keine Änderung an Waffenwerten, Bot-Stufen, Matchregeln, HUD
oder Kamerazoom. Die verfeinerte Darstellung ist nur im erweiterten Arena-Builder
aktiv; historische M1-Geometrie, Adventure, CTF-3.0 und Hexwars bleiben unverändert.

## Seitenvergleich mit derselben Bot-Steuerung

Vor und nach dem Umbau je 30 Startvarianten: drei Stufen, zehn feste Seeds.
Zusätzlich dieselben 30 Varianten mit an X gespiegelter **Karte und Pickups**.
Teamstarts, Blickrichtungsvariation, Patrouillen, Waffen, Bot-Logik und
Verarbeitungsreihenfolge bleiben dabei gleich. Dadurch wird der Einfluss der
Kartenorientierung von unveränderten Bot-/Reihenfolgeeffekten getrennt.

| Stufe | Vorher Blau:Rot | Vorher gespiegelte Karte | Nachher Blau:Rot | Nachher gespiegelt |
|---|---|---|---|---|
| Leicht | 2:8 | 1:9 | 6:3, ein Unentschieden | gleich |
| Normal | 8:2 | 5:5 | 7:3 | gleich |
| Schwer | 10:0 | 2:8 | 5:5 | gleich |

Die Tabelle zählt gewonnene Runden, keine Kills. Alle Runden enden regulär,
ohne ungültige Zustände oder offene Bewegungsaufträge mit mindestens fünf
Sekunden Stillstand. Beide Höhenrouten werden zusätzlich mit allen drei
Schwierigkeitsstufen durch echte Bewegung und normale Ressourcenaufnahme geprüft.

Die neue physische Deckung und Versorgung sind spiegelsymmetrisch; die Spiegel-
läufe ergeben entsprechend dieselben Resultate. Sie sind **keine weiteren
30 unabhängigen Balance-Stichproben**. 7:3 auf Normal bleibt eine kleine,
botabhängige Stichprobe, kein Beweis perfekter menschlicher Balance. Durchschnitt-
liche Rundendauer auf Leicht steigt mit mehr Versorgung von 92 auf 112 Sekunden;
Spieltempo und Vorratsdichte brauchen das persönliche Urteil.

[Vorher: Einzelrunden und Traces](arena-map/before-soak.json),
[nachher: Einzelrunden und Traces](arena-map/after-soak.json).

## Technische Prüfung

69/69 Kerntests bestanden. Dazu gehören spiegelgleiche physische Deckung und
Vorräte, beidseitige echte Höhenrouten, Rail-Flanken, Deckungs-Auswege sowie
die bestehenden Adventure-/Kampf-/Physikregeln. Typecheck und Testbuild bestanden.
Elf unterschiedliche Browserfälle bestanden: beide alten West-Höhenwege,
neue Ost-Routen auf Desktop/844 × 390/667 × 375, kleines HUD/Pausenmenü,
1v1-Lebenszyklus, drei vollständige 2v2-Matches und Adventure-Einstieg.
Echte Tastatur-/Mauseingaben beziehungsweise Chromium-Touch-Events; ausschließlich
lesende Test-API, keine Positions-, Inventar-, HP- oder Uhr-Injektion.
[Erster vollständiger Browserlauf](arena-map/pre-batching-browser-report.json).

Die erste Messung zeigte bis zu 749 Zeichenaufrufe. Deshalb werden die Details
der Depots/Energiekästen in fünf Instanzgruppen zusammengefasst. Die vorhandenen
Deckungskörper liefern den Schatten; millimeterdünne Details benötigen keinen
eigenen Schattenwurf. Abdeckungen liegen leicht über dem Grundkörper, um
überlagerte Flächen zu vermeiden. Desktop-/Touch-Routen und vollständige Matches
wurden für die gebündelte Darstellung erneut geprüft.

Zwei Wiederholungsläufe deckten Annahmen des Testablaufs auf: Die Figur konnte
beim stationären Warten auf einen vom Verbündeten geleerten Pulse-Fund sterben;
der Test wartete danach am Respawn weiter. Er läuft nun wieder zum Fund und
verteidigt sich regulär mit Arc. Außerdem wurde ein Pulse-Schuss im späteren
Messfenster nicht nachgewiesen. Der Test prüft jetzt unmittelbar beim Abfeuern
das eigene Projektil oder den Munitionsverbrauch, bevor Nachfüllen/Tod den
beobachteten Zustand verändern können. Die Spielregeln wurden dafür nicht geändert.

[Instanz-Prüflauf mit Wartefehler](arena-map/instancing-browser-report.json),
[finale Ansichten und fehlender später Schussnachweis](arena-map/pulse-observation-report.json),
[korrigierter Touch-Match, bestanden](arena-map/browser-report.json).
Alle elf unterschiedlichen Fälle haben damit einen bestandenen Nachweis;
Wiederholungen werden nicht als zusätzliche unabhängige Szenarien gezählt.

| Letztes vollständiges Match | Blau:Rot | Ende | Frame-p95 der Stichproben | Zeichenaufrufe |
|---|---|---|---|---|
| Desktop, Leicht, 1920 × 1080 | 6:8 | volle 120 s, Zeitlimit | 11,1–16,7 ms | 503–675 |
| Touch, Normal, 844 × 390 | 3:10 | 50,0 s, Abschussziel | 8,3–13,9 ms | 437–550 |
| Touch, Schwer, 667 × 375 | 10:8 | 82,5 s, Abschussziel | 8,4–13,9 ms | 395–556 |

[Desktop-Profil](arena-map/desktop-easy.json),
[Touch Normal](arena-map/touch-normal.json), [Touch Schwer](arena-map/touch-hard.json).
Keine erfassten JavaScript-Fehler. Echte Lebenszyklen, Waffen, Ergebnisse und
Neustarts; keine Ergebnismanipulation. Diese eingabegesteuerten Einzelmatches
sind keine Seitenbalance-Statistik. Desktop/Schwer wurden mit Instanzen vor der
letzten reinen Deckelfugen-/Detailschattenkorrektur gemessen, Normal danach.
Die finalen Ansichten bestehen danach auf allen drei Bildschirmgrößen.

Windows-PC mit AMD Ryzen 7 6800H/Radeon Graphics, sichtbarer Chromium-Browser,
Touch-Emulation auf derselben PC-GPU. Kein paralleler Build/Soak während der
Matchmessungen. Bereiche aus Stichproben alle fünf Spielsekunden, keine
Gesamtlauf-Perzentile. Schritt-p95 1,1–1,9 ms. Dropped-Tick-Zähler enthalten
Laden/Screenshots und den Vorlauf; nach Spielsekunde 9/16/9 bleiben sie konstant.
Die Karte zeichnet mehr als vor dem Map-Paket. Echtes Handy-FPS-/Wärmeverhalten
und die menschliche Bewertung von Tempo/Versorgung bleiben offen.

Produktionsbuild und Typecheck bestanden. Die bestehende Vite-Bundlewarnung
bleibt: Haupt-JS rund 5,10 MB / gzip 1,875 MB; kein zusätzlicher Modelldownload.
Der finale Produktionsbuild `index-BVw5K5Xz.js` startet lokal auf Desktop und
Touch mit 2v2, Bewegung/Sprung und Menü. HTTP 200, keine JS-/HTTP-Fehler, keine
externe CDN-Anfrage und keine Test-API. Der Adventure-Einstieg bleibt separat.
[Produktionsprüfung](arena-map/production-local.json). Lokale Ladezeiten
1,55/1,67 s sind keine Aussage über einen Internet-Kaltstart.

**Live veröffentlicht und geprüft:** Spielcommit `271c3f6`, erfolgreicher
[Pages-Lauf 41301596475](https://github.com/emfau88/CoreArena-3D/actions/runs/41301596475).
Das erwartete Produktionsbundle startet über GitHub Pages mit 2v2, Bewegung,
Sprung und Pausenmenü auf Desktop und in Touch-Emulation. HTTP 200, keine
JS-/HTTP-Fehler, keine externe CDN-Anfrage, keine Test-API; Adventure separat
erreichbar. Gemessener Arena-Einstieg 4,34/2,48 s auf derselben PC-Verbindung,
keine Aussage über echte Handyhardware. [Live-Nachweis](arena-map/production-live.json).

Ansichten: [Ostseite](arena-map/desktop-east.png),
[Rail-Versorgung, isometrisch](arena-map/rail-isometric.png),
[hohe Plattform auf kleinem Touch-Querformat](arena-map/touch-small-east.png),
[bestehende Westroute](arena-map/touch-west.png).

Reproduktion des neuen Soaks:

```powershell
npx tsx scripts/qa/arenaSoak.ts docs/qa/arena-map/after-soak.json 1 10 --paired
```

Ohne Ausgabepfad schreibt das Skript jetzt nach `test-results/arena-soak.json`,
damit ein normaler neuer Prüflauf die historischen M2.6-Nachweise nicht überschreibt.

Der Vorher-Lauf wurde nach Erweiterung des Prüfskripts, aber vor dem Kartenumbau
ausgeführt. Seine ungespiegelten Resultate stimmen mit dem M2.6-Nachweis überein.

Nächster Schritt: persönliche Kartenprobe, besonders Vorratsdichte und Lesbarkeit
auf einem echten Handy. Danach bei eigener Freigabe M3.1 Classic CTF. Adventure
hat weiterhin seine eigene Roadmap; L1.5b ist bereits technisch abgeschlossen.
