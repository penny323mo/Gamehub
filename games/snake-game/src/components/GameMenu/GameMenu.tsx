import { useState } from 'react';
import type { GameMode, Difficulty, GameSettings } from '../../types/game';
import styles from '../../styles/GameMenu.module.css';

interface GameMenuProps {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onClose: () => void;
  dailyChallenge: { description: string; target: number } | null;
}

export default function GameMenu({
  onStart,
  settings,
  onUpdateSettings,
  onClose,
  dailyChallenge
}: GameMenuProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.difficulty);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleStart = () => {
    onUpdateSettings({ difficulty: selectedDifficulty });
    onStart(selectedMode, selectedDifficulty);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>🐍 NEON SNAKE</h2>

        {!showSettings && !showHelp ? (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🎮 遊戲模式</h3>
              <div className={styles.modes}>
                <button
                  className={`${styles.modeButton} ${selectedMode === 'CLASSIC' ? styles.active : ''}`}
                  onClick={() => setSelectedMode('CLASSIC')}
                >
                  <span className={styles.modeIcon}>🏆</span>
                  <span className={styles.modeName}>經典模式</span>
                  <span className={styles.modeDesc}>無限生命，玩到死為止</span>
                </button>
                <button
                  className={`${styles.modeButton} ${selectedMode === 'DAILY' ? styles.active : ''}`}
                  onClick={() => setSelectedMode('DAILY')}
                >
                  <span className={styles.modeIcon}>📅</span>
                  <span className={styles.modeName}>每日挑戰</span>
                  <span className={styles.modeDesc}>今日任務：{dailyChallenge?.description || '完成挑戰'}</span>
                </button>
                <button
                  className={`${styles.modeButton} ${selectedMode === 'TIMED' ? styles.active : ''}`}
                  onClick={() => setSelectedMode('TIMED')}
                >
                  <span className={styles.modeIcon}>⏱️</span>
                  <span className={styles.modeName}>限時模式</span>
                  <span className={styles.modeDesc}>90秒內拎最高分</span>
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>⚡ 難度</h3>
              <div className={styles.difficulties}>
                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(diff => (
                  <button
                    key={diff}
                    className={`${styles.diffButton} ${selectedDifficulty === diff ? styles.active : ''}`}
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff === 'EASY' ? '😊 簡單' : diff === 'NORMAL' ? '🤔 普通' : '😈 困難'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.startButton} onClick={handleStart}>
                🚀 開始遊戲
              </button>
              <div className={styles.buttonRow}>
                <button className={styles.settingsButton} onClick={() => setShowSettings(true)}>
                  ⚙️ 設定
                </button>
                <button className={styles.helpButton} onClick={() => setShowHelp(true)}>
                  ❓ 操作說明
                </button>
              </div>
              <button className={styles.backButton} onClick={() => window.location.href = '../../../index.html'}>
                ← 返回 Game Hub
              </button>
            </div>
          </>
        ) : showHelp ? (
          <div className={styles.helpPanel}>
            <h3 className={styles.sectionTitle}>❓ 操作說明</h3>

            <div className={styles.helpSection}>
              <h4>⌨️ 鍵盤控制</h4>
              <p>⬆️⬇️⬅️➡️ 方向鍵 或 WASD - 移動蛇仔</p>
              <p>空格鍵 / P - 暫停遊戲</p>
              <p>Shift - 加速（按住）</p>
              <p>Enter - 開始遊戲 / 重新開始</p>
            </div>

            <div className={styles.helpSection}>
              <h4>👆 觸控/滑鼠</h4>
              <p>在遊戲板上滑動 - 改變方向</p>
              <p>⚡ 按鈕 - 加速（手機用）</p>
            </div>

            <div className={styles.helpSection}>
              <h4>🍎 食物效果</h4>
              <p>🍎 蘋果 - +10分</p>
              <p>💎 寶石 - +25分</p>
              <p>⚡ 加速 - 暫時加速</p>
              <p>🛡️ 護盾 - 擋一次傷害</p>
              <p>🌟 無敵 - 短暫無敵</p>
              <p>🔄 反向 - 控制反轉</p>
              <p>👻 幽靈 - 穿牆</p>
            </div>

            <button className={styles.backButton} onClick={() => setShowHelp(false)}>
              返回
            </button>
          </div>
        ) : (
          <div className={styles.settingsPanel}>
            <h3 className={styles.sectionTitle}>⚙️ 遊戲設定</h3>

            <div className={styles.settingItem}>
              <span>🔊 音效</span>
              <button
                className={`${styles.toggle} ${settings.soundEnabled ? styles.on : ''}`}
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              >
                {settings.soundEnabled ? '開' : '關'}
              </button>
            </div>

            <div className={styles.settingItem}>
              <span>📳 震動</span>
              <button
                className={`${styles.toggle} ${settings.vibrationEnabled ? styles.on : ''}`}
                onClick={() => onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
              >
                {settings.vibrationEnabled ? '開' : '關'}
              </button>
            </div>

            <button className={styles.backButton} onClick={() => setShowSettings(false)}>
              返回
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
