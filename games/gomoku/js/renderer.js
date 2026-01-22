

const canvas = document.getElementById('gomoku-board');
const ctx = canvas.getContext('2d');
const statusElement = document.getElementById('status');
let playerTurnSpan = document.querySelector('.player-turn');
let onCellClick = null;

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

    canvas.onclick = null; // Clear previous
    canvas.onclick = (e) => {
        if (!onCellClick) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate cell size based on current canvas internal resolution
        const cellSize = canvas.width / BOARD_SIZE;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
            onCellClick(row, col);
        }
    };
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

function updateWinUI(player) {
    const pName = getPlayerName(player);
    statusElement.innerHTML = `<span class="player-turn" style="color: ${player === 'black' ? '#000' : '#888'}">${pName} 獲勝！</span>`;
    setTimeout(() => alert(pName + " 獲勝！"), 10); // Optional alert
}
