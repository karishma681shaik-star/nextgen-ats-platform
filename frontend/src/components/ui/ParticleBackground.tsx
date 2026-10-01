import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

export const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 12 : 32;

    const items = Array.from({ length: count }, (_, i) => {
      const isIndigo = i % 3 === 0;
      const isPurple = i % 3 === 1;
      const color = isIndigo 
        ? 'rgba(129, 140, 248, 0.45)' 
        : isPurple 
        ? 'rgba(192, 132, 252, 0.45)' 
        : 'rgba(56, 189, 248, 0.4)';

      return {
        id: i,
        size: Math.random() * 2.5 + 1.2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 8 + Math.random() * 8,
        delay: Math.random() * -10, // Start animation in the middle
        opacity: Math.random() * 0.5 + 0.25,
        color,
      };
    });

    setParticles(items);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full particle-dot"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            filter: 'blur(0.5px)',
            '--px': `${(Math.random() - 0.5) * 60}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
export default ParticleBackground;
