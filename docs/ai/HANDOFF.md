# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: steering fixed end to end; a drift can now be held and is the player's to hold

## Current objective

Close out phone-only complaints (orientation deciding itself, a too-small hub card, steering
that neither reached nor spread full lock), then keep refining the physics.

## Completed

- 畫面方向 is a setting (`racer-orient`, default `portrait`), not a behaviour: 打直 renders
  into the viewport with no transform ever, 打橫 rotates `#game-root` 90° only while the
  viewport is taller than wide, and no "automatic" value exists (ADR-074, superseding 072 and
  073). Rotation is a class toggled by `applyOrientation()`, not a media query — the query
  *was* the automatic behaviour — and the same boolean feeds `Input.setRotated()`.
- The iPhone still scrambled on rotation: iOS reports stale sizes and fires
  `orientationchange` before the viewport changes. Fixed by never measuring once (ADR-075) —
  `applyOrientation()` reads `visualViewport` and re-runs on every resize signal and on return
  from background, `orientationchange` schedules five re-decisions, the frame stays sized in
  CSS `dvw`/`dvh`, and a `ResizeObserver` re-runs `renderer.setSize()`.
- Steering reach: the stick's value comes from `dx` clamped alone (the circle only draws the
  knob), smoothing at 20/s while held. A thumb arcing 40°/60° used to lose 23%/50% of lock,
  and full lock took 0.48s; both gone (ADR-076).
- Steering feel: the stick passes through `steerExpo()`, `x·(0.45+0.55x²)`. At 40 m/s, 20% of
  travel used to give 75% of maximum cornering and 40% gave 94% — the top half did nothing.
  Now 0.44/0.77/0.93 (ADR-077). Applied in `Input`, so the AI and the assist are untouched;
  ±1 passes through, so full lock and max yaw rate are unchanged.
- Drifts can be held: with the throttle down past 15° of slip the rear axle loses up to 30%
  grip, peaking at 24° and tapering to zero by 39° so it cannot drive the angle past its own
  band (ADR-078). A handbrake entry used to peak at 26° and collapse in 0.81s with the
  player's countersteer gain making no difference; it now holds 1.56s at 25° average and the
  gain sweep separates. The yaw-damping "drift window" tried first is removed — no held time
  at any setting, and it pushed the 35° overshoot 68° → 75°. A looser tuning holds 6.4s at
  36° but drops drift speed below ADR-070's floor: documented, not shipped.
- Hub carousel on phones: the card fills the frame (90% of a 440px viewport, up from 64%),
  neighbours pushed fully off-screen by a rule — wholly visible or wholly hidden, never cut.
- Fixed on the way: menu panel `max-height: 88vh` resolving to 743px in a rotated frame, a
  rotated frame taking the narrow-portrait pad layout, a stray `rotatedOverride = null`.

## Changed files

- `games/Racing Car/src/`: `settings.js`, `main.js`, `input.js`, `car.js`; plus `style.css`,
  `index.html`, `tests/setup.mjs`, `tests/season.mjs`, `tests/race.mjs`
- Hub: `style.css`, `launcher.js`, `tests/hub.mjs`; docs: `DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 104/104, setup 122/122, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (401/401); `run-all` green. AI 0–0.3% off-road on all six circuits. Hub 33/33.
- Orientation gates: 打直/打橫 give the right frame at 390×844 and persist, the joystick axes
  swap with them, the canvas fills the frame, and `orientationchange` never pauses. The iPhone
  bug is reproduced — a stubbed stale `visualViewport` makes the game decide wrongly, and it
  recovers within a second with no further event; resizing `#game-root` with no event at all
  still resizes the canvas and drawing buffer.
- Steering gates: full reach at 0/20/40/60° all give full lock, the knob stays in the dial,
  full lock arrives in 0.13s, the curve passes ±1 through, half travel is ≤0.4. Drift gates:
  held ≥1.3s from a phone-shaped entry, settled 25–40°, and shorter with `driftPower` at 0.
  Hub gates: no neighbour partially visible, active card unclipped, ≥82% of a viewport wide.

## Remaining release gates

- Penny rotates the iPhone in both modes: picture stable, stick reaching full lock and
  proportional, hub card right, and a drift that now holds.
- Penny re-tries gyro: is the travel and direction right at her stored sensitivity 1.4?
- Penny drives the new braking: straight braking stays straight, corner braking rotates.
- Penny checks audio balance, then taps 複製報告 and pastes the one-line report.

## Known issues and cautions

- 打橫 mode is a CSS transform: anything reading pointer coordinates must go through
  `Input.localPoint()` (rect-based hit tests are already correct).
- Inside `#game-root` use `--fw`/`--fh`, never `vw`/`vh`: under `.rot90` they are swapped.
- Hub cards are sized in `%` of the carousel frame, not `vw`: outer padding eats 42px a side,
  so `vw` overflows the clipping frame.
- ADR-062's rejected attempts stay rejected; ADR-065 supersedes only its Turbo decision.
- Brake force is demand, not delivered force; any change must retune `SKILLS.brakeA` too.
- A drift now holds, but only with the throttle down; ADR-070's 70% speed floor is what caps
  how long, and raising the cap means revisiting that rule with Penny.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-074 to ADR-076
   and ADR-068 to ADR-071.
2. Penny sends the copied phone report plus judgements: which 畫面方向 she settled on and
   whether it behaves, gyro direction and sensitivity, audio balance. Tune only those.

## Do not redo

- Do not reintroduce a portrait pause, a rotate prompt, an "automatic" third orientation
  value, or code that changes 畫面方向 for the player (ADR-074, superseding 072 and 073).
- Do not read raw `clientX/clientY` for in-game positioning; use `Input.localPoint()`.
- Do not decide the orientation from one measurement, and do not size `#game-root` from JS
  pixels — both make the frame depend on an event arriving on time (ADR-075).
- Do not clamp the steering stick into a circle, and do not smooth an analogue stick input;
  the car is not what limits the turn (ADR-076).
- Do not fix the steering curve by shrinking `steerMax` or steepening `steerSpeedDrop`: that
  removes the lock needed to catch a slide and changes what the AI's commands mean (ADR-077).
- Do not try to lengthen a drift with yaw damping; it buys nothing and costs overshoot. The
  rear axle under throttle is the lever (ADR-078).
- Do not add identity, credential, or device identifiers to reports.
- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence, retry
  ADR-062's four rejected Turbo tweaks, or fold spin recovery back into the control law.
  Do not make the gyro map linear or remove its smoothing (ADR-066).
- Do not add a rival difficulty setting on top of today's driver; read ADR-067 first.
- Do not charge braking to one axle's friction circle, raise `loadTransfer` above 0.2 (that
  put the rear wheels in the air, ADR-068), or change braking without retuning the AI.
- Do not let aids steal steering while the player holds opposite lock (ADR-069), but do not
  remove the yaw-damping floor either — that is what made the car bistable.
- Do not move the tyre peak back to 11°, raise the drift threshold and tyre peak
  independently, or turn the drift refund back into a fixed force (ADR-070).
- Do not model the handbrake as a grip multiplier alone, or raise `steerRate` without
  re-checking drift overshoot (ADR-071). Do not add audio files or per-frame audio nodes.
- Do not amend, rebase, or force-push published `main` history.
