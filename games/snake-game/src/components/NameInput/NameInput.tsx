import { useState } from 'react';
import styles from '../../styles/NameInput.module.css';

interface NameInputProps {
  onLogin: (name: string) => void;
}

export default function NameInput({ onLogin }: NameInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>🐍 NEON SNAKE</h2>
        <p className={styles.subtitle}>輸入你既名稱開始遊戲</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名稱"
            className={styles.input}
            maxLength={12}
            autoFocus
          />
          <button type="submit" className={styles.button}>
            開始遊戲 🎮
          </button>
        </form>
        
        <p className={styles.hint}>
          輸入名稱後，你的遊戲進度會自動儲存<br/>
          用同一個名稱登入即可繼續遊戲
        </p>
      </div>
    </div>
  );
}
