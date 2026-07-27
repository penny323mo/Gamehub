// 賽道縮圖：2D canvas 畫中線 + 起跑線 + 車嘅位置同朝向。
//
// 用 2D canvas 而唔係第二部 3D 鏡頭：多開一個 render target 喺手機好貴，
// 而縮圖要嘅資訊（我而家喺賽道邊，下個彎向邊）一條線就講得晒。

export class Minimap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas?.getContext('2d') ?? null;
        this.pts = [];
    }

    // 換賽道要重新量度，因為每條賽道嘅範圍唔同
    setTrack(track) {
        if (!this.ctx) return;
        const N = 160;
        this.pts = [];
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (let i = 0; i < N; i++) {
            const p = track.curve.getPointAt(i / N);
            this.pts.push([p.x, p.z]);
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        }
        const pad = 12;
        const w = this.canvas.width, h = this.canvas.height;
        this.scale = Math.min((w - pad * 2) / (maxX - minX), (h - pad * 2) / (maxZ - minZ));
        this.ox = w / 2 - (minX + maxX) / 2 * this.scale;
        this.oz = h / 2 - (minZ + maxZ) / 2 * this.scale;
        this.start = track.curve.getPointAt(track.startT);
        this.startDir = track.curve.getTangentAt(track.startT);
    }

    #to(x, z) { return [x * this.scale + this.ox, z * this.scale + this.oz]; }

    draw(car, rivals = null) {
        const g = this.ctx;
        if (!g || !this.pts.length) return;
        const w = this.canvas.width, h = this.canvas.height;
        g.clearRect(0, 0, w, h);

        // 賽道：粗底線 + 幼面線，望落似條路唔似條電線
        g.lineJoin = g.lineCap = 'round';
        for (const [width, colour] of [[9, 'rgba(15,20,28,0.55)'], [6, 'rgba(210,218,230,0.9)']]) {
            g.beginPath();
            this.pts.forEach(([x, z], i) => {
                const [px, pz] = this.#to(x, z);
                if (i === 0) g.moveTo(px, pz); else g.lineTo(px, pz);
            });
            g.closePath();
            g.lineWidth = width;
            g.strokeStyle = colour;
            g.stroke();
        }

        // 起跑線：打橫一劃
        const [sx, sz] = this.#to(this.start.x, this.start.z);
        const nx = -this.startDir.z, nz = this.startDir.x;
        g.beginPath();
        g.moveTo(sx - nx * 6, sz - nz * 6);
        g.lineTo(sx + nx * 6, sz + nz * 6);
        g.lineWidth = 3;
        g.strokeStyle = '#f4b942';
        g.stroke();

        // 對手：細圓點，顏色同佢喺賽道上面嗰架車一樣。畫喺玩家之前，
        // 咁樣重疊嗰陣自己嘅三角形永遠喺最面。
        if (rivals?.length) {
            for (const rv of rivals) {
                if (rv.finished) continue;
                const [rx, rz] = this.#to(rv.car.pos.x, rv.car.pos.z);
                g.beginPath();
                g.arc(rx, rz, 4, 0, Math.PI * 2);
                g.fillStyle = `#${rv.colour.toString(16).padStart(6, '0')}`;
                g.strokeStyle = 'rgba(10,14,20,0.75)';
                g.lineWidth = 1.5;
                g.fill(); g.stroke();
            }
        }

        // 車：三角形，尖頭指住車頭方向
        const [cx, cz] = this.#to(car.pos.x, car.pos.z);
        const fx = Math.sin(car.yaw), fz = Math.cos(car.yaw);
        g.save();
        g.translate(cx, cz);
        g.rotate(Math.atan2(fx, fz));
        g.beginPath();
        g.moveTo(0, -7); g.lineTo(5, 6); g.lineTo(-5, 6);
        g.closePath();
        g.fillStyle = '#ff4d4d';
        g.strokeStyle = 'rgba(255,255,255,0.85)';
        g.lineWidth = 1.5;
        g.fill(); g.stroke();
        g.restore();
    }
}
