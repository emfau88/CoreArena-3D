# CORE ARENA 3D — Adventure-Produktvision

Stand: **2. November 2026**. Verbindliche strategische Richtung für Adventure.
Produktvision und Roadmap sind vom Nutzer grundsätzlich freigegeben; die Struktur
mit 26 Bulks und sechs Qualitätstoren bleibt erhalten. Die menschliche Abnahme
wird auf drei Spieltermine gebündelt. Am 2.11.2026 wurden zunächst A0.1/A0.2,
anschließend ausdrücklich **alle Bulks bis einschließlich A4** beauftragt.
Der Kernprototyp ist technisch umgesetzt und in T1 grundsätzlich akzeptiert (G1).
Anschließend wurde A5.1–A7.2 bis zum T2-Kandidaten freigegeben. Steinwächter,
reguläre Prototyp-Mission, begrenzter Pulse-Vergleich und Feedback-Feinschliff sind
technisch umgesetzt; menschliches T2/G2/G3 und die Produktentscheidung bleiben offen.
Den jeweiligen Umsetzungsstand führt die Roadmap.
Die [Adventure-Roadmap](ADVENTURE_ROADMAP.md) ist die einzige maßgebliche Quelle
für zukünftige Adventure-Arbeitspakete, Status, Abnahmen und Freigaben.

## 1. Produktversprechen und Grenzen

Ein kompaktes, stilisiertes **3D-Action-Adventure mit Boss-Rush-Schwerpunkt**:
Ein Ruinenkurier erkundet drei kleine Science-Fantasy-Orte und bezwingt deren
charaktervolle Wächter mit präziser Bewegung und einer ungewöhnlichen Energiewaffe.
Kurze Anreisen bereiten auf die Begegnungen vor; schnelle Wiederholungen erlauben,
an den Bossen besser zu werden. Der Spieler gewinnt durch Verständnis und Können.

Das wichtigste Versprechen: **Schon die Startausrüstung macht Spaß und reicht zum
Gewinnen.** Freischaltungen dürfen andere Spielweisen eröffnen, aber kein notwendiges
Aufholen von Schadens- oder Lebenswerten erzeugen. Eine überzeugende Waffe und drei
unterscheidbare Bosse sind wertvoller als ein großes Arsenal mit schwachen Varianten.

Arena/2v2/CTF/Liga ist ein eigenes Produkt im selben Repository. Seine
[Vision](../VISION.md) und [Roadmap](MOBILE_AND_WORK_PACKAGES.md#arena-to-do-liste)
werden durch dieses Dokument nicht geändert. Die
[Projektübersicht](MILESTONES_AND_QA.md#zwei-getrennte-spielvarianten) verbindet beide.

### Verbindlich, zu prüfen und aufgeschoben

| Verbindlicher Rahmen | Offene Designversuche | Bewusst außerhalb des ersten Releaseumfangs |
|---|---|---|
| Desktop zuerst, Browser bleibt Test- und Veröffentlichungsplattform | Dash statt Sprint; genaue Werte und Abbruchfenster | Online-Multiplayer, Accounts, Cloud-Backend |
| Direkte Bewegung, normaler Sprung, räumliche Kollision | Erhöhte orthografische oder moderate Perspektivkamera | Engine-Migration, allgemeines ECS-/Quest-/RPG-Framework |
| Verständliche, faire Bossangriffe und Gegenangriffe | Peitsche allein oder mit begrenzter Fernkampfoption | Offene Welt, prozedurale Maps, große Geschichte/Vertonung |
| Startausrüstung kann alle drei Bosse besiegen | Zwei alternative Waffenmodifikationen; Freischaltmodell | Inventarraster, Seltenheiten, Loot-Tabellen, Shops, Crafting |
| Bestehende Maps und funktionierende Missionssysteme weiterverwenden | Assistenzoptionen nach beobachteten Einstiegshürden | Endlose Stat-Progression, tägliche Pflichten, Ressourcen-Grind |
| Humor durch Verhalten und Animation, lesbare stilisierte Optik | Zusätzliche Waffe nur mit späterem eigenem Nutzenbeleg | Luftdash, Parieren oder Kombobäume als Pflicht |

Ein Versuch wird erst durch sein dokumentiertes Qualitätstor zur Produktentscheidung.
Die Namen und Grenzen der Gates stehen ausschließlich in der Roadmap. Eine
gestrichene optionale Idee verhindert den Release nicht.

## 2. Ausgangslage: belastbare Grundlage, noch kein neuer Kampfkern

Auditbasis: `main` auf `d4d377a3e3857eb5dfee410b336d605450dfcf96`, im Audit identisch
mit GitHub-`main`. Typprüfung und 69/69 Kerntests bestanden. Diese Zahlen sind ein
datierter Prüfstand, keine Zusage für spätere Commits. Es gab dabei keinen neuen
menschlichen Spieltest und keinen erneuten vollständigen Browser-Abnahmelauf.

| System | Wiederverwendung | Notwendige Ergänzung / Grenze |
|---|---|---|
| `src/core/simulation.ts`, `fixedClock.ts`, `src/physics/rapierWorld.ts` | 60-Hz-Takt, direkter Motor, Sprung, Stufenhilfe, räumliche Abfragen | Dash-Zustand; bisher keine Dash-Regeln oder gezielte Angriffskopplung |
| `src/core/combat.ts`, `aim.ts` | Schaden, Zielgeometrie, Deckungsprüfung, Pulse-Projektile | Arc wählt automatisch Ziele und verursacht Salvenschaden; echte Peitschenbahn fehlt |
| `src/render/camera.ts`, `src/input/desktopInput.ts` | Mausstrahl, bildschirmbezogene Bewegung, drei feste Ansichten | Kampf-Framing, Angriffsrichtung und Eingabezustände bewusst abstimmen |
| `src/core/pve.ts`, `bossNavigation.ts`, `src/render/monsterView.ts` | Bosszustände, Navigation, Warnungen, gerichtete Angriffe und Erholung | Nahkampfrhythmus; aktive Gegner sind Sensoren und blockieren den Spieler nicht |
| `src/core/adventureFight.ts`, `src/arena/adventureMission.ts` | Läufer, Konsole, Reserve, Checkpoint, Retry, Kern, Relais, Abschluss | Integration der neuen Regeln; kein allgemeiner Quest-Neubau |
| `src/render/kayFighter.ts`, `kayGuard.ts`, `src/app/stoneFeedback.ts` | Rig, vorhandene Clips, Trefferreaktionen, Audio-Infrastruktur | Eigene Peitschenpose und Kontaktklänge; Spieler verwendet bisher Schussanimationen |
| `src/arena/campaign.ts`, `src/app/pveGame.ts` | Drei bestehende Bosskarten mit eigenen Themen und Angriffsausprägungen | Frost/Glut sind kürzere PvE-Vorläufer, keine gleich weit ausgearbeiteten Adventure-Missionen |
| Zustandsverwaltung | Sitzungs-Checkpoint und definierte Neustarts | Kein bestehender dauerhafter Adventure-Kampagnensave; kleiner Adapter erst bei Bedarf |

Der [historische Levelplan](LEVEL_1_STONE_ADVENTURE.md) und die QA-Berichte bleiben
Nachweise. L1.6a–c und L1.5b sind technisch abgeschlossen; persönliche Spiel-/Geräteabnahme
ist weiterhin offen. Die frühere Shooter-Richtung und Mobile-Priorität gelten nicht
als Vorgabe für neue Adventure-Aufträge.

Im [L1.5b-Vergleich](../qa/L1_5B_RESULT.md#aktueller-bossvergleich) gewinnen aktive
Desktop-Eingaben nach 13,93 s mit Arc beziehungsweise 11,72 s mit Pulse. Das sind
automatisierte, präzise Versuche, keine menschliche Erfolgsquote. Der frühere
[Bossbericht](../qa/BOSS_PRESSURE_RESULT.md) erklärt Vorwarnungen und Messgrenzen.
Eine isolierte Physikprobe des Audits bestätigt zudem, dass der Spieler den aktiven
Boss-Sensor durchlaufen kann. Beides begründet neue Versuche, keine pauschale
Abwertung der vorhandenen Mission.

## 3. Bewegung, Kamera und Eingabe

### Bewegung als kontrollierbares Werkzeug

Der bestehende Motor setzt horizontale Geschwindigkeit unmittelbar. Das ist ein
brauchbarer Ausgangspunkt. Zusätzliche Beschleunigung darf nur eingeführt werden,
wenn Start/Stopp und Richtungswechsel damit im Vergleich besser kontrollierbar sind.
Trägheit zur bloßen Verschönerung der Laufanimation ist kein Ziel.

Erster Dash-Versuch: eine Ladung, etwa 3 m in ungefähr 0,15–0,20 s, anschließend
etwa 0,9–1,2 s Wiederaufladung. Das sind **Testwerte**, keine verabschiedete Balance.
Bewegungseingabe bestimmt die Richtung; im Stand gilt die letzte gültige Zielrichtung.
Ein Tastendruck löst einmal aus. Gehaltenes Shift erzeugt keine Dash-Kette.
Die Kamera darf die beim Start festgelegte Weltrichtung nicht nachträglich drehen.

Zunächst Bodendash ohne Unverwundbarkeit; normaler Sprung mit vorhandener Kurve.
Dash folgt Gelände und Kollision, hebt die Figur nicht über Sperren und verlängert
keinen Sprung durch ein Zurücksetzen der Schwerkraft. Körperkontakt mit dem Boss
erhält eine klar sichtbare, einfache Bodenform; Trefferhülle und Bewegungsblocker
bleiben getrennte Aufgaben. Kein automatischer Kontaktschaden. Einklemmen und
Bossbewegung gegen den Spieler müssen ausdrücklich geprüft werden.

Ergänzender Nutzerauftrag in T2: ein kürzerer zweiter Sprung im Adventure-Prototyp.
Er braucht einen neuen Tastendruck und ist genau einmal bis zur nächsten Landung
möglich. Der Bodenabsprung bleibt unverändert. Kein Schweben, Luftdash oder
Unverwundbarkeitsfenster; Deckenberührung und Pause laden den Luftsprung nicht auf.
Bossantworten, Plateaus und geschlossene Missionssperren werden damit erneut geprüft.

Bei der Peitsche zunächst freie normale Bewegung mit begrenzter Zielkorrektur im
Ausholen. Während eines aktiven Schlages bleibt die Richtung fest. Ein später
erlaubter Dash-Abbruch muss noch ausstehenden Schaden verwerfen. Kurze Eingabepuffer
sind nach Messung verlorener Eingaben möglich; lange Animationssperren und beliebige
Unterbrechbarkeit sind beide zu vermeiden. Reaktionszeit wird vom registrierten
Browser-Event bis zum Simulationsbeginn und sichtbaren Start getrennt erfasst.
Das ersetzt keine Hardware-Messung der gesamten Maus-/Displaylatenz.

### Kampfansicht

Erste Wahl für den Versuch: erhöhte feste Ansicht auf Basis der vorhandenen Kamera,
sanfte Einrahmung von Spieler und relevantem Boss, begrenzter Zoom und ruhige
Übergänge. Kein automatisches Umkreisen beim Dash. Prüfpunkte: Arenarand, Ecken,
Plateaus, Deckung, Nahdistanz und weit auseinanderstehende Figuren. Kritische
Warnflächen müssen im erkennbaren Gefahrenbereich bleiben; Kameraverkleinerung darf
den Spieler nicht unlesbar machen. Falls nötig gezieltes Verblassen verdeckender
Geometrie, bei unveränderter Kollision.

Aktuelle T2-Entscheidung des Nutzers: **durchgehend Links-nach-rechts**, auch in
der Bossarena. Die vorübergehende Geradeausansicht aus A1 wird ersetzt; die
Kameranachführung bleibt ruhig und dreht beim Boss nicht automatisch. Der Zoom
berücksichtigt die projizierte Höhe beider Figuren, damit der Wächter quer über
den Hof nicht hinter dem oberen HUD verschwindet.

Die Maus steuert eine Richtung in der Spielwelt. Höhenziel und zulässige Schlaghöhe
werden ausdrücklich definiert; ein verdeckter Gegner wird nicht automatisch
angewählt. Ein kleiner Richtungsindikator ist als Lernhilfe möglich. Erst bei
belegten Grenzen folgt ein einzelner Perspektivvergleich. Eine frei drehbare
Schulterkamera hätte zusätzliche Bedienungs-, Verdeckungs- und Kollisionskosten.

Maus/Tastatur sind der Abnahmemaßstab. Vorhandene Touch-Bedienung und Arena dürfen
nicht regressieren; eine hochwertige neue Touch-Kampfsteuerung ist keine Bedingung
für die Desktop-Validierung. Controller-Unterstützung bleibt eine getrennte
Entscheidung vor einer möglichen Desktop-Store-Version.

## 4. Waffenidentität und Nah-/Fernkampfentscheidung

### Energiepeitsche als erster Versuch

Ein bewusster Angriff hat Ausholen, Vorschwung, Rückschnappen und Erholung. Die
sichtbare Energie verbindet Hand, Kurve und Spitze. Schaden entsteht entlang der
zeitlich überstrichenen Bahn, einschließlich Bewegung des Spielers. Die Prüfung
berücksichtigt Höhe, Hindernisse und Ziele zwischen zwei Simulationstakten.
Pro Ziel und Schlagphase gibt es höchstens einen Treffer. Ein bloßer Sofortsektor
mit nachträglich abgespieltem Effekt erfüllt dieses Ziel nicht.

Eine kontrollierte Animation ist gegenüber einer physikalischen Schnur vorzuziehen:
Sie lässt sich lesbar, reproduzierbar und günstig berechnen. Kurvenpunkte und
Schlagphase speisen Simulation und Rendering; das Render-Skelett entscheidet nicht
über Schaden. Die vorhandenen Rapier-Abfragen werden gezielt ergänzt, falls ihre
bisherige Ersttreffer-Schnittstelle für mehrere Ziele nicht ausreicht.

Der Seitenschwung startet per Linksklick beide Bewegungen. Der Rücktreffer belohnt
gehaltenen Abstand und günstige Position. Er ist kein kostenlos garantierter Doppelschaden.
Als ausdrücklich beauftragte T2-Nacharbeit ergänzt Rechtsklick einen schmalen
Überkopf-Knall: etwas mehr Reichweite und ein stärkerer Einzeltreffer, dafür längeres
Ausholen und längere Erholung. Beide Bewegungen sind Teil der Startwaffe; keine
Freischaltung oder Vorwegnahme von A8. Ein Klick startet einen Angriff, Halten
wiederholt ihn nicht. Dash darf abbrechen, die Erholungszeit des Überkopfschlags
bleibt bestehen. Menschlich offen ist, ob beide Angriffe situativ gewählt werden.
Später könnte ein Rückhaken ein eigenes Timing eröffnen; dies gehört zur optionalen
Modifikationsprüfung. Wiederholtes Halten und einzelnes Klicken werden als Bedienungsfrage
verglichen, ohne ein neues automatisches Zielsuchen einzuführen.

Auf weiteren ausdrücklichen Nutzerwunsch startet eine Peitscheneingabe in der Luft
jetzt einen diagonalen Abwärtshieb, bereits aus dem normalen Sprung. Beide Tasten
wählen dort dieselbe Bewegung. Der kürzere Doppelsprung setzt laufende Angriffe
und Erholung nicht zurück. Zwei bewusst getimte Schläge sind möglich, sofern die
Erholung vor der Landung endet; kein automatischer Kombobaum oder Landungs-Flächenschaden.
Der gezielte Rückhaken bleibt ein späterer Designkandidat. Nutzen und Wahl zwischen
den drei Bewegungen werden im laufenden T2 geprüft. [Regeln und Nachweis](../qa/ADVENTURE_AIR_RESULT.md).

Feedback priorisiert Ursache: Bewegungsgeräusch, Kontakt, Rücktreffer, gegnerische
Reaktion. Sehr kurze Trefferpause oder Kamerareaktion nur als einzelner Vergleich;
globale Zeitlupe darf Warnzeiten und Eingabeauswertung nicht unbemerkt verändern.
Warnungen bleiben auch ohne Ton und ohne Farbunterscheidung verständlich.

### Fernkampf bleibt eine geprüfte Möglichkeit

Primär kurze bis mittlere Reichweite ist die Arbeitshypothese. Sie stärkt die
Beziehung zwischen Bossbewegung und Gegenangriff, erhöht aber Kamerarisiko und
Anforderungen an Reichweiten. Ein begrenzter Fernangriff könnte kurze Gelegenheiten
nutzbar machen und unterschiedliche Spielertypen ansprechen.

Nach dem ersten guten Boss wird die Peitsche allein gegen Peitsche plus **eine**
begrenzte Pulse-Variante verglichen. Bestehende Projektiltechnik bleibt erhalten;
kein zusätzlicher Waffenbaum. Munitions-/Erholungsbegrenzung und das Schadensbudget
werden vor dem Versuch festgehalten. Fernkampf muss eine taktische Aufgabe erfüllen,
ohne dauerhaftes Rückwärtslaufen zum besten Weg zu machen. Ergibt sich kein klarer
Nutzen, entfällt er aus dem neuen Kern. Die alte Variante behält ihre Waffen.

Ein Energieschwert wäre leicht verständlich, aber zunächst weniger charakteristisch.
Eine Hybridwaffe bringt weitere Zustands- und Balancekombinationen. Beide bleiben
Ideen für einen gesonderten späteren Auftrag; keine vollständige Waffenliste.

## 5. Bossdesign und Schwierigkeitsverständnis

Jeder Angriff beschreibt Vorwarnung, Richtungsbindung, räumliche Gefahrenform,
aktive Dauer, Gegenreaktion und Erholung. Modellpose, Warnung und Schadenszeit müssen
zusammenpassen. Treffer außerhalb erkennbarer Gefahren sind Fehler. Telegraphen
dürfen den Spieler bis zu einem klaren Bindepunkt verfolgen, danach nicht heimlich
nachziehen. Reaktionsmöglichkeiten werden nach realer Annäherungszeit bewertet.

Der Steinwächter nutzt seine vorhandenen Angriffe: Faust → seitlich bewegen/dashen;
Welle → springen oder vorhandene wirksame Deckung; Ausbruch → markierten Ort verlassen.
Kombinationen brauchen einen sichtbaren Übergang und mindestens eine ausführbare
Antwort. Eine HP-Schwelle allein rechtfertigt keine zweite Phase mit neuen Regeln.

Der Spieler läuft heute mit 7,2 m/s, der Adventure-Boss mit 3,1 m/s. Peitschenreichweite,
Bosskörper, Verfolgung und Angriffsschritt werden deshalb gemeinsam geprüft.
Ein angekündigter Ausfallschritt ist ein Kandidat bei nachgewiesener Distanzdominanz;
pauschales Beschleunigen oder immer nachführende Treffer sind schlechte Abkürzungen.
Plateau-Ausbrüche bleiben ein vorhandener Schutz gegen sichere Höhenpositionen.

45–90 Sekunden sind eine Untersuchungsspanne für geübte erfolgreiche Steinversuche,
kein Siegkriterium. Zuerst zählen mehrere interessante Angriffswechsel. Danach
werden Schaden und HP angepasst. Kein Strecken durch lange Unverwundbarkeit,
Zwangswartezeiten oder hohe HP. Für neue Spieler sind verständliche Niederlagen,
spürbarer Lernfortschritt und ein schneller Retry wichtiger als eine starre Quote.

## 6. Mini-Kampagne: drei Orte mit eigener spielerischer Aufgabe

Der Standardablauf bleibt linear: kurze Anreise → wenige vorbereitende Begegnungen
und optionale Erkundung → Checkpoint → Boss → klarer Abschluss → nächste Map.
Boss-Retry überspringt die bereits gelöste Anreise. Nach einem Sieg wird ein direkter
Übungszugang für diesen Boss vorgesehen. Ein zusätzlicher Drei-Boss-Durchlauf ist
später nur eine Zusammenstellung derselben Begegnungen, kein zweites Regelsystem.

| Map / Lernziel | Bestehende Basis | Geplanter Schwerpunkt und kleiner Ausbau | Grenze |
|---|---|---|---|
| **Der verwitterte Hof — Abstand und Zeitpunkt** | Drei Höfe, zwei Läufer, Konsole/Reserve, Steinwächter, Kern/Relais | Bewegungsgrundlagen über die bestehende Anreise; Läufer lehren gerichteten Schlag; Boss kombiniert Ausweichen, Sprung und Ortswechsel | Keine neuen Räume oder zusätzlichen Gegnertypen für den Referenzkern |
| **Kristallkluft — Winkel und Seitenwechsel** | Eisrücken, erhöhte Vorräte, Frostspinne mit Splitterfächer und Kreisen | Deckungsseiten wechseln; schmaler gerichteter Fächer, angekündigtes Umpositionieren der Spinne, seitliche Gegenangriffe; ein kurzer optionaler Weg und höchstens ein neuer kleiner Gegner-Typ | Kein rutschiger Motor als Zwang, keine neue Kletterfähigkeit; maximal 2–3 kleine Begegnungen |
| **Glutschmiede — Raum lesen und Angriffe verbinden** | Öfen/Deckung, Plateaus, Glutwurm mit Feuerfächer und Ausbrüchen | Feuerlinie durch seitliches Ausweichen/Deckung lösen; zeitweise ein klar markierter gefährlicher Bereich; bekannte Reaktionen in lesbarer Folge verbinden; kurzer Anlagenabschluss | Keine flächendeckenden Dauergefahren, kein zusätzlicher Miniboss; zunächst vorhandene kleine Gegner wiederverwenden |

Die Frostspinne soll durch Winkel und Bewegung, der Glutwurm durch Raumkontrolle
unterscheidbar sein. Andere Farben, HP und Geschwindigkeiten reichen nicht.
Der einzige optionale neue kleine Gegner würde in der Kluft einen langsamen,
gerichteten Splitterangriff lehren. Zunächst mit vorhandener Darstellung und
Kollisionsbasis testen. Wenn der Lernnutzen fehlt, Anreise vereinfachen und Typ streichen.

Die drei vorhandenen Grundrisse bleiben Ausgangspunkt. Umbauten beschränken sich
auf nachgewiesene Sicht-/Kollisions-/Wegeprobleme und eine kleine funktionale
Interaktion je späterer Map. Konsolenketten werden nicht dreimal identisch kopiert.
Erkundung belohnt Atmosphäre, einen verständlichen Vorrat oder eine Abkürzung;
ein Suchschlüssel darf Bosswiederholungen nicht erneut verzögern.

Als erste Planungsannahme etwa 2–4 Minuten Anreise pro Map bei bekanntem Weg;
Erstspielzeit und Gesamtdauer werden erst an menschlichen Läufen gemessen.
Eine kurze Kampagne wird ehrlich als kompakt kommuniziert. Wiederholungen und
Übungszeit werden nicht als verpflichtender Inhaltsumfang verkauft.

## 7. Fortschritt ohne Grind

**Empfohlene Reihenfolge:** Können → neue Begegnungen → optional neue Spielweisen.
Kein Ressourcenmodell einführen, bevor eine konkrete, durch Tests belegte Entscheidung
dadurch besser wird. Grundausrüstung und unveränderte Basiswerte bleiben Referenz.

| Modell | Nutzen | Risiko / Entscheidung |
|---|---|---|
| Keine Waffenprogression, nur neue Maps und Bossübung | Kleinster Umfang, klare Lernkurve | Verbindlicher Vergleichsmaßstab; vollständiger Release damit möglich |
| Deterministische Freischaltung nach einmaligem Meilenstein | Verlässlicher Fortschritt, keine Farm-Schleife | Bevorzugter Kandidat: Rückhaken nach Boss 1, Gabelspitze nach Boss 2; frei abwählbar |
| Auswahl pro Versuch aus bereits zugänglichen Varianten | Unterschiedliche Taktik ohne Inventar | Ein Slot; höchstens zwei Alternativen neben der Basis; keine stapelbaren Kombinationen |
| Zufällige Angebote während der Mission | Überraschung | Zunächst zurückstellen: verfälscht Bosslernen und erzeugt Auswahl-/Balanceaufwand |
| Ressourcen für permanente Zahlensteigerung | Einfaches Belohnungssignal | Für den geplanten Kern verwerfen: Grind- und Balancegefahr ohne neue Handlung |

Im ersten Modifikationstest sind beide Varianten sofort verfügbar. So wird ihr
Spielwert unabhängig vom Freischaltreiz geprüft. Rückhaken verändert beispielsweise
Rücklaufbindung und Timing; Gabelspitze tauscht konzentrierten Treffer gegen seitliche
Abdeckung. Keine Variante darf zugleich sicherer, stärker und vielseitiger sein.
Freischaltungen bei Tod behalten, Üben kostet nichts. Zwischen Versuchen wechseln,
nicht während einer laufenden Attacke. Alle drei Bosse werden mit Basiswaffe geprüft.

A8 untersucht zwei getrennte Fragen: **Verändert eine Modifikation tatsächlich
Timing, Abstand, Risiko oder Zielwahl?** Und **motiviert diese Veränderung zu weiteren
freiwilligen Versuchen?** Gleicher Boss/Startzustand, wechselnde Reihenfolge und
sofort verfügbare Varianten trennen Spielwert vom Freischaltreiz. Nach den vorgegebenen
Versuchen gibt es ein freiwilliges Zusatzfenster ohne neue Belohnung. Gewählte
Variante, zusätzliche Versuche und genannter Grund werden erfasst; kein Bonus allein
für eine kürzere Kampfzeit. Wiederholungswunsch und beobachtetes Wiederholen werden
getrennt berichtet. Die menschliche Bewertung findet im dritten Spieltermin statt.
Die Entscheidung für ein Progressionssystem bleibt bis zu positivem G4-Urteil und
gesonderter Umsetzungsfreigabe offen; die Kampagne kann ohne Progression erscheinen.

Ein kleiner lokaler Kampagnensave kann später abgeschlossene Maps, freigegebene
Übungsbosse und gegebenenfalls Modifikationen speichern. Kein Inventar oder
In-Kampf-Snapshot. Die Speicherung ist von der optionalen Waffenprogression getrennt:
Auch ohne Modifikationen soll ein veröffentlichter Dreikartenlauf fortsetzbar sein.

## 8. Optik, Ton und Charakter

Stilisierter Science-Fantasy-Look bleibt: verwitterte Anlagen, Energie, Natur und
eigenwillige Wächter. Lesbare Silhouette, Antizipation, Gewicht und Trefferreaktion
haben Vorrang vor Modellkomplexität und Partikelmenge. Pro Boss eine kleine
Verhaltensidee, etwa ein schwerfälliges Wiederaufrichten oder neugieriges Taxieren;
keine lange Gag-Sequenz beim wiederholten Retry.

Feindliche Warnungen erhalten Form, Bewegung und Klang. Waffenglanz darf sie nicht
überdecken. Musik und Atmosphäre sollen den Rhythmus unterstützen; eine aufwendige
adaptive Musikarchitektur ist kein Pflichtfeature. Vorhandene Synthese eignet sich
für frühe Tests, eine spätere Klangqualitätsrunde bleibt klar begrenzt.

### Verbindliche Qualitätskriterien für die Bossdarstellung

Die folgenden Kriterien gehören zur Abnahme jedes Bosses innerhalb seiner
bestehenden Bulks. Sie werden mit vorhandenen Modellen, Clips, prozeduralen
Bewegungen und der vorhandenen Audio-Infrastruktur bearbeitet. Kein zusätzlicher
Grafik-Bulk und keine neue Assetproduktion sind dafür eingeplant.

| Kriterium | Verbindliches sicht-/hörbares Ergebnis |
|---|---|
| **Animationstiming** | Ausholen, aktive Attacke und Erholung sind getrennt erkennbar. Kontaktpose und sichtbare Gefahrenform stimmen mit dem Schadensfenster überein, auch bei 30/60/144 Hz; kein Schaden vor der angekündigten aktiven Phase und kein Nachdrehen nach Richtungsbindung. |
| **Charakteristische Bewegung** | Jeder Boss besitzt mindestens eine im Kampf wiedererkennbare Bewegungsphrase: etwa Gewichtsverlagerung/Wiederaufrichten beim Steinwächter, Beinstellen/Seitenwechsel bei der Frostspinne, Körperwelle/Atemvorbereitung beim Glutwurm. Keine bloßen Tempo-/Farbvarianten; die Bewegung unterstützt die jeweilige Gefahr. |
| **Gewicht der Attacken** | Vorbereitung, beschleunigte Ausführung und Abfangen/Erholung vermitteln Masse. Füße beziehungsweise Körperauflage bleiben nachvollziehbar; kein unbeabsichtigtes Gleiten oder Durchschlagen durch Gelände. Kamerawackeln und Partikel ersetzen diese Bewegung nicht. |
| **Trefferreaktion** | Erfolgreicher Kontakt löst eine kurze örtlich zuordenbare Körper-/Kernreaktion aus, ein Fehlschlag nicht. Reaktion und Sound unterscheiden Treffer vom eigenen Bossangriff; sie verdecken keine Warnung und verändern ohne ausdrückliche Regelentscheidung weder Angriffstiming noch Betäubung. |
| **Silhouette** | Boss, Angriffsglied und Spieler bleiben in der normalen Kampfansicht auch nahe Deckung und am Arenarand unterscheidbar. Blick-/Angriffsrichtung ist ohne HUD-Text erkennbar; Warnflächen bleiben vor Boden und Effekten lesbar. |
| **Sound** | Warnung, Ausführung und empfangener Treffer haben unterscheidbare Signale, ausgelöst aus den passenden Simulationsereignissen. Gegnerwarnungen setzen sich gegen die Peitsche durch; keine überlagernden Dauerschleifen nach Retry/Pause. Stumm bleibt die Gefahr verständlich. |
| **Optische Konsistenz** | Formensprache, Materialien, Licht und Effektdichte passen zur stilisierten Welt. Modell, Bodenbezug, Warnfläche und Kollisions-/Trefferhülle vermitteln dieselbe Reichweite; kein sichtbarer Sprung zwischen Warnpose und Wirkung. Humor darf eine gefährliche Attacke nicht unlesbar machen. |

Nachweis je Boss: kurze Sequenzen aus normaler Spielkamera für Ausholen → Attacke →
Erholung und einen erhaltenen Treffer, dazu Rand-/Deckungssituation und ein stummer
Versuch. Tick-/Trefferdiagnose ergänzt die Sichtprüfung; ein Screenshot oder grüner
Test allein genügt nicht. Der Steinwächter wird in G2 beim zweiten Spieltermin,
Frostspinne und Glutwurm gemeinsam mit G5/G6 beim dritten menschlich beurteilt.
Technische und visuelle Vorprüfungen übernimmt der Agent in A5, A9.1 und A10.1.
Mängel führen zu gezielter Nacharbeit im betroffenen Boss-Bulk.

## 9. Kritische Produkt- und Markteinschätzung

**Chancen als Designhypothesen:** Peitsche plus sympathische, gefährliche Wächter
liefert ein schnell erklärbares Bild. Kurze Versuche und Browserzugang reduzieren
die Hürde zum Ausprobieren. Die vorhandene Mission schafft einen Ort und kleine
Atempausen zwischen anspruchsvollen Kämpfen.

**Risiken:** Bosszentrierte Spiele stellen hohe Ansprüche an Fairness und Animation;
wenig Inhalt macht schwache Begegnungen besonders sichtbar. Drei Bosse allein
belegen weder kommerziellen Umfang noch Nachfrage. Eine Peitsche mit großem Radius
könnte die Positionsaufgabe entwerten. Ein enger Nahkampf kann an Kamera und
Körperkontakt scheitern. Ein Roguelite-Versprechen würde Zufall, Vielfalt und
Wiederholungsumfang erwarten lassen, die aktuell nicht vorhanden sind.

Die Inspirationsrichtungen werden gezielt eingegrenzt:

| Quelle | Belegte Einordnung | Eigene Ableitung für CORE ARENA |
|---|---|---|
| [Furi, Entwickler-Storeseite](https://store.steampowered.com/app/423230/Furi/) | Schneller Schwertkampf und Dual-Stick-Schießen | Bossrhythmus und präzise Reaktion untersuchen; Nah-/Fernkampf nicht dogmatisch ausschließen |
| [Hades, Supergiant](https://www.supergiantgames.com/games/hades/) | Roguelike-Dungeoncrawler mit Actionkämpfen | Wiederholung als Lern- und Stilversuch; dessen Umfang und Erzähl-/Progressionssysteme nicht voraussetzen |
| [Shadow Warrior 2, Publisher-Storeseite](https://store.steampowered.com/app/324800/Shadow_Warrior_2/) | Mischung aus Schusswaffen, Klingen, Magie und Humor | Ungewöhnliche Waffengefühle und dynamische Übergänge; FPS-, Loot- und Gewaltästhetik nicht übernehmen |

Quellen geprüft am 2.11.2026; keine eigene Vergleichs-Spielsession behauptet.
Diese Quellen belegen Vorbilder, keine Marktgröße, Absatzprognose oder Zahlungsbereitschaft.
Für die eigene Attraktivität zählen externe erste Eindrücke: Können Außenstehende
nach kurzem Spiel die besondere Waffe und einen Boss beschreiben? Wollen sie
freiwillig einen zweiten Versuch oder einen weiteren Boss spielen? Kaufinteresse
wird getrennt vom Spaß an einer kostenlosen Browserprobe erfragt.

**Empfehlung:** Zuerst eine ehrlich bezeichnete Browser-Testfassung der ersten
Mission nach dem positiven Richtungsentscheid; eine öffentliche Fassung benötigt
einen eigenen Auftrag. Danach ein kleiner Dreikarten-Browserrelease. Bestehendes
GitHub Pages bleibt technischer Kanal; [itch.io unterstützt HTML5-Spiele](https://itch.io/docs/creators/html5)
und ist ein sinnvoller Kandidat für Veröffentlichung und Feedback. Keine Plattform
wird allein durch diese Planung bespielt. Steam bleibt eine spätere Entscheidung
nach Nachfrage-, Umfangs-, Controller- und Verpackungsprüfung; es besitzt einen
eigenen [Steam-Direct-Prozess](https://partner.steamgames.com/doc/gettingstarted/appfee).
Keine Preis- oder Umsatzplanung ohne dafür geeignete Evidenz.

## 10. Realistischer Releaseumfang und Kürzungsreihenfolge

Planungsziel: drei unterscheidbare Bosse in drei kurzen Missionen, eine ausgereifte
Hauptwaffe, Dash/Sprung nach positivem Vergleich, funktionierende Retry-/Fortsetzen-
Wege, Übungszugang, verständliche Bedienung, belastbare Browserleistung und geklärte
Assetherkunft. Maximal zwei Modifikationen und eine begrenzte Fernkampfoption nur
bei positivem Nutzennachweis. Keine Zusage einer zusätzlichen Hauptwaffe.

Bei Aufwand oder schwachem Nutzen zuerst streichen: Ressourcenökonomie/Zufall,
zusätzliche Waffen, optionale Modifikationen, zusätzlicher kleiner Gegnertyp,
zusätzliche Dekoration. Nicht kürzen: Trefferfairness, Lesbarkeit, Körperkontakt,
Retry-Zuverlässigkeit und menschliche Abnahme. Bei noch nicht tragfähigen drei
Missionen eine sauber benannte Einmissions-Demo freigeben lassen, keinen unfertigen
Dreikartenrelease als abgeschlossen deklarieren.

Offene Entscheidungen und ihr spätester Klärpunkt:

| Entscheidung | Klärung |
|---|---|
| Kamera, Dash-Werte, Abbruchfenster, eventuelle kurze Unverwundbarkeit | A1–A4 / Gate 1 |
| Peitsche allein oder begrenzter Fernkampf | A7.1–A7.2 |
| Modifikationen und Freischaltung oder bewusster Verzicht | A8.1–A8.2 / Gate 4 |
| Zielhardware, Performance- und Ladebudgets | Baseline in A0.2; Releaseprüfung A11.2 |
| Zusätzlicher kleiner Gegner in Map 2 | A9.2 nach Frost-Bosstest |
| Browserkanal, Umfang, Sprache; gegebenenfalls Controller/Steam | A11.3, vor öffentlicher Zusage |

Die technische Integration, Testmatrizen und sechs verbindlichen Qualitätstore
stehen in der [Roadmap](ADVENTURE_ROADMAP.md). Sie verhindern, dass offene Kandidaten
still zu Pflichtfeatures oder bestandene technische Tests zu Spielspaßbelegen werden.

## Technischer Kandidat für T2 — 2. November 2026

Der aktuelle Steinwächter-Prototyp verwendet einen angekündigten, begrenzten
Angriffsschritt, einen hohen Faustschwung und die vorhandenen Wellen/Ausbrüche.
Sein geschlossener Kern nimmt wenig Schaden; in der sichtbaren Erholung wird er
voll verwundbar. Diese experimentelle Abstimmung ist in T2 auf Lesbarkeit und
Spielfluss zu prüfen und keine Vorentscheidung für spätere Bosse.

Erhöhte Plattformen schützen vor der Bodenwelle. Der Ausbruch markiert dagegen
die tatsächlich gewählte Oberfläche und kann die Plattform treffen; ein hoher
Faustschwung bleibt nur bei passender Reichweite/Höhe und freier Sicht gefährlich.
Der ergänzend beauftragte Doppelsprung und Spieler-Lufthieb sind enthalten.
Charge oder Sprungangriff des Bosses bleiben Optionen für eine konkret nachgewiesene
Lücke, kein automatisch geplanter Ausbau. Die Touch-Bedienung bietet auch Dash,
Überkopf-Knall und Luftsprung; eine echte Smartphone-Abnahme steht noch aus.
[Umfang, Grenzen und T2-Ablauf](../qa/ADVENTURE_A5_A7_RESULT.md).
