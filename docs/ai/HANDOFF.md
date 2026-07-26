# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `c79371a`
Status: Royale spell telegraphs implemented and browser verified; no active follow-up task

## Current objective

Make every spell's impact area and remaining cast time legible before damage lands,
including enemy warnings, PvP guest rendering, and highlight replay, without changing
spell balance or simulation timing.

## Completed

- All four spells now show their exact damage radius before impact. A team-coloured
  countdown ring contracts onto the boundary while the inner fill strengthens.
- Enemy casts play a distinct two-tone warning through the existing synthesized
  audio system. The player's existing cast sound remains unchanged.
- Spell telegraphs travel through the existing snapshot `fx` channel with spell id,
  team, radius, and remaining cast duration. Serializing after part of the delay does
  not restart the warning from its original full duration.
- PvP guests map the authoritative host team to their local blue/red viewpoint before
  drawing the telegraph. Highlight replay keeps the local player orientation.
- Guest-side impact events now also use the existing explosion sound and light shake;
  this restores impact feedback that was previously visual-only on the guest.
- Telegraph geometry and materials are owned per effect and disposed after the short
  post-impact fade or when the match/guest renderer is cleaned up.
- Fireball, arrows, freeze, and powder keg damage values and cast delays are unchanged.

## Changed files

- `games/royale/src/game.js`
- `games/royale/src/main.js`
- `games/royale/src/pvp.js`
- `games/royale/src/sfx.js`
- `docs/ai/DECISIONS.md` (ADR-021)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for all four changed Royale JS modules: PASS.
- `git diff --check`: PASS.
- Real browser smoke at direct `/games/royale/` navigation: PASS.
- Fireball, arrows, freeze, and powder keg each produced exactly one telegraph; at
  half delay the target tower HP was unchanged, then damage was respectively 126,
  47.25, 14, and 73.5. Every telegraph removed after impact.
- Player telegraphs used blue `9cc8ff`; an enemy fireball used red `ffb09c`, called
  the warning hook exactly once, caused no early damage, and still dealt 126.
- Countdown scale contracted from 1.28 to about 1.07 halfway through local casts;
  fill opacity increased from 0.04 to 0.115.
- A spell serialized halfway through a 0.6-second cast carried `d: 0.3` with its
  internal simulation timestamp removed.
- PvP guest snapshot test mapped raw host player blue to local enemy red, contracted
  1.28 to 1.032 in real time, removed itself, and kept geometry flat at 161 to 161.
  Local replay mapped the same raw team back to blue and also cleaned up.
- A real highlight replay capture 0.2 seconds into fireball stored `d: 0.4` in the
  frame snapshot.
- Portrait 390x844 and landscape 844x390 screenshots passed visual inspection with
  zero horizontal overflow.
- Console had no functional errors; only the existing root `/favicon.ico` 404.

## Known issues and cautions

- Browser automation proved the enemy warning hook invocation. Headless output does
  not objectively certify loudness on Penny's phone speakers.
- Snapshot rendering and team mapping passed locally. Live two-device Supabase
  matchmaking and latency remain unavailable in the local sandbox.
- Existing device-specific black-flash verification remains unresolved.

## Exact next action

1. There is no active implementation task. The receiving agent should sync `main`,
   read ADR-021, and wait for Penny's next scoped request.
2. On a real phone, optionally judge whether the warning tone and red fill remain
   noticeable at the preferred volume during a dense fight.

## Do not redo

- Do not change spell damage, tower multipliers, radius, or cast delay to tune this UI.
- Do not send the private simulation timestamp over snapshots; send remaining duration.
- Do not infer pre-impact spell locations on the guest from later damage. Keep using
  the explicit `fx` event.
- Do not share telegraph materials with cached model materials; cleanup owns them.
- Do not amend, rebase, or force-push published `main` history.
