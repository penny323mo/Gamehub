# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `9174142`
Status: game frame is permanently landscape; orientation no longer affects the race at all

## Current objective

Penny's clarification: the game must never change direction because of the phone. Not a
better pause, not a nicer prompt — no orientation reaction of any kind.

## Completed

- `#game-root` now rotates itself. In `(orientation: portrait)` CSS swaps its dimensions
  and applies `rotate(90deg) translateY(-100%)` about the top-left corner, so the game
  fills a portrait viewport sideways and always looks landscape (ADR-073).
- Deleted the rotate prompt (markup, CSS) and the portrait pause from ADR-072. Portrait no
  longer pauses, prompts, or clears input; `applyOrientation()` only re-runs `resize()`
  because the frame's width and height swap. `screen.orientation.lock('landscape')` is
  still attempted at race start, now only as a convenience.
- Touch coordinates are mapped into the rotated frame: `Input.rotated` reads the same media
  query, `Input.localPoint()` converts a screen point to game-frame coordinates, and the
  joystick's `placeBase`/`move` use it. Buttons are untouched — their hit test uses
  screen-space rectangles the browser has already transformed. `setRotated()` lets tests
  force either frame.
- Re-pointed two older gates that measured screen-space rectangles in a 320×568 viewport;
  the shape a phone presents this game is 568×320.

## Changed files

- `games/Racing Car/style.css`, `index.html`, `src/main.js`, `src/input.js`
- `games/Racing Car/tests/setup.mjs`, `tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 104/104, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (380/380); `run-all` green.
- New gates: `orientationchange` in either orientation leaves the race running; at a 390×844
  viewport the game frame measures 844×390 with `input.rotated === true` and a canvas aspect
  above 1; the gas button still fires; on the rotated frame a stick drag toward the bottom of
  the screen gives steer +1 and toward the top gives −1.
- Headed Chromium at 390×844: device `[390, 844]` → game frame `[844, 390]`; screenshot
  confirms the whole menu and HUD render sideways with no letterbox.

## Remaining release gates

- Penny plays a race holding the phone upright and confirms the picture stays landscape and
  the steering still reads the way her thumb moves.
- Penny re-tries gyro on her phone: is the new travel (full lock at about 21° at her stored
  sensitivity 1.4) and the finer middle range better, and is the direction correct?
- Penny drives the new braking: straight-line braking should stay straight, and braking into
  a corner should rotate progressively with more steering.
- Penny listens to the synthesized engine, tyre, wind, collision, and event balance.
- Penny drives a representative run, returns to the menu, taps 複製報告, and pastes the
  one-line report. That single line proves the settings used alongside performance.

## Known issues and cautions

- The rotated frame is a CSS transform, so anything new that reads pointer coordinates must
  go through `Input.localPoint()`, and anything that positions an element from `clientX/Y`
  must account for it. Rect-based hit tests are already correct.
- ADR-062's rejected tuning attempts remain rejected; ADR-065 supersedes only its decision
  to keep Turbo reversed out, not its measurements.
- Brake force is now demand, not delivered force; delivered force comes from the friction
  circle. Any further change to it must retune `SKILLS.brakeA` in the same pass.
- A drift now holds speed and settles rather than snapping, but it still needs throttle and
  countersteer coordination to sustain past a few seconds. Whether that is the right
  difficulty is Penny's call on a phone, not a desktop measurement.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-073, ADR-068 to
   ADR-071.
2. Penny sends the copied physical-phone report plus short judgements: does the picture stay
   landscape, gyro direction, sensitivity (slow/right/fast), and audio balance. Tune only
   contradicted items.

## Do not redo

- Do not reintroduce a portrait pause, a rotate prompt, or any orientation-triggered state
  change; the frame rotates instead (ADR-073, superseding ADR-072's portrait half).
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
