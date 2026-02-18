import * as THREE from 'three';
import { MAP } from '../core/config';

/* ── Constants ─────────────────────────────── */
const DEFAULT_FRUSTUM = 10;
const MIN_FRUSTUM = 4;          // max zoom in
const MAX_FRUSTUM = 22;         // max zoom out
const DEFAULT_TILT = 40;        // degrees
const DEFAULT_YAW = 35;         // degrees
const DIST = 20;                // camera distance from lookAt target

/* ── Camera controller ─────────────────────── */
export class CameraController {
    cam: THREE.OrthographicCamera;
    private frustum = DEFAULT_FRUSTUM;
    private tilt = DEFAULT_TILT * Math.PI / 180;
    private yaw = DEFAULT_YAW * Math.PI / 180;

    // map center (lookAt target)
    private cx: number;
    private cz: number;

    // touch state
    private lastPinchDist = 0;
    private lastRotAngle = 0;
    private isTwoFinger = false;

    constructor() {
        const aspect = window.innerWidth / window.innerHeight;

        this.cam = new THREE.OrthographicCamera(
            -this.frustum * aspect, this.frustum * aspect,
            this.frustum, -this.frustum,
            0.1, 100
        );

        this.cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        this.cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;
        this.applyTransform();
    }

    /* ── Public API ── */

    /** Is a two-finger gesture active? (used to suppress tap-to-build) */
    get twoFingerActive(): boolean { return this.isTwoFinger; }

    /** Call from wheel event */
    zoom(delta: number): void {
        this.frustum = clamp(this.frustum + delta * 0.01, MIN_FRUSTUM, MAX_FRUSTUM);
        this.rebuildProjection();
        this.applyTransform();
    }

    /** Handle window resize */
    resize(renderer: THREE.WebGLRenderer): void {
        this.rebuildProjection();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /* ── Touch handlers (attach these to canvas) ── */

    onTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 2) {
            this.isTwoFinger = true;
            this.lastPinchDist = touchDist(e);
            this.lastRotAngle = touchAngle(e);
        }
    };

    onTouchMove = (e: TouchEvent): void => {
        if (e.touches.length !== 2) return;
        e.preventDefault();      // block scroll / native zoom while pinching
        this.isTwoFinger = true;

        // ── Pinch zoom ──
        const dist = touchDist(e);
        if (this.lastPinchDist > 0) {
            const scale = this.lastPinchDist / dist;  // >1 = spread = zoom in
            this.frustum = clamp(this.frustum * scale, MIN_FRUSTUM, MAX_FRUSTUM);
            this.rebuildProjection();
        }
        this.lastPinchDist = dist;

        // ── Rotation ──
        const angle = touchAngle(e);
        if (this.lastRotAngle !== 0) {
            const dAngle = angle - this.lastRotAngle;
            this.yaw += dAngle;
        }
        this.lastRotAngle = angle;

        this.applyTransform();
    };

    onTouchEnd = (e: TouchEvent): void => {
        if (e.touches.length < 2) {
            this.lastPinchDist = 0;
            this.lastRotAngle = 0;
            // Delay reset so a lingering touchend doesn't trigger click
            setTimeout(() => { this.isTwoFinger = false; }, 100);
        }
    };

    /* ── Private ── */

    private rebuildProjection(): void {
        const aspect = window.innerWidth / window.innerHeight;
        this.cam.left = -this.frustum * aspect;
        this.cam.right = this.frustum * aspect;
        this.cam.top = this.frustum;
        this.cam.bottom = -this.frustum;
        this.cam.updateProjectionMatrix();
    }

    private applyTransform(): void {
        this.cam.position.set(
            this.cx + DIST * Math.sin(this.yaw) * Math.cos(this.tilt),
            DIST * Math.sin(this.tilt),
            this.cz + DIST * Math.cos(this.yaw) * Math.cos(this.tilt)
        );
        this.cam.lookAt(this.cx, 0, this.cz);
    }
}

/* ── Helpers ── */
function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

function touchDist(e: TouchEvent): number {
    const a = e.touches[0], b = e.touches[1];
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function touchAngle(e: TouchEvent): number {
    const a = e.touches[0], b = e.touches[1];
    return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
}

/* ── Legacy exports (kept for backward compat, used nowhere now) ── */
export function createCamera(): THREE.OrthographicCamera {
    return new CameraController().cam;
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
