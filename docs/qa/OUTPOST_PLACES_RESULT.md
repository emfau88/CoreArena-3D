# L1.6c · Ladestation, Wartungsbereich und Relaisanlage

Stand: **30. Oktober 2026**. Vor Beginn: lokales `main` und GitHub-`main`
auf **bca1d37**, Arbeitsbaum sauber. Nur L1.6c umgesetzt;
**L1.5b bleibt offen und nicht freigegeben**.

## Spielbares Ergebnis

| Ort | Sichtbare Funktion | Bestehende Grundlage |
|---|---|---|
| Ladestation | Zwei markierte Ladebuchten, gemeinsames Ladegerät, Frachtkiste und erkennbare Pulse-Ausgabe mit Ablage | Beschädigte Lieferdrohne, Retro-Tech-Konsole, vorhandener Pulse-Fund |
| Wartungsbereich | Werkplatz mit kleiner Reparaturdrohne, Verbindung zur bedienbaren Konsole, markierte Treppenkanten zur Reserve | Derselbe bereits geladene Hover-Bot als statische Kopie, vorhandene Konsole und Terrasse |
| Relaisanlage | Zwei Kondensator-/Versorgungsschränke mit Leitungen zu den bestehenden Konsolen und zum Relais | Vorhandenes Relais, Konsolen und Missionszustand; Versorgung leuchtet nach Aktivierung auf |

Sieben neue feste Ausstattungsobjekte mit gemeinsam definierten sichtbaren und
physikalischen Standflächen. Ladegerät, Fracht und Werkplatz stehen innerhalb
der Höfe; Hauptweg, breite Verbindungen, Sprünge und Vorratszugänge bleiben frei.
Bodenmarken und Leitungen sind passierbar. Keine neuen Räume oder Gegner.
Keine neuen Downloads, Pakete oder kostenpflichtigen Assets. Statische Details
sind nach Material zusammengefasst; keine zusätzlichen Echtzeitlichter.
CTF-3.0 und sämtliche Hexwars-Modell-/Quelldateien bleiben unverändert.

## Der freiwillige Abstecher lohnt sich

Auf der vorhandenen 1,1-m-Terrasse steht bei **(−14,6; 2)** eine Wartungsreserve.
Vom Treppenaufgang weisen blaue Kanten und eine Bodenmarke dorthin. In Reichweite
auf der Terrasse lässt sich die Kiste mit **E oder Touch** bergen. Der Deckel
öffnet sich, das Fundlicht erlischt und eine kurze Meldung erklärt den Nutzen:

- Am einmaligen Checkpoint **mindestens 75 statt 50 Rüstung**; höhere Rüstung bleibt erhalten.
- Beim Boss-Retry **erneut 75 Rüstung**. HP und Pulse-Auffüllung bleiben wie bisher.
- Bei vollständigem Neustart, Reload oder Tod vor dem Checkpoint ist der Fund zurückgesetzt.
- Kein wiederholtes Auffüllen an der Kiste; kein Inventar oder dauerhaftes Upgrade-System.
- Auch ein Fund nach dem ersten Checkpoint wirkt einmalig, danach nur noch beim Retry.
- Die bisherigen Vorräte bleiben verfügbar. Der Abschluss nennt die geborgene Reserve.

Damit wird der Fund nicht durch die nahe Checkpoint-Auffüllung ersetzt. Der
Hauptweg funktioniert weiterhin ohne ihn. L1.6b-Bosswerte und Waffenwerte bleiben
unverändert; der Rüstungsbonus ist eine bewusst begrenzte optionale Hilfe.

## Prüfung

**Ablauf:** echte Eingaben → Terrasse und Interaktion → Fundzustand/sichtbar geöffnete
Kiste → Checkpoint → tatsächlicher Boss-Tod → Retry mit 75 Rüstung → Boss-Sieg,
Pflichtkern, Relais und Ausgang → vollständiger Neustart ohne Fund.

- **59/59 Code-Tests bestanden.** Neue Prüfungen sichern Höhe/Reichweite/freie Sicht,
  einmalige Aufnahme, Checkpoint/Retry, späten Fund und Neustart. Der vorhandene
  Test mit dem echten Bewegungsmotor erreicht Hauptweg, Vorräte und alle drei
  erhöhten Bereiche trotz Ausstattung weiterhin.
- Produktions- und Test-Build sowie TypeScript bestanden. Bestehender Hinweis auf
  große Three-/Rapier-Chunks bleibt; keine zusätzliche Abhängigkeit.
- **Desktop 1366×768 mit Reserve:** vollständiger Ablauf bestanden,
  einschließlich Tod/Retry, Kern, Relais, Ausgang und Neustart.
  [Rohbericht](outpost-places/desktop-report.json).
- **Touch-Emulation 844×390 mit Reserve:** gleicher vollständiger Ablauf bestanden;
  tatsächliche CDP-Touch-Eingaben für Bewegung, Feuer, Sprung und Interaktion.
  Auch gleichzeitige Bewegungs-/Feuer-/Interaktionsfinger an der Konsole bleiben geprüft.
  [Rohbericht](outpost-places/touch-report.json).
- **Desktop ohne Reserve:** vollständiger Ablauf bestanden, Checkpoint und Retry
  weiter mit 50 Rüstung. Der Fund ist keine Abschlussbedingung.
  [Rohbericht](outpost-places/no-reserve-report.json).
- Je eine Vorher-/Nachher-Aufnahmeprüfung der drei Höfe in seitlicher, gerader und
  isometrischer Kamera bestanden. [Nachher-Bericht](outpost-places/look-report.json).
  Diese festen Dokumentationskameras bewegen nur die Kamera; die Weg-/Kampftests
  verwenden reguläre Eingaben ohne Teleport, Schadens- oder Ressourceninjektion.
- Keine JavaScript-, Konsolen- oder HTTP-Fehler in den abgeschlossenen Spieltests.

Chromium unter Windows; Touch-Geräteprofil mit DPR 2, das Spiel begrenzt die
Renderauflösung wie bisher selbst. **Kein tatsächlicher Handytest** und keine
abschließende Leistungs-, Schwierigkeits- oder persönliche Stilabnahme. Das ist
der gezielte L1.6c-Nachweis; die Gesamtabnahme L1.5b wird damit nicht erledigt.

## Vergleichsbilder und Touch-Sichtung

Identische seitliche Übersichtskameras; die Figur bleibt am Spawn, daher zeigt
der HUD-Ortsname auch in den anderen Übersichten die Ladestation. Im regulären
Spiel folgt der Ortsname der Spielerposition.

| Ort | Vorher (bca1d37) | Nachher |
|---|---|---|
| Ladestation | [Bild](outpost-places/entry-before.png) | [Bild](outpost-places/entry-after.png) |
| Wartung | [Bild](outpost-places/middle-before.png) | [Bild](outpost-places/middle-after.png) |
| Relaisanlage | [Bild](outpost-places/boss-before.png) | [Bild](outpost-places/boss-after.png) |

Visuell gesichtet: alle drei seitlichen Übersichten, Wartung isometrisch,
Touch-Ankunft, Reserve vor/nach Aufnahme und aktiviertes Relais. Fund, Treppenkanten,
Hauptweg und Spielfigur bleiben im Querformat erkennbar; die neue Ausstattung
verdeckt den zentralen Kampfweg nicht.

[Desktop-Fund](outpost-places/desktop-reserve.png) ·
[Touch vor Aufnahme](outpost-places/mobile-reserve-before.png) ·
[Touch nach Aufnahme](outpost-places/mobile-reserve-collected.png) ·
[Touch: Anlage online](outpost-places/mobile-online.png).
