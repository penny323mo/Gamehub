import { describe, expect, it } from "vitest";
import { NullEngine, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { GameStateMachine } from "../game/state/GameStateMachine";
import { resolveOutcome } from "../game/state/OutcomeResolver";
import { WaveManager } from "../game/systems/WaveManager";
import { selectAimTarget } from "../game/combat/aimAssist";
import { kamikazeDamage, shouldKamikazeDetonate } from "../game/entities/kamikaze";
import { PausableClock } from "../game/systems/PausableClock";
import { cameraRelativeMovement } from "../game/entities/movement";
import { RaiderDrone } from "../game/entities/RaiderDrone";

function spawnWholeWave(manager: WaveManager): void {
  for (let index = 0; index < 30; index += 1) {
    for (const event of manager.update(1.2)) if (event.type === "spawn") manager.confirmSpawn(event.variant, true);
    if (manager.remaining === manager.alive) break;
  }
}

describe("Ashen Rail game rules", () => {
  it("Game State 只允許合法切換", () => {
    const state = new GameStateMachine(); state.transition("LOADING"); state.transition("READY"); state.transition("TUTORIAL"); state.transition("PAUSED"); state.transition("TUTORIAL");
    expect(state.state).toBe("TUTORIAL"); expect(() => state.transition("WON")).toThrow(/Invalid/u);
  });

  it("Wave Manager 正確完成並進入下一波", () => {
    const waves = new WaveManager(); waves.start(); spawnWholeWave(waves); expect(waves.remaining).toBe(3);
    waves.enemyDefeated(); waves.enemyDefeated(); expect(waves.enemyDefeated()[0]?.type).toBe("intermission"); waves.update(5.1); expect(waves.waveIndex).toBe(1);
  });

  it("玩家死亡觸發 LOST", () => { expect(resolveOutcome(0, 50, false)).toBe("LOST_PLAYER"); });
  it("核心死亡觸發 LOST", () => { expect(resolveOutcome(100, 0, false)).toBe("LOST_CORE"); });

  it("所有敵人死亡後才完成目前波", () => {
    const waves = new WaveManager(); waves.start(); spawnWholeWave(waves); expect(waves.enemyDefeated()).toEqual([]); expect(waves.enemyDefeated()).toEqual([]); expect(waves.enemyDefeated()[0]?.type).toBe("intermission");
  });

  it("最終波完成觸發 WON", () => { expect(resolveOutcome(42, 18, true)).toBe("WON"); });

  it("Aim Assist 不會鎖定已死亡敵人", () => {
    const target = selectAimTarget([{ id: "dead", dead: true, attackingCore: true, screenAngle: .01, distance: 1 }, { id: "live", dead: false, attackingCore: false, screenAngle: .1, distance: 4 }], .2);
    expect(target?.id).toBe("live");
  });

  it("爆破無人機接近核心後先倒數，時間到先會引爆", () => {
    const engine = new NullEngine(); const scene = new Scene(engine); const root = new TransformNode("kamikaze-test", scene);
    const drone = new RaiderDrone(root, "kamikaze", 1, scene); const core = Vector3.Zero(); const player = new Vector3(0, 0, -3);
    try {
      root.position.set(0, 0, 3);
      expect(drone.update(0.1, player, core)).toBeNull(); expect(drone.state).toBe("AttackingCore"); expect(drone.consumeArmedSignal()).toBe(false);
      root.position.set(0, 0, 1);
      expect(drone.update(0.5, player, core)).toBeNull(); expect(drone.state).toBe("Holding"); expect(drone.dead).toBe(false); expect(drone.consumeArmedSignal()).toBe(true);
      const detonation = drone.update(0.56, player, core);
      expect(detonation?.target).toBe("core"); expect(drone.state).toBe("Dying"); expect(drone.dead).toBe(true);
      expect(shouldKamikazeDetonate(1, 0)).toBe(true); expect(kamikazeDamage(28, 1)).toBe(28); expect(kamikazeDamage(28, 2)).toBe(0);
    } finally { drone.releaseExtras(); scene.dispose(); engine.dispose(); }
  });

  it("暫停時所有遊戲計時停止", () => { const clock = new PausableClock(); clock.update(1); clock.paused = true; clock.update(5); expect(clock.elapsed).toBe(1); });

  it("Wave reset 會清除舊有敵人及進度", () => { const waves = new WaveManager(); waves.start(); spawnWholeWave(waves); waves.reset(); expect(waves.remaining).toBe(0); expect(waves.alive).toBe(0); expect(waves.waveIndex).toBe(-1); });

  it("Spawn 失敗會重新排隊而唔會產生幽靈敵人", () => { const waves = new WaveManager(); waves.start(); const event = waves.update(1)[0]; expect(event?.type).toBe("spawn"); if (event?.type === "spawn") waves.confirmSpawn(event.variant, false); expect(waves.alive).toBe(0); expect(waves.remaining).toBe(3); });

  it("角色移動會跟隨鏡頭方向旋轉", () => { const move = cameraRelativeMovement(0, 1, { x: 1, z: 0 }); expect(move.x).toBe(1); expect(move.z).toBe(0); });
});
