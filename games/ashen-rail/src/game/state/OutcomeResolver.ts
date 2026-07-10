export type Outcome = "CONTINUE" | "WON" | "LOST_PLAYER" | "LOST_CORE";

export function resolveOutcome(playerHealth: number, coreHealth: number, finalWaveComplete: boolean): Outcome {
  if (playerHealth <= 0) return "LOST_PLAYER";
  if (coreHealth <= 0) return "LOST_CORE";
  if (finalWaveComplete) return "WON";
  return "CONTINUE";
}
