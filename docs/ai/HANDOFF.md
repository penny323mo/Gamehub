# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202、ADR-203
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: Tower 兩輪「喺一部真手機上面」嘅缺陷已修並補咗 gate；順手大修咗一條一路靠彩數過嘅 gate

## Current objective

繼續 refine Tower 到「99.99% product-ready」。呢兩輪嘅入手點都係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，
但冇一條問過「喺一部真手機上面，呢個掣掂唔掂得到、呢個數睇唔睇得到、
等緊嗰陣有冇交代」。

## Completed

**ADR-202（commit `c234210`，已合埋 main）**

- **六個掂唔到嘅掣**：iPhone SE 375×667 度 pause 淨係 37×37，help／speed／sound／
  hub／skip 都係 36 高——`#hud>button` 只寫 `padding`。加 `min-height/min-width: 44px`；
  新 gate 跟住捉多一個我未量過嘅：SE 橫嘅淺身底座 `.build-btn` 48×**42**。
- **建塔欄捲得到但睇唔出捲得到**：386px 塞入 341px。捲**係**得嘅（我第一版讀錯咗
  `#build-menu` 嘅 `overflow-x` 就話買唔到狙擊塔，實情捲喺 `.build-grid`），
  加咗兩邊 `mask-image` 漸隱。
- **備戰橫額壓住 gold／lives／wave**：`top: 88px` 假設 HUD 74px 高，實測有四個高度。
  幾何相交 73–100%，pixel diff 訊號 40–57% 對雜訊底 5–16%。改成量 HUD 實際 `bottom`
  寫入 `--hud-bottom`。改完五個尺寸相交 0%。
- **修好 `tests/gateway.mjs` 嘅閃光 gate**：舊版四張相冇一張影到 0.55 秒嘅閃光，
  而個底自己喺度呼吸（掃過 0.9–4.1pp），門檻卻寫 0.45。重寫量法，門檻由實測定（4）。

**ADR-203（本輪）**

- **撳咗 START 之後嘅靜默**：要落 1,860 KB（758 JS ＋ 1,086 GLB）。實測 Fast 3G
  撳完等 **7.1 秒**、Slow 3G **23.7 秒**、冇限速都 3.5 秒，而**期間畫面一個 pixel 都冇變**。
  加咗停用 ＋ 進度條（數字由 `載模型` 度計，唔喺 `預載` 度計，因為開場有兩條清單）。
- **再撳一次會真係開多次波**：實測 `開波次數 = 2`（兩次 `startNextWave`、
  音樂疊住播、第二次覆蓋 `state`）。加 `disabled` ＋ `啟動中` 兩重擋。
- **`tests/load.mjs` 新增**（5 條，已入 `test:browser`），用 CDP 真節流，唔係 `sleep` 扮慢。

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

- 承上：Vite 758 kB 單 chunk warning；cap-30 探針第 87 波後剩 54,248 金未使。
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
