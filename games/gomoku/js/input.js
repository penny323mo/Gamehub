
function handleCellClick(row, col, difficulty) {
    if (gameOver) return;

    // --- Online Mode ---
    if (mode === 'online') {
        // Triple Guard
        // 1. Ready? (Defined as players >= 2 && Room Status is playing/paused)
        if (!window.isGameReady) return;

        // 2. Locked? (Paused, Finished, or waiting) - online.js updates this global `boardLocked`?
        // Note: online.js isn't exporting boardLocked directly to window, but we can check the element or just use status.
        // Let's rely on window.currentRoom.status
        const room = window.currentRoom;
        if (!room) return;

        // Check "Paused" or "Finished" via status
        if (room.status !== 'playing') return;

        // 3. My Turn?
        if (!roomId || !playerRole) return;
        if (currentPlayer !== playerRole) return;

        // Attempt local move
        const result = tryPlaceStone(row, col, playerRole);
        if (!result.success) return;

        // Update UI
        placeStoneUI(row, col, playerRole);

        if (result.win) {
            updateWinUI(playerRole);
            handleOnlineMove(row, col, true, playerRole);
        } else {
            switchTurn();
            updateStatusUI();
            handleOnlineMove(row, col, false, null);
        }
        return;
    }

    // --- AI Mode ---
    if (isVsAI && currentPlayer === 'white') return; // AI Turn

    // Player Move
    const result = tryPlaceStone(row, col, currentPlayer);
    if (!result.success) return; // Occupied or invalid

    placeStoneUI(row, col, currentPlayer);

    if (result.win) {
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
