# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `7f6c50c`
Status: RTS suite added; it found and we fixed a real GPU texture leak in LV2

## Current objective

Extend the suite to LV2 RTS, which had no coverage at all: fairness of the starting
position, the tech/age/population/cost gates, counter parity with Clash, and mode
enter/exit cleanup. The cleanup check failed immediately, so the task became fixing
the leak it exposed.

## Completed

- Added `games/royale/tests/rts.mjs`, 29 checks, registered in `run-all.mjs`. The
  suite is now seven files and 105 checks.
- Fixed a GPU texture leak in LV2. `disposeDeep` now disposes
  `o.skeleton?.boneTexture`. Every `SkeletonUtils.clone` gets its own `Skeleton`, and
  Three lazily allocates a bone `DataTexture` per skeleton that `material.dispose()`
  never frees. RTS starts with ten skinned units, so each entry leaked ten textures.
- Starting-position fairness is now asserted: both sides get identical resources,
  population cap, tech levels, buildings, units, and age. This is the RTS equivalent
  of ADR-007 and previously had no automated guard.
- Gate coverage: research is refused when the age or the resources are short, when
  the building is not a blacksmith, when it is still under construction, and when the
  line is maxed; queueing charges immediately. Training is refused on cost and on a
  full population cap. Tech multipliers are per-team at the documented 0.12/0.09.
- Counter parity with Clash is asserted, including the deliberate difference: RTS
  catapults keep the higher building multiplier because they cannot outrange towers
  the way the Clash catapult can.
- ADR-023 records the bone-texture rule so the next agent does not reintroduce it.

## Changed files

- `games/royale/tests/rts.mjs` (new), `run-all.mjs`, `README.md`
- `games/royale/src/game.js` (`disposeDeep`)
- `docs/ai/DECISIONS.md` (ADR-023), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 7/7 suites, 105 checks, all pass.
- The leak, measured before the fix: four RTS enter/exit cycles gave textures
  32, 44, 56, 68 with geometries flat at 116. Root cause confirmed by counting ten
  skinned meshes each holding a 12x12 bone texture, and by a WebGL-level trace
  showing ten `texStorage2D 12x12` uploads per entry.
- After the fix the same four cycles give textures 20, 20, 20, 20 and geometries
  116, 116, 116, 116 — the leak is gone and LV2 returns to the Clash baseline.
- Rendering still correct after disposal: two RTS enter/exit cycles followed by a
  Clash match showed nine skinned meshes, all visible, and a screenshot confirmed
  intact soldiers, towers, and terrain.
- `leak.mjs` still 116 geometries / 20 textures flat over six Clash cycles, so the
  `disposeDeep` change did not disturb the Clash path.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- The RTS suite covers simulation rules and cleanup, not RTS input (selection box,
  gestures, camera pan) and not the HUD panels. Those still need a real device.
- LV2 memory was measurably worse before this fix on any device where a player
  entered and left LV2 repeatedly. Worth mentioning if the player says long sessions
  used to degrade.
- The black-flash fix from `d0fae14` is still unconfirmed on the player's device.
- Gauntlet condition balance is simulated, not played.
- Live PvP flows (reconnect on both roles, 30s grace, walkover) remain unverified on
  real hardware; the sandbox cannot reach Supabase.
- Running the suite needs `npm install` in `games/royale/tests` once, plus
  `npx playwright install chromium` where no browser is preinstalled.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, Pages CI runs the full lint/test/build
  sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `PROJECT_CONTEXT.md`, this handoff, and the ADRs relevant to your scope
   before editing anything under `games/royale/`.
3. Run `npm test` in `games/royale/tests` before and after any Royale change, and
   quote the real result in the handoff.
4. There is no active implementation task. Open candidates: RTS input/HUD coverage,
   or wait for Penny's next scoped request.

## Do not redo

- Do not remove the bone-texture disposal in `disposeDeep`; it fixes a measured
  ten-texture-per-entry leak in LV2 (ADR-023).
- Do not write Royale verification scripts outside the repository; a check an agent
  cannot rerun is not a check.
- Do not remove the tutorial suppression in `lib/harness.mjs`; without it every
  UI-driving test times out on the ADR-014 modal.
- Do not raise a leak baseline to silence a failure. Flat across cycles is the gate.
- Do not use `window.__rts.scene`; `__rts` is the mode module and the game is
  `__rts.game`. That mistake made a texture sweep report zero textures.
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information, and
  do not give the RTS AI a different starting position from the player.
- Do not read `GAME_RULES` directly inside match code; use `game.rules`, and never
  let a condition override `elixirMax`.
- Do not raise the catapult building bonus in Clash to the RTS value of 2.0.
- Do not add a card description that promises a mechanic the data does not carry.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not restore `HalfFloatType` composer targets or a plain DPR cap, and keep the
  graphics self-heal escalating rather than boolean.
- Do not reintroduce hardcoded counter card ids in `ai.js`.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive `progress.md`, or copy transcripts
  or secrets into repository context files.
