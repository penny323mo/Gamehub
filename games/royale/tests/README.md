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
| `pvp-guest.mjs` | PvP guest 視角對調（ADR-011）：手牌／單位／塔／勝負／`pendingHand`，加建／棄四轉唔漏 GPU 資源 |
| `match.mjs` | 一場對局嘅生命週期：投降入賬、返選單清場、AI 唔塞死、對局有結果 |
| `rts.mjs` | LV2 RTS：雙方開局對稱、科技／年代／人口／花費閘、相剋倍率同 Clash 一致、進出四轉唔漏 GPU 資源 |
| `session.mjs` | 長時間混合模式：五輪「兩場 Clash + 一轉 LV2 + 重播捕捉」之後，GPU 資源要回到基準（基準以上嘅 texture 要由傷害數字快取解釋到） |
| `session.mjs` | 長時間混合模式（Clash ×2 → LV2 → 重播，五輪）：跨模式接縫唔准漏 GPU 資源 |
| `features.mjs` | ADR-014 到 ADR-021 嘅隱形不變式：教學觸發條件、玩家 code 只存 hash、落點單一規則路徑、法術預警清理、路壓用模擬時鐘、重播剝走敵方情報、標記層唔加 geometry |

## 寫新測試要知

- 首次教學（ADR-014）係 modal，會擋住所有點擊。`openRoyale()` 預設會叫
  `markTutorialSeen()` 關咗佢——如果你嘅測試要撳 UI 而 timeout，多數就係呢個原因。
- swiftshader 之下 `requestAnimationFrame` 得大概 5fps，唔好用 wall-clock 等模擬推進；
  自己步進 `for (...) game.update(1/60)`。
- `storage.js` 嘅存檔係 module-level cache：改完 localStorage 一定要 `page.reload()`
  先問得到新答案，否則你攞到 reload 前嗰個。
- 沙盒連唔到 Supabase，所以真・PvP 配對、重連、walkover 只可以喺真機驗證。
- 傷害數字 texture 快取係跨場保留、有上限（96）嘅設計，所以 `session.mjs` 唔會要求
  texture 數回到開機基準，而係要求「基準以上嘅每一張都由快取數目解釋到」。
- `leak.mjs` 嘅基準數字會隨住新增持久 mesh 而改變（例如 ADR-020 嘅團隊標記層令
  基準由 115 升到 116）。改基準嘅時候，喺 handoff 講明點解升。
