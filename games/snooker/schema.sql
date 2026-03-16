-- Snooker Online Multiplayer Schema
-- Run in Supabase SQL Editor

-- Rooms table (shared for 2D and 3D modes)
CREATE TABLE IF NOT EXISTS snooker_rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code       TEXT NOT NULL UNIQUE,
    game_mode       TEXT NOT NULL CHECK (game_mode IN ('2d', '3d')),
    status          TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),

    -- Players
    player0_id      TEXT,
    player1_id      TEXT,
    player0_ready   BOOLEAN NOT NULL DEFAULT FALSE,
    player1_ready   BOOLEAN NOT NULL DEFAULT FALSE,

    -- Game state
    current_player  INTEGER,                          -- 0 or 1, null when not playing
    shot_count      INTEGER NOT NULL DEFAULT 0,
    round_id        INTEGER NOT NULL DEFAULT 0,

    -- Result
    winner          INTEGER,                          -- 0 or 1
    finished_reason TEXT,

    -- Timestamps
    last_activity_at    TIMESTAMPTZ DEFAULT NOW(),
    p0_last_seen_at     TIMESTAMPTZ,
    p1_last_seen_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Shots table: each row is one "shot end" state snapshot
CREATE TABLE IF NOT EXISTS snooker_shots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     UUID NOT NULL REFERENCES snooker_rooms(id) ON DELETE CASCADE,
    shot_no     INTEGER NOT NULL,
    player_no   INTEGER NOT NULL CHECK (player_no IN (0, 1)),
    game_mode   TEXT NOT NULL CHECK (game_mode IN ('2d', '3d')),
    result      JSONB NOT NULL,                       -- full game state snapshot
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(room_id, shot_no)
);

-- Indexes
CREATE INDEX IF NOT EXISTS snooker_shots_room_shot ON snooker_shots(room_id, shot_no);
CREATE INDEX IF NOT EXISTS snooker_rooms_code ON snooker_rooms(room_code);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE snooker_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE snooker_shots;

-- Seed fixed rooms (2D and 3D)
INSERT INTO snooker_rooms (room_code, game_mode) VALUES
    ('S2D_01', '2d'),
    ('S2D_02', '2d'),
    ('S2D_03', '2d'),
    ('S3D_01', '3d'),
    ('S3D_02', '3d'),
    ('S3D_03', '3d')
ON CONFLICT (room_code) DO NOTHING;

-- Trigger: auto-start game when both players ready
CREATE OR REPLACE FUNCTION snooker_auto_start()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.player0_ready = TRUE AND NEW.player1_ready = TRUE
       AND NEW.player0_id IS NOT NULL AND NEW.player1_id IS NOT NULL
       AND NEW.status = 'waiting' THEN
        NEW.status := 'playing';
        NEW.current_player := 0;
        NEW.shot_count := 0;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS snooker_auto_start_trigger ON snooker_rooms;
CREATE TRIGGER snooker_auto_start_trigger
    BEFORE UPDATE ON snooker_rooms
    FOR EACH ROW EXECUTE FUNCTION snooker_auto_start();

-- RPC: clean stale rooms (players inactive > 25s)
CREATE OR REPLACE FUNCTION clean_stale_snooker_rooms()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    stale_threshold INTERVAL := INTERVAL '25 seconds';
    cleaned_count   INTEGER := 0;
    r               RECORD;
BEGIN
    FOR r IN
        SELECT id, player0_id, player1_id, p0_last_seen_at, p1_last_seen_at, status
        FROM snooker_rooms
        WHERE status IN ('waiting', 'playing')
    LOOP
        DECLARE
            p0_stale BOOLEAN := r.player0_id IS NOT NULL
                AND (r.p0_last_seen_at IS NULL OR NOW() - r.p0_last_seen_at > stale_threshold);
            p1_stale BOOLEAN := r.player1_id IS NOT NULL
                AND (r.p1_last_seen_at IS NULL OR NOW() - r.p1_last_seen_at > stale_threshold);
            update_data JSONB := '{}';
        BEGIN
            IF p0_stale THEN
                update_data := update_data || '{"player0_id": null, "player0_ready": false}';
            END IF;
            IF p1_stale THEN
                update_data := update_data || '{"player1_id": null, "player1_ready": false}';
            END IF;

            IF p0_stale OR p1_stale THEN
                UPDATE snooker_rooms SET
                    player0_id    = CASE WHEN p0_stale THEN NULL ELSE player0_id END,
                    player0_ready = CASE WHEN p0_stale THEN FALSE ELSE player0_ready END,
                    player1_id    = CASE WHEN p1_stale THEN NULL ELSE player1_id END,
                    player1_ready = CASE WHEN p1_stale THEN FALSE ELSE player1_ready END,
                    status        = CASE WHEN r.status = 'playing' THEN 'finished' ELSE 'waiting' END,
                    winner        = CASE
                                        WHEN r.status = 'playing' AND p0_stale AND NOT p1_stale THEN 1
                                        WHEN r.status = 'playing' AND p1_stale AND NOT p0_stale THEN 0
                                        ELSE NULL
                                    END,
                    finished_reason = CASE WHEN r.status = 'playing' THEN 'timeout' ELSE NULL END
                WHERE id = r.id;
                cleaned_count := cleaned_count + 1;
            END IF;
        END;
    END LOOP;

    RETURN json_build_object('cleaned', cleaned_count);
END;
$$;
