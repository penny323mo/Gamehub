export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type FoodType = 'NORMAL' | 'SPEED' | 'SHIELD' | 'GEM' | 'STAR' | 'REVERSE' | 'GHOST' | 'MAGNET' | 'DOUBLE';

export type ObstacleType = 'STATIC' | 'MOVING';

export type GameMode = 'CLASSIC' | 'DAILY' | 'TIMED';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface Food {
  position: Position;
  type: FoodType;
  expiresAt?: number;
}

export interface Obstacle {
  id: string;
  position: Position;
  type: ObstacleType;
  direction?: Direction;
}

export interface Level {
  id: number;
  name: string;
  speed: number;
  obstacles: Obstacle[];
  foodTypes: FoodType[];
  hasMovingObstacles: boolean;
  description?: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  type: 'eat_foods' | 'eat_gems' | 'survive_time' | 'score';
  reward: string;
  completed: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: Difficulty;
  customControls: Record<string, string>;
}

export interface GameState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Food | null;
  obstacles: Obstacle[];
  score: number;
  level: number;
  lives: number;
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  hasShield: boolean;
  isInvincible: boolean;
  isGhost: boolean;
  isReversed: boolean;
  isMagnet: boolean;
  isDoublePoints: boolean;
  invincibleUntil?: number;
  speedBoostUntil?: number;
  ghostUntil?: number;
  reverseUntil?: number;
  magnetUntil?: number;
  doubleUntil?: number;
  gameMode: GameMode;
  timeRemaining?: number;
  isSpeedBoost: boolean;
}

export interface ScoreEntry {
  score: number;
  level: number;
  date: string;
  mode?: GameMode;
}
