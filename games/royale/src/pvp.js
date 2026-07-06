// PvP Host-Relay 支援 —— host 跑晒個 Game 模擬並廣播快照；guest 淨係接收快照嚟渲染，
// 唔會本機運算戰鬥（保證雙方見到嘅結果一致，唔使處理浮點誤差累積嘅同步漂移問題）
import * as THREE from 'three';
import { TEAM, ARENA } from './constants.js';
import { CARDS } from './cards.js';
import { makeUnitModel, makePrincessTower, makeKingTower } from './models.js';
import { makeHpBar } from './game.js';
import { on, sendState, sendInput } from './net.js';

export const HOST_BROADCAST_INTERVAL = 0.1; // 10Hz，卡牌節奏遊戲夠用，唔使頂爆 Realtime

function modelHeight(es) {
    if (es.isTower) return es.towerKind === 'king' ? 5.2 : 4.2;
    if (es.cardId === 'elephant') return 2.88;
    if (es.cardId === 'watchtower') return 3.0;
    if (es.cardId === 'ballista') return 3.2;
    if (es.cardId === 'mill') return 2.3;
    if (es.cardId === 'knight' || es.cardId === 'scout') return es.cardId === 'knight' ? 2.52 : 2.2;
    if (es.cardId === 'catapult' || es.cardId === 'ram') return 1.8;
    return 2.04;
}

// ---------- Host 端：喺現有 Game 之上加一層廣播 + 遙距入牌 ----------
export function attachHostRelay(game) {
    let acc = 0;
    on('input', (cmd) => {
        game.playCard(TEAM.ENEMY, cmd.handIdx, cmd.x, cmd.z);
    });
    return {
        tick(dt) {
            acc += dt;
            if (acc >= HOST_BROADCAST_INTERVAL) {
                acc -= HOST_BROADCAST_INTERVAL;
                sendState(game.serialize());
            }
        },
        stop() { on('input', null); },
    };
}

// Guest 出卡：唔叫本機 game.playCard，送去畀 host 執行
export function sendGuestPlay(handIdx, x, z) {
    sendInput({ handIdx, x, z });
}

// ---------- Guest 端：純接收快照渲染嘅輕量「假 Game」----------
// 提供 ui.js/main.js 所需嘅最小介面：players/crowns/time/phase/entities/
// aliveUnits()/elixirMultiplier()/updateHpBarOrientation()
export class GuestGame {
    constructor(scene) {
        this.scene = scene;
        this.time = 180;
        this.phase = 'regulation';
        this.result = null;
        this.crowns = { [TEAM.PLAYER]: 0, [TEAM.ENEMY]: 0 };
        this.players = {
            [TEAM.PLAYER]: { elixir: 5, hand: [], next: null },
            [TEAM.ENEMY]: { elixir: 5, hand: [], next: null },
        };
        this.entities = [];
        this.hpBars = [];
        this.byId = new Map();
        this._mult = 1;
        this._clock = 0;
        this.playedCards = { [TEAM.PLAYER]: [], [TEAM.ENEMY]: [] };
        this.towers = { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
    }

    aliveUnits(team) {
        return this.entities.filter(e => !e.dead && e.team === team && !e.isTower);
    }
    elixirMultiplier() { return this._mult; }

    // 同 game.js 一樣嘅部署合法性檢查（畀 guest 本機出兵前預覽用，實際落子仲係由 host 話事）
    validPlacement(team, cardId, x, z) {
        const card = CARDS[cardId];
        if (!card) return null;
        const hw = ARENA.halfW - 0.4, hl = ARENA.halfL - 0.5;
        x = Math.max(-hw, Math.min(hw, x));
        z = Math.max(-hl, Math.min(hl, z));
        if (card.kind === 'spell') return { x, z };

        const ownSide = (zz) => (team === TEAM.PLAYER ? zz : -zz);
        const zSide = ownSide(z);
        if (zSide >= ARENA.riverHalf + 0.25) return { x, z };
        if (card.kind === 'building') return null;

        if (zSide <= -(ARENA.riverHalf + 0.25) && zSide >= -9.5) {
            const enemy = team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER;
            const towerSide = x < 0 ? 'left' : 'right';
            if (this.towers[enemy]?.[towerSide]?.dead) return { x, z };
        }
        return null;
    }
    updateHpBarOrientation(quaternion) {
        for (const bar of this.hpBars) bar.quaternion.copy(quaternion);
    }

    tick(dt) { this._clock += dt; }

    // snap 係 host 用 game.serialize() 傳過嚟嘅原始快照（永遠以 host 角度：
    // TEAM.PLAYER=host、TEAM.ENEMY=guest）。Guest 需要將呢兩個欄位對調，
    // ui.js 先可以照舊當「TEAM.PLAYER=自己」用，唔使另外改晒成套 HUD 邏輯。
    applySnapshot(snap) {
        this.time = snap.time;
        this.phase = snap.phase;
        this._mult = snap.mult;
        this.crowns = { [TEAM.PLAYER]: snap.crowns[TEAM.ENEMY], [TEAM.ENEMY]: snap.crowns[TEAM.PLAYER] };
        this.players = { [TEAM.PLAYER]: snap.players[TEAM.ENEMY], [TEAM.ENEMY]: snap.players[TEAM.PLAYER] };
        this.playedCards = { [TEAM.PLAYER]: snap.playedCards[TEAM.ENEMY], [TEAM.ENEMY]: snap.playedCards[TEAM.PLAYER] };
        if (snap.phase === 'ended' && !this.result) {
            const w = snap.winner;
            this.result = { winner: w == null ? null : (w === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER), crowns: { ...this.crowns } };
        }

        const seen = new Set();
        // 塔嘅生死要用嚟判斷袋位開唔開，用同 crowns/players 一樣嘅「PLAYER=自己」對調視角
        const towers = { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
        for (const es of snap.entities) {
            seen.add(es.id);
            let e = this.byId.get(es.id);
            if (!e) {
                e = this.#spawn(es);
                this.byId.set(es.id, e);
                this.entities.push(e);
            }
            if (es.isTower) {
                const logicalTeam = es.team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER;
                const side = es.towerKind === 'king' ? 'king' : (es.x < 0 ? 'left' : 'right');
                towers[logicalTeam][side] = { dead: es.dead, hp: es.hp, maxHp: es.maxHp };
                if (es.dead && !e.dead) { e.model.visible = false; if (e.hpBar) e.hpBar.visible = false; }
                e.dead = es.dead;
                if (es.dead) continue; // 冧咗嘅塔淨係記低生死，唔使再郁位/播動畫
            }
            if (es.hp < e.prevHp - 0.5) e.model.userData.onHit?.(this._clock);
            e.prevHp = es.hp;
            e.hp = es.hp; e.maxHp = es.maxHp; e.x = es.x; e.z = es.z; e.dead = false;
            e.model.position.set(es.x, 0, es.z);
            e.model.rotation.y = es.facing;
            if (e.hpBar) {
                e.hpBar.position.set(es.x, e.hpBar.userData.h, es.z);
                e.hpBar.userData.setRatio(Math.max(0.001, es.hp / es.maxHp));
                e.hpBar.visible = es.isTower || es.hp < es.maxHp;
            }
            e.model.userData.animate?.(this._clock + e.id * 0.7, { moving: es.moving, attackT: es.attackT });
        }
        this.towers = towers;
        for (const e of [...this.entities]) {
            if (!seen.has(e.id)) {
                this.scene.remove(e.model);
                if (e.hpBar) { this.scene.remove(e.hpBar); this.hpBars = this.hpBars.filter(b => b !== e.hpBar); }
                this.entities = this.entities.filter(x => x !== e);
                this.byId.delete(e.id);
            }
        }
    }

    #spawn(es) {
        const model = es.isTower
            ? (es.towerKind === 'king' ? makeKingTower(es.team) : makePrincessTower(es.team))
            : makeUnitModel(es.cardId, es.team);
        this.scene.add(model);
        const h = modelHeight(es);
        const barW = es.isTower ? 2.1 : Math.max(0.85, (CARDS[es.cardId]?.radius ?? 0.4) * 2.1);
        const hpBar = makeHpBar(barW, es.team);
        hpBar.userData.h = h;
        hpBar.userData.setRatio(1);
        hpBar.visible = !!es.isTower;
        this.scene.add(hpBar);
        this.hpBars.push(hpBar);
        return {
            id: es.id, team: es.team, cardId: es.cardId, isTower: es.isTower,
            model, hpBar, prevHp: es.hp, hp: es.hp, maxHp: es.maxHp, dead: false,
        };
    }

    dispose() {
        for (const e of this.entities) {
            this.scene.remove(e.model);
            if (e.hpBar) this.scene.remove(e.hpBar);
        }
        this.entities = [];
        this.hpBars = [];
        this.byId.clear();
    }
}
