import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Shield, Briefcase, UserCheck, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { AIAssistantEmblem, AIAudioWaveform } from './AIAssistantEmblem';

export interface CinematicDashboardIntroProps {
  role: 'candidate' | 'recruiter' | 'admin';
  onComplete?: () => void;
}

/**
 * Hook to manage cinematic intro trigger lifecycle:
 * - Triggers on explicit login / role switch, or first entry in a tab session.
 * - Prevents re-triggering during normal in-dashboard navigation.
 * - Prevents re-triggering on page refresh.
 * - Prevents duplicate triggers in React Strict Mode.
 * - Respects user disable preference.
 */
export function useCinematicIntro(role: 'candidate' | 'recruiter' | 'admin') {
  const [shouldPlay, setShouldPlay] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check if user disabled cinematic intro in preferences
    if (
      localStorage.getItem('ai_ats_pref_cinematic_enabled') === 'false' ||
      localStorage.getItem('ai_ats_disable_cinematic_intro') === 'true'
    ) {
      return false;
    }

    const explicitTriggerKey = `ai_ats_play_intro_${role}`;
    const sessionSeenKey = `ai_ats_intro_seen_${role}`;

    const explicit = sessionStorage.getItem(explicitTriggerKey);
    const seen = sessionStorage.getItem(sessionSeenKey);

    if (explicit === 'true' || !seen) {
      // Consume trigger synchronously so React Strict Mode does not re-trigger
      sessionStorage.removeItem(explicitTriggerKey);
      sessionStorage.setItem(sessionSeenKey, 'true');
      return true;
    }

    return false;
  });

  const onComplete = useCallback(() => {
    setShouldPlay(false);
  }, []);

  return { shouldPlay, onComplete };
}

export const CinematicDashboardIntro: React.FC<CinematicDashboardIntroProps> = ({
  role,
  onComplete,
}) => {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // 4 Cinematic Phases:
  // 1: atmospheric intro -> 2: AI identity reveal -> 3: personalized welcome -> 4: exit reveal
  const [phase, setPhase] = useState<'atmospheric' | 'reveal' | 'welcome' | 'exit'>('atmospheric');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // Dynamic role-aware greeting from authoritative authenticated profile
  const greeting = useMemo(() => {
    return voiceAssistantService.getRoleGreeting(user, role);
  }, [user, role]);

  // Role visual and textual configuration
  const config = useMemo(() => {
    if (role === 'admin') {
      return {
        brandSubtitle: 'PLATFORM GOVERNANCE & AUDIT',
        headline: greeting.headline,
        subtitle: greeting.subtitle,
        voiceText: greeting.voiceText,
        badge: 'SECURITY PROTOCOL // GOVERNANCE',
        accentColor: 'emerald',
        glowColor: 'rgba(16, 185, 129, 0.28)',
        pillStyle: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        laserGradient: 'from-transparent via-emerald-400 to-transparent',
        rate: greeting.rate,
        pitch: greeting.pitch,
      };
    }
    if (role === 'recruiter') {
      return {
        brandSubtitle: 'INTELLIGENT RECRUITMENT SUITE',
        headline: greeting.headline,
        subtitle: greeting.subtitle,
        voiceText: greeting.voiceText,
        badge: 'RECRUITMENT WORKSPACE // ACTIVE',
        accentColor: 'purple',
        glowColor: 'rgba(168, 85, 247, 0.28)',
        pillStyle: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        laserGradient: 'from-transparent via-purple-400 to-transparent',
        rate: greeting.rate,
        pitch: greeting.pitch,
      };
    }
    // Candidate role: "NEXTGEN ATS — YOUR NEXT CHAPTER"
    return {
      brandSubtitle: 'YOUR NEXT CHAPTER',
      headline: greeting.headline,
      subtitle: greeting.subtitle,
      voiceText: greeting.voiceText,
      badge: 'AI CAREER INTELLIGENCE // READY',
      accentColor: 'cyan',
      glowColor: 'rgba(14, 165, 233, 0.32)',
      pillStyle: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      laserGradient: 'from-transparent via-cyan-400 to-transparent',
      rate: greeting.rate,
      pitch: greeting.pitch,
    };
  }, [role, greeting]);

  const handleSkip = useCallback(() => {
    voiceAssistantService.stop();
    onComplete?.();
  }, [onComplete]);

  // Phase transition timeline
  useEffect(() => {
    if (prefersReducedMotion) {
      // Streamlined 450ms fade for accessibility
      const timer = setTimeout(() => {
        onComplete?.();
      }, 450);
      return () => clearTimeout(timer);
    }

    // Step 1: Gentle confirmation chime at intro trigger
    soundEffectService.playSuccessChime();

    // Phase 1 -> Phase 2: AI Identity & Brand Reveal (at 550ms)
    const t1 = setTimeout(() => {
      setPhase('reveal');
    }, 550);

    // Phase 2 -> Phase 3: Personalized Welcome + Natural Voice (at 1250ms)
    const t2 = setTimeout(() => {
      setPhase('welcome');
      setIsVoiceActive(true);
      voiceAssistantService.speak(config.voiceText, {
        interrupt: true,
        rate: config.rate,
        pitch: config.pitch,
      });
    }, 1250);

    // Phase 3 -> Phase 4: Dissolve & Reveal Dashboard (at 2350ms)
    const t3 = setTimeout(() => {
      setPhase('exit');
      setIsVoiceActive(false);
    }, 2350);

    // Final termination (at 2850ms)
    const t4 = setTimeout(() => {
      onComplete?.();
    }, 2850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [prefersReducedMotion, onComplete, config.voiceText, config.rate, config.pitch]);

  // Handle keyboard Escape to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Accessible Reduced Motion Variant
  if (prefersReducedMotion) {
    return (
      <aside
        aria-live="polite"
        role="status"
        aria-label={`${config.headline} ${config.subtitle}`}
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-[#050814]/85 backdrop-blur-sm"
      >
        <div className="text-center p-6 bg-[#090e24] border border-slate-700 rounded-2xl shadow-2xl max-w-md mx-4">
          <h1 className="text-xl font-bold font-display text-white">{config.headline}</h1>
          <p className="text-xs text-slate-400 mt-1">{config.subtitle}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-live="polite"
      role="status"
      aria-label={`${config.headline} ${config.subtitle}`}
      className="fixed inset-0 z-50 overflow-hidden select-none cursor-pointer"
      onClick={handleSkip}
      title="Click or press Escape to continue to dashboard"
    >
      {/* ── PHASE 1: DEEP MIDNIGHT CINEMATIC CANVAS ── */}
      <motion.div
        initial={{ opacity: 0.98 }}
        animate={{
          opacity: phase === 'exit' ? 0 : 0.94,
        }}
        transition={{ duration: phase === 'exit' ? 0.5 : 0.45, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[#040714] backdrop-blur-md"
      />

      {/* ── ATMOSPHERIC AMBIENT RADIAL LIGHT ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: phase === 'exit' ? 0 : [0.3, 0.75, 0.55],
          scale: phase === 'exit' ? 1.3 : 1,
        }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(circle at 50% 45%, ${config.glowColor} 0%, rgba(99, 102, 241, 0.12) 38%, transparent 72%)`,
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* ── RESTRAINED HORIZONTAL LIGHT SWEEP ── */}
      <AnimatePresence>
        {(phase === 'atmospheric' || phase === 'reveal') && (
          <motion.div
            initial={{ y: '-5%', opacity: 0 }}
            animate={{ y: '115%', opacity: [0, 0.85, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-16 pointer-events-none flex flex-col justify-center"
          >
            <div className={`w-full h-[1.5px] bg-gradient-to-r ${config.laserGradient} shadow-[0_0_14px_rgba(56,189,248,0.7)]`} />
            <div className="w-full h-10 bg-gradient-to-b from-cyan-400/10 to-transparent blur-[6px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button in Top-Right Corner */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Skip introduction animation"
        >
          <span>Skip</span>
          <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">Esc</kbd>
        </button>
      </div>

      {/* ── MAIN CINEMATIC PRESENTATION ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        {/* PHASE 2: AI ASSISTANT EMBLEM WITH ORBITAL RESONANCE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{
            opacity: phase === 'exit' ? 0 : 1,
            scale: phase === 'exit' ? 1.08 : 1,
            y: phase === 'exit' ? -16 : 0,
          }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center"
        >
          <AIAssistantEmblem size="hero" isSpeaking={isVoiceActive} className="mb-6" />

          {/* NEXTGEN ATS Brand Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: phase === 'atmospheric' ? 0 : 1,
              y: phase === 'atmospheric' ? 8 : 0,
            }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="flex items-center gap-2.5 mb-2"
          >
            <span className="text-sm font-mono font-bold tracking-[0.25em] text-white uppercase drop-shadow-sm">
              NEXTGEN ATS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300/90 uppercase">
              {config.brandSubtitle}
            </span>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: phase === 'atmospheric' ? 0 : 1,
              scale: phase === 'atmospheric' ? 0.92 : 1,
            }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-bold tracking-wider mb-5 ${config.pillStyle}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{config.badge}</span>
          </motion.div>

          {/* PHASE 3: STAGGERED PERSONALIZED WELCOME */}
          <AnimatePresence mode="wait">
            {(phase === 'welcome' || phase === 'exit') && (
              <motion.div
                key="welcome-block"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2 max-w-lg mx-auto"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  {config.headline}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  {config.subtitle}
                </p>

                {/* AI Audio Waveform Visualizer */}
                <div className="pt-4 flex items-center justify-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">AI Audio Assistant</span>
                  <AIAudioWaveform isSpeaking={isVoiceActive} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Subtle Status Line */}
      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Synchronizing recruitment workspace...</span>
        </div>
      </div>
    </aside>
  );
};
