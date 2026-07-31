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

const BASE = new URL('../assets/models/', import.meta.url).href;

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

const loadGltf = (url) => new Promise((res, rej) => getLoader().load(url, res, undefined, rej));

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

    // onProgress(done, total) 畀載入畫面用
    async load(onProgress = () => {}) {
        const jobs = [
            ['anims', 'anims.glb'],
            ['arena', 'arena.glb'],
            ['weapons', 'weapons.glb'],
            ...Object.entries(CHAMPION_MODELS).map(([k, v]) => ['champ:' + k, v]),
            ...Object.entries(MINION_MODELS).map(([k, v]) => ['minion:' + k, v]),
        ];
        let done = 0;
        const results = await Promise.all(jobs.map(async ([key, file]) => {
            const gltf = await loadGltf(BASE + file);
            onProgress(++done, jobs.length);
            return [key, gltf];
        }));

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
        return this;
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
