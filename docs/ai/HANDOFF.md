# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-313
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 三套 Hub theme 已經拆成三個獨立 renderer；`hub-themes` **220/220**、`hub` 100/100。
**視覺驗收仲未做**——自動尺證到「結構真係唔同、冇壞」，證唔到「靚」。

## Current objective

跟 Evolution Plan §5.5 同 ADR-312 重做 Hub theme。Penny 否決咗第一版三個變體：三個都
仲係同一個卡片 carousel 換色。呢一輪已經落咗手，見下面；下一步係 §5.5 驗收第 1 同
第 5 項（五個 viewport 嘅 full-page screenshot ＋ Penny headed review）。

UI-only：唔准改任何遊戲 runtime、13 隻嘅次序、入口連結、storage 安全同 launch/input 語意。

## Completed

**ADR-313 — theme 唔係一個 render function 加 class，係三個 render function**

- **真兇係結構，唔係 CSS**：舊 `launcher.js` 得一個 `renderCarousel()` 砌一張
  `.game-hub-card`，`updateThemeLayout()` 再喺同一張卡掛 `data-theme-role`。
  **一個萬能卡片加 class，寫幾多 CSS 都變唔出第二套介面語言。**
- `index.html` 淨返一個掛載點；三套 theme 各自有 `shell()` 同 `item()`，冇共用 card fallback：
  - **Neon Grid**：招牌＋機台牆＋底部控制條；item 係街機櫃（招牌／4:3 CRT 螢幕／操作台）。
  - **Editorial Arcade**：報頭＋不對稱 spread＋folio；**一套兩種 item**——頭條有大封面,
    其餘三個係**完全冇圖**嘅編號索引行。
  - **Command Deck**：左邊直立 rail＋status bar＋dispatch workspace；item 係**冇縮圖**嘅
    dispatch row，讀數由 `capabilities` 畫出嚟（§5.5 容許嘅 no-thumbnail proof）。
- **把尺唔再抄實作**：舊版逐套寫死「四欄／一大三細／四行」＝將實作抄多次入把尺,
  證明唔到「三套真係唔同」。改成**簽名**（item 形狀／媒介處理／nav dock 位／selector 位,
  全部由幾何量），再問「三套唔可以四樣都一樣」「至少三個維度分到三套」。**換色改唔到呢四個數。**
- 三把尺嘅 `.game-hub-card` 改成 `[data-game-id]`（ADR-312 講明穩定契約係 anchor,
  唔係 class）；`hub.mjs` 嗰條「dock ≤ 78% 畫面闊」拆走——嗰個度緊舊嗰個藥丸頁腳,
  footprint 交返 `hub-themes` 逐套量。
- 中途捉到嘅真嘢：Editorial 封面 `aspect-ratio` 撐爆矮畫面（109／123／139px）；
  `667×375` 同時中咗 `max-width:700px`，**media query 淨係睇闊度就會喺 375 高度疊三層**；
  `.carousel-track` 冇 `min-height:0`，min-content 高度變咗地板（844×390 撐高 9px）；
  Command row 塞六個仔入五條 column，`DISPATCH` 跌落第二行；Neon 類型標籤 3.99:1
  跌穿 AA（`hub-read` 捉到）。

## Changed files

- `index.html`（淨返掛載點）、`launcher.js`（三個 renderer）、`style.css`（三段獨立 theme）。
- `tests/hub-themes.mjs`（簽名式驗證）、`tests/hub.mjs`（改用 `[data-game-id]` 契約）。
- Hub cache token `assets-32 → assets-33`（MOBA 仍然係 `assets-31`，冇合埋）。

## Verification

- `hub-themes` **220/220**（三套 × 五個 canonical viewport）、`hub` **100/100**、
  `hub-touch` 5/5、`hub-read` 3/3、`hub-load` 3/3、`hub-home` 3/3、`hub-storage` 2/2、
  ReleaseGate 20/20、catalog parity PASS、MOBA/Hub token 契約 3/3。
- 三套 × 五個 viewport 實測：零重疊、零出界、零橫向／直向捲、冇細過 44px 嘅控制、
  零 console/page error。
- Mutation：Editorial 退返用 Neon 個 item → 只叫得出「item archetype」同「媒介處理」
  兩條，其餘照綠。
- 簽名實際值：item `uniform-tiles`／`lead-and-index`／`full-width-rows`；
  媒介 `4@landscape-4-3`／`1@wide`／`none`。

## Known issues and cautions

- **視覺驗收未做，亦唔可以由自動尺代。** 220/220 證嘅係「結構唔同、冇壞」。
- `hub-keyboard` 有一條紅：**Elden Ring II** 個 `#hub-return` focus ring 睇唔到。
  唔關 Hub 事（今輪冇掂過嗰隻遊戲），但要有人接。
- Phase 0B license blockers 仍然係 Racing Tripo 1、Ashen Tripo 4、Royale Meshy 23。
- `hub-cdn` 之前量到 Xiangqi DCL 1.07–1.10 秒（門檻 1.0）；要喺清靜 runner 重量,
  唔好為咗過尺去改 Xiangqi。
- **呢個 container 一鬥資源就出假紅**：背景跑住第二個 suite 嗰陣，其他尺報過
  「模型未預載就攞」同「撳唔到掣」——單獨再跑全綠。**一次紅要單獨再跑先算數。**
- **開工前一定要 `--sync`**；`pgrep -f` 會撞到自己；做 mutation 要先 `cp`。

## Exact next action

1. 影五個 canonical viewport × 三套 theme 嘅 full-page screenshot，交 Penny headed
   review（§5.5 驗收第 1 同第 5 項）。**唔好用 220/220 當視覺驗收。**
2. 媒介仲係 emoji／舊 logo。§5.5 要 canonical gameplay capture（來源、crop variant、
   尺寸、byte budget 入 AssetCatalog）——呢步係 UI media 工作，唔准改遊戲邏輯。
3. 驗收之後先返 Phase 0C（Royale／Racing／Elden 嘅 scene/rig/performance baseline）。

## Do not redo

- 唔好再用一個萬能 thumbnail／card component，再靠 theme class 換色、圓角、陰影、
  比例或者排序當新 theme。
- 唔好將把尺寫成「抄一次實作嘅幾何」——要問簽名，唔係問「係咪四欄」。
- 唔好改遊戲次序、連結、存檔或者任何遊戲 runtime；唔好合埋 Hub／MOBA cache token；
  唔好手改 generated catalog／census；唔好 force-push。
- 唔好為咗遷就一個排版而放寬把尺（今輪拆走嗰條 dock 闊度係因為佢度緊舊設計，
  唔係因為新設計過唔到）。
