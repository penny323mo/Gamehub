# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Phase 0A GameCatalog / ReleaseGate checkpoint
Integration branch: `main`
Work branch: `main`
Status: Phase 0A implementation and local verification are complete; this file
ships with the durable checkpoint. Required GitHub deploy-matrix verification
must be checked before the next agent treats the checkpoint as release-green.

## Current objective

Execute `docs/GAMEHUB_EVOLUTION_PLAN.md` sequentially. Phase 0A replaced the
duplicated 13-game launcher/test/CI inventory with one validated GameCatalog and
a changed-game ReleaseGate without changing gameplay. After this checkpoint,
continue Phase 0 with AssetCatalog/RigCatalog census and baseline evidence; do
not start three scene rewrites in one shared checkout.

## Completed

- Added canonical `games/manifest.json` with 13 public descriptors: metadata,
  Pages-safe entry, runtime/persistence/capabilities, smoke route, release roots,
  structured fast/full commands and bounded long-suite timeouts.
- Added `games/catalog.mjs`: validation, list/get/launcher/target adapters and
  changed-file selection. It rejects duplicate ids/entries, missing files,
  unsafe paths, shell metacharacters and stale generated output.
- Added deterministic `games/catalog.generated.js`; launcher loads its classic
  `globalThis.GameCatalog` API synchronously. Generator also derives a manifest-
  content hash for the script URL so browsers cannot keep a stale roster.
- Removed the hard-coded launcher roster and migrated all Hub-wide test rosters
  and progress drivers to `tests/lib/catalog-targets.mjs`. Test-specific hooks,
  Snooker 3D route and stable report labels remain local to their tests.
- Added `scripts/release-gate.mjs` with `fast`/`full`, explicit `--all`, Git diff,
  rename/delete coverage, safe argv execution and fail-closed handling. A direct
  game change selects one owner; shared/test/CI/catalog/assets/Supabase/unknown
  paths select all; docs-only selects none.
- Added `scripts/install-release-deps.mjs`; deploy installs only package-lock
  directories selected by the same full plan, reusing the explicitly installed
  Tower Playwright browser for root/MOBA flows.
- Deploy CI now always validates catalog contracts and Hub layout/load/touch/
  blocked-storage/home gates, then runs affected games' full plans. Manual and
  all-zero-base events explicitly run all 13 games.
- Updated MOBA cache tooling to edit canonical manifest metadata, regenerate the
  browser catalog and keep its own module token contract intact.
- Hardened manifest-to-DOM rendering with HTML escaping, local image/route
  validation, inert JSON generation and repository-contained tooling paths.
- Recorded the architecture and verification contract in `PROJECT_CONTEXT.md`
  and ADR-309 in `DECISIONS.md`.

## Changed files

- Catalog: `games/manifest.json`, `games/catalog.mjs`,
  `games/catalog.generated.js`, `scripts/build-game-catalog.mjs`.
- Release: `scripts/release-gate.mjs`, `scripts/install-release-deps.mjs`,
  `.github/workflows/deploy-pages.yml`.
- Consumers: `launcher.js`, `index.html`, `tests/lib/catalog-targets.mjs`,
  `tests/hub*.mjs`, `tests/lib/drivers.mjs`.
- Contracts: `tests/catalog.mjs`, `tests/release-gate.mjs`.

## Verification

- `node tests/catalog.mjs`: PASS — 13 games, generated parity, safe metadata.
- `node tests/release-gate.mjs`: PASS — 20 selection/security edge cases.
- `node scripts/build-game-catalog.mjs --check`: PASS; current token is derived
  from current manifest content (never copy a token from this handoff).
- `node tests/hub.mjs`: PASS 100/100 across 320×568, 440×956, 844×390,
  1280×800; 13 unique ids, no dead links/external requests/browser errors.
- Required Hub gates: load 3/3, touch 5/5, blocked storage 2/2, home 3/3.
- `node games/moba/tests/cache-bust.mjs`: PASS — entry/module tokens aligned.
- Every `tests/**/*.mjs` passed `node --check`; workflow YAML parse and
  `git diff --check` passed.
- Full all-game plan resolves 13 games / 25 bounded commands. The pushed GitHub
  workflow is the authoritative clean-clone execution of those full commands.

## Known issues and cautions

- `games/catalog.generated.js` is checked-in generated delivery code. Always edit
  `games/manifest.json`, then run the generator and parity test.
- `fast` is for local triage; deploy uses `full`. Tower and Racing full commands
  own 30-minute outer bounds because their internal browser runners can exceed
  ten minutes on SwiftShader.
- Hub tests share Tower's Playwright installation in CI. Royale/Racing still own
  their package dependencies; if Playwright browser revisions diverge, install
  the matching browser or standardize the version in a separate package.
- Game metadata is now trusted only after validator + DOM escaping; do not return
  to interpolating raw manifest strings or external runtime URLs.
- This checkpoint implements GameCatalog/ReleaseGate only. AssetCatalog,
  RigCatalog, baseline device reports and scene greyboxes remain unimplemented.

## Exact next action

1. Verify the pushed checkpoint SHA and Pages workflow. Fix any required full-
   matrix failure before treating Phase 0A as release-green.
2. Start Phase 0B as a bounded package: define AssetCatalog + RigCatalog schemas,
   run a read-only census over all runtime GLB/animation actors, and generate a
   reproducible report with license/source gaps; do not import new assets yet.
3. In parallel-safe branches only, prepare Royale/Racing/Elden gameplay greybox
   specifications and before captures. No art pass until catalog, rig and budget
   evidence exists.

## Do not redo

- Do not reconstruct game lists in launcher, tests or workflow; consume the
  catalog adapters and keep test-specific behavior keyed by game id.
- Do not hand-edit the generated catalog or use a universal game engine.
- Do not force-push, rewrite shared history, or claim the full 12-month roadmap
  is complete after this first implementation checkpoint.
