# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `14e94f1`
Status: catapult siege bonus shipped; `bonusVs` now covers entity-level tags

## Current objective

Close the last known instance of the bug class the pikemen fix uncovered: a card
whose description advertises a mechanic the code never implemented. The Clash
catapult was sold as an 攻城利器 with no building damage bonus at all, while the
RTS catapult had carried `vsBuilding: 2` for a long time. That is both a broken
promise to the player and a cross-mode inconsistency.

## Completed

- Catapult now has `bonusVs: { building: 1.6 }` and its description states the
  multiplier instead of implying one.
- The multiplier is deliberately lower than the RTS value of 2.0. Catapult range
  is 8.5 and princess-tower range is 7.5, so a catapult can already siege from
  outside tower range for free; 2.0 on top of that would make a 5-cost card
  dominant. RTS has no equivalent free-shot geometry, so the two numbers should
  not match.
- Generalised the counter system rather than special-casing towers. `bonusVs`
  tags used to resolve only against `card` properties, and towers have no card
  object, so a `building` tag could never have matched. `Game#damage` now maps the
  `building` tag onto `isTower || isBuilding` and leaves every other tag reading
  from the card, so future tags need data only.
- Bonus hits keep the existing orange `N!` damage-number treatment, so the player
  can see the bonus applying without new UI.

## Changed files

- `games/royale/src/cards.js`
- `games/royale/src/game.js`
- `docs/ai/HANDOFF.md`

## Verification

- Tower kill timing, catapult alone against a full-health princess tower:
  17.6s with the bonus versus 28.1s without, a ratio of 1.60 — exactly the
  configured multiplier, so the bonus lands on every shot and nowhere twice.
- Tag separation: same catapult deals 672 to a watchtower and 1195 to a
  swordsman over the same window, confirming the bonus applies to buildings only.
- Card text matches data: description quotes ×1.6 and `bonusVs` is
  `{ building: 1.6 }`.
- `counter.mjs`: pikemen still 890 versus heavy against 390 versus normal
  (ratio 2.28 including armour), heavy list unchanged, RTS values unchanged.
- `newcards.mjs`: cleric heal, grenadier death bomb, ironclad armour all pass.
- `clash-fixes-test.mjs`: all five checks pass.
- `test-royale-leak.mjs`: 115 geometries and 20 textures flat across six
  match/menu cycles.
- `test-royale2.mjs`: full match simulates to a 3-crown result; the only console
  error is the sandbox's Supabase tunnel failure.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- The black-screen-flash fix from `d0fae14` is still unconfirmed on the player's
  device. Do not tune graphics further until they report back.
- Commits in this repository show as Unverified on GitHub because this environment
  has no commit-signing key, not because of a wrong identity: committer and author
  are already `noreply@anthropic.com`. Penny has decided to accept that. Do not
  rewrite pushed history to chase the badge; amending cannot create a signature
  without a key, and force-pushing `main` would break the shared handoff baseline
  the other agent syncs from. Adding signing needs Penny to supply a key.
- The player should clear `royale_gfx_safe` in localStorage if an earlier flash
  already recorded a strike and they want to re-test full quality.
- Damage-number cache eviction can dispose a texture still used by an in-flight
  sprite. Three re-uploads it on next use, so this is churn, not corruption.
- Live PvP flows (reconnect on both roles, 30s disconnect grace, walkover) remain
  unverified on real hardware; the cloud sandbox cannot reach Supabase.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, and Pages CI runs the full automated
  lint/test/build sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `PROJECT_CONTEXT.md`, this handoff, and ADR-007 to ADR-012 before editing
   anything under `games/royale/`.
3. Ask the player whether the black flash is gone before tuning graphics further;
   only device feedback can close this one.
4. Otherwise pick the next Royale item. Open candidates, none started: gauntlet
   stage variety, a first-run tutorial, and the replay system.

## Do not redo

- Do not re-derive the Royale constraints by reading the whole game; ADR-007 to
  ADR-012 already record them, and Git history is the evidence.
- Do not raise the catapult building bonus to the RTS value of 2.0; the range
  advantage over towers is the reason the two modes differ.
- Do not add a card description that promises a mechanic the data does not carry;
  pikemen and catapult were both found that way.
- Do not special-case towers at a call site to make a counter tag work; extend the
  tag resolution in `Game#damage`.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not compare performance across separate runs with randomised battles; use
  the in-session alternating A/B pattern.
- Do not restore `HalfFloatType` composer targets or a plain DPR cap; both were
  measured causes of the black-flash regression.
- Do not make graphics self-heal a boolean again; it must escalate so it
  converges.
- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the `bonusVs`
  and tag data instead.
- Do not give the Royale AI economy bonuses or hidden information.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`,
  and do not change `git config` identity; both were explicitly ruled out.
- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy chat transcripts or secrets into repository context files.
