import type { Obstacle } from '../../types/game';
import styles from '../../styles/Obstacle.module.css';

interface ObstacleProps {
  obstacles: Obstacle[];
  gridSize: number;
}

export default function ObstacleComponent({ obstacles, gridSize }: ObstacleProps) {
  const cellSize = 100 / gridSize;

  return (
    <>
      {obstacles.map(obs => (
        <div
          key={obs.id}
          className={`${styles.obstacle} ${obs.type === 'MOVING' ? styles.moving : ''}`}
          style={{
            left: `${obs.position.x * cellSize}%`,
            top: `${obs.position.y * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
          }}
        />
      ))}
    </>
  );
}
