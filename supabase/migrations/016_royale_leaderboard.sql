-- Royale Phase 2：全球排行榜
-- 讀：公開 select。寫：只可以經 security definer RPC（做 clamp + 名字消毒），
-- 唔開放 anon 直寫 table，防止亂改第二個玩家嘅紀錄。
create table if not exists public.royale_leaderboard (
    player_id text primary key check (char_length(player_id) between 8 and 64),
    name text not null default '無名戰士',
    trophies integer not null default 0,
    wins integer not null default 0,
    best_streak integer not null default 0,
    updated_at timestamptz not null default now()
);

create index if not exists royale_leaderboard_trophies_idx
    on public.royale_leaderboard (trophies desc, updated_at asc);

alter table public.royale_leaderboard enable row level security;

drop policy if exists royale_leaderboard_read on public.royale_leaderboard;
create policy royale_leaderboard_read on public.royale_leaderboard
    for select to anon, authenticated using (true);

create or replace function public.submit_royale_score(
    p_player_id text,
    p_name text,
    p_trophies integer,
    p_wins integer,
    p_best_streak integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_name text;
begin
    if p_player_id is null
       or char_length(p_player_id) < 8
       or char_length(p_player_id) > 64 then
        return;
    end if;
    -- 名字消毒：去控制字元/HTML 角括號，trim 完得 12 個字，空白就用預設名
    v_name := regexp_replace(coalesce(p_name, ''), '[\x00-\x1f<>]', '', 'g');
    v_name := left(trim(v_name), 12);
    if v_name = '' then v_name := '無名戰士'; end if;

    insert into public.royale_leaderboard as lb (player_id, name, trophies, wins, best_streak, updated_at)
    values (
        p_player_id,
        v_name,
        least(greatest(coalesce(p_trophies, 0), 0), 20000),
        least(greatest(coalesce(p_wins, 0), 0), 500000),
        least(greatest(coalesce(p_best_streak, 0), 0), 9999),
        now()
    )
    on conflict (player_id) do update set
        name = excluded.name,
        trophies = excluded.trophies,
        -- 勝場/連勝只升不跌：舊 client 送嚟細啲嘅值唔會倒退
        wins = greatest(lb.wins, excluded.wins),
        best_streak = greatest(lb.best_streak, excluded.best_streak),
        updated_at = now();
end;
$$;

revoke all on function public.submit_royale_score(text, text, integer, integer, integer) from public;
grant execute on function public.submit_royale_score(text, text, integer, integer, integer) to anon, authenticated;
