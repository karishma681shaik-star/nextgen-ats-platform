import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className
}) => {
  const styles = {
    info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-200'
  };

  const icons = {
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm',
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-white mb-0.5">{title}</h4>}
        <div className="text-xs text-slate-300 leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
