import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GRAPHICS } from '../core/config';

export class PostProcessor {
    private composer: EffectComposer;
    private bloomPass: UnrealBloomPass;
    private gradePass: ShaderPass;

    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            GRAPHICS.atmosphere.bloomStrength,
            GRAPHICS.atmosphere.bloomRadius,
            GRAPHICS.atmosphere.bloomThreshold
        );
        this.composer.addPass(this.bloomPass);

        this.gradePass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: { value: null },
                    uTime: { value: 0 },
                    uVignetteStrength: { value: GRAPHICS.atmosphere.vignetteStrength },
                    uGrainAmount: { value: GRAPHICS.atmosphere.grainAmount },
                    uContrast: { value: 1.06 },
                    uSaturation: { value: 1.08 },
                    uTint: { value: new THREE.Vector3(0.98, 1.02, 0.98) },
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float uTime;
                    uniform float uVignetteStrength;
                    uniform float uGrainAmount;
                    uniform float uContrast;
                    uniform float uSaturation;
                    uniform vec3 uTint;
                    varying vec2 vUv;

                    float random(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                    }

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        color.rgb = mix(vec3(luminance), color.rgb, uSaturation);
                        color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
                        color.rgb *= uTint;

                        vec2 centeredUv = vUv - 0.5;
                        float vignette = 1.0 - dot(centeredUv, centeredUv) * (1.55 + uVignetteStrength);
                        color.rgb *= clamp(vignette, 0.62, 1.0);

                        if (uGrainAmount > 0.0) {
                            float grain = random(vUv * vec2(134.0, 289.0) + uTime) - 0.5;
                            color.rgb += grain * uGrainAmount;
                        }

                        gl_FragColor = color;
                    }
                `,
            }),
            'tDiffuse'
        );
        this.composer.addPass(this.gradePass);
    }

    render(): void {
        this.gradePass.uniforms.uTime.value = performance.now() * 0.001;
        this.composer.render();
    }

    resize(width: number, height: number): void {
        this.composer.setSize(width, height);
        this.bloomPass.setSize(width, height);
    }

    /** Update color grading tint (r/g/b around 1.0). */
    setTint(r: number, g: number, b: number): void {
        const v = this.gradePass.uniforms.uTint.value as THREE.Vector3;
        v.set(r, g, b);
    }
}
