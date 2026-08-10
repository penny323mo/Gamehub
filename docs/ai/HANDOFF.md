# Current cross-agent handoff

Updated: 2026-08-10 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 234
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十五把跨遊戲尺全綠；Gomoku 補返 Continue，`hub-progress` 由兩條變三條

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-234（本輪）— 落咗三十手一 refresh 就冇晒：Gomoku 補返 Continue**

- 先答上一輪嗰條：「打完記唔記得成績」同「打到一半走咗算唔算數」係兩條問題。
  實測四隻（Gomoku／Big Two／Dou Dizhu／Xiangqi）人機落幾手再 refresh：**全部返咗
  選單、冇存過、冇任何提示**。手機上面切走 app 個 tab 畀系統回收，效果一樣
  ——**唔係「你自己揀走」**。Tower 早就有 checkpoint ＋ Continue。**答案：漏咗。**
- 做咗 Gomoku（狀態最深、最簡單）：`gomoku_ai_run_v1`，**每落一手就存**；覆蓋式
  （同 Tower checkpoint 一樣喺 ADR-232 個「特登 last-write-wins」名單）；讀返逐格驗
  （壞存檔要當冇）；「繼續上一局」掣**唔會靜靜雞幫你續**；續返之後如果輪到 AI
  要叫佢行，否則個盤永遠等你落一隻唔到你落嘅棋。
- `hub-progress` 加第三條：**「留得住」唔等於「返得到」**。條 check 量咗兩個版：
  第一版數成塊 canvas 嘅非背景像素——突變照樣過，因為嗰 300 個係**格線**。
  改成拎「有棋格」同「空格」比色差。**錯要向紅嗰邊錯。**
- 順帶：第一次嘅突變**根本冇突變到**——`createBoardUI` 已經由 `board` 整幅畫返,
  我喺 `continueGame` 逐格叫 `placeStoneUI` 係多餘（畫足 226 次同一幅嘢），剷咗。
- Big Two／Dou Dizhu／Xiangqi 同形狀，量度寫咗喺 ADR-234，逐隻要自己一輪。

**ADR-233（已合埋 main）— 一個 origin 十三隻遊戲：key 冇撞，但捉到一隻乜都唔記得**

- 運行時掃**七隻一個 key 都冇寫**（掃唔夠）→ 補靜態掃：每隻都有自己前綴，**零撞**。
  **兩層一齊做先得出結論。** 真正捉到嘅：**Penny Crush 冇掂過 storage 但佢有分數**
  ——加咗逐個板大細分開記嘅最高分，破紀錄嗰刻就寫，用 `改存檔()` 所以兩個 tab 唔互食。
- **個 driver 第一版係擲毫**（隨機撳兩格等消）→ 改成由格陣計出一步真係消得到嘅棋,
  再照樣撳真嗰兩格。要開 seam：`const PennyCrush` 喺 classic script **唔會上 `window`**。

**ADR-232（已合埋 main）— 兩個 tab：打咗兩局淨係記低一局**

- 兩個 tab 各打完一局：Snake `gamesPlayed` 0 → 1 → **1**、Royale `trophies` 0 → 30 → **30**
  → 新 `shared/js/merge-save.mjs` 嘅 `改存檔()`：寫嗰陣先讀返。**兩次都修錯位**：Royale
  真兇係 `markTutorialSeen()`、Snake 真兇係 `login()`。**每一個由記憶體快照出發嘅寫入
  都會蓋。估唔到就 dump。** Tower／MOBA／Racing Car 特登唔掃（設計上就係最後一次）。

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
- 本輪：`games/gomoku/js/{core,app,input,ai,renderer}.js`＋`index.html`（Continue）
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
  `hub-home` 3/3、`hub-read` 3/3、`hub-leak` 4/4、`hub-tabs` 4/4；`hub-progress` **3/3**、七隻；Tower 三 suite、`moba` 196/196、royale `leak` 7/7。Mutation 驗過廿六次。`touch/load/keyboard/cdn/wait` 五把喺 synced tree 重跑過。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。`moba` 條 `玩家企喺畫面下半…` 曾經五跑兩紅（ADR-222 封咗佢指住嗰個機制）。**開工前一定要 `--sync`**：呢一輪我冇 sync 就做，MOBA 拆批同 Codex ADR-213 撞晒單，成輪報廢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：Big Two／Dou Dizhu／Xiangqi 補返「打到一半走咗仲喺度」——同 Gomoku
   同形狀，做法照抄 ADR-234（存邊啲／幾時存／點驗／Continue 點出），但每隻嘅局面狀態
   唔同，逐隻要自己一輪。另：`hub-read` 報咗但冇守；ADR-224 冇遊戲收到 restored。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  `enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做 parser-blocking**;
  **test server 要 gzip ＋ 送 `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**;
  **洩漏 gate 唔好淨係數全部節點**（顯示緊嘅 toast 唔係洩漏）。
