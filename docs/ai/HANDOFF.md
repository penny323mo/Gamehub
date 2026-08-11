# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car bounded render feedback + reset/GC pass
Integration branch: `main`
Work branch: `main`
Status: source, browser suites, visual smoke and handoff content are ready to travel
as the next verified `main` checkpoint. The receiving agent must sync GitHub before edits.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive but
bounded bicycle physics, readable high-speed/drift feedback, stable frame pacing, and
real browser evidence for every visual/control change.

## Completed

- Sport-arcade power envelope now keeps more mid/high-speed push without removing the
  established friction circle, ABS, counter-steer assist, wall recovery or rescue state.
- Handbrake rear grip is `0.35`: a short phone slide reaches a controllable drift sooner,
  while the peak-angle gate still prevents an instant spin.
- Speed streak feedback starts at `16 m/s` and fades in through the existing transparent
  HUD layer; it adds no mesh or draw call and never writes back into physics.
- `Car.reset()` now clears body roll/pitch, unspin, offroad and lock flags before the
  first render of a restarted race. The existing effects instance pool adds only very
  faint alternating exhaust pulses under throttle; coast, offroad and drift do not
  leave exhaust residue.
- AI driver curve samples, wrong-way/rescue tangents, rival yaw axes and particle
  spawn points reuse optional targets/scratch vectors, keeping short-lived allocations
  out of the mobile frame loop.
- `Track` still precomputes the same 240 nearest-point samples; `Car.update()` and the
  camera still reuse scratch vectors. Asphalt tyre-wear and centre dashes remain in the
  existing texture rather than a new road pass.
- `run-all.mjs` now has per-suite timeout, settle delay, POSIX process-group cleanup and
  an explicit `TIMEOUT` summary, so a Chromium launch hang cannot block CI forever.

## Changed files

- `games/Racing Car/src/car.js`
- `games/Racing Car/src/driver.js`
- `games/Racing Car/src/rivals.js`
- `games/Racing Car/src/race.js`
- `games/Racing Car/src/driving-effects.js`
- `games/Racing Car/src/main.js`
- `games/Racing Car/style.css`
- `games/Racing Car/tests/race.mjs`
- `games/Racing Car/tests/setup.mjs`
- `games/Racing Car/tests/run-all.mjs`
- `docs/ai/HANDOFF.md`, `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md`

## Verification

- `PLAYWRIGHT_CHROMIUM=... node race.mjs` — **126/126**; six tracks, top **146 km/h**,
  0–80 **2.40s**, handbrake entry **19°**, drift/ABS/wall/rescue/roll gates green,
  restart posture reset and zero browser errors.
- `PLAYWRIGHT_CHROMIUM=... node setup.mjs` — **131/131**; continuous ribbon, cache and
  scratch gates, speed-feedback and throttle-exhaust gates, mobile layout/touch/gyro,
  day/night, lifecycle/context-loss, draw budget, zero browser errors.
- `PLAYWRIGHT_CHROMIUM=... node rivals.mjs` — **61/61**; four AI rivals, ranking,
  minimap, instancing and lat-G gates green, zero browser errors.
- `ghost.mjs` **29/29**, `season.mjs` **55/55**, `audio.mjs` **33/33**; all zero
  browser errors.
- 844×390 real browser smoke after the latest source: at **106 km/h**, `#speed-lines`
  was `active`, opacity **0.299**, FOV **67.39**, effects pool had **4** bounded
  particles, with no page/console errors; screenshot evidence:
  `/tmp/racing-sport-exhaust-v3.png`.
- A bounded aggregate run was exercised: suites now finish with explicit PASS/TIMEOUT
  rows; repeated Chromium allocator pressure can still timeout individual suites, so
  separate `race.mjs`/`setup.mjs`/`rivals.mjs` results above are authoritative.
- `node --check` on `run-all.mjs` and `git diff --check` are required before commit;
  `./scripts/check-handoff.sh` must be run after this file is staged.

## Known issues and cautions

- Aggregate `run-all.mjs` is now diagnosable but not a promise that six Chromium
  processes can launch cleanly in a resource-pressured Mac session. A `TIMEOUT` is a
  test-environment failure, not gameplay evidence; rerun the named suite separately.
- Keep the speed layer pointer-transparent and low-contrast. Do not turn it into a
  second road mesh or let it obscure the mobile HUD.
- Exhaust is intentionally subtle and shares the existing effects draw. If the next
  feel pass needs more drama, tune alpha/lifetime only after rerunning the 16-call
  budget and drift-smoke gates; do not add a separate tail-light/smoke mesh.
- Do not increase engine output, camera shake, body roll/pitch, or nearest-point sample
  count without rerunning physical drift/ABS, wall-recovery, draw-budget and screenshot
  gates.

## Exact next action

1. Stage the eight Racing source/test files changed in this checkpoint plus the three AI docs listed above.
2. Run staged `git diff --check`, `./scripts/check-handoff.sh`, and the authoritative
   Racing suites with an explicit `PLAYWRIGHT_CHROMIUM` path.
3. Commit and push `main` (cloud handoff is authorized), then verify local `HEAD`,
   `origin/main`, and a clean worktree are identical.
4. The next agent should run `./scripts/agent-context.sh --sync`, read this handoff,
   inspect the Racing diff, and do a real-device feel review before changing constants.

## Do not redo

- Do not restore per-frame `curve.getPointAt()` or `pos.clone()` allocations.
- Do not replace the existing asphalt texture marker with another draw call.
- Do not treat a bounded aggregate timeout as a product pass, and do not force-push or
  rewrite the shared `main` history.
