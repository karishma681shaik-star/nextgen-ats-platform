import React from 'react';
import { useLocation } from 'react-router-dom';
import { Premium3DBackground } from './Premium3DBackground';
import { BackgroundMode } from './types';

export interface BackgroundControllerProps {
  overrideMode?: BackgroundMode;
  interactive?: boolean;
  className?: string;
}

/**
 * BackgroundController detects current route and automatically configures
 * the appropriate 3D cinematic background mode.
 */
export const BackgroundController: React.FC<BackgroundControllerProps> = ({
  overrideMode,
  interactive = true,
  className = '',
}) => {
  const location = useLocation();
  const path = location.pathname;

  const mode: BackgroundMode = React.useMemo(() => {
    if (overrideMode) return overrideMode;

    // Resume Builder: Strict distraction-free requirement
    if (path.includes('/resume-builder')) {
      return 'none';
    }

    // Public Landing Page
    if (path === '/' || path === '') {
      return 'hero';
    }

    // Auth Pages: Restrained, clean, focused
    if (
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/forgot-password') ||
      path.startsWith('/reset-password') ||
      path.startsWith('/verify-email')
    ) {
      return 'auth';
    }

    // Candidate Area
    if (path.startsWith('/candidate')) {
      return 'candidate';
    }

    // Recruiter Area
    if (path.startsWith('/recruiter')) {
      return 'recruiter';
    }

    // Admin Area
    if (path.startsWith('/admin')) {
      return 'admin';
    }

    return 'minimal';
  }, [path, overrideMode]);

  return <Premium3DBackground mode={mode} interactive={interactive} className={className} />;
};
