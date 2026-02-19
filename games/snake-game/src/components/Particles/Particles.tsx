import { useEffect, useState } from 'react';
import type { Position } from '../../types/game';
import styles from '../../styles/Particles.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface ParticlesProps {
  position: Position | null;
  color: string;
  gridSize: number;
  trigger: number;
}

export default function Particles({ position, color, gridSize, trigger }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (position && trigger > 0) {
      const newParticles: Particle[] = [];
      const cellSize = 100 / gridSize;
      
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 20 + Math.random() * 30;
        newParticles.push({
          id: Date.now() + i,
          x: position.x * cellSize + 50 + Math.cos(angle) * distance,
          y: position.y * cellSize + 50 + Math.sin(angle) * distance,
          color: color,
          size: 4 + Math.random() * 6,
        });
      }
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, position, color, gridSize]);

  if (particles.length === 0) return null;

  return (
    <div className={styles.particles}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}
