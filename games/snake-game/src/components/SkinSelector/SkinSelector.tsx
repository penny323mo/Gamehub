import type { SnakeSkinId } from '../../config/achievements';
import { SNAKE_SKINS } from '../../config/achievements';
import styles from '../../styles/SkinSelector.module.css';

interface SkinSelectorProps {
  currentSkin: SnakeSkinId;
  onSelect: (skinId: SnakeSkinId) => void;
  onClose: () => void;
}

export default function SkinSelector({ currentSkin, onSelect, onClose }: SkinSelectorProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎨 蛇仔主題</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            {SNAKE_SKINS.map(skin => (
              <button
                key={skin.id}
                className={`${styles.skinButton} ${currentSkin === skin.id ? styles.active : ''}`}
                onClick={() => onSelect(skin.id)}
              >
                <div 
                  className={styles.preview}
                  style={{
                    background: skin.color === 'rainbow' 
                      ? 'linear-gradient(45deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #7700ff)'
                      : skin.color,
                  }}
                >
                  {skin.color === 'rainbow' && <span className={styles.rainbowText}>🐍</span>}
                  {skin.color !== 'rainbow' && <span className={styles.snakeEmoji}>🐍</span>}
                </div>
                <span className={styles.skinName}>{skin.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
