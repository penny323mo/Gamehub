# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 225
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十二把跨遊戲尺全綠；`hub-context` 捉到 Xiangqi 黑咗唔出聲，`hub-home` 捉到 MOBA 一條返 hub 嘅路都冇

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-225（本輪）— 守住入去嗰十三條路，冇人守過出返嚟嗰條**

- `hub.mjs` 一直守住 launcher **入去**嗰十三條路，**冇人守過出返嚟**——入到去出唔返
  係一個陷阱。
- 十一個介面**十個本來就有**；**得 MOBA 一條都冇**（成個 `games/moba/` 入面
  `index.html` 三個字冇出現過）。揀英雄版（角落定位）同收場版各加一條。
  **加完即刻畀 MOBA 自己把尺捉到回歸**：第一版擺喺文檔流入面 → SE 直橫都
  「見唔到一張完整嘅英雄卡」。改成絕對定位後 196/196。
- **四個「把尺講緊自己」**：①淨係掃屬性掃唔到（`onclick="goToLauncher()"`，
  「返回遊戲大廳」係文字）——報咗五隻，四隻係掃唔到；②**撳第一個唔等於撳啱**
  （Tower 兩個 🏠，HUD 嗰個喺開場 modal 後面）→ 改成逐個試；③`getByText(/開始
  遊戲/)` 撞中咗 Snake 個副標題，撳咗個 `<p>`；④一個 timeout 掃唔到分階段介面。
- `tests/hub-home.mjs` 3/3。第 3 條唔可以淨係睇 `href`——**一條指住唔存在檔案嘅鏈,
  睇落一樣好地地**。兩個突變分別打中第 2、3 條。

**ADR-224（已合埋 main）— GL context 掉咗：五隻識講，一隻淨係黑咗**

- 六隻**全部有叫 `preventDefault()`**。至於交代：五隻都有講，**得 Xiangqi AI 乜都冇**
  ——而佢係按需渲染，掉咗之後 canvas 真係空白（8,212 → 1,612 byte）。補返訊息。
- **五個「把尺講緊自己」**：①「畫緊」對按需渲染冇意義；②文字比對捉到嘅係遊戲鐘
  ——要先量噪音底；③**我幫咗佢還原**（自己叫 `restoreContext()`，於是拆走 Tower 成個
  handler 都報綠）；④`children.length === 0` 讀漏咗有 `<span>` 嘅訊息；⑤讀遲咗。
- 呢個容器**冇一隻遊戲收到 `webglcontextrestored`**，「畫唔畫得返」量唔到，所以條 gate 靠「攔住 ＋ 有交代」。`tests/hub-context.mjs` 3/3。

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠
  嗰陣斷咗** ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。**`flow.mjs`
  有三處寫死同一格**，一處係世界座標，grep 搵唔到。
- 四把跨遊戲尺：`hub-touch`（≥44×44 捉到八個介面共 24 個）、`hub-load`（launcher
  **904 → 51 KB**）、`hub-keyboard`（**十二個介面本來就啱**）、`hub-cdn`（jsdelivr SDK
  吊 8 秒＝**DCL 8.0–8.4s，一比一**）。記低：classic script 入面 `window.joinFixedRoom`
  同頂層函數係同一個綁定，擺完佔位 `window.x = x` 就自己指自己。

**ADR-223（已合埋 main）— 進度記憶：逐隻寫 driver，五隻全部覆蓋**

- 上次 generic 掃法掃到九隻「玩完乜都冇寫低」，其實 Snake 淨係 game over 先寫——
  **掃唔夠**。今次逐隻寫 driver，每隻先證明去到「有嘢值得記」嗰一刻，五隻 reload
  之後全部仲喺。**唔同遊戲「值得留低」嘅嘢唔同。** 坑：**教學遮罩開住嗰陣 Royale
  嘅模擬係凍結嘅**；Racing Car 唔可以直接叫 `ghostRecorder.commit()`（**等於自己驗
  自己**），要推個圈速入 `race.lapTimes` 畀佢自己行。`hub-progress.mjs` 2/2。

**ADR-219 至 222（已合埋 main）— 聲／流暢度／Royale draw-call／MOBA 鏡頭偶發**

- 219：autoplay 本來就啱；**Royale 個靜音一個字都冇存**。**一個對照救返一個假綠**
  （撳唔到嘅掣令「撳完」同「reload 後」一樣）。220：幀時間量法**喺佢最有用嗰個
  case 失效**；**同一個外部取樣點喺三種 loop 結構下面有三個意思**。
- 221：Royale draw call **個數本來係假嘅**（composer 最後一 pass 係全屏 quad → 讀到 1）。
  真數中位 509／尖峰 532，幾乎全部係**戰場本身**。**上限 650 ＋ 下限 50**（淨守上限
  會永遠報綠）。222：MOBA 鏡頭偶發**重現唔到**（十五次全過），封死佢指住嗰個機制
  ——**重現唔到嘅偶發，交付品係「下次唔使由零估」**。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s，根因係**進度單位
  揀錯**（平行落而計「幾多件落完」）→ `byte-progress.mjs` 量位元組；冇
  `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
- **重量**（211–213）：Tower GLB → Draco **1,291 → 754 KB**；MOBA 拆資產
  **16.0 → 12.7s**（重排時間軸唔係壓縮）；Royale 量完**決定唔改**。
- **切走就停**（216–218）：得 Tower 同 Racing Car 有 `visibilitychange`；MOBA ＋8.6s／
  Royale −7.5s → 連 Snake 三隻補齊。`揮動作` 偶發真因係 fixture **冇清 `respawnAt`**。
  **cache-bust／storage**（214/215）：bump regex 冚唔到共用層 → 改網唔改一個位；
  封住 storage 之後 Racing Car 51 → 0 → 新 `safe-storage.js`。**要改嘅係枱面。**
- **量法通用教訓**：`bringToFront` 喺 headless 唔會令個頁隱藏；「畫面有冇郁」分唔開停
  冇停；test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生咗**
  ——冇呢個對照，「前後一樣」會扮到守得好好。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress,context,home}.mjs`
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`；`online_utils.js` 加 lazy SDK
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`（Vite 單 chunk warning 未清）
- **MOBA**：`src/{assets,main}.js`、`tests/browser.mjs`（兩處 fixture）、`?v=assets-29`、、bump 腳本＋`cache-bust.mjs`
- **Royale**：`src/{assets,main,sfx}.js`、`tests/perf.mjs`（新）＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209 波及五隻卡牌／棋類
- **Xiangqi**：`js/render.js`（GL context 掉咗嘅訊息）＋`dist/`；**MOBA**：`index.html`＋`style.css`（返 hub）

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲十二把尺全綠：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、
  `hub-cdn` 3/3、`hub-wait` 1/1、`hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、
  `hub-progress` 2/2、`hub-context` 3/3、**`hub-home` 3/3**。Tower 三個 suite、`moba` 196/196。
  Mutation 驗過廿二次，次次叫得出係邊個。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制，加咗兩個數）。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：十一把尺掃齊十二個介面。現成入口：ADR-213／218（量咗決定唔改）。
   ADR-224 量到**呢個容器冇一隻遊戲收到 `webglcontextrestored`**——「掉咗之後畫唔畫
   得返」要真機先驗得到，唔好喺呢度寫呢條 gate。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最
  大值」；`enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-
  blocking script**；**test server 一定要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗
  唔好自己叫 `restoreContext()`**（等於幫佢做咗佢要做嗰件事，拆走成個 handler 都報綠）。
