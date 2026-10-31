# M2.5 — Arena, HUD und Feedback

Stand: 31. Oktober 2026. Umgesetzt und technisch geprüft; persönliche Spielabnahme offen.

## Änderungen

- Bestehende 56 × 36 m Arena gezielt überarbeitet: blaue/rote Startbuchten,
  hellere und unterschiedlich getönte E1-/E2-Wände, deutliche Höhenkanten,
  Maßstriche und Beschriftung „Munition“ / „Rüstung“. Keine zusätzliche Kollision,
  keine neuen Räume, Gegner oder Waffenfelder. Vorhandene Stein-/Gartenmaterialien
  und kostenlose KayKit-Figuren bleiben Grundlage; kein zusätzlicher Assetdownload.
- Spielerfigur blau mit „DU“-Kennzeichnung; Verbündeter und Gegner behalten
  ihre eigenen Teamfarben, Namensschilder und Lebensanzeigen.
- Aktives HUD reduziert: Score/Zeit, Waffen/Munition und eigene Vitalwerte.
  Lange Erklärungen, Neustart, Kamera, Vollbild und Ton liegen im Pausenmenü.
  Menü per Button oder Esc; Spielauswahl auch nach Matchende. Bot-Stufe im Menü
  für die nächste Runde wählbar. Manueller Pausenzustand übersteht Fokuswechsel.
- Touch: Ansicht-Taste und permanenter Hilfetext aus der Spielfläche entfernt,
  Sprint/Sprung bleiben direkt erreichbar, kompaktere Vitalanzeige und Menü.
- Gerade Arena-Ansicht hält den Bildausschnitt stärker auf der Karte. Isometrisch
  folgt die Kamera uneingeschränkt der Figur, damit E2 sichtbar bleibt. Der größere
  Arena-Sichtabstand aus dem vorherigen Ausbau bleibt bestehen.
- Eigene, lokal synthetisierte Arena-Töne für Arc, Pulse, Rail, bestätigten Treffer,
  Schaden/Tod, Fund und Matchende. Entferntere Bot-Schüsse leiser. Erst nach Eingabe
  aktiviert, mit Stummschaltung und Pausenruhe. Kurzer Treffermarker, Schadensrand
  und Fund-/Punktmeldung ergänzen vorhandene räumliche Waffen-/Pickup-Effekte.

## Prüfung

67 Kerntests bestanden; Typecheck, Test- und Produktionsbuild erfolgreich.
Sechs Browserfälle bestanden: Desktop (1366 × 768), Touch-Emulation (844 × 390),
kleines Querformat (667 × 375) und Adventure-Einstieg. Vollständige 2v2-Matches,
Höhenroute/Rüstung auf E2, Rail-Schüsse und Neustart; beide Kameraansichten,
Pausentimer, Stummschaltung, Änderung der Bot-Stufe und Rückkehr zur Spielauswahl.
Audiosignal mit AudioContext/Analyser und ausgelösten Cues nachgewiesen.
Bedienelemente im kleinen Querformat erreichbar und ohne Überlappungen.
Keine Browserfehler in den vollständigen Desktop-/Touch-Matches.
Echte Eingaben und ausschließlich lesende Diagnosewerte; keine Spielzustandsinjektion.

Desktop-Runde 10:7, Touch-Runde 10:9, beide regulär über das Abschussziel beendet.
[Browserbericht](m2-5/browser-report.json), [Desktop-Messung](m2-5/desktop-arena-expansion.json),
[Touch-Messung](m2-5/touch-arena-expansion.json).

Bildvergleich: [vorher](m2-4b/touch-e2-supply.png),
[E2 nachher](m2-5/touch-e2-supply.png), [isometrisch](m2-5/desktop-e2-isometric.png),
[Touch-Kampf](m2-5/touch-team-combat.png),
[kleines Querformat](m2-5/desktop-small-landscape.png),
[kleines Pausenmenü](m2-5/desktop-small-pause.png).
Die beiden „desktop-small“-Dateinamen stammen vom Testexport; sie zeigen
ausdrücklich Touch-Emulation mit 667 × 375, keinen Desktop-Viewport.

Eine erste Bildprüfung zeigte die Figur auf E2 bei hart begrenzter isometrischer
Kamera zu hoch. Korrigiert durch freie isometrische Verfolgung; Sichtbarkeit wird
nun ausdrücklich geprüft. Ein strikter 40-px-Test maß im emulierten Browser
39,994 px: Subpixel-Toleranz korrigiert, Menütaste zusätzlich auf 44 px vergrößert.

## Grenzen und Trennung

Browser-Touch-Emulation ist kein tatsächlicher Handytest. Klang, Spielgefühl,
Leistung/Wärme und die persönliche Gesamtabnahme gehören weiterhin zu M2.6.
Die Synthese ist eine erste kurze Soundfassung, kein Musik-/Soundasset-Paket.

Adventure-Mission, Karte, HUD, Audio und Balance unverändert. Die neuen Renderer-
Optionen sind opt-in für Arena; die zuvor ausdrücklich übernommene Bewegung bleibt
gemeinsame Technik. CTF-3.0 und Hexwars unverändert. Adventure-L1.5b bleibt offen.
