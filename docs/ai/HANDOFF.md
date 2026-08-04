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

- 「量咗但冇 assert」用喺 `sim.mjs` 空手而回，改用突變測試。**第一批完全冇價值**：十四個邊界突變
  全部生還，但喺浮點時間度嗰啲係**等價突變**——結果講緊我揀嘅算子，唔係條套件。
- 第二批用一定改變行為嘅算子（數值放大一倍）：**12 個之中 11 個生還**，包括脫戰回血減半、小兵
  箭速一倍、索敵半徑一倍、塔半徑一倍。247 條檢查之前一條都冇察覺。
- 但答案唔係逐個常數釘死——嗰種就係專案自己反對嘅「記錄實作而唔係記錄意圖」。要守嘅係後果：企喺
  安全位由半血養返滿要 **199.7／242.5／267 秒**（1／6／12 級），而一場波平均八分鐘——「等返血」
  根本唔係選項。T33 用闊帶（120–360 秒）釘住，`/5` 改 `/10` 三個等級全部肥。
- 其餘生還者逐個嚟，全部守後果唔守常數，兩個方向驗過。索敵半徑 →「行到幾埋先畀小兵盯上」＝ **18
  米**（半個打直畫面），T34 釘 12–24。追蹤彈速 →「出手到中招嗰個間隔」＝最遠射程 **0.267 秒**，
  T35 釘 0.18–0.45。塔半徑 →「近戰拆塔企離塔心幾遠」＝ **4.19 米**，T36 釘 3.5–5.2（第一次寫
  3–5 只捉到放大唔捉到縮細，等於半條 gate；而塔嗰個量咗三次先啱——問「打唔打得到塔」永遠係 yes）。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋到 67 個請求入面嘅 19 個：`vendor/`、Draco、**全部十二個 `.glb` 模型**都冇，而
  `cache-bust.mjs` 一直綠燈，因為佢查 `src/` 嘅 import——從來唔係有風險嗰半。模型標記改為由
  `assets.js` 自己個 module URL 讀返。個改動即刻整爛咗資產重試 gate（佢攔 `**/*.glb`，一加
  query 就一次都冇攔過）。新 gate 直接錄低瀏覽器攞過乜。ADR-134。
- Hub 係玩家真正打開嘅第一塊畫面，但**一粒掣都冇量過**：分頁圓點 8×8、箭咀 34–42，全部低過
  專案自己嗰條 44px。箭咀升到 44；四粒點喺 320 闊之下每粒 44 幾何上塞唔落，改用 WCAG 2.5.8
  嘅 24×24 加圓心間距。而呢啲改動本來一個玩家都到唔到——Hub 個 `style.css` 冇版本標記。ADR-133。
- The combat gate said it stood the champion at **x = -6**; at the attack it was at **x = -62**,
  dying in the warm-up and respawning at its own fountain — every swing measured inside the
  fountain, the state ADR-119 named unrepresentative. Fixed by ordering, `atFountain` asserted
  false; the layout gate's 900 ms wait, same shape, **holds** and is asserted too. ADR-132.
- Gold: **74.4% of match time a champion holds enough to buy something while the build list forbids
  it** (avg 1122); a full build costs 8502 and a champion earns 4191 a match, so **0/72 could
  complete one**. `nextPurchase` now scans to the next affordable item within the same build. ADR-130.
- Champion spread was 66 points (longshot 83, duskblade 17), tracking **range** almost exactly; now
  **34** (dawnkeeper 63, duskblade 29) after mechanism-tied changes: melee speed → 7.1/7.4/7.1,
  longshot range 10.4 → 9.6, dawnkeeper armour cut and its Q's reach 12 → 9.5, duskblade's mobility
  8 s → 5 s. Melee die on the way in: **9.6** deaths a match against 1.3–4.3. ADR-130.
- **The yardstick was one of the things being tuned** (ADR-131): buffing melee armour made the game
  *less* even (34 → 66) because ironhulk is a companion in every measured match — the biggest mover
  was untouched dawnkeeper. So **"66 → 46" was never a clean before/after**.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  smaller than one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never
  binding under flex shrink. Two probe misreadings: cards below the fold were scrolled out, not lost,
  and counting after scrolling flatters. ADR-129.
- The overlap gate exempted `.moba-tip` for being `pointer-events: none`, though it is the only place
  the game explains an ability: **tip × recall 54×44**, **× recallbar 206×20**, invisible to the gate.
  A production bug fell out: the skill button called `setPointerCapture` **before** recording aim
  state, and a throw there leaves `pointerup` idle — the ability never fires. ADR-128.
- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — 120 fps of 30 Hz motion; render interpolation took it to **97.5%**, and `src/pace.js` owns
  the fixed-step rule, deriving `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**: the FX count read a 25 s
  backlog (**green for the wrong reason**), the target could die inside the tick, and an unseen
  respawn ran `revive()` over the swing. ADR-126.
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`**;
  `sim.buyBlocker` owns it and T31 pins the contract (ADR-125). A lost GPU context used to end the
  match though the browser returns it in a second (ADR-120); audio is pinned (ADR-121); twelve models
  loaded via one `Promise.all` with no retry — now three tries (ADR-122).
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match; the gates had been sampling the opening frame. ADR-119.
- Bot order alternates each tick (ADR-113); draw calls peak at 286/342, not 1311 (ADR-114); portrait
  spent **83.6% on abyss and water** before the camera rotated 90° (ADR-110); `makeRng` used the seed
  directly as xorshift32 state so the **first output averaged 0.007** (ADR-109); level-1 attack pacing
  was **8.6–12.7 s per minion**, now 5.1–7.9 (ADR-108); the SE HP panel hung off both edges and the
  **settings panel did not fit 568×320** (ADR-116/124).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap". ADR-105/106/107.

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **247/247**; `balance.mjs 24` → all six inside 20–85%
  (318 s, not a fast gate).
- `node games/moba/tests/browser.mjs` → **195/195 pass** at five sizes (~10 min): select and
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
