# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `62047b3`
Status: automated publish-readiness audit complete; physical-phone acceptance remains

## Current objective

Finish Racing Car as a publish-ready mobile game. Automated release evidence is green;
the remaining acceptance items require Penny's actual phone sensors and speakers.

## Completed

- Re-ran the entire committed Racing Car regression matrix instead of relying on the
  earlier targeted setup gate.
- Verified the deployed hub card opens the percent-encoded Racing Car production path.
- Verified a separate fresh direct-navigation session at 844x390 landscape.
- Let the real countdown finish and confirmed Simple mode auto-accelerates in production.
- Visually inspected the live landscape scene: car, road, HUD, minimap, joystick, drift,
  brake, and auto-throttle controls are readable and unobstructed.
- Reconfirmed the inline favicon fix and zero production console errors.

## Changed files

- `docs/ai/HANDOFF.md`

## Verification

- Full suite: race 71/71, setup 83/83, rivals 55/55, ghost 29/29, season 55/55,
  audio 32/32 — 325/325 passed.
- All five forward/reverse circuits completed three autopilot laps; four rivals also
  completed three laps on all five circuits with no rescue requirement.
- Production hub → Racing Car: correct URL and title, menu ready, all five tracks visible.
- Fresh production 844x390 run after countdown: 143 km/h, finite car speed, Simple mode,
  WebAudio running and not broken, 14 draw calls, 54,565 triangles, zero console warnings
  or errors. All runtime asset requests returned successfully.
- Visual smoke matched the control and HUD layout protected by the 667x375/844x390 gates.
- `HANDOFF_CHECK=PASS`; GitHub Pages checkpoint `62047b3` was already deployed before the
  production acceptance run.

## Remaining release gates

- Penny must confirm on her physical phone that gyro direction now matches hand motion.
- Penny must judge whether gyro sensitivity 1.4 / ±16° feels right.
- Penny must listen to the synthesized engine, tyre, wind, collision, and event balance.
- For useful performance evidence, run on the phone for a representative period, return to
  the menu, and copy the built-in 手機實測 report. Desktop SwiftShader FPS is not evidence.

## Known issues and cautions

- Turbo reversed stays out until its AI gains a recovery state machine; read ADR-062.
- `car.js` applies full brake force for any negative throttle. Retune the AI driver in the
  same pass if that behavior changes.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-062 to ADR-064.
2. Penny tests gyro direction/sensitivity and audio balance on her phone and sends the
   built-in performance report after driving a representative run.
3. Tune only the item contradicted by that real-device evidence, then repeat the relevant
   automated suite and physical-phone check before final release sign-off.

## Do not redo

- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence.
- Do not retry the four rejected Turbo-reversed constant tweaks in ADR-062.
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not amend, rebase, or force-push published `main` history.
