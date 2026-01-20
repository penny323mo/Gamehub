
export const BOARD_SIZE = 15;
export let board = [];
export let currentPlayer = 'black';
export let gameOver = false;
export let isVsAI = true;
export let difficulty = 'hard';

export function setBoard(newBoard) { board = newBoard; }
export function setCurrentPlayer(player) { currentPlayer = player; }
export function setGameOver(state) { gameOver = state; }
export function setIsVsAI(state) { isVsAI = state; }
export function setDifficulty(diff) { difficulty = diff; }

export function resetGameState() {
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

export function switchTurn() {
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    return currentPlayer;
}

export function getPlayerName(player) {
    return player === 'black' ? '黑子' : '白子';
}

export function checkWin(row, col, player, isSimulating = false, boardState = board) {
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
