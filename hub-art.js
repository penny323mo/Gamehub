/*
 * Hub 封面插畫：每隻遊戲一幅 16:10 向量 key art。
 *
 * 點解係 inline SVG 而唔係圖檔：
 *   - 零額外 request，首屏唔使等 13 張圖；gzip 之後成個檔十幾 KB。
 *   - 任何 DPR 都清，唔使出兩三個尺寸。
 *   - 同一幅畫可以喺 hero 同 grid 同時出現。
 *
 * 每個 entry 係 `(u) => svg`：`u` 係呢一次渲染嘅 id 前綴。同一幅畫出現兩次
 * （hero ＋ grid）而又共用 gradient id 嘅話，filter 收埋 grid 嗰幅
 * （display:none）之後 Chrome 會令 hero 嗰幅搵唔返個 gradient——所以每次
 * 渲染都要自己一套 id。
 *
 * `accent` 係張卡 hover／focus 時個光暈色，同插畫主色對齊。
 */
(function () {
    const svg = (body) =>
        `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;
    const lin = (id, x2, y2, stops) =>
        `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
            .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
            .join('')}</linearGradient>`;
    const rad = (id, cx, cy, r, stops) =>
        `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
            .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
            .join('')}</radialGradient>`;

    const art = {};

    // 五子棋：木棋盤上面一條連成五粒嘅斜線，最後一粒亮起。
    art.gomoku = {
        accent: '#f5b04c',
        draw: (u) => {
            let grid = '';
            for (let i = 0; i <= 12; i += 1) {
                grid += `<line x1="${40 + i * 20}" y1="10" x2="${40 + i * 20}" y2="190"/>`;
                grid += `<line x1="40" y1="${10 + i * 15}" x2="280" y2="${10 + i * 15}"/>`;
            }
            const stone = (x, y, black, glow) => `
                ${glow ? `<circle cx="${x}" cy="${y}" r="17" fill="url(#${u}g)"/>` : ''}
                <circle cx="${x + 1.5}" cy="${y + 3}" r="9" fill="#3b2208" opacity=".35"/>
                <circle cx="${x}" cy="${y}" r="9" fill="url(#${u}${black ? 'b' : 'w'})"/>`;
            const line = [[100, 55], [120, 70], [140, 85], [160, 100], [180, 115]]
                .map(([x, y], i) => stone(x, y, true, i === 4)).join('');
            const whites = [[120, 100], [140, 115], [160, 70], [200, 85], [100, 85], [180, 55]]
                .map(([x, y]) => stone(x, y, false)).join('');
            return svg(`<defs>
                ${lin(`${u}bg`, 1, 1, [[0, '#e7b56a'], [1, '#b8742f']])}
                ${rad(`${u}b`, 0.35, 0.3, 0.8, [[0, '#6b7280'], [1, '#0b0f17']])}
                ${rad(`${u}w`, 0.35, 0.3, 0.8, [[0, '#ffffff'], [1, '#cbd2dd']])}
                ${rad(`${u}g`, 0.5, 0.5, 0.5, [[0, '#fff3c4', 0.9], [1, '#fff3c4', 0]])}
                ${rad(`${u}v`, 0.5, 0.45, 0.75, [[0.55, '#000', 0], [1, '#2a1404', 0.55]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <g stroke="#6b3d12" stroke-opacity=".45" stroke-width="1">${grid}</g>
            <g fill="#6b3d12" opacity=".6"><circle cx="100" cy="55" r="2.5"/><circle cx="220" cy="55" r="2.5"/><circle cx="160" cy="100" r="2.5"/><circle cx="100" cy="145" r="2.5"/><circle cx="220" cy="145" r="2.5"/></g>
            ${whites}
            <line x1="100" y1="55" x2="180" y2="115" stroke="#fff3c4" stroke-width="22" stroke-linecap="round" opacity=".22"/>
            ${line}
            <rect width="320" height="200" fill="url(#${u}v)"/>`);
        },
    };

    // 中國象棋：楚河漢界上面兩粒大棋子，一紅一黑對峙。
    art.xiangqi = {
        accent: '#ef4444',
        draw: (u) => {
            const piece = (x, y, r, ch, red) => `
                <circle cx="${x + 3}" cy="${y + 6}" r="${r}" fill="#1a0a05" opacity=".45"/>
                <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${u}p)"/>
                <circle cx="${x}" cy="${y}" r="${r - 5}" fill="none" stroke="${red ? '#c81e1e' : '#1f2937'}" stroke-width="2.5"/>
                <text x="${x}" y="${y + r * 0.36}" text-anchor="middle" font-size="${r * 1.05}" font-weight="700"
                    font-family="'Noto Serif TC','Songti TC','PMingLiU',serif" fill="${red ? '#c81e1e' : '#111827'}">${ch}</text>`;
            let grid = '';
            for (let i = 0; i < 9; i += 1) grid += `<line x1="${24 + i * 34}" y1="0" x2="${24 + i * 34}" y2="200"/>`;
            for (let j = 0; j < 7; j += 1) grid += `<line x1="0" y1="${14 + j * 30}" x2="320" y2="${14 + j * 30}"/>`;
            return svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#5b1414'], [1, '#2a0808']])}
                ${rad(`${u}p`, 0.4, 0.35, 0.75, [[0, '#fff4dc'], [0.8, '#f0d3a0'], [1, '#c79a5b']])}
                ${rad(`${u}l`, 0.5, 0.5, 0.6, [[0, '#ff9b6a', 0.35], [1, '#ff9b6a', 0]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <g stroke="#f2c38b" stroke-opacity=".16" stroke-width="1">${grid}</g>
            <rect x="0" y="86" width="320" height="30" fill="#000" opacity=".25"/>
            <text x="68" y="108" font-size="18" fill="#f2c38b" fill-opacity=".35" font-family="'Noto Serif TC','Songti TC',serif" letter-spacing="10">楚河</text>
            <text x="200" y="108" font-size="18" fill="#f2c38b" fill-opacity=".35" font-family="'Noto Serif TC','Songti TC',serif" letter-spacing="10">漢界</text>
            <circle cx="160" cy="100" r="120" fill="url(#${u}l)"/>
            ${piece(108, 150, 34, '帥', true)}${piece(216, 54, 30, '將', false)}
            ${piece(62, 50, 16, '炮', true)}${piece(270, 160, 16, '馬', false)}`);
        },
    };

    // 鋤大D：綠色牌枱上面一把打開嘅牌，最頂係葵扇 2。
    art.big2 = {
        accent: '#34d399',
        draw: (u) => {
            const card = (rot, rank, suit, red) => `
                <g transform="rotate(${rot} 160 230)">
                    <rect x="124" y="58" width="72" height="102" rx="8" fill="#0b2d20" opacity=".35" transform="translate(3 5)"/>
                    <rect x="124" y="58" width="72" height="102" rx="8" fill="#fbfaf6" stroke="#d6d3cb"/>
                    <text x="133" y="80" font-size="17" font-weight="700" fill="${red ? '#dc2626' : '#111827'}" font-family="Outfit,system-ui,sans-serif">${rank}</text>
                    <text x="133" y="96" font-size="13" fill="${red ? '#dc2626' : '#111827'}">${suit}</text>
                    <text x="160" y="124" text-anchor="middle" font-size="34" fill="${red ? '#dc2626' : '#111827'}">${suit}</text>
                </g>`;
            return svg(`<defs>
                ${rad(`${u}bg`, 0.5, 0.35, 0.85, [[0, '#1f8a5b'], [0.7, '#0e5236'], [1, '#062a1c']])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <ellipse cx="160" cy="112" rx="150" ry="80" fill="none" stroke="#f5d68a" stroke-opacity=".18" stroke-width="2"/>
            ${card(-24, 'A', '♥', true)}${card(-12, 'K', '♣', false)}${card(0, 'Q', '♦', true)}${card(12, 'J', '♠', false)}${card(24, '2', '♠', false)}
            <g fill="#f5d68a"><circle cx="46" cy="160" r="12" opacity=".9"/><circle cx="52" cy="152" r="12"/><circle cx="276" cy="44" r="9" opacity=".7"/></g>`);
        },
    };

    // 鬥地主：兩張大小鬼加地主帽，紅金色調。
    art.doudizhu = {
        accent: '#fbbf24',
        draw: (u) => {
            const joker = (x, rot, big) => `
                <g transform="rotate(${rot} ${x + 40} 150)">
                    <rect x="${x}" y="44" width="80" height="116" rx="9" fill="#2b0606" opacity=".4" transform="translate(4 6)"/>
                    <rect x="${x}" y="44" width="80" height="116" rx="9" fill="#fffaf0" stroke="#e7d7b5"/>
                    <text x="${x + 10}" y="62" font-size="9" font-weight="700" letter-spacing="1" fill="${big ? '#dc2626' : '#111827'}" font-family="Outfit,system-ui,sans-serif">JOKER</text>
                    <circle cx="${x + 40}" cy="108" r="22" fill="${big ? '#dc2626' : '#111827'}"/>
                    <path d="M${x + 24} 100 l6 -16 l10 12 l10 -12 l6 16 z" fill="#fbbf24"/>
                    <circle cx="${x + 34}" cy="110" r="3" fill="#fff"/><circle cx="${x + 46}" cy="110" r="3" fill="#fff"/>
                    <path d="M${x + 32} 118 q8 7 16 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>`;
            return svg(`<defs>
                ${lin(`${u}bg`, 1, 1, [[0, '#b91c1c'], [1, '#450a0a']])}
                ${rad(`${u}l`, 0.5, 0.2, 0.7, [[0, '#fde68a', 0.45], [1, '#fde68a', 0]])}
                ${lin(`${u}h`, 0, 1, [[0, '#fcd34d'], [1, '#b45309']])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <circle cx="160" cy="30" r="170" fill="url(#${u}l)"/>
            <g opacity=".18" fill="#fde68a"><text x="18" y="46" font-size="30" font-family="'Noto Serif TC',serif">福</text><text x="270" y="184" font-size="30" font-family="'Noto Serif TC',serif">財</text></g>
            ${joker(92, -14, false)}${joker(150, 12, true)}
            <g transform="translate(222 26)"><path d="M0 34 q34 -52 68 0 z" fill="url(#${u}h)"/><rect x="-6" y="30" width="80" height="10" rx="5" fill="#92400e"/><circle cx="34" cy="10" r="5" fill="#fef3c7"/></g>
            <g fill="#fcd34d"><ellipse cx="54" cy="170" rx="16" ry="6"/><ellipse cx="54" cy="164" rx="16" ry="6"/><ellipse cx="54" cy="158" rx="16" ry="6" fill="#fde68a"/></g>`);
        },
    };

    // 消消樂：一格格糖果，中間一粒包裝糖發光。
    art.pennycrush = {
        accent: '#f472b6',
        draw: (u) => {
            const colours = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
            let candies = '';
            for (let r = 0; r < 5; r += 1) {
                for (let c = 0; c < 8; c += 1) {
                    const col = colours[(r * 3 + c * 5 + (r * c) % 4) % colours.length];
                    const x = 34 + c * 36, y = 24 + r * 38;
                    if (r === 2 && c === 3) continue;
                    candies += (r + c) % 3 === 0
                        ? `<rect x="${x - 12}" y="${y - 12}" width="24" height="24" rx="7" fill="${col}"/>`
                        : `<circle cx="${x}" cy="${y}" r="13" fill="${col}"/>`;
                    candies += `<ellipse cx="${x - 4}" cy="${y - 5}" rx="5" ry="3" fill="#fff" opacity=".55"/>`;
                }
            }
            return svg(`<defs>
                ${lin(`${u}bg`, 1, 1, [[0, '#7c3aed'], [1, '#db2777']])}
                ${rad(`${u}g`, 0.5, 0.5, 0.5, [[0, '#fff7c2', 0.95], [1, '#fff7c2', 0]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <rect x="14" y="6" width="292" height="188" rx="16" fill="#1e0b3a" opacity=".35"/>
            ${candies}
            <circle cx="142" cy="100" r="34" fill="url(#${u}g)"/>
            <g transform="translate(142 100)"><path d="M-26 -10 l10 10 l-10 10 z M26 -10 l-10 10 l10 10 z" fill="#fde047"/><circle r="15" fill="#facc15"/><path d="M-10 -8 q10 16 20 0" stroke="#f97316" stroke-width="4" fill="none"/><ellipse cx="-5" cy="-7" rx="5" ry="3" fill="#fff" opacity=".7"/></g>`);
        },
    };

    // 桌球：頂燈照住綠色枱面，一堆紅波同白波，一支桿斜斜指住。
    art.snooker = {
        accent: '#22c55e',
        draw: (u) => {
            let reds = '';
            const rows = [[0, 1], [1, 2], [2, 3], [3, 4]];
            rows.forEach(([row, n]) => {
                for (let i = 0; i < n; i += 1) {
                    const x = 212 + row * 15, y = 100 + (i - (n - 1) / 2) * 16;
                    reds += `<circle cx="${x}" cy="${y}" r="7.5" fill="url(#${u}r)"/>`;
                }
            });
            return svg(`<defs>
                ${rad(`${u}bg`, 0.5, 0.5, 0.75, [[0, '#1c9a4f'], [0.75, '#0b5a2c'], [1, '#032312']])}
                ${rad(`${u}r`, 0.35, 0.3, 0.8, [[0, '#ff8a8a'], [1, '#9b1111']])}
                ${rad(`${u}w`, 0.35, 0.3, 0.8, [[0, '#ffffff'], [1, '#c9ccd3']])}
                ${lin(`${u}c`, 1, 0, [[0, '#f6e1b3'], [0.7, '#b07a3a'], [1, '#3b2410']])}
            </defs>
            <rect width="320" height="200" fill="#1a0f07"/>
            <rect x="8" y="8" width="304" height="184" rx="14" fill="#5b3413"/>
            <rect x="22" y="22" width="276" height="156" rx="6" fill="url(#${u}bg)"/>
            <g fill="#050805"><circle cx="24" cy="24" r="9"/><circle cx="296" cy="24" r="9"/><circle cx="24" cy="176" r="9"/><circle cx="296" cy="176" r="9"/><circle cx="160" cy="21" r="8"/><circle cx="160" cy="179" r="8"/></g>
            <line x1="92" y1="22" x2="92" y2="178" stroke="#fff" stroke-opacity=".25"/>
            <path d="M92 76 a24 24 0 0 0 0 48" fill="none" stroke="#fff" stroke-opacity=".25"/>
            ${reds}
            <circle cx="120" cy="104" r="7.5" fill="url(#${u}w)"/>
            <circle cx="188" cy="100" r="7.5" fill="#ec4899"/><circle cx="92" cy="100" r="7.5" fill="#6b3a1a"/>
            <line x1="112" y1="108" x2="18" y2="150" stroke="url(#${u}c)" stroke-width="5" stroke-linecap="round"/>
            <line x1="120" y1="104" x2="212" y2="100" stroke="#fff" stroke-opacity=".35" stroke-dasharray="3 5"/>`);
        },
    };

    // 塔防：黃昏山路，一座魔法塔射出光束打住敵人。
    art.tower = {
        accent: '#a78bfa',
        draw: (u) => svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#312e81'], [0.55, '#9d4edd'], [1, '#f59e0b']])}
                ${lin(`${u}t`, 1, 0, [[0, '#64748b'], [1, '#334155']])}
                ${rad(`${u}o`, 0.5, 0.5, 0.5, [[0, '#e0e7ff'], [0.4, '#a78bfa', 0.8], [1, '#a78bfa', 0]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <path d="M0 140 L60 96 L110 124 L170 80 L240 128 L320 92 L320 200 L0 200 Z" fill="#1e1b4b" opacity=".6"/>
            <path d="M0 200 L0 160 Q80 140 160 158 T320 150 L320 200 Z" fill="#14532d"/>
            <path d="M0 188 Q90 150 170 172 T320 164" stroke="#d6b77a" stroke-width="16" fill="none" opacity=".85"/>
            <g transform="translate(60 44)">
                <rect x="0" y="40" width="40" height="92" fill="url(#${u}t)"/>
                <path d="M-6 44 L20 6 L46 44 Z" fill="#4c1d95"/>
                <g fill="#1e293b"><rect x="-4" y="34" width="8" height="10"/><rect x="10" y="34" width="8" height="10"/><rect x="24" y="34" width="8" height="10"/><rect x="38" y="34" width="8" height="10"/></g>
                <rect x="14" y="66" width="12" height="18" rx="6" fill="#fde68a"/>
                <circle cx="20" cy="0" r="22" fill="url(#${u}o)"/>
            </g>
            <path d="M80 44 L236 150" stroke="#e0e7ff" stroke-width="3" opacity=".9"/>
            <path d="M80 44 L236 150" stroke="#a78bfa" stroke-width="9" opacity=".35"/>
            <g><circle cx="236" cy="154" r="10" fill="#7f1d1d"/><circle cx="236" cy="154" r="16" fill="#fde68a" opacity=".35"/><circle cx="268" cy="158" r="8" fill="#7f1d1d"/><circle cx="292" cy="154" r="8" fill="#7f1d1d"/></g>
            <g fill="#fff" opacity=".7"><circle cx="250" cy="30" r="1.5"/><circle cx="200" cy="20" r="1"/><circle cx="290" cy="50" r="1.2"/><circle cx="140" cy="36" r="1"/></g>`),
    };

    // 霓虹貪食蛇：暗網格上面一條發光綠蛇追住粉紅果。
    art.snake = {
        accent: '#4ade80',
        draw: (u) => {
            let grid = '';
            for (let x = 0; x <= 320; x += 20) grid += `<line x1="${x}" y1="0" x2="${x}" y2="200"/>`;
            for (let y = 0; y <= 200; y += 20) grid += `<line x1="0" y1="${y}" x2="320" y2="${y}"/>`;
            const body = [[60, 140], [80, 140], [100, 140], [120, 140], [120, 120], [120, 100], [140, 100], [160, 100], [180, 100], [180, 80], [200, 80]];
            const segs = body.map(([x, y], i) =>
                `<rect x="${x + 2}" y="${y + 2}" width="16" height="16" rx="4" fill="#4ade80" opacity="${0.45 + (i / body.length) * 0.55}"/>`).join('');
            return svg(`<defs>
                ${rad(`${u}bg`, 0.5, 0.5, 0.8, [[0, '#0f1a2e'], [1, '#05070d']])}
                <filter id="${u}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <g stroke="#22d3ee" stroke-opacity=".12">${grid}</g>
            <g filter="url(#${u}f)">${segs}</g>${segs}
            <rect x="202" y="82" width="16" height="16" rx="4" fill="#bbf7d0"/>
            <circle cx="214" cy="87" r="2" fill="#052e16"/>
            <circle cx="250" cy="90" r="12" fill="#f472b6" filter="url(#${u}f)"/>
            <circle cx="250" cy="90" r="7" fill="#f9a8d4"/>
            <text x="300" y="30" text-anchor="end" font-size="16" font-weight="700" letter-spacing="2" fill="#22d3ee" fill-opacity=".6" font-family="Outfit,system-ui,sans-serif">0420</text>`);
        },
    };

    // 帝國皇家戰：河兩邊一藍一紅兩座城堡，中間一條橋。
    art.royale = {
        accent: '#60a5fa',
        draw: (u) => {
            const castle = (x, colour, flip) => `
                <g transform="translate(${x} 0) ${flip ? 'scale(-1 1)' : ''}">
                    <rect x="-34" y="92" width="68" height="62" fill="#cbd5e1"/>
                    <rect x="-44" y="72" width="22" height="82" fill="#e2e8f0"/><rect x="22" y="72" width="22" height="82" fill="#e2e8f0"/>
                    <path d="M-48 74 L-33 50 L-18 74 Z M18 74 L33 50 L48 74 Z" fill="${colour}"/>
                    <rect x="-12" y="124" width="24" height="30" rx="12" fill="#334155"/>
                    <line x1="0" y1="92" x2="0" y2="60" stroke="#475569" stroke-width="2"/>
                    <path d="M0 60 L22 66 L0 72 Z" fill="${colour}"/>
                </g>`;
            return svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#60a5fa'], [1, '#bfdbfe']])}
                ${lin(`${u}w`, 0, 1, [[0, '#38bdf8'], [1, '#0369a1']])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <g fill="#fff" opacity=".85"><ellipse cx="70" cy="34" rx="30" ry="9"/><ellipse cx="250" cy="24" rx="36" ry="10"/></g>
            <rect y="140" width="320" height="60" fill="#65a30d"/>
            <path d="M136 140 Q160 170 150 200 L178 200 Q188 170 184 140 Z" fill="url(#${u}w)"/>
            <rect x="126" y="160" width="70" height="10" rx="2" fill="#92400e"/>
            ${castle(62, '#2563eb', false)}${castle(258, '#dc2626', true)}
            <g><circle cx="120" cy="170" r="6" fill="#2563eb"/><circle cx="108" cy="178" r="6" fill="#2563eb"/><circle cx="206" cy="176" r="6" fill="#dc2626"/></g>
            <path d="M126 164 L200 164" stroke="#fde047" stroke-width="2" stroke-dasharray="2 6" opacity=".7"/>`);
        },
    };

    // 深淵之橋 MOBA：深淵上面三條路，兩端水晶互相對望。
    art.moba = {
        accent: '#c084fc',
        draw: (u) => svg(`<defs>
                ${rad(`${u}bg`, 0.5, 0.55, 0.8, [[0, '#3b0764'], [0.6, '#1e0b3a'], [1, '#07030f']])}
                ${lin(`${u}c1`, 0, 1, [[0, '#a5f3fc'], [1, '#0891b2']])}
                ${lin(`${u}c2`, 0, 1, [[0, '#fbcfe8'], [1, '#be185d']])}
                ${rad(`${u}g`, 0.5, 0.5, 0.5, [[0, '#e9d5ff', 0.6], [1, '#e9d5ff', 0]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <circle cx="160" cy="100" r="60" fill="url(#${u}g)"/>
            <g fill="none" stroke="#d8b4fe" stroke-opacity=".75" stroke-width="7" stroke-linecap="round">
                <path d="M44 160 L44 40 L276 40"/><path d="M44 160 L276 40"/><path d="M44 160 L276 160 L276 40"/>
            </g>
            <g fill="none" stroke="#1e0b3a" stroke-width="2" stroke-dasharray="4 6"><path d="M44 160 L276 40"/></g>
            <g fill="#f5d0fe"><rect x="92" y="126" width="10" height="16" rx="2"/><rect x="214" y="58" width="10" height="16" rx="2"/><rect x="40" y="92" width="10" height="16" rx="2"/><rect x="270" y="92" width="10" height="16" rx="2"/></g>
            <path d="M44 130 L60 158 L44 186 L28 158 Z" fill="url(#${u}c1)"/>
            <path d="M276 14 L292 42 L276 70 L260 42 Z" fill="url(#${u}c2)"/>
            <g fill="#fff"><circle cx="160" cy="100" r="3"/><circle cx="150" cy="106" r="2"/><circle cx="170" cy="94" r="2"/></g>`),
    };

    // Racing Car 3D：夕陽下一條彎路，一架紅車尾燈亮起。
    art.racer = {
        accent: '#fb7185',
        draw: (u) => svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#1e1b4b'], [0.5, '#be185d'], [0.75, '#fb923c'], [1, '#fcd34d']])}
                ${lin(`${u}r`, 0, 1, [[0, '#334155'], [1, '#0f172a']])}
                ${lin(`${u}car`, 0, 1, [[0, '#f43f5e'], [1, '#9f1239']])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <circle cx="220" cy="98" r="30" fill="#fde68a" opacity=".9"/>
            <path d="M0 110 L50 88 L90 100 L140 80 L200 104 L260 86 L320 100 L320 200 L0 200 Z" fill="#3b0764" opacity=".55"/>
            <rect y="108" width="320" height="92" fill="#1c1917"/>
            <path d="M40 200 C120 170 170 140 196 110 L212 110 C200 140 210 170 300 200 Z" fill="url(#${u}r)"/>
            <path d="M170 200 C176 170 192 140 204 112" stroke="#fef3c7" stroke-width="3" stroke-dasharray="10 10" fill="none"/>
            <path d="M40 200 C120 170 170 140 196 110" stroke="#ef4444" stroke-width="4" stroke-dasharray="8 8" fill="none"/>
            <path d="M300 200 C210 170 200 140 212 110" stroke="#ffffff" stroke-width="4" stroke-dasharray="8 8" fill="none"/>
            <g transform="translate(146 142)">
                <path d="M0 30 L6 12 Q10 4 20 4 L52 4 Q62 4 66 12 L72 30 Z" fill="url(#${u}car)"/>
                <path d="M14 12 L20 -4 L52 -4 L58 12 Z" fill="#1f2937"/>
                <rect x="-2" y="26" width="76" height="12" rx="3" fill="#881337"/>
                <rect x="4" y="28" width="14" height="5" rx="2" fill="#fecaca"/><rect x="54" y="28" width="14" height="5" rx="2" fill="#fecaca"/>
                <rect x="2" y="38" width="12" height="8" rx="2" fill="#0a0a0a"/><rect x="58" y="38" width="12" height="8" rx="2" fill="#0a0a0a"/>
                <ellipse cx="11" cy="31" rx="16" ry="6" fill="#f43f5e" opacity=".35"/><ellipse cx="61" cy="31" rx="16" ry="6" fill="#f43f5e" opacity=".35"/>
            </g>`),
    };

    // 灰燼列車：橙紅灰燼天空下一列裝甲火車，無人機喺上面盤旋。
    art.ashenrail = {
        accent: '#fb923c',
        draw: (u) => svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#1c1917'], [0.55, '#7c2d12'], [1, '#ea580c']])}
                ${lin(`${u}t`, 0, 1, [[0, '#57534e'], [1, '#292524']])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <path d="M0 150 L40 120 L80 138 L140 104 L200 132 L250 110 L320 130 L320 200 L0 200 Z" fill="#292524"/>
            <rect y="160" width="320" height="40" fill="#1c1917"/>
            <line x1="0" y1="168" x2="320" y2="168" stroke="#a8a29e" stroke-width="2"/>
            <g stroke="#57534e" stroke-width="3">${Array.from({ length: 17 }, (_, i) => `<line x1="${i * 20}" y1="166" x2="${i * 20 + 8}" y2="176"/>`).join('')}</g>
            <g transform="translate(34 104)">
                <rect x="0" y="16" width="120" height="44" rx="4" fill="url(#${u}t)"/>
                <rect x="126" y="24" width="110" height="36" rx="4" fill="url(#${u}t)"/>
                <rect x="10" y="0" width="30" height="20" fill="#44403c"/><rect x="18" y="-12" width="12" height="14" fill="#292524"/>
                <rect x="54" y="26" width="50" height="10" fill="#fb923c" opacity=".9"/>
                <rect x="140" y="32" width="80" height="8" fill="#fdba74" opacity=".6"/>
                <g fill="#0c0a09"><circle cx="20" cy="62" r="8"/><circle cx="60" cy="62" r="8"/><circle cx="100" cy="62" r="8"/><circle cx="150" cy="62" r="8"/><circle cx="214" cy="62" r="8"/></g>
                <ellipse cx="24" cy="-18" rx="14" ry="8" fill="#78716c" opacity=".6"/><ellipse cx="36" cy="-32" rx="18" ry="10" fill="#78716c" opacity=".4"/>
            </g>
            <g fill="#0c0a09"><path d="M226 40 l14 -6 l14 6 l-14 6 z"/><path d="M270 64 l10 -4 l10 4 l-10 4 z"/></g>
            <g fill="#ef4444"><circle cx="240" cy="40" r="2"/><circle cx="280" cy="64" r="1.6"/></g>
            <line x1="96" y1="120" x2="238" y2="42" stroke="#fde68a" stroke-width="2" opacity=".85"/>
            <g fill="#fdba74">${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 71) % 320}" cy="${(i * 37) % 150}" r="${1 + (i % 3) * 0.5}" opacity="${0.35 + (i % 4) * 0.15}"/>`).join('')}</g>`),
    };

    // Elden Ring II：霧氣之中一個持劍騎士，背後一個金色光環。
    art['elden-ring-ii'] = {
        accent: '#fcd34d',
        draw: (u) => svg(`<defs>
                ${lin(`${u}bg`, 0, 1, [[0, '#0c0a09'], [0.6, '#292015'], [1, '#57452a']])}
                ${rad(`${u}h`, 0.5, 0.5, 0.5, [[0.6, '#fde68a', 0], [0.78, '#fcd34d', 0.9], [0.86, '#fde68a', 0.3], [1, '#fde68a', 0]])}
                ${rad(`${u}g`, 0.5, 0.5, 0.5, [[0, '#fde68a', 0.4], [1, '#fde68a', 0]])}
                ${lin(`${u}m`, 0, 1, [[0, '#a8a29e', 0], [1, '#a8a29e', 0.45]])}
            </defs>
            <rect width="320" height="200" fill="url(#${u}bg)"/>
            <circle cx="160" cy="78" r="110" fill="url(#${u}g)"/>
            <circle cx="160" cy="78" r="66" fill="url(#${u}h)"/>
            <path d="M0 150 L30 120 L60 140 L96 100 L130 136 L190 130 L226 96 L262 136 L320 116 L320 200 L0 200 Z" fill="#1c1917"/>
            <g transform="translate(160 96)" fill="#0c0a09">
                <path d="M-12 0 Q0 -10 12 0 L16 34 L22 70 L6 70 L0 44 L-6 70 L-22 70 L-16 34 Z"/>
                <circle cx="0" cy="-10" r="9"/>
                <path d="M-16 6 Q-40 30 -34 70 L-20 70 Z" opacity=".85"/>
                <rect x="18" y="-34" width="4" height="70" rx="1" transform="rotate(12 20 0)" fill="#e7e5e4"/>
                <rect x="12" y="30" width="16" height="4" rx="1" transform="rotate(12 20 32)" fill="#a8a29e"/>
            </g>
            <rect y="140" width="320" height="60" fill="url(#${u}m)"/>
            <g fill="#fde68a">${Array.from({ length: 12 }, (_, i) => `<circle cx="${40 + ((i * 53) % 250)}" cy="${60 + ((i * 29) % 90)}" r="${0.8 + (i % 3) * 0.5}" opacity=".7"/>`).join('')}</g>`),
    };

    globalThis.HubArt = Object.freeze(art);
})();
