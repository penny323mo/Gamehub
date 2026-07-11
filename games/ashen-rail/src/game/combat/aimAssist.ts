export interface AimCandidate { id: string; dead: boolean; attackingCore: boolean; screenAngle: number; distance: number; }
export interface DirectRayCandidate { id: string; dead: boolean; forwardDistance: number; perpendicularDistance: number; radius: number; }

export function selectAimTarget(candidates: readonly AimCandidate[], maxAngle: number): AimCandidate | null {
  return candidates
    .filter((candidate) => !candidate.dead && candidate.screenAngle <= maxAngle)
    .sort((a, b) => Number(b.attackingCore) - Number(a.attackingCore) || a.screenAngle - b.screenAngle || a.distance - b.distance)[0] ?? null;
}

export function selectDirectRayTarget(candidates: readonly DirectRayCandidate[]): DirectRayCandidate | null {
  return candidates.filter((candidate) => !candidate.dead && candidate.forwardDistance > 0 && candidate.perpendicularDistance <= candidate.radius).sort((a, b) => a.forwardDistance - b.forwardDistance)[0] ?? null;
}
