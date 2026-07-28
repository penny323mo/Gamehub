# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `b4d02e3`
Status: drift balance reworked — tyre peak, damping floor, drift refund, handbrake lock

## Current objective

Refine the physics so the game is easier and more exciting: make a drift something a
player can actually hold, without giving up the safety won in the braking rewrite.

## Completed

- Diagnosed why a drift could not be held, with force traces rather than feel. Two causes.
  The tyre peaked at 11° of slip, so everything past it produced less force and the car
  was bistable: a 35° entry ran to 78° then snapped to 0° in one step. And sliding
  sideways scrubs speed hard — 11,500 N of body force while decelerating 118 km/h to
  40 km/h, because the body axis sat 50–87° away from travel.
- Moved the tyre peak to about 18° (`tyreB` 8.2 to 5.0). The same entry now overshoots to
  62° and settles into a shallow slide instead of snapping; full-lock steering rotates
  10.9° instead of 6.7°, so the car feels alive without ever spinning.
- Kept a 45% floor of yaw damping while countersteering. ADR-069 gave the player all
  authority including damping, and that removal is what made the car bistable — damping
  resists the rate of change, not the angle the player chose.
- Added an explicit, documented arcade drift aid: a refund of at most 70% of the speed a
  frame actually scrubbed, only on throttle, only past 17° of slip, never on grass or
  handbrake. A drift now keeps 125 km/h instead of bleeding to 86.
- Caught and fixed my own exploit in the same round: the first version used a fixed
  5200 N push and produced 148 km/h while drifting against 122 km/h cruising, which made
  drifting an accelerator. A refund cannot exceed the loss, so it is self-limiting —
  measured 186 km/h straight, 142 km/h drifting, 127 km/h spinning.
- Moved the drift-scoring threshold with the tyre peak (0.19 to 0.26 rad) so ordinary
  full-commitment cornering no longer trickles drift score.
- Made the handbrake work the way a phone player uses it. Measured with the real
  simple-mode command stream, a 0.33 s tap gave 6° of slip and a 0.5 s pull 17° — no
  drift. Sweeping `handbrakeGrip` 0.45 to 0.22 moved the tap by one degree, proving grip
  was never the limiter: the handbrake only scaled grip instead of locking the rear axle,
  and the wheel took 0.18 s to reach the commanded angle. It now locks the rear through
  the same friction-circle path as any locked wheel, and `steerRate` is 7.2/s (ADR-071).
- A half-second pull now gives 19° of entry settling at 31°, and the damping floor moved
  to 0.62 in the same pass because the faster wheel had pushed overshoot back to 75°.
- Rewrote the drift gate to measure controllability rather than duration: the old check
  rewarded a wild 42-to-79-degree swing for spending longer sideways.

## Changed files

- `games/Racing Car/src/car.js`
- `games/Racing Car/tests/race.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 101/101, setup 98/98, rivals 59/59, ghost 29/29, season 55/55, audio 32/32
  (374/374); `run-all` green.
- Everything won in the braking rewrite still holds: straight-line braking 2° slip and
  0.2° of heading change with ABS against 87.9° without, trail braking progressive at
  5.4° / 18.4° / 30.4°, handbrake drift 87°, cruise 122 km/h, 0–80 km/h 2.77s.
- New: full-lock steering rotates 10.9° with no spin at any input, a 40° slide is caught
  in 0.57s, a 35° drift entry peaks at 62° and holds 125 km/h.
- New gate on the exploit: drifting and spinning must both stay under straight-line speed,
  while a drift must still keep over 70% of it.
- AI over all six circuits: zero wall contact, zero rescues, zero off-road, lap times
  within 0.2s of before (Coast 31.1s).

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
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
