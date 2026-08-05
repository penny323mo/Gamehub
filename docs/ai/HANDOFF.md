# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Elden Ring II 入場掣喺手機得 30px (ADR-163)；**MOBA balance 仍然紅**

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Elden Ring II：開遊戲嗰粒掣喺手機得 30px 高 (ADR-163)

- 所有版位量度都係喺撳入遊戲**之後**先做，即係標題／選角畫面——每個玩家見到嘅第一幅嘢，亦係入遊戲嘅
  唯一途徑——由頭到尾冇量過。同 ADR-160 死亡蓋幅一樣嘅缺口，早一個畫面。
- 一掃即刻報幾十對重疊，而**又係我支尺錯**：`.sigil` 係 `<div aria-hidden><i/><b/><em/></div>`，三塊
  形狀**特登**疊埋砌個徽記。裝飾唔係內容，detector 而家跳過 `[aria-hidden="true"]` 裡面嘅嘢。
- 真嘢係撳擊區：三個職業掣處處 114×60，但 **`ENTER THE VEIL` 桌面／打直 41px，兩個手機打橫得 30–31px**
  ——正正係真係用手指嗰啲情況。44px 係呢個專案自己喺 Hub 用開嗰條（ADR-133）。
- 成因係佢個高度**完全係副產品**：10px 字 + `padding: 14px 30px` = 41px，窄機 media query 再壓 padding
  就跌到 30。**一個由兩個唔相干宣告撞出嚟嘅高度，任何一邊一郁就會飄。** 而家寫死 `min-height: 44px`。
  條檢查**四粒掣 × 五個尺寸**全部量——一粒掣喺桌面舒服唔代表喺手機舒服，而呢粒就係咁樣蒙混過關。

### 上一輪：量像素 + 地圖成環 (ADR-161/162)

- 全部版位檢查都係量矩形，而矩形對「鏡頭埋咗入牆」完全盲。直接抽 framebuffer：正常 34.3／16.6／308 色，
  埋牆 25.6／**7.2**／**66**，熄晒燈 **10.3**／21.9／232。**第一版淨用標準差唔肯響**——熄燈標準差反而
  **升**到 21.9。**對比度唔等於亮度，一個數擔唔起兩種失效。** 而家色數 ≥ 120 同亮度 ≥ 18 各守一個。
  條 L 形通道。拐角第一次砌錯（兩段牆各自穿過對方條走廊），連通性 gate 影相前就捉到。
- **跟住影相係黑嘅，而牆表話中間乜都冇**：鏡頭遮擋對住 `staticBoxes` 行，而嗰啲盒**得 0.42 米厚**，
  同位置嘅網格厚好多——鏡頭合法噉停喺盒外面半米，已經喺視覺牆入面。pad 0.55 → 1.35，**通用修正**。

### 再之前：死亡畫面、閃避、職業覆蓋 (ADR-156–160)

- **死亡畫面從來冇量過版位 (ADR-160)**：加咗之後五個尺寸全部報重疊，而**係我支尺錯**：`<button>` 同佢
  入面嘅 `<kbd>R</kbd>`——「有仔就跳過」特登唔包 BUTTON。而家排除包含關係。同輪 clean negative：
  **所有音效名同動畫 clip 名都搵得到**。
- **閃避 (ADR-159)**：企定 **8.89–9.02 %HP/秒**、不停碌 **1.78**，但**剷走無敵幀讀到 1.77**。拆開量：
  冇位移冇無敵幀 9.05／冇位移有無敵幀 4.67／有位移冇無敵幀 1.77／兩樣都有 1.78——**無敵幀單獨有用，但
  加喺位移上面一蚊都唔值**。條 gate 誠實講佢守嘅係**位移**。
- **重開會起一道隱形牆 (ADR-156)**：霧門 collider 寫咗**兩次**，條 gate **加強咗兩次先捉到**；順手照出
  `staticBoxes` 只加唔減。**職業覆蓋 (ADR-158)**：三個職業兩個從來冇載入過。**會玩嘅 bot (ADR-157)**：
  印去到邊，**唔判斷**；兩個假設量完兩個都錯，**冇調過任何嘢**。
### 再之前：時鐘／弧線／撲擊／路標／北面聖所 (ADR-150–155)

- **兩把鐘 (ADR-150)**：戰鬥計時器掛喺原始 `performance.now()`，郁動／物理／動畫用夾住 0.05 秒嘅
  `delta`——**跌穿 20 fps 之後郁動慢過真實時間而戰鬥計時器唔會**。CPU 節流實測每秒郁動時間出手
  **1× 2.33、6× 2.90**，而常數寫住最多 0.71/秒。條 gate 釘喺**常數**唔係另一次量度。
- **揮擊弧線畫緊另一把刀 (ADR-151)**：畫 **243°**、判定 **33°**。**Boss 第二階段 (ADR-152)**：而家開
  撲擊，**預警圈畫喺落點**。**目標喺六十米外冇嘢指住 (ADR-153)**：亮光柱，**兩個方向都守**。
- **霧門通去嘅係同一塊地 (ADR-154)**：連通性 gate 第一版用門檻分霧門同真牆而分唔開——**一條門檻分唔開
  兩件企喺同一個位嘅嘢**，改用 tag。**分區補光 (ADR-155)**：兩盞燈射程 34／42 但 three.js 照樣放入
  shader 燈迴圈，熄咗 **2.0 → 2.3 fps**。

### 更早：ER2 起支尺、開西面、MOBA 兩單嘢 (ADR-145–149)

- ER2 之前淨係有「啲檔在唔在」嘅測試。`hud-layout.mjs` 用真瀏覽器量矩形，即刻捉到 `.player-hud` 用寫死
  嘅 `top`（91／63／45），而上面品牌字係 `clamp(20px, 2vw, 30px)`——高度跟**闊度**變，兩套斷點喺
  **844×390（iPhone 14 打橫）**夾唔埋。西面開門、走廊、庭院用**三個 ship 咗但冇出現過**嘅模型。
- **Penny 報嘅「技能 CD 卡住」**：兩個冷卻都寫喺「用緊佢嗰條路徑」入面，搬咗上 `step()` loop 頂。
  **但個修正令遊戲難咗**：24 局差幅 34 → **45**，**ironhulk 17%**——**近戰一直被呢個 bug 保護緊**。
  **Hub 兩格一直係 404**：`.gitignore` 排除咗兩個 `dist/`，而呢個倉係靜態 Pages。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)：兩局 5253 下普攻，音效 **588 下（11.2%）播弓弦聲而冇嘢飛**。
  **`ai.js` 突變掃描** (ADR-143)：十四個突變七殺七生。
- **玩家郁唔到嘅時間** (ADR-141)：曲線拉平三成半，總時間 **150 對 151 秒**——**個掣係死亡頻率唔係計時
  器**。**任何用「一場波」做分母或者總量嘅數都答唔到關於局長嘅問題。突變測試** (ADR-135/140)：反轉
  `if` 12 殺 8；手砌小兵缺欄位令座標變 **NaN**，而家逐格斷言。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個，而 `cache-bust` 一直綠燈——佢查 `src/` import，唔係有風險嗰半
  （ADR-134）。Hub 圓點 8×8、箭咀 34–42 全部低過自己條 44px（ADR-133）。戰鬥 gate 聲稱角色企喺
  **x = -6**，出手嗰刻其實喺 **x = -62**（ADR-132）。568×320 之下選角**零張完整卡**（ADR-129）。
- Gold：**74.4% 時間買得起但 build list 唔畀買**，**0/72 砌得完**（ADR-130），而**把尺本身就係被調嗰樣
  嘢**（ADR-131）。120 Hz 上面得 **25.2%** 幀郁過角色，內插後 **97.5%**（ADR-127）。買嘢規則寫咗三次，
  **淨係因為 `canShop` 回 `!!c` 先一致**（ADR-125）。`makeRng` 攞 seed 直接做狀態，**第一個輸出平均
  0.007**（ADR-109）。iOS：`touch-action: pan-y` 會當拖拽係捲動而唔發 `click`（ADR-105/106/107）。

## Verification

- `node tests/hub.mjs` → **96/96**；`node games/elden-ring-ii/tests/hud-layout.mjs` → **38/38**（五個
  尺寸版位、地圖連通性、鏡頭遮擋、出生點、時鐘、弧線、boss 招式、路標、分區燈、死完重開）；ER2
  `npm test` → 3/3。條套件約五分鐘：要真係企定畀人打死一次，仲要逐個職業載一次。另有 `playthrough.mjs`（唔喺快速套件）。
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

1. **ER2 續攤**：三個場都起好。仲未做：聖所除咗 boss 冇嘢；第二關（三隻）係一級難度階梯（ADR-157）。
   **ER2 未喺真機試過**——呢度得軟件光柵化三幀，手感量唔到。
2. **MOBA 平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45，成因已知（塔同小兵冷卻修好，環境傷害上升）。
   重新做基準，一次改一樣，每次 ≥24 局；ADR-131：ironward／longshot／ironhulk 係把尺。

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
