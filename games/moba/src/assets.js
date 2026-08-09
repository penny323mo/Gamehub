// 資產載入。
//
// 一個關鍵決定值得寫低：九個角色（5 個冒險者 + 4 個骷髏）用同一副 41 條骨、
// 骨名逐個對得上，而骷髏嗰 95 個動畫係冒險者嗰 76 個嘅超集。three.js 嘅
// AnimationClip 係靠「節點名」綁定，唔係靠某一副 skeleton 物件，所以
// 一份動畫庫可以播喺任何一個模型身上。
//
// 結果：原始九個檔 35MB → 一份 anims.glb（0.87MB）+ 九個淨 mesh 檔（合共
// 0.75MB，Draco 壓縮）。唔用共用庫嘅話，同一批動畫要重複儲九次。

import * as THREE from '../vendor/three.module.min.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { DRACOLoader } from '../vendor/DRACOLoader.js';
import { clone as cloneSkinned } from '../vendor/SkeletonUtils.js';
// 版本標記要跟 MOBA 嘅規矩（`tests/cache-bust.mjs` ＋ browser 測試會查）：
// 每一個攞落嚟嘅專案檔都要帶標記，唔係嘅話換咗版本返轉頭嘅玩家攞到舊檔。
import { 建位元組進度 } from '../../shared/js/byte-progress.mjs?v=assets-29';

const BASE = new URL('../assets/models/', import.meta.url).href;

// 模型檔嘅版本標記。之前 src/ 入面每一個 import 都帶標記，但真正落到網絡
// 嘅六十七個請求入面，只有十九個有——十二個 .glb 一個都冇。即係換咗一個
// 角色模型推上去，返轉頭嘅玩家攞到嘅仲係舊嗰隻。ADR-111 講嘅係同一件事，
// 只係當時只覆蓋到 module 圖，冇覆蓋到資產。
// 標記唔另外寫一次，直接由呢個 module 自己個 URL 攞——bump 腳本改咗
// import，呢度就自動跟，唔會有一個「記住要一齊改」嘅位。
const V = new URL(import.meta.url).searchParams.get('v');
const bust = (u) => (V ? `${u}${u.includes('?') ? '&' : '?'}v=${V}` : u);

export const CHAMPION_MODELS = {
    knight: 'champions/knight.glb',
    barbarian: 'champions/barbarian.glb',
    mage: 'champions/mage.glb',
    rogue: 'champions/rogue.glb',
    ranger: 'champions/ranger.glb',
    skeleton_mage: 'minions/skeleton_mage.glb',
};
export const MINION_MODELS = {
    skeleton_minion: 'minions/skeleton_minion.glb',
    skeleton_archer: 'minions/skeleton_archer.glb',
    skeleton_warrior: 'minions/skeleton_warrior.glb',
};

let loader = null;
function getLoader() {
    if (loader) return loader;
    const draco = new DRACOLoader();
    draco.setDecoderPath(new URL('../vendor/draco/', import.meta.url).href);
    loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    return loader;
}

const loadOnce = (url, 報) => new Promise((res, rej) =>
    getLoader().load(url, res, 報 ? (e) => 報(e.loaded, e.total) : undefined, rej));

// 手機網絡會斷斷續續，而呢度有十二個資產行 Promise.all——任何一個甩咗，
// 成個載入就 reject，玩家見到「載入失敗」跟住乜都做唔到。實測甩一次就
// 已經係咁。一次過性嘅失敗值得自己再試，唔應該要玩家自己撳重新整理。
const loadGltf = async (url, attempts = 3, 報) => {
    let last;
    for (let i = 0; i < attempts; i++) {
        try {
            return await loadOnce(url, 報);
        } catch (err) {
            last = err;
            if (i < attempts - 1) await new Promise(r => setTimeout(r, 300 * (i + 1)));
        }
    }
    throw last;
};

// KayKit 嘅圖集係 sRGB、無 mipmap 會閃，所以逐張材質校正一次。
function fixMaterials(root) {
    root.traverse((o) => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
            if (!m) continue;
            if (m.map) {
                m.map.colorSpace = THREE.SRGBColorSpace;
                m.map.anisotropy = 4;
            }
            m.roughness = m.roughness ?? 0.85;
            m.metalness = 0;
        }
    });
}

export class Assets {
    constructor() {
        this.clips = new Map();       // 名 -> AnimationClip
        this.champions = new Map();   // id -> { scene }
        this.minions = new Map();
        this.arena = null;            // 一個 Group，入面每件資產都係具名子節點
        this.weapons = null;
    }

    // onProgress(分數, { 完咗, 件數 }) 畀載入畫面用。
    //
    // 以前係 onProgress(done, total)，即係「幾多件落完」。但下面十四個 job
    // 係 `Promise.all` 平行落嘅——頻寬分薄，冇一件會早早完成。實測 Fast 3G：
    // 撳完之後畫面連續 23.6 秒一個 pixel 都冇變，個 label 一直係開場嗰句
    // 「載入資產…」，一次都冇更新過。所以改成量位元組。
    async 落一批(jobs, onProgress) {
        const 進度 = 建位元組進度(jobs.length, onProgress);
        const results = await Promise.all(jobs.map(async ([key, file]) => {
            const url = bust(BASE + file);
            const gltf = await loadGltf(url, 3, (落咗, 全) => 進度.報(url, 落咗, 全));
            進度.完(url);
            return [key, gltf];
        }));
        進度.齊();
        this.收(results);
        return this;
    }

    /*
     * 揀英雄嗰版**用唔著**戰場：`portraits.js` 淨係要 `unit('champ', …)` 同
     * `clip('Idle_Combat')`，而 `arena` / `weapons` / 小兵 全部只喺 `view.js`
     * 入面（即係開咗場之後）先用得着。
     *
     * 但以前一次過落晒——即係你要等埋 576 KB 你喺揀人嗰陣一眼都見唔到嘅嘢,
     * 先至畀你揀人。Fast 3G 實測成個載入 16.0 秒。
     *
     * 拆開之後：必要嗰批（動畫庫 ＋ 六個英雄）落完就出揀人版，其餘嗰批
     * 喺你睇緊英雄卡嗰陣喺背景落。**呢個唔係壓縮，係重排時間軸**——
     * 一個 byte 都冇少，但你早咗見到你要做嘅決定。
     */
    async load(onProgress = () => {}) {
        return this.落一批([
            ['anims', 'anims.glb'],
            ...Object.entries(CHAMPION_MODELS).map(([k, v]) => ['champ:' + k, v]),
        ], onProgress);
    }

    /** 開場先用得着嗰批。揀人版出咗之後喺背景落。 */
    async 載戰場(onProgress = () => {}) {
        return this.落一批([
            ['arena', 'arena.glb'],
            ['weapons', 'weapons.glb'],
            ...Object.entries(MINION_MODELS).map(([k, v]) => ['minion:' + k, v]),
        ], onProgress);
    }

    收(results) {
        for (const [key, gltf] of results) {
            if (key === 'anims') {
                for (const clip of gltf.animations) this.clips.set(clip.name, clip);
            } else if (key === 'arena') {
                fixMaterials(gltf.scene);
                this.arena = gltf.scene;
            } else if (key === 'weapons') {
                fixMaterials(gltf.scene);
                this.weapons = gltf.scene;
            } else if (key.startsWith('champ:')) {
                fixMaterials(gltf.scene);
                this.champions.set(key.slice(6), gltf.scene);
            } else {
                fixMaterials(gltf.scene);
                this.minions.set(key.slice(7), gltf.scene);
            }
        }
        if (!this.clips.size) throw new Error('動畫庫載入失敗');
    }

    clip(name) {
        const c = this.clips.get(name);
        if (!c) throw new Error(`冇呢個動畫：${name}`);
        return c;
    }

    // 場景資產：由 arena.glb 入面按名攞一份 copy
    piece(name) {
        const src = this.arena.getObjectByName(name);
        if (!src) throw new Error(`arena.glb 冇呢件：${name}`);
        return src.clone(true);
    }
    hasPiece(name) { return !!this.arena.getObjectByName(name); }

    weapon(name) {
        const src = this.weapons.getObjectByName(name);
        if (!src) throw new Error(`weapons.glb 冇呢件：${name}`);
        return src.clone(true);
    }

    // 角色：SkeletonUtils.clone 先會連骨架一齊複製，直接 clone() 係唔夠嘅
    unit(kind, id) {
        const src = (kind === 'champ' ? this.champions : this.minions).get(id);
        if (!src) throw new Error(`冇呢個模型：${kind}/${id}`);
        return cloneSkinned(src);
    }
}
