// 錦標賽：三條賽道連跑，積分跨場累積。
//
// 點解值得做：單場比賽贏咗就冇咗，輸咗又冇後果。有積分表之後，一場跑砸
// 唔等於玩完——你要諗住成個系列去揸，最後一場先知邊個贏。對手而家有固定
// 身份（ADR-052），先至有嘢可以累積落去。
//
// 分數：名次每高一位多兩分，尾二兩分、包尾冇分咁計法太懲罰，所以用
// 「(參賽數 − 名次 + 1) × 2」——五架車就係 10 / 8 / 6 / 4 / 2。人數少咗
// 分數自動縮返，唔使為每個人數手寫一張表。

const KEY = 'racer-season-v1';

export function pointsFor(place, entrants) {
    if (!Number.isFinite(place) || place < 1 || place > entrants) return 0;
    return (entrants - place + 1) * 2;
}

export class Season {
    constructor(trackIds) {
        this.trackIds = trackIds;
        this.reset();
    }

    reset() {
        this.round = 0;              // 0-based：而家跑緊第幾場
        this.points = {};            // 名 -> 分
        this.results = [];           // 每場嘅名次表（用嚟顯示）
        this.active = false;
        return this;
    }

    get totalRounds() { return this.trackIds.length; }
    get currentTrack() { return this.trackIds[Math.min(this.round, this.totalRounds - 1)]; }
    get finished() { return this.round >= this.totalRounds; }

    start() {
        this.reset();
        this.active = true;
        this.save();
        return this;
    }

    // 收一場嘅名次（results() 出嘅嗰個 shape），派分再入下一場
    record(rows) {
        if (!this.active || this.finished) return null;
        const entrants = rows.length;
        const awarded = rows.map(r => {
            const gained = pointsFor(r.place, entrants);
            this.points[r.label] = (this.points[r.label] ?? 0) + gained;
            return { label: r.label, colour: r.colour, player: r.player, place: r.place, gained };
        });
        this.results.push({ track: this.currentTrack, rows: awarded });
        this.round += 1;
        this.save();
        return awarded;
    }

    // 總積分榜：分高排前。同分用賽車界嗰套 countback——先比邊個攞多啲冠軍，
    // 一樣就比亞軍數，如此類推。淨係比「最佳名次」係唔夠嘅：三個人各自贏過
    // 一場嘅話，三個嘅最佳名次都係 1，等於冇分到。
    standings() {
        const tally = {};
        for (const race of this.results) {
            for (const row of race.rows) {
                (tally[row.label] ??= [])[row.place] = (tally[row.label]?.[row.place] ?? 0) + 1;
            }
        }
        const countback = (a, b) => {
            const A = tally[a] ?? [], B = tally[b] ?? [];
            const depth = Math.max(A.length, B.length);
            for (let p = 1; p < depth; p++) {
                const diff = (B[p] ?? 0) - (A[p] ?? 0);   // 多啲呢個名次嘅排前
                if (diff) return diff;
            }
            return 0;
        };
        return Object.entries(this.points)
            .map(([label, pts]) => ({
                label, points: pts,
                bestPlace: (tally[label] ?? []).findIndex(n => n > 0),
                wins: tally[label]?.[1] ?? 0,
            }))
            .sort((a, b) => b.points - a.points || countback(a.label, b.label))
            .map((row, i) => ({ ...row, place: i + 1 }));
    }

    save() {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                round: this.round, points: this.points,
                results: this.results, active: this.active,
            }));
        } catch { /* 私隱模式：唔存都照玩，淨係唔續得 */ }
    }

    load() {
        try {
            const v = JSON.parse(localStorage.getItem(KEY));
            if (!v || typeof v.round !== 'number') return false;
            this.round = v.round;
            this.points = v.points ?? {};
            this.results = Array.isArray(v.results) ? v.results : [];
            this.active = !!v.active;
            return this.active;
        } catch { return false; }
    }

    clear() {
        this.reset();
        try { localStorage.removeItem(KEY); } catch { }
    }
}
