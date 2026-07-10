-- 014: Return the inserted action id from submit_big2_action /
-- submit_doudizhu_action so the host can dedup its own Realtime echo
-- (previously the RPC returned only {ok:true}, so the client's
-- _hostAppliedIds set stayed empty and dedup relied on a fragile
-- isHuman fallback).

CREATE OR REPLACE FUNCTION submit_big2_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room big2_rooms%ROWTYPE;
    v_seat_owner text;
    v_is_member boolean;
    v_action_id bigint;
BEGIN
    SELECT * INTO v_room FROM big2_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;
    IF p_player_index NOT BETWEEN 0 AND 3 THEN RETURN jsonb_build_object('error', 'invalid_seat'); END IF;

    v_seat_owner := CASE p_player_index
        WHEN 0 THEN v_room.player0_id
        WHEN 1 THEN v_room.player1_id
        WHEN 2 THEN v_room.player2_id
        WHEN 3 THEN v_room.player3_id
    END;

    IF v_seat_owner IS NOT NULL THEN
        -- 有人坐嘅位：一定要係本人
        IF v_seat_owner IS DISTINCT FROM p_client_id THEN
            RETURN jsonb_build_object('error', 'seat_not_owned');
        END IF;
    ELSE
        -- 空位（CPU 接手咗）：房入面有座位嘅人先可以代行（host 驅動 CPU）
        v_is_member := p_client_id IN (v_room.player0_id, v_room.player1_id, v_room.player2_id, v_room.player3_id);
        IF NOT COALESCE(v_is_member, false) THEN
            RETURN jsonb_build_object('error', 'not_room_member');
        END IF;
    END IF;

    INSERT INTO big2_actions (room_id, player_index, action_type, payload, client_ip)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip())
    RETURNING id INTO v_action_id;

    RETURN jsonb_build_object('ok', true, 'action_id', v_action_id);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_big2_action TO anon, authenticated;


CREATE OR REPLACE FUNCTION submit_doudizhu_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room doudizhu_rooms%ROWTYPE;
    v_seat_owner text;
    v_is_member boolean;
    v_action_id bigint;
BEGIN
    SELECT * INTO v_room FROM doudizhu_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;
    IF p_player_index NOT BETWEEN 0 AND 2 THEN RETURN jsonb_build_object('error', 'invalid_seat'); END IF;

    v_seat_owner := CASE p_player_index
        WHEN 0 THEN v_room.player0_id
        WHEN 1 THEN v_room.player1_id
        WHEN 2 THEN v_room.player2_id
    END;

    IF v_seat_owner IS NOT NULL THEN
        IF v_seat_owner IS DISTINCT FROM p_client_id THEN
            RETURN jsonb_build_object('error', 'seat_not_owned');
        END IF;
    ELSE
        v_is_member := p_client_id IN (v_room.player0_id, v_room.player1_id, v_room.player2_id);
        IF NOT COALESCE(v_is_member, false) THEN
            RETURN jsonb_build_object('error', 'not_room_member');
        END IF;
    END IF;

    INSERT INTO doudizhu_actions (room_id, player_index, action_type, payload, client_ip)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip())
    RETURNING id INTO v_action_id;

    RETURN jsonb_build_object('ok', true, 'action_id', v_action_id);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_doudizhu_action TO anon, authenticated;
