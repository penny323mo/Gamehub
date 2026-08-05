# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 修好 Penny 報嘅 CD 卡住 (ADR-146)；**balance 而家係紅色，下一輪專攻**

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Penny 報嘅「技能 CD 會卡住」，同埋佢一直幫緊近戰 (ADR-146)

- 兩個冷卻都寫喺「用緊佢嗰條路徑」入面，唔係喺 tick 度。`a.cd -= dt` 喺 `#tryAttack`，而佢淨係喺有
  目標喺射程內先叫——實測收手之後 `p.cd` **永遠停喺 0.925**。除咗個掃描睇落壞咗，隔十秒再開打你仲要
  由凍結嗰個位等返落去。`abilityCd` 喺 `#tickChampion`，而死咗嘅單位入唔到——死兩秒，個數紋風不動；
  死一次已經罰咗 22 秒（ADR-141），唔應該罰兩次。
- **同一個 loop 為同一個形狀修過一次**：`moving` 之前只喺 `#moveToward` 設 true，冇人清，角色原地永久
  跑步。兩個冷卻而家都喺 `step()` entity loop 頂無條件跌。攻速冇變（三個英雄搬前搬後都係廿秒 20 下），
  T44 兩半都守，各自搬返舊位就各自響。
- **但個修正令遊戲難咗，balance 而家肥咗。** 塔同小兵先係舊 bug 最大得益者：閒置嘅塔留住舊冷卻，重新
  鎖定嗰下會遲，而家即刻開火（本來就應該係咁）。行入去食塔火嘅近戰蝕最多。24 局：差幅 34 → **45**，
  **ironhulk 17%，低過條 20% 線**（全修同只修普攻半都係 17%，穩定；duskblade 13% 喺噪音範圍）。
- **照出。** 為咗一個平衡數字而留住一個玩家見到嘅缺陷，等於留住一個啱好補償緊另一個問題嘅 bug。啲數
  真正講嘅係：**近戰一直被呢個 bug 保護緊**。同一輪再調平衡就係重蹈 ADR-131，所以留紅，下一輪專攻。

### 上一個檢查點：Hub 兩格一直係 404 (ADR-145)

- Hub 量過掣夠唔夠大、圓點隔幾遠（ADR-133），但冇量過一個選單最基本嗰件事：**撳落去有冇嘢**。
  `ashen-rail/dist/index.html` 同 `elden-ring-ii/dist/index.html` 兩個都係 **404**。
- 成因喺 `.gitignore`：兩個 `dist/` 都被排除。呢個倉係靜態 GitHub Pages，冇 CI build step——即係
  `dist/` 唔係中間產物，**佢本身就係交付物**。tower／snake／xiangqi 一直都有入，得佢哋兩個冇。
- 兩個都 build 得返，commit 前用瀏覽器載過（零 page error、零外部請求），代價約 **53 MB**。另一條路
  （`publicDir: false` 改寫資產路徑）**考慮咗之後否決**：會整爛 `npm run dev`。**一格死鏈實實在在差過
  一份重複資產。** `tests/hub.mjs` 而家逐個 link 查檔案在唔在。
- Clean negative 記低咗：四隻遊戲由 jsdelivr 載 `supabase-js@2`、象棋攞 HDRI，攔晒外部主機之後全部
  只係降級；`gomoku/build_info.js` 本地 404 係 `deploy-pages.yml` 部署時先生成。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)。「呢一下有冇嘢飛」sim／sfx／view 各寫一條式；兩局 5253 下
  普攻，音效 **588 下（11.2%）播弓弦聲而冇任何嘢飛**（350 下係塔同水晶，根本冇彈道）。修法係擺返件
  事實喺事件度：`attack` 而家帶 `projectile`，T43 動態守。
- **`ai.js` 突變掃描** (ADR-143)。十四個突變七殺七生；T42 改為問「每個技能有冇出手、每個 bot 有冇買
  到嘢」。兩個教訓：**做唔到自己個名嗰件事嘅突變會令好 gate 睇落好弱**；**一個生還者只係對住你跑嗰個
  偵測器生還**。順帶照出勝率條線 `process.exit(1)` 遮住咗死亡頻率條線。
- **一個兩邊都解得通嘅數唔算守衛** (ADR-142)。本來守「近戰掂得到敵方英雄嘅時間」，將暮刃速度斬半個數
  反而**升到 17.8%**，所以刪咗唔出。探針最衰嗰個缺陷：用 `d <= range` 而唔係 `d <= range + target.r`。
- **玩家郁唔到嘅時間** (ADR-141)。「重生時間」少報 48%；曲線拉平三成半總時間 **150 對 151 秒**——
  **個掣係死亡頻率唔係計時器**。**任何用「一場波」做分母或者總量嘅數都答唔到一條關於局長嘅問題。**
- **突變測試** (ADR-135/140)。反轉 `if` 12 殺 8。**一句 ADR 唔等於一條守衛**。T28 手砌小兵缺欄位令
  座標變 **NaN**，所有距離守衛一次過失效；而家逐格斷言冇非有限座標。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個，而 `cache-bust` 一直綠燈——佢查 `src/` import，唔係有風險嗰半。
  新 gate 直接錄低瀏覽器攞過乜（ADR-134）。Hub 圓點 8×8、箭咀 34–42 全部低過自己條 44px，而呢啲改動
  本來一個玩家都到唔到，因為 Hub 個 `style.css` 冇版本標記（ADR-133）。
- The combat gate said the champion stood at **x = -6**; at the attack it was at **x = -62**, having
  died in the warm-up — every swing measured inside its own fountain (ADR-132).
- Gold: **74.4% of match time a champion can afford something the build list forbids**; a full build
  costs 8502 against 4191 earned, so **0/72 complete one**. Spread was 66 points tracking **range**
  almost exactly (ADR-130). And **the yardstick was one of the things being tuned** (ADR-131):
  buffing melee armour made it *less* even.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  under one card (78 vs 228 at 568×320) — **zero complete cards** (ADR-129). `.moba-recall` covered
  `.moba-shopbtn` all match (ADR-119). The overlap gate exempted `.moba-tip`, and a production bug
  fell out — `setPointerCapture` ran **before** aim state was recorded, killing casts.
- On a 120 Hz screen only **25.2%** of frames moved a walking champion; render interpolation took it
  to **97.5%**, and `src/pace.js` owns the fixed-step rule (ADR-127). The combat gate had warmed 750
  ticks with **no view frame between** (ADR-126). The buy rule was written three times, agreeing
  **only because `canShop` returns `!!c`** (ADR-125).
- Lost GPU context used to end the match (ADR-120); audio pinned (ADR-121); twelve models via one
  `Promise.all` with no retry (ADR-122). Bot order alternates each tick (ADR-113); draw calls peak
  286/342 (ADR-114); portrait spent **83.6% on abyss and water** (ADR-110); `makeRng` used the seed
  as xorshift32 state so the **first output averaged 0.007** (ADR-109).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS stones,
  Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX profiles
  (ADR-103), anywhere-shop (ADR-104). iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as
  a scroll and synthesises no `click`; `src/tap.js` owns "what counts as a tap" (ADR-105/106/107).

## Verification

- `node tests/hub.mjs` → **96/96**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass (`assets-28`); `sim.mjs` → **262/262**; `balance.mjs 24` → all six
  **紅色**：ironhulk 17% 低過 20% 線（ADR-146 之後，預期之內，下一輪處理）。
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

1. **平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45。要重新做基準（`balance.mjs 24`），一次改一樣，
   每次 ≥24 局。今次個成因係已知嘅：塔同小兵嘅冷卻修好咗，環境傷害實質上升，行入去嗰啲蝕最多。
   注意 ADR-131：ironward／longshot／ironhulk 係把尺，郁咗就要重新做晒基準先可以比較。
2. Sync，然後喺真手機試 —— 最好 120 Hz，因為 ADR-127 嗰樣嘢喺以下睇唔到。

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge skills
  back into one ring, restore fountain-only buying, or reuse `canShop()` for location. Do not re-tune
  `RESPAWN_*` for idle time (ADR-141) or re-add a melee "contact time" gate (ADR-142).
