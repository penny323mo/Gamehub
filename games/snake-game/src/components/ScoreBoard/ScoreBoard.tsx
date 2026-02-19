import type { ScoreEntry } from '../../types/game';
import styles from '../../styles/ScoreBoard.module.css';

interface ScoreBoardProps {
  scores: ScoreEntry[];
  onClose: () => void;
  onClear: () => void;
}

export default function ScoreBoard({ scores, onClose, onClear }: ScoreBoardProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.board} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>🏆 積分榜</h2>
        
        {scores.length === 0 ? (
          <p className={styles.empty}>尚無記錄</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>分數</th>
                <th>關卡</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => (
                <tr key={index} className={index === 0 ? styles.first : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.score}</td>
                  <td>{entry.level}</td>
                  <td>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.actions}>
          {scores.length > 0 && (
            <button className={styles.clearButton} onClick={onClear}>
              清除記錄
            </button>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
