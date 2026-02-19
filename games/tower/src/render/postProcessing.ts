import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class PostProcessor {
    private composer: EffectComposer;
    private bloomPass: UnrealBloomPass;

    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.55,   // strength
            0.4,    // radius
            0.85    // threshold
        );
        this.composer.addPass(this.bloomPass);
    }

    render(): void {
        this.composer.render();
    }

    resize(width: number, height: number): void {
        this.composer.setSize(width, height);
    }
}
