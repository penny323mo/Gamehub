# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: 畫面方向 is a two-value player setting; nothing rotates or pauses on its own

## Current objective

Penny's third and final word on orientation: "不如設置成只可以手動切換橫向定直向" — make it a
manual switch, no automatic behaviour at all.

## Completed

- Added the 畫面方向 setting (`racer-orient`, default `portrait`). 打直 renders into the
  viewport with no transform ever; 打橫 renders into a landscape frame, rotating
  `#game-root` 90° only while the viewport is taller than wide (ADR-074).
- Rotation is now a class (`.rot90`) toggled by `applyOrientation()`, not a media query —
  the media query was the automatic behaviour. The same boolean goes into
  `Input.setRotated()`, so touch mapping and CSS cannot disagree; `Input` no longer reads
  `matchMedia` itself.
- Layout inside the frame is measured against the frame: `#game-root` defines `--fw`/`--fh`
  (swapped under `.rot90`) and every proportional size uses them instead of `vw`/`vh`; the
  phone-layout media queries are scoped to `#game-root:not(.rot90)`, with a rotated
  equivalent of the short-side rule keyed on viewport width.
- Fixed two latent bugs this exposed in ADR-073's shipped state: the menu panel's
  `max-height: 88vh` resolved to 743px inside a 390px-tall rotated frame, and a rotated
  landscape frame was taking the narrow-portrait pad layout.
- Removed a stray `this.rotatedOverride = null` that had landed inside `Input.read()`'s
  gyro branch, where it ran every frame.
- `screen.orientation.lock('landscape')` is attempted only when the setting is 打橫.

## Changed files

- `games/Racing Car/src/settings.js`, `src/main.js`, `src/input.js`, `style.css`, `index.html`
- `games/Racing Car/tests/setup.mjs`, `tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 112/112, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (388/388); `run-all` green. Hub 23/23 unchanged.
- T4b now gates the switch itself: default at 390×844 gives a 390×844 frame,
  `rotated === false`, canvas aspect below 1; tapping 打橫 gives 844×390, `rotated === true`,
  aspect above 1, and persists; tapping 打直 puts it back and the joystick axes swap with it.
  `orientationchange` pauses in neither mode.
- Headed Chromium at 390×844: 打直 frame [390,844]; 打橫 frame [844,390] with the menu panel
  at 420×343 inside it (the `--fh` fix — it was 743px tall before); 打橫 on an 844×390
  device does not rotate at all.

## Remaining release gates

- Penny picks 打直 or 打橫 on her phone and confirms the picture behaves and the steering
  still reads the way her thumb moves in whichever she picked.
- Penny re-tries gyro on her phone: is the new travel (full lock at about 21° at her stored
  sensitivity 1.4) and the finer middle range better, and is the direction correct?
- Penny drives the new braking: straight-line braking should stay straight, and braking into
  a corner should rotate progressively with more steering.
- Penny listens to the synthesized engine, tyre, wind, collision, and event balance.
- Penny drives a representative run, returns to the menu, taps 複製報告, and pastes the
  one-line report. That single line proves the settings used alongside performance.

## Known issues and cautions

- 打橫 mode is a CSS transform, so anything new that reads pointer coordinates must go
  through `Input.localPoint()`, and anything that positions an element from `clientX/Y` must
  account for it. Rect-based hit tests are already correct.
- Inside `#game-root`, use `--fw`/`--fh`, never `vw`/`vh`: under `.rot90` they are swapped
  and the viewport units point at the wrong edge.
- ADR-062's rejected tuning attempts remain rejected; ADR-065 supersedes only its decision
  to keep Turbo reversed out, not its measurements.
- Brake force is now demand, not delivered force; delivered force comes from the friction
  circle. Any further change to it must retune `SKILLS.brakeA` in the same pass.
- A drift now holds speed and settles rather than snapping, but it still needs throttle and
  countersteer coordination to sustain past a few seconds. Whether that is the right
  difficulty is Penny's call on a phone, not a desktop measurement.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-074 and
   ADR-068 to ADR-071.
2. Penny sends the copied physical-phone report plus short judgements: which 畫面方向 she
   settled on and whether it behaves, gyro direction, sensitivity (slow/right/fast), and
   audio balance. Tune only contradicted items.

## Do not redo

- Do not reintroduce a portrait pause, a rotate prompt, an "automatic" third orientation
  value, or any code that changes 畫面方向 on the player's behalf (ADR-074, superseding
  ADR-072 and ADR-073). Three attempts failed for the same reason: the game deciding.
- Do not read raw `clientX/clientY` for in-game positioning; use `Input.localPoint()`.
- Do not add user-agent, identity, credential, or persistent device identifiers to reports.
- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence.
- Do not retry the four rejected Turbo-reversed constant tweaks in ADR-062.
- Do not fold spin recovery back into the racing control law (ADR-065).
- Do not make the gyro map linear again, shorten its travel below 30/sens degrees, or
  remove its smoothing (ADR-066).
- Do not add a rival difficulty setting on top of today's driver; read ADR-067 first.
- Do not charge braking to one axle's friction circle, and do not raise `loadTransfer`
  back above 0.2 — that is what put the rear wheels in the air (ADR-068).
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not let driver aids steal steering while the player holds opposite lock (ADR-069),
  but do not remove the yaw-damping floor either — that is what made the car bistable.
- Do not move the tyre peak back to 11° of slip, and do not raise the drift threshold
  and tyre peak independently of each other (ADR-070).
- Do not turn the drift refund back into a fixed force; it must stay bounded by the speed
  actually scrubbed, or drifting becomes faster than driving straight (ADR-070).
- Do not model the handbrake as a grip multiplier alone, and do not raise `steerRate`
  without re-checking drift overshoot against the damping floor (ADR-071).
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
