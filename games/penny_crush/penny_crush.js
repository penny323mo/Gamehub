
const PennyCrush = {
    gridSize: 4,
    grid: [], // 2D array of strings (colors or special tiles)
    score: 0,
    selectedTile: null, // {r, c}
    isProcessing: false,
    generation: 0,
    inputLifecycleBound: false,

    // Updated to use 5 character types mapped to images
    colors: ['pc-char-1', 'pc-char-2', 'pc-char-3', 'pc-char-4', 'pc-char-5'],

    // Special tile types
    specialTiles: ['pc-bomb', 'pc-row-bomb', 'pc-col-bomb', 'pc-rainbow'],

    // Safety caps for special spawns per move
    MAX_BOMBS_PER_TURN: 2,
    MAX_RAINBOWS_PER_TURN: 1,
    bombsSpawnedThisTurn: 0,
    rainbowsSpawnedThisTurn: 0,
    isPlayerInitiatedTurn: false, // Track if turn came from player swap

    // Combo system
    comboCount: 0,

    // Item tools
    cleanOneRemaining: 3,
    forcedSwapRemaining: 3,
    activeToolMode: null, // 'cleanOne' | 'forcedSwap' | null
    shuffleRemaining: 3,

    init: function (size) {
        const generation = ++this.generation;
        this.clearTransientUi();
        this.gridSize = size;
        this.score = 0;
        this.selectedTile = null;
        this.isProcessing = false;
        this.shuffleRemaining = 3;
        this.comboCount = 0;
        this.cleanOneRemaining = 3;
        this.forcedSwapRemaining = 3;
        this.activeToolMode = null;

        this.updateScore(0);
        this.畫最高分();
        this.updateShuffleBtn();
        this.updateToolButtons();

        document.getElementById('pc-menu').classList.add('hidden');
        document.getElementById('pc-game').classList.remove('hidden');

        // Step 1: Add CSS variable for dynamic board size
        // Step 1: Add CSS variable for dynamic board size
        const boardElement = document.getElementById('pc-grid');
        if (boardElement) {
            boardElement.style.setProperty('--board-size', this.gridSize);
        }

        this.generateGrid();
        this.ensurePlayable(generation);
        this.renderGrid();
    },

    // calculateTileSize removed as CSS now handles the layout with 1fr
    // functionality is replaced by CSS Grid responsiveness


    isCurrentGeneration: function (generation) {
        return generation === this.generation;
    },

    waitFor: function (ms, generation) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(this.isCurrentGeneration(generation)), ms);
        });
    },

    clearTransientUi: function () {
        document.querySelectorAll('.score-pop, .combo-text').forEach((el) => el.remove());
        const gridEl = document.getElementById('pc-grid');
        gridEl?.classList.remove('pc-shake', 'pc-pop', 'is-clearing');
    },

    // Touch input can be interrupted by an OS gesture, app switch, or browser
    // lifecycle transition.  A cancelled gesture must not leave a pressed
    // tile or a half-completed two-tap selection armed for the next tap.
    cancelTransientInput: function () {
        this.selectedTile = null;
        document.querySelectorAll('#pc-grid .is-pressed, #pc-grid .is-selected').forEach((el) => {
            el.classList.remove('is-pressed', 'is-selected');
        });
    },

    stop: function () {
        ++this.generation;
        this.isProcessing = false;
        this.selectedTile = null;
    },

    restart: function () {
        this.init(this.gridSize);
    },

    exit: function () {
        this.stop();
        this.clearTransientUi();
        document.getElementById('pc-game').classList.add('hidden');
        document.getElementById('pc-menu').classList.remove('hidden');
    },

    /*
     * 最高分。
     *
     * 呢個 hub 入面每一隻有分數嘅遊戲都記得你嘅成績——Snake 記統計同分數榜、
     * Racing Car 記最快圈、Royale 記獎盃、Tower 記波與波之間嘅進度。
     * **得 Penny Crush 一隻乜都唔記**：一 refresh 就由零開始，分數冇咗都唔知。
     * 答案本身已經喺屋企，得一隻遊戲冇跟（同 ADR-211 同一個形狀）。
     *
     * 逐個板大細分開記——6×6 嘅最高分同 8×8 唔可以拎嚟比。
     */
    最高分KEY: 'penny-crush-best-v1',

    讀最高分: function () {
        try {
            var j = JSON.parse(localStorage.getItem(this.最高分KEY) || '{}');
            return Number(j[this.gridSize] || 0);
        } catch (e) { return 0; }
    },

    /*
     * 寫嗰陣先讀返存檔（`改存檔`，ADR-232）——兩個 tab 開住同一隻遊戲嗰陣,
     * 信記憶體嗰份就會食咗另一個 tab 嘅成績。呢度用 max 而唔係覆蓋，
     * 所以就算兩個 tab 一先一後寫，高嗰個都留得住。
     *
     * `改存檔` 由 module shim 掛上 `window`（見 index.html），module 係 deferred,
     * 所以要 guard——攞唔到就退返最簡單嘅寫法，唔好因為記唔到分而玩唔到。
     */
    寫最高分: function (分) {
        var K = this.最高分KEY, size = this.gridSize;
        var 改 = function (現時) {
            var m = (現時 && typeof 現時 === 'object') ? 現時 : {};
            m[size] = Math.max(Number(m[size] || 0), 分);
            return m;
        };
        try {
            if (typeof window.改存檔 === 'function') { window.改存檔(K, 改, {}); return; }
            var raw = localStorage.getItem(K);
            localStorage.setItem(K, JSON.stringify(改(raw ? JSON.parse(raw) : {})));
        } catch (e) { /* 記唔住就算，唔好因為咁玩唔到 */ }
    },

    畫最高分: function () {
        var el = document.getElementById('pc-best');
        if (el) el.textContent = this.讀最高分();
    },

    updateScore: function (add) {
        // If resetting, just set score
        if (add === 0 && this.score === 0) {
            // Already handled
        } else {
            this.score += add;
        }
        document.getElementById('pc-score').textContent = this.score;
        // 打破紀錄就即刻寫低——冇「遊戲結束」呢一刻，玩家係直接閂 tab 走人嘅,
        // 所以唔可以等到收場先存。只喺真係破紀錄嗰陣寫，唔會每次得分都寫盤。
        if (this.score > this.讀最高分()) {
            this.寫最高分(this.score);
            this.畫最高分();
        }
    },

    generateGrid: function () {
        this.grid = [];
        for (let r = 0; r < this.gridSize; r++) {
            const row = [];
            for (let c = 0; c < this.gridSize; c++) {
                // 避免一開波/洗完牌就自帶現成 match（左兩格、上兩格唔好同色湊三）
                let color, guard = 0;
                do {
                    color = this.getRandomColor();
                    guard++;
                } while (guard < 20 && (
                    (c >= 2 && row[c - 1] === color && row[c - 2] === color) ||
                    (r >= 2 && this.grid[r - 1][c] === color && this.grid[r - 2][c] === color)
                ));
                row.push(color);
            }
            this.grid.push(row);
        }
    },

    // 棋盤仲有冇路行？（特殊磚本身就係一步；否則試晒每對相鄰交換睇下有冇 match）
    hasPossibleMove: function () {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.specialTiles.includes(this.grid[r][c]) || this.grid[r][c] === 'pc-bomb') return true;
            }
        }
        const trySwap = (r1, c1, r2, c2) => {
            const g = this.grid;
            [g[r1][c1], g[r2][c2]] = [g[r2][c2], g[r1][c1]];
            const ok = this.findMatches().length > 0;
            [g[r1][c1], g[r2][c2]] = [g[r2][c2], g[r1][c1]];
            return ok;
        };
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (c + 1 < this.gridSize && trySwap(r, c, r, c + 1)) return true;
                if (r + 1 < this.gridSize && trySwap(r, c, r + 1, c)) return true;
            }
        }
        return false;
    },

    // 死局自動免費洗牌（唔食玩家嘅 shuffle 次數），唔會俾玩家困死喺冇路行嘅棋盤
    ensurePlayable: function (generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        let guard = 0;
        while (!this.hasPossibleMove() && guard < 30) {
            this.generateGrid();
            guard++;
        }
        if (guard > 0) {
            this.renderGrid();
            const gridEl = document.getElementById('pc-grid');
            if (gridEl) {
                gridEl.classList.add('pc-shake');
                setTimeout(() => {
                    if (this.isCurrentGeneration(generation)) gridEl.classList.remove('pc-shake');
                }, 500);
            }
        }
    },

    getRandomColor: function () {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    },

    handleInteraction: function (r, c) {
        if (this.isProcessing) return;
        const generation = this.generation;

        // --- Rainbow Ball Activation ---
        if (this.selectedTile) {
            const sel = this.selectedTile;
            const selTile = this.grid[sel.r][sel.c];
            const clickedTile = this.grid[r][c];

            if (selTile === 'pc-rainbow' && this.colors.includes(clickedTile)) {
                this.isProcessing = true;
                this.selectedTile = null;
                this.turnClearedCount = 0;
                this.comboCount = 0;
                this.useRainbow(sel.r, sel.c, clickedTile, generation);
                return;
            }
            if (clickedTile === 'pc-rainbow' && this.colors.includes(selTile)) {
                this.isProcessing = true;
                this.selectedTile = null;
                this.turnClearedCount = 0;
                this.comboCount = 0;
                this.useRainbow(r, c, selTile, generation);
                return;
            }
        }

        // --- Tool Logic (Clean One) ---
        if (this.activeToolMode === 'cleanOne') {
            this.cleanOneRemaining--;
            this.activeToolMode = null;
            this.updateToolButtons();

            const tile = document.querySelector(`.pc-tile[data-r="${r}"][data-c="${c}"]`);
            if (tile) tile.classList.add('pc-pop');

            this.isProcessing = true; // 補位/動畫期間鎖住輸入，唔畀玩家喺變緊嘅棋盤上面亂搣
            this.turnClearedCount = 0;
            this.comboCount = 0;
            this.grid[r][c] = null;
            this.updateScore(50);

            setTimeout(async () => {
                if (!this.isCurrentGeneration(generation)) return;
                if (!await this.applyGravity(generation)) return;
                if (!this.isCurrentGeneration(generation)) return;
                // 補落嚟嘅新磚可能自己砌出 match，要照樣結算，唔好留喺棋盤度
                const newMatches = this.findMatches();
                if (newMatches.length > 0) {
                    await this.processMatches(newMatches, false, generation);
                } else {
                    this.finalizeTurn(generation);
                }
            }, 300);
            return;
        }

        // Select first
        if (!this.selectedTile) {
            this.selectedTile = { r, c };
            this.renderGrid();
            return;
        }

        // Swap processing
        const r1 = this.selectedTile.r;
        const c1 = this.selectedTile.c;
        const r2 = r;
        const c2 = c;

        const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);

        if (isAdjacent) {
            if (this.activeToolMode === 'forcedSwap') {
                this.forcedSwapRemaining--;
                this.activeToolMode = null;
                this.updateToolButtons();
                this.swapTiles(r1, c1, r2, c2, true, generation);
            } else {
                this.swapTiles(r1, c1, r2, c2, false, generation);
            }
        } else {
            this.selectedTile = { r, c };
            this.renderGrid();
        }
    },

    renderGrid: function () {
        const gridEl = document.getElementById('pc-grid');
        if (!gridEl) return;

        gridEl.innerHTML = '';

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('pc-tile');
                cell.dataset.r = r;
                cell.dataset.c = c;

                const type = this.grid[r][c];
                const shape = document.createElement('div');
                shape.classList.add('candy-shape');
                cell.appendChild(shape);

                if (type) {
                    cell.classList.add(type);
                }

                if (this.selectedTile && this.selectedTile.r === r && this.selectedTile.c === c) {
                    cell.classList.add('is-selected');
                }

                if (this.activeToolMode) {
                    cell.classList.add('tool-target');
                }

                // Add pointer event handlers for pressed state
                cell.addEventListener('pointerdown', () => {
                    cell.classList.add('is-pressed');
                });

                cell.addEventListener('pointerup', () => {
                    cell.classList.remove('is-pressed');
                });

                cell.addEventListener('pointerleave', () => {
                    cell.classList.remove('is-pressed');
                });

                cell.onclick = () => this.handleInteraction(r, c);
                gridEl.appendChild(cell);
            }
        }
    },

    swapTiles: async function (r1, c1, r2, c2, forceSwap = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        this.isProcessing = true;
        this.selectedTile = null;
        this.comboCount = 0;
        this.bombsSpawnedThisTurn = 0;
        this.rainbowsSpawnedThisTurn = 0;
        this.isPlayerInitiatedTurn = true;

        const temp = this.grid[r1][c1];
        this.grid[r1][c1] = this.grid[r2][c2];
        this.grid[r2][c2] = temp;

        this.renderGrid();

        const tile1 = this.grid[r1][c1];
        const tile2 = this.grid[r2][c2];

        // Cross Bomb
        if (tile1 === 'pc-bomb' || tile2 === 'pc-bomb') {
            if (!await this.waitFor(200, generation)) return;
            this.turnClearedCount = 0;
            const bombsToDetonate = [];
            if (tile1 === 'pc-bomb') bombsToDetonate.push({ r: r1, c: c1 });
            if (tile2 === 'pc-bomb') bombsToDetonate.push({ r: r2, c: c2 });
            await this.detonateBombs(bombsToDetonate, false, generation);
            return;
        }

        // Row Bomb
        if (tile1 === 'pc-row-bomb' || tile2 === 'pc-row-bomb') {
            if (!await this.waitFor(200, generation)) return;
            this.turnClearedCount = 0;
            if (tile1 === 'pc-row-bomb') await this.detonateRowBomb(r1, c1, false, generation);
            if (tile2 === 'pc-row-bomb') await this.detonateRowBomb(r2, c2, false, generation);
            return;
        }

        // Column Bomb
        if (tile1 === 'pc-col-bomb' || tile2 === 'pc-col-bomb') {
            if (!await this.waitFor(200, generation)) return;
            this.turnClearedCount = 0;
            if (tile1 === 'pc-col-bomb') await this.detonateColBomb(r1, c1, false, generation);
            if (tile2 === 'pc-col-bomb') await this.detonateColBomb(r2, c2, false, generation);
            return;
        }

        const matches = this.findMatches();

        if (matches.length > 0 || forceSwap) {
            this.turnClearedCount = 0;
            if (matches.length > 0) {
                await this.processMatches(matches, true, generation);
            } else {
                if (!await this.applyGravity(generation)) return;
                this.finalizeTurn(generation);
            }
        } else {
            const t1 = document.querySelector(`.pc-tile[data-r="${r1}"][data-c="${c1}"]`);
            const t2 = document.querySelector(`.pc-tile[data-r="${r2}"][data-c="${c2}"]`);
            if (t1) t1.classList.add('pc-shake');
            if (t2) t2.classList.add('pc-shake');

            if (!await this.waitFor(300, generation)) return;

            const temp2 = this.grid[r1][c1];
            this.grid[r1][c1] = this.grid[r2][c2];
            this.grid[r2][c2] = temp2;

            this.isProcessing = false;
            this.renderGrid();
        }
    },

    detonateBombs: async function (bombs, allowSpecialSpawn = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        this.isPlayerInitiatedTurn = false;
        const toClear = new Set();
        bombs.forEach(b => {
            for (let c = 0; c < this.gridSize; c++) toClear.add(`${b.r},${c}`);
            for (let r = 0; r < this.gridSize; r++) toClear.add(`${r},${b.c}`);
        });

        toClear.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            const tile = document.querySelector(`.pc-tile[data-r="${r}"][data-c="${c}"]`);
            if (tile) tile.classList.add('is-clearing');
        });

        if (!await this.waitFor(320, generation)) return;

        this.updateScore(toClear.size * 20);
        this.turnClearedCount += toClear.size;

        toClear.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            this.grid[r][c] = null;
        });

        if (!await this.applyGravity(generation)) return;

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false, generation);
        } else {
            this.finalizeTurn(generation);
        }
    },

    processMatches: async function (matches, allowSpecialSpawn = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        // 每一波消除（包括連鎖）都計 combo，唔係得第一波——
        // 唔係 comboCount 永遠最多 1，倍數同 combo 字幕一世都出唔到
        this.comboCount++;

        let specialType = null;
        let spawnPos = null;

        if (allowSpecialSpawn) {
            specialType = this.checkSpecialTileSpawn(matches);
            if (specialType === 'pc-rainbow') {
                if (this.rainbowsSpawnedThisTurn >= this.MAX_RAINBOWS_PER_TURN) specialType = null;
            } else if (specialType === 'pc-row-bomb' || specialType === 'pc-col-bomb') {
                if (this.bombsSpawnedThisTurn >= this.MAX_BOMBS_PER_TURN) specialType = null;
            }

            if (specialType) {
                spawnPos = matches[Math.floor(Math.random() * matches.length)];
                if (specialType === 'pc-rainbow') this.rainbowsSpawnedThisTurn++;
                else this.bombsSpawnedThisTurn++;
            }
        }

        // Add clearing animation to matched tiles
        matches.forEach(m => {
            const tile = document.querySelector(`.pc-tile[data-r="${m.r}"][data-c="${m.c}"]`);
            if (tile) tile.classList.add('is-clearing');
        });

        if (!await this.waitFor(320, generation)) return;

        const multiplier = this.getComboMultiplier();
        const points = matches.length * 10 * multiplier;
        this.updateScore(points);
        this.turnClearedCount += matches.length;

        if (matches.length > 0) {
            this.showScorePop(matches[0].r, matches[0].c, points);
        }

        if (multiplier > 1) {
            this.showComboText(multiplier);
        }

        matches.forEach(m => {
            if (spawnPos && m.r === spawnPos.r && m.c === spawnPos.c) {
                // Keep
            } else {
                this.grid[m.r][m.c] = null;
            }
        });

        if (spawnPos && specialType) {
            this.grid[spawnPos.r][spawnPos.c] = specialType;
            this.renderGrid();
        }

        if (!await this.applyGravity(generation)) return;

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false, generation);
        } else {
            this.finalizeTurn(generation);
        }
    },

    applyGravity: async function (generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return false;
        let moved = false;
        // Simple gravity: iterate columns, move nulls to top
        for (let c = 0; c < this.gridSize; c++) {
            let writeRow = this.gridSize - 1;
            for (let r = this.gridSize - 1; r >= 0; r--) {
                if (this.grid[r][c] !== null) {
                    if (r !== writeRow) {
                        this.grid[writeRow][c] = this.grid[r][c];
                        this.grid[r][c] = null;

                        // Visual Fall (optional, simple logic)
                        const tile = document.querySelector(`.pc-tile[data-r="${writeRow}"][data-c="${c}"]`);
                        // This would require more complex DOM mapping. 
                        // For refactor, we just trust renderGrid will show it.
                        moved = true;
                    }
                    writeRow--;
                }
            }
            // Fill top with new random
            while (writeRow >= 0) {
                this.grid[writeRow][c] = this.getRandomColor();
                // Flag as falling?
                moved = true;
                writeRow--;
            }
        }

        if (moved) {
            this.renderGrid();
            if (!await this.waitFor(300, generation)) return false;
        }
        return this.isCurrentGeneration(generation);
    },

    finalizeTurn: function (generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        if (this.isPlayerInitiatedTurn &&
            this.turnClearedCount >= 6 &&
            this.bombsSpawnedThisTurn < this.MAX_BOMBS_PER_TURN) {
            this.spawnBomb();
            this.bombsSpawnedThisTurn++;
        }
        this.isProcessing = false;
        this.turnClearedCount = 0;
        this.isPlayerInitiatedTurn = false;
        this.ensurePlayable(generation); // 消完之後補位可能變死局，即場檢查
    },

    spawnBomb: function () {
        let attempts = 0;
        while (attempts < 20) {
            const r = Math.floor(Math.random() * this.gridSize);
            const c = Math.floor(Math.random() * this.gridSize);
            if (this.grid[r][c] && this.grid[r][c] !== 'pc-bomb') {
                this.grid[r][c] = 'pc-bomb';
                this.renderGrid();
                const tile = document.querySelector(`.pc-tile[data-r="${r}"][data-c="${c}"]`);
                if (tile) tile.classList.add('pc-pop');
                break;
            }
            attempts++;
        }
    },

    findMatches: function () {
        const matches = [];
        const matchedSet = new Set();
        const isValid = (color) => color && color !== 'pc-bomb' && !this.specialTiles.includes(color) || (this.colors.includes(color));

        // Horizontal
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 2; c++) {
                const color = this.grid[r][c];
                if (this.colors.includes(color) && color === this.grid[r][c + 1] && color === this.grid[r][c + 2]) {
                    matchedSet.add(`${r},${c}`);
                    matchedSet.add(`${r},${c + 1}`);
                    matchedSet.add(`${r},${c + 2}`);
                    let k = c + 3;
                    while (k < this.gridSize && this.grid[r][k] === color) {
                        matchedSet.add(`${r},${k}`);
                        k++;
                    }
                }
            }
        }

        // Vertical
        for (let c = 0; c < this.gridSize; c++) {
            for (let r = 0; r < this.gridSize - 2; r++) {
                const color = this.grid[r][c];
                if (this.colors.includes(color) && color === this.grid[r + 1][c] && color === this.grid[r + 2][c]) {
                    matchedSet.add(`${r},${c}`);
                    matchedSet.add(`${r + 1},${c}`);
                    matchedSet.add(`${r + 2},${c}`);
                    let k = r + 3;
                    while (k < this.gridSize && this.grid[k][c] === color) {
                        matchedSet.add(`${k},${c}`);
                        k++;
                    }
                }
            }
        }

        matchedSet.forEach(str => {
            const parts = str.split(',');
            matches.push({ r: parseInt(parts[0]), c: parseInt(parts[1]) });
        });

        return matches;
    },

    updateToolButtons: function () {
        const cleanBtn = document.getElementById('btn-clean-one');
        const swapBtn = document.getElementById('btn-forced-swap');

        if (cleanBtn) {
            cleanBtn.textContent = `🧹 Clean (${this.cleanOneRemaining})`;
            cleanBtn.disabled = this.cleanOneRemaining <= 0;
            cleanBtn.classList.toggle('active-tool', this.activeToolMode === 'cleanOne');
        }
        if (swapBtn) {
            swapBtn.textContent = `🔄 Swap (${this.forcedSwapRemaining})`;
            swapBtn.disabled = this.forcedSwapRemaining <= 0;
            swapBtn.classList.toggle('active-tool', this.activeToolMode === 'forcedSwap');
        }
    },

    activateCleanOne: function () {
        if (this.cleanOneRemaining <= 0 || this.isProcessing) return;
        this.activeToolMode = this.activeToolMode === 'cleanOne' ? null : 'cleanOne';
        this.selectedTile = null;
        this.updateToolButtons();
        this.renderGrid();
    },

    activateForcedSwap: function () {
        if (this.forcedSwapRemaining <= 0 || this.isProcessing) return;
        this.activeToolMode = this.activeToolMode === 'forcedSwap' ? null : 'forcedSwap';
        this.selectedTile = null;
        this.updateToolButtons();
        this.renderGrid();
    },

    // Shuffle Logic
    updateShuffleBtn: function () {
        const btn = document.getElementById('btn-shuffle');
        if (btn) {
            btn.innerHTML = `Shuffle (${this.shuffleRemaining})`;
            if (this.shuffleRemaining <= 0) btn.disabled = true;
            else btn.disabled = false;
        }
    },

    shuffleBoard: function () {
        if (this.shuffleRemaining <= 0 || this.isProcessing) return;
        const generation = this.generation;
        this.shuffleRemaining--;
        this.updateShuffleBtn();

        // Flatten, Shuffle, Reshape? Or just re-generate?
        // Let's just shuffle existing tiles to keep the set fair?
        // Actually, Random Generate is easiest and fair enough.
        this.generateGrid();
        this.ensurePlayable(generation);
        this.renderGrid();

        // Show effect
        const gridEl = document.getElementById('pc-grid');
        gridEl.classList.add('pc-shake');
        setTimeout(() => {
            if (this.isCurrentGeneration(generation)) gridEl.classList.remove('pc-shake');
        }, 500);
    },

    showScorePop: function (r, c, points) {
        const gridEl = document.getElementById('pc-grid');
        if (!gridEl) return;

        const pop = document.createElement('div');
        pop.className = 'score-pop';
        pop.textContent = `+${points}`;
        const tileSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tile-size')) || 30;
        pop.style.left = `${c * tileSize + tileSize / 2}px`;
        pop.style.top = `${r * tileSize}px`;

        gridEl.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
    },

    showComboText: function (multiplier) {
        if (multiplier < 2) return;
        const container = document.querySelector('.penny-container'); // Use container relative
        if (!container) return;

        const combo = document.createElement('div');
        combo.className = 'combo-text';
        combo.textContent = `COMBO x${multiplier}!`;
        container.appendChild(combo);
        setTimeout(() => combo.remove(), 1200);
    },

    getComboMultiplier: function () {
        if (this.comboCount <= 1) return 1;
        if (this.comboCount === 2) return 2;
        if (this.comboCount === 3) return 3;
        return 4;
    },

    checkSpecialTileSpawn: function (matches) {
        if (matches.length >= 5) return 'pc-rainbow';
        const rows = {};
        const cols = {};
        matches.forEach(m => {
            rows[m.r] = (rows[m.r] || 0) + 1;
            cols[m.c] = (cols[m.c] || 0) + 1;
        });
        for (let r in rows) if (rows[r] >= 4) return 'pc-row-bomb';
        for (let c in cols) if (cols[c] >= 4) return 'pc-col-bomb';
        return null;
    },

    detonateRowBomb: async function (r, c, allowSpecialSpawn = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        const toClear = new Set();
        for (let col = 0; col < this.gridSize; col++) toClear.add(`${r},${col}`);
        await this.clearTiles(toClear, 25, false, generation);
    },

    detonateColBomb: async function (r, c, allowSpecialSpawn = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        const toClear = new Set();
        for (let row = 0; row < this.gridSize; row++) toClear.add(`${row},${c}`);
        await this.clearTiles(toClear, 25, false, generation);
    },

    useRainbow: async function (r, c, targetColor, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        const toClear = new Set();
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === targetColor) toClear.add(`${row},${col}`);
            }
        }
        toClear.add(`${r},${c}`);
        await this.clearTiles(toClear, 30, false, generation);
    },

    clearTiles: async function (tileSet, pointsPerTile, allowSpecialSpawn = false, generation = this.generation) {
        if (!this.isCurrentGeneration(generation)) return;
        this.isPlayerInitiatedTurn = false;
        tileSet.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            const tile = document.querySelector(`.pc-tile[data-r="${r}"][data-c="${c}"]`);
            if (tile) tile.classList.add('is-clearing');
        });

        if (!await this.waitFor(320, generation)) return;
        const points = tileSet.size * pointsPerTile;
        this.updateScore(points);
        this.turnClearedCount += tileSet.size;

        if (tileSet.size > 0) {
            const first = [...tileSet][0].split(',').map(Number);
            this.showScorePop(first[0], first[1], points);
        }

        tileSet.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            this.grid[r][c] = null;
        });

        if (!await this.applyGravity(generation)) return;

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false, generation);
        } else {
            this.finalizeTurn(generation);
        }
    },

    isSpecialTile: function (r, c) {
        return this.specialTiles.includes(this.grid[r][c]);
    }
};

function goToLauncher() {
    window.location.href = "../../index.html";
}

/*
 * 畀瀏覽器測試查狀態嘅 seam（同 Tower 嘅 `__TD`、Racing Car 嘅 `__racer`、
 * Royale 嘅 `__royale` 一樣）。
 *
 * `const PennyCrush = …` 喺 classic script 入面係 script scope，**唔會上
 * `window`**（`var` 同函數聲明先會）——所以要明寫一句。冇呢句，測試就要
 * 靠亂撳去等消，而一條靠彩數過嘅 gate 同冇 gate 分別唔大。
 */
window.__pennyCrush = PennyCrush;

// Keep this binding outside renderGrid: the board's child tiles are rebuilt
// after every swap/cascade, while the lifecycle events belong to the game as a
// whole.  The guard also makes hot-reload/re-entry harmless.
if (!PennyCrush.inputLifecycleBound) {
    const cancelInput = () => PennyCrush.cancelTransientInput();
    window.addEventListener('pointercancel', cancelInput, { passive: true });
    window.addEventListener('lostpointercapture', cancelInput, { passive: true });
    window.addEventListener('blur', cancelInput);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelInput();
    });
    PennyCrush.inputLifecycleBound = true;
}
