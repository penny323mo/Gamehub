# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — MOBA context recovery + loading checkpoint
Integration branch: `main`
Work branch: `main`
Status: MOBA WebGL context loss now has a persistent recovery card; Empire Royale loading starts with an indeterminate progress animation; checkpoint is ready for relay after commit/push.

## Current objective

持續提升 Game Hub 全部遊戲嘅可玩性、手機體驗、可讀性同部署可靠性。每輪先用真 browser gate
搵一個未驗證嘅產品風險，修正後只提交相關 scope；交接前要確認本地同 `origin/main` 對齊。

## Completed

**MOBA context recovery**

- `Hud` 增加持續嘅 `.moba-context-recovery` card；context 掉落時唔再只靠 1.6 秒 flash，玩家會見到暫停原因及「重新整理」出口。
- context 恢復後由 `main.js` 收起 card，再按原有 `pauseReasons` 規則安全續波；設定／切走期間唔會偷續。
- MOBA 全部本地 imports、入口、Hub launcher、Hub CSS 共用 `assets-31`，避免 Safari/GitHub Pages 混載舊 module。
- `tests/hub-context.mjs` 文字節點讀取加 null guard，避免 Royale detached/null text 變成假 browser error。

**Empire Royale loading**

- `games/royale/index.html` 初始 `#load-fill` 直接套 `.unknown`，第一個 progress event 未到之前仍有掃動提示；真實 byte progress 到達後由既有 loader 移除 class。
- 無假百分比，仍然由實際 MB/byte progress 交代載入量。

Previous Tower checkpoint (`3100c09`) remains included: start button contrast was fixed and `hub-read` now samples only topmost visible text. Do not redo it.

## Changed files

- `games/moba/src/hud.js`, `src/main.js`, `style.css` — persistent context recovery UI and lifecycle wiring。
- `games/moba/src/*.js`, `games/moba/index.html` — cache-bust token `assets-30` → `assets-31` for every local import/entry。
- `games/moba/tests/browser.mjs` — regression checks for visible recovery card and post-restore hiding。
- `games/royale/index.html` — initial indeterminate loading bar。
- `index.html`, `launcher.js` — Hub entry/style/MOBA link token `assets-31`。
- `tests/hub-context.mjs` — null-safe visible text extraction。

## Verification

- `node games/moba/tests/cache-bust.mjs` — PASS；all entry/import tokens `assets-31`。
- `node games/moba/tests/sim.mjs` — **262/262**。
- `PW_CHROMIUM='<Chrome for Testing path>' node games/moba/tests/browser.mjs` — **198/198**，含橫/直/SE viewport、商店、controls、asset failure、context loss/recovery、render/perf。
- `PW_CHROMIUM='<Chrome for Testing path>' node tests/hub-context.mjs` — **3/3**；六隻 3D game 全部入局、context 可量、無 browser error。
- `PW_CHROMIUM='<Chrome for Testing path>' node tests/hub-wait.mjs` — **1/1**；Fast 3G 三個 heavy entry 最長靜默 ≤ 2.9s。
- Changed JS files `node --check` — PASS；`git diff --check` — PASS。
- `./scripts/check-handoff.sh` — commit 前最後再跑一次。

## Known issues and cautions

- 7 個本機原有未追蹤 generated assets 必須保留，唔好 stage、刪除或當成今輪變更：
  `games/ashen-rail/dist/assets/*`（5 個）及 `games/elden-ring-ii/dist/assets/*`（2 個）。
- Browser tests 要單獨跑；同時跑多個 WebGL suite 會有 GPU 資源型假紅。`PW_CHROMIUM` 應指向本機已安裝嘅 Chrome for Testing。
- MOBA context card 只喺 context lost 顯示；正常 pause、shop、settings 不應改用此 card。
- 下一位仍須先跑 `./scripts/agent-context.sh --sync`，再讀本文件；如 upstream 有新 commit，先 fast-forward／報告 dirty 或 divergence，唔好覆蓋其他 agent 工作。

## Exact next action

1. 跑 `./scripts/check-handoff.sh`、`git diff --check`，只 stage 本 checkpoint 追蹤檔案。
2. Commit and push `main`；確認 `git rev-parse HEAD` 同 `git rev-parse origin/main` 完全一致。
3. 下一位如繼續產品優化，另開獨立 scope，先加 red gate；不要重做 MOBA context recovery、Royale indeterminate loading 或 Tower contrast。

## Do not redo

- 唔好刪走持續 recovery card，亦唔好將佢退回只留 transient flash。
- 唔好只 bump MOBA entry；所有 local imports 同 Hub launcher/style 要維持同一個 `assets-31` token。
- 唔好將對比 gate 改返只讀 computed style／忽略 overlay；要保留像素量度加 topmost visibility。
- 唔好 stage 上述 7 個未追蹤資產，亦唔好 force-push 共用 `main`。
