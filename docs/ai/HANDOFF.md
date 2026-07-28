# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `e53e4be`
Status: driver aids now yield to a countersteering player; drift mechanic restored

## Current objective

Continue the physics balance toward playable: characterise limit behaviour, drift hold
and recovery, then fix whichever of them is actually broken.

## Completed

- Characterised the car rather than guessing at feel. At the limit on steering alone it
  understeers safely (3.7° / 5.7° / 6.7° of body slip at quarter, half and full lock, no
  spin at any input), a 40° slide is catchable in 0.7 s, and trail braking rotates
  progressively — those three were already right after the braking rewrite.
- Found the one that was broken: a deliberate drift could not be held. A 40° handbrake
  entry lasted 2.1 s on raw physics but only 1.6 s with the assists on, because the
  countersteer assist, traction cut and yaw damping could not tell a chosen drift from a
  mistake and fought both.
- Assists now scale by how hard the player is countersteering (ADR-069). Full opposite
  lock disables them entirely; no correction still gets the full rescue.
- Measured after: assisted and raw drift durations are identical at 2.1 s, recovery from a
  40° slide improves from 0.70 s to 0.55 s, and a player who holds the wheel into the
  corner instead of correcting is still straightened in 1.7 s.

## Changed files

- `games/Racing Car/src/car.js`
- `games/Racing Car/tests/race.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 94/94, setup 98/98, rivals 59/59, ghost 29/29, season 55/55, audio 32/32
  (367/367); `run-all` green.
- New gate asserts all three halves of the rule at once: assisted drift duration matches
  raw physics within 0.35 s, a drift survives at least 1.8 s, and a player who does not
  countersteer is still recovered inside 3 s.
- Rivals are unaffected — `driver.js` sends `assist: false`, and all six circuits still
  run with zero wall contact, zero rescues and zero off-road.

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
- A drift still decays after about 2 s because the car sheds speed (120 to 86 km/h) and
  hooks up. That is the next balance question and it is a tyre/longitudinal one, not an
  aid one — measure before touching (ADR-069).
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
- Do not let driver aids act while the player is holding opposite lock (ADR-069).
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
