
const PennyCrush = {
    gridSize: 4,
    grid: [], // 2D array of strings (colors or special tiles)
    score: 0,
    selectedTile: null, // {r, c}
    isProcessing: false,

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
        this.renderGrid();
    },

    // calculateTileSize removed as CSS now handles the layout with 1fr
    // functionality is replaced by CSS Grid responsiveness


    stop: function () {
        this.isProcessing = false;
    },

    restart: function () {
        this.init(this.gridSize);
    },

    exit: function () {
        document.getElementById('pc-game').classList.add('hidden');
        document.getElementById('pc-menu').classList.remove('hidden');
    },

    updateScore: function (add) {
        // If resetting, just set score
        if (add === 0 && this.score === 0) {
            // Already handled
        } else {
            this.score += add;
        }
        document.getElementById('pc-score').textContent = this.score;
    },

    generateGrid: function () {
        this.grid = [];
        for (let r = 0; r < this.gridSize; r++) {
            const row = [];
            for (let c = 0; c < this.gridSize; c++) {
                row.push(this.getRandomColor());
            }
            this.grid.push(row);
        }
    },

    getRandomColor: function () {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    },

    handleInteraction: function (r, c) {
        if (this.isProcessing) return;

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
                this.useRainbow(sel.r, sel.c, clickedTile);
                return;
            }
            if (clickedTile === 'pc-rainbow' && this.colors.includes(selTile)) {
                this.isProcessing = true;
                this.selectedTile = null;
                this.turnClearedCount = 0;
                this.comboCount = 0;
                this.useRainbow(r, c, selTile);
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

            this.grid[r][c] = null;
            this.updateScore(50);

            setTimeout(async () => {
                await this.applyGravity();
                this.finalizeTurn();
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
                this.swapTiles(r1, c1, r2, c2, true);
            } else {
                this.swapTiles(r1, c1, r2, c2, false);
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

    swapTiles: async function (r1, c1, r2, c2, forceSwap = false) {
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
            await new Promise(r => setTimeout(r, 200));
            this.turnClearedCount = 0;
            const bombsToDetonate = [];
            if (tile1 === 'pc-bomb') bombsToDetonate.push({ r: r1, c: c1 });
            if (tile2 === 'pc-bomb') bombsToDetonate.push({ r: r2, c: c2 });
            await this.detonateBombs(bombsToDetonate, false);
            return;
        }

        // Row Bomb
        if (tile1 === 'pc-row-bomb' || tile2 === 'pc-row-bomb') {
            await new Promise(r => setTimeout(r, 200));
            this.turnClearedCount = 0;
            if (tile1 === 'pc-row-bomb') await this.detonateRowBomb(r1, c1, false);
            if (tile2 === 'pc-row-bomb') await this.detonateRowBomb(r2, c2, false);
            return;
        }

        // Column Bomb
        if (tile1 === 'pc-col-bomb' || tile2 === 'pc-col-bomb') {
            await new Promise(r => setTimeout(r, 200));
            this.turnClearedCount = 0;
            if (tile1 === 'pc-col-bomb') await this.detonateColBomb(r1, c1, false);
            if (tile2 === 'pc-col-bomb') await this.detonateColBomb(r2, c2, false);
            return;
        }

        const matches = this.findMatches();

        if (matches.length > 0 || forceSwap) {
            this.turnClearedCount = 0;
            if (matches.length > 0) {
                await this.processMatches(matches, true);
            } else {
                await this.applyGravity();
                this.finalizeTurn();
            }
        } else {
            const t1 = document.querySelector(`.pc-tile[data-r="${r1}"][data-c="${c1}"]`);
            const t2 = document.querySelector(`.pc-tile[data-r="${r2}"][data-c="${c2}"]`);
            if (t1) t1.classList.add('pc-shake');
            if (t2) t2.classList.add('pc-shake');

            await new Promise(r => setTimeout(r, 300));

            const temp2 = this.grid[r1][c1];
            this.grid[r1][c1] = this.grid[r2][c2];
            this.grid[r2][c2] = temp2;

            this.isProcessing = false;
            this.renderGrid();
        }
    },

    detonateBombs: async function (bombs, allowSpecialSpawn = false) {
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

        await new Promise(r => setTimeout(r, 320));

        this.updateScore(toClear.size * 20);
        this.turnClearedCount += toClear.size;

        toClear.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            this.grid[r][c] = null;
        });

        await this.applyGravity();

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false);
        } else {
            this.finalizeTurn();
        }
    },

    processMatches: async function (matches, allowSpecialSpawn = false) {
        if (allowSpecialSpawn) this.comboCount++;

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

        await new Promise(r => setTimeout(r, 320));

        const multiplier = allowSpecialSpawn ? this.getComboMultiplier() : 1;
        const points = matches.length * 10 * multiplier;
        this.updateScore(points);
        this.turnClearedCount += matches.length;

        if (matches.length > 0) {
            this.showScorePop(matches[0].r, matches[0].c, points);
        }

        if (allowSpecialSpawn && multiplier > 1) {
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

        await this.applyGravity();

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false);
        } else {
            this.finalizeTurn();
        }
    },

    applyGravity: async function () {
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
            await new Promise(r => setTimeout(r, 300));
        }
    },

    finalizeTurn: function () {
        if (this.isPlayerInitiatedTurn &&
            this.turnClearedCount >= 6 &&
            this.bombsSpawnedThisTurn < this.MAX_BOMBS_PER_TURN) {
            this.spawnBomb();
            this.bombsSpawnedThisTurn++;
        }
        this.isProcessing = false;
        this.turnClearedCount = 0;
        this.isPlayerInitiatedTurn = false;
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
        this.shuffleRemaining--;
        this.updateShuffleBtn();

        // Flatten, Shuffle, Reshape? Or just re-generate?
        // Let's just shuffle existing tiles to keep the set fair?
        // Actually, Random Generate is easiest and fair enough.
        this.generateGrid();
        this.renderGrid();

        // Show effect
        const gridEl = document.getElementById('pc-grid');
        gridEl.classList.add('pc-shake');
        setTimeout(() => gridEl.classList.remove('pc-shake'), 500);
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

    detonateRowBomb: async function (r, c, allowSpecialSpawn = false) {
        const toClear = new Set();
        for (let col = 0; col < this.gridSize; col++) toClear.add(`${r},${col}`);
        await this.clearTiles(toClear, 25, false);
    },

    detonateColBomb: async function (r, c, allowSpecialSpawn = false) {
        const toClear = new Set();
        for (let row = 0; row < this.gridSize; row++) toClear.add(`${row},${c}`);
        await this.clearTiles(toClear, 25, false);
    },

    useRainbow: async function (r, c, targetColor) {
        const toClear = new Set();
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === targetColor) toClear.add(`${row},${col}`);
            }
        }
        toClear.add(`${r},${c}`);
        await this.clearTiles(toClear, 30, false);
    },

    clearTiles: async function (tileSet, pointsPerTile, allowSpecialSpawn = false) {
        this.isPlayerInitiatedTurn = false;
        tileSet.forEach(str => {
            const [r, c] = str.split(',').map(Number);
            const tile = document.querySelector(`.pc-tile[data-r="${r}"][data-c="${c}"]`);
            if (tile) tile.classList.add('is-clearing');
        });

        await new Promise(r => setTimeout(r, 320));
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

        await this.applyGravity();

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.processMatches(newMatches, false);
        } else {
            this.finalizeTurn();
        }
    },

    isSpecialTile: function (r, c) {
        return this.specialTiles.includes(this.grid[r][c]);
    }
};

function goToLauncher() {
    window.location.href = "../../index.html";
}
