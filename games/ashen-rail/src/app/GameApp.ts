import { Engine, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { QUALITY_PRESETS, loadQualityPreset, type QualityPresetName } from "../config/quality";
import { TrainBattleScene, type BattleStats } from "../game/scenes/TrainBattleScene";

export class GameApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly scene: Scene;
  private readonly battle: TrainBattleScene;
  private qualityName: QualityPresetName;
  private renderScale: number;
  private fpsAccumulator = 0;
  private fpsSamples = 0;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas"); if (!canvas) throw new Error("找唔到遊戲 Canvas"); this.canvas = canvas;
    this.qualityName = loadQualityPreset(); const quality = QUALITY_PRESETS[this.qualityName]; this.renderScale = quality.renderScale;
    this.engine = new Engine(this.canvas, true, { antialias: true, preserveDrawingBuffer: false, stencil: true, adaptToDeviceRatio: false }); this.applyRenderScale();
    this.scene = new Scene(this.engine);
    this.scene.activeCamera = new FreeCamera("boot-camera", new Vector3(0, 3, -8), this.scene);
    this.battle = new TrainBattleScene(this.scene, quality, { onProgress: this.onProgress, onLoaded: this.onLoaded, onResult: this.onResult, onError: this.showError });
    this.bindUi(); this.engine.runRenderLoop(this.frame); window.addEventListener("resize", () => this.engine.resize());
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.battle.pause(); });
  }

  async boot(): Promise<void> { try { await this.battle.load(); } catch (error) { this.showError(error instanceof Error ? error.message : String(error)); } }

  private readonly frame = (): void => {
    const delta = this.engine.getDeltaTime() / 1000; this.battle.update(delta); this.scene.render();
    this.fpsAccumulator += this.engine.getFps(); this.fpsSamples += 1;
    if (this.fpsSamples >= 300) { const average = this.fpsAccumulator / this.fpsSamples; const target = QUALITY_PRESETS[this.qualityName].targetFps; if (average < target * 0.72 && this.renderScale > 0.7) { this.renderScale = Math.max(0.7, this.renderScale - 0.1); this.applyRenderScale(); } this.fpsAccumulator = 0; this.fpsSamples = 0; }
  };

  private readonly onProgress = (label: string, progress: number): void => {
    const fill = document.querySelector<HTMLElement>("#load-fill"); const text = document.querySelector<HTMLElement>("#load-label"); if (fill) fill.style.width = `${progress * 100}%`; if (text) text.textContent = `載入 ${label}… ${Math.round(progress * 100)}%`;
  };

  private readonly onLoaded = (errors: string[]): void => {
    document.querySelector("#loading-screen")?.classList.add("hidden"); document.querySelector("#start-screen")?.classList.remove("hidden");
    if (errors.length > 0) { const start = document.querySelector("#start-screen .start-panel > p:not(.eyebrow)"); if (start) start.textContent = `部分正式模型未能載入，已啟用可玩後備：${errors.join("；")}`; }
  };

  private readonly onResult = (won: boolean, stats: BattleStats): void => {
    const screen = document.querySelector("#result-screen"); screen?.classList.remove("hidden"); const kicker = document.querySelector("#result-kicker"); if (kicker) kicker.textContent = won ? "任務完成" : "任務失敗";
    const statsNode = document.querySelector("#result-stats"); if (statsNode) statsNode.innerHTML = `<span>遊玩時間 <b>${Math.floor(stats.elapsed / 60)}:${String(Math.floor(stats.elapsed % 60)).padStart(2, "0")}</b></span><span>擊落數量 <b>${stats.kills}</b></span><span>核心剩餘 <b>${Math.round(stats.coreHealth)}%</b></span>`;
  };

  private readonly showError = (message: string): void => { document.querySelector("#loading-screen")?.classList.add("hidden"); document.querySelector("#error-screen")?.classList.remove("hidden"); const node = document.querySelector("#error-message"); if (node) node.textContent = message; };

  private bindUi(): void {
    this.bindSettings();
    document.querySelector("#start-button")?.addEventListener("click", async () => { await this.battle.audio.unlock(); await this.tryFullscreen(); document.querySelector("#start-screen")?.classList.add("hidden"); this.battle.start(); });
    document.querySelector("#resume-button")?.addEventListener("click", () => this.battle.resume());
    document.querySelector("#restart-button")?.addEventListener("click", () => { document.querySelector("#result-screen")?.classList.add("hidden"); this.battle.start(); });
    document.querySelector("#restart-paused-button")?.addEventListener("click", () => { document.querySelector("#pause-screen")?.classList.add("hidden"); this.battle.state.transition("READY"); this.battle.start(); });
    for (const selector of ["#retry-button", "#error-retry-button"]) document.querySelector(selector)?.addEventListener("click", () => window.location.reload());
    window.addEventListener("error", (event) => this.showError(event.message)); window.addEventListener("unhandledrejection", (event) => this.showError(String(event.reason)));
  }

  private async tryFullscreen(): Promise<void> { try { await document.documentElement.requestFullscreen?.(); const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: "landscape") => Promise<void> }; await orientation.lock?.("landscape"); } catch (error) { console.info("Fullscreen/orientation lock unavailable", error); } }
  private applyRenderScale(): void { const dpr = Math.min(window.devicePixelRatio || 1, 1.5); this.engine.setHardwareScalingLevel(Math.max(1, dpr / this.renderScale)); this.battle?.setRenderScale(this.renderScale); }

  private bindSettings(): void {
    const quality = document.querySelector<HTMLSelectElement>("#quality-setting"); if (quality) { quality.value = this.qualityName; quality.addEventListener("change", () => { localStorage.setItem("ashenRail.quality", quality.value); window.location.reload(); }); }
    const master = document.querySelector<HTMLInputElement>("#master-volume"); if (master) { master.value = String(this.battle.audio.settings.master); master.addEventListener("input", () => { this.battle.audio.settings.master = Number(master.value); this.saveAudioSettings(); }); }
    const mute = document.querySelector<HTMLInputElement>("#mute-setting"); if (mute) { mute.checked = this.battle.audio.settings.muted; mute.addEventListener("change", () => { this.battle.audio.settings.muted = mute.checked; this.saveAudioSettings(); }); }
    const savedCamera = (() => { try { return JSON.parse(localStorage.getItem("ashenRail.camera") ?? "{}"); } catch { return {}; } })() as { shake?: number; aimAssist?: number };
    const shake = document.querySelector<HTMLInputElement>("#camera-shake"); if (shake) { shake.value = String(savedCamera.shake ?? 0.65); shake.addEventListener("input", () => this.battle.setCameraSetting("shake", Number(shake.value))); }
    const aim = document.querySelector<HTMLInputElement>("#aim-assist"); if (aim) { aim.value = String(savedCamera.aimAssist ?? 0.7); aim.addEventListener("input", () => this.battle.setCameraSetting("aimAssist", Number(aim.value))); }
  }

  private saveAudioSettings(): void { localStorage.setItem("ashenRail.audio", JSON.stringify(this.battle.audio.settings)); }
}
