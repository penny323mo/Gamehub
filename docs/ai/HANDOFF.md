# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `aadfa87`
Status: braking physics rewritten per axle; ABS added; AI retuned in the same pass

## Current objective

Fix Penny's report that straight-line braking turns the car sideways, put the
throttle/brake/drift relationship on a physical footing, then add ABS.

## Completed

- Reproduced the fault deterministically: with one small disturbance, coasting drifts 4°
  while braking spins 229° and never stops.
- Rewrote the longitudinal model. Brake demand is distributed across axles; each axle's
  longitudinal force is capped by its own μ·N; each axle's lateral capacity is cut by its
  own longitudinal usage. Loads and brake forces are solved in two passes since each
  depends on the other. `loadTransfer` returns to a physical 0.19 (ADR-068).
- Three compounding faults were behind one symptom: braking was charged entirely to the
  rear friction circle with the front never debited; the load estimate used the unclamped
  20,000 N demand (1.84 g) which drove rear load to a 476 N floor; and load transfer was
  set as if the centre of gravity were 0.78 m high.
- Added ABS (`racer-abs`, default on) as a real system: front axle does the main braking,
  each axle stays below its limit, brake force is released as steering increases, no lock.
  With ABS off a fixed 62/38 split can lock an axle — sliding friction, no lateral force.
- Retuned the AI in the same pass as the previous handoff demanded: `brakeA` 8.6/9.0/9.6
  becomes 7.2/7.6/8.1, since the old numbers were fitted to 1.84 g braking.

## Changed files

- `games/Racing Car/src/car.js`, `src/driver.js`, `src/settings.js`, `src/main.js`, `index.html`
- `games/Racing Car/tests/race.mjs`, `tests/setup.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 91/91, setup 98/98, rivals 59/59, ghost 29/29, season 55/55, audio 32/32
  (364/364); `run-all` green.
- Straight-line stop is 1.19 g with 0.0° of heading change and under 1° of body slip.
- Over a bump then braking: 1.9° slip with ABS, 87.6° without — the setting has a real,
  measured consequence rather than a label.
- Trail braking at quarter, half and full steering gives 3.9° / 21° / 31.5° of body slip:
  a progressive drift entry, which is what Penny asked braking into a corner to feel like.
- Handbrake drift unchanged at 89°, cruise 122 km/h, 0–80 km/h 2.77s — the rewrite did not
  quietly change acceleration or the drift mechanic.
- AI over all six circuits: zero wall-contact frames, zero rescues, zero off-road, and
  faster than before (Coast 36.4s to 30.9s). This is the cleanest the field has measured.

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
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
