
import { BOARD_SIZE, board, currentPlayer, checkWin, switchTurn, getPlayerName } from './core.js';
import { placeStoneUI, updateStatusUI, updateWinUI } from './renderer.js';

export function makeAIMove(difficulty) {
    let move;
    if (difficulty === 'easy') {
        move = findEasyMove();
    } else if (difficulty === 'medium') {
        move = findMediumMove();
    } else {
        move = findBestMove();
    }

    if (move) {
        // AI places stone
        board[move.r][move.c] = currentPlayer;
        placeStoneUI(move.r, move.c, currentPlayer);

        if (checkWin(move.r, move.c, currentPlayer)) {
            updateWinUI(currentPlayer);
            return;
        }

        switchTurn();
        updateStatusUI();
    }
}

function findEasyMove() {
    let candidates = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) {
                const defenseScore = evaluatePoint(r, c, 'black');
                if (defenseScore >= 10000) return { r, c };
                candidates.push({ r, c });
            }
        }
    }
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
    return { r: 7, c: 7 };
}

function findMediumMove() {
    let allMoves = [];
    let mustBlockMoves = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) {
                const attackScore = evaluatePoint(r, c, 'white');
                const defenseScore = evaluatePoint(r, c, 'black');

                if (defenseScore >= 2000) {
                    mustBlockMoves.push({ r, c, score: defenseScore });
                }

                let totalScore = attackScore + defenseScore;
                const centerDist = Math.abs(r - 7) + Math.abs(c - 7);
                totalScore -= centerDist;
                allMoves.push({ r, c, score: totalScore });
            }
        }
    }

    if (mustBlockMoves.length > 0) {
        mustBlockMoves.sort((a, b) => b.score - a.score);
        return mustBlockMoves[0];
    }

    allMoves.sort((a, b) => b.score - a.score);
    const topN = 4;
    const poolSize = Math.min(allMoves.length, topN);

    if (poolSize > 0) {
        const randomIndex = Math.floor(Math.random() * poolSize);
        return allMoves[randomIndex];
    }
    return { r: 7, c: 7 };
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) {
                const attackScore = evaluatePoint(r, c, 'white');
                const defenseScore = evaluatePoint(r, c, 'black');
                let totalScore = attackScore + defenseScore;

                const centerDist = Math.abs(r - 7) + Math.abs(c - 7);
                totalScore -= centerDist;

                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestMoves = [{ r, c }];
                } else if (totalScore === bestScore) {
                    bestMoves.push({ r, c });
                }
            }
        }
    }

    if (bestMoves.length > 0) {
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    return { r: 7, c: 7 };
}

function evaluatePoint(row, col, player) {
    let totalScore = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dx, dy] of directions) {
        const analysis = analyzeLine(row, col, dx, dy, player);
        totalScore += getScore(analysis.count, analysis.openEnds);
    }
    return totalScore;
}

function analyzeLine(row, col, dx, dy, player) {
    let count = 0;
    let openEnds = 0;

    // Forward
    let i = 1;
    while (true) {
        const r = row + i * dx;
        const c = col + i * dy;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (board[r][c] === player) count++;
        else if (board[r][c] === null) { openEnds++; break; }
        else break;
        i++;
    }

    // Backward
    i = 1;
    while (true) {
        const r = row - i * dx;
        const c = col - i * dy;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (board[r][c] === player) count++;
        else if (board[r][c] === null) { openEnds++; break; }
        else break;
        i++;
    }

    return { count: count + 1, openEnds };
}

function getScore(count, openEnds) {
    if (openEnds === 0 && count < 5) return 0;
    switch (count) {
        case 5: return 1000000;
        case 4: return (openEnds === 2) ? 100000 : (openEnds === 1 ? 10000 : 0);
        case 3: return (openEnds === 2) ? 5000 : (openEnds === 1 ? 100 : 0);
        case 2: return (openEnds === 2) ? 50 : (openEnds === 1 ? 5 : 0);
        case 1: return (openEnds === 2) ? 5 : (openEnds === 1 ? 1 : 0);
        default: return 1000000;
    }
}
