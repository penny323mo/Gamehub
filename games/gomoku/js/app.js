
import { resetGameState, difficulty, setDifficulty, isVsAI, setIsVsAI } from './core.js';
import { createBoardUI, resetBoardUI, updateStatusUI } from './renderer.js';
import { handleCellClick } from './input.js';
import { joinRoom, startOnlineGame, leaveRoom, setMode, mode } from './online.js';

// --- Entry Point ---

function initApp() {
    // expose global helpers for HTML buttons (legacy support or ease of use)
    window.joinRoom = joinRoom;
    window.startOnlineGame = startOnlineGame;
    window.leaveRoom = leaveRoom;
    window.selectMode = selectMode;
    window.backToLanding = backToLanding;
    window.showView = showView;
    window.resetGame = resetGame;
    window.toggleModeSelection = toggleModeSelection;
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
    resetGameState();
    resetBoardUI();
    if (mode === 'online') {
        startOnlineGame();
    } else {
        createBoardUI((r, c) => handleCellClick(r, c, difficulty));
        updateStatusUI('black');
    }
}

function selectMode(selectedMode) {
    setMode(selectedMode);
    if (selectedMode === 'ai') {
        setIsVsAI(true);
        showView('ai-game');
        createBoardUI((r, c) => handleCellClick(r, c, difficulty));
        updateStatusUI('black');
    } else if (selectedMode === 'online') {
        setIsVsAI(false);
        showView('online-lobby');
    }
}

function showView(viewName) {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('ai-controls').classList.add('hidden');
    document.getElementById('online-lobby').classList.add('hidden');
    document.getElementById('online-room').classList.add('hidden');
    document.getElementById('game-board-area').classList.add('hidden');
    document.getElementById('mode-selection').classList.add('hidden');

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

function toggleModeSelection() {
    document.getElementById('mode-selection').classList.remove('hidden');
}

function backToLanding() {
    if (mode === 'online') {
        leaveRoom();
    }
    showView('landing');
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
