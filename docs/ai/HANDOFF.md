# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `38dac73`
Status: sixth circuit unblocked — the AI now recovers from a spin instead of being towed

## Current objective

Do the one task ADR-062 named: give the AI a real spin recovery, and ship Turbo reversed
if — and only if — the measurements say it earned its place.

## Completed

- Verified Codex's `38dac73` before building on it: full suite green, and the richer
  one-copy phone report matches its handoff.
- Added a recovery state to `createDriver`: entered below 6 m/s when pointing more than
  80° off line, exited under 40° once back on road, 3.5 s cap. It commands `throttle: -1`
  and counter-aimed steer; `car.js` already turns that into brake-then-reverse (ADR-065).
- The entry condition is deliberately unreachable while racing, which is why this works
  where ADR-062's four in-line tuning attempts all failed — no correction term is added
  to the racing control law at all.
- Turbo reversed now ships. Six circuits: three forward, three reverse.

## Changed files

- `games/Racing Car/src/driver.js`, `src/tracks.js`
- `games/Racing Car/tests/race.mjs`, `tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 85/85, setup 86/86, rivals 59/59, ghost 29/29, season 55/55, audio 32/32
  (346/346); `run-all` green.
- Turbo reversed: 521 wall-contact frames and 3 rescues before, 74 and 0 after. Every
  circuit now needs zero rescues (0, 8, 0, 74, 2, 0) and forward lap times are unchanged.
- New recovery test spins the car 153° on the road at a standstill and asserts the driver
  enters recovery, commands reverse rather than full throttle, rejoins pointing along the
  track above 8 m/s within 3.7 s, needs no tow, and leaves the state afterwards.
- All four rivals still complete three laps on every circuit, including the three reverse
  variants, and the night render budget gate still measures 16 draw calls.

## Remaining release gates

- Penny enables gyro on her physical phone, confirms right-hand motion turns right, and
  judges whether sensitivity 1.4 / ±16° feels right.
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
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
