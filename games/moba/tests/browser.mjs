// 瀏覽器層測試：sim.mjs 驗規則，呢度驗「隻遊戲真係開得著同揸得郁」。
//
// 兩層分開嘅原因喺 sim.js 開頭已經寫咗。呢度只查視覺層先會出事嘅嘢：
// 資產載唔載到、選人開唔開得到場、操作有冇接通、打橫打直排版會唔會疊、
// 以及主控台有冇報錯。
//
// 跑法：node games/moba/tests/browser.mjs

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.glb': 'model/gltf-binary', '.json': 'application/json', '.png': 'image/png',
    '.wasm': 'application/wasm', '.css': 'text/css',
};

let pass = 0, fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
}

const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(ROOT, u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('404');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});
const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
const URL_BASE = `http://localhost:${port}/games/moba/index.html`;

const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
});

// 收集頁面錯誤：任何一個未捉到嘅例外都應該當測試失敗
function watch(page) {
    const errs = [];
    page.on('pageerror', e => errs.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
    page.on('response', r => {
        if (r.status() >= 400 && !r.url().includes('favicon')) errs.push(`HTTP ${r.status()} ${r.url()}`);
    });
    return errs;
}

// 兩個尺寸都要試：手機轉向係呢個 repo 反覆出過事嘅地方
for (const [tag, viewport] of [['打橫', { width: 1280, height: 640 }], ['打直', { width: 430, height: 860 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errs = watch(page);
    await page.goto(URL_BASE, { waitUntil: 'load' });

    const gotSelect = await page.waitForSelector('#select:not(.hidden)', { timeout: 90000 }).catch(() => null);
    check(`${tag}：資產載得晒、去到選人畫面`, !!gotSelect,
        gotSelect ? undefined : await page.textContent('#load-label').catch(() => '?'));
    if (!gotSelect) { await page.close(); continue; }

    const cards = await page.$$('#pick-grid .pick-card');
    check(`${tag}：六個英雄都出得到卡`, cards.length === 6, cards.length);

    await page.click('#pick-go');
    const started = await page.waitForFunction('window.__mobaReady === true', { timeout: 45000 })
        .then(() => true).catch(() => false);
    check(`${tag}：開得到場`, started);
    if (!started) { await page.close(); continue; }

    await page.waitForTimeout(1200);

    // HUD 要齊人
    for (const [sel, label] of [['.moba-top', '上方比分'], ['.moba-panel', '血魔面板'],
        ['.moba-skills .moba-skill', '技能掣'], ['.moba-board', '計分板'], ['.moba-shopbtn', '商店掣']]) {
        check(`${tag}：${label}出得到`, (await page.$$(sel)).length > 0);
    }

    // 排版唔可以疊：實測直向之下計分板會撞頂欄、技能掣會壓住血條
    const overlap = await page.evaluate(() => {
        const box = (s) => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); };
        const hit = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const pairs = [['.moba-top', '.moba-board'], ['.moba-panel', '.moba-skills'],
            ['.moba-panel', '.moba-shopbtn'], ['.moba-skills', '.moba-shopbtn']];
        return pairs.filter(([a, b]) => hit(box(a), box(b))).map(p => p.join(' × '));
    });
    check(`${tag}：HUD 冇互相遮住`, overlap.length === 0, overlap);

    // HUD 唔可以食晒中間：一條線嘅 MOBA 最緊要睇到兵線
    const clear = await page.evaluate(() => {
        const r = document.querySelector('#gl').getBoundingClientRect();
        const cx = r.width / 2, cy = r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        return top?.id === 'gl';
    });
    check(`${tag}：畫面正中冇被 HUD 蓋住`, clear);

    // 技能掣要接得通輸入（撳一下唔應該拋錯）
    await page.click('.moba-skills .moba-skill');
    await page.waitForTimeout(200);

    // 商店開關
    await page.click('.moba-shopbtn');
    await page.waitForTimeout(150);
    check(`${tag}：商店開得到`, await page.$eval('.moba-shop', e => !e.classList.contains('hidden')));
    check(`${tag}：商店有貨`, (await page.$$('.moba-shop .moba-item')).length >= 10);
    await page.click('.moba-shop .moba-x');

    // 快進成場波：一定要有結果，唔可以卡死或者拋錯
    const outcome = await page.evaluate(() => {
        const s = window.__sim;
        let guard = 0;
        while (!s.over && guard++ < 30 * 60 * 26) s.step(1 / 30);
        return s.over ? { winner: s.over.winner, mins: +(s.time / 60).toFixed(1), byTime: !!s.over.byTime } : null;
    });
    check(`${tag}：一整場跑得完並分到勝負`, outcome && outcome.winner != null, outcome);
    await page.waitForTimeout(600);

    check(`${tag}：主控台零錯誤`, errs.length === 0, errs.slice(0, 4));
    await page.close();
}

await browser.close();
server.close();

console.log(`\nmoba browser: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目: ' + failed.join('、')); process.exit(1); }
