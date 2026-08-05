# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 一件事寫三次 (ADR-144), `ai.js` 突變掃描 (ADR-143)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### 一件事寫三次，就有三個唔同嘅答案 (ADR-144)

- `sim.js` 發出 26 種事件，六種（`gameover`／`recallStart`／`respawn`／`sell`／`shoot`／`wave`）全份
  `src/` 冇消費者。大部分無害（HUD 輪詢 `recallProgress()` 代替），但 **`shoot` 唔係**：「呢一下有冇
  嘢飛」寫咗三次——sim `proj && dist > 2.5`、sfx `a.def?.projectile || a.range > 5`、view `e.range < 5`。
  實測兩局 5253 下普攻，音效 **588 下（11.2%）播弓弦聲而冇任何嘢飛**，反方向零次；其中 **350 下係塔
  同水晶，佢哋根本冇彈道即係每一下都錯**。`view.js` 同一個病，畫住箭嘅拖影。
- 修法唔係逐邊補條件（嗰樣係第四條式），係擺返件事實喺事件度：`attack` 而家帶 `projectile`，兩個消費
  者照讀。同 `ai.js` 攻城嗰句一樣：**規則喺 sim 度，唔喺呢度抄一份**。
- T43 動態守合約：每下普攻事件講嘅要同真係有冇 `shoot` 一致，建築永遠唔可以報有飛。反方向驗過——將
  舊嗰條 sfx 估法搬入個 emit，**一模一樣重現咗 588／350**。呢輪改咗 source，token 升到 `assets-27`。

### 上一個檢查點：`ai.js` 突變掃描 (ADR-143)

- 十四個突變跑 `sim.mjs`：**七殺七生**。三個生還者同一形狀——規則永遠唔成立，成類行為靜靜哋消失而
  256 條全綠。**T42 問返總嘅問題**：兩局真對局打完，每個技能有冇出手、每個 bot 有冇買到嘢。
- **做唔到自己個名嗰件事嘅突變，會令好 gate 睇落好弱**：報「永遠唔買嘢」生還，但佢改嘅係
  `wantsToShop()`（ADR-104 之後只決定行唔行返屋企）；改真正個 `shop()`，T42 同 T40 即刻一齊響。
- **一個生還者只係對住你跑嗰個偵測器生還**：「32% 唔退」同「見人就打」令每分鐘死 0.79 → 1.21／1.47，
  真係跑咗慢套件驗證：duskblade 8% 勝率、1.26 每分鐘死，兩條線都響。
- 而嗰次驗證照出我上一輪自己寫嘅缺陷：勝率條線 `process.exit(1)` 喺死亡頻率之前，**一條會遮住另一條
  嘅 gate 等於少咗一條**；而家一齊報。兩個生還者接受唔守（攻城、17% 甩身）。

### 之前三個檢查點，濃縮 (ADR-142/141/135/140)

- **一個兩邊都解得通嘅數唔算守衛** (ADR-142)。暮刃位移技冷卻好晒佔 80% 時間而一分鐘只用 1.9 次——唔
  係 bot 唔識用，窗口一開佢 1.5 秒就出手，**係冇機會用**（T41 守轉換率）。但**掉咗嗰條先係重點**：
  本來守「近戰掂得到敵方英雄嘅時間」，將暮刃速度斬半個數反而**升到 17.8%**（行得慢就走唔甩）；探針
  最衰嗰個缺陷係用 `d <= range` 而唔係系統自己嗰條 `d <= range + target.r`（9.9% → 0.6%）。
- **玩家郁唔到嘅時間** (ADR-141)。「重生時間」少報 48%；最差一局 45% 郁唔到。兩個明顯修法量完**兩個
  都 revert**：曲線拉平三成半，總時間 **150 對 151 秒**——**個掣係死亡頻率唔係計時器**。條 gate 三版
  掉咗兩版：**任何用「一場波」做分母或者總量嘅數都答唔到一條關於局長嘅問題。**
- **突變測試** (ADR-135/140)。邊界算子係等價突變，數值放大 12 生還 11，反轉 `if` 12 殺 8。**一句 ADR
  唔等於一條守衛**。ADR-117 嗰個係真嘢——T28 手砌小兵缺欄位令座標變 **NaN**，NaN 比大細永遠 false，
  所有距離守衛一次過失效；而家逐格斷言冇非有限座標。

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
  `cache-bust.mjs` → pass (`assets-27`); `sim.mjs` → **260/260** (52 s); `balance.mjs 24` → all six
  inside 20–85% and 0.21–0.80 deaths a minute (328 s, not a fast gate).
- `node games/moba/tests/browser.mjs` → **196/196** at five sizes (~10 min): layout, full matches, FX
  and framing, the attack swing, smoothness at 120/60/30 fps, shop, draw calls, taps.

## Changed files

- Hub `index.html`/`launcher.js`/`style.css`/`tests/hub.mjs`, Xiangqi build files, `games/moba/*`, `scripts/*`, `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130/132): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both open,
  the 420-gold shutdown cap never firing, the layout gate's 900 ms wait not drifting.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there by
  path — if missing, `npm ci` there. `games/tower` still fetches fonts from Google.
- **未解嘅**：打直取景 gate 飄過兩次；診斷已落，過嗰次讀到 −6.8／−6.8／58，即係「飄返泉水」呢個假設未證實。
- Cache token covers the whole module graph **and the Hub stylesheet** (ADR-111/133); change it with
  `node scripts/moba-bump-cache.mjs <token>`, never by hand. `cache-bust.mjs` fails on any drift.

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
