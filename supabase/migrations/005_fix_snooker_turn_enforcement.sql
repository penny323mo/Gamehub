-- =============================================================================
-- 005_fix_snooker_turn_enforcement.sql
-- Fix: Remove server-side current_turn check and flip from submit_snooker_shot.
--
-- In Snooker, a player who legally pots a ball keeps their turn.  The server
-- was unconditionally flipping current_turn after every shot, causing the
-- second consecutive shot by the same player to be rejected with
-- 'not_your_turn'.  This made both clients permanently desynchronise after
-- any valid pot.
--
-- Turn order is enforced client-side (the game engine blocks input when it is
-- not the local player's turn).  Seat-ownership validation still prevents a
-- random client from injecting shots into someone else's game.
--
-- Safe to re-run: uses CREATE OR REPLACE.
-- =============================================================================

CREATE OR REPLACE FUNCTION submit_snooker_shot(
    p_room_id     uuid,
    p_client_id   text,
    p_player_role text,
    p_payload     jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;

    IF p_player_role = 'player1' AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_role = 'player2' AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_role NOT IN ('player1', 'player2') THEN RETURN jsonb_build_object('error', 'invalid_role');
    END IF;

    -- NOTE: No current_turn check or flip.  In Snooker the active player can
    -- take multiple consecutive shots (valid pots keep the turn), so the server
    -- cannot predict whose turn it is — only the physics simulation knows.
    -- Seat-ownership above is sufficient to prevent unauthorised shot injection.

    UPDATE snooker_rooms
    SET    last_activity_at = now()
    WHERE  id = p_room_id;

    INSERT INTO snooker_shots (room_id, player_role, payload, client_ip)
    VALUES (p_room_id, p_player_role, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_snooker_shot TO anon, authenticated;
