# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: turn-in, drift hold and simple-mode throttle all rebuilt around measurements

## Current objective

Close out phone-only complaints (orientation, hub card, steering reach), then raise playability.

## Completed

- 畫面方向 is a setting (`racer-orient`, default `portrait`), not a behaviour: 打直 never
  transforms, 打橫 rotates `#game-root` 90° only while the viewport is taller than wide, and no
  "automatic" value exists (ADR-074). iOS still scrambled because it reports stale sizes and
  fires `orientationchange` early, so nothing measures once any more (ADR-075):
  `applyOrientation()` reads `visualViewport`, re-runs on every resize signal and on waking,
  `orientationchange` schedules five re-decisions, and a `ResizeObserver` re-sizes the buffer.
- Steering reach (ADR-076): the value comes from `dx` clamped alone (the circle only draws the
  knob), smoothing at 20/s. A thumb arcing 40°/60° used to lose 23%/50% of lock.
- Turn-in (ADR-079, reverting ADR-077's expo curve, which cost mid-stick authority): the stick
  is unshaped and the front axle gains up to 70% grip while the throttle is not negative, the
  handbrake is off and slip is under 8°. `t45` (straight line to 45° of heading) at half stick
  1.91/2.02/2.17s → 1.25/1.38/1.70s at 14/22/30 m/s; full lock at 30 m/s 1.66 → 1.49s. The 8°
  window keeps it out of braking-into-a-corner and out of any slide, so the 35° overshoot
  (68°), drift speed (76%) and handbrake entry (34°) are unchanged. `gripFront` unconditionally
  broke eleven gates; every other lever bought ≤0.04s.
- Drifts hold (ADR-078): past 15° of slip with the throttle down, the rear axle loses up to 30%
  grip, peaking at 24° and tapering to zero by 39° so it cannot drive the angle past its band.
  A handbrake entry used to peak at 26° and collapse in 0.81s with the countersteer gain making
  no difference; it now holds 1.56s at 25° average and the gain sweep separates. The yaw-damping
  "drift window" tried first is removed — no held time at any setting, and it cost overshoot.
- 簡易模式 (the default) no longer pins the throttle at 1.0: it is `1 - 0.4·|steer|`, so full
  lock leaves 60% (ADR-080). Full throttle spends 86% of the rear friction circle
  longitudinally, leaving 51% of lateral grip; 60% leaves 85%. One 90° corner at 28 m/s and
  full lock took 107 m of travel, now 72 m — on a 15 m road, wall versus corner.
- Grazing a wall no longer ends the race (ADR-081). A 10° contact at 30 m/s took the car from
  108 km/h to 0 and left it at 1 km/h three seconds later — worse than a 25° hit (42). Now only
  the along-wall component is scaled (0.97) and the heading turns 25% toward the tangent: the
  10° graze bottoms at 34 km/h and is back to 70 in three seconds. Off-road left alone.
- Hub carousel on phones: the card fills 90% of a 440px viewport (was 64%); neighbours wholly
  visible or wholly hidden. Also fixed: `max-height: 88vh` → 743px in a rotated frame, a rotated
  frame taking the narrow-portrait pad layout, a stray `rotatedOverride`.

## Changed files

- `games/Racing Car/src/`: `settings.js`, `main.js`, `input.js`, `car.js`; plus `style.css`,
  `index.html`, `tests/setup.mjs`, `tests/season.mjs`, `tests/race.mjs`
- Hub: `style.css`, `launcher.js`, `tests/hub.mjs`; docs: `DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 111/111, setup 125/125, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (411/411); `run-all` green. AI 0–0.3% off-road on all six circuits. Hub 33/33.
- Orientation gates: 打直/打橫 give the right frame at 390×844 and persist, the joystick axes
  swap, the canvas fills the frame, `orientationchange` never pauses, a stubbed stale
  `visualViewport` recovers within a second, and resizing `#game-root` with no event still
  resizes the drawing buffer.
- Steering gates: full reach at 0/20/40/60° gives full lock in 0.10s; half-stick `t45`
  ≤1.45/1.55/1.80s, full lock ≤1.55s, killing the boost slows both; simple-mode lift is
  proportional with 0.6 at full lock and −1 under braking. Drift gates: held ≥1.3s, settled
  25–40°, shorter at `driftPower` 0. Hub: neighbours hidden, card unclipped and ≥82% wide.

## Remaining release gates

- Penny drives the new turn-in and auto-lift: half-stick biting, corners makeable, drift
  holding. Levers if short: `turnInBoost`, `AUTO_LIFT`, drift-speed floor. Gyro unconfirmed.
- Penny checks the new braking (straight stays straight, corner rotates) and audio balance,
  then taps 複製報告 and pastes the one-line report.

## Known issues and cautions

- 打橫 mode is a CSS transform: anything reading pointer coordinates must go through
  `Input.localPoint()` (rect-based hit tests are already correct).
- Inside `#game-root` use `--fw`/`--fh`, never `vw`/`vh`: under `.rot90` they are swapped.
- Hub cards are sized in `%` of the carousel frame, not `vw`: outer padding eats 42px a side,
  so `vw` overflows the clipping frame.
- ADR-062's rejected attempts stay rejected; ADR-065 supersedes only its Turbo decision. Brake
  force is demand, not delivered; any change must retune `SKILLS.brakeA` too.
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
- Do not put a curve back on the stick, raise `gripFront` unconditionally, or lower
  `steerSpeedDrop` below 2.4 — all measured, all cost more than they buy. Turn-in belongs to
  the 8°-windowed front-grip assist (ADR-079).
- Do not lengthen a drift with yaw damping; it buys nothing and costs overshoot (ADR-078).
- Do not add identity/credential/device identifiers to reports, raise body roll past 3.5°, or
  roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064), flip gyro
  signs or tune sensitivity/audio without physical-device evidence, retry
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
