import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  size = 'md',
  colorClass = 'bg-gradient-to-r from-indigo-500 to-purple-600',
  className
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-300">{label}</span>}
          {showPercentage && <span className="text-slate-200 ml-auto">{clamped}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
