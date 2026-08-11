

const canvas = document.getElementById('gomoku-board');
const ctx = canvas.getContext('2d');
const statusElement = document.getElementById('status');
let playerTurnSpan = document.querySelector('.player-turn');
let onCellClick = null;
// Keep track of the current board interaction handler so we can remove it
// before adding a new one (prevents duplicate listeners on re-entry or rematch).
let _boardHandler = null;
let _touchStartHandler = null;
let _touchMoveHandler = null;
let _touchEndHandler = null;
let _touchCancelHandler = null;
let _touchGesture = null;
let _suppressSyntheticClick = false;

// App switches and backgrounding are not guaranteed to deliver touchcancel.
// Clear the pending tap there as well, so a late touchend cannot place a stone
// after the player has already left the game.
function cancelBoardTouchGesture() {
    _touchGesture = null;
    _suppressSyntheticClick = false;
}

window.addEventListener('blur', cancelBoardTouchGesture);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelBoardTouchGesture();
});
canvas.addEventListener('pointercancel', cancelBoardTouchGesture);

// Star points for 15x15 board (0-indexed)
const STAR_POINTS = [
    { r: 3, c: 3 }, { r: 3, c: 11 },
    { r: 7, c: 7 },
    { r: 11, c: 3 }, { r: 11, c: 11 }
];

function createBoardUI(handleCellClick) {
    onCellClick = handleCellClick;

    // Initial resize and draw
    resizeGomokuBoard();

    // Add event listeners (ensure we don't duplicate if called multiple times)
    window.removeEventListener('resize', resizeGomokuBoard);
    window.addEventListener('resize', resizeGomokuBoard);

    const handleClientPoint = (clientX, clientY) => {
        if (!onCellClick) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Important: rect.width might not exactly match canvas.width due to DPR or sub-pixel rendering.
        // We map coordinate (x/rect.width) to grid index (0..BOARD_SIZE).

        const cellWidth = rect.width / BOARD_SIZE;
        const cellHeight = rect.height / BOARD_SIZE;

        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
            onCellClick(row, col);
        }
    };

    const clickHandler = (e) => {
        if (_suppressSyntheticClick) {
            _suppressSyntheticClick = false;
            return;
        }
        handleClientPoint(e.clientX, e.clientY);
    };

    // Do not commit a mobile move on touchstart. A finger can start a scroll,
    // be interrupted by the app switcher, or turn into a multi-touch gesture;
    // all of those must leave the board unchanged. Commit only an unmoved
    // touchend, and suppress the delayed synthetic click that follows it.
    const findActiveTouch = (event, identifier) => {
        const touches = [
            ...Array.from(event.changedTouches ?? []),
            ...Array.from(event.touches ?? []),
        ];
        return touches.find((touch) => touch.identifier === identifier) ?? null;
    };
    const touchStartHandler = (e) => {
        if (e.touches.length !== 1) {
            _touchGesture = null;
            return;
        }
        if (!onCellClick || _touchGesture) return;
        e.preventDefault();
        const touch = e.touches[0];
        _touchGesture = {
            identifier: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            moved: false,
        };
    };
    const touchMoveHandler = (e) => {
        if (!_touchGesture) return;
        if (e.touches.length > 1) {
            _touchGesture = null;
            return;
        }
        const touch = findActiveTouch(e, _touchGesture.identifier);
        if (!touch) return;
        if (Math.hypot(touch.clientX - _touchGesture.startX, touch.clientY - _touchGesture.startY) > 10) {
            _touchGesture.moved = true;
        }
        e.preventDefault();
    };
    const touchEndHandler = (e) => {
        if (!_touchGesture) return;
        const gesture = _touchGesture;
        const touch = findActiveTouch(e, gesture.identifier);
        _touchGesture = null;
        if (!touch || gesture.moved || e.touches.length > 0) return;
        e.preventDefault();
        _suppressSyntheticClick = true;
        window.setTimeout(() => { _suppressSyntheticClick = false; }, 700);
        handleClientPoint(touch.clientX, touch.clientY);
    };
    const touchCancelHandler = cancelBoardTouchGesture;

    // Remove previous handler before adding the new one to prevent stacking
    // when createBoardUI is called again on rematch or room re-entry.
    if (_boardHandler) {
        canvas.removeEventListener('click', _boardHandler);
    }
    if (_touchStartHandler) canvas.removeEventListener('touchstart', _touchStartHandler);
    if (_touchMoveHandler) canvas.removeEventListener('touchmove', _touchMoveHandler);
    if (_touchEndHandler) canvas.removeEventListener('touchend', _touchEndHandler);
    if (_touchCancelHandler) canvas.removeEventListener('touchcancel', _touchCancelHandler);
    _boardHandler = clickHandler;
    _touchStartHandler = touchStartHandler;
    _touchMoveHandler = touchMoveHandler;
    _touchEndHandler = touchEndHandler;
    _touchCancelHandler = touchCancelHandler;

    canvas.addEventListener('click', clickHandler);
    canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
    canvas.addEventListener('touchend', touchEndHandler, { passive: false });
    canvas.addEventListener('touchcancel', touchCancelHandler, { passive: true });
}

function resizeGomokuBoard() {
    // Force canvas resolution to match display size for sharp rendering
    // and ensuring square aspect ratio
    const displayWidth = canvas.clientWidth;

    // Set internal resolution
    canvas.width = displayWidth;
    canvas.height = displayWidth; // Force square

    drawBoard();
}

function drawBoard() {
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellSize = w / BOARD_SIZE;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw Background
    ctx.fillStyle = '#1e293b'; // var(--board-bg)
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = '#475569'; // var(--board-lines)
    ctx.lineWidth = 1;
    ctx.beginPath();

    // We draw lines through the CENTER of cells
    // Cell 0 center is at cellSize/2
    const halfCell = cellSize / 2;

    for (let i = 0; i < BOARD_SIZE; i++) {
        const pos = halfCell + i * cellSize;

        // Horizontal
        ctx.moveTo(halfCell, pos);
        ctx.lineTo(w - halfCell, pos);

        // Vertical
        ctx.moveTo(pos, halfCell);
        ctx.lineTo(pos, h - halfCell);
    }
    ctx.stroke();

    // Draw Star Points
    ctx.fillStyle = '#475569';
    STAR_POINTS.forEach(p => {
        const cx = halfCell + p.c * cellSize;
        const cy = halfCell + p.r * cellSize;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Stones
    if (typeof board !== 'undefined') {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c]) {
                    drawStone(r, c, board[r][c], cellSize);
                }
            }
        }
    }
}

function drawStone(r, c, type, cellSize) {
    const halfCell = cellSize / 2;
    const cx = halfCell + c * cellSize;
    const cy = halfCell + r * cellSize;
    const radius = (cellSize * 0.85) / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    // Gradient for 3D look
    const grad = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, radius * 0.1,
        cx, cy, radius
    );

    if (type === 'black') {
        grad.addColorStop(0, '#666');
        grad.addColorStop(1, '#000');
    } else {
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#dcdcdc');
    }

    ctx.fillStyle = grad;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function resetBoardUI() {
    drawBoard();
    updateStatusUI('black');
}

function placeStoneUI(row, col, player) {
    // We can just redraw the specific stone or the whole board
    // Redrawing whole board is safer to keep layers correct and simple
    drawBoard();
}

function updateStatusUI(player, customMessage = null) {
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

function updateDrawUI() {
    gameOver = true;
    清局();
    statusElement.innerHTML = '<span class="player-turn">和棋！棋盤已滿</span>';
    setTimeout(() => alert('和棋！棋盤已滿'), 10);
}

function updateWinUI(player) {
    清局();
    const pName = getPlayerName(player);
    statusElement.innerHTML = `<span class="player-turn" style="color: ${player === 'black' ? '#000' : '#888'}">${pName} 獲勝！</span>`;
    setTimeout(() => alert(pName + " 獲勝！"), 10); // Optional alert
}
