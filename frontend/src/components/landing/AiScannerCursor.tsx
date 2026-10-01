import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export type CursorMode = 'default' | 'button' | 'card' | 'hero' | 'input' | 'hidden';

export const AiScannerCursor: React.FC = () => {
  const [mode, setMode] = useState<CursorMode>('default');
  const [label, setLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth followers for the outer radar ring with subtle inertial lag
  const springConfig = { damping: 26, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Faster spring for the sharp AI scanner center dot
  const fastSpringConfig = { damping: 35, stiffness: 550, mass: 0.2 };
  const dotX = useSpring(mouseX, fastSpringConfig);
  const dotY = useSpring(mouseY, fastSpringConfig);

  useEffect(() => {
    // Check touch device or reduced motion preference
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isTouch || prefersReduced) {
        setIsTouchDevice(true);
        return;
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Identify hovered element context
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Check for custom label
      const labeledEl = target.closest('[data-cursor-label]') as HTMLElement | null;
      if (labeledEl) {
        setLabel(labeledEl.getAttribute('data-cursor-label'));
      } else {
        setLabel(null);
      }

      // 2. Check for Hero Scanner container
      if (target.closest('[data-cursor-hero-scanner]')) {
        setMode('hero');
        return;
      }

      // 3. Check for Button or Interactive Link
      if (target.closest('button, a, [role="button"], input, select, textarea')) {
        setMode('button');
        return;
      }

      // 4. Check for Cards
      if (target.closest('.glass-card-elevated, .glass-card, [data-cursor-card]')) {
        setMode('card');
        return;
      }

      // Default
      setMode('default');
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none" aria-hidden>
      {/* 1. Sharp AI Scanner Point (Center Dot) */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="pointer-events-none"
      >
        <motion.div
          animate={{
            scale: mode === 'button' ? 1.4 : mode === 'hero' ? 1.6 : 1,
            backgroundColor:
              mode === 'button'
                ? '#38bdf8'
                : mode === 'hero'
                ? '#22d3ee'
                : mode === 'card'
                ? '#a855f7'
                : '#818cf8',
          }}
          transition={{ duration: 0.2 }}
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
        />
      </motion.div>

      {/* 2. Outer AI Radar / Scanner Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="pointer-events-none flex items-center justify-center"
      >
        <motion.div
          animate={{
            width: mode === 'button' ? 36 : mode === 'hero' ? 44 : mode === 'card' ? 32 : 24,
            height: mode === 'button' ? 36 : mode === 'hero' ? 44 : mode === 'card' ? 32 : 24,
            borderColor:
              mode === 'button'
                ? 'rgba(56, 189, 248, 0.7)'
                : mode === 'hero'
                ? 'rgba(34, 211, 238, 0.8)'
                : mode === 'card'
                ? 'rgba(168, 85, 247, 0.5)'
                : 'rgba(129, 140, 248, 0.4)',
            backgroundColor:
              mode === 'button'
                ? 'rgba(56, 189, 248, 0.08)'
                : mode === 'hero'
                ? 'rgba(34, 211, 238, 0.06)'
                : 'rgba(99, 102, 241, 0.03)',
            boxShadow:
              mode === 'button'
                ? '0 0 16px rgba(56, 189, 248, 0.4), inset 0 0 8px rgba(56, 189, 248, 0.2)'
                : mode === 'hero'
                ? '0 0 20px rgba(34, 211, 238, 0.5), inset 0 0 10px rgba(34, 211, 238, 0.25)'
                : '0 0 10px rgba(99, 102, 241, 0.2)',
          }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="relative rounded-full border border-dashed backdrop-blur-[1px] flex items-center justify-center"
        >
          {/* Subtle Radar Pulse Ring */}
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.35, 0, 0.35],
            }}
            transition={{
              duration: mode === 'hero' ? 1.8 : 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full border border-indigo-400/40 pointer-events-none"
          />

          {/* Special Hero Scanner Crosshair Ticks */}
          {mode === 'hero' && (
            <>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-cyan-400" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-cyan-400" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-cyan-400" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-cyan-400" />
            </>
          )}

          {/* Button Lock-on Micro Reticle */}
          {mode === 'button' && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-2 h-2 rounded-sm border border-cyan-400/80"
            />
          )}
        </motion.div>

        {/* 3. Contextual Mini Pill Badge (e.g., "Analyze", "Build", "Match", "Explore") */}
        <AnimatePresence>
          {label && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.8 }}
              animate={{ opacity: 1, x: 28, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              className="absolute left-0 top-0 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            >
              <div className="px-2 py-0.5 rounded-full bg-[#0a0f1d]/90 border border-indigo-500/40 text-indigo-200 text-[9px] font-mono font-bold tracking-wider shadow-glow flex items-center gap-1 backdrop-blur-md">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                <span>{label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
