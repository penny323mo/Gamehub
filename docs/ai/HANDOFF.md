# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: Tower 手機觸控＋HUD 可讀性一輪完成；順手大修咗一條一路靠彩數過嘅 gate

## Current objective

繼續 refine Tower 到「99.99% product-ready」。呢一輪由「Codex 套件冇守到嘅範圍」入手，
量咗手機人體工學同 HUD 可讀性，兩樣都補咗 gate。

## Completed

- **掂得到嘅控制細過 44×44**：iPhone SE 375×667 度六個掣 36–37px 高
  （pause 37×37、help 39×36、speed/sound/hub 46–47×36、skip 81×36），
  全部由 `#hud>button` 只寫 `padding` 冇寫 `min-height` 嚟。加 `min-height/min-width: 44px`。
  新 gate 跟住捉多一個我未量過嘅：SE 橫嘅淺身底座 `.build-btn` 48×**42**，一併修。
- **建塔欄捲得到但睇唔出捲得到**：七個掣要 386px 而個格得 341px。捲**係**得嘅
  （我第一版讀錯咗 `#build-menu` 嘅 `overflow-x` 就話買唔到狙擊塔，實情捲喺 `.build-grid`），
  但捲軸收埋、最右嗰個貼邊切斷。加咗兩邊 `mask-image` 漸隱。
- **備戰橫額壓住 gold／lives／wave**：`top: 88px` ＋ `translate(-50%,-50%)` 假設 HUD 74px 高；
  實測 HUD 有四個高度（桌面 56、SE 橫 110、直屏 164）。幾何相交 73–100%，
  pixel diff 訊號 40–57% 對雜訊底 5–16%。改成由 `main.ts` 量 HUD 實際 `bottom` 寫入
  `--hud-bottom`，CSS `top: calc(var(--hud-bottom, 88px) + 10px)`；淺身畫面收細橫額字體。
  改完五個尺寸幾何相交 0%。
- **`tests/touch.mjs` 新增**（6 條），已入 `npm run test:browser`。
- **修好 `tests/gateway.mjs` 嘅閃光 gate**：佢一路靠彩數過。swiftshader 之下影一張相成秒，
  而 `閃` 衰減得 0.55 秒——舊版四張相冇一張影到閃光；同時「平時」個底自己喺度呼吸
  （光幕 `sin(time*2.6)*0.015`，週期 2.42 秒），同一個 run 底色掃過 0.9–4.1pp，
  而門檻寫 `青增 >= 0.45`。改咗做底色跨足一個週期攞峰值、閃光用可清嘅 timer 撳住影，
  再加一條 check 驗「影嗰陣真係閃緊、量完真係收得返」。門檻由實測重定
  （青增 ≥ 4；實測訊號 10.0／10.7）。**改動前個 build 同樣三跑兩過一敗**
  ——唔係我整嘅，係本身就爛。同一輪仲揾到套件入面有寫死秒數等遊戲鐘嘅事：
  swiftshader 之下 `rawDt` 封頂 0.1 秒，遊戲鐘慢過真實鐘幾倍，
  所以呢一段全部改成 `waitForFunction` 等狀態。

## Verification

- `npm test`：PASS（`PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- `tests/touch.mjs` 6/6；mutation 驗過：改返 `top: 88px` 就報紅，
  逐個叫出 `hud-gold` 60–72%、`hud-lives` 67–81%、`hud-wave` 74–95%；
  拆走 `min-height` 就逐個叫出嗰六個細掣。
- `tests/gateway.mjs` 連跑三次 11/11，青增 10.12／9.99／10.70（門檻 4）；
  mutation 驗過：閃光貢獻全部歸零，青增跌到 0.30 報紅，
  而「影相期間真係閃緊」照樣綠——即係紅嘅責任落喺遊戲，唔係落喺把尺。

## Changed files

- `games/tower/src/ui/style.css`（`#hud>button` 最細尺寸、`.build-grid` 漸隱、
  `#wave-banner` 錨、淺身橫額字體）
- `games/tower/src/main.ts`（`錨定橫額()`，兩個擺橫額出嚟嘅位各叫一次）
- `games/tower/tests/touch.mjs`（新）、`games/tower/tests/gateway.mjs`（閃光量法大修）
- `games/tower/package.json`（`test:browser` 加 `touch.mjs`）
- `games/tower/dist/`、`docs/ai/{DECISIONS,HANDOFF}.md`

## Known issues and cautions

- 承上一份：Vite 774.91 kB 單 chunk warning；cap-30 探針第 87 波之後剩 54,248 金未使。
- 雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`。
- **每個檢查點都要即刻 push**：呢個容器試過幾次自己 reset 返去舊 commit。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. 讀 ADR-202，由「Codex 套件冇守到嘅範圍」繼續搵：投射物同 FX 仲係手砌幾何、
   swarm／shield 只係 skeleton／zombie 嘅縮放變色。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：唔好將 `#wave-banner` 改返寫死 `top`，
  亦唔好將閃光 gate 改返「影幾張相攞最大值」——嗰個量法量唔到 0.55 秒嘅瞬態。
