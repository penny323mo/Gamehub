import * as THREE from 'three';
import type { GameState, TowerType } from '../core/types';

const PROJ_COLORS: Record<TowerType, number> = {
    arrow: 0xffdd44,
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

const MAX_PARTICLES = 800;
const MAX_PROJECTILES = 100;

export class FxRenderer {
    private scene: THREE.Scene;

    // ── Projectile trail system ──
    private projGeo: THREE.BufferGeometry;
    private projPositions: Float32Array;
    private projColors: Float32Array;
    private projSizes: Float32Array;
    private projPoints: THREE.Points;

    // ── Explosion / death particle system ──
    private particles: Particle[] = [];
    private particleGeo: THREE.BufferGeometry;
    private particlePositions: Float32Array;
    private particleColors: Float32Array;
    private particleSizes: Float32Array;
    private particleAlphas: Float32Array;
    private particlePoints: THREE.Points;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // ── Projectiles ──
        this.projPositions = new Float32Array(MAX_PROJECTILES * 3);
        this.projColors = new Float32Array(MAX_PROJECTILES * 3);
        this.projSizes = new Float32Array(MAX_PROJECTILES);

        this.projGeo = new THREE.BufferGeometry();
        this.projGeo.setAttribute('position', new THREE.BufferAttribute(this.projPositions, 3));
        this.projGeo.setAttribute('color', new THREE.BufferAttribute(this.projColors, 3));
        this.projGeo.setAttribute('size', new THREE.BufferAttribute(this.projSizes, 1));

        const projMat = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    gl_FragColor = vec4(vColor, 1.0 - (dist * 2.0));
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });
        this.projPoints = new THREE.Points(this.projGeo, projMat);
        scene.add(this.projPoints);

        // ── Explosion / death particles ──
        this.particlePositions = new Float32Array(MAX_PARTICLES * 3);
        this.particleColors = new Float32Array(MAX_PARTICLES * 3);
        this.particleSizes = new Float32Array(MAX_PARTICLES);
        this.particleAlphas = new Float32Array(MAX_PARTICLES);

        this.particleGeo = new THREE.BufferGeometry();
        this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
        this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
        this.particleGeo.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));

        this.particleGeo.setAttribute('alpha', new THREE.BufferAttribute(this.particleAlphas, 1));

        const particleMat = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    gl_FragColor = vec4(vColor, vAlpha * (1.0 - (dist * 2.0)));
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });
        this.particlePoints = new THREE.Points(this.particleGeo, particleMat);
        scene.add(this.particlePoints);
    }

    sync(state: GameState, dt: number): void {
        // ── Update projectile positions ──
        let projCount = 0;
        const tmpColor = new THREE.Color();

        for (const proj of state.projectiles) {
            if (!proj.alive || projCount >= MAX_PROJECTILES) continue;
            const i3 = projCount * 3;

            this.projPositions[i3] = proj.x;
            this.projPositions[i3 + 1] = 0.5;
            this.projPositions[i3 + 2] = proj.z;

            tmpColor.set(PROJ_COLORS[proj.towerType]);
            this.projColors[i3] = tmpColor.r;
            this.projColors[i3 + 1] = tmpColor.g;
            this.projColors[i3 + 2] = tmpColor.b;

            this.projSizes[projCount] = 0.25;
            projCount++;
        }

        this.projGeo.setDrawRange(0, projCount);
        (this.projGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.projGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;

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
        (this.particleGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
        (this.particleGeo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    }

    addExplosion(x: number, z: number, type: TowerType): void {
        const color = new THREE.Color(PROJ_COLORS[type]);
        const count = 12 + Math.floor(Math.random() * 8);

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
        const count = 18 + Math.floor(Math.random() * 8);

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
}
