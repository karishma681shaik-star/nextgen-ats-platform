import React, { useEffect, useRef, useMemo } from 'react';
import { BackgroundMode, Premium3DBackgroundProps } from './types';
import { NexusScene } from './NexusScene';
import { prefersReducedMotion } from './WebGLDetector';

export const Premium3DBackground: React.FC<Premium3DBackgroundProps> = ({
  mode,
  role = 'public',
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NexusScene | null>(null);

  // Compute active background mode from props
  const activeMode: BackgroundMode = useMemo(() => {
    if (mode) return mode;
    if (role === 'public') return 'hero';
    if (role === 'auth') return 'auth';
    if (role === 'candidate') return 'candidate';
    if (role === 'recruiter') return 'recruiter';
    if (role === 'admin') return 'admin';
    return 'hero';
  }, [mode, role]);

  useEffect(() => {
    // If explicitly disabled (e.g. Resume Editor workspace)
    if (activeMode === 'none') {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion settings
    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      return;
    }

    // Reuse existing scene if already mounted, just update mode
    if (sceneRef.current) {
      sceneRef.current.setMode(activeMode);
      return;
    }

    try {
      sceneRef.current = new NexusScene(canvas, activeMode, interactive);
    } catch (err) {
      console.warn('[Premium3DBackground] Initialization notice:', err);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [activeMode, interactive]);

  // If in 'none' mode (e.g., Resume Builder document page)
  if (activeMode === 'none') {
    return (
      <div
        className={`fixed inset-0 pointer-events-none z-0 bg-[#030712] ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#030712] ${className}`}
      aria-hidden="true"
    >
      {/* ── 1. High-Performance Three.js / Canvas 2D Living Background ──── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none bg-[#030712]"
        style={{ display: 'block', width: '100vw', height: '100vh' }}
      />

      {/* ── 2. Subtle Precision Cyan Horizon Line ────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#55DDF5]/25 to-transparent" />

      {/* ── 3. High-End Atmospheric Depth Overlay (Soft right-side aura, left protected) ─ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 75% 45%, rgba(7, 17, 31, 0.35) 0%, rgba(3, 7, 18, 0.85) 60%, #030712 100%)',
        }}
      />
    </div>
  );
};
