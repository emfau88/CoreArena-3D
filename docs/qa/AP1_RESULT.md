# Arena AP1 — Premium-Bauteile

Stand: 1. November 2026. **Umgesetzt und technisch geprüft.** Persönliches
Spiel-/Gestaltungsurteil und echter Handytest bleiben separat offen.
Ausgangsstand lokal und GitHub: `a8cd168`; zusätzlich lagen die bereits gewünschten
Roadmap-Änderungen lokal vor und gehören zur gemeinsamen Veröffentlichung.
Freigegeben wurde ausschließlich AP1. Adventure, AP2–AP5 und M3–M5 bleiben separat.

## Ergebnis und Umfang

- Gestaltung: dunkler Graphitsockel, neutrales gebürstetes Metall, versenkte
  Segmente und Bolzen; Farbe nur für Team beziehungsweise Vorratsart. Die
  bestehenden grünen Pflanzen und ruhigen Steinflächen bleiben der Rahmen.
- Ein gemeinsamer flacher 3D-Sockel ersetzt die einfachen Spawnringe und
  Rail-Bodenfelder. Vier Teamplätze tragen nach innen gerichtete Teamzeichen;
  Trainings-/Duellplätze folgen ihren tatsächlichen Starts. Ein kurzer
  0,8-s-Ringimpuls markiert Start/Respawn, nicht dauernd den ganzen Boden.
- Zehn Vorratsorte zeigen denselben Sockeltyp: bereit mit Modell und Farbakzent,
  leer/nachladend mit radialem Fortschritt und verbleibenden Sekunden. Der
  vorhandene Zehn-Sekunden-Zyklus wird nur dargestellt, nicht verändert.
- Volle Gesundheit/Rüstung/Munition meldet sich kurz beim Betreten der Fundstelle;
  ohne Pulse erscheint bei Energievorräten „Erst Pulse aufnehmen“. Kein dauerndes
  Wiederholen beim Stehenbleiben. Teilaufnahmen erhalten die Restmenge.
- Die beiden vorhandenen Rail-Energiekästen verwenden dasselbe überarbeitete
  Deckungsmodul: Graphitkörper, 4-cm-Kantenfase, Sockel, Metallrippen, Endplatten,
  Wartungsluken und lokale Teamleuchten. Außenmaße und feste Boxkollision bleiben erhalten.

Alle Modelle entstehen aus eigener Geometrie; keine zusätzlichen Assetdownloads,
Lichtquellen oder Physikobjekte. Sockel liegen nahezu bündig unter den Sohlen und
sind keine neuen Hindernisse. Gemeinsame Sockelkörper und Farbränder verwenden
vier Instanzdurchläufe. Die neue Darstellung wird ausschließlich im Arena-Einstieg
aktiviert. Adventure behält seine schwebenden Fundmodelle, Ringe und Partikel.
CTF-3.0, Hexwars, Grundriss, Pickup-Koordinaten/Mengen, Waffenwerte und Regeln unverändert.

## Prüfung und behobene Darstellungsfrage

- **69/69 Kerntests bestanden.** Der vorhandene Pickup-Test prüft zusätzlich,
  dass Vollmeldungen nur nach gültigem Höhen-/Sichtkontakt ausgelöst werden;
  keine falsche Meldung durch Deckung oder aus dem falschen Stockwerk.
- Typecheck, Testbuild und Produktionsbuild bestanden.
- **Fünf finale Browserfälle bestanden**, mit echten Maus-/Tastatur- bzw.
  Touch-Eingaben und ausschließlich lesender Testdiagnose:
  - Desktop 1366 × 768 und Touch-Emulation 667 × 375: vier getrennte Team-Pads,
    volle Heilung ohne Verbrauch/Meldungsschleife, Rail-Aufnahme, Ladeanzeige,
    Pause während Nachladung, Wiederkehr und volle Munition. Ein tatsächlicher
    Rail-Schuss lässt genau eine Patrone aus dem Pad nachfüllen.
  - Beide: physischer Kontakt am überarbeiteten Kasten, isometrische Ansicht,
    tatsächlicher Tod durch Duell-Bot, regulärer Respawn mit einmaligem Padimpuls
    und Rücksetzen beim Neustart.
  - Desktop 1920 × 1080 und Touch 667 × 375: Ost-Pulse, E1-Munition, E2-Rüstung,
    Rückkehr zum Boden, Rail und Kamerawechsel über reguläre Bewegung/Sprünge.
  - Separater Adventure-Einstieg mit `adventure=1`, ohne Arena-Fixtures-Diagnose.
- Keine JavaScript- oder HTTP-Fehler in den beiden AP1-Abläufen und Höhenrouten.
- Bei der ersten Sichtprüfung war die flach auf dem Pad liegende Countdown-Zahl
  auf kleinem Touch zu klein. Sie wurde durch eine größere, zur Kamera gerichtete
  Zahl ersetzt; die finalen Abläufe und Screenshots verwenden diese Korrektur.

[Browserbericht](arena-ap1/browser-report.json),
[Desktop-Teamplätze](arena-ap1/desktop-team.png),
[Touch-Teamplätze](arena-ap1/touch-team.png),
[Touch-Ladeanzeige](arena-ap1/touch-charging.png),
[Deckungsmodul](arena-ap1/cover-isometric.png),
[Touch-Respawn](arena-ap1/touch-respawn.png).
Vorher: [Map-Paket](ARENA_MAP_RESULT.md) mit dessen veröffentlichten Bildern.

## Produktionsprüfung

Der lokale Produktionsbuild wurde zusätzlich in frischen Browsern auf Desktop
(1366 × 768) und in Touch-Emulation (667 × 375) geprüft: Teamstart,
Bewegungs-/Sprungeingaben und Pausenmenü funktionieren ohne JavaScript-/HTTP-Fehler.
Bundle: `index-qPC8--Kk.js`; die Testdiagnose `__coreArena` ist nicht enthalten.
[Produktionsbericht](arena-ap1/production-local.json),
[Desktop](arena-ap1/production-local-desktop.png),
[Touch](arena-ap1/production-local-touch.png).

## Laufzeit und Grenzen

Kurze Stichproben aus den letzten jeweils bis zu 600 Renderframes der AP1-Abläufe:
Desktop p95 ca. 8,3 ms, Touch-Emulation ca. 5,5–5,6 ms. Am Deckungsmodul 535/454
Zeichenaufrufe. Das liegt innerhalb des beim Map-Paket dokumentierten Bereichs
von 395–675 Aufrufen, ist wegen unterschiedlicher Spielsituationen aber kein
kontrollierter Vorher/Nachher-Performancevergleich. Kein paralleler Build während
der Browserläufe. Touch läuft auf der PC-GPU; keine Aussage zu Handy-FPS oder Wärme.

Produktions-Hauptbundle rund 5,112 MB / gzip 1,879 MB; die bestehende Vite-Warnung
zur Bundlegröße bleibt. Keine neue Langzeit-/Balance-Abnahme, da AP1 weder Layout
noch Kampfregeln verändert. Der echte Geräte-/Nutzervergleich bleibt offen.

Reproduktion:

```powershell
npm test
npm run build:test
npx playwright test tests/e2e/arena-ap1.spec.ts tests/e2e/arena-map.spec.ts --project=chromium-1366 --grep 'AP1|Adventure retains|map east supply route (1920|667)'
npm run build
```

Nächster geplanter Bulk: AP2 (HUD und Matchfluss), weiterhin nicht freigegeben.
