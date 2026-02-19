import { useState, useEffect, useCallback } from 'react';
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

  const saveUserData = useCallback((updater: (profile: UserProfile) => UserProfile) => {
    setUsers(prev => {
      if (!currentUserName) return prev;
      
      const currentProfile = prev[currentUserName] || createDefaultProfile(currentUserName);
      const updated = { ...prev, [currentUserName]: updater(currentProfile) };
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [currentUserName]);

  const login = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setUsers(prev => {
      let updated = { ...prev };
      if (!updated[trimmedName]) {
        updated[trimmedName] = createDefaultProfile(trimmedName);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
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
