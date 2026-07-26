# Empire Royale 回歸測試

Royale 冇 build step，遊戲本身唔會用到呢個資料夾；Pages 部署亦唔會執行佢。
呢啲測試存在嘅目的係：**兩邊 agent 都可以自己重跑 handoff 入面聲稱過嘅檢查。**

## 點跑

```sh
cd games/royale/tests
npm install          # 只需一次
npx playwright install chromium   # 本機第一次先要（雲端沙盒已預裝，會自動用）
npm test             # 跑晒全部，有任何失敗 exit code 非零
```

單獨跑一個：

```sh
node games/royale/tests/leak.mjs
```

Chromium 點揀（`lib/harness.mjs`）：`PLAYWRIGHT_CHROMIUM` 環境變數 → 預裝嘅
`/opt/pw-browsers/chromium` → Playwright 自己搵。三條路都行得通，唔使改代碼。

## 有咩測試

| 檔案 | 守住咩 |
| --- | --- |
| `leak.mjs` | GPU 資源洩漏閘（ADR-008）：六個開場／收場回合，geometries 同 textures 必須完全持平 |
| `gauntlet.mjs` | 連勝挑戰戰場條件（ADR-013）＋ AI 公平性（ADR-007）：條件要對雙方對稱 |
| `combat.mjs` | 傷害漏斗 `Game#damage`：相剋、護甲、攻城加成、卡面文字同數據一致 |
| `pvp-guest.mjs` | PvP guest 視角對調（ADR-011）：手牌／單位／塔／勝負／`pendingHand` |
| `match.mjs` | 一場對局嘅生命週期：投降入賬、返選單清場、AI 唔塞死、對局有結果 |

## 寫新測試要知

- 首次教學（ADR-014）係 modal，會擋住所有點擊。`openRoyale()` 預設會叫
  `markTutorialSeen()` 關咗佢——如果你嘅測試要撳 UI 而 timeout，多數就係呢個原因。
- swiftshader 之下 `requestAnimationFrame` 得大概 5fps，唔好用 wall-clock 等模擬推進；
  自己步進 `for (...) game.update(1/60)`。
- 沙盒連唔到 Supabase，所以真・PvP 配對、重連、walkover 只可以喺真機驗證。
- `leak.mjs` 嘅基準數字會隨住新增持久 mesh 而改變（例如 ADR-020 嘅團隊標記層令
  基準由 115 升到 116）。改基準嘅時候，喺 handoff 講明點解升。
