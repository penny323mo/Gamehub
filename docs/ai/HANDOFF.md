# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Elden Ring II 兩把鐘 + 揮擊弧線 (ADR-150/151)；**MOBA balance 仍然紅**

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Elden Ring II：兩把鐘，部機愈跟唔上遊戲對玩家愈唔公平 (ADR-150/151)

- 用瀏覽器驅動嗰陣完全推唔郁隻角色（雜兵廿秒唔埋嚟，戰士 `speed` 12.5 但行 0.6 m/s）。第一個念頭係
  「我隻機械人蠢」，追落去先發現係呢隻遊戲到目前為止最大嗰個 gameplay 缺陷。
- tick 有**兩把鐘**：`now` 係原始 `performance.now()`，所有戰鬥計時器（出手間隔、boss `impactAt`、
  預警圈、閃避無敵幀）掛喺佢度；而 `delta` 夾住 0.05 秒，郁動／物理／動畫用佢。夾時間本身係防死鎖嘅
  正當守衛，但代價係**跌穿 20 fps 之後郁動慢過真實時間，而戰鬥計時器唔會**。
- CPU 節流量每一秒**郁動時間**出幾多手：**1× 2.33，6× 2.90——多兩成半**。同遊戲自己個常數比更誇：雜兵
  寫住 1.4 秒一下（最多 0.71/秒），實際 2.33–2.90，**係設計節奏嘅三到四倍**。併成一把鐘後 0.62–0.67。
- 條 gate 釘喺**常數**唔係釘喺另一次量度（兩次可以一齊錯）：出手率 ≤ 0.9/秒，而家 0.48，放返舊 `now`
  就 **2.63**。同族仲有一個：鎖定鏡頭注視點用裸 `lerp(..., 0.34)`，而同一鏡頭嘅位置同偏航都做咗幀率
  無關。已改。
- **揮擊弧線畫緊另一把刀 (ADR-151)**：弧線係半徑 1.1–2.0 米、跨 **243°** 嘅圓環，而判定係向前 **4.4
  米**、錐角 **33°** 嘅膠囊。同一下揮擊兩組數兩個出處，兩個方向一齊錯：**收埋咗一半以上射程**（你殺到
  弧線從來冇掃過嘅嘢），**角度多報十四倍**。而家由判定嗰組常數計出（3.61 米／24°），逐職業重建。
  條 gate 講立場唔抄公式，放返舊 torus 三條中兩條響。第一版加咗 `minionRadius`（五十行後先宣告）
  → TDZ 一載入就黑 screen，係「零 page error」嗰條捉返。量到但**唔改**：一下揮擊只打中一個敵人。

### 上一個檢查點：擴地圖 + 鏡頭遮擋 + 第三關 (ADR-147/148/149)

- 整咗支尺（真瀏覽器行入遊戲量矩形）即刻捉到 `.player-hud` 用寫死嘅 `top`（91／63／45），而上面品牌
  字係 `clamp(20px, 2vw, 30px)`——高度跟**闊度**變，兩套斷點喺 **844×390（iPhone 14 打橫）**夾唔埋。
  個 gate 自己都改正過：門檻 6px 照肥咗真嘅 5px。
- 地圖本來得一個半徑 22.35 圓場，所有嘢排喺 `x ≈ 0`。擴張唔係「將個圓車大啲」——空地唔係地圖。西面開
  門、走廊、庭院（`x = -60`, r = 17），用**三個一直 ship 咗但一格都冇出現過**嘅模型。**次序一開始錯
  咗，係量度改返正**：連通性 gate 綠咗但影相成幅都係石——`bridge-straight-pillar` 原來係高架橋，真兇
  係**鏡頭由頭到尾冇做遮擋**（出生點鏡頭已經喺場外三米，25.85 → 20.51）。月光陰影框亦改成跟玩家。
- **庭院要有事做 (ADR-149)**：第三波擺喺庭院，**唔攞低庭院就開唔到 boss 門**。抵抗第三個 case 嘅都係
  「二元寫成三元」，改成索引表；恩典點改成 `graces` 列表 + `nearestGrace()`。新 gate：三波都有人、
  八個出生點冇一個卡喺牆。

### 上一個檢查點：Penny 報嘅「技能 CD 會卡住」(ADR-146)

- 兩個冷卻都寫喺「用緊佢嗰條路徑」入面：`a.cd -= dt` 喺 `#tryAttack`（收手就凍結喺 0.925），
  `abilityCd` 喺 `#tickChampion`（死咗入唔到）。兩個都搬咗上 `step()` entity loop 頂。
- **但個修正令遊戲難咗，balance 而家肥咗**：閒置嘅塔本來留住舊冷卻，而家即刻開火（本來就應該係咁）。
  24 局差幅 34 → **45**，**ironhulk 17%** 低過 20% 線。照出——啲數講嘅係**近戰一直被呢個 bug 保護緊**。

### 再之前：Hub 兩格一直係 404 (ADR-145)

- Hub 冇量過一個選單最基本嗰件事：**撳落去有冇嘢**。`ashen-rail` 同 `elden-ring-ii` 兩個
  `dist/index.html` 都係 404——`.gitignore` 排除咗，而呢個倉係靜態 Pages，**`dist/` 本身就係交付物**。
  兩個都 build 返、載過、commit 咗（約 53 MB）。`tests/hub.mjs` 而家逐個 link 查檔案在唔在。
- Clean negative：四隻遊戲由 jsdelivr 載 `supabase-js@2`、象棋攞 HDRI，攔晒外部主機之後全部只係降級。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)。「有冇嘢飛」sim／sfx／view 各寫一條式；兩局 5253 下普攻，
  音效 **588 下（11.2%）播弓弦聲而冇嘢飛**（350 下係塔同水晶）。修法係擺返件事實喺事件度。
- **`ai.js` 突變掃描** (ADR-143)：十四個突變七殺七生。**做唔到自己個名嗰件事嘅突變會令好 gate 睇落好
  弱**；**一個生還者可以只係對住你跑嗰個偵測器生還**。**一個兩邊都解得通嘅數唔算守衛** (ADR-142)：
  暮刃速度斬半，「掂到敵人嘅時間」反而**升到 17.8%**，所以刪咗唔出。
- **玩家郁唔到嘅時間** (ADR-141)：曲線拉平三成半，總時間 **150 對 151 秒**——**個掣係死亡頻率唔係計時
  器**。**任何用「一場波」做分母或者總量嘅數都答唔到關於局長嘅問題。**
- **突變測試** (ADR-135/140)：反轉 `if` 12 殺 8。**一句 ADR 唔等於一條守衛**。手砌小兵缺欄位令座標變
  **NaN**，所有距離守衛一次過失效；而家逐格斷言。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個，而 `cache-bust` 一直綠燈——佢查 `src/` import，唔係有風險嗰半
  （ADR-134）。Hub 圓點 8×8、箭咀 34–42 全部低過自己條 44px，而嗰啲改動本來一個玩家都到唔到，因為
  Hub 個 `style.css` 冇版本標記（ADR-133）。
- 戰鬥 gate 聲稱角色企喺 **x = -6**，出手嗰刻其實喺 **x = -62**——熱身時死咗，每一下都喺自己泉水量
  （ADR-132）。Gold：**74.4% 時間買得起但 build list 唔畀買**，**0/72 砌得完**；差幅曾經 66 點、幾乎
  完全跟射程走（ADR-130），而**把尺本身就係被調嗰樣嘢**（ADR-131）。
- **所有版位 gate 都由 `#pick-go` 之後先開始**：568×320 之下選角格可見高度 78 對一張卡 228——**零張完
  整卡**（ADR-129）。`.moba-recall` 成場冚住 `.moba-shopbtn`（ADR-119）。重疊 gate 豁免咗 `.moba-tip`，
  順手跌出真 bug：`setPointerCapture` 喺記低瞄準之前叫。
- 120 Hz 上面得 **25.2%** 幀郁過角色，內插後 **97.5%**（ADR-127）。買嘢規則寫咗三次，**淨係因為
  `canShop` 回 `!!c` 先一致**（ADR-125）。`makeRng` 攞 seed 直接做狀態，**第一個輸出平均 0.007**
  （ADR-109）。`1 - exp(-rate·dt)` 做轉向／鏡頭追隨（ADR-118）。
- iOS：`overflow-y: auto` + `touch-action: pan-y` 會當拖拽係捲動而唔發 `click`（ADR-105/106/107）；
  象棋 build 重寫（ADR-102）、字體自架（ADR-112）、隨處買（ADR-104）。
## Verification

- `node tests/hub.mjs` → **96/96**；`node games/elden-ring-ii/tests/hud-layout.mjs` → **9/9**（五個
  尺寸嘅 HUD 版位、地圖連通性、鏡頭遮擋）；`games/elden-ring-ii` `npm test` → 3/3。
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

1. **ER2 續攤**：戰鬥手感（衝刺、擊退、命中回饋）同 boss 第二階段；地圖可以再向北開一塊。
2. **MOBA 平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45，成因已知（塔同小兵冷卻修好，環境傷害上升）。
   重新做基準，一次改一樣，每次 ≥24 局；ADR-131：ironward／longshot／ironhulk 係把尺。

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
