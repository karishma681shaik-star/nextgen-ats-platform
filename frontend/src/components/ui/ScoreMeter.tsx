import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ScoreMeterProps {
  score: number; // 0 to 100
  label?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTierBadge?: boolean;
  className?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  label = 'ATS Match',
  subLabel,
  size = 'md',
  showTierBadge = true,
  className,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Smooth count-up animation
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Dimension settings
  const sizeMap = {
    sm: { dimension: 76, radius: 30, stroke: 5, font: 'text-lg', labelFont: 'text-[10px]' },
    md: { dimension: 112, radius: 46, stroke: 7, font: 'text-2xl', labelFont: 'text-xs' },
    lg: { dimension: 148, radius: 62, stroke: 9, font: 'text-3xl', labelFont: 'text-sm' },
    hero: { dimension: 196, radius: 84, stroke: 11, font: 'text-5xl', labelFont: 'text-base' },
  };

  const { dimension, radius, stroke, font, labelFont } = sizeMap[size];
  const center = dimension / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Score tier color mapping
  const getTierInfo = (val: number) => {
    if (val >= 85) {
      return {
        color: '#10b981', // emerald
        gradientId: 'grad-emerald',
        from: '#34d399',
        to: '#059669',
        glow: 'rgba(16, 185, 129, 0.45)',
        tier: 'Top 5% Candidate',
        badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: ShieldCheck,
      };
    }
    if (val >= 70) {
      return {
        color: '#6366f1', // indigo
        gradientId: 'grad-indigo',
        from: '#818cf8',
        to: '#4f46e5',
        glow: 'rgba(99, 102, 241, 0.45)',
        tier: 'Strong Match',
        badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        icon: Sparkles,
      };
    }
    if (val >= 50) {
      return {
        color: '#f59e0b', // amber
        gradientId: 'grad-amber',
        from: '#fbbf24',
        to: '#d97706',
        glow: 'rgba(245, 158, 11, 0.45)',
        tier: 'Moderate Fit',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Zap,
      };
    }
    return {
      color: '#f43f5e', // rose
      gradientId: 'grad-rose',
      from: '#fb7185',
      to: '#e11d48',
      glow: 'rgba(244, 63, 94, 0.45)',
      tier: 'Needs Keyword Optimization',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: AlertTriangle,
    };
  };

  const tier = getTierInfo(score);
  const TierIcon = tier.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        {/* Ambient Glow Aura */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse-glow"
          style={{ backgroundColor: tier.glow }}
        />

        {/* SVG Circular Meter */}
        <svg
          className="-rotate-90 transform"
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
        >
          <defs>
            <linearGradient id={tier.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.from} />
              <stop offset="100%" stopColor={tier.to} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={stroke}
          />

          {/* Value Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={`url(#${tier.gradientId})`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.05s linear',
              filter: `drop-shadow(0 0 6px ${tier.color})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className={cn('font-black tracking-tight text-white font-display', font)}>
            {animatedScore}
          </span>
          <span className="text-[9px] uppercase font-mono font-bold text-slate-400 -mt-1">
            Score
          </span>
        </div>
      </div>

      {/* Label and SubLabel */}
      {(label || subLabel) && (
        <div className="text-center">
          {label && <p className={cn('font-bold text-slate-200', labelFont)}>{label}</p>}
          {subLabel && <p className="text-[11px] text-slate-400">{subLabel}</p>}
        </div>
      )}

      {/* Optional Tier Pill */}
      {showTierBadge && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
            tier.badgeColor
          )}
        >
          <TierIcon className="w-3 h-3" />
          <span>{tier.tier}</span>
        </div>
      )}
    </div>
  );
};
