export function shouldKamikazeDetonate(distanceToCore: number, countdown: number): boolean {
  return distanceToCore <= 1.15 && countdown <= 0;
}

export function kamikazeDamage(baseDamage: number, distanceToCore: number): number {
  return distanceToCore <= 1.5 ? baseDamage : 0;
}
