-- 015: Royale PvP 斷線重連支援
-- Host 每隔幾秒將戰場快照持久化落房間度；斷線嘅一方（host 或 guest）
-- 喺寬限期內重新入返嚟，就可以由呢個快照恢復返場波，唔使即刻判負。
alter table public.royale_rooms
    add column if not exists last_snapshot jsonb,
    add column if not exists snapshot_at timestamptz;
