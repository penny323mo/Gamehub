# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 232
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十五把跨遊戲尺全綠；新 `hub-tabs` 捉到兩隻遊戲「打咗兩局淨係記低一局」

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-232（本輪）— 兩個 tab：打咗兩局淨係記低一局**

- 上一輪粗掃「零 error、身分冇撞」**唔算數**——嗰把尺量緊「未有進度可以撞」嗰一刻。
- 兩個 tab 同時開住各打完一局：Snake `gamesPlayed` 0 → 1 → **1**、Royale `trophies`
  0 → 30 → **30**。**兩局變一局**——`localStorage` 成個 origin 共用，而兩隻都係
  「開場讀一次入記憶體，收場寫返成份出去」。
- 新 `games/shared/js/merge-save.mjs` 一個原語 `改存檔()`：寫嗰陣先讀返 storage。
- **兩次都修錯位**：①Royale 淨係改 `recordMatch` 一樣紅——真兇係第二個 tab 一入場叫
  `markTutorialSeen()`，個 `persist()` 已經蓋咗。②Snake 淨係改 `saveUserData` 一樣紅
  ——dump 咗 storage 先見到真兇係 **`login()`**（第二個 tab 掛載時 storage 仲空，
  `prev` 係 `{}`，一登入就抹晒）。**唔係得「睇落似會出事」嗰個寫入會蓋，係每一個由
  記憶體快照出發嘅都會蓋。估唔到就 dump，唔好對住碼再估一次。**
- Tower／MOBA／Racing Car **特登唔掃**（checkpoint／上次揀邊個／最快幽靈，last-write-wins
  係設計）——例外連理由一齊寫入把尺。`tests/hub-tabs.mjs` 4/4（兩條對照 ＋ 正題 ＋ 零
  error）；driver 抽咗去 `tests/lib/drivers.mjs` 同 `hub-progress` 共用。突變報紅。

**ADR-227 至 230（已合埋 main）— 洩漏：GPU 守咗 DOM 冇；一隻守咗其餘八隻冇**

- GPU 三個數連開五局完全平（`royale/tests/leak.mjs` 一直守住，**我量咗一樣已經有人
  守嘅嘢**）。佢冇守嘅係 **DOM**：一局爬一個 jsdelivr `<script>`——重試唔拆走上一個,
  **網絡差＝重試多＝爬得快**。新 `tests/hub-leak.mjs` 由一隻擴到九隻。
- 四個「把尺講緊自己」：大廳 id／全域名唔同令兩隻報「完全平」（**「先證明循環真係
  行過」條 check 第一次跑就捉到**）；`.gh-toast` 顯示緊唔算洩漏；**撳掣同撳 Enter 唔同**；
  **唔好拎兩個唔同狀態嘅數嚟比**。230：MOBA 收場係 `location.reload()`，**結構上唔可能
  跨局積 DOM**——**「未冚到」同「冚唔到」係兩件事**。

**ADR-226（已合埋 main）— 睇唔睇得清：五個主要行動掣跌穿 WCAG AA**

- **把尺量咗四個版先啱**（gradient 令九個介面全跳過再報「零問題」＝**量咗零樣嘢嘅綠**；
  框內眾數做底令細框報假紅；純 emoji 假紅；**喺 layout 入面唔等於畫得出嚟**）。
  **每版都要親眼影低先信。** 真嘢：Big Two／Dou Dizhu「線上對戰」**2.39 → 5.61**、
  MOBA「開打」**4.90／6.45**、Xiangqi **4.98**。字體大細**只報唔守**。`hub-read` 3/3。

**ADR-224／225（已合埋 main）— GL context 掉咗／返得返去**

- 224：交代方面**得 Xiangqi AI 乜都冇**；五個「尺講緊自己」，一個係**我幫咗佢還原**
  （自己叫 `restoreContext()`，拆走 Tower 成個 handler 都報綠）。225：守咗**入去**十三條路，
  **冇人守過出返嚟**，**得 MOBA 一條都冇**；四個尺錯（掃唔到 `onclick`、**撳第一個唔等於
  撳啱**、撞中副標題、timeout 掃唔到分階段介面）。兩條 gate 各 3/3。

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ START 靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠嗰陣斷咗** ／
  格 → **24×14**、路 → **37 格 10 彎**、HP → **0.0026**。**`flow.mjs` 有三處寫死同一格**。
- 四把跨遊戲尺：`hub-touch`（八個介面 24 個細掣）、`hub-load`（launcher **904 → 51 KB**）、
  `hub-keyboard`（**本來就啱**）、`hub-cdn`（jsdelivr 吊 8 秒＝**DCL 一比一遲 8 秒**）。記低：
  classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，擺完佔位就自己指自己。

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

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。**十四把跨遊戲尺全綠**：
  `hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1、
  `hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、`hub-progress` 2/2、`hub-context` 3/3、
  `hub-home` 3/3、`hub-read` 3/3、`hub-leak` 4/4、**`hub-tabs` 4/4**；Tower 三 suite、`moba` 196/196、royale `leak` 7/7。Mutation 驗過廿六次。`touch/load/keyboard/cdn/wait` 五把喺 synced tree 重跑過。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制）。**開工前一定要 `--sync`**：呢一輪我冇 sync 就做，MOBA 拆批同 Codex ADR-213 撞晒單，成輪報廢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：兩個 tab 條線做完（ADR-232）。仲未量過嘅：**同一個 tab 開兩隻遊戲嘅
   storage 互撞**（key 前綴撞唔撞）；`hub-read` 報咗但冇守；ADR-224 呢個容器冇遊戲
   收到 `webglcontextrestored`，要真機先寫得到。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  `enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-blocking**;
  **test server 要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**;
  **洩漏 gate 唔好淨係數全部節點**（顯示緊嘅 toast 唔係洩漏）。
