# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `17d1482`
Status: mixed-mode session suite added; it found a second texture leak, now fixed

## Current objective

Cover what single-mode tests structurally cannot: a long session that keeps switching
modes. Leaks live in the seams between modes, and a rising GPU texture count is the
mechanism behind the player's "it flashes black after a while" report. The new test
failed on first run and exposed a second leak.

## Completed

- Added `games/royale/tests/session.mjs`: five rounds of two full Clash matches plus
  an LV2 entry and exit, checking GPU resources at every round boundary. The suite is
  now eight files and 110 checks.
- Fixed the leak it found. The crown-pop effect owns a `CanvasTexture` and released it
  in `onEnd`, but killing a king tower ends the match immediately, so cleanup ran
  first and the texture leaked every match.
- Split the two meanings that were sharing `onEnd`. Effects now release owned
  resources in `onDispose`, which runs both on natural completion and on teardown;
  `onEnd` stays "the duration elapsed, do the thing" and is still never called during
  cleanup, because for spells it detonates the impact. ADR-024 records this.
- Exported `dmgTextureCacheSize()` so a test can tell a filling cache apart from a
  leak. The damage-number cache is deliberately kept across matches and bounded at 96,
  so texture count legitimately sits above the boot baseline.

## Changed files

- `games/royale/tests/session.mjs` (new), `run-all.mjs`, `README.md`
- `games/royale/src/game.js` (`onDispose` hook, `dmgTextureCacheSize`)
- `games/royale/src/main.js` (`cleanupMatch` releases effect-owned resources)
- `docs/ai/DECISIONS.md` (ADR-024), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 8/8 suites, 110 checks, all pass.
- The leak, measured before the fix: three mixed rounds gave textures 24, 27, 30 with
  geometries flat at 117 — three lost textures per round.
- After the crown fix the same shape of run gives 23, 24, 25, 25, 26 across five
  rounds, and every texture above the boot baseline is accounted for: excess 7 against
  a damage-number cache holding 62 entries, cache under its 96 cap.
- Geometries stayed flat at 117 in every round and returned to within one of the boot
  baseline of 116.
- `leak.mjs` and `rts.mjs` still pass unchanged, so neither the `onDispose` split nor
  the cleanup change disturbed the single-mode paths.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- Two texture leaks have now been fixed in a row (ADR-023 bone textures, ADR-024
  crown pop). Both made long sessions consume more GPU memory over time, which is the
  same pressure that triggers the black-flash downgrade. Worth telling the player that
  a long session should behave better now.
- `session.mjs` intentionally does not require textures to return to the boot
  baseline; the damage-number cache is designed to persist. It requires the excess to
  be explained by the cache size.
- The RTS suite covers simulation rules and cleanup, not RTS input (selection box,
  gestures, camera pan) and not the HUD panels. Those still need a real device.
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
- Do not call `onEnd` from teardown to release resources; that detonates pending
  spells. Owned resources go in `onDispose` (ADR-024).
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
