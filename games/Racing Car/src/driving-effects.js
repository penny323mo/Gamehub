// 駕駛回饋層：胎痕、輪胎煙／沙塵／撞擊碎光共用同一個 instanced shader draw。
// 固定容量循環重用，唔會因為跑得耐而增加 geometry、material 或 draw calls。

import * as THREE from 'three';

const MARK_COUNT = 128;
const PARTICLE_COUNT = 48;
const TOTAL = MARK_COUNT + PARTICLE_COUNT;

const vertexShader = `
attribute vec3 instanceCenter;
attribute vec2 instanceAxis;
attribute vec2 instanceSize;
attribute vec3 instanceColor;
attribute float instanceAlpha;
attribute float instanceKind;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vKind;
void main() {
    vec4 viewPosition;
    if (instanceKind < 0.5) {
        vec3 forward = normalize(vec3(instanceAxis.x, 0.0, instanceAxis.y));
        vec3 side = vec3(forward.z, 0.0, -forward.x);
        vec3 worldPosition = instanceCenter
            + side * position.x * instanceSize.x
            + forward * position.y * instanceSize.y;
        viewPosition = modelViewMatrix * vec4(worldPosition, 1.0);
    } else {
        viewPosition = modelViewMatrix * vec4(instanceCenter, 1.0);
        viewPosition.xy += position.xy * instanceSize.x;
    }
    gl_Position = projectionMatrix * viewPosition;
    vUv = uv;
    vColor = instanceColor;
    vAlpha = instanceAlpha;
    vKind = instanceKind;
}`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vKind;
void main() {
    float alpha = vAlpha;
    if (vKind > 0.5) {
        float radial = length(vUv - vec2(0.5));
        float falloff = 1.0 - smoothstep(0.0, 0.5, radial);
        alpha *= vKind > 1.5 ? 1.0 - smoothstep(0.14, 0.5, radial) : falloff * falloff;
    } else {
        float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        alpha *= smoothstep(0.0, 0.12, edge);
    }
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
}`;

function makeGeometry() {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0,
    ], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
        0, 0, 1, 0, 0, 1, 1, 1,
    ], 2));
    geometry.setIndex([0, 1, 2, 1, 3, 2]);
    geometry.instanceCount = TOTAL;
    return geometry;
}

export function createDrivingEffects(scene) {
    const geometry = makeGeometry();
    const centers = new Float32Array(TOTAL * 3);
    const axes = new Float32Array(TOTAL * 2);
    const sizes = new Float32Array(TOTAL * 2);
    const colors = new Float32Array(TOTAL * 3);
    const alphas = new Float32Array(TOTAL);
    const peakAlphas = new Float32Array(TOTAL);
    const kinds = new Float32Array(TOTAL);
    const ages = new Float32Array(TOTAL);
    const lives = new Float32Array(TOTAL);
    const vx = new Float32Array(TOTAL), vy = new Float32Array(TOTAL), vz = new Float32Array(TOTAL);

    const attributes = {
        center: new THREE.InstancedBufferAttribute(centers, 3),
        axis: new THREE.InstancedBufferAttribute(axes, 2),
        size: new THREE.InstancedBufferAttribute(sizes, 2),
        color: new THREE.InstancedBufferAttribute(colors, 3),
        alpha: new THREE.InstancedBufferAttribute(alphas, 1),
        kind: new THREE.InstancedBufferAttribute(kinds, 1),
    };
    geometry.setAttribute('instanceCenter', attributes.center);
    geometry.setAttribute('instanceAxis', attributes.axis);
    geometry.setAttribute('instanceSize', attributes.size);
    geometry.setAttribute('instanceColor', attributes.color);
    geometry.setAttribute('instanceAlpha', attributes.alpha);
    geometry.setAttribute('instanceKind', attributes.kind);
    Object.values(attributes).forEach(attribute => attribute.setUsage(THREE.DynamicDrawUsage));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'bounded-driving-effects';
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    mesh.visible = false;
    scene.add(mesh);

    let markCursor = 0, particleCursor = 0;
    let smokeTimer = 0, exhaustTimer = 0, impactCooldown = 0, shake = 0, elapsed = 0;
    let exhaustSide = -1;
    let lastLeft = null, lastRight = null;
    let seed = 0x7182ad;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const color = new THREE.Color();
    const tempLeft = new THREE.Vector3(), tempRight = new THREE.Vector3();
    const tempParticle = new THREE.Vector3(), tempImpact = new THREE.Vector3();
    const shakeOffset = new THREE.Vector3();

    const dirty = () => Object.values(attributes).forEach(attribute => { attribute.needsUpdate = true; });
    const setColor = (slot, hex) => {
        color.setHex(hex);
        colors[slot * 3] = color.r; colors[slot * 3 + 1] = color.g; colors[slot * 3 + 2] = color.b;
    };
    const localPoint = (car, x, z, out) => out.set(
        car.pos.x + Math.cos(car.yaw) * x + Math.sin(car.yaw) * z,
        0.08,
        car.pos.z - Math.sin(car.yaw) * x + Math.cos(car.yaw) * z,
    );

    const spawnMark = (from, to) => {
        const dx = to.x - from.x, dz = to.z - from.z;
        const length = Math.hypot(dx, dz);
        if (length < 0.12 || length > 2.6) return;
        const slot = markCursor;
        markCursor = (markCursor + 1) % MARK_COUNT;
        centers[slot * 3] = (from.x + to.x) / 2;
        centers[slot * 3 + 1] = 0.048;
        centers[slot * 3 + 2] = (from.z + to.z) / 2;
        axes[slot * 2] = dx / length; axes[slot * 2 + 1] = dz / length;
        sizes[slot * 2] = 0.18; sizes[slot * 2 + 1] = length + 0.1;
        setColor(slot, 0x11151b);
        alphas[slot] = peakAlphas[slot] = 0.36;
        kinds[slot] = 0;
        ages[slot] = 0; lives[slot] = 16;
    };

    const spawnParticle = (position, hex, size, life, velocity, peakAlpha, kind = 1) => {
        const slot = MARK_COUNT + particleCursor;
        particleCursor = (particleCursor + 1) % PARTICLE_COUNT;
        centers[slot * 3] = position.x;
        centers[slot * 3 + 1] = position.y;
        centers[slot * 3 + 2] = position.z;
        sizes[slot * 2] = size; sizes[slot * 2 + 1] = size;
        axes[slot * 2] = 0; axes[slot * 2 + 1] = 1;
        setColor(slot, hex);
        alphas[slot] = peakAlphas[slot] = peakAlpha;
        kinds[slot] = kind;
        ages[slot] = 0; lives[slot] = life;
        vx[slot] = velocity.x; vy[slot] = velocity.y; vz[slot] = velocity.z;
    };

    const spawnTyreCloud = (car, dust = false) => {
        const side = random() < 0.5 ? -1.08 : 1.08;
        const p = localPoint(car, side, -1.35, tempParticle);
        p.x += (random() - 0.5) * 0.55;
        p.z += (random() - 0.5) * 0.55;
        spawnParticle(p, dust ? 0xb49568 : 0xaeb6be, dust ? 1.0 : 1.25, dust ? 0.85 : 1.2, {
            x: car.vel.x * 0.025 + (random() - 0.5) * 0.65,
            y: dust ? 0.9 : 0.55,
            z: car.vel.z * 0.025 + (random() - 0.5) * 0.65,
        }, dust ? 0.4 : 0.28);
    };

    const spawnImpact = (car, strength) => {
        const origin = tempImpact.copy(car.pos).setY(0.55);
        const count = Math.min(12, 6 + Math.round(strength / 4));
        for (let i = 0; i < count; i++) {
            const angle = random() * Math.PI * 2;
            const speed = 2.2 + random() * Math.min(6, strength * 0.25);
            spawnParticle(origin, i % 3 ? 0xffb04a : 0xffe0a0, 0.2 + random() * 0.18, 0.38 + random() * 0.28, {
                x: Math.cos(angle) * speed,
                y: 1.2 + random() * 3.5,
                z: Math.sin(angle) * speed,
            }, 0.82, 2);
        }
    };

    const reset = () => {
        alphas.fill(0); peakAlphas.fill(0); ages.fill(0); lives.fill(0);
        centers.fill(0); axes.fill(0); sizes.fill(0); colors.fill(0); kinds.fill(0);
        vx.fill(0); vy.fill(0); vz.fill(0);
        markCursor = particleCursor = 0;
        smokeTimer = exhaustTimer = impactCooldown = shake = elapsed = 0;
        exhaustSide = -1;
        lastLeft = lastRight = null;
        mesh.visible = false;
        dirty();
    };

    const spawnExhaust = (car) => {
        // 單一車模冇獨立尾喉 node；用同一個 bounded instance pool 做極淡嘅
        // 尾氣脈衝，令直路全油唔再似一件靜態模型。位置只係 render hint，
        // 唔會寫回物理；兩邊交替出煙，避免所有粒子疊成一點。
        exhaustSide *= -1;
        const p = localPoint(car, exhaustSide * 0.52, -1.68, tempParticle);
        p.y = 0.42;
        const fwdX = Math.sin(car.yaw), fwdZ = Math.cos(car.yaw);
        spawnParticle(p, 0x8ea6b8, 0.18, 0.42, {
            x: car.vel.x * 0.025 - fwdX * 1.1,
            y: 0.25,
            z: car.vel.z * 0.025 - fwdZ * 1.1,
        }, 0.14, 1);
    };

    const update = (dt, car, cmd = {}) => {
        elapsed += dt;
        impactCooldown = Math.max(0, impactCooldown - dt);
        shake *= Math.exp(-dt * 8.5);

        let active = 0;
        for (let slot = 0; slot < TOTAL; slot++) {
            if (lives[slot] <= 0 || alphas[slot] <= 0) continue;
            ages[slot] += dt;
            const t = ages[slot] / lives[slot];
            if (t >= 1) { alphas[slot] = 0; lives[slot] = 0; continue; }
            if (slot < MARK_COUNT) {
                alphas[slot] = peakAlphas[slot] * Math.min(1, (1 - t) * 3.5);
            } else {
                centers[slot * 3] += vx[slot] * dt;
                centers[slot * 3 + 1] += vy[slot] * dt;
                centers[slot * 3 + 2] += vz[slot] * dt;
                vy[slot] += (kinds[slot] > 0.5 ? 0.12 : 0) * dt;
                sizes[slot * 2] *= 1 + dt * 0.72;
                sizes[slot * 2 + 1] = sizes[slot * 2];
                alphas[slot] = peakAlphas[slot] * (1 - t) * (1 - t);
            }
            active++;
        }

        localPoint(car, -1.08, -1.35, tempLeft);
        localPoint(car, 1.08, -1.35, tempRight);
        if (car.drifting && !car.offroad) {
            if (lastLeft && lastRight) {
                if (lastLeft.distanceTo(tempLeft) >= 0.32 || lastRight.distanceTo(tempRight) >= 0.32) {
                    spawnMark(lastLeft, tempLeft);
                    spawnMark(lastRight, tempRight);
                    lastLeft.copy(tempLeft); lastRight.copy(tempRight);
                }
            } else {
                lastLeft = tempLeft.clone(); lastRight = tempRight.clone();
            }
            smokeTimer += dt * Math.min(2.4, Math.max(0.7, car.speed / 18));
            while (smokeTimer >= 0.15) { spawnTyreCloud(car, false); smokeTimer -= 0.15; }
        } else {
            lastLeft = lastRight = null;
            if (car.offroad && car.speed > 8) {
                smokeTimer += dt * Math.min(2, car.speed / 16);
                while (smokeTimer >= 0.13) { spawnTyreCloud(car, true); smokeTimer -= 0.13; }
            } else smokeTimer = 0;
        }

        // 只喺有實際油門、車已經行緊、而且唔係落草／手煞甩尾時出現。
        // 漂移煙同尾氣分開，唔會搶走玩家最需要讀嘅胎痕；同一個 instance
        // pool 亦令呢個回饋唔增加 draw call。
        if ((cmd.throttle ?? 0) > 0.55 && !car.offroad && !car.drifting && car.speed > 4) {
            exhaustTimer += dt * Math.min(2.5, Math.max(0.7, car.speed / 18));
            while (exhaustTimer >= 0.16) { spawnExhaust(car); exhaustTimer -= 0.16; }
        } else {
            exhaustTimer = 0;
        }

        if (car.wallImpact > 3.5 && impactCooldown === 0) {
            spawnImpact(car, car.wallImpact);
            shake = Math.max(shake, THREE.MathUtils.clamp(car.wallImpact / 42, 0.08, 0.48));
            impactCooldown = 0.18;
        }

        // 今幀新生嘅 instance 未計入上面 active；由 alpha 掃一次只得 176 格。
        active = 0;
        for (let slot = 0; slot < TOTAL; slot++) if (alphas[slot] > 0) active++;
        mesh.visible = active > 0;
        if (mesh.visible) dirty();
    };

    const cameraOffset = () => {
        if (shake < 0.002) return shakeOffset.set(0, 0, 0);
        return shakeOffset.set(
            Math.sin(elapsed * 67) * shake,
            Math.sin(elapsed * 91 + 0.7) * shake * 0.55,
            Math.cos(elapsed * 73) * shake * 0.35,
        );
    };

    const snapshot = () => {
        let marks = 0, particles = 0;
        for (let i = 0; i < MARK_COUNT; i++) if (alphas[i] > 0) marks++;
        for (let i = MARK_COUNT; i < TOTAL; i++) if (alphas[i] > 0) particles++;
        return {
            marks, particles, shake, visible: mesh.visible,
            maxInstances: TOTAL, markCapacity: MARK_COUNT, particleCapacity: PARTICLE_COUNT,
        };
    };

    reset();
    return { mesh, update, reset, cameraOffset, snapshot };
}
