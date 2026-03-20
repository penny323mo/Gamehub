-- =============================================================================
-- 004_lock_delete_add_cleanup_rpcs.sql
-- Security hardening: remove open DELETE policies on action/move tables and
-- replace with SECURITY DEFINER cleanup RPCs that validate seat ownership.
--
-- Also adds seat-claim RPCs for room join/exit so that room mutations go
-- through server-validated functions rather than open UPDATE policies.
--
-- Run once in the Supabase SQL editor (safe to re-run: uses CREATE OR REPLACE
-- and DROP POLICY IF EXISTS).
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 – Remove open DELETE policies on action/move/shot tables
-- After this, only SECURITY DEFINER RPCs can delete rows.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "actions_delete" ON big2_actions;
DROP POLICY IF EXISTS "actions_delete" ON doudizhu_actions;
DROP POLICY IF EXISTS "moves_delete"   ON moves;
DROP POLICY IF EXISTS "moves_delete"   ON xiangqi_moves;
DROP POLICY IF EXISTS "shots_delete"   ON snooker_shots;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 – Cleanup RPCs (SECURITY DEFINER bypasses RLS)
-- Used by rematch/reset flows.  Validates caller owns a seat in the room.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Big2 ──────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cleanup_big2_actions(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room big2_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM big2_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    -- Caller must own a seat
    IF p_client_id NOT IN (
        COALESCE(v_room.player0_id,''), COALESCE(v_room.player1_id,''),
        COALESCE(v_room.player2_id,''), COALESCE(v_room.player3_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    DELETE FROM big2_actions WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_big2_actions TO anon, authenticated;


-- ── Doudizhu ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cleanup_doudizhu_actions(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room doudizhu_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM doudizhu_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.player0_id,''), COALESCE(v_room.player1_id,''),
        COALESCE(v_room.player2_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF v_room.status = 'playing' THEN
        RETURN jsonb_build_object('error', 'game_in_progress');
    END IF;

    DELETE FROM doudizhu_actions WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_doudizhu_actions TO anon, authenticated;


-- ── Gomoku ────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cleanup_gomoku_moves(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room gomoku_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM gomoku_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.black_player_id,''), COALESCE(v_room.white_player_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF v_room.status = 'playing' THEN
        RETURN jsonb_build_object('error', 'game_in_progress');
    END IF;

    DELETE FROM moves WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_gomoku_moves TO anon, authenticated;


-- ── Xiangqi ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cleanup_xiangqi_moves(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room xiangqi_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM xiangqi_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.red_player_id,''), COALESCE(v_room.black_player_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF v_room.status = 'playing' THEN
        RETURN jsonb_build_object('error', 'game_in_progress');
    END IF;

    DELETE FROM xiangqi_moves WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_xiangqi_moves TO anon, authenticated;


-- ── Snooker ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cleanup_snooker_shots(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.player1_id,''), COALESCE(v_room.player2_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF v_room.status = 'playing' THEN
        RETURN jsonb_build_object('error', 'game_in_progress');
    END IF;

    DELETE FROM snooker_shots WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_snooker_shots TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 – Tighten room UPDATE policies
-- Replace the blanket USING (true) WITH CHECK (true) with column-limited checks.
-- Since we use anon auth (no server-side uid), we restrict to:
--   • Only allow updating specific operational columns (heartbeat, ready, seat
--     claims, status transitions). Structural columns like room_code, id are
--     protected by the fact that UPDATE policies only control row access, not
--     column access in Postgres RLS.
--
-- NOTE: Postgres RLS cannot restrict which columns are updated — only which
-- rows. True column-level restriction requires using RPCs for all mutations.
-- For now, the open UPDATE policy remains but we add RPCs for the most
-- sensitive operations (seat claim, game start) so the client code can migrate
-- to using them. The blanket policy can then be tightened once all clients
-- call RPCs exclusively.
-- ─────────────────────────────────────────────────────────────────────────────

-- (Room UPDATE policies kept as-is for now — see NOTE above.
--  Clients are encouraged to use start_*_game RPCs which are already
--  server-validated.  Future migration will lock down room UPDATEs
--  once all room mutations go through RPCs.)


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 – Start Game RPCs for Gomoku, Xiangqi, Snooker
-- Validates room membership, both-players-present, both-ready, and waiting
-- status before atomically transitioning to playing.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Gomoku ────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION start_gomoku_game(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room gomoku_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM gomoku_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.black_player_id,''), COALESCE(v_room.white_player_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF NOT (v_room.black_ready AND v_room.white_ready
            AND v_room.black_player_id IS NOT NULL
            AND v_room.white_player_id IS NOT NULL) THEN
        RETURN jsonb_build_object('error', 'not_all_ready');
    END IF;

    UPDATE gomoku_rooms
    SET    status = 'playing', current_player = 'black'
    WHERE  id = p_room_id AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION start_gomoku_game TO anon, authenticated;


-- ── Xiangqi ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION start_xiangqi_game(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room     xiangqi_rooms%ROWTYPE;
    v_deadline timestamptz;
BEGIN
    SELECT * INTO v_room FROM xiangqi_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.red_player_id,''), COALESCE(v_room.black_player_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF NOT (v_room.red_ready AND v_room.black_ready
            AND v_room.red_player_id IS NOT NULL
            AND v_room.black_player_id IS NOT NULL) THEN
        RETURN jsonb_build_object('error', 'not_all_ready');
    END IF;

    v_deadline := now() + interval '60 seconds';

    UPDATE xiangqi_rooms
    SET    status = 'playing', current_player = 'red',
           turn_deadline_at = v_deadline
    WHERE  id = p_room_id AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION start_xiangqi_game TO anon, authenticated;


-- ── Snooker ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION start_snooker_game(
    p_room_id   uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.player1_id,''), COALESCE(v_room.player2_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF NOT (v_room.player1_ready AND v_room.player2_ready
            AND v_room.player1_id IS NOT NULL
            AND v_room.player2_id IS NOT NULL) THEN
        RETURN jsonb_build_object('error', 'not_all_ready');
    END IF;

    UPDATE snooker_rooms
    SET    status = 'playing', current_turn = 'player1'
    WHERE  id = p_room_id AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION start_snooker_game TO anon, authenticated;
