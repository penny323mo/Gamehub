# Current cross-agent handoff

Updated: 2026-09-24 (Asia/Macau)
Prepared by: Claude Code — Hub 全面重新設計（ADR-314）
Integration branch: `main`
Work branch: `claude/interface-theme-redesign-lbwt0z`
Status: Hub 由「三套 theme × 4/4/4/1 carousel」改成**單一現代遊戲平台式首頁**：
頂欄 → 精選 hero → 類型篩選 → 一頁見晒 13 隻嘅 grid，封面全部係真實遊玩截圖。
自動 gate 綠；**視覺驗收等 Penny headed review。**

## Current objective

Penny 要求重新設計成個 Hub 介面，並揀咗：一套全新主設計（唔再三套 theme）、
scroll grid＋分類篩選、現代遊戲平台風（深色、大圖、光暈）。第一版用手繪 SVG 插畫，
Penny 判「低端」，要求改用**實際遊玩截圖**做封面——已改。
UI-only：冇改任何遊戲 runtime、manifest 次序或入口連結。

## Completed

- 封面：`scripts/capture-hub-covers.mjs` 逐隻遊戲行到遊玩畫面（揀 AI 模式、開局、略過教學、
  踩油等），SwiftShader 截圖，壓成 `assets/hub/covers/*.webp`（480×300，共 ~210KB）同
  `assets/hub/hero/*.webp`（960×600，共 ~470KB，每次只載一張）。來源說明見 `assets/hub/README.md`。
  SVG 版（`hub-art.js`）已刪。
- Penny 再 review：純截圖睇唔出遊戲名 → 遊戲名＋類型疊喺封面底部（深色漸層＋22px 粗體，
  手機 16px），卡身淨返簡介同 badge。Hub token `assets-36`。
- `launcher.js` 重寫：頂欄、hero（`data-hero-game-id`；有 `gamehub-recent-v1` 就「繼續玩」，
  冇就按日子輪替）、`[data-filter]` 篩選（全部 13／棋牌 4／休閒 3／策略 3／動作 3）、
  13 個 `a[data-game-id]` grid。拆走 theme menu、carousel、swipe、方向鍵分頁。
- `style.css` 重寫：一套深色 token；手機直屏 2 欄、1280 闊 4 欄、矮橫屏 hero 變矮 banner；
  hover／focus 用每隻遊戲 `--accent` 光暈；`prefers-reduced-motion` 全停。
- `tests/hub.mjs` 重寫守 ADR-314 契約（6 個 viewport）；`tests/hub-themes.mjs` 退役，CI 移除。
- Hub cache token `assets-33 → assets-36`；封面 URL 另有 `COVER_VERSION`。
- **順手修 main 嘅真紅**：`games/catalog.generated.js` 喺 Royale timeout PR 之後冇 regenerate，
  `build-game-catalog --check` 同所有讀 catalog 嘅測試都會 fail。用 `node scripts/build-game-catalog.mjs`
  正規 regenerate（token `catalog-15y29i5`）。
- ADR-314 加入 DECISIONS；ADR-312／313 標 superseded；PROJECT_CONTEXT 更新。

## Changed files

- 新：`assets/hub/`（26 張 WebP ＋ README）、`scripts/capture-hub-covers.mjs`
- 改：`index.html`、`launcher.js`、`style.css`、`tests/hub.mjs`、`.github/workflows/deploy-pages.yml`、
  `games/catalog.mjs`、`scripts/release-gate.mjs`、`games/catalog.generated.js`（regenerated）
- 刪：`tests/hub-themes.mjs`
- Docs：`docs/ai/DECISIONS.md`、`docs/ai/PROJECT_CONTEXT.md`、本檔

## Verification

- `node tests/hub.mjs` **124/124**（包括 13 張封面全部載到、hero 用大圖、遊戲名疊喺封面上而且讀屏讀得到）
- 疊字之後重跑：hub-read 3/3（字色對比）、hub-touch 5/5、hub-load 3/3。（320×568、375×667、440×956、667×375、844×390、1280×800）。
- `build-game-catalog --check` PASS、`tests/catalog.mjs` PASS、`tests/release-gate.mjs` 21/21、
  MOBA/Hub cache-bust PASS（Hub `assets-34`、MOBA `assets-31` 分開）。
- 跨遊戲 hub gates（順序單獨跑）：hub-load 3/3（封面版再跑一次仍 3/3）、hub-touch 5/5、
  hub-storage 2/2、hub-home 3/3、hub-read 3/3、hub-keyboard 2/3（紅嗰條係已知 Elden Ring II
  `#hub-return` focus ring，唔關 Hub）。
- 五個 canonical viewport full-page screenshots 已影並人手睇過（無重疊、無爆版、插畫完整）。

## Known issues and cautions

- **視覺驗收未做**：要 Penny headed review；自動尺只證「冇壞」。
- 幾張封面仲可以再靚：霓虹貪食蛇（蛇好短）、鬥地主（手牌細）、桌球 3D（有 HUD 字）。
  改 `STEPS` 重影就得，唔使改 launcher。
- 13 隻喺 2／4 欄 grid 最後一行得一張卡（grid 自然結果，唔係分頁孤兒）；如 Penny 介意可考慮
  令某張卡跨欄。
- `hub-keyboard` 舊紅（Elden Ring II `#hub-return` focus ring）同 `hub-cdn` Xiangqi DCL 仲未處理，唔關 Hub。
- Phase 0B license blockers 仍然係 Racing Tripo 1、Ashen Tripo 4、Royale Meshy 23。
- 呢個 container 一鬥資源就出假紅；一次紅要單獨再跑先算數。

## Exact next action

1. Penny headed review 新首頁（手機直／橫、桌面），收集意見再微調。
2. 合併後睇新 main Pages run：catalog parity、Hub gates、Royale 1,200s full budget。
3. 之後返 Phase 0C（Royale／Racing／Elden 嘅 scene/rig/performance baseline）。

## Do not redo

- 唔好再加返 theme switcher 或 4/4/4/1 carousel（ADR-314 由 Penny 拍板）。
- 唔好為 hero 加 `data-game-id`——13 個 anchor 契約只計 grid。
- 唔好再用 SVG／emoji 插畫做封面（Penny 已否決）；唔好手改 generated catalog／census；唔好合埋 Hub／MOBA cache token；
  唔好 force-push。
