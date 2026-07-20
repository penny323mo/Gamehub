// 全球排行榜 — Supabase royale_leaderboard
// 寫入經 submit_royale_score RPC（server 端 clamp + 名字消毒）；讀取直接 select（RLS 只開 read）。
// 身份用 localStorage 嘅持久 playerId（唔同 PvP 嘅 sessionStorage clientId：嗰個係每個 tab 一個）。
import { getClient } from './net.js';
import { getStats } from './storage.js';

const ID_KEY = 'royale_playerId';
const NAME_KEY = 'royale_playerName';
const DEFAULT_NAME = '無名戰士';
export const NAME_MAX = 12;

export function getPlayerId() {
    let id = null;
    try { id = localStorage.getItem(ID_KEY); } catch { /* private mode */ }
    if (!id) {
        id = crypto.randomUUID();
        try { localStorage.setItem(ID_KEY, id); } catch { /* 冇得存就每次新身份，照玩 */ }
    }
    return id;
}

export function getPlayerName() {
    try { return localStorage.getItem(NAME_KEY) || DEFAULT_NAME; } catch { return DEFAULT_NAME; }
}

export function setPlayerName(name) {
    const clean = String(name ?? '').replace(/[<>\x00-\x1f]/g, '').trim().slice(0, NAME_MAX);
    try { localStorage.setItem(NAME_KEY, clean || DEFAULT_NAME); } catch { /* ignore */ }
    return clean || DEFAULT_NAME;
}

// 場終上報（fire-and-forget）：讀最新存檔統計，唔使 caller 傳數
// 對戰完先 call，所以 SDK lazy-load 唔會拖慢開頁；離線/failed 靜靜哋算數
let submitting = false;
export async function submitScore() {
    if (submitting) return; // 極速連場：一單在途就唔好疊
    submitting = true;
    try {
        const c = await getClient();
        const s = getStats();
        await c.rpc('submit_royale_score', {
            p_player_id: getPlayerId(),
            p_name: getPlayerName(),
            p_trophies: s.trophies,
            p_wins: s.wins,
            p_best_streak: s.bestStreak,
        });
    } catch { /* 排行榜係錦上添花，唔好影響本體 */ }
    finally { submitting = false; }
}

// 攞頭 N 名 + 自己排名（就算跌出頭 N 都會有 me）
export async function fetchLeaderboard(limit = 50) {
    const c = await getClient();
    const myId = getPlayerId();
    const { data: top, error } = await c.from('royale_leaderboard')
        .select('player_id,name,trophies,wins,best_streak')
        .order('trophies', { ascending: false })
        .order('updated_at', { ascending: true })
        .limit(limit);
    if (error) throw error;
    const rows = top ?? [];
    let me = null;
    const idx = rows.findIndex(r => r.player_id === myId);
    if (idx >= 0) {
        me = { ...rows[idx], rank: idx + 1 };
    } else {
        const { data: mine } = await c.from('royale_leaderboard')
            .select('player_id,name,trophies,wins,best_streak').eq('player_id', myId).maybeSingle();
        if (mine) {
            const { count } = await c.from('royale_leaderboard')
                .select('player_id', { count: 'exact', head: true }).gt('trophies', mine.trophies);
            me = { ...mine, rank: (count ?? 0) + 1 };
        }
    }
    return { rows, me, myId };
}
