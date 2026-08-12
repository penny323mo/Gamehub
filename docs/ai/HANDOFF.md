# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Phase 0B AssetCatalog / RigCatalog checkpoint
Integration branch: `main`
Work branch: `main`
Status: Phase 0B is implemented and locally verified. Its checkpoint push waits
for the preceding `98e6708` clean workflow; no asset/gameplay code was added.

## Current objective

Execute `docs/GAMEHUB_EVOLUTION_PLAN.md` sequentially. Phase 0B establishes the
evidence authority required before actor re-rigging or scene asset replacement.
The concurrent Hub-theme side quest is UI-only and owns separate files.

## Completed

- Added strict build-time `games/assets/catalog.json` authority: 21 provenance
  sources, 24 longest-match path rules, 12 representative asset overrides and
  12 semantic RigDescriptors. Unknown evidence fails closed.
- Added `games/assets/catalog.mjs`: validate/load/query APIs, safe local path
  resolution and census coverage audit. Runtime Three/Babylon code is untouched.
- Added deterministic GLB/glTF census generator. It records bytes/SHA-256,
  bounds/triangles, materials/textures, nodes, skin/bone facts, clips/channels,
  external resources, duplicate groups and explicit missing facts.
- Generated 267 physical records: 155 canonical runtime, 108 delivery duplicates,
  4 Ashen source-only inputs and zero parse failure. Duplicate deep facts are
  compressed; the checked-in artifact is 1.44 MB.
- Separated provenance from technical readiness: 127/155 license-verified and
  28 blocked; 118/155 ready and 37 blocked. Recorded all evidence and gaps in
  `ASSET_LICENSE_AUDIT.md`; no license/source fact was inferred from appearance.
- Pages CI now checks generated census parity plus catalog/census contracts before
  release. Architecture/commands are in PROJECT_CONTEXT and durable ADR-310.

## Changed files

- Authority/report: `games/assets/catalog.json`, `catalog.mjs`,
  `census.generated.json`, `docs/ai/ASSET_LICENSE_AUDIT.md`.
- Generator/contracts: `scripts/build-asset-census.mjs`,
  `tests/asset-catalog.mjs`, `tests/asset-census.mjs`.
- Integration: `.github/workflows/deploy-pages.yml`, `PROJECT_CONTEXT.md`,
  `DECISIONS.md`, this handoff.

## Verification

- Census build and `--check`: PASS — 267 physical / 155 canonical / 0 parse.
- `node tests/asset-catalog.mjs`: PASS — 21/24/12/12 schema and API fixtures.
- `node tests/asset-census.mjs`: PASS — provenance 127/28, readiness 118/37.
- GameCatalog/release contracts: PASS — generated parity, catalog and 20 cases.
- Node syntax for all new modules/tests: PASS; workflow YAML: PASS.
- `git diff --check` and `./scripts/check-handoff.sh`: PASS.
- Prior MOBA cleanup commit `98e6708` passed local browser 206/206; clean GitHub
  run `31583123038` is still in progress and must be checked before the next push.

## Known issues and cautions

- P0 provenance gaps remain: Racing Tripo car 1, Ashen Tripo models 4, Royale
  player-provided Meshy models 23. Obtain source/job/license evidence or replace
  them with verified assets; do not relabel them by assumption.
- Readiness also flags 17 skeletal/animated assets without a RigDescriptor and
  one animation-only GLB without geometric bounds. These are future mapping work,
  not permission to generate fake bones, sockets or clips.
- Catalog/census are build-time evidence only. Do not import Node APIs into games,
  hand-edit generated JSON or create a universal rendering wrapper.

## Exact next action

1. Wait for run `31583123038`; if green, commit/push this Phase 0B package and
   verify its new catalog step in the replacement workflow.
2. Finish and browser-verify the isolated Hub-theme side quest without touching
   catalog order, game links or gameplay.
3. Start Phase 0C with reproducible baseline scene/rig/perf reports and before
   captures for Royale, Racing and Elden; replace blocked assets before reuse.

## Do not redo

- Do not rescan models ad hoc; regenerate the census and consume catalog APIs.
- Do not treat 127 verified assets as 155, or conflate license with rig readiness.
- Do not force-push or claim the 12-month roadmap complete after Phase 0B.
