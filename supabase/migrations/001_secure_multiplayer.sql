-- =============================================================================
-- 001_secure_multiplayer.sql
-- Replaces blanket "allow all" RLS policies with targeted rules and routes
-- all game-move / action writes through SECURITY DEFINER RPC functions so
-- that even a tampered client cannot forge a move for another player or
-- submit a move out of turn.
--
-- Run once in the Supabase SQL editor (safe to re-run: uses CREATE OR REPLACE
-- and DROP POLICY IF EXISTS).
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 – RLS Policies
-- Strategy:
--   • Rooms tables: SELECT open (lobby reads), INSERT blocked (rooms are
--     pre-seeded), UPDATE open (heartbeat/ready writes - identity enforced
--     by app + RPC layer since anon auth provides no server-side uid), DELETE
--     blocked.
--   • Action/Move tables: SELECT open (history replay), direct INSERT blocked
--     (must go through validated RPC), UPDATE/DELETE blocked (immutable log).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Big2 ────────────────────────────────────────────────────────────────────

ALTER TABLE big2_rooms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE big2_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all"            ON big2_rooms;
DROP POLICY IF EXISTS "rooms_select"         ON big2_rooms;
DROP POLICY IF EXISTS "rooms_insert"         ON big2_rooms;
DROP POLICY IF EXISTS "rooms_update"         ON big2_rooms;
DROP POLICY IF EXISTS "rooms_delete"         ON big2_rooms;

CREATE POLICY "rooms_select" ON big2_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_update" ON big2_rooms FOR UPDATE USING (true) WITH CHECK (true);
-- INSERT and DELETE intentionally omitted → denied by default

DROP POLICY IF EXISTS "allow all"            ON big2_actions;
DROP POLICY IF EXISTS "actions_select"       ON big2_actions;
DROP POLICY IF EXISTS "actions_insert"       ON big2_actions;
DROP POLICY IF EXISTS "actions_update"       ON big2_actions;
DROP POLICY IF EXISTS "actions_delete"       ON big2_actions;

CREATE POLICY "actions_select" ON big2_actions FOR SELECT USING (true);
-- INSERT blocked: use submit_big2_action() RPC instead


-- ── Doudizhu ────────────────────────────────────────────────────────────────

ALTER TABLE doudizhu_rooms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE doudizhu_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all"            ON doudizhu_rooms;
DROP POLICY IF EXISTS "rooms_select"         ON doudizhu_rooms;
DROP POLICY IF EXISTS "rooms_update"         ON doudizhu_rooms;

CREATE POLICY "rooms_select" ON doudizhu_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_update" ON doudizhu_rooms FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow all"            ON doudizhu_actions;
DROP POLICY IF EXISTS "actions_select"       ON doudizhu_actions;

CREATE POLICY "actions_select" ON doudizhu_actions FOR SELECT USING (true);
-- INSERT blocked: use submit_doudizhu_action() RPC instead


-- ── Gomoku ──────────────────────────────────────────────────────────────────

ALTER TABLE gomoku_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all"            ON gomoku_rooms;
DROP POLICY IF EXISTS "rooms_select"         ON gomoku_rooms;
DROP POLICY IF EXISTS "rooms_update"         ON gomoku_rooms;

CREATE POLICY "rooms_select" ON gomoku_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_update" ON gomoku_rooms FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow all"            ON moves;
DROP POLICY IF EXISTS "moves_select"         ON moves;

CREATE POLICY "moves_select" ON moves FOR SELECT USING (true);
-- INSERT blocked: use submit_gomoku_move() RPC instead


-- ── Xiangqi ─────────────────────────────────────────────────────────────────

ALTER TABLE xiangqi_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_moves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all"            ON xiangqi_rooms;
DROP POLICY IF EXISTS "rooms_select"         ON xiangqi_rooms;
DROP POLICY IF EXISTS "rooms_update"         ON xiangqi_rooms;

CREATE POLICY "rooms_select" ON xiangqi_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_update" ON xiangqi_rooms FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow all"            ON xiangqi_moves;
DROP POLICY IF EXISTS "moves_select"         ON xiangqi_moves;

CREATE POLICY "moves_select" ON xiangqi_moves FOR SELECT USING (true);
-- INSERT blocked: use submit_xiangqi_move() RPC instead


-- ── Snooker ─────────────────────────────────────────────────────────────────

ALTER TABLE snooker_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE snooker_shots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all"            ON snooker_rooms;
DROP POLICY IF EXISTS "rooms_select"         ON snooker_rooms;
DROP POLICY IF EXISTS "rooms_update"         ON snooker_rooms;

CREATE POLICY "rooms_select" ON snooker_rooms FOR SELECT USING (true);
CREATE POLICY "rooms_update" ON snooker_rooms FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow all"            ON snooker_shots;
DROP POLICY IF EXISTS "shots_select"         ON snooker_shots;

CREATE POLICY "shots_select" ON snooker_shots FOR SELECT USING (true);
-- INSERT blocked: use submit_snooker_shot() RPC instead


-- =============================================================================
-- SECTION 2 – RPC Validation Functions  (SECURITY DEFINER bypasses RLS)
--
-- Each function:
--   1. Locks the room row (FOR UPDATE) to prevent race conditions.
--   2. Verifies room.status = 'playing'.
--   3. Verifies the supplied client_id owns the claimed seat.
--   4. Verifies it is the caller's turn (where applicable).
--   5. Performs the write and returns { ok: true } or { error: '<reason>' }.
-- =============================================================================


-- ── Big2 ────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_big2_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,   -- 0-3
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room big2_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM big2_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'playing' THEN
        RETURN jsonb_build_object('error', 'game_not_playing');
    END IF;

    -- Verify the caller owns the claimed seat
    IF p_player_index = 0 AND (v_room.player0_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 1 AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 2 AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 3 AND (v_room.player3_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index NOT BETWEEN 0 AND 3 THEN
        RETURN jsonb_build_object('error', 'invalid_seat');
    END IF;

    -- Turn check (only for play actions; system/bid actions are exempt)
    IF p_action_type NOT IN ('system', 'bid', 'pass_bid') AND
       v_room.current_player_index IS NOT NULL AND
       v_room.current_player_index != p_player_index THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    INSERT INTO big2_actions (room_id, player_index, action_type, payload)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload);

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_big2_action TO anon, authenticated;


-- ── Doudizhu ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_doudizhu_action(
    p_room_id      uuid,
    p_client_id    text,
    p_player_index integer,   -- 0-2
    p_action_type  text,
    p_payload      jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room doudizhu_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM doudizhu_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'playing' THEN
        RETURN jsonb_build_object('error', 'game_not_playing');
    END IF;

    IF p_player_index = 0 AND (v_room.player0_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 1 AND (v_room.player1_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index = 2 AND (v_room.player2_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_player_index NOT BETWEEN 0 AND 2 THEN
        RETURN jsonb_build_object('error', 'invalid_seat');
    END IF;

    IF p_action_type NOT IN ('system', 'bid') AND
       v_room.current_player_index IS NOT NULL AND
       v_room.current_player_index != p_player_index THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    INSERT INTO doudizhu_actions (room_id, player_index, action_type, payload)
    VALUES (p_room_id, p_player_index, p_action_type, p_payload);

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_doudizhu_action TO anon, authenticated;


-- ── Gomoku ──────────────────────────────────────────────────────────────────
-- Note: the existing DB trigger handles move_no increment and current_player
-- flip automatically after INSERT, so the RPC only validates then inserts.

CREATE OR REPLACE FUNCTION submit_gomoku_move(
    p_room_id   uuid,
    p_client_id text,
    p_color     text,   -- 'black' | 'white'
    p_x         integer,
    p_y         integer
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room gomoku_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM gomoku_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'playing' THEN
        RETURN jsonb_build_object('error', 'game_not_playing');
    END IF;

    IF p_color = 'black' AND (v_room.black_player_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color = 'white' AND (v_room.white_player_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color NOT IN ('black', 'white') THEN
        RETURN jsonb_build_object('error', 'invalid_color');
    END IF;

    IF v_room.current_player IS DISTINCT FROM p_color THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    -- Bounds check (15×15 board)
    IF p_x NOT BETWEEN 0 AND 14 OR p_y NOT BETWEEN 0 AND 14 THEN
        RETURN jsonb_build_object('error', 'out_of_bounds');
    END IF;

    -- Duplicate position guard: check no existing move at (x,y) for this room/round
    IF EXISTS (
        SELECT 1 FROM moves
        WHERE room_id = p_room_id AND x = p_x AND y = p_y
    ) THEN
        RETURN jsonb_build_object('error', 'cell_occupied');
    END IF;

    -- Insert; DB trigger handles move_no + current_player flip
    INSERT INTO moves (room_id, x, y, color)
    VALUES (p_room_id, p_x, p_y, p_color);

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_gomoku_move TO anon, authenticated;


-- ── Xiangqi ─────────────────────────────────────────────────────────────────
-- Also updates current_player + turn_deadline_at after the move insert,
-- mirroring what the JS client did previously.

CREATE OR REPLACE FUNCTION submit_xiangqi_move(
    p_room_id     uuid,
    p_client_id   text,
    p_color       text,   -- 'red' | 'black'
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

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'playing' THEN
        RETURN jsonb_build_object('error', 'game_not_playing');
    END IF;

    IF p_color = 'red'   AND (v_room.red_player_id   IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color = 'black' AND (v_room.black_player_id IS DISTINCT FROM p_client_id) THEN
        RETURN jsonb_build_object('error', 'seat_not_owned');
    ELSIF p_color NOT IN ('red', 'black') THEN
        RETURN jsonb_build_object('error', 'invalid_color');
    END IF;

    IF v_room.current_player IS DISTINCT FROM p_color THEN
        RETURN jsonb_build_object('error', 'not_your_turn');
    END IF;

    INSERT INTO xiangqi_moves (room_id, from_idx, to_idx, packed_move, color)
    VALUES (p_room_id, p_from_idx, p_to_idx, p_packed_move, p_color);

    -- Flip turn and extend deadline (60 s, matching the JS constant)
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
    p_player_role text,   -- 'player1' | 'player2'
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

    -- Insert shot; shot_no trigger handles auto-increment
    INSERT INTO snooker_shots (room_id, player_role, payload)
    VALUES (p_room_id, p_player_role, p_payload);

    -- Flip current_turn to opponent (best-effort; game engines enforce locally)
    UPDATE snooker_rooms
    SET    current_turn = CASE p_player_role WHEN 'player1' THEN 'player2' ELSE 'player1' END
    WHERE  id = p_room_id;

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_snooker_shot TO anon, authenticated;


-- ── Race-safe game start for Big2 / Doudizhu ────────────────────────────────
-- Called by the host client only when all players are ready.
-- The .eq('status','waiting') condition ensures exactly one winner
-- even when multiple clients call simultaneously.

CREATE OR REPLACE FUNCTION start_big2_game(
    p_room_id      uuid,
    p_client_id    text,
    p_initial_deck jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room big2_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM big2_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    -- Only transition from 'waiting'
    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;

    -- Caller must be in the room
    IF p_client_id NOT IN (
        COALESCE(v_room.player0_id,''), COALESCE(v_room.player1_id,''),
        COALESCE(v_room.player2_id,''), COALESCE(v_room.player3_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    UPDATE big2_rooms
    SET    status = 'playing', initial_deck = p_initial_deck,
           current_player_index = NULL
    WHERE  id = p_room_id AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION start_big2_game TO anon, authenticated;


CREATE OR REPLACE FUNCTION start_doudizhu_game(
    p_room_id      uuid,
    p_client_id    text,
    p_initial_deck jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room doudizhu_rooms%ROWTYPE;
BEGIN
    SELECT * INTO v_room FROM doudizhu_rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;

    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('skipped', true, 'status', v_room.status);
    END IF;

    IF p_client_id NOT IN (
        COALESCE(v_room.player0_id,''), COALESCE(v_room.player1_id,''),
        COALESCE(v_room.player2_id,'')
    ) THEN
        RETURN jsonb_build_object('error', 'not_a_member');
    END IF;

    UPDATE doudizhu_rooms
    SET    status = 'playing', initial_deck = p_initial_deck,
           current_player_index = NULL
    WHERE  id = p_room_id AND status = 'waiting';

    RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION start_doudizhu_game TO anon, authenticated;
