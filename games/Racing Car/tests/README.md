# 方塊賽車回歸測試

同 Royale 一樣，測試入 repo 先算數（ADR-022）：handoff 引用嘅每個數字，
第二個 agent 都要跑得返。

## 點跑

```sh
cd "games/Racing Car/tests"
npm install          # 只需一次
npm test
```

## 守住咩

| 檔案 | 內容 |
| --- | --- |
| `race.mjs` | 賽道砌得成、物理（油門／煞車／落草）、**自動駕駛跑得完三圈**、三圈就係三圈、重開唔漏 GPU 資源 |

## 寫新測試要知

- 最重要係「自動駕駛完成三圈」：改咗賽道形狀（`WAYPOINTS`、`ROAD_HALF`）
  或者車輛參數之後，一定要重跑——賽道有斷口、彎太急、欄杆太貼，佢即刻紅。
- 跑完一場之後結算畫面會蓋住開始掣，所以測試用 `window.__racer.startRace()`
  而唔係撳 DOM 掣。
- swiftshader 之下 rAF 好慢，唔好靠 wall-clock 等模擬推進；自己步進
  `car.update(1/60, ...)` 同 `race.update(1/60, car)`。
