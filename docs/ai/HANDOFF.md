# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `094e8e8`
Status: rival difficulty investigated and deliberately not shipped; nothing in the game changed

## Current objective

Give Penny a 對手強弱 dial so rival pace stops needing a round trip through her phone —
if the measurements support it.

## Completed

- Built the setting end to end (pace multiplier on the driver's target speed, 設定 row,
  persistence, spawn plumbing), measured it, and reverted all of it.
- It cannot be labelled honestly. Solo, six circuits, three paces: Turbo is worst in the
  middle (0.92 gives 44.3s, 7.3% off-road, 8 wall frames, against 40.7s and 36.0s clean
  either side), while Turbo reversed is best in the middle (36.9s clean at 0.92 against
  41.0s with 74 wall frames at full pace). A four-car field agrees: on Coast the full-pace
  field is 15s per car slower than the slowest setting because it spends 9.5% of the race
  off-road instead of 0.4%.
- Two ways of making rivals harder were also measured and rejected: pace above 1
  (111–138s becomes 160–193s) and promoting every rival a skill tier (112–167s). Both make
  the field slower, because the controller is already at its own limit.
- Recorded all of it in ADR-067, including what a real difficulty scale would require.

## Changed files

- `docs/ai/DECISIONS.md`, `HANDOFF.md` only — no game code changed this round
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- Working tree returned to `094e8e8` for all game code; race 85/85 confirms the revert.
- The rejected measurements are reproducible: a solo driver over six circuits at pace
  0.82/0.92/1.00, and a four-car field over four circuits at the same three paces.

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
- Do not add a rival difficulty setting on top of today's driver; read ADR-067 first.
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
