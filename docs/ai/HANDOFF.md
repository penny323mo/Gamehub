# Current cross-agent handoff

Updated: 2026-08-08 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Tower 上咗 CC0 真資產、開咗資產尺 (ADR-195)；金錢出口 (ADR-194)；ER2 通關 (ADR-191)

## Current objective

改善／優化 Tower（塔防）。ER2 已通關（ADR-191）；MOBA balance 仍然欠一個專場。

## Completed

### Tower：由零資產去到 66 件 CC0 模型（ADR-195，做咗一半）

- **呢個環境攞資產嘅路，實測過**：kenney.nl／quaternius.com／polyhaven.com／opengameart.org／
  itch.io／`codeload` zip／GitHub API／github.com HTML **全部 proxy 403**；但
  **`raw.githubusercontent.com` 同 `git clone` 通**，所以經 GitHub 鏡像逐個檔攞。
- **攞咗**（`scripts/fetch-assets.mjs` 一份清單，牌照原文一齊攞）：Kenney **Tower Defense Kit**
  ＋ **Graveyard Kit**，**66 個 GLB、1.2 MB**、全部 CC0。塔件 30（模組化 base→bottom→middle→top
  →roof）、武器頭 4、路磚 21、景 10、敵人 5（skeleton／zombie／ghost／vampire／digger）。
- **量到啱到離奇**（`tests/assets.mjs` 8/8，行遊戲自己個 loader）：路磚**全部啱啱好 1×1**，而
  `map.json` cellSize 就係 1；塔每節**全部 0.5 高**，疊起冇隙；最大一件 920 三角形；GLB 自足、
  **零貼圖**。兩個坑：expose 成個 `THREE` 落 seam 令 bundle 707 → 887 kB（改成 expose `量模型`）；
  `new URL(..., import.meta.url)` build 完解成 **`index-BPBhRWuv.jstiles/tile.glb`**（永遠 404）。

### 之前：Tower 張地圖第 26 波就冇嘢再賣畀你（99 個波） (ADR-194)

- **收入 41184 對成張地圖只食得 29260**：每格貼路位都放一座升到頂兼進化嘅塔，手上仲有 12324 金，
  而後面仲有 59 個波。**每波最深滲透中位數 0.03**，成場最深 0.47，最驚險嗰波係**第一波**（兩座塔）。
  **唔係佢冇能力殺人**：封住塔數，6 座第 30 波死、10 座第 40 波死。
- 原因獨立成一件事：**七座塔入面得 arrow 有進化**，其餘六座升到頂個掣就變咗死嘅 `MAX`。而家每座
  都有一個（幾何跟返基礎型，唔使新美術），價錢＝累積投資。最貴一座 530 → 1000，買得晒嗰點由第 51 波
  推到**第 78 波**。實測第 41 波剩金 **12324 → 5206**、收入對開支 1.41× → 1.13×。加六個型即刻揭穿
  一個舊 bug：子彈 renderer 個 normalize 寫死咗兩個 arrow 名，**其他進化型子彈畫唔出**。
- **未修，亦唔扮修好咗**：做晒之後第 41 波仍然 **20/20 命、滲透中位數 0.03**。洗錢係個決定，
  生存仍然唔係。嗰個係波表嘅事，要對住 `playthrough.mjs` 一步步行。

### 之前：Tower 燒傷打幾多，係睇 tick 率 (ADR-193)

- 燒傷一格行返單次命中嗰句 `Math.max(1, dmg - armor)`。「一下最少打一點」係**一次命中**嘅規則；擺喺
  **每格行一次**嘅連續傷害度就變成**每秒最少 1 / LOGIC_DT ＝ 20**，而全部設定值都低過 20。所以
  **tank 有 8 甲兼弱火，24 dps 打出 20——「弱火」令佢食少過一隻冇弱點嘅雜兵**；boss 抗毒兼 12 甲
  一樣係 20。甲、抗性、弱點三樣全部畀個地板食晒。地板搬去 dps 嗰層之後：同一條燒傷用
  dt = 0.1／0.05／0.0125 行十秒，修之前 **100／200／800**，修之後 80／80／80。
- **燒傷冇上限咁疊**（一座毒塔自己疊五條）：火 1.93×、毒 2.20× 塔嗰版寫嘅數；而家同類型刷新。
  燒傷一律記落 `damageByType.poison`（火塔統計變咗毒）亦都修咗。開咗 `window.__TD` 量度接口。
- 兩個坑：狙擊塔 41.7 對承諾 35.7 **係我支尺嘅邊界效應**（窗口白送第一發），熱身六秒再量就 35.0；
  **我加咗 dt 參數落 seam 但冇 rebuild**——ADR-181 記低咗嘅同一個坑。

### 之前：Tower 第一把尺，難度曲線倒退 (ADR-192)

- 七千行 TypeScript、**一個測試都冇**。`smoke.mjs` 即刻捉到 stylesheet 第一行係去 Google Fonts 嘅
  CSS `@import`（串行兼擋 render，實測連線被 reset）同每次載入 404 一次 favicon；兩樣本地化。
- **難度曲線倒退**（99 個波）：7 個波易過第一波、21 次一波之內跌超過四成。守嘅唔係單調上升，
  係**崩唔崩**。**我第一版錯咗**：boss 波餵咗入「之前最高」，變成要放大 82/89 個波。條規則由
  `scripts/fix-wave-curve.mjs` import，**修同守用同一條**先夾得埋。

### Elden Ring II：通關咗、戰鬥同體力、套件提速 (ADR-186–191)

- **ADR-191 通關咗**：三波加 boss、**82 郁動秒**、收場 7 血 0 藥、476 傷害。**遊戲本身唔使再改**；
  要嘅係一個打得郁嘅支尺（政策搬**入頁面**，一個 run 由幾百個決定變 4600 個）。跟住兩樣攔住佢，
  **兩樣都係 bot 側但睇落好似遊戲 bug**。要講白：**之前幾輪我攞住「bot 通唔到關」當隻遊戲嘅證據。**
- **ADR-190**：**回氣封鎖咗成個出手動畫**——持續 11.9 dps 對第二波 24.4。**ADR-189**：**貼身斬空、
  遠距離先中**——實際 **0.4 dps** 對設計 11.9；踏前停喺接觸面之後 **30 → 128 傷害**。**ADR-187/188**：
  加咗三支藥，但藥**飲唔到**，因為雜兵 `[3.6,4.1,4.4]` 對玩家 4.4，**第三波同你一樣快**。
  **ADR-186**：**解析度就係幀率，而幀率就係遊戲時間**（955 → 619 秒）。
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
- ADR-105 至 164 全文喺 DECISIONS.md。四句：**同一件事寫兩次就有兩個答案**、**分唔開兩件嘢嘅門檻等於
  冇門檻**、**綠 gate 未跑突變之前咩都證明唔到**、**一個條件嘅一邊從來冇行過就等於冇寫過**。

## Verification

- Tower：`smoke` 5/5、`balance` **6/6**、`combat` **8/8**、`assets` **8/8**，build 綠。`playthrough.mjs`
  唔入快套件（一兩分鐘）：佢答「推得到幾遠」，唔係「有冇壞」。
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

1. **Tower 換美術**（ADR-195 做咗一半）：66 件 CC0 模型同 `assets.mjs` 已經喺度，但 `towerRenderer`
   ／`enemyRenderer`／地面仲係程序幾何。跟住換塔（模組化疊件對 3 級）、敵人、路磚。
2. **Tower：頭四十波攔唔到人**（ADR-194：41 波、20/20 命、滲透中位數 0.03；6 座塔第 30 波死、10 座
   第 40 波死）。**要對住 `playthrough.mjs` 一步步行**，推過龍就變一隻冇人打得完嘅遊戲。
3. **ER2**（ADR-191 通關證咗）未量過：鏡頭震固定 0.24、`invincibleUntil`。兩個形今個 session 各中三次：
   **一個條件嘅一邊從來冇行過**（ADR-179／182／184）、**用真實秒去等郁動時間嘅事**（ADR-186／189）。
4. **MOBA 平衡專場**：ADR-146 之後 ironhulk 17%、差幅 45，成因已知（塔同小兵冷卻修好，環境傷害上升）。
   重新做基準，一次改一樣，每次 ≥24 局；ADR-131：ironward／longshot／ironhulk 係把尺。

## Do not redo

- Hub：唔好返去絕對定位嘅單卡輪播、平台 Gomoku emoji、拉長最後一版。MOBA：唔好由 sim event 攞走英雄／
  技能資料、唔好將技能合返做一個環、唔好回復淨係泉水買嘢、唔好攞 `canShop()` 判位置、唔好再為閒置
  時間調 `RESPAWN_*`（ADR-141）或者重加近戰「接觸時間」gate（ADR-142）。Tower：唔好重覆用 ER2 嘅資產。
