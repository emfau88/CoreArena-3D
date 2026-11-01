# Arena AP3 — Figuren und Waffenpräsentation

Stand: 1. November 2026. **Umgesetzt und technisch geprüft.** Ausgangsstand lokal
und auf GitHub: `34973f9`, sauberes Arbeitsverzeichnis. Auftrag: AP3; während der
Arbeit zusätzlich kleinere Mobile-Bedienelemente, eine kompaktere Vitalanzeige
und korrigierte Waffenfarben/-formen.
Adventure bleibt separat. AP4/AP5 und M3–M5 sind weiterhin offen.

## Sichtbares Ergebnis

- Drei eigene Arena-Waffensilhouetten: kurze Arc-Gabel mit Ring, kompakter Pulse
  mit Magazin/Schaft und lange einläufige Railgun. Auf Nutzerwunsch schießt die
  Railgun einen grünen Strahl; Pulse zeigt deutlich blaue Projektile. Dieselben Modelle
  erscheinen auf den Waffenfeldern; die neuen SVG-HUD-Icons greifen ihre Form auf.
- Waffen sitzen am rechten KayKit-Hand-Slot. Pulse/Rail erhalten eine angepasste
  Stützhand. Schultern richten den Lauf entlang der tatsächlichen Zielrichtung aus,
  auch bei erhöhten Zielen. Eine gehaltene Zielpose und kurzer Rückstoß ersetzen
  das wiederholte Absenken/Seitwärtsschwenken der ursprünglichen Arena-Schussclips.
- Eigene Arena-Ausrüstung auf vorhandenen Knochen: Visier, Helmplatten, Schultern,
  Brustplatte und kleiner Rückenaufsatz. Heller Spielerhelm mit einer Markierung,
  blauer Wingman mit zwei Helmfinnen, korallfarbene Gegner. Die ursprüngliche
  rot/blaue Atlasbemalung wird neutralisiert; dunkle Fugen/Details bleiben erhalten.
- Bots erhalten dieselben Waffen-, Sprung-, Ziel- und Rückstoßzustände. Ein echter
  Schuss erzeugt das Präsentationssignal auch dann, wenn ein Munitionsfeld sofort
  nachfüllt. Pause friert nun auch die Arena-Figurenanimationen ein.

Keine neuen Waffen, Werte, Trefferkörper, Karten oder Downloads. Eigene prozedurale
Geometrie und vorhandene CC0-KayKit-Dateien; [Herkunft](../../public/assets/kaykit/CREDITS.md).
Die GLBs bleiben unverändert. Adventure nutzt weiterhin seinen Kurier, seine
Waffenmodelle, Icons und Animationspfade; CTF-3.0/Hexwars wurden nicht verändert.

## Zusätzlicher Mobile-Wunsch

Nur Arena, CSS-Pixel im Querformat:

| Element | Vorher | Jetzt |
|---|---|---|
| Joystick | 116 × 116 | 88 × 88; kleinerer Knopf, transparenter |
| Sprung | 78 × 78 | 60 × 60 |
| Sprint | mindestens 82 × 56 | 60 × 44 |
| Waffenpanel | 276 breit | 246 breit; Tasten mindestens 48 hoch |
| HP/Rüstung | 156 breit, große Zahlen | 132 breit, rund 44 hoch; kleinere Zahlen/Balken |

Spawn-/Respawnhinweise erscheinen kurz oberhalb der Vitalanzeige und vergrößern
deren Fläche nicht mehr. Aktiver Sprint und niedrige HP behalten ihre Warnfarben.
Safe-Area-Ränder und getrennte Fingersteuerung bleiben erhalten. Im Adventure ist
der Joystick weiterhin 116 px breit; kein stiller gemeinsamer HUD-Umbau.

## Prüfung

Eingaben über Maus/Tastatur beziehungsweise echte Chromium-Touch-Events.
Spielzustände nur gelesen; keine Position, HP, Munition oder Ergebnisse gesetzt.
Sichtbare frische Chromium-Sitzungen, keine gleichzeitigen Builds.

- **AP3 Desktop 1366 × 768 und Touch 667 × 375:** Pulse/Rail regulär erlaufen;
  alle drei Waffen auswählen, gehen, springen und feuern. Handkontakt und
  horizontale Laufrichtung auch beim Schuss prüfen. Zweite Kamera, Rollen,
  regulärer Tod/Respawn, Neustart und eingefrorene Spieler-/Botposen in Pause.
  Bot-Pulse-Schüsse und Bot-Sprünge wurden im echten 2v2 beobachtet.
- **Sieben Regressionen:** AP2-Menüs auf Desktop/Touch einschließlich Rotation,
  Spieler-/Bot-Konfetti mit Respawn und Reset, separater Adventure-Einstieg sowie
  Adventure-Kurier in acht Bewegungsrichtungen, Sprint, Sprung und Arc/Pulse-Feuer.
- **Nach dem Mobile-Wunsch:** AP2-/AP3-Touch erneut plus Mehrfingertest bei
  844 × 390: unabhängig bewegen/feuern, Finger einzeln lösen, Abbruch, Einzelschuss,
  Sprung, Sprint, Kamera, Rotation und Neustart. Panels und Tasten verdecken sich
  im kleinen Querformat nicht. Insgesamt zehn unterschiedliche Browserfälle.
- **69/69 Kerntests**, Typecheck, Test- und Produktionsbuild bestanden. Der bestehende
  Rail-/Pickup-Test prüft zusätzlich Schusssignal bei direkter Nachfüllung, Cooldown
  und Reset. Keine geänderten Kampfregeln.

[AP3-Bericht](arena-ap3/browser-report.json), [Regressionen](arena-ap3/regression-report.json),
[kompakte Touch-Ansicht und Eingaben](arena-ap3/touch-compact-report.json).
Keine erfassten JavaScript-/HTTP-/Animationsbinding-Fehler in den AP3-Abläufen.

Bei der ersten Prüfung wurden zu großer Stützhandabstand, alte Atlasfarben und
seitlich schwenkende Schussposen gefunden und korrigiert. Die finale Prüfung
verlangt unter 1 mm Abstand zwischen Waffenursprung und Hand-Slot, unter 4 cm
Abstand der Stützhand zum Griff und unter 0,02 rad horizontale Richtungsabweichung.
Das sind Prüfungen der Darstellung, keine Änderung der Treffertoleranz.

## Bilder, Leistung und Grenzen

[Arc](arena-ap3/desktop-arc-detail.png), [Pulse](arena-ap3/desktop-pulse-detail.png),
[Rail](arena-ap3/desktop-rail-detail.png), [Wingman](arena-ap3/desktop-wingman-detail.png),
[grüner Rail-Strahl](arena-ap3/desktop-rail-play.png), [blaue Pulse-Projektile](arena-ap3/desktop-pulse-play.png),
[Gegner](arena-ap3/desktop-rival-detail.png), [Desktop-Spielkamera](arena-ap3/desktop-team-play.png),
[kompakte Touch-Ansicht](arena-ap3/touch-compact-hud.png),
[breites Touch-Querformat](arena-ap3/touch-compact-wide.png),
[Touch-Pulse im Spiel](arena-ap3/touch-pulse-play.png).
Die Detailbilder verwenden eine separate Dokumentationskamera ohne Änderung von
Spielposition oder Live-Kamera. Weltanzeigen bleiben dabei zur Spielkamera orientiert;
für tatsächliche HUD-/Größenlesbarkeit sind die Spielaufnahmen maßgeblich.

Die neuen Waffen bündeln ihre Geometrie in drei Materialgruppen; Rüstungsteile
erhöhen trotzdem die Zeichenaufrufe. AP3-Stichprobe nach Rundenneustart: 613 Aufrufe
Desktop / 505 Touch; vorherige AP2-Match-Stichproben 462–593 / 371–529. Unterschiedliche
Spielsituationen, **kein kontrollierter Vorher/Nachher-Benchmark**. Gemessene
Renderframe-p95 etwa 8,2 ms Desktop / 5,6 ms Touch auf der PC-GPU. Keine neuen
Lichtquellen, Schattenkarten oder Texturdownloads. Der bekannte große Vite-Hauptchunk
bleibt bei rund 5,12 MB / gzip 1,88 MB.

Echter Handytest, persönliche Bewertung von Figuren/HUD und menschliche
Seitenbalance bleiben offen. Touch-Emulation ist kein Nachweis der Handy-Leistung.
Keine neue vollständige Match-/Balanceabnahme; AP3 ergänzt die bestehenden M2.6/AP2-Nachweise.

## Produktionsbuild

Lokaler Produktionsbuild zusätzlich auf Desktop und Touch geprüft: 2v2-Einstieg,
Bewegung/Sprung, Sprint während gehaltenem Joystick, Pause/Weiter, Spielauswahl
und separates Adventure mit `adventure=1`. HTTP 200, keine JavaScript-/HTTP-Fehler,
Testdiagnose `__coreArena` nicht enthalten. Verifizierter Bundle-Name:
`index-DAr_h61h.js`. [Produktionsbericht](arena-ap3/production-local.json),
[kleines Touch-Querformat](arena-ap3/production-local-touch-hud.png).
Reproduzierbar mit `scripts/qa/ap3Production.mjs <Spiel-URL> <Bericht-Präfix>`
nach lokalem Produktionsbuild; das Skript vergleicht auch den ausgelieferten Bundle-Namen.

## Reproduktion

```powershell
npm test
npm run build:test
npx playwright test tests/e2e/arena-ap3.spec.ts --project=chromium-1366
npx playwright test tests/e2e/fighter-look.spec.ts tests/e2e/arena-death.spec.ts tests/e2e/arena-ap2.spec.ts --project=chromium-1366 --trace=off
npx playwright test tests/e2e/arena-ap3.spec.ts tests/e2e/arena-ap2.spec.ts tests/e2e/mobile.spec.ts --project=chromium-1366 --grep 'touch' --trace=off
npm run build
```

Nächster geplanter Bulk: **M3.1 Classic CTF**, noch nicht freigegeben.
