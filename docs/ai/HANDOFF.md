# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car offroad feedback and test-harness cleanup pass
Integration branch: `main`
Work branch: `main`
Status: Racing source, tests, browser smoke and docs are ready for the next
verified `main` checkpoint. The receiving agent must sync GitHub before edits.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive
but bounded bicycle physics, readable high-speed/drift feedback, believable
ground contact, track-specific visual landmarks, stable frame pacing, and real
browser evidence for every visual or control change.

## Completed

- The render-only track surface now uses closed integer-frequency elevation waves;
  the seam at `t=0/1` has matching height and longitudinal pitch instead of a
  hidden step at the loop boundary.
- `Track.surfacePitchAtT()` derives a clamped local-X slope from the existing 240
  samples. Player, rival, ghost and offroad render poses follow `renderY`, banking
  and pitch; physics remains the established X/Z bicycle model.
- Guardrail posts now use the same lateral surface height as their tubes, and
  trackside tree trunks/crowns are anchored to the terrain base instead of a
  fixed world Y. This removes the visible floating/sinking mismatch on hills.
- Elevation is now track-specific and visibly graded without adding geometry:
  `tracks.js` supplies a bounded `elevation` multiplier (turbo 1.00, coast 0.84,
  touge 1.16). Default turbo setup measures surface **−1.509…+1.509m**, bank
  cap **0.055rad**, maximum sampled pitch **0.0191rad**; terrain remains one
  32×32 mesh and the seam is still exact.
- The speed layer now starts at `10 m/s` instead of `16 m/s`, reaches stronger
  readable intensity by roughly 80 km/h, and has a slightly clearer gradient;
  it remains pointer-transparent, HUD-safe, render-only and draw-call neutral.
- Each track now builds 6–14 render-only outside-corner chevron signs from its
  sampled curvature. The high-contrast face and short integral stem share one
  `corner-chevron-landmarks` InstancedMesh; signs use orange/cyan/yellow track
  palettes, sit about 17.5m outside the ribbon and inside the guardrail, and
  stay independent from physics, AI and checkpoints.
- `wheel-motion.js` now classifies four low-level wheel clusters inside the rigid
  GLB and updates only their merged position/normal vertices: speed-driven spin
  plus smoothed front-wheel steering; the single contact-shadow plane follows
  render pitch/bank too, with no new mesh or draw call.
- Offroad render feedback now adds a speed-limited, render-only camera rumble on
  top of terrain-anchored pose and dust. It reuses the existing effects shake path,
  caps at `0.024`, and does not alter physics or draw calls.
- Existing sport-arcade envelope, auto-throttle/simple controls, drift assists, speed
  layer, terrain/effects anchors, rivals/ghost/season and lifecycle contracts unchanged.

## Changed files

- `games/Racing Car/src/track.js`
- `games/Racing Car/src/tracks.js`
- `games/Racing Car/src/main.js`
- `games/Racing Car/src/car.js`
- `games/Racing Car/src/wheel-motion.js`, `games/Racing Car/src/driving-effects.js`
- `games/Racing Car/src/rivals.js`
- `games/Racing Car/style.css`
- `games/Racing Car/tests/setup.mjs`, `games/Racing Car/tests/lib/harness.mjs`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/DECISIONS.md` (ADR-273 through ADR-283)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` on `main.js`, `driving-effects.js`, `setup.mjs`, `tests/lib/harness.mjs` — PASS.
- `git diff --check` — PASS.
- `race.mjs` — **126/126**; six tracks, top **146 km/h**, 0–80 **2.40s**,
  drift/ABS/wall/recovery/roll gates green, zero browser errors.
- `setup.mjs` — **147/147**; terrain/offroad pose, contact shadow/effects, mobile
  controls, day/night, lifecycle/context loss, landmarks, four-wheel motion and
  offroad rumble (`shake=0.0075`) all green; zero browser errors, **16 calls／56,933
  tris**, effects **17 calls**.
- `rivals.mjs` — **61/61** last verified before this render-only patch; current retry
  hit the 90s readiness timeout before assertions. `ghost.mjs` (**29/29**), `season.mjs`
  (**55/55**) and `audio.mjs` (**33/33**) remain last-verified; rerun separately later.
- Real browser grade smoke: 844×390 at **135 km/h**, `surfaceY` **−0.117m**, pitch
  **−0.0195rad**, body pitch **−0.028rad**; portrait 320×568 at **111 km/h** keeps
  stick/gas inside viewport. Screenshots `/tmp/racing-elevation-v4.png`, `/tmp/racing-elevation-portrait-v4.png`.
- 844×390 real browser audit aimed at a naturally generated landmark position;
  the orange chevron reads as an upright sign with a visible short stem:
  `/tmp/racing-landmark-pole-audit.png`. Placement is separately guarded by
  setup (17.48–17.58m lateral, ≥0.97m above the local banked surface).
- 844×390 audits cover wheels (**25m/s**), graded shadow drive, anchored drift/brake
  glow and grass exit: `/tmp/racing-wheel-side-audit.png`, `/tmp/racing-contact-shadow-drive-audit.png`,
  `/tmp/racing-steer-drift-surface-anchored.png`, `/tmp/racing-brake-glow-audit.png`,
  `/tmp/racing-offroad-terrain-audit.png`. Direct rumble smoke reads **84 km/h**,
  `offroad=true`, `renderY=terrainY=-1.103m`, `terrainBlend=0.412`, `shake=0.0126`,
  one dust particle.
## Known issues and cautions

- `renderY`, `trackBank` and `trackPitch` are render-only. Never feed them into
  `Car.pos`, collision, nearestT, checkpoints, progress, speed or AI decisions.
- Keep the terrain as one bounded 32×32 mesh and the query cache at 240 X/Z
  samples. Do not add per-frame curve allocations or a second road pass.
- The rigid GLB has no wheel bones/clips; `wheel-motion.js` is a model-specific
  render heuristic and must be re-profiled if the car asset changes.
- Do not increase engine output, camera shake, body roll/pitch, elevation or
  banking without rerunning the physical drift/ABS gates, mobile draw budget and
  a real screenshot at the affected viewport.
- Keep the speed layer low-contrast and pointer-transparent; its intensity must
  not become a physics or input dependency.
- Aggregate `run-all.mjs` can report `TIMEOUT` under Mac pressure; rerun named suites
  separately. The harness now closes browser and HTTP server on readiness failure, so
  a timeout does not contaminate the next suite.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` and read this handoff plus ADR-283.
2. Rerun `rivals.mjs`, `ghost.mjs`, `season.mjs` and `audio.mjs` separately when
   Chromium pressure clears; keep rumble render-only and budget-neutral.
3. For any further change, rerun the named Racing suites, update this handoff,
   run `./scripts/check-handoff.sh`, then commit/push the verified checkpoint.

## Do not redo

- Do not restore per-frame `curve.getPointAt()` or `pos.clone()` allocations.
- Do not replace the existing asphalt texture marker with another draw call.
- Do not force-push or rewrite shared `main` history.
