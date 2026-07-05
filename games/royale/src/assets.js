// Quaternius CC0 模型載入器（https://quaternius.com）
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { clone as skeletonClone } from '../vendor/SkeletonUtils.js';

const FILES = {
    knight: 'KnightCharacter.glb',
    horse: 'Horse.glb',
    sword: 'Sword.glb',
    spear: 'Spear.glb',
    bow: 'Bow_Wooden.glb',
    shield: 'Shield_Heater.glb',
    axe: 'Axe_Small.glb',
    arrow: 'Arrow.glb',
    towerSmall: 'TowerHouse_FirstAge.glb',
    towerBig: 'TowerHouse_SecondAge.glb',
    kingCastle: 'Barracks_SecondAge_Level3.glb',
    pine: 'Resource_PineTree.glb',
    tree1: 'Resource_Tree1.glb',
    tree2: 'Resource_Tree2.glb',
    rock1: 'Resource_Rock_1.glb',
    rock2: 'Resource_Rock_2.glb',
    crate: 'Crate.glb',
    barrel: 'Barrel.glb',
    mountain: 'Mountain_Single.glb',
};

export const ASSETS = {}; // { key: { scene, animations, rawSize, rawHeight } }

export async function loadAssets(onProgress) {
    const loader = new GLTFLoader();
    const keys = Object.keys(FILES);
    let done = 0;
    await Promise.all(keys.map(async (key) => {
        const gltf = await loader.loadAsync(`assets/models/${FILES[key]}`);
        gltf.scene.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.frustumCulled = false; // skinned mesh 郁動時容易被錯誤剔除
            }
        });
        // 載入時（未 pose 過）量原始大細 — 動畫 rig 嘅 scale 軌會令事後量度唔準
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const rawSize = box.getSize(new THREE.Vector3());
        ASSETS[key] = {
            scene: gltf.scene, animations: gltf.animations,
            rawSize, rawHeight: rawSize.y || 1,
            rawLen: Math.max(rawSize.x, rawSize.y, rawSize.z) || 1,
        };
        done++;
        onProgress?.(done / keys.length);
    }));
    return ASSETS;
}

// 用載入時記低嘅原始高度計 scale（適用於有動畫 rig 嘅模型）
export function scaleToHeight(key, obj, targetHeight) {
    const s = targetHeight / ASSETS[key].rawHeight;
    obj.scale.multiplyScalar(s);
    return s;
}

// 複製一份模型（支援 skinned mesh），可以逐個染色
export function instantiate(key, { tint = null, cloneMaterials = false } = {}) {
    const src = ASSETS[key];
    const obj = src.animations.length ? skeletonClone(src.scene) : src.scene.clone(true);
    if (cloneMaterials || tint) {
        const cache = new Map();
        obj.traverse((o) => {
            if (!o.isMesh) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            const cloned = mats.map((m) => {
                if (!cache.has(m.uuid)) {
                    const c = m.clone();
                    if (tint && tint[m.name]) c.color.set(tint[m.name]);
                    cache.set(m.uuid, c);
                }
                return cache.get(m.uuid);
            });
            o.material = Array.isArray(o.material) ? cloned : cloned[0];
        });
    }
    return obj;
}

// 統一縮放：將模型最高點縮到 targetHeight
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
export function normalizeHeight(obj, targetHeight) {
    _box.setFromObject(obj);
    _box.getSize(_size);
    const s = targetHeight / (_size.y || 1);
    obj.scale.multiplyScalar(s);
    return s;
}

export function findBone(obj, pattern) {
    let found = null;
    obj.traverse((o) => {
        if (!found && pattern.test(o.name)) found = o;
    });
    return found;
}

export function getClip(key, name) {
    const anims = ASSETS[key].animations;
    return anims.find(a => a.name.endsWith('|' + name) || a.name === name) ?? null;
}
