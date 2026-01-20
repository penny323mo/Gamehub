
import { board, currentPlayer, gameOver, isVsAI, switchTurn, checkWin } from './core.js';
import { placeStoneUI, updateWinUI, updateStatusUI } from './renderer.js';
import { makeAIMove } from './ai.js';
import { mode, playerRole, broadcastMove, roomId } from './online.js';

export function handleCellClick(row, col, difficulty) {
    if (gameOver) return;

    // --- Online Mode ---
    if (mode === 'online') {
        if (!roomId || !playerRole || (playerRole !== 'black' && playerRole !== 'white')) return;
        if (currentPlayer !== playerRole) return;
        if (board[row][col] !== null) return;

        // Optimistic Update
        board[row][col] = playerRole; // Update State
        placeStoneUI(row, col, playerRole); // Update UI

        // Broadcast
        broadcastMove(row, col, playerRole);
        return;
    }

    // --- AI Mode ---
    if (board[row][col] !== null) return;
    if (isVsAI && currentPlayer === 'white') return; // AI Turn

    // Player Move
    board[row][col] = currentPlayer;
    placeStoneUI(row, col, currentPlayer);

    if (checkWin(row, col, currentPlayer)) {
        updateWinUI(currentPlayer);
        return;
    }

    switchTurn();
    updateStatusUI();

    // AI Response
    if (isVsAI && currentPlayer === 'white' && !gameOver) {
        setTimeout(() => makeAIMove(difficulty), 500);
    }
}
