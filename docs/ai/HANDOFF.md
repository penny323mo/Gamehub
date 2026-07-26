# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `69ac9e6`
Status: Royale 12-second highlight replay implemented and browser verified

## Current objective

Let single-player and gauntlet players replay the visible finish of a completed
match without re-running simulation, changing rewards, or exposing hidden state.

## Completed

- Added `🎬 重播決勝片段` to eligible result screens plus a replay progress bar
  and explicit `返回結算` control.
- Single-player and gauntlet keep an in-memory ring of the latest 12 seconds at
  5Hz, including a forced final frame. PvP and LV2 do not record these frames.
- Every stored frame removes enemy hand, elixir, and next-card data before it can
  enter the replay buffer. The player's own visible hand remains available.
- Playback feeds snapshots to `GuestGame` in the local player's orientation. It
  does not run `Game.update`, AI, result callbacks, score submission, or rewards.
- Generalized `GuestGame` orientation while preserving its default flipped PvP
  guest behavior.
- Replay can be exited manually or returns to the unchanged result automatically;
  match recap and replay button remain available for another viewing.
- Replay objects use the existing deep cleanup path and release their GPU meshes.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/ui.js`
- `games/royale/src/pvp.js`
- `games/royale/src/main.js`
- `docs/ai/DECISIONS.md` (ADR-018)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for changed Royale JS: PASS.
- HTML duplicate-id and UI DOM-reference contract: PASS (129 ids / 82 refs).
- Live ring-buffer fixture retained 61 frames spanning 12.0 seconds; its forced
  final frame had `phase=ended` and the correct winner.
- All 61 frames had empty enemy hands, zero enemy elixir, and no enemy next card;
  the player's visible hand remained populated.
- Manual exit and automatic return both restored the result screen. Two full
  viewings left recorded wins unchanged at 2.
- A clean replay cycle returned renderer geometry from the 115 baseline to 115
  after disposal.
- Portrait (390x844) and landscape (844x390) browser checks passed. Replay hid the
  deploy hand, retained camera controls, and produced no horizontal overflow.
- Default PvP guest mapping still swaps teams and flips world x; local replay
  mapping preserves teams and x.
- Console had no functional errors; only the existing root `/favicon.ico` 404.
- `git diff --check`: PASS.

## Known issues and cautions

- This is a 5Hz snapshot highlight, not video or a deterministic simulation. Very
  short animation transitions can look stepped.
- Frames exist only for the current completed match and disappear on a new match
  or page reload.
- Live two-device Supabase PvP remains unavailable in the local sandbox, though
  the existing flipped guest mapping has a local regression check.
- Existing device-specific black-flash verification remains unresolved.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-018
   before changing replay capture, hidden-state filtering, or snapshot mapping.
2. Penny can judge on a real phone whether 1x speed and the 12-second window feel
   right after a busy finish.
3. Next gameplay/visual round should improve deployment feedback or add simple
   replay pause/speed controls only if real play shows a need.

## Do not redo

- Do not retain or render enemy hand, elixir, next card, AI intent, or future state.
- Do not turn playback into a second simulation or fire result/reward callbacks.
- Do not persist replay snapshots or extend them to PvP without a two-client
  privacy and mapping test.
- Do not persist detailed match telemetry without explicit authorization.
- Do not amend, rebase, or force-push published `main` history.
