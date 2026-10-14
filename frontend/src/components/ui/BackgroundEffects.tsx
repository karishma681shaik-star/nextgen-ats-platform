import React from 'react';

export interface BackgroundEffectsProps {
  role?: 'candidate' | 'recruiter' | 'admin' | 'public' | 'auth';
  mode?: string;
  interactive?: boolean;
  showHudLabels?: boolean;
  gridSize?: number;
  className?: string;
}

/**
 * BackgroundEffects is now managed globally by BackgroundController in App.tsx.
 * This component acts as a lightweight no-op to prevent duplicate WebGL canvases.
 */
export const BackgroundEffects: React.FC<BackgroundEffectsProps> = () => {
  return null;
};
