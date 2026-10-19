import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Briefcase,
  Layers,
  ArrowRight,
  UserCheck,
  Building2,
  ShieldAlert,
  BarChart3,
  FileText,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { AIAudioWaveform } from './AIAssistantEmblem';

export interface CinematicDashboardIntroProps {
  role: 'candidate' | 'recruiter' | 'admin';
  onComplete?: () => void;
}

/**
 * Hook to manage cinematic intro trigger lifecycle:
 * - Triggers on explicit login / role switch, or first entry in a tab session.
 * - Prevents re-triggering during in-dashboard navigation.
 * - Prevents re-triggering on page refresh.
 * - Prevents duplicate triggers in React Strict Mode.
 * - Respects user disable preference.
 */
export function useCinematicIntro(role: 'candidate' | 'recruiter' | 'admin') {
  const location = useLocation();

  const [shouldPlay, setShouldPlay] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Direct URL parameter trigger for quick replay, testing, and preview
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('play_intro') === 'true' || urlParams.get('welcome') === 'true') {
      return true;
    }

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('play_intro') === 'true' || urlParams.get('welcome') === 'true') {
      setShouldPlay(true);
    }
  }, [location.search]);

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

  // 5 Cinematic Sequences:
  // 1: environment reveal (0-1.0s) -> 2: environment comes to life (1.0-2.0s)
  // 3: AI assistant arrives (2.0-3.0s) -> 4: personalized welcome (3.0-4.5s) -> 5: dashboard handoff (4.5-5.2s)
  const [sequence, setSequence] = useState<'reveal' | 'alive' | 'assistant' | 'welcome' | 'handoff'>('reveal');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => voiceAssistantService.isMuted());

  // Dynamic role-aware greeting from authoritative authenticated profile
  const greeting = useMemo(() => {
    return voiceAssistantService.getRoleGreeting(user, role);
  }, [user, role]);

  const displayName = useMemo(() => {
    return voiceAssistantService.resolveFullName(user) || (role === 'admin' ? 'Administrator' : role === 'recruiter' ? 'Hiring Partner' : 'Candidate');
  }, [user, role]);

  // Role-specific environmental and visual configurations
  const roleConfig = useMemo(() => {
    if (role === 'recruiter') {
      return {
        sceneImage: '/assets/welcome/recruiter-talent-scene.jpg',
        badge: '✦ TALENT ACQUISITION // LIVE PIPELINE',
        eyebrow: 'RECRUITER WORKSPACE',
        accentColor: '#A855F7',
        accentBorder: 'border-purple-500/40',
        accentBg: 'bg-purple-500/15 text-purple-300',
        windowTitle: 'recruiter-command-center · live talent pipeline',
        windowStatus: 'Verified Organization',
        statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        ctaText: 'Enter Recruiter Portal',
        ctaGradient: 'from-purple-600 via-indigo-600 to-purple-600',
        pillars: [
          {
            icon: Briefcase,
            title: 'Requisition Management',
            desc: 'Author, publish, and track open roles with required skill matrix',
          },
          {
            icon: Target,
            title: '5-Vector ATS Screening',
            desc: 'Rank candidate dossiers by calculated match percentages and experience fit',
          },
          {
            icon: UserCheck,
            title: 'Interactive Kanban Pipeline',
            desc: 'Advance shortlisted applicants to technical screening and interview rounds',
          },
        ],
        bottomStatus: 'Synchronizing employer requisitions and candidate pipeline...',
      };
    }

    if (role === 'admin') {
      return {
        sceneImage: '/assets/welcome/admin-governance-scene.jpg',
        badge: '✦ PLATFORM GOVERNANCE // AUDIT READY',
        eyebrow: 'ADMINISTRATOR CONSOLE',
        accentColor: '#10B981',
        accentBorder: 'border-emerald-500/40',
        accentBg: 'bg-emerald-500/15 text-emerald-300',
        windowTitle: 'platform-governance · security operations',
        windowStatus: 'Single-Admin Verified',
        statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        ctaText: 'Enter Admin Console',
        ctaGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
        pillars: [
          {
            icon: ShieldCheck,
            title: 'Single-Administrator Security',
            desc: 'Platform-level singleton enforcement protecting administrative privileges',
          },
          {
            icon: Building2,
            title: 'Recruiter Verification Workflow',
            desc: 'Inspect and vet legitimate employer organizations before job publication',
          },
          {
            icon: BarChart3,
            title: 'System Telemetry & Audit Logs',
            desc: 'Live activity monitoring, compliance tracking, and security alerts',
          },
        ],
        bottomStatus: 'Synchronizing platform governance telemetry and audit logs...',
      };
    }

    // Default: Candidate
    return {
      sceneImage: '/assets/welcome/candidate-career-scene.jpg',
      badge: '✦ CAREER LAUNCHPAD // ACTIVE',
      eyebrow: 'CANDIDATE WORKSPACE',
      accentColor: '#55DDF5',
      accentBorder: 'border-cyan-500/40',
      accentBg: 'bg-cyan-500/15 text-cyan-300',
      windowTitle: 'ai-career-launchpad · live candidate dossier',
      windowStatus: '100% Parser Compliant',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      ctaText: 'Enter Career Portal',
      ctaGradient: 'from-cyan-500 via-indigo-600 to-purple-600',
      pillars: [
        {
          icon: FileText,
          title: 'ATS Resume Studio',
          desc: 'Build single-column OCR standard resumes with zero parsing errors',
        },
        {
          icon: Target,
          title: 'Skill-Matched Job Discovery',
          desc: 'Explore curated tech openings scored against your verified skills',
        },
        {
          icon: Layers,
          title: 'Transparent Application Tracker',
          desc: 'Track candidate status from submission to interview shortlists',
        },
      ],
      bottomStatus: 'Synchronizing candidate credentials and recruitment radar...',
    };
  }, [role]);

  // Lock background scrolling while overlay is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSkip = useCallback(() => {
    voiceAssistantService.stop();
    setIsVoiceActive(false);
    onComplete?.();
  }, [onComplete]);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = voiceAssistantService.toggleMute();
    setIsMuted(nextState);
    if (nextState) {
      voiceAssistantService.stop();
      setIsVoiceActive(false);
    }
  }, []);

  const handleReplayVoice = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      voiceAssistantService.setEnabled(true);
      setIsMuted(false);
    }
    setIsVoiceActive(true);
    voiceAssistantService.speak(greeting.voiceText, {
      interrupt: true,
      rate: greeting.rate,
      pitch: greeting.pitch,
    });
  }, [isMuted, greeting.voiceText, greeting.rate, greeting.pitch]);

  // Connect speaking state directly to voiceAssistantService
  useEffect(() => {
    return voiceAssistantService.subscribe((speaking) => {
      setIsVoiceActive(speaking);
    });
  }, []);

  // 5-Phase Choreographed Timeline
  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Sequence 1 -> Sequence 2: Environment comes to life (at 900ms)
    soundEffectService.playSuccessChime();

    const t1 = setTimeout(() => {
      setSequence('alive');
    }, 900);

    // Sequence 2 -> Sequence 3: AI Assistant arrives (at 1900ms)
    const t2 = setTimeout(() => {
      setSequence('assistant');
    }, 1900);

    // Sequence 3 -> Sequence 4: Personalized welcome & natural voice line (at 2800ms)
    const t3 = setTimeout(() => {
      setSequence('welcome');
      if (!voiceAssistantService.isMuted()) {
        voiceAssistantService.welcomeUser(user, role);
      }
      const sessionKey = user?.id || 'session';
      sessionStorage.setItem(`ai_ats_voice_welcome_done_${sessionKey}`, 'true');
      sessionStorage.removeItem('ai_ats_pending_voice_welcome');
    }, 2800);

    // Sequence 4 -> Sequence 5: Dashboard handoff (at 4700ms)
    const t4 = setTimeout(() => {
      setSequence('handoff');
    }, 4700);

    // Final completion (at 5300ms)
    const t5 = setTimeout(() => {
      onComplete?.();
    }, 5300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      // Notice: Do NOT call voiceAssistantService.stop() here.
      // The complete welcome speech continues playing smoothly into the user's dashboard!
    };
  }, [prefersReducedMotion, onComplete, user, role]);

  // Escape key listener to skip immediately
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
        aria-label={`${greeting.headline} ${greeting.subtitle}`}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/90 backdrop-blur-md"
      >
        <div className="text-center p-8 bg-[#070e1e] border border-slate-800 rounded-3xl shadow-2xl max-w-lg mx-4 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold ${roleConfig.accentBg} ${roleConfig.accentBorder}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{roleConfig.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {greeting.headline}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">{greeting.subtitle}</p>
          <div className="pt-2">
            <button
              onClick={handleSkip}
              className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${roleConfig.ctaGradient} text-white text-xs font-bold transition-all shadow-md`}
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-live="polite"
      role="status"
      aria-label={`${greeting.headline} ${greeting.subtitle}`}
      className="fixed inset-0 z-[100] overflow-hidden select-none cursor-default"
      title="Click Skip or press Escape to continue to dashboard"
    >
      {/* ── BASE VEIL: TRANSLUCENT DEEP GLASSMORPHISM (Dashboard softly visible underneath) ── */}
      <motion.div
        initial={{ opacity: 0.96 }}
        animate={{
          opacity: sequence === 'handoff' ? 0 : 0.82,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md"
      />

      {/* ── ROLE-SPECIFIC CINEMATIC 3D ENVIRONMENT LAYER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{
          opacity: sequence === 'handoff' ? 0 : sequence === 'reveal' ? 0.25 : 0.48,
          scale: sequence === 'handoff' ? 1.08 : 1,
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <img
          src={roleConfig.sceneImage}
          alt=""
          className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.06]"
        />
        {/* Cinematic Vignettes & Lighting Integration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/75 to-[#030712]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_#030712_85%)]" />
      </motion.div>

      {/* ── AMBIENT RADIAL LIGHTING ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: sequence === 'handoff' ? 0 : [0.35, 0.65, 0.45],
          scale: sequence === 'handoff' ? 1.25 : 1,
        }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(circle at 45% 42%, ${roleConfig.accentColor}25 0%, rgba(99, 102, 241, 0.15) 35%, transparent 70%)`,
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* ── RESTRAINED HORIZONTAL LIGHT SWEEP (Sequence 1) ── */}
      <AnimatePresence>
        {(sequence === 'reveal' || sequence === 'alive') && (
          <motion.div
            initial={{ y: '-10%', opacity: 0 }}
            animate={{ y: '120%', opacity: [0, 0.8, 0.65, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-16 pointer-events-none flex flex-col justify-center"
          >
            <div
              className="w-full h-[1.5px]"
              style={{
                background: `linear-gradient(to right, transparent, ${roleConfig.accentColor}, transparent)`,
                boxShadow: `0 0 16px ${roleConfig.accentColor}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP NAV CONTROLS ── */}
      <header className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-white uppercase drop-shadow-sm">
            NEXTGEN ATS
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: roleConfig.accentColor }}
          />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-300 uppercase hidden sm:inline-block">
            {roleConfig.eyebrow}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Replay Voice Button */}
          <button
            type="button"
            onClick={handleReplayVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer shadow-sm"
            aria-label="Replay welcome greeting audio"
            title="Replay welcome voice"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Audio Mute/Unmute Control */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-mono cursor-pointer shadow-sm ${
              isMuted
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-white'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
            }`}
            aria-label={isMuted ? 'Unmute voice assistant' : 'Mute voice assistant'}
            title={isMuted ? 'Voice assistant is muted' : 'Voice assistant is active'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Voice Active'}</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer backdrop-blur-md"
            aria-label="Skip welcome sequence and continue to dashboard"
          >
            <span>Skip</span>
            <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300 border border-white/10">
              Esc
            </kbd>
          </button>
        </div>
      </header>

      {/* ── MAIN CINEMATIC PRESENTATION ── */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-12 z-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: AUTHENTIC ROLE-SPECIFIC WORKSPACE CONSOLE */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{
                opacity: sequence === 'reveal' ? 0 : sequence === 'handoff' ? 0 : 1,
                scale: sequence === 'handoff' ? 1.04 : 1,
                y: sequence === 'handoff' ? -16 : 0,
              }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl border border-slate-800/90 bg-[#070e1e]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a1428] border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                    {roleConfig.windowTitle}
                  </span>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${roleConfig.statusColor}`}>
                  <CheckCircle2 className="w-2.5 h-2.5" /> {roleConfig.windowStatus}
                </span>
              </div>

              {/* Console Body */}
              <div className="p-4 sm:p-5 space-y-3.5 relative text-xs">
                {/* Laser Scanning Beam */}
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-[1.5px] pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, transparent, ${roleConfig.accentColor}, transparent)`,
                    boxShadow: `0 0 10px ${roleConfig.accentColor}`,
                  }}
                />

                {/* Identity Header */}
                <div className="text-center pb-2.5 border-b border-slate-800">
                  <div className="inline-block text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-0.5">
                    AUTHENTICATED {role.toUpperCase()}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-display">
                    {displayName}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5">
                    {user?.email || `${role}@ai-ats.internal`} · {roleConfig.windowStatus}
                  </p>
                </div>

                {/* 3 Role-Specific Capability Pillars */}
                <div className="space-y-2.5">
                  {roleConfig.pillars.map((pillar, idx) => {
                    const PillarIcon = pillar.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: sequence === 'reveal' ? 0.3 : 1,
                          x: 0,
                        }}
                        transition={{ delay: 0.1 * (idx + 1), duration: 0.4 }}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3"
                      >
                        <div
                          className="p-1.5 rounded-lg shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${roleConfig.accentColor}20`,
                            color: roleConfig.accentColor,
                            border: `1px solid ${roleConfig.accentColor}35`,
                          }}
                        >
                          <PillarIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-[11px] font-display">{pillar.title}</div>
                          <div className="text-[10px] text-slate-400 leading-relaxed font-sans">{pillar.desc}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom Verification Strip */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Role Protocol: Active Session</span>
                  </span>
                  <span className="font-bold" style={{ color: roleConfig.accentColor }}>
                    Platform Ready
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: AI ASSISTANT CHARACTER & PERSONALIZED WELCOME */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            
            {/* ── CUTE, MODERN 3D AI ASSISTANT MASCOT ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 16 }}
              animate={{
                opacity: sequence === 'reveal' ? 0 : sequence === 'handoff' ? 0 : 1,
                scale: sequence === 'handoff' ? 1.08 : 1,
                y: sequence === 'handoff' ? -16 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center gap-4"
            >
              {/* Floating Animated Robot Character */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [-1.5, 1.5, -1.5],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative shrink-0"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/30 to-purple-500/20 border border-white/20 shadow-2xl backdrop-blur-md">
                  <img
                    src="/assets/welcome/ai-assistant-companion.png"
                    alt="AI Assistant Companion"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                  />
                </div>
                {/* Glowing halo behind assistant */}
                <div
                  className="absolute inset-0 rounded-2xl blur-lg -z-10 pointer-events-none opacity-50"
                  style={{ backgroundColor: roleConfig.accentColor }}
                />
              </motion.div>

              {/* Speech bubble intro */}
              <div className="text-left hidden sm:block">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-bold block">
                  TALENTPILOT AI COMPANION
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Ready to assist your {role} workflow
                </span>
              </div>
            </motion.div>

            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: sequence === 'reveal' ? 0 : 1,
                y: sequence === 'reveal' ? 8 : 0,
              }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-bold tracking-wider ${roleConfig.accentBg} ${roleConfig.accentBorder} shadow-sm`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{roleConfig.badge}</span>
            </motion.div>

            {/* Personalized Welcome Typography */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: sequence === 'welcome' || sequence === 'assistant' || sequence === 'handoff' ? 1 : 0.6,
                y: sequence === 'welcome' || sequence === 'assistant' ? 0 : 8,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 max-w-xl"
            >
              <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Welcome back
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-[1.12]">
                {displayName}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pt-1 max-w-lg">
                {greeting.subtitle}
              </p>
            </motion.div>

            {/* AI Voice Assistant Waveform Box */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: sequence === 'welcome' || sequence === 'handoff' ? 1 : 0,
                y: sequence === 'welcome' || sequence === 'handoff' ? 0 : 8,
              }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md p-3.5 rounded-2xl bg-[#091428]/85 border border-slate-800 flex items-center justify-between gap-3 text-xs backdrop-blur-md shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${roleConfig.accentColor}25`,
                    color: roleConfig.accentColor,
                    border: `1px solid ${roleConfig.accentColor}40`,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>AI Voice Companion</span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {isMuted ? 'Muted' : 'Speaking'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {voiceAssistantService.getSelectedVoiceName()}
                  </div>
                </div>
              </div>

              <AIAudioWaveform isSpeaking={isVoiceActive && !isMuted} />
            </motion.div>

            {/* Quick Action Button to continue immediately */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: sequence === 'welcome' || sequence === 'handoff' ? 1 : 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="pt-1"
            >
              <button
                type="button"
                onClick={handleSkip}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r ${roleConfig.ctaGradient} hover:brightness-110 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer`}
              >
                <span>{roleConfig.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SUBTLE STATUS LINE ── */}
      <footer className="absolute bottom-6 inset-x-0 flex items-center justify-center pointer-events-none z-30">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#070e1e]/90 border border-slate-800 text-[11px] font-mono text-slate-400 backdrop-blur-md shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{roleConfig.bottomStatus}</span>
        </div>
      </footer>
    </aside>
  );
};

export default CinematicDashboardIntro;
