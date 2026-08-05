# Current cross-agent handoff

Updated: 2026-08-05 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Hub 兩格一直係 404 (ADR-145), 一件事寫三次 (ADR-144)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Hub 十三格入面，兩格由上線第一日起撳落去就係 404 (ADR-145)

- 之前每一輪都喺量 MOBA。Hub 量過掣夠唔夠大、圓點隔幾遠（ADR-133），但冇量過一個選單最基本嗰件事：
  **撳落去有冇嘢**。`ashen-rail/dist/index.html` 同 `elden-ring-ii/dist/index.html` 兩個都係 **404**。
- 成因喺 `.gitignore`：兩個 `dist/` 都被排除。呢個倉係靜態 GitHub Pages，冇 CI build step，Pages 直接
  派倉入面嘅檔——即係 `dist/` 唔係中間產物，**佢本身就係交付物**。tower／snake／xiangqi 一直都有入，
  得佢哋兩個冇。一個「唔好入 build 產物」嘅通用習慣，用喺一個 build 產物就係網站嘅倉度，就變成
  「唔好上線」。
- 兩個都由源碼 build 得返，commit 之前用瀏覽器載過：灰燼列車去到「載入 荒原槍手… 50%」、Elden Ring II
  出到標題，**兩個都零 page error、零外部請求**。代價係 1002 個檔約 **53 MB**（其他 dist 係 716K／
  276K／616K，因為呢兩個要帶 GLB 同音樂）。
- 個代價大部分係重複（`dist/assets` 係已入 git 嘅 `public/` 副本）。另一條路（`publicDir: false` +
  改寫資產路徑去 `../public/`）**係考慮咗之後否決**：路徑係 `base: "./"` 之下嘅相對路徑，改完會整爛
  `npm run dev`，而兩隻 3D 遊戲喺呢度肉眼驗唔到。**一格死鏈實實在在差過一份重複資產。**
- `tests/hub.mjs` 而家逐個 `launcher.js` 嘅 `link:` 查檔案在唔在（修之前兩條都響，修完 13/13）。順帶：
  靜態讀 `launcher.js` 查到 13 格，而我用瀏覽器掃嗰版只搵到 11 格——**平嗰個檢查又快又齊**。
- 兩個 clean negative，記低唔好再查：四隻遊戲由 jsdelivr 載 `supabase-js@2`、象棋由 `dl.polyhaven.org`
  攞 HDRI，攔晒外部主機之後全部只係降級（五子棋自己講 `[Online] Supabase SDK not loaded`），冇一隻拋
  page error；`gomoku/build_info.js` 本地 404 係因為 `deploy-pages.yml:66` 部署時先生成，版面有守。

### 之前五個檢查點 (ADR-144/143/142/141/135)

- **一件事寫三次就有三個答案** (ADR-144)。「呢一下有冇嘢飛」sim 寫 `proj && dist > 2.5`、sfx 寫
  `a.def?.projectile || a.range > 5`、view 寫 `e.range < 5`。兩局 5253 下普攻，音效 **588 下（11.2%）
  播弓弦聲而冇任何嘢飛**（其中 350 下係塔同水晶，佢哋根本冇彈道），反方向零次。修法係擺返件事實喺
  事件度：`attack` 而家帶 `projectile`，T43 動態守。token `assets-27`。
- **`ai.js` 突變掃描** (ADR-143)。十四個突變七殺七生；三個生還者同一形狀（規則永遠唔成立，成類行為
  消失而全綠），T42 改為問「每個技能有冇出手、每個 bot 有冇買到嘢」。兩個關於掃描本身嘅教訓：**做唔到
  自己個名嗰件事嘅突變會令好 gate 睇落好弱**；**一個生還者只係對住你跑嗰個偵測器生還**。而嗰次驗證
  照出我自己嘅缺陷：勝率條線 `process.exit(1)` 遮住咗死亡頻率條線。
- **一個兩邊都解得通嘅數唔算守衛** (ADR-142)。本來守「近戰掂得到敵方英雄嘅時間」，將暮刃速度斬半個數
  反而**升到 17.8%**（行得慢就走唔甩），所以刪咗唔出。探針最衰嗰個缺陷：用 `d <= range` 而唔係系統
  自己嗰條 `d <= range + target.r`（9.9% → 0.6%）。
- **玩家郁唔到嘅時間** (ADR-141)。「重生時間」少報 48%；曲線拉平三成半總時間 **150 對 151 秒**——
  **個掣係死亡頻率唔係計時器**。**任何用「一場波」做分母或者總量嘅數都答唔到一條關於局長嘅問題。**
- **突變測試** (ADR-135/140)。邊界算子係等價突變，反轉 `if` 12 殺 8。**一句 ADR 唔等於一條守衛**。
  T28 手砌小兵缺欄位令座標變 **NaN**，所有距離守衛一次過失效；而家逐格斷言冇非有限座標。

### Earlier checkpoints, in one line each

- 版本標記只覆蓋 67 個請求入面 19 個（`vendor/`、Draco、十二個 `.glb` 都冇），而 `cache-bust` 一直綠燈
  ——佢查 `src/` import，唔係有風險嗰半。新 gate 直接錄低瀏覽器攞過乜。ADR-134。
- Hub 係玩家打開嘅第一塊畫面但**一粒掣都冇量過**：圓點 8×8、箭咀 34–42，全部低過專案自己條 44px；而
  呢啲改動本來一個玩家都到唔到——Hub 個 `style.css` 冇版本標記。ADR-133。
- The combat gate said the champion stood at **x = -6**; at the attack it was at **x = -62**, having
  died in the warm-up — every swing measured inside its own fountain (ADR-132).
- Gold: **74.4% of match time a champion can afford something the build list forbids**; a full build
  costs 8502 against 4191 earned, so **0/72 complete one**. Spread was 66 points tracking **range**
  almost exactly, now **34**; melee die **9.6** times a match against 1.3–4.3 (ADR-130). And **the
  yardstick was one of the things being tuned** (ADR-131): buffing melee armour made it *less* even.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  under one card (78 vs 228 at 568×320) — **zero complete cards** (ADR-129). `.moba-recall` covered
  `.moba-shopbtn` all match; the gates sampled the opening frame (ADR-119). The overlap gate exempted
  `.moba-tip` for `pointer-events: none`, and a production bug fell out — `setPointerCapture` ran
  **before** aim state was recorded, killing casts.
- On a 120 Hz screen only **25.2%** of frames moved a walking champion, in 0.217 m jumps; render
  interpolation took it to **97.5%**, and `src/pace.js` owns the fixed-step rule (ADR-127). The
  combat gate had warmed 750 ticks with **no view frame between** (ADR-126).
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`** (ADR-125).
  Lost GPU context used to end the match (ADR-120); audio pinned (ADR-121); twelve models via one
  `Promise.all` with no retry (ADR-122). Bot order alternates each tick (ADR-113); draw calls peak
  286/342 (ADR-114); portrait spent **83.6% on abyss and water** before the camera rotated 90°
  (ADR-110); `makeRng` used the seed as xorshift32 state so the **first output averaged 0.007**
  (ADR-109).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS stones,
  Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX profiles
  (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100). iOS: `overflow-y: auto` +
  `touch-action: pan-y` reads drift as a scroll and synthesises no `click`; `src/tap.js` owns "what
  counts as a tap" (ADR-105/106/107).

## Verification

- `node tests/hub.mjs` → **96/96**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
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
