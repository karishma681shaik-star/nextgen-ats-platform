import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CardReflectiveShine, ShineVariant } from '../common/CardReflectiveShine';

interface CandidateMetricCardProps {
  title: string;
  value: string | number;
  numericValue?: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  linkTo?: string;
  linkLabel?: string;
  badgeText?: string;
  badgeColor?: string;
  onActionClick?: () => void;
  accentGraphic?: React.ReactNode;
  index: number;
}

export const CandidateMetricCard: React.FC<CandidateMetricCardProps> = ({
  title,
  value,
  numericValue,
  subtitle,
  icon,
  iconBg,
  linkTo,
  linkLabel,
  badgeText,
  badgeColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  onActionClick,
  accentGraphic,
  index
}) => {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState<number>(prefersReduced ? (numericValue ?? 0) : 0);
  const [sheenCoords, setSheenCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth number count-up on entry if numericValue is provided
  useEffect(() => {
    if (prefersReduced || numericValue === undefined || numericValue === 0) {
      setDisplayCount(numericValue ?? 0);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 650;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      setDisplayCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayCount(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [numericValue, prefersReduced]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSheenCoords({ x, y });
  };

  const displayedValue = numericValue !== undefined ? displayCount : value;

  const cardVariants: ShineVariant[] = ['indigo', 'blue', 'purple', 'emerald'];
  const currentVariant = cardVariants[index % cardVariants.length] || 'indigo';

  const hoverBorderClasses = [
    'hover:border-indigo-500/30',
    'hover:border-blue-500/30',
    'hover:border-purple-500/30',
    'hover:border-teal-500/30'
  ];
  const cardHoverBorder = hoverBorderClasses[index % hoverBorderClasses.length];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: prefersReduced ? 0 : 0.05 + index * 0.06,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -3 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0d1430] via-[#090f24] to-[#060919] p-5 flex flex-col justify-between h-full transition-all duration-300 card-shine-all-sides group',
        cardHoverBorder
      )}
    >
      {/* ── 1. Corner Ambient Lighting & Specular Top Rim ───────────────────── */}
      <CardReflectiveShine variant={currentVariant} rounded="rounded-2xl" hasHoverSweep={true} />

      {/* ── 2. Subtle Interactive Spotlight Sheen (Soft, restrained) ────────── */}
      {isHovered && !prefersReduced && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(circle 140px at ${sheenCoords.x}% ${sheenCoords.y}%, rgba(165, 180, 252, 0.08) 0%, transparent 80%)`
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
            {title}
          </span>
          <div className={cn('p-2 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-inner', iconBg)}>
            {icon}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span
            className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate max-w-full group-hover:text-white transition-colors"
            title={String(value)}
          >
            {displayedValue}
          </span>
          {accentGraphic && (
            <div className="opacity-80 shrink-0 group-hover:opacity-100 transition-opacity">
              {accentGraphic}
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-medium leading-relaxed truncate group-hover:text-slate-300 transition-colors">
          {subtitle}
        </p>
      </div>

      <div className="pt-3 border-t border-white/[0.04] mt-3 flex items-center justify-between relative z-10">
        {badgeText && (
          <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm', badgeColor)}>
            {badgeText}
          </span>
        )}
        {linkTo ? (
          <Link
            to={linkTo}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-auto group-hover:translate-x-0.5 transform duration-200"
          >
            {linkLabel} <ArrowRight className="w-3 h-3" />
          </Link>
        ) : onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-auto cursor-pointer group-hover:translate-x-0.5 transform duration-200"
          >
            {linkLabel} <ArrowRight className="w-3 h-3" />
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};
