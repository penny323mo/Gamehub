import * as THREE from 'three';
import type { GameState, TowerType } from '../core/types';
import { GRAPHICS } from '../core/config';

const PROJ_COLORS: Record<TowerType, number> = {
    arrow: 0xffdd44,
    arrow_rapid: 0xffef99,
    arrow_pierce: 0x8ea6ff,
    cannon: 0xff6633,
    ice: 0x88ddff,
    fire: 0xff4400,
    lightning: 0xffff00,
    poison: 0x66ff33,
    sniper: 0xaaaaff,
};

// ── Particle pool for explosions & death effects ──
interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    color: THREE.Color;
    size: number;
}

const MAX_PARTICLES = GRAPHICS.maxParticles;
const MAX_PROJECTILES = 100;
const MOTE_COUNT = GRAPHICS.isMobile ? 35 : 80;
const MOTE_AREA = { minX: -6, maxX: 16, minZ: -6, maxZ: 16 };
const MOTE_HEIGHT = { min: 0.4, max: 4.5 };

export class FxRenderer {
    private scene: THREE.Scene;

    // ── Projectile trail system (Mesh references removed, just particle spawning left) ──

    // ── Explosion / death particle system ──
    private particles: Particle[] = [];
    private particleGeo: THREE.BufferGeometry;
    private particlePositions: Float32Array;
    private particleColors: Float32Array;
    private particleSizes: Float32Array;
    private particleAlphas: Float32Array;
    private particlePoints: THREE.Points;

    // ── Ambient dust motes ──
    private moteGeo!: THREE.BufferGeometry;
    private motePositions!: Float32Array;
    private moteVelocities!: Float32Array;
    private motePhase!: Float32Array;
    private motePoints!: THREE.Points;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // ── Projectile Trails are handled in sync() now, points removed ──

        // ── Explosion / death particles ──
        this.particlePositions = new Float32Array(MAX_PARTICLES * 3);
        this.particleColors = new Float32Array(MAX_PARTICLES * 3);
        this.particleSizes = new Float32Array(MAX_PARTICLES);
        this.particleAlphas = new Float32Array(MAX_PARTICLES);

        this.particleGeo = new THREE.BufferGeometry();
        this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
        this.particleGeo.setAttribute('aColor', new THREE.BufferAttribute(this.particleColors, 3));
        this.particleGeo.setAttribute('aSize', new THREE.BufferAttribute(this.particleSizes, 1));
        this.particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(this.particleAlphas, 1));

        const particleMat = new THREE.ShaderMaterial({
            vertexShader: `
                attribute vec3 aColor;
                attribute float aSize;
                attribute float aAlpha;
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vColor = aColor;
                    vAlpha = aAlpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = max(5.0, aSize * (800.0 / -mvPosition.z));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));
                    gl_FragColor = vec4(vColor * 1.5, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.particlePoints = new THREE.Points(this.particleGeo, particleMat);
        this.particlePoints.frustumCulled = false;
        scene.add(this.particlePoints);

        this.initMotes();
    }

    private initMotes(): void {
        this.motePositions = new Float32Array(MOTE_COUNT * 3);
        this.moteVelocities = new Float32Array(MOTE_COUNT * 3);
        this.motePhase = new Float32Array(MOTE_COUNT);

        for (let i = 0; i < MOTE_COUNT; i++) {
            const i3 = i * 3;
            this.motePositions[i3]     = MOTE_AREA.minX + Math.random() * (MOTE_AREA.maxX - MOTE_AREA.minX);
            this.motePositions[i3 + 1] = MOTE_HEIGHT.min + Math.random() * (MOTE_HEIGHT.max - MOTE_HEIGHT.min);
            this.motePositions[i3 + 2] = MOTE_AREA.minZ + Math.random() * (MOTE_AREA.maxZ - MOTE_AREA.minZ);

            this.moteVelocities[i3]     = (Math.random() - 0.5) * 0.25;
            this.moteVelocities[i3 + 1] = 0.08 + Math.random() * 0.18;
            this.moteVelocities[i3 + 2] = (Math.random() - 0.5) * 0.25;

            this.motePhase[i] = Math.random() * Math.PI * 2;
        }

        this.moteGeo = new THREE.BufferGeometry();
        this.moteGeo.setAttribute('position', new THREE.BufferAttribute(this.motePositions, 3));
        this.moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(this.motePhase, 1));

        const moteMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                attribute float aPhase;
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 2.0);
                    vAlpha = twinkle * 0.55;
                    gl_PointSize = max(2.5, 3.5 * (300.0 / -mvPosition.z));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                void main() {
                    vec2 c = gl_PointCoord - vec2(0.5);
                    float d = length(c);
                    if (d > 0.5) discard;
                    float soft = 1.0 - smoothstep(0.15, 0.5, d);
                    gl_FragColor = vec4(vec3(0.95, 1.0, 0.92) * soft, vAlpha * soft);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.motePoints = new THREE.Points(this.moteGeo, moteMat);
        this.motePoints.frustumCulled = false;
        this.scene.add(this.motePoints);
    }

    private tickMotes(dt: number, time: number): void {
        for (let i = 0; i < MOTE_COUNT; i++) {
            const i3 = i * 3;
            const sway = Math.sin(time * 0.8 + this.motePhase[i]) * 0.08;
            this.motePositions[i3]     += (this.moteVelocities[i3] + sway) * dt;
            this.motePositions[i3 + 1] += this.moteVelocities[i3 + 1] * dt;
            this.motePositions[i3 + 2] += (this.moteVelocities[i3 + 2] - sway * 0.5) * dt;

            // Reset when motes drift too high or out of area
            if (this.motePositions[i3 + 1] > MOTE_HEIGHT.max) {
                this.motePositions[i3]     = MOTE_AREA.minX + Math.random() * (MOTE_AREA.maxX - MOTE_AREA.minX);
                this.motePositions[i3 + 1] = MOTE_HEIGHT.min;
                this.motePositions[i3 + 2] = MOTE_AREA.minZ + Math.random() * (MOTE_AREA.maxZ - MOTE_AREA.minZ);
            }
        }
        (this.moteGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.motePoints.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    }

    sync(state: GameState, dt: number): void {
        // ── Spawn particle trails for projectiles ──
        for (const proj of state.projectiles) {
            if (!proj.alive) continue;

            const trailColor = PROJ_COLORS[proj.towerType] ?? PROJ_COLORS.arrow;
            if (
                proj.towerType === 'fire' ||
                proj.towerType === 'poison' ||
                proj.towerType === 'ice' ||
                proj.towerType === 'sniper' ||
                proj.towerType === 'lightning' ||
                proj.towerType === 'arrow_rapid' ||
                Math.random() < 0.28
            ) {
                this.addTrailParticle(proj.x, proj.y !== undefined ? proj.y : 0.8, proj.z, trailColor);
            }
        }

        // ── Update explosion / death particles ──
        let aliveCount = 0;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            // Physics
            p.position.add(p.velocity.clone().multiplyScalar(dt));
            p.velocity.y -= 2.5 * dt; // gravity
            p.velocity.multiplyScalar(0.97); // drag

            const t = p.life / p.maxLife; // 1 → 0
            const i3 = aliveCount * 3;

            this.particlePositions[i3] = p.position.x;
            this.particlePositions[i3 + 1] = Math.max(0.05, p.position.y);
            this.particlePositions[i3 + 2] = p.position.z;

            this.particleColors[i3] = p.color.r;
            this.particleColors[i3 + 1] = p.color.g;
            this.particleColors[i3 + 2] = p.color.b;

            this.particleSizes[aliveCount] = p.size * t;
            this.particleAlphas[aliveCount] = t;
            aliveCount++;
        }

        this.particleGeo.setDrawRange(0, aliveCount);
        (this.particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.particleGeo.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;
        (this.particleGeo.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
        (this.particleGeo.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;

        this.tickMotes(dt, performance.now() * 0.001);
    }

    addExplosion(x: number, z: number, type: TowerType): void {
        const color = new THREE.Color(PROJ_COLORS[type]);
        const count = 16 + Math.floor(Math.random() * 10);

        for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;
            const upSpeed = 1 + Math.random() * 2.5;

            this.particles.push({
                position: new THREE.Vector3(x, 0.3, z),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    upSpeed,
                    Math.sin(angle) * speed
                ),
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.7,
                color: color.clone().offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2),
                size: 0.15 + Math.random() * 0.15,
            });
        }
    }

    addDeathEffect(x: number, z: number, color: number): void {
        const baseColor = new THREE.Color(color);
        const count = 22 + Math.floor(Math.random() * 10);

        for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const upSpeed = 1.5 + Math.random() * 3;

            this.particles.push({
                position: new THREE.Vector3(x, 0.4, z),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    upSpeed,
                    Math.sin(angle) * speed
                ),
                life: 0.5 + Math.random() * 0.4,
                maxLife: 0.9,
                color: baseColor.clone().offsetHSL(Math.random() * 0.15 - 0.075, 0, Math.random() * 0.3 - 0.1),
                size: 0.18 + Math.random() * 0.2,
            });
        }

        // Flash ring particle burst (central bright particles)
        for (let i = 0; i < 5 && this.particles.length < MAX_PARTICLES; i++) {
            this.particles.push({
                position: new THREE.Vector3(x, 0.5, z),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    2 + Math.random(),
                    (Math.random() - 0.5) * 0.5
                ),
                life: 0.3,
                maxLife: 0.3,
                color: new THREE.Color(0xffffff),
                size: 0.3 + Math.random() * 0.2,
            });
        }
    }

    addTrailParticle(x: number, y: number, z: number, color: number): void {
        if (this.particles.length >= MAX_PARTICLES) return;
        const baseColor = new THREE.Color(color);
        this.particles.push({
            position: new THREE.Vector3(x + (Math.random() - 0.5) * 0.1, y + (Math.random() - 0.5) * 0.1, z + (Math.random() - 0.5) * 0.1),
            velocity: new THREE.Vector3(0, Math.random() * 0.5, 0),
            life: 0.2 + Math.random() * 0.2,
            maxLife: 0.4,
            color: baseColor.clone().offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2),
            size: 0.1 + Math.random() * 0.1,
        });
    }

    addBuildEffect(x: number, z: number): void {
        const count = 15;
        const color = new THREE.Color(0x4ade80); // Greenish build color
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;
            const angle = (i / count) * Math.PI * 2;
            const speed = 1.0 + Math.random() * 1.5;
            this.particles.push({
                position: new THREE.Vector3(x, 0.2, z),
                velocity: new THREE.Vector3(Math.cos(angle) * speed, 0.5 + Math.random(), Math.sin(angle) * speed),
                life: 0.4 + Math.random() * 0.2,
                maxLife: 0.6,
                color: color.clone().offsetHSL(0, 0, Math.random() * 0.2),
                size: 0.15 + Math.random() * 0.1,
            });
        }
    }

    /** Short upward burst at tower muzzle when firing. */
    addMuzzleFlash(x: number, z: number, towerType: TowerType): void {
        const baseColor = new THREE.Color(PROJ_COLORS[towerType] ?? PROJ_COLORS.arrow);
        // 1 bright central flash
        if (this.particles.length < MAX_PARTICLES) {
            this.particles.push({
                position: new THREE.Vector3(x, 1.0, z),
                velocity: new THREE.Vector3(0, 0.4, 0),
                life: 0.14,
                maxLife: 0.14,
                color: new THREE.Color(0xffffff),
                size: 0.45,
            });
        }
        // 4-6 spark streaks
        const count = 5;
        for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.4 + Math.random() * 1.2;
            this.particles.push({
                position: new THREE.Vector3(x, 0.9, z),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed * 0.4,
                    1.2 + Math.random() * 0.6,
                    Math.sin(angle) * speed * 0.4
                ),
                life: 0.22 + Math.random() * 0.14,
                maxLife: 0.36,
                color: baseColor.clone().offsetHSL(Math.random() * 0.08 - 0.04, 0, Math.random() * 0.2),
                size: 0.14 + Math.random() * 0.1,
            });
        }
    }

    /** Ground-level ring burst at AOE impact. Uses existing particle pool. */
    addImpactFlash(x: number, z: number, radius: number, towerType: TowerType): void {
        const baseColor = new THREE.Color(PROJ_COLORS[towerType] ?? PROJ_COLORS.cannon);
        // White core flash
        for (let i = 0; i < 3 && this.particles.length < MAX_PARTICLES; i++) {
            this.particles.push({
                position: new THREE.Vector3(x, 0.35, z),
                velocity: new THREE.Vector3(0, 0.6, 0),
                life: 0.16,
                maxLife: 0.16,
                color: new THREE.Color(0xffffff),
                size: 0.5 + radius * 0.1,
            });
        }
        // Radial ring of particles (flat disc, minimal upward velocity)
        const ringCount = Math.min(24, 12 + Math.floor(radius * 4));
        for (let i = 0; i < ringCount && this.particles.length < MAX_PARTICLES; i++) {
            const angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.2;
            const speed = radius * (1.6 + Math.random() * 0.8);
            this.particles.push({
                position: new THREE.Vector3(x, 0.2, z),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    0.4 + Math.random() * 0.5,
                    Math.sin(angle) * speed
                ),
                life: 0.32 + Math.random() * 0.2,
                maxLife: 0.52,
                color: baseColor.clone().offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2),
                size: 0.18 + Math.random() * 0.12,
            });
        }
    }

    addSellEffect(x: number, z: number): void {
        const count = 15;
        const color = new THREE.Color(0xfbbf24); // Golden sell color
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;
            const angle = (i / count) * Math.PI * 2;
            const speed = 1.5 + Math.random() * 2;
            this.particles.push({
                position: new THREE.Vector3(x, 0.5, z),
                velocity: new THREE.Vector3(Math.cos(angle) * speed, 1.5 + Math.random() * 2, Math.sin(angle) * speed),
                life: 0.3 + Math.random() * 0.2,
                maxLife: 0.5,
                color: color.clone().offsetHSL(0.05 * Math.random(), 0, Math.random() * 0.2),
                size: 0.15 + Math.random() * 0.15,
            });
        }
    }
}
