
function handleCellClick(row, col, difficulty) {
    if (gameOver) return;

    // --- Online Mode ---
    if (mode === 'online') {
        if (!roomId || !playerRole || (playerRole !== 'black' && playerRole !== 'white')) return;
        // Strict turn check
        if (currentPlayer !== playerRole) return;
        if (board[row][col] !== null) return;

        // Optimistic Update
        board[row][col] = playerRole; // Update State
        placeStoneUI(row, col, playerRole); // Update UI

        // Check Win Locally
        const won = checkWin(row, col, playerRole);

        if (won) {
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
    if (board[row][col] !== null) return;
    if (isVsAI && currentPlayer === 'white') return; // AI Turn

    // Player Move
    board[row][col] = currentPlayer;
    placeStoneUI(row, col, currentPlayer);

    if (checkWin(row, col, currentPlayer)) {
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
