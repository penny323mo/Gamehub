import type { Achievement } from '../../config/achievements';
import styles from '../../styles/Achievements.module.css';

interface AchievementsProps {
  achievements: Achievement[];
  onClose: () => void;
}

export default function Achievements({ achievements, onClose }: AchievementsProps) {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🏆 成就</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.progress}>
          <span className={styles.progressText}>
            已解鎖: {unlocked.length} / {achievements.length}
          </span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.content}>
          {unlocked.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>✅ 已解鎖</h3>
              <div className={styles.grid}>
                {unlocked.map(a => (
                  <div key={a.id} className={`${styles.achievement} ${styles.unlocked}`}>
                    <span className={styles.icon}>{a.icon}</span>
                    <span className={styles.name}>{a.name}</span>
                    <span className={styles.description}>{a.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🔒 未解鎖</h3>
              <div className={styles.grid}>
                {locked.map(a => (
                  <div key={a.id} className={styles.achievement}>
                    <span className={styles.icon}>{a.icon}</span>
                    <span className={styles.name}>{a.name}</span>
                    <span className={styles.description}>{a.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
