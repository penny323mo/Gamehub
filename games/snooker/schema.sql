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
    cleaned_count INTEGER;
BEGIN
    WITH stale AS (
        SELECT id,
            player0_id IS NOT NULL AND (p0_last_seen_at IS NULL OR NOW() - p0_last_seen_at > INTERVAL '25 seconds') AS p0_stale,
            player1_id IS NOT NULL AND (p1_last_seen_at IS NULL OR NOW() - p1_last_seen_at > INTERVAL '25 seconds') AS p1_stale,
            status
        FROM snooker_rooms
        WHERE status IN ('waiting', 'playing')
    )
    UPDATE snooker_rooms AS room SET
        player0_id    = CASE WHEN stale.p0_stale THEN NULL ELSE room.player0_id END,
        player0_ready = CASE WHEN stale.p0_stale THEN FALSE ELSE room.player0_ready END,
        player1_id    = CASE WHEN stale.p1_stale THEN NULL ELSE room.player1_id END,
        player1_ready = CASE WHEN stale.p1_stale THEN FALSE ELSE room.player1_ready END,
        status        = CASE WHEN stale.status = 'playing' THEN 'finished' ELSE 'waiting' END,
        winner        = CASE
                            WHEN stale.status = 'playing' AND stale.p0_stale AND NOT stale.p1_stale THEN 1
                            WHEN stale.status = 'playing' AND stale.p1_stale AND NOT stale.p0_stale THEN 0
                            ELSE NULL END,
        finished_reason = CASE WHEN stale.status = 'playing' THEN 'timeout' ELSE NULL END
    FROM stale
    WHERE room.id = stale.id AND (stale.p0_stale OR stale.p1_stale);

    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    RETURN json_build_object('cleaned', cleaned_count);
END;
$$;
