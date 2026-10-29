# Adventure-Shooter: Vorbilder und Empfehlungen für CORE ARENA

Recherche- und Designstand: **29. Oktober 2026**. Projektbasis: `bb8975d`.

Dieses Dokument sammelt die Erkenntnisse hinter dem geplanten Adventure-Ausbau.
Es ist eine ausführliche Referenz, keine zusätzliche Aufgabenliste und keine
Umsetzungsfreigabe. Maßgeblich für die nächsten Arbeitspakete bleibt der
[kompakte Levelplan L1.6a–c](LEVEL_1_STONE_ADVENTURE.md).

## Inhalt

1. [Richtung, Quellen und Grenzen](#1-richtung-quellen-und-grenzen)
2. [Vergleich der Vorbilder](#2-vergleich-der-vorbilder)
3. [Darksiders Genesis](#3-darksiders-genesis--zusammenhängendes-abenteuer)
4. [Bastion](#4-bastion--geschichte-im-spielfluss-und-waffenidentität)
5. [The Ascent](#5-the-ascent--glaubwürdige-orte-und-räumlicher-kampf)
6. [RUINER](#6-ruiner--kampfgefühl-und-konsequente-gestaltung)
7. [Ergänzungen: Hades und Alienation](#7-ergänzende-vorbilder-hades-und-alienation)
8. [Unser aktueller Stand](#8-was-das-für-unseren-aktuellen-stand-bedeutet)
9. [Konkrete Leveldramaturgie](#9-konkrete-dramaturgie-für-level-1)
10. [Kampf und Waffen](#10-kampf-und-waffen-konkrete-designempfehlungen)
11. [Map, Materialien und Ausstattung](#11-map-materialien-und-ausstattung)
12. [Erzählung, Sound und HUD](#12-erzählung-sound-und-hud)
13. [Mobile und Kamera](#13-mobile-und-kamera)
14. [Asseteinsatz](#14-welche-vorhandenen-assets-welche-aufgabe-bekommen)
15. [Prioritäten und Roadmap](#15-prioritäten-und-zuordnung-zur-roadmap)
16. [Spieltest und Inspiration sammeln](#16-wie-wir-wirkung-prüfen-und-weitere-inspiration-sammeln)
17. [Quellen](#17-quellen-und-weiterführende-links)

## 1. Richtung, Quellen und Grenzen

### Unsere Einordnung

**Top-down-Action-Adventure mit Shooter-Kämpfen** beschreibt das aktuelle Ziel am
besten. Suchbegriffe für weitere Recherche: *isometric action adventure*,
*top-down action shooter*, *twin-stick action RPG*, *environmental storytelling*
und *encounter design*. Diese Begriffe überschneiden sich; keiner davon verlangt
automatisch Loot-Grind, zufällige Karten oder eine bestimmte Steuerung.

Die vorgeschlagene eigene Identität: Ein kompakter, leicht humorvoller
Ruinenkurier erkundet überwucherte Anlagen einer älteren Energietechnik.
Steinwächter, technische Relais und später Maschinengegner gehören zu derselben
Welt. Ein Level ist ein kurzer Auftrag mit nachvollziehbaren Handlungen und
sichtbaren Folgen. Die vorhandene echte 3D-Höhe und die präzise Bewegung bleiben
wichtige Eigenheiten.

### Drei Arten von Aussagen

- **Belegt:** Eigenschaften, die Entwickler-/Publisherquellen ausdrücklich
  beschreiben. Die entsprechende Quelle steht beim Abschnitt.
- **Eigene Ableitung:** Meine Empfehlung für CORE ARENA, aus diesen Eigenschaften
  und unserem konkreten Projektstand entwickelt. Sie ist im Spiel zu überprüfen.
- **Sichtung offen:** Fragen für weitere Gameplay- und Bildanalyse. Verlinkte
  Videos sind Anschauungsmaterial, keine hier vollständig protokollierten
  Spieldurchläufe. Es wurde keine neue eigene Testpartie dieser Vorbilder gemacht.

Die Quellen wurden am 29. Oktober 2026 recherchiert. Mehrere Texte sind historische
Entwicklerbeiträge. Ihre damaligen Preise, Plattformlisten und Geräteanforderungen
werden nicht als heutige Empfehlung übernommen. Bei RUINER war der Publishertext
über die Suchansicht lesbar; der direkte Abruf lieferte zeitweise HTTP 403.

Die Projektvorschläge in den Abschnitten 8–16 sind eigene Designarbeit. Sie
behaupten weder identische Mechaniken in allen Vergleichsspielen noch gemessene
Erfolgswirkungen. Das Ziel ist, passende Prinzipien mit unserem vorhandenen
Material in kleinen Schritten auszuprobieren.

## 2. Vergleich der Vorbilder

Die Gewichtung ist eine Einschätzung für unser Projekt, keine allgemeine
Qualitätsrangliste der Spiele.

| Vorbild | Für uns besonders relevant | Kleiner übertragbarer Ansatz | Umfang, den wir vorerst auslassen |
| --- | --- | --- | --- |
| **Darksiders Genesis** | Verbindung von Schießen, Erkunden, Aufgaben und Bossen | Ein sichtbarer Weg durch zusammenhängende Orte mit einem konkreten Auftrag | Koop, Charakterwechsel, viele Fähigkeiten und umfangreiche Progression |
| **Bastion** | Geschichte im Spielablauf; Waffen mit eigener Rolle | Wenige ereignisbezogene Hinweise; Arc und Pulse bleiben beide sinnvoll | Vollständiger Erzählerapparat und große Dialogproduktion |
| **The Ascent** | Welt als funktionierender Ort; räumliches Schießen | Ladestation, Wartungsbereich und Relaisanlage mit erkennbarer Funktion | Großstadtumfang, riesige Kulissen und vollständiges RPG-System |
| **RUINER** | Unmittelbarer Kampf, klare Identität, passende Musik | Unterschiede zwischen Abfeuern, Treffen, Getroffenwerden und Besiegen schärfen | Dessen hohe Intensität und großes Gadget-Repertoire als Pflicht übernehmen |
| **Hades** | Verbindung von Kampf, Wiederholung und weiterlaufender Geschichte | Checkpoint-Retry ohne erneute Einführung und ohne verlorene Anreisearbeit | Roguelike-Läufe, zufällige Builds und große Meta-Progression |
| **Alienation** | Missionsbelohnungen und Bindung an Waffen | Ein verständlicher Waffenfund und eine Bossbelohnung mit konkreter Funktion | Zufallswerte, Seltenheitsstufen, Rerolls und ein großes Loot-Inventar |

**Empfohlene Reihenfolge für die Vertiefung:** Darksiders Genesis für den
Gesamtaufbau, Bastion für Erzählung und Bedienung, The Ascent für Ortsgestaltung,
RUINER für Kampfpräsentation. Hades und Alienation bleiben gezielte Ergänzungen.

## 3. Darksiders Genesis – zusammenhängendes Abenteuer

### Belegte Eigenschaften

THQ Nordic beschreibt Genesis als Top-down-Action-Adventure mit Schusskämpfer
Strife, Erkundung, Rätseln und Bosskämpfen. Die Produktseite ergänzt eine
Geschichtskampagne, den Wechsel zwischen Strife und dem Nahkämpfer War im
Einzelspiel sowie Gegenstände, Fähigkeiten und Waffenverbesserungen.
[Ankündigung](https://thqnordic.com/news/thq-nordic-and-airship-syndicate-announce-darksiders-genesis)
· [Offizielle Spielseite](https://darksidersgenesis.thqnordic.com/).

### Eigene Ableitung für CORE ARENA

Der relevante Zusammenhang ist **Kampf → Handlung → räumlicher Fortschritt**.
Unsere drei Höfe sollten jeweils eine neue Frage beantworten:

- Ankunft: Wo bin ich und weshalb funktioniert die Anlage nicht?
- Innerer Hof: Wie bekomme ich wieder Energie in die Anlage?
- Wächterhof: Was schützt die Energiequelle, und was ändert mein Sieg?

Damit gewinnt bereits derselbe Grundriss einen Zusammenhang. Für einen ersten
Versuch brauchen wir keine zusätzlichen Räume. Bestehende Übergänge können
zeigen, ob ein Bereich schon funktioniert: erloschene Leitungen, aktivierte
Konsole, reagierendes Relais, geöffnetes Tor.

Eine optionale Terrasse sollte vom Hauptweg aus erkennbar sein und ein klares
Versprechen geben: Dort liegen Vorräte oder etwas Interessantes. Die Rückkehr
zum Hauptweg soll kurz und intuitiv bleiben. Das passt zur gewünschten großen,
aufgeräumten Map und verhindert die Rückkehr zu verwinkelten Korridoren.

Die beiden kleinen Gegner können unterschiedliche Aufgaben bekommen, ohne ihre
Anzahl zu erhöhen: Der erste führt die Bedrohung ein, der zweite bewacht eine
funktional wichtige Stelle. Die neue Waffe liegt zwischen beiden Begegnungen,
sodass man sie vor dem Boss tatsächlich kennenlernen kann.

### Gute konkrete Übernahme

Eine einzelne Konsole im zweiten Hof verbindet Weg, Gegner und Bossfreigabe.
Der Spieler sieht die Wirkung unmittelbar: Energie läuft in Richtung des
letzten Hofes. Eine kurze HUD-Zeile bestätigt das nächste Ziel. So ist die
Interaktion mehr als ein abstrakter Schlüsselzähler.

### Fragen für eine spätere Sichtung

Im [IGN-Video der ersten 16 Minuten](https://www.youtube.com/watch?v=YQQAvfkAYK0)
gezielt auf Raumfolgen, Übergänge zwischen Kampf und Bewegung, die Lesbarkeit
von Höhen und den Ort von Belohnungen achten. Keine Zeitmarken wurden hier
bereits als ausgewertete Beispiele festgehalten. Interessant ist insbesondere,
wie viel Orientierung ohne dauerhaftes Lesen funktioniert.

## 4. Bastion – Geschichte im Spielfluss und Waffenidentität

### Belegte Eigenschaften

Supergiant beschreibt einen reaktiven Erzähler, der auf den tatsächlichen
Spielablauf reagiert. Kampf verlangt Bewegung, Nutzung des Geländes und das
Erkennen von Angriffsgelegenheiten. Waffen sollen verschiedene Spielweisen
ermöglichen und langfristig brauchbar bleiben.
[Bastion FAQ](https://www.supergiantgames.com/blog/bastion-faq/).

Im Beitrag zur Erzählgestaltung erläutert Greg Kasavin den Wunsch nach
Geschichte ohne Spielunterbrechung. Kurze Äußerungen sollen Bedeutung und
Hintergrund ergänzen, statt nur sichtbare Aktionen zu benennen. Wiederholte
Kommentare werden als störend für die Erzählwirkung beschrieben.
[In-Depth: Writing Bastion](https://www.supergiantgames.com/blog/in-depth-writing-bastion/).

### Eigene Ableitung: wenige Hinweise mit einer Aufgabe

Für uns genügt zunächst eine beschädigte Drohne als Absender oder Bezugspunkt.
Vier kurze ereignisbezogene Textmeldungen sind ein brauchbarer Anfang. Die
eigentliche Handlung geschieht sichtbar im Level; eine Meldung ergänzt, warum
sie etwas bedeutet. Eine flächendeckende Vertonung wäre dafür nicht notwendig.

Beispiel: Nach dem Aktivieren der Konsole sollte der Text nicht nur „Konsole
aktiviert“ melden. Interessanter wäre ein Hinweis, dass die Anlage wieder Strom
hat, aber etwas im letzten Hof darauf reagiert. Der Spieler kann die Folge
sehen und erwartet das nächste Ereignis.

Bei einem Boss-Retry müssen Ankunft und Waffenfund nicht noch einmal erklärt
werden. Die kurze Information „Ruhepunkt geladen“ genügt als Zustandsbestätigung.
Längere Welttexte gehören eher an eine freiwillig besuchte Stelle als in einen
laufenden Faustschlag.

### Eigene Ableitung: Waffen als Entscheidungen

Arc Lash ist ein kurzer, automatisch zielender Energiefächer. Pulse ist eine
gerichtete Fernkampfwaffe mit Munition. Beide sollten erkennbare Gelegenheiten
bekommen. Pulse darf sich beim Fund stärker und anders anfühlen, ohne Arc
dadurch bedeutungslos zu machen. Ein Spieler soll die Unterschiede beim Nutzen
verstehen; dazu reichen anfangs gute Schusseffekte und ein kurzer Hinweis.

Es wäre für das Testlevel wenig hilfreich, diese Unterscheidung sofort durch
zehn ähnliche Waffen mit höheren Zahlen zu verdecken. Zuerst prüfen wir, ob
die bestehenden zwei Werkzeuge zu unterschiedlichen Entscheidungen führen.

### Besonders relevant: die Touch-Fassung

Die historische iOS-FAQ beschreibt eine angepasste Bedienung mit automatischen
Angriffen, sobald Ziele in Reichweite kommen, sowie manuell auslösbaren Aktionen
und Waffenwechsel. Sie dokumentiert auch Überarbeitungen der Darstellung für
unterschiedliche Bildschirmformate.
[Bastion für iOS, Entwickler-FAQ](https://www.supergiantgames.com/blog/out-now-bastion-for-ipad/).

**Unsere Ableitung:** Automatische Zielhilfe kann Teil eines aktiven
Action-Adventures sein. Unsere Auto-Arc darf die Präzisionslast reduzieren,
während Abstand, Deckung, Bewegung und Waffenwahl Entscheidungen bleiben.
Wir behalten den vorhandenen Joystick und das bewusste Aktivieren der Salve;
die Bastion-Steuerung wird nicht vollständig kopiert. Derselbe Kampf muss mit
Daumenbedienung noch lesbar und fair bleiben.

## 5. The Ascent – glaubwürdige Orte und räumlicher Kampf

### Belegte Eigenschaften

Die offizielle Seite beschreibt ein Action-Shooter-RPG in einer Konzernstadt.
Der plötzliche Zusammenbruch des betreibenden Konzerns setzt die Handlung in Gang. Erkundbare Bezirke,
Beute, unterschiedliche Gegner, Deckung sowie hohes und tiefes Zielen sind
ausdrücklich Teil der Beschreibung.
[The Ascent, offizielle Spielseite](https://theascent.krafton.com/en).

### Eigene Ableitung: jeder Hof hatte früher eine Funktion

Für CORE ARENA würde ich vor der nächsten Dekoration drei einfache Fragen pro
Hof beantworten: Was wurde dort gemacht? Was ist kaputtgegangen? Was ist heute
noch bedienbar? Daraus entstehen konkrete Platzierungsentscheidungen.

| Hof | Frühere Funktion | Sichtbare Spuren | Heutige Spielerhandlung |
| --- | --- | --- | --- |
| Ankunft | Anlieferung und Laden kleiner Geräte | Leere Halterung, beschädigte Drohne, einzelne tote Leuchten | Auftrag verstehen, ersten Gegner überwinden, Waffe finden |
| Innerer Hof | Wartung und Energieverteilung | Geöffnete Wartungsstelle, unterbrochene Leitung, Pflanzen in Randfugen | Vorräte entdecken, Konsole einschalten |
| Wächterhof | Gesicherte Energie- und Relaisanlage | Massive Einfassung, alte Warnmarken, reagierende Energieelemente | Wächter besiegen, Kern bergen, Relais starten |

Damit entsteht Dekoration aus einer räumlichen Idee. Ein Kabel beginnt an einer
Anlage und endet an einer anderen. Eine Konsole steht dort, wo sie etwas
bedienen könnte. Ein Sockel trägt ein Gerät oder kennzeichnet dessen frühere
Position. So lassen sich die importierten Technikmodelle mit den bestehenden
Steinruinen verbinden.

Die große Inspirationsquelle ist der funktionale Zusammenhang, nicht die
maximale Zahl gleichzeitig sichtbarer Requisiten. Unser Kampf findet in einer
näheren mobilen Ansicht und mit wenigen Gegnern statt. Freie Bodenfläche,
unverdeckte Gegner und klare Landekanten müssen erhalten bleiben.

### Eigene Ableitung: Sicht und Schussraum bewusst unterscheiden

Ein sichtbarer Gegner ist nicht automatisch aus jeder Position beschießbar.
Unsere echte 3D-Kollision bildet das bereits grundsätzlich ab. Die Grafik muss
dieselbe Geschichte erzählen: Deckung hat eine klare Höhe, ein Strahl endet
sichtbar an der Wand, eine erhöhte Fläche besitzt ein erkennbares Oberteil.

Die in The Ascent beschriebene Hoch-/Tief-Zielwahl ist dabei ein Vergleichspunkt,
kein Auftrag für eine zusätzliche Taste. CORE ARENA hat bereits räumliches
Zielen, Sprünge und Auto-Arc. Zuerst müssen diese vorhandenen Regeln verständlich
sein, bevor weitere Eingabemodi sinnvoll werden.

## 6. RUINER – Kampfgefühl und konsequente Gestaltung

### Belegte Eigenschaften

Devolver beschreibt RUINER als storygetriebenen Action-Shooter mit schnellen
Kämpfen, Schuss- und Nahkampfwaffen, Dash-/Schildwerkzeugen und einer
gezielten Musikauswahl. Die Handlung verbindet die Auseinandersetzungen mit
der Suche nach dem entführten Bruder und einer Hackerbegleitung.
[RUINER, Publisherseite](https://www.devolverdigital.com/games/ruiner).

### Eigene Ableitung: eine Aktion besteht aus mehreren lesbaren Momenten

Für unsere Arc-Salve sind mindestens drei Momente verschieden: Aktivierung,
Kontakt mit einem Ziel und Ende der Salve. Bei Pulse kommen Flug und Einschlag
hinzu. Wenn alles denselben kurzen Lichtblitz und denselben Ton verwendet,
verschwinden wichtige Unterschiede im Spielgefühl.

Eine sinnvolle kleine Überarbeitung wäre:

- Arc beginnt mit einem elektrischen Anlauf, brutzelt während der bestehenden
  Salve und zeigt tatsächlichen Zielkontakt an der Trefferstelle.
- Pulse hat einen kurzen Schussimpuls und einen eigenen Einschlag. Das Geschoss
  bleibt unterwegs sichtbar, statt Treffer und Schuss gleich aussehen zu lassen.
- Ein Wächter reagiert kurz und eindeutig auf Schaden, ohne bei jedem
  Schadensimpuls ununterbrochen weggeschoben oder betäubt zu werden.
- Beim Tod fällt die Figur zusammen; Trefferreaktionen enden. Ein besiegter
  Körper darf nicht weiter wie ein angreifbarer Gegner aussehen.
- Schaden am Spieler bleibt trotz eigener Waffenblitze erkennbar, etwa über
  eine klar unterscheidbare Reaktion an Figur und Lebensanzeige.

Diese Empfehlungen sind eine eigene Ausarbeitung für unsere vorhandenen
Waffen und Animationen, keine Behauptung über die genaue Effektpipeline von
RUINER.

### Eigene Ableitung: Intensität dosieren

Unser ruhiger Ankunftshof braucht eine andere Geräuschdichte als der Boss.
Je deutlicher Ruhe, Gefahr und Entspannung unterscheidbar sind, desto weniger
muss ein einzelner Effekt übertreiben. Ein gedämpftes mechanisches Brummen vor
dem letzten Hof kann einen neuen Spannungsmoment schaffen, obwohl noch kein
Gegner auf dem Bildschirm steht.

Starke Kamerabewegung, dauerndes Blitzen und zusätzlicher Eingabedruck sind
keine automatische Qualitätssteigerung. Für unser mobiles Querformat wären
sie besonders kritisch. Vorhandene Gegnerwarnungen müssen gegenüber dekorativen
Funken und Waffenleuchten lesbar bleiben.

## 7. Ergänzende Vorbilder: Hades und Alienation

### Hades: Bedeutung über Wiederholungen hinweg

**Belegt:** Supergiant beschreibt Hades als kampforientierten Roguelike mit
unterschiedlichen Fähigkeitenkombinationen und einer Geschichte, die sich über
mehrere Versuche entfaltet. Die FAQ behandelt außerdem unterschiedliche
Schwierigkeitsoptionen und Charaktere, die an frühere Begegnungen anknüpfen.
[Hades FAQ](https://www.supergiantgames.com/blog/hades-faq/).

**Eigene Ableitung:** Unser Checkpoint ist bereits ein guter Ansatz, um Wiederholen
angenehm zu machen. Eine Niederlage beim Boss sollte einen neuen Lernversuch
ermöglichen, ohne die Anreise und Einleitung erneut abzuarbeiten. Bei der
geplanten Konsolenaufgabe bleibt deshalb der vorherige Missionsfortschritt
erhalten. Ein kompletter Neustart ist dagegen klar als solcher gekennzeichnet.

Wenn sich das erste Level bewährt, könnten spätere kurze Missionskommentare auf
einen früheren Versuch reagieren. Dafür brauchen wir jetzt weder zufällige
Raumfolgen noch dauerhafte Statusverbesserungen. Das erste Ziel ist ein guter
einzelner Durchlauf und ein verständlicher Retry.

### Alienation: Belohnung bekommt eine Funktion

**Belegt:** Housemarque beschreibt Beute aus Kisten und besiegten Gegnern sowie
Waffenkerne und weitere Waffenanpassungen. Diese Systeme sollen zur Beschäftigung
mit der eigenen Ausrüstung und zur Wiederholbarkeit beitragen.
[Entwicklerbeitrag über Loot und Waffen](https://blog.playstation.com/?p=172669).

**Eigene Ableitung:** Unser erster Test braucht zunächst zwei eindeutige
Belohnungen: Pulse eröffnet eine andere Kampfdistanz, und der Steinkern bringt
die Anlage wieder zum Laufen. Damit haben Fund und Sieg einen Zweck, den man
ohne Inventarverwaltung versteht.

Für spätere Missionen wäre eine einzelne Wahl zwischen zwei klar verschiedenen
Waffenfunktionen denkbar. Ein umfangreiches System aus Seltenheiten, Zufallswerten
und Rerolls würde jedoch zusätzliche Oberfläche, Balance und Persistenz brauchen.
Es ist eine separate Produktentscheidung und gehört nicht in L1.6.

## 8. Was das für unseren aktuellen Stand bedeutet

### Bereits vorhanden und wertvoll

- Drei große Höfe mit breiten Verbindungen und seitlicher Standardansicht.
- Bewegung, Sprint, echte Höhen, Sprünge und überprüfbare räumliche Treffer.
- Ein klarer Spielertyp und zwei geriggte kleine Gegner mit unterschiedlicher
  Farbaufteilung.
- Ein Steinwächter mit Auftauchen, Verfolgung, Faustschlag, Schockwelle und
  Bodenausbruch.
- Arc mit automatischer Zielwahl und Pulse mit fliegenden Projektilen.
- Waffen-/Ressourcenfunde, Checkpoint, Tod/Retry, Kern-Drop und physischer Ausgang.
- Texturierter Stein, deutlichere Plateauflächen, Pflanzen und technische Konsolen.
- Desktop- und Touch-Steuerung, Browserprüfungen und öffentliches Deployment.

Quellen für den Projektstand: [Levelplan](LEVEL_1_STONE_ADVENTURE.md),
[Arc/Mobile-Prüfung](../qa/SPRINT_ARC_MOBILE_RESULT.md),
[Ausstattung](../qa/FREE_DECORATION_RESULT.md),
[Kampf-Nachbesserungen](../qa/ENCOUNTER_FIXES_RESULT.md).

### Die derzeit wichtigsten Lücken aus Designsicht

1. **Der Ort erklärt sich noch zu wenig durch Handlung.** Viele Bestandteile
   funktionieren, aber ein neuer Spieler soll auch verstehen, warum er hier
   ist und weshalb gerade diese Gegner den Weg sperren.
2. **Die drei Höfe brauchen verschiedene Rollen.** Ein Wechsel der Requisiten
   allein schafft noch keine neue Spielsituation.
3. **Funde und Sieg können mehr Bedeutung bekommen.** Der aktuell optionale Kern
   bietet sich als sichtbarer Auslöser für das Wiedererwachen der Anlage an.
4. **Die Bedrohung ist noch nicht abschließend abgestimmt.** Ein älterer
   dokumentierter Vergleich ließ stationäres Dauerfeuer gewinnen. Dieser Befund
   ist keine neue Messung nach der Auto-Arc-Änderung; der aktuelle Ausgangswert
   muss vor L1.6b erneut gespielt werden.
5. **Erkundung braucht erkennbare Belohnung.** Ein freiwilliger Umweg soll sich
   als Fund, Information oder interessante Ansicht lohnen.

Diese Punkte sind vorrangig Inszenierungs- und Abstimmungsarbeit. Sie begründen
keine erneute Engine- oder Grundrissänderung.

## 9. Konkrete Dramaturgie für Level 1

Arbeitstitel: **Der verstummte Außenposten**. Die folgende Ausarbeitung erläutert
den bereits geplanten Ablauf; einzelne Deko- und Textideen sind Varianten, keine
zusätzlichen Pflichtfeatures.

### Ablauf und Aufgabe der einzelnen Orte

| Abschnitt | Was der Spieler tut | Was die Welt vermittelt | Vorhandene Grundlage | Geplante Ergänzung |
| --- | --- | --- | --- | --- |
| A: Ankunft | Loslaufen und sich orientieren | Eine ehemals betriebene Anlage ist ausgefallen | Sicherer Spawn im ersten Hof | Beschädigter Hover-Bot, kurze Meldung, erkennbare Leitung |
| B: Erster Gegner | Annähern, Arc aktivieren, Angriff erkennen | Der Ort ist bewacht | Erster Steinläufer | Sichtbares Erwachen; Platzierung mit freiem Rückzugsraum |
| C: Waffenfund | Pulse aufnehmen und ausprobieren | Hier wurde Ausrüstung gewartet oder gelagert | Vorhandener Pulse-Pickup | Einbettung in eine offene Station, kurze Funktionsbestätigung |
| D: Seitenterrasse | Freiwillig Vorräte erkunden | Der Außenposten besitzt eine Geschichte und Nebennutzung | Terrasse, Treppe, feste Pickups | Kleine Wartungsszene; optional ein kurzer Hinweis |
| E: Zweiter Gegner/Konsole | Bereich sichern und Strom einschalten | Die Handlung hat eine sichtbare Folge | Zweiter Läufer und vorhandene Konsole | Interaktion nach beiden Läufern, Energiefluss zum Boss-Hof |
| F: Ruhepunkt | Vorräte sichern und Entscheidung zum Weitergehen treffen | Die nächste Begegnung ist größer | Checkpoint | Klare, knappe Rückmeldung; erste Geräusche des Wächters |
| G: Wächterhof | Muster erkennen, ausweichen, angreifen | Der Wächter schützt die Energiequelle | Boss und bestehende Angriffe | Ankündigung vor Eintritt, abgestimmter Kampfdruck |
| H: Abschluss | Kern bergen, Relais versorgen, Ausgang passieren | Der Außenposten funktioniert wieder | Kern und Ausgangstor | Relaisaktivierung öffnet Nordtor, Umgebung erwacht |

### Spannung statt künstlicher Länge

Die Reihenfolge sollte zwischen Orientierung, Handlung und Kampf wechseln.
Eine ruhige Strecke ist sinnvoll, wenn sie einen Blickfang, ein Geräusch oder
eine Wahl enthält. Eine lange Strecke ohne Entscheidung würde das kleine Level
nur strecken. Ebenso müssen wir den Boss nicht durch mehr HP auf eine vorab
bestimmte Minutenzahl bringen.

Für die erste Fassung wird deshalb keine feste Mindestspielzeit versprochen.
Wir messen Erstversuch und Wiederholung getrennt. Ist ein Abschnitt sehr kurz,
prüfen wir zunächst, ob er trotzdem seine Funktion erfüllt. Ist er lang,
prüfen wir, ob etwas Interessantes geschieht.

### Konsole und Relais sollen sich verschieden anfühlen

Die Konsole stellt die Verbindung her; das Relais erhält später die fehlende
Energiequelle. Das sind zwei unterschiedliche Ursachen und Folgen. Der Spieler
soll nicht zweimal denselben beliebigen Knopf drücken müssen.

- Konsole: Bedienlicht geht an, eine Leitung oder vorhandene Leuchten reagieren,
  der Zugang zum Wächter wird freigegeben.
- Relais: Der geborgene Steinkern erhält einen sichtbaren Platz oder löst einen
  eindeutig zugeordneten Energieimpuls aus; das große Tor reagiert.
- Die Bedienaufforderung erscheint nur in erreichbarer Nähe. Aus der Entfernung
  reichen ein erkennbares Objekt und das aktuelle Ziel.
- Eine bereits erledigte Interaktion zeigt ihren fertigen Zustand und erzeugt
  keine erneute Belohnung.

Die technischen Zustände bleiben klein und fest: Anreise, Konsole aktiv,
Bosskampf, Kern geborgen, Relais aktiv, Level abgeschlossen. Das ist ein
Entwurf für dieses Level, kein allgemeines Quest-System.

### Warum das den vorhandenen Kern-Drop aufwertet

Der Spieler verbindet den Kampfabschluss mit einer anschließenden Handlung.
Das Nordtor bleibt nach dem Sieg zunächst geschlossen, bis das Relais versorgt
ist; der Rückweg aus der Bossarena wird dagegen wieder frei. Das ist die im
Plan bewusst vorgesehene Änderung gegenüber dem bisherigen optionalen Kern.
Das Relais muss deutlich in Richtung Ausgang liegen, damit keine Sucharbeit
nach einer unsichtbaren letzten Bedingung entsteht.

## 10. Kampf und Waffen: konkrete Designempfehlungen

### Ausgangswerte und ihre Bedeutung

Die Zahlen sind der lokale Stand vom 29. Oktober 2026, keine Werte der Vorbilder.

| Element | Aktueller Wert | Eigene Designfolgerung |
| --- | --- | --- |
| Gehen / Sprint | 7,2 / 9,18 m/s | Der Spieler kann schnell Abstand gewinnen; Gegnerdruck darf nicht allein auf langsamem Hinterherlaufen beruhen. |
| Kleiner Läufer | 3,2 m/s; 70 HP; 1,8 m Nahkampfreichweite; 0,4 s Ausholen | Ein einzelner Läufer im offenen Raum ist vor allem ein Einführungsgegner. Seine Platzierung ist entscheidend. |
| Arc Lash | 5 m; 35 Schaden pro vollständiger Salve; 0,6 s Salve, 0,8 s Startabstand; fünf Strahlen | Reichweite und sichere Positionierung tragen mehr zur Entscheidung bei als exaktes Cursortracking. |
| Pulse | 10 Schaden pro Treffer; Schussabstand 10 Ticks; 54 Schuss maximal | Trefferquote und sichere Schussfenster geben der Waffe eine andere Aufgabe als Arc. |
| Steinwächter | 600 HP; im Adventure 3,1 m/s Verfolgung | Bedrohung entsteht aus dem Zusammenspiel seiner Angriffe und der verfügbaren Fläche. |

Projektquellen: [Bewegungswerte](../../src/core/types.ts),
[Waffen](../../src/core/combat.ts), [Läufer](../../src/core/stoneRunner.ts),
[Adventure-Kampf](../../src/core/adventureFight.ts),
[Adventure-Konfiguration](../../src/arena/stoneAdventure.ts),
[Boss-Grundregeln](../../src/core/pve.ts).

Reine Rechenbeispiele, keine gemessene Kampfleistung: Arc erreicht bei dauerhaftem
Kontakt und wiederholten Salven rechnerisch 35 / 0,8 = **43,75 Schaden/s pro Ziel**.
Pulse erreicht bei lauter Treffern 10 / (10/60) = **60 Schaden/s**, solange Munition
vorhanden ist. 54 Treffer ergeben 540 Schaden; gegen 600 Boss-HP fehlen danach
60. Bewegung, Deckung, Trefferquote und tatsächliche Angriffsfenster verändern
diese Werte im Spiel. Diese Rechnung erklärt die Rollen, ersetzt aber keinen Test.

### Ziele für die zwei Waffen

**Arc:** unkomplizierter kurzer Angriff, der auch auf Touch gut aktivierbar ist.
Die Salve darf verlässlich treffen, wenn der Spieler die nötige Distanz und
Sicht herstellt. Im unmittelbaren Nahkampf muss dieser Komfort ein Risiko haben:
Der Gegner darf seine Attacke tatsächlich ausführen können.

**Pulse:** größere sichere Distanz und gezielte Schüsse, bezahlt mit Munition
und der Notwendigkeit zu treffen. Die Waffe sollte beim ersten Fund Gelegenheit
zum Ausprobieren bekommen, bevor ein wichtiger Bossversuch davon abhängt.

Der breite Arc-Fächer trifft potenziell mehrere Ziele, aber das aktuelle Level
hat zwei räumlich getrennte kleine Gegner. Es ist daher kein guter Test für
den Mehrzielnutzen. Das ist eine bewusste Grenze der kleinen Fassung; für einen
solchen Test müssten wir später gezielt eine passende Begegnung freigeben.

### Die Bedrohung des Bosses konkretisieren

| Verhalten | Gewünschte Spielerentscheidung | Woran eine faire Umsetzung erkennbar ist |
| --- | --- | --- |
| Faustschlag mit kurzem Vorwärtsschritt | Seitlich aus dem angekündigten Angriff gehen | Ausholen und Richtung erkennbar; kein Durchgleiten durch Deckung, kein überraschendes Nachdrehen im Treffermoment |
| Schockwelle | Abstand und Zeitpunkt lesen; vorhandene Sprung-/Deckungsregeln nutzen | Sichtbare Front stimmt mit Trefferprüfung überein; die Reaktion wird vor der Kombination mit anderen Angriffen verständlich |
| Bodenausbruch | Die markierte Stelle verlassen | Zielort wird rechtzeitig festgelegt und danach nicht heimlich dem Spieler nachgezogen |
| Erholung | Schussfenster nutzen oder Vorrat erreichen | Der Boss zeigt erkennbar, dass er kurz nicht angreift; Fenster besteht tatsächlich in den Regeln |
| Verfolgung | Position wechseln, statt dauerhaft bequem stehenzubleiben | Wege respektieren Collider und bleiben nachvollziehbar |

Es geht zunächst um die vorhandenen drei Angriffstypen. Ein Vorwärtsschritt kann
die Faust gefährlicher machen, ohne eine neue Bossphase oder Gegnerwelle
einzuführen. Länge und Zeitpunkt müssen auf die bestehende Kamera und die
Touch-Bewegung abgestimmt werden; hier werden noch keine ungetesteten Zahlen
als endgültiges Balancing festgeschrieben.

### Drei Strategien als schneller Balancevergleich

1. **Stehen und feuern:** definierte Startposition, vorhandene Ausrüstung,
   kein Ausweichen. Dieser Vergleich soll die Schutzwirkung bloßer HP und
   Schadensleistung sichtbar machen.
2. **Dauerhaft rückwärts im Kreis:** prüft, ob Bewegung allein jedes Risiko
   aufhebt und ob normale Gegner jemals Einfluss auf die Route bekommen.
3. **Bewusst auf Angriffe reagieren:** Warnung lesen, ausweichen, Erholung nutzen.
   Diese Spielweise soll sich als erkennbar bessere Lösung anfühlen.

Die Ergebnisse zunächst protokollieren, dann eine Ursache verändern und erneut
spielen. Wenn ein verlorener Versuch nur durch unlesbare Treffer entsteht,
haben wir die Schwierigkeit nicht sinnvoll verbessert. Eine KI, die den Spieler
nach einem korrekt ausgeführten Ausweichmanöver einfach verfolgt und trotzdem
trifft, würde das Lernen entwerten.

### Gegnerzahl und kleine Gegner

Die beiden Läufer bleiben zunächst erhalten. Der erste sollte sein Ausholen
gut sichtbar auf einer freien Fläche zeigen. Der zweite steht im Zusammenhang
mit der Konsole und dem neu verfügbaren Pulse. Unterschiedliche Startsituationen
sind günstiger als sofort mehrere neue Gegnertypen zu entwickeln.

Falls beide Begegnungen nach der Gesamtprüfung bedeutungslos bleiben, ist eine
kleine zusätzliche Begegnung eine mögliche spätere Entscheidung. Sie gehört
nicht automatisch zum aktuellen Paket. Ein Mech als dritter großer Gegner
würde die Einführung und den Steinwächter wahrscheinlich stärker verändern als
eine reine optische Überarbeitung.

## 11. Map, Materialien und Ausstattung

Die folgenden Empfehlungen sind eigene Vorgaben für unser Produktionsniveau.
Es werden keine unverifizierten Behauptungen über Shader oder Rendertechniken
der Vergleichsspiele aufgestellt.

### Große Formen zuerst

Jeder Hof erhält einen Hauptblickfang, eine erkennbare Laufzone und einige
gezielte Randgruppen. Der Blickfang soll schon aus der normalen Spielkamera
als Form lesbar sein. Kleine Schilder oder sehr feine Schäden können ihn
ergänzen, aber nicht ersetzen.

1. Zuerst Raumform, Hauptweg und Ein-/Ausgänge beurteilen.
2. Danach Plateauhöhen und Deckungskörper lesbar machen.
3. Einen funktional passenden Hauptblickfang setzen.
4. Materialgruppen, Licht und wenige Requisitengruppen ergänzen.
5. Zuletzt kleine Schäden, Bewuchs und bewegte Details hinzufügen.

Das ist eine Reihenfolge für kleine sichtbare Verbesserungen. Ein Testbild aus
der Spielkamera soll nach jedem größeren Schritt zeigen, ob die Orientierung
besser oder schlechter geworden ist.

### Oberflächen brauchen eine Hierarchie

| Fläche | Empfohlene Behandlung | Häufiger Fehler, den wir bei uns vermeiden sollten |
| --- | --- | --- |
| Hauptweg | Ruhige Steinfläche, wenige große Variationen, freie Silhouette der Figuren | Überall gleich starke Flecken, sodass Strahlen und Gegner untergehen |
| Plateauoberseite | Klarer Rand und unterscheidbare obere Fläche | Gleiches Muster und gleiche Helligkeit wie Boden und Wand |
| Plateauwand | Vertikale Gliederung, sichtbarer Sockel und saubere Ecken | Schräge Farbflächen, die Höhe oder Bodenkontakt verunklären |
| Mauerecke | Durchgehender Abschluss oder bewusst gesetzter Pfeiler | Kleine Lücken und wechselnde Abschlusshöhen ohne gestalterische Absicht |
| Metallgerät | Wenige klar getrennte Materialien, kleine Statusleuchten | Alles gleich glänzend oder großflächig selbstleuchtend |
| Bewuchs | Wachstum an Fugen, Sockeln und feuchten Randstellen | Große flache Flecken über der Bodenhöhe, die wie schwebende Platten wirken |
| Schäden | Lokale Spuren mit nachvollziehbarer Ursache | Flächendeckendes zufälliges Rauschen ohne Zusammenhang |

Für Moos und Schmutz bevorzugen wir an der Fläche haftende Materialdetails.
Pflanzen und Felsen brauchen einen klaren Auflagepunkt. Echte Meshpflanzen dürfen
in den Spielraum ragen, solange sie keine wichtige Kante oder Figur verdecken.
Ob etwas gut integriert wirkt, wird auch nach einem Kamerawechsel geprüft.

### Pflanzen, Steine und Licht sinnvoll gruppieren

Eine Gruppe aus Farn, kleinen Steinen und wenigen Pilzen an einer gebrochenen
Randmauer wirkt als zusammengehörige Stelle. Dieselben Objekte einzeln und
gleichmäßig verteilt würden vor allem die freie Fläche unruhiger machen.
Einzelne Pflanzen innerhalb des Spielfelds bleiben ausdrücklich erwünscht;
ihre Position sollte aber den Ort erklären oder eine Randzone markieren.

Ein Licht hat eine Aufgabe: Orientierung, Bedienzustand oder Atmosphäre.
Eine Konsole darf nach ihrer Aktivierung leuchten. Der Weg zum Boss kann
durch eine kurze Folge vorhandener Lampen bestätigt werden. Dafür braucht
nicht jede sichtbare Leuchte ein zusätzliches dynamisches Schattenlicht.

### Farbaufteilung als Arbeitsvorschlag

- Umgebung: bestehender Stein, gedämpfte Vegetation und ruhige Metallflächen.
- Spieler: warme Elfenbein-/Korallorange-Aufteilung beibehalten.
- Kleine Wächter: kühler Körper und abgesetzte helle Formteile; auf dem
  tatsächlichen Boden prüfen, nicht nur im Modellviewer.
- Arc/Pulse: vorhandene violette beziehungsweise blaue Waffenidentität erhalten.
- Interaktion: Licht zusammen mit einem erkennbaren Symbol oder Zustandswechsel.
- Gefahr: eindeutig von dekorativer Energie unterscheiden; Kontur, Bewegung
  und Position tragen die Information zusätzlich zur Farbe.

Das ist keine Aufforderung, jeden Spielzustand nur durch eine andere Farbe
darzustellen. Auf kleinen Displays und bei eingeschränkter Farbwahrnehmung
müssen Form und Bewegung dieselbe Information stützen.

### Umgebung kann größer wirken als die Laufstrecke

Hinter einer niedrigen Begrenzung können ein stillgelegter Maschinenkörper,
eine große Leitung oder ein angeschnittenes Gebäude die Anlage erweitern.
Das ist eine spätere Gestaltungsoption, kein Grund, den bestehenden Weg länger
zu machen. Solche Kulissen müssen sich von erreichbaren Plattformen unterscheiden,
damit sie keine falschen Sprungziele versprechen.

## 12. Erzählung, Sound und HUD

### Vier Meldungen können einen vollständigen kleinen Auftrag tragen

Diese Textentwürfe sind eigene Vorschläge. Sie setzen die geplante Missionskette
voraus und sind noch keine im Spiel verwendeten Dialoge.

| Auslöser | Möglicher kurzer Text | Was die Umgebung gleichzeitig vermittelt |
| --- | --- | --- |
| Ankunft bei der beschädigten Drohne | „Lieferung angekommen. Außenposten antwortet nicht. Bring die Anlage wieder zum Laufen.“ | Beschädigter Bot, erloschene Technik, erkennbarer Weg in den Hof |
| Konsole aktiviert | „Verbindung steht. Dem Relais fehlt sein Kern. Das Signal kommt aus dem Wächterhof.“ | Leitung leuchtet in Richtung Boss; Zugang wird freigegeben |
| Boss erwacht | „Der Kern läuft. Leider hat er Beine.“ | Boss bricht hervor; der Kern ist als Motiv am Gegner wiederzuerkennen |
| Relais mit Kern versorgt | „Außenposten online. Lieferung abgeschlossen. Dieses Mal fast ohne Zwischenfall.“ | Relais fährt hoch, Lampen reagieren, Ausgang öffnet |

Die leichte Komik passt zur gedrungenen Figur. Sie sollte in wenigen treffenden
Momenten entstehen. Dauernde Sprüche könnten die Bedrohung unterbrechen und
bei Boss-Wiederholungen schnell ermüden. Ein wiederholter Bossversuch braucht
keine erneute Missionsvorstellung.

### Das HUD bestätigt die Welt

Der Spieler sieht einen kurzen aktuellen Auftrag, etwa „Wartungskonsole erreichen“
oder „Steinkern zum Relais bringen“. Sobald die passende Stelle in Reichweite
ist, erscheint eine eindeutige Interaktion mit E beziehungsweise der Touch-Taste.
Die Taste sollte eine Handlung benennen: „Konsole starten“ ist hilfreicher als
ein überall identisches „Benutzen“.

Für die erste Fassung genügt ein einzelner Missionsgegenstand als Zustandswechsel.
Ein permanentes Inventarfenster wäre dafür unnötig. Beim Aufnehmen des Kerns
kann eine kurze Bestätigung erscheinen, anschließend weist das Ziel zum Relais.
Die vorhandenen HP-/Rüstungsanzeigen an der Figur und die schlanke Waffenanzeige
bleiben Teil des Spiels. Neue Information darf die Gegner nicht verdecken.

Ein Wechsel des Auftrags muss sichtbar auf eine Handlung folgen. Eine bereits
benutzte Konsole meldet ihren Zustand, statt die gleiche Aktion erneut anzubieten.
Am Checkpoint bleibt der Missionsfortschritt erhalten; ein vollständiger
Levelneustart beginnt wieder bei der Ankunft.

### Sound nach Bedeutung ordnen

| Ebene | Zweck für Level 1 | Kleiner sinnvoller Anfang |
| --- | --- | --- |
| Umgebung | Die Anlage als Ort vermitteln | Zurückhaltender Wind, einzelne Metallgeräusche, später elektrisches Summen |
| Interaktion | Erfolgreiche Handlung bestätigen | Eigenes Startgeräusch der Konsole; deutlich anderer Hochlauf des Relais |
| Kampf | Ursache, Gefahr und Treffer verständlich machen | Erkennbares Ausholen, trockener Treffer, eigener Spielerschaden-Klang |
| Spannung | Boss ankündigen und Abschluss fühlbar machen | Wenige dumpfe Schläge vor dem Erwachen; nach Sieg hörbare Entspannung |

Wichtige Angriffsgeräusche müssen sich gegenüber Arc-Brutzeln und Atmosphäre
durchsetzen. Viele gleichzeitig laute Sounds würden die Lesbarkeit verschlechtern.
Alle notwendigen Warnungen müssen außerdem visuell funktionieren, weil gerade
auf dem Handy häufig ohne Ton gespielt wird.

Sehr kurze Kamerareaktionen oder Trefferpausen können später einzeln erprobt
werden. Sie sind kein Pflichtumfang des Plans; vor allem dürfen sie Zielen,
Sprunggefühl und Touch-Bedienung nicht unkontrollierbar machen. Bereits eine
saubere zeitliche Abstimmung von Animation, Effekt und Klang kann viel bewirken.

## 13. Mobile und Kamera

### Den näheren Blick erhalten, die Begegnungen darauf abstimmen

Die letzte Änderung vergrößert die mobile Darstellung gegenüber dem vorherigen
Stand nochmals um rund 26 %. Die Nähe ist eine bewusste Nutzerpräferenz.
Die nächste Optimierung sollte deshalb zuerst prüfen, ob relevante Gegner,
Angriffsankündigungen und Wege im sichtbaren Ausschnitt liegen.
[Aktuelle Änderung und Prüfungen](../qa/SPRINT_ARC_MOBILE_RESULT.md).

Der Standardweg bleibt von links nach rechts; andere Ansichten sind weiterhin
wählbar. Ein Blickfang muss aus der tatsächlichen Spielkamera erkennbar sein.
Ein im freien 3D-Editor hübscher Hof kann aus dieser Kamera trotzdem schlecht
lesbar sein, wenn Wand, Pflanze und Gegner dieselbe Silhouette bilden.

### Konkrete Regeln für die geplanten Aufgaben

- Hauptinteraktion auf dem Boden und in der Welt markieren, nicht ausschließlich
  durch kleinen Text. Richtung, Reichweite und aktueller Zustand sollen erkennbar sein.
- Interaktion benötigt eine eigene kontextabhängige Touch-Taste. Laufen, Sprint
  und Feuern müssen weiter gleichzeitig funktionieren; die neue Taste übernimmt
  keinen bereits gehaltenen Bewegungs- oder Schussfinger.
- Zielsuche des Arc darf einen Gegner nicht durch eine Wand treffen. Die Hilfe
  nimmt Zielpräzision ab, aber Reichweite, freie Schussbahn und Position bleiben wichtig.
- Vor einem starken Angriff müssen Warnbereich und verbleibender Ausweichraum
  sichtbar sein. Gefahren außerhalb des Ausschnitts brauchen eine passende
  Ankündigung; ein bloßer überraschender Treffer genügt nicht.
- Hohe Deckung, Pflanzen und Effekte dürfen Spieler und kleine Wächter nicht
  gleichzeitig verdecken. Den relevanten Laufweg auch unter den Daumen prüfen.
- HUD und Interaktionshinweise für tatsächliches Querformat testen, einschließlich
  Kamerawechsel und der vorhandenen Menü-/Vollbildbedienung.

Automatisches Herauszoomen in jeder Kampfsituation wäre eine zusätzliche
Gestaltungsentscheidung. Zuerst sollen Platzierung und Angriffsablauf mit dem
gewünschten näheren Bild funktionieren. Falls ein einzelner Bossmoment später
mehr Übersicht braucht, lässt sich eine begrenzte Kamerareaktion gezielt beurteilen.

### Emulation und echter Handytest beantworten unterschiedliche Fragen

Browser-Emulation eignet sich für Bildschirmaufteilung, Touch-Ereignisse,
gleichzeitige Bedienung und den vollständigen Ablauf. Ein echtes Handy ergänzt
Fragen zu Daumenverdeckung, Wärme, Bildrate, Displayhelligkeit und Spielgefühl.
Die persönliche Geräteabnahme bleibt deshalb getrennt dokumentiert. Aus einer
bestandenen Desktop-Emulation wird keine behauptete Hardwareprüfung.

## 14. Welche vorhandenen Assets welche Aufgabe bekommen

Die Ausstattung sollte die Funktion eines Ortes erklären. Vorhandene Modelle
werden nach ihrem Beitrag ausgewählt, nicht allein deshalb, weil sie im
Repository liegen.

| Bestand | Passende Aufgabe | Umfang für den nächsten Ausbau |
| --- | --- | --- |
| KayKit-Spieler und Wächterpuppen | Wiedererkennbare Figuren mit gemeinsamer technischer Animationsbasis | Bestehende Formen/Farbtrennung erhalten; in der echten Umgebung prüfen |
| Vorhandener Steinwächter | Höhepunkt und Träger der Energiequelle | Inszenierung und Kampf abstimmen; kein neues Bossmodell nötig |
| Kostenlose AssetQuest-Pflanzen | Überwucherung und längere Stilllegung zeigen | Kleine Gruppen an sinnvollen Stellen; einzelne Pflanzen auch im Spielfeld |
| Kostenlose Retro-Tech-Konsolen | Wartungsfunktion des zweiten Hofs vermitteln | Eine vorhandene Konsole eindeutig interaktiv machen |
| Hexwars-Hover-Bot | Beschädigte Lieferdrohne am Start | Zunächst statische Pose und ein Statuslicht; kein Begleiter-KI-System |
| Hexwars-Relais | Sichtbarer Zweck des Boss-Drops und Missionsabschluss | Am Ausgang platzieren, Zustandswechsel bei Energiezufuhr |
| Animierter Hexwars-Mech | Später markanter Maschinengegner oder ruhender großer Fund | Für L1.6 nicht erforderlich; ein Gegner daraus wäre ein eigener Auftrag |
| Animierte Railgun | Später ein klar angekündigter Fernkampfgegner | Eigene Sichtlinie, Warnung und Konter nötig; kein zusätzlicher L1-Pflichtgegner |
| HQ und Fabrik mit Modulen | Später größere technische Anlage oder Hintergrundbau | Erst bei passender Mission auswählen; keine automatische Komplettplatzierung |

Der importierte Hexwars-Bestand enthält zehn GLBs und sechs Blender-Quellen.
Mech und Haupt-Railgun haben eingebettete Animationen; die Railgun-LOD hat keine
eigenen Clips. Hover-Bot, HQ und Relais besitzen keine eingebetteten Clips.
Eine einfache Statusanzeige oder Objektbewegung ist deshalb etwas anderes als
eine bereits vorhandene geriggte Animation.
[Geprüfter Assetbestand und Herkunft](../../public/assets/hexwars/README.md).

### Modelle zu einer gemeinsamen Welt machen

Eine Drohne und ein Steinboss können zusammenpassen, wenn die Umgebung ihren
Zusammenhang zeigt: Die Anlage nutzt dieselbe Energie, die im Wächter steckt.
Leitungen, Relais und wiederkehrende Formen verbinden Ruine und Technik.
Die Welt bekommt dadurch eine eigene Regel statt einer Sammlung fremder Modelle.

Bei der Integration zuerst Größenverhältnisse, Materialhelligkeit, Rauheit und
Lichtrichtung angleichen. Anschließend wenige wiederkehrende Akzentfarben und
gegebenenfalls kleinere Anbauteile verwenden. Dafür müssen gute vorhandene
Modelle nicht grundsätzlich neu gebaut werden.

Es werden nur tatsächlich benötigte Modelle zur Laufzeit geladen. Der gesamte
Import gehört nicht in den Startdownload eines Levels. Die Blender-Quellen sind
Arbeitsdateien; ein passender GLB-Export ist das Laufzeitmodell. Herkunft und
Nutzungsbedingungen bleiben pro Quelle dokumentiert: Der Hexwars-Import wird
dadurch nicht pauschal zu CC0. Neue kostenpflichtige Assets sind nicht eingeplant.

## 15. Prioritäten und Zuordnung zur Roadmap

### Die zehn wirkungsvollsten Hebel für unser erstes Testlevel

Das ist eine Arbeitspriorisierung für den aktuellen Stand. Die Reihenfolge
bildet keine gemessene Erfolgswahrscheinlichkeit ab.

| Priorität | Hebel | Konkrete Wirkung, die wir erreichen wollen | Zuordnung |
| --- | --- | --- | --- |
| 1 | Nachvollziehbarer Auftrag | Der Spieler weiß, warum er hier ist und was als Nächstes zu tun ist | L1.6a |
| 2 | Handlungen verändern die Welt | Konsole, Kern, Relais und Tor bilden eine erkennbare Ursache-Wirkung-Kette | L1.6a |
| 3 | Bedrohlicher, fairer Boss | Positionieren und Ausweichen bringen einen Vorteil gegenüber Stehenbleiben | L1.6b |
| 4 | Lesbare Lauf- und Sprungflächen | Höhen, Wände und freie Wege sind auch während des Kampfes verständlich | L1.6c, in allen Paketen erhalten |
| 5 | Drei Orte mit eigener Funktion | Ankunft, Wartung und Energieanlage unterscheiden sich trotz gleicher Stilbasis | L1.6c |
| 6 | Zwei Waffen mit einem Grund zum Wechseln | Arc belohnt Nähe, Pulse ermöglicht gezielten Fernkampf; Munition hat eine Bedeutung | L1.6b |
| 7 | Erkundung wird belohnt | Die optionale Terrasse liefert erkennbare Vorräte und eine kleine Entdeckung | L1.6c |
| 8 | Präzises Kampf- und Zustandsfeedback | Der Spieler erkennt Treffer, Gefahr, Erfolg und die nächste Gelegenheit | L1.6b; Interaktionen in L1.6a |
| 9 | Reibungsarme Bedienung und Wiederholung | Touch funktioniert gleichzeitig; Boss-Retry vermeidet unnötiges Wiederholen | L1.6a und bestehender Checkpoint |
| 10 | Tatsächlich durchgespielte Abnahme | Einstieg, Sieg, Tod und Neustart funktionieren unter echten Eingaben | Je Paket gezielt; abschließend L1.5b |

### Die ausführliche Referenz erweitert nicht den Auftrag

- [x] Vorbilder recherchiert, Quellen und eigene Ableitungen getrennt dokumentiert.
- [x] Empfehlungen auf vorhandene Karte, Waffen, Gegner und Assets bezogen.
- [x] Bezug zum kompakten Umsetzungsplan hergestellt.
- [ ] L1.6a: Auftrag/Konsole/Kern/Relais umsetzen — noch nicht freigegeben.
- [ ] L1.6b: Kampf und Bossdruck abstimmen — noch nicht freigegeben.
- [ ] L1.6c: Orte und Erkundung ausarbeiten — noch nicht freigegeben.
- [ ] L1.5b: Abschließende technische und persönliche Spielabnahme.

Der [kompakte Levelplan](LEVEL_1_STONE_ADVENTURE.md) bleibt die maßgebliche
Umfangs- und Aufwandsschätzung: grob 2–4 Stunden aktive Agent-Arbeit für die
geplanten Pakete einschließlich gezielter Tests und Dokumentation. Die Länge
dieses Referenzdokuments begründet keinen zusätzlichen Entwicklungsumfang.

Ein allgemeines Quest-System, neues Inventar, vertonte Dialogproduktion,
persistente Charakterentwicklung, Mech-Gegner, weitere Räume oder zusätzliche
Gegnerwellen sind mögliche spätere Richtungen. Keine davon muss für das erste
Testlevel vorgezogen werden. Der nächste sinnvolle Implementierungsschritt
bleibt nach Freigabe **nur L1.6a**.

## 16. Wie wir Wirkung prüfen und weitere Inspiration sammeln

### Für unseren Spieltest wenige konkrete Fragen beantworten

| Frage | Geeigneter Versuch | Was festgehalten wird |
| --- | --- | --- |
| Ist der Auftrag verständlich? | Einstieg ohne zusätzliche mündliche Erklärung | Erkennt der Spieler Ziel und ersten Weg? Wo bleibt er ratlos stehen? |
| Funktioniert die Ursache-Wirkung-Kette? | Konsole bedienen, Boss besiegen, Kern bergen, Relais starten | Passen Weltreaktion und angezeigtes Ziel zum tatsächlichen Zustand? |
| Ist Erkunden attraktiv? | Hauptweg spielen, ohne die Terrasse vorher zu erklären | Wird die Terrasse wahrgenommen? Ist der Fund brauchbar oder am Checkpoint ohnehin sofort ersetzt? |
| Sind Waffen echte Alternativen? | Arc-Nähe und Pulse-Distanz in denselben Begegnungen vergleichen | Reichweite, Treffer, verbrauchte Munition und erforderliche Bewegung |
| Ist der Boss gefährlich und fair? | Stationär feuern, dauerhaft kreisen, bewusst ausweichen | Überleben, erhaltene Treffer, klar verständliche Schadensursachen |
| Funktionieren Höhen? | Relevante Plateaus im Kampf benutzen | Lesbarkeit, Erreichbarkeit, Warnung und Trefferhöhe |
| Macht Retry einen neuen Versuch leicht? | Sterben, Boss erneut versuchen, danach Level vollständig neu starten | Korrekte Ressourcen, Gegner-, Tor-, Kern- und Missionszustände |
| Trägt die mobile Darstellung? | Vollständiger Ablauf mit Touch im Querformat | Verdeckungen, gleichzeitige Eingaben, sichtbare Warnungen; danach echter Gerätetest |

**Wichtiger aktueller Punkt:** Der Checkpoint füllt bereits Vorräte auf.
Ein Vorratsfund kurz davor ist als Erkundungsbelohnung möglicherweise schwach.
Vor einer Regeländerung prüfen, ob die Terrasse auf dem Weg dorthin hilft oder
ob eine kleine sichtbare Entdeckung den Abstecher tragen kann. Ein permanenter
Wertebonus oder neues Sammelsystem folgt daraus nicht automatisch.

Für den Kampfvergleich muss der Ausgangszustand gleich sein: HP/Rüstung,
Munition, Startposition und Waffe dokumentieren. Mit Auto-Arc sind neue
Vergleichsläufe nötig; frühere Bossresultate bleiben historische Befunde.
Ein abgesprochenes Testskript prüft reproduzierbar technische Bedingungen.
Ein frei spielender Mensch beantwortet zusätzlich, ob Spannung und Orientierung
tatsächlich überzeugen.

Die Durchlaufzeit lässt sich nach Abschnitten festhalten: Ankunft/Orientierung,
Bewegung, Erkundung, Kampf und Retry. Ein langer Abschnitt ist nicht automatisch
gut; entscheidend ist, ob dort eine interessante Entscheidung stattfindet.
Die Zahlen dienen dem Vergleich der nächsten Version mit dem Ausgangsstand,
nicht als erfundener Branchenrichtwert.

### Weitere Vorbilder gezielt ansehen

Für zusätzliche Recherche genügt zunächst ein ungeschnittener kurzer
Spielabschnitt. Mit einer konkreten Frage schauen, zum Beispiel: „Wie wird vor
dem ersten Kampf das Ziel vermittelt?“ oder „Woran erkennt man die sichere
Fläche während eines Bossangriffs?“ Danach Beobachtung und Empfehlung trennen.

Eine brauchbare Notizvorlage:

| Feld | Inhalt |
| --- | --- |
| Quelle und Zeitpunkt | Link, Abrufdatum, tatsächliche Videozeitmarke oder selbst gespielter Abschnitt |
| Beobachtung | Nur das, was sichtbar, hörbar oder ausdrücklich beschrieben ist |
| Mögliche Wirkung | Interpretation mit Begründung; keine behauptete Spielerstudie |
| Relevanz für CORE ARENA | Welche konkrete Schwäche unseres Levels könnte das adressieren? |
| Kleinster Versuch | Eine Änderung, die mit vorhandenem Material ausprobiert werden kann |
| Prüfung | Woran erkennen wir, ob sie geholfen hat? |

Vorher/Nachher-Bilder brauchen denselben Standort, Blickwinkel, Zoom und
möglichst denselben Spielzustand. Für Kampfgefühl kommt ein kurzer tatsächlicher
Spielablauf hinzu; ein schönes Standbild beweist keine gute Lesbarkeit in Bewegung.

Offizielle Entwicklertexte sind besonders nützlich für erklärte Designabsichten.
Ungeschnittenes Gameplay zeigt Abläufe und Bedienung. Einzelne Artstation-Bilder
können Material- oder Formideen liefern, beantworten aber nicht, wie eine Karte
spielbar funktioniert. Ein Referenzbild oder Gameplayvideo liefert außerdem
keine Erlaubnis, dessen Modelle, Texturen oder Musik in unser Spiel zu übernehmen.

## 17. Quellen und weiterführende Links

### Primärquellen zu den Vorbildern

| Quelle | Datum des Beitrags, soweit relevant | Verwendet für |
| --- | --- | --- |
| [THQ Nordic: Darksiders-Genesis-Ankündigung](https://thqnordic.com/news/thq-nordic-and-airship-syndicate-announce-darksiders-genesis) | 6. Juni 2019 | Offizielle Einordnung und Grundelemente |
| [Darksiders Genesis: offizielle Spielseite](https://darksidersgenesis.thqnordic.com/) | Produktseite | Kampagne, Figuren und Progressionsansatz |
| [Supergiant: Bastion FAQ](https://www.supergiantgames.com/blog/bastion-faq/) | Historische FAQ | Erzähler, Kampf und Waffenrollen |
| [Supergiant: In-Depth — Writing Bastion](https://www.supergiantgames.com/blog/in-depth-writing-bastion/) | 26. Oktober 2010 | Erklärte Ziele der Erzählgestaltung |
| [Supergiant: Bastion for iPad](https://www.supergiantgames.com/blog/out-now-bastion-for-ipad/) | 29. August 2012, später ergänzt | Historische Touch- und Angriffskonzeption |
| [The Ascent: offizielle Spielseite](https://theascent.krafton.com/en) | Produktseite | Welt, Kampf und räumliche Mechaniken |
| [Devolver Digital: RUINER](https://www.devolverdigital.com/games/ruiner) | Produktseite | Kampf, Geschichte und Audio; Text über Suchansicht geprüft |
| [Supergiant: Hades FAQ](https://www.supergiantgames.com/blog/hades-faq/) | Laufend ergänzte FAQ | Zusammenhang von Wiederholung, Handlung und Spielsystemen |
| [Supergiant: Hades](https://www.supergiantgames.com/games/hades/) | Produktseite | Offizielle Übersicht und weiterführendes Material |
| [Housemarque / PlayStation Blog: Alienation — Upgrade and Loot Systems](https://blog.playstation.com/?p=172669) | 13. April 2016 | Entwicklerbeschreibung der Belohnungs- und Waffenverbesserungssysteme |

Ergänzendes Anschauungsmaterial: [IGN — The First 16 Minutes of Darksiders
Genesis](https://www.youtube.com/watch?v=YQQAvfkAYK0). Der Link ist eine Empfehlung
für eine spätere Ablaufanalyse; hier wurden keine erfundenen Zeitmarken oder
angeblich selbst gespielten Szenen daraus abgeleitet.

### Projektinterne Grundlagen

- [Kompakter Levelplan und dokumentierter aktueller Stand](LEVEL_1_STONE_ADVENTURE.md).
- [Roadmap und Qualitätssicherung](MILESTONES_AND_QA.md).
- [Ursprüngliche Vision](../VISION.md) — langfristiger Hintergrund; aktuelle
  Nutzerentscheidungen und der Levelplan bestimmen den nächsten Umfang.
- [Auto-Arc, Sprint und mobile Ansicht](../qa/SPRINT_ARC_MOBILE_RESULT.md).
- [Boss-/Wächter-Abstimmung und historische Balancegrenze](../qa/BOSS_AND_GUARDS_RESULT.md).
- [Tore, Höhenangriffe, Steinkern und Beschuss-Aggro](../qa/ENCOUNTER_FIXES_RESULT.md).
- [Kostenlose Ausstattung und Vorher/Nachher](../qa/FREE_DECORATION_RESULT.md).
- [Hexwars-Kandidaten und Missionsideen](HEXWARS_ASSET_CANDIDATES.md).
- [Importierte Hexwars-Dateien, Animationen und Herkunft](../../public/assets/hexwars/README.md).
