# Current cross-agent handoff

Updated: 2026-09-24 (Asia/Macau)
Prepared by: Claude Code — Hub 全面重新設計（ADR-314）
Integration branch: `main`
Work branch: `claude/interface-theme-redesign-lbwt0z`
Status: Hub 由「三套 theme × 4/4/4/1 carousel」改成**單一現代遊戲平台式首頁**：
頂欄 → 精選 hero → 類型篩選 → 一頁見晒 13 隻嘅 grid，每隻遊戲一幅 inline SVG 插畫。
自動 gate 綠；**視覺驗收等 Penny headed review。**

## Current objective

Penny 要求重新設計成個 Hub 介面，並揀咗：一套全新主設計（唔再三套 theme）、
scroll grid＋分類篩選、手繪 SVG 插畫、現代遊戲平台風（深色、大圖、光暈）。
UI-only：冇改任何遊戲 runtime、manifest 次序或入口連結。

## Completed

- `hub-art.js`（新）：13 幅 16:10 向量 key art，`HubArt[id] = { accent, draw(u) }`；
  每次渲染用新 id 前綴，避免 hero／grid 同一幅畫撞 gradient id（display:none 嗰幅會令另一幅失色）。
- `launcher.js` 重寫：頂欄、hero（`data-hero-game-id`；有 `gamehub-recent-v1` 就「繼續玩」，
  冇就按日子輪替）、`[data-filter]` 篩選（全部 13／棋牌 4／休閒 3／策略 3／動作 3）、
  13 個 `a[data-game-id]` grid。拆走 theme menu、carousel、swipe、方向鍵分頁。
- `style.css` 重寫：一套深色 token；手機直屏 2 欄、1280 闊 4 欄、矮橫屏 hero 變矮 banner；
  hover／focus 用每隻遊戲 `--accent` 光暈；`prefers-reduced-motion` 全停。
- `tests/hub.mjs` 重寫守 ADR-314 契約（6 個 viewport）；`tests/hub-themes.mjs` 退役，CI 移除。
- `hub-art.js` 加入 GameCatalog／ReleaseGate 嘅 Hub global files；Hub cache token `assets-33 → assets-34`。
- **順手修 main 嘅真紅**：`games/catalog.generated.js` 喺 Royale timeout PR 之後冇 regenerate，
  `build-game-catalog --check` 同所有讀 catalog 嘅測試都會 fail。用 `node scripts/build-game-catalog.mjs`
  正規 regenerate（token `catalog-15y29i5`）。
- ADR-314 加入 DECISIONS；ADR-312／313 標 superseded；PROJECT_CONTEXT 更新。

## Changed files

- 新：`hub-art.js`
- 改：`index.html`、`launcher.js`、`style.css`、`tests/hub.mjs`、`.github/workflows/deploy-pages.yml`、
  `games/catalog.mjs`、`scripts/release-gate.mjs`、`games/catalog.generated.js`（regenerated）
- 刪：`tests/hub-themes.mjs`
- Docs：`docs/ai/DECISIONS.md`、`docs/ai/PROJECT_CONTEXT.md`、本檔

## Verification

- `node tests/hub.mjs` **112/112**（320×568、375×667、440×956、667×375、844×390、1280×800）。
- `build-game-catalog --check` PASS、`tests/catalog.mjs` PASS、`tests/release-gate.mjs` 21/21、
  MOBA/Hub cache-bust PASS（Hub `assets-34`、MOBA `assets-31` 分開）。
- 跨遊戲 hub gates 結果見 commit message／下一段；逐個單獨順序跑。
- 五個 canonical viewport full-page screenshots 已影並人手睇過（無重疊、無爆版、插畫完整）。

## Known issues and cautions

- **視覺驗收未做**：要 Penny headed review；自動尺只證「冇壞」。
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
- 唔好共用 SVG gradient id；唔好手改 generated catalog／census；唔好合埋 Hub／MOBA cache token；
  唔好 force-push。
