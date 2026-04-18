-- =============================================================================
-- 008_reconcile_snooker_room_rpcs_and_abandoned_cleanup.sql
--
-- Purpose:
--   1. Re-create all Snooker room-lifecycle RPCs expected by the frontend.
--   2. Reconcile common schema drift in production-style environments.
--   3. Reset abandoned playing/finished rooms so fixed lobbies do not stay full
--      forever after browser crashes or missing unload hooks.
--
-- Safe to re-run:
--   - Uses ALTER TABLE ... IF NOT EXISTS and CREATE OR REPLACE FUNCTION.
-- =============================================================================

ALTER TABLE snooker_rooms
    ADD COLUMN IF NOT EXISTS player1_name text,
    ADD COLUMN IF NOT EXISTS player2_name text,
    ADD COLUMN IF NOT EXISTS p1_last_seen_at timestamptz,
    ADD COLUMN IF NOT EXISTS p2_last_seen_at timestamptz,
    ADD COLUMN IF NOT EXISTS player1_ready boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS player2_ready boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting',
    ADD COLUMN IF NOT EXISTS current_turn text,
    ADD COLUMN IF NOT EXISTS round_id integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS winner text,
    ADD COLUMN IF NOT EXISTS finished_reason text,
    ADD COLUMN IF NOT EXISTS finished_at timestamptz,
    ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();

ALTER TABLE snooker_shots
    ADD COLUMN IF NOT EXISTS client_ip text;

CREATE OR REPLACE FUNCTION clean_stale_snooker_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_waiting_cutoff timestamptz := now() - interval '90 seconds';
    v_abandoned_cutoff timestamptz := now() - interval '5 minutes';
BEGIN
    UPDATE snooker_rooms
    SET player1_id = NULL,
        player1_name = NULL,
        player1_ready = FALSE,
        p1_last_seen_at = NULL,
        last_activity_at = now()
    WHERE status = 'waiting'
      AND player1_id IS NOT NULL
      AND p1_last_seen_at < v_waiting_cutoff;

    UPDATE snooker_rooms
    SET player2_id = NULL,
        player2_name = NULL,
        player2_ready = FALSE,
        p2_last_seen_at = NULL,
        last_activity_at = now()
    WHERE status = 'waiting'
      AND player2_id IS NOT NULL
      AND p2_last_seen_at < v_waiting_cutoff;

    WITH abandoned AS (
        UPDATE snooker_rooms
        SET status = 'waiting',
            player1_id = NULL,
            player2_id = NULL,
            player1_name = NULL,
            player2_name = NULL,
            player1_ready = FALSE,
            player2_ready = FALSE,
            p1_last_seen_at = NULL,
            p2_last_seen_at = NULL,
            current_turn = NULL,
            winner = NULL,
            finished_reason = NULL,
            finished_at = NULL,
            round_id = COALESCE(round_id, 0) + 1,
            last_activity_at = now()
        WHERE status IN ('playing', 'finished')
          AND COALESCE(last_activity_at, '-infinity'::timestamptz) < v_abandoned_cutoff
          AND COALESCE(p1_last_seen_at, '-infinity'::timestamptz) < v_abandoned_cutoff
          AND COALESCE(p2_last_seen_at, '-infinity'::timestamptz) < v_abandoned_cutoff
        RETURNING id
    )
    DELETE FROM snooker_shots
    WHERE room_id IN (SELECT id FROM abandoned);
END;
$$;

GRANT EXECUTE ON FUNCTION clean_stale_snooker_rooms() TO service_role;

CREATE OR REPLACE FUNCTION join_snooker_room(
    p_room_id uuid,
    p_client_id text,
    p_client_name text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_role text;
    v_round_id integer;
    v_reset_occurred boolean := false;
    v_abandoned boolean := false;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    v_abandoned := v_room.status IN ('playing', 'finished')
        AND COALESCE(v_room.last_activity_at, '-infinity'::timestamptz) < now() - interval '5 minutes'
        AND COALESCE(v_room.p1_last_seen_at, '-infinity'::timestamptz) < now() - interval '5 minutes'
        AND COALESCE(v_room.p2_last_seen_at, '-infinity'::timestamptz) < now() - interval '5 minutes';

    IF v_abandoned THEN
        UPDATE snooker_rooms
        SET status = 'waiting',
            player1_id = NULL,
            player2_id = NULL,
            player1_name = NULL,
            player2_name = NULL,
            player1_ready = FALSE,
            player2_ready = FALSE,
            p1_last_seen_at = NULL,
            p2_last_seen_at = NULL,
            current_turn = NULL,
            winner = NULL,
            finished_reason = NULL,
            finished_at = NULL,
            round_id = COALESCE(v_room.round_id, 0) + 1,
            last_activity_at = now()
        WHERE id = p_room_id;

        DELETE FROM snooker_shots WHERE room_id = p_room_id;
        v_reset_occurred := true;

        SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    END IF;

    IF v_room.player1_id = p_client_id THEN
        v_role := 'player1';
        UPDATE snooker_rooms
        SET player1_name = p_client_name,
            p1_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSIF v_room.player2_id = p_client_id THEN
        v_role := 'player2';
        UPDATE snooker_rooms
        SET player2_name = p_client_name,
            p2_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSIF v_room.player1_id IS NULL THEN
        v_role := 'player1';
        UPDATE snooker_rooms
        SET player1_id = p_client_id,
            player1_name = p_client_name,
            player1_ready = FALSE,
            p1_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;

        IF v_room.status <> 'waiting' THEN
            v_round_id := COALESCE(v_room.round_id, 0) + 1;
            UPDATE snooker_rooms
            SET status = 'waiting',
                player1_ready = FALSE,
                player2_ready = FALSE,
                current_turn = NULL,
                winner = NULL,
                finished_reason = NULL,
                finished_at = NULL,
                round_id = v_round_id,
                last_activity_at = now()
            WHERE id = p_room_id;
            DELETE FROM snooker_shots WHERE room_id = p_room_id;
            v_reset_occurred := true;
        END IF;
    ELSIF v_room.player2_id IS NULL THEN
        v_role := 'player2';
        UPDATE snooker_rooms
        SET player2_id = p_client_id,
            player2_name = p_client_name,
            player2_ready = FALSE,
            p2_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;

        IF v_room.status <> 'waiting' THEN
            v_round_id := COALESCE(v_room.round_id, 0) + 1;
            UPDATE snooker_rooms
            SET status = 'waiting',
                player1_ready = FALSE,
                player2_ready = FALSE,
                current_turn = NULL,
                winner = NULL,
                finished_reason = NULL,
                finished_at = NULL,
                round_id = v_round_id,
                last_activity_at = now()
            WHERE id = p_room_id;
            DELETE FROM snooker_shots WHERE room_id = p_room_id;
            v_reset_occurred := true;
        END IF;
    ELSE
        RETURN jsonb_build_object('error', 'room_full');
    END IF;

    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id;
    RETURN jsonb_build_object(
        'ok', true,
        'role', v_role,
        'room', row_to_json(v_room),
        'reset', v_reset_occurred
    );
END;
$$;
GRANT EXECUTE ON FUNCTION join_snooker_room(uuid, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION toggle_snooker_ready(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.player1_id = p_client_id THEN
        UPDATE snooker_rooms
        SET player1_ready = NOT player1_ready,
            p1_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSIF v_room.player2_id = p_client_id THEN
        UPDATE snooker_rooms
        SET player2_ready = NOT player2_ready,
            p2_last_seen_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSE
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION toggle_snooker_ready(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION ping_snooker_room(
    p_room_id uuid,
    p_client_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE snooker_rooms
    SET p1_last_seen_at = now(),
        last_activity_at = now()
    WHERE id = p_room_id
      AND player1_id = p_client_id;

    UPDATE snooker_rooms
    SET p2_last_seen_at = now(),
        last_activity_at = now()
    WHERE id = p_room_id
      AND player2_id = p_client_id;
END;
$$;
GRANT EXECUTE ON FUNCTION ping_snooker_room(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION start_snooker_game(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status <> 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;
    IF p_client_id NOT IN (COALESCE(v_room.player1_id, ''), COALESCE(v_room.player2_id, '')) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;
    IF NOT (
        v_room.player1_ready AND v_room.player2_ready
        AND v_room.player1_id IS NOT NULL
        AND v_room.player2_id IS NOT NULL
    ) THEN
        RETURN jsonb_build_object('error', 'not_all_ready');
    END IF;

    UPDATE snooker_rooms
    SET status = 'playing',
        current_turn = 'player1',
        last_activity_at = now()
    WHERE id = p_room_id
      AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION start_snooker_game(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION exit_snooker_room(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_role text;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id = p_client_id THEN
        v_role := 'player1';
    ELSIF v_room.player2_id = p_client_id THEN
        v_role := 'player2';
    ELSE
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    IF v_room.status = 'playing' THEN
        UPDATE snooker_rooms
        SET status = 'finished',
            winner = CASE WHEN v_role = 'player1' THEN 'player2' ELSE 'player1' END,
            finished_reason = 'opponent_left',
            finished_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSE
        IF v_role = 'player1' THEN
            UPDATE snooker_rooms
            SET player1_id = NULL,
                player1_name = NULL,
                player1_ready = FALSE,
                p1_last_seen_at = NULL,
                last_activity_at = now()
            WHERE id = p_room_id;
        ELSE
            UPDATE snooker_rooms
            SET player2_id = NULL,
                player2_name = NULL,
                player2_ready = FALSE,
                p2_last_seen_at = NULL,
                last_activity_at = now()
            WHERE id = p_room_id;
        END IF;

        SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id;
        IF v_room.player1_id IS NULL AND v_room.player2_id IS NULL AND v_room.status <> 'waiting' THEN
            UPDATE snooker_rooms
            SET status = 'waiting',
                current_turn = NULL,
                winner = NULL,
                finished_reason = NULL,
                finished_at = NULL,
                round_id = COALESCE(v_room.round_id, 0) + 1,
                last_activity_at = now()
            WHERE id = p_room_id;
            DELETE FROM snooker_shots WHERE room_id = p_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION exit_snooker_room(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION signal_snooker_game_over(
    p_room_id uuid,
    p_client_id text,
    p_winner_role text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id <> p_client_id AND v_room.player2_id <> p_client_id THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    IF v_room.status = 'playing' THEN
        UPDATE snooker_rooms
        SET status = 'finished',
            winner = p_winner_role,
            finished_reason = 'completed',
            finished_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION signal_snooker_game_over(uuid, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION cleanup_snooker_shots(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
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

    DELETE FROM snooker_shots WHERE room_id = p_room_id;
    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION cleanup_snooker_shots(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION reset_snooker_room(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_round_id integer;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id <> p_client_id AND v_room.player2_id <> p_client_id THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    IF v_room.status = 'finished' THEN
        v_round_id := COALESCE(v_room.round_id, 0) + 1;
        UPDATE snooker_rooms
        SET status = 'waiting',
            player1_ready = FALSE,
            player2_ready = FALSE,
            current_turn = NULL,
            winner = NULL,
            finished_reason = NULL,
            finished_at = NULL,
            round_id = v_round_id,
            last_activity_at = now()
        WHERE id = p_room_id;

        DELETE FROM snooker_shots WHERE room_id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION reset_snooker_room(uuid, text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
