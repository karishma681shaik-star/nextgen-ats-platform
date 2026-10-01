import React from 'react';
import { motion } from 'framer-motion';

interface FloatingInsightProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'indigo' | 'emerald' | 'cyan' | 'purple' | 'amber';
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export const FloatingInsight: React.FC<FloatingInsightProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'indigo',
  className = '',
  delay = 0,
  duration = 5,
  yOffset = 8,
}) => {
  const badgeStyles = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -yOffset, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay: delay * 0.2 },
        scale: { duration: 0.6, delay: delay * 0.2 },
        y: {
          duration: duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay,
        },
      }}
      className={`glass-card-elevated px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 z-20 select-none ${className}`}
    >
      <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
        {icon}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-tight">{title}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>}
      </div>
    </motion.div>
  );
};
