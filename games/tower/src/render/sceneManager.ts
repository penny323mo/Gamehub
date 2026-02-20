import * as THREE from 'three';
import { MAP } from '../core/config';
import { cellToWorld } from '../core/path';

// ─── Colors ───
const COLOR_BUILDABLE = 0x4a7c59;
const COLOR_PATH = 0xc9a96e;
const COLOR_GRID_LINE = 0x3a6a49;
const COLOR_SPAWN = 0x5599ff;
const COLOR_GOAL = 0xff5555;

export class SceneManager {
    scene: THREE.Scene;
    groundMeshes: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a2a1a);
    }

    buildGround(): void {
        const { cols, rows, cellSize, origin } = MAP;
        const pathCells = new Set<string>();
        for (const [c, r] of MAP.path) {
            pathCells.add(`${c},${r}`);
        }

        const spawnKey = `${MAP.spawnCell[0]},${MAP.spawnCell[1]}`;
        const goalKey = `${MAP.goalCell[0]},${MAP.goalCell[1]}`;

        const geo = new THREE.BoxGeometry(cellSize * 0.96, 0.15, cellSize * 0.96);

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const key = `${c},${r}`;
                let color = COLOR_BUILDABLE;
                let emissive = 0x000000;
                let emissiveIntensity = 0;

                if (key === spawnKey) {
                    color = COLOR_SPAWN;
                    emissive = COLOR_SPAWN;
                    emissiveIntensity = 0.4;
                }
                else if (key === goalKey) {
                    color = COLOR_GOAL;
                    emissive = COLOR_GOAL;
                    emissiveIntensity = 0.4;
                }
                else if (pathCells.has(key)) {
                    color = COLOR_PATH;
                    emissive = 0x554422;
                    emissiveIntensity = 0.15;
                }

                const mat = new THREE.MeshStandardMaterial({
                    color,
                    emissive,
                    emissiveIntensity,
                    roughness: 0.8,
                    metalness: 0.1,
                });

                if (color === COLOR_BUILDABLE) {
                    mat.onBeforeCompile = (shader) => {
                        shader.vertexShader = shader.vertexShader.replace(
                            '#include <common>',
                            `#include <common>
                            // Simple 2D noise
                            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                            float snoise(vec2 v) {
                              const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                              vec2 i  = floor(v + dot(v, C.yy) );
                              vec2 x0 = v -   i + dot(i, C.xx);
                              vec2 i1;
                              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                              vec4 x12 = x0.xyxy + C.xxzz;
                              x12.xy -= i1;
                              i = mod289(i);
                              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                              vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                              m = m*m;
                              m = m*m;
                              vec3 x = 2.0 * fract(p * C.www) - 1.0;
                              vec3 h = abs(x) - 0.5;
                              vec3 ox = floor(x + 0.5);
                              vec3 a0 = x - ox;
                              m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                              vec3 g;
                              g.x  = a0.x  * x0.x  + h.x  * x0.y;
                              g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                              return 130.0 * dot(m, g);
                            }
                            `
                        );
                        shader.vertexShader = shader.vertexShader.replace(
                            '#include <begin_vertex>',
                            `#include <begin_vertex>
                             // Add slight height variation based on world position
                             vec4 worldPositionForNoise = modelMatrix * vec4(transformed, 1.0);
                             float noiseVal = snoise(worldPositionForNoise.xz * 2.0) * 0.05;
                             // Only perturb top face
                             if (normal.y > 0.5) {
                                transformed.y += noiseVal;
                             }
                            `
                        );
                        shader.fragmentShader = shader.fragmentShader.replace(
                            '#include <common>',
                            `#include <common>
                            // Pass noise to fragment if wanted
                            `
                        );
                        shader.fragmentShader = shader.fragmentShader.replace(
                            '#include <color_fragment>',
                            `#include <color_fragment>
                            // Slightly vary color
                            `
                        );
                    };
                }

                const mesh = new THREE.Mesh(geo, mat);
                const pos = cellToWorld(c, r);
                mesh.position.set(pos.x, -0.075, pos.z);
                mesh.receiveShadow = true;
                mesh.userData = { col: c, row: r, type: 'ground' };
                this.scene.add(mesh);
                this.groundMeshes.push(mesh);
            }
        }

        // Grid base plane (slightly below tiles for gap effect)
        const baseGeo = new THREE.PlaneGeometry(cols * cellSize + 1, rows * cellSize + 1);
        const baseMat = new THREE.MeshStandardMaterial({
            color: COLOR_GRID_LINE,
            roughness: 0.9,
            metalness: 0,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.rotation.x = -Math.PI / 2;
        base.position.set(
            origin.x + cols * cellSize / 2,
            -0.2,
            origin.z + rows * cellSize / 2
        );
        base.receiveShadow = true;
        this.scene.add(base);
    }
}
