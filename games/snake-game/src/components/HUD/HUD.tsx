import styles from '../../styles/HUD.module.css';

interface HUDProps {
  score: number;
  level: number;
  lives: number;
  hasShield: boolean;
  isInvincible: boolean;
  levelName: string;
}

export default function HUD({ 
  score, 
  level, 
  lives, 
  hasShield, 
  isInvincible,
  levelName 
}: HUDProps) {
  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <span className={styles.label}>SCORE</span>
        <span className={styles.value}>{score.toString().padStart(6, '0')}</span>
      </div>
      
      <div className={styles.stat}>
        <span className={styles.label}>LEVEL</span>
        <span className={styles.value}>{level}</span>
        <span className={styles.levelName}>{levelName}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>LIVES</span>
        <div className={styles.lives}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.heart} ${i < lives ? styles.active : ''}`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      <div className={styles.powerups}>
        {hasShield && (
          <span className={styles.powerup} title="護盾">🛡️</span>
        )}
        {isInvincible && (
          <span className={`${styles.powerup} ${styles.invincible}`} title="無敵">🌟</span>
        )}
      </div>
    </div>
  );
}
