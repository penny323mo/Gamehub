
const BOARD_SIZE = 15;
let board = [];
let currentPlayer = 'black';
let gameOver = false;
let isVsAI = true;
let difficulty = 'hard';
let mode = 'ai'; // 'ai' or 'online'

function setBoard(newBoard) { board = newBoard; }
function setCurrentPlayer(player) { currentPlayer = player; }
function setGameOver(state) { gameOver = state; }
function setIsVsAI(state) { isVsAI = state; }
function setDifficulty(diff) { difficulty = diff; }
function setMode(newMode) { mode = newMode; }

function resetGameState() {
    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        const rowArray = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            rowArray.push(null);
        }
        board.push(rowArray);
    }
    currentPlayer = 'black';
    gameOver = false;
    isVsAI = true;
}

function isBoardFull() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) return false;
        }
    }
    return true;
}

function switchTurn() {
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    return currentPlayer;
}

function getPlayerName(player) {
    return player === 'black' ? '黑子' : '白子';
}

function checkWin(row, col, player, isSimulating = false, boardState = board) {
    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal right-down
        [1, -1],  // diagonal left-down
    ];

    for (const [dx, dy] of directions) {
        const total =
            1 +
            countDirection(row, col, dx, dy, player, boardState) +
            countDirection(row, col, -dx, -dy, player, boardState);

        if (total >= 5) {
            if (!isSimulating && boardState === board) {
                gameOver = true;
            }
            return true;
        }
    }
    return false;
}

function countDirection(row, col, dx, dy, player, boardState) {
    let count = 0;
    let r = row + dx;
    let c = col + dy;

    while (
        r >= 0 && r < BOARD_SIZE &&
        c >= 0 && c < BOARD_SIZE &&
        boardState[r][c] === player
    ) {
        count++;
        r += dx;
        c += dy;
    }
    return count;
}

/**
 * Attempts to place a stone on the board.
 * @param {number} row 
 * @param {number} col 
 * @param {string} player 'black' or 'white'
 * @returns {object} { success: boolean, win: boolean }
 */
function tryPlaceStone(row, col, player) {
    if (gameOver) return { success: false, win: false };
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return { success: false, win: false };
    if (board[row][col] !== null) return { success: false, win: false };

    board[row][col] = player;

    // Check win using the existing Logic
    const win = checkWin(row, col, player);
    if (win) {
        gameOver = true;
    }

    return { success: true, win };
}

/* ------------------------------------------------------------------
 * 打到一半走咗，返嚟仲喺度
 * ------------------------------------------------------------------
 *
 * 實測：人機模式落幾手之後 refresh，**直接返咗選單，一隻棋都冇，亦冇任何
 * 提示**——存低咗嘅嘢得一個 `gomoku_clientId`（線上身分），同局棋冇關。
 *
 * 手機上面呢個唔係「你自己揀走」：切走 app 之後系統回收咗個 tab，返嚟就係
 * 咁。你落咗三十手對 Hard AI，冇咗就冇咗。
 *
 * 而呢個 repo 早就答過呢條問題——Tower 有 checkpoint ＋ 一個見得到嘅
 * Continue。呢度做嘅係將同一個做法搬過嚟。
 *
 * 存乜：成個盤、輪到邊個、難度。就係咁多——AI 冇狀態，重新開個局面就算返數。
 * 覆蓋式（唔用 `改存檔`）係啱嘅：呢個係「呢部機呢一局」嘅進度，後面嗰個就係
 * 最新——同 Tower 個 checkpoint 一樣，喺 ADR-232 個「特登 last-write-wins」名單。
 */
const 局存KEY = 'gomoku_ai_run_v1';

function 存局() {
    // 冇得存（無痕／空間滿）唔應該令你玩唔到——`safe-storage.js` 已經頂住，
    // 呢度再包一層係因為佢喺舊 build 度可能未載到。
    try {
        if (gameOver || mode !== 'ai') return;
        localStorage.setItem(局存KEY, JSON.stringify({
            v: 1, board, currentPlayer, difficulty, 時: Date.now(),
        }));
    } catch (e) { /* 記唔住就算 */ }
}

function 清局() {
    try { localStorage.removeItem(局存KEY); } catch (e) { /* 同上 */ }
}

/**
 * 讀返上一局。**壞嘅存檔要當冇**，唔可以令個掣撳落去乜都唔發生——
 * 所以逐格驗：15×15、每格只可以係 null／black／white、輪到嘅人要合法。
 */
function 讀局() {
    try {
        const raw = localStorage.getItem(局存KEY);
        if (!raw) return null;
        const j = JSON.parse(raw);
        if (!j || j.v !== 1 || !Array.isArray(j.board) || j.board.length !== BOARD_SIZE) return null;
        let 有棋 = 0;
        for (const row of j.board) {
            if (!Array.isArray(row) || row.length !== BOARD_SIZE) return null;
            for (const cell of row) {
                if (cell !== null && cell !== 'black' && cell !== 'white') return null;
                if (cell !== null) 有棋 += 1;
            }
        }
        if (!有棋) return null;                               // 空盤唔算「上一局」
        if (j.currentPlayer !== 'black' && j.currentPlayer !== 'white') return null;
        return j;
    } catch (e) { return null; }
}

/** 有冇一局值得繼續。畀 UI 決定出唔出個 Continue 掣。 */
function 有得繼續() { return 讀局() !== null; }

/** 將存檔倒返落遊戲狀態度。UI 由 caller 負責重畫。 */
function 續局() {
    const j = 讀局();
    if (!j) return null;
    board = j.board.map((r) => r.slice());
    currentPlayer = j.currentPlayer;
    gameOver = false;
    isVsAI = true;
    if (j.difficulty) difficulty = j.difficulty;
    return j;
}

/*
 * 畀瀏覽器測試查狀態嘅 seam（同 Tower `__TD`、Racing Car `__racer` 一樣）。
 * `let board` 喺 classic script 入面唔會上 `window`，而測試要分得清
 * 「storage 有嘢」同「局真係開返咗」——後者要睇遊戲自己嘅狀態。
 */
window.__gomoku = {
    get board() { return board; },
    get currentPlayer() { return currentPlayer; },
    get gameOver() { return gameOver; },
    get mode() { return mode; },
};
