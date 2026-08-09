# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 206
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: Tower 四輪改善已合埋 main；ADR-206 將同一把手機尺掃咗成個 hub 十二個介面

## Current objective

繼續 refine Tower 到「99.99% product-ready」。呢兩輪嘅入手點都係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，
但冇一條問過「喺一部真手機上面，呢個掣掂唔掂得到、呢個數睇唔睇得到、
等緊嗰陣有冇交代」。

## Completed

**ADR-202（commit `c234210`，已合埋 main）**

- 44×44 掂得到（六個掣本來 36–37px 高）、建塔欄兩邊漸隱、備戰橫額改由
  `--hud-bottom` 錨住，唔再壓住 gold／lives／wave（幾何相交 73–100% → 0%）。
- **修好 `tests/gateway.mjs` 嘅閃光 gate**：舊版四張相冇一張影到 0.55 秒嘅閃光，
  而個底自己喺度呼吸（掃過 0.9–4.1pp），門檻卻寫 0.45。重寫量法，門檻由實測定（4）。

**ADR-203（本輪）**

- **撳咗 START 之後嘅靜默**：要落 1,860 KB。Fast 3G 撳完等 7.1 秒、
  Slow 3G 23.7 秒，而期間畫面一個 pixel 都冇變。加咗停用 ＋ 進度條
  （數字由 `載模型` 度計，因為開場有兩條清單）。
- **再撳一次會真係開多次波**：實測 `開波次數 = 2`。加 `disabled` ＋ `啟動中` 兩重擋。
  `tests/load.mjs` 新增（5 條，已入 `test:browser`），用 CDP 真節流唔係 `sleep` 扮慢。

**ADR-204（本輪）— Penny 話「個地圖唔夠廣闊」**

- 量落去唔係地細，係**個世界喺你最想望遠嗰陣斷咗**：佈景本來去到 X ±19／Z ±15，
  而鏡頭 zoom 得出到 2.2 倍（望到半對角 24.2）。一 zoom 到盡，見到嘅係
  19→33 一條光板地帶，加 18 枝孤零零嘅圓錐。
- 佈景範圍改由鏡頭推出嚟（密度跟距離跌）：1,115 件 → 3,775 件，伸到 X ±37／Z ±33。
  遠山一圈 18 個 Mesh → 三圈 66 個 instance，**draw call 由 18 變 1**。
- `underlayPadding` 同高度包絡線拆做兩個數（新 `envelopeRadius`），
  唔係嘅話「鋪遠啲」會靜靜雞攤平島邊嘅起伏。
- **一格可玩地都冇郁**：`LAYOUT`、148 格、路線、經濟、波表全部原封不動。
- 代價：桌面空場三角 141,362 → 384,294，手機 34,588 → 62,172；
  draw call 桌面 247→248、手機 125→126。兩邊都遠低過 budget。
- `map-browser.mjs` 加一條：最遠嗰件擺設要超出 zoom 到盡望到嘅範圍（8/8）。

**ADR-205（本輪）— 輕微擴格＋條路重畫＋難度補返**

- 格 20×12 → **24×14**，origin (−10,−6) → (−12,−7)；陸地 148 → **178 格**；
  條路 31 格 8 彎 → **37 格 10 彎**（raw 30→36、smooth 29.1→35.09）；
  貼路塔位 60 → **72**；入口 [0,5]→[0,6]、出口 [19,4]→[23,5]；
  三區 colRange → 0-7 / 8-15 / 16-23；河由 col 10 搬去 col 11、橋 [11,5]。
- **擴完一定要重掃難度**：未補之前 cap-30 由「贏但跌 4 命」變成「20/20 一條唔跌」
  ——ADR-200 擺喺最後三分一嘅壓力冇晒。掃 HP 二次項 0.0022（冇分別）／
  0.0024（18/20）／**0.0026（15/20，最貼近原本 16/20）**，揀咗 0.0026。
- 新梯度（seed 198）：cap 20 → LOST wave **80**（舊 90，低嗰級真係硬咗）；
  cap 30 → WON **15/20**；無限制 → WON 20/20、66 塔、剩 **9,120** 金
  （ADR-201 嗰個「剩 54,248 金冇得使」嘅尾巴，因為多咗塔位而大致收返）。
- 五個 gate 跟住改：map 31/8 → 37/10、陸地下限 130→160、
  148 → 178（map-browser／performance／projectile-renderer）、route controls 10→12。
  **`flow.mjs` 仲有三處寫死同一格**，其中一處係世界座標 `11.5 / 5.5`
  ——grep 格座標搵唔到佢。

**ADR-206（本輪）— 同一把手機尺掃成個 hub**

- 新 `tests/hub-touch.mjs`：iPhone SE 375×667 逐個開場畫面問四句。
  十二個介面全部載得起、開場零 error、375px 唔爆版——**三條本來就過**；
  掂得到嘅控制 ≥44×44 **捉到八個介面共 24 個**。
- 最嚴重 Empire Royale 12 個（四個角掣 40×40、五個分頁 58×35、模式／難度掣 41–43）；
  Tower 自己仲有 3 個（開場難度掣 37 高）——**ADR-202 嗰把尺撳咗 START 之後先量，
  睇唔到開場畫面**。一把尺嘅盲點要另一把尺喺唔同時機先捉到。
- Hub 嘅 carousel 圓點 24×24 **冇當佢係 bug**：嗰度已寫明特登用 WCAG 2.5.8，
  因為 320px 之下 44×4 塞唔落。個例外連理由一齊寫咗入把尺度，
  **唔係將標準由 44 改細**。
- 改法一律 `min-height`／`min-width`。Royale 角掣 40→44 之後，
  `#help-btn` 嘅 `right: 58px` 同 `#cam-controls` 嘅 `top: 58px` 係手算嘅
  「40 ＋ 間距」，一齊加到 62。修完再掃仲有兩個先浮現（本來畀第一層擋住）。
- **橫屏補一輪**：把尺加咗 667×375，變成 12 個介面 × 2 個姿勢。捉到
  Royale `#rank-badge` 橫屏得 189×36（直屏分兩行所以夠高）。另外四個
  「跌出畫面底」嘅控制驗完全部捲得返入嚟，唔係 bug——條 check 改成
  **真係 `scrollIntoView` 一次再睇**，唔靠讀 overflow 去估。5/5。
- Playwright 淨係裝喺 `games/tower/node_modules`，所以個 test 做咗 resolve fallback，
  搵唔到會叫你 `(cd games/tower && npm ci)`。

## Changed files

- `games/tower/src/main.ts`（`錨定橫額()`、`等資產()`、`啟動中`、seam 加 `開波次數`）
- `games/tower/src/render/assets.ts`（`載入進度()` 計喺 `載模型`）
- `games/tower/src/ui/style.css`、`games/tower/index.html`（進度條、44×44、漸隱、橫額錨）
- `games/tower/tests/{touch,load}.mjs`（新）、`games/tower/tests/gateway.mjs`（閃光量法大修）
- `games/tower/package.json`、`games/tower/dist/`、`docs/ai/{DECISIONS,HANDOFF}.md`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- `touch.mjs` 6/6、`load.mjs` 5/5、`gateway.mjs` 連跑三次 11/11
  （青增 10.12／9.99／10.70，門檻 4）。
- Mutation 驗過五次，每次都報紅而且叫得出係邊個：拆走 `min-height`、
  改返 `top: 88px`、閃光貢獻歸零、拆走載入交代、拆走重入防護。

## Known issues and cautions

- 承上：Vite 758 kB 單 chunk warning。
- **雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`**。
- **`pgrep -f <字>` 喺呢個環境會撞到自己**（等緊嗰啲 shell 個 command line 都含住個字），
  寫 `until ! pgrep -f x` 會永遠唔完。
- **`git checkout <file>` 剷嘅係未 commit 嘅嘢**：做 mutation 測試要先 `cp` 一份好版本，
  唔好用 `git checkout` 還原。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. 讀 ADR-202／203。想繼續收窄「真手機」呢條線嘅話，`tests/load.mjs` 已經有個位
   擺載入時間嘅 gate——1,860 KB 未縮過，758 kB 單 chunk 同 1,086 KB GLB 兩邊都有位。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：唔好將 `#wave-banner` 改返寫死 `top`；
  唔好將閃光 gate 改返「影幾張相攞最大值」（量唔到 0.55 秒嘅瞬態）；
  唔好將 `enterRun` 改返直接 `await 地面好`（撳完就冇交代）。
