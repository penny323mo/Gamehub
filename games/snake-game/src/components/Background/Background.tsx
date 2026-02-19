import { useEffect, useState } from 'react';
import styles from '../../styles/Background.module.css';

type WeatherEffect = 'none' | 'rain' | 'snow' | 'thunder';

interface BackgroundProps {
  weather?: WeatherEffect;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface RainDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
  length: number;
}

interface SnowFlake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
}

export default function Background({ weather = 'none' }: BackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [snowFlakes, setSnowFlakes] = useState<SnowFlake[]>([]);
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 80; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      });
    }
    setStars(newStars);
  }, []);

  useEffect(() => {
    if (weather === 'rain') {
      const drops: RainDrop[] = [];
      for (let i = 0; i < 100; i++) {
        drops.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          speed: Math.random() * 15 + 10,
          length: Math.random() * 15 + 10,
        });
      }
      setRainDrops(drops);
    } else {
      setRainDrops([]);
    }
  }, [weather]);

  useEffect(() => {
    if (weather === 'snow') {
      const flakes: SnowFlake[] = [];
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          wobble: Math.random() * 10,
        });
      }
      setSnowFlakes(flakes);
    } else {
      setSnowFlakes([]);
    }
  }, [weather]);

  useEffect(() => {
    if (weather === 'thunder') {
      const interval = setInterval(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 150);
        setTimeout(() => {
          setLightning(true);
          setTimeout(() => setLightning(false), 100);
        }, 200);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [weather]);

  useEffect(() => {
    if (weather === 'rain' || weather === 'snow') {
      const interval = setInterval(() => {
        if (weather === 'rain') {
          setRainDrops(prev => prev.map(drop => ({
            ...drop,
            y: drop.y > 100 ? -10 : drop.y + drop.speed * 0.1,
          })));
        } else if (weather === 'snow') {
          setSnowFlakes(prev => prev.map(flake => ({
            ...flake,
            y: flake.y > 100 ? -10 : flake.y + flake.speed * 0.05,
            x: flake.x + Math.sin(flake.y * 0.1) * flake.wobble * 0.01,
          })));
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [weather]);

  return (
    <div className={styles.background}>
      <div className={styles.stars}>
        {stars.map(star => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {weather === 'rain' && (
        <div className={styles.rain}>
          {rainDrops.map(drop => (
            <div
              key={drop.id}
              className={styles.rainDrop}
              style={{
                left: `${drop.x}%`,
                top: `${drop.y}%`,
                height: `${drop.length}px`,
                animationDuration: `${20 / drop.speed}s`,
              }}
            />
          ))}
        </div>
      )}

      {weather === 'snow' && (
        <div className={styles.snow}>
          {snowFlakes.map(flake => (
            <div
              key={flake.id}
              className={styles.snowFlake}
              style={{
                left: `${flake.x}%`,
                top: `${flake.y}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                animationDuration: `${10 / flake.speed}s`,
              }}
            />
          ))}
        </div>
      )}

      {weather === 'thunder' && (
        <>
          <div className={`${styles.lightning} ${lightning ? styles.active : ''}`} />
          <div className={styles.thunderClouds}>
            <div className={styles.cloud} style={{ left: '10%' }} />
            <div className={styles.cloud} style={{ left: '30%' }} />
            <div className={styles.cloud} style={{ left: '50%' }} />
            <div className={styles.cloud} style={{ left: '70%' }} />
          </div>
        </>
      )}

      <div className={styles.grid} />
    </div>
  );
}
