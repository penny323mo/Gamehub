// =============================================================================
// Gomoku Online Mode (DB-Driven / Fixed Rooms)
// =============================================================================
// key philosophy: DB is the single source of truth. Realtime is just for speed.
// Fallback to polling if realtime fails.

const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// Global State
let sbClient = null;
let roomId = null;      // "ROOM01", "ROOM02", "ROOM03"
let roomRecord = null;  // The full DB row object
let playerRole = null;  // "black", "white", "spectator"
let clientId = localStorage.getItem('gomoku_clientId');

let roomChannel = null;
let pollingInterval = null;
let heartbeatInterval = null;
let timerInterval = null;
let isPolling = false;

// Config
const POLLING_INTERVAL_MS = 800;
const HEARTBEAT_INTERVAL_MS = 3000;  // Update last_activity every 3s
const STALE_THRESHOLD_MS = 10000;    // 10s inactivity -> cleanup
const TURN_LIMIT_SEC = 30;

// Init Client ID
if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('gomoku_clientId', clientId);
}

// =============================================================================
// 1. Initialization
// =============================================================================

async function initOnlineMode() {
    // Initialize Supabase
    if (window.supabase) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { persistSession: false }
        });
        window.sbClient = sbClient;
        console.log("[Online] Supabase Initialized");
    } else {
        console.error("[Online] Supabase SDK missing!");
        return;
    }

    // Bind Global Functions for HTML
    window.joinFixedRoom = joinFixedRoom;
    window.resetDebugRoom = resetDebugRoom; // Keep debug reset for manual fixes
    window.exitRoom = exitRoom;
    window.requestRestart = requestRestart; // Actually "Reset Room" for finished games

    // Refresh Room List UI periodically (Simple polling for lobby)
    setInterval(updateLobbyStatus, 3000);
    updateLobbyStatus();
}

async function updateLobbyStatus() {
    if (!sbClient || document.getElementById('online-lobby').classList.contains('hidden')) return;

    const { data: rooms, error } = await sbClient
        .from("Gomoku's rooms")
        .select('room_code, status, black_player_id, white_player_id')
        .in('room_code', ['ROOM01', 'ROOM02', 'ROOM03']);

    if (error) return;

    rooms.forEach(room => {
        const statusEl = document.getElementById(`room-status-${room.room_code}`);
        const playersEl = document.getElementById(`room-players-${room.room_code}`);
        const joinBtn = document.getElementById(`room-join-${room.room_code}`);

        if (statusEl) {
            let statusText = '閒置';
            if (room.status === 'playing') statusText = '對戰中';
            if (room.status === 'finished') statusText = '已結束';
            statusEl.innerText = statusText;
            statusEl.className = `room-status ${room.status}`;
        }

        if (playersEl) {
            const b = room.black_player_id ? '有人' : '-';
            const w = room.white_player_id ? '有人' : '-';
            playersEl.innerText = `⚫ ${b} / ⚪ ${w}`;
        }

        if (joinBtn) {
            // Disable if full (both taken) and I'm not one of them
            const isFull = room.black_player_id && room.white_player_id;
            const amIIn = room.black_player_id === clientId || room.white_player_id === clientId;

            // Allow joining if full ONLY if I am one of the players (re-join)
            // Otherwise disable
            if (isFull && !amIIn) {
                joinBtn.disabled = true;
                joinBtn.innerText = "滿員";
            } else {
                joinBtn.disabled = false;
                joinBtn.innerText = "加入";
            }
        }
    });
}

// =============================================================================
// 2. Joining Room
// =============================================================================

async function joinFixedRoom(targetRoomId) {
    if (!sbClient) return;

    console.log(`[Online] Joining ${targetRoomId}...`);

    // 1. Fetch Room State (Atomic Check)
    const { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', targetRoomId)
        .single();

    if (error || !room) {
        alert("房間不存在或網絡錯誤");
        return;
    }

    // 2. Determine Role & Seat
    let role = 'spectator';
    let updates = {};
    let needsUpdate = false;

    // Logic: First come -> Black, Second -> White
    // If I am already recorded, keep role
    if (room.black_player_id === clientId) {
        role = 'black';
    } else if (room.white_player_id === clientId) {
        role = 'white';
    } else {
        // Assign new seat
        if (!room.black_player_id) {
            role = 'black';
            updates.black_player_id = clientId;
            updates.last_activity_at = new Date();
            needsUpdate = true;
        } else if (!room.white_player_id) {
            role = 'white';
            updates.white_player_id = clientId;
            updates.last_activity_at = new Date();

            // If black is already there, start game immediately
            if (room.black_player_id) {
                updates.status = 'playing';
                updates.current_player = 'black'; // Black always starts
                updates.turn_deadline_at = new Date(Date.now() + TURN_LIMIT_SEC * 1000);
            }
            needsUpdate = true;
        } else {
            alert("房間已滿！");
            return;
        }
    }

    // 3. Update DB if taking a seat
    if (needsUpdate) {
        const { error: updateError } = await sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id);

        if (updateError) {
            console.error("Take seat failed:", updateError);
            alert("加入失敗，請重試");
            return;
        }
    }

    // 4. Enter Room (Local Setup)
    enterRoom(targetRoomId, role);
}

async function enterRoom(code, role) {
    roomId = code;
    playerRole = role;

    // UI Switch
    setMode('online');
    setIsVsAI(false);

    document.getElementById('online-lobby').classList.add('hidden');
    document.getElementById('online-room').classList.remove('hidden');
    document.getElementById('game-board-area').classList.remove('hidden');

    // Update Header info
    document.getElementById('current-room-id').innerText = code;
    const roleText = role === 'black' ? '黑子 (先手)' : (role === 'white' ? '白子' : '觀戰者');
    document.getElementById('my-role').innerText = roleText;

    // Start Processes
    startHeartbeat();
    await syncRoomState(); // Initial Full Sync
    subscribeToUpdates();  // Realtime
}

// =============================================================================
// 3. Synchronization (The Core)
// =============================================================================

function createEmptyBoard() {
    // Reset global board array (defined in core.js)
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

async function syncRoomState() {
    if (!roomId || !sbClient) return;

    // A. Fetch Room Data
    const { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', roomId)
        .single();

    if (error || !room) return;
    roomRecord = room; // Source of Truth

    // B. Rebuild Board from Moves
    const { data: moves, error: movesError } = await sbClient
        .from('moves')
        .select('*')
        .eq('room_id', room.id)
        .order('move_no', { ascending: true });

    if (!movesError) {
        rebuildBoard(moves);
    }

    // C. Update UI based on Room Status
    updateUIFromRoomState(room);
}

function rebuildBoard(moves) {
    // 1. Reset Local Board
    createEmptyBoard(); // reset global board[][]
    resetBoardUI();     // clear canvas

    // 2. Replay all moves
    if (moves && moves.length > 0) {
        moves.forEach(m => {
            board[m.x][m.y] = (m.color === 'black' ? 1 : 2);
            drawPiece(m.x, m.y, (m.color === 'black' ? 1 : 2));
            lastMove = { row: m.x, col: m.y }; // Update last move marker
        });
        // Redraw last move marker
        if (lastMove) highlightLastMove(lastMove.row, lastMove.col);
    }
}

function updateUIFromRoomState(room) {
    // 1. Turn & Status
    const statusEl = document.getElementById('status');
    const timerEl = document.getElementById('game-timer');
    const boardCover = document.getElementById('boardLock');

    // Default locked
    let isLocked = true;

    if (room.status === 'playing') {
        // Unlock only if it's my turn
        if (room.current_player === playerRole) {
            isLocked = false;
            statusEl.innerHTML = `<span style="color:var(--neon-green)">輪到你了！</span>`;
        } else {
            statusEl.innerHTML = `等待對手...`;
        }

        // Timer Sync
        if (room.turn_expires_at) {
            const deadline = new Date(room.turn_expires_at).getTime();
            startTimer(deadline);
        }

        // Check for Timeout LOCALLY (trigger DB update if needed)
        checkTimeout(room);

    } else if (room.status === 'finished') {
        const winnerText = room.winner === 'black' ? "黑子" : "白子";
        let reasonText = "";
        if (room.ended_reason === 'timeout') reasonText = " (超時)";

        statusEl.innerHTML = `<span style="color:var(--neon-red)">遊戲結束 - ${winnerText}勝${reasonText}</span>`;
        stopTimer();

        // Show Restart Button
        document.getElementById('online-restart-btn').classList.remove('hidden');
    } else if (room.status === 'waiting') {
        statusEl.innerHTML = `等待對手加入...`;
        stopTimer();
        document.getElementById('online-restart-btn').classList.add('hidden');
    }

    // Apply Lock
    // Spectators always locked
    if (playerRole === 'spectator') isLocked = true;

    // Apply visual lock
    if (boardCover) {
        boardCover.style.display = isLocked ? 'block' : 'none';
        boardCover.style.cursor = isLocked ? 'not-allowed' : 'default';
    }
}

// Timer Logic
function startTimer(deadlineMs) {
    if (timerInterval) clearInterval(timerInterval);

    const update = () => {
        const now = Date.now();
        const diff = Math.ceil((deadlineMs - now) / 1000);
        const display = document.getElementById('game-timer');

        if (display) {
            display.innerText = diff > 0 ? diff : 0;
            if (diff <= 5) display.classList.add('timer-warning');
            else display.classList.remove('timer-warning');
        }

        if (diff <= 0) {
            clearInterval(timerInterval);
            // Trigger Timeout in DB (if I am the one playing or host)
            // Ideally, whoever detects it first updates it.
            handleTimeoutTrigger();
        }
    };

    update();
    timerInterval = setInterval(update, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const display = document.getElementById('game-timer');
    if (display) display.innerText = "--";
}

async function handleTimeoutTrigger() {
    // CAS Update: Only set finished if still playing and time passed
    if (!roomRecord || roomRecord.status !== 'playing') return;

    const winner = roomRecord.current_player === 'black' ? 'white' : 'black';

    await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'finished',
            winner: winner,
            winner_color: winner,
            ended_reason: 'timeout',
            last_activity_at: new Date()
        })
        .eq('id', roomRecord.id)
        .eq('status', 'playing'); // Safety check
}


function checkTimeout(room) {
    if (room.status !== 'playing' || !room.turn_expires_at) return;
    const now = Date.now();
    const deadline = new Date(room.turn_expires_at).getTime();

    // If deadline passed > 2s ago (grace period), force update
    if (now > deadline + 2000) {
        handleTimeoutTrigger();
    }
}


// =============================================================================
// 4. Realtime & Polling Fallback
// =============================================================================

function subscribeToRoom() {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    const channelId = `room-${roomId}`;

    // Setup Fallback Polling (Start initially, stop when RT works)
    startPolling();

    roomChannel = sbClient.channel(channelId)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: "Gomoku's rooms", filter: `room_code=eq.${roomId}` },
            (payload) => {
                console.log('[RT] Room Update:', payload);
                // Stop polling if RT is alive
                stopPolling();
                syncRoomState();
            }
        )
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'moves', filter: `room_id=eq.${roomRecord?.id}` },
            (payload) => {
                console.log('[RT] New Move:', payload);
                stopPolling();
                syncRoomState();
            }
        )
        .subscribe((status) => {
            console.log('[RT] Status:', status);
            if (status === 'SUBSCRIBED') {
                // RT Connected
            } else {
                // RT Failed/Disconnected -> Polling continues
                startPolling();
            }
        });
}

function startPolling() {
    if (isPolling) return;
    console.log('[Poll] Starting Fallback Polling...');
    isPolling = true;

    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
        // Quick check
        await syncRoomState();
    }, POLLING_INTERVAL_MS);
}

function stopPolling() {
    if (!isPolling) return;
    // Don't actually stop fully, just slow down or keep as safety net?
    // User asked: "3秒內訂閱未 SUBSCRIBED... 啟動 fallback"
    // And "一旦 realtime 恢復可停止 polling"
    console.log('[Poll] Realtime active, stopping fallback.');
    isPolling = false;
    clearInterval(pollingInterval);
    pollingInterval = null;
}


// =============================================================================
// 5. Game Actions (Atomic)
// =============================================================================

// Hook into existing Input.js handler
// We will override the global `handleCellClick` or ensure Input.js calls THIS function for online
async function tryPlaceStone(row, col, role) {
    if (!roomRecord) return { success: false };
    if (roomRecord.status !== 'playing') return { success: false };
    if (roomRecord.current_player !== role) return { success: false };
    if (board[row][col] !== 0) return { success: false };

    // 1. Optimistic UI Update ? 
    // User requested "DB 真相", no optimistic for "Opponent must see update".
    // ACTUALLY: "對方必須即刻見到" implies speed.
    // Spec: "UI 必須完全由 rooms+moves 重建，唔可以依賴「本地曾經係咩狀態」"
    // So NO optimistic local render. Wait for Update.

    // 2. Insert Move
    // Get next move number
    const { count } = await sbClient.from('moves').select('*', { count: 'exact', head: true }).eq('room_id', roomRecord.id);
    const nextMoveNo = (count || 0) + 1;

    // 3. Insert Move Record
    const { error: moveError } = await sbClient
        .from('moves')
        .insert([{
            room_id: roomRecord.id,
            move_no: nextMoveNo,
            x: row,
            y: col,
            color: role
        }]);

    if (moveError) {
        console.error("Move Insert Failed:", moveError);
        return { success: false };
    }

    // 4. Conditional Room Update (Pass Turn)
    const nextPlayer = role === 'black' ? 'white' : 'black';
    const { error: roomError, data: updated } = await sbClient
        .from("Gomoku's rooms")
        .update({
            current_player: nextPlayer,
            last_move_at: new Date(),
            turn_deadline_at: new Date(Date.now() + TURN_LIMIT_SEC * 1000),
            last_activity_at: new Date()
        })
        .eq('id', roomRecord.id)
        .eq('current_player', role) // Condition: Turn must still be mine
        .select();

    if (roomError || !updated || updated.length === 0) {
        console.warn("Room Update Failed (Race Condition or Timeout)");
        // Re-sync to see what happened
        syncRoomState();
        return { success: false };
    }

    // Success.
    console.log("Move Committed. Waiting for Sync...");
    // Force immediate sync to update UI for myself instead of waiting for RT
    syncRoomState();
    return { success: true };
}

// Hook for Input.js
// We replace the global logic. 
// input.js calls `tryPlaceStone` ? No, input.js calls `handleCellClick`.
// We need to override handleCellClick for Online Mode.
window.handleOnlineMove = async function (row, col) {
    if (mode !== 'online') return;
    await tryPlaceStone(row, col, playerRole);
};


// =============================================================================
// 6. Cleanup & Reset
// =============================================================================

function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(async () => {
        if (!roomRecord || !playerRole || playerRole === 'spectator') return;

        // Lightweight update
        await sbClient
            .from("Gomoku's rooms")
            .update({ last_activity_at: new Date() })
            .eq('id', roomRecord.id);

        checkStaleRoom();

    }, HEARTBEAT_INTERVAL_MS);
}

async function checkStaleRoom() {
    if (!roomRecord) return;

    // Check local inactivity (e.g. if I am observing a dead room)
    const lastActive = new Date(roomRecord.last_activity_at).getTime();
    const diff = Date.now() - lastActive;

    if (diff > STALE_THRESHOLD_MS) {
        // Only one client needs to trigger reset, but race is fine (idempotent-ish)
        console.log("Room Stale. Triggering Reset...");
        await resetRoomFunc();
    }
}

async function requestRestart() {
    // "再戰一局" button
    await resetRoomFunc();
}

async function resetRoomFunc() {
    if (!roomRecord) return;

    // Transaction-like reset
    // 1. Delete Moves
    await sbClient.from('moves').delete().eq('room_id', roomRecord.id);

    // 2. Reset Room Status
    await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            current_player: 'black',
            winner: null,
            winner_color: null,
            ended_reason: null,
            finished_reason: null,
            turn_deadline_at: null,
            // Clear players to allow re-seating or keep them?
            // Spec: "建議清空 players，令下一局重新分配"
            black_player_id: null,
            white_player_id: null,
            last_activity_at: new Date()
        })
        .eq('id', roomRecord.id);

    console.log("Room Reset Complete.");
    // UI will update via Sync
    // Also, locally clear playerRole to allow re-join logic?
    // User: "再戰後... players 清空... 回到 waiting"
    // So we should effectively "Exit" to lobby or stay in lobby?
    // "兩邊收到 rooms UPDATE 後即刻清空棋盤並回 waiting"
    // If players are cleared, next sync will see I am not in `black_player_id` or `white_player_id`.
    // I should probably kick myself back to lobby or "Spectating" state until I click "Join" again.

    // Actually, simpler: stays in room view, but status is waiting.
    // Buttons will show "Join" again? 
    // Let's implement auto-rejoin or just kick to lobby for cleanliness.

    alert("房間已重置，請重新加入。");
    exitRoom();
}

function exitRoom() {
    if (timerInterval) clearInterval(timerInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (pollingInterval) clearInterval(pollingInterval);
    if (roomChannel) sbClient.removeChannel(roomChannel);

    roomId = null;
    roomRecord = null;
    playerRole = null;
    localStorage.removeItem('gomoku_player_role');

    // UI Reset
    document.getElementById('online-room').classList.add('hidden');
    document.getElementById('online-lobby').classList.remove('hidden');

    // Refresh Lobby
    updateLobbyStatus();
}


// Start
document.addEventListener('DOMContentLoaded', () => {
    // Overwrite input.js handler for online mode
    const originalHandleClick = window.handleCellClick;
    window.handleCellClick = function (row, col, diff) {
        if (mode === 'online') {
            window.handleOnlineMove(row, col);
        } else {
            originalHandleClick(row, col, diff);
        }
    };

    initOnlineMode();
});
