# Current cross-agent handoff

Updated: 2026-08-02 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Work branch: `main`
Status: Hub compact-launcher follow-up complete; 深淵之橋 champion-FX checkpoint ready for the next agent

## Current objective

Penny asked to stop after two durable checkpoints and hand the project to the next agent:

1. Replace the Hub's one-game-per-page launcher with four-game pages and move 中國象棋 forward.
2. Preserve and publish the in-progress 深淵之橋 production pass, especially its attack effects.

The overall MOBA production objective is **not finished**. This handoff is a tested checkpoint,
not a claim that crowded-fight readability, performance, controls, logic, and physics are final.

## Completed

### Hub launcher

- Commit `752bcc3` replaces the single oversized card with paged groups of four.
- Desktop/short landscape: four cards in one row. Phone portrait: the same group as a 2×2 grid.
  Swipe, arrow buttons, keyboard arrows, dots, page status, and focus isolation are wired.
- Phone portrait cards are compact app-style tiles with icon wells and small corner launch actions;
  the launcher is vertically balanced instead of leaving the whole interface stuck to the top.
- Arrows, dots, and page status now share one centred footer dock instead of floating at opposite
  screen edges. A final page with only one game keeps normal tile dimensions and centres it in the
  same page area; it must never stretch into a double-height card or remain left-aligned.
- First group is 五子棋 → 中國象棋 → 鋤大D → 鬥地主. The last partial page does not duplicate games.
- Gomoku now uses two equal CSS stones with a fixed 6–8 px gap instead of unequal joined emoji.
- 844×390 has a compact treatment so all cards, Play actions, arrows, and status fit one screen.
- Xiangqi's build rewrites its shared helper from `../shared/` to `../../shared/`, adds an inline
  favicon, and regenerates tracked `dist/index.html`; Hub → Xiangqi now loads with zero errors.
- ADR-102 records the durable launcher and nested-build decisions.

### 深淵之橋 attack-FX checkpoint

- `looks.js` defines six champion-specific basic profiles and 24 ability profiles. Every profile
  has its own stable style ID and a procedural visual grammar rather than a shared generic ring.
- `fx.js` renders rings, rays, crosses, domes, pillars, spikes/flames, collapse bursts, weighted or
  twin slashes, ranged muzzle flashes, profiled dash trails, telegraphs, zones, and impacts.
- `sim.js` carries source/champion/ability identity through cast, projectile, impact, strike, zone,
  trap, and trap-trigger events. Player and bot abilities therefore reach the same renderer path.
- `view.js` resolves those profiles, gives arrow/fire/holy projectiles different actual geometry,
  orients them to flight, traverses child meshes during disposal, and clears the FX layer on exit.
- `browser.mjs` now proves six distinct basic signatures, all 24 ability IDs and 24 distinct
  geometry signatures, three projectile model classes, and zero leftover scene objects after FX.
- ADR-103 records the simulation-to-render visual identity and cleanup invariants.

## Verification

- `node tests/hub.mjs` → **75/75 pass** at 320×568, 440×956, 844×390, and 1280×800. The regression
  suite now measures compact portrait-card height, footer grouping, tall-phone vertical balance,
  and the last card's size plus horizontal/vertical centring.
- Real browser visual QA: 393×852 first/last pages and 844×390 first/last pages confirm the compact
  four-card layout and the centred normal-size Elden Ring II tile. Both orientations reported zero
  console errors. Real Hub card click also reached `中國象棋 AI`, one canvas, 0 errors.
- `cd games/xiangqi-ai && npm run build` → pass; tracked dist regenerated.
- Xiangqi `selftest_legal.js`, `selftest_search.js`, `selftest_perf.js` → all pass.
- MOBA JavaScript syntax checks and `git diff --check` → pass.
- `node games/moba/tests/sim.mjs` → **206/206 pass**. Twelve mirrored matches: blue/red 5/7;
  9 nexus finishes, 3 time-limit finishes; no NaN or bridge escape.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node
  games/moba/tests/browser.mjs` → **96/96 pass** across landscape and portrait, both full matches,
  shop/touch/joystick regressions, all new FX gates, and zero console errors.

## Changed files

- Hub launcher plus follow-up: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi
  source/build files, ADR-102, and this handoff.
- MOBA checkpoint: `games/moba/src/{fx,looks,sim,view}.js`, `games/moba/tests/browser.mjs`,
  `docs/ai/{PROJECT_CONTEXT,DECISIONS,HANDOFF}.md`.

## Known issues and cautions

- Automated geometry signatures prove identity and cleanup, not subjective clarity in a crowded
  six-champion fight. A short manual Emberwake cast inspection was readable, but a systematic
  mid-life gallery/crowded-fight review was interrupted by the Hub side quest and remains open.
- The browser gallery previously called `fx.dispose()` while the live match was running; it was QA
  only and did not modify source. Do not infer a runtime FX lifecycle bug from that experiment.
- Xiangqi `npm ci` reported four dependency audit findings (1 low, 3 high). They were pre-existing,
  outside this UI checkpoint, and were not auto-fixed because that could upgrade the toolchain.
- Two local named stashes may remain as redundant pre-commit backups. Their content is now in this
  checkpoint; do not re-apply them on top of `main`. Cloud agents cannot see local stashes anyway.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, verify `main` equals `origin/main`, then read this file.
2. Open 深淵之橋 at 844×390 and 430×860 and capture real mid-life attack/ability frames during a
   crowded fight. Tune only profiles whose silhouette or timing is genuinely unclear.
3. Measure peak `renderer.info.memory.geometries`, active FX item count, frame pacing, and physical
   phone feel before calling the production objective complete. Keep `206/206` and `96/96` green.

## Do not redo

- Do not restore the obsolete local MOBA stashes; the checkpoint is now in Git history.
- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
