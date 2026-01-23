
function handleCellClick(row, col, difficulty) {
    if (gameOver) return;

    // --- Online Mode ---
    if (mode === 'online') {
        if (!window.isGameReady) return; // Block input if waiting
        if (!roomId || !playerRole || (playerRole !== 'black' && playerRole !== 'white')) return;
        // Strict turn check
        if (currentPlayer !== playerRole) return;

        // Attempt local move (Optimistic)
        const result = tryPlaceStone(row, col, playerRole);
        if (!result.success) return; // Invalid move or occupied

        // Valid move: Update UI immediately
        placeStoneUI(row, col, playerRole);

        if (result.win) {
            updateWinUI(playerRole);
            // handleOnlineMove will send status='finished'
            handleOnlineMove(row, col, true, playerRole);
        } else {
            // Optimistic Turn Switch
            switchTurn();
            updateStatusUI();

            // Sync with DB
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
