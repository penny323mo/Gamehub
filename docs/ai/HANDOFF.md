# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 210
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: Tower 四輪已合埋 main；ADR-206–210 五把跨遊戲尺（掂、載、鍵盤、第三方、等緊）掃齊十二個介面

## Current objective

由 refine Tower 擴到「continuously improve the gaming experience for everything」。
入手點一直係 **Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，
但冇一條問過「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、
呢個數睇唔睇得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 205（Tower 四輪，已合埋 main；詳情喺 DECISIONS）**

- 202：44×44、建塔欄漸隱、橫額改由 `--hud-bottom` 錨住；順手修好 `gateway.mjs`
  嘅閃光 gate（舊版四張相影唔到 0.55 秒嘅瞬態，而個底自己喺度呼吸）。
- 203：撳完 START 之後 1,860 KB 嘅靜默 → 停用 ＋ 進度條；再撳一次會開多次波
  （實測 `開波次數 = 2`）→ 兩重擋。新 `tests/load.mjs`，用 CDP 真節流。
- 204：地圖唔係細，係**佈景喺你最想望遠嗰陣斷咗**。佈景範圍改由鏡頭推出嚟,
  1,115 → 3,775 件；遠山 18 個 Mesh → 1 個 InstancedMesh。可玩地一格冇郁。
- 205：格 20×12 → **24×14**、陸地 148 → 178、路 31 格 → **37 格 10 彎**、塔位 60 → 72。
  擴完重掃難度，HP 二次項 → **0.0026**（cap-30 15/20，最貼近原本）。五個 gate 跟住改；
  **`flow.mjs` 有三處寫死同一格**，一處係世界座標 `11.5 / 5.5`，grep 格座標搵唔到。

**ADR-206（本輪）— 同一把手機尺掃成個 hub**

- 新 `tests/hub-touch.mjs`：iPhone SE 375×667 × 直橫兩姿勢，逐個開場畫面問四句。
  載得起／零 error／唔爆版**三條本來就過**；≥44×44 **捉到八個介面共 24 個**
  （最嚴重 Royale 12 個；Tower 自己 3 個開場難度掣——ADR-202 嗰把尺撳咗
  START 之後先量，睇唔到開場畫面）。Hub carousel 圓點 24×24 **冇當佢係 bug**
  （有理由嘅例外連理由一齊寫入把尺）。橫屏四個「跌出畫面底」捲得返入嚟，
  唔算 bug——條 check 改成真係捲一次。5/5。
- **ADR-207 載入重量**：`tests/hub-load.mjs` 量實際落幾多（唔係磁碟大細——Snooker
  磁碟 27 MB 但只落 123 KB）。Hub launcher 847 KB 係兩張大 12／20 倍嘅 logo，縮到
  160×160 ＋ `<picture>` 之後 **904 → 68 KB**。gate：開場 4 MB、圖 ≤ 最大顯示 3 倍。2/2。
- **ADR-208 鍵盤契約**：`tests/hub-keyboard.mjs` 3/3——**十二個介面本來就啱，
  一行遊戲碼都冇改**。三次報紅全部係把尺錯：①Tower 嘅 `inert` modal 隔離係
  啱嘅（改成問「收唔收得到 focus」而唔係逐個機制認）；②讀 focus style 讀咗
  transition 第 0 格（同 ADR-202 閃光 gate 一樣嘅錯，等 260ms 就啱）；
  ③Tab 預算對住「我數到嘅控制」而唔係「成頁可 focus 總數」，係**掃唔夠**唔係掃唔到。

**ADR-210（本輪）— 有字唔等於有交代**

- 探路第一個結果推翻咗前提：**七隻遊戲入局後全部 ＋0 KB**——冇「入到局先落」
  呢件事，全部喺開場畫面就落晒。真問題係「落緊嗰陣睇唔睇得出佢仲行緊」。
- Fast 3G 量「載入畫面期間最長靜默」：Tower（ADR-203 修過）**0.0s**、
  MOBA **23.6s**、Royale **14.4s**。兩隻都有字（「載入資產…」「載入模型中…」）
  但個字十幾廿秒唔郁，條 bar 一直 0%。
- 根因係**進度嘅單位揀錯**：`Promise.all` 平行落十幾個 GLB，而進度用「幾多件
  落完」計——平行落冇一件早完，所以 0 企到最後跳去 100。改成量位元組
  （新共用 `games/shared/js/byte-progress.mjs`）。冇 `Content-Length` 嗰陣報
  `null`，出 indeterminate 掃光 bar ＋ MB 數字，**唔報假嘅 0%**。
- 四個「把尺講緊自己」：①again 量「見唔見到個掣」量到 0.08s（同 ADR-209
  同一日犯多次）；②量到 MOBA 靜默 75 秒，其實佢喺揀英雄度等緊你；
  ③regex 撞唔到「開打」，又撞唔到 Racing Car 個 `top:1851` 嘅 `#start-btn`；
  ④**我個 test server 冇送 `Content-Length`**，`e.total` 變 0，百分比卡死喺 0%。
- 新 `tests/hub-wait.mjs` 1/1（靜默上限 3 秒）。突變令 MOBA 報紅（靜 10.7s）。

**ADR-209（本輪）— 一個 CDN 慢，六隻本來全本地嘅遊戲乜都唔郁**

- 六隻遊戲喺 HTML 度寫住 parser-blocking 嘅 `cdn.jsdelivr.net` Supabase SDK。
  第三方吊 8 秒＝**DCL 由 0.04–0.49s 變 8.0–8.4s，一比一**；而 FCP 照樣 0.08s,
  即係畫面畫咗一半就唔郁。個 SDK 淨係真人對戰用得着。Royale 老早冇呢個病,
  改法就係將佢 `net.js` 嗰套搬上 `shared/js/online_utils.js`（`loadSupabaseSdk()`）。
- 順手補返一個**本來就有**嘅窿：SDK 攞唔到嗰陣撳線上入口係靜靜雞乜都唔做。
  加 `holdOnlineEntries()` 佔位守住，撳到有交代。
- 三個記錄：①第一版量「見唔見到個掣」，量到 0.08s——數啱但答緊另一條問題；
  ②classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，
  擺完佔位之後 `window.x = x` 變咗自己指自己（Snooker／Xiangqi 冇事，
  因為一個名唔同、一個係 module）——**我親手整出嚟，把尺利咗先捉到**；
  ③第 3 條 check 本來 8 秒窗口，畀 SDK 自己嘅逾時 toast 頂咗，收窄到 1.5 秒先分得開。
- 新 `tests/hub-cdn.mjs` 3/3，三個突變分別令三條 check 報紅。
- Playwright 淨係裝喺 `games/tower/node_modules`，跨遊戲 test 做咗 resolve fallback。

## Changed files

- Tower：`src/main.ts`（`錨定橫額()`／`等資產()`／`啟動中`／seam 加 `開波次數`）、
  `src/render/assets.ts`、`src/ui/style.css`、`index.html`、`tests/{touch,load}.mjs`（新）、
  `tests/gateway.mjs`（閃光量法大修）、`configs/map.json`、`src/core/config.ts`、`dist/`
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait}.mjs`（全新）、`launcher.js`（`<picture>`）
- ADR-210：`games/shared/js/byte-progress.mjs`（新）、moba `src/{assets,main}.js`＋`style.css`、
  royale `src/{assets,main}.js`＋`style.css`＋`index.html`
- ADR-209：`games/shared/js/online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、
  big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html` ＋ `online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。Tower：
  `touch` 6/6、`load` 5/5、`gateway` 連跑三次 11/11（青增 10.12／9.99／10.70，門檻 4）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 2/2、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1。
- Mutation 驗過八次，每次都報紅而且叫得出係邊個（最新三次：擺返 parser-blocking
  script tag、拆走佔位 toast、拆走佔位自卸）。

## Known issues and cautions

- 承上：Vite 758 kB 單 chunk warning。
- **雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`**。
- **`pgrep -f <字>` 喺呢個環境會撞到自己**，`until ! pgrep -f x` 會永遠唔完。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **重量本身仲未郁過**：MOBA 2,527 KB／Royale 1,913 KB／Tower 1,291 KB 全部
   喺開場畫面就落晒。Tower 嗰 1,087 KB GLB 未壓過（MOBA／Royale 已用 Draco）。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：唔好將 `#wave-banner` 改返寫死 `top`；唔好將閃光 gate
  改返「影幾張相攞最大值」；唔好將 `enterRun` 改返直接 `await 地面好`；
  **唔好將 Supabase SDK 擺返落 HTML 做 parser-blocking script**。
