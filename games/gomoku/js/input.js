
function handleCellClick(row, col, difficulty) {
    // --- ENHANCED DEBUG: Always log click attempts with FULL state ---
    const room = window.currentRoom;
    const blockedReason = [];

    // Collect all block reasons for diagnosis
    if (gameOver) blockedReason.push('gameOver');
    if (mode === 'online') {
        if (!window.isGameReady) blockedReason.push('isGameReady=false');
        if (!room) blockedReason.push('no_room');
        else if (room.status !== 'playing') blockedReason.push('status=' + room.status);
        if (!roomId) blockedReason.push('roomId_missing');
        if (!playerRole) blockedReason.push('playerRole_missing');
        if (currentPlayer !== playerRole) blockedReason.push('not_my_turn');
    }

    console.log('[CLICK]', {
        row, col,
        myColor: playerRole,
        mode,
        roomStatus: room?.status,
        current_turn: room?.current_player || currentPlayer,
        turn_expires_at: room?.turn_deadline_at,
        blocked_reason: blockedReason.length > 0 ? blockedReason.join(', ') : 'NONE',
        isGameReady: window.isGameReady,
        round_id: room?.round_id
    });

    if (gameOver) {
        console.log('[CLICK] BLOCKED: gameOver');
        return;
    }

    // --- Online Mode ---
    if (mode === 'online') {
        // Guard 1: Ready?
        if (!window.isGameReady) {
            console.log('[CLICK] BLOCKED: isGameReady=false');
            return;
        }

        // Guard 2: Room exists?
        if (!room) {
            console.log('[CLICK] BLOCKED: no room');
            return;
        }

        // Guard 3: Status = playing?
        if (room.status !== 'playing') {
            console.log('[CLICK] BLOCKED: status=' + room.status);
            return;
        }

        // Guard 4: My Turn? (Use DB's current_player as authority)
        const dbCurrentTurn = room.current_player;
        if (!roomId || !playerRole) {
            console.log('[CLICK] BLOCKED: roomId/playerRole missing');
            return;
        }
        if (dbCurrentTurn !== playerRole) {
            console.log('[CLICK] BLOCKED: not_my_turn (db_turn=' + dbCurrentTurn + ', me=' + playerRole + ')');
            return;
        }

        // Attempt local move
        const result = tryPlaceStone(row, col, playerRole);
        if (!result.success) {
            console.log('[CLICK] BLOCKED: tryPlaceStone failed (occupied?)');
            return;
        }

        console.log('[CLICK] ACCEPTED: Move at (' + row + ',' + col + ') by ' + playerRole);

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
