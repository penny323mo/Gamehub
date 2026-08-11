# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car crest/valley camera response pass
Integration branch: `main`
Work branch: `main`
Status: Racing Car source, regression gates, headed mobile smoke and docs are ready
for the next verified `main` checkpoint; the receiving agent must sync GitHub first.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive
but bounded bicycle physics, readable high-speed/drift feedback, believable ground
contact, track-specific landmarks/hills, stable frame pacing and real browser evidence.

## Completed

- Continuous Catmull-Rom road ribbon remains backed by 240 cached X/Z samples;
  collision, checkpoints, progress and AI stay on the established X/Z grid.
  Main recovery, wrong-way detection and AI lateral offset now use the cached
  `Track.tangentAtT()` path; spline `getPointAt()` remains for accurate aim points.
- Closed crest/valley waves are now more legible (`1.55/0.65/0.24` harmonics),
  with track multipliers turbo **1.28**, coast **1.14**, touge **1.40**. Setup
  on touge-rev measures surface **−3.317…+3.317m**, span **6.634m**, maximum
  pitch **0.04219rad**; height/pitch seam at `t=0/1` remains exact.
- `Car.update()` adds a bounded grade load from the already-synced track pitch:
  cached tangent alignment prevents sideways drift from becoming fake thrust;
  `CFG.gradeGravity=4.6`, `gradeAccel` changes speed on hills, but `Car.pos.y`
  remains zero and no height enters collision or progress.
- Player, rival, ghost, offroad pose, guardrail posts, trees, kerbs, contact
  shadow and effects follow one surface anchor; tree trunks/crowns use local
  `terrainYAt(x,z)` so crest trees do not float or valley trees sink. Render-only
  suspension, camera grade, corner-load lean, 12–22m tangent cue and bounded
  `cameraElevationLook` reset on start/build. Elevation reads an independent
  **24–42m** cached profile, entering the look target before the car reaches it.
- `Car.suspensionHeave` now adds a short, bounded chassis compression/rebound
  from pitch-rate transitions **and render-surface vertical velocity**. The
  height-rate gain is **0.065**, total heave is limited to **±0.09m**, settles at
  rate 12, resets to zero, and never enters physics, collision, progress or shadow.
- Speed layer starts at `10 m/s`; wheel-motion animates four merged wheel
  clusters; bounded effects pool covers drift marks/smoke, dust, exhaust, brake
  glow, impacts and rumble without adding a road/effects pass.
- Six tracks (three reverse), player assists/simple auto-throttle, ABS, recovery,
  rivals/ghost/season and lifecycle/context-loss contracts remain intact.

## Changed files

- `games/Racing Car/src/track.js`
- `games/Racing Car/src/tracks.js`
- `games/Racing Car/src/car.js` (bounded render-only vertical-rate heave)
- `games/Racing Car/src/main.js` (cached surface-elevation camera cue and tangent hot path)
- `games/Racing Car/src/race.js`, `games/Racing Car/src/driver.js` (cached runtime tangents)
- `games/Racing Car/tests/setup.mjs` (elevation-distance and hot-path gates),
  `games/Racing Car/tests/race.mjs`, `games/Racing Car/tests/ghost.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` (ADR-289–ADR-295), `docs/ai/HANDOFF.md`

## Verification

- `race.mjs` — **133/133**; top **148 km/h**, 0–80 **2.40s**, drift/ABS/wall/
  recovery/roll/suspension/grade gates green, zero browser errors.
- `setup.mjs` — **152/152**; six tracks, graded ribbon/offroad pose, effects,
  controls, lifecycle and visual gates green. Elevation pre-read is at least
  **23m**, cue cap **±0.18**, physics Y **0**; tree roots **130/130**, max error
  **0**; budget **16 calls / 56,933 tris**, zero browser errors. Hot-path
  `curve.getTangentAt` measured **0 calls** during a running race.
- `ghost.mjs` — **29/29**; ghost remains physics-independent (the new slope load
  is measured identically with and without the visual ghost) and the combined
  night + four rivals + ghost + effects frame stays at **18 calls / 53,253 tris**.
- Grade gate: uphill / flat / downhill 4-second full throttle =
  **30.503 / 32.895 / 35.293 m/s**, grade acceleration **−0.784 / 0 / +0.784
  m/s²**, physical Y remains **0**.
- Aggregate `RACER_TEST_SETTLE_MS=5000 node games/Racing\ Car/tests/run-all.mjs`:
  race **133/133**, setup **152/152**, rivals **61/61**, ghost **29/29**
  (readiness retry), season **55/55**, audio **33/33**.
- `node --check` on changed JS and tests — PASS; `git diff --check` — PASS.
- Real headed root-served **844×390** camera-elevation smoke (touge, no input):
  sampled `cameraElevationLook` **+0.0916/−0.0312**, 10 offroad samples while
  the car followed the unsteered curve, console **0 errors**; mobile screenshot
  reviewed as a temporary non-commit QA artifact.
- Real headed **844×390** root-served smoke after the cached-tangent pass: the
  race reached about **110 km/h** with the road ribbon, crest cue, chevrons and
  mobile controls visible; console **0 errors**. Screenshot is a temporary
  non-commit QA artifact.

## Known issues and cautions

- `trackPitch` is now an explicit, bounded physics input only through
  `gradeAccel`; do not feed `renderY` into physics or broaden grade coupling to
  collision, nearestT, checkpoints, progress or AI.
- Keep terrain as one bounded 32×32 mesh and query cache at 240 samples. Use
  `Track.tangentAtT()` for direction-only frame-loop queries; avoid per-frame
  Catmull-Rom calls, `Vector3.clone()` allocations or extra draw passes.
- The rigid GLB has no wheel bones/clips; re-profile `wheel-motion.js` if the
  car asset changes. Keep suspension follow at max `0.018/0.015rad` and camera
  lean at ±`0.032rad`.
- Do not increase wave amplitude, `gradeGravity`, engine output, camera shake or
  banking without rerunning physical gates, mobile budget and a real screenshot.
- Tree placement is a build-time visual anchor; if terrain profiles or tree
  placement change, rerun the tree-anchor gate and headed mobile smoke.
- Heave is deliberately render-only: do not use it as a gameplay height or
  increase its height-rate gain or ±`0.09m` limit without checking rigid-model
  floor clearance and mobile screenshots.
- `cameraElevationLook` is deliberately a look-target cue only: keep its limit at
  **±0.18** and keep its independent elevation pre-read within **24–42m**. Do
  not add cached elevation to physics, vehicle root, shadow, route or FOV without
  a natural crest/valley screenshot and mobile nausea check.
- Aggregate `run-all.mjs` may need `RACER_TEST_SETTLE_MS=5000` on pressured Macs;
  readiness-only retry is bounded and does not hide assertion failures.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`; read this handoff and ADR-295.
2. Run the named Racing suites plus the aggregate after any further change.
3. Run `./scripts/check-handoff.sh`, commit code and handoff together, push the
   authorized checkpoint, and verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not restore per-frame curve allocations, add draw-call-heavy passes, force-push,
  or rewrite shared `main` history.
