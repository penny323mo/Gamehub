# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — Tower accessibility checkpoint
Integration branch: `main`
Work branch: `main`
Status: Tower 開場主按鈕對比已修正；測試尺亦已排除被 modal 蓋住嘅 DOM 假紅；本 checkpoint 準備交接。

## Current objective

持續提升 Game Hub 全部遊戲嘅可玩性、手機體驗、可讀性同部署可靠性。每輪先用真 browser gate
搵一個未驗證嘅產品風險，修正後重建 tracked `dist/`，再交接。

## Completed

**Tower Defense 開場 HUD 對比**

- `games/tower/src/ui/style.css` 將 `.big-btn` 由淺色 `--action` 終點改成深青色雙 stop
  (`#0b6da5 → #0877a4`)；白色 `▶ START` 喺手機截圖量到由 2.69:1 提升至 WCAG AA。
- `tests/hub-read.mjs` 量字之前先用 `document.elementFromPoint()` 確認文字中心點係最上層可見
  元素，唔再把開場 modal 後面嘅 `.build-name` 當成玩家見到嘅低對比字。
- Tower 用完整 `npm run build` 重建 tracked `dist/`，包括 script tag postbuild 同 78 個 GLB
  Draco 壓縮；保留本機原有未追蹤嘅 Ashen Rail／Elden Ring II build assets。

## Changed files

- `games/tower/src/ui/style.css` — primary start/continue button contrast。
- `games/tower/dist/index.html`、`games/tower/dist/assets/index-C_D6s9KX.js` — rebuilt tracked output。
- `games/tower/dist/assets/index-Cs4msgIe.js` — obsolete Vite chunk removed by rebuild。
- `tests/hub-read.mjs` — visible/occluded text sampling gate。

## Verification

- `cd games/tower && npm ci` — 51 packages installed, `npm audit`: 0 vulnerabilities。
- `cd games/tower && npm run build` — PASS；TypeScript、Vite、postbuild，78 個 GLB `1183 KB → 379 KB`。
- `cd games/tower && npm run test:core` — **52/52**（map、smooth route、chapters、RNG、tiles、balance）。
- `cd games/tower && PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:browser`
  — **95/95**（smoke/assets/combat/units/gateway/look/map/touch/load/flow）。
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub-read.mjs`
  — **3/3**；12 個 launcher，Tower 對比不足 **0**。
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub.mjs`
  — **96/96**；四個 viewport、13 個入口、4 格 layout、零 external request/browser error。
- `git diff --check` — PASS。
- `./scripts/check-handoff.sh` — 待 commit 後再跑一次，作為最後 handoff gate。

## Known issues and cautions

- 7 個本機原有未追蹤 generated assets 必須保留，唔好 stage、刪除或當成今輪變更：
  `games/ashen-rail/dist/assets/*`（5 個）及 `games/elden-ring-ii/dist/assets/*`（2 個）。
- `games/tower/node_modules` 之前缺少 postbuild 依賴；本輪用 `games/tower/npm ci` 補齊，唔好將
  `node_modules` 帶入 commit。
- 測試機同時跑多個 WebGL browser suite 會出資源型假紅；紅燈要單獨重跑先算數。
- 下一位仍須先跑 `./scripts/agent-context.sh --sync`，再讀本文件；如 upstream 有新 commit，先
  fast-forward／報告 dirty 或 divergence，唔好覆蓋其他 agent 工作。

## Exact next action

1. 驗證本 commit push 後 `git rev-parse HEAD` 同 `git rev-parse origin/main` 完全一致。
2. 下一位如繼續產品優化，另開獨立 scope，先加 red gate 再改碼；不要重做 MOBA pause 或本輪
   Tower 對比修正。

## Do not redo

- 唔好將對比 gate 改返只讀 computed style／忽略 overlay；要保留像素量度加 topmost visibility。
- 唔好把 Tower source 改完而唔重建 tracked `games/tower/dist/`。
- 唔好 stage 上述 7 個未追蹤資產，亦唔好 force-push 共用 `main`。
