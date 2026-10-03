# Current cross-agent handoff

Updated: 2026-10-03 (Asia/Macau)
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
- `build-game-catalog --check` PASS、`tests/catalog.mjs` PASS、`tests/release-gate.mjs` 21/21、
  MOBA/Hub cache-bust PASS（Hub `assets-34`、MOBA `assets-31` 分開）。
- 跨遊戲 hub gates 全綠（hub-keyboard 舊紅已隨 Olden Ring 修好）；五個 canonical viewport 截圖人手睇過。

- **已上線**：Penny 授權以後直接推 `main`。`aff1b6e` 推上 main 後 Pages #383 喺 Tower
  `npm audit --audit-level=high` fail（sharp <0.35.4 新 advisory，任何 push 都會中）；
  `a2e9f8f` 用 `npm audit fix` 只升 lockfile patch 版本（sharp 0.35.4、fflate 0.8.3），
  本機 Tower `npm test` 全綠、dist 冇變；**Pages #384 success**。

## Known issues and cautions

- **視覺驗收未做**：要 Penny headed review；自動尺只證「冇壞」。
- 幾張封面仲可以再靚：霓虹貪食蛇（蛇好短）、鬥地主（手牌細）、桌球 3D（有 HUD 字）。
  改 `STEPS` 重影就得，唔使改 launcher。
- 13 隻喺 2／4 欄 grid 最後一行得一張卡（grid 自然結果，唔係分頁孤兒）；如 Penny 介意可考慮
  令某張卡跨欄。
- `hub-keyboard` 舊紅（Elden Ring II `#hub-return` focus ring）同 `hub-cdn` Xiangqi DCL 仲未處理，唔關 Hub。
- Phase 0B license blockers 仍然係 Racing Tripo 1、Ashen Tripo 4、Royale Meshy 23。
- 呢個 container 一鬥資源就出假紅；一次紅要單獨再跑先算數。

## Olden Ring 重做（2026-09-24，ADR-315）

- Penny 畀參考 `mike007jd/voxel-musou`（MIT）同「千燈迷樓」demo，話「盡顯想像力」。新遊戲喺
  `games/olden-ring/`（id `olden-ring`，取代 Hub 嘅 `elden-ring-ii`；舊 React 版原封保留做存檔）。
- 夜空＋殘缺古環、九層千燈古塔＋天燈、燼騎／虛空軍團／守燈將／空冠王、燼龍大招、逐層＋祝福＋冠層＋
  死亡結算＋本機最佳、觸控搖桿同五粒掣、手機減量。詳見 ADR-315 同 `games/olden-ring/README.md`。
- 驗證：`games/olden-ring/tests/flow.mjs` **20/20**；hub 124/124、hub-load 3/3、hub-touch 5/5（修咗 667×375 登塔掣
  28px → 44px 後）、hub-storage 2/2、hub-home 3/3、hub-read 3/3、hub-keyboard 3/3、catalog／ReleaseGate／
  asset catalog＋census／cache-bust PASS。
- **誠實註記**：約 93% 代碼係 voxel-musou 原封（戰鬥、群眾 AI、動作、鏡頭、後製、音效、無雙演出）；我哋改咗
  ~320 行＋新寫 ~410 行（主題、古環、千燈、樓層循環、觸控）。Penny 知悉並叫照 merge。下一步建議加大原創部分：
  新武器／招式、自家「古環儀式」大招取代改色龍、新敵種、空冠王專屬造型同招式、自家 HUD。
- **Penny 真機回饋（全部已修，flow 27/27）**：祝福卡畀觸控層遮住／擠出畫面；canvas 100vh 拉長；觸控撳攻擊
  觸發 8 m dash；畫面暗同噪（曝光、後製、1.5× 解像度）；iOS 雙擊放大（meta＋touch-action＋gesture 攔截、燼龍
  放完先過層）；空中連擊浮空（3 下、每秒跌 1.6 m）；太密（每層 `CROWD.engaged` 12+2/層、援兵 5–9、開場 16+6×層）。
- **部署提速**：flow test 放 `games/olden-ring/tests/flow.mjs`（`tests/` 係共用 root，會觸發全部 13 隻）。

## 角色綁骨／面向檢視（2026-10-03）

- **灰燼列車（修咗）**：主角「紙牌」= ①`AssetLibrary` 用 `scaling.setAll()` 抹走 glTF 根節點嘅 Z=−1（RH→LH），
  士兵被鏡像；②士兵 GLB 本身打側建模，控制器假設 +Z 前方，結果成個人打側對住鏡頭（實測身體 vs 前方 −94°）。
  修：保留 Z 翻轉；新 `src/game/animation/rigFacing.ts` 由大腿骨量身體正面，喺根節點下加 pivot 轉正（實測 2–4°）。
  槍管主軸實測指向前方。另修 P0：meshopt decoder 改用本地 `public/assets/vendor/meshopt/`（MIT），零 CDN 請求。
  lint、vitest 15/15、build、assets:inspect、asset census／catalog PASS。
- **Tower（修咗）**：Kenney 怪模型面向 −Z → 全部倒後行（實測 180°）；加轉 180°、腳底貼地（以前浮半個身）、
  手腳拆返獨立 part 以髖／膊頭做樞紐一前一後擺，樞紐 offset 跟 yaw 轉；血條高度跟住降。catalog `rig:tower-skeleton` → `-Z`。
- **Royale（修咗）**：`rig.js` 雙足相位只睇左右（劍士弓步令兩腳同步、披風當第三隻腳）；步態相位由真實位移推（唔再滑步）；
  民兵／劍士模型 `swapArms`（以前攻擊揮盾）；騎兵 `legAmp` 馬腳對角小跑（以前凍住）；戰象模型置中貼地、傾側用內層 pivot、
  walk clip 跟速度；RTS 村民採集／建造唔再原地踏步（每 0.9 秒揮一下）、轉身有阻尼。
- **MOBA（修咗）**：出招即面向目標；跑步面向 render 位移方向（唔再蟹行）；跑步 clip 速度跟地速；AI 唔再 <1 m 重複落單。
  MOBA token `assets-32`。
- **Olden Ring（修咗）**：旗手跑動時面向跑嘅方向；主角步幅除返 `HERO_SCALE`（以前每秒滑 0.7 m）。
- **Racing**：冇缺陷；catalog `rig:racing-car` forwardAxis 更正為 `+X`。

## Exact next action

0. **2026-09-24 逐 game audit 完成**：見 `docs/GAMEHUB_UPGRADE_PLAN_2026-09.md`（13 隻評分、
   16 條 P0、跨遊戲共用基建、Wave 0–4）。下一個 agent 由 **Wave 0** 開始：逐條清 §2 P0，
   每條獨立 commit；同時做 §4.1 手機排版 gate（375×667／667×375）。Penny 已授權直推 `main`。
   Penny 決定（計劃 §6）：Chiikawa 圖保留；Elden Ring II 改名 **Olden Ring**（✅ 已做，id／路徑不變，
   P0 #3 focus ring、#4 `.blend` 一齊修咗，hub-keyboard 3/3）；RTS 做完整；Supabase migration 已授權；
   Wave 2 次序未定。Racing Car 參考 Initial D AS3 Reimagined 嘅**設計概念**（計劃 §6A）——嗰個 repo
   冇 LICENSE 兼含逆向 SEGA 代碼，**唔准抄任何代碼／數值／素材**。
1. Penny headed review 新首頁（手機直／橫、桌面），收集意見再微調。
2. ~~合併後睇新 main Pages run~~：#384 已綠（包括 Royale full budget）。

## Do not redo

- 唔好再加返 theme switcher 或 4/4/4/1 carousel（ADR-314 由 Penny 拍板）。
- 唔好為 hero 加 `data-game-id`——13 個 anchor 契約只計 grid。
- 唔好再用 SVG／emoji 插畫做封面（Penny 已否決）；唔好手改 generated catalog／census；唔好合埋 Hub／MOBA cache token；
  唔好 force-push。
