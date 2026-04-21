/**
 * Snooker Online Mode – Supabase Realtime
 * Shared by 2D (app.js) and 3D (main.js).
 *
 * External API consumed by the game:
 *   window.snookerOnlineRoomUpdate({ status, players, myRole })
 *   window.snookerApplyRemoteShot(shot)
 *   window.snookerApplyRemoteStateSnapshot(snapshot, meta)
 *
 * API exposed to the game:
 *   window.snookerJoinRoom(roomKey)
 *   window.snookerExitRoom()
 *   window.snookerToggleReady()
 *   window.snookerSendShot(payload)
 *   window.snookerSendStateSnapshot(snapshot)
 *   window.snookerRematch()
 *   window.initSnookerOnline()
 */

const SUPABASE_URL     = 'https://djbhipofzbonxfqriovi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld';
const FIXED_ROOMS_MAP = {
    '2d': ['ROOM01', 'ROOM02', 'ROOM03'],
    '3d': ['3D-ROOM01', '3D-ROOM02', '3D-ROOM03'],
};
let FIXED_ROOMS = FIXED_ROOMS_MAP['2d'];
const SHOT_POLL_MS = 1500;
const ROOM_POLL_MS = 1000;
const MAX_APPLIED_EVENT_IDS = 500;
const WAITING_ROOM_STALE_MS = 90_000;
const ACTIVE_ROOM_STALE_MS = 5 * 60_000;

const SnookerOnline = {
    sbClient:        null,
    roomKey:         null,
    roomUuid:        null,
    playerRole:      null,   // 'player1' | 'player2'
    roomChannel:     null,
    shotsChannel:    null,
    clientId:        null,
    fallbackInsertWarned: false,
    heartbeatInterval: null,
    lobbyInterval:   null,   // tracked so repeated initSnookerOnline() calls don't leak
    roomPollInterval: null,  // polls room state while waiting (realtime is unreliable)
    shotPollInterval: null,  // polls shots during gameplay (realtime can drop messages)
    gameStartedAt:   null,
    appliedShotIds:  new Set(),
    currentRoundId:  null,
    hasSeat:         false,
    gameMode:        '2d',
    tabId:           null,
    clientClaimInterval: null,
};

function buildShotEnvelope(kind, payload) {
    return {
        ...(payload || {}),
        kind,
        // round_id starts at 1 for the first match; a 0 here would collide
        // with the "missing round_id" fallback in isShotPayloadForCurrentRound.
        round_id: SnookerOnline.currentRoundId || 1,
        event_id: crypto.randomUUID(),
        sender_role: SnookerOnline.playerRole,
        sent_at: new Date().toISOString(),
    };
}

function trimAppliedEventIds() {
    if (SnookerOnline.appliedShotIds.size <= MAX_APPLIED_EVENT_IDS) return;
    const ids = [...SnookerOnline.appliedShotIds];
    SnookerOnline.appliedShotIds = new Set(ids.slice(-Math.floor(MAX_APPLIED_EVENT_IDS / 2)));
}

function isShotPayloadForCurrentRound(payload) {
    const payloadRoundId = payload?.round_id;
    // Every envelope built by buildShotEnvelope tags round_id, so a missing one
    // can only come from legacy or malformed rows — never accept those.
    if (payloadRoundId == null) return false;
    // Use || 1 to match buildShotEnvelope's round_id: currentRoundId || 1.
    // A fresh room has round_id=0 in the DB; the first match's envelopes carry
    // round_id=1 while currentRoundId is still 0, so we need the same fallback.
    return payloadRoundId === (SnookerOnline.currentRoundId || 1);
}

function getShotPayload(rawShot) {
    return rawShot?.payload || rawShot || null;
}

function isRpcMissing(error) {
    return error?.code === 'PGRST202' || error?.message?.includes('Could not find');
}

function parseTimestampMs(value) {
    if (!value) return null;
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : null;
}

function isTimestampOlderThan(value, thresholdMs) {
    const ts = parseTimestampMs(value);
    return ts !== null && (Date.now() - ts) > thresholdMs;
}

function isSeatHeartbeatStale(room, role, thresholdMs = WAITING_ROOM_STALE_MS) {
    if (!room) return false;
    const isP1 = role === 'player1';
    const seatId = isP1 ? room.player1_id : room.player2_id;
    const lastSeen = isP1 ? room.p1_last_seen_at : room.p2_last_seen_at;
    return Boolean(seatId) && isTimestampOlderThan(lastSeen, thresholdMs);
}

function isRoomAbandoned(room, thresholdMs = ACTIVE_ROOM_STALE_MS) {
    if (!room || room.status === 'waiting') return false;
    const lastActivityStale = isTimestampOlderThan(room.last_activity_at, thresholdMs);
    const p1Stale = !room.player1_id || isSeatHeartbeatStale(room, 'player1', thresholdMs);
    const p2Stale = !room.player2_id || isSeatHeartbeatStale(room, 'player2', thresholdMs);
    return lastActivityStale && p1Stale && p2Stale;
}

async function fetchRoomById(roomId) {
    if (!SnookerOnline.sbClient || !roomId) {
        return { ok: false, reason: 'not_connected' };
    }
    const { data, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
    if (error || !data) {
        return { ok: false, reason: error?.message || 'room_not_found' };
    }
    return { ok: true, room: data };
}

async function deleteRoomShotsDirect(roomId) {
    if (!SnookerOnline.sbClient || !roomId) return;
    // Post-RLS-lockdown (migration 011) the snooker_shots table has no client
    // DELETE policy. Prefer cleanup_snooker_shots RPC (SECURITY DEFINER, checks
    // membership + not playing). The direct DELETE below is a legacy fallback
    // that will no-op under RLS; correctness is preserved because round_id
    // filtering in isShotPayloadForCurrentRound rejects old-round rows anyway.
    if (SnookerOnline.clientId) {
        const { data, error } = await SnookerOnline.sbClient.rpc('cleanup_snooker_shots', {
            p_room_id: roomId,
            p_client_id: SnookerOnline.clientId,
        });
        if (!error && data?.ok) return;
        if (data?.error === 'not_a_member') return;
    }
    const { error: directErr } = await SnookerOnline.sbClient.from('snooker_shots')
        .delete()
        .eq('room_id', roomId);
    if (directErr) {
        console.warn('[SnookerOnline] direct shot cleanup skipped:', directErr.message);
    }
}

async function reclaimAbandonedRoomDirect(room) {
    if (!SnookerOnline.sbClient || !room?.id || !isRoomAbandoned(room)) {
        return { ok: false, reason: 'not_abandoned' };
    }

    const staleCutoffIso = new Date(Date.now() - ACTIVE_ROOM_STALE_MS).toISOString();
    const nextRoundId = (room.round_id || 0) + 1;
    const resetPayload = {
        status: 'waiting',
        player1_id: null,
        player2_id: null,
        player1_name: null,
        player2_name: null,
        player1_ready: false,
        player2_ready: false,
        p1_last_seen_at: null,
        p2_last_seen_at: null,
        current_turn: null,
        winner: null,
        finished_reason: null,
        finished_at: null,
        round_id: nextRoundId,
        last_activity_at: new Date().toISOString(),
    };

    const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update(resetPayload)
        .eq('id', room.id)
        .lt('last_activity_at', staleCutoffIso)
        .select();

    if (error) {
        return { ok: false, reason: error.message || 'reset_failed' };
    }
    if (!data?.length) {
        return { ok: false, reason: 'stale_guard_rejected' };
    }

    await deleteRoomShotsDirect(room.id);
    return { ok: true, room: data[0] };
}

async function joinRoomDirect(room, playerName) {
    if (!SnookerOnline.sbClient || !room?.id) {
        return { ok: false, reason: 'not_connected' };
    }

    let freshRoom = room;
    if (isRoomAbandoned(freshRoom)) {
        const reclaimed = await reclaimAbandonedRoomDirect(freshRoom);
        if (reclaimed.ok) {
            freshRoom = reclaimed.room;
        } else {
            const refetched = await fetchRoomById(room.id);
            if (refetched.ok) freshRoom = refetched.room;
        }
    }

    const nowIso = new Date().toISOString();
    const wasAlreadyMember = freshRoom.player1_id === SnookerOnline.clientId ||
        freshRoom.player2_id === SnookerOnline.clientId;
    const originalStatus = freshRoom.status;
    let role = null;
    let claimedRoom = null;

    if (freshRoom.player1_id === SnookerOnline.clientId) {
        role = 'player1';
        const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                player1_name: playerName,
                p1_last_seen_at: nowIso,
                last_activity_at: nowIso,
            })
            .eq('id', freshRoom.id)
            .eq('player1_id', SnookerOnline.clientId)
            .select();
        if (error || !data?.length) {
            return { ok: false, reason: error?.message || 'rejoin_failed' };
        }
        claimedRoom = data[0];
    } else if (freshRoom.player2_id === SnookerOnline.clientId) {
        role = 'player2';
        const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                player2_name: playerName,
                p2_last_seen_at: nowIso,
                last_activity_at: nowIso,
            })
            .eq('id', freshRoom.id)
            .eq('player2_id', SnookerOnline.clientId)
            .select();
        if (error || !data?.length) {
            return { ok: false, reason: error?.message || 'rejoin_failed' };
        }
        claimedRoom = data[0];
    } else if (!freshRoom.player1_id) {
        role = 'player1';
        const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                player1_id: SnookerOnline.clientId,
                player1_name: playerName,
                player1_ready: false,
                p1_last_seen_at: nowIso,
                last_activity_at: nowIso,
            })
            .eq('id', freshRoom.id)
            .is('player1_id', null)
            .select();
        if (error) {
            return { ok: false, reason: error.message || 'claim_failed' };
        }
        if (!data?.length) {
            return { ok: false, reason: 'room_full' };
        }
        claimedRoom = data[0];
    } else if (!freshRoom.player2_id) {
        role = 'player2';
        const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                player2_id: SnookerOnline.clientId,
                player2_name: playerName,
                player2_ready: false,
                p2_last_seen_at: nowIso,
                last_activity_at: nowIso,
            })
            .eq('id', freshRoom.id)
            .is('player2_id', null)
            .select();
        if (error) {
            return { ok: false, reason: error.message || 'claim_failed' };
        }
        if (!data?.length) {
            return { ok: false, reason: 'room_full' };
        }
        claimedRoom = data[0];
    } else {
        return { ok: false, reason: 'room_full' };
    }

    if (!claimedRoom) {
        return { ok: false, reason: 'claim_failed' };
    }

    if (!wasAlreadyMember && originalStatus !== 'waiting') {
        const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                status: 'waiting',
                player1_ready: false,
                player2_ready: false,
                current_turn: null,
                winner: null,
                finished_reason: null,
                finished_at: null,
                round_id: (claimedRoom.round_id || 0) + 1,
                last_activity_at: nowIso,
            })
            .eq('id', claimedRoom.id)
            .select();
        if (!error && data?.length) {
            claimedRoom = data[0];
        }
        await deleteRoomShotsDirect(claimedRoom.id);
    }

    return { ok: true, role, room: claimedRoom };
}

async function toggleReadyDirect() {
    const fresh = await fetchRoomById(SnookerOnline.roomUuid);
    if (!fresh.ok) return fresh;

    const room = fresh.room;
    const nowIso = new Date().toISOString();
    let readyColumn = null;
    let seatColumn = null;
    let seenColumn = null;

    if (room.player1_id === SnookerOnline.clientId) {
        readyColumn = 'player1_ready';
        seatColumn = 'player1_id';
        seenColumn = 'p1_last_seen_at';
    } else if (room.player2_id === SnookerOnline.clientId) {
        readyColumn = 'player2_ready';
        seatColumn = 'player2_id';
        seenColumn = 'p2_last_seen_at';
    } else {
        return { ok: false, reason: 'unauthorized' };
    }

    const nextReady = !Boolean(room[readyColumn]);
    const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update({
            [readyColumn]: nextReady,
            [seenColumn]: nowIso,
            last_activity_at: nowIso,
        })
        .eq('id', room.id)
        .eq(seatColumn, SnookerOnline.clientId)
        .eq(readyColumn, room[readyColumn])
        .select();

    if (error) {
        return { ok: false, reason: error.message || 'toggle_ready_failed' };
    }
    return { ok: true, room: data?.[0] || room };
}

async function pingRoomDirect() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) {
        return { ok: false, reason: 'not_connected' };
    }

    const nowIso = new Date().toISOString();
    const isP1 = SnookerOnline.playerRole === 'player1';
    const seatColumn = isP1 ? 'player1_id' : 'player2_id';
    const seenColumn = isP1 ? 'p1_last_seen_at' : 'p2_last_seen_at';
    const { error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update({
            [seenColumn]: nowIso,
            last_activity_at: nowIso,
        })
        .eq('id', SnookerOnline.roomUuid)
        .eq(seatColumn, SnookerOnline.clientId);

    if (error) {
        return { ok: false, reason: error.message || 'ping_failed' };
    }
    return { ok: true };
}

async function exitRoomDirect(room) {
    if (!SnookerOnline.sbClient || !room?.id) {
        return { ok: false, reason: 'not_connected' };
    }

    const nowIso = new Date().toISOString();
    let role = null;
    if (room.player1_id === SnookerOnline.clientId) role = 'player1';
    else if (room.player2_id === SnookerOnline.clientId) role = 'player2';
    if (!role) {
        return { ok: false, reason: 'unauthorized' };
    }

    if (room.status === 'playing') {
        const { error } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                status: 'finished',
                winner: role === 'player1' ? 'player2' : 'player1',
                finished_reason: 'opponent_left',
                finished_at: nowIso,
                last_activity_at: nowIso,
            })
            .eq('id', room.id)
            .eq('status', 'playing');
        if (error) {
            return { ok: false, reason: error.message || 'exit_failed' };
        }
        return { ok: true };
    }

    const seatReset = role === 'player1'
        ? {
            player1_id: null,
            player1_name: null,
            player1_ready: false,
            p1_last_seen_at: null,
            last_activity_at: nowIso,
        }
        : {
            player2_id: null,
            player2_name: null,
            player2_ready: false,
            p2_last_seen_at: null,
            last_activity_at: nowIso,
        };
    const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update(seatReset)
        .eq('id', room.id)
        .select();
    if (error) {
        return { ok: false, reason: error.message || 'exit_failed' };
    }

    let updatedRoom = data?.[0] || null;
    if ((!updatedRoom || (!updatedRoom.player1_id && !updatedRoom.player2_id)) && room.status !== 'waiting') {
        const nextRoundId = ((updatedRoom?.round_id ?? room.round_id) || 0) + 1;
        const { data: resetRows, error: resetError } = await SnookerOnline.sbClient.from('snooker_rooms')
            .update({
                status: 'waiting',
                current_turn: null,
                winner: null,
                finished_reason: null,
                finished_at: null,
                round_id: nextRoundId,
                last_activity_at: nowIso,
            })
            .eq('id', room.id)
            .select();
        if (!resetError && resetRows?.length) {
            updatedRoom = resetRows[0];
        }
        await deleteRoomShotsDirect(room.id);
    }

    return { ok: true, room: updatedRoom };
}

async function signalGameOverDirect(winnerRole) {
    const fresh = await fetchRoomById(SnookerOnline.roomUuid);
    if (!fresh.ok) return fresh;
    const room = fresh.room;
    if (room.player1_id !== SnookerOnline.clientId && room.player2_id !== SnookerOnline.clientId) {
        return { ok: false, reason: 'unauthorized' };
    }
    if (room.status !== 'playing') {
        return { ok: true, skipped: true };
    }

    const { error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update({
            status: 'finished',
            winner: winnerRole,
            finished_reason: 'completed',
            finished_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
        })
        .eq('id', room.id)
        .eq('status', 'playing');

    if (error) {
        return { ok: false, reason: error.message || 'game_over_failed' };
    }
    return { ok: true };
}

async function resetSnookerRoomDirect() {
    const fresh = await fetchRoomById(SnookerOnline.roomUuid);
    if (!fresh.ok) return fresh;
    const room = fresh.room;
    if (room.player1_id !== SnookerOnline.clientId && room.player2_id !== SnookerOnline.clientId) {
        return { ok: false, reason: 'unauthorized' };
    }
    if (room.status !== 'finished') {
        return { ok: true, skipped: true, room };
    }

    const nextRoundId = (room.round_id || 0) + 1;
    const { data, error } = await SnookerOnline.sbClient.from('snooker_rooms')
        .update({
            status: 'waiting',
            player1_ready: false,
            player2_ready: false,
            current_turn: null,
            winner: null,
            finished_reason: null,
            finished_at: null,
            round_id: nextRoundId,
            last_activity_at: new Date().toISOString(),
        })
        .eq('id', room.id)
        .eq('status', 'finished')
        .select();

    if (error) {
        return { ok: false, reason: error.message || 'reset_failed' };
    }

    await deleteRoomShotsDirect(room.id);
    return { ok: true, room: data?.[0] || room };
}

function applyIncomingShotEvent(rawShot) {
    if (!rawShot?.id || rawShot.player_role === SnookerOnline.playerRole) return;

    const payload = getShotPayload(rawShot);
    if (!payload || !isShotPayloadForCurrentRound(payload)) return;
    // Prefer the envelope's event_id (stable across realtime + poll paths even
    // if the sender ever constructs an event without a DB row), fall back to
    // the DB row's primary key for rows that predate the event_id field.
    const dedupKey = payload.event_id || rawShot.id;
    if (!dedupKey) return;
    if (SnookerOnline.appliedShotIds.has(dedupKey)) return;

    trimAppliedEventIds();
    SnookerOnline.appliedShotIds.add(dedupKey);

    if (payload.kind === 'state_sync') {
        console.log('[SnookerShot] Remote snapshot received:', payload.snapshot?.format || 'unknown');
        if (window.snookerApplyRemoteStateSnapshot) {
            window.snookerApplyRemoteStateSnapshot(payload.snapshot || null, payload);
        }
        return;
    }

    console.log('[SnookerShot] Remote shot received:', payload);
    if (window.snookerApplyRemoteShot) {
        window.snookerApplyRemoteShot(payload);
    }
}

async function fetchMissingShotsOnce() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
    // Filtering by client-side gameStartedAt risks clock skew dropping valid
    // shots; round_id matching in isShotPayloadForCurrentRound is authoritative
    // and applied inside applyIncomingShotEvent.
    const { data: shots, error } = await SnookerOnline.sbClient
        .from('snooker_shots')
        .select('*')
        .eq('room_id', SnookerOnline.roomUuid)
        .neq('player_role', SnookerOnline.playerRole)
        .order('shot_no', { ascending: true });
    if (error) {
        console.error('[ShotPoll] Fetch error:', error);
        return;
    }
    for (const shot of shots || []) {
        applyIncomingShotEvent(shot);
    }
}

async function persistShotPayload(payload, { label = 'SnookerShot', strictPlaying = false } = {}) {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) {
        return { ok: false, reason: 'not_connected' };
    }

    const { data, error } = await SnookerOnline.sbClient.rpc('submit_snooker_shot', {
        p_room_id:     SnookerOnline.roomUuid,
        p_client_id:   SnookerOnline.clientId,
        p_player_role: SnookerOnline.playerRole,
        p_payload:     payload,
    });
    if (!error && !data?.error) {
        console.log(`[${label}] Sent via RPC:`, payload);
        return { ok: true, transport: 'rpc' };
    }
    if (data?.error) {
        console.warn(`[${label}] Rejected:`, data.error);
        if (strictPlaying || data.error !== 'game_not_playing') {
            showOnlineToast(`同步被拒絕: ${data.error}`, 'warn');
        }
        return { ok: false, reason: data.error };
    }

    // The submit_snooker_shot RPC is the only permitted insert path (RLS
    // blocks direct inserts). If the RPC is missing, the deployment is
    // broken — surface it clearly rather than failing silently.
    console.error(`[${label}] RPC error:`, error);
    showOnlineToast(isRpcMissing(error)
        ? 'submit_snooker_shot RPC 未部署，請檢查 Supabase migration'
        : '同步失敗，請重新整理後再試', 'error');
    return { ok: false, reason: error?.message || 'rpc_error' };
}

// ─── Init ────────────────────────────────────────────────────────────────────

function initSnookerOnline({ gameMode = '2d' } = {}) {
    SnookerOnline.gameMode = gameMode;
    FIXED_ROOMS = FIXED_ROOMS_MAP[gameMode] ?? FIXED_ROOMS_MAP['2d'];
    // Use sessionStorage so each browser tab gets its own ID,
    // allowing two tabs on the same device to be different players.
    const tabId = sessionStorage.getItem('snooker_tab_id') || crypto.randomUUID();
    sessionStorage.setItem('snooker_tab_id', tabId);
    SnookerOnline.tabId = tabId;
    SnookerOnline.clientId = sessionStorage.getItem('snooker_clientId');
    if (!SnookerOnline.clientId) {
        SnookerOnline.clientId = crypto.randomUUID();
        sessionStorage.setItem('snooker_clientId', SnookerOnline.clientId);
    }
    try {
        const claimKey = `snooker_client_claim:${SnookerOnline.clientId}`;
        const existingClaim = JSON.parse(localStorage.getItem(claimKey) || 'null');
        const claimAgeMs = existingClaim?.ts ? (Date.now() - existingClaim.ts) : null;
        if (existingClaim && existingClaim.tabId !== tabId && claimAgeMs !== null && claimAgeMs < ACTIVE_ROOM_STALE_MS) {
            SnookerOnline.clientId = crypto.randomUUID();
            sessionStorage.setItem('snooker_clientId', SnookerOnline.clientId);
            showOnlineToast('偵測到重複分頁，已為新分頁分配新身份', 'info', 2600);
        }
        localStorage.setItem(`snooker_client_claim:${SnookerOnline.clientId}`, JSON.stringify({
            tabId,
            ts: Date.now(),
        }));
        clearInterval(SnookerOnline.clientClaimInterval);
        SnookerOnline.clientClaimInterval = setInterval(() => {
            try {
                localStorage.setItem(`snooker_client_claim:${SnookerOnline.clientId}`, JSON.stringify({
                    tabId: SnookerOnline.tabId,
                    ts: Date.now(),
                }));
            } catch (_) {
                // Best effort only; online play still works without the duplicate-tab hint.
            }
        }, 30_000);
    } catch (error) {
        console.warn('[SnookerOnline] client claim sync skipped:', error?.message || error);
    }
    console.log('[SnookerOnline] clientId:', SnookerOnline.clientId);

    if (SnookerOnline.sbClient) {
        console.log('[SnookerOnline] reusing existing client');
    } else if (window.supabase && window.supabase.createClient) {
        SnookerOnline.sbClient = window.supabase.createClient(
            SUPABASE_URL, SUPABASE_ANON_KEY.trim(),
            { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
        );
        console.log('[SnookerOnline] Supabase initialized');
    } else if (window.supabase && window.supabase.from) {
        SnookerOnline.sbClient = window.supabase;
        console.log('[SnookerOnline] recovered from window.supabase');
    } else {
        console.error('[SnookerOnline] Supabase SDK not loaded');
        return;
    }

    window.snookerJoinRoom    = joinFixedRoom;
    window.snookerExitRoom    = exitFixedRoom;
    window.snookerToggleReady = toggleReady;
    window.snookerSendShot    = sendShot;
    window.snookerSendStateSnapshot = sendStateSnapshot;

    // Register the unload guard only once, even if initSnookerOnline()
    // is called multiple times (e.g. switching 2D ↔ 3D in the hub).
    // Use fetch({keepalive:true}) to survive page unload — the async
    // exitFixedRoom() would be killed before completing.
    if (!SnookerOnline._unloadRegistered) {
        SnookerOnline._unloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            // Skip cleanup during intentional redirects (lobby → game page).
            // Check both in-memory flag AND sessionStorage handoff signal for
            // maximum reliability — the in-memory flag alone can fail if the
            // JS engine doesn't propagate it in time.
            if (SnookerOnline._intentionalRedirect) return;
            // Only honour the handoff flag within a short window (10 s).
            // If the game page never loaded or crashed, this prevents the
            // flag from permanently suppressing seat cleanup in this tab.
            const pendingTs = parseInt(sessionStorage.getItem('snooker_pending_ts') || '0', 10);
            if (sessionStorage.getItem('snooker_pending_room') && (Date.now() - pendingTs) < 10000) return;
            if (!SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
            // BUG FIX (P0 Lifecycle): If the room is playing, don't clear the seat so the player can rejoin
            if (window.snookerCurrentRoom?.status === 'playing') return;

            const body = JSON.stringify({
                p_room_id: SnookerOnline.roomUuid,
                p_client_id: SnookerOnline.clientId
            });
            try {
                fetch(`${SUPABASE_URL}/rest/v1/rpc/exit_snooker_room`, {
                    method: 'POST', keepalive: true,
                    headers: {
                        'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json', 'Prefer': 'return=minimal',
                    },
                    body,
                });
            } catch (_) { /* best effort */ }
        });
    }

    fetchLobbyRooms();

    // Auto-refresh lobby every 5 s while lobby is visible.
    // Clear any previous interval so repeated calls to initSnookerOnline()
    // (e.g. switching between 2D / 3D in the hub) do not accumulate timers.
    if (SnookerOnline.lobbyInterval) clearInterval(SnookerOnline.lobbyInterval);
    SnookerOnline.lobbyInterval = setInterval(() => {
        if (document.getElementById('snooker-online-lobby')?.offsetParent !== null) {
            fetchLobbyRooms();
        }
    }, 5000);
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

async function fetchLobbyRooms() {
    if (!SnookerOnline.sbClient) return;

    // Evict seats that haven't sent a heartbeat in 90 s (waiting rooms only).
    const stale = new Date(Date.now() - WAITING_ROOM_STALE_MS).toISOString();
    await Promise.all([
        SnookerOnline.sbClient.from('snooker_rooms')
            .update({ player1_id: null, player1_ready: false, p1_last_seen_at: null })
            .in('room_code', FIXED_ROOMS).eq('status', 'waiting')
            .lt('p1_last_seen_at', stale).not('player1_id', 'is', null),
        SnookerOnline.sbClient.from('snooker_rooms')
            .update({ player2_id: null, player2_ready: false, p2_last_seen_at: null })
            .in('room_code', FIXED_ROOMS).eq('status', 'waiting')
            .lt('p2_last_seen_at', stale).not('player2_id', 'is', null),
    ]);

    const { data: rooms, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('room_code, player1_id, player2_id, status, player1_ready, player2_ready, p1_last_seen_at, p2_last_seen_at, last_activity_at')
        .in('room_code', FIXED_ROOMS);

    if (error) { console.error('[SnookerLobby]', error); return; }

    FIXED_ROOMS.forEach(key => updateRoomCardUI(key, rooms?.find(r => r.room_code === key)));
}

function updateRoomCardUI(roomKey, room) {
    const statusEl  = document.getElementById(`snooker-room-status-${roomKey}`);
    const playersEl = document.getElementById(`snooker-room-players-${roomKey}`);
    const joinBtn   = document.getElementById(`snooker-room-join-${roomKey}`);
    if (!statusEl) return;

    if (!room) {
        statusEl.textContent  = '房間不存在';
        joinBtn.disabled      = true;
        return;
    }

    const map = { waiting: '等待中', playing: '對戰中', finished: '已結束' };
    statusEl.textContent  = map[room.status] || room.status;

    // Show each seat's state; mark as disconnected if heartbeat is stale (>90s)
    const p1Stale = room.status === 'waiting' && isSeatHeartbeatStale(room, 'player1', WAITING_ROOM_STALE_MS);
    const p2Stale = room.status === 'waiting' && isSeatHeartbeatStale(room, 'player2', WAITING_ROOM_STALE_MS);
    const abandoned = isRoomAbandoned(room, ACTIVE_ROOM_STALE_MS);
    const p1Label = !room.player1_id ? 'P1:空' : p1Stale ? 'P1:離' : 'P1:有';
    const p2Label = !room.player2_id ? 'P2:空' : p2Stale ? 'P2:離' : 'P2:有';
    playersEl.textContent = `${p1Label} / ${p2Label}`;

    const isFull = (room.player1_id && !p1Stale) && (room.player2_id && !p2Stale);
    const amIIn  = room.player1_id === SnookerOnline.clientId ||
                   room.player2_id === SnookerOnline.clientId;

    if (abandoned) {
        statusEl.textContent = '房間逾時';
    }

    joinBtn.disabled    = (isFull && !amIIn && !abandoned);
    joinBtn.textContent = amIIn ? '返回' : abandoned ? '接管' : isFull ? '已滿' : '加入';
}

// ─── Join ────────────────────────────────────────────────────────────────────

/** Resolve the local player's display name for DB storage. Priority:
 *  1. The #snooker-player-name input (2D lobby),
 *  2. The #player1-name input (3D game page),
 *  3. localStorage 'snooker_player_name',
 *  4. Fallback 'Player'. */
function resolveDisplayName() {
    const lobbyInput  = document.getElementById('snooker-player-name');
    const gameInput   = document.getElementById('player1-name');
    const fromInput   = (lobbyInput?.value || gameInput?.value || '').trim();
    if (fromInput) return fromInput;
    const fromStore   = (localStorage.getItem('snooker_player_name') || '').trim();
    if (fromStore)  return fromStore;
    return 'Player';
}

async function joinFixedRoom(roomKey) {
    if (!SnookerOnline.sbClient) return false;

    const { data: initialRoom, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !initialRoom) { showOnlineToast('房間不存在', 'error'); return false; }

    let room = initialRoom;
    const recovered = await reclaimAbandonedRoomDirect(room);
    if (recovered.ok) {
        room = recovered.room;
        fetchLobbyRooms();
    }

    const playerName = resolveDisplayName();
    const { data, error: rpcErr } = await SnookerOnline.sbClient.rpc('join_snooker_room', {
        p_room_id: room.id,
        p_client_id: SnookerOnline.clientId,
        p_client_name: playerName
    });

    if ((rpcErr && !isRpcMissing(rpcErr)) || data?.error) {
        const errMsg = (rpcErr && rpcErr.message) || (data && data.error);
        console.error('[SnookerOnline] join RPC error:', errMsg);
        if (errMsg === 'room_full') {
            showOnlineToast('房間已滿', 'warn');
        } else {
            showOnlineToast('加入失敗: ' + errMsg, 'error');
        }
        fetchLobbyRooms();
        return false;
    }

    let joined = data;
    if (rpcErr && isRpcMissing(rpcErr)) {
        console.warn('[SnookerOnline] join RPC missing; falling back to direct room claim');
        const fallback = await joinRoomDirect(room, playerName);
        if (!fallback.ok) {
            const errMsg = fallback.reason || 'fallback_join_failed';
            console.error('[SnookerOnline] join fallback error:', errMsg);
            showOnlineToast(errMsg === 'room_full' ? '房間已滿' : ('加入失敗: ' + errMsg), errMsg === 'room_full' ? 'warn' : 'error');
            fetchLobbyRooms();
            return false;
        }
        joined = fallback;
    }

    const { role, room: freshRoom } = joined;
    Object.assign(room, freshRoom);
    SnookerOnline.hasSeat       = true;
    SnookerOnline.roomKey       = roomKey;
    SnookerOnline.roomUuid      = room.id;
    SnookerOnline.playerRole    = role;
    SnookerOnline.currentRoundId = room.round_id || 0;
    SnookerOnline.appliedShotIds.clear();
    SnookerOnline.gameStartedAt = null;

    console.log('[SnookerOnline] Joined as', role, 'in room', roomKey);

    enterRoomView(room);
    subscribeToRoom();
    subscribeToShots();
    startHeartbeat();
    startRoomPoll();
    return true;
}

// ─── Room View ───────────────────────────────────────────────────────────────

function enterRoomView(room) {
    document.getElementById('snooker-online-lobby')?.classList.add('hidden');
    document.getElementById('snooker-online-room')?.classList.remove('hidden');
    renderRoomState(room);
}

function renderRoomState(room) {
    if (!room) return;
    window.snookerCurrentRoom = room;

    // Detect round change → clear applied shots
    const newRoundId = room.round_id || 0;
    if (SnookerOnline.currentRoundId !== null && newRoundId !== SnookerOnline.currentRoundId) {
        console.log('[SnookerOnline] New round detected:', SnookerOnline.currentRoundId, '->', newRoundId);
        SnookerOnline.appliedShotIds.clear();
    }
    SnookerOnline.currentRoundId = newRoundId;

    // Room header
    const roomIdEl = document.getElementById('snooker-room-id');
    const roleEl   = document.getElementById('snooker-my-role');
    if (roomIdEl) roomIdEl.textContent = SnookerOnline.roomKey;
    if (roleEl)   roleEl.textContent   = SnookerOnline.playerRole === 'player1' ? 'P1'
                                       : SnookerOnline.playerRole === 'player2' ? 'P2' : '-';

    // Waiting message
    const hasOpponent = room.player1_id && room.player2_id;
    const waitEl = document.getElementById('snooker-waiting-msg');
    if (waitEl) {
        waitEl.textContent    = hasOpponent ? '' : '等待對手加入...';
        waitEl.style.display  = hasOpponent ? 'none' : 'block';
    }

    // Ready status
    const p1ReadyEl = document.getElementById('snooker-p1-ready');
    const p2ReadyEl = document.getElementById('snooker-p2-ready');
    if (p1ReadyEl) p1ReadyEl.textContent = `P1: ${room.player1_id ? (room.player1_ready ? '✓ 已準備' : '等待準備') : '空位'}`;
    if (p2ReadyEl) p2ReadyEl.textContent = `P2: ${room.player2_id ? (room.player2_ready ? '✓ 已準備' : '等待準備') : '空位'}`;

    const readyBtn = document.getElementById('snooker-ready-btn');
    if (readyBtn) {
        const myReady = SnookerOnline.playerRole === 'player1' ? room.player1_ready
                      : SnookerOnline.playerRole === 'player2' ? room.player2_ready : false;
        readyBtn.textContent = myReady ? '取消準備' : '準備';
        // UX FIX: allow pre-readying even before opponent joins.
        // The game-start check still requires BOTH players ready, so this is safe.
        readyBtn.disabled = !SnookerOnline.playerRole;
    }

    const readyArea = document.getElementById('snooker-ready-area');
    if (readyArea) readyArea.classList.toggle('hidden', room.status !== 'waiting');

    const rematchBtn = document.getElementById('snooker-rematch-btn');
    if (rematchBtn) rematchBtn.classList.toggle('hidden', room.status !== 'finished');

    // ── Rematch: when status returns to 'waiting' after a completed game
    // (round_id > 0), bring the room panel back into view so both players
    // can click Ready again.  The overlay IDs differ between 2D and 3D pages
    // but the inner room / lobby panel IDs are normalised by each page.
    // Guard with lastObservedStatus so a late/duplicate 'waiting' update that
    // arrives after we've already transitioned to 'playing' does NOT hide the
    // live game canvas.
    const lastStatus = SnookerOnline.lastObservedStatus || null;
    if (room.status === 'waiting' && newRoundId > 0 && lastStatus !== 'playing') {
        const overlayId = SnookerOnline.gameMode === '3d'
            ? 'snooker3d-online-overlay'
            : 'snooker-online-overlay';
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('hidden');
            document.getElementById('snooker-online-lobby')?.classList.add('hidden');
            document.getElementById('snooker-online-room')?.classList.remove('hidden');
        }
        // Restart room poll for the new waiting phase — it was stopped when
        // the previous game transitioned away from waiting.
        if (!SnookerOnline.roomPollInterval) startRoomPoll();
    }
    SnookerOnline.lastObservedStatus = room.status;

    // ── Both players ready → transition to 'playing' ──────────────────────────
    // Either player can trigger this; eq('status','waiting') makes it race-safe
    // so only the first UPDATE wins (the second is a silent no-op).
    // IMPORTANT: we also call snookerOnlineRoomUpdate('playing') directly from
    // the UPDATE callback so the game starts immediately without waiting for a
    // Supabase realtime delivery that may be slow or dropped.
    if (room.status === 'waiting' && room.player1_ready && room.player2_ready &&
        SnookerOnline.roomUuid && SnookerOnline.sbClient) {
        const p1Name = room.player1_name || 'P1';
        const p2Name = room.player2_name || 'P2';
        const myRole = SnookerOnline.playerRole;
        const applyStart = () => {
            SnookerOnline.gameStartedAt = new Date().toISOString();
            // Clear dedup set so any shots that arrived (via realtime) before the game
            // was initialised — and were silently dropped because isOnlineMode/gameStarted
            // were false — are not permanently blacklisted. fetchMissingShotsOnce() below
            // will re-fetch and correctly apply them after the game is live.
            SnookerOnline.appliedShotIds.clear();
            sessionStorage.setItem('snooker_active_room', SnookerOnline.roomKey); // Persist for auto-rejoin
            startShotPoll();
            if (window.snookerOnlineRoomUpdate) {
                window.snookerOnlineRoomUpdate({
                    status: 'playing',
                    players: [{ name: p1Name, role: 'player1' }, { name: p2Name, role: 'player2' }],
                    myRole,
                    room
                });
            }
            // Fetch missed shots AFTER snookerOnlineRoomUpdate sets isOnlineMode=true
            // and gameStarted=true so applyIncomingShotEvent doesn't silently dedup shots
            // that it then drops because the game hasn't started yet.
            fetchMissingShotsOnce();
        };
        // Use server-validated RPC, fall back to direct UPDATE if not deployed
        SnookerOnline.sbClient.rpc('start_snooker_game', {
            p_room_id: SnookerOnline.roomUuid, p_client_id: SnookerOnline.clientId,
        }).then(({ data, error }) => {
            if (!error && data?.ok) { applyStart(); return; }
            if (data?.skipped) return;
            if (data?.error) {
                // Server rejected explicitly (e.g. not_all_ready, not_a_member).
                // Stay at waiting screen — do not start the game.
                console.warn('[SnookerOnline] start_snooker_game rejected:', data.error);
                return;
            }
            // Fallback if RPC not deployed
            if (error?.code === 'PGRST202' || error?.message?.includes('Could not find')) {
                SnookerOnline.sbClient.from('snooker_rooms')
                    .update({
                        status: 'playing',
                        current_turn: 'player1',
                        last_activity_at: new Date().toISOString(),
                    })
                    .eq('id', SnookerOnline.roomUuid).eq('status', 'waiting')
                    .select()
                    .then(({ data, error: e2 }) => {
                        // Only one of the two racing clients wins the .eq(status,waiting)
                        // guard; the loser gets an empty array. Treat empty data as
                        // "someone else already started" and skip the start callback.
                        if (!e2 && data?.length) applyStart();
                    });
            } else if (error) {
                console.error('[SnookerOnline] start_snooker_game unexpected error:', error);
            }
        });
        return; // skip the generic notify below; we'll notify via the async callback
    }

    // Start shot recovery polling when we see the playing state
    // (covers the non-trigger player who receives it via realtime/poll)
    // Track first transition to 'playing' so we defer fetchMissingShotsOnce()
    // until AFTER snookerOnlineRoomUpdate sets isOnlineMode/gameStarted = true.
    const isFirstPlayingTransition = room.status === 'playing' && !SnookerOnline.shotPollInterval;
    if (isFirstPlayingTransition) {
        if (!SnookerOnline.gameStartedAt) SnookerOnline.gameStartedAt = new Date().toISOString();
        // Clear dedup set so shots that arrived via realtime before the game was
        // initialised (and were dropped because isOnlineMode/gameStarted were false)
        // are not permanently blacklisted. fetchMissingShotsOnce() below re-fetches.
        SnookerOnline.appliedShotIds.clear();
        startShotPoll();
        // fetchMissingShotsOnce() intentionally deferred to after snookerOnlineRoomUpdate
    }
    // Stop shot polling when game is no longer playing
    if (room.status !== 'playing' && SnookerOnline.shotPollInterval) {
        stopShotPoll();
    }

    // Notify the game for all non-start state changes
    if (window.snookerOnlineRoomUpdate) {
        const p1Name = room.player1_name || 'P1';
        const p2Name = room.player2_name || 'P2';
        window.snookerOnlineRoomUpdate({
            status:  room.status,
            players: [{ name: p1Name, role: 'player1' }, { name: p2Name, role: 'player2' }],
            myRole:  SnookerOnline.playerRole,
            room:    room
        });
    }

    // Fetch missed shots AFTER snookerOnlineRoomUpdate so isOnlineMode/gameStarted
    // are true and applyIncomingShotEvent can actually apply (not just dedup) them.
    if (isFirstPlayingTransition) {
        fetchMissingShotsOnce();
    }
}

// ─── Ready ───────────────────────────────────────────────────────────────────

let _readyDebouncing = false;
async function toggleReady() {
    if (_readyDebouncing) return;
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
    _readyDebouncing = true;

    const { error } = await SnookerOnline.sbClient.rpc('toggle_snooker_ready', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });

    let directRoom = null;
    if (error) {
        if (!isRpcMissing(error)) {
            console.error('[SnookerOnline] toggleReady error:', error);
            _readyDebouncing = false;
            return;
        }
        console.warn('[SnookerOnline] toggle_snooker_ready RPC missing; falling back to direct update');
        const fallback = await toggleReadyDirect();
        if (!fallback.ok) {
            console.error('[SnookerOnline] toggleReady fallback error:', fallback.reason);
            _readyDebouncing = false;
            return;
        }
        directRoom = fallback.room || null;
    }

    // Re-fetch and run renderRoomState immediately so that whichever player
    // clicks ready last can trigger the transition without waiting for a
    // Supabase realtime delivery that may be slow or dropped.
    const fresh = directRoom || (await SnookerOnline.sbClient
        .from('snooker_rooms').select('*').eq('id', SnookerOnline.roomUuid).single()).data;
    if (fresh) renderRoomState(fresh);

    setTimeout(() => { _readyDebouncing = false; }, 1000);
}

// ─── Heartbeat ───────────────────────────────────────────────────────────────

// ─── Room-view poll (backup for unreliable realtime) ─────────────────────────
// While both players are in the waiting room but haven't started yet, realtime
// delivery may be dropped.  Polling every 1 s ensures P1 sees P2's join/ready
// state and the Ready button becomes clickable.

function startRoomPoll() {
    stopRoomPoll();
    SnookerOnline.roomPollInterval = setInterval(async () => {
        if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
        const { data: room } = await SnookerOnline.sbClient
            .from('snooker_rooms').select('*').eq('id', SnookerOnline.roomUuid).single();
        if (!room) return;
        if (room.status === 'waiting') {
            renderRoomState(room);
        } else {
            // Render once so clients that missed the realtime event pick up the transition
            renderRoomState(room);
            stopRoomPoll();
        }
    }, ROOM_POLL_MS);
}

function stopRoomPoll() {
    clearInterval(SnookerOnline.roomPollInterval);
    SnookerOnline.roomPollInterval = null;
}

function startHeartbeat() {
    stopHeartbeat();
    SnookerOnline.heartbeatInterval = setInterval(async () => {
        if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
        const { error } = await SnookerOnline.sbClient.rpc('ping_snooker_room', {
            p_room_id: SnookerOnline.roomUuid,
            p_client_id: SnookerOnline.clientId
        });
        if (error && isRpcMissing(error)) {
            await pingRoomDirect();
        }
    }, 15000);
}

function stopHeartbeat() {
    clearInterval(SnookerOnline.heartbeatInterval);
    SnookerOnline.heartbeatInterval = null;
}

// ─── Shot Sync ───────────────────────────────────────────────────────────────

/**
 * Send a shot to the opponent.
 * payload for 2D: { angle, power, spin_x, spin_y, cue_x, cue_y }
 * payload for 3D: { aim_dx, aim_dz, power, spin_x, spin_y, cue_x, cue_z }
 */
async function sendShot(payload) {
    await persistShotPayload(buildShotEnvelope('shot', payload), { label: 'SnookerShot', strictPlaying: true });
}

async function sendStateSnapshot(snapshot) {
    if (!snapshot) return;
    await persistShotPayload(buildShotEnvelope('state_sync', { snapshot }), {
        label: 'SnookerStateSync',
        strictPlaying: false,
    });
}

// ─── Realtime ────────────────────────────────────────────────────────────────

function subscribeToRoom() {
    if (SnookerOnline.roomChannel) SnookerOnline.sbClient.removeChannel(SnookerOnline.roomChannel);

    SnookerOnline.roomChannel = SnookerOnline.sbClient
        .channel(`snooker-room-${SnookerOnline.roomUuid}`)
        .on('postgres_changes', {
            event: '*', schema: 'public', table: 'snooker_rooms',
            filter: `id=eq.${SnookerOnline.roomUuid}`,
        }, (payload) => {
            console.log('[SnookerRT-ROOM]', payload.eventType, payload.new?.status);
            if (payload.new) renderRoomState(payload.new);
        })
        .subscribe((status, err) => {
            console.log('[SnookerRT-ROOM] subscribe status:', status);
            if (err) console.error('[SnookerRT-ROOM] error:', err);
            // Refetch after subscription to catch state changes that happened
            // between joining and subscription becoming active
            if (status === 'SUBSCRIBED') {
                SnookerOnline.sbClient.from('snooker_rooms').select('*')
                    .eq('id', SnookerOnline.roomUuid).single()
                    .then(({ data }) => { if (data) renderRoomState(data); });
            }
        });
}

function subscribeToShots() {
    if (SnookerOnline.shotsChannel) SnookerOnline.sbClient.removeChannel(SnookerOnline.shotsChannel);

    SnookerOnline.shotsChannel = SnookerOnline.sbClient
        .channel(`snooker-shots-${SnookerOnline.roomUuid}`)
        .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'snooker_shots',
            filter: `room_id=eq.${SnookerOnline.roomUuid}`,
        }, (payload) => {
            const shot = payload.new;
            applyIncomingShotEvent(shot);
        })
        .subscribe((status, err) => {
            console.log('[SnookerRT-SHOTS] subscribe status:', status);
            if (err) console.error('[SnookerRT-SHOTS] error:', err);
            if (status === 'SUBSCRIBED') {
                fetchMissingShotsOnce();
            }
        });
}

// ─── Shot Poll (backup for unreliable realtime during gameplay) ──────────────
// If the realtime channel drops a shot, the two clients permanently diverge.
// Polling every 1.5s for remote shots we haven't applied yet provides recovery.

function startShotPoll() {
    stopShotPoll();
    SnookerOnline.shotPollInterval = setInterval(async () => {
        await fetchMissingShotsOnce();
    }, SHOT_POLL_MS);
}

function stopShotPoll() {
    clearInterval(SnookerOnline.shotPollInterval);
    SnookerOnline.shotPollInterval = null;
}

// ─── Exit ────────────────────────────────────────────────────────────────────

async function exitFixedRoom() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) {
        cleanupAndLobby(); return;
    }

    // Always re-fetch fresh room state; window.snookerCurrentRoom can be stale,
    // especially when both players exit near-simultaneously (otherPlayerId would
    // be wrong and the room would get stuck in 'finished' with empty slots).
    const { data: freshRoom } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('player1_id, player2_id, status')
        .eq('id', SnookerOnline.roomUuid)
        .single();
    const room = freshRoom || window.snookerCurrentRoom;

    if (room?.status === 'playing') {
        if (!confirm('退出將判負，確定要離開？')) return;
        // Re-fetch after the dialog: the opponent may have exited during it,
        // changing the room status. Use the freshest state for the winner write.
        const { data: recheck } = await SnookerOnline.sbClient
            .from('snooker_rooms')
            .select('player1_id, player2_id, status')
            .eq('id', SnookerOnline.roomUuid)
            .single();
        if (recheck) Object.assign(room, recheck);
    }

    stopHeartbeat();
    // Stop polls before calling the exit RPC so no shot/room tick fires after
    // we've committed to leaving (avoids phantom renderRoomState calls on the
    // outgoing session).
    stopShotPoll();
    stopRoomPoll();

    const { error } = await SnookerOnline.sbClient.rpc('exit_snooker_room', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });
    if (error && isRpcMissing(error)) {
        const fallback = await exitRoomDirect(room || { id: SnookerOnline.roomUuid, status: 'waiting' });
        if (!fallback.ok) {
            console.error('[SnookerOnline] exit fallback error:', fallback.reason);
        }
    }
    
    // Also remove the active room from session storage so auto-rejoin doesn't fire
    sessionStorage.removeItem('snooker_active_room');

    cleanupAndLobby();
}

function cleanupAndLobby() {
    stopHeartbeat();
    stopShotPoll();
    stopRoomPoll();
    // Reset the ready-debounce latch so a stale setTimeout doesn't re-enable
    // it against a fresh session after navigating back into a room.
    _readyDebouncing = false;
    SnookerOnline.lastObservedStatus = null;
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.roomChannel);
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.shotsChannel);

    SnookerOnline.roomKey       = null;
    SnookerOnline.roomUuid      = null;
    SnookerOnline.playerRole    = null;
    SnookerOnline.roomChannel   = null;
    SnookerOnline.shotsChannel  = null;
    SnookerOnline.hasSeat       = false;
    SnookerOnline.appliedShotIds.clear();
    SnookerOnline.gameStartedAt = null;
    window.snookerCurrentRoom   = null;

    if (window.snookerOnlineRoomUpdate) {
        window.snookerOnlineRoomUpdate({ status: 'left' });
    }

    document.getElementById('snooker-online-room')?.classList.add('hidden');
    document.getElementById('snooker-online-lobby')?.classList.remove('hidden');
    fetchLobbyRooms();
}

// ─── Game Over (natural completion) ──────────────────────────────────────────

// Called by the game engine when the game ends naturally (all balls potted).
// winner: 1 = player1, 2 = player2, 0 = draw
window.snookerSignalGameOver = async function({ winner = 0, scores = [] } = {}) {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
    const winnerRole = winner === 1 ? 'player1' : winner === 2 ? 'player2' : null;
    // Only one client must write the result — otherwise the two peers can race
    // with divergent `winner` values if their scores briefly differ due to a
    // dropped snapshot. Rule: the winner writes, or on draw player1 writes.
    const iAmAuthoritative =
        (winnerRole && SnookerOnline.playerRole === winnerRole) ||
        (!winnerRole && SnookerOnline.playerRole === 'player1');
    if (!iAmAuthoritative) return;
    const { error } = await SnookerOnline.sbClient.rpc('signal_snooker_game_over', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId,
        p_winner_role: winnerRole
    });
    if (error) {
        if (isRpcMissing(error)) {
            const fallback = await signalGameOverDirect(winnerRole);
            if (!fallback.ok) {
                console.error('[SnookerOnline] signalGameOver fallback error:', fallback.reason);
            }
        } else {
            console.error('[SnookerOnline] signalGameOver error:', error);
        }
    }
};

// ─── Rematch ─────────────────────────────────────────────────────────────────

async function snookerRematch() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;

    // Order matters: bump round_id FIRST via reset RPC, then delete shot rows.
    // If we delete first then bump, a stray INSERT (carrying the OLD round_id)
    // landing in the gap would still pass isShotPayloadForCurrentRound on peers
    // that haven't re-rendered yet, leaking across rounds.
    const { error } = await SnookerOnline.sbClient.rpc('reset_snooker_room', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });
    let resetOk = !error;
    if (error && isRpcMissing(error)) {
        const fallback = await resetSnookerRoomDirect();
        if (!fallback.ok) {
            console.error('[SnookerOnline] rematch fallback error:', fallback.reason);
        } else {
            resetOk = true;
        }
    }
    if (!resetOk) return;

    SnookerOnline.appliedShotIds.clear();
    SnookerOnline.gameStartedAt = null;

    // Best-effort cleanup of the previous round's shot rows. Correctness does
    // NOT depend on this — round_id filtering already rejects stale rows — so
    // ignore failures.
    await SnookerOnline.sbClient.rpc('cleanup_snooker_shots', {
        p_room_id: SnookerOnline.roomUuid, p_client_id: SnookerOnline.clientId,
    });
    await SnookerOnline.sbClient.from('snooker_shots')
        .delete().eq('room_id', SnookerOnline.roomUuid);
    // currentRoundId will be updated by the next renderRoomState()
    // when the roomPoll detects the new round_id from the DB.
}

// ─── SQL Schema (for reference / first-time setup) ───────────────────────────
// Run once in Supabase SQL editor:
//
// CREATE TABLE IF NOT EXISTS snooker_rooms (
//   id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   room_code        text NOT NULL UNIQUE,
//   game_mode        text NOT NULL CHECK (game_mode IN ('2d','3d')),
//   player1_id       text,
//   player2_id       text,
//   player1_name     text,
//   player2_name     text,
//   p1_last_seen_at  timestamptz,
//   p2_last_seen_at  timestamptz,
//   player1_ready    boolean DEFAULT false,
//   player2_ready    boolean DEFAULT false,
//   status           text    DEFAULT 'waiting',
//   current_turn     text,
//   round_id         integer DEFAULT 0,
//   winner           text,
//   finished_reason  text,
//   finished_at      timestamptz,
//   last_activity_at timestamptz DEFAULT now()
// );
//
// ALTER TABLE snooker_rooms ENABLE ROW LEVEL SECURITY;
// DROP POLICY IF EXISTS "allow all" ON snooker_rooms;
// CREATE POLICY "allow all" ON snooker_rooms FOR ALL USING (true) WITH CHECK (true);
//
// -- Insert the 6 fixed rooms – 3 per variant (safe to re-run):
// INSERT INTO snooker_rooms (room_code, game_mode) VALUES
//   ('ROOM01','2d'), ('ROOM02','2d'), ('ROOM03','2d'),
//   ('3D-ROOM01','3d'), ('3D-ROOM02','3d'), ('3D-ROOM03','3d')
// ON CONFLICT (room_code) DO NOTHING;
//
// CREATE TABLE IF NOT EXISTS snooker_shots (
//   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   room_id     uuid REFERENCES snooker_rooms(id) ON DELETE CASCADE,
//   shot_no     integer,
//   player_role text,
//   payload     jsonb,
//   created_at  timestamptz DEFAULT now()
// );
//
// ALTER TABLE snooker_shots ENABLE ROW LEVEL SECURITY;
// DROP POLICY IF EXISTS "allow all" ON snooker_shots;
// CREATE POLICY "allow all" ON snooker_shots FOR ALL USING (true) WITH CHECK (true);
//
// -- Auto shot_no trigger (safe to re-run):
// CREATE OR REPLACE FUNCTION set_snooker_shot_no() RETURNS trigger LANGUAGE plpgsql AS $$
// BEGIN
//   SELECT COALESCE(MAX(shot_no),0)+1 INTO NEW.shot_no FROM snooker_shots WHERE room_id = NEW.room_id;
//   RETURN NEW;
// END; $$;
// DROP TRIGGER IF EXISTS trg_snooker_shot_no ON snooker_shots;
// CREATE TRIGGER trg_snooker_shot_no BEFORE INSERT ON snooker_shots
//   FOR EACH ROW EXECUTE FUNCTION set_snooker_shot_no();
//
// -- Stale cleanup RPC (optional, called every 30 s from client)
// CREATE OR REPLACE FUNCTION clean_stale_snooker_rooms() RETURNS void LANGUAGE plpgsql AS $$
// BEGIN
//   UPDATE snooker_rooms SET
//     player1_id=null, player1_ready=false, p1_last_seen_at=null
//   WHERE player1_id IS NOT NULL
//     AND p1_last_seen_at < now() - interval '45 seconds'
//     AND status = 'waiting';
//   UPDATE snooker_rooms SET
//     player2_id=null, player2_ready=false, p2_last_seen_at=null
//   WHERE player2_id IS NOT NULL
//     AND p2_last_seen_at < now() - interval '45 seconds'
//     AND status = 'waiting';
// END; $$;

// ─── Expose ──────────────────────────────────────────────────────────────────

window.initSnookerOnline  = initSnookerOnline;
window.snookerRematch     = snookerRematch;
// BUG FIX: expose SnookerOnline object so lobby inline scripts can set
// _intentionalRedirect = true before redirecting (const is not on window).
window.SnookerOnline      = SnookerOnline;
Object.defineProperty(window, 'snookerPlayerRole', { get: () => SnookerOnline.playerRole });
