import type { Level, Obstacle } from '../types/game';

function createObstacle(x: number, y: number, id: string): Obstacle {
  return { id, position: { x, y }, type: 'STATIC' };
}

function createMovingObstacle(x: number, y: number, id: string, dir: 'HORIZONTAL' | 'VERTICAL'): Obstacle {
  return { 
    id, 
    position: { x, y }, 
    type: 'MOVING',
    direction: dir === 'HORIZONTAL' ? 'RIGHT' : 'DOWN'
  };
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: '新手村',
    speed: 250,
    obstacles: [],
    foodTypes: ['NORMAL', 'GEM'],
    hasMovingObstacles: false,
    description: '熟悉基本操作',
  },
  {
    id: 2,
    name: '入門',
    speed: 220,
    obstacles: [
      createObstacle(5, 5, 'obs-1'),
      createObstacle(5, 6, 'obs-2'),
      createObstacle(5, 7, 'obs-3'),
      createObstacle(10, 10, 'obs-4'),
      createObstacle(10, 11, 'obs-5'),
      createObstacle(10, 12, 'obs-6'),
      createObstacle(15, 5, 'obs-7'),
      createObstacle(15, 6, 'obs-8'),
    ],
    foodTypes: ['NORMAL', 'GEM'],
    hasMovingObstacles: false,
    description: '避開障礙物',
  },
  {
    id: 3,
    name: '挑戰',
    speed: 180,
    obstacles: [
      createObstacle(3, 8, 'obs-1'),
      createObstacle(4, 8, 'obs-2'),
      createObstacle(5, 8, 'obs-3'),
      createObstacle(15, 8, 'obs-4'),
      createObstacle(16, 8, 'obs-5'),
      createObstacle(17, 8, 'obs-6'),
      createObstacle(8, 3, 'obs-7'),
      createObstacle(9, 3, 'obs-8'),
      createObstacle(10, 3, 'obs-9'),
      createObstacle(8, 15, 'obs-10'),
      createObstacle(9, 15, 'obs-11'),
      createObstacle(10, 15, 'obs-12'),
    ],
    foodTypes: ['NORMAL', 'GEM', 'SPEED', 'SHIELD'],
    hasMovingObstacles: false,
    description: '學用道具',
  },
  {
    id: 4,
    name: '專家',
    speed: 140,
    obstacles: [
      createMovingObstacle(3, 5, 'mov-1', 'HORIZONTAL'),
      createMovingObstacle(15, 10, 'mov-2', 'HORIZONTAL'),
      createMovingObstacle(10, 3, 'mov-3', 'VERTICAL'),
      createMovingObstacle(5, 15, 'mov-4', 'VERTICAL'),
      createObstacle(8, 8, 'obs-1'),
      createObstacle(9, 8, 'obs-2'),
      createObstacle(10, 8, 'obs-3'),
    ],
    foodTypes: ['NORMAL', 'GEM', 'SPEED', 'SHIELD', 'STAR', 'REVERSE'],
    hasMovingObstacles: true,
    description: '移動障礙物',
  },
  {
    id: 5,
    name: '大師',
    speed: 110,
    obstacles: [
      createMovingObstacle(2, 4, 'mov-1', 'HORIZONTAL'),
      createMovingObstacle(12, 4, 'mov-2', 'HORIZONTAL'),
      createMovingObstacle(2, 12, 'mov-3', 'HORIZONTAL'),
      createMovingObstacle(12, 12, 'mov-4', 'HORIZONTAL'),
      createMovingObstacle(7, 2, 'mov-5', 'VERTICAL'),
      createMovingObstacle(7, 16, 'mov-6', 'VERTICAL'),
    ],
    foodTypes: ['NORMAL', 'GEM', 'SPEED', 'SHIELD', 'STAR', 'REVERSE', 'GHOST'],
    hasMovingObstacles: true,
    description: '終極挑戰',
  },
  {
    id: 6,
    name: '地獄',
    speed: 80,
    obstacles: [
      createMovingObstacle(1, 4, 'mov-1', 'HORIZONTAL'),
      createMovingObstacle(18, 4, 'mov-2', 'HORIZONTAL'),
      createMovingObstacle(1, 10, 'mov-3', 'HORIZONTAL'),
      createMovingObstacle(18, 10, 'mov-4', 'HORIZONTAL'),
      createMovingObstacle(1, 16, 'mov-5', 'HORIZONTAL'),
      createMovingObstacle(18, 16, 'mov-6', 'HORIZONTAL'),
      createMovingObstacle(7, 1, 'mov-7', 'VERTICAL'),
      createMovingObstacle(12, 1, 'mov-8', 'VERTICAL'),
      createMovingObstacle(7, 18, 'mov-9', 'VERTICAL'),
      createMovingObstacle(12, 18, 'mov-10', 'VERTICAL'),
    ],
    foodTypes: ['NORMAL', 'GEM', 'SPEED', 'SHIELD', 'STAR', 'REVERSE', 'GHOST', 'MAGNET', 'DOUBLE'],
    hasMovingObstacles: true,
    description: '不可能既挑戰',
  },
];

export const GRID_SIZE = 20;
export const INITIAL_LIVES = 3;
export const SCORE_PER_FOOD = 10;
export const SCORE_PER_GEM = 25;
export const INVINCIBLE_DURATION = 8000;
export const SPEED_DURATION = 5000;
export const POWERUP_DURATION = 6000;

export const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000];
