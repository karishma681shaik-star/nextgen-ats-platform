import React from 'react';
import { LucideIcon, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Briefcase,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`card-upper-edge-luminous rounded-2xl p-8 sm:p-12 text-center bg-slate-900/70 backdrop-blur-xl border border-white/[0.08] space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link to={actionHref}>
              <Button variant="primary" size="sm" className="text-xs shadow-lg shadow-indigo-600/30">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" onClick={onAction} className="text-xs shadow-lg shadow-indigo-600/30">
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
