# Current cross-agent handoff

Updated: 2026-08-08 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Tower 換咗真地形＋門同城堡 (ADR-195/196)；金錢出口 (ADR-194)；ER2 通關 (ADR-191)

## Current objective

改善／優化 Tower（塔防）。ER2 已通關（ADR-191）；MOBA balance 仍然欠一個專場。

## Completed

### Tower：條路兩頭本來冇頭冇尾——入口一對門、出口一座城堡 (ADR-196)

- 換咗真磚嗰陣連舊嘅 `buildSpawnPortal` 同 `buildGoalKeep` 一齊剷咗，變成怪由一格空地行出嚟、
  行到另一格空地就消失。兩樣用 fantasy-town kit（CC0，量過同 TD kit 一樣係一單位格）重做：
  **入口**係門框＋兩條柱＋**兩塊各自繞邊轉嘅門板**，每次出怪揈開再慢慢閂返，同時閃光；開門由
  新嘅 `enemySpawned` 事件推，唔係計時器夾。**出口**係城堡＋旗＋**血量條**（唔係 HUD 嗰個數嘅副本）。
- **三個缺陷，全部靠量到，唔係靠望**：①血量條 `血條闊` 讀到 1 但畫面淨係見黑底——**three.js 一定
  先畫晒不透明再畫透明**，`renderOrder` 只喺同一批入面排；條 bar 唔透明所以畀半透明黑底蓋咗。
  ②條 bar 掛咗喺**已經轉咗向嘅 group** 入面，抄鏡頭 quaternion 會同 parent 疊埋，永遠唔正對鏡頭。
  ③`wallDoorwaySquareWide` **薄身係 X 軸**，我當咗係 Z，於是道門打側企喺路邊、光幕埋咗入牆——
  `閃` 讀到 0.82 而門口像素**反而暗咗**（53.3 → 48.5）。加返 90° 之後青色像素 0.65% → 2.92%。
- **我支尺又一次係拍腦袋定嘅**：我未有任何數之前就寫「亮度要 +4」，但個 crop 大部分係草同石，
  平均亮度本來就郁得慢。真正分得開嘅係嗰笪青色（壞：1.35×；好：3.9–4.5×），而家兩個狀態嘅實測數
  都寫咗入條 gate 度。`gateway.mjs` 6/6。

### 之前：Tower 由零資產去到 66 件 CC0 模型、成塊地換晒真磚 (ADR-195)

- **攞資產嘅路實測過**：kenney.nl／quaternius／polyhaven／opengameart／itch.io／`codeload` zip／
  GitHub API／github.com HTML **全部 proxy 403**；`raw.githubusercontent.com` 同 `git clone` 通。
- Kenney **Tower Defense Kit ＋ Graveyard Kit ＋ Fantasy Town Kit**，**79 個 GLB、1.2 MB**、全部 CC0，
  清單喺 `scripts/fetch-assets.mjs`，牌照原文一齊攞。路磚**全部啱啱好 1×1**（而 cellSize 就係 1）、
  塔件**全部 0.5 高**，所以唔使縮放。用邊塊磚、轉幾多度由 `tileset.ts` 純函數答，`tests/tiles.mjs`
  由 GLB 重新量返開口再同張表對，跟住檢查 31 格格格接得上（突變：轉向掉轉即刻紅）。
- **三個令佢黑麻麻嘅缺陷**（實測 3.8/255、99.9% 近黑）：①Kenney 啲 GLB 冇寫 `metallicFactor`，
  glTF 預設 **1.0**＝全金屬，冇 diffuse 冇環境貼圖就係黑（我加大三倍燈只去到 14.9——唔喺燈度）；
  ②塵埃 shader 用透視公式而個鏡頭係 **orthographic**，每粒塵變 50 px 白光斑；③我新寫嗰塊底板
  浸過咗磚面。修完：亮度 41.7、白斑 0%、草 29.3%、路 2.06%。`tests/look.mjs` 7/7 守住。

### 之前：金錢出口同燒傷 (ADR-193/194)

- **ADR-194 收入 41184 對成張地圖只食得 29260**：買晒成張地圖仲有 12324 金，而後面仲有 59 個波；
  **每波最深滲透中位數 0.03**，最驚險嗰波係第一波。**唔係佢冇能力殺人**：封住塔數，6 座第 30 波死、
  10 座第 40 波死。原因：**七座塔入面得 arrow 有進化**，其餘六座升到頂就係死掣。而家每座都有一個，
  最貴一座 530 → 1000，買得晒嗰點由第 51 波推到第 78 波。**但頭四十波仍然 20/20 命，未修。**
- **ADR-193 燒傷打幾多係睇 tick 率**：`Math.max(1, dmg - armor)` 係寫畀**一次命中**嘅，擺喺
  **每格行一次**嘅連續傷害度就變成每秒最少 `1/LOGIC_DT` ＝ 20，而全部設定值都低過 20。所以
  **tank 弱火反而食少過一隻冇弱點嘅雜兵**（20 對 24）。地板搬去 dps 嗰層之後，同一條燒傷用
  dt = 0.1／0.05／0.0125 行十秒：修之前 **100／200／800**，修之後 80／80／80。燒傷亦唔再無限疊。

### 之前：Tower 第一把尺，難度曲線倒退 (ADR-192)

- 七千行 TypeScript、**一個測試都冇**。`smoke.mjs` 即刻捉到 stylesheet 第一行去 Google Fonts 嘅
  CSS `@import`（串行兼擋 render）同每次載入 404 一次 favicon。**難度曲線倒退**：7 個波易過第一波、
  21 次一波之內跌超過四成。**我第一版錯咗**：boss 波餵咗入「之前最高」，變成要放大 82/89 個波。
  條規則由 `scripts/fix-wave-curve.mjs` import，**修同守用同一條**先夾得埋。

### Elden Ring II：通關咗、戰鬥同體力、套件提速 (ADR-186–191)

- **ADR-191 通關咗**：三波加 boss、**82 郁動秒**、收場 7 血 0 藥。**遊戲本身唔使再改**；要嘅係一個
  打得郁嘅支尺（政策搬**入頁面**，一個 run 由幾百個決定變 4600 個）。跟住攔住佢嗰兩樣**都係 bot 側
  但睇落好似遊戲 bug**。要講白：**之前幾輪我攞住「bot 通唔到關」當隻遊戲嘅證據。**
- **ADR-190** 回氣封鎖咗成個出手動畫（11.9 dps 對第二波 24.4）；**ADR-189** 貼身斬空、遠距離先中
  （實際 **0.4 dps** 對設計 11.9，踏前停喺接觸面之後 30 → 128 傷害）；**ADR-187/188** 加咗三支藥但
  **飲唔到**（第三波同你一樣快）；**ADR-186** **解析度就係幀率，而幀率就係遊戲時間**（955 → 619 秒）。
- **我支尺自己錯過幾次**：bot 用真實毫秒落指令、**WASD 係鏡頭相對而 bot 當佢世界座標**、「轉唔切就
  唔揀目標」整咗個死鎖（**轉得慢好過唔轉**）、鏡頭收位讀到 0,0,0,0,0,0——**收到盡就唔再細落去**。

### 更早：ADR-105–185（抖動、boss、搖桿、特效、郁動、掩護、地圖）

- **ADR-185**「畫面一直抖動」：**我第一個數係我支尺錯**；兩個真缺陷係 **renderer 同 composer 用兩個
  像素比**（dpr ≤ 1.55 睇唔到，gate 要喺 dsf 3 跑）同**震動寫咗入平滑狀態**，**未證實**係咪 Penny 見
  嗰個。**ADR-184**：**撲擊喺遊戲入面永遠揀唔到**，而且每下命中都取消緊 boss 出緊嗰招。**ADR-183**：
  搖桿幅度計完即刻掉咗。**ADR-182**：restart() 無條件歸零關卡。**ADR-181**：得一組碎屑、重力 5 → 9.80。
- **ADR-180**：ACCEL 70 配全速 4.4，起步得**一幀**。**ADR-179**：出手轉向寫住 locked && … 而 locked
  開波 true——**六十四條 gate 從來冇行過個 false 邊**。**ADR-178**：斜坡讀「現速」每幀開頭清零——
  **玩家 0.09 米／秒對設計 12.5**，而**六十二條 gate 全綠**。**ADR-165–177**：HALL.z0 一個數兼兩份工、
  掩護我淨係修咗玩家嗰邊、霧門一直攔緊空氣、18 個位雜兵永遠追唔到。**一個中咗三次嘅坑**：build 中止
  而**舊 `dist` 仲喺度**，套件測咗個冇突變嘅 bundle——**啲數唔郁，第一件事係查 build 出咗新 bundle 未。**
- ADR-105–164 全文喺 DECISIONS.md。五句：**同一件事寫兩次就有兩個答案**、**分唔開兩件嘢嘅門檻等於冇
  門檻**、**綠 gate 未跑突變之前咩都證明唔到**、**一個條件嘅一邊從來冇行過就等於冇寫過**、**未有數
  之前定嘅門檻，多數係量緊自己個估計**。

## Verification

- Tower 七套尺全綠：`smoke` 5/5、`balance` 6/6、`combat` 8/8、`assets` 8/8、`tiles` 6/6、`look` 7/7、
  `gateway` 6/6。`playthrough.mjs` 唔入快套件（一兩分鐘）：佢答「推得到幾遠」，唔係「有冇壞」。
- `hub.mjs` 96/96；ER2 `hud-layout` **92/92** ＋ `npm test` **17/17**（約十分鐘）。**兩個方向都行過**：
  每條新 gate 都跑過突變，重現到原本量到嗰個數。
- MOBA：`sim` **262/262**、`browser` **196/196**；`balance 24` **紅**（ironhulk 17%，ADR-146 之後預期之內）。

## Changed files

- `games/tower/{index.html,src,configs,scripts,tests,public/models,dist}`、Hub 檔、`games/moba/*`、`games/elden-ring-ii/{src,tests,dist}`、`scripts/*`、`docs/ai/*.md`。

## Known issues and cautions

- 查過乾淨唔好再推導（ADR-123/129/130/132）：返程被打斷、死住轉向、開商店 GPU lost、.hidden 食 tap、
  商店同設定一齊開、420 金上限冇觸發。**ER2 同 Tower 改完 src/ 一定要 npm run build**（Pages 派 dist/；
  build 一失敗就留低舊 dist，讀落似成功）。Cache token 覆蓋成個 module graph **同 Hub stylesheet**
  （ADR-111/133），用 `node scripts/moba-bump-cache.mjs <token>` 改。**未解**：MOBA 打直取景 gate 飄過兩次。

## Exact next action

1. **Tower 換美術（未做完）**：地面、路磚、門同城堡已經係真模型，但 **`towerRenderer.ts`（942 行）
   同 `enemyRenderer.ts`（629 行）仲係程序幾何**。塔件疊法：`base→bottom→middle→top`，一節 0.5 高，
   啱晒三級升級制；敵人有 skeleton／zombie／ghost／vampire／digger 五隻對七種（爭兩種）。
2. **Tower：頭四十波攔唔到人**（ADR-194：41 波、20/20 命、滲透中位數 0.03；6 座塔第 30 波死、10 座
   第 40 波死）。**要對住 `playthrough.mjs` 一步步行**，推過龍就變一隻冇人打得完嘅遊戲。
3. **ER2**（ADR-191 通關證咗）未量過：鏡頭震固定 0.24、`invincibleUntil`。**MOBA 平衡專場**：
   ADR-146 之後 ironhulk 17%、差幅 45；重新做基準，一次改一樣，每次 ≥24 局（ADR-131 三隻係把尺）。

## Do not redo

- Hub：唔好返去絕對定位嘅單卡輪播、平台 Gomoku emoji、拉長最後一版。MOBA：唔好由 sim event 攞走英雄／
  技能資料、唔好將技能合返做一個環、唔好回復淨係泉水買嘢、唔好攞 `canShop()` 判位置、唔好再為閒置
  時間調 `RESPAWN_*`（ADR-141）或者重加近戰「接觸時間」gate（ADR-142）。Tower：唔好重覆用 ER2 嘅資產。
