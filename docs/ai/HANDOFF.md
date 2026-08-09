# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 213
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 五把跨遊戲尺（掂、載、鍵盤、第三方、等緊）掃齊十二個介面；Tower 1,291→754 KB、MOBA 揀人版 16.0→12.7s

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過
「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 205（Tower 四輪，已合埋 main；詳情喺 DECISIONS）**

- 202：44×44、建塔欄漸隱、橫額由 `--hud-bottom` 錨住；順手修好 `gateway.mjs`
  嘅閃光 gate（四張相影唔到 0.55 秒嘅瞬態，個底自己又喺度呼吸）。
- 203：撳完 START 之後 1,860 KB 嘅靜默 → 停用 ＋ 進度條；再撳會開多次波
  （`開波次數 = 2`）→ 兩重擋。新 `tests/load.mjs`，用 CDP 真節流。
- 204：地圖唔細，係**佈景喺你最想望遠嗰陣斷咗**。範圍改由鏡頭推出嚟，
  1,115 → 3,775 件；遠山 18 個 Mesh → 1 個 InstancedMesh。可玩地一格冇郁。
- 205：格 20×12 → **24×14**、陸地 → 178、路 → **37 格 10 彎**、塔位 → 72；重掃難度
  HP 二次項 → **0.0026**。**`flow.mjs` 有三處寫死同一格**，一處係世界座標
  `11.5 / 5.5`，grep 格座標搵唔到。

**ADR-206 至 209（四把跨遊戲尺，已合埋 main；詳情喺 DECISIONS）**

- 206 `hub-touch` 5/5：≥44×44 **捉到八個介面共 24 個**；carousel 圓點 24×24
  **冇當佢係 bug**。207 `hub-load`：量實際落幾多。Hub launcher **904 → 51 KB**。
- 208 `hub-keyboard` 3/3——**十二個介面本來就啱，一行遊戲碼都冇改**；三次報紅
  全部係把尺錯（`inert` 本來啱／讀咗 transition 第 0 格／Tab 預算對錯對象）。
- 209 `hub-cdn` 3/3：六隻遊戲寫住 parser-blocking 嘅 jsdelivr Supabase SDK，
  吊 8 秒＝**DCL 8.0–8.4s，一比一**。改成 `loadSupabaseSdk()` 用到先攞，
  順手補返「SDK 攞唔到撳線上入口靜靜雞乜都唔做」→ `holdOnlineEntries()`。
  記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，
  擺完佔位 `window.x = x` 就自己指自己——**我親手整出嚟，把尺利咗先捉到**。

**ADR-213（本輪）— Empire Royale 查完決定唔改**

- `hub-wait` 報「等 20.3 秒」，我第一個念頭係「9.2 秒下載 ＋ 十一秒 CPU」。
  分開量之後：**Fast 3G 最後一個 byte 14.5s／見到選單 14.5s／落完之後 0.0s**
  ——徹頭徹尾嘅下載瓶頸，冇 CPU 樽頸可以優化。
- 三條減磅路逐條量：①簡化幾何——`main_base` 83,895 三角、`side_tower` 82,071,
  但 `simplify 0.5` ＋ 重新 Draco 只係 **1,379 → 1,204 KB（13%）**，
  用睇得出嘅畫質換 13% 唔抵；②貼圖合共 **0 KB**，冇嘢好縮；
  ③延後——真正「入咗場先用」得 **142 KB（7%）**，而 `buildArena` 開場就要行。
  **所以唔改**（佢已經有 ADR-210 嘅逐格進度）。
- **一個我證偽咗嘅假設**：我以為影相拖慢咗 `hub-wait`（20.3 vs 14.5）。改咗把尺
  加一個唔影相嘅 pass，實測 MOBA **12.7 vs 12.6 秒完全冇分別**——假設錯,
  而且新 pass 自己整壞咗兩個讀數。改動剷咗，`hub-wait` 維持原樣。
  嗰個差距**仲係未解釋**——**未證實嘅機制唔可以寫入把尺**。

**ADR-212（已合埋 main）— MOBA 揀人版 16.0 → 12.7 秒**

- `anims.glb` 888 KB 係**純動畫冇 mesh，Draco 壓唔到**。量咗刪 clip（冇得刪）／
  resample（888→825 但開始改到動作）／meshopt（888→637，旋轉誤差 0.83°）。
- 但更大槓桿係：`arena` 246＋`weapons` 98＋三隻小兵 232 ＝ **576 KB 全部開場後
  先用**。拆開之後揀人版 **16.0 → 12.7s、2,529 → 1,946 KB**。**唔係壓縮，
  係重排時間軸**——所以冇做 meshopt（無損早 3.3 秒 vs 有損慳 9%）。
- 撳「開打」而場未起好：個掣照撳得，寫「準備戰場…」，落完自己入場。記低：
  「擺喺 `renderPortraits` 之前定之後」實測一樣（13.0 vs 13.1s）——我本來寫
  「兩批搶頻寬」係錯，render 頭像嗰段網絡本來就閒住。

**ADR-210／211（已合埋 main）— 交代同重量**

- 210：**七隻遊戲入局後全部 ＋0 KB**，全部開場畫面就落晒。Fast 3G 量「載入
  畫面期間最長靜默」：Tower **0.0s**、MOBA **23.6s**、Royale **14.4s**——兩隻都
  有字但個字十幾廿秒唔郁。根因係**進度單位揀錯**（平行落而進度計「幾多件落完」）
  → 新共用 `byte-progress.mjs` 量位元組；冇 `Content-Length` 就報 `null`，出
  indeterminate bar ＋ MB，**唔報假嘅 0%**。新 `tests/hub-wait.mjs`。
- 211：Tower 1,087 KB **未壓過嘅 GLB**，而同 repo 兩隻一路用緊 Draco。量三條路
  （1,183／meshopt 787／**Draco 625**）後揀 Draco，**開場 1,291 → 754 KB（−42%）**。
  源檔保持原樣，壓縮喺 `postbuild.mjs` 做。順手發現 **`hub-load` 一直冇 gzip**
  （Tower bundle 202 KB 佢報 823 KB）。新 check：GLB 落多過 300 KB 嘅遊戲，
  有幾何嘅模型要壓過——**讀真正派出去嗰個 GLB 嘅 glTF header**。

## Changed files

- Tower：`src/main.ts`（`錨定橫額()`／`等資產()`／`啟動中`／seam 加 `開波次數`）、
  `src/render/assets.ts`、`src/ui/style.css`、`index.html`、`tests/{touch,load}.mjs`（新）、
  `tests/gateway.mjs`（閃光量法大修）、`configs/map.json`、`src/core/config.ts`、`dist/`
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait}.mjs`（全新）、`launcher.js`（`<picture>`）
- ADR-210：`games/shared/js/byte-progress.mjs`（新）、moba／royale `src/{assets,main}.js`＋`style.css`
- ADR-211：tower `scripts/postbuild.mjs`＋`src/render/assets.ts`＋`package.json`＋`dist/`、`tests/hub-load.mjs`
- ADR-212：moba `src/{assets,main}.js`（`load` 拆做必要／戰場兩批）
- ADR-209：`games/shared/js/online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、
  big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html` ＋ `online.js`

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
