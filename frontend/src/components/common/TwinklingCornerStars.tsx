import React, { useMemo } from 'react';

interface StarPoint {
  id: string;
  gridX: number; // in grid cells (14px each)
  gridY: number; // in grid cells (14px each)
  size: number;  // diameter in px
  color: string;
  animType: 'blink' | 'pulse' | 'shimmer';
  duration: number; // seconds
  delay: number;    // negative seconds for immediate staggered start
  hasFlare?: boolean;
}

// Helper to generate organic stars aligned to the 14px grid, concentrated strictly in the corner
function generateDownsideCornerStars(
  prefix: string,
  cols: number,
  rows: number,
  count: number
): StarPoint[] {
  const stars: StarPoint[] = [];
  const colors = [
    '#ffffff',
    '#c084fc',
    '#e0e7ff',
    '#818cf8',
    '#67e8f9',
    '#a855f7',
  ];
  const anims: Array<'blink' | 'pulse' | 'shimmer'> = ['blink', 'pulse', 'shimmer'];

  // Seeded deterministic pseudo-random generator
  let seed = prefix === 'br' ? 53 : 91;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const occupied = new Set<string>();

  for (let i = 0; i < count; i++) {
    let col = 0;
    let row = 0;
    let attempts = 0;

    do {
      attempts++;
      // High exponent (1.6) tightly concentrates dots right into the downside corner
      col = Math.floor(Math.pow(rand(), 1.6) * cols);
      row = Math.floor(Math.pow(rand(), 1.6) * rows);
    } while (occupied.has(`${col}-${row}`) && attempts < 35);

    occupied.add(`${col}-${row}`);

    const color = colors[Math.floor(rand() * colors.length)];
    const animType = anims[Math.floor(rand() * anims.length)];
    const duration = +(2.0 + rand() * 2.6).toFixed(2); // 2.0s - 4.6s smooth pace
    const delay = +(-rand() * 4).toFixed(2);           // continuous staggered timing
    const size = +(2.4 + rand() * 1.8).toFixed(1);      // 2.4px to 4.2px
    const hasFlare = rand() > 0.72;                    // ~28% get subtle flare

    stars.push({
      id: `${prefix}-${i}`,
      gridX: col,
      gridY: row,
      size,
      color,
      animType,
      duration,
      delay,
      hasFlare,
    });
  }

  return stars;
}

export const TwinklingCornerStars: React.FC = () => {
  // Only bottom/down-side corners in limited area (cols: 24, rows: 22 ≈ 336px x 308px)
  const bottomRightStars = useMemo(() => generateDownsideCornerStars('br', 24, 22, 24), []);
  const bottomLeftStars = useMemo(() => generateDownsideCornerStars('bl', 24, 22, 24), []);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── 1. BOTTOM-RIGHT CORNER DOWN-SIDE ONLY ── */}
      <div
        className="absolute bottom-0 right-0 w-[360px] h-[330px] pointer-events-none"
        style={{
          maskImage:
            'radial-gradient(circle at 100% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.2) 65%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(circle at 100% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.2) 65%, transparent 85%)',
        }}
      >
        {/* Subtle Dot Matrix Grid Layer */}
        <div className="absolute inset-0 corner-star-grid opacity-85" />

        {/* Twinkling Star Points */}
        {bottomRightStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              right: `${star.gridX * 14 + 5}px`,
              bottom: `${star.gridY * 14 + 5}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              animation: `cornerStar${
                star.animType === 'blink'
                  ? 'Blink'
                  : star.animType === 'pulse'
                  ? 'PulseSlow'
                  : 'Shimmer'
              } ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          >
            {star.hasFlare && (
              <div
                className="absolute inset-0 -top-[2px] -left-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none"
                style={{
                  animation: `cornerStarFlare ${star.duration}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
              >
                <svg viewBox="0 0 24 24" className="w-full h-full" fill={star.color}>
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" opacity="0.9" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── 2. BOTTOM-LEFT CORNER DOWN-SIDE ONLY ── */}
      <div
        className="absolute bottom-0 left-0 w-[360px] h-[330px] pointer-events-none"
        style={{
          maskImage:
            'radial-gradient(circle at 0% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.2) 65%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(circle at 0% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.2) 65%, transparent 85%)',
        }}
      >
        {/* Subtle Dot Matrix Grid Layer */}
        <div className="absolute inset-0 corner-star-grid opacity-85" />

        {/* Twinkling Star Points */}
        {bottomLeftStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.gridX * 14 + 5}px`,
              bottom: `${star.gridY * 14 + 5}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              animation: `cornerStar${
                star.animType === 'blink'
                  ? 'Blink'
                  : star.animType === 'pulse'
                  ? 'PulseSlow'
                  : 'Shimmer'
              } ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          >
            {star.hasFlare && (
              <div
                className="absolute inset-0 -top-[2px] -left-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none"
                style={{
                  animation: `cornerStarFlare ${star.duration}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
              >
                <svg viewBox="0 0 24 24" className="w-full h-full" fill={star.color}>
                  <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" opacity="0.9" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
