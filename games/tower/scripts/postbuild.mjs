// Rewrites the Vite-emitted module script tag into a plain deferred script so
// dist/index.html works under file:// and GitHub Pages without ES-module CORS issues.
// Idempotent: safe to run multiple times. Fails loudly if the tag can't be found.
import fs from 'node:fs';

const htmlPath = 'dist/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /<script\b[^>]*\bsrc="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/g,
    '<script defer src="$1"></script>'
);

if (!/<script defer src="\.\/assets\//.test(html)) {
    throw new Error('postbuild: no <script defer src="./assets/..."> tag in dist/index.html — build output changed?');
}

fs.writeFileSync(htmlPath, html);
console.log('postbuild: script tag rewritten OK');

/* ------------------------------------------------------------------
 * Draco 壓縮：dist/models/**.glb
 * ------------------------------------------------------------------
 *
 * 實測（Fast 3G、390×844）：開場要落 1,291 KB，其中 **1,087 KB 係未壓過嘅
 * GLB**。而同一個 repo 入面 MOBA 同 Empire Royale 老早就用緊 Draco。
 *
 * 78 個檔量過三條路：
 *
 *     原本                                    1,183 KB
 *     meshopt   762 KB ＋ decoder ~25 KB   =   787 KB
 *     draco     378 KB ＋ decoder 246 KB   =   624 KB   ← 揀咗
 *
 * decoder 係一次性成本（而且跨次訪問 cache 得住），模型係每次都要落。
 * meshopt decoder 細好多，但佢喺呢批模型上面只壓到 64%，Draco 壓到 32%。
 *
 * **`public/models/` 保持原樣**——Draco 係有損（位置量化到 14 bit），
 * 源檔要留返一份冇動過嘅。壓縮淨係喺 build 出嚟嗰份做。
 */
import nodePath from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const 掃 = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = nodePath.join(dir, e.name);
    return e.isDirectory() ? 掃(p) : (p.endsWith('.glb') ? [p] : []);
});

const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    });

const 模型 = fs.existsSync('dist/models') ? 掃('dist/models') : [];
let 前 = 0, 後 = 0, 跳 = 0;
for (const f of 模型) {
    const s = fs.statSync(f).size;
    前 += s;
    try {
        const doc = await io.read(f);
        // 已經壓過就唔好再壓一次（idempotent：postbuild 可以重複行）
        if (doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === 'KHR_draco_mesh_compression')) {
            後 += s; 跳 += 1; continue;
        }
        await doc.transform(draco());
        fs.writeFileSync(f, await io.writeBinary(doc));
        後 += fs.statSync(f).size;
    } catch (err) {
        // **壓唔到唔可以靜靜雞當冇事**——一個壓失敗嘅檔會照樣派出去，
        // 而個 decoder 已經接咗落去，之後就係一個「有時得有時唔得」嘅 bug。
        throw new Error(`postbuild: draco 壓 ${f} 失敗 — ${err.message}`);
    }
}

// Decoder 一齊派：同源，唔靠外部 CDN（同 MOBA／Royale 一樣嘅做法）。
const 來源 = 'node_modules/three/examples/jsm/libs/draco/gltf';
fs.mkdirSync('dist/draco', { recursive: true });
for (const f of ['draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
    fs.copyFileSync(nodePath.join(來源, f), nodePath.join('dist/draco', f));
}

console.log(`postbuild: draco ${模型.length} 個模型 ${Math.round(前 / 1024)} KB → ${Math.round(後 / 1024)} KB`
    + (跳 ? `（${跳} 個本來已經壓過）` : ''));
