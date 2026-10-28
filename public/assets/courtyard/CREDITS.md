# Courtyard assets

Downloaded from Poly Haven on 2026-10-28. All four asset packs are published under
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/), as described
in [Poly Haven's asset license](https://polyhaven.com/license). The files are served
locally with the game; there are no runtime requests to Poly Haven.

| Local folder | Original asset | Use |
| --- | --- | --- |
| `rock_tile_floor` | [Rock Tile Floor](https://polyhaven.com/a/rock_tile_floor), Charlotte Baglioni | 1K JPEG diffuse, OpenGL normal and roughness; floor and coping |
| `stone_wall_02` | [Stone Wall 02](https://polyhaven.com/a/stone_wall_02), Poly Haven | 1K JPEG diffuse, OpenGL normal and roughness; masonry and exterior border |
| `fern_02` | [Fern 02](https://polyhaven.com/a/fern_02), Rico Cilliers / Rob Tuytel | 1K glTF, binary mesh, colour/normal/ARM JPEGs and separate PNG alpha mask |
| `rock_moss_set_01` | [Rock Moss Set 01](https://polyhaven.com/a/rock_moss_set_01), Kless Gyzen | 1K glTF, binary mesh and colour/normal/roughness JPEGs; three model variants used |

Original downloaded pixels and mesh data are unchanged. The two glTF entry files
were renamed without their `_1k` suffix; their relative dependencies retain their
original names. At render time the meshes are grounded/repositioned and the
materials adjusted for the game's lighting. The fern's separately supplied alpha
mask is applied explicitly, because the exported base-colour JPEG has no alpha.

The torch and masonry geometry are project-authored. Total downloaded asset payload
is about 7.5 MiB. These files are loaded only on adventure entry; no 4K textures,
external asset service or new runtime dependency is required.
