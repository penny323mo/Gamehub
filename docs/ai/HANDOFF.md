# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `250f8ac`
Status: gauntlet stages now vary; match rules are per-match instead of global

## Current objective

Give the gauntlet ladder actual variety. Stages differed only by a difficulty label
and the AI's tactical sharpening, so from stage 3 onwards every stage played the
same. ADR-007 rules out variety through better AI numbers, so each stage gets a
battlefield condition that applies to both sides equally.

## Completed

- New `games/royale/src/gauntlet.js` holds the stage table: five conditions plus a
  plain stage, cycling with period 6. Stage 1 is always plain so a new player learns
  the baseline first.
- Conditions: 速攻戰 (2-minute regulation), 聖水泛濫 (elixir interval 2.8 to 1.75),
  堅城 (both towers ×1.3 HP), 聖水泉常開 (fountain live from the first second),
  開局決鬥 (both start on 10 elixir).
- Opponent personality rotates deterministically by stage instead of randomly, so
  a stage can be prepared for; period 6 against 5 personalities means the same
  pairing returns only after 30 stages.
- `Game` accepts `rules`, `towerHpMult`, and `fountainFromStart`. Every in-match
  rule read now goes through `this.rules`, including `ai.js` (its elixir counting
  would otherwise model the wrong regen rate) and `ui.js`; `GuestGame` exposes
  `rules` too. `elixirMax` stays non-overridable because the HUD builds its elixir
  pips once from the constant.
- The condition is announced by a banner and stays visible all match as a chip
  under the timer; a hidden rule change would be worse than no variety. The end
  screen previews the next stage on a win, so the deck can be edited first.
- Fixed a pre-existing banner bug found while testing: `#banner` sits at
  `left: 50%`, capping its width at half the container, and `white-space: nowrap`
  ran long text off both screen edges. It now wraps inside `width: max-content`.

## Changed files

- `games/royale/src/`: `gauntlet.js` (new), `game.js`, `ai.js`, `pvp.js`, `ui.js`,
  `main.js`
- `games/royale/index.html`, `games/royale/style.css`
- `docs/ai/DECISIONS.md` (ADR-013), `docs/ai/HANDOFF.md`

## Verification

- Conditions land: stages 1-7 report the expected `matchTime` (180/120), elixir
  interval (2.8/1.75), start elixir (5/10), princess HP (1500/1950), king HP
  (2600/3380), `fountainAlways`; `elixirMax` stayed 12 in every stage.
- Symmetry, stages 1-6: tower HP strings match, both start on the same elixir, and
  after ten simulated seconds both hold identical elixir (8/8, 10/10 under 聖水泛濫,
  12/12 under 開局決鬥) with `enemyElixirRate` 1.
- Fountain-from-start: a unit parked at river centre for seven seconds gained 4
  elixir under 聖水泉常開 versus 2 under standard rules — two fountain ticks.
- Opponent rotation is deterministic, every key resolves to a real personality,
  and stage 1 plus stage 0 (non-gauntlet) have no condition.
- Every condition plays a full match to a result: 速攻戰 ended at 120s, the others
  ran to regulation or overtime, no errors.
- HUD: stage 4 shows chip `🧱 堅城` with both princess towers at 1950; a standard
  single match hides the chip and restores 1500. End screen: win at stage 3
  previews 堅城, win at stage 6 says 下一關：標準規則, a loss shows nothing.
- Layout at 390x844 and 1000x760: the chip clears the crown boxes, quit/mute
  buttons, camera controls, and played-cards column, and the long condition banner
  fits on screen in two lines.
- Regression: `test-royale-leak.mjs` 115 geometries / 20 textures flat over six
  match/menu cycles; `clash-fixes-test.mjs`, `test-pvp-logic.mjs`,
  `test-royale2.mjs`, `rts-check.mjs` all pass. Only console error is the
  sandbox's Supabase tunnel failure.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- The black-flash fix from `d0fae14` is still unconfirmed on the player's device;
  do not tune graphics further until they report back.
- Condition balance is simulated, not played; if the ladder feels swingy, tune the
  condition table rather than the AI.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity: committer and author are already `noreply@anthropic.com`. Penny
  accepted that. Do not rewrite pushed history, do not change `git config`.
- Damage-number cache eviction can dispose a texture still used by an in-flight
  sprite; Three re-uploads it, so this is churn, not corruption.
- Live PvP flows (reconnect on both roles, 30s disconnect grace, walkover) remain
  unverified on real hardware; the cloud sandbox cannot reach Supabase.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, Pages CI runs the full lint/test/build
  sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `PROJECT_CONTEXT.md`, this handoff, and ADR-007 to ADR-013 before editing
   anything under `games/royale/`.
3. Ask the player whether the black flash is gone before tuning graphics further.
4. Otherwise pick the next Royale item: a first-run tutorial, or the replay system.

## Do not redo

- Do not re-derive the Royale constraints by reading the whole game; ADR-007 to
  ADR-013 already record them, and Git history is the evidence.
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information;
  add or tune a symmetric condition instead.
- Do not read `GAME_RULES` directly inside match code; use `game.rules`, and never
  let a condition override `elixirMax`.
- Do not raise the catapult building bonus to the RTS value of 2.0; the range
  advantage over towers is the reason the two modes differ.
- Do not add a card description that promises a mechanic the data does not carry.
- Do not restore `white-space: nowrap` on `#banner` without fixing the `left: 50%`
  width cap; that combination clipped long text off screen.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not restore `HalfFloatType` composer targets or a plain DPR cap, and keep the
  graphics self-heal escalating rather than boolean.
- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the `bonusVs`
  and tag data instead.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive root `progress.md`, or copy chat
  transcripts or secrets into repository context files.
