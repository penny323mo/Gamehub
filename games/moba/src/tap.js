// 「咩先至算撳咗一下」——全隻遊戲共用一份。
//
// 起因係兩次實機故障：商店卡撳唔郁，跟住審計發現選人卡一模一樣。
// 兩個都係喺 overflow-y: auto 嘅容器入面，而容器聲明咗垂直手勢屬於自己
// （touch-action: pan-y，或者預設 auto）。iOS 見到手指有少少上下飄移，
// 就當你想捲動，於是根本唔會合成 click——粒掣一世收唔到嘢。
// 桌面滑鼠同自動測試嘅合成點擊零位移，所以測試全綠、真機全死。
//
// 所以判斷唔可以靠 click，要自己喺 pointerup 度決定：同一隻手指、
// 位移細過 SLOP、冇撳實過 HOLD。click 保留返畀鍵盤同輔助技術。
//
// 擋合成 click 用旗標，唔用時間窗。第一版用「600 毫秒內當重複」，喺清靜
// 環境 pointerup 同 click 相隔五毫秒，睇落冇問題；但主執行緒一忙，間隔就
// 超過六百毫秒，兩條路一齊行，一下撳做咗兩次。手機正正就係最容易卡嗰個。

const SLOP = 12;      // 像素：超過就當你想捲動
const HOLD = 800;     // 毫秒：撳實咁耐就唔算一下撳

export function armTap(node, run) {
    let start = null;
    let swallowClick = false;
    let sawPointer = false;
    const release = () => node.classList.remove('press');

    node.addEventListener('pointerdown', (ev) => {
        swallowClick = false;
        sawPointer = true;
        start = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, t: performance.now() };
        node.classList.add('press');
    });
    node.addEventListener('pointercancel', () => { start = null; release(); });
    node.addEventListener('pointerleave', release);
    node.addEventListener('pointerup', (ev) => {
        release();
        const s = start;
        start = null;
        if (!s || ev.pointerId !== s.id) return;
        if (Math.hypot(ev.clientX - s.x, ev.clientY - s.y) > SLOP) return;
        if (performance.now() - s.t > HOLD) return;
        swallowClick = true;
        run(ev);
    });
    node.addEventListener('click', (ev) => {
        if (swallowClick) { swallowClick = false; sawPointer = false; return; }
        // 一個由指針衍生嘅 click，如果個手勢根本唔係喺呢個元素度開始，就唔算撳咗佢。
        //
        // 實例：撳商店掣，pointerup 開咗商店，CSS 即刻令全螢幕遮罩生效；跟住
        // 補返嘅 click 就落咗喺遮罩度，而遮罩嘅工作係「關商店」——一下觸控
        // 開完即刻關。用 detail 分辨：鍵盤／輔助技術嘅 click detail 係 0，
        // 指針衍生嘅係 1 或以上。所以鍵盤照用得，飛嚟嘅 click 就唔算。
        if (ev.detail > 0 && !sawPointer) return;
        sawPointer = false;
        run(ev);
    });
    return node;
}
