# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `c7c78da`
Status: landscape-only orientation handling; spurious mid-race pause fixed

## Current objective

Fix Penny's report that the race pauses by itself while she is already in landscape using
gyro steering, and lock the game to landscape.

## Completed

- Diagnosed from her screenshot: the pause banner said 手機方向已改變 while the phone was
  in landscape. `orientationchange` fires on landscape-left to landscape-right flips and
  when a near-flat phone is re-classified, and gyro steering means tilting the phone
  continuously — so the old unconditional pause fired mid-race (ADR-072).
- Pausing now reads the `(orientation: portrait)` media query. Landscape-to-landscape no
  longer pauses; portrait pauses with 請打橫手機再繼續 and clears stuck touch inputs.
- Added a full-screen rotate prompt shown whenever the phone is portrait, on the menu as
  well as in a race, and attempted `screen.orientation.lock('landscape')` on race start
  for platforms that support it (iOS Safari does not, hence the prompt).
- Rewrote the old rotation gate, which asserted the very behaviour being removed.

## Changed files

- `games/Racing Car/src/main.js`, `index.html`, `style.css`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 104/104, rivals 59/59, ghost 29/29, season 55/55,
  audio 32/32 (380/380); `run-all` green.
- New gates encode her exact bug: dispatching `orientationchange` while landscape leaves
  the race running with touch input untouched; switching the viewport to portrait pauses,
  clears a stuck throttle and steering, and shows the prompt; returning to landscape hides
  it again.
- Headed Chromium at 390×844 confirms the prompt covers the menu in portrait.

## Remaining release gates

- Penny re-tries gyro on her phone: is the new travel (full lock at about 21° at her
  stored sensitivity 1.4) and the finer middle range better, and is the direction correct?
- Penny drives the new braking on her phone: straight-line braking should now stay
  straight, and braking into a corner should rotate progressively with more steering.
- Penny listens to the synthesized engine, tyre, wind, collision, and event balance.
- Penny drives a representative run, returns to the menu, taps 複製報告, and pastes the
  new one-line report. That single line now proves the settings used alongside performance.

## Known issues and cautions

- ADR-062's rejected tuning attempts remain rejected; ADR-065 supersedes only its
  decision to keep Turbo reversed out, not its measurements.
- Brake force is now demand, not delivered force; delivered force comes from the friction
  circle. Any further change to it must retune `SKILLS.brakeA` in the same pass.
- A drift now holds speed and settles rather than snapping, but it still needs throttle
  and countersteer coordination to sustain past a few seconds. Whether that is the right
  difficulty is Penny's call on a phone, not a desktop measurement.
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
- Do not pause on `orientationchange`; landscape-to-landscape must never interrupt a race
  (ADR-072).
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
