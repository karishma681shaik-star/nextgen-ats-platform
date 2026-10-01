import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export type CursorVariant = 'default' | 'button' | 'text' | 'card' | 'badge' | 'link';

interface HeroCursorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  variant: CursorVariant;
  label?: string;
}

export const HeroCursor: React.FC<HeroCursorProps> = ({ containerRef, variant, label }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for high-end follower physics
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check for touch device or reduced motion preference
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isTouch || prefersReduced) {
        setIsTouchDevice(true);
        return;
      }
    }

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        setIsVisible(true);
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'button':
        return {
          width: 48,
          height: 48,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: 'rgba(129, 140, 248, 0.6)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)',
          scale: 1.1,
        };
      case 'text':
        return {
          width: 80,
          height: 24,
          borderRadius: '9999px',
          backgroundColor: 'rgba(168, 85, 247, 0.18)',
          borderColor: 'rgba(192, 132, 252, 0.5)',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.35)',
          scale: 1,
        };
      case 'card':
        return {
          width: 42,
          height: 42,
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          borderColor: 'rgba(56, 189, 248, 0.6)',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          scale: 1.05,
        };
      case 'badge':
        return {
          width: 36,
          height: 36,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(165, 180, 252, 0.6)',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
          scale: 1.05,
        };
      default:
        return {
          width: 14,
          height: 14,
          backgroundColor: 'rgba(129, 140, 248, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 0 12px rgba(129, 140, 248, 0.8)',
          scale: 1,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      animate={{
        width: currentStyles.width,
        height: currentStyles.height,
        backgroundColor: currentStyles.backgroundColor,
        borderColor: currentStyles.borderColor,
        boxShadow: currentStyles.boxShadow,
        scale: currentStyles.scale,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className="rounded-full border backdrop-blur-[2px] flex items-center justify-center overflow-hidden"
    >
      {label && variant === 'text' && (
        <span className="text-[9px] font-mono font-bold text-purple-200 tracking-wider uppercase px-1">
          {label}
        </span>
      )}
      {variant === 'card' && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
      )}
    </motion.div>
  );
};
