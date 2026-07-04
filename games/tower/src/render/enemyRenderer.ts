import * as THREE from 'three';
import type { GameState, EnemyType, Enemy } from '../core/types';
import { GRAPHICS } from '../core/config';

/**
 * Per-part animation output — offsets are applied on top of the part's static
 * offset/rotation, `s` is a uniform scale multiplier.
 */
interface AnimResult {
    ox: number; oy: number; oz: number;
    rx: number; ry: number; rz: number;
    s: number;
}

type AnimFn = (out: AnimResult, time: number, phase: number) => void;

interface EnemyPartDef {
    geo: THREE.BufferGeometry;
    mat: THREE.Material;
    offset: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
    /** Decorative part — skipped on mobile to save draw calls. */
    desktopOnly?: boolean;
    anim?: AnimFn;
}

// ─── Reusable anim helpers ───────────────────────────────────────────────────
const walkBob = (amp: number, speed = 10): AnimFn => (out, t, ph) => {
    out.oy += Math.abs(Math.sin(t * speed + ph)) * amp;
};
const hover = (amp: number, speed: number): AnimFn => (out, t, ph) => {
    out.oy += Math.sin(t * speed + ph) * amp;
};
/** Limb swing around its pivot (rotation.x), forward/back relative to facing. */
const swing = (speed: number, amp: number, offset = 0, bobAmp = 0, bobSpeed = 10): AnimFn => (out, t, ph) => {
    out.rx += Math.sin(t * speed + ph + offset) * amp;
    if (bobAmp > 0) out.oy += Math.abs(Math.sin(t * bobSpeed + ph)) * bobAmp;
};

/**
 * Capsule limb whose pivot sits at the top (hip/shoulder joint) so a
 * rotation.x swing reads as a walking limb, not a spinning stick.
 */
function limbGeo(r: number, len: number): THREE.BufferGeometry {
    const g = new THREE.CapsuleGeometry(r, len, 3, 6);
    g.translate(0, -len / 2, 0);
    return g;
}

/** Per-type display metadata: HP-bar height & ground shadow size. */
export const ENEMY_META: Record<EnemyType, { barY: number; shadowScale: number }> = {
    grunt:  { barY: 0.95, shadowScale: 1.0 },
    tank:   { barY: 1.05, shadowScale: 1.55 },
    runner: { barY: 0.9,  shadowScale: 0.95 },
    swarm:  { barY: 0.72, shadowScale: 0.65 },
    shield: { barY: 1.1,  shadowScale: 1.1 },
    healer: { barY: 1.15, shadowScale: 1.0 },
    boss:   { barY: 2.1,  shadowScale: 1.95 },
};

function buildEnemyConfigs(): Record<EnemyType, EnemyPartDef[]> {
    const configs: Record<EnemyType, EnemyPartDef[]> = {} as Record<EnemyType, EnemyPartDef[]>;

    const std = (opts: Record<string, unknown>): THREE.Material => {
        if (GRAPHICS.isMobile) {
            const { roughness: _r, metalness: _m, flatShading: _f, ...rest } = opts;
            return new THREE.MeshLambertMaterial(rest as THREE.MeshLambertMaterialParameters);
        }
        return new THREE.MeshStandardMaterial(opts as THREE.MeshStandardMaterialParameters);
    };

    // Size hierarchy (world units, head height):
    //   swarm ~0.45 < grunt ~0.7 < runner ~0.75 < shield ~0.85 < healer ~0.9 < tank ~0.6 wide < boss ~1.9

    // ─── Grunt: goblin footsoldier — pointy ears, red eyes, club, marching gait ───
    {
        const skin = std({ color: 0x7fa03a, roughness: 0.75, flatShading: true });
        const skinDark = std({ color: 0x5c7a28, roughness: 0.8 });
        const cloth = std({ color: 0x6b4a2b, roughness: 0.9 });
        const eye = std({ color: 0x330000, emissive: 0xff3322, emissiveIntensity: 1.0 });
        const bob = walkBob(0.03, 11);
        const legL = limbGeo(0.038, 0.13);
        const legR = limbGeo(0.038, 0.13);
        const armL = limbGeo(0.03, 0.12);
        const armR = limbGeo(0.03, 0.12);
        const earGeo = new THREE.ConeGeometry(0.038, 0.15, 4);
        configs.grunt = [
            // Torso with loincloth
            { geo: new THREE.CapsuleGeometry(0.105, 0.13, 4, 8), mat: skin, offset: new THREE.Vector3(0, 0.36, 0), anim: bob },
            { geo: new THREE.CylinderGeometry(0.115, 0.09, 0.1, 7), mat: cloth, offset: new THREE.Vector3(0, 0.28, 0), anim: bob },
            // Head + snout
            { geo: new THREE.SphereGeometry(0.115, 9, 8), mat: skin, offset: new THREE.Vector3(0, 0.58, 0.03), anim: bob },
            { geo: new THREE.ConeGeometry(0.035, 0.09, 5), mat: skinDark, offset: new THREE.Vector3(0, 0.55, 0.13), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: bob, desktopOnly: true },
            // Pointy ears, swept outward
            { geo: earGeo, mat: skinDark, offset: new THREE.Vector3(0.115, 0.63, 0.0), rotation: new THREE.Euler(0, 0, -2.0), anim: bob },
            { geo: earGeo, mat: skinDark, offset: new THREE.Vector3(-0.115, 0.63, 0.0), rotation: new THREE.Euler(0, 0, 2.0), anim: bob },
            // Glowing eyes
            { geo: new THREE.SphereGeometry(0.024, 5, 5), mat: eye, offset: new THREE.Vector3(0.048, 0.6, 0.125), anim: bob, desktopOnly: true },
            { geo: new THREE.SphereGeometry(0.024, 5, 5), mat: eye, offset: new THREE.Vector3(-0.048, 0.6, 0.125), anim: bob, desktopOnly: true },
            // Legs — opposite swing
            { geo: legL, mat: skinDark, offset: new THREE.Vector3(0.058, 0.26, 0), anim: swing(11, 0.75) },
            { geo: legR, mat: skinDark, offset: new THREE.Vector3(-0.058, 0.26, 0), anim: swing(11, 0.75, Math.PI) },
            // Arms — counter-swing to legs
            { geo: armL, mat: skin, offset: new THREE.Vector3(0.13, 0.47, 0), anim: swing(11, 0.55, Math.PI, 0.03, 11) },
            { geo: armR, mat: skin, offset: new THREE.Vector3(-0.13, 0.47, 0), anim: swing(11, 0.55, 0, 0.03, 11) },
            // Club carried in the right hand — swings with the arm
            {
                geo: (() => { const g = new THREE.CylinderGeometry(0.045, 0.028, 0.2, 6); g.translate(0, -0.26, 0.04); return g; })(),
                mat: cloth, offset: new THREE.Vector3(-0.13, 0.47, 0), anim: swing(11, 0.55, 0, 0.03, 11), desktopOnly: true,
            },
        ];
    }

    // ─── Tank: siege tortoise — spiked shell, four stomping legs, jutting head, tail ───
    {
        const shellMat = std({ color: 0x8a3fc0, roughness: 0.85, metalness: 0.2, flatShading: true });
        const plateMat = std({ color: 0x531f78, roughness: 0.6, metalness: 0.4 });
        const hideMat = std({ color: 0xb07acb, roughness: 0.8 });
        const sway: AnimFn = (out, t, ph) => {
            out.rz += Math.sin(t * 5 + ph) * 0.04;
            out.oy += Math.abs(Math.sin(t * 5 + ph)) * 0.02;
        };
        const legGeo = () => limbGeo(0.055, 0.1);
        const spikeGeo = new THREE.ConeGeometry(0.055, 0.16, 5);
        configs.tank = [
            // Shell
            {
                geo: new THREE.SphereGeometry(0.32, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                mat: shellMat, offset: new THREE.Vector3(0, 0.28, 0),
                scale: new THREE.Vector3(1, 0.66, 1.25), anim: sway,
            },
            // Armored rim skirt
            {
                geo: new THREE.TorusGeometry(0.3, 0.05, 6, 14), mat: plateMat,
                offset: new THREE.Vector3(0, 0.26, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                scale: new THREE.Vector3(1, 1.22, 1), anim: sway,
            },
            // Spine spikes
            { geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.5, 0), anim: sway },
            { geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.44, -0.2), rotation: new THREE.Euler(-0.55, 0, 0), anim: sway, desktopOnly: true },
            { geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.44, 0.2), rotation: new THREE.Euler(0.55, 0, 0), anim: sway, desktopOnly: true },
            // Head jutting forward on a thick neck, nodding with the gait
            {
                geo: new THREE.SphereGeometry(0.135, 9, 8), mat: hideMat, offset: new THREE.Vector3(0, 0.24, 0.44),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 5 + ph) * 0.02; out.rx += Math.sin(t * 5 + ph) * 0.06; },
            },
            // Four legs — diagonal pairs alternate (real quadruped gait)
            { geo: legGeo(), mat: hideMat, offset: new THREE.Vector3(0.21, 0.2, 0.19), anim: swing(5, 0.5) },
            { geo: legGeo(), mat: hideMat, offset: new THREE.Vector3(-0.21, 0.2, -0.19), anim: swing(5, 0.5) },
            { geo: legGeo(), mat: hideMat, offset: new THREE.Vector3(-0.21, 0.2, 0.19), anim: swing(5, 0.5, Math.PI) },
            { geo: legGeo(), mat: hideMat, offset: new THREE.Vector3(0.21, 0.2, -0.19), anim: swing(5, 0.5, Math.PI) },
            // Stubby tail
            {
                geo: new THREE.ConeGeometry(0.05, 0.16, 5), mat: hideMat, offset: new THREE.Vector3(0, 0.22, -0.42),
                rotation: new THREE.Euler(-Math.PI / 2.4, 0, 0),
                anim: (out, t, ph) => { out.rz += Math.sin(t * 4 + ph) * 0.2; }, desktopOnly: true,
            },
        ];
    }

    // ─── Runner: raptor — horizontal body, sprinting legs, whipping tail, head crest ───
    {
        const hide = std({ color: 0x2fbf4e, roughness: 0.5, flatShading: true });
        const hideDark = std({ color: 0x1d8f36, roughness: 0.55 });
        const eye = std({ color: 0x111100, emissive: 0xffee44, emissiveIntensity: 0.9 });
        const gallop: AnimFn = (out, t, ph) => {
            out.oy += Math.abs(Math.sin(t * 15 + ph)) * 0.05;
            out.rx += Math.sin(t * 15 + ph) * 0.05;
        };
        configs.runner = [
            // Horizontal body, leaning into the run
            {
                geo: new THREE.CapsuleGeometry(0.09, 0.24, 4, 8), mat: hide,
                offset: new THREE.Vector3(0, 0.34, 0), rotation: new THREE.Euler(Math.PI / 2 - 0.12, 0, 0), anim: gallop,
            },
            // Neck + head raised at the front
            { geo: new THREE.SphereGeometry(0.075, 8, 7), mat: hide, offset: new THREE.Vector3(0, 0.5, 0.22), anim: gallop },
            { geo: new THREE.ConeGeometry(0.045, 0.14, 5), mat: hideDark, offset: new THREE.Vector3(0, 0.48, 0.32), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: gallop },
            // Eyes
            { geo: new THREE.SphereGeometry(0.02, 5, 5), mat: eye, offset: new THREE.Vector3(0.045, 0.52, 0.26), anim: gallop, desktopOnly: true },
            { geo: new THREE.SphereGeometry(0.02, 5, 5), mat: eye, offset: new THREE.Vector3(-0.045, 0.52, 0.26), anim: gallop, desktopOnly: true },
            // Head crest fin
            {
                geo: new THREE.ConeGeometry(0.05, 0.16, 4), mat: hideDark,
                offset: new THREE.Vector3(0, 0.58, 0.16), rotation: new THREE.Euler(-0.6, 0, 0), anim: gallop, desktopOnly: true,
            },
            // Long balancing tail, whipping side to side
            {
                geo: (() => { const g = new THREE.ConeGeometry(0.055, 0.4, 6); g.translate(0, 0.2, 0); return g; })(),
                mat: hideDark, offset: new THREE.Vector3(0, 0.36, -0.14),
                rotation: new THREE.Euler(-Math.PI / 2 - 0.25, 0, 0),
                anim: (out, t, ph) => { out.rz += Math.sin(t * 9 + ph) * 0.25; out.oy += Math.abs(Math.sin(t * 15 + ph)) * 0.04; },
            },
            // Sprinting legs — big stride, opposite phase
            { geo: limbGeo(0.04, 0.17), mat: hideDark, offset: new THREE.Vector3(0.075, 0.32, 0.02), anim: swing(15, 1.0) },
            { geo: limbGeo(0.04, 0.17), mat: hideDark, offset: new THREE.Vector3(-0.075, 0.32, 0.02), anim: swing(15, 1.0, Math.PI) },
            // Tiny forearms tucked in
            { geo: limbGeo(0.022, 0.07), mat: hide, offset: new THREE.Vector3(0.08, 0.4, 0.16), rotation: new THREE.Euler(-0.5, 0, 0), anim: gallop, desktopOnly: true },
            { geo: limbGeo(0.022, 0.07), mat: hide, offset: new THREE.Vector3(-0.08, 0.4, 0.16), rotation: new THREE.Euler(-0.5, 0, 0), anim: gallop, desktopOnly: true },
        ];
    }

    // ─── Swarm: hornet — flapping wings, dangling legs, stinger, compound eyes ───
    {
        const bodyMat = std({ color: 0xb8842f, roughness: 0.6, flatShading: true });
        const stripeMat = std({ color: 0x33250d, roughness: 0.7 });
        const wingMat = std({ color: 0xdddddd, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const eye = std({ color: 0x220000, emissive: 0xff4444, emissiveIntensity: 0.9 });
        const buzz = hover(0.07, 9);
        const wingGeo = () => { const g = new THREE.PlaneGeometry(0.2, 0.085); g.translate(0.1, 0, 0); return g; };
        configs.swarm = [
            // Thorax + abdomen
            {
                geo: new THREE.CapsuleGeometry(0.06, 0.14, 4, 6), mat: bodyMat,
                offset: new THREE.Vector3(0, 0.34, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: buzz,
            },
            { geo: new THREE.TorusGeometry(0.058, 0.02, 4, 8), mat: stripeMat, offset: new THREE.Vector3(0, 0.34, -0.045), anim: buzz, desktopOnly: true },
            // Head with two compound eyes
            { geo: new THREE.SphereGeometry(0.048, 7, 6), mat: stripeMat, offset: new THREE.Vector3(0, 0.36, 0.12), anim: buzz },
            { geo: new THREE.SphereGeometry(0.026, 5, 5), mat: eye, offset: new THREE.Vector3(0.033, 0.375, 0.14), anim: buzz },
            { geo: new THREE.SphereGeometry(0.026, 5, 5), mat: eye, offset: new THREE.Vector3(-0.033, 0.375, 0.14), anim: buzz },
            // Wings — rooted at the body, flapping fast in opposite phase
            {
                geo: wingGeo(), mat: wingMat, offset: new THREE.Vector3(0.045, 0.4, 0.0),
                rotation: new THREE.Euler(Math.PI / 2, 0, 0.2),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 9 + ph) * 0.07; out.rz += Math.sin(t * 34 + ph) * 0.7; },
            },
            {
                geo: (() => { const g = new THREE.PlaneGeometry(0.2, 0.085); g.translate(-0.1, 0, 0); return g; })(),
                mat: wingMat, offset: new THREE.Vector3(-0.045, 0.4, 0.0),
                rotation: new THREE.Euler(Math.PI / 2, 0, -0.2),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 9 + ph) * 0.07; out.rz -= Math.sin(t * 34 + ph) * 0.7; },
            },
            // Stinger
            { geo: new THREE.ConeGeometry(0.028, 0.1, 5), mat: stripeMat, offset: new THREE.Vector3(0, 0.33, -0.13), rotation: new THREE.Euler(-Math.PI / 2 - 0.3, 0, 0), anim: buzz },
            // Dangling legs
            { geo: limbGeo(0.012, 0.07), mat: stripeMat, offset: new THREE.Vector3(0.045, 0.31, 0.04), rotation: new THREE.Euler(0.3, 0, 0.35), anim: buzz, desktopOnly: true },
            { geo: limbGeo(0.012, 0.07), mat: stripeMat, offset: new THREE.Vector3(-0.045, 0.31, 0.04), rotation: new THREE.Euler(0.3, 0, -0.35), anim: buzz, desktopOnly: true },
        ];
    }

    // ─── Shield: rune golem — stone body with heavy arms, marching legs, energy ring ───
    {
        const stone = std({ color: 0x2a4a8f, roughness: 0.85, metalness: 0.25, flatShading: true });
        const stoneDark = std({ color: 0x1b3263, roughness: 0.9, flatShading: true });
        const glow = std({ color: 0x66bbff, emissive: 0x3388ff, emissiveIntensity: 0.9 });
        const ringMat = std({ color: 0x3388ff, transparent: true, opacity: 0.65, emissive: 0x114488 });
        const march = walkBob(0.03, 7);
        configs.shield = [
            // Rocky torso
            { geo: new THREE.DodecahedronGeometry(0.17), mat: stone, offset: new THREE.Vector3(0, 0.52, 0), scale: new THREE.Vector3(1, 1.15, 0.85), anim: march },
            // Head
            { geo: new THREE.DodecahedronGeometry(0.08), mat: stoneDark, offset: new THREE.Vector3(0, 0.76, 0.02), anim: march },
            // Glowing core set into the chest
            {
                geo: new THREE.SphereGeometry(0.06, 7, 7), mat: glow, offset: new THREE.Vector3(0, 0.54, 0.13),
                anim: (out, t, ph) => { out.s *= 0.9 + Math.sin(t * 5 + ph) * 0.15; out.oy += Math.abs(Math.sin(t * 7 + ph)) * 0.03; },
            },
            // Heavy stone arms
            { geo: limbGeo(0.055, 0.16), mat: stoneDark, offset: new THREE.Vector3(0.21, 0.62, 0), anim: swing(7, 0.35, Math.PI, 0.03, 7) },
            { geo: limbGeo(0.055, 0.16), mat: stoneDark, offset: new THREE.Vector3(-0.21, 0.62, 0), anim: swing(7, 0.35, 0, 0.03, 7) },
            // Short marching legs
            { geo: limbGeo(0.05, 0.1), mat: stoneDark, offset: new THREE.Vector3(0.09, 0.32, 0), anim: swing(7, 0.5) },
            { geo: limbGeo(0.05, 0.1), mat: stoneDark, offset: new THREE.Vector3(-0.09, 0.32, 0), anim: swing(7, 0.5, Math.PI) },
            // Orbiting energy shield ring
            {
                geo: new THREE.TorusGeometry(0.29, 0.035, 6, 16), mat: ringMat,
                offset: new THREE.Vector3(0, 0.55, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 2.4; out.oy += Math.abs(Math.sin(t * 7 + ph)) * 0.03; },
            },
            // Second gyro ring
            {
                geo: new THREE.TorusGeometry(0.29, 0.022, 6, 16), mat: ringMat,
                offset: new THREE.Vector3(0, 0.55, 0),
                anim: (out, t, ph) => { out.ry -= t * 3.0; out.oy += Math.abs(Math.sin(t * 7 + ph)) * 0.03; },
                desktopOnly: true,
            },
        ];
    }

    // ─── Healer: shrine priestess — robed figure, waving sleeves, halo, orbiting orbs ───
    {
        const robe = std({ color: 0xe8608f, roughness: 0.7 });
        const robeDark = std({ color: 0xb44068, roughness: 0.75 });
        const skin = std({ color: 0xffe3ec, roughness: 0.5 });
        const holy = std({ color: 0xfff6d8, emissive: 0xffcc88, emissiveIntensity: 0.9 });
        const orb = std({ color: 0xbaffc9, emissive: 0x66ff99, emissiveIntensity: 0.9 });
        const drift = hover(0.035, 4);
        configs.healer = [
            // Robe body swaying gently
            {
                geo: new THREE.ConeGeometry(0.17, 0.46, 8), mat: robe, offset: new THREE.Vector3(0, 0.27, 0),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 4 + ph) * 0.035; out.rz += Math.sin(t * 3 + ph) * 0.04; },
            },
            // Hood + head
            { geo: new THREE.ConeGeometry(0.1, 0.16, 7), mat: robeDark, offset: new THREE.Vector3(0, 0.58, 0), anim: drift },
            { geo: new THREE.SphereGeometry(0.075, 8, 7), mat: skin, offset: new THREE.Vector3(0, 0.53, 0.035), anim: drift },
            // Outstretched sleeve arms, waving as if casting
            { geo: limbGeo(0.035, 0.13), mat: robe, offset: new THREE.Vector3(0.14, 0.48, 0.04), rotation: new THREE.Euler(-0.9, 0, -0.5), anim: swing(4, 0.25, 0) },
            { geo: limbGeo(0.035, 0.13), mat: robe, offset: new THREE.Vector3(-0.14, 0.48, 0.04), rotation: new THREE.Euler(-0.9, 0, 0.5), anim: swing(4, 0.25, Math.PI) },
            // Chest sigil
            { geo: new THREE.BoxGeometry(0.05, 0.13, 0.03), mat: holy, offset: new THREE.Vector3(0, 0.36, 0.13), anim: drift, desktopOnly: true },
            { geo: new THREE.BoxGeometry(0.11, 0.05, 0.03), mat: holy, offset: new THREE.Vector3(0, 0.37, 0.13), anim: drift, desktopOnly: true },
            // Spinning halo
            {
                geo: new THREE.TorusGeometry(0.11, 0.018, 5, 14), mat: holy,
                offset: new THREE.Vector3(0, 0.72, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 2.2; out.oy += Math.sin(t * 4 + ph) * 0.045; },
            },
            // Orbiting heal orbs
            {
                geo: new THREE.SphereGeometry(0.033, 6, 6), mat: orb, offset: new THREE.Vector3(0, 0.42, 0),
                anim: (out, t, ph) => {
                    out.ox += Math.cos(t * 2.6 + ph) * 0.25;
                    out.oz += Math.sin(t * 2.6 + ph) * 0.25;
                    out.oy += Math.sin(t * 5 + ph) * 0.05;
                },
                desktopOnly: true,
            },
            {
                geo: new THREE.SphereGeometry(0.033, 6, 6), mat: orb, offset: new THREE.Vector3(0, 0.42, 0),
                anim: (out, t, ph) => {
                    out.ox += Math.cos(t * 2.6 + ph + Math.PI) * 0.25;
                    out.oz += Math.sin(t * 2.6 + ph + Math.PI) * 0.25;
                    out.oy += Math.sin(t * 5 + ph + 1.5) * 0.05;
                },
                desktopOnly: true,
            },
        ];
    }

    // ─── Boss: demon warlord — towering biped, stomping gait, fists, horns, crown ───
    {
        const flesh = std({ color: 0x9e1414, metalness: 0.35, roughness: 0.6, flatShading: true });
        const armor = std({ color: 0x3a0a0a, metalness: 0.7, roughness: 0.4 });
        const bone = std({ color: 0xe8e0d0, roughness: 0.5 });
        const eye = std({ color: 0x220000, emissive: 0xffaa00, emissiveIntensity: 1 });
        const core = std({ color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 0.9 });
        const STOMP = 4.5;
        const stomp: AnimFn = (out, t, ph) => {
            out.oy += Math.abs(Math.sin(t * STOMP + ph)) * 0.05;
            out.rz += Math.sin(t * STOMP + ph) * 0.035;
        };
        const fistGeo = (side: number) => {
            const g = new THREE.SphereGeometry(0.115, 7, 7);
            g.translate(side * 0.04, -0.52, 0);
            return g;
        };
        configs.boss = [
            // Massive torso
            { geo: new THREE.CapsuleGeometry(0.32, 0.4, 6, 12), mat: flesh, offset: new THREE.Vector3(0, 1.02, 0), anim: stomp },
            // Waist armor
            { geo: new THREE.TorusGeometry(0.32, 0.055, 6, 12), mat: armor, offset: new THREE.Vector3(0, 0.82, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: stomp, desktopOnly: true },
            // Head with jaw
            { geo: new THREE.SphereGeometry(0.16, 9, 8), mat: flesh, offset: new THREE.Vector3(0, 1.48, 0.05), anim: stomp },
            // Glowing eye visor
            { geo: new THREE.BoxGeometry(0.24, 0.055, 0.08), mat: eye, offset: new THREE.Vector3(0, 1.5, 0.17), anim: stomp },
            // Bone horns
            { geo: new THREE.ConeGeometry(0.07, 0.34, 5), mat: bone, offset: new THREE.Vector3(0.15, 1.66, 0.1), rotation: new THREE.Euler(Math.PI / 5, 0, -Math.PI / 6), anim: stomp },
            { geo: new THREE.ConeGeometry(0.07, 0.34, 5), mat: bone, offset: new THREE.Vector3(-0.15, 1.66, 0.1), rotation: new THREE.Euler(Math.PI / 5, 0, Math.PI / 6), anim: stomp },
            // Shoulder pauldrons
            { geo: new THREE.SphereGeometry(0.17, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat: armor, offset: new THREE.Vector3(0.36, 1.3, 0), rotation: new THREE.Euler(0, 0, -0.35), anim: stomp },
            { geo: new THREE.SphereGeometry(0.17, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat: armor, offset: new THREE.Vector3(-0.36, 1.3, 0), rotation: new THREE.Euler(0, 0, 0.35), anim: stomp },
            // Massive arms + fists (fist shares the shoulder pivot so it swings with the arm)
            { geo: limbGeo(0.095, 0.34), mat: flesh, offset: new THREE.Vector3(0.4, 1.26, 0), anim: swing(STOMP, 0.4, Math.PI, 0.05, STOMP) },
            { geo: limbGeo(0.095, 0.34), mat: flesh, offset: new THREE.Vector3(-0.4, 1.26, 0), anim: swing(STOMP, 0.4, 0, 0.05, STOMP) },
            { geo: fistGeo(1), mat: armor, offset: new THREE.Vector3(0.4, 1.26, 0), anim: swing(STOMP, 0.4, Math.PI, 0.05, STOMP), desktopOnly: true },
            { geo: fistGeo(-1), mat: armor, offset: new THREE.Vector3(-0.4, 1.26, 0), anim: swing(STOMP, 0.4, 0, 0.05, STOMP), desktopOnly: true },
            // Thick stomping legs
            { geo: limbGeo(0.115, 0.3), mat: armor, offset: new THREE.Vector3(0.17, 0.66, 0), anim: swing(STOMP, 0.5) },
            { geo: limbGeo(0.115, 0.3), mat: armor, offset: new THREE.Vector3(-0.17, 0.66, 0), anim: swing(STOMP, 0.5, Math.PI) },
            // Burning chest core
            {
                geo: new THREE.SphereGeometry(0.085, 8, 8), mat: core, offset: new THREE.Vector3(0, 1.12, 0.3),
                anim: (out, t, ph) => {
                    out.s *= 0.9 + Math.sin(t * 6 + ph) * 0.18;
                    out.oy += Math.abs(Math.sin(t * STOMP + ph)) * 0.05;
                },
            },
            // Floating crown ring
            {
                geo: new THREE.TorusGeometry(0.17, 0.024, 5, 12), mat: core,
                offset: new THREE.Vector3(0, 1.92, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 1.8; out.oy += Math.sin(t * 2.4 + ph) * 0.06; },
                desktopOnly: true,
            },
        ];
    }

    // Strip desktop-only parts on mobile
    if (GRAPHICS.isMobile) {
        for (const key of Object.keys(configs) as EnemyType[]) {
            configs[key] = configs[key].filter(p => !p.desktopOnly);
        }
    }

    return configs;
}

const ENEMY_PARTS = buildEnemyConfigs();

const MAX_PER_TYPE = 100;
const HP_BAR_WIDTH = 0.5;
const POOL_SIZE = 100;

// Shared unit-scale geometries — use mesh.scale.x to resize width
const GEO_BAR    = new THREE.PlaneGeometry(1, 0.06);
const GEO_SHIELD = new THREE.PlaneGeometry(1, 0.04);
const GEO_SHADOW = new THREE.CircleGeometry(0.26, 12);
const GEO_HALO   = new THREE.RingGeometry(0.18, 0.24, 12);

export class EnemyRenderer {
    private scene: THREE.Scene;
    private instancedMeshGroups = new Map<EnemyType, THREE.InstancedMesh[]>();
    private dummy = new THREE.Object3D();
    private animOut: AnimResult = { ox: 0, oy: 0, oz: 0, rx: 0, ry: 0, rz: 0, s: 1 };

    // Shared materials (created once, reused every frame)
    private readonly mHpBg      = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpGreen   = new THREE.MeshBasicMaterial({ color: 0x44ff44, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpYellow  = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpRed     = new THREE.MeshBasicMaterial({ color: 0xff3333, side: THREE.DoubleSide, depthWrite: false });
    private readonly mShield    = new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide, depthWrite: false });
    private readonly mShadow    = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloBoss  = new THREE.MeshBasicMaterial({ color: 0xff9e57, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloShield = new THREE.MeshBasicMaterial({ color: 0x6ccfff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloSlow  = new THREE.MeshBasicMaterial({ color: 0x8de8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloDot   = new THREE.MeshBasicMaterial({ color: 0x74ff6a, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });

    // Scene-persistent pooled meshes — never added/removed, just shown/hidden
    private readonly poolHpBg   : THREE.Mesh[] = [];
    private readonly poolHpFill : THREE.Mesh[] = [];
    private readonly poolShield : THREE.Mesh[] = [];
    private readonly poolShadow : THREE.Mesh[] = [];   // desktop only
    private readonly poolHalo   : THREE.Mesh[] = [];   // desktop only

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        // Yaw-first rotation order so facing (Y) composes with limb pitch (X)
        // and static part tilts in the enemy's own frame — with the default
        // XYZ order, any part with an X rotation stopped following the path.
        this.dummy.rotation.order = 'YXZ';
        this.initPool();
    }

    private initPool(): void {
        const add = (geo: THREE.BufferGeometry, mat: THREE.Material, order: number): THREE.Mesh => {
            const m = new THREE.Mesh(geo, mat);
            m.visible = false;
            m.renderOrder = order;
            this.scene.add(m);
            return m;
        };
        for (let i = 0; i < POOL_SIZE; i++) {
            this.poolHpBg.push(add(GEO_BAR, this.mHpBg, 1));
            this.poolHpFill.push(add(GEO_BAR, this.mHpGreen, 2));
            this.poolShield.push(add(GEO_SHIELD, this.mShield, 2));
            if (!GRAPHICS.isMobile) {
                this.poolShadow.push(add(GEO_SHADOW, this.mShadow, 0));
                this.poolHalo.push(add(GEO_HALO, this.mHaloDot, 0));
            }
        }
    }

    private getOrCreate(type: EnemyType): THREE.InstancedMesh[] {
        let meshes = this.instancedMeshGroups.get(type);
        if (!meshes) {
            meshes = [];
            const parts = ENEMY_PARTS[type];
            for (const part of parts) {
                const mesh = new THREE.InstancedMesh(part.geo, part.mat, MAX_PER_TYPE);
                mesh.count = 0;
                if (GRAPHICS.enableShadows) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
                this.scene.add(mesh);
                meshes.push(mesh);
            }
            this.instancedMeshGroups.set(type, meshes);
        }
        return meshes;
    }

    sync(state: GameState, _interpolation: number, camera?: THREE.Camera): void {
        // Group living enemies by type and build ordered list for pool slots
        const byType = new Map<EnemyType, Enemy[]>();
        const living: Enemy[] = [];
        for (const e of state.enemies) {
            if (!e.alive || e.reached) continue;
            let arr = byType.get(e.type);
            if (!arr) { arr = []; byType.set(e.type, arr); }
            arr.push(e);
            living.push(e);
        }

        const time = performance.now() * 0.001;
        const out = this.animOut;

        // Update instanced meshes (enemy bodies)
        const allTypes: EnemyType[] = ['grunt', 'tank', 'runner', 'swarm', 'shield', 'healer', 'boss'];
        for (const type of allTypes) {
            const meshes = this.getOrCreate(type);
            const enemies = byType.get(type) || [];
            for (const mesh of meshes) {
                mesh.count = enemies.length;
            }
            const parts = ENEMY_PARTS[type];
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dx = e.worldX - e.prevWorldX;
                const dz = e.worldZ - e.prevWorldZ;
                let moveRot = 0;
                if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
                    moveRot = Math.atan2(dx, dz);
                    (e as any).displayRot = moveRot;
                } else if ((e as any).displayRot !== undefined) {
                    moveRot = (e as any).displayRot;
                }
                const phase = e.id * 0.7;
                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];

                    out.ox = 0; out.oy = 0; out.oz = 0;
                    out.rx = 0; out.ry = 0; out.rz = 0;
                    out.s = 1;
                    if (part.anim) part.anim(out, time, phase);

                    this.dummy.position.set(e.worldX + out.ox, out.oy, e.worldZ + out.oz);
                    this.dummy.position.add(part.offset);
                    this.dummy.rotation.set(out.rx, moveRot + out.ry, out.rz);
                    if (part.rotation) {
                        this.dummy.rotation.x += part.rotation.x;
                        this.dummy.rotation.y += part.rotation.y;
                        this.dummy.rotation.z += part.rotation.z;
                    }
                    if (part.scale) {
                        this.dummy.scale.copy(part.scale).multiplyScalar(out.s);
                    } else {
                        this.dummy.scale.set(out.s, out.s, out.s);
                    }
                    this.dummy.updateMatrix();
                    meshes[p].setMatrixAt(i, this.dummy.matrix);
                }
            }
            for (const mesh of meshes) {
                mesh.instanceMatrix.needsUpdate = true;
            }
        }

        // ─── Pool-based HP bars (no per-frame allocation) ─────────────────────
        const n = Math.min(living.length, POOL_SIZE);

        for (let i = 0; i < n; i++) {
            const e = living[i];
            const isBoss = e.type === 'boss';
            const barY = ENEMY_META[e.type].barY;

            const hpRatio = Math.max(0, e.hp / e.maxHp);
            const hpW = HP_BAR_WIDTH * hpRatio;

            // Background bar — full width, centred on enemy
            const bg = this.poolHpBg[i];
            bg.scale.set(HP_BAR_WIDTH, 1, 1);
            bg.position.set(e.worldX, barY, e.worldZ);
            bg.visible = true;
            if (camera) bg.lookAt(camera.position); else bg.rotation.x = -Math.PI / 4;

            // Fill bar — left-aligned, scales with HP ratio
            const fill = this.poolHpFill[i];
            if (hpW > 0.001) {
                (fill as THREE.Mesh).material = hpRatio > 0.5 ? this.mHpGreen
                    : hpRatio > 0.25 ? this.mHpYellow : this.mHpRed;
                fill.scale.set(hpW, 1, 1);
                fill.position.set(e.worldX - (HP_BAR_WIDTH - hpW) / 2, barY, e.worldZ);
                fill.visible = true;
                if (camera) fill.lookAt(camera.position); else fill.rotation.x = -Math.PI / 4;
            } else {
                fill.visible = false;
            }

            // Shield bar
            const shield = this.poolShield[i];
            if (e.maxShield > 0 && e.shield > 0) {
                const sRatio = e.shield / e.maxShield;
                const sW = HP_BAR_WIDTH * sRatio;
                shield.scale.set(sW, 1, 1);
                shield.position.set(e.worldX - (HP_BAR_WIDTH - sW) / 2, barY + 0.07, e.worldZ);
                shield.visible = true;
                if (camera) shield.lookAt(camera.position); else shield.rotation.x = -Math.PI / 4;
            } else {
                shield.visible = false;
            }

            // Contact shadow + status halo — desktop only (skip on mobile to save draw calls)
            if (!GRAPHICS.isMobile && i < this.poolShadow.length) {
                const shadow = this.poolShadow[i];
                shadow.scale.setScalar(ENEMY_META[e.type].shadowScale);
                shadow.position.set(e.worldX, 0.01, e.worldZ);
                shadow.visible = true;

                const halo = this.poolHalo[i];
                const hasStatus = e.slow || e.dots.length > 0 || e.shield > 0 || isBoss;
                if (hasStatus) {
                    (halo as THREE.Mesh).material = isBoss ? this.mHaloBoss
                        : e.shield > 0 ? this.mHaloShield
                        : e.slow ? this.mHaloSlow
                        : this.mHaloDot;
                    halo.position.set(e.worldX, 0.045, e.worldZ);
                    halo.visible = true;
                } else {
                    halo.visible = false;
                }
            }
        }

        // Hide unused pool slots
        for (let i = n; i < POOL_SIZE; i++) {
            this.poolHpBg[i].visible = false;
            this.poolHpFill[i].visible = false;
            this.poolShield[i].visible = false;
            if (!GRAPHICS.isMobile && i < this.poolShadow.length) {
                this.poolShadow[i].visible = false;
                this.poolHalo[i].visible = false;
            }
        }
    }
}
