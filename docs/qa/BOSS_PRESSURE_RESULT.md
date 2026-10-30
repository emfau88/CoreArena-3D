# L1.6b · Bossdruck und Kampflesbarkeit

Stand: **30. Oktober 2026**. Nur L1.6b umgesetzt. Vor Beginn waren lokales
`main` und GitHub-`main` auf **8eba27f** (fertiges L1.6a), Arbeitsbaum sauber.
Zum Zeitpunkt dieses Berichts waren L1.6c und L1.5b offen. Anschließend wurde
[L1.6c separat umgesetzt](OUTPOST_PLACES_RESULT.md); L1.5b bleibt offen.
Sämtliche Spieltests verwenden **`adventure=1`**.

## Befund vor der Änderung

Der Vergleich wurde mit den aktuellen Waffen tatsächlich neu gespielt:
Stationäres Auto-Arc verlor bereits, stationäres Pulse mit anschließendem
Auto-Arc gewann dagegen wieder mit 30 HP. Der alte Befund wurde damit für
Pulse bestätigt, aber nicht pauschal auf beide Waffen übertragen.

Die bisherige Welle lief 2,5 s bis zum Außenradius. In Bossnähe war sie längst
vorbei, während der Boss noch auf das Ende des gesamten Wellenablaufs wartete.
Zusammen mit der anschließenden Erholung entstand ein langes freies Schussfenster.
Gezielt diesen Ablauf verkürzt und den angekündigten Faustschlag bedeutsamer gemacht.

## Begrenzte Änderungen

| Parameter / Rückmeldung | Vorher | L1.6b |
|---|---|---|
| Faust-Vorwarnung | 0,35 s | **0,5 s**, gleiche festgelegte Richtung |
| Faustschaden | 20 | **30** |
| Schlagfolge bei dauerhafter Nähe | 1,25 s | **1,4 s** durch längere Vorwarnung |
| Wellenlauf | 2,5 s bei 7,2 m/s | **1,5 s bei 12 m/s**, weiterhin 20 m Außenradius |
| Warnfläche | äußerer Faustbogen | zusätzlich ausgefüllter Sektor während des Ausholens |
| Warnklänge | kurzer gemeinsamer Faustklang | eigener Boss-Faustklang; unterschiedliche Wellen-/Ausbruchklänge |
| Erholung | „Gegenfeuer!“ | „ERHOLUNG · Jetzt feuern!“, cyanfarbener Kern und abgesenkte Haltung |

600 Boss-HP, Verfolgung, Angriffsfolge, Wellen-/Ausbruchschaden, 1,5 s
Wellenwarnung, 1,25 s Ausbruchwarnung und 0,8 s Spezial-Erholung bleiben bestehen.
Arc, Pulse, Munition, Sprünge, räumliche Trefferprüfung, Deckung und Plateau-Angriffe
werden wiederverwendet. Kein neuer Angriff, Ausfallschritt, Gegner, Asset oder
Raum; keine Änderung an Missionskette, Checkpoint, CTF-3.0 oder Hexwars.

## Gemessene Spielversuche

Start jeweils über normalen Spawn, beide Wächter, Pulse-Fund, Konsole und Checkpoint.
Bossvergleich am Zugang ungefähr **(x=0, z=−21)**: 100 HP, 50 Rüstung, 54 Pulse-Schuss,
600 Boss-HP. Keine Eingriffe in Spielfiguren, Schaden, Munition oder Position.
Stationär bedeutet stehenbleiben und auf den Boss feuern; aktiv bedeutet zusätzlich
Springen bei Faust/Welle und seitliches Verlassen des festgelegten Ausbruchkreises.
Pulse fällt nach Verbrauch seiner 54 Schuss regulär auf Arc zurück.

Zeiten sind **Simulationszeit im Bossvergleich**, keine Dauer des ganzen Levels.
HP/Rüstung zeigen den Rest beim Sieg, Boss-HP den Rest bei Niederlage.

| Versuch am Zugang | Desktop vorher | Desktop nachher | Touch-Emulation nachher |
|---|---|---|---|
| Arc stationär | Niederlage 11,50 s; Boss 117 | **Niederlage 8,43 s; Boss 250** | **Niederlage 8,45 s; Boss 243** |
| Arc aktiv | Sieg 14,05 s; 100/50 | **Sieg 13,92 s; 90/0** | **Sieg 13,67 s; 100/50** |
| Pulse stationär | Sieg 10,10 s; 30/0 | **Niederlage 8,42 s; Boss 90** | **Niederlage 8,47 s; Boss 90** |
| Pulse aktiv | Sieg 10,12 s; 100/50 | **Sieg 10,08 s; 100/50** | **Sieg 10,08 s; 100/50** |

Zusätzlicher Desktop-Versuch auf dem Medkit-Plateau bei ungefähr (−12, −23):
stationäres Pulse verliert nach **9,02 s**, Boss **46 HP**, drei Bodenausbrüche.
Das vorhandene Medkit heilt dabei automatisch insgesamt 35 HP; trotzdem keine
sichere Dauerfeuerposition. Dieser Versuch hat andere Geometrie und zusätzliche
Heilung und ist deshalb nicht mit den Zugangszeiten gleichzusetzen.

**Ergebnis:** In den dokumentierten Situationen bringt aktives Spielen einen
deutlichen Vorteil. Die Kampfzeit erfolgreicher Versuche bleibt annähernd gleich.
Das ist ein gezielter technischer Vergleich, keine statistische Schwierigkeits-
oder Spaßabnahme: automatisierte zielgenaue Eingaben, jeweils einzelne gültige
Läufe, geringe Startpositions-/Frameabweichungen. Keine Aussage, dass jede denkbare
stationäre Position verlieren muss. Exakte Positionen, Treffer und Phasen stehen
in [measurements.json](boss-pressure/measurements.json), ausschließlich aus
bestandenen Versuchen. Vier gültige Vorher- und neun gültige Nachher-Versuche.

## Prüfung und Nachweise

- **57/57 Node-Tests bestanden**, einschließlich realer seitlicher Ausweichbewegung
  nach 0,2 s Reaktionszeit, fester Schlagrichtung, Höhe, Wellenreichweite,
  Einmaltreffer und tatsächlicher Erholung. Alte Arenaregeln bleiben separat.
- `npm run build` und `npm run build:test`: bestanden. Bestehender Hinweis auf
  große Three-/Rapier-Chunks; keine neue Abhängigkeit.
- Chromium **156.0.8078.4**, Desktop **1366×768**, Touch **844×390**, DPR 2,
  `isMobile/hasTouch` und echte CDP-Touch-Eingaben für Stick, Feuer und Sprung.
  Tests laufen im sichtbaren Browser; der Test-Hook liest nur Zustand.
- Neun gültige Nachher-Bossvergleiche ohne JavaScript-/Konsolenfehler.
- **3/3 anschließende Gameplay-Regressionsfälle bestanden:** vollständige
  Missionskette auf Desktop und Touch, jeweils mit tatsächlichem Tod/Boss-Retry,
  Pflichtkern, Relais, physischem Ausgang und vollständigem Neustart; außerdem
  Fernbeschuss-Reaktion des Wächters, Rückzugssperre und treffender/ausweichbarer
  Plateau-Ausbruch. [Desktop](boss-pressure/mission-desktop-report.json),
  [Touch](boss-pressure/mission-touch-report.json),
  [Höhenfall](boss-pressure/mission-terrain-report.json).
- [Desktop-Faustwarnung](boss-pressure/desktop-melee.png),
  [Desktop-Erholung](boss-pressure/desktop-recovery.png),
  [Touch-Faustwarnung](boss-pressure/touch-melee.png) und
  [Touch-Erholung](boss-pressure/touch-recovery.png) visuell gesichtet.

Rohberichte: [erste Vorher-Serie](boss-pressure/before-first-report.json),
[gültige aktive Vorher-Versuche](boss-pressure/before-reactive-report.json),
[erste Nachher-Serie](boss-pressure/after-first-report.json),
[Touch/Plateau](boss-pressure/after-touch-plateau-report.json),
[abschließender stationärer Touch-Pulse-Versuch](boss-pressure/after-touch-pulse-report.json).
Die ersten Serien enthalten auch fehlgeschlagene Testversuche und sind ausdrücklich
keine durchgehend grünen Gesamtläufe: Wiederverwendete Browserprozesse erschöpften
bei zwei Vorher-Läufen Chromiums Blob-Budget; der Test startet deshalb nun pro
Messung einen frischen Prozess. Ein anfängliches Touch-Ende ohne aktive Berührung
und eine redundante Browser-Bereinigung wurden im Test korrigiert. Der letzte
Touch-Pulse-Lauf verwendet zusätzlich framegenaues Warten auf das Auftauchen-Ende.
Diese fehlerhaften Läufe zählen nicht zur Tabelle. Eine anfänglich nicht zurückgesetzte
Simulations-Testfigur wurde ebenfalls korrigiert; alle Schleifen sind begrenzt.

**Kein tatsächlicher Handytest**, keine Handy-FPS-/Temperaturmessung und keine
akustische Qualitätsabnahme. L1.5b (Gesamtabnahme) bleibt separat freizugebende Arbeit.
