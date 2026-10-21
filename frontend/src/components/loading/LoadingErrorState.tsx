import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface LoadingErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backUrl?: string;
  backLabel?: string;
  className?: string;
}

export const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  title = 'Information Could Not Be Loaded',
  message = 'A temporary network interruption or authorization refresh occurred. Please retry your request.',
  onRetry,
  backUrl,
  backLabel = 'Return to Previous View',
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`card-upper-edge-luminous rounded-2xl p-8 sm:p-12 text-center bg-slate-900/80 backdrop-blur-xl border border-rose-500/25 space-y-5 max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onRetry}
            className="text-xs shadow-lg shadow-indigo-600/30"
          >
            Retry Connection
          </Button>
        )}

        {backUrl && (
          <Link to={backUrl}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs border-white/15 hover:border-indigo-400/40"
            >
              {backLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
