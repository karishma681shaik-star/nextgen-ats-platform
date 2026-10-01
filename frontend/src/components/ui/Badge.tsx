import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'emerald' | 'cyan' | 'slate' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    slate: 'bg-white/[0.06] text-slate-300 border-white/10',
    outline: 'bg-transparent text-slate-300 border-white/15'
  };

  const dots = {
    primary: 'bg-indigo-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    purple: 'bg-purple-400',
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    slate: 'bg-slate-400',
    outline: 'bg-slate-400'
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-bold uppercase tracking-wider transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dots[variant])} />}
      {children}
    </span>
  );
};

