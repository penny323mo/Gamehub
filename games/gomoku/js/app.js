
// --- Entry Point ---

function initApp() {
    // expose global helpers for HTML buttons
    if (typeof joinRoom !== 'undefined') window.joinRoom = joinRoom;
    if (typeof createRoom !== 'undefined') window.createRoom = createRoom;
    if (typeof requestRestart !== 'undefined') window.requestRestart = requestRestart;
    if (typeof leaveRoom !== 'undefined') window.leaveRoom = leaveRoom;

    window.selectMode = selectMode;
    window.continueGame = continueGame;
    window.backToLanding = backToLanding;
    window.showView = showView;
    window.resetGame = resetGame;
    window.goToLauncher = () => window.location.href = "../../index.html";

    // Initialize UI
    const diffSelect = document.getElementById('difficulty');
    if (diffSelect) {
        diffSelect.addEventListener('change', (e) => {
            setDifficulty(e.target.value);
        });
    }

    // Default View
    showView('landing');
    更新繼續掣();

    // Attempt to restore online session
    if (window.initOnlineMode) {
        window.initOnlineMode();
    }
}

function resetGame() {
    window.cancelPendingGomokuAI?.();
    if (mode === 'online') {
        // online.js 提供嘅係 rematchGame（requestRestart 從來冇定義過，會 ReferenceError）
        if (window.rematchGame) window.rematchGame();
    } else {
        resetGameState();
        resetBoardUI();
        createBoardUI((r, c) => handleCellClick(r, c, difficulty));
        updateStatusUI('black');
        清局();   // 開新局＝放棄上一局，唔好留住個掣呃人
        更新繼續掣();
    }
}

/**
 * 上一局未完就出個「繼續上一局」——**唔會靜靜雞幫你續**。
 *
 * 同 Tower 一樣：續唔續係玩家嘅決定。撳「對 AI 對戰」就係開新局，
 * 所以嗰條路會清走舊存檔（見 `resetGame`）。
 */
function 更新繼續掣() {
    const btn = document.getElementById('gomoku-continue-btn');
    if (!btn) return;
    btn.classList.toggle('hidden', !有得繼續());
}

function continueGame() {
    window.cancelPendingGomokuAI?.();
    const j = 續局();
    if (!j) { 更新繼續掣(); return; }      // 存檔壞咗／畀人清咗：唔好扮續到
    setMode('ai');
    setIsVsAI(true);
    if (j.difficulty) {
        const sel = document.getElementById('difficulty');
        if (sel) sel.value = j.difficulty;
    }
    showView('ai-game');
    const aiResetBtn = document.getElementById('reset-btn');
    if (aiResetBtn) aiResetBtn.style.display = 'inline-block';

    resetBoardUI();
    // `createBoardUI` 入面 `resizeGomokuBoard()` 會 `drawBoard()`，而 `drawBoard`
    // 係由 `board` 整幅畫返——即係啲棋一次過畫晒。（第一版喺呢度逐格再叫
    // `placeStoneUI`，但佢自己都係叫 `drawBoard()`：畫足 226 次同一幅嘢。）
    createBoardUI((r, c) => handleCellClick(r, c, difficulty));
    updateStatusUI(currentPlayer);
    // 存嗰陣可能啱啱輪到 AI——唔叫佢行，個盤就會永遠等你落一隻唔到你落嘅棋
    if (currentPlayer === 'white') scheduleAIMove(difficulty);
}

function selectMode(selectedMode) {
    if (selectedMode !== 'ai') window.cancelPendingGomokuAI?.();
    setMode(selectedMode);

    // Toggle Buttons based on mode
    const aiResetBtn = document.getElementById('reset-btn');
    if (selectedMode === 'ai') {
        setIsVsAI(true);
        showView('ai-game');
        if (aiResetBtn) aiResetBtn.style.display = 'inline-block';
        // Auto-start game logic
        resetGame();
    } else if (selectedMode === 'online') {
        setIsVsAI(false);
        showView('online-lobby');
        if (aiResetBtn) aiResetBtn.style.display = 'none';

        // If we have a current room (restored session), show it instead of lobby
        if (window.currentRoom) {
            document.getElementById('online-lobby').classList.add('hidden');
            document.getElementById('online-room').classList.remove('hidden');
        }
    } else if (selectedMode === 'debug') {
        setIsVsAI(false);
        window.DEBUG_MODE = true;
        showView('debug-lobby');
        if (aiResetBtn) aiResetBtn.style.display = 'none';
    }
}

function showView(viewName) {
    const views = [
        'landing-page',
        'game-container',
        'ai-controls',
        'online-lobby',
        'debug-lobby',
        'online-room',
        'game-board-area'
    ];

    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    switch (viewName) {
        case 'landing':
            document.getElementById('landing-page').classList.remove('hidden');
            break;
        case 'ai-game':
            document.getElementById('game-container').classList.remove('hidden');
            document.getElementById('ai-controls').classList.remove('hidden');
            document.getElementById('game-board-area').classList.remove('hidden');
            break;
        case 'online-lobby':
            document.getElementById('game-container').classList.remove('hidden');
            document.getElementById('online-lobby').classList.remove('hidden');
            break;
        case 'debug-lobby':
            document.getElementById('game-container').classList.remove('hidden');
            document.getElementById('debug-lobby').classList.remove('hidden');
            break;
        case 'online-room':
            document.getElementById('game-container').classList.remove('hidden');
            document.getElementById('online-room').classList.remove('hidden');
            document.getElementById('game-board-area').classList.remove('hidden');
            break;
    }
}

function backToLanding() {
    window.cancelPendingGomokuAI?.();
    if (mode === 'online') {
        // If in a room, leave it（online.js 掛喺 window 嘅名係 exitFixedRoom）
        if (window.exitFixedRoom) window.exitFixedRoom();
    }
    showView('landing');
    // 由局中返選單**唔算放棄**——個掣要即刻出返，唔使等下次開頁
    更新繼續掣();
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
