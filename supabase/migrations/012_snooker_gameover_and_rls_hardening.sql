-- =============================================================================
-- 012_snooker_gameover_and_rls_hardening.sql
-- Hardens three correctness / security gaps found in the online-mode audit:
--
--   1. signal_snooker_game_over: add winner IS NULL guard so a concurrent or
--      duplicate call cannot overwrite a result that has already been recorded.
--
--   2. cleanup_snooker_shots: accept an optional p_round_id parameter; when
--      supplied, only delete shots whose round_id matches (older rows from
--      previous rematches). The current behaviour of deleting all shots for the
--      room is preserved when p_round_id is omitted (NULL) for compatibility.
--      NOTE: the client in online.js calls this without round_id and the status
--      guard (game_in_progress) already prevents racing against live shots, so
--      this is belt-and-suspenders for future callers.
--
--   3. rooms_update RLS / column grants: revoke the broad UPDATE privilege and
--      re-grant it only for the seat and heartbeat columns that legitimate
--      client paths write directly. Game-control columns (status, winner,
--      round_id, current_turn, finished_*) are writable only by SECURITY
--      DEFINER RPCs, which bypass both RLS and column-level grants.
--      IMPORTANT: the legacy start_snooker_game fallback in online.js that
--      does `.update({ status: 'playing' })` will be RLS-denied after this
--      migration. That path is only reached when start_snooker_game RPC is
--      missing (PGRST202). Since migration 008 deploys that RPC, any
--      environment that has run migrations 008–012 in order will never hit the
--      fallback.
--
-- Idempotent – safe to re-run.
-- =============================================================================

-- 1. signal_snooker_game_over: winner IS NULL guard -------------------------

CREATE OR REPLACE FUNCTION signal_snooker_game_over(
    p_room_id     uuid,
    p_client_id   text,
    p_winner_role text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id <> p_client_id AND v_room.player2_id <> p_client_id THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    -- Only write if the game is still in progress AND no winner has been set.
    -- The FOR UPDATE lock serialises concurrent calls; the second caller sees
    -- status='finished' (or winner IS NOT NULL) and skips safely.
    IF v_room.status = 'playing' AND v_room.winner IS NULL THEN
        UPDATE snooker_rooms
           SET status          = 'finished',
               winner          = p_winner_role,
               finished_reason = 'completed',
               finished_at     = now(),
               last_activity_at = now()
         WHERE id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION signal_snooker_game_over(uuid, text, text) TO anon, authenticated;


-- 2. cleanup_snooker_shots: optional round_id filter -----------------------

CREATE OR REPLACE FUNCTION cleanup_snooker_shots(
    p_room_id   uuid,
    p_client_id text,
    p_round_id  integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF p_client_id NOT IN (COALESCE(v_room.player1_id, ''), COALESCE(v_room.player2_id, '')) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    IF v_room.status = 'playing' THEN
        RETURN jsonb_build_object('error', 'game_in_progress');
    END IF;

    IF p_round_id IS NOT NULL THEN
        -- Targeted delete: only shots tagged to this round (previous-round leftovers).
        DELETE FROM snooker_shots
         WHERE room_id = p_room_id
           AND (payload->>'round_id')::integer = p_round_id;
    ELSE
        -- Legacy behaviour: delete all shots for the room.
        DELETE FROM snooker_shots WHERE room_id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_snooker_shots(uuid, text, integer) TO anon, authenticated;
-- Keep the old 2-arg signature callable for existing callers (online.js).
GRANT EXECUTE ON FUNCTION cleanup_snooker_shots(uuid, text) TO anon, authenticated;


-- 3. Column-level hardening on snooker_rooms --------------------------------
--
-- Revoke the catch-all UPDATE privilege and re-grant only for the columns
-- that client code is permitted to write directly (seat assignment + heartbeat
-- timestamps). All game-control columns (status, winner, round_id, …) must go
-- through SECURITY DEFINER RPCs.

REVOKE UPDATE ON TABLE public.snooker_rooms FROM anon, authenticated;

GRANT UPDATE (
    player1_id,
    player1_name,
    player1_ready,
    p1_last_seen_at,
    player2_id,
    player2_name,
    player2_ready,
    p2_last_seen_at,
    last_activity_at
) ON TABLE public.snooker_rooms TO anon, authenticated;

-- The rooms_update RLS policy (from migration 009) remains; it still governs
-- which ROWS clients can touch.  Column grants above now govern which COLUMNS.

NOTIFY pgrst, 'reload schema';
