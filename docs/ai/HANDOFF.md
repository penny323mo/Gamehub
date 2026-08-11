# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car graded-surface, wheel-motion and contact-shadow pass
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
  samples. Player, rival and ghost render poses follow `renderY`, banking and
  pitch; physics remains the established X/Z bicycle model.
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
- Existing sport-arcade envelope, auto-throttle/simple controls, drift assists,
  speed layer, bounded effects, rivals/ghost/season and lifecycle contracts are
  unchanged.

## Changed files

- `games/Racing Car/src/track.js`
- `games/Racing Car/src/tracks.js`
- `games/Racing Car/src/main.js`
- `games/Racing Car/src/car.js`
- `games/Racing Car/src/wheel-motion.js`
- `games/Racing Car/src/rivals.js`
- `games/Racing Car/style.css`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/DECISIONS.md` (ADR-273, ADR-274, ADR-275, ADR-276, ADR-277, ADR-278, ADR-279)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` on `main.js` and `setup.mjs` — PASS.
- `git diff --check` — PASS.
- `race.mjs` — **126/126**; six tracks, top **146 km/h**, 0–80 **2.40s**,
  drift/ABS/wall/recovery/roll gates green, zero browser errors.
- `setup.mjs` — **145/145**; closed height/pitch seam, terrain/guardrail pose,
  contact-shadow pitch/bank, mobile layout/touch/gyro, day/night, lifecycle/context loss,
  draw budget, speed-layer opacity, 6–14 landmark placement/material/draw gates,
  four-wheel spin/steering regression and zero
  browser errors. Latest full-world read: **16 calls／56,933 tris**; effects
  remain **17 calls**.
- `rivals.mjs` — **61/61**; four AI rivals, ranking, minimap, instancing and
  lat-G gates green, zero browser errors.
- `ghost.mjs` — **29/29**; recording/interpolation/render budget and zero errors.
- `season.mjs` — **55/55**; championship persistence and career records green.
- `audio.mjs` — **33/33**; lifecycle and non-finite physics fallback green.
- Real browser grade smoke: 844×390 at **135 km/h**, `surfaceY` **−0.117m**,
  track pitch **−0.0195rad**, body pitch **−0.028rad**, zero page/console
  errors; screenshot `/tmp/racing-elevation-v4.png`. 320×568 portrait at
  **111 km/h** reads pitch **−0.0206rad**, stick/gas stay inside viewport;
  screenshot `/tmp/racing-elevation-portrait-v4.png`.
- 844×390 real browser audit aimed at a naturally generated landmark position;
  the orange chevron reads as an upright sign with a visible short stem:
  `/tmp/racing-landmark-pole-audit.png`. Placement is separately guarded by
  setup (17.48–17.58m lateral, ≥0.97m above the local banked surface).
- 844×390 side-view browser audits: wheels coherent at **25m/s** (spin
  **−11.22rad**, steering **0.39rad**) and a **104 km/h** drive follows graded
  shadow pose; screenshots `/tmp/racing-wheel-side-audit.png`, `/tmp/racing-contact-shadow-drive-audit.png`.
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
- Aggregate `run-all.mjs` is bounded but can still report `TIMEOUT` when several
  Chromiums launch under Mac pressure; rerun the named suite separately.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` and read this handoff plus ADR-279.
2. Inspect `/tmp/racing-wheel-side-audit.png` and the portrait grade smoke at
   phone-sized scale; keep wheel and contact-shadow animation render-only and budget-neutral.
3. For any further change, rerun the named Racing suites, update this handoff,
   run `./scripts/check-handoff.sh`, then commit/push the verified checkpoint.

## Do not redo

- Do not restore per-frame `curve.getPointAt()` or `pos.clone()` allocations.
- Do not replace the existing asphalt texture marker with another draw call.
- Do not force-push or rewrite shared `main` history.
