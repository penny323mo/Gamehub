# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex (local) — MOBA pause checkpoint
Integration branch: `main`
Work branch: `main`
Status: MOBA 手機暫停入口已完成；`hub-pause` **6/6**，MOBA browser **196/196**。

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**MOBA 暫停 checkpoint**

- 窄手機冇再加第三粒會撞位嘅按鈕；HUD 原有齒輪改成清楚嘅「開設定並暫停」，保留 44×44
  觸控區，並同步寫入 `aria-label`、`title`、`aria-expanded`。
- `games/moba/src/main.js` 用 `pauseReasons` set 統一 `manual`、`visibility`、`context` 三種
  停頓。關設定／返 tab／WebGL restore 只會解除自己嗰個 reason，唔會誤將其他暫停續返；每次
  真續波都重設 frame clock，避免追返停頓期間嘅 dt。
- `games/moba/tests/browser.mjs` 手動戰鬥 fixture 先用真實齒輪停低 rAF，再同步清 dead rig，
  解決原本同背景 loop 爭同一個 rig 嘅間歇性 `swinging` 假紅。
- `tests/hub-pause.mjs` 移除 MOBA known-exception，新增 `HUB_PAUSE_GAME` 過濾器方便單隻快速
  重現；四隻遊戲手機 pause/stop/resume 全部過關。

**ADR-238（已合埋 main）— 一個冇人知嘅 Continue，同冇 Continue 分別唔大**

- 續得返唔等於玩家知。量：Gomoku ✓／Xiangqi ✓／**Big Two ✗**／Dou Dizhu ✓——**同一批
  改動、同一個 pattern、四隻遊戲，一隻漏咗**。呢種漏冇 gate 永遠唔會發現。
- **個 selector 又錯一次**：探路寫 `'A, B'` 兩個一齊試，B 中咗所以報綠——**「邊個中就用
  邊個」會令你以為自己量緊第一個。**

**ADR-236／237（已合埋 main）— Big Two ＋ Dou Dizhu：牌類點存**

- 存**四家／三家手牌**（唔存續返之後電腦會攞新牌）；**`eval` 唔存**。鬥地主 `phase` 要存,
  **叫牌階段冇「輪返你」嗰個停點**。**條 check 本身要改**：本來逐隻讀自己嘅欄名，加到
  第三隻就撞線（`undefined > 0` 係 false，**明明啱嘅都報紅**）→ 統一成四個欄名。
- **呢條線做完**：由一隻擴到**五隻**；其餘存嘅係累積成績，冇「一局打到一半」。

**ADR-232 至 235（已合埋 main）— 兩個 tab；Gomoku ＋ Xiangqi 補返 Continue**

- 兩個 tab 各打完一局：Snake `gamesPlayed` 0 → 1 → **1** → `merge-save.mjs` 嘅 `改存檔()`：
  寫嗰陣先讀返。**兩次都修錯位**（Royale 真兇係 `markTutorialSeen()`、Snake 係 `login()`）
  ——**每個由記憶體快照出發嘅寫入都會蓋。估唔到就 dump。** storage key 運行時掃**七隻一個
  都冇寫** → 補靜態掃。**兩層一齊做先得出結論。**
- Continue：Gomoku 數 canvas 非背景像素，突變照樣過（嗰 300 個係**格線**）；Xiangqi 個盤
  係 3D，`getImageData` 全零，改影相之後**又揀錯對照**。**錯要向紅嗰邊錯。**
  3D 盤要**反用遊戲自己嘅 `Render.hitTest()`**；**driver 唔應該跟引擎實作漂移**。

**ADR-226 至 230（已合埋 main）— 洩漏／睇唔睇得清**

- 洩漏：GPU 三個數連開五局完全平（**我量咗一樣已經有人守嘅嘢**）；冇守嘅係 **DOM**。
  **「未冚到」同「冚唔到」係兩件事**。對比度：**把尺量咗四個版先啱**（gradient 令九個
  介面全跳過＝**量咗零樣嘢嘅綠**）。**每版都要親眼影低先信。**

**ADR-202 至 225（全部已合埋 main；詳情喺 DECISIONS，呢度只留會再撞到嘅教訓）**

- Tower 四輪（44×44／START 靜默→進度條／佈景斷咗／格 → **24×14**、HP → **0.0026**）。
  **`flow.mjs` 有三處寫死同一格。**
- 跨遊戲尺：`hub-touch`（24 個細掣）、`hub-load`（launcher **904 → 51 KB**）、`hub-cdn`
  （jsdelivr 吊 8 秒＝**DCL 一比一遲 8 秒**）、`hub-wait`（**件件平行落就要量位元組**）等。
  重量：Tower GLB → Draco **1,291 → 754 KB**、MOBA 拆資產 **16.0 → 12.7s**。
- 會再撞到嘅：classic script 頂層 `let`／`const` **唔會上 `window`**（`var`／函數先會）；
  test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生咗**；
  **一個對照救返一個假綠**；**「未冚到」同「冚唔到」係兩件事**；教學遮罩開住嗰陣
  Royale 模擬係凍結嘅；`ghostRecorder.commit()` **等於自己驗自己**。

## Changed files

- `games/moba/src/main.js` — reason-based pause/resume wiring。
- `games/moba/src/hud.js` — gear pause entry and accessible state。
- `games/moba/tests/browser.mjs` — deterministic paused combat fixture。
- `tests/hub-pause.mjs` — MOBA exception removed; optional single-game filter。
- `games/moba/index.html`、MOBA imports and hub entry/style references — `assets-30` cache-bust。
- 之前 Claude checkpoint 嘅跨遊戲／Tower／Snake 改動已喺 `origin/main`；本輪冇改嗰啲範圍。

## Verification

- `node games/moba/tests/cache-bust.mjs` — PASS（所有入口／本地 imports `assets-30`）。
- `node games/moba/tests/sim.mjs` — **262/262**。
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node games/moba/tests/browser.mjs`
  — **196/196**（橫向、直向、SE、中闊、載入失敗、音效、context、完整對局）。
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hub-pause.mjs`
  — **6/6**（Tower、Racing、MOBA、Snake；MOBA 實測停住 `10400→10400` 再續 `11567→13533`）。
- `git diff --check` — PASS。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。
- **呢個 container 一鬥資源就出假紅**：背景跑住 `moba` 嗰陣，`tower` 條 chain 報過
  「模型未預載就攞」同 `#start-btn` 撳唔到——單獨再跑全綠。**一次紅要單獨再跑先算數。**
- **開工前一定要 `--sync`**：試過冇 sync 就做，同 Codex 撞晒單，成輪報廢。

## Exact next action

1. 下一位先跑 `./scripts/agent-context.sh --sync`，再讀本文件同目前 commit；唔好用未同步嘅
   本機 snapshot 判斷狀態。
2. 本 checkpoint 已冇已知阻塞；如繼續產品優化，另開一個獨立 scope，先加 red gate 再改碼。
3. `games/ashen-rail/dist/*`、`games/elden-ring-ii/dist/*` 係本機原有未追蹤 build assets，
   本輪刻意保留，唔好當成 MOBA 變更一齊清理。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  **Supabase SDK 唔好擺返落 HTML 做 parser-blocking**；**test server 要 gzip ＋ 送
  `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**；**洩漏 gate 唔好淨係
  數全部節點**；**driver 唔好跟引擎內部次序**；**MOBA 唔好再試喺窄畫面另開一粒暫停掣**。
