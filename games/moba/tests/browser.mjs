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
    check(`${tag}：手機左搖桿拖動真係會行`, joyAtRelease.x - joyBefore.x > 2,
        { before: joyBefore, release: joyAtRelease });
    check(`${tag}：手機左搖桿放手即清移動命令`,
        joyAtRelease.orderX == null && joyAtRelease.orderZ == null, joyAtRelease);
    check(`${tag}：手機左搖桿放手後唔會滑行或原地跑`,
        Math.hypot(joyAfter.x - joyAtRelease.x, joyAfter.z - joyAtRelease.z) < 0.2
            && joyAfter.moving === false && joyAfter.clip !== 'Running_A', joyAfter);

    // 走位：撳實方向鍵，英雄要真係郁。第一版係「撳地面行過去」，
    // 喺手機上面同虛擬搖桿搶同一個輸入，實測揸唔到。
    const moved = await (async () => {
        const before = await page.evaluate(() => ({ x: window.__sim.player.x, z: window.__sim.player.z }));
        await page.keyboard.down('d');
        await page.waitForTimeout(1400);
        await page.keyboard.up('d');
        const after = await page.evaluate(() => ({ x: window.__sim.player.x, z: window.__sim.player.z }));
        return { d: after.x - before.x, before, after };
    })();
    check(`${tag}：撳方向鍵行得郁，而且係啱嘅方向`, moved.d > 1.5, moved);

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

    // Penny 截圖嗰個情境係已經離開泉水：買唔到本身係遊戲規則，但之前提示
    // 藏喺 modal 後面，亦冇直接出路，望落就似商店卡死。
    await touch('.moba-shopbtn');
    await page.waitForTimeout(80);
    const awayShop = await page.evaluate(() => ({
        state: document.querySelector('.moba-shop-state')?.textContent,
        recallVisible: !document.querySelector('.moba-shop-recall')?.classList.contains('hidden'),
    }));
    check(`${tag}：離開泉水開商店會清楚講明未能購買`,
        awayShop.state?.includes('未在泉水') && awayShop.recallVisible, awayShop);
    await touch('.moba-shop .moba-item');
    await page.waitForTimeout(60);
    const blockedFeedback = await page.evaluate(() => {
        const flash = [...document.querySelectorAll('.moba-flash')].at(-1);
        const shop = document.querySelector('.moba-shop');
        return { text: flash?.textContent, flashZ: Number(getComputedStyle(flash).zIndex),
            shopZ: Number(getComputedStyle(shop).zIndex) };
    });
    check(`${tag}：戰線上買唔到會有商店之上嘅可見提示`,
        blockedFeedback.text?.includes('未到泉水') && blockedFeedback.flashZ > blockedFeedback.shopZ,
        blockedFeedback);
    await touch('.moba-shop-recall');
    await page.waitForTimeout(80);
    const recallFromShop = await page.evaluate(() => ({
        shopClosed: document.querySelector('.moba-shop')?.classList.contains('hidden'),
        progress: window.__sim.recallProgress(window.__sim.player),
    }));
    check(`${tag}：商店「返程購物」會關店兼開始返程`,
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
        const before = v.fx.items.length;
        p.cd = 0;
        s.orderAttack(p, foe.id);
        s.step(1 / 30);
        v.update(1 / 60, s.drain());
        const afterAttack = v.fx.items.length;
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
            fxOnAttack: afterAttack - before,
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

await browser.close();
server.close();

console.log(`\nmoba browser: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目: ' + failed.join('、')); process.exit(1); }
