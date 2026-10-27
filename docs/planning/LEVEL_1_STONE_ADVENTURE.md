# Level 1: Der verwitterte Hof

Status: **L1.1 freigegeben, umgesetzt und technisch geprüft.** L1.2–L1.4 geplant,
noch nicht freigegeben. Persönliche Abnahme des neuen Grundrisses steht aus.
Stand: 27. Oktober 2026.

Die [frühere Map-Skizze](../concepts/level-1-layout-v1/README.md) ist überholt:
Der Nutzer fand den ersten Aufbau zu eng, verwinkelt und schlecht sichtbar.
Maßgeblich sind jetzt **drei große offene Höfe** und die [echten L1.1-Spielaufnahmen](../qa/L1_1_RESULT.md).

## Rahmen

Vorhandene stilisierte Figuren, massive Quader/Mauern, lesbare Plateaus, wenige
Pflanzen und bestehendes HUD weiterverwenden. Keine neue Grafikqualität voraussetzen.
Ein zusammenhängendes längliches Level, insgesamt ungefähr 36 × 80 Spielmeter:
Ankunft/Ruinenhof 32 × 22 m, innerer Hof 36 × 24 m, Wächterhof 36 × 26 m.
Die Höfe verbinden kurze, gerade, 10 m breite Durchgänge. A–H bezeichnen Orte
innerhalb dieser drei Höfe, keine acht getrennten Räume. Niedrige Umfassungsmauern,
wenige Deckungen, breite Treppen und ein freier Hauptweg halten die Karte übersichtlich.
Die Kamera folgt dem Spieler und zeigt 20 % mehr Umgebung als in den bisherigen Arenen;
die Gesamtübersicht ist eine Dokumentationsansicht, nicht die normale Spielkamera.
Maximal drei normale Gegner gleichzeitig aktiv. Erstbesuch als Ziel etwa 3–5 Minuten,
kein zugesicherter Wert; nach spielbarem Durchlauf prüfen.

Geschichte in einem Satz: Der Spieler will zur Kristallkluft; der Steinwächter bindet
die Kraft des verschlossenen Nordtors. Das Siegel im Hof weckt ihn.

## Fester Ablauf und Fundorte

Geometrie und Fundorte entsprechen L1.1. Gegner und Fortschrittsregeln der Tabelle
sind weiterhin geplant für L1.2–L1.4. Norden = negatives Z.

| Abschnitt | Lage | Gegner | Waffen/Vorräte | Ablauf |
| --- | --- | --- | --- | --- |
| A · Ankunft | Süden, Spawn (0, 33), im ersten Hof | 0 | Start: Arc Lash, 100 HP, 50 Rüstung | Sicherer Start mit freiem Blick in den Ruinenhof. |
| B · Ruinenhof | Erstes großes Feld, um (0, 24), insgesamt 32 × 22 m mit A/C | 2 Steinläufer | Keine Pflichtaufnahme | Zwei getrennt erkennbare Nahkämpfer bei niedriger Deckung. Rückzug nach A möglich. |
| C · Waffenfund | (-3, 18,5), beim Norddurchgang des ersten Hofs | 0 | Pulse Repeater mit 54 Schuss | Sichtbar am Hauptweg; keine separate Nische oder Raumwand. |
| D · Seitenterrasse, optional | Links im inneren Hof, Mitte (-11,5, 2), 9 × 8 m, Höhe 1,1 m | 2 Steinläufer | Medkit +35 bei (-13,5; 4), Rüstung +30 bei (-13,5; 0), Munition +27 bei (-9; -0,4) | Breite Osttreppe. Optionaler Abstecher vom inneren Hof; Rückkehr direkt nach E. Aktivierung der Gruppen D/E in L1.2 so staffeln, dass nicht alle fünf gleichzeitig angreifen. |
| E · Innerer Hof | Mitte (0, 0), 36 × 24 m | 2 Steinläufer + 1 Steinwerfer | Munition +27 bei (11; 6,5) | Viel freie Bewegungsfläche. Werfer auf erreichbarem 0,8-m-Sockel bei (11; -7), zwei seitliche Deckungen. Drei Pflichtgegner, keine Wellen. |
| F · Siegelplatz | Verbindung bei (0, -14), Siegel bei (0, -17,2) | 0 | Geplant: Ruhepunkt mit 100 HP, 50 Rüstung, 54 Pulse-Schuss | Nach fünf Pflichtgegnern zugänglich; Checkpoint und bewusstes Aktivieren folgen in L1.3. Kein zusätzlicher kleiner Raum. |
| G · Wächterhof | Mitte/Boss (0, -29), 36 × 26 m | 1 Steinwächter | Munition +18 bei (-13; -37) und (13; -20); Medkit +35 auf 1,1-m-Plateau bei (-12; -23) | In L1.1 ruhender Steinkörper. Später bewusster Bossstart mit E/Touch, Beben und Auftauchen. |
| H · Nordtor | Zugang bei (0, -40), Tor bei Z = -42 | 0 | Keine Pflichtaufnahme | L1.1 geschlossen. Später nach Sieg öffnen; erst tatsächliches Durchgehen wechselt zur Kristallkluft. |

Hauptweg: **A → B → C → E → F → G → H**.
Optionaler Abzweig: **E → D → E**. A/B/C liegen im ersten Hof, D/E im zweiten,
G/H im dritten. F liegt an der Verbindung zum dritten Hof.

Gesamt: **5 normale Pflichtgegner, 2 optionale Gegner, 1 Boss**. Keine zufälligen
Spawns und keine Verstärkungen im Bosskampf für diese erste Fassung.

## Zwei kleine Gegnertypen

Beide verwenden einfache Varianten vorhandener Steingeometrie mit deutlich kleinerer
Silhouette als der Boss. Vorläufige Werte, nach dem Spieltest abstimmen:

- **Steinläufer:** 70 HP; zwei Arc-Treffer oder sieben Pulse-Treffer. Langsamer
  Nahkämpfer mit erkennbarem Ausholen, zunächst 14 Schaden. Er verfolgt und nutzt
  die vorhandene Bewegungs-/Deckungslogik.
- **Steinwerfer:** 40 HP; zwei Arc-Treffer oder vier Pulse-Treffer. Deutlich erkennbarer
  Wurfarm/Kern; langsames sichtbares Steinprojektil, zunächst 10 Schaden. Sichtkontakt
  und Vorbereitung nötig, echte Mauern blockieren das Geschoss.

Gegner werden im jeweiligen Abschnitt bei Annäherung/Sichtkontakt aktiv. Kein
Beschuss aus unerforschten Räumen und keine gemeinsame Aktivierung aller sieben.
Besiegte Gegner bleiben für den aktuellen Versuch besiegt.

## Bosskampf und Bedrohung

Vor Aktivierung ist der Wächter nur als ruhender Steinkörper/Siegel sichtbar.
Nach Aktivierung schließt der Zugang vorübergehend; er öffnet sich beim Sieg oder
beim Zurücksetzen des Versuchs. Der Spieler wird nicht beim bloßen Erkunden überrascht.

- Bestehender Faustschlag, Schockwelle und Bodenausbruch bleiben die Grundlage.
- Ergänzung gegen bloßes Rückwärtslaufen: klar angekündigter kurzer Sturmangriff
  bei großer Distanz. Richtung wird vor dem Ansturm festgelegt; echte Deckung stoppt
  ihn und erzeugt ein kurzes Gegenangriffsfenster.
- Unter 50 % Boss-HP sichtbar geöffneter Kern, kürzere Erholung und gelegentlich
  zwei getrennt angekündigte Faustschläge. Keine unangekündigte Erhöhung der Trefferzone.
- Anfangs weiterhin 600 HP. Bedrohung zunächst durch Verhalten statt mehr Lebenspunkte
  erhöhen; der Bosskampf bekommt keine zusätzlichen Gegner in dieser ersten Version.

Die beiden +18-Lager im Bossbereich verhindern einen Munitionsengpass nach dem
vollen 54-Schuss-Start und erfordern einen Positionswechsel. Arc bleibt unbegrenzt
verfügbar. Bewusstes Ausweichen muss Schaden zuverlässig vermeiden; stehendes
Dauerfeuer und dauerhaftes Rückwärtslaufen sollen keine verlässliche Gewinnstrategie sein.

## Wiederholen und Ressourcen

Vor Erreichen von F führt Tod zum Levelanfang. Ab F führt Tod zum Siegelplatz,
mit 100 HP, 50 Rüstung und 54 Pulse-Schuss. Der Boss und seine drei Vorräte werden
zurückgesetzt; die bereits geschaffte Anreise muss nicht wiederholt werden.
Checkpoint zunächst nur für die laufende Sitzung, ohne neues Save-System.
Außerhalb eines bewussten Neustarts respawnen Gegner und Vorräte nicht.

## Umsetzungsplan: vier spielbare Arbeitspakete

Die bisherige grobe Dreiteilung wird in vier einzeln abnehmbare Pakete konkretisiert.
Reihenfolge: **L1.1 → L1.2 → L1.3 → L1.4**. Diese IDs gehören zum Adventure-Level;
M2.4 und die weitere Arena-/Liga-Roadmap bleiben separat.

| Paket | Sichtbares Ergebnis | Aktive Agent-Zeit, vorläufig | Status |
| --- | --- | --- | --- |
| **L1.1 · Map begehen** | Drei große Höfe mit Orten A–H, Terrasse, Stufen, Kamera und Fundorten | Plan 30–60 Min.; ca. 35 Min. bis technische Prüfung inklusive Grundrisswechsel, Übergabe anschließend | **Umgesetzt und technisch geprüft** |
| **L1.2 · Anreise bekämpfen** | Zwei kleine Gegnertypen, fünf Pflichtgegner und zwei optionale Gegner | 60–120 Min. | Geplant |
| **L1.3 · Level abschließen** | Ziele, Siegel, Checkpoint, vorhandener Bosskampf und tatsächlicher Ausgang | 45–90 Min. | Geplant |
| **L1.4 · Boss und Spielgefühl abstimmen** | Sturmangriff, zweite Phase, Lesbarkeit/Balance und kompletter Spieltest | 45–90 Min. | Geplant |

**Gesamt: ungefähr 3–6 Stunden aktive Agent-Arbeit**, einschließlich passender Tests,
gezielter Korrekturen, Dokumentation und Commit/Push. Konservative Planungsspanne,
keine Lieferzusage; Wartezeit auf Rückmeldungen, Freigaben oder Hosting kommt hinzu.
Erster begehbarer Zwischenstand nach L1.1; vollständiger Ablauf nach L1.3.
Die beobachteten ca. 30 Minuten für M0 und M1 dienen als Orientierung. Mehrere Gegner,
Sitzungsfortschritt und Bossphasen begründen mehr Zeit als reine Darstellungsänderungen.
Nach jedem Paket beobachtete Dauer vermerken und verbleibende Schätzungen anpassen.
Nach L1.1 verbleiben vorläufig **2,5–5 Stunden** für L1.2–L1.4. Die technische Prüfung
lag im Planbereich; noch keine Grundlage, Gegner-/Fortschrittspakete weiter zu kürzen.

### L1.1 · Räume, Kamera und Ressourcen — technisch abgeschlossen

- Drei offene Höfe aus vorhandenen Bausteinen, insgesamt ca. 36 × 80 m, Orte A–H
  und optionaler Abstecher E–D–E. Der verwinkelte Erstgrundriss wurde ersetzt.
- Breite Durchgänge und sichtbare Landeflächen in beiden Kameraansichten herstellen.
  Verdeckende Mauern zuerst niedriger setzen oder versetzen. Vorhandene Materialien
  und sparsame Vegetation verwenden, keine zusätzliche Grafikentwicklung.
- Kamera für dieses längliche Level am Spieler mitführen. Ihr bisheriger Faktor 0,42
  reicht an den Kartenenden nicht aus. Kamerastart/Neustart direkt am Spawn; bestehende
  Arenen behalten ihre Einstellungen.
- Alle Waffen und Vorräte an die geplanten Orte setzen. Adventure-Pickups erscheinen
  nicht nach zehn Sekunden erneut; teilweise verbrauchte Vorräte behalten ihre Restmenge.
- Zunächst separat aufrufbar über `?mode=pve&level=stone&adventure=1`; ein einfacher
  URL-Schalter reicht. Alter Steinhof bleibt vergleichbar. Boss und Siegel sind hier
  ruhende Markierungen; Kampf-/Fortschrittssperren folgen in L1.3.

**Technische Abnahme bestanden:** Vom normalen Spawn durch alle Abschnitte laufen, Pulse aufnehmen,
Nebenweg und Boss-Heilplateau über Stufen erreichen und zurückkehren. Kein Hängen,
keine schwebenden Auflagen, Spieler bleibt im Bild. Desktop in beiden Ansichten plus
kurzer Touch-Durchlauf im Querformat; Übersicht und normale Spielperspektive dokumentieren.
[44 Kerntests, drei Browserfälle und Aufnahmen](../qa/L1_1_RESULT.md).
L1.1 enthält noch keine Angriffe, Fortschrittssperren, Checkpoint-Auffüllung oder Siegelinteraktion.

### L1.2 · Kleine Gegner und feste Begegnungen

- Kleine Steinläufer und Steinwerfer aus vorhandenen Steinformen bauen; größerer
  Wurfarm unterscheidet den Werfer. Bewegung, Ausholen, Treffer und Tod sichtbar machen.
- Feste Gruppen: B = 2 Läufer; D = 2 optionale Läufer; E = 2 Läufer + 1 Werfer.
  Stabile Gegner-IDs, Gruppenzuordnung, Spawn, HP und Pflicht-/Optionalstatus festhalten.
  Keine zufälligen Spawns, Zusatzwellen oder Wiederbelebung besiegter Gegner.
- Gruppen erst im jeweiligen Abschnitt aktivieren und räumlich daran binden. Rückzug
  bleibt möglich; bei weitem Rückzug kehren Überlebende sichtbar zurück, behalten aber
  ihre HP. Höchstens drei Gegner greifen gleichzeitig an; Gruppen lassen sich nicht
  quer durch das Level zu einem gemeinsamen Kampf zusammenziehen.
- Läufer verfolgen mit echter Kollision und angekündigtem Nahkampf. Vorhandene
  Sicht-/Wegprüfungen nutzen; wenige explizite Wegverbindungen für die geplanten Stufen
  ergänzen. Der Bossnavigator allein ist keine fertige Navigation für erhöhte Flächen.
  Werfer bleibt zunächst auf seinem erreichbaren Sockel und feuert langsame Projektile.
- Nahkampf und Würfe berücksichtigen Wand, Reichweite und Höhe. Spieler-HP/Rüstung
  gelten durchgehend; mehrere lebende Trefferziele an Arc/Pulse anbinden. Tote Gegner
  entfernen ihren Trefferkörper und lösen keinen Level-Sieg aus.

**Abnahme:** B regulär besiegen → Pulse → E mit Abstecher D; außerdem direkte Route ohne D.
Deckung gegen Würfe, erreichbarer Werfer, Rückzug, Gruppenaktivierung und Schüsse vor/
hinter Gegnern auf gleicher Ebene prüfen. Tod startet hier noch das ganze Level neu.
Gezielte Kerntests für Aktivierung, Tod, Schadenszuordnung und Projektilblockade.

### L1.3 · Story, Checkpoint, Bossstart und Ausgang

- Schlanker Levelzustand: `exploring → ready → boss → cleared`, mit Niederlage und
  Wiederholen. Kurze HUD-Ziele wechseln bei echten Ereignissen: Ankunft, Waffenfund,
  gesicherter Hof, Siegel und Nordtor. Vorhandenes HUD nutzen, keine Zwischensequenz.
- Nach den fünf Pflichtgegnern öffnet F; D bleibt optional. Sichtbares Tor mit echter
  Kollision, das sich nicht einfach überspringen lässt. Boss vorher nicht angreifbar.
- Checkpoint beim ersten Erreichen von F setzen: 100 HP, 50 Rüstung, 54 Pulse-Schuss.
  Nur einmalige Auffüllung; Zurücklaufen erzeugt keine dauernde Heilquelle.
- Siegel in Reichweite mit E oder Touch-Button aktivieren: Zugang schließt, Beben/
  Auftauchen startet, Bossleiste erscheint. Zunächst vorhandener Faustschlag, Schockwelle
  und Bodenausbruch mit 600 Boss-HP; neue Bedrohung folgt im nächsten Paket.
- Vor F setzt Tod/Wiederholen das Level zurück. Ab F: Spieler samt Ausrüstung nach F,
  Boss und seine drei Vorräte zurücksetzen; Gegner und Vorräte der Anreise behalten
  ihren Zustand. Alte Projektile/Warnflächen entfernen. „Level neu starten“ setzt
  alles zurück; Reload beginnt zunächst ebenfalls bei A, ohne dauerhaftes Save-System.
- Nach Sieg H öffnen und Weiterlaufen zulassen. Erst Durchgehen lädt die bestehende
  Kristallkluft. Der heutige Siegdialog darf Bewegung und Ausgang nicht sperren.

**Abnahme:** Komplettdurchlauf mit und ohne D, bewusster Bossstart, Tod vor F und im
Bosskampf, vollständiger Neustart, tatsächlicher Übergang nach Frost. Zustandswechsel,
einmaligen Checkpoint, Pflichtzählung und Rücksetzgrenzen gezielt testen; E und Touch
im Browser bedienen. Damit steht erstmals der komplette Levelablauf.

### L1.4 · Bedrohung, Lesbarkeit und fertige erste Fassung

- Angekündigter kurzer Sturmangriff bei Distanz: Richtung vorab festlegen, seitliches
  Ausweichen ermöglichen, echte Deckung stoppt den Boss und eröffnet Gegenfeuer.
  Boss bleibt im Wächterhof.
- Unter 50 % HP geöffneter Kern, kürzere Erholung und gelegentlich zwei einzeln
  angekündigte Faustschläge. Vorhandene Angriffe bleiben lesbar, keine Boss-Zusatzgegner.
- Regulär spielen und bisher einfache Gewinnstrategien gezielt versuchen: stehen
  bleiben/dauerfeuern, rückwärts kreisen, auf einem Plateau stehen. Angriffsmix und
  Wege so abstimmen, dass Reaktion nötig bleibt und angekündigte Ausweichfenster gelten.
- Nur nötige Feinarbeit an Licht, Plateaukonturen, Silhouetten, Ton und HUD. Neue
  Dekoration muss Orientierung oder Stimmung verbessern und darf Wege nicht verdecken.
- Gesamtdurchlauf mit Maus/Tastatur und Touch. Alte Stein-, Frost-, Glut- und Arena-
  Einstiege kurz gegenprüfen. Zielspielzeit 3–5 Minuten messen, nicht künstlich erzwingen.

**Abnahme:** Normaler Sieg samt Ausgang, wirksamer Sturmangriff/zweite Phase,
berechenbares Ausweichen und kein Ressourcen-Softlock. Nutzerurteil zu Bedrohung und
Lesbarkeit separat von technischer Abnahme festhalten. Nach Abnahme kann der neue
Steinhof regulärer Einstieg werden; bis dahin bleibt der Vergleichslink bestehen.

## Technische Umsetzung auf der vorhandenen Basis

| Bereich | Konkreter Ansatz |
| --- | --- |
| Geometrie/Rendering | `src/arena/stoneAdventure.ts` definiert die drei Höfe; gemeinsame Quader, Materialien, Pickups und Licht weiterverwendet. Statische Mauerteile werden zusammengefasst gezeichnet. Aktuelle Leveldaten/Spielaufnahmen ersetzen die alte Skizze. |
| Bewegung/Kampf | `Simulation`, Rapier, Aim und `Combat` weiterverwenden. Die Physikwelt kann bereits mehrere Zielkörper registrieren und aktivieren; feste Gegner beim Levelstart anlegen. |
| Levelablauf | Kleiner Adventure-Zustand im `src/core`-Bereich mit Abschnitten, Pflichtgegnern, Checkpoint und Toren. App verbindet Eingabe, Physik und Darstellung. Kein allgemeines Quest-/ECS-Framework. |
| Spielerleben/Boss | Heute enthält `PveEncounter` Spielerleben, Boss und Sieg zusammen. Ab L1.2 eine gemeinsame Zuständigkeit für HP/Rüstung über alle Adventure-Begegnungen; Bossereignisse daran anbinden, keine konkurrierenden HP-Stände. Alte PvE-Aufrufer kompatibel halten. |
| Pickups/Reset | `Pickups` um Einmal-Regel und gezieltes Zurücksetzen der Bossvorräte ergänzen. Arena-Respawn bleibt Standard für bisherige Aufrufer. |
| Tore | Darstellung und echter Collider wechseln gemeinsam; Navigation berücksichtigt geschlossene Durchgänge. |
| Eingabe/HUD | Desktop/Touch beibehalten, eine gemeinsame Interaktionsaktion E/Touch ergänzen. Kurze Ziele während der Anreise, Bossanzeige erst im Kampf. |

Unmittelbar relevante Prüfpunkte sind **Kamera/Sicht in den großen Höfen**,
**Gegnerbewegung an Deckung/Stufen** und **Tod/Checkpoint-Zustände**. Sie werden im
jeweiligen Paket geprüft. Größere Eventualitätenlisten und Optimierungen für noch
nicht gebaute Level sind kein eigener Vorlauf.

## Umfang, Freigabe und Übergabe

**L1.1 wurde durch „ok go L1.1“ freigegeben und ist technisch abgeschlossen.**
Nächster abgegrenzter Auftrag ist **L1.2**; dafür zunächst auf Freigabe warten.
Eine spätere ausdrückliche Freigabe mehrerer oder aller Pakete gilt
entsprechend, ohne für jeden Unterpunkt erneut nachzufragen.

Jedes freigegebene Paket liefert einen begehbaren/spielbaren Stand, passende Kernchecks
und echte Browser-Eingaben, dokumentierte Ergebnisse, aktualisierte Roadmap sowie
Commit/Push. Reguläre Abnahme vom normalen Einstieg; Testhilfen für Regressionen
ersetzen keinen Durchlauf. Touch-Emulation und tatsächliche Smartphone-Abnahme trennen.

Erste Fassung: Steinhof, bestehende Waffen/Grafikbasis, zwei kleine Gegnertypen, ein
Boss und Sitzungs-Checkpoint. Kein Inventar-/Skillbaum, dauerhaftes Save-/Dialogsystem,
neue Waffen, prozedurale Level oder gleichzeitige Umgestaltung von Frost/Glut.
CTF-3.0 bleibt unverändert.

## Konkrete Abnahme

- Vom regulären Spawn: zwei erste Gegner besiegen → Pulse aufnehmen → Nebenweg
  erreichen und Ressourcen verwenden → gemischte Dreiergruppe besiegen → Siegel aktivieren.
- Zweiter Durchlauf ohne Nebenweg: Boss muss trotzdem erreichbar und ausgerüstet sein.
- Keine Gegner vor ihrer Begegnung aktiv; keine Angriffe durch Mauern/Etagen.
- Boss bewusst auslösen, Ansturm vermeiden, regulär gewinnen, durch geöffnetes Tor gehen.
- Tod vor und nach Checkpoint erzeugt jeweils den vorgesehenen Wiederholungszustand.
- Desktop und einfacher Touch: Aufnahme, Waffenwechsel, Interaktion, Kampf und Ausgang.
- Nutzer beurteilt Orientierung und Bedrohung. Automatischer Sieg allein ist keine
  Bestätigung, dass der Boss ausreichend fordernd oder der Level interessant ist.
