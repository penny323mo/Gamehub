# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: `ai.js` 冇守衛 (ADR-142), 玩家郁唔到嘅時間 (ADR-141)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### `ai.js` 一條守衛都冇，同埋一個兩邊都解得通嘅數 (ADR-142)

- 起點係一組似 bug 嘅數：暮刃（刺客、射程 2.4、勝率最低 29%、死最密 0.80／分鐘）個位移技**冷卻好晒
  佔 80% 時間**（六個最高）而**一分鐘只用 1.9 次**（最低）。唔係 bot 唔識用——窗口一開佢平均 1.5 秒
  出手而冷卻五秒；個窗口一共只開 185 秒（生存 3081 秒）。**係冇機會用。**
- 但照出咗：ADR-135 嗰輪突變掃過 sim／input／hud／view，**冇掃過 `ai.js`**，而五個 bot 四個係佢揸。
  條位移規則要求 `state === STATE.FIGHT`，呢個條件一收窄，位移技就靜靜哋永遠唔出手而全部檢查照綠。
  T41 守轉換率（窗口開住三秒內要出手，而家 1.57 秒），三個 `ai.js` 突變全部殺死佢。
- **掉咗嗰條 gate 先係重點**：本來守「近戰掂得到敵方英雄嘅時間」（暮刃 9.5%／鐵魁 15.1%／鐵衛 15.7%，
  同勝率死亡率一致）。將暮刃速度斬半，個數**升到 17.8%**——行得慢就走唔甩，畀人追住劏一樣算「掂得
  到」。**一個兩邊都有好故事嘅數係描述，唔係守衛**，所以刪咗，唔出。
- 三個探針缺陷（頭兩個出過全零嘅靚表）：cast 欄位係 `index` 唔係 `slot`、hit 係 `target`；最衰係用
  `d <= range` 而唔係系統自己嗰條 `d <= range + target.r`，暮刃即刻 9.9% → 0.6%。

### 上一個檢查點：玩家郁唔到嘅時間 (ADR-141)

- 個常數叫「重生時間」，但要再行 5.8 秒／41 米先返到場——**少報咗 48%**（同 `pace.js` 個 `dropped`
  一樣，一個名擔起成條政策只認自己嗰半）。最差嗰局 **45% 時間郁唔到**。
- 兩個明顯修法做咗量咗**兩個都 revert**。重生曲線拉平三成半：24 局總郁唔到時間 **150 對 151 秒**，
  因為一局死多三成（7.6 → 9.9）。**個掣係死亡頻率，唔係計時器。** 泉水加速反而 150 → 158。
- 條 gate 寫咗三版，掉咗嗰兩版先係重點：守佔比→減短計時器就「達標」而絕對數變差（分母大咗）；守絕對
  秒數→斬半血量四分鐘輸咗，讀數 182 → 91 綠燈（分子細咗）。**任何用「一場波」做分母或者做總量嘅數都
  答唔到一條關於局長嘅問題。** 而家守單次最長 ≤ 40 秒、一局 ≤ 16 分鐘、每分鐘死 ≤ 1.05（後者喺
  `balance.mjs`：三局讀 0.87 對 0.90 而真變化係 0.79 對 1.04，**分唔清嘅 gate 唔係鬆，係假**）。

### 再上一個：突變測試 (ADR-135/140)

- 邊界算子完全冇價值（浮點時間上係等價突變），數值放大 12 個生還 11 個，反轉 `if` 12 個殺死 8 個。
  守後果唔守常數，補咗 T33–T39。**一句 ADR 唔等於一條守衛**：ADR-124／118／117 三句聲稱都冇 gate。
- ADR-117 嗰個係真嘢：T28 手砌小兵缺欄位，tick 一行座標變 **NaN**，而 NaN 比大細永遠 false，所有距離
  守衛一次過失效。而家包住 `Sim.prototype.step` 逐格斷言冇非有限座標（三十格抽一次**捉唔返 T28**），
  反方向驗過會響，仲照出 NaN 會**傳染**。

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
  `cache-bust.mjs` → pass; `sim.mjs` → **256/256** (36 s); `balance.mjs 24` → all six inside
  20–85% and 0.21–0.80 deaths a minute (321 s, not a fast gate). Browser suite not re-run: this
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
