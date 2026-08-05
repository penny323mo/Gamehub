# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 突變測試揭出無守衛嘅手感數字 (ADR-135), 版本標記 (ADR-134)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### 將決定手感嘅數字放大一倍，238 條檢查一條都冇響 (ADR-135)

- 「量咗但冇 assert」用喺 `sim.mjs` 空手而回，改用突變測試。**第一批完全冇價值**（邊界突變喺浮點時間
  度係等價突變）。第二批（數值放大）**12 個生還 11 個**：回血、箭速、索敵半徑、塔半徑全部冇人守。
- 但答案唔係逐個常數釘死（嗰種係「記錄實作」）。要守後果：企喺安全位由半血養返滿 **199.7／242.5／
  267 秒**，而一場波平均八分鐘——「等返血」根本唔係選項。T33 釘 120–360 秒。
- 逐個守後果唔守常數：索敵半徑 **18 米**（T34）、追蹤彈最遠射程 **0.267 秒**（T35）、近戰拆塔企
  **4.19 米**（T36）；三條都兩個方向驗過。
- 反轉 `if` 條件 **12 個殺死 8 個**，四個生還者已補 T37–T39：拆塔嘅錢派畀邊隊、時限打和嘅第二層決勝
  （呢條分支從來冇行過）、範圍技有冇界住半徑。
- `view.js` 唔廣噴（一跑十分鐘），揀咗 **ADR-127 自己聲稱嘅兩件事**：拆走瞬移門檻同拆走鏡頭平滑，
  兩個都有守，後者係畀上一輪先修好嗰條 framing gate 捉到。
- 同一問法問 `input.js`／`hud.js`：拆走搖桿轉軸（ADR-110）**一次肥五條**；拆走 `flash()` 清走舊提示
  （ADR-124 聲稱已修）**生還 195/195**。而家連叫兩次。**一句 ADR 唔等於一條守衛**。
- 掃返舊 ADR 搵到第四個：ADR-118 聲稱指數式令「任何幀率行為一樣」，而冇 gate 比較過兩個幀率。新 gate
  跑一秒鏡頭追隨：乾淨樹三十／六十幀都係 −0.7326；改返 `dt·rate` 變 −0.5465 對 −0.6372。
- **未解嘅**：打直取景 gate 飄過兩次（其他次過）。診斷欄位（玩家 x、鏡頭焦點、夾界）已落，過嗰次讀到
  −6.8／−6.8／58，即係我「飄返泉水令鏡頭夾界」嘅假設**未證實**。下次再飄佢會自己講。
- 同一形狀掃入 sim 層（一噴 25 秒）：四句聲稱兩句死得乾淨，兩句生還。**ADR-117 嗰個係真嘢**——將碰撞
  改返到達點取樣，252 條檢查照樣全綠。原因喺 fixture：T28 手砌嘅 `kind: 'minion'` 缺欄位，小兵 tick
  一行就將座標寫成 **NaN**，而距離同 NaN 比都係 false，支彈打中晒全世界。而家用真小兵（速度設零）。
- 唔逐個 fixture 人手審，改為包住 `Sim.prototype.step` 斷言**每格都冇實體嘅 x／z／hp 係非有限數**（第
  一版三十格抽一次**捉唔返 T28**）。反方向驗過即刻響，仲照出 NaN 會**傳染**：一個壞物件冚六個英雄。
- 拆走 ADR-109 八次暖機唔係缺陷：四千個種子平均 0.5005（有暖機 0.5069）；冇擴散先係 0.1222。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個：`vendor/`、Draco、**十二個 `.glb` 模型**都冇，而 `cache-bust`
  一直綠燈（佢查 `src/` import，唔係有風險嗰半）。個改動即刻整爛咗資產重試 gate（攔 `**/*.glb`，
  一加 query 就一次都冇攔過）。新 gate 直接錄低瀏覽器攞過乜。ADR-134。
- Hub 係玩家真正打開嘅第一塊畫面，但**一粒掣都冇量過**：分頁圓點 8×8、箭咀 34–42，全部低過
  專案自己嗰條 44px。箭咀升到 44；四粒點喺 320 闊之下每粒 44 幾何上塞唔落，改用 WCAG 2.5.8
  嘅 24×24 加圓心間距。而呢啲改動本來一個玩家都到唔到——Hub 個 `style.css` 冇版本標記。ADR-133。
- The combat gate said it stood the champion at **x = -6**; at the attack it was at **x = -62**,
  dying in the warm-up and respawning at its own fountain — every swing measured inside the fountain.
  Fixed by ordering, `atFountain` asserted false; the layout gate's 900 ms wait **holds**. ADR-132.
- Gold: **74.4% of match time a champion holds enough to buy something while the build list forbids
  it**; a full build costs 8502 and a champion earns 4191 a match, so **0/72 completes one**. ADR-130.
- Champion spread was 66 points (longshot 83, duskblade 17), tracking **range** almost exactly; now
  **34** (dawnkeeper 63, duskblade 29) after mechanism-tied changes. Melee die on the way in: **9.6**
  deaths a match against 1.3–4.3 ranged. ADR-130.
- **The yardstick was one of the things being tuned** (ADR-131): buffing melee armour made the game
  *less* even (34 → 66) because ironhulk is a companion in every measured match.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  smaller than one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never
  binding under flex shrink. Two probe misreadings on the way. ADR-129.
- The overlap gate exempted `.moba-tip` for being `pointer-events: none`, though it is the only place
  the game explains an ability: **tip × recall 54×44**, invisible to the gate. A production bug fell
  out: `setPointerCapture` was called **before** recording aim state, so a throw kills the cast.
- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — 120 fps of 30 Hz motion; render interpolation took it to **97.5%**, and `src/pace.js` owns
  the fixed-step rule, deriving `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**: the FX count read a 25 s
  backlog, the target could die inside the tick, and an unseen respawn ran `revive()`. ADR-126.
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`**; T31 pins
  the contract (ADR-125). A lost GPU context used to end the match (ADR-120); audio is pinned
  (ADR-121); twelve models loaded via one `Promise.all` with no retry (ADR-122).
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match; the gates had been sampling the opening frame. ADR-119.
- Bot order alternates each tick (ADR-113); draw calls peak at 286/342 (ADR-114); portrait spent
  **83.6% on abyss and water** before the camera rotated 90° (ADR-110); `makeRng` used the seed as
  xorshift32 state so the **first output averaged 0.007** (ADR-109); SE layout fixes (ADR-116/124).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap". ADR-105/106/107.

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **253/253**; `balance.mjs 24` → all six inside 20–85%
  (318 s, not a fast gate).
- `node games/moba/tests/browser.mjs` → **196/196 pass** at five sizes (~10 min): select and
  post-match layout, full matches, FX and framing, the attack swing playing, smoothness at
  120/60/30 fps, a skill press surviving a failed pointer capture, shop, draw calls, taps.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi build files. MOBA:
  `games/moba/*` (new `src/pace.js`, `tests/balance.mjs`), `scripts/*`, `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130/132): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both
  open, the 420-gold shutdown cap never firing, the layout gate's 900 ms wait not drifting.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there by
  path — if missing, `npm ci` there. `games/tower` still fetches Inter/Oxanium from Google; Xiangqi
  `npm ci` reports four pre-existing audit findings.
- Cache token covers the whole module graph **and the Hub stylesheet** (ADR-111/133). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; `cache-bust.mjs` fails on any drift.

## Exact next action

1. Sync, then playtest on a physical phone — ideally 120 Hz, since ADR-127's subject is invisible
   below that; frame pacing here is bounded by software rasterisation.
2. Champion balance is the open axis: spread 34 points (dawnkeeper 63%, duskblade 29%). Narrowing
   it needs ≥24-match runs per change (~5 min each) and **must not touch
   ironward/longshot/ironhulk** — those three are the measuring stick (ADR-131).

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge
  skills back into one ring, restore fountain-only buying, or reuse `canShop()` for location.
