import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Cpu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CandidateDashboardData } from '../../services';

interface HeroWorkspace3DStageProps {
  dashboardData: CandidateDashboardData;
  cleanName: string;
}

export const HeroWorkspace3DStage: React.FC<HeroWorkspace3DStageProps> = ({
  dashboardData,
  cleanName
}) => {
  const prefersReduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<number>(prefersReduced ? 6 : 1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const hasResume = dashboardData.hasPrimaryResume;
  const atsScore = dashboardData.atsScore;
  const resumeName = dashboardData.primaryResumeFileName || 'Primary_Resume.pdf';

  // Coordinated entrance sequence (Phase 1 to Phase 6)
  useEffect(() => {
    if (prefersReduced) return;

    const t1 = setTimeout(() => setPhase(2), 150);  // Phase 2: Workspace scene reveals
    const t2 = setTimeout(() => setPhase(3), 600);  // Phase 3: Resume scan indicator glides
    const t3 = setTimeout(() => setPhase(4), 1300); // Phase 4: ATS result / telemetry reveals
    const t4 = setTimeout(() => setPhase(5), 1800); // Phase 5: Content synchronized
    const t5 = setTimeout(() => setPhase(6), 2400); // Phase 6: Settled calm resting state

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [prefersReduced]);

  // Subtle interactive parallax tilt (restrained, max 2.5 degrees)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/10.5] rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/[0.14] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] bg-[#070b18] group select-none transition-colors duration-300"
      style={{
        perspective: '1200px'
      }}
    >
      {/* ── Subtle Top Specular Rim & Soft Ambient Lighting ─────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-30" />
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none z-10" />

      {/* ── 3D Visual Stage with subtle perspective tilt ───────────────────────── */}
      <motion.div
        animate={{
          rotateY: mousePos.x * 1.1,
          rotateX: -mousePos.y * 1.1,
          scale: phase >= 2 ? 1 : 0.98
        }}
        transition={{
          type: 'spring',
          damping: 32,
          stiffness: 160,
          mass: 0.8
        }}
        className="relative w-full h-full transform-gpu"
      >
        {/* Real 3D-Rendered Modern Workspace Scene */}
        <motion.img
          src="/assets/candidate/workspace_3d_hero.jpg"
          alt="3D Candidate Career Workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.04]"
          loading="eager"
        />

        {/* Ambient Depth & Natural Shadow Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/85 via-transparent to-[#050814]/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050814]/40 via-transparent to-[#050814]/30 pointer-events-none" />

        {/* ── PHASE 3: Scanning Light Beam (Moves smoothly across the laptop display) ──── */}
        {phase >= 3 && phase < 6 && (
          <motion.div
            initial={{ top: '24%', opacity: 0 }}
            animate={{ top: ['24%', '64%', '36%'], opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="absolute left-[28%] right-[28%] h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.5)] pointer-events-none z-20"
          />
        )}

        {/* ── Restrained In-Scene Telemetry HUD (Integrated naturally, no floating card) ── */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-cyan-300">NEXUS 3D INTELLIGENCE</span>
          </div>

          {hasResume && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: phase >= 4 ? 1 : 0, x: phase >= 4 ? 0 : -6 }}
              transition={{ duration: 0.4 }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-950/60 backdrop-blur-md border border-emerald-500/25 text-[10px] font-semibold text-emerald-300"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Resume Parsed</span>
            </motion.div>
          )}
        </div>

        {/* ── PHASE 4: Lower Calibration Bar (Anchored subtly to bottom of stage) ── */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[220px] sm:max-w-xs font-mono text-[10px] text-slate-300">
              {hasResume ? resumeName : 'No primary resume uploaded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {atsScore !== null && atsScore !== undefined ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: phase >= 4 ? 1 : 0, scale: phase >= 4 ? 1 : 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-bold text-emerald-300 shadow-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{atsScore}% ATS Match Score</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 4 ? 1 : 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-400"
              >
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Upload a resume to begin ATS analysis</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Subtle Resting Idle Light Ripple across glass */}
        {phase === 6 && (
          <motion.div
            animate={{
              opacity: [0.03, 0.08, 0.03]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none"
          />
        )}
      </motion.div>
    </div>
  );
};
