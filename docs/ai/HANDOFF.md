# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `a3b373a`
Status: Royale post-match tactical recap implemented and browser verified

## Current objective

Turn the visible lane-pressure HUD into a useful learning loop by showing players
where a completed match was won or lost, without hidden-state analytics.

## Completed

- Added a `🧭 戰術回顧` section to the match result screen.
- During a match, the existing 4Hz pressure pass now records per-lane danger time,
  peak enemy pressure, peak friendly push, any-danger time, and simultaneous
  two-lane danger.
- Duration uses `Game.simTime` / `GuestGame._clock`, not browser wall time. Tutorial
  pause and render throttling therefore do not inflate the result.
- Recap cards show most pressured lane, rounded danger duration, and strongest
  friendly push lane. A split bar visualizes left/right danger time.
- Coaching selects one of three bounded outcomes: stable defence, one-lane breach,
  or simultaneous two-lane pressure.
- Stable matches under one second of transient danger show a green bar, `<1s`, and
  `全場未有持續告急` instead of a misleading red/orange split.
- `window.__royale.ui` is exposed alongside existing test hooks for automated recap
  inspection; this adds no production control path.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/ui.js`
- `games/royale/src/game.js`
- `games/royale/src/pvp.js`
- `games/royale/src/main.js`
- `docs/ai/DECISIONS.md` (ADR-017)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for all changed Royale JS: PASS.
- HTML duplicate-id and UI DOM-reference contract: PASS (124 ids / 78 refs).
- Live sampling: 8 enemy elixir on left produced 1.57 recorded danger seconds and
  peak enemy pressure 7 after a 1.4-second browser interval under swiftshader.
- Pause gate: after settling one sample, 900ms with tutorial pause produced
  simulation-clock delta 0 and danger-duration delta 0.
- One-lane fixture (left 9.2s / right 1.1s) rendered `左路`, `10s`, strongest push
  `右路`, and the left-lane defence advice.
- Two-lane fixture (left 6s / right 5s / simultaneous 3s) rendered `雙路`, `8s`,
  strongest push `雙路`, and the split-defence advice.
- Stable fixture (0.5s any danger) rendered `防線穩固`, `<1s`, green bar, and
  `全場未有持續告急`.
- Browser visual checks passed at 390x844 portrait and 844x390 landscape. Result
  panel remained scrollable with no horizontal overflow; recap width was 490px in
  landscape.
- Console had no functional errors; only existing root `/favicon.ico` 404.
- `git diff --check`: PASS.

## Known issues and cautions

- The recap is a readable pressure summary, not a full replay or deterministic
  battle analyzer. It intentionally ignores spell value, counters, range, armour,
  and tower targeting.
- Metrics are in-memory for the current match only; no history screen exists yet.
- Live two-device Supabase PvP remains unavailable in the local sandbox, though
  GuestGame clock and screen-space mapping paths are covered locally.
- Existing device-specific black-flash verification remains unresolved.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-016 and
   ADR-017 before changing lane pressure or recap sampling.
2. Penny can judge on a real match whether the advice is useful and not too generic.
3. Next gameplay/visual round should improve deployment feedback or add a short
   in-memory highlight replay; do not claim this recap is a replay.

## Do not redo

- Do not calculate recap metrics from hands, elixir, AI intent, or future actions.
- Do not measure danger duration with `Date.now()` / `performance.now()`.
- Do not show a red danger split for sub-one-second stable noise.
- Do not persist detailed match telemetry without explicit authorization.
- Do not amend, rebase, or force-push published `main` history.
