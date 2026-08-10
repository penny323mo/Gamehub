# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 237
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十六把跨遊戲尺全綠；「打到一半走咗仲喺度」由一隻擴到五隻，`hub-progress` 十隻 3/3

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-237（本輪）— Dou Dizhu 補返 Continue：存檔要分得清「叫緊」同「打緊」**

- 鬥地主同大老二同族但**多一層叫地主階段**，所以 `phase` 要存，兩個階段各自嘅嘢都要存：
  叫緊要 `bid`（邊個開始／輪到邊個／邊個叫咗／搶幾多次／邊個 pass）；打緊要 `landlord`／
  `bottom`（三張底牌）／`lastPlay`／`passes`。三家手牌全部存（連兩個電腦）。
  `lastPlay.eval` 同 `state.ui` 唔存（`Set` JSON 化唔到，「揀緊邊幾張」唔應該跨 session）。
- **叫牌階段冇「輪返你」嗰個停點**（三家輪流，中間可能連續兩個 CPU，叫完可能即刻
  入局）→ 叫牌階段**每一步都存**（`advanceBid()` 尾）；打牌階段照舊三個停點。
- driver 唔試打到出牌先量：**叫緊本身就係一個值得記嘅局面**，而且存檔嘅重點正正
  係兩個階段分得清。叫／搶／唔叫邊個撳得就撳邊個——**三個都係真嘅玩家動作**,
  唔使喺測試度揀「最合理」嗰個（嗰樣等於抄一次策略）。
- **呢條線做完**：由 Tower 一隻擴到**五隻**（＋Gomoku／Xiangqi／Big Two／Dou Dizhu）。其餘
  唔使——Snake／Racing Car／Royale／MOBA／Penny Crush 存嘅係累積成績，冇「一局打到一半」
  呢個概念；Snooker 3D 冇單機局面可存。

**ADR-236（已合埋 main）— Big Two 補返 Continue ＋ 一條「每加一隻就要改一次」嘅 check**

- 牌類要存**四家手牌**（連電腦嗰三家——唔存嘅話續返之後電腦會攞新牌，你面前嗰局變咗
  另一局）。**`table.eval` 唔存**（`evalHand()` 計得返；存住就兩份真相）。
- driver：十三張牌互相疊住，撳第一張嘅中心點畀隔籬張遮住 → timeout。解法唔係
  `force: true`（等於承認撳唔中都照撳），而係**用返遊戲自己個「提示」掣**。
- **條 check 本身要改**：本來逐隻遊戲讀自己嘅欄名，加到第三隻就撞線（`undefined > 0`
  係 false，**明明啱嘅都報紅**）。**一條要跟住遊戲改名嘅 check，每加一隻就要改一次,
  遲早有一次改漏。** 統一成四樣：`畫面`／`對得上`（遊戲狀態＝存檔）／`量`／`畫面證據`
  （2D 比像素・WebGL 影相・牌類數 DOM）。三種證據同一個欄名。

**ADR-234／235（已合埋 main）— Gomoku ＋ Xiangqi 補返 Continue**

- 「打完記唔記得成績」同「打到一半走咗算唔算數」係兩條問題。實測四隻人機落幾手再
  refresh：**全部返咗選單、冇存過、冇提示**（手機切走 app 個 tab 畀回收，一樣——**唔係
  「你自己揀走」**）。Tower 早就有 Continue。**答案：漏咗。**
- `hub-progress` 加第三條：**「留得住」唔等於「返得到」**。量咗幾個版先啱——Gomoku 數成塊
  canvas 嘅非背景像素，突變照樣過（嗰 300 個係**格線**）；Xiangqi 個盤係 3D，`getImageData`
  全零，改影相之後**又揀錯對照**（撳之前仲喺選單）→ 最後揀「續返嘅局面 vs 開局盤」。
  **錯要向紅嗰邊錯。** 記低：3D 盤要**反用遊戲自己嘅 `Render.hitTest()`**；
  **driver 唔應該跟住引擎嘅實作漂移**。

**ADR-232／233（已合埋 main）— 兩個 tab；一個 origin 十三隻遊戲**

- 兩個 tab 各打完一局：Snake `gamesPlayed` 0 → 1 → **1**、Royale `trophies` 0 → 30 → **30** →
  新 `shared/js/merge-save.mjs` 嘅 `改存檔()`：寫嗰陣先讀返。**兩次都修錯位**（Royale 真兇係
  `markTutorialSeen()`、Snake 真兇係 `login()`）——**每一個由記憶體快照出發嘅寫入都會蓋。
  估唔到就 dump。** storage key：運行時掃**七隻一個都冇寫**（掃唔夠）→ 補靜態掃，**零撞**。
  **兩層一齊做先得出結論。** 順帶捉到 **Penny Crush 冇掂過 storage 但佢有分數** → 加咗最高分。

**ADR-226 至 230（已合埋 main）— 洩漏／睇唔睇得清**

- 洩漏：GPU 三個數連開五局完全平（**我量咗一樣已經有人守嘅嘢**）；冇守嘅係 **DOM**：一局
  爬一個 jsdelivr `<script>`（**網絡差＝重試多＝爬得快**）。`hub-leak` 一隻擴到九隻。
  MOBA 收場係 `location.reload()`——**「未冚到」同「冚唔到」係兩件事**。
- 對比度：**把尺量咗四個版先啱**（gradient 令九個介面全跳過＝**量咗零樣嘢嘅綠**；框內眾數
  做底令細框假紅；純 emoji 假紅；**喺 layout 入面唔等於畫得出嚟**）。**每版都要親眼影低先信。**
  真嘢：Big Two／Dou Dizhu **2.39 → 5.61**、MOBA **4.90／6.45**、Xiangqi **4.98**。

**ADR-202 至 225（全部已合埋 main；詳情喺 DECISIONS，呢度只留會再撞到嘅教訓）**

- Tower 四輪（44×44／START 靜默→進度條＋防重入／佈景喺你最想望遠嗰陣斷咗／格 →
  **24×14**、HP → **0.0026**）。**`flow.mjs` 有三處寫死同一格。**
- 跨遊戲尺：`hub-touch`（八個介面 24 個細掣）、`hub-load`（launcher **904 → 51 KB**）、
  `hub-keyboard`（**本來就啱**）、`hub-cdn`（jsdelivr 吊 8 秒＝**DCL 一比一遲 8 秒**）、
  `hub-wait`（進度單位揀錯：件數而件件平行落 → 量位元組）、`hub-away`／`hub-audio`／
  `hub-context`／`hub-home`／`hub-storage`／`hub-leak`。重量：Tower GLB → Draco
  **1,291 → 754 KB**、MOBA 拆資產 **16.0 → 12.7s**、Royale 量完**決定唔改**。
- 會再撞到嘅：classic script 頂層 `let`／`const` **唔會上 `window`**（`var`／函數先會）；
  test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生咗**；
  **一個對照救返一個假綠**；**「未冚到」同「冚唔到」係兩件事**；教學遮罩開住嗰陣
  Royale 模擬係凍結嘅；`ghostRecorder.commit()` **等於自己驗自己**。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress,context,home,read,leak,tabs}.mjs`＋`tests/lib/drivers.mjs`（共用 driver）
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`、`merge-save.mjs`；`online_utils.js` 加 lazy SDK
- 本輪：`gomoku/js/*`、`xiangqi-ai/js/{main,app}.js`＋兩個 `index.html`（Continue 掣）＋`dist/`
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`／**MOBA**：`src/{assets,main}.js`
  ＋`style.css`＋`index.html`、`tests/browser.mjs`、bump 腳本／**Royale**：`src/{assets,main,sfx,net,storage}.js`、`tests/{perf,leak}.mjs`＋`run-all.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209/226 波及五隻卡牌／棋類
  ／**Xiangqi** 另有 `js/render.js`（GL context 訊息、ONLINE 掣對比）；**Penny Crush**：`penny_crush.{js,css}`＋`index.html`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。**十六把跨遊戲尺全綠**：
  `hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1、
  `hub-storage` 2/2、`hub-away` 3/3、`hub-audio` 3/3、**`hub-progress` 3/3（八隻）**、`hub-context` 3/3、
  `hub-home` 3/3、`hub-read` 3/3、`hub-leak` 4/4、`hub-tabs` 4/4；Tower 三 suite、`moba` 196/196、royale `leak` 7/7。Mutation 驗過三十次，次次叫得出係邊個。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制）。**開工前一定要 `--sync`**：呢一輪我冇 sync 就做，MOBA 拆批同 Codex ADR-213 撞晒單，成輪報廢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：「打到一半」條線做完（ADR-234–237）。仲未量過嘅：**離開之前有冇交代**
   ——五隻續得到嘅遊戲，玩家撳「返回大廳」／關 tab 之前，冇一隻講過「你嗰局仲喺度」。
   另：`hub-read` 報咗但冇守；ADR-224 冇遊戲收到 restored。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  `enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-blocking**；**test
  server 要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**；**洩漏
  gate 唔好淨係數全部節點**（顯示緊嘅 toast 唔係洩漏）；**driver 唔好跟引擎內部次序**。
