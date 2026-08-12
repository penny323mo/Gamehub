# Runtime 3D asset license and provenance audit

Audit date: 2026-08-12 (Asia/Macau)

Repository baseline: Phase 0B working tree based on `98e6708`
Scope: repository evidence only; no new asset was downloaded, generated, copied, or introduced.

## Result

Phase 0's license exit is **not yet release-green**. Every canonical runtime GLB/glTF has a
disposition in this audit (155/155), but only **127/155 (81.9%)** have a repository license entry
that can be tied to their pack or asset group. **28/155 (18.1%) are explicit P0 blockers**:

- Racing Car: 1 Tripo-authored car has no source page or license record.
- Ashen Rail: 4 Tripo-authored runtime models have no source page or license record.
- Royale: 23 player-provided Meshy models have no source prompt/job/export record or license record.

This is an evidence audit, not a legal conclusion. “License entry” means the repository contains an
explicit license statement associated with the asset or its pack. It does not mean every desired
AssetCatalog field (exact acquisition URL, checksum, author, conversion chain) is complete.

## Denominator policy

The repository tracks **267** `.glb`/`.gltf` paths, but counting build copies as separate assets
would inflate both coverage and gaps. The canonical denominator is **155** files in source/runtime
delivery roots:

| Game | Canonical root | Canonical files | Tracked build/original copies excluded |
| --- | --- | ---: | ---: |
| Racing Car | `games/Racing Car/assets/` | 1 | 0 |
| Ashen Rail | `games/ashen-rail/public/assets/models/runtime/` | 4 | 8 (4 original inputs + 4 `dist` copies) |
| Elden Ring II | `games/elden-ring-ii/public/assets/` | 26 | 26 `dist` copies |
| MOBA | `games/moba/assets/models/` | 12 | 0 |
| Royale | `games/royale/assets/models/` | 34 | 0 |
| Tower | `games/tower/public/models/` | 78 | 78 `dist` copies |
| **Total** |  | **155** | **112** |

The 4 Ashen `original/` files are transformation inputs for the 4 runtime files, not additional
runtime identities. Elden and Tower builds copy or compress the canonical public files into tracked
`dist`. The audit nevertheless checks that these delivery paths exist and are not external URLs.

Royale is deliberately counted as **34**, although `src/assets.js` references only 31. These three
files are still shipped and therefore cannot evade provenance review merely because current code does
not load them:

- `games/royale/assets/models/environment/bridge.glb`
- `games/royale/assets/models/environment/fence_segment.glb`
- `games/royale/assets/models/environment/tree_pack.glb`

Xiangqi's HDRI is audited separately because it is runtime 3D-environment content but is not a
GLB/glTF. Snooker has a Three.js scene but no runtime GLB/glTF/HDR model or environment asset.

## Evidence status vocabulary

- **Complete for Phase 0 license gate**: repo identifies the asset/pack and contains a license entry.
- **Partial**: the license is stated, but exact source URL, raw upstream license snapshot, or file-to-
  pack mapping still needs strengthening before a complete AssetCatalog can be generated.
- **P0 blocker**: the repo does not establish a reusable license for a shipped canonical file.
- **Not applicable**: procedural geometry or no external 3D model/environment asset.

The source IDs below are the canonical IDs used by `games/assets/catalog.json`. The audit's source
groups and blocker dispositions are intended to align with the catalog's provenance sources and path
rules; any rule that assigns a broader or different source group is an integration defect, not a
reason to weaken this repository-evidence finding.

### Repository source/license evidence index

These URLs are transcribed from the repository files named in the Evidence column; they were checked
for URL syntax but deliberately **not live-verified**, because this audit is restricted to repository
evidence.

| Evidence file | Source/license URLs present in repo |
| --- | --- |
| `games/tower/scripts/fetch-assets.mjs` | [ETdoFresh Kenney mirror raw base](https://raw.githubusercontent.com/ETdoFresh/kenney.nl/master); per-file pack paths are in the script |
| `games/elden-ring-ii/public/assets/licenses/quaternius-rpg-characters.txt` | [Quaternius RPG Characters](https://quaternius.com/packs/rpgcharacters.html), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `games/elden-ring-ii/public/assets/licenses/kaykit-dungeon-and-skeletons.txt` | [KayKit Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0), [KayKit Skeletons](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `games/elden-ring-ii/public/assets/licenses/poly-haven-cobblestone-01.txt` | [Poly Haven Cobblestone 01](https://polyhaven.com/a/cobblestone_01), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `games/elden-ring-ii/public/assets/licenses/open-game-art-cc0-music.txt` | [Dream 2 Ambience](https://opengameart.org/content/dream-2-ambience), [Mists in the Elven Lands](https://opengameart.org/content/mists-in-the-elven-lands), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `games/moba/CREDITS.md` | [KayKit creator page](https://kaylousberg.itch.io/); GitHub repository slugs for Adventurers, Skeletons and Medieval Hexagon are recorded in the file |
| `games/moba/assets/LICENSE-kaykit-adventurers.txt`, `LICENSE-kaykit-skeletons.txt` | [CC0 1.0](http://creativecommons.org/publicdomain/zero/1.0/) |
| `games/royale/assets/models/CREDITS.md` | [Quaternius homepage](https://quaternius.com); no exact pack URLs or Meshy source URLs |
| `games/xiangqi-ai/assets/README.md` | [Poly Haven Studio Small 09](https://polyhaven.com/a/studio_small_09) |

Absent source URLs are material findings: Racing/Ashen contain no Tripo job/project URL, Royale
contains no Meshy job/project URL, the Elden demon license record has no official pack URL, and the
Elden Kenney license identifies the pack/homepage but not an acquisition page or upstream file map.

## Game-by-game audit

### Racing Car 3D — P0 blocker (0/1)

| Runtime path / pack | Canonical source ID | Repo evidence | Certain from repo | Gap / exact action |
| --- | --- | --- | --- | --- |
| `games/Racing Car/assets/car.glb` (1 file) | `tripo:racing-car` | `src/main.js` loads `./assets/car.glb`; GLB JSON contains a `tripo_node_…` material/node and image name `sports+car+3d+model_basecolor.jpg`; SHA-256 `8d246bb29c53ceb735a70c6f2b9d709aef5f9801b8a03120de33d2cd2859dbdf` | Generator provenance is Tripo-derived; **license unknown** | Add the original Tripo project/job or asset page URL, creator/account, export date, applicable license/terms snapshot, original-file checksum, transformation command, and runtime checksum. If that evidence cannot be recovered, replace it with an asset whose license evidence is preserved before the next art pass. |

The model first appears in commit `60a4bf7`; neither that commit nor current game files contain a
license or credits record. A generated node name is not a license.

### Ashen Rail — P0 blocker (0/4)

| Runtime path / pack | Canonical source ID | Repo evidence | Certain from repo | Gap / exact action |
| --- | --- | --- | --- | --- |
| `public/assets/models/runtime/{player-soldier,train-locomotive,hand-cannon,enemy-drone}.glb` (4 files) | `tripo:ashen-rail-set` | `README.md`, `docs/ASSET_AUDIT.md`, optimizer mapping and embedded `tripo_node_…` names consistently identify four Tripo exports. `docs/ASSET_AUDIT.md` maps each original filename to its runtime output. | Transformation identity and Tripo generator are established; **license unknown** | For each of the four models, preserve the Tripo project/job or asset URL, creator/account, generation/export date, license/terms snapshot that covers the export, original SHA-256, optimizer command/version, and runtime SHA-256. If any job evidence is unrecoverable, replace that model before expanding the scene. |

Runtime checksums currently observed: enemy drone
`1afa1b97a28d26c9d29d15553bf6da3d225b6af17955e13a6d21bfeb10d3f262`, hand cannon
`ffed23ac547d0583ce30ebdaef0771d76668084a204459e13b323546766e5e21`, player soldier
`0d950571a096a18f72059923a50978b48da555383dce865f7ad8b1bd5896e3b2`, locomotive
`7009fb48ef7b3c47b47437043b2a78583b927cbfd39d5457dfc3b443df88a2d6`.
`docs/ASSET_AUDIT.md` is a geometry/rig audit, not license evidence.

### Elden Ring II — license-covered, provenance follow-ups (26/26)

| Runtime path / pack | Files | Canonical source ID | Existing evidence | Status / gap |
| --- | ---: | --- | --- | --- |
| `public/assets/characters/{warrior,wizard,ranger}.glb` | 3 | `quaternius:rpg-characters` | `licenses/quaternius-rpg-characters.txt` contains CC0 1.0, official pack page, and bundled-file mapping. | Complete for license gate. Add per-output checksums and the repack command to AssetCatalog. |
| `public/assets/monsters/demon.gltf` (+ `.bin`/textures) | 1 | `quaternius:ultimate-platformer` | `README.md` assigns the final monster to Quaternius; `licenses/quaternius-ultimate-monsters.txt` contains Quaternius CC0 text. | Partial: filename says “ultimate-monsters” while the license body says **Ultimate Platformer Pack**, and it has no official pack URL or bundled-file line. Preserve the exact official source page/archive and map `demon.gltf` explicitly. |
| `public/assets/enemies/skeleton-minion.glb` | 1 | `kaykit:skeletons-1.0` | `licenses/kaykit-dungeon-and-skeletons.txt` contains author, official repository URL and CC0 1.0, and names Skeleton Minion. | Complete for license gate. Add asset checksum/acquisition commit. |
| `public/assets/environment/kaykit-dungeon/*.gltf.glb` | 11 | `kaykit:dungeon-remastered-1.0` | Same license file identifies the official repository, CC0 1.0, and the bundled asset categories. | Complete for license gate. Add per-file upstream path and checksum. |
| Other `public/assets/environment/*.glb` | 10 | `kenney:castle-kit-2.0` | `README.md` assigns castle environment to Kenney; `licenses/kenney-castle-kit.txt` is the pack's CC0 1.0 license text. | License-covered. Add the exact Castle Kit source/download URL and per-file upstream mapping; the current license has only Kenney's homepage. |

Related non-GLB evidence is healthy but not included in 26: Poly Haven Cobblestone 01 has an exact
source page, CC0 record and 1K-file description in `licenses/poly-haven-cobblestone-01.txt`
(`polyhaven:cobblestone-01`). The two OpenGameArt music tracks have individual source pages, authors,
CC0 links, transformation notes and a verification date in `licenses/open-game-art-cc0-music.txt`
(`opengameart:dream-2-ambience`, `opengameart:mists-elven-lands`).

The in-game credits currently mention Quaternius characters, Kenney environment and Poly Haven, but
omit the KayKit dungeon/skeleton sources even though the repo license file covers them. Add KayKit
when credits become catalog-generated.

### 深淵之橋 MOBA — license-covered, one raw-license gap (12/12)

| Runtime path / pack | Files | Canonical source ID | Existing evidence | Status / gap |
| --- | ---: | --- | --- | --- |
| Five `champions/*.glb` plus applicable content in `weapons.glb` | 6 grouped outputs | `kaykit:adventurers-1.0` | `CREDITS.md` maps the pack to heroes/weapons and names its GitHub repository; `LICENSE-kaykit-adventurers.txt` is the upstream CC0 text. | Complete for license gate; catalog must record that `weapons.glb` is a derived multi-item output. |
| Four `minions/*.glb` plus `anims.glb` | 5 grouped outputs | `kaykit:skeletons-1.0` | `CREDITS.md` maps the pack and repo; `LICENSE-kaykit-skeletons.txt` is the upstream CC0 text; `src/assets.js` documents the shared-animation derivation. | Complete for license gate. Add transformation script/command and checksums. |
| `arena.glb` | 1 | `kaykit:medieval-hexagon-1.0` | `CREDITS.md` maps the arena content to `KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0` and states all 3D models are CC0. | Partial: no local upstream Medieval Hexagon license text is preserved. Add that pack's raw LICENSE file and record the exact 35 upstream items merged into `arena.glb`. |

### Empire Royale — mixed source, P0 blocker (11/34)

| Runtime path / pack | Files | Canonical source ID | Existing evidence | Status / gap |
| --- | ---: | --- | --- | --- |
| Eleven root GLBs (`Barracks…`, `TowerHouse…`, resources, crate/barrel/mountain) | 11 | `quaternius:rts` | These files entered in commit `615c603`; `CREDITS.md` identifies the Quaternius RTS Pack and CC0 1.0. | License-covered but partial: add exact official RTS pack page/archive, raw license text, upstream path and checksum per file. |
| `units/`, `siege/`, `buildings/`, `projectiles/`, `effects/`, `environment/` | 23 | `meshy:royale-player-provided` | `src/assets.js` explicitly calls these “Meshy.ai generated models (player provided)”; commit `c0e2834` introduced all 23. | **P0 blocker:** no Meshy project/job/source URL, account/creator, prompt/export record, applicable license/terms snapshot or per-file rights record. Recover those records per file; otherwise replace all affected shipped models before the next art pass. |

There is a direct repository contradiction: `assets/models/CREDITS.md` says every GLB in the folder is
Quaternius CC0, while `src/assets.js`, ADR-009 and commit history identify the 23 subdirectory models
as Meshy-generated. Do not propagate the blanket Quaternius claim into AssetCatalog. Correct the
credits only after the missing Meshy rights evidence is recovered or the models are replaced.

Catalog integration is aligned with this evidence-backed split: the generic Royale root rule maps
the 11 root GLBs to `quaternius:rts`, while six longer-prefix subdirectory rules map exactly 23 GLBs
to `meshy:royale-player-provided`. Full-census verification confirms the intended 11/23 assignment.

Of the 23 Meshy files, 20 are referenced by the current loader. The three dormant-but-shipped files
listed in the denominator section remain blockers because they are still distributed.

### Tower Defense — complete for license gate (78/78)

| Runtime path / pack | Files | Canonical source ID | Existing evidence | Status / gap |
| --- | ---: | --- | --- | --- |
| `public/models/towers/*.glb`, `tiles/*.glb`, `scenery/*.glb` | 61 | `kenney:tower-defense-kit-1.0` | `scripts/fetch-assets.mjs` contains exact mirror base, upstream pack paths and destination mapping; `licenses/kenney-tower-defense-kit.txt` is the CC0 text. | Complete for license gate. Persist file checksums and verification date in AssetCatalog. |
| `public/models/enemies/*.glb` | 5 | `kenney:graveyard-kit-3.0` | Same acquisition manifest plus `licenses/kenney-graveyard-kit.txt`. | Complete for license gate. |
| `public/models/structures/*.glb` | 12 | `kenney:fantasy-town-kit-1.0` | Same acquisition manifest plus `licenses/kenney-fantasy-town-kit.txt`. | Complete for license gate. |

Tower currently has the strongest reproducible provenance: one acquisition manifest maps every
canonical GLB to an upstream mirror path and preserves all three raw pack licenses. The remaining
AssetCatalog work is checksum/verification metadata, not an unknown-license blocker.

### Xiangqi AI — no GLB; HDR environment complete

`games/xiangqi-ai/assets/studio_small_09_1k.hdr` is loaded through Vite `?url` and copied to
`dist/assets/`. `assets/README.md` records the exact Poly Haven Studio Small 09 source page, CC0 1.0,
and SHA-1; canonical source ID `polyhaven:studio-small-09`. This is complete for the current
environment-asset license gate. Add author and SHA-256 when normalized into AssetCatalog.

### Snooker 3D — no external runtime 3D model/environment asset

The 3D table, balls, cue and room are procedural Three.js geometry. The only non-vendor visual asset
under the live scene is local SVG cloth/UI content; there is no tracked runtime GLB/glTF/HDR/EXR.
Therefore Snooker contributes zero to this audit's model/environment denominator. If the proposed
Poly Haven studio/cloth/wood audition is later accepted, it must enter AssetCatalog with its own
source and license evidence before import.

## Named-source conclusion

| Source family | Present runtime evidence | Conclusion |
| --- | --- | --- |
| Kenney | Tower (78 GLBs), Elden environment (10 GLBs) | CC0 is locally evidenced. Tower has exact per-file acquisition paths; Elden still needs an exact pack download/source mapping. |
| Quaternius | Elden characters/demon, Royale root RTS assets | CC0 is locally stated. Elden RPG character mapping is strong; demon pack identity and Royale exact pack URLs/mappings need repair. |
| KayKit | MOBA and Elden dungeon/skeleton | CC0 is locally evidenced for Adventurers, Skeletons and Elden packs. MOBA Medieval Hexagon needs its raw license snapshot. |
| Poly Haven | Elden Cobblestone 01; Xiangqi Studio Small 09 | Both are bundled locally with exact source URLs and CC0 records. Neither is part of the GLB denominator. |
| OpenGameArt | Elden music only | Both tracks have per-item URLs, authors, CC0 records and transformation notes. No OpenGameArt 3D model is present. |
| Tripo | Racing (1), Ashen (4) | Generator/source family is identifiable, but no reusable license record exists: 5 P0 blockers. |
| Meshy | Royale subdirectory models (23) | Source family is identified by code/history, but no per-file rights/provenance record exists: 23 P0 blockers. |

## P0 remediation order

1. **Freeze new art imports** until AssetCatalog rejects a missing local license/source record.
2. Recover or replace the **23 Royale Meshy files**; fix the false blanket Quaternius credit only
   after evidence is available.
3. Recover or replace the **4 Ashen Tripo files** and the **1 Racing Tripo car**. Embedded generator
   names and user-provided status do not establish redistribution rights.
4. Preserve MOBA Medieval Hexagon's raw LICENSE and its exact `arena.glb` input list.
5. Resolve Elden demon's “Ultimate Monsters” filename versus “Ultimate Platformer Pack” body and add
   the exact official source URL/bundled-file mapping.
6. Add exact source pages/raw licenses for Royale Quaternius RTS and Elden Kenney Castle assets, then
   generate credits from the canonical catalog rather than broad folder claims.

Required evidence format for every repair: canonical source ID, asset/pack author, exact source page
or repository URL, upstream file/archive path, local license text or immutable snapshot, acquisition
or export date, original checksum, transformation command/version, output checksum, runtime path and
games using it. A URL alone is not sufficient.

## Audit verification

- Canonical census: 155 GLB/glTF files; all 155 assigned to a source group or explicit blocker.
- Tracked physical census: 267 GLB/glTF paths; 112 excluded duplicate/original build paths explained.
- Runtime-reference review: Racing, Ashen, Elden, MOBA, Royale and Tower loaders inspected; Royale's
  three shipped-but-not-referenced GLBs identified explicitly.
- Catalog alignment: all audit source IDs are canonical, and full-census rule resolution preserves
  Royale's documented 11 Quaternius / 23 Meshy split exactly.
- Non-GLB environment review: Xiangqi HDR and Elden Poly Haven/OpenGameArt evidence inspected;
  Snooker confirmed to have no external runtime 3D model/environment file.
- Repository mutation: this audit document only. **No new asset was introduced.**
