import * as THREE from 'three';
import { MAP } from '../core/config';

export function createCamera(): THREE.OrthographicCamera {
    const aspect = window.innerWidth / window.innerHeight;
    const frustum = 10;

    const cam = new THREE.OrthographicCamera(
        -frustum * aspect, frustum * aspect,
        frustum, -frustum,
        0.1, 100
    );

    // Isometric-ish angle
    const dist = 20;
    const tilt = 40 * Math.PI / 180;  // ~40°
    const yaw = 35 * Math.PI / 180;   // ~35°

    const cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
    const cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

    cam.position.set(
        cx + dist * Math.sin(yaw) * Math.cos(tilt),
        dist * Math.sin(tilt),
        cz + dist * Math.cos(yaw) * Math.cos(tilt)
    );
    cam.lookAt(cx, 0, cz);

    return cam;
}

export function handleResize(cam: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer): void {
    const aspect = window.innerWidth / window.innerHeight;
    const frustum = 10;

    cam.left = -frustum * aspect;
    cam.right = frustum * aspect;
    cam.top = frustum;
    cam.bottom = -frustum;
    cam.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
