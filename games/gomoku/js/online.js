// =============================================================================
// Gomoku Online Mode - Realtime Presence + Fixed Rooms + Ready Mechanism
// =============================================================================

const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// Global State
let sbClient = null;
let roomKey = null;
let myRole = null;
let myUserId = localStorage.getItem('gomoku_userId');
let myReady = false;

let roomChannel = null;
let timerInterval = null;
let currentRoomData = null;

const TURN_LIMIT_SEC = 30;
const FALLBACK_POLL_INTERVAL_MS = 1800; // Fallback polling every 1.8s
const SEAT_RECLAIM_GRACE_MS = 30000; // 30s grace period before reclaiming abandoned seat

let fallbackPollTimer = null;
let lastRealtimeActivity = Date.now();

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
    window.toggleReady = toggleReady;
    window.rematchGame = rematchGame; // New: Rematch button

    // Refresh Lobby periodically
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
        }

        if (playersEl) {
            const b = room.black_player_id ? '⚫' : '-';
            const w = room.white_player_id ? '⚪' : '-';
            playersEl.innerText = `${b} / ${w}`;
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

    const { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_key', targetRoomKey)
        .single();

    if (error || !room) {
        alert("房間不存在");
        return;
    }

    // Determine Role & Claim Seat
    let role = null;
    let updates = {};

    if (room.black_player_id === myUserId) {
        role = 'black';
    } else if (room.white_player_id === myUserId) {
        role = 'white';
    } else {
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

        const { error: claimError } = await sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id)
            .eq(role === 'black' ? 'black_player_id' : 'white_player_id', null);

        if (claimError) {
            console.error("[Join] Seat claim failed:", claimError);
            alert("座位已被搶走，請重試");
            return;
        }
    }

    enterFixedRoom(targetRoomKey, role);
}

async function enterFixedRoom(key, role) {
    roomKey = key;
    myRole = role;
    myReady = false;

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

    // Show Ready UI
    document.getElementById('ready-status')?.classList.remove('hidden');
    updateReadyUI();

    // Export to global
    window.roomKey = key;
    window.myRole = role;

    // Load Room State
    await syncRoomState();

    // Subscribe to Realtime
    subscribeRoom(key);

    // Start Fallback Polling (read-only, as backup)
    startFallbackPolling();
}

// =============================================================================
// 3. Ready Mechanism
// =============================================================================

async function toggleReady() {
    if (!currentRoomData || !myRole) return;
    if (currentRoomData.status === 'playing') return; // Already playing

    myReady = !myReady;
    const field = myRole === 'black' ? 'black_ready' : 'white_ready';

    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({ [field]: myReady })
        .eq('id', currentRoomData.id);

    if (error) {
        console.error("[Ready] Toggle failed:", error);
        myReady = !myReady; // Rollback
    } else {
        console.log(`[Ready] ${myRole} ready=${myReady}`);
        updateReadyUI();
    }
}

function updateReadyUI() {
    const readyBtn = document.getElementById('toggle-ready-btn');
    const blackStatus = document.getElementById('black-ready-status');
    const whiteStatus = document.getElementById('white-ready-status');

    if (readyBtn) {
        readyBtn.innerText = myReady ? "取消準備" : "準備";
        readyBtn.className = myReady ? "btn-secondary" : "btn-primary";
    }

    if (currentRoomData) {
        if (blackStatus) {
            blackStatus.innerText = currentRoomData.black_ready ? "⚫ 黑：已準備" : "⚫ 黑：未準備";
        }
        if (whiteStatus) {
            whiteStatus.innerText = currentRoomData.white_ready ? "⚪ 白：已準備" : "⚪ 白：未準備";
        }
    }
}

// =============================================================================
// 4. Synchronization (DB as Source of Truth)
// =============================================================================

async function syncRoomState() {
    if (!roomKey || !sbClient) return;

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

    // Fetch Moves & Rebuild Board
    const { data: moves, error: movesError } = await sbClient
        .from('moves')
        .select('*')
        .eq('room_key', roomKey)
        .eq('round_no', room.round_no || 0)
        .order('move_no', { ascending: true });

    if (!movesError) {
        rebuildBoardFromMoves(moves || []);
    } else {
        console.warn("[Sync] Moves fetch failed:", movesError);
    }

    updateUIFromRoomData(room);
    updateReadyUI();
}

function rebuildBoardFromMoves(moves) {
    createEmptyBoard();
    if (typeof resetBoardUI === 'function') resetBoardUI();

    moves.forEach(m => {
        board[m.x][m.y] = m.color;
    });

    if (typeof drawBoard === 'function') drawBoard();
    console.log(`[Sync] Rebuilt board from ${moves.length} moves`);
}

function createEmptyBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function updateUIFromRoomData(room) {
    const statusEl = document.getElementById('status');

    if (room.status === 'playing') {
        // Hide Ready UI
        document.getElementById('ready-status')?.classList.add('hidden');

        const isMyTurn = room.current_player === myRole;
        if (isMyTurn) {
            statusEl.innerHTML = `<span style="color:var(--neon-green)">輪到你了！</span>`;
        } else {
            statusEl.innerHTML = `等待對手...`;
        }

        if (room.turn_started_at) {
            startDBDrivenTimer(new Date(room.turn_started_at).getTime());
        }

        checkAndHandleTimeout(room);

    } else if (room.status === 'finished') {
        document.getElementById('ready-status')?.classList.add('hidden');

        // Show Rematch + Reset buttons
        document.getElementById('game-over-actions')?.classList.remove('hidden');

        const winnerText = room.winner === 'black' ? "黑子" : "白子";
        let reasonText = room.ended_reason === 'timeout' ? " (超時)" : "";
        statusEl.innerHTML = `<span style="color:var(--neon-red)">遊戲結束 - ${winnerText}勝${reasonText}</span>`;
        stopTimer();
    } else {
        // waiting
        const hasBlack = room.black_player_id;
        const hasWhite = room.white_player_id;

        if (hasBlack && hasWhite) {
            statusEl.innerHTML = `雙方已進房，按「準備」開始`;
            document.getElementById('ready-status')?.classList.remove('hidden');
        } else {
            statusEl.innerHTML = `等待對手加入...`;
            document.getElementById('ready-status')?.classList.add('hidden');
        }
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

        if (remaining <= 0) clearInterval(timerInterval);
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
        const winner = room.current_player === 'black' ? 'white' : 'black';

        await sbClient
            .from("Gomoku's rooms")
            .update({
                status: 'finished',
                winner: winner,
                ended_reason: 'timeout'
            })
            .eq('id', room.id)
            .eq('status', 'playing');
    }
}

// =============================================================================
// 5. Fallback Polling (Read-Only Backup)
// =============================================================================

function startFallbackPolling() {
    if (fallbackPollTimer) clearInterval(fallbackPollTimer);

    fallbackPollTimer = setInterval(async () => {
        if (!roomKey || !sbClient) return;

        // Only poll if realtime seems inactive (no activity in 2s)
        const timeSinceLastRT = Date.now() - lastRealtimeActivity;
        if (timeSinceLastRT < 2000) return; // Realtime is working, skip

        console.log('[Fallback] Polling for updates...');
        await syncRoomState(); // Read-only sync

    }, FALLBACK_POLL_INTERVAL_MS);
}

function stopFallbackPolling() {
    if (fallbackPollTimer) {
        clearInterval(fallbackPollTimer);
        fallbackPollTimer = null;
    }
}

// =============================================================================
// 6. Realtime Subscriptions + Error Handling
// =============================================================================

function subscribeRoom(key) {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    const channelName = `realtime:room:${key}`;

    roomChannel = sbClient.channel(channelName)
        .on('presence', { event: 'sync' }, () => {
            const state = roomChannel.presenceState();
            console.log('[Presence] Sync:', state);
            lastRealtimeActivity = Date.now();
            checkSeatReclaim(state);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('[Presence] Join:', newPresences);
            lastRealtimeActivity = Date.now();
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('[Presence] Leave:', leftPresences);
            lastRealtimeActivity = Date.now();
        })
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'moves', filter: `room_key=eq.${key}` },
            (payload) => {
                console.log('[RT] New Move:', payload.new);
                lastRealtimeActivity = Date.now();
                applyMoveFromRealtime(payload.new);
            }
        )
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: "Gomoku's rooms", filter: `room_key=eq.${key}` },
            (payload) => {
                console.log('[RT] Room Update:', payload.new);
                lastRealtimeActivity = Date.now();
                currentRoomData = payload.new;

                // Check if both ready → start game
                if (payload.new.black_ready && payload.new.white_ready && payload.new.status === 'waiting') {
                    attemptStartGame();
                }

                updateUIFromRoomData(payload.new);
                updateReadyUI();
            }
        )
        .on('system', (payload) => {
            console.log('[RT] System Event:', payload);
            if (payload.type === 'error' || payload.type === 'closed') {
                console.error('[RT] Channel error/closed, attempting reconnect...');
                setTimeout(() => subscribeRoom(key), 2000);
            }
        })
        .subscribe(async (status) => {
            console.log('[RT] Subscription Status:', status);

            if (status === 'SUBSCRIBED') {
                lastRealtimeActivity = Date.now();
                await roomChannel.track({
                    user_id: myUserId,
                    color: myRole,
                    room_key: key,
                    ts: Date.now()
                });
                console.log('[Presence] Tracked:', { user_id: myUserId, color: myRole });
            } else if (status === 'CHANNEL_ERROR') {
                console.error('[RT] Subscription failed');
            } else if (status === 'TIMED_OUT') {
                console.warn('[RT] Subscription timed out, retrying...');
                setTimeout(() => subscribeRoom(key), 3000);
            }
        });
}

async function attemptStartGame() {
    if (!currentRoomData) return;

    console.log('[Ready] Attempting to start game...');

    const { data, error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'playing',
            current_player: 'black',
            turn_started_at: new Date(),
            black_ready: false,
            white_ready: false
        })
        .eq('id', currentRoomData.id)
        .eq('status', 'waiting')
        .eq('black_ready', true)
        .eq('white_ready', true)
        .select();

    if (error) {
        console.warn('[Ready] Start game failed (race condition):', error);
    } else if (data && data.length > 0) {
        console.log('[Ready] Game started!');
        myReady = false;
    }
}

function applyMoveFromRealtime(move) {
    if (!currentRoomData) return;
    if (move.round_no !== currentRoomData.round_no) {
        console.warn('[RT] Move from old round, ignoring');
        return;
    }

    board[move.x][move.y] = move.color;
    if (typeof drawBoard === 'function') drawBoard();

    console.log(`[RT] Applied move: ${move.color} at (${move.x}, ${move.y})`);
}

// =============================================================================
// 7. Presence-Based Seat Reclaim
// =============================================================================

let lastSeatReclaimCheck = 0;

async function checkSeatReclaim(presenceState) {
    if (!currentRoomData) return;

    // Throttle: only check every 30s max
    const now = Date.now();
    if (now - lastSeatReclaimCheck < SEAT_RECLAIM_GRACE_MS) return;
    lastSeatReclaimCheck = now;

    const allPresent = Object.values(presenceState).flat();
    const blackPresent = allPresent.some(u => u.color === 'black');
    const whitePresent = allPresent.some(u => u.color === 'white');

    // Reclaim black seat if not present
    if (currentRoomData.black_player_id && !blackPresent) {
        console.log('[Presence] Black player absent, reclaiming seat...');
        await sbClient
            .from("Gomoku's rooms")
            .update({ black_player_id: null, black_ready: false })
            .eq('id', currentRoomData.id)
            .eq('black_player_id', currentRoomData.black_player_id); // Guard
    }

    // Reclaim white seat if not present
    if (currentRoomData.white_player_id && !whitePresent) {
        console.log('[Presence] White player absent, reclaiming seat...');
        await sbClient
            .from("Gomoku's rooms")
            .update({ white_player_id: null, white_ready: false })
            .eq('id', currentRoomData.id)
            .eq('white_player_id', currentRoomData.white_player_id); // Guard
    }
}

// =============================================================================
// 8. Place Move (Atomic)
// =============================================================================

async function placeMove(row, col) {
    if (!currentRoomData) return { success: false };
    if (currentRoomData.status !== 'playing') return { success: false };
    if (currentRoomData.current_player !== myRole) return { success: false };
    if (board[row][col]) return { success: false };

    // Get next move_no (from DB to ensure consistency)
    const { data: existingMoves } = await sbClient
        .from('moves')
        .select('move_no')
        .eq('room_key', roomKey)
        .eq('round_no', currentRoomData.round_no || 0)
        .order('move_no', { ascending: false })
        .limit(1);

    const nextMoveNo = existingMoves && existingMoves.length > 0 ? existingMoves[0].move_no + 1 : 1;

    // 1. Insert Move
    const { error: moveError } = await sbClient
        .from('moves')
        .insert([{
            room_key: roomKey,
            round_no: currentRoomData.round_no || 0,
            move_no: nextMoveNo,
            x: row,
            y: col,
            color: myRole
        }]);

    if (moveError) {
        console.error("[Move] Insert failed:", moveError);
        syncRoomState();
        return { success: false };
    }

    // 2. Update Room
    const nextPlayer = myRole === 'black' ? 'white' : 'black';
    const { error: roomError, data: updated } = await sbClient
        .from("Gomoku's rooms")
        .update({
            current_player: nextPlayer,
            turn_started_at: new Date()
        })
        .eq('id', currentRoomData.id)
        .eq('current_player', myRole)
        .select();

    if (roomError || !updated || updated.length === 0) {
        console.warn("[Move] Room update failed (race condition)");
        syncRoomState();
        return { success: false };
    }

    console.log("[Move] Success!");
    return { success: true };
}

window.handleOnlineMove = async function (row, col) {
    if (mode !== 'online') return;
    await placeMove(row, col);
};

// =============================================================================
// 9. Rematch & Reset
// =============================================================================

async function rematchGame() {
    if (!currentRoomData) return;

    console.log('[Rematch] Starting new round...');

    // Increment round_no, reset to waiting, keep seats
    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            current_player: 'black',
            turn_started_at: null,
            winner: null,
            ended_reason: null,
            black_ready: false,
            white_ready: false,
            round_no: (currentRoomData.round_no || 0) + 1
        })
        .eq('id', currentRoomData.id)
        .eq('status', 'finished'); // Guard

    if (error) {
        console.error('[Rematch] Failed:', error);
        alert('再戰失敗，請重試');
    } else {
        console.log('[Rematch] New round started!');
        myReady = false;
        document.getElementById('game-over-actions')?.classList.add('hidden');
    }
}

// =============================================================================
// 7. Reset Room
// =============================================================================

async function resetFixedRoom() {
    if (!currentRoomData) return;

    const confirmed = confirm('確定要重置房間？所有玩家將被踢出。');
    if (!confirmed) return;

    console.log('[Reset] Resetting room...');

    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            current_player: 'black',
            winner: null,
            ended_reason: null,
            turn_started_at: null,
            black_ready: false,
            white_ready: false,
            black_player_id: null,
            white_player_id: null,
            round_no: (currentRoomData.round_no || 0) + 1
        })
        .eq('id', currentRoomData.id);

    if (error) {
        console.error("[Reset] Failed:", error);
        alert('重置失敗');
    } else {
        console.log("[Reset] Room reset complete");
        exitFixedRoom();
    }
}

function exitFixedRoom() {
    if (timerInterval) clearInterval(timerInterval);
    stopFallbackPolling();

    if (roomChannel) {
        roomChannel.untrack();
        sbClient.removeChannel(roomChannel);
    }

    roomKey = null;
    myRole = null;
    myReady = false;
    currentRoomData = null;

    document.getElementById('online-room').classList.add('hidden');
    document.getElementById('online-lobby').classList.remove('hidden');
    document.getElementById('game-board-area').classList.add('hidden');
    document.getElementById('ready-status')?.classList.add('hidden');
    document.getElementById('game-over-actions')?.classList.add('hidden');

    updateLobbyUI();
}

// =============================================================================
// Initialization
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const originalHandleClick = window.handleCellClick;
    window.handleCellClick = function (row, col) {
        if (mode === 'online') {
            window.handleOnlineMove(row, col);
        } else if (originalHandleClick) {
            originalHandleClick(row, col);
        }
    };

    initOnlineMode();
});
