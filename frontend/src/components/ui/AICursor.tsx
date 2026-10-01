import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export type AICursorMode = 'default' | 'button' | 'card' | 'input' | 'hidden';

export const AICursor: React.FC = () => {
  const [mode, setMode] = useState<AICursorMode>('default');
  const [label, setLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  // Mouse coordinate motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for outer glow follower
  const springConfig = { damping: 30, stiffness: 280, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // High-precision fast spring for the center pointer
  const dotSpringConfig = { damping: 40, stiffness: 600, mass: 0.15 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check device type and motion preferences
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isTouch || prefersReduced) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const target = e.target as HTMLElement | null;

      if (!target) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        return;
      }

      // Check for magnetic pull on buttons/links
      const interactiveEl = target.closest('button, a, [role="button"], select') as HTMLElement | null;
      
      if (interactiveEl) {
        setMode('button');
        const rect = interactiveEl.getBoundingClientRect();
        setHoveredRect(rect);

        // Magnetic pull calculation: blend mouse position and button center
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        
        // Snap the outer glow ring close to button center, let center dot follow cursor but with slight pull
        mouseX.set(btnCenterX + (e.clientX - btnCenterX) * 0.25);
        mouseY.set(btnCenterY + (e.clientY - btnCenterY) * 0.25);

        // Custom label support
        const customLabel = interactiveEl.getAttribute('data-cursor-label');
        setLabel(customLabel);
      } else {
        setMode('default');
        setHoveredRect(null);
        setLabel(null);

        // Normal tracking
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);

        // Check if inside a card
        if (target.closest('.glass-card-elevated, .glass-card, [data-cursor-card]')) {
          setMode('card' as any);
        }
      }
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
      {/* 1. Precision Center Dot */}
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
            scale: mode === 'button' ? 0.6 : 1,
            backgroundColor: mode === 'button' ? '#38bdf8' : '#c084fc',
          }}
          transition={{ duration: 0.15 }}
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_#c084fc,0_0_20px_rgba(192,132,252,0.4)]"
        />
      </motion.div>

      {/* 2. Magnetic Outer Glowing Ring */}
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
            width: mode === 'button' && hoveredRect ? hoveredRect.width + 16 : 28,
            height: mode === 'button' && hoveredRect ? hoveredRect.height + 12 : 28,
            borderRadius: mode === 'button' ? '12px' : '50%',
            borderColor: mode === 'button' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(168, 85, 247, 0.4)',
            backgroundColor: mode === 'button' ? 'rgba(56, 189, 248, 0.04)' : 'rgba(168, 85, 247, 0.02)',
            boxShadow:
              mode === 'button'
                ? '0 0 20px rgba(56, 189, 248, 0.35), inset 0 0 10px rgba(56, 189, 248, 0.15)'
                : '0 0 12px rgba(168, 85, 247, 0.15)',
          }}
          transition={{ type: 'spring', damping: 24, stiffness: 300, mass: 0.6 }}
          className="relative border border-solid backdrop-blur-[0.5px] transition-shadow duration-300"
        >
          {/* Subtle AI Radar pulse rings */}
          {mode !== 'button' && (
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-1 rounded-full border border-purple-500/20"
            />
          )}
        </motion.div>

        {/* 3. Floating Action Label */}
        <AnimatePresence>
          {label && (
            <motion.div
              initial={{ opacity: 0, x: 15, scale: 0.8 }}
              animate={{ opacity: 1, x: 30, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 380 }}
              className="absolute left-0 top-0 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            >
              <div className="px-2.5 py-1 rounded-full bg-slate-950/95 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{label.toUpperCase()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
