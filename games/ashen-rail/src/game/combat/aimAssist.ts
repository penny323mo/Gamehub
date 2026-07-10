export interface AimCandidate { id: string; dead: boolean; attackingCore: boolean; screenAngle: number; distance: number; }

export function selectAimTarget(candidates: readonly AimCandidate[], maxAngle: number): AimCandidate | null {
  return candidates
    .filter((candidate) => !candidate.dead && candidate.screenAngle <= maxAngle)
    .sort((a, b) => Number(b.attackingCore) - Number(a.attackingCore) || a.screenAngle - b.screenAngle || a.distance - b.distance)[0] ?? null;
}
