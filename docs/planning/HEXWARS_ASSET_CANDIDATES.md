# Hexwars-Assets für die Kampagne

Stand 29. Oktober 2026. **Assetimport anschließend freigegeben und erledigt:**
animierter Mech, animierte Railgun mit LOD, Hover-Bot, HQ, Fabrik mit drei Modulen
und Relais liegen nun in `public/assets/hexwars/`; sechs Blender-Quellen in
`art/hexwars/`. [Bestand, Animationen und Herkunft](../../public/assets/hexwars/README.md).
25 Quelldateien bytegleich übernommen und geprüft. Der Produktionsbuild besteht;
die Modelle sind noch nicht im Level platziert. Die folgenden Missionsideen
bleiben Vorschläge. Das erste Stein-Testlevel bleibt das aktuelle Produktziel.

## Richtiger Referenzstand

Die neueren animierten Modelle liegen im Branch **`codex/lane-wars`**, geprüft
bei Commit `777d4298569df9925915e5395968dffea83dd10f` des
[Hexwars-Repositories](https://github.com/emfau88/hexwars/tree/codex/lane-wars).
Die ältere Datei `mech.glb` in `main` ist starr; sie darf nicht mit der neuen
Version verwechselt werden. Die zwei animierten GLBs wurden direkt heruntergeladen
und ihre JSON-Animationsdaten ausgelesen. Modellbilder und Herkunftsdokumente
wurden ebenfalls geprüft; kein neuer Laufzeittest in CORE ARENA behauptet.

Alle folgenden Pfade beginnen mit `experiments/hexfront-lane-wars/`:

| Kandidat | Tatsächlicher Bestand | Mögliche Rolle |
|---|---|---|
| Mech | `public/models/mech-animated/mech-rigged.glb`, 3,44 MB, 13 Meshes; Idle, Walk, Attack, Hit, Death | Schwerer Patrouillengegner oder Mini-Boss |
| Vierbeinige Railgun | `public/models/railgun-animated/railgun.glb`, 2,02 MB, 16 Meshes; Idle, Walk, Charge, Attack, Hit, Death; zusätzliche LOD-Datei | Fernkämpfer mit angekündigtem, ausweichbarem Schuss |
| Hover-Bot | `public/models/hoverbot.glb`; vorhandene Schwebe-/Neigebewegung über Code | Späher, kleiner Gegner oder Begleiter |
| HQ und Fabrik | `public/models/hq.glb`, `public/models/factory-preview/factory.glb` mit separaten Modulen | Verlassener Außenposten, Missionsziel, aktivierbare Anlage |
| Relais | Im älteren 3D-Experiment: `experiments/hexfront-3d/public/assets/supplied/relay.glb` | Energiestation, Türsteuerung oder kurzer Verteidigungsauftrag |

Bearbeitbare Quellen liegen unter `art/mech-animation/mech-rig.blend` und
`art/railgun-animation/railgun-animated.blend`. Die Animationen bewegen starre
mechanische Baugruppen. Der vorhandene Animationscode kann als Referenz dienen;
KI, Höhenbehandlung, Trefferkörper, Mündungsrichtung und Angriffszeitpunkte müssen
an unser Shooter-Spiel angebunden werden. Ein neues Rig ist dafür nicht nötig.

Quellen: [Mech-Bericht](https://github.com/emfau88/hexwars/blob/codex/lane-wars/experiments/hexfront-lane-wars/docs/mech-animation/REPORT.md),
[Railgun-Bericht](https://github.com/emfau88/hexwars/blob/codex/lane-wars/experiments/hexfront-lane-wars/docs/railgun-animation/REPORT.md).
Die älteren gelieferten GLBs sind laut Herkunftsdokumentation nutzerseitig erzeugte
Assets ohne separate CC0-Freigabe; diese Herkunft und die ursprünglichen
Generierungsbedingungen bei einer Übernahme erhalten.

## Gestalterischer Vorschlag

Überwucherte Ruinen einer früheren Energietechnik verbinden Steinwächter,
Energiewaffen und Maschinen. Modelle dafür gezielt umfärben und verwittern;
freundliche Technik und Gegner durch Silhouette/Lichtfarbe unterscheiden.

Kleinster sinnvoller Ausbau: eine stillgelegte Relaisstation nahe dem
Levelausgang. Der Steinkern des Bosses aktiviert sie und liefert einen kurzen
Hinweis auf die nächste Mission. Ein späterer Außenposten kann Drohnen und
einen einzelnen Mech einführen; die Railgun erweitert danach das Ausweichspiel.
Dies sind Vorschläge, keine zusätzlichen Pflichtpunkte für die L1-Abnahme.

## Weitere passende Quellen

**Nachtrag 29. Oktober:** Die folgenden großen Standardpakete wurden vom Nutzer
als zu verbreitet zurückgewiesen. Für die erste zusätzliche Ausstattung sind
stattdessen die kostenlosen Beispiele von AssetQuest Forest Kit und FlakDeau
Retro Tech freigegeben und eingebaut. Keine kostenpflichtigen Assets kaufen.
[Umfang, Lizenzen und Vergleichsbilder](../qa/FREE_DECORATION_RESULT.md).
Die folgende Liste bleibt nur als historische Recherche erhalten.

- [KayKit Dungeon Pack](https://kaylousberg.itch.io/kaykit-dungeon-pack):
  modulare Ruinenteile, Türen, Treppen und Ausstattung; CC0, kostenloser Grundumfang.
- [KayKit Forest Nature](https://kaylousberg.itch.io/kaykit-forest):
  Bäume, Büsche, Felsen und Gras; CC0, kostenloser Grundumfang.
- [Quaternius Ultimate Space Kit](https://quaternius.com/packs/ultimatespacekit.html):
  92 Modelle einschließlich animierter Figuren/Gegner und Umgebung; CC0, glTF vorhanden.
- [Kenney Space Kit](https://kenney.nl/assets/space-kit):
  150 Modelle für Raumfahrtarchitektur und Requisiten; CC0.

Für erste zusätzliche Technikgegner bevorzugt den vorhandenen Hexwars-Bestand
verwenden. Externe Pakete gezielt für fehlende Ausstattung ergänzen, mit
angepassten Materialien und Maßstäben in der tatsächlichen Spielkamera prüfen.
