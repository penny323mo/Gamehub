-- ============================================================
-- Migration 003: Audit Trail
-- • Adds client_ip column to all action/move tables
-- • Adds finished_reason column to rooms tables that lack it
-- • Updates submit_* RPCs to record client IP server-side
--   (no frontend change needed — IP is read from HTTP headers)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1.  Helper: extract real client IP from PostgREST headers
--     x-forwarded-for is set by Supabase's edge network.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _get_client_ip()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
    -- Parse request headers once, then extract both candidate fields from
    -- the single parsed jsonb value to avoid redundant JSON parsing.
    SELECT COALESCE(
        NULLIF(h->>'x-forwarded-for', ''),
        NULLIF(h->>'x-real-ip', ''),
        'unknown'
    )
    FROM (SELECT NULLIF(current_setting('request.headers', true), '')::jsonb AS h) t;
$$;

GRANT EXECUTE ON FUNCTION _get_client_ip() TO anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- 2.  Add client_ip column to all action/move tables
-- ────────────────────────────────────────────────────────────
ALTER TABLE big2_actions     ADD COLUMN IF NOT EXISTS client_ip text;
ALTER TABLE doudizhu_actions ADD COLUMN IF NOT EXISTS client_ip text;
ALTER TABLE moves             ADD COLUMN IF NOT EXISTS client_ip text;   -- gomoku
ALTER TABLE xiangqi_moves    ADD COLUMN IF NOT EXISTS client_ip text;
ALTER TABLE snooker_shots    ADD COLUMN IF NOT EXISTS client_ip text;

-- ────────────────────────────────────────────────────────────
-- 3.  Ensure finished_reason + finished_at exist on all room
--     tables (some may already have them; IF NOT EXISTS is safe)
-- ────────────────────────────────────────────────────────────
ALTER TABLE big2_rooms       ADD COLUMN IF NOT EXISTS finished_reason text;
ALTER TABLE big2_rooms       ADD COLUMN IF NOT EXISTS finished_at      timestamptz;
ALTER TABLE doudizhu_rooms   ADD COLUMN IF NOT EXISTS finished_reason text;
ALTER TABLE doudizhu_rooms   ADD COLUMN IF NOT EXISTS finished_at      timestamptz;
ALTER TABLE gomoku_rooms     ADD COLUMN IF NOT EXISTS finished_reason text;
ALTER TABLE gomoku_rooms     ADD COLUMN IF NOT EXISTS finished_at      timestamptz;
ALTER TABLE xiangqi_rooms    ADD COLUMN IF NOT EXISTS finished_reason text;
ALTER TABLE xiangqi_rooms    ADD COLUMN IF NOT EXISTS finished_at      timestamptz;
ALTER TABLE snooker_rooms    ADD COLUMN IF NOT EXISTS finished_reason text;
ALTER TABLE snooker_rooms    ADD COLUMN IF NOT EXISTS finished_at      timestamptz;

-- ────────────────────────────────────────────────────────────
-- 4.  Update submit_* RPCs to record client_ip
-- ────────────────────────────────────────────────────────────

-- ── Big2 ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_big2_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room big2_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM big2_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;

    IF p_player_index = 0 AND (v_room.player0_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 1 AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 2 AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 3 AND (v_room.player3_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index NOT BETWEEN 0 AND 3 THEN RETURN jsonb_build_object('error', 'invalid_seat');
    END IF;

    IF p_action_type NOT IN ('system', 'bid', 'pass_bid') AND
       v_room.current_player_index IS NOT NULL AND
       v_room.current_player_index != p_player_index THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    INSERT INTO big2_actions (room_id, player_index, action_type, payload, client_ip)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_big2_action TO anon, authenticated;


-- ── Doudizhu ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_doudizhu_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room doudizhu_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM doudizhu_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;

    IF p_player_index = 0 AND (v_room.player0_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 1 AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 2 AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index NOT BETWEEN 0 AND 2 THEN RETURN jsonb_build_object('error', 'invalid_seat');
    END IF;

    IF p_action_type NOT IN ('system', 'bid') AND
       v_room.current_player_index IS NOT NULL AND
       v_room.current_player_index != p_player_index THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    INSERT INTO doudizhu_actions (room_id, player_index, action_type, payload, client_ip)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_doudizhu_action TO anon, authenticated;


-- ── Gomoku ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_gomoku_move(
    p_room_id   uuid,
    p_client_id text,
    p_color     text,
    p_x         integer,
    p_y         integer
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room gomoku_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM gomoku_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;

    IF p_color = 'black' AND (v_room.black_player_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color = 'white' AND (v_room.white_player_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color NOT IN ('black', 'white') THEN RETURN jsonb_build_object('error', 'invalid_color');
    END IF;

    IF v_room.current_player IS DISTINCT FROM p_color THEN RETURN jsonb_build_object('error', 'not_your_turn'); END IF;

    IF p_x NOT BETWEEN 0 AND 14 OR p_y NOT BETWEEN 0 AND 14 THEN RETURN jsonb_build_object('error', 'out_of_bounds'); END IF;

    IF EXISTS (SELECT 1 FROM moves WHERE room_id = p_room_id AND x = p_x AND y = p_y) THEN
        RETURN jsonb_build_object('error', 'cell_occupied');
    END IF;

    INSERT INTO moves (room_id, x, y, color, client_ip)
    VALUES (p_room_id, p_x, p_y, p_color, _get_client_ip());

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_gomoku_move TO anon, authenticated;


-- ── Xiangqi ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_xiangqi_move(
    p_room_id     uuid,
    p_client_id   text,
    p_color       text,
    p_from_idx    integer,
    p_to_idx      integer,
    p_packed_move text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room        xiangqi_rooms%ROWTYPE;
    v_next_player text;
    v_deadline    timestamptz;
BEGIN
    SELECT * INTO v_room FROM xiangqi_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN RETURN jsonb_build_object('error', 'room_not_found'); END IF;
    IF v_room.status != 'playing' THEN RETURN jsonb_build_object('error', 'game_not_playing'); END IF;

    IF p_color = 'red'   AND (v_room.red_player_id   IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color = 'black' AND (v_room.black_player_id IS DISTINCT FROM p_client_id) THEN RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color NOT IN ('red', 'black') THEN RETURN jsonb_build_object('error', 'invalid_color');
    END IF;

    IF v_room.current_player IS DISTINCT FROM p_color THEN RETURN jsonb_build_object('error', 'not_your_turn'); END IF;

    INSERT INTO xiangqi_moves (room_id, from_idx, to_idx, packed_move, color, client_ip)
    VALUES (p_room_id, p_from_idx, p_to_idx, p_packed_move, p_color, _get_client_ip());

    v_next_player := CASE p_color WHEN 'red' THEN 'black' ELSE 'red' END;
    v_deadline    := now() + interval '60 seconds';

    UPDATE xiangqi_rooms
    SET    current_player   = v_next_player,
           turn_deadline_at = v_deadline,
           last_activity_at = now()
    WHERE  id = p_room_id;

    RETURN jsonb_build_object('ok', true, 'next_player', v_next_player);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_xiangqi_move TO anon, authenticated;


-- ── Snooker ─────────────────────────────────────────────────────────────────
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

    INSERT INTO snooker_shots (room_id, player_role, payload, client_ip)
    VALUES (p_room_id, p_player_role, p_payload, _get_client_ip());

    UPDATE snooker_rooms
    SET    current_turn = CASE p_player_role WHEN 'player1' THEN 'player2' ELSE 'player1' END
    WHERE  id = p_room_id;

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_snooker_shot TO anon, authenticated;
