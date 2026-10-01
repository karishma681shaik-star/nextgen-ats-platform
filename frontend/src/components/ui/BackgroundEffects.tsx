import React from 'react';
import { ContainedGridBackground } from './ContainedGridBackground';

export interface BackgroundEffectsProps {
  role?: 'candidate' | 'recruiter' | 'admin' | 'public';
  interactive?: boolean;
  showHudLabels?: boolean;
  gridSize?: number;
  className?: string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  role = 'public',
  interactive = true,
  showHudLabels = false,
  gridSize = 64,
  className = '',
}) => {
  return (
    <ContainedGridBackground
      role={role}
      interactive={interactive}
      showHudLabels={showHudLabels}
      gridSize={gridSize}
      className={className}
    />
  );
};
