// Rigid car.glb 冇 wheel bones／animation clips，但 geometry 內仍保留四個
// 清楚嘅輪胎 vertex cluster。呢個 render-only controller 只轉嗰批 vertices：
// 物理車輪、碰撞半徑同 drivetrain 完全唔喺度。

import * as THREE from 'three';

const _box = new THREE.Box3();
const _size = new THREE.Vector3();

function ancestorScale(object) {
    let scale = 1;
    for (let node = object; node; node = node.parent) scale *= Math.abs(node.scale.x || 1);
    return Math.max(0.001, scale);
}

function collectWheelVertices(mesh) {
    const position = mesh.geometry?.attributes?.position;
    const normal = mesh.geometry?.attributes?.normal;
    if (!position || !normal) return null;

    _box.setFromBufferAttribute(position);
    _box.getSize(_size);
    const centreY = _box.min.y + _size.y * 0.45;
    const xCentre = _size.x * 0.34;
    const zCentre = _size.z * 0.42;
    // 輪胎係 merged mesh 入面最低、最外側嘅四個橢圓 cluster。限制盒比
    // sphere 更穩，唔會將底盤長條一併當成輪胎。
    const rx = _size.x * 0.14;
    const ry = _size.y * 0.52;
    const rz = _size.z * 0.19;
    const wheels = [];
    for (const x of [-xCentre, xCentre]) {
        for (const z of [-zCentre, zCentre]) {
            const vertices = [];
            for (let i = 0; i < position.count; i++) {
                const dx = (position.getX(i) - x) / rx;
                const dy = (position.getY(i) - centreY) / ry;
                const dz = (position.getZ(i) - z) / rz;
                if (dx * dx + dy * dy + dz * dz > 1 || position.getY(i) > -0.012) continue;
                vertices.push({
                    index: i,
                    x: position.getX(i),
                    y: position.getY(i),
                    z: position.getZ(i),
                    nx: normal.getX(i),
                    ny: normal.getY(i),
                    nz: normal.getZ(i),
                });
            }
            if (vertices.length < 100) return null;
            const minY = Math.min(...vertices.map(vertex => vertex.y));
            const maxY = Math.max(...vertices.map(vertex => vertex.y));
            wheels.push({
                x, z, y: (minY + maxY) * 0.5,
                radius: (maxY - minY) * 0.5,
                front: x > 0, vertices,
            });
        }
    }
    const scale = ancestorScale(mesh);
    const radius = wheels.reduce((sum, wheel) => sum + wheel.radius, 0) / wheels.length * scale;
    return { position, normal, wheels, scale, radius: Math.max(0.18, radius) };
}

export function createWheelMotion(root) {
    const mesh = root?.getObjectByProperty?.('isMesh', true);
    const data = mesh ? collectWheelVertices(mesh) : null;
    let angle = 0;
    let steering = 0;

    const restore = () => {
        if (!data) return;
        for (const wheel of data.wheels) {
            for (const vertex of wheel.vertices) {
                data.position.setXYZ(vertex.index, vertex.x, vertex.y, vertex.z);
                data.normal.setXYZ(vertex.index, vertex.nx, vertex.ny, vertex.nz);
            }
        }
        data.position.needsUpdate = true;
        data.normal.needsUpdate = true;
    };

    const update = (dt, forwardSpeed = 0, steer = 0) => {
        if (!data || !Number.isFinite(dt)) return;
        const safeDt = Math.min(0.05, Math.max(0, dt));
        const speed = Number.isFinite(forwardSpeed) ? forwardSpeed : 0;
        // 車輪滾動角：正向行車 local wheel 以負角轉，倒車自然反向。
        angle -= speed * safeDt / data.radius;
        if (Math.abs(angle) > Math.PI * 1024) angle %= Math.PI * 2;
        steering += (THREE.MathUtils.clamp(Number.isFinite(steer) ? steer : 0, -0.62, 0.62) - steering)
            * Math.min(1, safeDt * 14);
        const spinC = Math.cos(angle), spinS = Math.sin(angle);
        const steerC = Math.cos(steering), steerS = Math.sin(steering);
        for (const wheel of data.wheels) {
            for (const vertex of wheel.vertices) {
                let dx = vertex.x - wheel.x;
                let dy = vertex.y - wheel.y;
                // 先沿 local-Z axle 滾動。
                const sx = dx * spinC - dy * spinS;
                const sy = dx * spinS + dy * spinC;
                let x = wheel.x + sx;
                let y = wheel.y + sy;
                let z = vertex.z;
                let nx = vertex.nx * spinC - vertex.ny * spinS;
                let ny = vertex.nx * spinS + vertex.ny * spinC;
                let nz = vertex.nz;
                // local +X 係車頭；前輪只做視覺轉向，唔改車身／碰撞。
                if (wheel.front) {
                    dx = x - wheel.x;
                    const dz = z - wheel.z;
                    const turnedX = dx * steerC + dz * steerS;
                    const turnedZ = -dx * steerS + dz * steerC;
                    x = wheel.x + turnedX;
                    z = wheel.z + turnedZ;
                    const turnedNx = nx * steerC + nz * steerS;
                    nz = -nx * steerS + nz * steerC;
                    nx = turnedNx;
                }
                data.position.setXYZ(vertex.index, x, y, z);
                data.normal.setXYZ(vertex.index, nx, ny, nz);
            }
        }
        data.position.needsUpdate = true;
        data.normal.needsUpdate = true;
    };

    const reset = () => {
        angle = 0;
        steering = 0;
        restore();
    };

    return {
        enabled: !!data,
        update,
        reset,
        snapshot: () => ({
            enabled: !!data,
            wheels: data?.wheels.length ?? 0,
            vertices: data?.wheels.reduce((sum, wheel) => sum + wheel.vertices.length, 0) ?? 0,
            angle,
            steering,
            radius: data?.radius ?? 0,
        }),
    };
}
