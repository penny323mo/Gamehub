# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `b5532c8`
Status: Empire Royale wrapped up. No active task. Only real-device checks remain.

## Current objective

Close out Empire Royale: one final verification pass over everything that shipped,
and a handoff that tells the next agent the game is finished rather than mid-task.
Nothing new was built here on purpose.

## Completed

- Final full-suite run: eight files, 112 checks, all pass. This is the state of the
  code at `main`, not a historical number.
- Visual smoke at a 420x900 phone viewport across the three surfaces a player sees:
  the menu, a live Clash match, a gauntlet stage with its condition chip, and the LV2
  map. All render correctly with no console errors.
- Handoff rewritten as a closing statement. The suite, the ADRs, and the device
  checklist below are the durable artifacts; day-to-day task state is now empty.

## Where the game stands

- Clash mode: 21 cards, counters via `bonusVs` tags, healer/bomber/armour mechanics,
  overtime with a river fountain, procedural bone animation, synthesized combat audio.
- Gauntlet: six-stage condition cycle, deterministic opponent rotation, all conditions
  symmetric — difficulty comes from AI tactics, never from resources (ADR-007/013).
- PvP: host-authoritative relay, reconnect with a persisted snapshot, 30s disconnect
  grace, effects synchronized through the snapshot `fx` channel.
- LV2 RTS: economy, ages, tech tree, towers, counters that match Clash.
- Progression: trophies, card levels, daily challenges, achievements, global
  leaderboard, local player profiles with hashed codes.
- Quality: two GPU texture leaks found and fixed this session, graphics self-heal that
  converges, and a committed regression suite both agents can run.

## Changed files

- `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 8/8 suites, 112 checks, all pass.
- Leak gates all flat: Clash 116 geometries / 20 textures over six cycles, LV2 20
  textures over four enter/exit cycles, guest 116/19 over four construct/dispose
  cycles, mixed session excess 7 fully explained by a 62-entry damage-number cache.
- Screenshots at 420x900: menu, Clash mid-fight with lane pressure and damage numbers,
  gauntlet stage 4 showing the 堅城 chip, LV2 map with resources and villagers.
- `./scripts/check-handoff.sh`: PASS.
- Deploy for the previous commit `b5532c8` verified success.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- Everything below needs Penny on a real device; the cloud sandbox cannot do it.
  1. Black-screen flash: play a long session mixing Clash and LV2 and report whether
     it still happens. Two leaks that fed that memory pressure were fixed this
     session, so this is the highest-value check.
  2. PvP on two devices: reconnect on both roles, the 30s disconnect grace, walkover.
  3. Gauntlet feel: the five battlefield conditions are balanced by simulation only.
  4. Spell telegraph legibility and enemy warning volume during a dense fight.
  5. LV2 touch input: selection box, two-finger zoom and pan.
- If a condition feels swingy, tune the table in `gauntlet.js`, never the AI.
- Running the suite needs `npm install` in `games/royale/tests` once, plus
  `npx playwright install chromium` where no browser is preinstalled.
- Commits show as Unverified because this environment has no signing key, not a wrong
  identity. Do not rewrite pushed history, do not change `git config`.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, Pages CI runs the full lint/test/build
  sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. There is no active implementation task. Royale is feature-complete and shipped.
3. If Penny reports a device issue from the checklist above, start there; reproduce it
   in `games/royale/tests` first so the fix has a gate.
4. Otherwise wait for Penny's next scoped request, on Royale or another game.

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
  `__rts.game`.
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
