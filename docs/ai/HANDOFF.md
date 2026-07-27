# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `d9155ff`
Status: Racing Car mobile-control and drivability checkpoint complete

## Current objective

Refine Racing Car against Penny's real-phone feedback: less obstructive car scale,
modern continuous thumb controls, responsive launch acceleration, wider tracks, and
working day/dusk/night selection.

## Completed

- Reduced the player GLB from 10.35 to 6.9 visual units (one-third smaller) without
  changing collision, wheelbase, camera rules, or other physics dimensions.
- Expanded all road surfaces from 24 to 28 world units. Guardrails remain at the same
  offset; two grass units per side were converted into drivable road.
- Added low-speed launch torque that fades back to the proven 8,500N engine output by
  25m/s. Deterministic 0–80km/h is now 2.98 seconds without increasing high-speed force.
- Replaced circle-only steering activation with a larger floating left-thumb zone.
  Steering begins anywhere in that zone and pointer capture keeps it active outside both
  the visible circle and the zone until release/interruption.
- Enlarged gas from 92px to 108px in the standard layout and rebuilt the three actions as
  a modern primary/secondary arc. Holding gas and sliding left selects brake; sliding
  left-up selects drift; sliding back selects gas without releasing the pointer.
- Fixed the time-of-day UI root cause: day/dusk/night buttons had no click listeners.
  All three now update scene lighting/sky, selection state, and persisted storage.
- Added regression coverage for track width, car scale, 0–80 launch, real time-button
  clicks, floating steering, gas-to-brake/drift sliding, capture loss, and layout overlap.
  See ADR-042.

## Changed files

- `games/Racing Car/index.html`, `style.css`
- `games/Racing Car/src/input.js`, `car.js`, `track.js`, `main.js`
- `games/Racing Car/tests/race.mjs`, `setup.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 46/46 and setup 52/52 (98/98).
- All three autopilots completed three laps. Coast improved to 5% off-road, 9 wall-hit
  frames, and zero rescues; Turbo/Touge had zero off-road and zero rescues.
- Resource gate remained 14 draw calls, 54,203 triangles, 14 geometries, 4 textures.
- Headed Chromium smoke at 844×390 and 320×568 confirmed complete circular controls,
  the larger primary gas button, readable HUD, widened road, and 6.9-unit car.
- Browser touch-pointer smoke observed gas → brake → drift → released states correctly.
- Actual menu clicks returned day `8fc7ef`, dusk `f0a06a`, and night `141c30`, with
  matching persisted values. Only the pre-existing root favicon 404 appeared.

## Known issues and cautions

- Desktop Chromium and emulation do not certify phone heat, Safari home-indicator feel,
  gyro feel, or a sustained physical-device lap.
- Keep the wider road's guardrail offset unchanged unless self-clearance is re-audited.
- Gas sliding uses directional sectors deliberately, so the gesture does not drop while
  the thumb crosses the visual gap between circular buttons.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads this checkpoint.
2. Start the next visual/gameplay phase from this baseline; do not redo this control pass.
3. On a future physical-phone check, verify one full lap, gas-slide comfort, rotation /
   background recovery, and paste the privacy-safe performance report if tuning is needed.

## Do not redo

- Do not restore the 10.35-unit car, 24-unit road, fixed circle-only steering, or isolated
  gas pointer unless Penny explicitly requests a reversal.
- Do not remove safe-area handling, pointer capture/loss reset, first-frame warm-up,
  adaptive DPR, interruption pause, or privacy-safe reporting.
- Do not infer physical-device success from desktop emulation.
- Do not amend, rebase, or force-push published `main` history.
