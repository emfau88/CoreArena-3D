# Hexwars-Modellbestand

Am 29. Oktober 2026 auf Nutzerwunsch übernommen. Seit L1.6a (30. Oktober) lädt
das Adventure `hoverbot.glb` als beschädigte Startdrohne und `relay.glb` als
Missionsziel. Die übrigen Modelle bleiben unplatzierter Assetbestand.
Die GLBs und das Quellprojekt Hexwars bleiben unverändert.

Quelle: [emfau88/hexwars, codex/lane-wars](https://github.com/emfau88/hexwars/tree/777d4298569df9925915e5395968dffea83dd10f/experiments/hexfront-lane-wars),
festgehalten bei Commit `777d4298569df9925915e5395968dffea83dd10f`.

| Modell | Datei | Eingebettete Animationen |
| --- | --- | --- |
| Mech | [mech-animated/mech-rigged.glb](mech-animated/mech-rigged.glb) | Idle, Walk, Attack, Hit, Death |
| Vierbeinige Railgun | [railgun-animated/railgun.glb](railgun-animated/railgun.glb) | Idle, Walk, Charge, Attack, Hit, Death |
| Railgun, reduzierte Geometrie | [railgun-animated/railgun-lod.glb](railgun-animated/railgun-lod.glb) | Keine eigenen Clips; für die Gelenkanimation des Hauptmodells vorgesehen |
| Hover-Bot | [hoverbot.glb](hoverbot.glb) | Keine; Schweben/Neigen wurde im Quellspiel per Code erzeugt |
| HQ | [hq.glb](hq.glb) | Keine; Radar-Pivots für Bewegung per Code vorhanden |
| Fabrik | [factory-preview/factory.glb](factory-preview/factory.glb) | Door_Open |
| Drei Fabrikmodule | [Drohne](factory-preview/module-drone.glb), [Mech](factory-preview/module-mech.glb), [Railgun](factory-preview/module-rail.glb) | Keine; Dachmodule, keine zusätzlichen Fahrzeuge |
| Relais | [relay.glb](relay.glb) | Keine; Kern/Schüsseln für Bewegung per Code vorhanden |

Zehn GLBs, zusammen rund 16,5 MB. Texturen und Geometrie liegen jeweils in der GLB;
keine externen Texturdateien oder Downloads beim späteren Laden erforderlich.
Sechs bearbeitbare Blender-Quellen liegen unter [art/hexwars](../../../art/hexwars/README.md)
außerhalb des Web-Builds. Gesamtimport einschließlich Quellen und Dokumentation:
31.214.585 Bytes. Alle importierten Dateien sind bytegleich mit dem Quellcommit.

## Spätere Verwendung

Mech und Railgun verwenden starre mechanische Baugruppen, keine Hautverformung.
glTF: Y oben, Front −Z. `rig.json` und die ursprünglichen Manifeste bleiben
unverändert erhalten; ihre Quellpfade und historischen Statusangaben beziehen
sich auf Hexwars. Für CoreArena sind Maßstab, Collider, KI und Animationsereignisse
erst beim tatsächlichen Einbau abzustimmen. L1.6a verwendet nur die zwei statischen
Missionsmodelle mit eigenen CoreArena-Positionen, Maßstäben und Kollisionskörpern;
zusammen 5.824.268 zusätzliche Ladebytes, ausschließlich im Adventure.

## Herkunft und Prüfung

- [Herkunft und Nutzungsangaben](CREDITS.md)
- [Quelldateien, Commit, Größen und Git-Blob-Hashes](provenance.json)
- [Importprüfung mit SHA-256 und ausgelesenen GLB-Clips](../../../docs/assets/hexwars/import-check.json)
- [Archivierte Quellberichte](../../../docs/assets/hexwars/source/ASSET_LICENSES.md)

Geprüft: 25 Dateien gegen Git-Blob-Hashes und Größen, GLB-2-Header, eingebettete
Puffer/Texturen, Meshes und Animationskanäle/-dauer. Diese ursprüngliche Prüfung
betraf nur den Import. Die spätere Integration von Hover-Bot und Relais ist
im [L1.6a-Ergebnis](../../../docs/qa/ADVENTURE_MISSION_RESULT.md) dokumentiert.
