import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface DepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
  gradientBorder?: boolean;
  tiltAngle?: number;
}

export const DepthCard = React.forwardRef<HTMLDivElement, DepthCardProps>(
  ({ className, glass = true, hoverEffect = true, gradientBorder = false, tiltAngle = 3.5, children, ...props }, ref) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !hoverEffect) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // range [-0.5, 0.5]
      const y = (e.clientY - rect.top) / rect.height - 0.5; // range [-0.5, 0.5]
      
      setCoords({ x, y });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setCoords({ x: 0, y: 0 });
    };

    // Fallback ref merging
    const setRefs = (node: HTMLDivElement | null) => {
      cardRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Check touch/prefers-reduced-motion to disable active tilt
    const [disableTilt, setDisableTilt] = useState(false);
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setDisableTilt(isTouch || prefersReduced);
      }
    }, []);

    const transformStyle = isHovered && hoverEffect && !disableTilt
      ? {
          transform: `perspective(1000px) rotateY(${coords.x * tiltAngle}deg) rotateX(${-coords.y * tiltAngle}deg) scale(1.02)`,
          transition: 'transform 0.1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease',
        }
      : {
          transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease',
        };

    // Calculate light sheen coordinates
    const sheenStyle = isHovered && hoverEffect && !disableTilt
      ? {
          background: `radial-gradient(circle 120px at ${(coords.x + 0.5) * 100}% ${(coords.y + 0.5) * 100}%, rgba(168, 85, 247, 0.15) 0%, transparent 80%)`,
        }
      : {
          background: 'none',
        };

    return (
      <div
        ref={setRefs}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={transformStyle}
        className={cn(
          'relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-[#0a0f1d]/90 transition-all duration-300 card-shine-all-sides',
          glass && 'glass-card',
          hoverEffect && 'hover:border-indigo-400/60 cursor-pointer',
          gradientBorder && 'gradient-border',
          className
        )}
        {...props}
      >
        {/* ── 4-Side Perimeter Light Rims & Inward Reflection ───────────────── */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/70 to-transparent pointer-events-none z-20" />
        <div className="absolute left-0 inset-y-0 w-[1.5px] bg-gradient-to-b from-transparent via-indigo-400/60 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 inset-y-0 w-[1.5px] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(165,180,252,0.18)_0%,transparent_60%),radial-gradient(ellipse_at_bottom,rgba(192,132,252,0.14)_0%,transparent_60%),radial-gradient(ellipse_at_left,rgba(99,102,241,0.12)_0%,transparent_50%),radial-gradient(ellipse_at_right,rgba(56,189,248,0.12)_0%,transparent_50%)]" />

        {/* Dynamic Light Sheen Overlay */}
        {hoverEffect && !disableTilt && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-80" 
            style={sheenStyle} 
          />
        )}
        
        {/* Soft Ambient Border Glow overlay */}
        {isHovered && hoverEffect && (
          <div className="absolute inset-0 border border-indigo-400/30 rounded-2xl pointer-events-none z-20" />
        )}

        <div className="relative z-0">
          {children}
        </div>
      </div>
    );
  }
);

DepthCard.displayName = 'DepthCard';
