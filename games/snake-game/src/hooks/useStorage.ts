import { useState, useEffect, useCallback } from 'react';
/* localStorage hydration is an external sync boundary, not derived render state. */
/* eslint-disable react-hooks/set-state-in-effect */
// 兩個 tab 共用同一個 `localStorage`：寫之前要讀返（見 merge-save.mjs）
// @ts-expect-error 共用層係 plain JS，冇 .d.ts
import { 改存檔 } from '../../../shared/js/merge-save.mjs';
import type { ScoreEntry, GameSettings } from '../types/game';
import { ACHIEVEMENTS, type SnakeSkinId } from '../config/achievements';

const CURRENT_USER_KEY = 'snake-game-current-user';
const USERS_KEY = 'snake-game-users';

const defaultSettings: GameSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  difficulty: 'NORMAL',
  customControls: {},
};

export interface UserProfile {
  name: string;
  scores: ScoreEntry[];
  achievements: typeof ACHIEVEMENTS;
  skin: SnakeSkinId;
  stats: GameStats;
  settings: GameSettings;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highestScore: number;
  highestLevel: number;
  foodsEaten: number;
  gemsEaten: number;
}

const defaultStats: GameStats = {
  gamesPlayed: 0,
  totalScore: 0,
  highestScore: 0,
  highestLevel: 1,
  foodsEaten: 0,
  gemsEaten: 0,
};

const defaultAchievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));

function createDefaultProfile(name: string): UserProfile {
  return {
    name,
    scores: [],
    achievements: defaultAchievements,
    skin: 'neon_green',
    stats: { ...defaultStats },
    settings: { ...defaultSettings },
  };
}

export function useStorage() {
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [currentSkin, setCurrentSkin] = useState<SnakeSkinId>('neon_green');
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        setUsers(parsed);
        
        if (storedCurrentUser && parsed[storedCurrentUser]) {
          const user = parsed[storedCurrentUser];
          setCurrentUserName(storedCurrentUser);
          setCurrentSkin(user.skin);
          setAchievements(user.achievements);
          setStats(user.stats);
          setScores(user.scores);
          setSettings(user.settings || defaultSettings);
        } else {
          setShowNameInput(true);
        }
      } catch {
        setShowNameInput(true);
      }
    } else {
      setShowNameInput(true);
    }
  }, []);

  /*
   * 寫之前要讀返 storage。
   *
   * `prev` 係開場讀落 React state 嗰份。`localStorage` 係成個 origin 共用嘅
   * ——另一個 tab 喺呢段時間打完嘅局，喺 `prev` 入面唔存在。就咁 `{...prev}`
   * 寫返出去就會食咗佢。實測（`tests/hub-tabs.mjs`）：兩個 tab 各打完一局,
   * `gamesPlayed` 由 0 → 1 → **1**——第二局食咗第一局。
   *
   * 所以基底由 storage 攞（`改存檔` 幫手讀＋寫），唔係由 `prev` 攞。
   * 同一個 tab 入面兩者一路同步（每次改完即刻寫），唯一嘅差異就係另一個
   * tab 寫低咗嘅嘢——而嗰樣正正係我哋要保住嘅。
   */
  const saveUserData = useCallback((updater: (profile: UserProfile) => UserProfile) => {
    setUsers(prev => {
      if (!currentUserName) return prev;

      const updated = 改存檔(USERS_KEY, (現時: Record<string, UserProfile>) => {
        const base = 現時?.[currentUserName] ?? prev[currentUserName] ?? createDefaultProfile(currentUserName);
        return { ...(現時 ?? {}), ...prev, ...現時, [currentUserName]: updater(base) };
      }, prev) as Record<string, UserProfile>;
      return updated;
    });
  }, [currentUserName]);

  const login = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    /*
     * 登入都要由 storage 出發，唔可以由 `prev` 出發。
     *
     * **呢個先係真兇。** 第一次修淨係改咗 `saveUserData`，兩個 tab 嘅
     * `gamesPlayed` 照樣得一局。dump 落去先見到：第二個 tab 掛載嗰陣
     * storage 仲係空（第一個 tab 未入名），所以佢個 `prev` 係 `{}`
     * ——一登入就將個空物件寫返出去，**抹咗第一個 tab 成個 profile**,
     * 跟住先至打自己嗰局。
     *
     * 同 Royale 一模一樣嘅教訓（ADR-232）：**唔係得「睇落似會出事」嗰個
     * 寫入會蓋，係每一個由記憶體快照出發嘅寫入都會蓋。**
     */
    setUsers(() => {
      const updated = 改存檔(USERS_KEY, (現時: Record<string, UserProfile>) => {
        const base = { ...(現時 ?? {}) };
        if (!base[trimmedName]) base[trimmedName] = createDefaultProfile(trimmedName);
        return base;
      }, {}) as Record<string, UserProfile>;
      localStorage.setItem(CURRENT_USER_KEY, trimmedName);
      return updated;
    });
    
    setCurrentUserName(trimmedName);
    setShowNameInput(false);
    
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const user = storedUsers[trimmedName];
      if (user) {
        setCurrentSkin(user.skin);
        setAchievements(user.achievements);
        setStats(user.stats);
        setScores(user.scores);
      }
    }, 0);
  }, []);

  const logout = useCallback(() => {
    setCurrentUserName('');
    setShowNameInput(true);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  const saveScore = useCallback((score: number, level: number) => {
    const newEntry: ScoreEntry = {
      score,
      level,
      date: new Date().toLocaleDateString('zh-TW'),
    };
    
    saveUserData(profile => {
      const updatedScores = [...profile.scores, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      setScores(updatedScores);
      
      return {
        ...profile,
        scores: updatedScores,
        stats: {
          ...profile.stats,
          gamesPlayed: profile.stats.gamesPlayed + 1,
          totalScore: profile.stats.totalScore + score,
          highestScore: Math.max(profile.stats.highestScore, score),
          highestLevel: Math.max(profile.stats.highestLevel, level),
        },
      };
    });
  }, [saveUserData]);

  const clearScores = useCallback(() => {
    saveUserData(profile => {
      const updated = { ...profile, scores: [] };
      setScores([]);
      return updated;
    });
  }, [saveUserData]);

  const unlockAchievement = useCallback((id: string) => {
    saveUserData(profile => {
      const updatedAchievements = profile.achievements.map(a => 
        a.id === id ? { ...a, unlocked: true } : a
      );
      setAchievements(updatedAchievements);
      return { ...profile, achievements: updatedAchievements };
    });
  }, [saveUserData]);

  const changeSkin = useCallback((skinId: SnakeSkinId) => {
    setCurrentSkin(skinId);
    saveUserData(profile => ({
      ...profile,
      skin: skinId,
    }));
  }, [saveUserData]);

  const updateStats = useCallback((newStats: Partial<GameStats>) => {
    saveUserData(profile => ({
      ...profile,
      stats: { ...profile.stats, ...newStats },
    }));
  }, [saveUserData]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveUserData(profile => ({
        ...profile,
        settings: updated,
      }));
      return updated;
    });
  }, [saveUserData]);

  return { 
    currentUserName,
    users,
    scores, 
    saveScore, 
    clearScores, 
    achievements, 
    unlockAchievement,
    currentSkin,
    changeSkin,
    stats,
    updateStats,
    settings,
    updateSettings,
    showNameInput,
    setShowNameInput,
    login,
    logout,
  };
}
