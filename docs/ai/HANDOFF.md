# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `8aabd14`
Status: reverse circuits added; AI curvature estimate fixed; duplicate test driver removed

## Current objective

Grow circuit content without weakening any gate, and fix what the new content exposed.

## Completed

- `tracks.js` derives reverse variants from a circuit's centreline. Coast and Touge ship
  reversed (5 circuits total); each has its own id, best lap, ghost, per-circuit career
  record, and can be picked into a championship schedule.
- Turbo reversed is deliberately not shipped. The AI spins at one infield corner every
  lap and wedges against a barrier until the 3-second rescue. Excluding it keeps one
  strict gate for every circuit instead of a per-circuit exemption (ADR-060).
- Championship default is still the three forward circuits, not every circuit, so adding
  content did not silently double the default championship length.
- Fixed a real AI defect the reverse circuits exposed: curvature was estimated over a
  ±0.012 window, which smooths short corners into gentle ones and lets the driver enter
  far too fast. At ±0.008 the six-circuit totals go from 1290 wall-contact frames and
  7 rescues to 559 and 3, forward circuits unchanged, lap times not meaningfully slower.
- Removed the duplicated controller in `tests/race.mjs`; T4 now imports `createDriver`.
  That duplicate is why the defect survived: changing the shipped driver moved the gate
  by nothing, because the gate measured a controller nothing else used (ADR-061).

## Changed files

- `games/Racing Car/src/tracks.js`, `src/driver.js`, `src/main.js`, `src/settings.js`
- `games/Racing Car/tests/race.mjs`, `tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 67/67, setup 80/80, rivals 55/55, ghost 29/29, season 55/55, audio 32/32
  (318/318). `setup.mjs` failed once inside `run-all` on the FPS-report assertion with
  zero frames sampled and passed twice standalone right after — the known back-to-back
  browser-launch flake, not a new regression.
- Reverse geometry proven, not assumed: tangent dot −1.000 and length difference 0.0 m
  against the forward circuit at the same point, for both reversed circuits.
- Shipped-AI lap gate over all five circuits: 1, 6, 0, 3, 0 wall-contact frames and zero
  rescues; every circuit completes three laps.
- Rival field: all four rivals complete three laps on every circuit, off-road 7.5–13%.
- Rejected on measurement, not taste: an apex/inside-line bias (worse everywhere), a
  stuck-reverse recovery (no gain on shipped circuits), and proportional braking in
  `car.js` (much worse — the controller is tuned against binary full braking, and one
  circuit stopped finishing).

## Known issues and cautions

- Turbo reversed stays out until the AI stops power-spinning at that infield corner.
  The mechanism is traced and four fixes are rejected with numbers in ADR-062.
- `car.js` still applies full brake force for any negative throttle, so the AI cannot
  trail-brake. Changing it needs the driver retuned in the same pass, not alone.
- Nobody has listened to the new audio on a phone; balance is unjudged.
- Still unconfirmed on Penny's device: gyro 1.4 / ±16°, simple mode, touch cluster,
  steering direction, rival pace.
- The sandbox blocks `penny323mo.github.io`; only the deploy workflow result is checkable.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-060 to ADR-061.
2. Get phone evidence for audio balance, gyro, and simple mode before tuning any of them.
3. Turbo reversed needs a recovery state machine, not constant tuning — read ADR-062
   first; four single-constant attempts are already measured and rejected there.

## Do not redo

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
