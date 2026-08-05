# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Elden Ring II 重開會起一道隱形牆 (ADR-156)；**MOBA balance 仍然紅**

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Elden Ring II：重開會喺圓場正中起一道隱形牆 (ADR-156)

- 改咗咁多狀態但由頭到尾冇試過 `restart()`。霧門個 collider 寫咗**兩次**——一次開場、一次 `restart()`；
  ADR-154 搬霧門嗰陣只改到第一個。死一次撳 R，圓場正中就多返一道 **8 米隱形牆**（畫出嚟嗰道喺另一個
  位、闊 11.2 米）。一件事寫兩次就有兩個答案，今個 session 第三次（ADR-144／151）。而家位置尺寸係一個
  module 層 `FOG_GATE`，一個 `makeFogGateBody()` 兩邊共用。
- **條 gate 加強咗兩次先捉到，兩次都係突變揭穿。** 第一版：打到第二波死、撳 R、比較霧門——綠嘅，因為
  `restart()` 只喺 `if (!bossGateBody)` 先重建，而個 body 淨係喺 boss 解鎖時先變 null，即係未打到 boss
  就死根本行唔到嗰條錯 line。**所以修法都要係結構性嘅**：`restart()` 一律拆走再重建，兩種死法行同一條
  路——一條只有一種路徑到得到嘅分支，冇一個測試到得到。第二版：仲係綠，因為條檢查數嘅係**標住**
  `fog-gate` 嗰啲，而流浪牆冇 tag。而家比較成套靜態幾何，響，仲報返 `0.00,-9.00,4,0.36`。
- 將 restart 改成無條件之後照出第三個缺陷，喺我自己支尺度：`staticBoxes` 只加唔減——`removeBody` 拆走
  個 body 但條記錄仲喺，即係拆咗嘅霧門喺連通性 gate 眼中仲係一堵牆，重建就變兩堵。而家有
  `removeStaticBox()`。**呢個係今個 session 第七次「綠得唔啱理由」，七次認出佢嘅方法都一樣：跑突變。**
- 條套件而家真係會玩：企定唔郁畀雜兵打死，再撳 R。

### 上一輪：時鐘／弧線／撲擊／路標／北面聖所 (ADR-150–155)

- **兩把鐘 (ADR-150)**：`now` 係原始 `performance.now()`（戰鬥計時器掛喺佢度），而 `delta` 夾住 0.05
  秒（郁動／物理／動畫用）。代價係**跌穿 20 fps 之後郁動慢過真實時間而戰鬥計時器唔會**——部機愈跟唔
  上，遊戲對玩家愈唔公平。CPU 節流實測每秒郁動時間出手 **1× 2.33、6× 2.90**，而常數寫住最多 0.71/秒
  ——即係**三到四倍**。條 gate 釘喺**常數**唔係另一次量度（兩次可以一齊錯）。
- **揮擊弧線畫緊另一把刀 (ADR-151)**：弧線半徑 1.1–2.0 米跨 **243°**，判定係向前 **4.4 米**錐角
  **33°**——**收埋一半以上射程**，**角度多報十四倍**。而家由判定嗰組常數計出。
- **Boss 第二階段本來只係數字大咗 (ADR-152)**：而家開**撲擊**，**預警圈畫喺落點唔係畫喺 boss 身上**
  ——退後唔再自動安全。**目標喺六十米外冇嘢指住 (ADR-153)**：超過 25 米亮光柱，**兩個方向都守**。
- **霧門開咗之後通去嘅係同一塊地 (ADR-154)**：boss 本來喺同一個圓場入面。而家北面有 11.2 米走廊同半徑
  20 嘅聖所（暖紅光同圓場冷藍分開）。條連通性 gate 第一版用門檻 `z > -24` 分霧門同真牆，而圓場牆喺
  -22.35 一樣過——**一條門檻分唔開兩件企喺同一個位嘅嘢**，改用 tag。
- **三個場互相畀緊對方嘅燈錢 (ADR-155)**：兩盞分區補光設咗 `distance` 34／42，超過貢獻零，但 three.js
  照樣放入 shader 燈迴圈。熄咗實測 **2.0 → 2.3 fps** 而 draw call 冇變。而家遠過燈自己個 `distance`
  就熄，門檻**由燈自己讀出嚟**。
- 揀招、亮唔亮柱都抽成 **module 層純函數**：headless 要打到 boss／第三關等於要贏晒場，一條要贏咗先量
  到嘢嘅 gate 冇人會跑。自己更正：`Space` 係碌唔係攻擊，碌咗四十次差啲記低「攻擊打唔中」做缺陷。

### 更早：ER2 起支尺、開西面、MOBA 兩單嘢 (ADR-145–149)

- ER2 之前淨係有「啲檔在唔在」嘅測試。`tests/hud-layout.mjs` 用真瀏覽器量矩形，即刻捉到 `.player-hud`
  用寫死嘅 `top`（91／63／45），而上面品牌字係 `clamp(20px, 2vw, 30px)`——高度跟**闊度**變，兩套斷點
  喺 **844×390（iPhone 14 打橫）**夾唔埋。
- 地圖本來得一個半徑 22.35 圓場。西面開門、走廊、庭院，用**三個一直 ship 咗但一格都冇出現過**嘅模型。
  **次序一開始錯咗，係量度改返正**：連通性 gate 綠咗但影相成幅都係石——真兇係**鏡頭由頭到尾冇做遮
  擋**。庭院跟住有咗第三關，**唔攞低就開唔到 boss 門**；恩典點由一個變數改成 `graces` 列表。
- **Penny 報嘅「技能 CD 卡住」**：兩個冷卻都寫喺「用緊佢嗰條路徑」入面，搬咗上 `step()` loop 頂。
  **但個修正令遊戲難咗**：閒置嘅塔本來留住舊冷卻，而家即刻開火。24 局差幅 34 → **45**，**ironhulk
  17%** 低過 20% 線。啲數講嘅係**近戰一直被呢個 bug 保護緊**。
- **Hub 兩格一直係 404**：`.gitignore` 排除咗兩個 `dist/`，而呢個倉係靜態 Pages，**`dist/` 本身就係交
  付物**。`tests/hub.mjs` 而家逐個 link 查檔案在唔在。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)：「有冇嘢飛」sim／sfx／view 各寫一條式，兩局 5253 下普攻，
  音效 **588 下（11.2%）播弓弦聲而冇嘢飛**。修法係擺返件事實喺事件度。
- **`ai.js` 突變掃描** (ADR-143)：十四個突變七殺七生。**做唔到自己個名嗰件事嘅突變會令好 gate 睇落好
  弱**；**一個生還者可以只係對住你跑嗰個偵測器生還**。
- **玩家郁唔到嘅時間** (ADR-141)：曲線拉平三成半，總時間 **150 對 151 秒**——**個掣係死亡頻率唔係計時
  器**。**任何用「一場波」做分母或者總量嘅數都答唔到關於局長嘅問題。**
- **突變測試** (ADR-135/140)：反轉 `if` 12 殺 8。**一句 ADR 唔等於一條守衛**。手砌小兵缺欄位令座標變
  **NaN**，所有距離守衛一次過失效；而家逐格斷言。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個，而 `cache-bust` 一直綠燈——佢查 `src/` import，唔係有風險嗰半
  （ADR-134）。Hub 圓點 8×8、箭咀 34–42 全部低過自己條 44px（ADR-133）。
- 戰鬥 gate 聲稱角色企喺 **x = -6**，出手嗰刻其實喺 **x = -62**（ADR-132）。Gold：**74.4% 時間買得起
  但 build list 唔畀買**，**0/72 砌得完**（ADR-130），而**把尺本身就係被調嗰樣嘢**（ADR-131）。
- **所有版位 gate 都由 `#pick-go` 之後先開始**：568×320 之下**零張完整卡**（ADR-129）。重疊 gate 豁免
  咗 `.moba-tip`，順手跌出真 bug：`setPointerCapture` 喺記低瞄準之前叫。
- 120 Hz 上面得 **25.2%** 幀郁過角色，內插後 **97.5%**（ADR-127）。買嘢規則寫咗三次，**淨係因為
  `canShop` 回 `!!c` 先一致**（ADR-125）。`makeRng` 攞 seed 直接做狀態，**第一個輸出平均 0.007**
  （ADR-109）。iOS：`touch-action: pan-y` 會當拖拽係捲動而唔發 `click`（ADR-105/106/107）。

## Verification

- `node tests/hub.mjs` → **96/96**；`node games/elden-ring-ii/tests/hud-layout.mjs` → **25/25**（五個
  尺寸版位、地圖連通性、鏡頭遮擋、出生點、時鐘、弧線、boss 招式、路標、分區燈、死完重開）；ER2
  `npm test` → 3/3。條套件約三分鐘，因為要真係企定畀人打死一次。
- MOBA：`cache-bust.mjs` → pass (`assets-28`)；`sim.mjs` → **262/262**；`browser.mjs` → **196/196**；
  `balance.mjs 24` → **紅色**：ironhulk 17% 低過 20% 線（ADR-146 之後，預期之內，下一輪處理）。

## Changed files

- Hub 檔、`games/moba/*`、`games/elden-ring-ii/{src,tests,dist}`、`scripts/*`、`docs/ai/*.md`。

## Known issues and cautions

- 查過乾淨唔好再推導（ADR-123/129/130/132）：返程被打斷、死住轉向、開商店 GPU lost、`.hidden` 食 tap、
  商店同設定一齊開、420 金上限冇觸發、版位 gate 個 900ms 等待冇漂移。
  仲係去 Google 攞字體。**ER2 改完 `src/` 一定要 `npm run build`**，因為 Pages 派嘅係 `dist/`。
- **未解嘅**：MOBA 打直取景 gate 飄過兩次；診斷已落，過嗰次讀到 −6.8／−6.8／58，假設未證實。
- Cache token 覆蓋成個 module graph **同 Hub stylesheet**（ADR-111/133）；用
  `node scripts/moba-bump-cache.mjs <token>` 改，唔好手改，`cache-bust.mjs` 一漂移就肥。

## Exact next action

1. **ER2 續攤**：三個場都起好。仲未做：聖所除咗 boss 冇嘢；一下揮擊只打中一個敵人（ADR-151 量到但刻
   意冇改，係平衡決定）。**ER2 未喺真機試過**——呢度得軟件光柵化三幀，手感量唔到。
2. **MOBA 平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45，成因已知（塔同小兵冷卻修好，環境傷害上升）。
   重新做基準，一次改一樣，每次 ≥24 局；ADR-131：ironward／longshot／ironhulk 係把尺。

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
