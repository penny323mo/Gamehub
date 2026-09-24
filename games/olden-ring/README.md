# Olden Ring — 千燈古塔

體素無雙。扮演「燼騎」，喺殘缺嘅金色古環之下，獨闖千燈古塔，逐層斬破虛空軍團。

## 玩法

- **逐層登塔**：每層要擊破指定數量嘅虛空軍團；每第 5 層係空冠王嘅「冠層」，要打低佢先過得。
- **祝福**：每過一層三揀一（燼刃、古環庇護、噬魂、龍息、燈火回春、鐵骨、三燈），一局入面疊加。
- **越上越難**：敵人傷害、血量、出手頻率逐層上升。
- **會死**：倒下就結算（登至第幾層、擊破、最高連擊、時間），本機記住最佳紀錄（`olden-ring-best-v1`；storage 被封就唔記，照玩）。
- **燼龍**：金色量表滿一格就可以放大招。

## 操作

| 動作 | 鍵盤／滑鼠 | 手機 |
| --- | --- | --- |
| 移動 | WASD／方向鍵 | 左手拖動（浮動搖桿） |
| 攻擊（6 段連擊） | J／左鍵 | 攻 |
| 蓄力 | K／右鍵 | 蓄 |
| 閃避 | L／Shift | 閃 |
| 跳躍 | Space | 躍 |
| 燼龍 | I | 龍 |
| 視角 | Q E／拖動滑鼠 | 右邊拖動 |
| 揀祝福 | 1 2 3／撳卡 | 撳卡 |

支援手掣（標準 mapping）。手機會自動減少敵人（150）同天燈數量。

## 技術

- 純靜態 ES modules，零 build；`vendor/three` 係 three.js r186。
- 60 Hz 固定步長 sim；render 只讀 sim 狀態。
- `src/tower/tower.js`：樓層、祝福、死亡、結算、最佳紀錄。
- `src/world/lanterns.js`：千燈古塔、天燈、場邊燈柱（instanced、HDR 無燈光成本，靠 bloom 發光）。
- `src/world/sky.js`：夜空、星、殘缺古環（shader）。
- `src/ui/touch.js`：觸控搖桿同動作掣，經 `input.virtual` 同鍵盤走同一條輸入路。
- `?test`：暴露 `globalThis.__olden = { game, tower }` 俾 `tests/olden-ring-flow.mjs` 用；`?nopost` 睇未經後製嘅畫面；`?enemies=N` 改敵人數。

## 出處同授權

- 引擎、戰鬥、群眾 AI、角色骨架、後製、音效係 fork 自
  [mike007jd/voxel-musou](https://github.com/mike007jd/voxel-musou)（commit `5702d90`），**MIT License**，
  原授權全文見 [`LICENSE-voxel-musou`](LICENSE-voxel-musou)（Copyright (c) 2026 BubuAi）。
  我哋嘅改動：夜空同古環、千燈古塔同天燈、全部角色／敵人／旗幟重新配色同命名、燼龍（原蒼龍）配色、
  樓層／祝福／死亡／結算循環、觸控操作、手機畫質、48 kHz 音效修正。
- three.js：MIT License。
- HUD 後備書法字 `src/ui/brush.woff2`：Yuji Boku（Kinuta Font Factory）子集，SIL Open Font License 1.1。
  新加嘅中文字（燼、騎、燈……）唔喺子集入面，冇本機行書字型時會跌返系統字型。
- 「千燈古塔」美學參考咗一個 GLSL ray marching 樓閣 demo（千燈迷樓）；幾何同代碼全部係自己寫，冇抄。
- 非商業 fan 項目；與 KOEI TECMO、FromSoftware、Bandai Namco 無關。
