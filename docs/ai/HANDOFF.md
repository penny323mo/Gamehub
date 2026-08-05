# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Elden Ring II 擴地圖 + 鏡頭遮擋 (ADR-147/148)；**MOBA balance 仍然紅**

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Elden Ring II：地圖擴唔到，因為鏡頭一直穿牆 (ADR-147/148)

- 之前淨係有「啲檔在唔在」嘅測試。第一件事係整支尺：`tests/hud-layout.mjs` 用真瀏覽器行入遊戲逐個
  HUD 元素量矩形，WebGL draw call 喺載入前包住，遊戲本身唔使開後門。
- 即刻捉到：`.player-hud` 用寫死嘅 `top`（91／63／45 三個斷點），而上面嘅品牌字係 `clamp(20px, 2vw,
  30px)`——高度跟**闊度**變。兩套斷點喺 **844×390（iPhone 14 打橫）**夾唔埋，副標題壓住職業徽章。修法
  係搬入 topbar 左欄順文檔流排，三個 `top` 全刪。個 gate 自己都改正過：門檻本來 6px，照肥咗一條真嘅
  5px 重疊。
- 地圖：成隻遊戲得一個半徑 22.35 圓場，所有嘢排喺 `x ≈ 0` 一條走廊。擴張唔係「將個圓車大啲」——空地唔
  係地圖。西面開門、走廊、第二個庭院（`x = -60`, r = 17），用嘅係**三個一直 ship 咗但一格都冇出現過**
  嘅模型。形狀寫成數據，牆由數據生；門口用**角度**界定（跳格嘅話門闊度會跟分段數變）。
- **次序一開始係錯嘅，係量度改返正。** 連通性 gate 綠咗（物理上真係行得過），但影相成幅都係石。一、
  `bridge-straight-pillar` 係**高架橋**，玩家由橋底穿過，讀落係一堵牆；改用 `wall.glb`。二、真兇：
  **third-person 鏡頭由頭到尾冇做遮擋**。
- 鏡頭嗰個唔係新地圖整出嚟，係新地圖令一個一直存在嘅缺陷現形：出生點 `z = 17`，鏡頭釘死後面 8.3 米即
  `z = 25.3`，而場邊 22.35——**開波第一格鏡頭已經喺場外三米**（實測關遮擋 25.85、開 20.51）。而家沿
  鏡頭方向做 2D slab 測試，撞到靜態盒就停（下限 2.4 米），高度跟住收短嘅距離內插。
- 月光陰影框本來係原點 ±32 固定框，新庭院完全喺框外；車大到蓋晒會令同一張 2048 攤開一倍半，所以改成
  跟玩家行再**收窄到 ±26**。另外 `window.__ER2` 加咗先發現 `mount.dataset` 一早有玩家位置同敵人數
  ——同 ADR-144 一樣嘅「一件事兩個出處」，已收窄。
- Gate 9/9，每條都驗過反方向：封返門口走廊喺 `x = -21.75…-23` 塞死；關咗鏡頭收短就出場外 3.5 米。

### 上一個檢查點：Penny 報嘅「技能 CD 會卡住」(ADR-146)

- 兩個冷卻都寫喺「用緊佢嗰條路徑」入面。`a.cd -= dt` 喺 `#tryAttack`，而佢淨係喺有目標喺射程內先叫
  ——收手之後 `p.cd` **永遠停喺 0.925**；隔十秒再開打仲要由凍結嗰個位等返落去。`abilityCd` 喺
  `#tickChampion`，死咗嘅單位入唔到，死兩秒個數紋風不動。兩個都搬咗上 `step()` entity loop 頂。
- **但個修正令遊戲難咗，balance 而家肥咗。** 閒置嘅塔本來留住舊冷卻，而家即刻開火（本來就應該係咁）。
  24 局：差幅 34 → **45**，**ironhulk 17%** 低過條 20% 線。照出——為咗一個平衡數字而留住玩家見到嘅缺
  陷，等於留住一個啱好補償緊另一個問題嘅 bug。啲數講嘅係：**近戰一直被呢個 bug 保護緊**。

### 再之前：Hub 兩格一直係 404 (ADR-145)

- Hub 量過掣夠唔夠大、圓點隔幾遠（ADR-133），但冇量過一個選單最基本嗰件事：**撳落去有冇嘢**。
  `ashen-rail` 同 `elden-ring-ii` 兩個 `dist/index.html` 都係 **404**——成因喺 `.gitignore` 排除咗
  佢哋嘅 `dist/`，而呢個倉係靜態 Pages，**`dist/` 本身就係交付物**。兩個都 build 返、載過、commit 咗
  （約 53 MB）。`tests/hub.mjs` 而家逐個 link 查檔案在唔在。
- Clean negative：四隻遊戲由 jsdelivr 載 `supabase-js@2`、象棋攞 HDRI，攔晒外部主機之後全部只係降級；
  `gomoku/build_info.js` 本地 404 係 `deploy-pages.yml` 部署時先生成。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)。「有冇嘢飛」sim／sfx／view 各寫一條式；兩局 5253 下普攻，
  音效 **588 下（11.2%）播弓弦聲而冇嘢飛**（350 下係塔同水晶）。修法係擺返件事實喺事件度。
- **`ai.js` 突變掃描** (ADR-143)：十四個突變七殺七生。**做唔到自己個名嗰件事嘅突變會令好 gate 睇落好
  弱**；**一個生還者可以只係對住你跑嗰個偵測器生還**。
- **一個兩邊都解得通嘅數唔算守衛** (ADR-142)：暮刃速度斬半，「掂到敵人嘅時間」反而**升到 17.8%**，
  所以刪咗唔出。
- **玩家郁唔到嘅時間** (ADR-141)：曲線拉平三成半，總時間 **150 對 151 秒**——**個掣係死亡頻率唔係計時
  器**。**任何用「一場波」做分母或者總量嘅數都答唔到關於局長嘅問題。**
- **突變測試** (ADR-135/140)：反轉 `if` 12 殺 8。**一句 ADR 唔等於一條守衛**。手砌小兵缺欄位令座標變
  **NaN**，所有距離守衛一次過失效；而家逐格斷言。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個，而 `cache-bust` 一直綠燈——佢查 `src/` import，唔係有風險嗰半
  （ADR-134）。Hub 圓點 8×8、箭咀 34–42 全部低過自己條 44px，而嗰啲改動本來一個玩家都到唔到，因為
  Hub 個 `style.css` 冇版本標記（ADR-133）。
- 戰鬥 gate 聲稱角色企喺 **x = -6**，出手嗰刻其實喺 **x = -62**——熱身時死咗，每一下都喺自己泉水入面
  量（ADR-132）。Gold：**74.4% 時間買得起但 build list 唔畀買**，**0/72 砌得完**；差幅曾經 66 點、
  幾乎完全跟射程走（ADR-130），而**把尺本身就係被調嗰樣嘢**（ADR-131）。
- **所有版位 gate 都由 `#pick-go` 之後先開始**：568×320 之下選角格可見高度 78 對一張卡 228——**零張
  完整卡**（ADR-129）。`.moba-recall` 成場冚住 `.moba-shopbtn`（ADR-119）。重疊 gate 豁免咗
  `.moba-tip`，順手跌出真 bug：`setPointerCapture` 喺記低瞄準之前叫，一拋就施法失敗。
- 120 Hz 上面得 **25.2%** 幀郁過角色，內插後 **97.5%**，`src/pace.js` owns 定步規則（ADR-127）。戰鬥
  gate 熱身 750 格**中間一幀都冇畫**（ADR-126）。買嘢規則寫咗三次，**淨係因為 `canShop` 回 `!!c` 先
  一致**（ADR-125）。GPU context lost 曾經直接完場（ADR-120）；十二個模型一個 `Promise.all` 冇重試
  （ADR-122）；`makeRng` 攞 seed 直接做狀態，**第一個輸出平均 0.007**（ADR-109）。
- `1 - exp(-rate·dt)` 做轉向／鏡頭追隨（ADR-118）；Hub 分頁 dock、象棋 build 重寫（ADR-102）、字體自架
  （ADR-112）、隨處買（ADR-104）。iOS：`overflow-y: auto` + `touch-action: pan-y` 會當拖拽係捲動而唔發
  `click`；`src/tap.js` owns「乜嘢先算一下 tap」（ADR-105/106/107）。

## Verification

- `node tests/hub.mjs` → **96/96**；`node games/elden-ring-ii/tests/hud-layout.mjs` → **9/9**（五個
  尺寸嘅 HUD 版位、地圖連通性、鏡頭遮擋）；`games/elden-ring-ii` `npm test` → 3/3。
- MOBA：`cache-bust.mjs` → pass (`assets-28`)；`sim.mjs` → **262/262**；`browser.mjs` → **196/196**；
  `balance.mjs 24` → **紅色**：ironhulk 17% 低過 20% 線（ADR-146 之後，預期之內，下一輪處理）。

## Changed files

- Hub 檔、`games/moba/*`、`games/elden-ring-ii/{src,tests,dist}`、`scripts/*`、`docs/ai/*.md`。

## Known issues and cautions

- 查過乾淨，唔好再推導（ADR-123/129/130/132）：返程被傷害打斷、死住轉向、開住商店 GPU context lost、
  `.hidden` 食咗 tap、商店同設定一齊開、420 金上限從來冇觸發、版位 gate 個 900ms 等待冇漂移。
- Playwright 只喺 `games/Racing Car/tests/node_modules`，三個瀏覽器套件都用路徑指過去；冇就喺嗰度
  `npm ci`。`games/tower` 仲係去 Google 攞字體。ER2 改完 `src/` 一定要 `npm run build`，因為 Pages
  派嘅係 `dist/`。
- **未解嘅**：MOBA 打直取景 gate 飄過兩次；診斷已落，過嗰次讀到 −6.8／−6.8／58，假設未證實。
- Cache token 覆蓋成個 module graph **同 Hub stylesheet**（ADR-111/133）；用
  `node scripts/moba-bump-cache.mjs <token>` 改，唔好手改，`cache-bust.mjs` 一漂移就肥。

## Exact next action

1. **ER2 續攤**：西面庭院而家係空嘅——有地方但未有事做。下一步係第三場遭遇同第二個 grace。
2. **MOBA 平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45，成因已知（塔同小兵冷卻修好，環境傷害上升）。
   重新做基準，一次改一樣，每次 ≥24 局；ADR-131：ironward／longshot／ironhulk 係把尺。

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
