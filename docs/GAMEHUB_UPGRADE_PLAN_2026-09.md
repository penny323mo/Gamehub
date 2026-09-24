# Game Hub 全面升級計劃（2026-09 逐 game audit）

Audit 日期：2026-09-24，基準 commit `d91a39f`（main）。
方法：13 隻 game 分五組，每組讀 code、跑 manifest 嘅 fast／full gate、用 headless Chromium
（SwiftShader）喺 1280×800、375×667、667×375／844×390 實際玩同截圖。每個問題都附
file:line、測試輸出或者截圖觀察。**冇改任何 repo 檔案。**

呢份文件係 `GAMEHUB_EVOLUTION_PLAN.md` 嘅執行版：Evolution Plan 講方向，呢份講
「而家實際壞咗乜、邊樣先做」。兩份衝突時以 Git 同 source 為準，再更新文件。

---

## 0. 一句結論

**穩定度唔係問題，體驗先係。** 13 隻嘅 flow／sim gate 幾乎全綠（MOBA 262+206、Racing 136、
Tower core 48、Royale match 11/11 …），但呢啲 gate 只證明「開到、行到、唔 crash」。真正拉低
質素嘅係四樣全部 gate 都冇守嘅嘢：

1. **細手機排版**：13 隻入面 10 隻喺 375×667 或 667×375 有重疊、爆版或者主畫面喺摺線下面。
2. **冇目標／冇紀錄**：一半以上打完一局乜都冇留低（Penny Crush、Snake、MOBA、Ashen、Elden、Snooker…）。
3. **AI 太弱或者唔分難度**：Gomoku 一層、Big2／鬥地主唔數牌、MOBA／Big2 冇難度掣。
4. **「擺設功能」**：Snake 難度／每日挑戰／成就全部冇接線；Royale RTS 似半成品。

## 1. 評分總表（1–5）

| Game | 玩法 | 視聽 | 手機 | 穩定 | 留存 | Code | 最大問題 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 五子棋 | 2 | 3 | 2 | 4 | 2 | 4 | AI 只睇一步、Hard 做預設、`alert()` 宣佈勝負 |
| 中國象棋 | 3 | 2 | 2 | 4 | 3 | 3 | 3D 鏡頭切走兩邊棋子；冇長將／長捉規則 |
| 鋤大D | 2 | 3 | **1** | 3 | 2 | 2 | 桌面同橫屏排版互相疊；AI 唔睇對手剩牌 |
| 鬥地主 | 3 | 3 | **1** | 3 | 2 | 3 | 桌面打橫爆版 1717px；橫屏 header 遮晒牌枱 |
| 消消樂 | 2 | 2 | 2 | 4 | **1** | 3 | 冇目標／冇終局；特殊糖規則錯；角色圖疑似 Chiikawa |
| 桌球 | 3 | 3 | 2 | 4 | 2 | **1** | 2D/3D 兩套物理兩套規則；3D 手機 HUD 遮半屏兼顯示 debug |
| 霓虹貪食蛇 | 3 | 4 | 3 | 4 | **1** | 3 | 難度／每日挑戰／15 個成就全部冇接線 |
| 塔防大戰 | 3 | 4 | 2 | 5 | 2 | 3 | 頭 79 波零威脅、尾段剩 53,750 金；直屏掣重疊 |
| 帝國皇家戰 | 4 / RTS 2 | 3 | 3 | 4 | 4 | 3 | LV2 RTS 似半成品；~510 draw calls；排行榜可偽造 |
| 深淵之橋 | 3 | 3 | 4 | 5 | **1** | 3 | 打完冇任何紀錄；冇難度；選角寫 W 實際係 F |
| Racing Car 3D | 4 | 3 | 4 | 5 | 3 | 3 | 對手係色塊；三條賽道同一個 biome；漂移掣遮時速 |
| 灰燼列車 | 2 | 2.5 | 2.5 | **2** | **1** | 4 | runtime 依賴 Babylon CDN；手機解像度公式反轉 |
| Elden Ring II | 3 | 3 | 3.5 | 4 | 1.5 | **1.5** | `GameClient.tsx` 3,802 行；82 秒通關；只有 1 種敵人 |

## 2. P0 —— 壞咗／尷尬，第一波全部清（估計 1–2 星期）

> 規則：P0 全部係 S／M 級、唔改玩法設計，可以逐隻獨立 commit 直推 main。

| # | Game | 問題（證據） | 修法 | 工作量 |
| --- | --- | --- | --- | --- |
| 1 | 灰燼列車 | meshopt decoder 由 `cdn.babylonjs.com` 攞；攞唔到玩家變方塊、火車消失（`AssetLibrary.ts:67-77`） | 打包本地 decoder、設 `MeshoptCompression.Configuration.decoder.url`；加「零外部請求」gate | S |
| 2 | 灰燼列車 | `GameApp.ts:62` hardware scaling 反轉，DPR 2 手機只 render 63% | 改 `1/(min(dpr,1.5)*renderScale)`；加手機 DPR 截圖 gate | S |
| 3 | Elden Ring II | `.hub-return:focus-visible{outline:none}`（`styles.css:129-135`）＝ hub-keyboard 舊紅 | 還返可見 focus ring | S |
| 4 | Elden Ring II | `warrior-sword-source.blend`（565KB）打包入 dist | 移出 `public/` | S |
| 5 | 鬥地主 | 1280×800 `scrollWidth` 1717；橫屏 header 遮晒牌枱；掣 28px | 修 overflow、header 唔 fixed、44px 掣 | S–M |
| 6 | 鋤大D | 1280×800「You」面板壓住出牌掣、手牌切底；667×375 全部疊埋 | 重做 responsive 牌枱（同鬥地主共用，見 §4.2） | M |
| 7 | 中國象棋 | 斜角鏡頭（`render.js:249`、fit offset 1.25）切走左右棋子；黑子字睇唔清 | 預設俯視、按棋盤投影角 fit；2D/3D 切換；玩家見唔到嘅 `AI：depth= nodes=` 收埋 | S |
| 8 | 塔防大戰 | 375×667 技能列／NEXT WAVE 壓住建塔掣，Sniper 掣出界 | 修直屏排版；touch/flow gate 加 375×667 | S |
| 9 | 桌球 3D | 手機 HUD 遮半屏、顯示 `State: WAIT_START` 同滑鼠說明、「返回」疊「開始」 | HUD 預設收埋、touch 隱藏 debug／鍵盤字 | S |
| 10 | 桌球 | repo 提交咗 ~26MB debug `output/`、`.bak`、`.patch`、`.DS_Store` | 刪走＋gitignore＋repo hygiene gate | S |
| 11 | 霓虹貪食蛇 | 難度冇用（`Game.tsx:936`）、每日挑戰＝經典（`:950`）、成就永遠鎖（`useStorage.ts:205` 冇人 call）；Game Over 字切咗兼叫手機用家「按 ENTER」 | 接線或者收埋；修 overflow、觸控文案 | S–M |
| 12 | 消消樂 | 兩組獨立三連都出彩虹糖（`:768`）；特殊糖出喺亂數格（`:506`）；`--tile-size` 未定義（`:740`） | 按每條 match line 判斷、特殊糖出喺換位格 | S |
| 13 | 消消樂 | `characters/*.jpg` 疑似 Chiikawa 角色，公開網站 | **Penny 決定**：確認授權或者換自家素材 | S |
| 14 | 深淵之橋 | 選角寫「W 鐵壁」，實際係 F（`input.js:142-145`） | 改標籤 | S |
| 15 | Racing Car | 漂移掣壓住時速（844×390 重疊 2×50px，「104」讀成「L04」）；直屏 minimap 疊 drift guide | 移位；`setup.mjs` 加重疊 gate | S |
| 16 | 五子棋 | 勝負用阻塞 `alert()`（`renderer.js:291,298`）；「黑子」`#000` 喺深底；玩家見到 `Build: dev` | 結果 modal、最後一步標記、勝利連線、修字色 | S |

## 3. P1 —— 每隻嘅最大質素提升（第二、三波）

### 棋牌
- **五子棋**：threat-space／alpha-beta AI（depth 4–6＋VCF），修 `analyzeLine` 睇唔到跳三跳四、贏同擋同分（`ai.js:160-200`）；真正 Easy→Hard 梯級、預設 Medium；觸控「預覽再確認」落子。（M）
- **中國象棋**：長將／長捉／步數和棋規則（M）；難度合併做一條梯級，Easy 加 eval noise／限深；typed-array engine 提速（而家 ~15k nodes/s）（M）；橫屏左右排版（S）。
- **鋤大D**：AI 記住對手剩牌、必要時拆組、一張牌時要擋；難度掣；全中文 UI。（M）
- **鬥地主**：牌型拆解 AI、留炸彈、記牌、難度；1-2-3 叫分、倍數／春天計分。（M）
- **線上（兩隻牌 game）**：RPC 只查座位唔查合法性同輪次；`initial_deck` 疑似所有人讀到（未核實 SELECT policy）→ 隱藏他家手牌、伺服器驗牌。（M，要 migration，**需要 Penny 授權**）

### 休閒
- **消消樂**：關卡模式（步數限制＋目標＋1–3 星）＋每日種子；keyed tile 動畫、swipe、音效；中文化。（M+M）
- **桌球**：Evolution Plan §4.3 共用 `TablePhysics`（固定步長、滾動／旋轉、袋口 jaw）＋共用規則模組（3D 嘅 free ball／miss 搬去 2D 共用）；2D 直屏打直張枱＋力度 slider。（L+M+M）
- **霓虹貪食蛇**：兩格方向佇列＋touchmove swipe（S）；成就解鎖皮膚、任務、本機週榜（M）。

### 策略
- **塔防大戰**：波 20–80 加威脅（HP 曲線前移或者 modifier 波）＋尾段用錢位（第 4 級升級、買技能次數）（M）；觸控隱藏鍵位提示、波次中收埋建塔選單、繁中化（M）；每日種子 run＋無盡排行榜（M）。
- **帝國皇家戰**：LV2 RTS 要真環境（天空、場外地形、道具）＋小地圖＋單位可讀性，未做好前標「Beta」（M）；橫屏手牌唔好遮出兵區（S）；靜態場景 batch／instance 由 ~510 → ≤420 draw calls，配 §7.2 三區戰場（M）；卡面美術重做、每張 icon 唔重複（S）；**獎盃由完成嘅 PvP 房推導、RPC 限速**（M，要 migration）。
- **深淵之橋**：戰績 ledger（勝負、KDA、英雄熟練度）（M）；難度掣（S）；魔抗＋2–3 件針對裝（M）；島外面加懸崖／深淵霧、直屏記分板縮細（M）；10 分鐘短局（P2）。

### 動作／3D
- **Racing Car**：對手換低多邊形 instanced 車（1–2k 三角形，預算夠）（M）；每條賽道自己嘅 biome（海港／峽谷／看台）（L）；§4.2 固定步長＋草地／路肩抓地做第一刀（M）；獎牌時間、漂移分段挑戰（P2）。
- **灰燼列車**：非觸控裝置收埋觸控 UI、顯示 WASD 提示（S）；Babylon tree-shake（而家 9.4MB／250 requests、單一 chunk 4.2MB）（M）；Boss、路線分支、武器選擇、最佳紀錄（L）。
- **Elden Ring II**：拆 `CombatMotor`／`HitResolver`（§4.4）（L）；標題畫面顯示 run history 同每職業最佳時間（M）；再加 2 種敵人填滿三個 sector（M）；HUD 對比同手機目標欄（S）；美術方向統一、考慮改一個唔撞商標嘅名（P2，**Penny 決定**）。

## 4. 跨遊戲共用基建（做一次、幫幾隻）

| 模組 | 幫到 | 內容 | 優先 |
| --- | --- | --- | --- |
| **4.1 手機排版 gate** | 全部 13 隻 | 每隻 flow test 加 375×667＋667×375：`scrollWidth ≤ innerWidth`、主遊玩區喺摺線上、控制唔重疊、≥44px、冇切字。**而家 flow 全綠但 10 隻有排版 bug** | P0 |
| **4.2 牌枱 UI kit** | 鋤大D、鬥地主 | 52 張牌 SVG 兩份逐 byte 相同；同一套 table／seat／hand CSS（各 130+ 個 `!important`）。一個 responsive 牌枱元件一次過修兩隻 | P0/P1 |
| **4.3 共用 online client** | 五子棋、象棋、鋤大D、鬥地主 | 四份 `online.js` 共 ~3,150 行，大部分係同一套房間／heartbeat／cleanup；抽成 lobby＋per-game adapter | P1 |
| **4.4 GameResult／戰績 ledger** | 全部（Evolution Plan §3.3） | 版本化 `GameResult`（勝負、分數、時間、難度）→ 本機 ledger → Hub 首頁「最近玩過／最佳紀錄」 | P1 |
| **4.5 難度梯級＋每日種子** | 棋牌 4 隻、消消樂、貪食蛇、塔防、桌球練習 | 共用 seeded RNG、日期種子、難度設定同每難度勝負統計 | P1 |
| **4.6 Game shell** | 五子棋、牌 game、消消樂、桌球 | 結果 modal（取代 `alert`／`confirm`）、靜音掣、44px 掣、橫屏處理、繁中文案 | P1 |
| **4.7 音效／觸感模組** | 五子棋、鋤大D、鬥地主、消消樂、桌球（全部零音效） | 小型 WebAudio＋sample 播放器＋vibration，尊重 Hub 靜音設定 | P1 |
| **4.8 Repo hygiene gate** | 全 repo | 擋 `output/`、`.bak`、`.DS_Store`、>500KB 非資產檔、dist 入面嘅 `.blend` | P0 |
| **4.9 零外部請求 gate** | 全部 | 每隻 game 開場唔准去 CDN（灰燼列車就係咁中招）；Supabase 除外並明確列白名單 | P0 |
| **4.10 規則單元測試** | 消消樂、桌球、貪食蛇、牌 game | 純函數測試：特殊糖、桌球犯規／free ball、蛇方向佇列、牌型合法性。而家 gate 只測生命週期 | P1 |

## 5. 分階段執行

| 波次 | 內容 | 完成定義 |
| --- | --- | --- |
| **Wave 0（第 1–2 週）** | §2 全部 16 條 P0＋§4.1 排版 gate＋§4.8／4.9 hygiene gate | 13 隻喺三個 viewport 零重疊零爆版、零外部請求、hub-keyboard 全綠 |
| **Wave 1（第 3–5 週）** | 共用基建：§4.2 牌枱 kit、§4.4 GameResult、§4.5 難度＋種子、§4.6 shell、§4.7 音效 | 牌 game 用共用牌枱；每隻至少寫一種 GameResult；Hub 首頁顯示「最近玩過／最佳」 |
| **Wave 2（第 6–10 週）** | 「冇目標」嗰批補核心 loop：消消樂關卡、貪食蛇任務／週榜、MOBA 戰績＋難度、灰燼列車紀錄、Elden run history；棋牌 AI 升級 | 每隻打完一局都有紀錄同「再挑戰」嘅理由 |
| **Wave 3（第 11–16 週）** | 3D 視覺同物理：Racing biome＋對手車、Royale 三區戰場＋draw call、MOBA 背景、桌球 TablePhysics、Elden 拆檔＋新敵人 | 各 game 喺 Evolution Plan §7 嘅 budget 內、截圖 review 過 |
| **Wave 4（之後）** | 內容擴充同線上信任：Royale RTS 深度、Tower 第二張地圖、牌 game 伺服器驗牌、Royale 獎盃驗證 | 需要 Supabase migration 嘅項目逐項經 Penny 授權 |

## 6. 需要 Penny 拍板嘅決定

1. **消消樂角色圖**：疑似 Chiikawa，公開網站有版權風險——換自家素材定保留？
2. **Elden Ring II 個名**：用咗「Elden Ring」／「Erdtree」字眼——改名定保留「fan-made」？
3. **Royale LV2 RTS**：投資做完整，定係先標「Beta」收細曝光？
4. **Supabase migration**（牌 game 伺服器驗牌、Royale 獎盃驗證）：幾時做、是否授權。
5. **優先次序**：Wave 2 先做「留存」（紀錄／目標）定先做「AI」（棋牌對手變強）？

## 7. Audit 限制

- SwiftShader 下 3D game 只有 0.5–2 fps，所以 3D 效能靠 code、draw call 同三角形數判斷，唔係真機 FPS。
- 線上對戰冇喺 sandbox 端到端跑過；Supabase 只做咗唯讀查詢（12 間房全部 `waiting`）。
- Royale／Racing 部分 browser suite 係用 symlink 過嘅 Playwright 喺 `/tmp` 副本跑，因為 game 自己嘅 `tests/` 冇 `node_modules`——呢點本身都係 CI 可重現性問題，列入 Wave 0 hygiene。
