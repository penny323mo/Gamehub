# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 239
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 十七把跨遊戲尺；新增 `hub-pause` **6/6**。捉到 **Tower HUD 四粒掣用滑鼠全部撳唔郁**
（MOBA 暫停量到但未修，原因見下）

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-239（本輪）— 一粒滑鼠撳唔郁嘅掣，同一粒冇畫出嚟嘅掣分別唔大**

- 本來想量「走之前有冇交代」，**量完發現嗰條線冇病可以修**（局中每條離開路都喺暫停版／
  選單版）。**唔會為一條量唔到病嘅線砌尺。** 但撞到 Snake 個暫停面板寫住「按**空格鍵**
  繼續」——手機冇鍵盤。
- `hub-away` 守「你切走咗佢有冇自己停」；冇人問過**你想停嗰陣停唔停到**。量：
  Tower ✓／Racing ✓／**Snake ✗**（`isPaused` 得鍵盤）／**MOBA ✗**（`state.running`
  得 `visibilitychange`）。**機制有，路冇**——同 ADR-238 同一句。
- **真兇喺 Tower**：`#hud` 拖得郁，`pointerdown` 就 `setPointerCapture` → 滑鼠嘅
  `mouseup`／`click` 全部改派去 `#hud`，**`skip-prep`／`pause`／`speed`／`sound` 四粒
  全部係死嘅**。觸控唔受影響，而 Tower 啲 test 唔係 `tap()` 就係 `el.click()`——**兩種
  都繞過咗出事嗰條路**。capture 搬入 `beginDrag()`，move／up 搬去 `window`。
- **MOBA 嗰半做咗但唔出街**：三個位擺新掣三個都撞（窄畫面冇空角）→ 改成「開設定＝
  暫停」。跟住條 `普攻會真係揮動作` 間歇性紅（**baseline 兩跑 196/196，改完六跑八次紅**）
  ——`鎖差 -110` 即係條 check 一路同背景 rAF 主迴圈搶同一個 rig，郁下幀時序就撞中。
  **一個令現有 gate 唔穩嘅改動，同一個 bug 分別唔大**：整份還原，`hub-pause` 入面
  寫低佢係一個**講明咗嘅缺口**。
- 把尺自己又錯兩次：**「續」揀咗第一個中嘅元素**（Racing 真正嗰個係 `#resume-btn`）
  ——ADR-238 同一個坑；**Racing 開賽仲有倒數**，唔等個鐘郁就量＝靠彩數。

**ADR-238（已合埋 main）— 一個冇人知嘅 Continue，同冇 Continue 分別唔大**

- 續得返唔等於玩家知。量：Gomoku ✓／Xiangqi ✓／**Big Two ✗**／Dou Dizhu ✓——**同一批
  改動、同一個 pattern、四隻遊戲，一隻漏咗**。呢種漏冇 gate 永遠唔會發現。
- **個 selector 又錯一次**：探路寫 `'A, B'` 兩個一齊試，B 中咗所以報綠——**「邊個中就用
  邊個」會令你以為自己量緊第一個。**

**ADR-236／237（已合埋 main）— Big Two ＋ Dou Dizhu：牌類點存**

- 存**四家／三家手牌**（唔存續返之後電腦會攞新牌）；**`eval` 唔存**。鬥地主 `phase` 要存,
  **叫牌階段冇「輪返你」嗰個停點**。**條 check 本身要改**：本來逐隻讀自己嘅欄名，加到
  第三隻就撞線（`undefined > 0` 係 false，**明明啱嘅都報紅**）→ 統一成四個欄名。
- **呢條線做完**：由一隻擴到**五隻**；其餘存嘅係累積成績，冇「一局打到一半」。

**ADR-232 至 235（已合埋 main）— 兩個 tab；Gomoku ＋ Xiangqi 補返 Continue**

- 兩個 tab 各打完一局：Snake `gamesPlayed` 0 → 1 → **1** → `merge-save.mjs` 嘅 `改存檔()`：
  寫嗰陣先讀返。**兩次都修錯位**（Royale 真兇係 `markTutorialSeen()`、Snake 係 `login()`）
  ——**每個由記憶體快照出發嘅寫入都會蓋。估唔到就 dump。** storage key 運行時掃**七隻一個
  都冇寫** → 補靜態掃。**兩層一齊做先得出結論。**
- Continue：Gomoku 數 canvas 非背景像素，突變照樣過（嗰 300 個係**格線**）；Xiangqi 個盤
  係 3D，`getImageData` 全零，改影相之後**又揀錯對照**。**錯要向紅嗰邊錯。**
  3D 盤要**反用遊戲自己嘅 `Render.hitTest()`**；**driver 唔應該跟引擎實作漂移**。

**ADR-226 至 230（已合埋 main）— 洩漏／睇唔睇得清**

- 洩漏：GPU 三個數連開五局完全平（**我量咗一樣已經有人守嘅嘢**）；冇守嘅係 **DOM**。
  **「未冚到」同「冚唔到」係兩件事**。對比度：**把尺量咗四個版先啱**（gradient 令九個
  介面全跳過＝**量咗零樣嘢嘅綠**）。**每版都要親眼影低先信。**

**ADR-202 至 225（全部已合埋 main；詳情喺 DECISIONS，呢度只留會再撞到嘅教訓）**

- Tower 四輪（44×44／START 靜默→進度條／佈景斷咗／格 → **24×14**、HP → **0.0026**）。
  **`flow.mjs` 有三處寫死同一格。**
- 跨遊戲尺：`hub-touch`（24 個細掣）、`hub-load`（launcher **904 → 51 KB**）、`hub-cdn`
  （jsdelivr 吊 8 秒＝**DCL 一比一遲 8 秒**）、`hub-wait`（**件件平行落就要量位元組**）等。
  重量：Tower GLB → Draco **1,291 → 754 KB**、MOBA 拆資產 **16.0 → 12.7s**。
- 會再撞到嘅：classic script 頂層 `let`／`const` **唔會上 `window`**（`var`／函數先會）；
  test server 要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作真係發生咗**；
  **一個對照救返一個假綠**；**「未冚到」同「冚唔到」係兩件事**；教學遮罩開住嗰陣
  Royale 模擬係凍結嘅；`ghostRecorder.commit()` **等於自己驗自己**。

## Changed files

- **跨遊戲把尺（全新）**：`tests/hub-{touch,load,keyboard,cdn,wait,storage,away,audio,progress,context,home,read,leak,tabs,pause}.mjs`＋`tests/lib/drivers.mjs`（共用 driver）
- **shared（新）**：`byte-progress.mjs`、`safe-storage.js`、`merge-save.mjs`；`online_utils.js` 加 lazy SDK
- 本輪：`tower/src/ui/draggable.ts`、`snake-game/src/components/Game/Game.tsx`
  ＋`styles/Game.module.css`、兩個 `dist/`、新 `tests/hub-pause.mjs`（MOBA 嗰批已還原）
- **Tower**：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`configs/map.json`、
  `scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`、`dist/`／**MOBA**：`src/{assets,main,hud}.js`
  ＋`style.css`＋`index.html`、`tests/browser.mjs`、bump 腳本／**Royale**：`src/*.js`、`tests/{perf,leak}.mjs`
- **Snake**：`Game.tsx`＋`dist/`；六個 `index.html` 加 storage guard；ADR-209/226 波及五隻卡牌／棋類
  ／**Xiangqi** 另有 `js/render.js`；**Penny Crush**：`penny_crush.{js,css}`＋`index.html`

## Verification

- 本輪跑過：**`hub-pause` 6/6**、`hub` 96/96、`hub-touch` 5/5、`hub-away` 3/3、
  `hub-progress` 4/4、`hub-keyboard` 3/3、`hub-leak` 4/4、`hub-home` 3/3；Tower 全套
  （core 48、browser 十個 suite、render 25）逐個跑綠；`moba` 196/196（還原後）。
  Mutation 驗過三十七次。

## Known issues and cautions

- **要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f` 會撞到自己**；**做 mutation 要先 `cp`**。
- **呢個 container 一鬥資源就出假紅**：背景跑住 `moba` 嗰陣，`tower` 條 chain 報過
  「模型未預載就攞」同 `#start-btn` 撳唔到——單獨再跑全綠。**一次紅要單獨再跑先算數。**
- **開工前一定要 `--sync`**：試過冇 sync 就做，同 Codex 撞晒單，成輪報廢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：(a) MOBA 補暫停——碼寫過（開設定＝暫停），卡喺 `普攻會真係揮動作`
   同背景 rAF 搶 rig 嗰條 race，**要先修條 check（喺量之前停低主迴圈）再做**。
   (b) 其餘幾隻有冇同類「淨係喺某一種輸入先撳得到」嘅掣——`hub-touch` 全部用 tap,
   即係**成套尺由頭到尾冇用真滑鼠撳過任何嘢**。另：`hub-read` 報咗但冇守。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞最大值」;
  **Supabase SDK 唔好擺返落 HTML 做 parser-blocking**；**test server 要 gzip ＋ 送
  `Content-Length`**；**驗 context 掉咗唔好自己叫 `restoreContext()`**；**洩漏 gate 唔好淨係
  數全部節點**；**driver 唔好跟引擎內部次序**；**MOBA 唔好再試喺窄畫面另開一粒暫停掣**。
