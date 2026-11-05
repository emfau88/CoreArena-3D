# Assets im Umgebungstest

Der isolierte Versuch ergänzt projektintern erzeugte Geometrie für Fundamente,
Stützwände, Versorgungsträger, Lüfter, Verkleidungen und Ausstattungsteile.
Platzierung, Materialkombinationen und das Bodenlayout wurden für Core Arena erstellt.
Es wurden keine Dateien oder Quelltextteile aus 10GAG übernommen.

Die neue Boden-Canvas kombiniert eigene Ladefelder und Fugen mit einer gedämpften
Darstellung des bereits vorhandenen **Poly Haven Rock Tile Floor**. Sie entsteht
zur Laufzeit; die Quelldatei bleibt unverändert. Wand- und Abdeckungstexturen sind
die vorhandenen **Stone Wall 02** und **Rock Tile Floor**, ebenso deren Normalmaps.
Quellen, Autoren und CC0-Nachweis: [Courtyard-Credits](../../../public/assets/courtyard/CREDITS.md).

Zusätzliche Brombeergruppen im tieferliegenden Außenhof verwenden Instanzen des
bereits geladenen **AssetQuest Blackberry Bush 1b**. Quelle und CC0-Demolizenz:
[AssetQuest-Credits](../../../public/assets/assetquest/CREDITS.md).

Keine neuen externen Modelle, Bilddateien, Audiodateien, Fonts oder Laufzeitdienste.
Bestehende Konsolen, Drohnen, Vegetation und Figuren behalten ihre jeweiligen
Herkunftsnachweise.

Variante C nutzt den Originalhof. Der abgesenkte Außenraum besteht aus eigens
gebauten Steinbögen, Terrassen und Bruchstücken. Die Oberflächen verwenden Rock
Tile Floor und Stone Wall 02 mit ihren Normal- und Rauheitstexturen. Moosfelsen
und Farne sind Instanzen der bereits geladenen Poly-Haven-Modelle Rock Moss Set
01 und Fern 02. Die Quellen stehen in den oben verlinkten Courtyard-Credits.

In Variante D bestehen Böschung und Geröllrinne aus eigener Geometrie.
Die Felsgruppen verwenden zwei Bodenscans aus dem Poly Haven Rock Moss Set 01.
Für den Untergrund wurde mit dem integrierten ImageGen eine
diffuse Bodenaufnahme aus Schiefer, Kies und olivfarbenem Moos erzeugt und als
`shale-ground.webp` für den Browser exportiert. Farn und Mauerwerk verwenden
die oben aufgeführten Hof-Assets.

<details>
<summary>ImageGen-Prompt für die Schiefertextur</summary>

ONE seamless tileable PBR albedo / base color material for ground in a real-time textured 3D game, orthographic straight down close scan covering a 3 x 3 metre patch of a weathered exposed rocky earthen slope by a ruined grey fieldstone courtyard. Square 1:1, edge-to-edge. Tightly packed slate-grey and neutral warm-grey crumbling bedrock fragments mixed into silvery fine crushed gravel and dry olive-brown loam, irregular narrow jagged horizontal strata in a few localized patches wearing away into fines, a few small subtle patches of subdued olive lichen and dried moss in crevices. Natural, fine scale, primarily grey stone aggregate, about 10% quiet desaturated olive moss. Moderate values around mid grey, broad light balanced and neutral in all directions, flat-lit, photogrammetric diffuse albedo, surface appears finely stratified and granular. Uniform texel density to borders. No individual large or prominent boulders, no roads, no paving, no edges or horizon, no man made shapes, no brush stroke, no foliage silhouettes, no obvious directional lighting or shadows, no borders, no text, no markings. Clear variation from medium sized flakes and fine grit but low-frequency variation very restrained so the tile repeats without obvious patterns.

</details>

In F bilden modellierte Felswände, eine zerklüftete Sohle und eingelagerte
Bernsteinadern die Wächterklamm um die drei Höfe. Der gehörnte Steinkopf,
die versteinerte Hand und die gebrochenen Felsspitzen wurden für diesen Versuch aus Geometrie gebaut.
Die Felsflächen verwenden dieselbe Schiefertextur wie D. Moosfelsen und Farne
stammen aus den oben genannten Modellen des Hofs.
