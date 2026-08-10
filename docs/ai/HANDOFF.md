# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 229
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十四把跨遊戲尺全綠；洩漏線由 Royale 一隻擴到八隻（`hub-leak`；MOBA 未冚，有寫低）

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-227／228／229（本輪）— 洩漏：GPU 守咗 DOM 冇；一隻守咗其餘七隻冇**

- 227：GPU 三個數連開五局**完全平**——`royale/tests/leak.mjs`（ADR-008）一直守住,
  **我量咗一樣已經有人守嘅嘢**。佢冇守嘅係 **DOM**：一局爬一個 `<script>`（jsdelivr
  supabase SDK）。`loadSdk()` 攞唔到重設 promise 再試，**但上次嗰個 element 冇拆走**
  ——**網絡差＝重試多＝爬得快**。共用 `loadSupabaseSdk()`（ADR-209 我寫，六隻用）同一
  pattern，兩邊一齊修。**條 gate 擺錯位會扮成守緊嘢**：第一版加落現有 loop 突變照樣報綠
  ——嗰個 loop 唔經選單。**唔行玩家條路嘅 gate，守唔到玩家撞到嘅嘢。**
- 228：新 `tests/hub-leak.mjs` 補五隻卡牌／棋類（循環「入線上大廳 → 返選單」，**要擋走
  第三方**先量到重試）。三個「把尺講緊自己」：①Snooker 大廳係 `#snooker-online-lobby`、
  Big Two 全域叫 `setMode`（Dou Dizhu 先係 `setGameMode`）——兩隻報「完全平」因為冇入過
  大廳，**「先證明循環真係行過」條 check 第一次跑就捉到**；②`.gh-toast` 顯示 3.5 秒而一圈
  1.2 秒——**顯示緊嘅提示唔係洩漏**，剔走佢但另加「≤ MAX_TOASTS」；③叫全域函數唔撳掣。
- 229：再補 Tower（說明面板開／閂）、Racing Car（日夜切換，會重建燈光）、Snake（撞牆死
  → Enter 重開）。**MOBA 冇平嘅循環（HUD 淨係局中有），冇冚到就寫低，唔扮冚到。**
  兩個新教訓：**撳個掣同撳 Enter 唔同**（Snake 個遮罩撳掣唔會走，於是隻蛇冇再郁過而四圈
  都報「死到」）；**唔好拎兩個唔同狀態嘅數嚟比**（565／561 上落係「有冇遮罩」，唔係洩漏）
  → 改成**只喺確認咗狀態嗰陣先取樣**，再加「取樣 ≥ 3」。8 隻全平，突變報
  `[323,324,325,326,327]`。

**ADR-226（已合埋 main）— 睇唔睇得清：五個主要行動掣跌穿 WCAG AA**

- **把尺量咗四個版先啱**：①computed style 搵底色、有 `background-image` 就跳過——body 一個
  gradient 令九個介面 100% 跳過再報「零問題」，**一個量咗零樣嘢得出嚟嘅綠**；②改量真像素
  但攞框內眾數做底——細框入面**字本身先係眾數**，Tower 報 35 個假紅；③純 emoji 假紅；
  ④**喺 layout 入面唔等於畫得出嚟**。**每版都要親眼影低先信。**
- 真嘢：Big Two／Dou Dizhu「線上對戰」**2.39 → 5.61**；MOBA「開打」→ **4.90／6.45**；Xiangqi
  「ONLINE 對戰」→ **4.98**；MOBA 角色標籤向白拉三成（**英雄色本身唔郁**）。**字體大細只報
  唔守**（Hub 14、MOBA 16）。`hub-read.mjs` 3/3，另有兩條「唔畀自己扮綠」。

**ADR-224／225（已合埋 main）— GL context 掉咗／返得返去**

- 224：交代方面**得 Xiangqi AI 乜都冇**。五個「把尺講緊自己」，其中一個係**我幫咗佢還原**
  （自己叫 `restoreContext()`，於是拆走 Tower 成個 handler 都報綠）。225：`hub.mjs` 守咗**入去**
  十三條路，**冇人守過出返嚟**；**得 MOBA 一條都冇**。四個「把尺講緊自己」：掃屬性掃唔到
  `onclick`、**撳第一個唔等於撳啱**、`getByText` 撞中副標題、一個 timeout 掃唔到分階段介面。
  **一條指住唔存在檔案嘅鏈，睇落一樣好地地**。兩條 gate 各 3/3。

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠嗰陣斷咗**
  ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。**`flow.mjs` 有三處寫死同一格**。
- 四把跨遊戲尺：`hub-touch`（捉到八個介面共 24 個細掣）、`hub-load`（launcher **904 → 51 KB**）、
  `hub-keyboard`（**十二個介面本來就啱**）、`hub-cdn`（jsdelivr SDK 吊 8 秒＝**DCL 8.0–8.4s，
  一比一**）。記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，
  擺完佔位 `window.x = x` 就自己指自己。

**ADR-219 至 223（已合埋 main）— 聲／流暢度／draw-call／鏡頭偶發／進度記憶**

- 219：**Royale 個靜音一個字都冇存**；**一個對照救返一個假綠**。220：幀時間量法**喺佢最
  有用嗰個 case 失效**——**同一個外部取樣點喺三種 loop 結構下面有三個意思**。221：Royale
  draw call **個數本來係假嘅**（composer 尾 pass 係全屏 quad → 讀到 1）；**上限 650 ＋ 下限
  50**。222：鏡頭偶發**重現唔到**——**交付品係「下次唔使由零估」**。223：generic 掃法係
  **掃唔夠**；坑：**教學遮罩開住嗰陣 Royale 嘅模擬係凍結嘅**、`ghostRecorder.commit()`
  **等於自己驗自己**。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s，根因係**進度單位揀錯**
  → `byte-progress.mjs` 量位元組；冇 `Content-Length` 就報 `null`，**唔報假嘅 0%**。**重量**
  （211–213）：Tower GLB → Draco **1,291 → 754 KB**；MOBA 拆資產 **16.0 → 12.7s**；Royale
  量完**決定唔改**。**切走就停**（216–218）：連 Snake 三隻補齊 `visibilitychange`。
- **cache-bust／storage**（214/215）：bump regex 冚唔到共用層 → **改網唔改一個位**；封住
  storage 之後 Racing Car 51 → 0 → 新 `safe-storage.js`。**要改嘅係枱面。量法通用教訓**：
  「畫面有冇郁」分唔開停冇停；test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先
  證明個動作真係發生咗**。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress,context,home,read,leak}.mjs`
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`；`online_utils.js` 加 lazy SDK
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`／**MOBA**：`src/{assets,main}.js`
  ＋`style.css`＋`index.html`、`tests/browser.mjs`、bump 腳本
- **Royale**：`src/{assets,main,sfx,net}.js`、`tests/{perf,leak}.mjs`＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209/226 波及五隻卡牌／棋類
  ／**Xiangqi**：`js/render.js`＋`index.html`（GL context 訊息、ONLINE 掣對比）＋`dist/`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。**十三把跨遊戲尺全綠**：
  `hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1、
  `hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、`hub-progress` 2/2、`hub-context` 3/3、
  `hub-home` 3/3、`hub-read` 3/3、**`hub-leak` 4/4**。Tower 三個 suite、`moba` 196/196、royale `leak` 7/7。
  Mutation 驗過廿六次，次次叫得出係邊個。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制，加咗兩個數）。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：`hub-read` 報咗但冇守（Hub 14 段、MOBA 16 段字細過 12px，設計決定）；
   洩漏線冚 8 隻；**淨返 MOBA**（HUD／商店淨係局中有，要打完一場先有循環）。
   ADR-224：呢個容器**冇一隻遊戲收到 `webglcontextrestored`**，嗰條 gate 要真機先寫得到。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  `enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-blocking**;
  **test server 要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**;
  **洩漏 gate 唔好淨係數全部節點**（顯示緊嘅 toast 唔係洩漏）。
