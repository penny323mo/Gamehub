# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `cc27481`
Status: Racing Car bounded driving-feedback and larger-steering checkpoint complete

## Current objective

Continue upgrading Racing Car gameplay, visuals, physics, tracks, and time-of-day from
the mobile environment checkpoint while keeping browser-visible behavior measurable.

## Completed

- Added `driving-effects.js`, one fixed-capacity instanced shader layer shared by 128
  fading skid-mark slots and 48 smoke, dust, and impact-particle slots. The circular
  pools never grow and the complete layer costs one draw call when visible.
- Drift now lays two narrow rear-wheel tracks at distance intervals and emits sparse,
  soft tyre smoke. Off-road speed emits dust without creating per-particle objects.
- Car collision now exposes the actual inward impact speed as `wallImpact`; strong hits
  trigger bounded sparks and a short exponentially decaying camera shake. Effects do
  not feed back into physics, scoring, collision, or race state.
- Starting a race or changing track clears the complete effects pool so no old marks,
  particles, or shake survive into the next run.
- Enlarged the floating left steering disc from 136px to 156px in 844px landscape and
  from 108px to 118px at 320px portrait. The round knob grows with it; pointer capture,
  out-of-circle continuation, safe-area placement, and right-thumb controls are intact.
- Added collision-output, effect-capacity, reset, one-draw budget, and enlarged-control
  regression gates. See ADR-044.

## Changed files

- `games/Racing Car/src/driving-effects.js` (new)
- `games/Racing Car/src/car.js`, `main.js`
- `games/Racing Car/style.css`
- `games/Racing Car/tests/race.mjs`, `setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md`, `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 47/47 and setup 59/59
  (106/106).
- All three autopilots completed three laps; Coast remained 5% off-road with nine
  wall-hit frames and zero rescues; Turbo/Touge remained zero-rescue.
- High-speed rail gate measured 18.22m/s inward impact; slow stuck-car rescue remained
  separate and still recovered onto the road.
- Busy night with marks/particles: 17 draw calls and 55,179 triangles, below `<18` /
  `<120k`; pools stayed fixed at 128 marks + 48 particles and reset to zero.
- Headed Chromium keyboard drift at 844×390 reached 104km/h with `drifting=true`, 104
  marks, nine live particles, and no console error. Visual inspection rejected the first
  dotted-smoke/thick-track pass; the final pass uses soft sparse smoke and two thin tracks.
- Fresh-cache headed Chromium at 844×390 measured steering 156×156, knob 64×64, gas
  108×108, all circular and inside the viewport. Automated 320×568 measured steering
  118×118 with all actions inside the viewport and no pause/HUD overlap.

## Known issues and cautions

- Desktop Chromium cannot certify physical-phone heat, Safari blend behavior, haptics,
  or sustained device pacing; use the in-game privacy-safe performance report on phone.
- Skid marks are intentionally capped and overwrite the oldest segments after 128 slots;
  particles likewise overwrite after 48. Do not replace this with unbounded meshes.
- Camera shake is visual only and deliberately brief. Keep collision response in
  `car.js`; do not make render effects alter movement or scoring.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads this checkpoint.
2. Continue the next coherent gameplay, track, physics, or visual phase from ADR-044;
   preserve the fixed-capacity feedback layer and remeasure the mobile budget.
3. On a physical phone, compare drift readability and performance in day and night and
   retain the in-game report if device-specific tuning is needed.

## Do not redo

- Do not restore per-frame overlapping thick skid segments or the dotted opaque smoke.
- Do not allocate a mesh/material per particle or leave effects alive across restarts.
- Do not shrink the 156px landscape / 118px narrow steering disc without Penny asking.
- Do not restore the 10.35-unit car, 24-unit road, fixed-circle-only steering, or isolated
  gas pointer unless Penny explicitly requests a reversal.
- Do not remove safe-area, capture-loss, warm-up, adaptive-DPR, or interruption recovery.
- Do not infer physical-device success from desktop emulation.
- Do not amend, rebase, or force-push published `main` history.
