
// --- Entry Point ---

function initApp() {
    // expose global helpers for HTML buttons
    if (typeof joinRoom !== 'undefined') window.joinRoom = joinRoom;
    if (typeof createRoom !== 'undefined') window.createRoom = createRoom;
    if (typeof requestRestart !== 'undefined') window.requestRestart = requestRestart;
    if (typeof leaveRoom !== 'undefined') window.leaveRoom = leaveRoom;

    window.selectMode = selectMode;
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

    // Attempt to restore online session
    if (window.initOnlineMode) {
        window.initOnlineMode();
    }
}

function resetGame() {
    if (mode === 'online') {
        requestRestart();
    } else {
        resetGameState();
        resetBoardUI();
        createBoardUI((r, c) => handleCellClick(r, c, difficulty));
        updateStatusUI('black');
    }
}

function selectMode(selectedMode) {
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
    if (mode === 'online') {
        // If in a room, leave it
        if (window.exitRoom) window.exitRoom();
    }
    showView('landing');
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
