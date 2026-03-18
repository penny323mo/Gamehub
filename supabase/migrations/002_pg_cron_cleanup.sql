-- ============================================================
-- Migration 002: pg_cron scheduled stale-room cleanup
-- Replaces client-side throttled RPC calls with a server-side
-- cron job that runs every minute.
-- ============================================================

-- Enable pg_cron extension (requires superuser; already available on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ────────────────────────────────────────────────────────────
-- 1.  Per-game cleanup functions
--     Each function evicts players whose heartbeat is older
--     than 45 seconds from rooms that are still in 'waiting'.
-- ────────────────────────────────────────────────────────────

-- Big 2 (4 seats: player0…player3)
CREATE OR REPLACE FUNCTION clean_stale_big2_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE big2_rooms SET player0_id = NULL, player0_ready = FALSE, p0_last_seen_at = NULL
    WHERE player0_id IS NOT NULL AND p0_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE big2_rooms SET player1_id = NULL, player1_ready = FALSE, p1_last_seen_at = NULL
    WHERE player1_id IS NOT NULL AND p1_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE big2_rooms SET player2_id = NULL, player2_ready = FALSE, p2_last_seen_at = NULL
    WHERE player2_id IS NOT NULL AND p2_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE big2_rooms SET player3_id = NULL, player3_ready = FALSE, p3_last_seen_at = NULL
    WHERE player3_id IS NOT NULL AND p3_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';
END;
$$;

-- Dou Di Zhu (3 seats: player0…player2)
CREATE OR REPLACE FUNCTION clean_stale_doudizhu_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE doudizhu_rooms SET player0_id = NULL, player0_ready = FALSE, p0_last_seen_at = NULL
    WHERE player0_id IS NOT NULL AND p0_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE doudizhu_rooms SET player1_id = NULL, player1_ready = FALSE, p1_last_seen_at = NULL
    WHERE player1_id IS NOT NULL AND p1_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE doudizhu_rooms SET player2_id = NULL, player2_ready = FALSE, p2_last_seen_at = NULL
    WHERE player2_id IS NOT NULL AND p2_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';
END;
$$;

-- Gomoku (2 seats: black / white)
CREATE OR REPLACE FUNCTION clean_stale_gomoku_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE gomoku_rooms SET black_player_id = NULL, black_ready = FALSE, black_last_seen_at = NULL
    WHERE black_player_id IS NOT NULL AND black_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE gomoku_rooms SET white_player_id = NULL, white_ready = FALSE, white_last_seen_at = NULL
    WHERE white_player_id IS NOT NULL AND white_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';
END;
$$;

-- Xiangqi (2 seats: red / black)
CREATE OR REPLACE FUNCTION clean_stale_xiangqi_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE xiangqi_rooms SET red_player_id = NULL, red_ready = FALSE, red_last_seen_at = NULL
    WHERE red_player_id IS NOT NULL AND red_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE xiangqi_rooms SET black_player_id = NULL, black_ready = FALSE, black_last_seen_at = NULL
    WHERE black_player_id IS NOT NULL AND black_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';
END;
$$;

-- Snooker (2 seats: player1 / player2)
CREATE OR REPLACE FUNCTION clean_stale_snooker_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE snooker_rooms SET player1_id = NULL, player1_ready = FALSE, p1_last_seen_at = NULL
    WHERE player1_id IS NOT NULL AND p1_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';

    UPDATE snooker_rooms SET player2_id = NULL, player2_ready = FALSE, p2_last_seen_at = NULL
    WHERE player2_id IS NOT NULL AND p2_last_seen_at < now() - INTERVAL '45 seconds' AND status = 'waiting';
END;
$$;

-- Master wrapper — called by a single cron job
CREATE OR REPLACE FUNCTION clean_stale_all_rooms()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    PERFORM clean_stale_big2_rooms();
    PERFORM clean_stale_doudizhu_rooms();
    PERFORM clean_stale_gomoku_rooms();
    PERFORM clean_stale_xiangqi_rooms();
    PERFORM clean_stale_snooker_rooms();
END;
$$;

-- Grant execute to service role only (cron runs as superuser, but keep explicit)
GRANT EXECUTE ON FUNCTION clean_stale_big2_rooms()     TO service_role;
GRANT EXECUTE ON FUNCTION clean_stale_doudizhu_rooms() TO service_role;
GRANT EXECUTE ON FUNCTION clean_stale_gomoku_rooms()   TO service_role;
GRANT EXECUTE ON FUNCTION clean_stale_xiangqi_rooms()  TO service_role;
GRANT EXECUTE ON FUNCTION clean_stale_snooker_rooms()  TO service_role;
GRANT EXECUTE ON FUNCTION clean_stale_all_rooms()      TO service_role;

-- ────────────────────────────────────────────────────────────
-- 2.  Schedule: run every minute via pg_cron
--     Unschedule first in case this migration is re-run.
-- ────────────────────────────────────────────────────────────
SELECT cron.unschedule('gamehub-stale-room-cleanup') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'gamehub-stale-room-cleanup'
);

SELECT cron.schedule(
    'gamehub-stale-room-cleanup',   -- job name
    '* * * * *',                    -- every minute
    $$SELECT clean_stale_all_rooms()$$
);
