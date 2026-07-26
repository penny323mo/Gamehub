# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `df13654`
Status: Royale regression suite committed; Codex's eight feature commits verified against it

## Current objective

Close the gap that made the handoff unverifiable. Every check the last several
handoffs cited — the GPU leak gate, gauntlet symmetry, PvP guest mapping — existed
only inside one cloud session's temporary directory. The receiving agent could read
the numbers but could not reproduce them, and a feature landing on one side could
silently break automation the other side could not see. That is exactly what
happened: the first-run tutorial modal (ADR-014) blocks every automated click.

## Completed

- Added `games/royale/tests/`: `leak.mjs`, `gauntlet.mjs`, `combat.mjs`,
  `pvp-guest.mjs`, `match.mjs`, a `run-all.mjs` runner, `README.md`, and
  `lib/harness.mjs` which owns the static server, Chromium resolution, error
  capture, and scoring. `npm test` exits non-zero on any failure.
- The harness suppresses the first-run tutorial through the game's own
  `markTutorialSeen()`, so UI-driving tests stop timing out on the modal.
- Chromium resolution works in both environments: `PLAYWRIGHT_CHROMIUM`, then the
  preinstalled `/opt/pw-browsers/chromium`, then Playwright's own lookup.
- Ran the suite against Codex's eight commits. The Royale invariants hold; details
  below. The leak baseline is 116, matching what Codex already recorded.
- `PROJECT_CONTEXT.md` now names the suite as the Royale check command and lists
  `gauntlet.js`, `profiles.js`, and the tests directory. ADR-022 records the rule.

## Changed files

- `games/royale/tests/` (new: harness, five suites, runner, README, package.json)
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` (ADR-022), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 5/5 suites pass, 49 individual checks.
- `leak.mjs`: geometries 116 and textures 20, identical across six match/menu
  cycles. The rise from 115 is ADR-020's persistent instanced marker layer, not a
  leak; a leak shows as monotonic growth, and this is flat.
- `gauntlet.mjs` 17/17: every condition still lands (120s rush, 1.75s flood
  interval, 1950/3380 fortify towers, fountain-from-start, 10 starting elixir),
  both teams stay identical on tower HP, starting elixir, and ten-second elixir,
  and `elixirMax` is never overridden.
- `combat.mjs` 8/8: pikemen ratio 2.28 against heavy, catapult siege speed-up in
  the 1.45-1.75 band, ironclad takes 88 against an expected 88, cleric still deals
  zero damage, grenadier keeps its 260 death bomb.
- `pvp-guest.mjs` 10/10: hand, unit ownership, tower ownership, placement sides,
  entity removal, winner mapping, and all three `pendingHand` transitions.
- `match.mjs` 8/8: surrender books a loss and clears the streak, return-to-menu
  releases GPU resources, the AI never sits full on elixir, and a full match ends.
- No console or page errors in any suite.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge. The
  suite is test-only; production still needs no build step.
- Codex's eight features (tutorial, profiles, lane pressure, recap, replay,
  placement feedback, combat clarity, spell telegraphs) are covered only by the
  invariants above. They have no dedicated tests yet; adding them is the obvious
  next expansion of the suite.
- Running the suite needs `npm install` inside `games/royale/tests` once, plus
  `npx playwright install chromium` on a machine without a preinstalled browser.
- The black-flash fix from `d0fae14` is still unconfirmed on the player's device;
  do not tune graphics further until they report back.
- Gauntlet condition balance is simulated, not played.
- Live PvP flows (reconnect on both roles, 30s grace, walkover) remain unverified
  on real hardware; the sandbox cannot reach Supabase.
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
4. There is no active implementation task. Open candidates: cover Codex's eight new
   features with tests, or wait for Penny's next scoped request.

## Do not redo

- Do not write Royale verification scripts outside the repository again; a check an
  agent cannot rerun is not a check.
- Do not remove the tutorial suppression in `lib/harness.mjs`; without it every
  UI-driving test times out on the ADR-014 modal.
- Do not raise the leak baseline to silence a failure. Flat across cycles is the
  gate; a rising count is a real leak.
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information;
  add or tune a symmetric condition instead.
- Do not read `GAME_RULES` directly inside match code; use `game.rules`, and never
  let a condition override `elixirMax`.
- Do not raise the catapult building bonus to the RTS value of 2.0.
- Do not add a card description that promises a mechanic the data does not carry.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not restore `HalfFloatType` composer targets or a plain DPR cap, and keep the
  graphics self-heal escalating rather than boolean.
- Do not reintroduce hardcoded counter card ids in `ai.js`.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive root `progress.md`, or copy chat
  transcripts or secrets into repository context files.
