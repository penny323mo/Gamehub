
function handleCellClick(row, col, difficulty) {
    // --- DEBUG: Always log click attempts ---
    const room = window.currentRoom;
    console.log('[ClickDebug]', {
        row, col,
        mode,
        playerRole,
        currentPlayer,
        roomStatus: room?.status,
        isGameReady: window.isGameReady,
        roomId,
        gameOver
    });

    if (gameOver) {
        console.log('[ClickDebug] Blocked: gameOver');
        return;
    }

    // --- Online Mode ---
    if (mode === 'online') {
        // Guard 1: Ready?
        if (!window.isGameReady) {
            console.log('[ClickDebug] Blocked: isGameReady=false');
            return;
        }

        // Guard 2: Room exists?
        if (!room) {
            console.log('[ClickDebug] Blocked: no room');
            return;
        }

        // Guard 3: Status = playing?
        if (room.status !== 'playing') {
            console.log('[ClickDebug] Blocked: status=' + room.status);
            return;
        }

        // Guard 4: My Turn?
        if (!roomId || !playerRole) {
            console.log('[ClickDebug] Blocked: roomId/playerRole missing');
            return;
        }
        if (currentPlayer !== playerRole) {
            console.log('[ClickDebug] Blocked: not_my_turn (current=' + currentPlayer + ', me=' + playerRole + ')');
            return;
        }

        // Attempt local move
        const result = tryPlaceStone(row, col, playerRole);
        if (!result.success) {
            console.log('[ClickDebug] Blocked: tryPlaceStone failed (occupied?)');
            return;
        }

        console.log('[ClickDebug] Move accepted, updating...');

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
