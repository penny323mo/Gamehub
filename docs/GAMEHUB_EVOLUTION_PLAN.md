# Game Hub 完整進化計劃

基線：2026-08-12，`main` commit `07f470d`

規劃期：12 個月；每一階段都可以獨立交付、驗證及停止

狀態：Proposed roadmap，不代表要一次過重寫全部遊戲

## 一句策略

Game Hub 唔應該變成十三隻互不相干嘅 demo，亦唔應該勉強共用一套萬能引擎。
正確方向係：**共用玩家、存檔、生命週期、資產及 release gate；物理、鏡頭、戰鬥同
美術表現留返每隻遊戲深化。** 第一輪以 Racing 物理／賽道、Royale 戰場、Elden 關卡
三個玩家最易睇到嘅 scene vertical slice 做主線，同時建立全角色 RigCatalog；Ashen 同
Tower 已有嘅成熟流程就作技術樣板。之後先將做法帶去 Snooker、MOBA、棋牌及輕量遊戲。

## 1. 產品願景與成功定義

Game Hub 最終要做到三件事：

1. **一入即玩**：由 Hub 到第一次有效操作唔需要理解技術設定；手機直／橫屏、觸控、
   鍵盤同私隱模式都唔會阻塞開局。
2. **每隻遊戲有一個清楚強項**：Racing 係漂移與速度、Snooker 係球感、Ashen 係移動
   射擊、Tower 係佈陣、Royale/MOBA 係戰術決策；唔用畫面特效掩蓋玩法不足。
3. **有理由再返嚟**：玩家名、Continue、個人紀錄、成就及合理挑戰可以跨 session
   保存；雲端登入係可選增值，唔係玩單機嘅門檻。

完成呢份 roadmap 唔等於「所有畫面都加 bloom」。完成標準係：

- 主要操作有一致、可預測、可量度嘅反應；
- 視覺清楚表達玩法狀態，並守得住實機效能；
- 每隻遊戲有 onboarding、短期目標、長期 mastery 同安全 Continue；
- 所有 release 都有真 browser、真 viewport、資產及 gameplay witness；
- 新 agent 由 manifest、深 module interface 同測試就睇得明改動範圍。

## 2. 現況判斷

### 已有優勢

- Hub 有 13 隻可玩遊戲，涵蓋棋牌、益智、策略、MOBA、競速、射擊及 ARPG；
  `launcher.js` 已用四格分頁，手機 2×2 顯示。
- Racing 已有 sport-arcade 車輛模型、三條正逆向賽道、坡度／bank 視覺、漂移區、
  opponents、透明原車 ghost、season、audio、adaptive DPR 同完整 browser suite。
- Tower 已有 deterministic core、99 波 campaign、地圖 authority、平滑路徑、章節、
  checkpoint、成就、效能及 renderer-resource gates。
- Royale 已有本機玩家名＋code、卡組／段位／成就／每日挑戰、排行榜及 PvP；呢套係
  Hub 共用玩家系統最好嘅起點，但而家只服務 Royale。
- Ashen、Elden、MOBA、Royale、Tower 已經使用真 3D 資產、procedural／clip animation、
  mobile controls、audio 同 browser diagnostics，唔係由零開始。
- repo 已經有 `safe-storage.js`、`merge-save.mjs`、大量跨遊戲 mobile/browser gates，
  同一套 GitHub handoff／deployment 規矩。

### 最大結構性差距

| 問題 | 現況證據 | 玩家影響 |
| --- | --- | --- |
| 玩家身份割裂 | Royale profile 只 scope Royale；其他遊戲各自寫 localStorage | 換 game 後冇「同一個玩家」感覺，亦難安全備份 |
| 遊戲目錄重複 | `launcher.js` 同多個 `tests/hub-*.mjs` 各自維護遊戲清單 | 新增／改名容易 launcher、test、CI 不一致 |
| 品質成熟度不均 | Tower/Racing browser gates 深；部分靜態 game 主要靠 root flow；CI 只重點 build Tower/Ashen/Elden | 某隻 game 可以綠，但整個 Hub 仍可能回歸 |
| 重要 loop 集中大檔 | Elden `GameClient.tsx`、Snooker 2D `app.js`、Tower `main.ts`、Racing `main.js` 都承擔多種責任 | 物理／UI／save 小改容易互相污染，agent 要讀太多先敢改 |
| 物理與 frame rate 策略不一 | Snooker/Tower 有 fixed step；Racing 主要用 bounded variable `dt`；各 action game 又有自己更新模型 | 調校難比較，replay／低 FPS 行為可能不同 |
| 美術資產有好材料但冇共同 catalog | Kenney、Quaternius、KayKit、Poly Haven 等已進 repo，但各 game 自己記來源、bounds、clips、budget | 重複搵資產、混搭風格、license 或 mobile cost 容易漏 |
| 留存系統分散 | Royale 有每日／段位；Tower 有成就；Racing 有 season；其他多數只有 Continue 或單局歷史 | 玩法深度有成果，但 Hub 首頁睇唔到玩家進展 |

### 投資分組

呢個分組係排工作次序，唔係刪 game：

- **旗艦動作／物理**：Racing、Ashen Rail、Elden Ring II、Snooker。
- **旗艦策略／模擬**：Tower、Royale、深淵之橋 MOBA。
- **核心棋牌**：Xiangqi、Gomoku、Big Two、Dou Dizhu。
- **快速遊戲**：Penny Crush、Neon Snake。

第一年唔應該平均分資源。先令每組有一隻代表作達標，再將 module、資產流程同驗收方法
複製去同組其他 game。

## 3. 目標架構：共用深 module，唔共用萬能引擎

### 3.1 `GameCatalog`：一份 manifest 管全 Hub

建立 `games/manifest.json`，成為以下資料唯一 authority：

- id、顯示名、分類、入口、orientation、engine、build command；
- save schema、capabilities（audio、online、continue、profile、gyro）；
- browser smoke route、主要 viewport、asset/license manifest；
- release tier 同 owner test command。

小 interface：

```ts
catalog.list(): GameDescriptor[]
catalog.get(id): GameDescriptor
```

launcher、Hub tests、CI matrix、credits 同未來 profile dashboard 全部由同一份 manifest
生成。複雜度收埋喺 loader/validator，caller 唔再各自抄十三隻 game。

### 3.2 `PlayerVault`：本機 profile 先行，雲端只做 adapter

以 `games/royale/src/profiles.js` 已驗證嘅「名稱＋簡單 code」為 migration 起點，深化成
Hub module。code 只係同一瀏覽器內分隔存檔，**唔包裝成真正密碼或安全認證**。

小 interface：

```ts
vault.open(name, code): Promise<ProfileSession>
session.game(gameId).load(): unknown
session.game(gameId).save(snapshot): void
session.export(): Blob
```

Implementation 必須收埋：schema version、profile namespace、safe-storage fallback、
multi-tab merge、checksum、migration、export/import 同 quota failure。第一個 adapter 係 local；
日後真係要跨裝置先加 Supabase adapter。兩者行同一份 contract tests。

Migration 原則：

- 第一次建立 profile 只複製舊 key，唔刪 legacy save；
- 新 save 驗證成功兩個 release 後先提供清理選項；
- 每隻 game 自己提供 `migrate(old) -> current`，PlayerVault 只管版本及原子寫入；
- 冇 profile、storage 被封、offline 都必須照玩。

### 3.3 `ProgressLedger`：共用事件，唔共用遊戲規則

每隻 game 只上報少量 semantic event：

```ts
progress.record({ gameId, type: 'run_finished', result, score, duration, facts })
progress.summary(gameId)
progress.hubSummary()
```

成就條件、個人最佳、Continue badge、最近玩過、跨 game challenge 由 ledger implementation
處理。物理 frame、每粒子、每次 pointer move 唔可以進 ledger。Royale/Tower 現有成就可用
adapter 接入，唔需要先重寫其規則。

### 3.4 `HubLifecycle`：每隻 game 共用同一套離開／暫停契約

至少統一：`pause(reason)`、`resume(reason)`、`flushSave()`、`returnHome()`、
`reportFatal(error)`。visibility、blur、orientation、WebGL context loss 同 overlay pause 用
reason set，避免關一個 modal 就錯誤 resume 另一個 pause。

Three.js、Babylon、React/static games 各有 adapter；lifecycle 邏輯只寫一次。現有
MOBA/Tower/Racing 已有成熟實作，可以抽 contract tests，而唔係硬搬同一份 renderer code。

### 3.5 `AssetCatalog`：build-time authority，runtime 只做薄 adapter

每件 3D/audio/texture 資產要有：

- asset id、來源頁／原檔、license、原作者、checksum；
- bounds、pivot、forward axis、unit scale、triangles、materials、textures；
- skeleton、animation clip 名／時長、可否 retarget；
- LOD、壓縮格式、預計 GPU texture memory、使用 game；
- Three/Babylon adapter 所需 runtime URL。

AssetCatalog 主要係 build-time deep module。Runtime 只做 `assets.resolve(id, quality)`，
唔建立一個跨 Three/Babylon 嘅 renderer 抽象層。

### 3.6 `ReleaseGate`：manifest 驅動嘅 release 證據

一條命令按改動範圍揀：build、unit/sim、browser flow、asset audit、performance、
storage、home-return、touch、keyboard 同 full-play witness。interface 只要：

```ts
release.verify({ changedFiles, tier }): VerificationReport
```

Implementation 可以內部呼叫各 game 原生 test。唔將所有 game 強迫搬入同一個 test runner，
但每份 report 格式一致、bounded timeout、確保 child process 清理。

### 3.7 共用 runtime seam：只共用 governor、probe 同 lifecycle

唔抽象 Three.js／Babylon renderer；只建立三個有多個真 adapter 嘅 deep module：

```ts
quality.recordFrame(ms); quality.applyTier('safe')
perf.markPhase('race'); perf.snapshot()
graphics.bind(canvas, { pause, resume, contextLost, contextRestored })
```

- `QualityGovernor` 收埋 hysteresis、long-frame、pixel budget、context-loss strikes；各 game adapter
  自己決定點降 shadow、bloom、DPR、particle、animation distance。
- `PerfProbe` 用同一 schema 報 median/p95/p99、long frames、calls、tris、textures、geometries；
  Three/Babylon 只係資料 adapter。
- `GraphicsLifecycle` 同 HubLifecycle 共用 pause reason，確保 visibility/context restore 唔會
  偷偷續玩或黑畫面。

Xiangqi、Snooker idle render、Elden fixed high-quality、Ashen sequential load 係第一批高回報修正；
Launcher emoji 同時換成離線 gameplay hero capture，唔載入完整 3D scene。

## 4. 物理進化計劃

### 4.1 全體物理原則

1. Gameplay simulation 用 fixed timestep 或明確 substep；render interpolation 分開。
2. Input 先轉成 semantic intent，再交物理；DOM/pointer 狀態唔直接滲入 solver。
3. Solver 回傳 state＋events，唔直接改 HUD、播放聲或生成粒子。
4. 每套物理都有 deterministic scenario corpus、低 FPS、120 Hz、pause/resume、
   non-finite、replay divergence gates。
5. 「爽快」優先過盲目寫實：assist 必須透明、有界、只修復常見挫折，唔代玩家作決策。

### 4.2 Racing：由堆疊 feedback 進化成可調校 Vehicle Dynamics

現有 `car.js` 已有 tire grip、friction circle、ABS、handbrake、grade load 同救車；下一步
唔係再疊多一個 camera shake，而係建立深 `VehicleDynamics` module：

```ts
dynamics.step(intent, surface, fixedDt): VehicleFrame
```

`VehicleFrame` 包含 pose、wheel speeds、slip、load、contact、impact 同 semantic events；
camera、audio、wheel animation、smoke、HUD 只讀呢份結果。

進化順序：

- variable dt 外面加 120 Hz accumulator，render 保持獨立；
- 用速度／載荷可調 tire curve，分開 longitudinal/lateral grip，但保留 arcade recovery；
- asphalt、kerb、grass、wet 四種 surface response；
- 有界 weight transfer、brake balance、differential illusion、four-wheel visual telemetry；
- 碰欄由「硬推走」改成 normal impulse＋scrub loss＋短暫 feedback event；
- 用同一 input trace 比較 30/60/120 Hz，位置／速度／圈時誤差要在預定 tolerance 內；
- 建 tuning lab：0–80、煞停距離、90° turn-in、髮夾、漂移入／守／收、草地 recovery、
  wall recovery、簡易模式各有 golden metrics。

唔建議第一年換成完整四輪 rigid-body suspension。手機賽車最有價值係可控 slip、
重量轉移同路面差異；完整 solver 會大幅增加調校面，同時破壞現有 AI、ghost 同 track gates。

### 4.3 Snooker：2D/3D 共用真正 `TablePhysics`

2D `app.js` 已有 120 Hz fixed step、spin、cushion、pocket 同 online replay，但規則、UI、
AI、save、render、physics 集中一檔；3D 又有自己一套行為。應抽出純 `TablePhysics`：

```ts
table.shoot(shotIntent): void
table.step(fixedDt): TableEvents
table.snapshot(): TableState
```

核心升級：

- ball state 加 angular velocity，將 top/back/side spin 由撞擊時一次性加速度改成持續耦合；
- cloth rolling/sliding transition、速度相關 cushion restitution、throw/contact friction；
- pocket jaw 幾何、rattle、near-miss、合法 respot；
- 2D/3D renderer、AI search、online replay 全部用同一 solver；
- canonical shot corpus：直線 stop/follow/screw、90° stun、三庫、薄球、袋口 rattle、
  break、不同 refresh rate 重播；結果用位置、入袋、first contact、energy loss 比較。

玩法上同時加 practice lab、shot replay、aim assist 分級；高手模式逐步縮短預測線，唔係
突然熄晒輔助。

### 4.4 Elden Ring II：Combat Motor 同 Hit Resolver 離開 React 大檔

唔重寫成另一隻遊戲；沿現有 Cannon-es、class、boss、telegraph 深化兩個 module：

- `CombatMotor.step(intent, world, dt)`：capsule movement、step/slope、dodge displacement、
  stamina、lock-on strafe、grounding。
- `HitResolver.resolve(attacks, hurtboxes, frame)`：wind-up、active/recovery、hitbox、i-frame、
  poise、guard、hitstop、knockback、damage event。

先用現有三職業＋boss 做完整 contract tests，再拆 `GameClient.tsx`；唔做為拆檔而拆檔。
成功標準係同一 input witness 仍可通關，而 attack timing、dodge、命中感同 slope/collision
有更清楚數據。

### 4.5 Ashen Rail：移動射擊嘅穩定性優先

- `PlayerController` 保持負責 movement/turn；補 moving-platform reference frame、ground probe、
  edge recovery 同速度平滑。
- Weapon 命中用明確 ray/projectile contract、敵我 hurtbox、recoil event；animation 只讀結果。
- Aim assist 用 target cone、screen-space distance、manual-input damp，唔自動吸去遮擋目標。
- 增加受擊 stagger、武器／角色 recoil 分層、落地／轉身／停止 pose；唔上 full ragdoll。
- 30/60 FPS、觸控＋gyro、弱機 auto quality 下，aim delta 同 kill time 保持 tolerance。

### 4.6 策略 game 嘅「物理」係 simulation clarity

- Tower/Royale/MOBA 保持 deterministic simulation；優先 pathing、spacing、target selection、
  projectile event、attack timing，唔加 rigid-body 碰撞。
- 每個單位動作必須由 semantic state 驅動：idle、move、wind-up、attack、hit、death；
  animation 唔可以反過來決定傷害。
- 視覺 interpolation 同 fixed simulation 分開；30/60/120 FPS 同 seed 要得出一致勝負及
  關鍵數值。

## 5. 視覺進化計劃

### 5.1 先定五套 art direction，唔再逐件資產決定風格

| 視覺家族 | 遊戲 | 核心語言 |
| --- | --- | --- |
| Stylised tactical diorama | Tower、Royale、MOBA | 清楚輪廓、隊伍色、低材質數、地圖分區 |
| Sport authenticity | Racing、Snooker | 接地、材質反應、速度／撞擊、鏡頭可信度 |
| Dark fantasy | Elden | 高反差、危險 telegraph、重武器動作、環境敘事 |
| Stylised action | Ashen Rail | 橙藍敵我分色、列車速度、silhouette、命中 feedback |
| Clean tabletop / neon arcade | 棋牌、Penny Crush、Snake | 觸控清楚、節奏動畫、狀態唔靠文字先睇得明 |

每隻 game 一個 primary asset family、一個 environment family；其他來源只可做經過材質、
比例及色板統一嘅 props。唔可以因為免費就將五種畫風混喺同一鏡頭。

### 5.2 Asset pipeline

- glTF/GLB import 前自動量 bounds、pivot、forward axis、unit、clips、bones、triangles、
  materials、texture dimensions；
- 角色 asset 要生成 animation contact sheet／clip report，冇 clip 要明確標示 procedural；
- Draco/Meshopt、KTX2/WebP、LOD0/1/2、texture atlas 按 game/device tier產生；
- 重複 static props 用 InstancedMesh/thin instances；skinned actor 設可見數量上限；
- source license、原檔、加工步驟及輸出 checksum 一齊 version；
- CI 拒絕 missing license、404 runtime path、超 budget texture、負 scale skeleton、
  非 finite bounds、未識別 animation names。

### 5.3 Lighting、camera、VFX

- 每個 3D game 建一個 Lighting Bible：key/fill/rim、exposure、fog、shadow tier、夜景 fallback；
- camera 由 gameplay event 驅動：acceleration、hit、lock-on、tower focus、shot follow；
  shake/lean/FOV 全部 bounded、可減弱、可關閉；
- VFX 使用固定 pool、semantic colour、清楚 telegraph；唔因粒子多就當 impact 強；
- 角色要有 foot plant、turn anticipation、attack wind-up/contact/recovery、hit reaction；
- UI 同 world feedback 配對，例如 drift zone＋胎聲、skill telegraph＋cooldown、snooker
  contact point＋實際 spin outcome。

### 5.4 Mobile visual budget

沿用每隻 game 已有 budget，而唔用一個虛假通用數字：

- Racing 保持最繁忙場景 `<20 calls / <120k triangles`；
- MOBA 保持 match peak `<600 calls`，逐步將重複 unit/fx 批次化；
- Tower 以現有 desktop/mobile performance gate 同 geometry growth `0` 為 baseline；
- Ashen/Elden 先建立真機 tier baseline，再鎖 draw calls、visible skinned meshes、shadow
  casters、texture memory 同 p95 frame time；
- 2D game 目標係 stable 60 Hz input/render、零 layout shift、動畫唔阻塞 rules loop。

Headless SwiftShader 只用作相對 regression；絕對 FPS 必須由至少一部較舊 iPhone、
一部中階 Android、Mac Safari/Chrome 實測。

## 6. 全角色／單位 Rig、Skeleton、Motion 重新配對

呢個係獨立工程，唔可以附帶喺「換靚 model」入面順手做。現況有三種完全唔同嘅 actor：
有 authored clips 嘅 Elden／MOBA、用骨架 node 做程序動畫嘅 Ashen／Royale，以及 Tower
敵人同 Racing 車輪呢類 procedural／mechanical rig。目標唔係強迫全部用同一副骨架，而係
令每件 asset 都有可查、可測、可 fallback 嘅動作契約。

### 6.1 `RigCatalog`：AssetCatalog 下面嘅骨架真相

每個 actor／unit／vehicle 建立一份 build-time descriptor：

```ts
type RigDescriptor = {
  assetId: string
  rigKind: 'skinned' | 'procedural' | 'mechanical'
  skeletonHash?: string
  root: string
  forwardAxis: '+Z' | '-Z' | '+X' | '-X'
  upAxis: '+Y'
  scaleMetres: number
  bones: Record<SemanticBone, string[]>
  sockets: Record<'weapon' | 'muzzle' | 'handL' | 'handR' | 'head', SocketSpec>
  clips: Record<MotionState, ClipSpec | ProceduralFallback>
}
```

`ClipSpec` 要記錄 duration、loop、root motion、contact frame、可否打斷、來源 skeleton；
runtime 只按 semantic name 取動作，唔再喺 gameplay code 到處硬寫 GLB clip 名或 bone alias。

### 6.2 單一動作狀態契約

每隻 game 保留自己嘅 state machine，但輸出共同語意：

- locomotion：idle、start、walk/run、strafe、turn、stop、air/land；
- combat：wind-up、active/contact、recovery、reload、recoil、block、dodge；
- reaction：hit-light、hit-heavy、stagger、knockdown、death；
- vehicle/mechanical：steer、wheel-spin、suspension/contact、impact、airborne。

Simulation／HitResolver 係 gameplay 真相；MotionGraph 只消費 state＋events。Animation clip
永遠唔可以自行扣血、移動 AI 或決定命中。特殊 lunge／dodge 可以使用 root-motion curve，
但 curve 必須先轉成 motor intent，由 collision authority 接納後先落位。

### 6.3 現有角色逐批重配對

| 遊戲 | 需要盤點／重配對 | 建議策略 |
| --- | --- | --- |
| Royale | archer、cavalry、militia、musketeer、pikeman、swordsman、war elephant、catapult、ram | 保留 `SkeletonUtils` clone；先統一人形骨架同武器 socket，再為象／攻城器械建立獨立 procedural/mechanical rig，唔硬套人形 clip |
| 深淵之橋 MOBA | barbarian、knight、mage、ranger、rogue、四類 minion、各武器 | 以現有共享 `anims.glb` pipeline 做 reference；驗證 node-name binding、左右手 weapon socket、attack contact 同 clone independence |
| Ashen Rail | player、weapon、drone、列車互動件 | 現有 player 有 skeleton 但冇 clips；先 audition 同骨架相容嘅 authored locomotion／fire clips，程序 aim/recoil 做 additive fallback，唔盲 retarget |
| Elden Ring II | 三職業、boss/demon、skeleton minion、武器 | 將現有 `Sword_Attack`、`Run_Weapon` 等實名移入 catalog；逐個對 wind-up/contact/recovery、i-frame、death lock，並固定 weapon/muzzle socket |
| Tower | 五類敵人、塔頂武器、projectile origin | 多數模型冇 bone/clip，明確列為 procedural；移動／受擊／死亡用 state pose，塔武器用 mechanical aim/recoil，唔假裝係 skeletal animation |
| Racing | 車身、四輪、轉向、懸掛、ghost | 列為 mechanical rig；由 VehicleFrame 驅動真 wheel/contact state，淘汰 vertex-name 猜輪 heuristic。除非新 rigged car 通過 budget/handling parity，否則唔換車身 |

### 6.4 重配對流程

1. **Census**：用 Ashen asset audit＋MOBA clip report 掃晒 GLB，產生 skeleton hash、bone tree、
   clips、bounds、axis、socket 同缺口報告。
2. **Normalize**：修 rest pose、ground plane、unit scale、forward axis、root、weapon/muzzle socket；
   加工後 asset 另存，唔喺 runtime 每幀補救。
3. **Pair**：按 semantic MotionState 配 authored clip；只有 skeleton topology／rest pose 相容先
   retarget，否則用 procedural fallback 或換同一 asset family。
4. **Author timing**：每個 attack 標 wind-up、contact、recovery；步行標 left/right plant；射擊
   標 muzzle/recoil；死亡 clip 鎖終態。
5. **Integrate**：MotionGraph 讀 simulation speed、方向、aim 同 combat event，做 bounded blend；
   gameplay 唔讀動畫時間推理傷害。
6. **Witness**：每類 actor 保存正面／側面 contact sheet、30/60/120Hz capture、武器 socket
   overlay 同多人 clone stress scene。

### 6.5 Rig acceptance gates

- 100% 可見 actor state 有 authored clip 或明確 procedural fallback，唔可以 T-pose／硬直；
- 停低後 150ms 內 locomotion weight 歸零，死亡唔會彈返 idle；
- 可見 attack contact 同 gameplay damage event 誤差不多於 ±50ms；
- planted foot 接觸期 world slide <8cm，weapon socket 誤差 <角色身高 2%；
- 同時 20 個 clone 唔共享 mixer、skeleton pose 或 mutable material；
- 30/60/120Hz transition 時間誤差 <5%，但 gameplay state hash 必須一致；
- mobile low tier 可以降遠距 actor animation rate／骨骼更新，但近距主角同命中 event 不降級。

## 7. 場景全面升級

場景升級唔等於喺空位塞樹。每個場景都要同時有六層：**玩法 topology、可記憶 landmark、
前中後景 depth、可讀 lighting、動態事件、可量度 performance tier**。視覺 mesh 唔可以暗中
成為碰撞／路徑 authority；map、track spline、nav/collider manifest 先係 gameplay 真相。

### 7.1 共通場景設計規格

- 每張 map 先畫灰盒：主要路徑、分支、視線、危險區、安全區、決策點；通過玩法 witness
  先換正式 asset。
- 用 3–5 個大 landmark 定方向，再用中型 props 建節奏，小型 clutter 只作近鏡；唔平均灑滿。
- 場景分 chunk／sector，重複件 instance，遠景 billboard／低 LOD，遮擋外 actor 暫停昂貴更新。
- 每隻 game 建 art bible：palette、材質 roughness、fog、exposure、shadow softness、VFX luminance。
- 日／黃昏／夜晚係完整 preset：sun、sky、fog、exposure、emissive、traffic/ambient 一齊變；
  UI 選擇必須真係改 scene，唔只換天空顏色。
- 每張 scene 有 normal、stress、low-quality 三張 golden capture，同 calls/tris/textures/frame-time gate。

### 7.2 Royale：由長方形棋盤變成「三區戰場」

保留現有 lanes、部署規則、泉水／商店條件同 deterministic combat；重新包裝成有戰線演變嘅
立體 tactical battlefield：

1. **西部集結地**：營地、補給車、矮牆、隊伍旗；玩家第一眼知道己方入口同部署方向。
2. **中央河谷／橋樑**：兩條主 crossing＋一個可爭奪淺灘，用橋、河床、燒毀車架做節奏點；
   collision/path 仍由 map authority 定義，視覺高度唔改單位合法行走。
3. **東部城塞**：城門、兩翼塔台、內院同 keep；塔、出怪閘門、泉水／商店各有清楚 footprint，
   唔再黐住 path 或互相重疊。

場景事件可以有箭雨痕、旗幟損毀、城門狀態、河面風、遠景煙霧；全部由戰局事件驅動，
唔改傷害。角色輪廓、team tint、health bar、skill telegraph 永遠比草木／陰影優先。

資產組合：Quaternius RTS units/buildings 做主家族，Kenney Fantasy Town／Nature Kit 補 props，
KayKit Medieval Hexagon 只做通過比例／色板 audition 嘅地形件。靜態戰場現有 mobile p95 約
519 calls、峰值約 867K tris，第一個 scene pass 先靠 batching／instancing 將 provisional gate
收緊至 p95 ≤420 calls、peak ≤650K tris，唔可以「升級場景」後反而再加成本。

### 7.3 Racing Car：由一條賽道變成三個可辨識 circuit 世界

Track spline、checkpoint、AI route、ghost 同 VehicleDynamics 共用同一條 authority；場景由 spline
衍生 sector，而唔再係獨立裝飾。首批三個 circuit family：

- **海港海岸**：pit/start grid、貨櫃港、海堤、高速 sweep、濕滑低地；主打高速 drift chain。
- **山路峽谷**：髮夾、連續 S 彎、bank、落差、林線／岩壁 landmark；主打煞車轉移同長漂。
- **夜城工業**：隧道、橋底、霓虹維修區、雨地反光、收窄 chicane；主打精準轉向同風險捷徑。

每條賽道要有 start grid、pit／維修區、觀眾／車房遠景、每 sector 唯一 landmark、路面 material
區分、越界 recovery、地平線 depth。同一路線可做日／黃昏／雨夜變體，但 wet grip 只有在
surface query 啟用時先影響物理，唔用視覺假裝。

Kenney 3D Road Pack 優先 audition barrier、sign、pit、roadside prop；Nature Kit 做林／岩分區。
路面 ribbon、kerb、drift zone 仍由 spline 生成，避免 tile seam 破壞 AI／ghost。Chunk instancing、
遠景 impostor、只載相鄰 sector；維持現有最繁忙場景 `<20 calls / <120K triangles`，如果新
場景達唔到，就先減 prop material／合批，唔降低車輛操控更新率。

### 7.4 Elden Ring II：由單一 arena 變成三段相連 dark-fantasy 關卡

保留現有三職業、boss battle、Cannon 世界同 full-playthrough witness，重新規劃為一條有
shortcut、垂直 silhouette 同 encounter pacing 嘅短篇旅程：

1. **灰燼長堤**：風化城牆、斷橋、巡邏 skeleton、遠望終局城堡；教 movement／lock-on。
2. **沉沒外庭**：水浸 courtyard、地牢側路、可開捷徑閘、兩個 encounter pocket；教 dodge、
   ranged／crowd control，休息 shrine 係明確安全點。
3. **空冠王座**：狹窄前廳放技能檢查，之後開闊 boss arena；柱／階梯提供讀招背景但唔卡鏡頭，
   死亡後由已開 shortcut 快速返場。

資產沿用已驗證 Quaternius RPG／Ultimate Monsters、Kenney Castle Kit、KayKit Dungeon；
Poly Haven 只用 bundle 後 1K/mobile environment material/HDRI。每個 sector 有 navigation／collider
manifest、spawn、camera volume、lighting preset、streaming boundary；唔直接用複雜 render mesh
當 collider。重複牆、柱、碎石用 instance/shared geometry，先加 quality tiers：降 bloom，跟住
shadow 2048→1024，再降 DPR。Standard provisional gate 為 ≤220 calls／≤750K tris，低階手機
p95 ≤35ms 比絕對幾何數優先。

### 7.5 其他場景後續

- Ashen：列車由一條直通道擴成貨運站、峽谷橋、維修庫三段 biome；背景速度同近景戰鬥層分開。
- Tower：沿現有 layout authority 發展森林入口、中央河谷、城堡懸崖 chapter；場外 foundation
  塑造輪廓，但 buildable/path 一律只讀 `mapLayout.ts`。
- MOBA：泉水、商店、閘門、塔同 lane landmark 先校正 footprint，再加兩側懸崖／河谷深度；
  商店可否買同 UI 是否可退出係 gameplay contract，唔由視覺區塊猜。
- Snooker：建立可信 studio／club／tournament 三個 lighting shell；球枱尺寸、袋口同碰撞完全由
  TablePhysics 定義。

## 8. Free 3D asset 導入策略

### 8.1 已核實可用來源

以下來源已經喺 repo license／決策紀錄出現，屬於今次計劃嘅正式候選池：

| 來源 | 已有／可用內容 | 建議用途 |
| --- | --- | --- |
| [Kenney](https://kenney.nl/assets)（CC0） | Tower Defense Kit、Graveyard、Fantasy Town；另有 Nature Kit、3D Road Pack、Hexagon Kit | Tower 地圖／塔／怪、Racing 路旁 props、策略地圖、Hub 3D thumbnails |
| [Quaternius](https://quaternius.com)（CC0 packs） | RPG Characters、Ultimate Monsters、RTS、樹木／建築 | Elden、Ashen、Royale 嘅角色、怪、建築；優先用已有 clips |
| [KayKit](https://kaylousberg.com)（CC0） | Adventurers、Skeletons、Dungeon；另有 Medieval Hexagon、Halloween Bits、City Builder、Prototype Bits | MOBA champion/minion、Ashen 敵人、Elden dungeon、策略地形 |
| [Poly Haven](https://polyhaven.com)（CC0） | HDRI、PBR materials，例如現有 Studio Small 09／Cobblestone | 燈光 look-dev、Snooker studio、車房／夜景、材質；必須 bundle 1K/mobile 版本 |
| [OpenGameArt](https://opengameart.org)（逐件核 license） | 現有 CC0 music/audio | 補音樂／環境聲；唔因網站名就假設全部都係 CC0 |

之前已確認但未充分用嘅 Kenney Nature/3D Road/Hexagon/Fantasy Town 同 KayKit Medieval
Hexagon/City Builder/Prototype Bits，應先入 catalog 做實際尺寸及風格 audition，唔需要重新
由零搜尋。「候選」只代表 repo 已有 license evidence；每次新增下載仍要重新保存 source page、
license snapshot、checksum 同驗證日期，唔以舊記憶代替當次授權檢查。

### 8.2 每隻 game 嘅優先 asset mapping

- **Racing**：Kenney 3D Road 只取 barrier、sign、pit/roadside prop 作 audition；賽道 ribbon
  仍由 spline 生成。Nature Kit 做低成本分區地標，唔將 tile 路段硬塞落現有物理。
- **Tower**：先用已入庫 Tower/Graveyard/Fantasy Town；Nature/Hexagon 補 biome，KayKit
  Medieval Hexagon 只喺比例、色板同一格 authority 對得上先採用。
- **Royale/MOBA**：Quaternius RTS 同 KayKit Adventurers 分開做兩套 prototype，按 skeleton、
  animation completeness、team recolour、unit count 成本揀一套主家族，唔混用所有角色。
- **Ashen**：Quaternius/KayKit 有完整 run/aim/attack/death clip 嘅 actor 優先；無 clip 模型
  只留 boss/prop 或沿用 procedural rig，避免再次出現硬直 soldier。
- **Elden**：沿用 Quaternius RPG/Ultimate Monsters＋KayKit Dungeon；新區域先由同家族擴充，
  Poly Haven material 只做低解析 environment layer。
- **Snooker**：Poly Haven 1K studio HDRI/wood/cloth audition；球、枱、袋口要由物理尺寸生成或
  嚴格 normalize，裝飾場景先用外部資產。
- **Hub**：唔直接載入十三個 3D scene。每隻 game 離線 render 一張一致角度 WebP poster；
  hover/active page先可選載短 WebM，首屏唔背全部 3D asset 成本。

### 8.3 Asset 接受 gate

一件免費資產只有同時滿足以下條件先算「可用」：

1. license 原文同 source URL 已入 manifest；
2. 本地／Pages 可載，唔依賴 runtime CDN；
3. bounds、unit、pivot、forward axis 已量；
4. triangles、material count、texture memory 符合該 game tier；
5. skeleton/clip 真係存在，clip name、loop、root motion 已驗；
6. team tint／材質修改唔會 mutate shared material；
7. 至少有 low-quality fallback 或 LOD；
8. 320×568、667×375 或 game 指定 mobile viewport 真 render 過；
9. 同主 art family 放埋一齊唔似拼貼；
10. credits UI 可由 manifest 生成。

## 9. 遊戲性與留存進化

### 9.1 三層 loop

每隻 game 都要按自己類型回答三個問題：

- **30 秒 loop**：玩家而家做乜，操作後有咩即時結果？
- **一局 loop**：點樣贏、點樣輸、點樣知道自己進步？
- **跨局 loop**：下次返嚟有咩新目標，而唔係靠懲罰式 daily streak？

ProgressLedger 顯示「最近玩過／Continue／個人最佳／下一個自然目標」。唔用 popup 強迫
每日登入，唔用虛假倒數或 monetisation dark pattern。

### 9.2 Onboarding

- 第一次只教一個動作；做成功先教下一個；
- 教學用真玩法狀態，唔係一頁長文；
- 第二次進入預設直接 Continue，教學可重開；
- assist 分「入門／標準／專家」，並清楚講改咗乜；
- game over 要提供具體改善提示，例如煞車點、塔傷害缺口、first contact、dodge timing。

### 9.3 內容與 mastery

- Racing：time trial、drift sector、season、ghost challenge、surface/weather variant；
- Snooker：shot drills、規則 challenge、AI ladder、best break、tournament；
- Tower：章節目標、daily seeded map/modifier、endless leaderboard、限制塔 challenge；
- Royale：保留卡組／段位／daily，但先做 balance seasons、fair PvP/reconnect、deck mastery；
- MOBA：角色教學、補刀／走位 drill、兩個短 match variant、build preset；
- Ashen：三段 route 分支、武器選擇、精英 wave、boss、run modifiers；
- Elden：每職業兩個 build branch、第二區域、第二 boss、challenge rematch；
- 棋牌：殘局／指定牌局／AI ladder／對局回顧；
- Penny Crush/Snake：短 mission、每日 seed（無懲罰 streak）、週期性 high score board。

### 9.4 Difficulty

Difficulty 唔只係敵人加血：

- AI game 用搜尋深度、決策 noise、反應窗、可見資訊調整；
- action game 調 telegraph、敵人組合、資源壓力，唔縮到不可讀；
- racing 調 assist、opponent consistency、surface grip，唔作弊 teleport；
- 每個難度用 completion、damage/失誤、平均局長、玩家主動重試率校正。

### 9.5 Hub 由 demo carousel 變成真正遊戲首頁

13 隻 game 用固定四格分頁必然出現 `4+4+4+1`，最後一頁單卡唔係 CSS 小問題。首頁改成
responsive scroll grid，並由 GameCatalog 提供：

- gameplay hero thumbnail、分類、控制方式、預計一局時間、online/offline、最近更新；
- 最近玩過、Continue、收藏、搜尋、類型／裝置 filter；
- 每隻 game 一個最有意義嘅 progress summary，唔強迫全部變 XP；
- local/cloud 資料說明、profile/export、audio/reduced-motion 等 Hub settings。

首屏只 preload 當前 hero WebP/AVIF，每張 provisional ≤120KB；唔 autoplay 十三段影片。
320px 起冇 horizontal overflow、冇 singleton page，keyboard/switch 可到每張卡。Catalog 同時修正
過時 metadata，例如 Tower 唔再顯示舊「20 波」描述。

### 9.6 先修正已承諾但未接通嘅玩法

- Neon Snake Daily 而家冇真 seed、achievement 亦未由 gameplay unlock；呢兩項列 P0 correctness，
  唔可以繼續只顯示 UI。
- Ashen result、Elden run history、Snooker best break、MOBA mastery 要接入 versioned `GameResult`；
  同一 `runId` reload/retry 唔可重複派發。
- 六隻 online game 只共用 lobby/reconnect/presence contract；棋步、球桿、牌局、Royale action
  protocol 留返各 game。第一年唔加 chat／DM／friend graph。
- Remote analytics 必須 opt-in、event allowlist、可撤回；未有兩星期 baseline 前唔拍腦袋寫
  retention 百分比目標。

## 10. 各遊戲下一個完整版本

| 遊戲 | 物理／simulation | 視覺 | 遊戲性下一步 |
| --- | --- | --- | --- |
| Racing | fixed VehicleDynamics、surface grip、impulse collision | 機械 rig 重配、海港／山路／夜城三類 circuit、天氣、車身接地 | drift sectors、time trial、ghost challenge |
| Ashen Rail | moving-platform motor、aim/hurtbox/recoil | authored＋procedural motion 重配、列車三段 biome | boss＋route branch＋run upgrade |
| Elden Ring II | CombatMotor、HitResolver、poise/i-frame | 全職業／boss rig timing、灰燼長堤／沉沒外庭／空冠王座 | 第二 boss、build branch、shortcut/rematch |
| Snooker | 共用 120 Hz TablePhysics、angular spin、pocket jaws | 2D/3D 同步球路、材質／燈光 | shot lab、AI ladder、tournament |
| Tower | deterministic combat/event seam、balance lab | procedural unit rig、biome、塔升級 silhouette | chapter objective、seed challenge、endless |
| Royale | sim/render interpolation、damage funnel延伸 | 全單位 rig 重配、三區戰場、attack readability | balance season、deck mastery、PvP resilience |
| 深淵之橋 | path/spacing/attack timing、seed replay | champion/minion rig audit、map landmarks、低成本 batching | champion tutorial、短模式、build preset |
| Xiangqi | AI budget/worker determinism | 棋子 move/capture feedback、桌面 look | 殘局、opening lesson、AI ladder |
| Gomoku | AI generation/lifecycle | 落子、連線、勝負動效 | puzzle、rule variant、AI ladder |
| Big Two | rules/AI event trace | 出牌／收牌／輪次 feedback | challenge deals、tournament、回顧 |
| Dou Dizhu | bidding/play AI trace | 叫分、炸彈、身份 feedback | bidding lesson、challenge deals、回顧 |
| Penny Crush | deterministic cascade | hit-stop、combo path、board transition | level objectives、mission、seed challenge |
| Neon Snake | fixed grid timing/input queue | neon depth、food/state distinction、haptics | mission、mode modifiers、high-score season |

## 11. Audio、haptics、accessibility

- 建 semantic audio event 命名：UI、move、impact、danger、success、failure、ambience；
  每隻 game 自己配聲，唔共用同一套音色。
- AudioContext 只由 user gesture 啟動；pause/home/visibility 即時收聲；所有 game 有 mute。
- 手機 haptic 只用於碰撞、出桿、命中、完美 timing 等離散事件，設總開關；Safari 無 support
  要完全安全。
- 全 Hub 維持 44×44 touch target、visible focus、screen-reader label、safe area、reduced motion、
  colour-blind-safe team/status cues。
- 鏡頭震動、flash、speed lines、gyro、aim assist、auto throttle 都可獨立調節；唔將「易玩」
  同「所有效果強制開」綁埋。

## 12. 分階段執行

### Phase 0 — 第 1–2 星期：建立 release、資產同場景真相

交付：

- `games/manifest.json`＋GameCatalog validator，一份資料生成 launcher、test inventory 同 CI matrix；
- deploy 由「只重點驗 Tower/Ashen/Elden」改成 changed-game required gates＋13/13 Hub fast gates；
- 所有 game 嘅 boot/load/save/return/touch/build/dist policy，同三部基準裝置 cold/warm load、
  median/p95/p99 frame、long frames、DPR、memory、calls、tris、errors；
- AssetCatalog＋RigCatalog schema，收錄現有 Kenney/Quaternius/KayKit/Poly Haven/OpenGameArt，
  並產生所有 actor bone/clip/socket/axis census；
- Royale、Racing、Elden 各完成玩法灰盒、landmark plan、scene budget 同 before capture；
- PlayerVault／ProgressLedger interface contract，唔接 UI 住；
- Racing、Snooker、Ashen、Elden 各一份 golden gameplay trace。

退出條件：main deploy 必須等 manifest-derived required matrix 全綠；現有 13 game 行為冇變；
baseline report 可重跑；100% runtime GLB 有 license entry 或明確阻塞；三個新 scene 灰盒先通過
玩法 witness，未通過唔進 art pass。

### Phase 1 — 第 3–8 星期：三個煥然一新 vertical slice

1. **Racing**：fixed-step wrapper＋VehicleDynamics telemetry＋一條完整 Harbor／Mountain circuit v2，
   包含 surface、drift chain、landmark、日／黃昏 preset 同機械 rig wheel/contact。
2. **Royale**：三區戰場完成一個可玩版本；步兵、遠程、騎兵、攻城器械各一個 rig archetype
   配對完成，城門／塔／泉水／商店 footprint 同退出流程有 browser witness。
3. **Elden**：灰燼長堤＋沉沒外庭、shortcut、quality tier；三職業、skeleton、boss 嘅
   locomotion／attack/contact／death mapping 完成。
4. **Hub**：responsive scroll grid、hero cards、recent/favorite/filter/Continue，同本機 profile
   名＋可選 code prototype。

退出條件：三隻 game 各有真機 before/after witness；角色零 T-pose／硬直，contact timing gate
通過；Racing `<20 calls / <120K tris`、Royale provisional `≤420 / ≤650K`、Elden standard
provisional `≤220 / ≤750K` 或有更嚴格實機 frame gate；舊 save migration 可回復；asset
manifest、credits、scene golden、budget 全綠。

### Phase 2 — 第 3–4 月：物理真相、Rig rollout、場景第二輪

- Snooker 共用 TablePhysics，先接 2D，再接 3D；
- Elden 抽 CombatMotor/HitResolver，但保持原 full-playthrough witness；
- Racing 完成 surface/collision/tuning lab；
- Ashen 完成 analog magnitude、moving-platform、aim/hurtbox contract，同 authored＋procedural
  turn/run/fire/hit/death 配對；
- Royale/MOBA 全單位 RigCatalog rollout；Tower 敵人／塔武器列明 procedural/mechanical contract；
- Racing 補其餘 circuit family；Royale/Elden 各加一個 lighting/time 或 encounter variant；
- ReleaseGate 加 physics replay、30/60/120 Hz divergence、non-finite、low-FPS tests。

退出條件：同一 input trace 跨 30/60/90/120Hz position 誤差 ≤0.02m、angle ≤0.2°；
Ashen 半搖桿速度為全搖桿 45–55%，加速至全速 0.25–0.55 秒；Snooker 2D/3D 同桿
最終球位差 ≤5mm、角度 ≤0.5°；每次可見 hit 同扣血同 target/contact point；scene variant
唔超第一輪 budget。

### Phase 3 — 第 5–8 月：策略、留存與內容

- ProgressLedger 接 Tower/Royale/Racing/Snooker，再接其餘 game；
- Royale/MOBA sim/render seam、animation readability、tutorial/mastery；
- Neon Snake 先接通真 Daily seed 同 15 個 achievement unlock path；
- 棋牌增加 puzzle/challenge/AI ladder；
- Penny Crush/Snake 增加短 mission；
- Hub 首頁加入 Continue、最近遊戲、進度摘要、統一 credits/profile/export。

退出條件：13/13 game 完成一局會產生 versioned、可 dedupe `GameResult`；每隻都有短目標＋
長目標；profile switch 唔串 save；export→清空→import round-trip；兩 tab 更新唔吞進度；
無 profile/offline/private mode 仍可玩。

### Phase 4 — 第 9–12 月：內容季、線上可靠性與 release maturity

- 用已完成 system 做新 track/biome/boss/challenge，而唔再擴底層 interface；
- optional Supabase cloud adapter、leaderboard/PvP reconnect 逐項 rollout；
- CI 由 manifest 跑全 Hub release tier；
- 真機 regression roster、visual golden review、bundle/asset budget dashboard；
- 每季只揀 2–3 隻 game 更新內容，其他守穩定，避免十三隻一齊半完成。

退出條件：main 每次 deploy 有完整 VerificationReport；cloud failure 不影響 local play；
每個 active content game 有 balance witness、rollback point 同 handoff。

## 13. KPI 與 release scorecard

### Reliability

- Hub＋13 game：直／橫屏全部載入、零 unexpected page error、零必需資產 404；
- 13/13 launcher、Hub-return、blocked-storage fast gates 進 required deploy matrix；
- 所有 game 有可見 Home、pause/visibility safe、WebGL context fallback；
- save corruption、storage blocked、multi-tab、舊 schema 各有 gate；
- online failure 唔阻塞 offline menu。

### Performance

- iPhone 13／Pixel 7 級：median 60fps、p95 ≤22ms、>34ms frames <2%；
- iPhone SE2／Pixel 4a 級：鎖 30fps、p95 ≤35ms、>50ms frames <1%；
- game menu/paused screen 唔持續燒 60fps GPU；
- 每隻 game 鎖自己嘅 calls/triangles/skinned actors/texture memory budget；
- 15 分鐘 thermal soak 後五分鐘 median FPS 較首五分鐘跌幅 <15%；
- 30 分鐘 geometry／texture count 漂移 <5%；cold/warm load、asset/content PR 無解釋退步
  不得 >10%。

### Physics/game feel

- fixed-step trace 30/60/90/120Hz gameplay hash 一致；position ≤0.02m、angle ≤0.2°；
- input release、blur、pointer cancel 後零 stuck input；
- Racing 有 acceleration/brake/turn/drift/recovery metrics；
- Snooker 有 canonical shot corpus；
- action game 有 attack active frame、i-frame、hitstop、aim assist、time-to-kill witness。

### Animation／Rig

- 100% 可見 actor state 有 authored/procedural fallback；90% 戰鬥動作有 anticipation→contact→recovery；
- attack contact 同 damage event ±50ms；planted foot slide <8cm；weapon socket <角色身高 2%；
- 20 clones pose/mixer/material 獨立；30/60/120Hz transition timing 誤差 <5%；
- input 至 muzzle flash／impact audiovisual feedback <50ms，input-to-visible response p95 <70ms。

### Gameplay

- 新玩家第一次有效操作不多於 30 秒；
- 每局結束清楚顯示成敗原因、個人進步及一個下一步；
- Continue 永遠恢復到安全狀態，唔復活半個 projectile／舊 timer；
- 13/13 game 至少一個短期目標同一個長期累積數字；`runId` retry/reload 零重複 reward；
- 有 opt-in telemetry 後先量 tutorial completion、first-session completion、return rate；
  冇數據前唔虛構百分比 KPI。

### Accessibility

- visible controls ≥44×44；keyboard focus 可見；重要狀態唔只靠顏色；
- reduced motion、camera shake、gyro、audio、haptic、assist 可調；
- 320×568 portrait、667×375 landscape、notch safe area、200% text zoom 有指定 gate。

## 14. 頭 30 日可直接開工清單

按依賴順序：

1. 建 GameCatalog manifest，同步取代 launcher／hub tests 重複清單，令 deploy 跑 changed-game
   required matrix；
2. 建 AssetCatalog＋RigCatalog，匯入 license，輸出所有 actor bone/clip/socket report 同免費 pack
   audition contact sheet；
3. 收集三部裝置 visual/performance baseline，同每隻 3D game 三張 canonical capture；
4. 完成 Royale 三區戰場、Racing 三類 circuit、Elden 三段關卡灰盒同玩法 witness；
5. Racing 加 fixed accumulator＋不改 feel replay equivalence，再完成第一條 circuit art pass；
6. Royale 先配對四種 unit archetype，同步完成戰場 batching／gate footprint；
7. Elden 將現有 clip/contact/socket 移入 catalog，完成灰燼長堤第一個 production sector；
8. 寫 PlayerVault contract tests，將 Royale profile implementation 變 local adapter；
9. Hub 改 responsive grid＋hero card＋recent/filter/Continue prototype；
10. 跑全 Hub ReleaseGate、rig/scene/mobile golden，保留 checkpoint先開第二批。

## 15. 明確非目標

- 唔建立一套跨 Three.js、Babylon、Canvas、React 嘅「GameHub Engine」。
- 唔因為免費就一次過下載所有 3D pack。
- 唔以 full rigid-body、更多 bloom、更多粒子當作所有 game 嘅進化答案。
- 唔強制登入、唔將 local profile code 扮成安全密碼。
- 唔先做 cloud save 再補 local corruption/migration。
- 唔同時大改十三隻 game；每一輪最多三個 vertical slice。
- 唔將所有角色強行 retarget 去一副「萬能骨架」，亦唔用動畫 clip 做 gameplay authority。
- 唔用 visual mesh 自動推導所有 path/collision；scene 灰盒 authority 必須明確。
- 唔用 headless SwiftShader FPS 代替實機結論。
- 唔為共用而抽淺 module；只有兩個以上真 adapter/caller 先建立 seam。

## 16. 每個 work package 嘅 Definition of Done

一項進化只有同時具備以下證據先算完成：

1. 玩家問題同成功指標寫清楚；
2. module interface、invariant、error/performance mode 清楚；
3. source、tracked dist/build output、license/credits 同步；
4. unit/sim、browser、mobile viewport、lifecycle、storage tests按範圍通過；
5. 物理／視覺／Rig／場景改動有 before/after trace、overlay、screenshot 或 video；
6. 真機效能冇超 budget；
7. 舊 save、offline、blocked storage、return Home 冇回歸；
8. `HANDOFF.md` 指向 commit、檔案、測試、已知風險及下一步；
9. commit/push 後 local/remote SHA 一致，下一位 agent 先接手。

## 最終推薦次序

如果只揀一條最有效嘅路：

**先建 GameCatalog／ReleaseGate／AssetCatalog＋RigCatalog → Royale 三區戰場＋單位 rig、Racing
新 circuit＋fixed physics、Elden 三段關卡＋combat rig 三個 vertical slice → Hub profile／Continue →
Ashen animation/combat → Snooker 共用物理 → Tower/MOBA mastery → 棋牌／arcade 長期 loop。**

呢個次序一方面最快令玩家睇到「煥然一新」，另一方面每輪都會留下可重用而且深嘅
module、資產 catalog 同 release evidence；唔會再靠下一位 agent 重新掃成個 codebase先知
應該點行。
