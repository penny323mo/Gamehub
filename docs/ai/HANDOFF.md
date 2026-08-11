# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — Elden browser reliability + Game Hub verification checkpoint
Integration branch: `main`
Work branch: `main`
Status: latest product checks are green; this checkpoint contains a test-only Elden browser harness fix plus durable relay notes. No gameplay rule or deployed source code was changed in this round.

## Current objective

持續提升 Game Hub 全部遊戲嘅可玩性、手機體驗、可讀性同部署可靠性。每輪先用真 browser gate
搵一個未驗證嘅產品風險，修正後只提交相關 scope；交接前要確認本地同 `origin/main` 對齊。

## Completed

**Elden Ring II browser-gate reliability**

- `games/elden-ring-ii/tests/hud-layout.mjs` now gives each long mobile joystick speed probe a fresh real
  entry flow. A player dying during a long hold hides `.touch-zone` by design; the harness now releases
  safely instead of throwing a null DOM error.
- The movement/lunge probe attacks before its long movement sample, so software-rasterized combat cannot
  kill the player before measuring a valid lunge.
- Projectile tracking probes use real lateral movement so an arrow has a moving target during flight.
- Unlocked-turn probes restart through the visible `R` result action when a static sample dies, accumulating
  enough real impacts without changing game state through a private test API.
- Impact gravity probes require the same burst-pool sample (`打擊().次數` unchanged) across both reads;
  a newly selected burst is discarded rather than treated as gravity.
- Added ADR-243 documenting these isolation rules.

**Previously completed relay work remains included**

- MOBA persistent WebGL context-recovery card, safe pause reasons, and `assets-31` cache-bust across local
  imports/entry/Hub links.
- Empire Royale indeterminate loading state before the first byte-progress event.
- Tower start-screen contrast and topmost-visible text measurement.

## Changed files

- `games/elden-ring-ii/tests/hud-layout.mjs` — isolate long mobile/impact browser measurements.
- `docs/ai/DECISIONS.md` — ADR-243.
- `docs/ai/PROJECT_CONTEXT.md` — clarify Racing Car's `PLAYWRIGHT_CHROMIUM` runner variable and GPU-safe order.
- `docs/ai/HANDOFF.md` — this checkpoint.

## Verification

- `ER2_TIME=1 PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node games/elden-ring-ii/tests/hud-layout.mjs` — **92/92**, five responsive HUD sizes, mobile controls, three classes, waves/boss, death/restart, particles, DPR and zero browser errors.
- `cd games/elden-ring-ii && npm test` — typecheck/build plus **17/17** static/map/motion tests.
- `cd games/ashen-rail && npm run assets:inspect && npm run lint && npm run test && npm run build` — asset audit, lint, **14/14** Vitest, production build/prune.
- Ashen Rail real browser smoke at 844×390 touch viewport — loading → start → HUD, canvas 801×370, ammo/wave visible, no page/console errors.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub.mjs` — **96/96**; 13 entries, 2×2 mobile / four-up desktop layout, four pages, no dead links or browser errors.
- Racing Car individual real-browser suites with `PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` — race **124/124**, setup **125/125**, rivals **61/61**, ghost **29/29**, season **55/55**, audio **32/32**.
- A sequential Racing Car run without the harness's `PLAYWRIGHT_CHROMIUM` override hit 90-second `openRacer()` startup timeouts in setup/ghost after the heavy race process; those two suites were rerun independently with the correct override and passed. Treat the override and separate WebGL execution as required for reliable local evidence.
- `node --check games/elden-ring-ii/tests/hud-layout.mjs` and `git diff --check` — PASS.
- `./scripts/check-handoff.sh` — run again immediately before commit.

## Known issues and cautions

- Browser suites are GPU/CPU heavy. Run one WebGL suite at a time; use `PW_CHROMIUM` for root Hub/MOBA
  tests and `PLAYWRIGHT_CHROMIUM` for `games/Racing Car/tests`.
- Ashen Rail and Elden Ring II `dist/` outputs are generated/ignored; do not stage or delete local generated
  assets. CI rebuilds them from source.
- No source gameplay changes were made in this checkpoint. If changing Tower/Snake/Xiangqi source, rebuild
  their tracked `dist/` before committing; MOBA imports and Hub entry must keep one cache token.
- Next agent must first run `./scripts/agent-context.sh --sync`, then read this file and
  `docs/ai/PROJECT_CONTEXT.md`; preserve any dirty/diverged state and do not force-push shared `main`.

## Exact next action

1. Run `./scripts/check-handoff.sh` and `git diff --check`.
2. Stage only the four tracked files listed above; leave generated `dist/` assets untouched.
3. Commit and push `main`; verify `git rev-parse HEAD` equals `git rev-parse origin/main`.
4. Next agent may choose a new product scope; do not redo MOBA recovery, Royale loading, Tower contrast,
   or the Elden browser gates unless a new red reproduction contradicts this checkpoint.

## Do not redo

- Do not remove the MOBA persistent recovery card or revert it to a transient flash.
- Do not bump only one MOBA entry; all local imports and Hub launcher/style must keep `assets-31`.
- Do not weaken Elden gates by skipping the real entry flow, accepting missing controls before a probe, or
  comparing gravity across different burst-pool samples.
- Do not stage generated `dist/` assets or force-push shared `main`.
