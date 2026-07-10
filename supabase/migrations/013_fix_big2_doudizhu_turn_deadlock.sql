-- 013: Fix big2/doudizhu online deadlock.
--
-- 001/003 added a `current_player_index` turn gate to submit_big2_action /
-- submit_doudizhu_action, but unlike gomoku (which has a trigger/RPC that
-- advances current_player after every move), NOTHING ever advances
-- current_player_index for these two games — it is written once at game
-- start and never again. Result: the second player to act (and everyone
-- after) is rejected with not_your_turn forever; doudizhu cannot even
-- leave the bidding phase (its bid actions are named bid_call/bid_rob/
-- bid_pass, none of which were in the exempt list).
--
-- These two games are host-authoritative on the client (the host applies
-- rules and drives CPU seats), and the server cannot model their turn flow
-- (trick wins, landlord lead, bid rotation) without reimplementing the
-- rules. So:
--   * drop the current_player_index gate (client host logic owns ordering),
--   * keep seat ownership for occupied seats (nobody can act as YOU),
--   * allow submissions for VACANT (NULL) seats only from someone who is
--     actually seated in the room — this is how the host drives CPU seats
--     after a player leaves mid-game.

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
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
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
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_doudizhu_action TO anon, authenticated;
