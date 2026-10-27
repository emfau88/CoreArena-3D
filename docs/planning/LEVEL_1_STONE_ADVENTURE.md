# Level 1: Der verwitterte Hof

Stand: 27. Oktober 2026. **L1.1 und das verkleinerte L1.2 umgesetzt und technisch
geprüft.** Der Nutzer hat den Gegnerumfang ausdrücklich reduziert:
**zwei kleine Nahkämpfer und der bereits vorhandene Steinwächter**.
Der frühere Plan mit sieben kleinen Gegnern, Steinwerfer und zusätzlichen Bossphasen
ist damit überholt. L1.3/L1.4 sind optionale Folgearbeiten nach persönlichem Spieltest.

[Spielen](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1)
· [Ohne Gegner erkunden](https://emfau88.github.io/CoreArena-3D/?mode=pve&level=stone&adventure=1&explore=1)
· [L1.2-Prüfung und echte Spielaufnahmen](../qa/L1_2_RESULT.md)

## Rahmen und Richtung

Drei große offene Höfe, zusammen etwa 36 × 80 Spielmeter: Ankunft/Ruinenhof
32 × 22 m, innerer Hof 36 × 24 m, Wächterhof 36 × 26 m. Kurze, gerade, 10 m
breite Verbindungen, niedrige Mauern und ein freier Hauptweg. A–H bezeichnen Orte
innerhalb dieser Höfe, keine acht Räume. Die frühere enge
[Map-Skizze](../concepts/level-1-layout-v1/README.md) bleibt verworfen.

Die vorhandene stilisierte Grafik, Waffen, Pickups und Steuerung bleiben die Basis.
Standardblick von links nach rechts; V/Ansicht wechselt auf gerade oder isometrische
Kamera. Mobile: 15 % größere Darstellung, leichter Kameravorlauf und kompaktes Menü.
Die gemeinsame Adventure-Sprungkurve für Desktop/Touch landet auf gleicher Ebene
nach ca. 0,72 s bei ca. 2,15 m Höhe; Treppen und Plateaus bleiben erreichbar.

Geschichte: Zwei Steinläufer halten das Siegel der Höfe. Hinter ihnen bewacht der
Steinwächter den Weg zur Kristallkluft. Erst beide Läufer besiegen, dann den letzten
Hof betreten und den Wächter wecken. Kurze Ziele im HUD begleiten diesen Ablauf.

## Spielbarer Ablauf und Fundorte

Koordinaten als (X; Z), Norden = negatives Z. Grundriss und Vorräte stammen aus L1.1.

| Ort | Gegner | Waffen/Vorräte | Ablauf |
| --- | --- | --- | --- |
| A · Ankunft, (0; 33) | Keine | Arc Lash, 100 HP, 50 Rüstung | Sicherer Start im ersten Hof. |
| B · Ruinenhof | **Ein Steinläufer bei (2; 24)** | Keine Pflichtaufnahme | Er nähert sich beim Betreten des Hofs. Rückzug zum Start möglich. |
| C · Waffenfund, (-3; 18,5) | Keine | Pulse Repeater mit 54 Schuss | Sichtbar am Hauptweg vor dem breiten Durchgang. |
| D · Seitenterrasse, optional | **Keine zusätzlichen Gegner** | Medkit +35 bei (-13,5; 4), Rüstung +30 bei (-13,5; 0), Munition +27 bei (-9; -0,4) | Breite Treppe zur 1,1 m hohen Terrasse. Vorräte mitnehmen und nach E zurückkehren. |
| E · Innerer Hof | **Ein Steinläufer bei (2; -1)** | Munition +27 bei (11; 6,5) | Viel Platz zum Ausweichen. Der ehemalige Werfersockel bleibt eine freie erhöhte Fläche. |
| F · Siegelplatz, (0; -14) | Keine | Keine automatische Auffüllung | HUD zeigt, ob noch ein Läufer lebt. Vor dem Boss Vorräte sichern. |
| G · Wächterhof, (0; -29) | **Der vorhandene Steinwächter** | Munition +18 bei (-13; -37) und (13; -20); Medkit +35 auf Plateau bei (-12; -23) | Nach beiden Läufern löst das Betreten hinter Z = -20,5 das Auftauchen aus. Eingang schließt während des Kampfes. |
| H · Nordtor, Z = -42 | Keine | Keine | Nach Sieg führt der Button „Weiter zur Kristallkluft“ in die bestehende Frost-Begegnung. Ein begehbarer Ausgang ist noch optional. |

Hauptweg **A → B → C → E → F → G**; optional **E → D → E**.
Gesamt **zwei kleine Gegner plus ein Boss**, feste Positionen, keine Zufallsspawns,
Wellen oder zusätzlichen Bossgegner. Die beiden Läufer bleiben in ihren eigenen
Höfen; wer zurückweicht, zieht keine Gegnergruppe durch das ganze Level hinterher.

## Der kleine Gegner

Ein einziger Typ: **Steinläufer**, aus kleinen kantigen Steinformen, mit Armen,
Beinen, leuchtendem Kern und einer kurzen HP-Leiste. Sichtbar kleiner als der Boss.

- 70 HP, 3,2 m/s, normaler Nahkampfschlag mit 14 Schaden und 1,8 m Reichweite.
- 0,4 s sichtbares Ausholen mit Bodenbogen, danach 0,7 s Erholung.
- Verfolgt im eigenen Hof über die bestehende Navigation; echte Kollision stoppt
  ihn an Mauern und Plateaus. Er läuft am Boden und steigt keine Treppen hinauf.
- Abstand, seitliches Ausweichen, Höhe und echte Deckung verhindern Treffer.
  Der Schlag richtet sich nach Beginn des Ausholens nicht mehr neu aus.
- Rückzug außerhalb des Hofs bricht den Angriff ab. Er läuft zurück, behält seine HP.
- Besiegte Läufer bleiben bis zum Neustart besiegt. Kein Wurf, Zauber oder Fernkampf.

## Vorhandenen Boss wiederverwenden

Auftauchen aus dem Boden, Verfolgung, Faustschlag, Schockwelle und Bodenausbruch
werden einschließlich Animationen und Navigation wiederverwendet. 600 HP wie zuvor.
Während des Auftauchens ist der Boss noch nicht angreifbar. Der ruhende Steinkörper
weicht beim Erwachen dem beweglichen Boss; der Eingang bekommt sichtbar echte Kollision.

HP/Rüstung gehören über beide Höfe und Boss hinweg zu einem gemeinsamen Zustand.
Vorräte heilen diesen Zustand; Pulse-Munition bleibt erhalten. Arc ist unbegrenzt.
Tod zeigt die Niederlage; „Neu versuchen“ setzt das gesamte Level inklusive Gegnern
und Vorräten zurück. Es gibt noch keinen Checkpoint. Nach Sieg ist die vorhandene
Kristallkluft über den Weiter-Button erreichbar und startet mit ihrer eigenen Ausrüstung.

**Balance bleibt vorläufig:** Der vollständige Browserdurchlauf gewann mit 36 HP
und ohne Rüstung. Stehendes, präzises Dauerfeuer konnte den Boss noch besiegen.
Das belegt den funktionierenden Ablauf, keine fertige Herausforderung. Zusätzliche
Bossphasen oder pauschal mehr Gegner sind nicht Teil dieses Auftrags.

## Umsetzungsplan: vier spielbare Arbeitspakete

Die IDs bleiben zur Nachverfolgung bestehen; Inhalt und Reihenfolge wurden vereinfacht.
L1.2 enthält jetzt bereits den kleinen vollständigen Kampfablauf. Das alte Gesamtbudget
von 3–6 Stunden und die verbleibenden 2,5–5 Stunden sind für diesen Umfang **überholt**.

| Paket | Ergebnis | Status / weitere aktive Agent-Zeit |
| --- | --- | --- |
| **L1.1 · Map begehen** | Drei Höfe, Kamera, Treppen, Terrassen und feste Vorräte | **Erledigt**; technische Erstprüfung nach ca. 35 Min. inklusive Grundrisswechsel, spätere Nacharbeiten separat |
| **L1.2 · Kleiner Kampfablauf** | Ein Läufer pro erstem/zweitem Hof, vorhandener Boss im dritten, gemeinsame HP, Sieg/Tod/Neustart | **Erledigt**; 47 Kerntests und vier Browserfälle bestanden |
| **L1.3 · Reise abrunden, optional** | Bei Bedarf Ruhe-/Checkpoint vor dem Boss und tatsächlich begehbarer Ausgang statt Weiter-Button; knappe Storyhinweise | **Nicht freigegeben**; grob 30–60 Min. einschließlich gezielter Prüfung |
| **L1.4 · Spielgefühl abstimmen, optional** | Nach konkretem Spielurteil Schaden, Tempo und Angriffspausen abstimmen; nötige Lesbarkeitskorrekturen | **Nicht freigegeben**; grob 30–60 Min. einschließlich gezielter Prüfung |

Für den aktuell angefragten kleinen Versuch ist kein weiteres Paket erforderlich.
Falls beide optionalen Pakete gewünscht werden: konservativ zusammen **1–2 Stunden
aktive Agent-Arbeit**, Rückmeldungen und Hosting-Wartezeit zusätzlich. Umfang vorher
anhand des Spieltests festlegen. Die Erfahrungswerte von etwa 30 Minuten für M0/M1
bleiben die Orientierung; keine Schätzung in menschlichen Arbeitstagen.

### L1.2 – erledigt

- [x] Ein kleiner Nahkampftyp und genau zwei feste Gegner.
- [x] Vorhandener Steinwächter mit Auftauchen und seinen bisherigen Angriffen eingebunden.
- [x] Boss nach beiden Läufern im letzten Hof aktivieren; Eingang während des Kampfes schließen.
- [x] Gemeinsame HP/Rüstung, Treffer auf bewegliche Gegner, vorhandene Waffen und Vorräte.
- [x] Sichtbares Ausholen, Treffer, Tod; Raumziele, Bossleiste, Sieg/Niederlage und Neustart.
- [x] Desktop regulär vom Spawn bis zum Sieg; Touch-Kampf, echte Niederlage und Wiederholen.
- [x] Grundriss, Treppen und Mobile-Steuerung weiterhin ohne Gegner vergleichbar geprüft.
- [ ] Persönliches Urteil zu Tempo, Lesbarkeit und Schwierigkeit auf Desktop/Handy.

Nicht mehr als Pflicht vorgesehen: Steinwerfer, sieben kleine Gegner, zweite Bossphase
und Sturmangriff. Diese Ideen sind verworfen bzw. nur bei späterem ausdrücklichem
Wunsch wieder zu planen. Die separate Arena-/Liga-Roadmap M2.4 ff. bleibt bestehen.

## Technische Basis und Prüfung

`AdventureFight` koordiniert zwei `StoneRunner` und den vorhandenen `PveEncounter`.
Letzterer bleibt die einzige Zuständigkeit für HP/Rüstung; sein Bossablauf kann bis zur
Ankunft ruhen. Bestehende PvE-Aufrufer laufen unverändert aktiv an.
`Combat`, Rapier, Pickups und Desktop-/Touch-Eingabe werden gemeinsam verwendet.
Die gerichteten Gegnerbewegungen verwenden die vorhandene Hof-Navigation und echte
Shape-/Raycasts. Darstellung und Collider des Bosszugangs wechseln zusammen.
Ein allgemeines Quest-, Gruppen- oder Save-Framework ist dafür nicht nötig.

Reguläre Browser-Eingaben prüfen den vollständigen Desktopkampf, Touch-Angriff,
Tod/Wiederholen sowie die begehbaren Flächen. Tests setzen weder HP noch Munition
oder Positionen, um einen Sieg zu erzwingen. Kernprüfungen sichern Ausholen, einmaligen
Schaden, Abstand/Höhe/Deckung, gemeinsamen Lebenszustand und Reset.
Browser-Touch-Emulation ersetzt keinen Test auf einem echten Smartphone.

CTF-3.0 bleibt unverändert. Weitere Level, neue Waffen, Inventar-/Skillbaum, dauerhaftes
Speichern und zusätzliche Bossmechaniken gehören nicht zu dieser Fassung.
