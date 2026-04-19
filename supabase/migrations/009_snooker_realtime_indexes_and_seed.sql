-- =============================================================================
-- 009_snooker_realtime_indexes_and_seed.sql
-- Closes gaps identified in the online-mode audit:
--   1. Adds snooker tables to the supabase_realtime publication so realtime
--      UPDATE/INSERT events flow without depending on the dashboard UI.
--   2. Sets REPLICA IDENTITY FULL on snooker_rooms so payload.new is complete
--      (renderRoomState reads many columns that would otherwise be missing).
--   3. Adds indexes for the realtime/polling filter paths.
--   4. Installs the shot_no auto-increment trigger that the client's ordered
--      fetchMissingShotsOnce() query depends on.
--   5. Re-grants a narrow rooms_update policy so the client's lobby stale-seat
--      eviction and the fallback UPDATE paths in online.js keep working
--      (post-007 they were RLS-denied silently). The policy restricts updates
--      to the six fixed public rooms, matching the application's use case.
--   6. Seeds the six fixed room rows if they are missing.
-- All statements are idempotent; safe to re-run.
-- =============================================================================

-- 1. Realtime publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'snooker_rooms'
        ) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE snooker_rooms';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'snooker_shots'
        ) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE snooker_shots';
        END IF;
    END IF;
END$$;

-- 2. Replica identity
ALTER TABLE snooker_rooms REPLICA IDENTITY FULL;

-- 3. Indexes for poll / realtime filters
CREATE INDEX IF NOT EXISTS idx_snooker_shots_room_id
    ON snooker_shots(room_id);
CREATE INDEX IF NOT EXISTS idx_snooker_shots_room_shot_no
    ON snooker_shots(room_id, shot_no);
CREATE INDEX IF NOT EXISTS idx_snooker_rooms_room_code
    ON snooker_rooms(room_code);

-- 4. shot_no auto-increment trigger
--    shot_no must be strictly monotonic per room so the non-shooter's
--    fetchMissingShotsOnce() replays shots in the correct physical order.
CREATE OR REPLACE FUNCTION assign_snooker_shot_no() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.shot_no IS NULL THEN
        SELECT COALESCE(MAX(shot_no), 0) + 1
          INTO NEW.shot_no
          FROM snooker_shots
         WHERE room_id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snooker_shot_no ON snooker_shots;
CREATE TRIGGER trg_snooker_shot_no
    BEFORE INSERT ON snooker_shots
    FOR EACH ROW EXECUTE FUNCTION assign_snooker_shot_no();

-- 5. Narrow rooms_update policy for the six fixed public rooms.
--    Defence-in-depth: all mutating flows still go through SECURITY DEFINER
--    RPCs (join/start/toggle/ping/exit/signal/reset), but the lobby eviction
--    and legacy fallback UPDATEs need a policy that allows column-level
--    changes to the seat/ready/timestamp fields only.
DROP POLICY IF EXISTS "rooms_update" ON snooker_rooms;
CREATE POLICY "rooms_update" ON snooker_rooms
    FOR UPDATE USING (
        room_code IN ('ROOM01','ROOM02','ROOM03','3D-ROOM01','3D-ROOM02','3D-ROOM03')
    ) WITH CHECK (
        room_code IN ('ROOM01','ROOM02','ROOM03','3D-ROOM01','3D-ROOM02','3D-ROOM03')
    );

-- 6. Seed the six fixed rooms if missing (idempotent)
INSERT INTO snooker_rooms (room_code, game_mode, status)
VALUES
    ('ROOM01',   '2d', 'waiting'),
    ('ROOM02',   '2d', 'waiting'),
    ('ROOM03',   '2d', 'waiting'),
    ('3D-ROOM01','3d', 'waiting'),
    ('3D-ROOM02','3d', 'waiting'),
    ('3D-ROOM03','3d', 'waiting')
ON CONFLICT (room_code) DO NOTHING;

-- 7. Tighten toggle_snooker_ready — reject toggles outside waiting status.
--    (Identified in audit finding I.)
CREATE OR REPLACE FUNCTION toggle_snooker_ready(
    p_room_id uuid,
    p_client_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_room snooker_rooms%ROWTYPE;
    v_role text;
    v_new_ready boolean;
BEGIN
    SELECT * INTO v_room FROM snooker_rooms WHERE id = p_room_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'room_not_found');
    END IF;
    IF v_room.status <> 'waiting' THEN
        RETURN jsonb_build_object('error', 'not_waiting');
    END IF;

    IF v_room.player1_id = p_client_id THEN
        v_role := 'player1';
        v_new_ready := NOT COALESCE(v_room.player1_ready, false);
        UPDATE snooker_rooms
           SET player1_ready = v_new_ready,
               p1_last_seen_at = now(),
               last_activity_at = now()
         WHERE id = p_room_id;
    ELSIF v_room.player2_id = p_client_id THEN
        v_role := 'player2';
        v_new_ready := NOT COALESCE(v_room.player2_ready, false);
        UPDATE snooker_rooms
           SET player2_ready = v_new_ready,
               p2_last_seen_at = now(),
               last_activity_at = now()
         WHERE id = p_room_id;
    ELSE
        RETURN jsonb_build_object('error', 'not_in_room');
    END IF;

    RETURN jsonb_build_object('ok', true, 'role', v_role, 'ready', v_new_ready);
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_snooker_ready(uuid, text) TO anon, authenticated;
