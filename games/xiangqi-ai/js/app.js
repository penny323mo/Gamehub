// --- Xiangqi App Entry Point ---

function initApp() {
    // 暴露全域函數俾 HTML onClick 用
    if (typeof joinRoom !== 'undefined') window.joinRoom = joinRoom;
    if (typeof exitFixedRoom !== 'undefined') window.exitFixedRoom = exitFixedRoom;
    if (typeof toggleReady !== 'undefined') window.toggleReady = toggleReady;
    if (typeof rematchGame !== 'undefined') window.rematchGame = rematchGame;
    if (typeof resetFixedRoom !== 'undefined') window.resetFixedRoom = resetFixedRoom;

    window.selectMode = selectMode;
    window.backToLanding = backToLanding;
    window.showView = showView;
    window.goToLauncher = () => window.location.href = "../../../index.html";

    const diffSelect = document.getElementById('difficulty');
    if (diffSelect) {
        diffSelect.addEventListener('change', (e) => {
            if (window.setDifficulty) window.setDifficulty(e.target.value);
        });
    }

    const aiTimeSelect = document.getElementById('ai-time');
    if (aiTimeSelect) {
        aiTimeSelect.addEventListener('change', (e) => {
            if (window.setAiTime) window.setAiTime(parseInt(e.target.value, 10));
        });
    }

    // 預設顯示 Landing 頁面
    showView('landing');

    // 嘗試恢復線上對戰 session
    if (window.initOnlineMode) {
        window.initOnlineMode();
    }
}

function selectMode(selectedMode) {
    if (window.setMode) window.setMode(selectedMode);

    if (selectedMode === 'ai') {
        if (window.setIsVsAI) window.setIsVsAI(true);
        showView('ai-game');
        if (window.resetGame) window.resetGame();
    } else if (selectedMode === 'online') {
        if (window.setIsVsAI) window.setIsVsAI(false);
        showView('online-lobby');

        // 如果已經喺房間入面（恢復 session），直接顯示房間
        if (window.currentRoom) {
            document.getElementById('online-lobby').classList.add('hidden');
            document.getElementById('online-room').classList.remove('hidden');
        }
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
            document.getElementById('online-lobby').classList.remove('hidden');
            break;
        case 'online-room':
            document.getElementById('online-room').classList.remove('hidden');
            // game-container 會交由 online.js 的 renderRoomState 根據 playing 狀態開啟
            break;
    }

    // Resize board if visible
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}

function backToLanding() {
    if (window.mode === 'online' && window.exitFixedRoom) {
        window.exitFixedRoom();
    }
    showView('landing');
}

// 覆寫 default console warnings for Three.js
const originalWarn = console.warn;
console.warn = function (...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.WebGLRenderer:')) return;
    originalWarn.apply(console, args);
};

document.addEventListener('DOMContentLoaded', initApp);
