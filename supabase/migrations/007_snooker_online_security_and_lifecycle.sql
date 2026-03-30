-- =============================================================================
-- 007_snooker_online_security_and_lifecycle.sql
-- 1. Locks down UPDATE permissions on snooker_rooms.
-- 2. Uses strictly defined RPCs to mutate snooker_rooms state.
-- 3. Handles robust joining, leaving, and status changes safely.
-- =============================================================================

-- 1. Lock down snooker_rooms UPDATE policy
DROP POLICY IF EXISTS "rooms_update" ON snooker_rooms;
-- Only SELECT is permitted publicly implicitly (rooms_select still exists from 001)

-- 2. RPC: join_snooker_room
-- Claims an empty seat, or rejoins an existing one if client IDs match.
CREATE OR REPLACE FUNCTION join_snooker_room(
    p_room_id uuid,
    p_client_id text,
    p_client_name text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_role text;
    v_round_id int;
    v_reset_occurred boolean := false;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    -- Check if rejoining
    IF v_room.player1_id = p_client_id THEN
        v_role := 'player1';
        UPDATE snooker_rooms SET p1_last_seen_at = now(), last_activity_at = now() WHERE id = p_room_id;
    ELSIF v_room.player2_id = p_client_id THEN
        v_role := 'player2';
        UPDATE snooker_rooms SET p2_last_seen_at = now(), last_activity_at = now() WHERE id = p_room_id;
    -- Try to claim an empty seat
    ELSIF v_room.player1_id IS NULL THEN
        v_role := 'player1';
        UPDATE snooker_rooms 
        SET player1_id = p_client_id, player1_name = p_client_name, p1_last_seen_at = now(), last_activity_at = now() 
        WHERE id = p_room_id;

        -- If joining a non-waiting room fresh, reset it
        IF v_room.status != 'waiting' THEN
            v_round_id := coalesce(v_room.round_id, 0) + 1;
            UPDATE snooker_rooms SET 
                status = 'waiting', player1_ready = false, player2_ready = false, current_turn = null,
                winner = null, finished_reason = null, finished_at = null, round_id = v_round_id
            WHERE id = p_room_id;
            DELETE FROM snooker_shots WHERE room_id = p_room_id;
            v_reset_occurred := true;
        END IF;
    ELSIF v_room.player2_id IS NULL THEN
        v_role := 'player2';
        UPDATE snooker_rooms 
        SET player2_id = p_client_id, player2_name = p_client_name, p2_last_seen_at = now(), last_activity_at = now() 
        WHERE id = p_room_id;

        -- If joining a non-waiting room fresh, reset it
        IF v_room.status != 'waiting' THEN
            v_round_id := coalesce(v_room.round_id, 0) + 1;
            UPDATE snooker_rooms SET 
                status = 'waiting', player1_ready = false, player2_ready = false, current_turn = null,
                winner = null, finished_reason = null, finished_at = null, round_id = v_round_id
            WHERE id = p_room_id;
            DELETE FROM snooker_shots WHERE room_id = p_room_id;
            v_reset_occurred := true;
        END IF;
    ELSE
        RETURN jsonb_build_object('error', 'room_full');
    END IF;

    -- Return the updated room info so the client can sync
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id;
    RETURN jsonb_build_object('ok', true, 'role', v_role, 'room', row_to_json(v_room), 'reset', v_reset_occurred);
END;
$$;
GRANT EXECUTE ON FUNCTION join_snooker_room TO anon, authenticated;

-- 3. RPC: toggle_snooker_ready
CREATE OR REPLACE FUNCTION toggle_snooker_ready(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id = p_client_id THEN
        UPDATE snooker_rooms SET player1_ready = NOT player1_ready WHERE id = p_room_id;
    ELSIF v_room.player2_id = p_client_id THEN
        UPDATE snooker_rooms SET player2_ready = NOT player2_ready WHERE id = p_room_id;
    ELSE
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION toggle_snooker_ready TO anon, authenticated;

-- 4. RPC: ping_snooker_room (heartbeat)
CREATE OR REPLACE FUNCTION ping_snooker_room(
    p_room_id uuid,
    p_client_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE snooker_rooms 
    SET p1_last_seen_at = now(), last_activity_at = now() 
    WHERE id = p_room_id AND player1_id = p_client_id;

    UPDATE snooker_rooms 
    SET p2_last_seen_at = now(), last_activity_at = now() 
    WHERE id = p_room_id AND player2_id = p_client_id;
END;
$$;
GRANT EXECUTE ON FUNCTION ping_snooker_room TO anon, authenticated;


-- 5. RPC: exit_snooker_room
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

    IF v_room.player1_id = p_client_id THEN v_role := 'player1';
    ELSIF v_room.player2_id = p_client_id THEN v_role := 'player2';
    ELSE RETURN jsonb_build_object('error', 'unauthorized'); END IF;

    -- If the game is playing, leaving constitutes a forfeit win for the opponent
    IF v_room.status = 'playing' THEN
        UPDATE snooker_rooms SET 
            status = 'finished',
            winner = CASE WHEN v_role = 'player1' THEN 'player2' ELSE 'player1' END,
            finished_reason = 'opponent_left',
            finished_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    ELSE
        -- Just clear the seat
        IF v_role = 'player1' THEN
            UPDATE snooker_rooms SET player1_id = null, player1_ready = false, p1_last_seen_at = null, last_activity_at = now() WHERE id = p_room_id;
        ELSE
            UPDATE snooker_rooms SET player2_id = null, player2_ready = false, p2_last_seen_at = null, last_activity_at = now() WHERE id = p_room_id;
        END IF;

        -- If both left, reset the room explicitly to prevent stale data for future players
        SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id;
        IF v_room.player1_id IS NULL AND v_room.player2_id IS NULL AND v_room.status != 'waiting' THEN
             UPDATE snooker_rooms SET 
                status = 'waiting', current_turn = null, winner = null, finished_reason = null, finished_at = null
             WHERE id = p_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION exit_snooker_room TO anon, authenticated;

-- 6. RPC: signal_snooker_game_over
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

    IF v_room.player1_id != p_client_id AND v_room.player2_id != p_client_id THEN 
        RETURN jsonb_build_object('error', 'unauthorized'); 
    END IF;

    IF v_room.status = 'playing' THEN
        UPDATE snooker_rooms SET 
            status = 'finished',
            winner = p_winner_role,
            finished_reason = 'completed',
            finished_at = now(),
            last_activity_at = now()
        WHERE id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION signal_snooker_game_over TO anon, authenticated;

-- 7. RPC: reset_snooker_room
CREATE OR REPLACE FUNCTION reset_snooker_room(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_round_id int;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;

    IF v_room.player1_id != p_client_id AND v_room.player2_id != p_client_id THEN 
        RETURN jsonb_build_object('error', 'unauthorized'); 
    END IF;

    IF v_room.status = 'finished' THEN
        v_round_id := coalesce(v_room.round_id, 0) + 1;
        UPDATE snooker_rooms SET 
            status = 'waiting',
            player1_ready = false,
            player2_ready = false,
            current_turn = null,
            winner = null,
            finished_reason = null,
            finished_at = null,
            round_id = v_round_id
        WHERE id = p_room_id;
        
        DELETE FROM snooker_shots WHERE room_id = p_room_id;
    END IF;

    RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION reset_snooker_room TO anon, authenticated;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
