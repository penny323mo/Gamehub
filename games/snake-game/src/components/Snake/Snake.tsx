import type { Position } from '../../types/game';
import type { SnakeSkinId } from '../../config/achievements';
import { SNAKE_SKINS } from '../../config/achievements';
import styles from '../../styles/Snake.module.css';

interface SnakeProps {
  snake: Position[];
  gridSize: number;
  isInvincible: boolean;
  skin?: SnakeSkinId;
}

export default function Snake({ snake, gridSize, isInvincible, skin = 'neon_green' }: SnakeProps) {
  const cellSize = 100 / gridSize;
  const skinData = SNAKE_SKINS.find(s => s.id === skin) || SNAKE_SKINS[0];
  const isRainbow = skinData.color === 'rainbow';

  return (
    <>
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const isTail = index === snake.length - 1;
        const isBody = !isHead && !isTail;
        
        return (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`
              ${styles.snakeSegment} 
              ${isHead ? styles.head : ''} 
              ${isBody ? styles.body : ''}
              ${isTail ? styles.tail : ''}
              ${isInvincible ? styles.invincible : ''}
              ${isRainbow ? styles.rainbow : ''}
            `}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              zIndex: index + 1,
              transform: `scale(${isHead ? 0.95 : 0.85})`,
              background: isRainbow 
                ? undefined 
                : `linear-gradient(135deg, ${skinData.color}, ${skinData.secondary})`,
              boxShadow: isRainbow
                ? undefined
                : `0 0 8px ${skinData.color}, 0 0 15px ${skinData.color}80`,
            }}
          >
            {isHead && (
              <>
                <div className={styles.eye} />
                <div className={styles.glow} />
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
