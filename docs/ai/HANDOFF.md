# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 216
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 七把跨遊戲尺掃齊十二個介面；本輪查 MOBA suite 兩處偶發，一處修咗 fixture，一處留低證據

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

**ADR-216（本輪）— 兩條偶發 gate，一條查到底修咗，一條唔亂修**

- 開頭發現 ADR-212 嗰件事**已經喺 main**（`247f1cd`，連函數名都一樣），手上兩個
  commit 係重複品，剷咗由 `origin/main` 重新開始。跑咗五次 `browser.mjs`，
  見到 196 條入面有兩條間歇性報紅。
- **`普攻會真係揮動作`**：`swinging:false`＋`clip:Idle_Combat` 但 `事件序` 有
  `attack*`——手出咗，rig 冇播。第一個診斷（畀人打中蓋咗）**係錯**：受擊都行
  `once()`，一定 set `lockUntil`。真線索係 **`重生: 0.13`**——量嗰陣玩家仲喺重生
  窗口。條 test 註解本來就寫咗呢個機制，但 fixture 清咗 `stunUntil`／`rootUntil`／
  `recallUntil`／`cd` 而**冇清 `respawnAt`**。加返一句，`重生` 由 0.13 變 −84.4。
  **改嘅係 fixture，唔係斷言。**（中途試過改成窗口取樣，跑完見 `第幾格揮: 0`
  全部——個窗口一次都冇用過，剷咗。）
- **`玩家企喺畫面下半但唔會跌出畫外`**：五跑紅兩次，方向相反（`玩家由頂計` 32.1 對
  −28.6，夾界 58）；第二次 `鏡頭焦點` 離玩家 44 個單位而 `收斂咗:true`。**唔喺呢輪修**
  ——紅嗰兩次其中一次我手上嘅改動證實冇執行過；重現唔到就改鏡頭邏輯係今日犯過嘅錯。

**ADR-215（上一輪）— 儲存唔到，唔應該連遊戲都開唔到**

- 把 `localStorage`／`sessionStorage` 換成會掟嘢嘅版本（＝封咗 cookie 嗰種），
  十二個介面逐個開：**Racing Car 3D 控制 51 → 0、Neon Snake 1 → 0——開都開唔到**；
  Gomoku／Snooker／Royale／Xiangqi 各掟一個錯。
- 修法唔係逐個 `setItem` 包 try（三十幾處、散落六個 codebase），而係新
  `games/shared/js/safe-storage.js`：喺任何遊戲碼之前行，摸得到又寫得到就唔郁，
  否則換記憶體版（read-through）。**要改嘅係枱面，唔係每一次落枱。**
- 加落去撞到三個踩到先現形嘅嘢：①xiangqi `vite.config.js` 寫死咗一個共用檔名做
  路徑上移 → 第二個共用檔靜靜雞 404；②snake `postbuild.mjs` 改「第一個有 src 嘅
  script」，我加咗 tag 之後佢改錯對象，而**佢自己條 assert 照樣報 OK**；
  ③**snake 個 dist 本來就 rebuild 唔返出嚟**（Vite 把共用字型抄成私有 hash 檔）。
  三個都改成指名／通用規則，並加 assert 守住。
- 新 `tests/hub-storage.mjs` 2/2（同「正常嗰陣」比，唔用寫死嘅數）；突變（拆走
  Racing Car 個 tag）兩條一齊報紅，叫得出 51 → 0。

**ADR-214（已合埋 main）— 捉到漏網之後，要改嘅係網**

- 撞咗同一件事（MOBA 拆資產），剷咗自己嗰個重複 commit，只補返冇做嘅兩件：
  ①`byte-progress.mjs` 個版本標記係**手動補**嘅，而 `moba-bump-cache.mjs` 個 regex
  冚唔到共用層——手補一次下次一樣會漏。改咗 regex，一次 42 個位齊。
  ②`247f1cd` 改咗源碼但冇 bump token，返轉頭嘅玩家照食 cache。bump 去 `assets-29`。
- 突變揭多一樣：舊 regex 之下 `byte-progress` 卡喺舊 token 而 `cache-bust.mjs`
  **照樣報 PASS**——捉到「冇標記」捉唔到「標記落後」。**兩種壞法要分開守。**

**ADR-210 至 213（已合埋 main；詳情喺 DECISIONS）**

- 210 **有字唔等於有交代**：Fast 3G 最長靜默 Tower 0.0s／MOBA **23.6s**／Royale
  **14.4s**。根因係**進度單位揀錯**（平行落而計「幾多件落完」）→ 新 `byte-progress.mjs`
  量位元組；冇 `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
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
2. **仲未量過嘅**：玩落去嘅流暢度（jank）、音效、「返嚟之後仲記唔記得你玩到邊」
   （Tower 有 checkpoint，其餘十一個未查）。MOBA 個鏡頭偶發亦值得查。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好改返寫死 `top`；閃光 gate 唔好改返「影幾張
  相攞最大值」；`enterRun` 唔好改返直接 `await 地面好`；**Supabase SDK 唔好擺返落
  HTML 做 parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送
  `Content-Length`**（唔係嘅話量到嘅數同進度條都係假）。
