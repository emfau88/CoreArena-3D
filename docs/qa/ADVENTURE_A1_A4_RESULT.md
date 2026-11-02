# Adventure A1–A4 — Kamera, Körperkontakt, Dash und Energiepeitsche

2. November 2026 · Auftrag: „ok dann zieh bis inkl. a4 durch“.
Branch: `codex/adventure-combat-prototype`; Basis: `5f2238be6981e1268365f4aaccf3f062c468cd86`.
Codecommit: `93aeb64fc286876c41d6708cd247972fb1b7f0eb`.
`main` bleibt unverändert; Code und Nachweise sind lokal auf dem Entwicklungsbranch gesichert.

**Technischer Umfang A1–A4 umgesetzt. Menschliches T1/G1 bleibt offen.**
Keine Umsetzung von A5, Waffenmodifikationen, Progression oder neuen Assets.
Der Nutzer meldete zuvor Siege mit Arc und Pulse im A0-Labor; das ist ein
Baseline-Spielnachweis, kein Urteil über diese neue Peitsche.

## Start und Vergleich

`npm run dev`, dann im Desktop-Browser:

- [Prototype-Labor](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=prototype)
- [Legacy-Labor](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1&lab=boss&combat=legacy)
- [Reguläre bisherige Mission](http://127.0.0.1:8740/CoreArena-3D/?mode=pve&level=stone&adventure=1)

Im Labor Profil und Versuch wählen, dann **Bossversuch starten**. Auswahl gilt
beim nächsten Start. Prototype verwendet ausschließlich die Energiepeitsche;
Legacy behält Arc/Pulse und Sprint. „Übungsziele ohne Gegnerdruck“ bietet Nah-,
Fern-, Höhen-, Plateau- und Deckungsziele im vorhandenen Hof.
WASD bewegt, Maus richtet aus, ein Klick löst einen vollständigen Schlag aus,
Shift startet den Dash, Leertaste springt. Halten wiederholt weder Schlag noch Dash.
Neustart und lokaler JSON-Export bleiben direkt erreichbar, auch nach Niederlage.

## Ergebnisse nach Bulk

| Bulk | Umsetzung und technische Entscheidung |
|---|---|
| A1 | Feste erhöhte Geradeausansicht; 18–26 m Bildhöhe, Spielerfokus mit höchstens 3 m Verschiebung zum Boss, geglättet ohne automatische Drehung. Mausstrahl der tatsächlich dargestellten Kamera trifft die Ebene 1,1 m über den Spielerfüßen. Kein Zielmagnet; außerhalb der Fläche/bei ungültiger Projektion bleibt die letzte Richtung. |
| A2.1 | Bewegungszylinder Radius 1,7 m, Höhe 3,4 m; eigener Filter unabhängig vom Treffsensor. Sichtbarer Bodenring, bereits beim Auftauchen. Waffen und Bossnavigation ignorieren ihn. Bei Sieg/Niederlage/Legacy aus; Wiederstart setzt ihn neu. Bestehender Boss-Stoppabstand 2,6 m verhindert Überlappung beim Verfolgen. Kein Kontaktschaden. |
| A2.2 | Bodendash mit 20 m/s über 9 Simulationsticks: 3 m in 0,15 s. Eine Ladung, erneut verfügbar 48 Ticks/0,8 s nach Beginn. Bewegungsrichtung, bei Stillstand Zielrichtung; während des Dashs gebunden. Kein Sprint im Prototype, keine I-Frames, kein Luftdash; Verlassen einer Kante beendet den Dash. Originalsprung und Schwerkraft bleiben bestehen. |
| A3 | Numerisch geführte Kurve mit 16 Segmenten, maximal 4,8 m Länge ab kurzem Handanker, Trefferrohr 0,12 m. Zeitlich abgetastete Segmente berücksichtigen eigene Bewegung und bewegte Ziele zwischen Ticks. Erste feste Weltfläche schneidet die Bahn ab; zusätzliche Deckungsprüfung am Kontakt. Ein Treffer je Ziel und Phase, auch bei mehreren Zielen. |
| A4 | Begrenzte prozedurale Oberkörperbewegung auf dem vorhandenen KayKit-Rig, pro Frame aus unveränderter Mixerpose aufgebaut. Griff an rechter Hand, schadensfreier Handanschluss, zwischen Simulationsticks interpolierte Kurve aus denselben Bewegungsdaten wie die Trefferprüfung. Goldener Vorschwung, türkisfarbener Rücklauf, getrennte Schwung-/Kontakttöne. Höchstens sechs kleine Kontaktfunken; abschaltbar. Keine Trefferpause, globale Zeitlupe oder Kamerawackeln. |

Schlagprofil bei 60 Hz, Alter ab Klick:

| Alter in Ticks | Phase | Wirkung |
|---|---|---|
| 0–5 | Ausholen | Richtung höchstens 0,08 rad/Tick nachführbar, kein Schaden |
| 6–15 | Vorschwung | Richtung gebunden, einmal 22 Schaden je getroffenem Ziel |
| 16–20 | Umkehr | Kein neues Trefferfenster |
| 21–30 | Rücklauf | Eigenes Fenster, einmal 14 Schaden je getroffenem Ziel |
| 31–41 | Erholung | Kein neues Trefferfenster; nächster Schlag nach insgesamt 0,7 s |

Der Übergangstick prüft noch das tatsächlich durchlaufene letzte Teilstück des
vorherigen aktiven Fensters. Kein vorgezogener Schaden über den gesamten Bogen.
Gehen während des Schlags bleibt möglich. Dash bricht den Schlag sofort ab;
gleichzeitiger Klick und Dash geben dem Dash Vorrang. Kein Eingabepuffer.
Pause/Defeat löschen aktive Aktionen und Effekte. Cooldown bleibt während Pause
eingefroren; Retry erzeugt frische Zustände einschließlich Kamera und Audiostimmen.

## Kamera- und Sichtprüfung

Drei Perspektiven mit gleicher Figur/Geometrie und gleichem Maßstab verglichen,
zusätzlich echte WASD-Rundgänge bei 1366×768 und 1920×1080: Mitte, vier Ränder,
nördliche Ecken, südöstliche Ecke, Treppe und Heilplateau. Numerische Matrix
prüft gleichzeitig Spieler-/Boss-Framing einschließlich Nahbereich und Höhenversatz.
Vergleichsaufnahmen sind reine Dokumentationskameras, keine Positionsschreib-Hooks.

Die Geradeausansicht erhält eine feste Zuordnung der Tasten zu den Hofachsen und
zeigt den Wächter frontal. Seitenansicht verliert seine Frontsilhouette; Isometrie
macht die Richtungszuordnung weniger unmittelbar. Die erhöhte Ansicht vermeidet
in den geprüften Fällen eine Verdeckung der Figur durch die Randmauern. Keine
zusätzliche Wandtransparenz nötig. Sicht entlang der Säulen bleibt bewusst begrenzt;
die Peitsche trifft dort auch nicht durch die Deckung. Menschliche Bewertung folgt T1.

Beispiele: [Boss und Figur](adventure-a1-a4/1920-boss-combat.jpg),
[drei Ansichten: seitlich](adventure-a1-a4/1920-camera-side.jpg),
[gerade](adventure-a1-a4/1920-camera-straight.jpg),
[isometrisch](adventure-a1-a4/1920-camera-isometric.jpg),
[Plateau](adventure-a1-a4/1366-plateau-straight.jpg),
[Vorschwung](adventure-a1-a4/1920-whip-forward.jpg),
[Rücklauf](adventure-a1-a4/1920-whip-return.jpg).

## Prüfungen und Leistung

**84 Regeltests bestanden**, Typprüfung, Produktions- und Testbuild erfolgreich.
Die [Produktionsprüfung](adventure-a1-a4/production-guard.json) bestätigt: kein
Lab-Bundle, keine Lab-UI und kein Diagnose-Hook; auch mit Prototype-URL startet
die reguläre alte Mission. Die bestehende Vite-Warnung zur großen Hauptdatei bleibt
unverändert ein späteres Ladebudget-Thema, kein neues Assetpaket. Die sechs finalen
1920-Laborfälle sowie die beiden 1366-Eingabe-/Bossfälle bestanden; Kamera-Tour und
Neustartmatrix wurden zusätzlich in beiden Auflösungen geprüft. Alle zehn ausgewählten
Legacy-/Arena-/Altboss-Regressionsfälle sind bestanden, der Desktop-Arenafall im
isolierten Nachlauf nach der unten dokumentierten Laufzeitstörung.
Die neun erfolgreichen breiten Regressionsfälle liefen vor der letzten, ausschließlich
per Dash-Parameter aktivierten Bodenkorrektur. Danach wurden sämtliche 84 Regeltests,
die betroffenen Prototype-Fälle und der Desktop-Arena-Match erneut geprüft; der
Legacy-Standardpfad der Physik blieb bei dieser Korrektur unverändert.

Geprüfter Quellstand (SHA-256 über `src`, Vite-Konfiguration und Lockfile):
`73a0071ce767a5d470ea41c3277f05b70551869e3c512b2d0f825c24f496a249`.
Die Messdateien nennen als Git-Basis noch `5f2238b`, da sie vor dem Codecommit
erzeugt wurden; der Quellhash identifiziert die geprüfte Implementierung.

- Regeltests: gerichtetes Ziel ohne Autoerfassung; Kamera-/Projektionsmatrix;
  Dashstrecke und komplette bewegte Schlagreplays identisch bei 30/60/144 Hz;
  zusätzlich 720 Bodendashfälle (360 Richtungen, zwei Ruhephasen) innerhalb 5 cm;
  Kapsel gegen Boss aus vier Richtungen, Rückzug aus Wand-/Ecken-/Plateaufällen;
  Eigencollider-Filter, alte Bossnavigation, Höhe, Deckung, bewegtes Ziel zwischen
  Ticks, Mehrfachziel, je Phase höchstens ein Treffer und Abbruch ohne Restschaden.
- Echte Browsereingaben: Treffen/absichtliches Verfehlen, Rücktreffer, Maus-/Shift-Halten,
  Dash-Abbruch, Sprung, Pause, stumm und reduzierte Effekte; beide Desktopauflösungen.
- Je Auflösung zehn Legacy- plus zehn Prototype-Neustarts: 72 Listener nach GC,
  816 Szenenobjekte, Geometrien je Profil stabil (340/342), kein wachsender Bestand.
  Aufbau maximal 4,6 ms in der Auflösungsmatrix; finaler 1920-Lauf maximal 3,2 ms
  Aufbau und 700 ms beobachteter Browser-Neustart einschließlich 300 ms Wartefenster.
- Drei aufgewärmte 1920×1080-Durchläufe mit je 20 Schlägen: Frame-p95 8,4 ms,
  p99 11,1 ms; Simulation-p95 1,0–1,1 ms, null verworfene Ticks.
  Übung ohne Bossdruck, sechs Ziele, Ton und Kontaktfunken aktiv.
- Separater finaler Bosslauf: Frame-p95 11,1 ms, Simulations-p95 1,2 ms, null
  verworfene Ticks. Dokumentationsaufnahmen verursachten einen 80,6-ms-Maximalframe;
  dieser Lauf wird ausdrücklich nicht als störungsfreier Benchmark geführt.
- Gedrosselte Darstellung: Median 33,33 ms, Frame-p95 33,4 ms; Hin-/Rücktreffer,
  Pause und Wiederaufnahme funktionieren. Simulation bleibt bei 60 Hz.
- Reaktiver echter Bossversuch: Sieg mit Energiepeitsche nach 13,8 s aktiver
  Kampfzeit, 100 HP verbleibend. Körper nach Sieg durchquerbar, Retry wieder frisch.
  Dieser technische Sieg bestätigt noch keine ausreichende Bossherausforderung.
- Referenz: Chrome 156, AMD Radeon über ANGLE/D3D11, 16 logische CPUs,
  1920×1080, DPR ungefähr 1; gleiche lokale Maschine wie A0. Kein allgemeines Hardwareversprechen.

Belege: [aufgewärmte Messungen](adventure-a1-a4/performance.json),
[Bosslauf](adventure-a1-a4/boss-observation.json),
[Neustarts und Kameramatrix](adventure-a1-a4/browser-matrix-initial.json),
[finale 1920-Prüfung](adventure-a1-a4/browser-final-1920.json),
[1366-Abschluss](adventure-a1-a4/browser-final-1366.json),
[30-Hz-Darstellung](adventure-a1-a4/30hz.json),
[reaktiver Sieg](adventure-a1-a4/reactive-boss.json),
[Legacy-Regression](adventure-a1-a4/regression-initial.json),
[isolierter Arena-Abschluss](adventure-a1-a4/regression-arena-final.json).

Korrigierte Befunde sind offen dokumentiert:

Ein realer diagonaler Dash verlor zunächst bei einem nahezu zeitlosen Rapier-
Bodenkontakt fast einen Tick (2,67 statt 3 m). Nur im Dashpfad wird die noch
fehlende horizontale Bewegung nach dem Bodennudge erneut durch denselben
Kapselsolver geführt, sofern kein seitlicher Kontakt vorlag. Wände/Boss bleiben
auch beim zweiten Sweep blockierend; eine neue Stützprüfung erkennt Abgründe.
360 Richtungen in zwei Ruhephasen, Kanten, Wände und Bosskontakt sind danach geprüft.
Legacy benutzt weiterhin den unveränderten einzelnen Solverlauf.

Weitere korrigierte Testannahmen: Ein Klick unmittelbar
zusammen mit Dash startete keinen Schlag (korrekter Dash-Vorrang); die
Abbruchprüfung wartet jetzt auf „windup“. Ein Niederlagen-Overlay verdeckte den
alten HUD-Neustartknopf während einer Aufnahme; der Test nutzt den dafür jederzeit
erreichbaren Lab-Neustart. Keine Wiederholung ohne Ursachenklärung als Erfolg gewertet.
Ein Desktop-Arena-Regressionslauf endete mit 5586 verworfenen Ticks (etwa
93 s) vor dem Matchende; der einzelne Fall bestand anschließend ohne Änderungen an Arena
isoliert in 2,1 Minuten. Diese Laufzeitstörung wird nicht als erfolgreicher Durchlauf gewertet.
Eine künstliche Eckenroute führte zunächst in vorhandene Relaisdeckung; der
Fluchtwegnachweis benutzt den freien seitlichen und anschließend südlichen Weg.

## Grenzen und nächster Schritt

Legacy, reguläre Mission, Arena und alte Frost-/Glutkarten behalten ihre Regeln.
Gemeinsame Technik erhält nur optionale Parameter beziehungsweise neutrale
Filter; die neuen Controller/Peitschenansicht werden mit dem Lab dynamisch geladen.
Boss-HP, Warnzeiten, Schäden und Erholung sind weiterhin der A0-Bestand. Die
gewünschten 45–90 Sekunden oder hochwertige neue Bossrhythmen sind hier noch
kein Abnahmekriterium; sie werden nach positivem G1 in A5 untersucht.
Keine Aussage, dass der neue Kampf bereits menschlich Spaß macht.

**T1 jetzt:** zwei kurze Übungsversuche (bewusst treffen/verfehlen, Rücklauf und
Dash-Abbruch), drei Bossversuche mit Bewegung/Sprung/Dash; bei Bedarf direkt
auf Legacy wechseln. Kontrolle, Zielgefühl, Rücklauf und Kamera jeweils 1–5
bewerten und den störendsten Moment nennen. Ein Sieg ist für G1 nicht erforderlich.
Nutzerurteil zu Verständlichkeit und Kontrolle, Zielwert 4/5, entscheidet über
gezielte A1–A4-Nacharbeit oder die nächste Freigabe A5.1. Alle sechs Gates bleiben offen.

## Nachtrag T1 — qualitative Nutzerrückmeldung vom 2. November 2026

Der Nutzer bewertet den Stand mit „ok soweit ok“. Die Peitsche ist noch nicht
knackig genug und dürfte härter wirken; Treffer sollen deutlicher gezeigt werden.
Er stellt diese Verbesserungen ausdrücklich zur späteren Nacharbeit zurück.
Das wird als grundsätzliche Abnahme des Kernprototyps gewertet: **G1 bestanden**,
mit diesen zwei nicht blockierenden offenen Punkten. Keine Punktbewertungen,
Versuchszahlen oder detaillierten Einzelurteile zu Kamera/Dash wurden angegeben.
Dieser Nachtrag aktualisiert den zuvor offenen menschlichen Status.

Feinschliff vor T2 in A4/A5 mitführen, ohne neuen Bulk: Schwungabschluss und
Rückschnappen, prägnanterer Kontaktsound und kurze sichtbare Gegnerreaktion
untersuchen. Die genannten Mittel sind Designkandidaten, keine bereits
umgesetzten Änderungen. Gegnerwarnungen müssen lesbar bleiben.
Empfohlener nächster Auftrag: A5.1–A7.2 bis T2; noch keine Folgeimplementierung beauftragt.
