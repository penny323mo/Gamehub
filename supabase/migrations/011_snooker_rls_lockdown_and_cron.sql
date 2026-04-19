-- =============================================================================
-- 011_snooker_rls_lockdown_and_cron.sql
-- Closes authoritative-shooter bypasses and schedules stale-room cleanup.
--   1. Replace "allow all" policies on snooker_rooms / snooker_shots with
--      SELECT-only policies for clients. All writes go through SECURITY DEFINER
--      RPCs. The narrow rooms_update policy from 009 remains as a safety valve
--      for lobby seat eviction.
--   2. Schedule clean_stale_snooker_rooms() every minute via pg_cron.
--   3. Set search_path on every snooker function so SECURITY DEFINER is safe
--      against schema-shadowing attacks.
-- Idempotent.
-- =============================================================================

-- 1. RLS lockdown -------------------------------------------------------------
DROP POLICY IF EXISTS "allow all" ON public.snooker_shots;
ALTER TABLE public.snooker_shots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shots_select" ON public.snooker_shots;
CREATE POLICY "shots_select" ON public.snooker_shots
    FOR SELECT TO anon, authenticated USING (true);
-- No INSERT/UPDATE/DELETE policies → direct writes rejected. Use RPCs.

DROP POLICY IF EXISTS "allow all" ON public.snooker_rooms;
ALTER TABLE public.snooker_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_select" ON public.snooker_rooms;
CREATE POLICY "rooms_select" ON public.snooker_rooms
    FOR SELECT TO anon, authenticated USING (true);
-- The narrow rooms_update policy from migration 009 stays as the only UPDATE
-- path, keeping lobby eviction + legacy fallbacks functional.

-- 2. Cron job for stale snooker rooms ----------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Drop any prior schedule with the same name so the job is idempotent.
        PERFORM cron.unschedule(jobid)
          FROM cron.job
         WHERE jobname IN ('clean-stale-snooker-rooms', 'clean_stale_snooker_rooms_1min');
        PERFORM cron.schedule(
            'clean-stale-snooker-rooms',
            '* * * * *',
            $$SELECT public.clean_stale_snooker_rooms();$$
        );
    END IF;
END$$;

-- 3. Pin search_path on every SECURITY DEFINER snooker function --------------
DO $$
DECLARE
    fn text;
    funcs text[] := ARRAY[
        'public.join_snooker_room(uuid,text,text)',
        'public.start_snooker_game(uuid,text)',
        'public.toggle_snooker_ready(uuid,text)',
        'public.submit_snooker_shot(uuid,text,text,jsonb)',
        'public.ping_snooker_room(uuid,text)',
        'public.exit_snooker_room(uuid,text)',
        'public.signal_snooker_game_over(uuid,text,text)',
        'public.reset_snooker_room(uuid,text)',
        'public.cleanup_snooker_shots(uuid,text)',
        'public.clean_stale_snooker_rooms()',
        'public.assign_snooker_shot_no()',
        'public.set_snooker_shot_no()'
    ];
BEGIN
    FOREACH fn IN ARRAY funcs LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
        EXCEPTION WHEN undefined_function THEN
            -- Some environments may lack set_snooker_shot_no / older variants; ignore.
            NULL;
        END;
    END LOOP;
END$$;
