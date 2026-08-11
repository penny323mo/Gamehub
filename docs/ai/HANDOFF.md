# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car terrain-anchor feel pass
Integration branch: `main`
Work branch: `main`
Status: Racing Car source, regression gates, headed mobile smoke and docs are
ready for the next verified `main` checkpoint. The receiving agent must sync
GitHub before edits.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive
but bounded bicycle physics, readable high-speed/drift feedback, believable
ground contact, track-specific landmarks and hills, stable frame pacing, and
real browser evidence for every visual or control change.

## Completed

- Continuous Catmull-Rom road ribbon remains backed by 240 cached X/Z samples;
  collision, checkpoints, progress and AI stay on the established X/Z grid.
- Closed crest/valley waves are now more legible (`1.55/0.65/0.24` harmonics),
  with track multipliers turbo **1.28**, coast **1.14**, touge **1.40**. Setup
  on touge-rev measures surface **−3.317…+3.317m**, span **6.634m**, maximum
  pitch **0.04219rad**; height/pitch seam at `t=0/1` remains exact.
- `Car.update()` adds a bounded grade load from the already-synced track pitch:
  cached tangent alignment prevents sideways drift from becoming fake thrust;
  `CFG.gradeGravity=4.6`, `gradeAccel` changes speed on hills, but `Car.pos.y`
  remains zero and no height enters collision or progress.
- Player, rival, ghost, offroad pose, guardrail posts, trees, kerbs, contact
  shadow and effects all follow the same surface anchor. Trackside tree trunks
  and crowns now use their local `terrainYAt(x,z)` at build time, so crest trees
  do not float and valley trees do not sink. Render-only suspension,
  camera grade, corner-load lean and 12–22m tangent look-ahead remain bounded.
- Speed layer starts at `10 m/s`; wheel-motion animates four merged wheel
  clusters; bounded effects pool covers drift marks/smoke, dust, exhaust, brake
  glow, impacts and rumble without adding a road/effects pass.
- Six tracks (three reverse), player assists/simple auto-throttle, ABS, recovery,
  rivals/ghost/season and lifecycle/context-loss contracts remain intact.

## Changed files

- `games/Racing Car/src/track.js`
- `games/Racing Car/src/tracks.js`
- `games/Racing Car/src/car.js`
- `games/Racing Car/tests/setup.mjs`, `games/Racing Car/tests/race.mjs`,
  `games/Racing Car/tests/ghost.mjs`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/DECISIONS.md` (ADR-289, ADR-290)
- `docs/ai/HANDOFF.md`

## Verification

- `race.mjs` — **130/130**; top **148 km/h**, 0–80 **2.40s**, drift/ABS/wall/
  recovery/roll/suspension/grade gates green, zero browser errors.
- `setup.mjs` — **150/150**; six tracks, graded ribbon/offroad pose, effects,
  controls, lifecycle, landmarks, tangent and tree-anchor gates green. The new
  tree gate measures **130/130 roots with max error 0**; setup budget remains
  **16 calls / 56,933 tris**, zero browser errors.
- `ghost.mjs` — **29/29**; ghost remains physics-independent (the new slope load
  is measured identically with and without the visual ghost) and the combined
  night + four rivals + ghost + effects frame stays at **18 calls / 53,253 tris**.
- Grade gate: uphill / flat / downhill 4-second full throttle =
  **30.503 / 32.895 / 35.293 m/s**, grade acceleration **−0.784 / 0 / +0.784
  m/s²**, physical Y remains **0**.
- Aggregate `RACER_TEST_SETTLE_MS=5000 node games/Racing\ Car/tests/run-all.mjs`:
  race **130/130**, setup **150/150** (readiness retry), rivals **61/61**,
  ghost **29/29**, season **55/55**, audio **33/33** (readiness retry).
- `node --check` on changed JS and tests — PASS; `git diff --check` — PASS.
- Real headed **844×390** smoke: **114 km/h**, `renderY=1.279m`,
  `trackPitch=0.01268rad`, `gradeAccel=0.106m/s²`, `offroad=false`, console
  **0 errors**; screenshot `/tmp/racing-grade-start-v12.png`.

## Known issues and cautions

- `trackPitch` is now an explicit, bounded physics input only through
  `gradeAccel`; do not feed `renderY` into physics or broaden grade coupling to
  collision, nearestT, checkpoints, progress or AI.
- Keep terrain as one bounded 32×32 mesh and query cache at 240 samples. Avoid
  per-frame Catmull-Rom calls, `Vector3.clone()` allocations or extra draw passes.
- The rigid GLB has no wheel bones/clips; re-profile `wheel-motion.js` if the
  car asset changes. Keep suspension follow at max `0.018/0.015rad` and camera
  lean at ±`0.032rad`.
- Do not increase wave amplitude, `gradeGravity`, engine output, camera shake or
  banking without rerunning physical gates, mobile budget and a real screenshot.
- Tree placement is a build-time visual anchor; if terrain profiles or tree
  placement change, rerun the tree-anchor gate and headed mobile smoke.
- Aggregate `run-all.mjs` may need `RACER_TEST_SETTLE_MS=5000` on pressured Macs;
  readiness-only retry is bounded and does not hide assertion failures.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`; read this handoff and ADR-290.
2. Run the named Racing suites plus the aggregate after any further change.
3. Run `./scripts/check-handoff.sh`, commit code and handoff together, push the
   authorized checkpoint, and verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not restore per-frame curve allocations or replace the existing bounded
  effects/speed layer with new draw-call-heavy passes.
- Do not force-push or rewrite shared `main` history.
