import * as THREE from 'three';
import { MAP, GRAPHICS } from '../core/config';
import { cellToWorld } from '../core/path';

const COLOR_BUILDABLE = 0x43774a;
const COLOR_PATH = 0xb68856;
const COLOR_GRID_LINE = 0x31573a;
const COLOR_SPAWN = 0x63c8ff;
const COLOR_GOAL = 0xff6e56;

export class SceneManager {
    scene: THREE.Scene;
    groundMeshes: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x123122);
    }

    buildGround(): void {
        const { cols, rows, cellSize, origin } = MAP;
        const pathCells = new Set<string>(MAP.path.map(([c, r]) => `${c},${r}`));
        const spawnKey = `${MAP.spawnCell[0]},${MAP.spawnCell[1]}`;
        const goalKey = `${MAP.goalCell[0]},${MAP.goalCell[1]}`;

        this.buildSkyDome();
        this.buildTerrainUnderlay();

        const geo = new THREE.BoxGeometry(cellSize * 0.96, 0.16, cellSize * 0.96);

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const key = `${c},${r}`;
                let color = COLOR_BUILDABLE;
                let emissive = 0x000000;
                let emissiveIntensity = 0;
                let roughness = 0.9;
                let metalness = 0.04;

                if (key === spawnKey) {
                    color = COLOR_SPAWN;
                    emissive = 0x2f91c7;
                    emissiveIntensity = 0.5;
                    roughness = 0.45;
                } else if (key === goalKey) {
                    color = COLOR_GOAL;
                    emissive = 0xa93d33;
                    emissiveIntensity = 0.45;
                    roughness = 0.45;
                } else if (pathCells.has(key)) {
                    color = COLOR_PATH;
                    emissive = 0x5e4423;
                    emissiveIntensity = 0.24;
                    roughness = 0.68;
                }

                const material = GRAPHICS.isMobile
                    ? new THREE.MeshLambertMaterial({ color, emissive })
                    : new THREE.MeshStandardMaterial({
                        color,
                        emissive,
                        emissiveIntensity,
                        roughness,
                        metalness,
                    });

                const mesh = new THREE.Mesh(geo, material);
                const pos = cellToWorld(c, r);
                mesh.position.set(pos.x, -0.08, pos.z);
                mesh.receiveShadow = true;
                mesh.userData = { col: c, row: r, type: 'ground' };
                this.scene.add(mesh);
                this.groundMeshes.push(mesh);
            }
        }

        const boardGeo = new THREE.BoxGeometry(cols * cellSize + 0.9, 0.34, rows * cellSize + 0.9);
        const boardMat = GRAPHICS.isMobile
            ? new THREE.MeshBasicMaterial({ color: 0x17311d })
            : new THREE.MeshStandardMaterial({
                color: 0x17311d,
                roughness: 0.95,
                metalness: 0.02,
            });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(
            origin.x + cols * cellSize / 2,
            -0.25,
            origin.z + rows * cellSize / 2
        );
        board.receiveShadow = true;
        this.scene.add(board);

        this.buildBoardFrame(board.position);
        this.buildPathRibbon();
        this.buildScenery();
        this.buildDistantSilhouettes();
    }

    private buildSkyDome(): void {
        const seg = GRAPHICS.isMobile ? 8 : 24;
        const skyGeo = new THREE.SphereGeometry(80, seg, seg);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: {
                topColor: { value: new THREE.Color(0x1e4a35) },
                midColor: { value: new THREE.Color(0x255a42) },
                bottomColor: { value: new THREE.Color(0x446238) },
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
                    vec3 color = mix(bottomColor, midColor, smoothstep(0.05, 0.45, h));
                    color = mix(color, topColor, smoothstep(0.5, 1.0, h));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
        });
        this.scene.add(new THREE.Mesh(skyGeo, skyMat));
    }

    private buildTerrainUnderlay(): void {
        const width = MAP.cols + GRAPHICS.terrain.underlayPadding * 2;
        const depth = MAP.rows + GRAPHICS.terrain.underlayPadding * 2;
        const segments = GRAPHICS.terrain.underlaySegments;
        const terrainGeo = new THREE.PlaneGeometry(width, depth, segments, segments);
        terrainGeo.rotateX(-Math.PI / 2);

        const positions = terrainGeo.attributes.position as THREE.BufferAttribute;
        const colors = new Float32Array(positions.count * 3);
        const centerX = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        const centerZ = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i) + centerX;
            const z = positions.getZ(i) + centerZ;

            const boardDx = Math.max(0, Math.abs(x - centerX) - MAP.cols * 0.52);
            const boardDz = Math.max(0, Math.abs(z - centerZ) - MAP.rows * 0.52);
            const edgeDistance = Math.sqrt(boardDx * boardDx + boardDz * boardDz);
            const envelope = THREE.MathUtils.smoothstep(edgeDistance, 0.25, GRAPHICS.terrain.underlayPadding);

            const waveA = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.16;
            const waveB = Math.sin((x + z) * 0.11) * 0.12;
            const height = (waveA + waveB) * envelope - 0.58;
            positions.setY(i, height);

            const shade = THREE.MathUtils.clamp(0.42 + envelope * 0.22 + height * 0.12, 0, 1);
            const low = new THREE.Color(0x1b3320);
            const high = new THREE.Color(0x4f7744);
            const color = low.lerp(high, shade);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        terrainGeo.computeVertexNormals();

        const terrainMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ vertexColors: true })
            : new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.98,
                metalness: 0.01,
            });

        const terrain = new THREE.Mesh(terrainGeo, terrainMat);
        terrain.receiveShadow = true;
        this.scene.add(terrain);
    }

    private buildBoardFrame(boardPosition: THREE.Vector3): void {
        const frameGeo = new THREE.BoxGeometry(MAP.cols + 1.35, 0.2, MAP.rows + 1.35);
        const frameMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x0d1b11 })
            : new THREE.MeshStandardMaterial({ color: 0x0d1b11, roughness: 0.75, metalness: 0.18 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.copy(boardPosition);
        frame.position.y = -0.34;
        frame.receiveShadow = true;
        this.scene.add(frame);
    }

    private buildPathRibbon(): void {
        const points = MAP.path.map(([c, r]) => {
            const pos = cellToWorld(c, r);
            return new THREE.Vector3(pos.x, 0.01, pos.z);
        });

        const shoulderMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x59422a })
            : new THREE.MeshStandardMaterial({ color: 0x59422a, roughness: 0.95, metalness: 0.02 });
        const roadMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0xb78b56 })
            : new THREE.MeshStandardMaterial({ color: 0xb78b56, roughness: 0.88, metalness: 0.02 });
        const stripeMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0xe2c08a, emissive: 0x453318 })
            : new THREE.MeshStandardMaterial({ color: 0xe2c08a, roughness: 0.7, metalness: 0.04, emissive: 0x453318, emissiveIntensity: 0.06 });

        for (let i = 0; i < points.length - 1; i++) {
            const from = points[i];
            const to = points[i + 1];
            const dx = to.x - from.x;
            const dz = to.z - from.z;
            const length = Math.sqrt(dx * dx + dz * dz) + 0.12;
            const angle = Math.atan2(dx, dz);
            const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

            this.addRoadSegment(mid, length, 0.86, 0.05, -0.005, angle, shoulderMat);
            this.addRoadSegment(mid, length, 0.64, 0.04, 0.015, angle, roadMat);
            this.addRoadSegment(mid, length * 0.88, 0.12, 0.02, 0.04, angle, stripeMat);
        }

        for (const point of points) {
            const shoulderCap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.43, 0.43, 0.05, 18),
                shoulderMat
            );
            shoulderCap.position.copy(point);
            shoulderCap.position.y = -0.005;
            shoulderCap.receiveShadow = true;
            this.scene.add(shoulderCap);

            const roadCap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 0.04, 18),
                roadMat
            );
            roadCap.position.copy(point);
            roadCap.position.y = 0.015;
            roadCap.receiveShadow = true;
            this.scene.add(roadCap);
        }
    }

    private addRoadSegment(
        mid: THREE.Vector3,
        length: number,
        width: number,
        height: number,
        y: number,
        angle: number,
        material: THREE.Material
    ): void {
        const segment = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), material);
        segment.position.copy(mid);
        segment.position.y = y;
        segment.rotation.y = angle;
        segment.receiveShadow = true;
        this.scene.add(segment);
    }

    private buildScenery(): void {
        const { cols, rows, cellSize } = MAP;
        const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.36, 6);
        const leavesGeo = new THREE.ConeGeometry(0.32, 0.9, 7);
        const rockGeo = new THREE.DodecahedronGeometry(0.18, 0);

        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x473425 });
        const leavesPalette = [0x274d27, 0x1e3e21, 0x365c34, 0x204427];
        const rockPalette = [0x3f4b3b, 0x4b5646, 0x303c31];

        const borderSize = GRAPHICS.isMobile ? 5 : 9;
        const treeDensity  = GRAPHICS.isMobile ? 0.18 : 0.34;
        const rockDensity  = GRAPHICS.isMobile ? 0    : 0.12;

        for (let c = -borderSize; c < cols + borderSize; c++) {
            for (let r = -borderSize; r < rows + borderSize; r++) {
                if (c >= -1 && c <= cols && r >= -1 && r <= rows) continue;

                const pos = cellToWorld(c, r);
                const xOff = (Math.random() - 0.5) * cellSize * 0.9;
                const zOff = (Math.random() - 0.5) * cellSize * 0.9;

                if (Math.random() < treeDensity) {
                    const scale = 0.75 + Math.random() * 0.8;
                    const tree = new THREE.Group();
                    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                    const leaves = new THREE.Mesh(
                        leavesGeo,
                        new THREE.MeshLambertMaterial({ color: leavesPalette[(c + r + 16) % leavesPalette.length] })
                    );
                    trunk.position.y = 0.18 * scale;
                    leaves.position.y = 0.75 * scale;
                    trunk.scale.setScalar(scale);
                    leaves.scale.setScalar(scale);
                    tree.add(trunk);
                    tree.add(leaves);
                    tree.position.set(pos.x + xOff, 0, pos.z + zOff);
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    tree.traverse((child) => {
                        if (child instanceof THREE.Mesh && GRAPHICS.enableShadows) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    this.scene.add(tree);
                } else if (rockDensity > 0 && Math.random() < rockDensity) {
                    const rock = new THREE.Mesh(
                        rockGeo,
                        new THREE.MeshLambertMaterial({ color: rockPalette[(c * 3 + r + 9) % rockPalette.length] })
                    );
                    rock.scale.setScalar(0.8 + Math.random() * 1.4);
                    rock.position.set(pos.x + xOff, -0.15, pos.z + zOff);
                    rock.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
                    rock.castShadow = GRAPHICS.enableShadows;
                    rock.receiveShadow = true;
                    this.scene.add(rock);
                }
            }
        }
    }

    private buildDistantSilhouettes(): void {
        const ridgeGeo = new THREE.ConeGeometry(2.8, 6.5, 4);
        const ridgeMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x102318 })
            : new THREE.MeshStandardMaterial({ color: 0x102318, roughness: 0.95, metalness: 0.01 });
        const radiusX = MAP.cols * 0.75;
        const radiusZ = MAP.rows * 0.95;
        const centerX = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        const centerZ = MAP.origin.z + MAP.rows * MAP.cellSize / 2;
        const count = GRAPHICS.isMobile ? 8 : 18;

        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
            ridge.position.set(
                centerX + Math.cos(t) * (radiusX + 10 + Math.random() * 5),
                1.8 + Math.random() * 0.9,
                centerZ + Math.sin(t) * (radiusZ + 10 + Math.random() * 5)
            );
            ridge.scale.setScalar(0.8 + Math.random() * 1.2);
            ridge.rotation.y = Math.random() * Math.PI * 2;
            ridge.castShadow = false;
            ridge.receiveShadow = true;
            this.scene.add(ridge);
        }
    }
}
