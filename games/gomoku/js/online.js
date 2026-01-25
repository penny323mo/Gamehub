// =============================================================================
// Gomoku Online Mode - Realtime Presence + Fixed Rooms
// =============================================================================
// Strategy:
// - 3 Fixed Rooms (ROOM01/02/03) stored in DB
// - Realtime Presence for online detection (NO DB heartbeat every 10s)
// - Moves table as source of truth
// - Atomic move operations
// - Timer driven by DB turn_started_at

const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// Global State
let sbClient = null;
let roomKey = null;        // 'ROOM01', 'ROOM02', 'ROOM03'
let myRole = null;          // 'black', 'white'
let myUserId = localStorage.getItem('gomoku_userId');

let roomChannel = null;
let timerInterval = null;
let currentRoomData = null;

const TURN_LIMIT_SEC = 30;
const MOVE_SYNC_TIMEOUT_MS = 1500; // If no realtime move in 1.5s, fallback SELECT

// Init User ID
if (!myUserId) {
    myUserId = crypto.randomUUID();
    localStorage.setItem('gomoku_userId', myUserId);
}

// =============================================================================
// 1. Initialization
// =============================================================================

async function initOnlineMode() {
    if (window.supabase) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { persistSession: false }
        });
        window.sbClient = sbClient;
        console.log("[Online] Supabase Initialized");
    } else {
        console.error("[Online] Supabase SDK missing");
        return;
    }

    // Bind Global Functions
    window.joinFixedRoom = joinFixedRoom;
    window.resetFixedRoom = resetFixedRoom;
    window.exitFixedRoom = exitFixedRoom;

    // Refresh Lobby periodically (Lightweight: only read room status/presence)
    setInterval(updateLobbyUI, 3000);
    updateLobbyUI();
}

async function updateLobbyUI() {
    if (!sbClient || document.getElementById('online-lobby')?.classList.contains('hidden')) return;

    const { data: rooms, error } = await sbClient
        .from("Gomoku's rooms")
        .select('room_key, status, black_player_id, white_player_id')
        .in('room_key', ['ROOM01', 'ROOM02', 'ROOM03']);

    if (error) return;

    rooms.forEach(room => {
        const statusEl = document.getElementById(`room-status-${room.room_key}`);
        const playersEl = document.getElementById(`room-players-${room.room_key}`);
        const joinBtn = document.getElementById(`room-join-${room.room_key}`);

        if (statusEl) {
            const statusMap = { 'waiting': '閒置', 'playing': '對戰中', 'finished': '已結束' };
            statusEl.innerText = statusMap[room.status] || '未知';
            statusEl.className = `room-status ${room.status}`;
        }

        if (playersEl) {
            const b = room.black_player_id ? '有人' : '-';
            const w = room.white_player_id ? '有人' : '-';
            playersEl.innerText = `⚫ ${b} / ⚪ ${w}`;
        }

        if (joinBtn) {
            const isFull = room.black_player_id && room.white_player_id;
            const amIIn = room.black_player_id === myUserId || room.white_player_id === myUserId;
            joinBtn.disabled = isFull && !amIIn;
            joinBtn.innerText = (isFull && !amIIn) ? "滿員" : "加入";
        }
    });
}

// =============================================================================
// 2. Joining Room
// =============================================================================

async function joinFixedRoom(targetRoomKey) {
    if (!sbClient) return;
    console.log(`[Online] Joining ${targetRoomKey}...`);

    // 1. Fetch Room
    const { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_key', targetRoomKey)
        .single();

    if (error || !room) {
        alert("房間不存在");
        return;
    }

    // 2. Determine Role & Claim Seat (Atomic)
    let role = null;
    let updates = {};

    if (room.black_player_id === myUserId) {
        role = 'black';
    } else if (room.white_player_id === myUserId) {
        role = 'white';
    } else {
        // Claim a seat
        if (!room.black_player_id) {
            role = 'black';
            updates.black_player_id = myUserId;
        } else if (!room.white_player_id) {
            role = 'white';
            updates.white_player_id = myUserId;
        } else {
            alert("房間已滿");
            return;
        }

        // Update DB (Atomic seat claim)
        const { error: claimError } = await sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id)
            .eq(role === 'black' ? 'black_player_id' : 'white_player_id', null); // Guard: only if still null

        if (claimError) {
            console.error("[Join] Seat claim failed:", claimError);
            alert("座位已被搶走，請重試");
            return;
        }
    }

    // 3. Enter Room
    enterFixedRoom(targetRoomKey, role);
}

async function enterFixedRoom(key, role) {
    roomKey = key;
    myRole = role;

    // UI Switch
    setMode('online');
    setIsVsAI(false);
    document.getElementById('online-lobby').classList.add('hidden');
    document.getElementById('online-room').classList.remove('hidden');
    document.getElementById('game-board-area').classList.remove('hidden');
    document.getElementById('online-controls').classList.remove('hidden');

    // Update Header
    document.getElementById('current-room-id').innerText = key;
    const roleText = role === 'black' ? '黑子 (先手)' : '白子';
    document.getElementById('my-role').innerText = roleText;

    // Initialize Board Canvas
    if (typeof createBoardUI === 'function') {
        createBoardUI(window.handleCellClick);
    } else if (typeof resizeGomokuBoard === 'function') {
        resizeGomokuBoard();
    }
    console.log('[enterFixedRoom] Board canvas initialized');

    // Export to global
    window.roomKey = key;
    window.myRole = role;

    // Critical: Load Room State from DB
    await syncRoomState();

    // Subscribe to Realtime (Presence + Moves + Rooms)
    subscribeRoom(key);
}

// =============================================================================
// 3. Synchronization (DB as Source of Truth)
// =============================================================================

async function syncRoomState() {
    if (!roomKey || !sbClient) return;

    // A. Fetch Room Data
    const { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_key', roomKey)
        .single();

    if (error || !room) {
        console.error("[Sync] Room fetch failed:", error);
        return;
    }

    currentRoomData = room;
    window.currentRoomData = room;

    // B. Fetch Moves & Rebuild Board
    const { data: moves, error: movesError } = await sbClient
        .from('moves')
        .select('*')
        .eq('room_key', roomKey)
        .order('move_no', { ascending: true });

    if (!movesError) {
        rebuildBoardFromMoves(moves || []);
    }

    // C. Update UI
    updateUIFromRoomData(room);
}

function rebuildBoardFromMoves(moves) {
    // Reset board
    createEmptyBoard();
    if (typeof resetBoardUI === 'function') resetBoardUI();

    // Replay moves
    moves.forEach(m => {
        const pieceType = m.color === 'black' ? 'black' : 'white';
        board[m.x][m.y] = pieceType;
        if (typeof drawBoard === 'function') drawBoard();
    });

    console.log(`[Sync] Rebuilt board from ${moves.length} moves`);
}

function createEmptyBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function updateUIFromRoomData(room) {
    const statusEl = document.getElementById('status');
    const timerEl = document.getElementById('game-timer');

    if (room.status === 'playing') {
        // Show turn info
        const isMyTurn = room.current_player === myRole;
        if (isMyTurn) {
            statusEl.innerHTML = `<span style="color:var(--neon-green)">輪到你了！</span>`;
        } else {
            statusEl.innerHTML = `等待對手...`;
        }

        // Start Timer (DB-driven)
        if (room.turn_started_at) {
            startDBDrivenTimer(new Date(room.turn_started_at).getTime());
        }

        // Check Timeout
        checkAndHandleTimeout(room);

    } else if (room.status === 'finished') {
        const winnerText = room.winner === 'black' ? "黑子" : "白子";
        let reasonText = room.ended_reason === 'timeout' ? " (超時)" : "";
        statusEl.innerHTML = `<span style="color:var(--neon-red)">遊戲結束 - ${winnerText}勝${reasonText}</span>`;
        stopTimer();
        document.getElementById('online-restart-btn')?.classList.remove('hidden');
    } else {
        // waiting
        statusEl.innerHTML = `等待對手加入...`;
        stopTimer();
    }
}

function startDBDrivenTimer(turnStartedMs) {
    if (timerInterval) clearInterval(timerInterval);

    const update = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - turnStartedMs) / 1000);
        const remaining = TURN_LIMIT_SEC - elapsed;

        const display = document.getElementById('game-timer');
        if (display) {
            display.innerText = remaining > 0 ? remaining : 0;
            if (remaining <= 5) display.classList.add('timer-warning');
            else display.classList.remove('timer-warning');
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
            // Timeout handled by checkAndHandleTimeout
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

async function checkAndHandleTimeout(room) {
    if (room.status !== 'playing' || !room.turn_started_at) return;

    const now = Date.now();
    const turnStarted = new Date(room.turn_started_at).getTime();
    const elapsed = (now - turnStarted) / 1000;

    if (elapsed >= TURN_LIMIT_SEC + 2) {
        // Grace period passed, trigger timeout
        const winner = room.current_player === 'black' ? 'white' : 'black';

        await sbClient
            .from("Gomoku's rooms")
            .update({
                status: 'finished',
                winner: winner,
                ended_reason: 'timeout'
            })
            .eq('id', room.id)
            .eq('status', 'playing'); // Guard
    }
}

// =============================================================================
// 4. Realtime Subscriptions (Presence + Moves + Rooms)
// =============================================================================

function subscribeRoom(key) {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    const channelName = `realtime:room:${key}`;

    roomChannel = sbClient.channel(channelName)
        // Presence Tracking
        .on('presence', { event: 'sync' }, () => {
            const state = roomChannel.presenceState();
            console.log('[Presence] Sync:', state);
            checkStartGame(state);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('[Presence] Join:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('[Presence] Leave:', leftPresences);
        })
        // Subscribe to Moves INSERT
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'moves', filter: `room_key=eq.${key}` },
            (payload) => {
                console.log('[RT] New Move:', payload.new);
                applyMoveFromRealtime(payload.new);
            }
        )
        // Subscribe to Rooms UPDATE
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: "Gomoku's rooms", filter: `room_key=eq.${key}` },
            (payload) => {
                console.log('[RT] Room Update:', payload.new);
                currentRoomData = payload.new;
                updateUIFromRoomData(payload.new);
            }
        )
        .subscribe(async (status) => {
            console.log('[RT] Subscription Status:', status);
            if (status === 'SUBSCRIBED') {
                // Track Presence
                await roomChannel.track({
                    user_id: myUserId,
                    color: myRole,
                    room_key: key,
                    ts: Date.now()
                });
                console.log('[Presence] Tracked:', { user_id: myUserId, color: myRole });
            }
        });
}

function checkStartGame(presenceState) {
    // If both black and white are present, start game
    const allUsers = Object.values(presenceState).flat();
    const hasBlack = allUsers.some(u => u.color === 'black');
    const hasWhite = allUsers.some(u => u.color === 'white');

    if (hasBlack && hasWhite && currentRoomData?.status === 'waiting') {
        console.log('[Presence] Both players present. Starting game...');
        startGame();
    }
}

async function startGame() {
    if (!currentRoomData) return;

    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'playing',
            current_player: 'black',
            turn_started_at: new Date(),
            move_no: 0
        })
        .eq('id', currentRoomData.id)
        .eq('status', 'waiting'); // Guard: only if still waiting

    if (error) {
        console.error('[StartGame] Update failed:', error);
    } else {
        console.log('[StartGame] Game started!');
    }
}

function applyMoveFromRealtime(move) {
    // Update board
    const pieceType = move.color === 'black' ? 'black' : 'white';
    board[move.x][move.y] = pieceType;
    if (typeof drawBoard === 'function') drawBoard();

    console.log(`[RT] Applied move: ${move.color} at (${move.x}, ${move.y})`);
}

// =============================================================================
// 5. Place Move (Atomic)
// =============================================================================

async function placeMove(row, col) {
    if (!currentRoomData) return { success: false };
    if (currentRoomData.status !== 'playing') return { success: false };
    if (currentRoomData.current_player !== myRole) return { success: false };
    if (board[row][col]) return { success: false };

    // 1. Get next move_no
    const currentMoveNo = currentRoomData.move_no || 0;
    const nextMoveNo = currentMoveNo + 1;

    // 2. Insert Move (with unique constraint protection)
    const { error: moveError } = await sbClient
        .from('moves')
        .insert([{
            room_key: roomKey,
            move_no: nextMoveNo,
            x: row,
            y: col,
            color: myRole
        }]);

    if (moveError) {
        console.error("[Move] Insert failed:", moveError);
        // Fallback: resync
        syncRoomState();
        return { success: false };
    }

    // 3. Update Room (Switch Turn, Atomic)
    const nextPlayer = myRole === 'black' ? 'white' : 'black';
    const { error: roomError, data: updated } = await sbClient
        .from("Gomoku's rooms")
        .update({
            current_player: nextPlayer,
            turn_started_at: new Date(),
            move_no: nextMoveNo
        })
        .eq('id', currentRoomData.id)
        .eq('current_player', myRole) // Guard: only if still my turn
        .select();

    if (roomError || !updated || updated.length === 0) {
        console.warn("[Move] Room update failed (race condition)");
        syncRoomState();
        return { success: false };
    }

    console.log("[Move] Success!");
    return { success: true };
}

// Hook for input.js
window.handleOnlineMove = async function (row, col) {
    if (mode !== 'online') return;
    await placeMove(row, col);
};

// =============================================================================
// 6. Reset Room
// =============================================================================

async function resetFixedRoom() {
    if (!currentRoomData) return;

    // 1. Delete Moves
    await sbClient.from('moves').delete().eq('room_key', roomKey);

    // 2. Reset Room
    await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            current_player: 'black',
            winner: null,
            ended_reason: null,
            turn_started_at: null,
            move_no: 0,
            black_player_id: null,
            white_player_id: null
        })
        .eq('id', currentRoomData.id);

    console.log("[Reset] Room reset complete");
    alert("房間已重置");
    exitFixedRoom();
}

function exitFixedRoom() {
    if (timerInterval) clearInterval(timerInterval);
    if (roomChannel) {
        roomChannel.untrack(); // Stop presence tracking
        sbClient.removeChannel(roomChannel);
    }

    roomKey = null;
    myRole = null;
    currentRoomData = null;

    // UI Reset
    document.getElementById('online-room').classList.add('hidden');
    document.getElementById('online-lobby').classList.remove('hidden');
    document.getElementById('game-board-area').classList.add('hidden');

    updateLobbyUI();
}

// =============================================================================
// Initialization
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Override handleCellClick for online mode
    const originalHandleClick = window.handleCellClick;
    window.handleCellClick = function (row, col, diff) {
        if (mode === 'online') {
            window.handleOnlineMove(row, col);
        } else if (originalHandleClick) {
            originalHandleClick(row, col, diff);
        }
    };

    initOnlineMode();
});
