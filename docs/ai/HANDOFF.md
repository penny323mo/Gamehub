# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 211
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: ADR-206–211 五把跨遊戲尺（掂、載、鍵盤、第三方、等緊）掃齊十二個介面；Tower 開場 1,291 → 754 KB

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過
「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 205（Tower 四輪，已合埋 main；詳情喺 DECISIONS）**

- 202：44×44、建塔欄漸隱、橫額由 `--hud-bottom` 錨住；順手修好 `gateway.mjs`
  嘅閃光 gate（四張相影唔到 0.55 秒嘅瞬態，個底自己又喺度呼吸）。
- 203：撳完 START 之後 1,860 KB 嘅靜默 → 停用 ＋ 進度條；再撳會開多次波
  （`開波次數 = 2`）→ 兩重擋。新 `tests/load.mjs`，用 CDP 真節流。
- 204：地圖唔細，係**佈景喺你最想望遠嗰陣斷咗**。範圍改由鏡頭推出嚟，
  1,115 → 3,775 件；遠山 18 個 Mesh → 1 個 InstancedMesh。可玩地一格冇郁。
- 205：格 20×12 → **24×14**、陸地 → 178、路 → **37 格 10 彎**、塔位 → 72；重掃難度
  HP 二次項 → **0.0026**。**`flow.mjs` 有三處寫死同一格**，一處係世界座標
  `11.5 / 5.5`，grep 格座標搵唔到。

**ADR-206／207／208（跨遊戲三把尺，已合埋 main）**

- 206 `hub-touch` 5/5：375×667 直橫兩姿勢。載得起／零 error／唔爆版本來就過；
  ≥44×44 **捉到八個介面共 24 個**（Royale 12；Tower 3 個開場難度掣——ADR-202
  撳咗 START 先量，睇唔到開場）。Carousel 圓點 24×24 **冇當佢係 bug**。
- 207 `hub-load`：量實際落幾多，唔係磁碟大細。Hub launcher 兩張大 12／20 倍嘅
  logo → 160×160 ＋ `<picture>`，**904 → 51 KB**。
- 208 `hub-keyboard` 3/3——**十二個介面本來就啱，一行遊戲碼都冇改**。三次報紅
  全部係把尺錯：①`inert` modal 隔離本來就啱；②讀 focus style 讀咗 transition
  第 0 格；③Tab 預算對住「我數到嘅控制」而唔係「成頁可 focus 總數」。

**ADR-211（本輪）— 1,087 KB 未壓過嘅模型，而隔籬兩隻遊戲一路壓緊**

- Tower 開場 1,291 KB 入面 1,087 KB 係**未壓過嘅 GLB**，而同 repo 嘅 MOBA／Royale
  老早用緊 Draco——答案本身已經喺屋企，得一隻遊戲冇跟。
- 78 個檔量三條路：原本 1,183／meshopt 762＋25＝787／**Draco 379＋246＝625 KB**。
  meshopt decoder 細好多但只壓到 64%，Draco 壓到 32%——decoder 係一次性成本，
  模型每次都要落。實際：**1,291 → 754 KB（−42%）**。`public/models/` 保持原樣
  （Draco 有損）；壓縮喺 `scripts/postbuild.mjs` 做，idempotent，失敗大聲掟錯。
  Decoder 同源派 `dist/draco/`，唔再種外部依賴。
- **`hub-load` 一直冇 gzip**——Tower bundle 實際 202 KB 佢報 823 KB，差四倍
  （同一日已經因為冇送 `Content-Length` 撞過一次）。修完全 hub 嘅數都真實咗。
- 新 check：GLB 落多過 300 KB 嘅遊戲，有幾何嘅模型要壓過——**讀真正派出去嗰個
  GLB 嘅 glTF header**，唔 grep build script。純動畫檔唔當漏網。突變報紅。

**ADR-210（本輪）— 有字唔等於有交代**

- 探路第一個結果推翻咗前提：**七隻遊戲入局後全部 ＋0 KB**——全部喺開場畫面就
  落晒。真問題係「落緊嗰陣睇唔睇得出佢仲行緊」。Fast 3G 量「載入畫面期間最長
  靜默」：Tower（ADR-203 修過）**0.0s**、MOBA **23.6s**、Royale **14.4s**。兩隻都
  有字（「載入資產…」「載入模型中…」）但個字十幾廿秒唔郁，條 bar 一直 0%。
- 根因係**進度嘅單位揀錯**：`Promise.all` 平行落十幾個 GLB 而進度用「幾多件
  落完」計——平行落冇一件早完，所以 0 企到最後跳去 100。改成量位元組（新共用
  `games/shared/js/byte-progress.mjs`）；冇 `Content-Length` 就報 `null`，
  出 indeterminate 掃光 bar ＋ MB 數字，**唔報假嘅 0%**。新 `tests/hub-wait.mjs` 1/1。
- 四個「把尺講緊自己」：①又量「見唔見到個掣」量到 0.08s；②量到 MOBA 靜默
  75 秒，其實佢喺揀英雄度等緊你；③regex 撞唔到「開打」，又撞唔到 Racing Car
  個 `top:1851` 嘅 `#start-btn`；④**test server 冇送 `Content-Length`**，
  `e.total` 變 0，百分比卡死喺 0%。

**ADR-209（已合埋 main）— 一個 CDN 慢，六隻本來全本地嘅遊戲乜都唔郁**

- 六隻遊戲寫住 parser-blocking 嘅 jsdelivr Supabase SDK。吊 8 秒＝**DCL 由
  0.04–0.49s 變 8.0–8.4s，一比一**，而 FCP 照樣 0.08s。改法搬自 Royale `net.js`
  → `shared/js/online_utils.js` 嘅 `loadSupabaseSdk()`；順手補返「SDK 攞唔到撳
  線上入口靜靜雞乜都唔做」→ `holdOnlineEntries()`。新 `tests/hub-cdn.mjs` 3/3。
- 三個記錄：①量「見唔見到個掣」量到 0.08s；②classic script 入面
  `window.joinFixedRoom` 同頂層函數係同一個綁定，擺完佔位 `window.x = x` 就自己
  指自己（Snooker 名唔同／Xiangqi 係 module 所以冇事）——**我親手整出嚟，把尺由
  「係唔係 function」收緊到「係唔係仲係佔位」先捉到**；③第 3 條 check 本來 8 秒
  窗口，畀 SDK 自己嘅逾時 toast 頂咗，收窄到 1.5 秒。
- Playwright 淨係裝喺 `games/tower/node_modules`，跨遊戲 test 做咗 resolve fallback。

## Changed files

- Tower：`src/main.ts`（`錨定橫額()`／`等資產()`／`啟動中`／seam 加 `開波次數`）、
  `src/render/assets.ts`、`src/ui/style.css`、`index.html`、`tests/{touch,load}.mjs`（新）、
  `tests/gateway.mjs`（閃光量法大修）、`configs/map.json`、`src/core/config.ts`、`dist/`
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait}.mjs`（全新）、`launcher.js`（`<picture>`）
- ADR-210：`games/shared/js/byte-progress.mjs`（新）、moba／royale `src/{assets,main}.js`＋`style.css`
- ADR-211：tower `scripts/postbuild.mjs`＋`src/render/assets.ts`＋`package.json`＋`dist/`、`tests/hub-load.mjs`
- ADR-209：`games/shared/js/online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、
  big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html` ＋ `online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` **3/3**、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1。
- Tower 全套三個 suite 過晒（Draco 量化冇整走 `units.mjs`／`look.mjs` 任何幾何 gate）。
- Mutation 驗過十次，每次報紅而且叫得出係邊個（最新：擺返 parser-blocking script、
  拆走佔位 toast／自卸、MOBA 退返件數進度、五個模型換返未壓源檔）。

## Known issues and cautions

- 承上：Vite 單 chunk warning（tower 777 kB／xiangqi 594 kB）。
- **雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`**。
- **`pgrep -f <字>` 喺呢個環境會撞到自己**，`until ! pgrep -f x` 會永遠唔完。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. Tower 壓完之後，最重係 **MOBA 2,529 KB**，入面 888 KB 係 `anims.glb`
   ——純動畫，Draco 壓唔到，要靠 resample／量化動畫軌先郁得到。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好改返寫死 `top`；閃光 gate 唔好改返「影
  幾張相攞最大值」；`enterRun` 唔好改返直接 `await 地面好`；**Supabase SDK 唔好擺
  返落 HTML 做 parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送
  `Content-Length`**（唔係嘅話量到嘅數同進度條都係假）。
