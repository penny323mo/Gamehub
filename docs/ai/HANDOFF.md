# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 209
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: Tower 四輪已合埋 main；ADR-206–209 四把跨遊戲尺（掂、載、鍵盤、第三方）掃齊十二個介面

## Current objective

由 refine Tower 擴到「continuously improve the gaming experience for everything」。
入手點一直係 **Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，
但冇一條問過「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、
呢個數睇唔睇得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202（commit `c234210`，已合埋 main）**

- 44×44 掂得到（六個掣本來 36–37px 高）、建塔欄兩邊漸隱、備戰橫額改由
  `--hud-bottom` 錨住（幾何相交 73–100% → 0%）。
- **修好 `tests/gateway.mjs` 嘅閃光 gate**：舊版四張相冇一張影到 0.55 秒嘅閃光，
  個底自己又喺度呼吸（0.9–4.1pp）而門檻寫 0.45。重寫量法，門檻由實測定（4）。

**ADR-203（本輪）**

- **撳咗 START 之後嘅靜默**：要落 1,860 KB，Fast 3G 等 7.1 秒／Slow 3G 23.7 秒，
  期間畫面一個 pixel 都冇變。加咗停用 ＋ 進度條（數字由 `載模型` 度計）。
- **再撳一次會真係開多次波**：實測 `開波次數 = 2`。加 `disabled` ＋ `啟動中` 兩重擋。
  `tests/load.mjs` 新增（5 條，已入 `test:browser`），用 CDP 真節流唔係 `sleep` 扮慢。

**ADR-204（本輪）— Penny 話「個地圖唔夠廣闊」**

- 唔係地細，係**個世界喺你最想望遠嗰陣斷咗**：佈景去到 X ±19／Z ±15，但鏡頭
  zoom 得出到半對角 24.2——zoom 到盡見到 19→33 一條光板地帶加 18 枝圓錐。
- 佈景範圍改由鏡頭推出嚟（密度跟距離跌）：1,115 → 3,775 件，伸到 X ±37／Z ±33；
  遠山 18 個 Mesh → 三圈 66 個 instance，**draw call 由 18 變 1**。新 `envelopeRadius`
  同 `underlayPadding` 拆開，唔係嘅話「鋪遠啲」會攤平島邊起伏。**一格可玩地都冇郁**。
- 代價：桌面空場三角 141,362 → 384,294，手機 34,588 → 62,172；draw call ＋1。

**ADR-205（本輪）— 輕微擴格＋條路重畫＋難度補返**

- 格 20×12 → **24×14**、陸地 148 → **178 格**、條路 31 格 8 彎 → **37 格 10 彎**、
  貼路塔位 60 → **72**；入口 [0,6]、出口 [23,5]、三區 0-7/8-15/16-23、河 col 11 橋 [11,5]。
- **擴完一定要重掃難度**：未補之前 cap-30 由「跌 4 命」變成「20/20 一條唔跌」。
  掃 HP 二次項 0.0022／0.0024／**0.0026**（15/20，最貼近原本 16/20），揀咗 0.0026。
  新梯度（seed 198）：cap 20 → LOST wave 80；無限制 → 20/20、剩 9,120 金。
- 五個 gate 跟住改。**`flow.mjs` 仲有三處寫死同一格**，其中一處係世界座標
  `11.5 / 5.5`——grep 格座標搵唔到佢。

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
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn}.mjs`（全新）、`launcher.js`（`<picture>`）
- ADR-209：`games/shared/js/online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、
  big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html` ＋ `online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。Tower：
  `touch` 6/6、`load` 5/5、`gateway` 連跑三次 11/11（青增 10.12／9.99／10.70，門檻 4）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 2/2、`hub-keyboard` 3/3、`hub-cdn` 3/3。
- Mutation 驗過八次，每次都報紅而且叫得出係邊個（最新三次：擺返 parser-blocking
  script tag、拆走佔位 toast、拆走佔位自卸）。

## Known issues and cautions

- 承上：Vite 758 kB 單 chunk warning。
- **雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`**。
- **`pgrep -f <字>` 喺呢個環境會撞到自己**，`until ! pgrep -f x` 會永遠唔完。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. Tower 自己嘅 1,860 KB 未縮過（758 kB 單 chunk ＋ 1,086 KB GLB 兩邊都有位）；
   `tests/load.mjs` 已經有位擺載入時間 gate。Xiangqi dist 亦有 594 kB 單 chunk。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：唔好將 `#wave-banner` 改返寫死 `top`；唔好將閃光 gate
  改返「影幾張相攞最大值」；唔好將 `enterRun` 改返直接 `await 地面好`；
  **唔好將 Supabase SDK 擺返落 HTML 做 parser-blocking script**。
