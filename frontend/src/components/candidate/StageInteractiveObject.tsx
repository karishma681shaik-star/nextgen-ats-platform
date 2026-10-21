import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  SearchCheck,
  Compass,
  FileText,
  Activity,
  Layers,
  Zap,
  Check,
  Radio,
  Video,
  Mic,
  PenTool,
  Lock,
  ArrowUpRight
} from 'lucide-react';

interface StageInteractiveObjectProps {
  stageId: string; // 'All' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected'
  compact?: boolean;
}

export const StageInteractiveObject: React.FC<StageInteractiveObjectProps> = ({
  stageId,
  compact = false
}) => {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Subtle interactive 3D perspective tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMousePos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const tiltX = prefersReduced ? 0 : -mousePos.y * (compact ? 4 : 7);
  const tiltY = prefersReduced ? 0 : mousePos.x * (compact ? 4 : 7);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${compact ? 'w-full max-w-[240px]' : 'w-full max-w-md mx-auto'}`}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 180,
          mass: 0.6
        }}
        className={`relative rounded-2xl overflow-hidden border transition-all duration-300 transform-gpu ${
          compact
            ? 'p-3 bg-gradient-to-br from-[#0a1024]/95 via-[#060a19]/95 to-[#030612]/95 border-white/[0.12] shadow-lg'
            : 'p-6 sm:p-7 bg-gradient-to-br from-[#0c1430]/98 via-[#070d22]/98 to-[#040716]/98 border-white/[0.16] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.2)]'
        }`}
      >
        {/* Render the specific bespoke interactive object based on stageId */}
        {stageId === 'Under Review' ? (
          <UnderReviewScannerObject compact={compact} prefersReduced={prefersReduced} />
        ) : stageId === 'Shortlisted' ? (
          <ShortlistedMedallionObject compact={compact} prefersReduced={prefersReduced} />
        ) : stageId === 'Interview' ? (
          <InterviewChronoNodeObject compact={compact} prefersReduced={prefersReduced} />
        ) : stageId === 'Selected' ? (
          <OfferLedgerQuillObject compact={compact} prefersReduced={prefersReduced} />
        ) : (
          <MasterPortfolioMatrixObject compact={compact} prefersReduced={prefersReduced} />
        )}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGE 1: ALL APPLICATIONS — MASTER APPLICATION PORTFOLIO MATRIX & TELEMETRY
───────────────────────────────────────────────────────────────────────────── */
const MasterPortfolioMatrixObject: React.FC<{ compact: boolean; prefersReduced: boolean | null }> = ({
  compact,
  prefersReduced
}) => {
  return (
    <div className="relative">
      {/* Specular Top Rim & Ambient Lighting */}
      <div className="absolute -top-3 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      {/* Header Telemetry Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-indigo-300 uppercase">
            360° Portfolio Matrix
          </span>
        </div>
        <span className="font-mono text-[9px] text-slate-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-400/25">
          LIVE TELEMETRY
        </span>
      </div>

      {/* Central 3D Interactive Telemetry Canvas */}
      <div className={`relative flex items-center justify-center ${compact ? 'py-4 min-h-[110px]' : 'py-6 min-h-[180px]'}`}>
        {/* Layered Dossier Cards Stack in Isometric Perspective */}
        <div className="relative flex items-center justify-center">
          {/* Background Layer 1: Under Dossier Card */}
          <div
            className={`absolute rounded-xl bg-indigo-950/60 border border-indigo-500/20 shadow-md ${
              compact ? 'w-36 h-24 -rotate-6 translate-y-1' : 'w-56 h-36 -rotate-6 translate-y-2'
            }`}
          />
          {/* Background Layer 2: Mid Dossier Card */}
          <div
            className={`absolute rounded-xl bg-slate-900/80 border border-cyan-500/25 shadow-lg ${
              compact ? 'w-40 h-24 rotate-3 -translate-y-1' : 'w-60 h-36 rotate-3 -translate-y-1'
            }`}
          />

          {/* Foreground Primary Master Dossier Card */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative rounded-xl bg-gradient-to-br from-slate-900/95 via-indigo-950/90 to-slate-950/95 border border-indigo-400/40 p-3 sm:p-4 shadow-[0_12px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] z-10 ${
              compact ? 'w-44 h-28' : 'w-64 h-40'
            }`}
          >
            {/* Card Content Skeleton / Wireframe */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-white tracking-tight">CANDIDATE DOSSIER</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/30">
                ACTIVE
              </span>
            </div>

            {/* Scanning Light Beam */}
            {!prefersReduced && (
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none"
              />
            )}

            {/* Wireframe Data Rows */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-20 h-1.5 rounded-full bg-white/20" />
                <div className="w-10 h-1.5 rounded-full bg-indigo-400/40" />
              </div>
              <div className="flex items-center justify-between">
                <div className="w-28 h-1.5 rounded-full bg-white/10" />
                <div className="w-8 h-1.5 rounded-full bg-cyan-400/40" />
              </div>
              <div className="flex items-center justify-between">
                <div className="w-16 h-1.5 rounded-full bg-white/15" />
                <div className="w-12 h-1.5 rounded-full bg-emerald-400/40" />
              </div>
            </div>

            {/* Floating Telemetry Micro-Badge */}
            <div className="absolute -bottom-2.5 right-3 bg-indigo-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-indigo-300/40 shadow-lg flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              <span>ATS SYNC 98%</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Status Indicators */}
      {!compact && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authenticated Ledger</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-cyan-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Real-time Poll</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGE 2: UNDER REVIEW — PRECISION OPTICAL SCANNER & RECRUITER AUDIT SCOPE
───────────────────────────────────────────────────────────────────────────── */
const UnderReviewScannerObject: React.FC<{ compact: boolean; prefersReduced: boolean | null }> = ({
  compact,
  prefersReduced
}) => {
  return (
    <div className="relative">
      {/* Specular Top Rim & Ambient Lighting */}
      <div className="absolute -top-3 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      {/* Header Telemetry Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-amber-300 uppercase">
            Recruiter Audit Scope
          </span>
        </div>
        <span className="font-mono text-[9px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/25">
          STAGE 1 EVALUATION
        </span>
      </div>

      {/* Central 3D Interactive Telemetry Canvas */}
      <div className={`relative flex items-center justify-center ${compact ? 'py-4 min-h-[110px]' : 'py-6 min-h-[180px]'}`}>
        <div className="relative w-full flex items-center justify-center">
          {/* Rotating Radar / Optical Reticle */}
          <div className={`relative flex items-center justify-center ${compact ? 'w-28 h-28' : 'w-44 h-44'}`}>
            {/* Outer Rotating Segmented Reticle */}
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/40 animate-[spin_20s_linear_infinite]" />
            {/* Inner Ring */}
            <div className="absolute inset-2.5 rounded-full border border-cyan-400/30" />
            
            {/* Sweeping Laser Beam */}
            {!prefersReduced && (
              <div
                className="absolute inset-2.5 rounded-full pointer-events-none animate-[spin_4s_linear_infinite]"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.25) 60deg, rgba(34, 211, 238, 0.5) 90deg, transparent 92deg)'
                }}
              />
            )}

            {/* Center Audit Core */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-600/30 via-slate-900 to-cyan-600/30 border border-amber-400/40 flex flex-col items-center justify-center shadow-lg">
              <SearchCheck className={`text-amber-300 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
              {!compact && (
                <span className="text-[8px] font-mono font-bold text-cyan-300 mt-1">SCAN ACTIVE</span>
              )}
            </div>

            {/* Reticle Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-full h-px bg-amber-400/50" />
              <div className="h-full w-px bg-amber-400/50 absolute" />
            </div>
          </div>

          {/* Floating Verification Checklist Tags */}
          {!compact && (
            <div className="absolute -right-2 top-2 space-y-1.5 z-20">
              <div className="bg-slate-900/90 border border-white/10 px-2 py-1 rounded-md shadow-md flex items-center gap-1.5 text-[9px] text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Architecture: <strong className="text-white">Verified</strong></span>
              </div>
              <div className="bg-slate-900/90 border border-white/10 px-2 py-1 rounded-md shadow-md flex items-center gap-1.5 text-[9px] text-slate-300">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Reviewer: <strong className="text-amber-300">In Queue</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Indicators */}
      {!compact && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Telemetry Scoring</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-amber-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Active Screening</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGE 3: SHORTLISTED — PRESTIGE SELECTION MEDALLION & TIER CREST
───────────────────────────────────────────────────────────────────────────── */
const ShortlistedMedallionObject: React.FC<{ compact: boolean; prefersReduced: boolean | null }> = ({
  compact,
  prefersReduced
}) => {
  return (
    <div className="relative">
      {/* Specular Top Rim & Ambient Lighting */}
      <div className="absolute -top-3 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      {/* Header Telemetry Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-emerald-300 uppercase">
            Executive Tier Crest
          </span>
        </div>
        <span className="font-mono text-[9px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/25">
          TOP 5% POOL
        </span>
      </div>

      {/* Central 3D Interactive Telemetry Canvas */}
      <div className={`relative flex items-center justify-center ${compact ? 'py-4 min-h-[110px]' : 'py-6 min-h-[180px]'}`}>
        <div className="relative flex items-center justify-center">
          {/* Radiant Hexagonal Glowing Medallion */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-cyan-950 border-2 border-emerald-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.35),inset_0_1px_3px_rgba(255,255,255,0.4)] ${
              compact ? 'w-24 h-24' : 'w-36 h-36'
            }`}
          >
            {/* Inner Rotating Hex Ring */}
            <div className="absolute inset-2 rounded-2xl border border-dashed border-emerald-300/40 animate-[spin_24s_linear_infinite]" />
            
            {/* Center Crest Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Award className={`text-emerald-300 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] ${compact ? 'w-8 h-8' : 'w-14 h-14'}`} />
              {!compact && (
                <span className="text-[9px] font-extrabold tracking-wider text-white mt-1 uppercase">
                  SHORTLISTED
                </span>
              )}
            </div>

            {/* Shimmer Specular Light Streak */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Floating Selection Badges */}
          {!compact && (
            <>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-4 bg-slate-900/90 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>APPROVED BY LEAD</span>
              </motion.div>
              <motion.div
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-6 bottom-4 bg-slate-900/90 border border-cyan-400/40 text-cyan-300 text-[9px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>INTERVIEW QUEUE</span>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Footer Status Indicators */}
      {!compact && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Advancement Cleared</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-emerald-300 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Priority Pool</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGE 4: INTERVIEW SCHEDULED — CHRONO-SYNCHRONIZED MEETING NODE
───────────────────────────────────────────────────────────────────────────── */
const InterviewChronoNodeObject: React.FC<{ compact: boolean; prefersReduced: boolean | null }> = ({
  compact,
  prefersReduced
}) => {
  return (
    <div className="relative">
      {/* Specular Top Rim & Ambient Lighting */}
      <div className="absolute -top-3 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

      {/* Header Telemetry Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-purple-300 uppercase">
            Assessment Sync Node
          </span>
        </div>
        <span className="font-mono text-[9px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-400/25">
          CALENDAR SYNC
        </span>
      </div>

      {/* Central 3D Interactive Telemetry Canvas */}
      <div className={`relative flex items-center justify-center ${compact ? 'py-4 min-h-[110px]' : 'py-6 min-h-[180px]'}`}>
        <div className="relative flex items-center justify-center">
          {/* Holographic Calendar Prism Box */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative rounded-2xl bg-gradient-to-br from-slate-900/95 via-purple-950/80 to-slate-950/95 border border-purple-400/40 p-3 sm:p-4 shadow-[0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.2)] ${
              compact ? 'w-44 h-28' : 'w-64 h-40'
            }`}
          >
            {/* Header with Video Protocol Indicator */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-white">PANEL PROTOCOL</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-400/30">
                <Video className="w-2.5 h-2.5 text-cyan-400" />
                <span>HD LINK</span>
              </div>
            </div>

            {/* Audio Waveform Equalizer Display */}
            <div className="my-2 bg-slate-950/80 rounded-lg p-2 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-purple-400" />
                <span className="text-[9px] text-slate-400 font-mono">AUDIO READY</span>
              </div>
              {/* Dynamic Animated Frequency Bars */}
              <div className="flex items-end gap-1 h-4">
                {[6, 12, 16, 9, 14, 11, 7, 15].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={
                      prefersReduced
                        ? { height: `${h}px` }
                        : { height: [`${h * 0.4}px`, `${h}px`, `${h * 0.3}px`] }
                    }
                    transition={{
                      duration: 0.8 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400"
                  />
                ))}
              </div>
            </div>

            {/* Time Slot Node Badge */}
            <div className="flex items-center justify-between text-[9px] pt-1">
              <span className="text-slate-300 font-mono">10:00 AM • TECHNICAL</span>
              <span className="text-emerald-400 font-bold">CONFIRMED ✓</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Status Indicators */}
      {!compact && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Panel Synchronized</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-purple-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Prep Telemetry Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGE 5: OFFERS / SELECTED — SOVEREIGN OFFER LEDGER & APPOINTMENT QUILL
───────────────────────────────────────────────────────────────────────────── */
const OfferLedgerQuillObject: React.FC<{ compact: boolean; prefersReduced: boolean | null }> = ({
  compact,
  prefersReduced
}) => {
  return (
    <div className="relative">
      {/* Specular Top Rim & Ambient Lighting */}
      <div className="absolute -top-3 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

      {/* Header Telemetry Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-amber-300 uppercase">
            Sovereign Offer Ledger
          </span>
        </div>
        <span className="font-mono text-[9px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/25">
          APPOINTMENT CLEARED
        </span>
      </div>

      {/* Central 3D Interactive Telemetry Canvas */}
      <div className={`relative flex items-center justify-center ${compact ? 'py-4 min-h-[110px]' : 'py-6 min-h-[180px]'}`}>
        <div className="relative flex items-center justify-center">
          {/* Executive Gold & Emerald Offer Letter Certificate */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative rounded-2xl bg-gradient-to-br from-[#121c2e] via-[#091122] to-[#040814] border-2 border-amber-400/40 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.25)] ${
              compact ? 'w-44 h-28' : 'w-64 h-40'
            }`}
          >
            {/* Top Seal & Gold Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-400/20">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-extrabold text-amber-200 tracking-wider">OFFICIAL APPOINTMENT</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            </div>

            {/* Animated Bezier Signature Stroke */}
            <div className="relative h-10 sm:h-12 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 60" fill="none">
                <motion.path
                  d="M10 35 C 30 10, 40 50, 60 25 C 80 5, 90 45, 110 30 C 130 15, 150 40, 185 20"
                  stroke="url(#signatureGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <defs>
                  <linearGradient id="signatureGradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f59e0b" />
                    <stop offset="0.5" stopColor="#34d399" />
                    <stop offset="1" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating Stylus / Quill Tip */}
              <div className="absolute right-3 bottom-1 flex items-center gap-1 text-[8px] font-mono text-amber-300">
                <PenTool className="w-3 h-3 text-amber-400" />
                <span>EXECUTED</span>
              </div>
            </div>

            {/* Embossed Cryptographic Approval Stamp */}
            <div className="absolute -bottom-2 left-4 bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-300/40 shadow-lg flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
              <span>OFFER RECORD CONFIRMED</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Status Indicators */}
      {!compact && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Executive Compensation</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-emerald-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Decision</span>
          </div>
        </div>
      )}
    </div>
  );
};
