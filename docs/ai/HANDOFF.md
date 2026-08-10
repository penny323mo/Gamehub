# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Claude Code (cloud) — ADR-202 至 220
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 九把跨遊戲尺；聲量完（Royale 靜音修咗），流暢度呢個容器量唔到但搵到一個覆蓋缺口

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
  （launcher **904 → 51 KB**）、`hub-keyboard` 3/3（**十二個介面本來就啱**，三次報紅
  全部係把尺錯）、`hub-cdn` 3/3（jsdelivr SDK 吊 8 秒＝**DCL 8.0–8.4s，一比一**）。
  記低：classic script 入面 `window.joinFixedRoom` 同頂層函數係同一個綁定，擺完
  佔位 `window.x = x` 就自己指自己——**把尺利咗先捉到**。

**ADR-220（本輪）— 流暢度量唔到，但量到一個覆蓋缺口**

- **幀時間量法失效喺佢最有用嗰個 case**：唔量 FPS（swiftshader 同真機冇關），改量
  p95/中位（抖唔抖）。Snake 1.00／Tower 1.17／Racing Car 1.20／MOBA 1.29／
  **Royale 1.56——但 Royale 八秒得 13 幀**，13 個樣本嘅「p95」即係第 12 個值,
  唔係分位數。而佢正正係最重、最想量嗰隻。**所以唔寫呢條 gate。**
- **Draw call 取樣時機錯**：量到 Tower／Royale 都係 `calls 1、三角 1`。three.js 每次
  `render()` 開頭 `info.reset()`，我喺自己 rAF callback 讀＝讀緊「reset 咗但遊戲未
  render」。MOBA 讀到真數（93／尖峰 165）係因為佢個 loop 一開頭就排下一個 rAF,
  排喺我前面。**同一個取樣點，喺三種 loop 結構下面有三個意思。**
- **真嘅發現：Empire Royale 冇 draw-call 預算。** Tower 有（空場 450／峰值 1100）、
  MOBA 有（尖峰 < 600），Royale 一條都冇，而佢係三隻最重嗰隻（同一個軟件光柵器
  中位 533ms vs Tower 100ms）。**呢輪唔補**——補得啱要接落佢自己個 loop。
  下一個人入手位：`royale/src/main.js` 個 `loop()` 入面 `renderScene()` 之後讀
  `renderer.info.render.calls`，再照 Tower 嗰條寫法立一個由實測定嘅 budget。

**ADR-219（已合埋 main）— 聲：一條本來就啱，一條漏咗一隻**

- **autoplay 本來就啱**：五隻有聲嘅遊戲開場一個 `AudioContext` 都冇 new，第一下
  手勢先 new 而且即刻 `running`。（Snooker／Xiangqi 冇 new 過＝冇遊戲聲。）
- **Royale 個靜音一個字都冇存**（`let muted = false`），每次入嚟都要重新撳；同 repo
  嘅 Racing Car 記得住。改法跟 `main.js` 個 `GFX_KEY`：自己一個 localStorage key,
  個掣嘅字都要跟返。新 `tests/hub-audio.mjs` 3/3。
- **一個對照救返一個假綠**：第一版喺開場畫面撳 `#mute-btn`（佢喺局內 HUD），撳唔到
  → 「撳完」同「reload 後」一樣 → 報綠。加咗「撳之前先證明個掣真係撳到」。

**ADR-210 至 218（已合埋 main；詳情全部喺 DECISIONS）**

- **載入交代**（210）：Fast 3G 最長靜默 MOBA 23.6s／Royale 14.4s。根因係**進度單位
  揀錯**（平行落而計「幾多件落完」）→ `byte-progress.mjs` 量位元組；冇
  `Content-Length` 就報 `null` ＋ indeterminate bar，**唔報假嘅 0%**。
- **重量**（211/212）：Tower 1,087 KB 未壓過嘅 GLB → Draco，**1,291 → 754 KB**；
  MOBA 拆資產 **16.0 → 12.7s**（重排時間軸唔係壓縮）。順手發現 `hub-load` 一直冇
  gzip。213 Royale 三條減磅路逐條量完**決定唔改**。
- **切走就停**（217）：**成個 repo 得 Tower 同 Racing Car 有 `visibilitychange`**。
  隱藏六秒 MOBA ＋8.6s／Royale −7.5s。MOBA／Royale／Snake 補齊，跟 Tower：停低、
  講明點解、**返嚟唔會偷偷續**。218 Snooker 查完唔改（冇計時、回合制、傷害唔成立）。
- **偶發 gate**（216）：`揮動作` 真因係 fixture **冇清 `respawnAt`**（改 fixture 唔改
  斷言）；`鏡頭跌出畫外` 五跑兩紅、**未查到根因，唔亂改**。
- **cache-bust／storage**（214/215）：bump regex 冚唔到共用層 → 改網唔改一個位;
  封住 storage 之後 Racing Car 控制 51 → 0、Snake 1 → 0 → 新 `safe-storage.js`
  換走個枱面。**要改嘅係枱面，唔係每一次落枱。**
- **量法通用教訓**：`bringToFront` 喺 headless 唔會令個頁隱藏；「畫面有冇郁」分唔開
  停冇停；test server 一定要 gzip ＋ 送 `Content-Length`；**做動作之前先證明個動作
  真係發生咗**（鐘要喺行、掣要撳到）——冇呢個對照，「前後一樣」會扮到守得好好。

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
- ADR-219：royale `src/sfx.js`＋`src/main.js`、`tests/hub-audio.mjs`（新）

## Verification

- `npm test`：PASS（要 `PW_CHROMIUM=/opt/pw-browsers/chromium`）。
- 跨遊戲：`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-keyboard` 3/3、`hub-cdn` 3/3、
  `hub-wait` 1/1、`hub-storage` 2/2、`hub-away` 3/3、**`hub-audio` 3/3**。Tower 三個
  suite 全過；`moba/browser.mjs` 196/196、royale 全套 111/111。Mutation 驗過十五次。

## Known issues and cautions

- 承上：Vite 單 chunk warning（tower 777 kB／xiangqi 594 kB）。
- **雲端容器要 `export PW_CHROMIUM=…/chromium`**；**`pgrep -f <字>` 會撞到自己**。
- **做 mutation 測試要先 `cp` 一份好版本**——`git checkout <file>` 剷嘅係未 commit 嘅嘢。
- **`moba` 條 `玩家企喺畫面下半但唔會跌出畫外` 間歇性紅**（五跑兩紅）。見 ADR-216。

## Exact next action

1. `export PW_CHROMIUM=/opt/pw-browsers/chromium`，跑 `./scripts/agent-context.sh --sync`。
2. **接手位**：Royale draw-call budget（ADR-220 寫咗入手點）；進度記憶（要逐隻寫
   driver）；MOBA 鏡頭偶發。
3. 一個檢查點一件事，改完連 handoff 一齊 commit。

## Do not redo

- 承上一份全部；另加：`#wave-banner` 唔好寫死 `top`；閃光 gate 唔好改返「影幾張相攞
  最大值」；`enterRun` 唔好直接 `await 地面好`；**Supabase SDK 唔好擺返落 HTML 做
  parser-blocking script**；**test server 一定要 gzip 文字資產 ＋ 送 `Content-Length`**。
