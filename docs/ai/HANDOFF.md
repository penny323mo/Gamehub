# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: orientation is a player setting re-decided on every signal; the stick is fixed end to end

## Current objective

Close out phone-only complaints: the game deciding its own orientation, the hub card being
too small with neighbours peeking, and steering that neither reached nor spread full lock.

## Completed

- 畫面方向 is a setting (`racer-orient`, default `portrait`), not a behaviour. 打直 renders
  into the viewport with no transform ever; 打橫 rotates `#game-root` 90° only while the
  viewport is taller than wide. No "automatic" value (ADR-074, superseding 072 and 073).
- Rotation is a class toggled by `applyOrientation()`, not a media query — the query *was*
  the automatic behaviour. The same boolean feeds `Input.setRotated()`, so touch mapping and
  CSS cannot disagree. Sizes inside the frame use `--fw`/`--fh` (swapped under `.rot90`),
  and the phone-layout media queries are scoped to `#game-root:not(.rot90)`.
- The iPhone still scrambled on rotation: iOS reports stale sizes and fires
  `orientationchange` before the viewport changes. Fixed by never measuring once (ADR-075) —
  `applyOrientation()` reads `visualViewport` and re-runs on every resize signal and on return
  from background, `orientationchange` schedules five re-decisions, the frame's size stays in
  CSS `dvw`/`dvh`, and a `ResizeObserver` re-runs `renderer.setSize()`.
- Steering reach: the stick's value comes from `dx` clamped alone (the circle only draws the
  knob), and its smoothing runs at 20/s while held. A thumb arcing 40°/60° used to lose
  23%/50% of lock, and full lock took 0.48s; both gone (ADR-076).
- Steering feel: the stick passes through `steerExpo()`, `x·(0.45+0.55x²)`. At 40 m/s, 20%
  of travel used to give 75% of maximum cornering and 40% gave 94% — the top half did
  nothing. Now 0.44/0.77/0.93 at 20/40/60% (ADR-077). Applied in `Input`, so the AI and the
  countersteer assist are untouched; ±1 passes through, so full lock is unchanged. The car
  was measured and left alone — max yaw rate and rise time are identical before and after.
- Hub carousel on phones: the card fills the frame (90% of a 440px viewport, up from 64%),
  neighbours pushed fully off-screen by a rule — a neighbour is wholly visible or wholly
  hidden, never cut — so desktop is unchanged.
- Fixed latent bugs found on the way: the menu panel's `max-height: 88vh` resolving to 743px
  in a 390px-tall rotated frame, a rotated frame taking the narrow-portrait pad layout, and a
  stray `rotatedOverride = null` in `Input.read()`.

## Changed files

- `games/Racing Car/src/settings.js`, `src/main.js`, `src/input.js`, `style.css`, `index.html`
- `games/Racing Car/tests/setup.mjs`, `tests/season.mjs`
- `style.css`, `launcher.js`, `tests/hub.mjs` (hub carousel)
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 122/122, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (398/398); `run-all` green. Hub 33/33.
- Orientation gates: at 390×844 the default gives a 390×844 frame; 打橫 gives 844×390 and
  persists; 打直 puts it back and the joystick axes swap; canvas fills the frame in every
  state; `orientationchange` never pauses.
- The iPhone bug is reproduced: a stubbed stale `visualViewport` makes the game decide wrongly
  on `orientationchange`, and it recovers within a second with no further event. Resizing
  `#game-root` with no event still resizes the canvas and drawing buffer.
- Steering gates: full reach at 0/20/40/60° all give full lock, the knob stays in the dial,
  full lock arrives in 0.13s, the curve passes ±1 through, half travel is ≤0.4. Hub gates:
  no neighbour partially visible, active card unclipped, ≥82% of a phone viewport wide.

## Remaining release gates

- Penny rotates the iPhone in both modes and confirms the picture no longer scrambles, that
  the stick reaches full lock and feels proportional, and the hub card looks right.
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
- A drift holds speed and settles; sustaining one still needs throttle and countersteer.

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
- Do not add identity, credential, or device identifiers to reports.
- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence, retry
  ADR-062's four rejected Turbo tweaks, or fold spin recovery back into the control law.
- Do not make the gyro map linear, shorten its travel below 30/sens degrees, or remove its
  smoothing (ADR-066).
- Do not add a rival difficulty setting on top of today's driver; read ADR-067 first.
- Do not charge braking to one axle's friction circle, raise `loadTransfer` back above 0.2
  (that put the rear wheels in the air, ADR-068), or make braking proportional without
  retuning the AI driver in the same pass.
- Do not let driver aids steal steering while the player holds opposite lock (ADR-069), but
  do not remove the yaw-damping floor either — that is what made the car bistable.
- Do not move the tyre peak back to 11° of slip, and do not raise the drift threshold and
  tyre peak independently (ADR-070).
- Do not turn the drift refund back into a fixed force (ADR-070).
- Do not model the handbrake as a grip multiplier alone, or raise `steerRate` without
  re-checking drift overshoot against the damping floor (ADR-071).
- Do not add audio files or allocate audio nodes per frame; keep off-race audio silent.
- Do not amend, rebase, or force-push published `main` history.
