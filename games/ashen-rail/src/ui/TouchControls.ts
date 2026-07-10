import { Vector2 } from "@babylonjs/core";

export interface ControlCallbacks { onFire: () => void; onDodge: () => void; onPause: () => void; }

export class TouchControls {
  readonly movement = Vector2.Zero();
  readonly lookDelta = Vector2.Zero();
  firing = false;
  private joystickPointer?: number;
  private aimPointer?: number;
  private aimLast = Vector2.Zero();
  private keyboard = new Set<string>();
  private readonly joystick = document.querySelector<HTMLElement>("#joystick");
  private readonly knob = document.querySelector<HTMLElement>("#joystick-knob");
  private readonly aimZone = document.querySelector<HTMLElement>("#aim-zone");

  constructor(private readonly callbacks: ControlCallbacks) {
    if (!this.joystick || !this.knob || !this.aimZone) throw new Error("Touch control DOM is incomplete");
    this.joystick.addEventListener("pointerdown", this.onJoystickDown);
    window.addEventListener("pointermove", this.onJoystickMove, { passive: false });
    window.addEventListener("pointerup", this.onJoystickUp);
    window.addEventListener("pointercancel", this.onJoystickUp);
    this.aimZone.addEventListener("pointerdown", this.onAimDown);
    const fire = document.querySelector<HTMLButtonElement>("#fire-button");
    fire?.addEventListener("pointerdown", (event) => { event.preventDefault(); this.firing = true; this.callbacks.onFire(); });
    fire?.addEventListener("pointerup", () => { this.firing = false; });
    fire?.addEventListener("pointercancel", () => { this.firing = false; });
    document.querySelector("#dodge-button")?.addEventListener("pointerdown", (event) => { event.preventDefault(); this.callbacks.onDodge(); });
    document.querySelector("#pause-button")?.addEventListener("click", this.callbacks.onPause);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", () => { this.keyboard.clear(); this.movement.set(0, 0); this.lookDelta.set(0, 0); this.firing = false; });
  }

  update(): void {
    if (this.joystickPointer !== undefined) return;
    const x = Number(this.keyboard.has("KeyD")) - Number(this.keyboard.has("KeyA"));
    const y = Number(this.keyboard.has("KeyW")) - Number(this.keyboard.has("KeyS"));
    this.movement.set(x, y);
    if (this.movement.lengthSquared() > 1) this.movement.normalize();
  }

  consumeLookDelta(): Vector2 { const delta = this.lookDelta.clone(); this.lookDelta.set(0, 0); return delta; }

  reset(): void { this.movement.set(0, 0); this.lookDelta.set(0, 0); this.firing = false; this.joystickPointer = undefined; this.aimPointer = undefined; if (this.knob) this.knob.style.transform = "translate(-50%, -50%)"; }

  private readonly onJoystickDown = (event: PointerEvent): void => { event.preventDefault(); this.joystickPointer = event.pointerId; this.joystick?.setPointerCapture(event.pointerId); this.applyJoystick(event); };
  private readonly onJoystickMove = (event: PointerEvent): void => {
    if (event.pointerId === this.joystickPointer) { event.preventDefault(); this.applyJoystick(event); }
    if (event.pointerId === this.aimPointer) { event.preventDefault(); this.lookDelta.addInPlace(new Vector2(event.clientX - this.aimLast.x, event.clientY - this.aimLast.y)); this.aimLast.set(event.clientX, event.clientY); }
  };
  private readonly onJoystickUp = (event: PointerEvent): void => {
    if (event.pointerId === this.joystickPointer) { this.joystickPointer = undefined; this.movement.set(0, 0); if (this.knob) this.knob.style.transform = "translate(-50%, -50%)"; }
    if (event.pointerId === this.aimPointer) { this.aimPointer = undefined; this.aimZone?.classList.remove("active"); }
  };
  private readonly onAimDown = (event: PointerEvent): void => { event.preventDefault(); this.aimPointer = event.pointerId; this.aimLast.set(event.clientX, event.clientY); this.aimZone?.setPointerCapture(event.pointerId); this.aimZone?.classList.add("active"); };
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keyboard.add(event.code);
    if (event.code === "Space") { event.preventDefault(); this.firing = true; this.callbacks.onFire(); }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") this.callbacks.onDodge();
    if (event.code === "Escape") this.callbacks.onPause();
  };
  private readonly onKeyUp = (event: KeyboardEvent): void => { this.keyboard.delete(event.code); if (event.code === "Space") this.firing = false; };

  private applyJoystick(event: PointerEvent): void {
    if (!this.joystick || !this.knob) return;
    const rect = this.joystick.getBoundingClientRect(); const radius = rect.width * 0.34;
    const dx = event.clientX - (rect.left + rect.width / 2); const dy = event.clientY - (rect.top + rect.height / 2); const length = Math.hypot(dx, dy); const scale = length > radius ? radius / length : 1;
    const x = dx * scale; const y = dy * scale; this.movement.set(x / radius, -y / radius); this.knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }
}
