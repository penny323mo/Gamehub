# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 222
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 九把跨遊戲尺；Royale 補返 draw-call 預算；MOBA 鏡頭偶發重現唔到，封死咗佢指住嗰個機制

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠
  嗰陣斷咗** ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。
  **`flow.mjs` 有三處寫死同一格**，一處係世界座標 `11.5 / 5.5`，grep 搵唔到。
- 四把跨遊戲尺：`hub-touch` 5/5（≥44×44 捉到八個介面共 24 個）、`hub-load`
  （launcher **904 → 51 KB**）、`hub-keyboard` 3/3（**十二個介面本來就啱**，三次報紅
  全部係把尺錯）、`hub-cdn` 3/3（jsdelivr SDK 吊 8 秒＝**DCL 8.0–8.4s，一比一**）。
  記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，擺完
  佔位 `window.x = x` 就自己指自己——**把尺利咗先捉到**。

**ADR-222（本輪）— MOBA 鏡頭偶發：重現唔到，封死佢指住嗰個機制**

- 獨立探針喺同一版重複跑 framing 十五次（唔行成個十二分鐘 suite）：**十五次全過**
  （由頂計 55.9–56.3、焦點離玩家 0.1–0.3、途中死過全 N），成個 suite 亦 196/196
  ——即係**重現唔到**。
- 但個報告指住一個封得死嘅機制：framing 繼承住上一段（普攻）留低嘅場面——隔籬
  有一隻滿血敵人企 1.5 米。玩家喺嗰 150 幀死咗就重生返泉水（x ≈ −62），鏡頭追過去,
  量到嘅係**喺半路嘅鏡頭**；啱啱好解釋到「焦點離玩家 44 個單位」同兩次相反嘅讀數。
  **呢段量嘅係構圖，唔係打得贏打唔贏**，所以每一幀都撐住玩家生存。
  **唔係放寬斷言**——45–88 條線一個字都冇改。
- 報告加咗 `途中死過` 同 `焦點離玩家`：**一個重現唔到嘅偶發，最實際嘅交付品係「下次
  唔使再由零估」。** 冇改鏡頭邏輯（重現唔到就改鏡頭係明文唔做嘅嘢）。

**ADR-221（已合埋 main）— Royale 補返 draw-call 預算**

- **個數本來係假嘅**：`EffectComposer` 最後一 pass 係全屏 quad，自己又行多次
  `render()` 又 reset 一次 `info` → 讀到 1。修法：`renderScene()` 熄 `autoReset`、
  自己一幀 reset 一次、render 完即刻記低（`__royaleDrawn`）。
- 真數（教學略過後 45 秒）：手機 中位 **509**／尖峰 **532**（場上得 9 個單位、867K
  三角）。即係嗰五百個 call 幾乎全部係**戰場本身**（Tower 空場 126、MOBA 94）。
- **兩條線**：上限 650 ＋ **下限 50**——個數曾經係 1，淨守上限會**永遠報綠**。突變示範：
  拆走 `autoReset=false` → 得下限報紅；多畫一次場景 → 得上限報紅。**一個讀到假數嘅
  gate 比冇 gate 更差。** `royale/tests/perf.mjs` 3/3，已入 run-all。

**ADR-219／220（已合埋 main）— 聲；流暢度量唔到**

- 219：**autoplay 本來就啱**（五隻有聲嘅遊戲開場一個 `AudioContext` 都冇 new，第一下
  手勢先 new 而且即刻 `running`）；**Royale 個靜音一個字都冇存** → 自己一個
  localStorage key，個掣嘅字都要跟返。新 `tests/hub-audio.mjs` 3/3。
  **一個對照救返一個假綠**：第一版撳唔到 `#mute-btn`（佢喺局內 HUD），於是「撳完」
  同「reload 後」一樣 → 報綠。加咗「撳之前先證明個掣真係撳到」。
- 220：幀時間量法（p95/中位）**喺佢最有用嗰個 case 上面失效**——Royale 八秒得 13 幀,
  13 個樣本嘅「p95」唔係分位數。所以唔寫。順帶：**同一個外部取樣點喺三種 loop
  結構下面有三個意思**，`info.render.calls` 要接落個 loop 度先讀得準。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s。根因係**進度單位
  揀錯**（平行落而計「幾多件落完」）→ `byte-progress.mjs` 量位元組；冇
  `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
- **重量**（211/212/213）：Tower GLB → Draco **1,291 → 754 KB**；MOBA 拆資產
  **16.0 → 12.7s**（重排時間軸唔係壓縮）；Royale 量完**決定唔改**。順手發現
  `hub-load` 一直冇 gzip。
- **偶發 gate**（216）：`揮動作` 真因係 fixture **冇清 `respawnAt`**（改 fixture 唔改斷言）。
- **切走就停**（217/218）：**成個 repo 得 Tower 同 Racing Car 有 `visibilitychange`**。
  MOBA ＋8.6s／Royale −7.5s → 連 Snake 三隻補齊。Snooker 查完唔改（冇計時、回合制）。
  Snake 剷過一次先做得成：補返嘅係**「隱藏之前個鐘要真係喺度行」**呢個對照
  （順帶捉到 Tower 個鐘喺備戰唔郁，換 `prepTimer`）。
- **cache-bust／storage**（214/215）：bump regex 冚唔到共用層 → 改網唔改一個位；封住
  storage 之後 Racing Car 51 → 0、Snake 1 → 0 → 新 `safe-storage.js`。**要改嘅係枱面。**
- **量法通用教訓**：`bringToFront` 喺 headless 唔會令個頁隱藏；「畫面有冇郁」分唔開停
  冇停；test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生
  咗**（鐘要喺行、掣要撳到）——冇呢個對照，「前後一樣」會扮到守得好好。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio}.mjs`
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`；`online_utils.js` 加 lazy SDK
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`
- **MOBA**：`src/{assets,main}.js`、`tests/browser.mjs`（兩處 fixture）、`?v=assets-29`、
  `scripts/moba-bump-cache.mjs`＋`tests/cache-bust.mjs`
- **Royale**：`src/{assets,main,sfx}.js`、`tests/perf.mjs`（新）＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209 波及
  big2／doudizhu／gomoku／snooker(×3)／xiangqi 嘅 `index.html`＋`online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、
  `hub-wait` 1/1、`hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3。Tower 三個 suite
  全過；`moba` 196/196、**royale 九個檔全過（新增 `perf.mjs`）**。Mutation 驗過十七次。

## Known issues and cautions

- 承上：Vite 單 chunk warning（tower 777 kB／xiangqi 594 kB）。
- **雲端容器要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f <字>` 會撞到自己**。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。
- `moba` 條 `玩家企喺畫面下半但唔會跌出畫外` 曾經五跑兩紅；ADR-222 封咗報告指住
  嗰個機制（重現唔到），報告加咗 `途中死過`／`焦點離玩家`，再紅嘅話一眼睇得出。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：進度記憶（要逐隻寫 driver，generic 掃法證實掃唔夠）——十二個介面得
   Tower 有 checkpoint gate，其餘冇人量過。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞
  最大值」；`enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做
  parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送 `Content-Length`**。
