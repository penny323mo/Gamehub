import type { Food } from '../../types/game';
import styles from '../../styles/Food.module.css';

interface FoodProps {
  food: Food;
  gridSize: number;
}

const FOOD_ICONS: Record<string, string> = {
  NORMAL: '🍎',
  GEM: '💎',
  SPEED: '⚡',
  SHIELD: '🛡️',
  STAR: '🌟',
  REVERSE: '🔄',
  GHOST: '👻',
  MAGNET: '🧲',
  DOUBLE: '2️⃣',
};

const FOOD_COLORS: Record<string, string> = {
  NORMAL: '#ff6b6b',
  GEM: '#ffd93d',
  SPEED: '#6bcb77',
  SHIELD: '#4d96ff',
  STAR: '#ff6bff',
  REVERSE: '#ff9f43',
  GHOST: '#a29bfe',
  MAGNET: '#fd79a8',
  DOUBLE: '#00cec9',
};

export default function FoodComponent({ food, gridSize }: FoodProps) {
  const cellSize = 100 / gridSize;
  const color = FOOD_COLORS[food.type] || '#ff6b6b';

  return (
    <div
      className={`${styles.food} ${styles[food.type.toLowerCase()]}`}
      style={{
        left: `${food.position.x * cellSize}%`,
        top: `${food.position.y * cellSize}%`,
        width: `${cellSize}%`,
        height: `${cellSize}%`,
        '--food-color': color,
      } as React.CSSProperties}
    >
      <div className={styles.foodAura} />
      <span className={styles.icon}>{FOOD_ICONS[food.type]}</span>
    </div>
  );
}
