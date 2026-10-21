import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  variant?: 'default' | 'text' | 'title' | 'avatar' | 'badge' | 'button' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rounded = 'xl',
  variant = 'default',
  ...props
}) => {
  const roundings = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  };

  const variants = {
    default: '',
    text: 'h-3.5 w-full my-1',
    title: 'h-6 w-3/4 my-1.5',
    avatar: 'w-12 h-12 shrink-0',
    badge: 'h-5 w-16 shrink-0',
    button: 'h-9 w-28 shrink-0',
    card: 'w-full p-6'
  };

  return (
    <div
      role="status"
      aria-hidden="true"
      className={cn(
        'skeleton-bone select-none pointer-events-none',
        roundings[rounded],
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
