# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing drift cues/HUD, wheel-flicker fix and Ashen mobile setup
Integration branch: `main`
Work branch: `main`
Status: implementation and cross-game browser gates are verified; commit/push
this checkpoint before the next agent edits the shared checkout.

## Current objective

Keep Game Hub games production-ready on mobile while preserving the shared
GitHub relay protocol. The newest product work is Racing Car feel: the default
turbo route now asks for brake → handbrake → countersteer → throttle-out
drifts, each track's sharp bends now have render-only entry/apex/exit drift
paint, and the HUD previews the next turn and handbrake distance. The rigid
GLB wheel animation no longer produces shared-normal specular flicker.

## Completed

- Racing turbo keeps its long full-throttle start straight, then uses a high-
  speed right bend, offset reverse-S, deep hairpin and long exit bend. Its
  render-only elevation is **1.34**; road, grid, checkpoints, AI and reverse
  routes still come from the same Catmull-Rom centreline.
- Racing wheel motion still rolls all four detected tyre clusters and steers
  the front pair, but does not rotate the merged GLB's shared normals. This
  removes body/tyre seam specular flashing while preserving visible motion.
  `setup.mjs` now asserts `normalChanged === 0`.
- Racing `Track` now derives up to seven curvature minima as `driftZones`.
  Each zone has a low-contrast three-stage entry/apex/exit arrow cue; the cue
  geometry is merged into the existing kerb vertex-color mesh (no extra draw
  call), while the hidden source InstancedMesh remains available for
  diagnostics. `setup.mjs` verifies 4–7 zones, three markers per zone,
  on-road placement and the 15-call baseline.
- Racing HUD now shows a bounded `下一彎 左/右 · Nm · 入彎拉手掣` preview while
  the player is not actively drifting. It follows arc-length and works on
  reverse routes; it is DOM-only and does not alter input or physics.
- Ashen Rail's opening settings panel is now viewport-bounded and scrollable;
  closed `<details>` explicitly hides its controls so a hidden settings row
  cannot inflate the scroll geometry. Labels, selects, ranges and checkboxes
  retain 44×44 CSS-pixel touch targets. The tracked nested `dist/` was rebuilt
  with the safe-storage preload output.

## Changed files

- `games/Racing Car/src/tracks.js` — turbo waypoints/description/elevation.
- `games/Racing Car/src/track.js` — curvature-derived drift zones, low-cost
  road-painted cues, reverse-route palette handling and GPU-safe geometry merge.
- `games/Racing Car/src/main.js`, `games/Racing Car/index.html`,
  `games/Racing Car/style.css` — next-drift HUD preview.
- `games/Racing Car/src/wheel-motion.js` — position-only wheel animation.
- `games/Racing Car/tests/setup.mjs` — shared-normal, drift-zone and HUD gates.
- `games/ashen-rail/src/styles/main.css` and tracked `dist/` — scrollable,
  touch-sized start settings output.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` (ADR-306/307/308), this file.

## Verification

- Racing aggregate `npm test` with the bundled Playwright Chromium: **all six
  suites PASS** — `race.mjs` **136/136**, `setup.mjs` **160/160**,
  `rivals.mjs` **61/61**, `ghost.mjs` **33/33**, `season.mjs` **55/55** and
  `audio.mjs` **33/33**. The run also passed `git diff --check`.
- Racing `setup.mjs`: **160/160** (turbo clearance 53.2m; seven drift zones /
  21 merged cues; HUD direction/arc-distance preview; all six starts,
  terrain, drift effects, four wheels, mobile controls and render budget).
- Racing focused real-browser drift smoke: `/tmp/racing-drift-marker-final.png`
  showed the car at a turbo apex with the `下一彎 左 · 160m · 入彎拉手掣` HUD;
  browser readback reported `markers=21`, `visible=false` source mesh,
  `kerbVertices=5299`, and **13** render calls for the focused frame.
- Racing `rivals.mjs`: **61/61** (turbo rivals 105.9–108.6s, zero offroad).
- Racing `ghost.mjs`: **33/33** (transparent player GLB clone, independent
  geometry/wheels, no physics effect, 19 calls / 108,925 tris peak).
- Racing `season.mjs`: **55/55**; `audio.mjs`: **33/33**; `git diff --check` PASS.
- Ashen: `npm test` **15/15**, lint PASS, build PASS. The cross-game
  `tests/hub-touch.mjs` with the bundled Playwright Chromium is **5/5**:
  the Hub launcher plus all 13 listed games load in portrait/landscape, zero
  startup browser errors,
  no horizontal overflow, all controls ≥44×44, and every out-of-viewport
  control becomes reachable after `scrollIntoView`.
- The system Chrome startup timeout was an environment issue; all release
  gates above use the repository's bundled Playwright Chromium with the
  ANGLE SwiftShader flags used by the harness.

## Known issues and cautions

- Ashen build retains the known non-fatal Vite classic-script warning; the
  prune step rewrites nested safe-storage paths and must not be removed.
- Keep Racing terrain as one 96×96 mesh and preserve `minSelfClearance() > 36`.
  Do not feed render surface height/bank/pitch into physics, collision, progress
  or AI. Keep ghost transparent, cloned and outside physics/ranking.
- The wheel selector is an asset-specific merged-geometry heuristic. If
  `assets/car.glb` changes, re-check four clusters, visible spin, normals and
  the 20 calls / 120k triangle mobile budget.
- Do not force-push or rewrite shared `main`; preserve unrelated dirty files
  until this checkpoint is committed.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, read this file plus ADR-306/307/308,
   then inspect the pushed checkpoint SHA before editing.
2. For future Racing feel work, test the real HTTP page at 844×390 and a
   320×568 viewport; keep the drift scoring/effects, HUD preview and mobile
   touch gates green. Retry `race.mjs` after clearing the Chrome startup
   condition only if the browser environment changes.

## Do not redo

- Do not rescan the entire repository before syncing and reading the named
  handoff/decision files.
- Do not restore the block ghost, rotate merged wheel normals, add a second
  terrain pass, or create per-frame curve allocations.
