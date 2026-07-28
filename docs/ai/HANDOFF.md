# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `23211ae`
Status: configurable championship schedule plus archived past seasons complete

## Current objective

Give the championship a shape the player chooses, and stop finished championships
from disappearing without a trace.

## Completed

- Verified `23211ae` before building on it: full suite green, ghost batched into the
  rivals `InstancedMesh`, combined night composition within the ADR-044 budget.
- Added a 錦標賽賽程 picker to 設定: one toggle per circuit, at least one always
  selected, selection stored in `racer-season-list` and ordered by the circuit list
  rather than by click order.
- `Season.start(list)` accepts a composition and cleans it (unknown ids and duplicates
  dropped, empty falls back to the whole pool, so a zero-round season cannot start).
- The active season persists its own schedule. Changing 設定 mid-season no longer
  swaps the schedule under a resumed season; the menu says the change applies next
  season.
- Finishing the last round archives the standings to `racer-season-hist-v1` inside
  `record()`, so closing the tab cannot lose the result. Newest first, five kept.
- The start screen shows 歷屆錦標賽 — champion, rounds, the player's own place, with a
  clear button. The 錦標賽 button now states the actual round count.
- Added ADR-055.

## Changed files

- `games/Racing Car/src/season.js`, `src/settings.js`, `src/main.js`
- `games/Racing Car/index.html`, `style.css`
- `games/Racing Car/tests/season.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- `node run-all.mjs` in `games/Racing Car/tests`: PASS — race 47/47, setup 69/69,
  rivals 47/47, ghost 29/29, season 42/42 (234/234). Season grew by 22 assertions.
- New season coverage: one-circuit season finishes in one round; player order kept and
  duplicates dropped; a resumed season keeps its stored schedule; empty and all-invalid
  compositions fall back to the full pool; nothing is archived mid-season; the archive
  survives `clear()`; the five-entry cap and newest-first order hold.
- New UI coverage through real clicks: three chips default on, toggling one off updates
  both the list and the button label, the last chip cannot be removed, re-adding a
  circuit restores circuit order, and the history panel appears, renders one row per
  season, and clears.
- Headed Chromium at 390×844 confirmed the picker, the schedule note, and a two-season
  history panel all fit the phone menu with no layout overflow.

## Known issues and cautions

- Still unconfirmed on Penny's own phone: whether steering now reads correctly (轉向方向
  反轉 is the escape hatch), whether the rebuilt right-hand touch cluster fixes her
  report, whether the gyro default suits her, and how the rival pace feels.
- The sandbox network policy blocks `penny323mo.github.io`, so only the deploy workflow
  result is checkable from here, never the live page.
- Desktop Chromium cannot certify phone heat, Safari GPU behavior, or sustained pacing.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-055.
2. Continue one coherent phase. Per-circuit championship records (best season result
   per circuit) is the natural remaining extension of this area.
3. Preserve the combined worst-case budget gate whenever adding another visible layer.

## Do not redo

- Do not let a season start with zero rounds, or read the schedule from 設定 instead of
  from the season's own stored schedule.
- Do not move archiving out of `record()` into a finish-screen button handler.
- Do not split the ghost back into a second draw or include it in physics (ADR-054).
- Do not restore night clouds without recovering a draw elsewhere and remeasuring.
- Do not advance progress from a getter/HUD, replay ghost frame-by-frame, or give action
  buttons individual pointer capture (ADR-048 to ADR-050).
- Do not flip steering sign without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
