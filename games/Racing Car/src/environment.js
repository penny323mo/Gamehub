// 低成本日夜環境：一個天空穹頂、一個太陽／月亮 sprite、一批星點，
// 再加一盞跟車但唔投影嘅 SpotLight。夜景最多只多三個 draw calls。

import * as THREE from 'three';

const vertexShader = `
varying vec3 vSkyPosition;
void main() {
    vSkyPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform vec3 horizonColor;
uniform vec3 zenithColor;
uniform vec3 glowColor;
uniform vec3 lightDirection;
uniform float glowStrength;
varying vec3 vSkyPosition;
void main() {
    vec3 direction = normalize(vSkyPosition);
    float heightMix = smoothstep(-0.08, 0.72, direction.y);
    vec3 color = mix(horizonColor, zenithColor, heightMix);
    float glow = pow(max(dot(direction, lightDirection), 0.0), 42.0) * glowStrength;
    gl_FragColor = vec4(color + glowColor * glow, 1.0);
}`;

function starGeometry(count = 150) {
    const positions = new Float32Array(count * 3);
    let seed = 0x4a17c9;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
        const azimuth = random() * Math.PI * 2;
        const y = 0.08 + Math.pow(random(), 0.72) * 0.9;
        const horizontal = Math.sqrt(Math.max(0, 1 - y * y));
        const radius = 385 + random() * 8;
        positions[i * 3] = Math.cos(azimuth) * horizontal * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(azimuth) * horizontal * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
}

export function createEnvironment(scene) {
    const root = new THREE.Group();
    root.name = 'time-of-day-environment';

    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        uniforms: {
            horizonColor: { value: new THREE.Color(0xcceaff) },
            zenithColor: { value: new THREE.Color(0x4d9ee3) },
            glowColor: { value: new THREE.Color(0xffe2a8) },
            lightDirection: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
            glowStrength: { value: 0.45 },
        },
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(440, 24, 14), skyMaterial);
    sky.name = 'gradient-sky-dome';
    sky.renderOrder = -1000;
    sky.frustumCulled = false;
    root.add(sky);

    const starMaterial = new THREE.PointsMaterial({
        color: 0xe8efff,
        size: 1.55,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
    });
    const stars = new THREE.Points(starGeometry(), starMaterial);
    stars.name = 'night-stars';
    stars.frustumCulled = false;
    root.add(stars);

    const celestialMaterial = new THREE.SpriteMaterial({
        color: 0xfff0bd,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: true,
        fog: false,
    });
    const celestial = new THREE.Sprite(celestialMaterial);
    celestial.name = 'sun-or-moon';
    celestial.scale.setScalar(34);
    root.add(celestial);
    scene.add(root);

    const headlight = new THREE.SpotLight(0xfff1cf, 0, 85, 0.43, 0.68, 1.3);
    headlight.name = 'player-headlight';
    const headlightTarget = new THREE.Object3D();
    headlightTarget.name = 'player-headlight-target';
    headlight.position.set(0, 1.05, 1.7);
    headlightTarget.position.set(0, 0.05, 30);
    headlight.target = headlightTarget;

    let timeId = 'day';
    let attachedCar = null;

    const apply = (time, id) => {
        timeId = id;
        const env = time.environment;
        skyMaterial.uniforms.horizonColor.value.setHex(env.horizon);
        skyMaterial.uniforms.zenithColor.value.setHex(env.zenith);
        skyMaterial.uniforms.glowColor.value.setHex(env.glowColor);
        skyMaterial.uniforms.glowStrength.value = env.glowStrength;
        const direction = new THREE.Vector3(...time.sun.pos).normalize();
        skyMaterial.uniforms.lightDirection.value.copy(direction);
        celestial.position.copy(direction).multiplyScalar(350);
        celestial.material.color.setHex(env.celestialColor);
        celestial.material.opacity = env.celestialOpacity;
        celestial.scale.setScalar(env.celestialSize);
        starMaterial.opacity = env.starOpacity;
        stars.visible = env.starOpacity > 0;
        headlight.color.setHex(env.headlightColor);
        headlight.intensity = env.headlight;
        headlight.visible = env.headlight > 0;
    };

    const attachCar = (carRoot) => {
        if (attachedCar === carRoot) return;
        headlight.removeFromParent();
        headlightTarget.removeFromParent();
        attachedCar = carRoot;
        carRoot.add(headlight, headlightTarget);
    };

    const follow = (camera) => {
        // 無限遠效果：環境只跟鏡頭水平位置，唔會因賽道跨過世界中心而走近天空邊。
        root.position.set(camera.position.x, 0, camera.position.z);
    };

    const snapshot = () => ({
        id: timeId,
        starsVisible: stars.visible,
        starOpacity: starMaterial.opacity,
        celestialColor: celestial.material.color.getHex(),
        celestialOpacity: celestial.material.opacity,
        headlightIntensity: headlight.intensity,
        headlightAttached: headlight.parent === attachedCar && headlightTarget.parent === attachedCar,
        skyHorizon: skyMaterial.uniforms.horizonColor.value.getHex(),
        skyZenith: skyMaterial.uniforms.zenithColor.value.getHex(),
    });

    return { root, sky, stars, celestial, headlight, apply, attachCar, follow, snapshot };
}
