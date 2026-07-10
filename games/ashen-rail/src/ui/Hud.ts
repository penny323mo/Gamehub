export class Hud {
  private get<T extends HTMLElement>(selector: string): T { const element = document.querySelector<T>(selector); if (!element) throw new Error(`Missing UI element: ${selector}`); return element; }
  show(): void { this.get("#hud").classList.remove("hidden"); }
  hide(): void { this.get("#hud").classList.add("hidden"); }
  setHealth(player: number, playerMax: number, core: number, coreMax: number): void {
    this.get("#player-health").textContent = String(Math.ceil(player)); this.get("#player-health-fill").style.width = `${player / playerMax * 100}%`;
    this.get("#core-health").textContent = String(Math.ceil(core)); this.get("#core-health-fill").style.width = `${core / coreMax * 100}%`;
  }
  setAmmo(ammo: number, reloading: boolean, progress: number): void { this.get("#ammo-count").textContent = String(ammo); this.get("#reload-label").textContent = reloading ? `換彈 ${Math.round(progress * 100)}%` : ""; }
  setWave(label: string, remaining: number): void { this.get("#wave-label").textContent = label; this.get("#enemy-count").textContent = `敵人 ${remaining}`; }
  setObjective(text: string): void { this.get("#objective-label").textContent = text; }
  setTip(text: string, visible = true): void { const tip = this.get("#tutorial-tip"); tip.textContent = text; tip.classList.toggle("hidden", !visible); }
  setDodgeCooldown(seconds: number): void { this.get("#dodge-cooldown").textContent = seconds > 0 ? seconds.toFixed(1) : "閃避"; this.get<HTMLButtonElement>("#dodge-button").disabled = seconds > 0; }
  pulseHit(hit: boolean): void { const crosshair = this.get("#crosshair"); crosshair.classList.toggle("hit", hit); window.setTimeout(() => crosshair.classList.remove("hit"), 90); }
}
