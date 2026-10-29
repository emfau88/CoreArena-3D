# KayKit player model and animations

Author: **Kay Lousberg**, https://kaylousberg.com/.

Source: [KayKit Character Animations — Free 1.1](https://kaylousberg.itch.io/kaykit-character-animations),
downloaded through the publisher's normal free download on **2026-10-29**.
The free animation archive also includes the rigged **Mannequin Medium** character.
No purchase was needed for the files used here.

The original `License.txt` is preserved as [LICENSE.txt](LICENSE.txt):
**Creative Commons Zero, CC0 1.0 Universal**. Personal/commercial use and modification
are permitted. This credit is voluntary and identifies the actual asset source.

Downloaded archive SHA-256:
`65882f31f905ad2e953819648a59287cdeab8f623908d5ef701971d3758be20f`.

| Local file | Original archive path below `KayKit_Character_Animations_1.1/` |
| --- | --- |
| `Mannequin_Medium.glb` | `Mannequin Character/characters/Mannequin_Medium.glb` |
| `General.glb` | `Animations/gltf/Rig_Medium/Rig_Medium_General.glb` |
| `Movement.glb` | `Animations/gltf/Rig_Medium/Rig_Medium_MovementBasic.glb` |
| `Ranged.glb` | `Animations/gltf/Rig_Medium/Rig_Medium_CombatRanged.glb` |

These four self-contained GLBs are unchanged, apart from three filenames being
shortened. Textures are embedded. Total binary payload: 2,952,760 bytes (2.82 MiB).
No runtime external asset requests or new package dependencies are required.

Project-owned integration in `src/render/kayFighter.ts`: cloning the skeleton,
scaling to the existing player's height, rougher materials, animation selection
and blending, upper/lower-body masks, small directional waist turn, recoil and
landing squash. Optional hand-slot marker tracks absent from the mannequin are
excluded. The player's actual movement and damage remain simulation-controlled.
