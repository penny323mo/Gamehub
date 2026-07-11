import { Scalar, Vector2 } from "@babylonjs/core";

type OrientationEventConstructor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function mapGyroDelta(betaDelta: number, gammaDelta: number, screenAngle: number): Vector2 {
  if (screenAngle === 90) return new Vector2(-betaDelta, gammaDelta);
  if (screenAngle === 270 || screenAngle === -90) return new Vector2(betaDelta, -gammaDelta);
  return new Vector2(gammaDelta, betaDelta);
}

export class GyroAimController {
  active = false;
  private lastBeta?: number;
  private lastGamma?: number;
  private readonly pending = Vector2.Zero();

  async requestAccess(): Promise<boolean> {
    if (!("DeviceOrientationEvent" in window)) return false;
    try {
      const constructor = DeviceOrientationEvent as OrientationEventConstructor;
      if (constructor.requestPermission && await constructor.requestPermission() !== "granted") return false;
      if (!this.active) window.addEventListener("deviceorientation", this.onOrientation, { passive: true });
      this.active = true; this.calibrate(); return true;
    } catch (error) { console.info("Gyroscope aiming unavailable", error); return false; }
  }

  disable(): void { if (this.active) window.removeEventListener("deviceorientation", this.onOrientation); this.active = false; this.calibrate(); }
  calibrate(): void { this.lastBeta = undefined; this.lastGamma = undefined; this.pending.set(0, 0); }
  consumeDelta(): Vector2 { const delta = this.pending.clone(); this.pending.set(0, 0); return delta; }

  private readonly onOrientation = (event: DeviceOrientationEvent): void => {
    if (event.beta === null || event.gamma === null) return;
    if (this.lastBeta === undefined || this.lastGamma === undefined) { this.lastBeta = event.beta; this.lastGamma = event.gamma; return; }
    const betaDelta = Scalar.Clamp(event.beta - this.lastBeta, -4, 4); const gammaDelta = Scalar.Clamp(event.gamma - this.lastGamma, -4, 4); this.lastBeta = event.beta; this.lastGamma = event.gamma;
    const mapped = mapGyroDelta(betaDelta, gammaDelta, screen.orientation?.angle ?? window.orientation ?? 0); this.pending.addInPlace(mapped.scale(2.15));
  };
}
