# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 236
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十六把跨遊戲尺全綠；Gomoku／Xiangqi／Big Two 補返 Continue，`hub-progress` 九隻 3/3

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-236（本輪）— Big Two 補返 Continue ＋ 一條「每加一隻就要改一次」嘅 check**

- 牌類唔可以淨係存個盤：要存**四家手牌**（連電腦嗰三家——唔存嘅話續返之後
  電腦會攞新牌，你面前嗰局變咗另一局）、輪到邊個、檯面嗰手同邊個出、邊個 pass、
  要唔要含方塊三。**`table.eval` 唔存**（`evalHand()` 計得返；存住就兩份真相,
  改咗規則之後舊存檔會靜靜雞用返舊嗰套）。
- driver：十三張牌互相疊住，撳第一張嘅中心點畀隔籬張遮住 → timeout。解法唔係
  `force: true`（等於承認撳唔中都照撳），而係**用返遊戲自己個「提示」掣**揀一手
  合法牌再出，揀唔到就 pass。**唔喺測試度抄一次大老二規則**——抄一次就係自己驗自己。
- **條 check 本身要改**：第三條本來逐隻遊戲讀自己嘅欄名，加到第三隻就撞線——Big Two
  冇 `盤上幾多隻`，`undefined > 0` 係 false，**明明啱嘅都報紅**。**一條要跟住遊戲改名嘅
  check，每加一隻遊戲就要改一次，遲早有一次改漏。** 統一成四樣：`畫面`／`對得上`
  （遊戲狀態＝存檔）／`量`／`畫面證據`（2D 比像素・WebGL 影相・牌類數 DOM）。
- 突變（唔倒返四家手牌）四樣入面三樣一齊倒。**仲爭 Dou Dizhu**（同族但多一層叫地主
  階段 ＋ 底牌，存檔要分得清「叫緊」同「打緊」）。

**ADR-234／235（已合埋 main）— 打到一半走咗：Gomoku ＋ Xiangqi 補返 Continue**

- 「打完記唔記得成績」同「打到一半走咗算唔算數」係兩條問題。實測四隻人機落幾手再
  refresh：**全部返咗選單、冇存過、冇提示**（手機切走 app 個 tab 畀回收，一樣——**唔係
  「你自己揀走」**）。Tower 早就有 Continue。**答案：漏咗。** 兩隻都係每落一手就存、
  讀返逐格驗、Continue **唔會靜靜雞幫你續**、續返輪到 AI 就要叫佢行。
- `hub-progress` 加第三條：**「留得住」唔等於「返得到」**。量咗幾個版先啱——Gomoku 數
  成塊 canvas 嘅非背景像素，突變照樣過（嗰 300 個係**格線**）；Xiangqi 個盤係 3D,
  `getImageData` 全零（WebGL 冇 `preserveDrawingBuffer`），改影相之後**又揀錯對照**
  （撳之前仲喺選單）→ 最後揀「續返嘅局面 vs 開局盤」。**錯要向紅嗰邊錯。**
- 記低：3D 盤要**反用遊戲自己嘅 `Render.hitTest()`** 反查「格 → 螢幕點」；
  **driver 唔應該跟住引擎嘅實作漂移**（行邊步棋寫死，唔用 `generateLegalMoves()[0]`）。

**ADR-232／233（已合埋 main）— 兩個 tab；一個 origin 十三隻遊戲**

- 兩個 tab 各打完一局：Snake `gamesPlayed` 0 → 1 → **1**、Royale `trophies` 0 → 30 → **30**
  → 新 `shared/js/merge-save.mjs` 嘅 `改存檔()`：寫嗰陣先讀返。**兩次都修錯位**（Royale
  真兇係 `markTutorialSeen()`、Snake 真兇係 `login()`）——**每一個由記憶體快照出發嘅寫入
  都會蓋。估唔到就 dump。** Tower／MOBA／Racing Car 特登唔掃。
- storage key：運行時掃**七隻一個都冇寫**（掃唔夠）→ 補靜態掃，每隻都有自己前綴，
  **零撞**。**兩層一齊做先得出結論。** 順帶捉到 **Penny Crush 冇掂過 storage 但佢有分數**
  → 加咗最高分。**個 driver 第一版係擲毫**（隨機撳兩格等消）→ 改成由格陣計出一步真係
  消得到嘅棋再撳真兩格。

**ADR-227 至 230（已合埋 main）— 洩漏：GPU 守咗 DOM 冇**

- GPU 三個數連開五局完全平（**我量咗一樣已經有人守嘅嘢**）；冇守嘅係 **DOM**：一局爬
  一個 jsdelivr `<script>`（**網絡差＝重試多＝爬得快**）。`tests/hub-leak.mjs` 一隻擴到九隻。
  四個尺錯：大廳 id／全域名唔同令兩隻報「完全平」、顯示緊嘅 toast 唔算洩漏、**撳掣同撳
  Enter 唔同**、**唔好拎兩個唔同狀態嘅數嚟比**。230：MOBA 收場係 `location.reload()`
  ——**「未冚到」同「冚唔到」係兩件事**。

**ADR-226（已合埋 main）— 睇唔睇得清：五個主要行動掣跌穿 WCAG AA**

- **把尺量咗四個版先啱**（gradient 令九個介面全跳過＝**量咗零樣嘢嘅綠**；框內眾數做底
  令細框假紅；純 emoji 假紅；**喺 layout 入面唔等於畫得出嚟**）。**每版都要親眼影低先信。**
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
2. **接手位**：Dou Dizhu 補返「打到一半走咗仲喺度」——同 Big Two 同族（做法抄 ADR-236）
   但多一層**叫地主階段 ＋ 三張底牌**，存檔要分得清「叫緊」同「打緊」。
   另：`hub-read` 報咗但冇守；ADR-224 冇遊戲收到 restored。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  `enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-blocking**；**test
  server 要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**；**洩漏
  gate 唔好淨係數全部節點**（顯示緊嘅 toast 唔係洩漏）；**driver 唔好跟引擎內部次序**。
