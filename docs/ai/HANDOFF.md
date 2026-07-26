# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline at handoff: `main` = merge `615962e` (contains `d690dcc` + `af3dca9`)
Status: Empire Royale gameplay batch complete, deployed, and verified

## Current objective

Deepen Empire Royale (`games/royale`) gameplay: make unit counters real, and make
the AI use them through data rather than hardcoded card ids.

## Completed

- Counter system (`b9707bf`): added `heavy` tag (knight / ram / elephant /
  ironclad) and `bonusVs: { heavy: 2.0 }` on pikemen. Applied at the single
  `#damage` funnel in `game.js`, so melee, projectiles, and spells are all
  covered without per-path special cases. This implements a counter the pikemen
  card had advertised since launch but that never existed in code.
- Bonus hits render an orange `N!` damage number so the mechanic is learnable
  without reading docs.
- Mirrored into LV2 RTS (`vsHeavy`, alongside the existing `vsBuilding`).
- AI counter awareness (`d690dcc`): new `#valuePerElixir(card, target)` scores
  cards by real output per elixir including `bonusVs` and target `armor`.
  Removed the hardcoded `id === 'pikemen'` branch in `tryDefend`, so future
  counters need no AI changes.
- AI reads only public information (`playedCards`) via `#oppHasHeavyCounter()`
  to stop force-feeding heavy units into a known counter. No hand peeking.

## Changed files

- `games/royale/src/cards.js`
- `games/royale/src/game.js`
- `games/royale/src/ai.js`
- `games/royale/src/rts/rts.js`
- `docs/ai/HANDOFF.md`

## Verification

- Browser smoke (Playwright + swiftshader, real game load) for all claims below.
- Counter damage: pikemen over 8s dealt 890 to a knight vs 390 to a swordsman.
- AI defence choice: picked pikemen 12/12 times against an elephant push.
- Data-driven proof: value-per-elixir ranks pikemen 1st vs elephant (97.5) but
  only 2nd vs militia (48.8, behind militia 51.8) — target-aware, not a blanket
  preference.
- Opponent-read: heavy plays dropped 41% -> 32% after pikemen were shown.
- Fairness unchanged: stage-8 sim shows no card played twice in a row and 0%
  elephant spam.
- Regression green: full-match sim, GPU leak baseline (115 geometries),
  new-card mechanics, surrender/menu paths, RTS AI.
- GitHub Pages deploy verified success for `b9707bf`.

## Known issues and cautions

- `d690dcc` was pushed before this handoff file existed on the branch, so code
  and handoff are in separate commits for this one task only. Later tasks should
  keep them in a single commit per `AGENTS.md`.
- Deploy for merge `615962e` was not yet verified at the time of writing; check
  the `deploy-pages.yml` run for that SHA before assuming the site is updated.
- Live PvP flows (reconnect on both roles, 30s disconnect grace, walkover) still
  need two-device verification; the cloud sandbox cannot reach Supabase.
- Royale graphics auto-downgrade on WebGL context loss via the
  `royale_gfx_safe` localStorage flag; clear it when testing full-quality paths.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, and Pages CI runs full automated checks
  only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Verify the `deploy-pages.yml` run for `615962e` succeeded.
3. Pick the next Royale gameplay item. Open candidates, none started: extend the
   counter triangle with a second relationship, gauntlet stage variety, a
   first-run tutorial, and the replay system.

## Do not redo

- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the
  `bonusVs` / tag data instead.
- Do not give the AI economy bonuses or hidden information; difficulty must come
  from tactics only.
- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy chat transcripts or secrets into repository context files.
