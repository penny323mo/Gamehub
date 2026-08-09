# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 215
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 七把跨遊戲尺（掂、載、鍵盤、第三方、等緊、儲存）掃齊十二個介面；兩隻遊戲喺無痕模式下本來開都開唔到

## Current objective

「continuously improve the gaming experience for everything」。入手點一直係
**Codex 套件冇守到嘅範圍**——佢守地圖、路線、章節、經濟、效能，但冇一條問過
「喺一部真手機／用鍵盤／網絡差嗰陣，呢個掣掂唔掂得到、等緊嗰陣有冇交代」。

## Completed

**ADR-202 至 209（已合埋 main；詳情全部喺 DECISIONS）**

- Tower 四輪：44×44 ／ 撳完 START 嘅靜默 → 進度條＋重入防護 ／ **佈景喺你最想
  望遠嗰陣斷咗**（遠山 18 個 Mesh → 1 個 InstancedMesh）／ 格 → **24×14**、路 →
  **37 格 10 彎**、HP 二次項 → **0.0026**。**`flow.mjs` 有三處寫死同一格**，一處
  係世界座標 `11.5 / 5.5`，grep 格座標搵唔到。
- 四把跨遊戲尺：`hub-touch` 5/5（≥44×44 捉到八個介面共 24 個）、`hub-load`
  （hub launcher **904 → 51 KB**）、`hub-keyboard` 3/3（**十二個介面本來就啱**，
  三次報紅全部係把尺錯）、`hub-cdn` 3/3（parser-blocking 嘅 jsdelivr SDK：吊
  8 秒＝**DCL 8.0–8.4s，一比一**；改成 `loadSupabaseSdk()` 用到先攞）。
- 記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，
  擺完佔位 `window.x = x` 就自己指自己——**我親手整出嚟，把尺利咗先捉到**。

**ADR-215（本輪）— 儲存唔到，唔應該連遊戲都開唔到**

- 轉去一個從來冇人量過嘅範圍。把 `localStorage`／`sessionStorage` 換成會掟嘢
  嘅版本（＝封咗 cookie 嗰種），十二個介面逐個開：**Racing Car 3D 控制 51 → 0、
  Neon Snake 1 → 0——開都開唔到**；Gomoku／Snooker／Royale／Xiangqi 各掟一個錯。
- 修法唔係逐個 `setItem` 包 try（三十幾處、散落六個 codebase、下次一樣會漏），
  而係新 `games/shared/js/safe-storage.js`：喺任何遊戲碼之前行，摸得到又寫得到
  就唔郁，否則換記憶體版（讀嗰邊 read-through，無痕下舊存檔仲讀得返）。
  **要改嘅係枱面，唔係每一次落枱。**
- 加落去撞到兩個「淨係識一個名／淨係問有冇」嘅規則，兩個都係我踩到先現形：
  ①xiangqi `vite.config.js` 寫死咗 `online_utils.js` 一個名做路徑上移 → 第二個
  共用檔靜靜雞 404（而 dev 度係好嘅，自己部機試唔到）；②snake `postbuild.mjs`
  改「第一個有 src 嘅 script」→ 我加咗個 tag 之後佢改錯對象，而**佢自己條 assert
  照樣報 OK**（佢淨係問「有冇 defer script」）。兩個都改成指名／通用規則。
- 新 `tests/hub-storage.mjs` 2/2（同「正常嗰陣」比，唔用寫死嘅數）。突變（拆走
  Racing Car 個 tag）兩條一齊報紅，叫得出 51 → 0。

**ADR-214（已合埋 main）— 捉到漏網之後，要改嘅係網**

- 同另一個 agent 撞咗同一件事（MOBA 拆資產），佢先推而且量得好過我（12.7 vs
  13.6s）。剷咗自己嗰個重複 commit，由 `origin/main` 重新開始，只補返佢冇做嘅：
- ①`byte-progress.mjs` 個版本標記係**手動補**嘅，而 `moba-bump-cache.mjs` 個 regex
  冚唔到共用層——手補一次即係下次一樣會漏。改咗 regex，bump 一次 42 個位齊。
  ②**`247f1cd` 改咗 MOBA 源碼但冇 bump token**，返轉頭嘅玩家照食 cache，
  個拆分到唔到佢哋度。bump 去 `assets-29`。
- 突變揭多一樣：舊 regex 之下 `byte-progress` 卡喺舊 token，而 `cache-bust.mjs`
  **照樣報 PASS**。`browser.mjs` 捉到「冇標記」，捉唔到「標記落後」——**兩種壞法
  長得唔同，要分開守**。兩條 regex 一齊擴。

**ADR-210 至 213（已合埋 main；詳情喺 DECISIONS）**

- 210 **有字唔等於有交代**：七隻遊戲入局後全部 ＋0 KB；Fast 3G 最長靜默 Tower
  0.0s／MOBA **23.6s**／Royale **14.4s**。根因係**進度單位揀錯**（平行落而計「幾多
  件落完」）→ 新 `byte-progress.mjs` 量位元組；冇 `Content-Length` 就報 `null`
  ＋ indeterminate bar，**唔報假嘅 0%**。新 `tests/hub-wait.mjs`。
- 211 Tower 1,087 KB **未壓過嘅 GLB**（同 repo 兩隻一路用 Draco）。量三條路後揀
  Draco：**開場 1,291 → 754 KB（−42%）**。順手發現 **`hub-load` 一直冇 gzip**
  （Tower bundle 202 KB 佢報 823 KB）。新 check：GLB > 300 KB 就要壓過,
  **讀真正派出去嗰個 GLB 嘅 glTF header**。
- 212 MOBA 拆資產：**576 KB 開場後先用**嘅嘢唔再阻住你揀人 → **16.0 → 12.7s**。
  唔係壓縮，係重排時間軸。213 Royale 三條減磅路逐條量完**決定唔改**；
  順帶剷咗一個我證偽咗嘅把尺改動（**未證實嘅機制唔可以寫入把尺**）。

## Changed files

- Tower：`src/{main.ts,render/assets.ts,ui/style.css,core/config.ts}`、`index.html`、
  `configs/map.json`、`dist/`、`scripts/postbuild.mjs`（Draco）、`tests/{touch,load}.mjs`（新）
- 跨遊戲：`tests/hub-{touch,load,keyboard,cdn,wait,storage}.mjs`（全新）、`launcher.js`
- shared：`online_utils.js`（`loadSupabaseSdk`／`holdOnlineEntries`）、`byte-progress.mjs`、
  `safe-storage.js`（後兩個新）
- moba／royale `src/{assets,main}.js`＋`style.css`；moba 成套 `?v=assets-29`
- ADR-214：`scripts/moba-bump-cache.mjs`＋`games/moba/tests/cache-bust.mjs`（regex 擴到共用層）
- ADR-215：gomoku／snooker／royale／xiangqi／Racing Car／snake 六個 `index.html` 加 guard、
  `games/xiangqi-ai/vite.config.js`、`games/snake-game/scripts/postbuild.mjs`、兩個 `dist/`
- ADR-209 波及：big2／doudizhu／gomoku／snooker(×3)／xiangqi-ai 嘅 `index.html`＋`online.js`

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、
  `hub-wait` 1/1、`hub-storage` **2/2**；moba `cache-bust` 全綠。
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
2. payload 榨完（剩 MOBA meshopt：−226 KB／旋轉 0.83°／要加 build 線）；
   儲存韌性今輪做咗。**仲未量過嘅**：玩落去嘅流暢度（jank）、音效、
   同埋「返嚟之後仲記唔記得你玩到邊」（Tower 有 checkpoint，其餘十一個未查）。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好改返寫死 `top`；閃光 gate 唔好改返「影
  幾張相攞最大值」；`enterRun` 唔好改返直接 `await 地面好`；**Supabase SDK 唔好擺
  返落 HTML 做 parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送
  `Content-Length`**（唔係嘅話量到嘅數同進度條都係假）。
