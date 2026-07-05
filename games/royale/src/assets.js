// Quaternius CC0 模型載入器（https://quaternius.com）
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { clone as skeletonClone } from '../vendor/SkeletonUtils.js';

const FILES = {
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
    // ---- Meshy.ai 生成模型（玩家提供）----
    meshyElephant: 'units/war_elephant.glb',
    meshyRam: 'siege/siege_ram.glb',
    meshyCatapult: 'siege/catapult.glb',
    meshyTower: 'buildings/watchtower.glb',
    meshyMainBase: 'buildings/main_base.glb',
    meshySideTower: 'buildings/side_tower.glb',
    meshyRubble: 'buildings/tower_rubble.glb',
    meshyArrow: 'projectiles/arrow_projectile.glb',
    meshyStone: 'projectiles/stone_projectile.glb',
    meshyBanner: 'environment/team_banner.glb',
    meshyBridgeStones: 'environment/bridge_stones.glb',
    meshyProps: 'environment/props_pack.glb',
    meshyDebris: 'environment/burnt_debris.glb',
    meshySpawnMarker: 'effects/spawn_marker.glb',
    meshyMilitia: 'units/militia.glb',
    meshySwordsman: 'units/swordsman.glb',
    meshyPikeman: 'units/pikeman.glb',
    meshyArcher: 'units/archer.glb',
    meshyMusketeer: 'units/musketeer.glb',
    meshyCavalry: 'units/cavalry.glb',
    // 未接入（optional，見 ASSET_MAPPING.md）：
    // environment/bridge.glb（比例似長凳）、tree_pack.glb（連地台）、fence_segment.glb
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
                // Meshy 素模有啲冇 normals，補返
                if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
            }
        });
        // 載入時（未 pose 過）量原始大細 — 動畫 rig 嘅 scale 軌會令事後量度唔準
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const rawSize = box.getSize(new THREE.Vector3());
        let hasSkin = false;
        gltf.scene.traverse((o) => { if (o.isSkinnedMesh) hasSkin = true; });
        ASSETS[key] = {
            scene: gltf.scene, animations: gltf.animations, hasSkin,
            rawSize, rawMin: box.min.clone(),
            rawHeight: rawSize.y || 1,
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

// 按最大呎吋縮放並將模型底部貼返地面（適合 pivot 亂嘅靜態模型）
export function scaleToFit(key, obj, targetSize, { byFootprint = false } = {}) {
    const a = ASSETS[key];
    const base = byFootprint
        ? Math.max(a.rawSize.x, a.rawSize.z)
        : Math.max(a.rawSize.x, a.rawSize.y, a.rawSize.z);
    const s = targetSize / (base || 1);
    obj.scale.multiplyScalar(s);
    obj.position.y = -a.rawMin.y * s;
    return s;
}

// 複製一份模型（支援 skinned mesh），可以逐個染色
export function instantiate(key, { tint = null, cloneMaterials = false } = {}) {
    const src = ASSETS[key];
    // 有 skinned mesh（就算冇動畫）都要用 SkeletonUtils clone，否則骨架斷開會隱形
    const obj = (src.animations.length || src.hasSkin) ? skeletonClone(src.scene) : src.scene.clone(true);
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

// 按載入時量得嘅 Y 高度縮放＋貼地（用於冇骨架嘅靜態人形素模）
export function scaleToHeightGrounded(key, obj, targetHeight) {
    const a = ASSETS[key];
    const s = targetHeight / (a.rawSize.y || 1);
    obj.scale.multiplyScalar(s);
    obj.position.y = -a.rawMin.y * s;
    return s;
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
