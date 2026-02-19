import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Position, Direction, Food, Level, Obstacle, GameMode, GameSettings } from '../../types/game';

const playSoundEffect = (type: 'eat' | 'die' | 'powerup' | 'levelup' | 'gem' | 'hit' | 'pause' | 'tick', settings: GameSettings) => {
  if (!settings.soundEnabled) return;

  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'eat':
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(20);
        break;
      case 'gem':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(30);
        break;
      case 'die':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        break;
      case 'powerup':
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
        break;
      case 'levelup':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        break;
      case 'hit':
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
        break;
      case 'pause':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'tick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch (e) { }
};
import { useGameLoop } from '../../hooks/useGameLoop';
import { useStorage } from '../../hooks/useStorage';
import { LEVELS, GRID_SIZE, INITIAL_LIVES, SCORE_PER_FOOD, SCORE_PER_GEM, INVINCIBLE_DURATION, SPEED_DURATION, POWERUP_DURATION } from '../../config/gameConfig';
import Snake from '../Snake/Snake';
import FoodComponent from '../Food/Food';
import ObstacleComponent from '../Obstacle/Obstacle';
import HUD from '../HUD/HUD';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Particles from '../Particles/Particles';
import Achievements from '../Achievements/Achievements';
import SkinSelector from '../SkinSelector/SkinSelector';
import NameInput from '../NameInput/NameInput';
import GameMenu from '../GameMenu/GameMenu';
import Background from '../Background/Background';
import styles from '../../styles/Game.module.css';

const TIMED_MODE_DURATION = 90;

const getRandomPosition = (exclude: Position[]): Position => {
  let pos: Position;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (exclude.some(p => p.x === pos.x && p.y === pos.y) && attempts < 100);
  return pos;
};

const getOppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case 'UP': return 'DOWN';
    case 'DOWN': return 'UP';
    case 'LEFT': return 'RIGHT';
    case 'RIGHT': return 'LEFT';
  }
};

export default function Game() {
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const prevStateRef = useRef<GameState | null>(null);

  function initializeGame(level: number): GameState {
    const levelData = LEVELS[level - 1] || LEVELS[0];
    const obstacles = JSON.parse(JSON.stringify(levelData.obstacles));
    obstaclesRef.current = obstacles;

    return {
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: null,
      obstacles: obstacles,
      score: 0,
      level,
      lives: INITIAL_LIVES,
      isRunning: false,
      isPaused: false,
      isGameOver: false,
      hasShield: false,
      isInvincible: false,
      isGhost: false,
      isReversed: false,
      isMagnet: false,
      isDoublePoints: false,
      gameMode: 'CLASSIC',
      isSpeedBoost: false,
    };
  }

  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
  const {
    currentUserName,
    scores,
    saveScore,
    clearScores,
    achievements,
    currentSkin,
    changeSkin,
    showNameInput,
    login,
    settings,
    updateSettings,
  } = useStorage();
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(true);
  const [particleTrigger, _setParticleTrigger] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [timeRemaining, setTimeRemaining] = useState<number>(TIMED_MODE_DURATION);

  const spawnFood = useCallback((snake: Position[], obstacles: Obstacle[]): Food => {
    const occupied = [...snake, ...obstacles.map(o => o.position)];
    const availableTypes = currentLevel.foodTypes;
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    return {
      position: getRandomPosition(occupied),
      type,
    };
  }, [currentLevel]);

  const moveObstacles = useCallback((obstacles: Obstacle[]): Obstacle[] => {
    if (!currentLevel.hasMovingObstacles) return obstacles;

    return obstacles.map(obs => {
      if (obs.type !== 'MOVING') return obs;

      let newPos = { ...obs.position };
      let newDir = obs.direction || 'RIGHT';

      const move = () => {
        switch (newDir) {
          case 'RIGHT':
            newPos.x++;
            if (newPos.x >= GRID_SIZE - 1) {
              newDir = 'LEFT';
              newPos.x = GRID_SIZE - 1;
            }
            break;
          case 'LEFT':
            newPos.x--;
            if (newPos.x <= 1) {
              newDir = 'RIGHT';
              newPos.x = 1;
            }
            break;
          case 'DOWN':
            newPos.y++;
            if (newPos.y >= GRID_SIZE - 1) {
              newDir = 'UP';
              newPos.y = GRID_SIZE - 1;
            }
            break;
          case 'UP':
            newPos.y--;
            if (newPos.y <= 1) {
              newDir = 'DOWN';
              newPos.y = 1;
            }
            break;
        }
      };

      move();

      return {
        ...obs,
        position: newPos,
        direction: newDir,
      };
    });
  }, [currentLevel.hasMovingObstacles]);

  const gameTick = useCallback(() => {
    setGameState(prev => {
      if (!prev.isRunning || prev.isPaused || prev.isGameOver) return prev;

      const now = Date.now();
      let newInvincible = prev.isInvincible;
      // let newSpeedBoost = prev.speedBoostUntil ? prev.speedBoostUntil > now : false;

      if (prev.invincibleUntil && prev.invincibleUntil < now) {
        newInvincible = false;
      }

      const isGhost = prev.ghostUntil ? prev.ghostUntil > now : false;
      const isReversed = prev.reverseUntil ? prev.reverseUntil > now : false;
      const isMagnet = prev.magnetUntil ? prev.magnetUntil > now : false;
      const isDouble = prev.doubleUntil ? prev.doubleUntil > now : false;

      let newSnake = [...prev.snake];
      const head = { ...newSnake[0] };
      const nextDir = prev.nextDirection !== getOppositeDirection(prev.direction)
        ? prev.nextDirection
        : prev.direction;

      switch (nextDir) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (prev.isInvincible || prev.hasShield) {
          if (prev.hasShield) {
            return { ...prev, hasShield: false };
          }
        } else {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveScore(prev.score, prev.level);
            return { ...prev, lives: 0, isGameOver: true, isRunning: false };
          }
          return {
            ...prev,
            lives: newLives,
            snake: [
              { x: 10, y: 10 },
              { x: 9, y: 10 },
              { x: 8, y: 10 },
            ],
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
          };
        }
      }

      const collisionWithSelf = newSnake.slice(0, -1).some(seg => seg.x === head.x && seg.y === head.y);
      if (collisionWithSelf) {
        if (prev.isInvincible || prev.hasShield) {
          if (prev.hasShield) {
            return { ...prev, hasShield: false };
          }
        } else {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveScore(prev.score, prev.level);
            return { ...prev, lives: 0, isGameOver: true, isRunning: false };
          }
          return {
            ...prev,
            lives: newLives,
            snake: [
              { x: 10, y: 10 },
              { x: 9, y: 10 },
              { x: 8, y: 10 },
            ],
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
          };
        }
      }

      const newObstacles = moveObstacles(prev.obstacles);
      obstaclesRef.current = newObstacles;

      const collisionWithObstacle = newObstacles.some(obs =>
        obs.position.x === head.x && obs.position.y === head.y
      );
      if (collisionWithObstacle) {
        if (prev.isInvincible) {
        } else if (prev.hasShield) {
          return { ...prev, hasShield: false };
        } else {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            saveScore(prev.score, prev.level);
            return { ...prev, lives: 0, isGameOver: true, isRunning: false };
          }
          return {
            ...prev,
            lives: newLives,
            obstacles: newObstacles,
            snake: [
              { x: 10, y: 10 },
              { x: 9, y: 10 },
              { x: 8, y: 10 },
            ],
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
          };
        }
      }

      newSnake.unshift(head);

      let newScore = prev.score;
      let newFood = prev.food;
      let newHasShield = prev.hasShield;
      let newInvincibleUntil = prev.invincibleUntil;
      let newSpeedBoostUntil = prev.speedBoostUntil;
      let newGhostUntil = prev.ghostUntil;
      let newReverseUntil = prev.reverseUntil;
      let newMagnetUntil = prev.magnetUntil;
      let newDoubleUntil = prev.doubleUntil;
      let shouldAdvanceLevel = false;

      if (prev.food && head.x === prev.food.position.x && head.y === prev.food.position.y) {
        const isDoubleActive = prev.doubleUntil ? prev.doubleUntil > now : false;
        const multiplier = isDoubleActive ? 2 : 1;

        switch (prev.food.type) {
          case 'NORMAL':
            newScore += SCORE_PER_FOOD * multiplier;
            break;
          case 'GEM':
            newScore += SCORE_PER_GEM * multiplier;
            break;
          case 'SHIELD':
            newHasShield = true;
            break;
          case 'STAR':
            newInvincibleUntil = now + INVINCIBLE_DURATION;
            newInvincible = true;
            break;
          case 'SPEED':
            newSpeedBoostUntil = now + SPEED_DURATION;
            break;
          case 'REVERSE':
            newReverseUntil = now + POWERUP_DURATION;
            break;
          case 'GHOST':
            newGhostUntil = now + POWERUP_DURATION;
            break;
          case 'MAGNET':
            newMagnetUntil = now + POWERUP_DURATION;
            break;
          case 'DOUBLE':
            newDoubleUntil = now + POWERUP_DURATION;
            break;
        }
        newFood = spawnFood(newSnake, newObstacles);

        if (newScore >= prev.level * 200 && prev.level < LEVELS.length) {
          shouldAdvanceLevel = true;
        }
      } else {
        newSnake.pop();
      }

      if (shouldAdvanceLevel) {
        const nextLevel = prev.level + 1;
        const newLevelData = LEVELS[nextLevel - 1];
        obstaclesRef.current = JSON.parse(JSON.stringify(newLevelData.obstacles));
        return {
          ...prev,
          snake: newSnake,
          direction: nextDir,
          food: newFood,
          obstacles: obstaclesRef.current,
          score: newScore,
          level: nextLevel,
          hasShield: newHasShield,
          isInvincible: newInvincible,
          invincibleUntil: newInvincibleUntil,
          speedBoostUntil: newSpeedBoostUntil,
          isGhost,
          isReversed,
          isMagnet,
          isDoublePoints: isDouble,
          ghostUntil: newGhostUntil,
          reverseUntil: newReverseUntil,
          magnetUntil: newMagnetUntil,
          doubleUntil: newDoubleUntil,
        };
      }

      return {
        ...prev,
        snake: newSnake,
        direction: nextDir,
        food: newFood,
        obstacles: newObstacles,
        score: newScore,
        hasShield: newHasShield,
        isInvincible: newInvincible,
        invincibleUntil: newInvincibleUntil,
        speedBoostUntil: newSpeedBoostUntil,
        isGhost,
        isReversed,
        isMagnet,
        isDoublePoints: isDouble,
        ghostUntil: newGhostUntil,
        reverseUntil: newReverseUntil,
        magnetUntil: newMagnetUntil,
        doubleUntil: newDoubleUntil,
      };
    });
  }, [currentLevel, moveObstacles, saveScore, spawnFood]);

  useEffect(() => {
    if (gameState.food === null && gameState.isRunning) {
      setGameState(prev => ({
        ...prev,
        food: spawnFood(prev.snake, prev.obstacles),
      }));
    }
  }, [gameState.food, gameState.isRunning, spawnFood]);

  const currentSpeed = (gameState.speedBoostUntil && gameState.speedBoostUntil > Date.now()) || gameState.isSpeedBoost
    ? currentLevel.speed * 0.5
    : currentLevel.speed;

  useGameLoop(gameTick, currentSpeed, gameState.isRunning && !gameState.isPaused);

  useEffect(() => {
    const levelData = LEVELS[gameState.level - 1] || LEVELS[0];
    setCurrentLevel(levelData);
  }, [gameState.level]);

  useEffect(() => {
    const prev = prevStateRef.current;
    if (prev && gameState.isGameOver && !prev.isGameOver) {
      playSoundEffect('die', settings);
    } else if (prev && gameState.level > prev.level) {
      playSoundEffect('levelup', settings);
    } else if (prev && gameState.score > prev.score) {
      const scoreDiff = gameState.score - prev.score;
      if (scoreDiff === SCORE_PER_GEM) {
        playSoundEffect('gem', settings);
      } else if (scoreDiff === SCORE_PER_FOOD) {
        playSoundEffect('eat', settings);
      } else if (prev && (gameState.hasShield !== prev.hasShield ||
        gameState.isInvincible !== prev.isInvincible ||
        gameState.speedBoostUntil !== prev.speedBoostUntil)) {
        playSoundEffect('powerup', settings);
      }

      if (prev && prev.lives > gameState.lives && gameState.lives > 0) {
        playSoundEffect('hit', settings);
      }
    }
    prevStateRef.current = gameState;
  }, [gameState, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (gameState.isGameOver) {
        if (e.key === 'Enter') {
          setGameState(initializeGame(1));
        }
        return;
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        setGameState(prev => {
          playSoundEffect('pause', settings);
          return { ...prev, isPaused: !prev.isPaused };
        });
        return;
      }

      if (e.key === 'Shift') {
        setGameState(prev => ({ ...prev, isSpeedBoost: true }));
        return;
      }

      if (!gameState.isRunning) {
        if (e.key === 'Enter') {
          setGameState(prev => ({ ...prev, isRunning: true }));
        }
        return;
      }

      setGameState(prev => {
        const currentDir = prev.nextDirection !== getOppositeDirection(prev.direction)
          ? prev.nextDirection
          : prev.direction;

        let newDir: Direction | null = null;

        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            if (currentDir !== 'DOWN') newDir = 'UP';
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            if (currentDir !== 'UP') newDir = 'DOWN';
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (currentDir !== 'RIGHT') newDir = 'LEFT';
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (currentDir !== 'LEFT') newDir = 'RIGHT';
            break;
        }

        if (newDir) {
          return { ...prev, nextDirection: newDir };
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, gameState.isRunning]);

  useEffect(() => {
    const gameBoard = document.querySelector(`.${styles.gameBoard}`);
    if (!gameBoard) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState.isGameOver || !gameState.isRunning) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 30;

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      setGameState(prev => {
        const currentDir = prev.nextDirection !== getOppositeDirection(prev.direction)
          ? prev.nextDirection
          : prev.direction;

        let newDir: Direction | null = null;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && currentDir !== 'LEFT') newDir = 'RIGHT';
          else if (dx < 0 && currentDir !== 'RIGHT') newDir = 'LEFT';
        } else {
          if (dy > 0 && currentDir !== 'UP') newDir = 'DOWN';
          else if (dy < 0 && currentDir !== 'DOWN') newDir = 'UP';
        }

        if (newDir) {
          return { ...prev, nextDirection: newDir };
        }
        return prev;
      });

      touchStartRef.current = null;
    };

    gameBoard.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    gameBoard.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

    return () => {
      gameBoard.removeEventListener('touchstart', handleTouchStart as EventListener);
      gameBoard.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [gameState.isGameOver, gameState.isRunning]);

  const startGame = () => {
    setShowGameMenu(false);
    setGameState(initializeGame(1));
    if (gameMode === 'TIMED') {
      setTimeRemaining(TIMED_MODE_DURATION);
    }
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isRunning: true }));
    }, 100);
  };

  useEffect(() => {
    if (gameMode === 'TIMED' && gameState.isRunning && !gameState.isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState(prev => ({ ...prev, isGameOver: true, isRunning: false }));
            return 0;
          }
          if (prev % 10 === 0) {
            playSoundEffect('tick', settings);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameMode, gameState.isRunning, gameState.isPaused]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setGameState(prev => ({ ...prev, isSpeedBoost: false }));
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  if (showNameInput) {
    return <NameInput onLogin={login} />;
  }

  return (
    <div className={styles.container}>
      <Background weather="none" />
      <div className={styles.gameWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>🐍 NEON SNAKE</h1>
          <div className={styles.headerStats}>
            <span className={styles.userName}>👤 {currentUserName}</span>
            <button
              className={styles.menuButton}
              onClick={() => setShowSkinSelector(true)}
            >
              SKIN
            </button>
            <button
              className={styles.menuButton}
              onClick={() => setShowAchievements(true)}
            >
              🏆
            </button>
            <button
              className={styles.scoreButton}
              onClick={() => setShowScoreBoard(true)}
            >
              SCORES
            </button>
          </div>
        </div>

        <HUD
          score={gameState.score}
          level={gameState.level}
          lives={gameState.lives}
          hasShield={gameState.hasShield}
          isInvincible={gameState.isInvincible}
          levelName={currentLevel.name}
        />

        <div className={styles.gameBoard}>
          <div className={styles.grid}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className={styles.cell} />
            ))}
          </div>

          <ObstacleComponent obstacles={gameState.obstacles} gridSize={GRID_SIZE} />

          {gameState.food && (
            <FoodComponent food={gameState.food} gridSize={GRID_SIZE} />
          )}

          <Particles
            position={gameState.food?.position || null}
            color="#ffd93d"
            gridSize={GRID_SIZE}
            trigger={particleTrigger}
          />

          <Snake
            snake={gameState.snake}
            gridSize={GRID_SIZE}
            isInvincible={gameState.isInvincible}
            skin={currentSkin}
          />

          {!gameState.isRunning && !gameState.isGameOver && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>NEON SNAKE</h2>
              <p className={styles.overlayText}>按 ENTER 開始遊戲</p>
              <p className={styles.overlaySubtext}>方向鍵 / WASD 控制移動</p>
              <p className={styles.overlaySubtext}>空格鍵 暫停</p>
            </div>
          )}

          {gameState.isPaused && gameState.isRunning && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>PAUSED</h2>
              <p className={styles.overlayText}>按 空格鍵 繼續</p>
              <button
                className={styles.restartButton}
                onClick={() => setGameState(prev => ({ ...prev, isPaused: false }))}
                style={{ marginBottom: '10px' }}
              >
                ▶ 繼續
              </button>
              <button
                className={styles.restartButton}
                onClick={() => window.location.href = '../../../index.html'}
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                🏠 返回 Game Hub
              </button>
            </div>
          )}

          {gameState.isGameOver && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>GAME OVER</h2>
              <p className={styles.overlayText}>最終分數: {gameState.score}</p>
              <p className={styles.overlayText}>關卡: {gameState.level}</p>
              <p className={styles.overlayText}>按 ENTER 重新開始</p>
              <button className={styles.restartButton} onClick={startGame}>
                重新開始
              </button>
            </div>
          )}
        </div>
      </div>

      {showScoreBoard && (
        <ScoreBoard
          scores={scores}
          onClose={() => setShowScoreBoard(false)}
          onClear={clearScores}
        />
      )}

      {showAchievements && (
        <Achievements
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showGameMenu && (
        <GameMenu
          onStart={(mode, _diff) => {
            setGameMode(mode);
            setShowGameMenu(false);
            setGameState(initializeGame(1));
            if (mode === 'TIMED') {
              setTimeRemaining(TIMED_MODE_DURATION);
            }
            setTimeout(() => {
              setGameState(prev => ({ ...prev, isRunning: true }));
            }, 100);
          }}
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowGameMenu(false)}
          dailyChallenge={null}
        />
      )}

      {showSkinSelector && (
        <SkinSelector
          currentSkin={currentSkin}
          onSelect={changeSkin}
          onClose={() => setShowSkinSelector(false)}
        />
      )}

      {gameMode === 'TIMED' && gameState.isRunning && !gameState.isPaused && (
        <div className={styles.timer}>
          ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      )}

    </div>
  );
}
