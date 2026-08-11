# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — integrated Game Hub product-audit checkpoint
Integration branch: `main`
Work branch: `main`
Status: the latest integrated player-flow audit is green; Xiangqi's optional environment light, undo/resume flow, and interrupted-pointer lifecycle, Gomoku's delayed-AI lifecycle, Big Two's CPU queue, Dou Dizhu's bid/play loops, Penny Crush's async match plus interrupted-touch lifecycle, Snooker's root/2D/3D entry, truthful opening state, Offline P2 foul decisions, mobile touch/charge input, AI handoff, Ashen Rail's fire-pointer lifecycle, Royale's interrupted card drag/placement lifecycle, MOBA's interrupted skill/attack/joystick lifecycle, and Snake's mobile login/board/lint/focus lifecycle are hardened. This checkpoint contains the source fixes, gates, and verification.

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

**Tower Defense, Xiangqi, Gomoku, Big Two, Dou Dizhu, Penny Crush, Snooker, and Snake verification**

- Tower core, map/route redesign, assets, combat **13/13**, units **14/14**, gateway/keep placement **11/11**, look
  **9/9**, map browser **8/8**, touch **6/6**, load **5/5**, flow **18/18**, projectile renderer **5/5**, and
  standalone renderer/performance **20/20** all passed. Diagnostic arena now suppresses automatic wave spawns, so
  combat measurements cannot be stolen by later `targetingMode=first` enemies.
- Xiangqi production build plus legal-move, search, and performance self-tests passed. Its active-pointer guard now cancels pointercancel, blur, and hidden-page interruptions without mistaking OrbitControls' normal lostpointercapture-before-click ordering for a cancellation. The optional Studio Small 09
  CC0 HDRI is now bundled under `games/xiangqi-ai/assets/`, imported with Vite `?url`, copied into tracked
  `dist/assets/`, and guarded by a short load-failure status notice; local lights keep the board playable. Real mobile
  touchscreen tap → AI → undo → refresh/Continue plus interrupted-pointer/late-click flow is **5/5**. Gomoku's real mobile stale-timer/restart flow is **5/5**;
  Big Two's real mobile stale-queue/restart flow is **4/4**; Dou Dizhu's real mobile stale-bid/restart flow is **4/4**;
  Penny Crush's real mobile stale-chain/restart/interrupted-touch flow is **7/7**; Snooker's root/2D/3D opening-state, mobile touch/charge,
  AI handoff, and Offline P2 foul-decision flow is **18/18**; Snake's mobile Enter/start/Shift-focus/pause/resume/Hub flow is **10/10**.

## Changed files

- `games/xiangqi-ai/js/render.js`, `js/app.js`, `js/main.js` — bundled HDR/fallback, deferred online probe, undo/storage fixes, and active-pointer cancellation/lifecycle cleanup.
- `games/gomoku/js/ai.js`, `js/input.js`, `js/app.js`, `index.html` — cancellable/token-guarded AI timer and aligned cache token.
- `games/big2/app.js`, `index.html` — cancellable/token-guarded CPU queue and aligned cache token; `games/doudizhu/src/game.js`, `src/ui.js`, `main.js`, `index.html` — shared generation scheduler for bid/play loops and aligned cache tokens; `games/penny_crush/penny_crush.js`, `index.html` — generation-guarded async match pipeline, interrupted-touch cleanup, and cache token.
- `games/xiangqi-ai/assets/studio_small_09_1k.hdr` and `assets/README.md` — CC0 environment asset plus provenance/hash.
- `games/xiangqi-ai/dist/` — regenerated tracked entry bundle and HDR asset for GitHub Pages.
- `launcher.js`, `tests/hub.mjs`, `tests/hub-cdn.mjs`, `tests/xiangqi-flow.mjs`, `tests/gomoku-flow.mjs`, `tests/big2-flow.mjs`, `tests/doudizhu-flow.mjs`, `tests/penny-crush-flow.mjs`, `tests/snooker-flow.mjs`, `tests/snake-flow.mjs` — assert self-contained assets, player flows, and cancelled carousel gestures.
- `games/snake-game/src/components/NameInput/NameInput.tsx`, `src/components/Game/Game.tsx`, `src/components/Background/Background.tsx`, `src/components/Particles/Particles.tsx`, `src/hooks/useStorage.ts`, `styles/Game.module.css`, and tracked `dist/` — isolate Enter login, bind the board/header to mobile viewport width, clean lint, and keep timed/held boosts finite.
- `games/tower/src/main.ts`, `games/tower/tests/combat.mjs`, tracked `games/tower/dist/` — close preload/arena test races; `games/royale/src/ui.js`, `games/royale/tests/match.mjs` — cancel interrupted card drag/placement on pointercancel, lost capture, blur, and hidden-page transitions; `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md`, `docs/ai/HANDOFF.md` — durable relay notes.
- `games/snooker/2d/app.js`, `games/snooker/3d/main.js`, `tests/snooker-flow.mjs` — keep opening cue-in-hand HUD state truthful, cancel interrupted 2D charge/drag input on pointercancel, blur, or hidden-page transitions, and let local Offline P2 own foul decisions instead of hiding the panel and deadlocking the match; cover mobile touch/charge input and the P1-vs-AI handoff in a real mobile browser.
- `games/ashen-rail/src/ui/TouchControls.ts`, tracked `games/ashen-rail/dist/` — capture the fire pointer and clear held fire on release, cancellation, blur, or hidden-page interruption; `games/moba/src/input.js`, `tests/browser.mjs` — clear held skill/attack/joystick/pinch state and visuals on blur or hidden-page interruption, with real landscape/portrait gates.
## Verification
- `PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test` from
  `games/royale/tests/` — all nine suites passed: leak **7/7**, perf **3/3**, gauntlet **17/17**, combat **8/8**,
  PvP guest **12/12**, match **11/11** (including interrupted drag/placement and hidden-page cleanup), features **27/27**, RTS **29/29**, session **5/5**.
- Hub targeted suites with
  `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` — home **3/3**, pause **6/6**,
  storage **2/2**, progress **4/4**, audio **3/3**, tabs **4/4**, away **3/3**, context **3/3**, leak **4/4**,
  CDN **4/4**, load **3/3**, readability **3/3**, touch **5/5**, keyboard **3/3**, wait **1/1**.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/gomoku-flow.mjs` — **5/5**;
  stale AI timer cannot contaminate a fresh game, normal AI response still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/big2-flow.mjs` — **4/4**;
  stale CPU queue cannot consume a fresh deal, normal CPU response still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/doudizhu-flow.mjs` — **4/4**; stale bid/play timer cannot mutate a fresh deal, normal CPU bid still works, and local cache tokens agree.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/penny-crush-flow.mjs` — Penny Crush **7/7** (stale async chain, restart, and pointercancel cleanup); `node tests/snooker-flow.mjs` — **18/18** (truthful opening state, mobile touch/charge shot, 2D pointercancel/blur cleanup, AI handoff, and Offline P2 foul panel/take/force branches); `node games/moba/tests/browser.mjs` — **206/206**, `node games/moba/tests/sim.mjs` — **262/262**, and `node games/moba/tests/cache-bust.mjs` — PASS (blur/hidden-page interruption gates included).
- `cd games/snake-game && npm run lint && npm run build` — lint **0 errors/0 warnings** and tracked production dist rebuilt.
- `PW_CHROMIUM="$CHROMIUM_BIN" node tests/snake-flow.mjs` (Chromium executable supplied by the environment) — **10/10** (mobile Enter isolation, responsive board, Shift focus cleanup, tick/pause/resume/Hub, zero browser errors).
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub.mjs` — **100/100**; touchcancel followed by a late touchend cannot change the active page;
  13 launcher entries, four pages, mobile 2×2 / desktop four-up layout, no dead links or browser errors.
- `cd games/tower && npm run build && npm run test:core && PW_CHROMIUM="$CHROMIUM_BIN" npm run test:browser` — build,
  core, browser (**97/97**) passed; `node tests/projectile-renderer.mjs` **5/5** and `node tests/performance.mjs`
  **20/20** passed standalone. `node tests/playthrough.mjs 99 999 0.04 0.0026 198` won wave 99 with 20/20 lives;
  `npm audit --prefix games/tower --audit-level=high` found **0 vulnerabilities**. First combined render launch hit a 30-second ground wait; standalone reruns passed, so keep WebGL suites one at a time under GPU pressure.
- `cd games/xiangqi-ai && npm run build && node js/engine/selftest_legal.js && node js/engine/selftest_search.js &&
  node js/engine/selftest_perf.js`; `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/xiangqi-flow.mjs`
  — build/legal/search/performance plus browser flow **5/5** passed, including real touchscreen tap, AI, undo/Continue,
  pointer cancellation, and a late-click no-move gate.
- Real mobile Chromium smokes of the rebuilt Xiangqi dist kept the landing and AI canvas usable while blocking
  non-local requests; no Poly Haven request appeared. The expected lazy Supabase request is the only third-party
  surface, and a second smoke aborting the bundled HDR showed `環境光暫時未能載入，已使用基本燈光` while the game stayed
  playable.
- Ashen Rail asset audit/lint/Vitest **14/14**/build plus production 844×390 browser pointer-release smoke passed: ammo
  stayed stable after release outside the fire button and after a blur interruption, with zero browser errors. Earlier
  checkpoint evidence remains valid: Elden Ring II HUD **92/92** plus `npm test` **17/17**; Racing Car independent real-browser suites
  race **124/124**, setup **125/125**, rivals **61/61**, ghost **29/29**, season **55/55**, audio **32/32**.

## Known issues and cautions
- Browser suites are GPU/CPU heavy. Run one WebGL suite at a time; use `PW_CHROMIUM` for root Hub/MOBA tests and
  `PLAYWRIGHT_CHROMIUM` for `games/Racing Car/tests`.
- Tower SwiftShader frame milliseconds are an environment-relative signal, not a physical-phone FPS claim. Keep
  the draw-call and resource gates, and collect real-device evidence before tuning graphics from those absolute ms.
- Xiangqi's optional board environment light is now a bundled CC0 HDR. If the local file cannot be decoded, the
  renderer keeps its key/rim/ambient lights and shows a short fallback status; do not reintroduce a runtime Poly Haven
  URL or make this visual enhancement block entry. Supabase remains lazy and optional for online play.
- Ashen Rail's `dist/` is tracked deployment output and must be rebuilt for source changes; Elden Ring II's `dist/` remains
  generated/ignored and CI rebuilds it from source. Do not stage unrelated generated assets.
- If changing Tower/Snake/Xiangqi source, rebuild their tracked `dist/` before committing. MOBA imports and the Hub
  entry must keep one cache token.
- Snake `npm run lint` is clean; three intentional external/visual hydration effects use narrow `react-hooks/set-state-in-effect` suppressions. Vite's classic `safe-storage.js` warning remains non-fatal; the build exits 0 and the tracked dist target is valid.
- No force-push to shared `main`; preserve any dirty/diverged state another agent leaves behind.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, then read this file and `docs/ai/PROJECT_CONTEXT.md` before editing.
2. If taking the next product scope, start with a new real browser player risk; Xiangqi HDR self-containment, the
   CDN-abort gate, and Snake focus cleanup are closed by this checkpoint unless a new reproduction contradicts them.
3. Before handoff, run `./scripts/check-handoff.sh` and `git diff --check`, commit this file with any scoped source
   changes, push `main`, and verify `git rev-parse HEAD` equals `git rev-parse origin/main`.

## Do not redo

- Do not remove the MOBA persistent recovery card or revert it to a transient flash.
- Do not bump only one MOBA entry; all local imports and Hub launcher/style must keep `assets-31`.
- Do not weaken Elden browser gates by skipping the real entry flow, accepting missing controls before a probe, or
  comparing gravity across different burst-pool samples.
- Do not stage generated `dist/` assets blindly or force-push shared `main`.
