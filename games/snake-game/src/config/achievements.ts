export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: '初試身手', description: '完成第一場遊戲', icon: '🎮', unlocked: false },
  { id: 'score_100', name: '初露鋒芒', description: '單場獲得100分', icon: '💯', unlocked: false },
  { id: 'score_500', name: '蛇王', description: '單場獲得500分', icon: '👑', unlocked: false },
  { id: 'score_1000', name: '傳說蛇王', description: '單場獲得1000分', icon: '🏆', unlocked: false },
  { id: 'level_3', name: '小試牛刀', description: '晉級至第3關', icon: '⭐', unlocked: false },
  { id: 'level_5', name: '進階玩家', description: '晉級至第5關', icon: '🌟', unlocked: false },
  { id: 'level_6', name: '大師', description: '晉級至第6關', icon: '💫', unlocked: false },
  { id: 'no_damage', name: '完美主義', description: '單關零損傷通過', icon: '🛡️', unlocked: false },
  { id: 'eat_10', name: '貪吃蛇', description: '一次食10個食物', icon: '🍎', unlocked: false },
  { id: 'speed_demon', name: '速度之王', description: '用加速道具通過關卡', icon: '⚡', unlocked: false },
  { id: 'reverse_master', name: '逆向思維', description: '用反向道具通過關卡', icon: '🔄', unlocked: false },
  { id: 'ghost_mode', name: '幽靈附體', description: '用幽靈道具通過關卡', icon: '👻', unlocked: false },
  { id: 'combo_5', name: '連擊達人', description: '連續食5個Gem', icon: '💎', unlocked: false },
  { id: 'play_10', name: '老玩家', description: '完成10場遊戲', icon: '🎯', unlocked: false },
  { id: 'play_50', name: '中毒玩家', description: '完成50場遊戲', icon: '🎰', unlocked: false },
];

export const SNAKE_SKINS = [
  { id: 'neon_green', name: '霓虹綠', color: '#6bcb77', secondary: '#4ade80' },
  { id: 'neon_cyan', name: '霓虹青', color: '#00fff5', secondary: '#00d4ff' },
  { id: 'neon_pink', name: '霓虹粉', color: '#ff6bff', secondary: '#ff00ff' },
  { id: 'neon_orange', name: '霓虹橙', color: '#ff9f43', secondary: '#ff6b00' },
  { id: 'neon_blue', name: '霓虹藍', color: '#4d96ff', secondary: '#0066ff' },
  { id: 'neon_red', name: '霓虹紅', color: '#ff6b6b', secondary: '#ff0000' },
  { id: 'golden', name: '金色', color: '#ffd700', secondary: '#ffaa00' },
  { id: 'rainbow', name: '彩虹', color: 'rainbow', secondary: 'rainbow' },
];

export type SnakeSkinId = typeof SNAKE_SKINS[number]['id'];
