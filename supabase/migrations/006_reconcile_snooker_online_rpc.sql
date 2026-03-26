-- =============================================================================
-- 006_reconcile_snooker_online_rpc.sql
-- Reconciles production Snooker online deployment drift:
--   1. Ensures snooker_shots.client_ip exists
--   2. Re-creates _get_client_ip() if migration 003 was skipped
--   3. Re-creates submit_snooker_shot() with the current non-turn-flipping logic
--   4. Triggers a PostgREST schema reload so the RPC becomes callable immediately
-- Safe to re-run.
-- =============================================================================

CREATE OR REPLACE FUNCTION _get_client_ip()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT COALESCE(
        NULLIF(h->>'x-forwarded-for', ''),
        NULLIF(h->>'x-real-ip', ''),
        'unknown'
    )
    FROM (SELECT NULLIF(current_setting('request.headers', true), '')::jsonb AS h) t;
$$;

GRANT EXECUTE ON FUNCTION _get_client_ip() TO anon, authenticated;

ALTER TABLE snooker_shots
    ADD COLUMN IF NOT EXISTS client_ip text;

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

    -- Turn ownership is resolved by the Snooker game engine after physics settles.
    -- The server only validates seat ownership and room status.
    UPDATE snooker_rooms
    SET    last_activity_at = now()
    WHERE  id = p_room_id;

    INSERT INTO snooker_shots (room_id, player_role, payload, client_ip)
    VALUES (p_room_id, p_player_role, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_snooker_shot TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
