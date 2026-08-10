// 逐隻遊戲「點樣玩到有嘢值得記嗰一刻」嘅 driver。
//
// 由 `tests/hub-progress.mjs` 抽出嚟——因為第二把尺（`hub-tabs.mjs`）要行
// 一模一樣嘅路。**抄多一份就會有兩份各自漂移嘅真相**：邊個先改，另一把尺
// 就靜靜雞量緊另一件事。
//
// 每個 driver 三件嘢：
//   · `玩(page)`  ——推遊戲自己條路去到「有嘢值得記」嗰一刻。
//   · `到咗()`    ——喺頁面度行，證明真係去到（**冇呢個對照，一隻未開始玩嘅
//                    遊戲會扮到「冇嘢好記」，而條 check 會綠得好安詳**）。
//   · `憑據()`    ——喺頁面度行，讀返留低咗嘅嘢；冇就 `null`。
//
// `累積` 係後加嘅（`hub-tabs.mjs` 用）：有值即係「呢個存檔係加落去，唔係
// 蓋過去」，返一個數。冇值即係last-write-wins 係設計本身，唔應該當佢係病。

export const 遊戲 = [
  {
    名: 'Tower Defense', url: '/games/tower/dist/index.html',
    玩: async (p) => {
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__TD?.開波次數?.() > 0, null, { timeout: 240000 });
      await p.waitForTimeout(12000);
    },
    // 對照：真係開咗波（唔係停喺開場畫面）
    到咗: () => (window.__TD?.開波次數?.() ?? 0) > 0,
    // 憑據：波與波之間嘅 checkpoint
    憑據: () => {
      const raw = localStorage.getItem('tower-defense-run-v1');
      if (!raw) return null;
      try { const j = JSON.parse(raw); return { wave: j.wave ?? j.波 ?? null, 長度: raw.length }; }
      catch { return { 長度: raw.length }; }
    },
  },
  {
    名: 'Neon Snake', url: '/games/snake-game/dist/index.html',
    玩: async (p) => {
      // 要先入名（form submit）先入到選單。`fill()` ＋ 撳掣入唔到。
      await p.locator('input').first().click({ timeout: 60000 });
      await p.keyboard.type('尺仔');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(3000);
      await p.getByText(/經典模式/).first().click({ timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(2000);
      await p.keyboard.press('ArrowRight');
      // `saveScore` 係喺 game over 度叫嘅，所以要真係死一次
      await p.waitForFunction(() => document.body.innerText.includes('重新開始'),
        null, { timeout: 120000 });
      await p.waitForTimeout(2000);
    },
    到咗: () => document.body.innerText.includes('重新開始'),
    憑據: () => {
      try {
        const u = JSON.parse(localStorage.getItem('snake-game-users') || '{}');
        const k = Object.keys(u)[0];
        if (!k) return null;
        const st = u[k]?.stats ?? {};
        return (st.gamesPlayed ?? 0) >= 1
          ? { 用戶: k, 打過幾多局: st.gamesPlayed, 分數紀錄: (u[k]?.scores ?? []).length }
          : null;
      } catch { return null; }
    },
    // 累積型：打多一局就要多一局，唔係蓋過上一局。
    累積: () => {
      try {
        const u = JSON.parse(localStorage.getItem('snake-game-users') || '{}');
        return Object.values(u).reduce((n, v) => n + (v?.stats?.gamesPlayed ?? 0), 0);
      } catch { return 0; }
    },
    累積叫: '打過幾多局',
  },
  {
    名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    玩: async (p) => {
      await p.waitForSelector('#pick-grid .pick-card', { timeout: 240000 });
      await p.click('#pick-grid .pick-card');
      await p.click('#pick-go', { timeout: 60000 });
      await p.waitForFunction(() => window.__mobaReady === true, null, { timeout: 180000 });
      await p.waitForTimeout(5000);
    },
    到咗: () => window.__mobaReady === true,
    // MOBA 唔存戰績（一場對 AI 嘅波打完就完），但佢記得你揀邊個英雄
    // ——即係下次入嚟唔使由頭揀過。呢個就係佢嗰種「留低」。
    憑據: () => {
      const raw = localStorage.getItem('moba-settings');
      if (!raw) return null;
      try { const j = JSON.parse(raw); return j.champion ? { champion: j.champion } : null; }
      catch { return null; }
    },
  },
  {
    名: 'Empire Royale', url: '/games/royale/index.html',
    玩: async (p) => {
      // 教學遮罩開住嗰陣模擬係**凍結**嘅（`if (!ui?.tutorialOpen)`）——唔標記睇過
      // 就算擺咗張火球落去都永遠唔會爆，`phase` 永遠唔會變 `ended`。
      await p.waitForSelector('#loading', { state: 'detached', timeout: 120000 });
      await p.evaluate(async () => { const st = await import('./src/storage.js'); st.markTutorialSeen(); });
      await p.getByText(/⚔️ 對戰/).first().click({ timeout: 60000 });
      await p.waitForTimeout(600);
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__royale?.game, null, { timeout: 180000 });
      await p.waitForTimeout(1500);
      /*
       * 用返 repo 自己 `royale/tests/match.mjs` 嗰條收場食譜。
       *
       * 兩條行唔通嘅路都試過，寫低省得下一個再試：
       *   · 淨係快進（`g.update(1/60)` 行足 300 秒模擬）→ 冇人出牌就拖到
       *     `overtime` 僵住，`phase` 永遠唔係 `ended`；
       *   · 直接寫 `king.hp = 0` → 唔會收場，因為 `#kill` 淨係喺 `#damage`
       *     入面叫，唔經傷害就唔會觸發。
       */
      await p.evaluate(() => {
        const g = window.__royale.game;
        g.players[0].hand[0] = 'fireball';
        g.players[0].elixir = 12;
        g.towers[1].king.hp = 1;
        g.playCard(0, 0, g.towers[1].king.x, g.towers[1].king.z);
      });
      await p.waitForFunction(() => window.__royale.game.phase === 'ended', null, { timeout: 60000 });
      await p.waitForTimeout(3500);   // 等結算入存檔
    },
    到咗: () => window.__royale?.game?.phase === 'ended',
    憑據: () => {
      const raw = localStorage.getItem('royale-save-v1');
      if (!raw) return null;
      try {
        const j = JSON.parse(raw);
        return (j.trophies ?? 0) > 0 ? { trophies: j.trophies } : null;
      } catch { return null; }
    },
    // 累積型：贏多一場就要多啲獎盃。
    累積: () => {
      try { return JSON.parse(localStorage.getItem('royale-save-v1') || '{}').trophies ?? 0; }
      catch { return 0; }
    },
    累積叫: '獎盃',
  },
  {
    名: 'Racing Car 3D', url: '/games/Racing Car/index.html',
    玩: async (p) => {
      await p.locator('#start-btn').scrollIntoViewIfNeeded({ timeout: 30000 });
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__racer?.race, null, { timeout: 120000 });
      // 揸一陣，畀 `ghostRecorder` 儲夠樣本（少過 12 個 `commit` 會直接放棄）
      await p.waitForFunction(() => (window.__racer?.ghostRecorder?.samples?.length ?? 0) >= 48,
        null, { timeout: 60000 });
      /*
       * 跑完一圈先會存幽靈，而一個測試揸唔到一圈。
       *
       * 但唔使喺測試度直接叫 `ghostRecorder.commit()`——嗰樣等於自己驗自己。
       * `updateGhost()` 係睇住 `race.lapTimes.length` 有冇變嚟決定 commit 嘅,
       * 所以**推一個圈速入去**就得：跟住嗰一步係遊戲自己行嘅（`commit` →
       * `saveGhost` → `ghostPlayer.load`），我哋量嘅仍然係真嗰條路。
       */
      await p.evaluate(() => { window.__racer.race.lapTimes.push(42.5); });
      await p.waitForTimeout(1500);
    },
    到咗: () => (window.__racer?.race?.lapTimes?.length ?? 0) > 0,
    憑據: () => {
      const k = Object.keys(localStorage).find((x) => x.startsWith('racer-ghost-v1:'));
      if (!k) return null;
      try {
        const j = JSON.parse(localStorage.getItem(k));
        return (j?.s ?? []).length >= 12 ? { key: k, 圈速: j.t, 樣本數: j.s.length / 4 } : null;
      } catch { return null; }
    },
  },
  {
    名: 'Penny Crush', url: '/games/penny_crush/index.html',
    玩: async (p) => {
      // 揀個板大細入場，跟住撳到有分為止。**冇「遊戲結束」呢一刻**——
      // 玩家係直接閂 tab 走人嘅，所以「值得記」嗰一刻就係「第一次得分」。
      await p.getByText(/6\s*×\s*6|6x6/i).first().click({ timeout: 60000 })
        .catch(async () => { await p.locator('#pc-menu button').first().click({ timeout: 60000 }); });
      await p.waitForSelector('#pc-grid', { timeout: 60000 });
      /*
       * **唔可以靠亂撳。** 第一版隨機撳兩格等消——撳唔中就成條 gate 報紅,
       * 而報紅嘅係把尺唔係隻遊戲（突變測試嗰次個對照都一齊紅，就係咁）。
       * 一條靠彩數過嘅 gate 同冇 gate 分別唔大。
       *
       * 所以用遊戲自己個格陣計出一步真係消得到嘅棋：`PennyCrush.grid` 同
       * `findMatches()` 都係佢自己嘅嘢，我哋淨係借嚟搵座標，之後照樣**撳
       * 真嗰兩格**——唔係喺測試度直接叫 `swapTiles()`（嗰樣等於自己驗自己）。
       */
      const 一步 = await p.evaluate(() => {
        const G = window.__pennyCrush;
        const n = G.gridSize;
        const 試 = (r1, c1, r2, c2) => {
          const t = G.grid[r1][c1]; G.grid[r1][c1] = G.grid[r2][c2]; G.grid[r2][c2] = t;
          const 有 = G.findMatches().length > 0;
          const u = G.grid[r1][c1]; G.grid[r1][c1] = G.grid[r2][c2]; G.grid[r2][c2] = u;
          return 有;
        };
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
          if (c + 1 < n && 試(r, c, r, c + 1)) return [r * n + c, r * n + c + 1];
          if (r + 1 < n && 試(r, c, r + 1, c)) return [r * n + c, (r + 1) * n + c];
        }
        return null;
      });
      if (!一步) throw new Error('搵唔到一步消得到嘅棋（`ensurePlayable` 應該保證有）');
      const 格 = p.locator('#pc-grid > *');
      await 格.nth(一步[0]).click({ timeout: 30000 });
      await 格.nth(一步[1]).click({ timeout: 30000 });
      await p.waitForFunction(() => Number(document.getElementById('pc-score').textContent || 0) > 0,
        null, { timeout: 60000 });
      await p.waitForTimeout(1500);
    },
    到咗: () => Number(document.getElementById('pc-score')?.textContent || 0) > 0,
    憑據: () => {
      try {
        const j = JSON.parse(localStorage.getItem('penny-crush-best-v1') || '{}');
        const 最高 = Math.max(0, ...Object.values(j).map(Number));
        return 最高 > 0 ? { 最高分: 最高, 板: Object.keys(j) } : null;
      } catch { return null; }
    },
  },
  {
    名: 'Gomoku', url: '/games/gomoku/index.html',
    玩: async (p) => {
      await p.click('#gomoku-ai-btn', { timeout: 60000 });
      await p.waitForSelector('#gomoku-board', { timeout: 60000 });
      // 落三手（AI 會夾喺中間行）。落喺中間附近，一定係空格。
      const box = await p.locator('#gomoku-board').boundingBox();
      for (const [fx, fy] of [[0.5, 0.5], [0.4, 0.5], [0.6, 0.4]]) {
        await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
        await p.waitForTimeout(1200);
      }
      await p.waitForFunction(() => {
        try { return JSON.parse(localStorage.getItem('gomoku_ai_run_v1') || 'null') !== null; }
        catch { return false; }
      }, null, { timeout: 30000 });
    },
    到咗: () => {
      // 對照：真係落咗棋（唔係停喺選單扮「冇嘢好記」）
      try {
        const j = JSON.parse(localStorage.getItem('gomoku_ai_run_v1') || 'null');
        return !!j && j.board.flat().filter(Boolean).length > 0;
      } catch { return false; }
    },
    憑據: () => {
      try {
        const j = JSON.parse(localStorage.getItem('gomoku_ai_run_v1') || 'null');
        if (!j) return null;
        const 棋 = j.board.flat().filter(Boolean).length;
        return 棋 > 0 ? { 盤上幾多隻: 棋, 輪到: j.currentPlayer, 難度: j.difficulty } : null;
      } catch { return null; }
    },
    // 「留得住」唔等於「返得到」：撳個 Continue 要真係開返上一局。
    續: async (p) => {
      await p.waitForSelector('#gomoku-continue-btn:not(.hidden)', { timeout: 30000 });
      await p.click('#gomoku-continue-btn');
      await p.waitForTimeout(2000);
    },
    /*
     * 四樣嘢，四樣都唔可以讀返 storage 當「開返咗」嘅證據——讀返 storage 淨係
     * 證明「存檔仲喺度」。統一形狀（`畫面/對得上/量/畫面證據`）令下一隻遊戲
     * 接上嚟嘅時候，唔使再改條 check。
     */
    續驗: () => {
      const g = window.__gomoku;
      const b = g?.board ?? [];
      let 存 = null;
      try { 存 = JSON.parse(localStorage.getItem('gomoku_ai_run_v1') || 'null'); } catch (e) { /* 壞就 null */ }
      const cv = document.getElementById('gomoku-board');
      /*
       * **「畫面有嘢」唔等於「啲棋畫返咗」。** 第一版數成塊 canvas 有幾多非背景
       * 像素——量到 301，但突變（唔畫返啲棋）照樣量到 300：嗰 300 個係**格線**。
       * 改成拎「有棋嗰格」同「空格」比：同一條公式算兩個中心點
       * （`drawBoard` 用 `cellSize = w / 15`，中心喺 `(i + 0.5) * cellSize`）。
       * 公式算錯嘅話兩邊都錯 → 報紅。**錯要向紅嗰邊錯。**
       */
      let 有棋格 = null, 空格 = null;
      for (let r = 0; r < b.length; r++) for (let c = 0; c < b.length; c++) {
        if (b[r][c] && !有棋格) 有棋格 = [r, c];
        else if (!b[r][c] && !空格) 空格 = [r, c];
      }
      let 差 = 0;
      try {
        const ctx = cv.getContext('2d');
        const cell = cv.width / b.length;
        const 抽 = ([r, c]) => {
          const d = ctx.getImageData(Math.round((c + 0.5) * cell), Math.round((r + 0.5) * cell), 1, 1).data;
          return [d[0], d[1], d[2]];
        };
        if (有棋格 && 空格) {
          const x = 抽(有棋格), y = 抽(空格);
          差 = Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]);
        }
      } catch (e) { /* 抽唔到就留 0 → 報紅 */ }
      return {
        畫面: !document.getElementById('game-board-area')?.classList.contains('hidden'),
        對得上: !!存 && b.length === 存.board.length
          && b.every((row, r) => row.every((v, c) => v === 存.board[r][c]))
          && g?.currentPlayer === 存.currentPlayer,
        量: b.flat().filter(Boolean).length,
        畫面證據: 差,
      };
    },
  },
  {
    名: 'Xiangqi AI', url: '/games/xiangqi-ai/dist/index.html',
    玩: async (p) => {
      await p.getByText(/單機/).first().click({ timeout: 60000 });
      await p.waitForSelector('#board', { timeout: 60000 });
      await p.waitForTimeout(1500);
      /*
       * 唔可以亂撳（同 ADR-233 Penny Crush 一樣嘅教訓）。用引擎自己嗰條
       * `generateLegalMoves` 攞一步合法棋，換算返格座標，之後**撳真嗰兩格**
       * ——唔係喺測試度叫 `doMove()`，嗰樣等於自己驗自己。
       */
      /*
       * 個盤係 three.js 3D，螢幕座標要經相機投影——用平面公式一定算錯
       * （第一版就係咁：撳咗兩下，乜都冇發生）。但 `Render.hitTest(px, py)`
       * 正正係佢自己嘅「螢幕點 → 格」映射，**掃一次就反得返出嚟**：喺 canvas
       * 上面撒一格網，逐點問佢係邊格，砌返一張「格 → 螢幕點」嘅表。
       * 用返遊戲自己嗰條路，唔使我估幾何。
       *
       * 行邊步：紅炮平中（7,1 → 7,4）。**寫死一步驗證過嘅開局棋**，唔用
       * `generateLegalMoves()[0]`——嗰個嘅次序係引擎嘅內部決定，今日啱唔代表
       * 聽日啱，而 driver 唔應該跟住引擎嘅實作漂移。呢步棋喺初始盤上面
       * 路徑一定通（row 7 只有兩隻炮，c=1 同 c=7）。
       */
      const 兩點 = await p.evaluate(async () => {
        const t = await import('/games/xiangqi-ai/js/engine/types.js');
        const cv = document.getElementById('board');
        const r = cv.getBoundingClientRect();
        const 表 = new Map();
        const N = 80;
        for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) {
          const x = r.left + (ix + 0.5) * r.width / N;
          const y = r.top + (iy + 0.5) * r.height / N;
          const i = window.Render.hitTest(x, y);
          if (i >= 0 && !表.has(i)) 表.set(i, [x, y]);
        }
        return { from: 表.get(t.idx(7, 1)) ?? null, to: 表.get(t.idx(7, 4)) ?? null, 掃到: 表.size };
      });
      if (!兩點.from || !兩點.to) throw new Error(`掃唔到棋格（掃到 ${兩點.掃到} 格）`);
      await p.mouse.click(兩點.from[0], 兩點.from[1]);
      await p.waitForTimeout(700);
      await p.mouse.click(兩點.to[0], 兩點.to[1]);
      await p.waitForFunction(() => {
        try { return JSON.parse(localStorage.getItem('xiangqi_ai_run_v1') || 'null') !== null; }
        catch { return false; }
      }, null, { timeout: 60000 });
      await p.waitForTimeout(1500);
    },
    到咗: () => {
      try { return JSON.parse(localStorage.getItem('xiangqi_ai_run_v1') || 'null') !== null; }
      catch { return false; }
    },
    憑據: () => {
      try {
        const j = JSON.parse(localStorage.getItem('xiangqi_ai_run_v1') || 'null');
        if (!j) return null;
        return { 盤上幾多隻: j.board.filter(Boolean).length, 輪到: j.turn, 第幾手: j.moveNumber };
      } catch { return null; }
    },
    續: async (p) => {
      /*
       * 3D canvas 用 `getImageData` 讀唔到（WebGL 預設冇 `preserveDrawingBuffer`,
       * 讀返嚟全零——第一版就係咁，兩個取樣點色差 0）。Playwright 影相影得到。
       *
       * 但「撳之前 vs 撳之後」唔係一個有用嘅對照：撳之前仲喺選單，`#board`
       * 根本隱藏住（第二版就係咁 timeout），而且就算影到，選單同棋盤梗係唔同。
       *
       * 有用嘅對照係：**續返嘅局面 vs 開局盤**。撳完 Continue 影一張，再撳
       * 「重新開始」影多張——兩張一樣就代表佢根本冇畫返你嗰局。
       */
      await p.waitForSelector('#xiangqi-continue-btn:not(.hidden)', { timeout: 30000 });
      await p.click('#xiangqi-continue-btn');
      await p.waitForTimeout(2500);

      // 先攞狀態證據（下面重新開始會清走存檔）
      const 狀態 = await p.evaluate(() => {
        const R = window.__xiangqiRun;
        let 存 = null;
        try { 存 = JSON.parse(localStorage.getItem('xiangqi_ai_run_v1') || 'null'); } catch (e) { /* 壞就 null */ }
        const 現 = R?.現盤?.() ?? [];
        return {
          畫面: !document.getElementById('game-container')?.classList.contains('hidden'),
          量: 現.filter(Boolean).length,
          // **唔可以讀返 storage 當證據**——問嘅係「遊戲自己個盤等唔等於存檔個盤」
          對得上: !!存 && 現.length === 存.board.length
            && 現.every((v, i) => v === 存.board[i]) && R?.現輪到?.() === 存.turn,
        };
      });

      const 續住 = await p.locator('#board').screenshot();
      await p.click('#btn-restart', { timeout: 30000 });
      await p.waitForTimeout(2000);
      const 開局 = await p.locator('#board').screenshot();
      let 差 = Math.abs(續住.length - 開局.length);
      if (差 === 0) {
        const n = Math.min(續住.length, 開局.length);
        for (let i = 0; i < n; i += 13) if (續住[i] !== 開局[i]) 差++;
      }
      await p.evaluate((v) => { window.__續驗 = v; }, { ...狀態, 畫面證據: 差 });
    },
    續驗: () => window.__續驗 ?? { 攞唔到: true },
  },
  {
    名: 'Big Two', url: '/games/big2/index.html',
    玩: async (p) => {
      await p.click('#btn-local-ai', { timeout: 60000 });
      await p.click('#startGameBtn', { timeout: 60000 });
      await p.waitForTimeout(2500);
      /*
       * 出一手牌。**唔靠亂撳**——十三張牌互相疊住，撳第一張嘅中心點畀隔籬
       * 張遮住，Playwright 等到 timeout（第一版就係咁）。
       *
       * 用返遊戲自己個「提示」掣：佢會揀一手合法牌落 `ui.selected`。
       * 用佢自己嘅邏輯，唔使我喺測試度判斷邊張出得（大老二開局要含方塊三,
       * 之後仲要壓得住檯面嗰手——抄一次規則就係自己驗自己）。
       * 提示揀唔到就 pass，一樣係一個真嘅玩家動作。
       */
      await p.waitForFunction(() => (window.__big2Run?.現局?.().輪到) === 0, null, { timeout: 60000 });
      await p.click('#suggestBtn', { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(500);
      const 出到 = await p.evaluate(() => !document.getElementById('playBtn')?.disabled);
      await p.click(出到 ? '#playBtn' : '#passBtn', { timeout: 30000 });
      await p.waitForFunction(() => {
        try { return JSON.parse(localStorage.getItem('big2_ai_run_v1') || 'null') !== null; }
        catch { return false; }
      }, null, { timeout: 60000 });
      await p.waitForTimeout(1500);
    },
    到咗: () => {
      try { return JSON.parse(localStorage.getItem('big2_ai_run_v1') || 'null') !== null; }
      catch { return false; }
    },
    憑據: () => {
      try {
        const j = JSON.parse(localStorage.getItem('big2_ai_run_v1') || 'null');
        if (!j) return null;
        return { 四家手牌: j.players.map((x) => x.hand.length), 輪到: j.currentPlayer,
                 檯面: j.table ? j.table.cards.length : 0 };
      } catch { return null; }
    },
    續: async (p) => {
      await p.waitForSelector('#btn-continue:not(.hidden)', { timeout: 30000 });
      await p.click('#btn-continue');
      await p.waitForTimeout(2500);
    },
    續驗: () => {
      let 存 = null;
      try { 存 = JSON.parse(localStorage.getItem('big2_ai_run_v1') || 'null'); } catch (e) { /* 壞就 null */ }
      const 現 = window.__big2Run?.現局?.();
      // **唔可以讀返 storage 當證據**：問嘅係遊戲自己個局面等唔等於存檔。
      const 對得上 = !!存 && !!現
        && JSON.stringify(現.手牌數) === JSON.stringify(存.players.map((x) => x.hand.length))
        && 現.輪到 === 存.currentPlayer;
      const 手牌張數 = document.querySelectorAll('#hand > *').length;
      return {
        畫面: !document.getElementById('game-container')?.classList.contains('hidden'),
        對得上,
        量: (現?.手牌數 ?? []).reduce((a, b) => a + b, 0),
        // 牌類冇「盤」可以影相比——畫面證據就係你自己手上真係有牌畫咗出嚟
        畫面證據: 手牌張數,
      };
    },
  },
];
