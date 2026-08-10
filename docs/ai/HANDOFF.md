# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 217
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 八把跨遊戲尺；本輪捉到「切走咗場波照打」——MOBA ＋8.6s／Royale −7.5s，兩隻都修咗

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係 **Codex
套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過「喺一部真手機／
用鍵盤／網絡差／封咗 storage 嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想望遠
  嗰陣斷咗** ／ 格 → **24×14**、路 → **37 格 10 彎**、HP 二次項 → **0.0026**。
  **`flow.mjs` 有三處寫死同一格**，一處係世界座標 `11.5 / 5.5`，grep 搵唔到。
- 四把跨遊戲尺：`hub-touch` 5/5（≥44×44 捉到八個介面共 24 個）、`hub-load`
  （launcher **904 → 51 KB**）、`hub-keyboard` 3/3（**十二個介面本來就啱**，三次
  報紅全部係把尺錯）、`hub-cdn` 3/3（jsdelivr SDK 吊 8 秒＝**DCL 8.0–8.4s，
  一比一**）。記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個
  綁定，擺完佔位 `window.x = x` 就自己指自己——**把尺利咗先捉到**。

**ADR-217（本輪）— 你切走咗，四隻遊戲照打**

- 先量錯咗方向：掃 localStorage 見到九隻「玩完一個字都冇寫低」，差啲當咗九個病。
  Snake 其實有成套 profile 系統，淨係 game over 先寫——**掃唔夠，唔係佢冇記**。
- 轉去量得準嗰條：一 grep 就知**成個 repo 得 Tower 同 Racing Car 有
  `visibilitychange` handler**。隱藏六秒實測：MOBA **＋8.6 秒**、Royale **−7.5 秒**。
  MOBA 一場十六分鐘，你去覆個訊息返嚟就送咗一血。
- 量法三個位企唔穩：①**`bringToFront` 喺 headless 唔會令個頁隱藏** → 改用 Tower
  `flow.mjs` 嗰個 override＋dispatch；②**「畫面有冇郁」分唔開停冇停**（Tower 真停咗
  但暫停畫面自己呼吸）→ 逐隻寫明讀邊個 seam；③第一個數要**隱藏之後**先讀。
- 改法跟 Tower：停低、講明點解、**返嚟唔會偷偷續**（撳一下先續，順手重設 `last`
  ——唔係嘅話第一格 dt 係「停咗幾耐」）。同兩邊自己 `onContextLost` 一個形狀。
- **Neon Snake 剷過一次先做得成**：第一次量到隱藏前後 tick 都係 36，我當咗成功,
  直到突變**照樣 36 → 36**——條蛇喺窗口之前已經死咗。補返嘅係一個對照：
  **隱藏之前個鐘要真係喺度行**。呢個對照即刻再捉到 Tower 嗰個鐘（gold＋wave＋
  敵人數）喺備戰唔郁，換成 `prepTimer`。Snake 最後用另一種證據：**切走六秒返嚟
  係咪已經玩完咗**（突變 true／有修 false）。Snooker 同樣冇 handler，未量。
- 新 `tests/hub-away.mjs` 3/3。三個突變分別令對應 check 報紅，叫得出邊隻。

**ADR-216（已合埋 main）— 兩條偶發 gate，一條修咗，一條唔亂修**

- `普攻會真係揮動作`：第一個診斷（畀人打中蓋咗）**錯**——受擊都行 `once()` 一定
  set `lockUntil`。真線索係 **`重生: 0.13`**：fixture 清咗 `stunUntil` 等而**冇清
  `respawnAt`**，暖機喺重生窗口收工就畀 `revive()` 抹走個鎖。**改 fixture，唔改斷言。**
- `玩家企喺畫面下半但唔會跌出畫外`：五跑紅兩次、方向相反（32.1 對 −28.6，夾界
  58），`鏡頭焦點` 曾離玩家 44 個單位而 `收斂咗:true`。**未查到根因，唔亂改。**

**ADR-214／215（已合埋 main；詳情喺 DECISIONS）**

- 215 **儲存唔到唔應該連遊戲都開唔到**：封住 storage 之後 **Racing Car 控制
  51 → 0、Neon Snake 1 → 0——開都開唔到**。修法唔係逐個 `setItem` 包 try，而係
  新 `shared/js/safe-storage.js` 喺任何遊戲碼之前換走個枱面（read-through）。
  **要改嘅係枱面，唔係每一次落枱。** 加落去撞到三個踩到先現形嘅嘢：xiangqi
  `vite.config.js` 寫死共用檔名、snake `postbuild.mjs` 改錯對象而**自己條 assert
  照樣報 OK**、snake `dist` 本來就 rebuild 唔返出嚟。新 `tests/hub-storage.mjs` 2/2。
- 214 **捉到漏網之後要改嘅係網**：版本標記手動補過一次，而 bump 腳本個 regex 冚唔到
  共用層 → 改 regex（一次 42 個位）＋bump。突變揭到 `cache-bust.mjs` 捉到「冇標記」
  但捉唔到「標記落後」——**兩種壞法要分開守**。

**ADR-210 至 213（已合埋 main；詳情喺 DECISIONS）**

- 210 **有字唔等於有交代**：Fast 3G 最長靜默 MOBA **23.6s**／Royale **14.4s**。
  根因係**進度單位揀錯**（平行落而計「幾多件落完」）→ `byte-progress.mjs` 量位元組;
  冇 `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
- 211 Tower 1,087 KB **未壓過嘅 GLB** → Draco，**開場 1,291 → 754 KB（−42%）**。順手
  發現 **`hub-load` 一直冇 gzip**。新 check：GLB > 300 KB 就要壓過，**讀真正派出去
  嗰個 GLB 嘅 glTF header**。新 `tests/hub-wait.mjs`。
- 212 MOBA 拆資產 **16.0 → 12.7s**（重排時間軸唔係壓縮）；213 Royale 三條減磅路逐條
  量完**決定唔改**，順帶剷咗一個證偽咗嘅把尺改動。

## Changed files

- Tower：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`index.html`、
  `configs/map.json`、`dist/`、`scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`（新）
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait,storage}.mjs`（全新）、`launcher.js`
- shared：`online_utils.js`、`byte-progress.mjs`、`safe-storage.js`（後兩個新）
- moba／royale `src/{assets,main}.js`＋`style.css`；moba 成套 `?v=assets-29`
- ADR-214：`scripts/moba-bump-cache.mjs`＋`games/moba/tests/cache-bust.mjs`（regex 擴共用層）
- ADR-215：六個 `index.html` 加 guard、xiangqi `vite.config.js`、snake `postbuild.mjs`、兩個 `dist/`
- ADR-209 波及：big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html`＋`online.js`
- ADR-216：`games/moba/tests/browser.mjs`（fixture 清埋 `respawnAt`）
- ADR-217：moba／royale `src/main.js`（`看住切走()`）、snake `Game.tsx`＋`dist/`、
  `tests/hub-away.mjs`（新）

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、
  `hub-wait` 1/1、`hub-storage` 2/2。Tower 三個 suite 全過。
- `moba/tests/browser.mjs` 跑咗五次：揮擊嗰條修完過；**鏡頭嗰條仲會間歇性紅**（見下）。
- Mutation 驗過十次，每次報紅而且叫得出係邊個。

## Known issues and cautions

- 承上：Vite 單 chunk warning（tower 777 kB／xiangqi 594 kB）。
- **雲端容器要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f <字>` 會撞到自己**。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。
- **`moba` 條 `打直：玩家企喺畫面下半但唔會跌出畫外` 仲會間歇性紅**（五跑兩紅，
  `鏡頭焦點` 曾經離玩家 44 個單位而 `收斂咗:true`）。未查到根因，見 ADR-216。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **仲未量過嘅**：玩落去嘅流暢度（jank）、音效、進度記憶（要逐隻寫 driver,
   generic 掃法證實咗掃唔夠）。**Snooker 3D 嘅切走保護未做**；MOBA 鏡頭偶發未查。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好改返寫死 `top`；閃光 gate 唔好改返「影幾張
  相攞最大值」；`enterRun` 唔好改返直接 `await 地面好`；**Supabase SDK 唔好擺返落
  HTML 做 parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送
  `Content-Length`**（唔係嘅話量到嘅數同進度條都係假）。
