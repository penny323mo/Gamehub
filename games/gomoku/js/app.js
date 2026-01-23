
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
}

function resetGame() {
    if (mode === 'online') {
        // Should not be called via the main button, as it's hidden
        // But if mapped, treat as requestRestart
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
    }
}

function showView(viewName) {
    const views = [
        'landing-page',
        'game-container',
        'ai-controls',
        'online-lobby',
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
        if (window.leaveRoom) window.leaveRoom(); // Helper provided by online.js usually? 
        // Note: online.js defines global leaveRoom. 
        // But if we are just in Lobby, logic might differ.
        // online.js `leaveRoom` handles partial state resets.
    }
    showView('landing');
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
