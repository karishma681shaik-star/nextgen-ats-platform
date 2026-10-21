import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';

interface PageLoadingShellProps {
  badgeLabel?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PageLoadingShell: React.FC<PageLoadingShellProps> = ({
  badgeLabel = 'ATS Synchronizing',
  title,
  subtitle,
  children
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Header telemetry & layout preservation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{badgeLabel}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </div>

          {title ? (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
          ) : (
            <div className="h-8 w-64 rounded-xl skeleton-bone my-1" />
          )}

          {subtitle ? (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          ) : (
            <div className="h-4 w-96 max-w-full rounded-lg skeleton-bone" />
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] font-mono text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>REAL-TIME STREAM</span>
        </div>
      </div>

      {/* Main Skeleton Children */}
      {children}
    </motion.div>
  );
};
