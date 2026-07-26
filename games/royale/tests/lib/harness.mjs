// Royale 回歸測試共用骨架：靜態伺服器 + Chromium + 錯誤收集 + 斷言計分。
//
// 點解要有呢個檔案：Royale 冇 build step，亦冇 npm test。以前呢批測試只存在
// 於某一次 cloud session 嘅臨時目錄，容器一收就冇，第二個 agent 讀到 handoff
// 寫住「leak gate 116 geometries」但無法自己重跑。測試入咗 repo 先算數。
//
// 用法見同層 ../README.md。

import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.glb': 'model/gltf-binary',
    '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

// 用 port 0 攞隨機空 port：測試可以並行跑，唔會撞死 port
function serve() {
    const server = http.createServer((req, res) => {
        let p = path.join(REPO_ROOT, decodeURIComponent(req.url.split('?')[0]));
        if (p.endsWith('/')) p += 'index.html';
        if (!p.startsWith(REPO_ROOT)) { res.writeHead(403); res.end(); return; }
        fs.readFile(p, (err, data) => {
            if (err) { res.writeHead(404); res.end('not found'); return; }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise(resolve => {
        server.listen(0, () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
    });
}

// 揀邊個 Chromium：
// 1. PLAYWRIGHT_CHROMIUM 環境變數（想指定就指定）
// 2. 預裝喺 /opt/pw-browsers/chromium 嘅（雲端沙盒係咁擺，同時亦唔畀重新下載）
// 3. 交返畀 Playwright 自己搵（本機 `npx playwright install` 之後就係呢條路）
function resolveChromium() {
    if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
    const preinstalled = '/opt/pw-browsers/chromium';
    return fs.existsSync(preinstalled) ? preinstalled : undefined;
}

// 開一版載好模型、企喺開始畫面嘅 Royale。
// skipTutorial 預設 true：ADR-014 嘅首次教學係 modal，會擋住所有點擊，
// 自動化必須先關咗佢，否則所有 UI 測試都會 timeout（唔係遊戲有 bug）。
export async function openRoyale({
    viewport = { width: 900, height: 820 },
    skipTutorial = true,
    ignore404 = true,
} = {}) {
    const { server, origin } = await serve();
    const browser = await chromium.launch({
        executablePath: resolveChromium(),
        args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
    });
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => {
        if (m.type() !== 'error') return;
        const text = m.text();
        if (ignore404 && (text.includes('404') || text.includes('favicon'))) return;
        // Supabase 喺離線／沙盒環境一定連唔到，唔算功能錯誤
        if (text.includes('ERR_TUNNEL_CONNECTION_FAILED') || text.includes('Failed to load resource')) return;
        errors.push('console: ' + text);
    });

    await page.goto(`${origin}/games/royale/index.html`);
    await page.waitForSelector('#loading', { state: 'detached', timeout: 90000 });
    if (skipTutorial) {
        await page.evaluate(async () => {
            const s = await import('./src/storage.js');
            s.markTutorialSeen();
        });
    }

    return {
        page, errors, origin,
        async enterMenuMatch() {           // 撳「開戰」入一場標準單人局
            await page.click('#start-btn');
            await page.waitForTimeout(700);
        },
        async close() {
            await browser.close();
            server.close();
        },
    };
}

// ---------- 斷言計分 ----------
const results = [];

export function check(name, ok, detail) {
    results.push({ name, ok: !!ok });
    // 失敗一定印晒證據；通過就淨係印短嘅（長物件會浸死輸出）
    let line = '';
    if (detail !== undefined) {
        const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
        if (!ok || text.length <= 80) line = ` ${text}`;
    }
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${line}`);
}

export function checkNoErrors(errors) {
    const unique = [...new Set(errors)];
    check('冇 console／page 錯誤', unique.length === 0, unique.slice(0, 4));
}

// 每個測試檔最尾叫一次：印總結，有失敗就用非零 exit code（run-all 靠呢個判斷）
export function finish(label) {
    const failed = results.filter(r => !r.ok);
    console.log(`\n${label}: ${results.length - failed.length}/${results.length} 通過`);
    if (failed.length) {
        console.log('失敗項目: ' + failed.map(r => r.name).join(', '));
        process.exitCode = 1;
    }
}
