# Current cross-agent handoff

Updated: 2026-08-08 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Tower **3D 全部換晒真資產** (ADR-195–197)；金錢出口 (ADR-194)；ER2 通關 (ADR-191)

## Current objective

完整重構 Tower（塔防），3D 由零開始。ER2 已通關（ADR-191）；MOBA balance 欠一個專場。

## Completed

### Tower：最後嗰批手砌幾何都冇咗——塔同敵人都係真模型 (ADR-197)

- `towerRenderer.ts` 942 行、`enemyRenderer.ts` 629 行，每一件睇得見嘅嘢都係圓柱圓球圓錐手砌。而家
  兩個檔係 **544 同 360 行**，bundle 反而由 798 跌到 **760 kB**。
- **塔改成疊件**：`base→bottom→middle→top`，每節啱啱好 0.500 高（量過），同三級升級制係同一個結構
  ——**升一級就係疊多一節**。七種塔對四個武器頭，靠塔身形狀＋頂蓋款式＋原本嗰套色分。**有武器嘅塔
  唔戴屋頂**：屋頂高 0.93–1.18 而武器得 0.19–0.63，擺埋一齊武器就埋咗入去，睇唔到佢瞄邊。
- **敵人保住 instancing**：一波最多 455 隻。由 GLB 拆返 sub-mesh 嘅 geometry／material 塞入**原本嗰個
  `EnemyPartDef` 清單**，sub-mesh 自己嗰個變換用 `applyMatrix4` **焗入 geometry 一次**，唔係逐幀再乘；
  上面成套 instancing／動畫／血條一行冇改。五隻生物對七種：swarm 係細版 skeleton、shield 係藍版 zombie。
- `tests/units.mjs` 10 條。**識別色由場景圖讀，唔用像素**——塔喺畫面得幾十 px，兩版像素法都讀返草色，
  七種塔全部報綠：**嗰個係支尺嘅證據，唔係遊戲嘅證據**。突變：剷走逐級疊件 → 三條紅（高度
  [1.039,1.039,1.039]）；敵人 geometry 換方塊 → 三角形數跌到 12。仲有一個支尺 bug：第一版讀到 85 個
  InstancedMesh 但**全部 count = 0**，因為喺同一個 evaluate 入面出完怪即刻讀，而 `sync()` 喺 rAF 入面
  先設 count——**量緊一個未畫過嘅場景**。

### 之前：條路兩頭冇頭冇尾——入口一對門、出口一座城堡 (ADR-196)

- 換真磚嗰陣連舊嘅 spawn portal／goal keep 一齊剷咗，變成怪由空地行出嚟、去到空地就消失。用
  fantasy-town kit（同係一單位格）重做：**入口**係門框＋柱＋**兩塊各自繞邊轉嘅門板**，每次出怪揈開
  再閂返兼閃光（由新嘅 `enemySpawned` 事件推，唔係計時器）；**出口**係城堡＋旗＋**血量條**。
- **三個缺陷全部靠量到**：①血條讀到 full width 但畫面淨係見黑底——**three.js 一定先畫晒不透明先畫
  透明**，`renderOrder` 只喺同一批入面排。②條 bar 掛咗喺已經轉咗向嘅 group 入面，抄鏡頭 quaternion
  會同 parent 疊埋。③`wallDoorwaySquareWide` **薄身係 X 軸**，我當咗 Z，道門打側企咗喺路邊、光幕埋
  咗入牆——`閃` 讀到 0.82 而門口像素**反而暗咗**（53.3 → 48.5）。加返 90° 之後青色 0.65% → 2.92%。
- **我支尺又一次係拍腦袋定嘅**：未有數之前就寫「亮度要 +4」。真正分得開嘅係嗰笪青色（壞 1.35×、
  好 3.9–4.5×），兩個狀態嘅實測數而家都寫咗入條 gate。

### 之前：由零資產去到 79 件 CC0 模型、成塊地換晒真磚 (ADR-195)

- **攞資產嘅路實測過**：kenney.nl／quaternius／polyhaven／opengameart／itch.io／`codeload` zip／
  GitHub API／github.com HTML **全部 proxy 403**；`raw.githubusercontent.com` 同 `git clone` 通。
  Kenney **Tower Defense ＋ Graveyard ＋ Fantasy Town** 三套 kit，清單喺 `scripts/fetch-assets.mjs`。
  路磚**全部啱啱好 1×1**（而 cellSize 就係 1）、塔件**全部 0.5 高**，所以唔使縮放對位。
  用邊塊磚、轉幾多度由 `tileset.ts` 純函數答，`tests/tiles.mjs` 由 GLB 重新量返開口再同張表對。
- **三個令佢黑麻麻嘅缺陷**（實測 3.8/255、99.9% 近黑）：①Kenney 啲 GLB 冇寫 `metallicFactor`，
  glTF 預設 **1.0**＝全金屬，冇 diffuse 冇環境貼圖就係黑（我加大三倍燈只去到 14.9——唔喺燈度）；
  ②塵埃 shader 用透視公式而個鏡頭係 **orthographic**，每粒塵變 50 px 白光斑；③我新寫嗰塊底板浸過
  咗磚面。修完：亮度 41.7、白斑 0%、草 29.3%、路 2.06%。`tests/look.mjs` 7/7 守住。

### 之前：金錢出口同燒傷 (ADR-193/194)

- **ADR-194**：收入 41184 對成張地圖只食得 29260——買晒仲有 12324 金而後面仲有 59 個波；**每波最深
  滲透中位數 0.03**。**唔係佢冇能力殺人**：6 座塔第 30 波死、10 座第 40 波死。原因係**七座塔入面得
  arrow 有進化**；而家每座都有，買得晒嗰點推到第 78 波。**但頭四十波仍然 20/20 命，未修。**
- **ADR-193**：`Math.max(1, dmg - armor)` 係寫畀**一次命中**嘅，擺喺**每格行一次**嘅連續傷害度就變成
  每秒最少 `1/LOGIC_DT` ＝ 20，而全部設定值都低過 20——所以 **tank 弱火反而食少過一隻冇弱點嘅雜兵**
  （20 對 24）。地板搬去 dps 嗰層之後，同一條燒傷用 dt = 0.1／0.05／0.0125 行十秒：修之前
  **100／200／800**，修之後 80／80／80。燒傷亦唔再無限疊。

### Elden Ring II：通關咗、戰鬥同體力、套件提速 (ADR-186–191)

- **ADR-191 通關咗**：三波加 boss、**82 郁動秒**、收場 7 血 0 藥。**遊戲本身唔使再改**；要嘅係一個
  打得郁嘅支尺（政策搬**入頁面**，一個 run 由幾百個決定變 4600 個）。攔住佢嗰兩樣**都係 bot 側但睇落
  好似遊戲 bug**。要講白：**之前幾輪我攞住「bot 通唔到關」當隻遊戲嘅證據。**
- **ADR-190** 回氣封鎖咗成個出手動畫；**ADR-189** 貼身斬空（實際 **0.4 dps** 對設計 11.9）；
  **ADR-187/188** 加咗三支藥但**飲唔到**；**ADR-186** **解析度就係幀率，而幀率就係遊戲時間**。
  **我支尺自己錯過幾次**：bot 用真實毫秒落指令、**WASD 係鏡頭相對而 bot 當佢世界座標**、鏡頭收位
  讀到 0,0,0,0,0,0——**收到盡就唔再細落去**。

### 更早：ADR-105–192（ER2 抖動／boss／郁動／掩護，Tower 第一把尺）

- **ADR-192** Tower 七千行 **一個測試都冇**；Google Fonts 嘅 CSS `@import` 擋 render、favicon 404、
  **難度曲線倒退**（7 個波易過第一波）。條規則由 `fix-wave-curve.mjs` import，**修同守用同一條**。
- **ADR-185** 抖動：**我第一個數係我支尺錯**。**ADR-184** 撲擊永遠揀唔到。**ADR-179** 出手轉向寫住
  `locked && …` 而 locked 開波 true——**六十四條 gate 從來冇行過個 false 邊**。**ADR-178** 斜坡讀
  「現速」每幀清零：**玩家 0.09 米／秒對設計 12.5**，而**六十二條 gate 全綠**。
- **一個中咗三次嘅坑**：build 中止而**舊 `dist` 仲喺度**，套件測咗個冇突變嘅 bundle——**啲數唔郁，
  第一件事係查 build 出咗新 bundle 未。** ADR-105–177 全文喺 DECISIONS.md。五句：**同一件事寫兩次就有
  兩個答案**、**分唔開兩件嘢嘅門檻等於冇門檻**、**綠 gate 未跑突變之前咩都證明唔到**、**一個條件嘅
  一邊從來冇行過就等於冇寫過**、**未有數之前定嘅門檻，多數係量緊自己個估計**。

## Verification

- Tower **八套尺全綠**：`smoke` 5/5、`balance` 6/6、`combat` 8/8、`assets` 8/8、`tiles` 6/6、
  `look` 7/7、`gateway` 6/6、`units` **10/10**。`playthrough.mjs` 唔入快套件（一兩分鐘）：佢答「推得到幾遠」，唔係「有冇壞」。
- `hub.mjs` 96/96；ER2 `hud-layout` **92/92** ＋ `npm test` **17/17**（約十分鐘）。**兩個方向都行過**：
  每條新 gate 都跑過突變，重現到原本量到嗰個數。
- MOBA：`sim` **262/262**、`browser` **196/196**；`balance 24` **紅**（ironhulk 17%，ADR-146 之後預期之內）。

## Changed files

- `games/tower/*`、Hub 檔、`games/moba/*`、`games/elden-ring-ii/{src,tests,dist}`、`scripts/*`、`docs/ai/*.md`。

## Known issues and cautions

- 查過乾淨唔好再推導（ADR-123/129/130/132）：返程被打斷、死住轉向、開商店 GPU lost、.hidden 食 tap、
  商店同設定一齊開、420 金上限冇觸發。**ER2 同 Tower 改完 src/ 一定要 npm run build**；Cache token
  覆蓋成個 module graph 同 Hub stylesheet（ADR-111/133），用 `moba-bump-cache.mjs` 改。**未解**：
  MOBA 打直取景 gate 飄過兩次。**容器今個 session 退返舊 commit 好多次——每個檢查點都要即刻 push。**

## Exact next action

1. **Tower：頭四十波攔唔到人**（ADR-194：41 波、20/20 命、滲透中位數 0.03；6 座塔第 30 波死、10 座
   第 40 波死）。**要對住 `playthrough.mjs` 一步步行**，推過龍就變一隻冇人打得完嘅遊戲。
2. **Tower 美術仲可以行落去**：swarm／shield 而家係 skeleton／zombie 嘅大細色變體（kit 得五隻生物）；
   子彈同特效仲係程序幾何；`fantasy-town` 同 `natureKit` 仲有幾百件未用。
3. **ER2**（ADR-191 通關證咗）未量過：鏡頭震固定 0.24、`invincibleUntil`。**MOBA 平衡專場**：
   ADR-146 之後 ironhulk 17%、差幅 45；重新做基準，一次改一樣，每次 ≥24 局（ADR-131 三隻係把尺）。

## Do not redo

- Hub：唔好返去絕對定位嘅單卡輪播、平台 Gomoku emoji、拉長最後一版。MOBA：唔好由 sim event 攞走英雄／
  技能資料、唔好將技能合返做一個環、唔好回復淨係泉水買嘢、唔好攞 `canShop()` 判位置、唔好再為閒置時間
  調 `RESPAWN_*`（ADR-141）或重加近戰 gate（ADR-142）。Tower：唔好重覆用 ER2 資產、唔好將敵人由
  InstancedMesh 改返一隻一個 Object3D。
