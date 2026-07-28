# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `becf071`
Status: gyro steering reworked after Penny's phone verdict; sixth circuit shipped earlier this session

## Current objective

Act on Penny's phone verdict "陀螺儀體驗好差，轉向比例奇怪" — the gyro response curve,
not its direction.

## Completed

- Reworked gyro steering into `gyroSteer(tiltDeg, sens)`: 2° deadzone measured in degrees,
  full lock at `30 / sens` degrees instead of 11°, and shaping `x * (0.3 + 0.7x²)` so half
  travel is about 24% steer. `Input.read` now low-passes the result at ~11/s (ADR-066).
- Three separate faults were behind one complaint: travel far too short, a linear map, and
  no smoothing at all — touch had smoothing, gyro bypassed it and fed raw sensor noise
  straight to the wheel.
- Added the 校正 button the setting text has always promised, and the note now states the
  actual full-lock angle for the current sensitivity.
- Earlier in this session: spin recovery state and the sixth circuit (ADR-065).

## Changed files

- `games/Racing Car/src/input.js`, `src/main.js`, `index.html`
- `games/Racing Car/src/driver.js`, `src/tracks.js` (earlier in session)
- `games/Racing Car/tests/setup.mjs`, `tests/race.mjs`, `tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 85/85, setup 95/95, rivals 59/59, ghost 29/29, season 55/55, audio 32/32
  (355/355); `run-all` green.
- The curve is tested as a pure function: deadzone in degrees, full lock exactly at span,
  clamped beyond it, monotonic across the range, left/right symmetric, sensitivity scaling
  in the right direction, half travel between 15% and 30% steer, and no NaN from junk.
- Smoothing is tested through real `deviceorientation` events: one frame after a full tilt
  the wheel is under 0.4, and it settles to full lock over about a second.
- Turbo reversed lap gate holds at 74 wall-contact frames and zero rescues; all six
  circuits still need zero rescues.
- Headed Chromium at 390×844: the 校正 button is 44×49 px and the settings panel does not
  overflow (scrollWidth == clientWidth == 355).

## Remaining release gates

- Penny re-tries gyro on her phone: is the new travel (full lock at about 21° at her
  stored sensitivity 1.4) and the finer middle range better, and is the direction correct?
- Penny listens to the synthesized engine, tyre, wind, collision, and event balance.
- Penny drives a representative run, returns to the menu, taps 複製報告, and pastes the
  new one-line report. That single line now proves the settings used alongside performance.

## Known issues and cautions

- ADR-062's rejected tuning attempts remain rejected; ADR-065 supersedes only its
  decision to keep Turbo reversed out, not its measurements.
- `car.js` applies full brake force for any negative throttle. Retune the AI driver in the
  same pass if that behavior changes.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-037 and
   ADR-062 to ADR-065.
2. Penny sends the copied physical-phone report plus three short judgements: gyro direction,
   sensitivity (slow/right/fast), and audio balance. Tune only contradicted items.

## Do not redo

- Do not add user-agent, identity, credential, or persistent device identifiers to reports.
- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence.
- Do not retry the four rejected Turbo-reversed constant tweaks in ADR-062.
- Do not fold spin recovery back into the racing control law (ADR-065).
- Do not make the gyro map linear again, shorten its travel below 30/sens degrees, or
  remove its smoothing (ADR-066).
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
