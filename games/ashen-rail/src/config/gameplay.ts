export const GAMEPLAY = {
  player: { maxHealth: 100, speed: 4.3, dodgeSpeed: 13, dodgeDuration: 0.23, dodgeCooldown: 1.45, invincibility: 0.42 },
  core: { maxHealth: 100 },
  weapon: { magazine: 6, shotsPerSecond: 1.8, damage: 52, reloadSeconds: 1.45, range: 38, aimAssistAngle: 0.52 },
  drone: { health: 100, eliteHealth: 150, speed: 2.4, attackInterval: 2.1, projectileSpeed: 5.3, contactDamage: 28 },
  trainRoof: { width: 5.6, length: 17.2 },
  tutorialSeconds: 14,
  intermissionSeconds: 5
} as const;
