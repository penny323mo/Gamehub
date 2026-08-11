# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — Racing Car smoothness + road-readability pass
Integration branch: `main`
Work branch: `main`
Status: source and regression changes are verified locally; checkpoint commit/push is the
next action. Do not start another edit until the commit below is pushed and SHA-checked.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive but
bounded bicycle physics, readable high-speed/drift feedback, stable frame pacing, and a
road surface that gives the player visual depth without spending another draw call.

## Completed

- `Track` precomputes the same 240 nearest-point samples once per circuit. Runtime
  `nearestT()` now scans a `Float32Array` rather than allocating a curve point per sample.
- `Car.update()` reuses one collision-probe `Vector3`; `updateCamera()` reuses five hot-path
  scratch vectors. These are render/query optimisations only; physics constants and input
  behaviour are unchanged.
- Asphalt texture now contains low-contrast paired tyre-wear lanes and a short dashed
  centre reference. It is part of the existing road material, so it adds no draw call.
- Setup regression gate now proves the query cache, collision scratch vector, and road
  marker signal are present.

## Changed files

- `games/Racing Car/src/track.js`
- `games/Racing Car/src/car.js`
- `games/Racing Car/src/main.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/HANDOFF.md`, `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md`

## Verification

- `cd "games/Racing Car/tests" && node race.mjs` — **125/125**; six circuits, 0–80 **2.47s**,
  peak **144 km/h**, drift/ABS/wall-recovery/roll gates all green, zero browser errors.
- Same directory `node setup.mjs` — **129/129**; cache/scratch/road-marker gate, mobile
  layout/touch/gyro/lifecycle/context-loss/day-night/effects budget all green, zero errors.
- Real Chromium 844×390 smoke — no page/console errors; road centre marker pixel peak **159**
  versus edge **73**; renderer stayed at **15 calls**; screenshot `/tmp/racing-visual-markers.png`.
- Browser micro-benchmark over 2,400 query calls × 8 — cached `nearestT` **1.7ms** versus
  direct curve allocation **74.2ms** (same accumulated result, **43.6×** faster).
- `git diff --check` and `./scripts/check-handoff.sh` must be rerun after this file is staged.

## Known issues and cautions

- `npm test`/`run-all.mjs` can stall when a second Playwright Chromium is launched on this
  Mac; the two suites above are the authoritative current evidence. Do not report an
  aggregate hang as a gameplay failure or as a pass.
- Keep the road marker subtle: it is a circuit visual reference, not a new gameplay lane.
- Do not increase camera shake, body roll/pitch, or `nearestT` sample count without rerunning
  the 0–80, drift, floor-clearance, AI-lap, draw-call, and mobile layout gates.

## Exact next action

1. Stage only the four Racing source/test files plus these three AI docs.
2. Run `git diff --cached --check`, `./scripts/check-handoff.sh`, and the two Racing suites.
3. Commit and push `main` (user has authorized cloud handoff); verify local and
   `origin/main` resolve to the same SHA and the worktree is clean.
4. The next agent should sync first, then do a real-device feel review; do not rescan the
   entire repository.

## Do not redo

- Do not restore per-frame `curve.getPointAt()` calls in `nearestT()` or `pos.clone()` in
  `Car.update()`.
- Do not add a second road draw call just to render the marker; keep it in the asphalt map.
- Do not change the established assist boundary, ABS defaults, drift envelope, or track
  geometry in this performance/visual pass.
