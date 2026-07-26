# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `8a85573`
Status: Royale context capture complete; no code behaviour changed

## Current objective

Make the Royale knowledge from the long cloud session survive an agent switch.
The previous handoff described the last task well, but `DECISIONS.md` held only
protocol ADRs and `PROJECT_CONTEXT.md` described Royale in one line, so the
hard-won engineering constraints existed only in commit messages and in one
agent's context window.

## Completed

- Added ADR-007 to ADR-012 covering the Royale rules a future editor must not
  break: AI fairness doctrine, `disposeDeep` material ownership, procedural bone
  animation, Draco assets with a vendored decoder, host-authoritative PvP with an
  explicit `fx` channel, and per-device graphics downgrade.
- Expanded the Royale row in `PROJECT_CONTEXT.md` into a real module map.
- Added Royale architectural invariants: the single `Game#damage` funnel for
  counters and armour, and the rule against special-casing card ids in `ai.js`.
- Added Royale verification specifics: swiftshader rAF is about 5fps so step the
  sim manually and freeze before capture, the `window.__royale*` debug handles,
  the 115-geometry leak gate, and the fact that live PvP needs real devices.

## Changed files

- `docs/ai/DECISIONS.md`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/HANDOFF.md`

## Verification

- `./scripts/check-handoff.sh`: PASS.
- `./scripts/agent-context.sh --check`: PASS; branch and `main` aligned with
  origin before the change.
- Documentation-only task. No game source changed, so no browser smoke was run
  and none is required. Every claim recorded in the new ADRs comes from checks
  already run and recorded in earlier commits on this branch.

## Known issues and cautions

- Deploy for `8a85573` verified success. This task changes no shipped asset, so a
  Pages deploy is expected to be a no-op for the site.
- Live PvP flows (reconnect on both roles, 30s disconnect grace, walkover) remain
  unverified on real hardware; the cloud sandbox cannot reach Supabase.
- Royale graphics auto-downgrade through the `royale_gfx_safe` localStorage flag;
  clear it before testing full-quality rendering paths.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, and Pages CI runs the full automated
  lint/test/build sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `PROJECT_CONTEXT.md`, this handoff, and ADR-007 to ADR-012 before editing
   anything under `games/royale/`.
3. Pick the next Royale gameplay item. Open candidates, none started: a second
   counter relationship to widen the tactical triangle, gauntlet stage variety, a
   first-run tutorial, and the replay system.

## Do not redo

- Do not re-derive the Royale constraints by reading the whole game; ADR-007 to
  ADR-012 already record them, and Git history is the evidence.
- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the `bonusVs`
  and tag data instead.
- Do not give the Royale AI economy bonuses or hidden information.
- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy chat transcripts or secrets into repository context files.
