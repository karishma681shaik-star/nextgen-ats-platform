import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIAssistantEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isSpeaking?: boolean;
  className?: string;
}

export const AIAssistantEmblem: React.FC<AIAssistantEmblemProps> = ({
  size = 'md',
  isSpeaking = false,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const dimensions = {
    sm: { container: 'w-8 h-8', ring1: 'w-8 h-8', ring2: 'w-6 h-6', core: 'w-4 h-4', icon: 'w-2.5 h-2.5' },
    md: { container: 'w-12 h-12', ring1: 'w-12 h-12', ring2: 'w-9 h-9', core: 'w-6 h-6', icon: 'w-3.5 h-3.5' },
    lg: { container: 'w-16 h-16', ring1: 'w-16 h-16', ring2: 'w-12 h-12', core: 'w-8 h-8', icon: 'w-4 h-4' },
    hero: { container: 'w-24 h-24', ring1: 'w-24 h-24', ring2: 'w-18 h-18', core: 'w-12 h-12', icon: 'w-6 h-6' },
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions.container} ${className}`}>
      {/* Outer Atmospheric Aura */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 0.4 }
            : {
                opacity: isSpeaking ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],
                scale: isSpeaking ? [0.95, 1.15, 0.95] : [0.95, 1.05, 0.95],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/25 to-violet-500/20 blur-md pointer-events-none"
      />

      {/* Orbital Ring 1 - Counter Clockwise */}
      <motion.div
        animate={prefersReducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className={`absolute rounded-full border border-dashed border-cyan-400/40 ${dimensions.ring1} pointer-events-none`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
      </motion.div>

      {/* Orbital Ring 2 - Clockwise */}
      <motion.div
        animate={prefersReducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className={`absolute rounded-full border border-violet-400/30 ${dimensions.ring2} pointer-events-none`}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full bg-violet-300 shadow-[0_0_6px_#c084fc]" />
      </motion.div>

      {/* Radiant Central AI Core */}
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: isSpeaking ? [1, 1.08, 1] : [1, 1.03, 1],
                boxShadow: isSpeaking
                  ? '0 0 20px rgba(99, 102, 241, 0.6)'
                  : '0 0 14px rgba(99, 102, 241, 0.35)',
              }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white border border-white/20 shadow-lg ${dimensions.core}`}
      >
        <Sparkles className={`${dimensions.icon} text-cyan-200 animate-pulse`} />
      </motion.div>
    </div>
  );
};

/**
 * Animated audio visualizer waveform bars
 */
export const AIAudioWaveform: React.FC<{ isSpeaking?: boolean; className?: string }> = ({
  isSpeaking = true,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const barDelays = [0, 0.15, 0.3, 0.1, 0.25];

  return (
    <div className={`flex items-center gap-0.5 h-4 ${className}`} aria-hidden="true">
      {barDelays.map((delay, idx) => (
        <motion.div
          key={idx}
          animate={
            prefersReducedMotion || !isSpeaking
              ? { height: 4, opacity: 0.4 }
              : {
                  height: [4, 14, 6, 16, 4],
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                }
          }
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
          className="w-0.5 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-400"
        />
      ))}
    </div>
  );
};
