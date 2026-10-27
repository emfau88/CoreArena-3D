# Prompts — Level 1: Der verwitterte Hof

Modus: eingebautes image_gen, keine CLI/API-Fallbacks. Datum: 27. Oktober 2026.

Die lokale Skizze wurde deterministisch als SVG erstellt und mit Chromium gerendert.
Das Mockup ist ein generiertes Planungsbild, kein Screenshot einer implementierten Map.

## Referenzen

- `../../qa/plateau-walls/stone-platform-isometric.png`: tatsächliche aktuelle Spieloptik.
- `map-sketch.png`: genaue geplante Raumfolge und Belegung.

## Erste Generierung

```text
Use case: stylized-concept.
Asset: realistic-to-current-production game layout mockup for CORE ARENA Level 1, "Der verwitterte Hof". This is an honest screenshot-like mockup of a small browser WebGL game, not ambitious concept art.

Reference image 1: ACTUAL CURRENT GAME SCREENSHOT. This is the strict rendering quality and geometry limit. Match its plain olive grid-tiled floor, pale beige rectangular extruded platforms and solid vertical sidewalls with a few simple drawn brick seams, sparse green angular 3-6 polygon plants, simple faceted rock characters, modest directional shadow, flat materials and neutral lighting. Copy the player scale, small pickups on dark discs, limited low-poly construction aesthetic. Do not upgrade the assets. No detailed realistic textures, no carved fantasy ornament, no picturesque giant fortress, no cliffs, no fog shafts, no volumetric light, no cinematic sky, no lush vegetation, no painterly aesthetic, no high-poly figures. Geometry should look straightforward to build with cuboids and low-poly rocks in Three.js, at about exactly the reference screenshot's modest fidelity.

Reference image 2: EXACT PLANNED MAP SCHEMATIC, layout reference only. The left-hand map shows the footprint of connected rooms. Rebuild this as simple 3D playable geometry in the reference screenshot style. Do not reproduce its right text sidebar or graph arrows.

Composition: one clear near-orthographic high-angle view of the ENTIRE planned small 44x48-metre level, north at top/back, south at bottom/front, slight oblique angle so substantial vertical plateau walls and stairs are clearly visible. Similar to a zoomed-out in-engine editor overview; this overview is a planning camera rather than normal gameplay framing. Room footprints and pathways must be visibly connected exactly as schematic. Fill image with the map, not with big surrounding scenery. Muted dark teal empty outside the map; playable areas have the same olive square tiles as screenshot. Thin pale walls define sides without blocking our view. One contiguous low flat foundation, no floating islands. The start bends LEFT into the first passage then proceeds north, then right through the central court, then north to boss. Keep ground level outside raised terraces visually distinct.

Planned layout following image2 from bottom to top:
A: safe southern small forecourt, a single small teal-and-white player holding Arc Lash, no enemies.
B: just northwest of A, connected southwest ruins passage with two small faceted stone runners separated behind two waist-high plain cuboid cover pieces.
C: just north of B, small west weapon niche, a purple/white Pulse weapon pickup on a dark disc; no enemies. Mandatory path heads EAST from C to E.
D: optional dead-end terrace northwest of C, not connected to E. Two or three broad simple shallow steps from C up to a 1.1m SOLID terrace with clearly visible pale wall to the ground. Two small stone runners. Small green medkit, blue armour and amber ammo pickups. Return via same steps to C.
E: large rectangular inner court EAST of C, two small stone runners on the floor and one stone thrower on a low stepped rear-right plinth; three plain cuboid cover blocks, an amber ammo pickup behind right cover. This is smaller than boss courtyard.
F: compact safe room north of E, green-ish checkpoint disc, doorway directly north to boss court; separated by walls, no enemies.
G: broad rectangular northern boss courtyard, about 22 by 14 metres, two spaced block pillars, a small gold seal at entrance. In centre a dormant mound of faceted rocks with subtle amber core to indicate the future stone guardian, not an active giant boss. Two amber ammo pickup discs in opposite corners, one green medkit on a 1.1m solid side plateau with visible shallow stairs. No normal enemies in boss room.
H: plain narrow northern exit passage behind boss, a simple locked pale stone-and-gold bar gate. No elaborate fantasy portal.

Exactly 7 small enemy figures in total: 2 in B, 2 in D, 3 in E. Plus ONE dormant boss mound in G. Do not place extras in corridors. Enemy silhouettes about player size; no red diamonds or map icons. Nothing floats above ground except the existing small pickup display models. A few very sparse low-poly plants on outer edges only.

Text: small unobtrusive top-left title "CORE ARENA" and subtitle "LEVEL 1 · MAP-MOCKUP". Small bottom note "ENTWURF · ÜBERSICHTSKAMERA". Otherwise no labels or HUD clutter; the separate diagram supplies all labels. Landscape 3:2 aspect ratio. Critical priorities: simple existing game graphics, recognizable exact connected map footprint, grounded raised walls, readable route, no over-promising art quality.
```

## Überarbeitung: Gegner und Fundorte

```text
Edit reference image 1 (the generated CORE ARENA map mockup) very conservatively. Keep its exact simple low-poly WebGL graphics, colors, lighting, layout, title and overview camera. Reference image 2 is the correct floor-plan route and pickup placement. Make only these corrections:
1. CRITICAL CONNECTIVITY: the bottom start room currently has a straight narrow corridor running north along the right edge of the first combat room into the middle court. This is an unintended shortcut. Close this corridor across its width with a plain full-height pale wall at its midpoint, then open a clear gap in the first combat room's bottom-right wall to connect the start room into the first combat room itself. After that room with TWO enemies, the exit must lead north into the small PURPLE WEAPON niche, and ONLY from that niche a clear east corridor leads to the main middle court with THREE enemies. There must be no direct bypass from start to middle court or from first combat room to middle court that skips the purple weapon niche. Widen the horizontal niche-to-court corridor opening so its walkable floor is visible. Preserve the optional dead-end terrace and its stairs.
2. Replace the SEVEN gray humanoid placeholder enemies with equally small simple squat faceted rock minions, about 5 polygonal stones each and one tiny dim amber core. Two in the lower-left combat room, two in the optional far-left upper terrace, two on the central court floor and one on its right raised plinth. The one on the plinth has one slightly bigger rock arm. Keep all positions and exact counts. Keep the single teal/white PLAYER at the bottom unchanged. Boss remains the one existing dormant rock mound.
3. Add a green cross medkit pickup to the optional far-left terrace, on its left/south side, in addition to its existing blue armour and amber ammo.
4. Move the boss court's top-right ammo cache to its bottom-right corner near the entrance (away from seal). Leave the top-left ammo cache, side-platform medkit and all other pickups unchanged.
5. Pull camera back just enough to show the entire narrow northern exit including its end; leave a small border at top so no map structure is cropped.
No extra enemies, no extra rooms, no new aesthetic detail, no ornate doors, no quality upgrade. The goal is the same modest browser-game mockup with correct connectivity.
```

## Finale lokale Korrektur

```text
Use case: precise-object-edit. Preserve this image, with only 3 tiny local corrections. Do not redraw or redesign the scene.
At the narrow north-south tiled corridor immediately to the RIGHT of the lower combat room containing two small rock monsters: insert one solid pale stone wall that crosses the whole width of this corridor from left wall to right wall, just ABOVE the existing gap into the lower combat room. In this 1536x1024 input, place this new blocking wall approximately from pixel (650,672) to (720,672), with its vertical face extending down to y700. It must span the walkable corridor completely. The existing opening into the combat room at approximately x640,y720 must remain open BELOW this blocking wall. This forces the bottom starting player left through the room instead of straight up the corridor. This new cross-wall is the most important edit.
At the top exit of that same lower combat room, close the short eastward opening into the large middle court with another pale stone wall (approximately x554,y566 down to x554,y608), keeping the path north/west to the purple weapon niche open. The purple weapon niche still needs its own separate eastward doorway into the middle court at the upper horizontal passage near x550,y510, which should have a clear opening in the current wall there. Mandatory path: bottom player room -> lower left combat room -> purple weapon niche -> middle court. The player must visit the purple weapon niche to reach the middle court.
Restore a tiny amber ammo pickup on its dark disc in the large middle court just right of the lower-right cover block, approximately pixel (1004,584). All the other pickups and seven rock minions must remain exactly as they are. Do not change lighting, framing, quality, colors or text.
```

