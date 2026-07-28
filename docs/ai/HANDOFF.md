# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: 畫面方向 is a two-value player setting, now re-decided on every signal (ADR-075)

## Current objective

Penny's third and final word on orientation: "不如設置成只可以手動切換橫向定直向" — make it a
manual switch, no automatic behaviour at all.

## Completed

- Added the 畫面方向 setting (`racer-orient`, default `portrait`). 打直 renders into the
  viewport with no transform ever; 打橫 rotates `#game-root` 90° only while the viewport is
  taller than wide (ADR-074).
- Rotation is a class (`.rot90`) toggled by `applyOrientation()`, not a media query — the
  media query was the automatic behaviour. The same boolean goes into `Input.setRotated()`,
  so touch mapping and CSS cannot disagree; `Input` no longer reads `matchMedia` itself.
- Layout inside the frame is measured against the frame: `--fw`/`--fh` (swapped under
  `.rot90`) replace `vw`/`vh` everywhere, and the phone-layout media queries are scoped to
  `#game-root:not(.rot90)` plus a rotated equivalent of the short-side rule.
- Fixed two latent bugs this exposed (menu panel `max-height: 88vh` resolving to 743px in a
  390px-tall rotated frame; a rotated frame taking the narrow-portrait pad layout), plus a
  stray `this.rotatedOverride = null` sitting inside `Input.read()`'s gyro branch.
- `screen.orientation.lock('landscape')` is attempted only when the setting is 打橫.
- Penny then reported the iPhone still scrambled on rotation. Fixed by never measuring once
  (ADR-075): `applyOrientation()` reads `visualViewport`, re-runs on every resize signal and
  on return from background, `orientationchange` schedules five re-decisions, the frame's
  size stays in CSS `dvw`/`dvh`, and a `ResizeObserver` re-runs `renderer.setSize()`.
- Hub carousel on phones: the card fills the frame (90% of a 440px viewport, up from 64%),
  neighbours pushed fully off-screen. `updateCarousel()` picks the step from a rule — a
  neighbour is wholly visible or wholly hidden, never cut — so desktop is unchanged.

## Changed files

- `games/Racing Car/src/settings.js`, `src/main.js`, `src/input.js`, `style.css`, `index.html`
- `games/Racing Car/tests/setup.mjs`, `tests/season.mjs`
- `style.css`, `launcher.js`, `tests/hub.mjs` (hub carousel)
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 117/117, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (393/393); `run-all` green.
- T4b gates the switch: at 390×844 the default gives a 390×844 frame with `rotated === false`;
  打橫 gives 844×390, `rotated === true`, and persists; 打直 puts it back and the joystick axes
  swap with it. `orientationchange` never pauses.
- Hub 33/33, including gates: no neighbour card is partially visible, the active card is
  not clipped by the `overflow: hidden` frame, and it spans at least 82% of a phone viewport.
- New gates reproduce the iPhone bug: a stubbed stale `visualViewport` makes the game decide
  wrongly on `orientationchange`, and it recovers within a second with no further event;
  resizing `#game-root` with no event at all still resizes the canvas and drawing buffer.
- Headed Chromium at 390×844: 打直 frame [390,844]; 打橫 frame [844,390] with the menu panel
  at 420×343 inside it; 打橫 on an 844×390 device does not rotate at all.

## Remaining release gates

- Penny rotates the iPhone in both 打直 and 打橫 and confirms the picture no longer scrambles,
  the steering still reads the way her thumb moves, and checks the enlarged hub card.
- Penny re-tries gyro: is the new travel (full lock at ~21° at her stored sensitivity 1.4)
  and finer middle range better, and is the direction correct?
- Penny drives the new braking: straight-line braking stays straight; braking into a corner
  rotates progressively with more steering.
- Penny checks audio balance, then taps 複製報告 after a run and pastes the one-line report.

## Known issues and cautions

- 打橫 mode is a CSS transform: anything reading pointer coordinates must go through
  `Input.localPoint()`. Rect-based hit tests are already correct.
- Inside `#game-root` use `--fw`/`--fh`, never `vw`/`vh`: under `.rot90` they are swapped.
- Hub cards are sized in `%` of the carousel frame, not `vw`: the outer padding eats 42px a
  side, so `vw` overflows the clipping frame.
- ADR-062's rejected attempts stay rejected; ADR-065 supersedes only its Turbo decision.
- Brake force is demand, not delivered force; delivered force comes from the friction circle.
  Any further change must retune `SKILLS.brakeA` in the same pass.
- A drift holds speed and settles rather than snapping, but sustaining one past a few seconds
  still needs throttle and countersteer together. Whether that is right is Penny's call.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-074, ADR-075,
   and ADR-068 to ADR-071.
2. Penny sends the copied physical-phone report plus short judgements: which 畫面方向 she
   settled on and whether it behaves, gyro direction, sensitivity (slow/right/fast), and
   audio balance. Tune only contradicted items.

## Do not redo

- Do not reintroduce a portrait pause, a rotate prompt, an "automatic" third orientation
  value, or any code that changes 畫面方向 on the player's behalf (ADR-074, superseding
  ADR-072 and ADR-073). Three attempts failed for the same reason: the game deciding.
- Do not read raw `clientX/clientY` for in-game positioning; use `Input.localPoint()`.
- Do not decide the orientation from a single measurement, and do not size `#game-root` from
  JS pixels — both make the frame depend on an event arriving on time (ADR-075).
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
