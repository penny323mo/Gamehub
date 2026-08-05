# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: `ai.js` 突變掃描 (ADR-143), 兩個都解得通嘅數 (ADR-142)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### `ai.js` 突變掃描，同埋一個掃描呃你嘅兩種方法 (ADR-143)

- 十四個突變（條件反轉／拆走規則）跑 `sim.mjs`：**七個殺死七個生還**。三個生還者係同一形狀——一條
  規則永遠唔成立，成類行為靜靜哋消失而 256 條全綠：bot 唔用保命技、唔奶隊友、唔用位移。
- 補三條規則就係三個特例。**T42 問返個總嘅問題**：兩局真對局打完，每個英雄嘅每個技能有冇出過手、
  每個 bot 有冇買到嘢。一條 gate 冚住成類，包埋將來新加嘅技能。反方向驗過：保命技突變令
  `ironward.W/R`、`ironhulk.W` 一次都唔出；奶隊友突變令 `dawnkeeper.W` 一次都唔出。
- **一個做唔到自己個名嗰件事嘅突變，會令一條好 gate 睇落好弱。** 掃描報「永遠唔買嘢」生還——但佢
  改嘅係 `wantsToShop()`，而 ADR-104 之後嗰個只決定使唔使行返屋企。改真正個 `shop()` body，T42
  即刻響（六個都 0 件），連 T40 都響（冇裝備一局拖到 17 分鐘）。係個標籤錯，唔係套件弱。
- **一個生還者只係對住你跑嗰個偵測器生還。** 剩低嘅生還者入面，「血剩 32% 都唔退」同「見人就打唔
  計實力」令每分鐘死由 0.79 升到 **1.21／1.47**，遠超 `balance.mjs` 條 1.05 線。冇靠估——真係跑咗
  慢套件驗證：duskblade 8% 勝率、1.26 每分鐘死，兩條線都響。**佢哋一直有人守，只係掃描冇叫過嗰個。**
- 而嗰次驗證照出上一輪我自己寫嘅缺陷：勝率條線 `process.exit(1)` 喺死亡頻率條線之前，即係同時整爛
  兩樣只會報第一樣。**一條會遮住另一條嘅 gate，等於少咗一條。** 兩條而家一齊收集一齊報。
- 仍然冇守而且接受：有人守都照攻城、17% 血唔甩身——只係打得差啲，冇量到嘅後果超出噪音。

### 之前三個檢查點，濃縮 (ADR-142/141/135/140)

- **一個兩邊都解得通嘅數唔算守衛** (ADR-142)。暮刃位移技冷卻好晒佔 80% 時間（最高）而一分鐘只用 1.9
  次（最低）；查落唔係 bot 唔識用，窗口一開佢 1.5 秒就出手，**係冇機會用**。T41 守轉換率。但**掉咗
  嗰條先係重點**：本來守「近戰掂得到敵方英雄嘅時間」，將暮刃速度斬半個數反而**升到 17.8%**——行得慢
  就走唔甩，畀人追住劏一樣算「掂得到」。探針三個缺陷，最衰係用 `d <= range` 而唔係系統自己嗰條
  `d <= range + target.r`，暮刃即刻 9.9% → 0.6%。**要用返系統自己評嗰條式。**
- **玩家郁唔到嘅時間** (ADR-141)。個常數叫「重生時間」但要再行 5.8 秒先返到場，**少報 48%**；最差
  一局 45% 郁唔到。兩個明顯修法量完**兩個都 revert**：重生曲線拉平三成半，總時間 **150 對 151 秒**
  （一局死多三成）——**個掣係死亡頻率唔係計時器**。條 gate 三版掉咗兩版：守佔比同守絕對秒數都會跟住
  局長走。**任何用「一場波」做分母或者總量嘅數都答唔到一條關於局長嘅問題。**
- **突變測試** (ADR-135/140)。邊界算子係等價突變冇價值，數值放大 12 個生還 11 個，反轉 `if` 12 個殺
  8 個。**一句 ADR 唔等於一條守衛**：ADR-124／118／117 三句聲稱都冇 gate。ADR-117 嗰個係真嘢——T28
  手砌小兵缺欄位令座標變 **NaN**，而 NaN 比大細永遠 false，所有距離守衛一次過失效；而家包住
  `Sim.prototype.step` 逐格斷言冇非有限座標。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個：`vendor/`、Draco、**十二個 `.glb`** 都冇，而 `cache-bust` 一直
  綠燈（佢查 `src/` import，唔係有風險嗰半）。新 gate 直接錄低瀏覽器攞過乜。ADR-134。
- Hub 係玩家打開嘅第一塊畫面但**一粒掣都冇量過**：圓點 8×8、箭咀 34–42，全部低過專案自己條 44px；
  而呢啲改動本來一個玩家都到唔到——Hub 個 `style.css` 冇版本標記。ADR-133。
- The combat gate said the champion stood at **x = -6**; at the attack it was at **x = -62**, having
  died in the warm-up — every swing measured inside its own fountain (ADR-132).
- Gold: **74.4% of match time a champion can afford something the build list forbids**; a full build
  costs 8502 against 4191 earned, so **0/72 complete one**. Champion spread was 66 points tracking
  **range** almost exactly, now **34**; melee die **9.6** times a match against 1.3–4.3. ADR-130.
- **The yardstick was one of the things being tuned** (ADR-131): buffing melee armour made the game
  *less* even (34 → 66) — ironhulk is a companion in every measured match.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  under one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never binding
  under flex shrink (ADR-129). `.moba-recall` covered `.moba-shopbtn` all match; the gates had been
  sampling the opening frame (ADR-119).
- The overlap gate exempted `.moba-tip` for `pointer-events: none` — **tip × recall 54×44** — and a
  production bug fell out: `setPointerCapture` ran **before** aim state was recorded, killing casts.
- On a 120 Hz screen only **25.2%** of frames moved a walking champion, in 0.217 m jumps; render
  interpolation took it to **97.5%**, and `src/pace.js` owns the fixed-step rule (ADR-127). The
  combat gate had warmed 750 ticks with **no view frame between** (ADR-126).
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`** (ADR-125).
  Lost GPU context used to end the match (ADR-120); audio pinned (ADR-121); twelve models via one
  `Promise.all` with no retry (ADR-122).
- Bot order alternates each tick (ADR-113); draw calls peak 286/342 (ADR-114); portrait spent **83.6%
  on abyss and water** before the camera rotated 90° (ADR-110); `makeRng` used the seed as xorshift32
  state so the **first output averaged 0.007** (ADR-109).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS stones,
  Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX profiles
  (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap" (ADR-105/106/107).

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **258/258** (44 s); `balance.mjs 24` → all six inside
  20–85% and 0.21–0.80 deaths a minute (328 s, not a fast gate). Browser suite not re-run: this
  round changed tests only, no source.
- `node games/moba/tests/browser.mjs` → **196/196** at five sizes (~10 min): select and post-match
  layout, full matches, FX and framing, the attack swing, smoothness at 120/60/30 fps, a skill press
  surviving a failed pointer capture, shop, draw calls, taps.

## Changed files

- Hub `index.html`/`launcher.js`/`style.css`/`tests/hub.mjs`, Xiangqi build files, `games/moba/*`
  (new `src/pace.js`, `tests/balance.mjs`), `scripts/*`, `docs/ai/*.md`. This round: tests only.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130/132): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both open,
  the 420-gold shutdown cap never firing, the layout gate's 900 ms wait not drifting.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there by
  path — if missing, `npm ci` there. `games/tower` still fetches Inter/Oxanium from Google.
- **未解嘅**：打直取景 gate 飄過兩次；診斷已落，過嗰次讀到 −6.8／−6.8／58，即係「飄返泉水」呢個假設未證實。
- Cache token covers the whole module graph **and the Hub stylesheet** (ADR-111/133). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; `cache-bust.mjs` fails on any drift.

## Exact next action

1. Sync, then playtest on a phone — ideally 120 Hz, since ADR-127's subject is invisible below it.
2. Melee is the axis, and it is the same axis as balance: duskblade 29% win / 0.80 deaths a minute /
   9.5% of its life in reach of a champion, against dawnkeeper 63% / 0.30 / 33%. ≥24-match runs per
   change, and **must not touch ironward/longshot/ironhulk** — those are the yardstick (ADR-131).

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
