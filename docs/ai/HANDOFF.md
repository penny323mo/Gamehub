# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `2953035`
Status: guest render path now leak-gated too; it came back clean, no fix needed

## Current objective

Close the last unguarded teardown path. Two leaks had just been found in two different
dispose paths, and the PvP guest renderer — which builds its own entities, HP bars, and
one-shot effects from host snapshots — had never been leak-tested. It can be driven
offline with fake snapshots, so no Supabase access was needed.

## Completed

- Extended `pvp-guest.mjs` with a construct/dispose leak gate: four rounds of building
  a `GuestGame`, feeding snapshots that carry every one-shot effect the host can send
  (spell telegraph, explosion ring, heal pulse), ticking, and disposing.
- Result is a clean bill: geometries 116 and textures 19, identical in all four rounds.
  The guest path was already correct — `dispose()` clears entities, HP bars, and the
  `fxRings` set, and guest telegraphs use plain materials with no textures.
- This is a deliberate negative result. It is worth having because the guest renderer
  is the one teardown path a cloud agent cannot reach through real matchmaking, so
  without this gate a future regression there would only surface on a player's device.
- The suite is now eight files and 112 checks; no production code changed.

## Changed files

- `games/royale/tests/pvp-guest.mjs`, `README.md`
- `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 8/8 suites, 112 checks, all pass.
- Guest gate: rounds 1-4 all report 116 geometries and 19 textures, so nothing is
  retained across construct/dispose cycles even with telegraphs and rings in flight.
- The three earlier gates still hold: Clash 116/20 flat over six cycles, LV2 20/20/20/20
  over four enter/exit cycles, mixed session excess 7 against a 62-entry cache.
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
