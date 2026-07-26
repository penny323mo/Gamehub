# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `e659b09`
Status: Royale first-run tutorial implemented and locally verified

## Current objective

Help a first-time Clash-mode player understand elixir, card placement, and the
tower objective without rescanning instructions or being attacked while reading.

## Completed

- Added a three-step in-match tutorial: elixir/cost, tap-or-drag placement, and
  crown/tower victory conditions.
- A fresh save auto-opens it on the first single or gauntlet match. The simulation,
  AI, and timer remain frozen until completion or skip.
- Completion/skip writes `tutorialSeen` into the existing `royale-save-v1`.
- Existing saves with any win/loss/draw do not auto-open after this update, even
  when the old save has no `tutorialSeen` field.
- The in-match `❓` button reopens the tutorial at any time. PvP and LV2 do not
  auto-open it.
- The overlay highlights the relevant live HUD region, supports Next, Skip,
  Enter, Escape, viewport resize, and exposes a proper dialog role.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/ui.js`
- `games/royale/src/main.js`
- `games/royale/src/storage.js`
- `docs/ai/DECISIONS.md` (ADR-014)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for changed Royale JS: PASS.
- Fresh storage: first single match opened step 1/3 automatically.
- Pause gate: after 2.2 wall-clock seconds, `time=180` and `simTime=0`.
- Next moved through all three steps; final button and Skip both closed the dialog.
- Completion persisted `tutorialSeen=true`; reload plus a second match did not
  auto-open it.
- Manual `❓` replay opened after completion and paused the running match.
- Legacy save `{ wins: 1 }` without `tutorialSeen`: migration kept the tutorial
  hidden and preserved the win.
- Visual browser checks passed at 390x844 portrait and 844x390 landscape; panel,
  focus ring, cards, crowns, and controls stayed readable.
- Console had no functional errors; only the existing root `/favicon.ico` 404.
- `./scripts/check-handoff.sh`: PASS after this file update.

## Known issues and cautions

- The black-flash fix from `d0fae14` is still unconfirmed on Penny's original
  device; do not tune graphics further until they report back.
- Live PvP reconnect/grace/walkover still needs real-device Supabase verification.
- Cloud-session `.mjs` regressions are not tracked, so Codex cannot rerun the exact
  scripts; Pages CI fully lint/tests/builds only Ashen Rail.
- Root `/favicon.ico` remains absent; this is a non-functional local-server 404.

## Exact next action

1. After push, receiving agent runs `./scripts/agent-context.sh --sync` and reads
   ADR-007 to ADR-014 plus this handoff.
2. Penny can try the tutorial and confirm the earlier black flash on the affected
   device.
3. If no tutorial issue is reported, the next Royale roadmap item is replay.

## Do not redo

- Do not let tutorial time advance the simulation or AI.
- Do not auto-open this Clash tutorial in PvP, LV2, or for an existing player with
  recorded matches.
- Do not remove the `❓` replay path when changing first-run detection.
- Do not create another tutorial save key; migrate `royale-save-v1`.
- Do not tune graphics before the device-level black-flash result.
- Do not amend, rebase, or force-push published `main` history.
