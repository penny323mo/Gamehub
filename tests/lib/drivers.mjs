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
     * 兩樣都唔可以讀返 storage——讀返 storage 就變成「存檔仲喺度」嘅同義詞,
     * 而條 check 想問嘅係「局真係開返咗未」。
     *   · `盤上幾多隻` 由遊戲自己個 `board` 攞（reload 之後係空嘅，
     *     撳完 Continue 先會有嘢）;
     *   · `畫咗嘢` 抽 canvas 像素——狀態返咗嚟但畫唔返出嚟一樣係壞。
     */
    續驗: () => {
      const g = window.__gomoku;
      const b = g?.board ?? [];
      const cv = document.getElementById('gomoku-board');
      /*
       * **「畫面有嘢」唔等於「啲棋畫返咗」。** 第一版數成塊 canvas 有幾多
       * 非背景像素——量到 301，但突變（唔畫返啲棋）照樣量到 300：嗰 300 個
       * 係**格線**，畫盤嗰陣一定有。一條分唔開「格線」同「棋子」嘅 check
       * 係壞 check。
       *
       * 改成拎「有棋嗰格」同「空格」比：同一條公式算兩個中心點
       * （`drawBoard` 用 `cellSize = w / 15`，中心喺 `(i + 0.5) * cellSize`）。
       * 公式算錯嘅話兩邊都錯，條 check 會報紅——**錯要向紅嗰邊錯**。
       */
      let 有棋格 = null, 空格 = null;
      for (let r = 0; r < b.length; r++) for (let c = 0; c < b.length; c++) {
        if (b[r][c] && !有棋格) 有棋格 = [r, c];
        else if (!b[r][c] && !空格) 空格 = [r, c];
      }
      let 棋色 = null, 空色 = null;
      try {
        const ctx = cv.getContext('2d');
        const cell = cv.width / b.length;
        const 抽 = ([r, c]) => {
          const d = ctx.getImageData(Math.round((c + 0.5) * cell), Math.round((r + 0.5) * cell), 1, 1).data;
          return [d[0], d[1], d[2]];
        };
        if (有棋格) 棋色 = 抽(有棋格);
        if (空格) 空色 = 抽(空格);
      } catch (e) { /* 抽唔到就留 null，下面會報紅 */ }
      const 差 = (棋色 && 空色)
        ? Math.abs(棋色[0] - 空色[0]) + Math.abs(棋色[1] - 空色[1]) + Math.abs(棋色[2] - 空色[2])
        : 0;
      return {
        畫面: !document.getElementById('game-board-area')?.classList.contains('hidden'),
        盤上幾多隻: b.flat().filter(Boolean).length,
        有棋格, 空格, 棋色, 空色,
        棋同空差幾多: 差,
      };
    },
  },
];
