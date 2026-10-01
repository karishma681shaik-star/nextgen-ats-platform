import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'glow'
    | 'glow-purple'
    | 'glow-emerald'
    | 'glow-cyan';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5',
      secondary:
        'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/10 shadow-sm hover:border-white/20 hover:-translate-y-0.5',
      outline:
        'bg-transparent hover:bg-white/[0.06] text-slate-200 border border-white/15 hover:border-white/30',
      ghost:
        'bg-transparent hover:bg-white/[0.08] text-slate-300 hover:text-white',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-500/40 hover:-translate-y-0.5',
      glow:
        'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-glow hover:shadow-glow-lg border border-indigo-300/30 hover:-translate-y-0.5',
      'glow-purple':
        'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-purple border border-purple-300/30 hover:-translate-y-0.5',
      'glow-emerald':
        'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-glow-emerald border border-emerald-300/30 hover:-translate-y-0.5',
      'glow-cyan':
        'bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-glow-cyan border border-cyan-300/30 hover:-translate-y-0.5',
    };

    const sizes = {
      xs: 'text-[11px] px-2.5 py-1 gap-1 h-7 rounded-lg',
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8.5 rounded-lg',
      md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 h-10 rounded-xl',
      lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5 h-12 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

