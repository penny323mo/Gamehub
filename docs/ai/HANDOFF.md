# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — integrated Game Hub product-audit checkpoint
Integration branch: `main`
Work branch: `main`
Status: the latest integrated player-flow audit is green; Xiangqi's optional environment light, undo/resume flow,
Gomoku's delayed-AI lifecycle, Big Two's CPU queue, Dou Dizhu's bid/play loops, Penny Crush's async match lifecycle, and Snooker's root/2D/3D entry flow are hardened. This checkpoint contains the source fixes, gates, and verification.

## Current objective

持續提升 Game Hub 全部遊戲嘅可玩性、手機體驗、可讀性同部署可靠性。每輪先用真 browser gate
搵一個未驗證嘅產品風險，修正後只提交相關 scope；交接前要確認本地同 `origin/main` 對齊。

## Completed

**Empire Royale full regression**

- Ran all nine committed suites one at a time with a real Chromium/WebGL browser.
- Leak, performance, gauntlet, combat, PvP guest, match lifecycle, feature invariants, RTS, and mixed-session
  paths all passed. No new player-facing regression was found.

**Hub-wide player-flow audit**

- Return-to-Hub, pause/resume, storage-blocked fallback, progress/reload/Continue, audio, multi-tab accumulation,
  backgrounding, context loss, leak loops, third-party/CDN failure, load weight, readability, touch, keyboard,
  and loading-feedback gates all passed.
- The Xiangqi 3D entry was also checked under a throttled mobile network: its landing menu became usable while
  the optional environment map was still pending, so slow HDR download does not block the game entry.

**Tower Defense, Xiangqi, Gomoku, Big Two, Dou Dizhu, Penny Crush, and Snooker verification**

- Tower core, map/route redesign, assets, combat, units, gateway/keep placement, look, map browser, touch, load,
  flow, projectile renderer, and standalone renderer/performance checks passed.
- Xiangqi production build plus legal-move, search, and performance self-tests passed. The optional Studio Small 09
  CC0 HDRI is now bundled under `games/xiangqi-ai/assets/`, imported with Vite `?url`, copied into tracked
  `dist/assets/`, and guarded by a short load-failure status notice; local lights keep the board playable. Real mobile
  tap → AI → undo → refresh/Continue flow is **4/4**. Gomoku's real mobile stale-timer/restart flow is **5/5**;
  Big Two's real mobile stale-queue/restart flow is **4/4**; Dou Dizhu's real mobile stale-bid/restart flow is **4/4**;
  Penny Crush's real mobile stale-chain/restart flow is **6/6**.

**Earlier relay checkpoints remain integrated** — MOBA persistent context-recovery card and `assets-31` cache-bust,
Royale loading feedback, Tower start-screen contrast, Elden browser-gate isolation, and Ashen Rail production smoke.

## Changed files

- `games/xiangqi-ai/js/render.js`, `js/app.js`, `js/main.js` — bundled HDR/fallback, deferred online probe, and undo/storage fixes.
- `games/gomoku/js/ai.js`, `js/input.js`, `js/app.js`, `index.html` — cancellable/token-guarded AI timer and aligned cache token.
- `games/big2/app.js`, `index.html` — cancellable/token-guarded CPU queue and aligned cache token; `games/doudizhu/src/game.js`, `src/ui.js`, `main.js`, `index.html` — shared generation scheduler for bid/play loops and aligned cache tokens; `games/penny_crush/penny_crush.js`, `index.html` — generation-guarded async match pipeline and cache token.
- `games/xiangqi-ai/assets/studio_small_09_1k.hdr` and `assets/README.md` — CC0 environment asset plus provenance/hash.
- `games/xiangqi-ai/dist/` — regenerated tracked entry bundle and HDR asset for GitHub Pages.
- `tests/hub-cdn.mjs`, `tests/xiangqi-flow.mjs`, `tests/gomoku-flow.mjs`, `tests/big2-flow.mjs`, `tests/doudizhu-flow.mjs`, `tests/penny-crush-flow.mjs`, `tests/snooker-flow.mjs` — assert self-contained assets and player flows.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md`, `docs/ai/HANDOFF.md` — durable architecture/ADR/relay notes.

## Verification

- `PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test` from
  `games/royale/tests/` — all nine suites passed: leak **7/7**, perf **3/3**, gauntlet **17/17**, combat **8/8**,
  PvP guest **12/12**, match **8/8**, features **27/27**, RTS **29/29**, session **5/5**.
- Hub targeted suites with
  `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` — home **3/3**, pause **6/6**,
  storage **2/2**, progress **4/4**, audio **3/3**, tabs **4/4**, away **3/3**, context **3/3**, leak **4/4**,
  CDN **4/4**, load **3/3**, readability **3/3**, touch **5/5**, keyboard **3/3**, wait **1/1**.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/gomoku-flow.mjs` — **5/5**;
  stale AI timer cannot contaminate a fresh game, normal AI response still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/big2-flow.mjs` — **4/4**;
  stale CPU queue cannot consume a fresh deal, normal CPU response still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/doudizhu-flow.mjs` — **4/4**; stale bid/play timer cannot mutate a fresh deal, normal CPU bid still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/penny-crush-flow.mjs` — **6/6**; stale async match chain cannot mutate a fresh board, normal match still scores, and the script cache token is aligned; Snooker root/2D/3D mobile flow **9/9**.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub.mjs` — **96/96**;
  13 launcher entries, four pages, mobile 2×2 / desktop four-up layout, no dead links or browser errors.
- `cd games/tower && npm test` — build, all core gates, browser gates, and projectile-renderer gates passed. The
  final integrated performance process once hit a 30-second `window.__TD` startup timeout after the preceding
  WebGL suites; the same checked-in build was immediately rerun alone with
  `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/performance.mjs` and
  passed **20/20** for desktop and mobile (20 towers, 150/229-enemy stress, resize, yaw, and context restore).
  Treat WebGL suites as separate runs under GPU pressure; do not call the transient startup timeout a gameplay
  failure without reproducing it in a clean standalone run.
- `cd games/xiangqi-ai && npm run build && node js/engine/selftest_legal.js && node js/engine/selftest_search.js &&
  node js/engine/selftest_perf.js`; `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/xiangqi-flow.mjs`
  — build/legal/search/performance
  plus browser flow **4/4** passed.
- Real mobile Chromium smokes of the rebuilt Xiangqi dist kept the landing and AI canvas usable while blocking
  non-local requests; no Poly Haven request appeared. The expected lazy Supabase request is the only third-party
  surface, and a second smoke aborting the bundled HDR showed `環境光暫時未能載入，已使用基本燈光` while the game stayed
  playable.
- Earlier checkpoint evidence remains valid: Elden Ring II HUD **92/92** plus `npm test` **17/17**; Ashen Rail
  asset audit/lint/Vitest **14/14**/build plus 844×390 browser smoke; Racing Car independent real-browser suites
  race **124/124**, setup **125/125**, rivals **61/61**, ghost **29/29**, season **55/55**, audio **32/32**.

## Known issues and cautions

- Browser suites are GPU/CPU heavy. Run one WebGL suite at a time; use `PW_CHROMIUM` for root Hub/MOBA tests and
  `PLAYWRIGHT_CHROMIUM` for `games/Racing Car/tests`.
- Tower SwiftShader frame milliseconds are an environment-relative signal, not a physical-phone FPS claim. Keep
  the draw-call and resource gates, and collect real-device evidence before tuning graphics from those absolute ms.
- Xiangqi's optional board environment light is now a bundled CC0 HDR. If the local file cannot be decoded, the
  renderer keeps its key/rim/ambient lights and shows a short fallback status; do not reintroduce a runtime Poly Haven
  URL or make this visual enhancement block entry. Supabase remains lazy and optional for online play.
- Ashen Rail and Elden Ring II `dist/` outputs are generated/ignored; do not stage or delete local generated assets.
  CI rebuilds them from source.
- If changing Tower/Snake/Xiangqi source, rebuild their tracked `dist/` before committing. MOBA imports and the Hub
  entry must keep one cache token.
- No force-push to shared `main`; preserve any dirty/diverged state another agent leaves behind.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, then read this file and `docs/ai/PROJECT_CONTEXT.md` before editing.
2. If taking the next product scope, start with a new real browser player risk; Xiangqi HDR self-containment is
   already closed by this checkpoint and should not be redone unless a new reproduction contradicts it.
3. Before handoff, run `./scripts/check-handoff.sh` and `git diff --check`, commit this file with any scoped source
   changes, push `main`, and verify `git rev-parse HEAD` equals `git rev-parse origin/main`.

## Do not redo

- Do not remove the MOBA persistent recovery card or revert it to a transient flash.
- Do not bump only one MOBA entry; all local imports and Hub launcher/style must keep `assets-31`.
- Do not weaken Elden browser gates by skipping the real entry flow, accepting missing controls before a probe, or
  comparing gravity across different burst-pool samples.
- Do not stage generated `dist/` assets blindly or force-push shared `main`.
