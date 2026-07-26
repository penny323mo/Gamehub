# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `f3ae634`
Status: Royale local player save slots implemented and verified

## Current objective

Let multiple people on the same browser resume separate Royale progress using a
player name and a simple code, while preserving the pre-profile save.

## Completed

- Added a compact `👤 玩家` tab with current player, name, 4–12 character code,
  login/create actions, and known local player names.
- Each player now has isolated `royale-save-v1:<profile-id>` progress, leaderboard
  display-name, and leaderboard player-id keys.
- New-player codes use a random salt plus SHA-256 hash; plaintext codes are not
  stored.
- The first created player copies the old shared save and leaderboard id into its
  scoped keys. The old shared keys are not deleted, so migration is recoverable.
- A second player starts fresh. Switching player reloads the page so every module
  reads the selected save rather than retaining the previous in-memory cache.
- The UI explicitly says this is local save separation, not a cloud/security
  account, and browser-site-data deletion also deletes the profiles.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/profiles.js` (new)
- `games/royale/src/storage.js`
- `games/royale/src/leaderboard.js`
- `games/royale/src/ui.js`
- `docs/ai/DECISIONS.md` (ADR-015)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for `profiles.js`, `storage.js`, `leaderboard.js`, and `ui.js`: PASS.
- HTML duplicate-id and UI DOM-reference contract check: PASS (117 ids / 75 refs).
- Legacy migration: a seeded 321-trophy save retained 12/4/2 record, Lv3 card and
  shards, custom deck, achievement date, tutorial state, and leaderboard id.
- Migration copied rather than deleted the legacy save; old fallback key remained.
- Stored profile record contained only id/name/salt/hash; test code `1234` was not
  present in serialized profile storage.
- Two-player isolation: first player stayed at 321 trophies; second started at 0,
  was set to 77 for the test, and switching back restored 321.
- Wrong code did not change the active player; correct code did.
- Browser smoke passed at 390x844 portrait and 844x390 landscape with no horizontal
  overflow. Player list, inputs, notices, and current-player state were readable.
- Browser console reported no functional errors.
- `git diff --check`: PASS.

## Known issues and cautions

- Profiles exist only in this browser's localStorage. There is no cross-device
  sync, code recovery, server authentication, or protection from someone with
  access to browser storage.
- Deleting site data deletes all local profiles and progress.
- Existing black-flash and live PvP device-level verification cautions from the
  prior handoff remain unresolved and are unrelated to this change.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-015 and
   this handoff before editing Royale storage/profile code.
2. Penny can create the first named player on the real device; that operation
   safely binds a copy of the existing progress.
3. Do not add cloud-auth claims unless a real backend and recovery design are
   explicitly authorized.

## Do not redo

- Do not store the local code in plaintext.
- Do not delete or overwrite the legacy save during first-player migration.
- Do not reuse one save or leaderboard player id across named profiles.
- Do not remove the reload after player switch unless all module-level save caches
  are made profile-aware and tested.
- Do not amend, rebase, or force-push published `main` history.
