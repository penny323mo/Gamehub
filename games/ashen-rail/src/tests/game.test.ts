import { describe, expect, it } from "vitest";
import { GameStateMachine } from "../game/state/GameStateMachine";
import { resolveOutcome } from "../game/state/OutcomeResolver";
import { WaveManager } from "../game/systems/WaveManager";
import { selectAimTarget } from "../game/combat/aimAssist";
import { kamikazeDamage, shouldKamikazeDetonate } from "../game/entities/kamikaze";
import { PausableClock } from "../game/systems/PausableClock";
import { GameSessionModel } from "../game/systems/GameSessionModel";

function spawnWholeWave(manager: WaveManager): void {
  for (let index = 0; index < 30 && manager.remaining > manager.alive; index += 1) manager.update(1.2);
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

  it("爆破無人機接近核心並完成倒數後造成傷害", () => { expect(shouldKamikazeDetonate(1, 0)).toBe(true); expect(kamikazeDamage(28, 1)).toBe(28); expect(kamikazeDamage(28, 2)).toBe(0); });

  it("暫停時所有遊戲計時停止", () => { const clock = new PausableClock(); clock.update(1); clock.paused = true; clock.update(5); expect(clock.elapsed).toBe(1); });

  it("重新開始會清除舊有敵人及狀態", () => { const session = new GameSessionModel(); session.enemies.add("drone-1"); session.state = "LOST"; session.reset(); expect(session.enemies.size).toBe(0); expect(session.state).toBe("READY"); });
});
