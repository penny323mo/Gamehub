# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `13d0327`
Status: combined rival/ghost/effects mobile-budget checkpoint complete

## Current objective

Continue the Racing Car upgrade loop from the rivals, ghost, and three-race championship
without letting the combined feature set exceed the measured phone rendering budget.

## Completed

- Audited the real worst-case composition rather than each feature separately. Night,
  four rivals, ghost, and active skid/smoke originally reached 19 draw calls, contradicting
  ADR-044's `<18` limit even though every isolated budget gate passed.
- `RivalField` now reserves a fifth visual instance for the ghost. Four physical rivals
  and the non-physical ghost share one `InstancedMesh`, one geometry, and one material.
- Added an `instanceGhost` shader flag. Only the ghost uses a pale-blue screen-door
  discard pattern; rivals remain opaque and depth-writing. The ghost is still excluded
  from physics, contact, ranking, and championship points.
- Night stops drawing the 0.2-opacity cloud layer. Stars, moon, headlight, reflective
  road/rails, and every day/dusk cloud state remain intact.
- Worst-case controlled gate is now at most 17 calls and about 51k triangles: 15-call
  night base + one rival/ghost field + one driving-effects layer.
- Removed a duplicated rivals/ghost listener block accidentally nested inside the steer
  setting click handler. Changing normal/invert can no longer bind extra handlers.
- Clearing/disabling the ghost now clears the shared visual instance immediately.
- Added ADR-054 plus combined-budget and single-listener regression gates.

## Changed files

- `games/Racing Car/src/rivals.js`, `src/main.js`
- `games/Racing Car/tests/ghost.mjs`, `tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md`, `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 47/47, setup 69/69,
  rivals 47/47, ghost 29/29, season 20/20 (212/212).
- All four rivals completed all three laps on every circuit. Latest run: Turbo
  109.0–115.4s, Coast 120.9–131.2s, Touge 119.1–150.0s; off-road 0.9%, 12.9%, 6.8%.
- Controlled combined gate: four rivals + ghost occupy five instances in one draw;
  adding night skid/smoke stayed `<18` calls and `<120k` triangles.
- Setup measured night alone at 15 calls / 50,627 triangles and night effects at 16 /
  50,979. Listener instrumentation measured exactly one `racer-rivals` write after a
  steer toggle followed by a rival-setting click.
- Headed Chromium at 844×390 confirmed the close and distant pale-blue dithered ghost,
  five batched instances, 16 live calls before driving effects, and no shader/page error.
  The only console error was the known local favicon 404.

## Known issues and cautions

- Screen-door transparency avoids a separate transparent pass but can dither more visibly
  on very low-DPI phones; physical Safari inspection is still useful.
- Desktop Chromium cannot certify phone heat, Safari GPU behavior, or sustained device
  pacing. Retain the in-game privacy-safe performance report for phone evidence.
- Rival contact remains positional separation, deliberately not spin/damage transfer.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-054.
2. Continue one coherent phase: per-track championship records or configurable season
   composition are the current natural gameplay extensions.
3. Preserve the combined worst-case budget gate whenever adding another visible layer.

## Do not redo

- Do not split the ghost back into a second Mesh/material draw or include it in physics.
- Do not restore night clouds without recovering a draw elsewhere and remeasuring the
  full night + rivals + ghost + effects composition.
- Do not bind rivals/ghost handlers from inside steer-setting handlers.
- Do not advance progress from a getter/HUD, replay ghost frame-by-frame, or give action
  buttons individual pointer capture (ADR-048 to ADR-050).
- Do not flip steering sign without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
