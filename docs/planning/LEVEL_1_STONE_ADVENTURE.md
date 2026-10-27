# Level 1: Der verwitterte Hof

Status: konkreter Entwurf zur Besprechung, noch nicht zur Implementierung freigegeben.
Stand: 27. Oktober 2026. Ersetzt die generierten Mockups als Planungsgrundlage.

## Rahmen

Vorhandene stilisierte Figuren, massive Quader/Mauern, lesbare Plateaus, wenige
Pflanzen und bestehendes HUD weiterverwenden. Keine neue Grafikqualität voraussetzen.
Ein zusammenhängendes längliches Level, ungefähr 44 × 48 Spielmeter. Die Kamera
folgt dem Spieler durch die Abschnitte; nicht das gesamte Level gleichzeitig anzeigen.
Maximal drei normale Gegner gleichzeitig aktiv. Erstbesuch als Ziel etwa 3–5 Minuten,
kein zugesicherter Wert; nach spielbarem Durchlauf prüfen.

Geschichte in einem Satz: Der Spieler will zur Kristallkluft; der Steinwächter bindet
die Kraft des verschlossenen Nordtors. Das Siegel im Hof weckt ihn.

## Fester Ablauf und Fundorte

Koordinaten sind Entwurfsanker, keine freigegebenen Collidermaße. Norden = negatives Z.

| Abschnitt | Lage | Gegner | Waffen/Vorräte | Ablauf |
| --- | --- | --- | --- | --- |
| A · Ankunft | Süden, ungefähr (0, 20) | 0 | Start: Arc Lash, 100 HP, 50 Rüstung | Sicherer kleiner Vorhof. Durch den Torbogen sind Ruinen und das entfernte verschlossene Nordtor erkennbar. Auftrag: „Erreiche das Siegel im inneren Hof.“ |
| B · Ruinenpassage | Südwesten, ungefähr (-9, 13) | 2 Steinläufer | Keine Pflichtaufnahme | Zwei getrennt erkennbare Nahkämpfer hinter niedriger Deckung. Spieler übt Arc, Bewegung und Ausweichen. Kein geschlossener Kampfraum; Rückzug in den Vorhof möglich. |
| C · Waffennische | Westen, ungefähr (-12, 6) | 0 | Pulse Repeater mit 54 Schuss | Sichtbar direkt am Hauptweg, nach der ersten Begegnung. Hinweis: „2 / Waffenbutton: Pulse“. Keine Suche hinter unsichtbarer Wand. |
| D · Seitenterrasse, optional | Westlicher Abzweig ab C, ungefähr (-17, 0), Höhe 1,1 m | 2 Steinläufer | Medkit +35, Rüstung +30, Munition +27 | Kurzer Erkundungsweg über sichtbare niedrige Stufen. Gegner und Versorgung vom Abzweig erkennbar. Rückweg führt zur Waffennische. Vorräte helfen beim folgenden Haupthof. |
| E · Innerer Hof | Mitte, ungefähr (2, 2) | 2 Steinläufer + 1 Steinwerfer | Munition +27 hinter einer seitlichen Deckung | Nahkämpfer stehen am vorderen und seitlichen Zugang. Der Werfer steht auf einem niedrigen, erreichbaren Sockel am hinteren Rand. Deckung blockiert seine langsamen Projektile. Drei Gegner, keine Wellen. |
| F · Siegelvorraum | Vor dem Bossbereich, ungefähr (0, -6) | 0 | Ruhepunkt: 100 HP, 50 Rüstung, Pulse auf 54 Schuss auffüllen | Nach den fünf Pflichtgegnern zugänglich. Klare Vorbereitungspause und Checkpoint. Die zwei optionalen Gegner blockieren den Fortschritt nicht. |
| G · Wächterhof | Norden, Boss ungefähr (0, -14), Fläche ca. 22 × 14 m | 1 Steinwächter | Zwei getrennte Munitionslager mit je +18, ein Medkit +35 am seitlichen niedrigen Plateau | Boss erscheint erst nach bewusster Aktivierung des Siegels mit E oder Touch-Button. Kurzes Beben, Auftauchen, Beginn des Kampfes. |
| H · Nordtor | Hinter dem Boss, ungefähr (0, -23) | 0 | Keine Pflichtaufnahme | Nach Sieg öffnet sich das Tor. Erst tatsächliches Durchgehen wechselt zur Kristallkluft. Der Sieg lässt Zeit zum Orientieren. |

Hauptweg: **A → B → C → E → F → G → H**.
Optionaler Abzweig: **C → D → C**.

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

Vor Erreichen von F führt Tod zum Levelanfang. Ab F führt Tod in den Siegelvorraum,
mit 100 HP, 50 Rüstung und 54 Pulse-Schuss. Der Boss und seine drei Vorräte werden
zurückgesetzt; die bereits geschaffte Anreise muss nicht wiederholt werden.
Checkpoint zunächst nur für die laufende Sitzung, ohne neues Save-System.
Außerhalb eines bewussten Neustarts respawnen Gegner und Vorräte nicht.

## Kleine Umsetzungsblöcke nach Freigabe

1. **Begehbarer Levelablauf:** A–H mit vorhandener Optik, Kameraführung, Waffen-/Lootorten,
   Nebenweg und sichtbarem verschlossenem Nordtor. Keine feine Dekorationsrunde.
2. **Normale Begegnungen:** beide kleinen Gegner, feste Gruppen, Abschnittsaktivierung,
   echte Projektile/Deckung und zuverlässige Zustände für den Übergang zum Siegel.
3. **Boss und Abschluss:** bewusster Start, Sturmangriff/zweite Phase, Checkpoint und
   Weiterreise durch das Tor. Vorhandene Frost-/Glutkarten bleiben zunächst erreichbar.

Jeder Block liefert einen spielbaren Zwischenstand. Keine verlässliche Zeitangabe
aus den früheren reinen Darstellungsänderungen ableiten: mehrere Gegner und ein
abschnittsweiser Levelablauf ändern diesmal tatsächlich den Spielkern.

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
