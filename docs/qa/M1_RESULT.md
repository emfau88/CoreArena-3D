# M1 — Höhen, Aim und Navigationsprobe

20. Oktober 2026. **M1.1–M1.4 umgesetzt und technisch geprüft. Persönliches Spielurteil offen. M2 nicht begonnen und nicht freigegeben.**

## Ausprobieren

Produktionsbuild: http://127.0.0.1:8743/CoreArena-3D/

Falls nötig `npm run build` und `npm run preview` starten. Eine bereits offene
M0-Seite neu laden. WASD bewegt bildschirmbezogen, Shift sprintet, Space springt,
V wechselt die Kamera. Links im Garten den Sprungmarkierungen über E1 (2,05 m)
und E2 (4,10 m) folgen. Maus zielt, linke Maustaste tippen/halten feuert.
Mintfarbener Ring: freie Schusslinie; orange: Deckung zwischen Mündung und Ziel.
Die drei Zahlen zählen Treffer an E0/E1/E2. B oder „Route zeigen“ startet die
goldene Testfigur. Neuladen setzt Zähler und Probe zurück.

## Geliefert

| Paket | Ergebnis |
| --- | --- |
| M1.1 | Echter Sprung/Fall mit V5-Werten (10,8 m/s Impuls, 22,6 m/s² Schwerkraft), E0/E1/E2, Standflächen-IDs, Kopfkontakt unter der E2-Platte. Rückkehr zum Spawn nach Fall über den Außenrand. |
| M1.2 | Kamera-Ray auf erste physische Oberfläche oder Dummy; keine Bodenebenen-Annahme, kein automatisches Zentrieren. Schulter→Mündung→Ziel prüft die erste Kollision. Diagnosefeuer, Einschlag/Strahl, drei Trefferzähler. |
| M1.3 | Gerichtete Sprung-/Fallverbindungen in der Arena-Beschreibung. Goldene Figur läuft E0→E1→E2→E0 über dieselben Bewegungsbefehle und denselben Motor. |
| M1.4 | Integrierter Browser-Spielablauf, gezielte Regression, Screenshots, README und Roadmap aktualisiert. |

Die Probe verwendet eine zweite identische Rapier-Welt und kollidiert daher nicht
mit dem Spieler. Sie zeigt Wegmachbarkeit; sie wählt noch keine Kampfziele oder
alternative Routen. Dummies sind feste Treffervolumen ohne HP/Tod. Waffeninventar,
Kampf-KI und Matchsystem gehören zu M2. Mobile ist unverändert optional.

## Prüfungen

- `npm test`: **10/10** bestanden (sechs bestehende Kernfälle, vier neue Höhen-/Aim-Fälle).
- `npm run build`: Typecheck und Produktionsbuild bestanden.
- `npm run build:test`, `npx playwright test --project=chromium-1366`: **5/5** bestanden,
  keine Retries, keine Flakes, ca. 36 Sekunden. Vier vorhandene Regressionen plus
  ein integrierter M1-Spielablauf.
- Echte Eingaben: vom regulären Spawn laufen und auf E1/E2 springen, freie Ziele
  auf allen drei Höhen treffen, Dauerfeuer, Kamerawechsel, verdeckten Schuss an
  der Wand stoppen und die goldene Figur bis zurück auf E0 beobachten.
- Testzustand ausschließlich gelesen; keine Teleports, gesetzten Treffer oder
  künstlich abgeschlossenen Routen im Browsernachweis.
- Keine Browserfehler, fehlgeschlagenen Requests oder externen Laufzeitrequests
  in diesen Fällen. Produktionsbuild zusätzlich im In-App-Browser geöffnet,
  Tastaturbewegung/Sprung, Kamerawechsel und sichtbare Navigationsprobe bedient.
- Nach dem Browserlauf ergänzte Rückkehr zum Spawn nochmals im echten Rapier-
  Kerntest geprüft; kleine HUD-Korrekturen im Produktionsbrowser gesichtet.
- Abschließende Sichtkorrektur: unterschiedliche Auftreffpunkte von Kamera und
  Mündung auf derselben Kugel gelten nicht als Deckung. Kernprüfung und integrierter
  M1-Browserablauf danach erneut bestanden (1/1, ca. 23 Sekunden inklusive Start).
  Die Bilder zeigen diesen finalen Stand; beide Läufe sind im JSON dokumentiert.

Umgebung: Windows, Chromium **156.0.8078.4**, **1366×768**, ANGLE/D3D11 auf AMD
Radeon Graphics. Kein neuer Benchmark und keine erneute vollständige Chrome-/Edge-
oder Auflösungsmatrix. [Maschinenlesbare Ergebnisse](m1/browser-results.json).

Behobener Befund: Rapier meldet bei manchen ruhenden Kontakten „grounded“, aber
keine neue Bewegungskollision. Eine kurze physische Stützabfrage ergänzt dann
die Flächen-ID. Kopfkontakt setzt die Aufwärtsgeschwindigkeit zurück. Die
bereits in M0 bewährte Bewegung ohne Ground-Snap bleibt erhalten.

## Sichtnachweise

![E1 und Diagnosefeuer](m1/e1-hit.png)
![E2 erreicht und getroffen](m1/e2-hit.png)
![Isometrische Kamera](m1/isometric.png)

Weitere Nachweise: [verdeckter Schuss](m1/e0-cover.png),
[vollständige Navigationsroute mit Diagnose](m1/route-complete.png).

## Offene Grenzen und nächster Schritt

Die Arena ist eine kompakte Höhen-/Aim-Übung. Unter der E2-Platte kann die Figur
von der Platte verdeckt werden; automatische Sichtfreistellung ist noch nicht
Teil dieser Probe. Weitere Formen, sämtliche Sicht-/Höhenkombinationen,
Langzeittests und die breite Browsermatrix folgen gezielt nach Spielbewährung.
Der Rapier-/Three-Build erzeugt weiterhin die bekannte Vite-Warnung zur
Chunkgröße (ca. 4,9 MB JS / 1,8 MB gzip), ohne Buildfehler.

Bitte 5–10 Minuten Landungen, Zielring und Kameras ausprobieren. Die technische
Prüfung ersetzt dieses persönliche Spielurteil nicht. **Vor M2 auf Freigabe warten.**

Aufwände wurden auf aktive Agent-Zeit umgestellt: M0 ca. 30 Minuten laut Nutzer;
M1 konservativer Plan 1,5–3 Stunden, ohne separat durchgängig gemessene Istzeit;
M2 vorläufig 3–6 Stunden, M3/M4 je 2–4 Stunden. Persönliche Tests und Freigabewartezeit
stehen separat. Siehe [Roadmap](../planning/MILESTONES_AND_QA.md).
