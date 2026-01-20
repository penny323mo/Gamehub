
import { BOARD_SIZE, currentPlayer, getPlayerName, board } from './core.js';

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
let playerTurnSpan = document.querySelector('.player-turn');

export function createBoardUI(handleCellClick) {
    boardElement.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));
            boardElement.appendChild(cell);
        }
    }
}

export function resetBoardUI() {
    const cells = document.querySelectorAll('.cell');
    if (cells.length === 0) {
        // Created by createBoardUI
    } else {
        cells.forEach(cell => {
            cell.innerHTML = '';
        });
    }
    updateStatusUI('black'); // Reset to Black
}

export function placeStoneUI(row, col, player) {
    // Determine player if not passed, but better to pass it for explicit sync
    const p = player || currentPlayer;
    const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    if (cell && !cell.querySelector('.stone')) {
        const stone = document.createElement('div');
        stone.classList.add('stone', p);
        cell.appendChild(stone);
    }
}

export function updateStatusUI(player, customMessage = null) {
    if (customMessage) {
        statusElement.innerHTML = customMessage;
        playerTurnSpan = document.querySelector('.player-turn');
        return;
    }

    const p = player || currentPlayer;
    const pName = getPlayerName(p);

    // We can just update text if span exists, or rebuild
    statusElement.innerHTML = `當前回合：<span class="player-turn" style="color: ${p === 'black' ? '#000' : '#888'}">${pName}</span>`;
    playerTurnSpan = document.querySelector('.player-turn');
}

export function updateWinUI(player) {
    const pName = getPlayerName(player);
    statusElement.innerHTML = `<span class="player-turn" style="color: ${player === 'black' ? '#000' : '#888'}">${pName} 獲勝！</span>`;
    setTimeout(() => alert(pName + " 獲勝！"), 10);
}
