# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 版本標記覆蓋實際請求 (ADR-134), Hub 可撳範圍 (ADR-133)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### 版本標記只覆蓋到六十七個請求入面嘅十九個 (ADR-134)

- ADR-133 逐個補咗 Hub 一個檔。同一條問題問到底——**遊戲實際攞邊啲檔，邊啲有標記**——
  唔係一條讀碼題，所以改為錄低請求。開一局：**67 個請求，19 個有標記**；冇標記嘅係成個
  `vendor/`、Draco 解碼器，同**全部十二個 `.glb` 模型**。`cache-bust.mjs` 一直綠燈，因為
  佢查嘅係 `src/` 嘅 import，而嗰邊由頭到尾都唔係有風險嗰半。
- 模型特別要緊：Penny 講明唔重用現有 3D 資產，即係模型一定會換，而換完之後返轉頭嘅玩家
  會攞到新碼配舊網格。模型嘅標記由 `assets.js` 自己個 module URL 讀返，bump 腳本唔使多一
  個改寫位，亦冇第二個地方好忘記。Hub 嘅字型同兩個 logo 就要明寫入 bump 腳本。
- `vendor/` 特登唔郁，而且寫低理由而唔係寫低遺漏：佢哋之間用相對路徑互相 import，加標記
  等於改第三方源碼；升級 vendor 嘅正確做法係改資料夾名，一次過換晒所有 import URL。
- 呢個改動即刻整爛兩條 gate，而咁樣先叫有用：資產重試測試攔 `**/*.glb`，一加 query 就對唔
  到，於是佢一次都冇攔過，「載入甩咗」根本冇發生過。而家對 `pathname`。
- 新 gate 唔查碼，直接錄低瀏覽器攞過乜：49 個請求、31 個要標記、0 個冇。

### Earlier checkpoints, in one line each

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
  *less* even (34 → 66), because ironhulk is a companion in every measured match — the biggest mover
  was untouched dawnkeeper (63 → 83). Reverted; the same flaw hit the earlier pass, so **"66 → 46"
  was never a clean before/after**. `balance.mjs` refuses to judge below 24 matches.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  smaller than one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never
  binding under flex shrink. Two probe misreadings: cards below the fold were scrolled out, not lost,
  and counting after scrolling flatters. ADR-129.
- The overlap gate exempted `.moba-tip` for being `pointer-events: none`, though it is the only place
  the game explains an ability: **tip × recall 54×44**, **× recallbar 206×20**, invisible to the gate;
  the line is now decoration vs information. A production bug fell out: the skill button called
  `setPointerCapture` **before** recording aim state, and a throw leaves `pointerup` idle. ADR-128.
- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — 120 fps of 30 Hz motion; render interpolation took it to **97.5%**, and `src/pace.js` owns
  the fixed-step rule, deriving `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**: the FX count read a 25 s
  backlog (**green for the wrong reason**), the target could die inside the tick, and an unseen
  respawn ran `revive()` over the swing. ADR-126.
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`**;
  `sim.buyBlocker` owns it and T31 pins the contract (ADR-125). A lost GPU context used to end the
  match though the browser returns it in a second (ADR-120); audio was already correct and is
  pinned (ADR-121); twelve models loaded through one `Promise.all` with no retry — now three tries
  plus a 再試一次 button (ADR-122).
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match; the gates had been sampling the opening frame. ADR-119.
- Bot update order alternates each tick (ADR-113); draw calls peak at 286/342, not 1311 (ADR-114);
  portrait spent **83.6% on abyss and water** before the camera rotated 90° about Y for **70.1%
  ground** (ADR-110); `makeRng` used the seed directly as xorshift32 state so the **first output
  averaged 0.007** (ADR-109); level-1 attack pacing was **8.6–12.7 s per minion**, now 5.1–7.9
  (ADR-108); the SE HP panel hung off both edges (ADR-116); the **settings panel did not fit
  568×320** (ADR-124).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap". ADR-105/106/107.

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **238/238**; `balance.mjs 24` → all six inside 20–85%
  (318 s, not a fast gate).
- `node games/moba/tests/browser.mjs` → **193/193 pass** at five sizes (~10 min): select and
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
