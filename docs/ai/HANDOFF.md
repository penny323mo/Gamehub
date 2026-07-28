# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `5ceff2d`
Status: verified Codex's arcade-controls checkpoint; fixed one championship attribution bug

## Current objective

Verify `5ceff2d` by measurement rather than by reading its handoff, and repair whatever
the verification finds.

## Completed

- Re-ran every suite from a clean sandbox: race 49/49, setup 76/76, rivals 47/47,
  ghost 29/29, season 49/49 — matching `5ceff2d`'s claimed 250/250 exactly.
- Probed the new arcade assists directly instead of trusting the combined figure.
  With yaw damping and traction cut disabled, countersteer alone is small but correctly
  signed and exactly mirror-symmetric; the spin-arresting work comes from yaw damping
  (28.2° peak slip to 25.7°). Handbrake input produces zero assist steer, as designed.
- Confirmed simple mode cannot creep before the lights: `main.js` feeds a zeroed command
  unless `race.state === 'racing'`, so auto throttle only exists during a race.
- Found and fixed a real bug: `record()` credited a result to whatever circuit the season
  had advanced to, not the circuit raced. Using 再跑一次 mid-championship filed the replay
  of circuit one under circuit two, consumed a scheduled round, and left the last circuit
  never raced — and ADR-057's per-circuit career store recorded the same wrong circuit.
- `record(rows, trackId)` now rejects a mismatched circuit, `showFinish` passes the raced
  circuit, and the finish panel says 練習賽 · 唔計入錦標賽 instead of claiming a saved round.
- Added ADR-058 and a season regression test that fails on the previous behaviour.

## Changed files

- `games/Racing Car/src/season.js`, `src/main.js`
- `games/Racing Car/tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- `node run-all.mjs`: PASS — race 49/49, setup 76/76, rivals 47/47, ghost 29/29,
  season 53/53 (254/254). Season gained four assertions.
- The new test drives a three-circuit season: a normal finish counts; replaying the same
  circuit returns null, leaves `round` and `currentTrack` untouched, and adds nothing to
  the per-circuit career store; the following scheduled race resumes normally, leaving
  results filed as `turbo,coast`.
- Assist isolation measurements (headless, deterministic slides at 25 m/s): mirrored
  spin cases produced identical magnitudes with opposite signs, so no axis-sign error.

## Known issues and cautions

- Still unconfirmed on Penny's own phone: gyro at 1.4 / ±16°, simple mode feel, the
  rebuilt touch cluster, steering direction, and rival pace. Every one of these needs a
  physical device; desktop Chromium cannot settle them.
- 再跑一次 mid-championship is now explicitly a practice run. If Penny would rather it
  re-run the scheduled circuit, that is a UI decision, not a bug fix — ask first.
- Career per-circuit records count championship races only, not standalone races.
- The sandbox network policy blocks `penny323mo.github.io`, so only the deploy workflow
  result is checkable from here, never the live page.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-058.
2. Get phone evidence for gyro sensitivity and simple mode before tuning either further.
3. Continue one coherent gameplay phase while preserving both championship storage
   lifecycles and the combined mobile render-budget gate.

## Do not redo

- Do not credit a championship round without checking the circuit raced (ADR-058).
- Do not read a running season's schedule from current settings; use its stored `trackIds`.
- Do not move archive creation out of `record()` or let season reset clear archive/career.
- Do not apply player assists to AI commands; `driver.js` already countersteers.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not advance progress from a getter/HUD, replay ghost frame-by-frame, or give action
  buttons individual pointer capture (ADR-048 to ADR-050).
- Do not flip steering/gyro signs without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
