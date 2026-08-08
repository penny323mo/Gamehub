import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 資產嘅單一入口。
//
// 呢隻遊戲本來零資產：`towerRenderer.ts` 九百幾行由圓柱同方塊砌塔。而家改用
// Kenney 嘅 CC0 kit（`public/models/`，牌照原文喺 `public/models/licenses/`）。
//
// 有兩件事要喺呢度做一次，唔好散落各處：
//
// 1. **一個 GLB 只可以載一次**。塔同敵人係幾十上百件，每件都 fetch 一次就
//    等於同一個檔載一百次。呢度 cache 住 `Promise`，唔係 cache 住結果——
//    咁樣同時叫十次都只會發一個請求。
// 2. **克隆嗰陣要共用 material**。`SkeletonUtils` 級數嘅嘢用唔著（啲模型冇骨），
//    但 `Object3D.clone()` 預設會共用 geometry 同 material，正好——一百座塔
//    共用同一份 geometry，GPU 先至頂得順。要獨立改色嗰陣先至 clone material。

// 路徑用**相對文件**，唔用 `import.meta.url`：build 完 bundle 喺 `dist/assets/`，
// `import.meta.url` 畀 Vite 改寫之後解出嚟係 bundle 檔名本身，接落去就變成
// `index-BPBhRWuv.jstiles/tile.glb`——一個永遠 404、而且 build 之前試唔到嘅路徑。
// `public/` 嘅嘢會原樣派落 dist 根，所以 dev 同 dist 兩邊 `models/` 都啱。
/**
 * **`metalness = 1` 呢個坑要喺呢度堵。**
 *
 * glTF 規格入面 `metallicFactor` 嘅預設值係 **1.0**，而 Kenney 呢批模型個
 * exporter 根本冇寫呢個欄位——於是每一件都變成「全金屬」。PBR 入面全金屬
 * **冇 diffuse**：佢嘅顏色全部嚟自反射環境。呢個場冇 environment map，
 * 所以反射到嘅係零，成套模型渲染出嚟近乎黑色。
 *
 * 實測：換咗模型之後成幅畫平均亮度 **3.8 / 255**、99.9% 像素接近全黑；
 * 我加大三倍燈只係去到 14.9——因為問題根本唔喺燈度。
 *
 * 呢批係扁平色嘅風格化模型，本來就唔係金屬，所以 metalness 拉返 0。
 */
function 修材質(mat: THREE.MeshStandardMaterial): void {
    if (!mat || !('metalness' in mat)) return;
    mat.metalness = 0;
    mat.roughness = Math.min(mat.roughness ?? 1, 0.85);
}

const BASE = 'models/';
const loader = new GLTFLoader();
const 載緊 = new Map<string, Promise<THREE.Group>>();

/** 載一個 GLB（同一條 path 只會載一次）。返回嘅嘢**唔好直接改**，要 clone。 */
export function 載模型(rel: string): Promise<THREE.Group> {
    let p = 載緊.get(rel);
    if (!p) {
        p = loader.loadAsync(`${BASE}${rel}`).then((g) => {
            const root = g.scene;
            root.traverse((o) => {
                const m = o as THREE.Mesh;
                if (!m.isMesh) return;
                m.castShadow = true;
                m.receiveShadow = true;
                for (const mat of (Array.isArray(m.material) ? m.material : [m.material])) {
                    修材質(mat as THREE.MeshStandardMaterial);
                }
            });
            return root;
        });
        載緊.set(rel, p);
    }
    return p;
}

/** 攞一份用得嘅副本（共用 geometry／material）。 */
export async function 取(rel: string): Promise<THREE.Group> {
    return (await 載模型(rel)).clone(true);
}

/** 一次過預載，開場前行——中途先載會見到嘢逐件跳出嚟。 */
export async function 預載(list: readonly string[]): Promise<void> {
    await Promise.all(list.map(async (r) => { 現成.set(r, await 載模型(r)); }));
}

const 現成 = new Map<string, THREE.Group>();

/**
 * 同步攞一份副本。**淨係預載過先至攞到**。
 *
 * 起塔／起門係同步發生嘅（一個 bus event 就即刻要有嘢畫），冇得 await。
 * 與其喺嗰度塞個 promise 令嘢遲幾幀先出現，不如開場前預載晒——未預載就
 * 大聲掛，唔好靜靜哋畫少一件嘢。
 */
export function 取同步(rel: string): THREE.Group {
    const g = 現成.get(rel);
    if (!g) throw new Error(`模型未預載就攞：${rel}`);
    return g.clone(true);
}

/**
 * 量一個模型：量度用嘅接口（`tests/assets.mjs`）行嘅就係呢條，
 * 同遊戲用嘅係同一個 loader、同一個 cache。
 */
export async function 量模型(rel: string): Promise<{
    mesh: number; mat: number; tri: number; 尺: [number, number, number]; 底: number;
} | { 掛咗: string }> {
    try {
        const root = await 載模型(rel);
        let mesh = 0, mat = 0, tri = 0;
        root.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            mesh += 1;
            mat += Array.isArray(m.material) ? m.material.length : 1;
            const idx = m.geometry.getIndex();
            tri += (idx ? idx.count : m.geometry.getAttribute('position').count) / 3;
        });
        const box = new THREE.Box3().setFromObject(root);
        const s = box.getSize(new THREE.Vector3());
        return {
            mesh, mat, tri: Math.round(tri),
            尺: [+s.x.toFixed(3), +s.y.toFixed(3), +s.z.toFixed(3)],
            底: +box.min.y.toFixed(3),
        };
    } catch (e) {
        return { 掛咗: String(e).slice(0, 90) };
    }
}
