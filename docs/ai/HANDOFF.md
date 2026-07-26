# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `b2de769`
Status: Codex's eight features now covered by tests; suite is 6 files, 76 checks

## Current objective

Cover Codex's eight features (ADR-014 to ADR-021) with tests, so the next agent to
touch them finds out immediately when an invariant breaks. Scope is deliberately
the invisible ones — data stripping, single rule paths, effect cleanup, credential
storage — not how the rings look; visuals still need a real device.

## Completed

- Added `games/royale/tests/features.mjs`, 27 checks across all eight ADRs, and
  registered it in `run-all.mjs`. The suite is now six files and 76 checks.
- Tutorial gating (ADR-014): fresh save opens it, a save with any recorded match
  never does, and `markTutorialSeen()` closes it permanently.
- Profiles (ADR-015): the code never appears in `localStorage`, each profile has
  its own salt, the stored digest is SHA-256 shaped, wrong codes are rejected,
  right ones log in, short codes are refused, and the save key is profile-scoped.
- Placement (ADR-019): `placementInfo` and `validPlacement` agree on six probes,
  every reason code is in the documented set, and out-of-arena input is clamped.
- Spell telegraphs (ADR-021): one telegraph per cast, the `fx` event carries radius
  and remaining delay but not the internal simulation clock, the queue drains once,
  and the telegraph is gone after impact plus fade.
- Lane pressure and recap (ADR-016/017): `pressureClock()` tracks simulation time,
  so a paused tutorial or a throttled tab cannot inflate danger duration.
- Highlight replay (ADR-018): the window stays at 12 seconds and every frame has
  the enemy hand, elixir, and next card stripped while the player's own hand is kept.
- Combat clarity (ADR-020): 36 live units added no geometry, confirming the marker
  layer is one instanced mesh rather than per-unit meshes.
- `README.md` documents the storage cache trap that made two of these tests lie at
  first: `storage.js` caches the save, so a `localStorage` write needs a reload.

## Changed files

- `games/royale/tests/features.mjs` (new), `run-all.mjs`, `README.md`
- `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/royale/tests`: 6/6 suites pass, 76 individual checks.
- `features.mjs` 27/27 on the checks listed above.
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
- The eight features are covered at the invariant level only. Their visual and
  audio sides — telegraph legibility, warning loudness, tutorial highlight
  placement — still need a real device.
- Three of the new checks failed on first run and all three were faults in the
  test, not the game: the storage cache, counting particle effects as telegraphs,
  and a float equality. Treat a first-run failure as suspect until reproduced.
- Running the suite needs `npm install` in `games/royale/tests` once, plus
  `npx playwright install chromium` where no browser is preinstalled.
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
4. There is no active implementation task. Open candidates: RTS-side coverage in
   the suite, or wait for Penny's next scoped request.

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
- Do not create a second handoff file, revive `progress.md`, or copy transcripts
  or secrets into repository context files.
