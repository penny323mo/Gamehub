-- =============================================================================
-- 010_submit_snooker_shot_defensive_shot_no.sql
-- Makes submit_snooker_shot compute shot_no inside a per-room advisory lock so
-- the ordering guarantee survives even in environments where migration 009's
-- trigger has not yet been applied. Migration 009's trigger only fills shot_no
-- when NEW.shot_no IS NULL, so this RPC assignment is a no-conflict defence.
-- Safe to re-run.
-- =============================================================================

CREATE OR REPLACE FUNCTION submit_snooker_shot(
    p_room_id     uuid,
    p_client_id   text,
    p_player_role text,
    p_payload     jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room    snooker_rooms%ROWTYPE;
    v_shot_no integer;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'playing' THEN
        RETURN jsonb_build_object('error', 'game_not_playing');
    END IF;

    IF p_player_role = 'player1' AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_role = 'player2' AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_role NOT IN ('player1', 'player2') THEN
        RETURN jsonb_build_object('error', 'invalid_role');
    END IF;

    -- Advisory lock scoped to this room protects the MAX(shot_no) read-then-write
    -- from concurrent submissions by the other seat.
    PERFORM pg_advisory_xact_lock(hashtext('snooker_shot_no:' || p_room_id::text));

    SELECT COALESCE(MAX(shot_no), 0) + 1
      INTO v_shot_no
      FROM snooker_shots
     WHERE room_id = p_room_id;

    UPDATE snooker_rooms
       SET last_activity_at = now()
     WHERE id = p_room_id;

    INSERT INTO snooker_shots (room_id, player_role, payload, shot_no, client_ip)
    VALUES (p_room_id, p_player_role, p_payload, v_shot_no, _get_client_ip());

    RETURN jsonb_build_object('ok', true, 'shot_no', v_shot_no);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_snooker_shot TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
