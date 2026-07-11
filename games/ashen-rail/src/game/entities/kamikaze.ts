export const KAMIKAZE_ARMING_DISTANCE = 1.15;

export function shouldKamikazeDetonate(distanceToCore: number, countdown: number): boolean {
  return distanceToCore <= KAMIKAZE_ARMING_DISTANCE && countdown <= 0;
}

export function kamikazeDamage(baseDamage: number, distanceToCore: number): number {
  return distanceToCore <= 1.5 ? baseDamage : 0;
}
