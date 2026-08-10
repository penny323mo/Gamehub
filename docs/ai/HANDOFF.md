# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 227
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十三把跨遊戲尺全綠；`hub-read` 捉到五個掣跌穿 WCAG AA；`leak.mjs` 加 DOM 之後捉到 SDK script 一局積一個

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-227（本輪）— 一把只守一種資源嘅洩漏閘，會漏走另一種資源嘅洩漏**

- 問「玩多幾局會唔會愈嚟愈重」。GPU 三個數（geo／tex／programs）連開五局**完全平**
  ——查返先發現 `royale/tests/leak.mjs`（ADR-008）一直守住。**我量咗一樣已經有人守
  嘅嘢**；應該做嘅係搵佢冇守嗰面。
- 佢冇守嘅係 **DOM**：一局爬一個節點，爬緊嘅係 `<script>`（4 → 10），全部係 jsdelivr
  嘅 supabase SDK。`loadSdk()` 攞唔到會重設 promise 再試，**但上次嗰個 element 冇拆走**
  ——**網絡差＝重試多＝爬得快**。同一 pattern 喺 ADR-209 我寫嘅共用 `loadSupabaseSdk()`
  （六隻遊戲用）一樣。兩邊一齊修：載到／載唔到／逾時三條路都拆。
- **條 gate 擺錯位會扮成一條守緊嘢嘅 gate**：第一版加落現有 loop，突變照樣報綠——嗰個
  loop 喺 `evaluate` 入面直接叫 `startMatch`，唔經選單。**一條唔行玩家條路嘅 gate，守唔到
  玩家撞到嘅嘢。** 改成另開實例行「選單→開戰→投降→返選單」。兩個坑：入局後
  `#start-btn` 祖先加 `.hidden`（狀態問題扮成 timeout）；投降流程過唔到 Playwright
  actionability，要用**原生 DOM click**。`leak.mjs` 6/6 → **7/7**，突變報 `[513,532,533,534]`。

**ADR-226（已合埋 main）— 睇唔睇得清：五個主要行動掣跌穿 WCAG AA**

- **把尺量咗四個版先啱，四次都係量錯**：①computed style 搵底色、有 `background-image`
  就跳過——body 一個 gradient 令九個介面 100% 跳過再報「零問題」，**一個量咗零樣嘢
  得出嚟嘅綠**；②改量真像素但攞框內眾數做底——細框入面**字本身先係眾數**，Tower 報咗
  35 個「對比 1.02」假紅；③純 emoji 假紅（多色字形）；④**喺 layout 入面唔等於畫得出嚟**。
  **每版都要親眼影低先信。**
- 真嘢：Big Two／Dou Dizhu「線上對戰」**2.39 → 5.61**；MOBA「開打」2.60／3.85 →
  **4.90／6.45**；Xiangqi「ONLINE 對戰」3.14 → **4.98**；MOBA 角色標籤向白拉三成
  （**英雄色本身唔郁**）。色相冇改，淨係加深。**字體大細只報唔守**（Hub 14、MOBA 16）。
  `tests/hub-read.mjs` 3/3，另有兩條「唔畀自己扮綠」：開唔到要報紅、**要真係量到字**。

**ADR-224／225（已合埋 main）— GL context 掉咗／返得返去**

- 224：六隻全部有 `preventDefault()`，交代方面**得 Xiangqi AI 乜都冇**。五個「把尺講緊
  自己」，其中一個係**我幫咗佢還原**（自己叫 `restoreContext()`，於是拆走 Tower 成個
  handler 都報綠）。225：`hub.mjs` 守咗**入去**十三條路，**冇人守過出返嚟**；**得 MOBA
  一條都冇**。四個「把尺講緊自己」：掃屬性掃唔到 `onclick`、**撳第一個唔等於撳啱**、
  `getByText` 撞中副標題、一個 timeout 掃唔到分階段介面。**一條指住唔存在檔案嘅鏈，
  睇落一樣好地地**。兩條 gate 各 3/3。

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠嗰陣
  斷咗** ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。**`flow.mjs` 有三處
  寫死同一格**，一處係世界座標，grep 搵唔到。
- 四把跨遊戲尺：`hub-touch`（≥44×44 捉到八個介面共 24 個）、`hub-load`（launcher
  **904 → 51 KB**）、`hub-keyboard`（**十二個介面本來就啱**）、`hub-cdn`（jsdelivr SDK
  吊 8 秒＝**DCL 8.0–8.4s，一比一**）。記低：classic script 入面 `window.joinFixedRoom`
  同頂層函數係同一個綁定，擺完佔位 `window.x = x` 就自己指自己。

**ADR-219 至 223（已合埋 main）— 聲／流暢度／draw-call／鏡頭偶發／進度記憶**

- 219：**Royale 個靜音一個字都冇存**；**一個對照救返一個假綠**。220：幀時間量法
  **喺佢最有用嗰個 case 失效**——**同一個外部取樣點喺三種 loop 結構下面有三個意思**。
- 221：Royale draw call **個數本來係假嘅**（composer 尾 pass 係全屏 quad → 讀到 1）；
  真數中位 509／尖峰 532，**上限 650 ＋ 下限 50**。222：MOBA 鏡頭偶發**重現唔到**
  ——**交付品係「下次唔使由零估」**。223：上次 generic 掃法係**掃唔夠**；坑：**教學
  遮罩開住嗰陣 Royale 嘅模擬係凍結嘅**、`ghostRecorder.commit()` **等於自己驗自己**。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s，根因係**進度單位揀錯**
  → `byte-progress.mjs` 量位元組；冇 `Content-Length` 就報 `null`，**唔報假嘅 0%**。
  **重量**（211–213）：Tower GLB → Draco **1,291 → 754 KB**；MOBA 拆資產 **16.0 → 12.7s**
  （重排時間軸唔係壓縮）；Royale 量完**決定唔改**。
- **切走就停**（216–218）：連 Snake 三隻補齊 `visibilitychange`；`揮動作` 偶發真因係
  fixture **冇清 `respawnAt`**。**cache-bust／storage**（214/215）：bump regex 冚唔到共用層
  → **改網唔改一個位**；封住 storage 之後 Racing Car 51 → 0 → 新 `safe-storage.js`。
- **量法通用教訓**：`bringToFront` 喺 headless 唔會令個頁隱藏；「畫面有冇郁」分唔開停冇停;
  test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生咗**。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress,context,home,read}.mjs`
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`；`online_utils.js` 加 lazy SDK
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`（Vite 單 chunk warning 未清）
- **MOBA**：`src/{assets,main}.js`＋`style.css`＋`index.html`、`tests/browser.mjs`、bump 腳本
- **Royale**：`src/{assets,main,sfx,net}.js`、`tests/{perf,leak}.mjs`＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209/226 波及五隻卡牌／棋類
- **Xiangqi**：`js/render.js`＋`index.html`（GL context 訊息、ONLINE 掣對比）＋`dist/`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。**十三把跨遊戲尺全綠**：
  `hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1、
  `hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、`hub-progress` 2/2、`hub-context` 3/3、
  `hub-home` 3/3、`hub-read` 3/3。Tower 三個 suite、`moba` 196/196、**royale `leak` 7/7**。
  Mutation 驗過廿四次，次次叫得出係邊個。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制，加咗兩個數）。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：`hub-read` 報咗但冇守（Hub 14 段、MOBA 16 段字細過 12px，設計決定）；
   ADR-227 個 DOM 洩漏 gate **淨係 Royale 有**，其餘遊戲同一形狀冇人守過；ADR-224 量到
   呢個容器**冇一隻遊戲收到 `webglcontextrestored`**，嗰條 gate 要真機先寫得到。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最
  大值」；`enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-
  blocking script**；**test server 一定要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗
  唔好自己叫 `restoreContext()`**（等於幫佢做咗佢要做嗰件事，拆走成個 handler 都報綠）。
