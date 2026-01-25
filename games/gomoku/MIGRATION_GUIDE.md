# DB Migration 執行指引

## 🚨 重要：執行前必讀

**Migration 必須手動執行一次，App 唔會自動跑！**

---

## 步驟 1：執行 DB Migration

1. 登入 **Supabase Dashboard**: https://supabase.com/dashboard
2. 選擇你嘅 Gomoku project
3. 去 **SQL Editor**
4. 複製以下檔案內容：`/Users/a123/AI/antigravity/Gamehub/games/gomoku/db_migration.sql`
5. 貼上並 **Run** (執行)

> [!IMPORTANT]
> 執行後應該見到類似：
> ```
> Success. No rows returned
> ```
> 如果有 error，請立即停止並回報錯誤訊息。

---

## 步驟 2：驗證 Schema

執行以下 SQL 確認 schema 正確：

### 2.1 檢查 `Gomoku's rooms` 欄位

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Gomoku''s rooms'
ORDER BY ordinal_position;
```

**預期結果**（應包含以下新欄位）：
- `turn_started_at` | timestamptz | YES | NULL
- `black_ready` | boolean | YES | false
- `white_ready` | boolean | YES | false
- `round_no` | integer | YES | 0

---

### 2.2 檢查 `moves` table 是否存在

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'moves'
ORDER BY ordinal_position;
```

**預期結果**：
- `id` | bigint | NO | nextval(...)
- `room_key` | text | NO | NULL
- `round_no` | integer | NO | 0
- `move_no` | integer | NO | NULL
- `x` | integer | NO | NULL
- `y` | integer | NO | NULL
- `color` | text | NO | NULL
- `created_at` | timestamptz | YES | now()

---

### 2.3 檢查 RLS Policies

```sql
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'moves';
```

**預期結果**（應有 2 個 policies）：
- `Enable read access for all users` | PERMISSIVE | {public} | SELECT
- `Enable insert access for all users` | PERMISSIVE | {public} | INSERT

**注意**：唔應該有 DELETE policy（按你要求已移除）

---

## 步驟 3：Push Code to GitHub

Migration 執行成功後：

```bash
cd /Users/a123/AI/antigravity/Gamehub
git push origin main
```

等待 GitHub Pages 部署（約 1-2 分鐘）。

---

## 步驟 4：E2E 測試（雙瀏覽器）

### 測試環境
- **Tab A**: 正常 Chrome 視窗
- **Tab B**: Incognito (無痕) Chrome 視窗

### 測試流程

#### 4.1 入房並 Ready
1. **Tab A**: 開啟 `https://penny323mo.github.io/Gamehub/games/gomoku/index.html`
   - Click "ONLINE 對戰"
   - Click "加入" on ROOM03
   - 確認見到角色（黑子 or 白子）
   - 確認見到 Ready UI（⚫ 黑：未準備 / ⚪ 白：未準備）

2. **Tab B (Incognito)**: 開啟同一 URL
   - Click "ONLINE 對戰"
   - Click "加入" on ROOM03
   - 確認見到相反角色

3. **Tab A**: Click "準備" 按鈕
   - 確認按鈕變成 "取消準備"
   - Tab B 應該見到 "⚫ 黑：已準備" 或 "⚪ 白：已準備"（取決於 Tab A 角色）

4. **Tab B**: Click "準備" 按鈕
   - **兩邊同時自動進入 playing 狀態**
   - Timer 顯示 30 並開始倒數
   - 狀態顯示 "輪到你了" (黑) 或 "等待對手" (白)

#### 4.2 落子同步測試

5. **Tab A (黑方)**: Click 棋盤中央落黑子
   - Tab B 必須在 **2 秒內**見到黑子出現
   - Tab B Timer reset 變返 30
   - Tab B 狀態變 "輪到你了"

6. **Tab B (白方)**: Click 鄰近位置落白子
   - Tab A 必須在 **2 秒內**見到白子出現
   - Tab A Timer reset 變返 30
   - Tab A 狀態變 "輪到你了"

7. 重複上述步驟 3-5 次確保穩定

#### 4.3 Console Log 檢查

兩邊 Console 應該見到：
- ✅ `[Online] Supabase Initialized`
- ✅ `[RT] Subscription Status: SUBSCRIBED`
- ✅ `[Presence] Tracked: { user_id, color }`
- ✅ `[Ready] Attempting to start game...`
- ✅ `[Ready] Game started!`
- ✅ `[RT] New Move: { x, y, color }`
- ✅ `[RT] Room Update: { status: 'playing', ... }`

**不應該見到**：
- ❌ 404 (moves table not found)
- ❌ PGRST204 (column not found)
- ❌ `[Fallback] Polling for updates...`（除非 realtime 失效）
- ❌ `[RT] Channel error/closed`

---

## 驗收證據要求

請提供以下截圖 / 資料：

### 證據 1: Schema Verification
貼上步驟 2.1、2.2、2.3 嘅 SQL 查詢結果

### 證據 2: Rooms Row 範例
執行以下 SQL 並貼結果（各階段）：

```sql
-- 階段 1: 兩人入房後 (waiting)
SELECT room_key, status, black_player_id, white_player_id, black_ready, white_ready, round_no
FROM "Gomoku's rooms"
WHERE room_key = 'ROOM03';

-- 階段 2: 雙方 ready 後 (playing)
SELECT room_key, status, current_player, turn_started_at, round_no
FROM "Gomoku's rooms"
WHERE room_key = 'ROOM03';

-- 階段 3: 黑落子後
SELECT room_key, current_player, turn_started_at
FROM "Gomoku's rooms"
WHERE room_key = 'ROOM03';

-- 階段 4: Moves 表
SELECT * FROM moves
WHERE room_key = 'ROOM03'
ORDER BY move_no;
```

### 證據 3: 雙瀏覽器對局截圖
- Tab A: 黑方視角（棋盤 + 黑子 + Ready 狀態）
- Tab B: 白方視角（同步見到黑子 + Timer reset）

### 證據 4: Console Logs
- Tab A Console（包含 RT subscription + Ready + Move）
- Tab B Console（包含 RT subscription + Move sync）

---

## 如果測試失敗

### 問題 A: Schema 缺欄位
- 重新執行 `db_migration.sql`
- 確認 Supabase Project ID 正確

### 問題 B: 白方收唔到黑方落子
- 檢查 Tab B Console 是否有 `[RT] Subscription Status: SUBSCRIBED`
- 檢查是否有 `[Fallback] Polling for updates...`（表示 realtime 失效，fallback 啟動）
- 等待最多 2 秒（fallback 間隔 1.8s）

### 問題 C: Auto-kick / Room Stale
- 確認 Console 無 `[Presence] Black/White player absent, reclaiming seat...`
- 確認兩邊 Presence tracking 正常

---

## 完成後

確認以上所有步驟通過後，回報：
1. ✅ Migration 成功
2. ✅ Schema 驗證通過
3. ✅ E2E 雙瀏覽器測試通過（<2s 同步）
4. ✅ Console 無錯誤
5. 📸 提供驗收證據截圖
