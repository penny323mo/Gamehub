# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `c2c42ea`
Status: two phone-reported faults fixed — gyro direction and the aeroplane-like body roll

## Current objective

Act on Penny's first real-device report of this phase: gyro steered the wrong way, and
the car looked airborne when cornering.

## Completed

- Body roll cut from 9.2° to 3°. The roll applies to the whole car group, wheels
  included, so the old value lifted one side and drove the other 0.27 m through the
  road — measured, and exactly the "floating / banking like a plane" she described.
  Now about 9 cm of height difference, invisible at this car size (ADR-063).
- Gyro steering gained its own direction switch (`racer-gyro-invert`), defaulting to
  inverted per her device. The existing 轉向方向 switch still covers touch and gyro
  together; a single shared switch could not express "touch right, gyro wrong" (ADR-064).
- 設定 gained a 陀螺儀方向 預設/反轉 row next to the existing gyro rows.

## Changed files

- `games/Racing Car/src/car.js`, `src/input.js`, `src/main.js`, `index.html`
- `games/Racing Car/tests/race.mjs`, `tests/setup.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 71/71, setup 82/82, rivals 55/55, ghost 29/29, season 55/55, audio 32/32
  (324/324); `run-all` green.
- New roll gate measures the rendered bounding box, not the intent: at rest the body sits
  exactly on the road, peak roll 3.0° cornering and drifting, lowest point −0.088 m.
  It also asserts roll stays above 1.5° so the fix cannot silently become no roll at all.
- New gyro gates: both tilt directions produce opposite steer, the default is inverted,
  the switch flips and persists, and flipping it leaves touch steering untouched.

## Known issues and cautions

- Turbo reversed stays out until the AI stops power-spinning at that infield corner.
  The mechanism is traced and four fixes are rejected with numbers in ADR-062.
- `car.js` still applies full brake force for any negative throttle, so the AI cannot
  trail-brake. Changing it needs the driver retuned in the same pass, not alone.
- Nobody has listened to the new audio on a phone; balance is unjudged.
- Still unconfirmed on Penny's device: whether the gyro now reads correctly and whether
  1.4 / ±16° is the right sensitivity, simple mode feel, touch cluster, rival pace, and
  audio balance.
- The sandbox blocks `penny323mo.github.io`; only the deploy workflow result is checkable.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-063 to ADR-064.
2. Wait for Penny's next phone check before tuning gyro sensitivity or audio balance.
3. Turbo reversed needs a recovery state machine, not constant tuning — read ADR-062
   first; four single-constant attempts are already measured and rejected there.

## Do not redo

- Do not raise body roll past 3.5°, and do not roll the contact shadow with it (ADR-063).
- Do not merge the gyro direction switch back into 轉向方向 (ADR-064).
- Do not ship a reverse variant without measuring its wall-contact and rescue counts.
- Do not retry the rejected Turbo-reversed fixes in ADR-062; they are measured, not guessed.
- Do not keep a second copy of the driver in tests; import `createDriver` (ADR-061).
- Do not widen the curvature window back to ±0.012, or narrow it past ±0.008.
- Do not make braking proportional in `car.js` without retuning the driver together.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not credit a championship round without checking the circuit raced (ADR-058).
- Do not read a running season's schedule from current settings; use its stored `trackIds`.
- Do not apply player assists to AI commands; `driver.js` already countersteers.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not flip steering/gyro signs without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
