// 主頁 carousel：一次一張、永遠置中、唔可以變成拉成版嘢。
//
// Penny 喺 iPhone 影到嘅症狀：手指向左右撥，卡片會歪咗去左邊，隔籬張
// 露一半，箭咀壓住佢。查出嚟根本唔係 carousel 郁緊——卡片係絕對定位，
// 左右兩邊嗰啲伸出畫面之外又冇被裁走，令文件闊咗七倍（500px 闊嘅機，
// 文件 3446px），所以撥緊嘅係成頁。呢個檔案就係守住呢件事唔好翻兜。
//
// 跑法：node tests/hub.mjs
//
// Playwright 裝咗喺 games/Racing Car/tests（嗰度有 package.json），主頁
// 呢邊唔想為咗一個測試就喺 repo 根開多個 npm 專案，所以直接借用嗰份。

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const INDEX = `file://${path.join(ROOT, 'index.html')}`;
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/Racing Car/tests 行一次 npm install 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);

let pass = 0, fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
}

const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ executablePath: exe });

// 真手指掃：dispatch 真 TouchEvent，唔係直接叫 nextGame()
const swipe = (page, dx) => page.evaluate((delta) => {
    const c = document.querySelector('.carousel-track-container');
    const mk = (type, x) => new TouchEvent(type, {
        changedTouches: [new Touch({ identifier: 1, target: c, screenX: x, clientX: x, screenY: 400, clientY: 400 })],
        bubbles: true,
    });
    c.dispatchEvent(mk('touchstart', 300));
    c.dispatchEvent(mk('touchend', 300 + delta));
}, dx);

const read = (page) => page.evaluate(() => {
    const cards = [...document.querySelectorAll('.game-hub-card')];
    const act = document.querySelector('.game-hub-card.active-card');
    const r = act.getBoundingClientRect();
    const overlap = [...document.querySelectorAll('.nav-btn')].some(b => {
        const q = b.getBoundingClientRect();
        return q.right > r.left && q.left < r.right && q.bottom > r.top && q.top < r.bottom;
    });
    return {
        index: cards.indexOf(act),
        count: cards.length,
        title: act.querySelector('h2').textContent,
        centreOffset: Math.round((r.left + r.right) / 2 - innerWidth / 2),
        fullyInView: r.left >= -1 && r.right <= innerWidth + 1,
        docWidth: document.documentElement.scrollWidth,
        innerWidth,
        arrowOverlapsCard: overlap,
    };
});

for (const vp of [{ width: 320, height: 568 }, { width: 440, height: 956 }, { width: 1280, height: 800 }]) {
    const phone = vp.width < 700;
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(INDEX);
    await page.waitForTimeout(350);

    const start = await read(page);
    const label = `${vp.width}px`;
    check(`${label}：文件唔會闊過畫面（唔會撥到成版郁）`,
        start.docWidth <= start.innerWidth, { doc: start.docWidth, inner: start.innerWidth });
    check(`${label}：卡片置中`, Math.abs(start.centreOffset) <= 2, start.centreOffset);
    check(`${label}：卡片完整喺畫面入面`, start.fullyInView, start);

    // 向左掃三次：每次剛好行一張，而且每張都要置返中
    let prev = start;
    let oneStep = true, centred = true;
    for (let i = 0; i < 3; i++) {
        await swipe(page, -200);
        await page.waitForTimeout(320);
        const now = await read(page);
        if ((prev.index + 1) % now.count !== now.index) oneStep = false;
        if (Math.abs(now.centreOffset) > 2 || !now.fullyInView) centred = false;
        prev = now;
    }
    check(`${label}：一次掃剛好行一張`, oneStep, prev);
    check(`${label}：每一張都置返中`, centred, prev);

    // 掃返轉頭要行返轉頭
    await swipe(page, 200);
    await page.waitForTimeout(320);
    const back = await read(page);
    check(`${label}：反方向掃會退返一張`,
        (back.index + 1) % back.count === prev.index, { from: prev.index, to: back.index });

    if (phone) {
        check(`${label}：箭咀唔會壓住卡片`, back.arrowOverlapsCard === false, back);
    }
    check(`${label}：冇 console／page 錯誤`, errors.length === 0, errors);
    await page.close();
}

await browser.close();
console.log(`\nhub: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
