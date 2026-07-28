# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `cc3258a`
Status: one-copy physical-phone release report implemented, deployed, and verified

## Current objective

Finish Racing Car as a publish-ready mobile game. Automated evidence is green; the final
acceptance still needs Penny's actual phone sensors, speakers, and frame pacing.

## Completed

- Expanded the built-in 手機實測 report so one copy now records the exact run context,
  rather than requiring Penny to describe settings separately.
- Report data now includes control mode/direction, gyro support/on/direction/sensitivity,
  screen orientation/type/angle, and audio enabled/ready/broken state.
- Kept the existing anonymous contract: no identity, user-agent, credential, or device id.
- Updated ADR-037 and PROJECT_CONTEXT so future agents preserve the richer release report.
- Added a regression gate for every new field and its compact copied-text representation.

## Changed files

- `games/Racing Car/src/main.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/DECISIONS.md`
- `docs/ai/HANDOFF.md`

## Verification

- Targeted setup: 84/84 passed.
- Full suite: race 71/71, setup 84/84, rivals 55/55, ghost 29/29, season 55/55,
  audio 32/32 — 326/326 passed.
- Real local Chrome flow at 390x844: Start, drive, Pause, Return to Menu, Copy Report.
- The generated menu text contained measured FPS/DPR/viewport/track plus
  `操控 簡易/正常`, `陀螺 關/預設/靈敏 1.4`, orientation, and `音效 開/已啟動`.
- Visual inspection confirmed the longer report wraps inside its card without overflow.
- Copy button changed to `已複製`; console had zero errors and zero warnings.
- GitHub Pages run `30340578744` deployed checkpoint `a1ce10e` successfully.
- Fresh production Chrome at 390x844 completed Start → drive → Pause → Return to Menu →
  Copy. The deployed report contained every new field, Copy changed to `已複製`, and the
  production console remained at zero errors and zero warnings.

## Remaining release gates

- Penny enables gyro on her physical phone, confirms right-hand motion turns right, and
  judges whether sensitivity 1.4 / ±16° feels right.
- Penny listens to the synthesized engine, tyre, wind, collision, and event balance.
- Penny drives a representative run, returns to the menu, taps 複製報告, and pastes the
  new one-line report. That single line now proves the settings used alongside performance.

## Known issues and cautions

- Turbo reversed stays out until its AI gains a recovery state machine; read ADR-062.
- `car.js` applies full brake force for any negative throttle. Retune the AI driver in the
  same pass if that behavior changes.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-037 and
   ADR-062 to ADR-064.
2. Penny sends the copied physical-phone report plus three short judgements: gyro direction,
   sensitivity (slow/right/fast), and audio balance. Tune only contradicted items.

## Do not redo

- Do not add user-agent, identity, credential, or persistent device identifiers to reports.
- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064).
- Do not flip gyro signs or tune sensitivity/audio without physical-device evidence.
- Do not retry the four rejected Turbo-reversed constant tweaks in ADR-062.
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not amend, rebase, or force-push published `main` history.
