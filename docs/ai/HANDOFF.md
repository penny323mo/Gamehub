# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 223
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十把跨遊戲尺；本輪補返「進度記憶」（三隻，另外兩隻夠唔到嗰一刻，寫咗喺把尺入面）

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠
  嗰陣斷咗** ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。
  **`flow.mjs` 有三處寫死同一格**，一處係世界座標 `11.5 / 5.5`，grep 搵唔到。
- 四把跨遊戲尺：`hub-touch`（≥44×44 捉到八個介面共 24 個）、`hub-load`（launcher
  **904 → 51 KB**）、`hub-keyboard`（**十二個介面本來就啱**，三次報紅全部係把尺錯）、
  `hub-cdn`（jsdelivr SDK 吊 8 秒＝**DCL 8.0–8.4s，一比一**）。記低：classic script
  入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，擺完佔位 `window.x = x`
  就自己指自己——**把尺利咗先捉到**。

**ADR-223（本輪）— 進度記憶：逐隻寫 driver，缺口寫喺把尺入面**

- 上次 generic 掃法掃到九隻「玩完乜都冇寫低」，其實 Snake 有成套 profile 系統淨係
  game over 先寫——**掃唔夠**。今次逐隻寫 driver，每隻都要**先證明去到「有嘢值得
  記」嗰一刻**（同 ADR-217／219 兩個對照同一種嘢，第三次用）。
- 量到：Tower 開咗波 → `tower-defense-run-v1`（440 B）；Snake 死咗 → `snake-game-users`
  （`gamesPlayed 1`）；MOBA 入咗場 → `moba-settings` 記住你揀邊個英雄。三隻 reload
  之後全部仲喺度。**唔同遊戲「值得留低」嘅嘢唔同**，所以憑據逐隻寫。
- **覆蓋得三隻，而且寫咗喺把尺個檔頭**：Royale 要一場波打完先 `recordMatch()`、
  Racing Car 要跑完一圈——玩 8／12 秒之後兩隻都「乜都冇留低」，**嗰個係我夠唔到，
  唔係一個發現**。靜靜雞跳過兩隻遊戲，同講明自己守唔到邊度，係兩件事。
  新 `tests/hub-progress.mjs` 2/2；突變（拆走 Snake 四處 `saveScore`）令第二條報紅
  而第一條照樣綠。

**ADR-222（已合埋 main）— MOBA 鏡頭偶發：重現唔到，封死佢指住嗰個機制**

- 獨立探針重複跑 framing 十五次**全過**，成個 suite 亦 196/196——**重現唔到**。但報告
  指住一個封得死嘅機制：framing 繼承住上一段留低嘅場面（隔籬一隻滿血敵人），玩家
  死咗就重生返泉水，鏡頭喺半路——啱好解釋到「焦點離玩家 44 個單位」。**呢段量嘅
  係構圖**，所以每一幀撐住玩家生存；45–88 條線一個字都冇改。
- 報告加咗 `途中死過`／`焦點離玩家`：**重現唔到嘅偶發，最實際嘅交付品係「下次唔使
  再由零估」**。冇改鏡頭邏輯。

**ADR-221（已合埋 main）— Royale 補返 draw-call 預算**

- **個數本來係假嘅**：`EffectComposer` 最後一 pass 係全屏 quad，自己又行多次
  `render()` 又 reset `info` → 讀到 1。修法：`renderScene()` 熄 `autoReset`、
  自己一幀 reset 一次、render 完即刻記低（`__royaleDrawn`）。
- 真數：手機 中位 **509**／尖峰 **532**（場上得 9 個單位）——嗰五百個 call 幾乎全部係
  **戰場本身**（Tower 空場 126、MOBA 94）。**兩條線**：上限 650 ＋ **下限 50**（個數曾經
  係 1，淨守上限會**永遠報綠**）。突變各自打中一條。

**ADR-219／220（已合埋 main）— 聲；流暢度量唔到**

- 219：**autoplay 本來就啱**（五隻有聲嘅遊戲第一下手勢先 new context 而且即刻
  `running`）；**Royale 個靜音一個字都冇存** → 自己一個 localStorage key。
  **一個對照救返一個假綠**：撳唔到嘅掣令「撳完」同「reload 後」一樣 → 報綠。
- 220：幀時間量法（p95/中位）**喺佢最有用嗰個 case 失效**（Royale 八秒得 13 幀）。
  順帶：**同一個外部取樣點喺三種 loop 結構下面有三個意思**。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s，根因係**進度單位
  揀錯**（平行落而計「幾多件落完」）→ `byte-progress.mjs` 量位元組；冇
  `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
- **重量**（211–213）：Tower GLB → Draco **1,291 → 754 KB**；MOBA 拆資產
  **16.0 → 12.7s**（重排時間軸唔係壓縮）；Royale 量完**決定唔改**。
- **切走就停**（216–218）：**成個 repo 得 Tower 同 Racing Car 有 `visibilitychange`**;
  MOBA ＋8.6s／Royale −7.5s → 連 Snake 三隻補齊。Snooker 查完唔改。
  `揮動作` 偶發真因係 fixture **冇清 `respawnAt`**（改 fixture 唔改斷言）。
- **cache-bust／storage**（214/215）：bump regex 冚唔到共用層 → 改網唔改一個位；封住
  storage 之後 Racing Car 51 → 0、Snake 1 → 0 → 新 `safe-storage.js`。**要改嘅係枱面。**
- **量法通用教訓**：`bringToFront` 喺 headless 唔會令個頁隱藏；「畫面有冇郁」分唔開停
  冇停；test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生
  咗**（鐘要喺行、掣要撳到、真係玩到有嘢值得記）——冇呢個對照，「前後一樣」會扮到
  守得好好。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress}.mjs`
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`；`online_utils.js` 加 lazy SDK
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`（Vite 單 chunk warning 未清）
- **MOBA**：`src/{assets,main}.js`、`tests/browser.mjs`（兩處 fixture）、`?v=assets-29`、、bump 腳本＋`cache-bust.mjs`
- **Royale**：`src/{assets,main,sfx}.js`、`tests/perf.mjs`（新）＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209 波及五隻卡牌／棋類嘅 `index.html`＋`online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲十把尺全綠：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、
  `hub-cdn` 3/3、`hub-wait` 1/1、`hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、
  `hub-progress` 2/2。Tower 三個 suite、`moba` 196/196、royale 九個檔全過。
  Mutation 驗過十八次，次次叫得出係邊個。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。
- `moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅；ADR-222 封咗報告指住嗰個機制（重現
  唔到），加咗 `途中死過`／`焦點離玩家` 兩個數，再紅一眼睇得出。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：`hub-progress` 補 Royale（一場波打完）同 Racing Car（跑完一圈）——
   兩隻嘅 driver 都要行到收場，唔係八秒十二秒。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最
  大值」；`enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-
  blocking script**；**test server 一定要 gzip ＋ 送 `Content-Length`**。
