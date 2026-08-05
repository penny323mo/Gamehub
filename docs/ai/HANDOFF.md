# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 玩家有幾多時間郁唔到 (ADR-141), 突變測試 (ADR-135)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### 玩家一場波有幾多時間係㩒乜都冇反應 (ADR-141)

- 之前冇一條 gate 量過玩家真正感受到嗰樣嘢。T10 只問「有冇重生時間」，答案永遠係有。實測 157 次重生：
  名義中位 **15.2 秒**，但要再行 **5.8 秒／41 米**先返到場——個常數叫「重生時間」，**少報咗 48%**。
  同 `pace.js` 個 `dropped` 一樣：一個名擔起成條政策，實際只認自己嗰半。一次死 22.3 秒，近戰一局死
  九次，最差嗰局 **45% 時間郁唔到**。
- 兩個明顯嘅修法，做咗、量咗、**兩個都 revert**。重生曲線拉平（8+1.8L → 6+1.1L，減三成半）：24 局
  嘅總郁唔到時間 **150 對 151 秒**，因為一局死多咗三成（7.6 → 9.9 次）。總時間係**死亡頻率**嘅不動
  點，唔係計時器嘅。泉水加速（幾何上喺 |x|=32 衰減到零，而中位遇敵喺 |x|=29）：24 局反而**變差**
  （150 → 158），因為局數拉長；8 局嗰陣兩對比較仲要**符號相反**，所以先要跑返 24 局。
- 條 gate 寫咗三版，**掉咗嗰兩版先係重點**。第一版守佔比：減短計時器令佔比 26% → 19%「達標」，而絕對
  秒數變差——分母大咗。第二版守絕對秒數：反方向驗證斬半血量，讀數 182 → 91 **綠燈**，因為四分鐘就輸
  咗——分子細咗。同一個病：**任何用「一場波」做分母或者做總量嘅數，都答唔到一條關於局長嘅問題**。
- 而家三條線各守一個唔會互相溝淡嘅失效：T40 守單次最長鎖 ≤ 40 秒（`RESPAWN_BASE` 加到 25，平均值
  紋風不動 182 → 196，但單次跳到 62 秒，響）同一局 ≤ 16 分鐘；`balance.mjs` 守每分鐘死 ≤ 1.05
  （而家 0.21–0.80）。頻率**唔可以**擺快速套件：三局讀 0.87 對 0.90，而真變化係 0.79 對 1.04。
  **一條分唔清嘅 gate 唔係鬆，係假。** 三條都係棘輪，唔係目標——落返去係 ADR-130 嗰條近戰死亡率。

### 上一個檢查點：突變測試 (ADR-135/140)

- 「量咗但冇 assert」空手而回，改用突變測試：邊界算子完全冇價值（浮點時間上係等價突變），數值放大
  12 個生還 11 個，反轉 `if` 12 個殺死 8 個。守後果唔守常數，補咗 T33–T39。
- **一句 ADR 唔等於一條守衛**：ADR-124／118／117 三句聲稱都冇 gate。ADR-117 嗰個係真嘢——碰撞改返
  到達點取樣，252 條照樣全綠，原因係 T28 手砌小兵缺欄位，tick 一行座標變 **NaN**，而 NaN 比大細永遠
  false，即係所有距離守衛一次過失效。而家包住 `Sim.prototype.step` 逐格斷言冇非有限座標（三十格抽
  一次會**捉唔返 T28**），反方向驗過會響，仲照出 NaN 會**傳染**：一個壞物件冚六個英雄。
- **未解嘅**：打直取景 gate 飄過兩次。診斷欄位已落，過嗰次讀到 −6.8／−6.8／58，即係我「飄返泉水令
  鏡頭夾界」嘅假設**未證實**。下次再飄佢會自己講。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個：`vendor/`、Draco、**十二個 `.glb` 模型**都冇，而 `cache-bust`
  一直綠燈（佢查 `src/` import，唔係有風險嗰半）。個改動即刻整爛咗資產重試 gate（攔 `**/*.glb`，
  一加 query 就一次都冇攔過）。新 gate 直接錄低瀏覽器攞過乜。ADR-134。
- Hub 係玩家真正打開嘅第一塊畫面，但**一粒掣都冇量過**：分頁圓點 8×8、箭咀 34–42，全部低過
  專案自己嗰條 44px。箭咀升到 44；四粒點喺 320 闊之下每粒 44 幾何上塞唔落，改用 WCAG 2.5.8
  嘅 24×24 加圓心間距。而呢啲改動本來一個玩家都到唔到——Hub 個 `style.css` 冇版本標記。ADR-133。
- The combat gate said the champion stood at **x = -6**; at the attack it was at **x = -62**, having
  died in the warm-up — every swing measured inside its own fountain. `atFountain` now asserted
  false. ADR-132.
- Gold: **74.4% of match time a champion holds enough to buy while the build list forbids it**; a
  full build costs 8502 against 4191 earned, so **0/72 complete one**. Champion spread was 66 points
  tracking **range** almost exactly, now **34**; melee die **9.6** times a match against 1.3–4.3
  ranged. ADR-130.
- **The yardstick was one of the things being tuned** (ADR-131): buffing melee armour made the game
  *less* even (34 → 66) because ironhulk is a companion in every measured match.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  under one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never binding
  under flex shrink. ADR-129.
- The overlap gate exempted `.moba-tip` for `pointer-events: none` — **tip × recall 54×44** — and a
  production bug fell out: `setPointerCapture` ran **before** aim state was recorded, killing casts.
- On a 120 Hz screen only **25.2%** of frames moved a walking champion, in 0.217 m jumps; render
  interpolation took it to **97.5%**, and `src/pace.js` owns the fixed-step rule (ADR-127). The
  combat gate had warmed 750 ticks with **no view frame between**, so the FX count read a 25 s
  backlog (ADR-126).
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`** (ADR-125).
  Lost GPU context used to end the match (ADR-120); audio pinned (ADR-121); twelve models loaded via
  one `Promise.all` with no retry (ADR-122).
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered the
  shop button all match; the gates had been sampling the opening frame. ADR-119.
- Bot order alternates each tick (ADR-113); draw calls peak at 286/342 (ADR-114); portrait spent
  **83.6% on abyss and water** before the camera rotated 90° (ADR-110); `makeRng` used the seed as
  xorshift32 state so the **first output averaged 0.007** (ADR-109); SE layout fixes (ADR-116/124).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap" (ADR-105/106/107).

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **255/255** (33 s); `balance.mjs 24` → all six inside
  20–85% and 0.21–0.80 deaths a minute (321 s, not a fast gate). Browser suite not re-run: this
  round changed tests only, no source.
- `node games/moba/tests/browser.mjs` → **196/196** at five sizes (~10 min): select and post-match
  layout, full matches, FX and framing, the attack swing, smoothness at 120/60/30 fps, a skill press
  surviving a failed pointer capture, shop, draw calls, taps.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi build files. MOBA:
  `games/moba/*` (new `src/pace.js`, `tests/balance.mjs`), `scripts/*`, `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130/132): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both
  open, the 420-gold shutdown cap never firing, the layout gate's 900 ms wait not drifting.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there by
  path — if missing, `npm ci` there. `games/tower` still fetches Inter/Oxanium from Google.
- Cache token covers the whole module graph **and the Hub stylesheet** (ADR-111/133). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; `cache-bust.mjs` fails on any drift.

## Exact next action

1. Sync, then playtest on a phone — ideally 120 Hz, since ADR-127's subject is invisible below it.
2. Melee death rate is now the axis, and it is the same axis as balance: spread 34 points
   (dawnkeeper 63% / 0.30 deaths a minute, duskblade 29% / 0.80). ≥24-match runs per change,
   and **must not touch ironward/longshot/ironhulk** — those three are the yardstick (ADR-131).

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge
  skills back into one ring, restore fountain-only buying, or reuse `canShop()` for location.
