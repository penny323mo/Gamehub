// 瀏覽器層測試：sim.mjs 驗規則，呢度驗「隻遊戲真係開得著同揸得郁」。
//
// 兩層分開嘅原因喺 sim.js 開頭已經寫咗。呢度只查視覺層先會出事嘅嘢：
// 資產載唔載到、選人開唔開得到場、操作有冇接通、打橫打直排版會唔會疊、
// 以及主控台有冇報錯。
//
// 跑法：node games/moba/tests/browser.mjs
//
// Playwright 沿用 games/Racing Car/tests 嗰個安裝——同 tests/hub.mjs 一樣。
// 之前呢度寫 `import { chromium } from 'playwright'`，靠嘅係倉庫某處有個冇入
// 版本控制嘅 node_modules；嗰個目錄一冇咗，成套測試就即刻開唔到，而喺全新
// clone 度根本從來未行得到。指名一條路就冇咗呢個隱形相依。

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/Racing Car/tests 行一次 npm install 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);
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
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, hasTouch: true });
    const errs = watch(page);
    await page.goto(URL_BASE, { waitUntil: 'load' });

    const gotSelect = await page.waitForSelector('#select:not(.hidden)', { timeout: 90000 }).catch(() => null);
    check(`${tag}：資產載得晒、去到選人畫面`, !!gotSelect,
        gotSelect ? undefined : await page.textContent('#load-label').catch(() => '?'));
    if (!gotSelect) { await page.close(); continue; }

    const cards = await page.$$('#pick-grid .pick-card');
    check(`${tag}：六個英雄都出得到卡`, cards.length === 6, cards.length);
    const faces = await page.$$eval('#pick-grid .pick-card img.face',
        ns => ns.filter(n => n.src.startsWith('data:image')).length);
    check(`${tag}：六張卡都有 3D render 出嚟嘅頭像`, faces === 6, faces);

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
    // 用真 touch path 開、買、關；mouse click 通過唔代表 iPhone Safari 觸控層冇卡住。
    const touch = async (selector) => {
        const box = await page.locator(selector).first().boundingBox();
        if (!box) throw new Error(`touch target missing: ${selector}`);
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    };
    await touch('.moba-shopbtn');
    await page.waitForTimeout(150);
    check(`${tag}：商店開得到`, await page.$eval('.moba-shop', e => !e.classList.contains('hidden')));
    check(`${tag}：商店有貨`, (await page.$$('.moba-shop .moba-item')).length >= 10);
    const boughtByTouch = await (async () => {
        const before = await page.evaluate(() => window.__sim.player.items.length);
        const affordable = await page.$('.moba-shop .moba-item.afford');
        if (!affordable) return { before, after: before, target: false };
        const box = await affordable.boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(100);
        return { before, after: await page.evaluate(() => window.__sim.player.items.length), target: true };
    })();
    check(`${tag}：商店物品用觸控買得到`,
        boughtByTouch.target && boughtByTouch.after === boughtByTouch.before + 1, boughtByTouch);
    await touch('.moba-shop .moba-shop-close');
    await page.waitForTimeout(80);
    check(`${tag}：商店用觸控關得到`,
        await page.$eval('.moba-shop', e => e.classList.contains('hidden')));

    // 真係行手機嗰條 touchstart → touchmove → touchend path。touchscreen.tap 只驗到
    // 按鈕，驗唔到虛擬搖桿拖動同放手；呢段直接派標準 TouchEvent，等 input.js
    // 收到同手機 Safari 相同形狀嘅 changedTouches。
    const joyBefore = await page.evaluate(() => ({
        x: window.__sim.player.x, z: window.__sim.player.z,
    }));
    await page.evaluate(() => {
        const canvas = document.querySelector('#gl');
        const y = Math.min(innerHeight * 0.58, innerHeight - 150);
        const touch = (x) => new Touch({ identifier: 41, target: canvas, clientX: x, clientY: y,
            pageX: x, pageY: y, screenX: x, screenY: y, radiusX: 8, radiusY: 8, force: 1 });
        const start = touch(70);
        canvas.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true,
            touches: [start], targetTouches: [start], changedTouches: [start] }));
        const moved = touch(140);
        canvas.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true,
            touches: [moved], targetTouches: [moved], changedTouches: [moved] }));
    });
    await page.waitForTimeout(650);
    const joyAtRelease = await page.evaluate(() => {
        const canvas = document.querySelector('#gl');
        const y = Math.min(innerHeight * 0.58, innerHeight - 150);
        const end = new Touch({ identifier: 41, target: canvas, clientX: 140, clientY: y,
            pageX: 140, pageY: y, screenX: 140, screenY: y, radiusX: 8, radiusY: 8, force: 0 });
        canvas.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true,
            touches: [], targetTouches: [], changedTouches: [end] }));
        const p = window.__sim.player;
        return { x: p.x, z: p.z, orderX: p.orderX, orderZ: p.orderZ };
    });
    await page.waitForTimeout(160);
    const joyAfter = await page.evaluate(() => {
        const p = window.__sim.player, rig = window.__view.units.get(p.id)?.rig;
        return { x: p.x, z: p.z, moving: p.moving, clip: rig?.current,
            orderX: p.orderX, orderZ: p.orderZ };
    });
    // 「向右拖就向右行」講嘅係畫面嘅右，唔係世界嘅 +x。打直嗰陣鏡頭轉咗軸，
    // 畫面向右變成世界 +z——舊版寫死 x 增加，一轉軸就會捉到呢個分別，
    // 但捉到嘅係測試自己過時，唔係遊戲壞咗。所以量位移喺鏡頭右向量嘅投影。
    const screenRight = await page.evaluate(async ({ before, after }) => {
        const THREE = await import('/games/moba/vendor/three.module.min.js');
        const cam = window.__view.camera;
        const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).setY(0).normalize();
        const move = new THREE.Vector3(after.x - before.x, 0, after.z - before.z);
        const along = move.dot(right);
        const side = Math.hypot(move.x - right.x * along, move.z - right.z * along);
        return { 沿畫面右: +along.toFixed(2), 橫向偏差: +side.toFixed(2), 位移: +move.length().toFixed(2) };
    }, { before: joyBefore, after: joyAtRelease });
    check(`${tag}：手機左搖桿向右拖就向畫面右行`,
        screenRight.沿畫面右 > 0.3 && screenRight.沿畫面右 > screenRight.橫向偏差 * 2, screenRight);
    check(`${tag}：手機左搖桿放手即清移動命令`,
        joyAtRelease.orderX == null && joyAtRelease.orderZ == null, joyAtRelease);
    check(`${tag}：手機左搖桿放手後唔會滑行或原地跑`,
        Math.hypot(joyAfter.x - joyAtRelease.x, joyAfter.z - joyAtRelease.z) < 0.2
            && joyAfter.moving === false && joyAfter.clip !== 'Running_A', joyAfter);

    // 走位：撳實方向鍵，英雄要真係郁。第一版係「撳地面行過去」，
    // 喺手機上面同虛擬搖桿搶同一個輸入，實測揸唔到。
    // D 係「向畫面右」，唔係「向世界 +x」。打直嗰陣鏡頭轉咗軸，兩者唔再一樣。
    const moved = await (async () => {
        const before = await page.evaluate(() => ({ x: window.__sim.player.x, z: window.__sim.player.z }));
        await page.keyboard.down('d');
        await page.waitForTimeout(1400);
        await page.keyboard.up('d');
        return await page.evaluate(async ({ before }) => {
            const THREE = await import('/games/moba/vendor/three.module.min.js');
            const p = window.__sim.player, cam = window.__view.camera;
            const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).setY(0).normalize();
            const move = new THREE.Vector3(p.x - before.x, 0, p.z - before.z);
            return { 沿畫面右: +move.dot(right).toFixed(2), before, after: { x: p.x, z: p.z } };
        }, { before });
    })();
    check(`${tag}：撳方向鍵行得郁，而且係啱嘅方向`, moved.沿畫面右 > 1.5, moved);
    // 之後幾個測試要求玩家離開咗泉水。打直嗰陣 D 係沿住 z 行，出唔到泉水，
    // 所以要明確行返出去，唔可以靠上面嗰下走位順便帶出嚟。
    await page.evaluate(async () => {
        const s = window.__sim, p = s.player;
        // 己方水晶同內塔之間：一定唔算喺泉水，但又唔會行到去兵線度畀人打死
        // ——之後仲有十幾個測試要用返呢個英雄。
        p.x = (p.team === 0 ? -1 : 1) * 48; p.z = 0;
        p.hp = p.maxHp;
        p.orderX = null; p.orderZ = null; p.orderTarget = null;
        await new Promise(r => setTimeout(r, 120));
    });

    // 放手要即停。直接操控每幀會落一個 6 米外嘅短期移動命令；如果放手後
    // 唔清走屬於方向輸入嘅最後一張單，英雄就會自己多行一大截。
    await page.waitForTimeout(100);
    const releasedOrder = await page.evaluate(() => {
        const p = window.__sim.player;
        const rig = window.__view.units.get(p.id)?.rig;
        return { orderX: p.orderX, orderZ: p.orderZ, orderTarget: p.orderTarget,
            moving: p.moving, clip: rig?.current };
    });
    check(`${tag}：放開方向鍵會清走方向輸入嘅移動命令`,
        releasedOrder.orderX == null && releasedOrder.orderZ == null, releasedOrder);
    check(`${tag}：放開方向鍵後會回復企定動畫`,
        releasedOrder.moving === false && releasedOrder.clip !== 'Running_A', releasedOrder);

    // Penny 要求商店係爽快模式：離開泉水仍然可以買，泉水只負責回血／返程。
    // 同時直接驗「返回戰場」同暗位，避免 modal 再成為手機 touch dead end。
    await page.evaluate(() => { window.__sim.player.gold = 10000; });
    await page.waitForTimeout(50);
    await touch('.moba-shopbtn');
    await page.waitForTimeout(80);
    const awayShop = await page.evaluate(() => ({
        state: document.querySelector('.moba-shop-state')?.textContent,
        recallVisible: !document.querySelector('.moba-shop-recall')?.classList.contains('hidden'),
    }));
    check(`${tag}：離開泉水開商店會講明隨時可買`,
        awayShop.state?.includes('隨時可買') && awayShop.recallVisible, awayShop);
    const closeTarget = await page.$eval('.moba-shop-close', e => {
        const r = e.getBoundingClientRect();
        return { width: r.width, height: r.height, top: r.top, right: r.right,
            visible: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
    });
    check(`${tag}：「返回戰場」係至少 44px 而且一直留喺畫面內`,
        closeTarget.height >= 44 && closeTarget.visible, closeTarget);
    const awayPurchase = await (async () => {
        const before = await page.evaluate(() => window.__sim.player.items.length);
        const affordable = await page.$('.moba-shop .moba-item.afford');
        if (!affordable) return { before, after: before, target: false };
        const box = await affordable.boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(80);
        return { before, after: await page.evaluate(() => window.__sim.player.items.length), target: true };
    })();
    check(`${tag}：離開泉水仍然可以用觸控買裝`,
        awayPurchase.target && awayPurchase.after === awayPurchase.before + 1, awayPurchase);

    // 上面用 touchscreen.tap()——零位移，所以瀏覽器一定會合成 click，
    // 舊碼淨係聽 click 都照過。但真手指喺 pan-y 捲動容器入面會飄少少，
    // iOS 就當你想捲動，click 唔會出現，粒掣睇落似壞咗。呢度只發 pointer
    // 事件（唔會有 click），再加六像素飄移，就係度緊實機嗰條路。
    const driftBuy = await page.evaluate(() => {
        const card = document.querySelector('.moba-shop .moba-item.afford');
        if (!card) return { target: false };
        const s = window.__sim, before = s.player.items.length;
        const r = card.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const opts = (px, py) => ({ bubbles: true, cancelable: true, pointerId: 7,
            pointerType: 'touch', isPrimary: true, clientX: px, clientY: py });
        card.dispatchEvent(new PointerEvent('pointerdown', opts(x, y)));
        card.dispatchEvent(new PointerEvent('pointerup', opts(x + 6, y - 4)));
        const style = getComputedStyle(card);
        return { target: true, before, after: s.player.items.length,
            touchAction: style.touchAction, height: r.height };
    });
    check(`${tag}：手指有少少飄移一樣買得到（唔靠合成 click）`,
        driftBuy.target && driftBuy.after === driftBuy.before + 1, driftBuy);
    check(`${tag}：商品卡自己認領觸控手勢，唔會被捲動容器食咗`,
        driftBuy.touchAction === 'manipulation', driftBuy.touchAction);
    check(`${tag}：商品卡至少 44px 高（手指撳得中）`,
        driftBuy.height >= 44, driftBuy.height);

    // 全 HUD 掃一次同一類毛病。連續兩個實機故障（搖桿、商店）都係「只聽
    // click / 目標太細 / 手勢畀捲動容器食咗」，而測試嘅合成點擊零位移，
    // 三種都睇唔見。呢條唔係度個別掣，係度「呢類問題有冇死灰復燃」。
    const reach = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll('#hud button, #hud [role="button"]')) {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.height < 1) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const side = Math.min(r.width, r.height);
            if (side < 44) bad.push({ cls: el.className || el.tagName, side: Math.round(side) });
        }
        return bad;
    });
    check(`${tag}：HUD 每粒掣都至少 44px（手指撳得中）`, reach.length === 0, reach);
    await touch('.moba-shop-close');
    await page.waitForTimeout(80);
    check(`${tag}：戰線上仍可用「返回戰場」關店`,
        await page.$eval('.moba-shop', e => e.classList.contains('hidden')));
    await touch('.moba-shopbtn');
    await page.waitForTimeout(80);
    const backdrop = await page.locator('.moba-shop-backdrop').boundingBox();
    if (backdrop) await page.touchscreen.tap(backdrop.x + 4, backdrop.y + 4);
    await page.waitForTimeout(80);
    check(`${tag}：撳商店暗位亦會返回戰場`, backdrop
        && await page.$eval('.moba-shop', e => e.classList.contains('hidden')), backdrop);
    await touch('.moba-shopbtn');
    await page.waitForTimeout(80);
    await touch('.moba-shop-recall');
    await page.waitForTimeout(80);
    const recallFromShop = await page.evaluate(() => ({
        shopClosed: document.querySelector('.moba-shop')?.classList.contains('hidden'),
        progress: window.__sim.recallProgress(window.__sim.player),
    }));
    check(`${tag}：商店「返程回血」會關店兼開始返程`,
        recallFromShop.shopClosed && recallFromShop.progress > 0, recallFromShop);

    // 攻擊命令可以喺放手同下一幀之間取代走位命令；停止走位時唔可以連新嘅
    // 攻擊單一齊取消。喺同一個 browser task 入面落攻擊單再派 keyup，固定時序。
    await page.keyboard.down('d');
    await page.waitForTimeout(100);
    const attackOrder = await page.evaluate(() => {
        const s = window.__sim, p = s.player;
        const foe = s.champions.find(c => c.alive && c.team !== p.team);
        if (!foe) return { expected: null, actual: p.orderTarget };
        s.orderAttack(p, foe.id);
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', bubbles: true }));
        return { expected: foe.id, actual: p.orderTarget };
    });
    await page.waitForTimeout(100);
    attackOrder.actual = await page.evaluate(() => window.__sim.player.orderTarget);
    check(`${tag}：放開方向鍵唔會取消已接手嘅攻擊命令`,
        attackOrder.expected != null && attackOrder.actual === attackOrder.expected, attackOrder);

    // 技能要有回饋：撳落去之後，畫面要報返個技能名。
    // 呢個亦都係「事件流有冇斷」嘅端對端證明——之前 cast 事件喺 step()
    // 開頭就被抹走，所以撳完技能畫面上乜都冇。
    await page.evaluate(() => {
        const p = window.__sim.player;
        p.level = 6; p.mp = p.maxMp; p.abilityCd = [0, 0, 0, 0];
    });
    await page.waitForTimeout(120);
    await page.keyboard.press('q');
    await page.waitForTimeout(220);
    const castText = await page.$eval('.moba-cast', e => e.textContent);
    check(`${tag}：出技能會報返個技能名`, !!castText && castText.trim().length > 1, castText);

    // 每粒技能掣都要寫住自己個名，唔可以淨係得一個字母
    const labels = await page.$$eval('.moba-skill .nm', ns => ns.map(n => n.textContent.trim()));
    check(`${tag}：四粒技能掣都有名`, labels.length === 4 && labels.every(l => l.length >= 2), labels);

    // 設定要開得到而且改得郁：一個網頁遊戲冇靜音掣係硬傷
    await page.click('.moba-gear');
    await page.waitForTimeout(150);
    check(`${tag}：設定面板開得到`, await page.$eval('.moba-settings', e => !e.classList.contains('hidden')));
    const toggles = await page.$$('.moba-settings .moba-toggle');
    check(`${tag}：有音效同音樂開關`, toggles.length === 2, toggles.length);
    const before = await page.$eval('.moba-settings .moba-toggle', e => e.textContent);
    await toggles[0].click();
    const after = await page.$eval('.moba-settings .moba-toggle', e => e.textContent);
    check(`${tag}：撳落去真係切換到`, before !== after, { before, after });
    await toggles[0].click();
    // 畫質三檔要揀得到，而且真係改到 view
    const segs = await page.$$('.moba-settings .moba-seg button');
    check(`${tag}：畫質有三檔`, segs.length === 3, segs.length);
    await segs[0].click();
    await page.waitForTimeout(150);
    check(`${tag}：揀畫質改到 view`, await page.evaluate(() => window.__view.quality) === 'low');
    check(`${tag}：設定寫入 localStorage`,
        await page.evaluate(() => JSON.parse(localStorage.getItem('moba-settings') || '{}').quality) === 'low');
    await page.click('.moba-settings .moba-x');

    // 頭像：選人卡同 HUD 都要有真圖，唔係空框
    check(`${tag}：HUD 頭像有圖`,
        await page.$eval('.moba-portrait', e => /^url\(["']?data:image/.test(e.style.backgroundImage || '')));

    // 打擊要睇得到：普攻要出動作 + 軌跡／揮擊弧，彈道要有方向。
    // Penny 報過「攻擊完全見唔到個動作、法術見唔到軌跡」——所以呢幾樣
    // 唔可以只靠肉眼，要有 gate 釘住。
    const combat = await page.evaluate(async () => {
        const s = window.__sim, v = window.__view;
        const p = s.player;
        p.x = -6; p.z = 0; p.level = 7; p.mp = p.maxMp; p.abilityCd = [0, 0, 0, 0];
        for (let i = 0; i < 30 * 25; i++) s.step(1 / 30);
        const foe = s.entities.find(e => e.alive && e.team !== p.team && e.kind === 'minion');
        if (!foe) return null;
        foe.x = p.x + 1.6; foe.z = p.z;
        const u = v.units.get(p.id);
        // 唔可以用 items.length 嘅淨變化：個池同一時間有舊特效到期消散，
        // 散得多過新加入，個差就會變成 0，而普攻其實有畫嘢。實測就係咁
        // 間歇性肥佬。改為記住原本嗰批物件身份，之後數真係新加入嘅。
        const had = new Set(v.fx.items);
        p.cd = 0;
        s.orderAttack(p, foe.id);
        s.step(1 / 30);
        v.update(1 / 60, s.drain());
        const added = v.fx.items.filter(it => !had.has(it)).length;
        // 彈道：唔可以假設玩家第一個技能就係直線彈——鐵衛個 Q 係範圍技。
        // 有 skillshot 就用佢，冇就靠兵線上面梗有嘅遠程兵箭矢。
        p.abilityCd = [0, 0, 0, 0]; p.mp = p.maxMp;
        const shotIdx = p.def.abilities.findIndex(a => a.form === 'skillshot');
        if (shotIdx >= 0) s.cast(p, shotIdx, { x: p.x + 12, z: p.z });
        // 跑到有彈道喺天上飛嗰一格為止（箭同技能彈都算）
        let proj = [];
        for (let i = 0; i < 40; i++) {
            s.step(1 / 30);
            v.update(1 / 60, s.drain());
            proj = [...v.projectiles.values()];
            if (proj.length && s.projectiles.length === proj.length) break;
        }
        return {
            fxOnAttack: added,
            simProj: s.projectiles.length,
            viewProj: proj.length,
            // 彈道唔可以永遠豎直：冇轉向嘅膠囊喺俯視鏡頭下面等於隱形
            oriented: proj.every(o => Math.abs(o.quaternion.x) + Math.abs(o.quaternion.z) > 1e-3),
            animating: u.rig.busy,
        };
    });
    check(`${tag}：普攻會出視覺回饋（揮擊弧／出手閃）`, combat && combat.fxOnAttack > 0, combat);
    check(`${tag}：技能彈道畫得出`, combat && combat.viewProj > 0 && combat.viewProj === combat.simProj, combat);
    check(`${tag}：彈道有跟住飛行方向轉`, combat && combat.oriented, combat);

    // 唔可以再用「有一個圈」當完成。六隻英雄要有六套普攻剪影，24 招要逐招
    // 產生自己嘅 scene geometry；projectile 亦要分箭、火、聖光，而唔係換色膠囊。
    const fxLanguage = await page.evaluate(() => {
        const s = window.__sim, v = window.__view;
        const geometrySignature = (items) => {
            const parts = [], geometry = [], colours = [];
            for (const it of items) it.obj.traverse((o) => {
                if (o.geometry) geometry.push(o.geometry.type);
                if (o.userData?.fxPart) parts.push(o.userData.fxPart);
                const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
                for (const m of mats) if (m.color) colours.push(m.color.getHexString());
            });
            return [geometry.sort().join(','), parts.sort().join(','), colours.sort().join(',')].join('|');
        };

        v.fx.update(120);
        const sceneBase = v.scene.children.length;
        const attacks = [];
        for (const c of s.champions) {
            const target = s.champions.find(t => t.team !== c.team);
            v.update(1 / 60, [
                { type: 'attack', id: c.id, target: target.id },
                { type: 'hit', id: c.id, target: target.id },
            ]);
            const items = v.fx.items.filter(it => it.style?.startsWith(`${c.champId}-`));
            attacks.push({ champion: c.champId, styles: [...new Set(items.map(it => it.style))],
                signature: geometrySignature(items), count: items.length });
            v.fx.update(3);
        }

        const abilities = [];
        for (const c of s.champions) {
            c.level = 12; c.mp = c.maxMp; c.abilityCd = [0, 0, 0, 0];
            for (let index = 0; index < c.def.abilities.length; index++) {
                const ab = c.def.abilities[index];
                v.update(1 / 60, [{ type: 'cast', id: c.id, index, key: ab.key,
                    championId: c.champId, x: c.x + 2, z: c.z }]);
                const items = v.fx.items.filter(it => it.style?.startsWith(`${c.champId}-`));
                abilities.push({ champion: c.champId, key: ab.key,
                    styles: [...new Set(items.map(it => it.style))],
                    families: [...new Set(items.map(it => it.family))],
                    signature: geometrySignature(items), count: items.length });
                v.fx.update(12);
            }
        }

        const savedProjectiles = s.projectiles;
        const projectileLooks = [];
        for (const [champion, index] of [['longshot', 0], ['emberwake', 0], ['dawnkeeper', 0]]) {
            const c = s.champions.find(x => x.champId === champion);
            const ab = c.def.abilities[index];
            s.projectiles = [{ __vid: `visual-${champion}`, kind: c.def.projectile,
                skill: true, sourceId: c.id, abilityIndex: index, abilityKey: ab.key,
                championId: c.champId, x: c.x, z: c.z, vx: 1, vz: 0 }];
            v.update(1 / 60, []);
            const obj = [...v.projectiles.values()].find(o => o.userData.fxStyle?.startsWith(champion));
            const parts = [];
            obj?.traverse(o => { if (o.geometry) parts.push(o.geometry.type); });
            projectileLooks.push({ champion, shape: obj?.userData.projectileShape,
                style: obj?.userData.fxStyle, signature: parts.sort().join(',') });
            s.projectiles = [];
            v.update(1 / 60, []);
        }
        s.projectiles = savedProjectiles;
        v.update(1 / 60, []);
        v.fx.update(120);

        return {
            attacks,
            attackStyles: new Set(attacks.flatMap(a => a.styles)).size,
            attackSignatures: new Set(attacks.map(a => a.signature)).size,
            abilities,
            abilityStyles: new Set(abilities.flatMap(a => a.styles)).size,
            abilitySignatures: new Set(abilities.map(a => a.signature)).size,
            projectileLooks,
            projectileShapes: new Set(projectileLooks.map(p => p.shape)).size,
            projectileSignatures: new Set(projectileLooks.map(p => p.signature)).size,
            cleanup: { items: v.fx.items.length, sceneBase, sceneAfter: v.scene.children.length },
        };
    });
    check(`${tag}：六隻英雄普攻有六套實際幾何剪影`,
        fxLanguage.attacks.length === 6 && fxLanguage.attacks.every(a => a.count >= 2)
            && fxLanguage.attackStyles === 6 && fxLanguage.attackSignatures === 6,
        { styles: fxLanguage.attackStyles, signatures: fxLanguage.attackSignatures,
            attacks: fxLanguage.attacks });
    check(`${tag}：24 招技能逐招有身份，而且至少 20 套幾何剪影`,
        fxLanguage.abilities.length === 24 && fxLanguage.abilities.every(a => a.count > 0)
            && fxLanguage.abilityStyles === 24 && fxLanguage.abilitySignatures >= 20,
        { styles: fxLanguage.abilityStyles, signatures: fxLanguage.abilitySignatures,
            missing: fxLanguage.abilities.filter(a => !a.count) });
    check(`${tag}：箭、火、聖光係三款唔同彈道模型`,
        fxLanguage.projectileLooks.every(p => p.shape && p.style)
            && fxLanguage.projectileShapes === 3 && fxLanguage.projectileSignatures === 3,
        fxLanguage.projectileLooks);
    check(`${tag}：大量戰鬥特效播完會清走，唔會留喺場景`,
        fxLanguage.cleanup.items === 0
            && fxLanguage.cleanup.sceneAfter === fxLanguage.cleanup.sceneBase,
        fxLanguage.cleanup);

    // 護盾類（跟身）嘅徽記要即刻脹到應有大細。之前縮放係喺成個 life 上面線性
    // 拉勻，而護盾 life 有兩秒半——結果全程都得六成大，脹夠嗰刻已經淡出，
    // 影相放大先睇得出係一舊乜。呢條就係度「一開始就睇得到」。
    const buff = await page.evaluate(() => {
        const v = window.__view, s = window.__sim;
        const c = s.champions.find(x => x.champId === 'ironward');
        const idx = c.def.abilities.findIndex(a => a.form === 'self');
        c.level = 12; c.mp = c.maxMp; c.abilityCd = [0, 0, 0, 0];
        v.fx.items.length = 0;
        v.update(1 / 60, [{ type: 'cast', id: c.id, index: idx, key: c.def.abilities[idx].key,
            championId: c.champId, x: c.x, z: c.z }]);
        const it = v.fx.items.find(i => i.kind === 'ability-cast');
        if (!it) return { found: false };
        v.fx.update(0.25);                       // 兩秒半嘅增益，先行四分之一秒
        const early = it.obj.scale.x;
        v.fx.update(1.0);
        const mid = it.obj.scale.x;
        const wire = [];
        it.obj.traverse(o => { if (o.material?.wireframe) wire.push(o.userData.fxPart ?? '?'); });
        return { found: true, early, mid, wire };
    });
    check(`${tag}：跟身增益一開波就脹到位（唔係捱到最後先夠大）`,
        buff.found && buff.early > 0.9, buff);
    check(`${tag}：施法徽記唔用 wireframe（遠鏡頭下會變一堆亂線）`,
        buff.found && buff.wire.length === 0, buff.wire);

    // 血條要用血量色，唔可以用隊伍色——用隊伍色嘅話滿血同殘血一個樣
    const bars = await page.evaluate(() => {
        const v = window.__view, s = window.__sim;
        const champs = [...v.units.values()].filter(u => u.entity.kind === 'champ' && u.entity.alive);
        const u = champs[0];
        const read = (pct) => {
            u.entity.hp = s.stats(u.entity).maxHp * pct;
            v.update(1 / 60, []);
            return u.bar.userData.fill.material.color.getHex();
        };
        const full = read(1), low = read(0.1);
        return { full, low, differs: full !== low, width: u.bar.userData.width };
    });
    check(`${tag}：血條顏色跟血量變（唔係隊伍色）`, bars.differs, bars);
    check(`${tag}：血條窄過角色（唔會疊成一堆）`, bars.width <= 2.4, bars.width);

    // 上面兩條驗嘅係 material 嘅顏色，但畫面上成條血條係純黑嘅——因為
    // three.js 分兩次繪製（先不透明、後透明），renderOrder 只喺同一次入面
    // 排序。黑底係透明、血量係不透明，所以黑底永遠喺血量之後先畫，
    // 加埋 depthTest: false 就完全冚死。呢兩條就係補返嗰個空隙。
    const layer = await page.evaluate(() => {
        const v = window.__view;
        const u = [...v.units.values()].find(x => x.entity.kind === 'champ');
        const parts = u.bar.children.map(m => ({ t: !!m.material.transparent, o: m.renderOrder }));
        const { fill } = u.bar.userData;
        const back = u.bar.children[0];
        return {
            parts,
            sameList: parts.every(p => p.t === parts[0].t),
            fillOver: fill.renderOrder > back.renderOrder,
        };
    });
    check(`${tag}：血條四件喺同一個繪製批次（renderOrder 先至話事）`, layer.sameList, layer.parts);
    check(`${tag}：血量畫喺黑底之上`, layer.fillOver, layer.parts);

    // 取景：打直嗰陣鏡頭轉咗軸，條線行返垂直。呢度釘住嘅係「畫面用嚟做咩」，
    // 唔係今日嗰組鏡頭數值——舊版打直只有 16.4% 畫面係踏得到嘅橋面，其餘
    // 全部係深淵同水。同時要確認搖桿仲係跟住畫面：鏡頭一轉軸，推上就唔再
    // 係 +z 而係 +x，唔跟住轉就會推上但角色橫行。
    const framing = await page.evaluate(async () => {
        const v = window.__view, s = window.__sim;
        const THREE = await import('/games/moba/vendor/three.module.min.js');
        const { MAP: M } = await import('/games/moba/src/constants.js');
        const cam = v.camera;
        const ray = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const hit = new THREE.Vector3();
        const N = 32;
        let ground = 0;
        for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) {
            ray.setFromCamera(new THREE.Vector2(((ix + 0.5) / N) * 2 - 1, -(((iy + 0.5) / N) * 2 - 1)), cam);
            if (!ray.ray.intersectPlane(plane, hit)) continue;
            if (Math.abs(hit.z) <= M.halfWidth && Math.abs(hit.x) <= M.fountainX) ground++;
        }
        // 兵線睇到幾長：打直掃中央一列，打橫掃中央一行
        const vertical = Math.abs(v.camYaw ?? 0) > 0.1;
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < 120; i++) {
            const t = ((i + 0.5) / 120) * 2 - 1;
            ray.setFromCamera(vertical ? new THREE.Vector2(0, t) : new THREE.Vector2(t, 0), cam);
            if (ray.ray.intersectPlane(plane, hit)) { lo = Math.min(lo, hit.x); hi = Math.max(hi, hit.x); }
        }
        const p = s.player;
        const proj = new THREE.Vector3(p.x, 1.2, p.z).project(cam);
        return {
            橋面: +(ground / (N * N) * 100).toFixed(1),
            兵線長度: +(hi - lo).toFixed(1),
            玩家由頂計: +((1 - (proj.y + 1) / 2) * 100).toFixed(1),
            垂直: vertical,
        };
    });
    // 推上一定要係「向敵方基地行」。呢個係轉軸最容易整爛嘅嘢，而且係玩家
    // 第一秒就會發現嘅嘢，所以要行真嗰條 touch path，唔可以喺測試度抄一次
    // 換算公式——抄一次就等於自己驗自己。
    const pushUp = await page.evaluate(async () => {
        const s = window.__sim, p = s.player;
        // 要企喺空曠地方先量得準。之前擺喺中線 (0,0)，兵線就喺隔籬，單位互相
        // 推撞令角色橫移咗 2.29 米——量到嘅唔再係「搖桿指去邊」，而係「撞緊
        // 幾多隻兵」。搬返自己半場，隔開兵線。
        p.x = (p.team === 0 ? -1 : 1) * 40; p.z = 0; p.alive = true;
        p.orderX = null; p.orderZ = null; p.orderTarget = null;
        const start = { x: p.x, z: p.z };
        const canvas = document.querySelector('#gl');
        const cx = 70, cy = Math.min(innerHeight * 0.58, innerHeight - 150);
        const touch = (x, y) => new Touch({ identifier: 77, target: canvas, clientX: x, clientY: y,
            pageX: x, pageY: y, screenX: x, screenY: y, radiusX: 8, radiusY: 8, force: 1 });
        const a = touch(cx, cy);
        canvas.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true,
            touches: [a], targetTouches: [a], changedTouches: [a] }));
        const b = touch(cx, cy - 70);
        canvas.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true,
            touches: [b], targetTouches: [b], changedTouches: [b] }));
        await new Promise(r => setTimeout(r, 700));
        // 位移，唔係位置。之前起點啱啱好係 (0,0)，兩者數值一樣，所以一搬動
        // 起點就即刻讀成「行咗四十米」。
        const moved = { x: p.x - start.x, z: p.z - start.z };
        canvas.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true,
            touches: [], targetTouches: [], changedTouches: [b] }));
        const toEnemy = p.team === 0 ? 1 : -1;
        const THREE = await import('/games/moba/vendor/three.module.min.js');
        const cam = window.__view.camera;
        // 畫面「上」喺地面嘅方向：鏡頭前向壓平落地面
        const up = new THREE.Vector3();
        cam.getWorldDirection(up); up.setY(0).normalize();
        const move = new THREE.Vector3(moved.x, 0, moved.z);
        const along = move.dot(up);
        // 度嘅係方向，唔係距離。半秒入面行到幾遠要睇主執行緒幾忙——實測同一
        // 段碼由 3 米跌到 1.1 米都試過。用距離做門檻就係喺度度緊機器忙唔忙。
        const side = Math.hypot(move.x - up.x * along, move.z - up.z * along);
        return { 走咗: [+moved.x.toFixed(2), +moved.z.toFixed(2)],
            沿畫面上: +along.toFixed(2), 橫向偏差: +side.toFixed(2),
            向敵方: +(moved.x * toEnemy).toFixed(2) };
    });
    check(`${tag}：搖桿推上就係向畫面上行`,
        pushUp.沿畫面上 > 0.3 && pushUp.沿畫面上 > pushUp.橫向偏差 * 2, pushUp);
    // 打直先有嘅承諾：條線行返垂直，所以推上等於推向敵方基地。
    if (framing.垂直) check(`${tag}：推上即係推向敵方基地`, pushUp.向敵方 > 0.3, pushUp);

    // 打橫係「一望睇晒成條線」嘅遠景，橋面自然只佔一條橫帶；打直轉咗軸之後
    // 就冇理由再浪費畫面。所以兩個方向嘅門檻唔同，唔係一條數夾兩邊。
    check(`${tag}：畫面冇浪費喺深淵同水上面`,
        framing.橋面 >= (framing.垂直 ? 50 : 15), framing);

    // 兵線總覽要同戰場讀同一個方向。打直轉軸之後，一條打橫嘅總覽等於叫玩家
    // 喺腦入面轉九十度。呢度唔係比較鏡頭參數，而係：戰場上兩座水晶投影落
    // 螢幕係邊個方向，條總覽就要係嗰個方向，而且藍方嗰邊要喺同一頭。
    const laneAgrees = await page.evaluate(async () => {
        const THREE = await import('/games/moba/vendor/three.module.min.js');
        const { MAP, TEAM } = await import('/games/moba/src/constants.js');
        const v = window.__view;
        const cam = v.camera;
        const at = (x) => new THREE.Vector3(x, 1, 0).project(cam);
        const blue = at(-MAP.nexusX), red = at(MAP.nexusX);
        // 螢幕座標：y 向上為正，所以「紅方喺上面」＝ red.y > blue.y
        const dx = red.x - blue.x, dy = red.y - blue.y;
        const 戰場垂直 = Math.abs(dy) > Math.abs(dx);
        const box = document.querySelector('.moba-lane').getBoundingClientRect();
        const 總覽垂直 = box.height > box.width;
        // 畫布上藍紅各自嘅重心：直接讀像素，唔靠測試自己抄一次座標換算
        const cv = document.querySelector('.moba-lane canvas');
        const g = cv.getContext('2d');
        const d = g.getImageData(0, 0, cv.width, cv.height).data;
        let bSum = 0, bN = 0, rSum = 0, rN = 0;
        for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
            const i = (y * cv.width + x) * 4;
            if (d[i + 3] < 40) continue;
            const along = 總覽垂直 ? y : x;
            if (d[i + 2] > d[i] + 40) { bSum += along; bN++; }
            else if (d[i] > d[i + 2] + 40) { rSum += along; rN++; }
        }
        if (!bN || !rN) return { 讀唔到顏色: true, bN, rN };
        // 畫布 y 向下，螢幕 y 向上，所以垂直嗰陣要反號先可以同 dy 比較
        const 藍在前 = 總覽垂直 ? -(bSum / bN - rSum / rN) : (bSum / bN - rSum / rN);
        const 戰場藍在前 = 總覽垂直 ? (blue.y - red.y) : (blue.x - red.x);
        return {
            戰場垂直, 總覽垂直,
            方向一致: 戰場垂直 === 總覽垂直,
            兩頭啱: Math.sign(藍在前) === Math.sign(戰場藍在前),
        };
    });
    check(`${tag}：兵線總覽同戰場讀同一個方向`, laneAgrees.方向一致, laneAgrees);
    check(`${tag}：總覽入面藍方嗰頭同畫面上藍方嗰頭一致`, laneAgrees.兩頭啱, laneAgrees);
    check(`${tag}：一屏睇得到至少 30 米兵線`, framing.兵線長度 >= 30, framing);
    check(`${tag}：玩家企喺畫面下半但唔會跌出畫外`,
        framing.玩家由頂計 > 45 && framing.玩家由頂計 < 88, framing);

    // Draw call 預算。ADR-105 量過一個人為最壞情況（六個英雄企埋一齊不停放
    // 技能）係 1311，而嗰個數字之後一直做緊「手機卡就要先做呢樣」嘅理由。
    // 但真係打緊嗰場波量出嚟：打直中位 42、尖峰 286；打橫中位 162、尖峰 342。
    // 所以呢度唔係度「有冇做優化」，而係守住一個預算——將來加特效加到穿咗，
    // 要係一個會響嘅決定，唔係靜靜哋滑落去。
    const budget = await page.evaluate(async () => {
        const s = window.__sim, v = window.__view;
        const { createBot, updateBots } = await import('/games/moba/src/ai.js');
        const bots = s.champions.filter(c => !c.isPlayer).map(c => createBot(s, c));
        let peak = 0, peakAt = null, tick = 0;
        const calls = [];
        for (let i = 0; i < 30 * 60 * 2; i++) {
            updateBots(bots, 1 / 30, tick++);
            s.step(1 / 30);
            if (i % 30 === 0) {
                v.update(1, s.drain());
                v.renderer.info.reset();
                v.renderer.render(v.scene, v.camera);
                const c = v.renderer.info.render.calls;
                calls.push(c);
                if (c > peak) { peak = c; peakAt = { t: Math.round(s.time), fx: v.fx.items.length }; }
            }
            if (s.over) break;
        }
        calls.sort((a, b) => a - b);
        return { 中位: calls[calls.length >> 1], 尖峰: peak, 尖峰嗰刻: peakAt, 取樣: calls.length };
    });
    check(`${tag}：一場波入面 draw call 守得住預算（<600）`, budget.尖峰 > 0 && budget.尖峰 < 600, budget);

    // 快進成場波：一定要有結果，唔可以卡死或者拋錯
    const outcome = await page.evaluate(() => {
        const s = window.__sim;
        let guard = 0;
        while (!s.over && guard++ < 30 * 60 * 26) s.step(1 / 30);
        return s.over ? { winner: s.over.winner, mins: +(s.time / 60).toFixed(1), byTime: !!s.over.byTime } : null;
    });
    check(`${tag}：一整場跑得完並分到勝負`, outcome && outcome.winner != null, outcome);
    await page.waitForTimeout(600);

    // 戰後計分板：兩隊六個人齊晒
    const sheet = await page.evaluate(() => {
        const box = document.querySelector('#result');
        return { shown: !box.classList.contains('hidden'),
            rows: box.querySelectorAll('.srow').length,
            teams: box.querySelectorAll('.steam').length };
    });
    check(`${tag}：戰後計分板列晒六個人`, sheet.shown && sheet.rows === 6 && sheet.teams === 2, sheet);

    check(`${tag}：主控台零錯誤`, errs.length === 0, errs.slice(0, 4));
    await page.close();
}

// ---------- 最細嘅真手機：淨係度排版 ----------
// 上面兩個 viewport 跑足全套（打完成場波、特效、商店）。呢度唔使再跑一次
// —— 320×568 同 568×320 揾到嘅兩個毛病都係純排版：面板衝出畫面左邊、面板
// 壓住技能掣、總覽被計分板蓋住。所以呢一段只開場、只量幾何，成本係全套嘅
// 零頭，但補返「最細嘅機」呢條從來冇人行過嘅路。
const LAYOUT_SIZES = [
    ['SE 打直', { width: 320, height: 568 }],
    ['SE 打橫', { width: 568, height: 320 }],
    // 860 闊：78vw 嘅兵線總覽啱啱撞到右上角計分板。1280 同 430 都撞唔到，
    // 所以中間呢段闊度要自己有代表。
    ['中闊打橫', { width: 860, height: 430 }],
];
for (const [tag, viewport] of LAYOUT_SIZES) {
    const page = await browser.newPage({ viewport, hasTouch: true, isMobile: true });
    const errs = watch(page);
    await page.goto(URL_BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mobaReady || !!document.querySelector('.pick-card'),
        null, { timeout: 120000 });
    await page.click('#pick-go');
    await page.waitForFunction(() => !!window.__view, null, { timeout: 120000 });
    // 開場嗰刻唔係一個有代表性嘅畫面：英雄喺泉水，所以返程掣係收埋嘅；
    // 又冇錢，所以商店掣仲係短版「商店」。實測就係咁走漏咗一個成場都存在
    // 嘅重疊——返程掣同商店掣疊咗 12px，而嗰條帶撳落去係去咗商店。
    // 所以要擺返一個真實狀態：離開泉水、袋住錢。
    await page.evaluate(() => {
        const p = window.__sim.player;
        p.x = 0; p.z = 0; p.hp = p.maxHp; p.gold = 3000;
    });
    await page.waitForTimeout(900);

    const layout = await page.evaluate(() => {
        const visible = (el) => {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return r.width > 2 && r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden';
        };
        // 商店同遮罩唔計：佢哋本身就係要蓋住成個畫面
        const panels = [...document.querySelectorAll('#hud > *')].filter(el => visible(el)
            && !el.classList.contains('moba-shop') && !el.classList.contains('moba-shop-backdrop'));
        const box = (el) => { const r = el.getBoundingClientRect(); return { cls: el.className, x: r.x, y: r.y, w: r.width, h: r.height }; };
        const boxes = panels.map(box);
        const overlap = [];
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            if (ox > 4 && oy > 4) overlap.push(`${a.cls} × ${b.cls} (${Math.round(ox)}×${Math.round(oy)})`);
        }
        const outside = boxes.filter(b => b.x < -1 || b.y < -1
            || b.x + b.w > innerWidth + 1 || b.y + b.h > innerHeight + 1)
            .map(b => `${b.cls} → ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)}`);
        const small = [...document.querySelectorAll('#hud button')].filter(visible)
            .map(el => { const r = el.getBoundingClientRect(); return { cls: el.className, side: Math.min(r.width, r.height) }; })
            .filter(x => x.side < 44)
            .map(x => `${x.cls}: ${Math.round(x.side)}px`);
        return { overlap, outside, small };
    });
    check(`${tag}：HUD 冇互相遮住`, layout.overlap.length === 0, layout.overlap);
    check(`${tag}：HUD 冇衝出畫面`, layout.outside.length === 0, layout.outside);
    check(`${tag}：每粒掣都至少 44px`, layout.small.length === 0, layout.small);
    check(`${tag}：主控台零錯誤`, errs.length === 0, errs.slice(0, 3));
    await page.close();
}

// ---------- 音效：唔准未有手勢就開，但有咗之後要撐得住暫停 ----------
// iOS 要一個真手勢先開得到 AudioContext，而背景返嚟之後個 context 會變
// suspended。而家「播聲之前先 #ensure()」順手救返，但嗰個係副作用，唔係
// 明寫嘅承諾——重構嗰陣好易冇咗，而冇咗嘅表現係「隻遊戲靜咗」，冇任何
// 錯誤訊息。所以要釘住。
{
    const page = await browser.newPage({ viewport: { width: 430, height: 860 }, hasTouch: true, isMobile: true });
    const errs = watch(page);
    await page.goto(URL_BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mobaReady || !!document.querySelector('.pick-card'),
        null, { timeout: 120000 });
    // 喺任何手勢之前接住 AudioContext 嘅建立
    await page.evaluate(() => {
        window.__acs = [];
        const Orig = window.AudioContext || window.webkitAudioContext;
        const Patched = function (...a) { const c = new Orig(...a); window.__acs.push(c); return c; };
        Patched.prototype = Orig.prototype;
        window.AudioContext = Patched;
    });
    const before = await page.evaluate(() => window.__acs.length);
    check('未有手勢之前唔會開 AudioContext（唔違反 autoplay）', before === 0, { 開咗: before });

    await page.locator('.pick-card').first().click();
    await page.click('#pick-go');
    await page.waitForFunction(() => !!window.__view, null, { timeout: 120000 });
    await page.waitForTimeout(1200);
    const running = await page.evaluate(() => window.__acs.map(c => c.state));
    check('手勢之後 AudioContext 行得起', running.includes('running'), running);

    // 擺定一個打得到嘅目標，之後放手畀真 rAF 迴圈行——唔可以自己 drain
    // 事件，噉樣即係搶走咗真迴圈要用嗰批。
    const placed = await page.evaluate(() => {
        const s = window.__sim, p = s.player;
        for (let i = 0; i < 30 * 40; i++) s.step(1 / 30);
        const foe = s.entities.find(e => e.alive && e.team !== p.team && e.kind === 'minion');
        if (foe) { p.x = foe.x - 1.4; p.z = foe.z; p.cd = 0; s.orderAttack(p, foe.id); }
        return !!foe;
    });
    const suspended = await page.evaluate(async () => {
        await window.__acs[0].suspend();
        return window.__acs[0].state;
    });
    await page.waitForTimeout(3000);
    const after = await page.evaluate(() => window.__acs[0].state);
    check('被暫停之後，打返幾下就自己回復（唔會靜一世）',
        placed && suspended === 'suspended' && after === 'running',
        { 有目標: placed, 暫停後: suspended, 打完之後: after });
    check('音效呢一段主控台零錯誤', errs.length === 0, errs.slice(0, 3));
    await page.close();
}

// ---------- 掉咗 GPU context 唔應該報銷成場波 ----------
// 手機鎖屏、切走一陣、記憶體壓力，瀏覽器都會收返個 WebGL context，跟住又
// 還返畀你。之前收到 lost 就停晒同叫玩家重新開一局——但 restored 幾百毫秒
// 之後就到，即係一場打到一半嘅波因為鎖咗一下屏就白白冇咗。
{
    const page = await browser.newPage({ viewport: { width: 430, height: 860 }, hasTouch: true, isMobile: true });
    const errs = watch(page);
    await page.goto(URL_BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__mobaReady || !!document.querySelector('.pick-card'),
        null, { timeout: 120000 });
    await page.click('#pick-go');
    await page.waitForFunction(() => !!window.__view, null, { timeout: 120000 });
    await page.waitForTimeout(1000);

    const out = await page.evaluate(async () => {
        const gl = document.querySelector('#gl').getContext('webgl2')
            ?? document.querySelector('#gl').getContext('webgl');
        const ext = gl && gl.getExtension('WEBGL_lose_context');
        if (!ext) return { skipped: true };
        ext.loseContext();
        await new Promise(r => setTimeout(r, 400));
        const paused = !!window.__view.contextLost;
        ext.restoreContext();
        await new Promise(r => setTimeout(r, 1200));
        const before = window.__sim.time;
        window.__view.renderer.info.reset();
        await new Promise(r => setTimeout(r, 1200));
        return {
            skipped: false, paused,
            旗標清返: !window.__view.contextLost,
            場波行返: window.__sim.time > before + 0.2,
            畫返嘢: window.__view.renderer.info.render.calls > 0,
            由: +before.toFixed(1), 到: +window.__sim.time.toFixed(1),
        };
    });
    if (out.skipped) {
        check('掉 context：呢個瀏覽器唔支援 WEBGL_lose_context，跳過', true);
    } else {
        check('掉 context 嗰陣會停低', out.paused, out);
        check('context 返嚟就繼續打，唔使重新開局', out.旗標清返 && out.場波行返, out);
        check('context 返嚟之後真係畫緊嘢（唔係凍住一格）', out.畫返嘢, out);
        check('掉完 context 主控台仍然零錯誤', errs.length === 0, errs.slice(0, 3));
    }
    await page.close();
}

await browser.close();
server.close();

console.log(`\nmoba browser: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目: ' + failed.join('、')); process.exit(1); }
