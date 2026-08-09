# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 214
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 五把跨遊戲尺（掂、載、鍵盤、第三方、等緊）掃齊十二個介面；Tower 1,291→754 KB、MOBA 揀人版 16.0→12.7s

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過
「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 205（Tower 四輪，已合埋 main；詳情喺 DECISIONS）**

- 202：44×44、漸隱、橫額錨住 `--hud-bottom`；修好閃光 gate。203：撳完 START
  嗰段靜默 → 停用 ＋ 進度條；再撳會開多次波 → 兩重擋。204：地圖唔細，係
  **佈景喺你最想望遠嗰陣斷咗**；遠山 18 個 Mesh → 1 個 InstancedMesh。
- 205：格 → **24×14**、路 → **37 格 10 彎**、塔位 → 72、HP 二次項 → **0.0026**。
  **`flow.mjs` 有三處寫死同一格**，一處係世界座標 `11.5 / 5.5`，grep 搵唔到。

**ADR-206 至 209（四把跨遊戲尺，已合埋 main；詳情喺 DECISIONS）**

- 206 `hub-touch` 5/5：≥44×44 **捉到八個介面共 24 個**；carousel 圓點 24×24 **冇當
  佢係 bug**。207 `hub-load`：hub launcher **904 → 51 KB**。208 `hub-keyboard` 3/3
  ——**十二個介面本來就啱**；三次報紅全部係把尺錯（`inert` 本來啱／讀咗
  transition 第 0 格／Tab 預算對錯對象）。
- 209 `hub-cdn` 3/3：六隻遊戲寫住 parser-blocking 嘅 jsdelivr Supabase SDK，吊 8 秒
  ＝**DCL 8.0–8.4s，一比一**。改成 `loadSupabaseSdk()` 用到先攞 ＋ `holdOnlineEntries()`
  佔位。記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定,
  擺完佔位 `window.x = x` 就自己指自己——**我親手整出嚟，把尺利咗先捉到**。

**ADR-214（本輪）— 捉到漏網之後，要改嘅係網**

- 同另一個 agent 撞咗同一件事（MOBA 拆資產），佢先推而且量得好過我（12.7 vs
  13.6s）。剷咗自己嗰個重複 commit，由 `origin/main` 重新開始，只補返佢冇做嘅：
- ①`byte-progress.mjs` 個版本標記係**手動補**嘅，而 `moba-bump-cache.mjs` 個 regex
  冚唔到共用層——手補一次即係下次一樣會漏。改咗 regex，bump 一次 42 個位齊。
  ②**`247f1cd` 改咗 MOBA 源碼但冇 bump token**，返轉頭嘅玩家照食 cache，
  個拆分到唔到佢哋度。bump 去 `assets-29`。
- 突變揭多一樣：舊 regex 之下 `byte-progress` 卡喺舊 token，而 `cache-bust.mjs`
  **照樣報 PASS**。`browser.mjs` 捉到「冇標記」，捉唔到「標記落後」——**兩種壞法
  長得唔同，要分開守**。兩條 regex 一齊擴。

**ADR-213（已合埋 main）— Empire Royale 查完決定唔改**

- `hub-wait` 報「等 20.3 秒」，我第一個念頭係「9.2 秒下載 ＋ 十一秒 CPU」。
  分開量之後：**Fast 3G 最後一個 byte 14.5s／見到選單 14.5s／落完之後 0.0s**
  ——徹頭徹尾嘅下載瓶頸，冇 CPU 樽頸可以優化。
- 三條減磅路逐條量：①`simplify 0.5` ＋ 重新 Draco 只係 **1,379 → 1,204 KB（13%）**,
  用睇得出嘅畫質換 13% 唔抵；②貼圖合共 **0 KB**；③真正「入咗場先用」得
  **142 KB（7%）**。**所以唔改**（佢已經有 ADR-210 嘅逐格進度）。
- **一個我證偽咗嘅假設**：以為影相拖慢咗 `hub-wait`（20.3 vs 14.5）。加咗個唔影相
  嘅 pass 實測 MOBA **12.7 vs 12.6 秒冇分別**——假設錯，而且新 pass 自己整壞咗兩個
  讀數，改動剷咗。差距**仲未解釋**——**未證實嘅機制唔可以寫入把尺**。

**ADR-212（已合埋 main）— MOBA 揀人版 16.0 → 12.7 秒**

- `anims.glb` 888 KB 係**純動畫冇 mesh，Draco 壓唔到**。量咗刪 clip（冇得刪）／
  resample（888→825 但開始改到動作）／meshopt（888→637，旋轉誤差 0.83°）。但更大
  槓桿係 `arena`＋`weapons`＋三隻小兵 ＝ **576 KB 全部開場後先用**：拆開之後揀人版
  **16.0 → 12.7s**。**唔係壓縮，係重排時間軸**——所以冇做 meshopt。
- 撳「開打」而場未起好：個掣照撳得，寫「準備戰場…」，落完自己入場。記低：
  「擺喺 `renderPortraits` 前定後」實測一樣（13.0 vs 13.1s）——「兩批搶頻寬」係錯。

**ADR-210／211（已合埋 main）— 交代同重量**

- 210：**七隻遊戲入局後全部 ＋0 KB**。Fast 3G「載入畫面期間最長靜默」：Tower
  **0.0s**、MOBA **23.6s**、Royale **14.4s**——兩隻都有字但個字十幾廿秒唔郁。根因係
  **進度單位揀錯**（平行落而進度計「幾多件落完」）→ 新共用 `byte-progress.mjs`
  量位元組；冇 `Content-Length` 就報 `null` ＋ indeterminate bar ＋ MB，**唔報假
  嘅 0%**。新 `tests/hub-wait.mjs`。
- 211：Tower 1,087 KB **未壓過嘅 GLB**，而同 repo 兩隻一路用緊 Draco。量三條路
  （1,183／meshopt 787／**Draco 625**）後揀 Draco，**開場 1,291 → 754 KB（−42%）**;
  源檔保持原樣，壓縮喺 `postbuild.mjs` 做。順手發現 **`hub-load` 一直冇 gzip**
  （Tower bundle 202 KB 佢報 823 KB）。新 check：GLB > 300 KB 嘅遊戲，有幾何嘅
  模型要壓過——**讀真正派出去嗰個 GLB 嘅 glTF header**。

## Changed files

- Tower：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`index.html`、
  `configs/map.json`、`dist/`、`scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`（新）
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait}.mjs`（全新）、`launcher.js`
- shared：`online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、`byte-progress.mjs`（新）
- moba／royale `src/{assets,main}.js`＋`style.css`；moba 成套 `?v=assets-29`
- ADR-214：`scripts/moba-bump-cache.mjs`＋`games/moba/tests/cache-bust.mjs`（regex 擴到共用層）
- ADR-209 波及：big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html`＋`online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` **3/3**、`hub-keyboard` 3/3、`hub-cdn` 3/3、`hub-wait` 1/1。
- Tower 全套三個 suite 過晒（Draco 量化冇整走 `units.mjs`／`look.mjs` 任何幾何 gate）。
- Mutation 驗過十次，每次報紅而且叫得出係邊個（最新：擺返 parser-blocking script、
  拆走佔位 toast／自卸、MOBA 退返件數進度、五個模型換返未壓源檔）。

## Known issues and cautions

- 承上：Vite 單 chunk warning（tower 777 kB／xiangqi 594 kB）。
- **雲端容器要 `export PW_CHROMIUM=/opt/pw-browsers/chromium`**。
- **`pgrep -f <字>` 喺呢個環境會撞到自己**，`until ! pgrep -f x` 會永遠唔完。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **payload 呢條線已經榨到差唔多**（見 ADR-213：Royale 三條路都唔抵）。
   仲喺枱面嘅得 MOBA `anims.glb` 嗰個 meshopt（−226 KB、旋轉誤差 0.83°）。
   下一條線建議轉去**未量過嘅範圍**：玩落去嘅流暢度／進度儲存／音效。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好改返寫死 `top`；閃光 gate 唔好改返「影
  幾張相攞最大值」；`enterRun` 唔好改返直接 `await 地面好`；**Supabase SDK 唔好擺
  返落 HTML 做 parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送
  `Content-Length`**（唔係嘅話量到嘅數同進度條都係假）。
