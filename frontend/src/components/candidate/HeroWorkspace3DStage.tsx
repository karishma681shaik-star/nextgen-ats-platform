import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Cpu } from 'lucide-react';
import type { CandidateDashboardData } from '../../services';
import type { CandidateProfile } from '../../types';
import { candidateService } from '../../services';
import { AlexRiveraLaptopResume } from './AlexRiveraLaptopResume';

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
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  const hasResume = dashboardData.hasPrimaryResume;
  const atsScore = dashboardData.atsScore;
  const resumeName = dashboardData.primaryResumeFileName || 'ALEX-RIVERA-RESUME.pdf';

  // Load candidate profile data to ensure authentic Alex Rivera details
  useEffect(() => {
    let cancelled = false;
    candidateService.getProfile().then((data) => {
      if (!cancelled && data) {
        setProfile(data);
      }
    }).catch(() => {
      // Graceful fallback to default Alex Rivera mock profile
    });
    return () => { cancelled = true; };
  }, []);

  // Coordinated entrance sequence (Phase 1 to Phase 6)
  useEffect(() => {
    if (prefersReduced) return;

    const t1 = setTimeout(() => setPhase(2), 150);  // Phase 2: Laptop reveals
    const t2 = setTimeout(() => setPhase(3), 500);  // Phase 3: Resume scan indicator glides
    const t3 = setTimeout(() => setPhase(4), 1100); // Phase 4: Settle & telemetry
    const t4 = setTimeout(() => setPhase(6), 1800); // Phase 6: Settled calm resting state

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [prefersReduced]);

  // Subtle interactive parallax tilt (restrained, max 2.2 degrees)
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
      className="relative w-full aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/10.5] rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/[0.14] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] bg-[#070b18] group select-none transition-colors duration-300 flex items-center justify-center p-3 sm:p-5"
      style={{
        perspective: '1200px'
      }}
    >
      {/* ── Subtle Top Specular Rim & Soft Ambient Lighting ─────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-30" />
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none z-10" />
      <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-cyan-500/[0.05] blur-3xl pointer-events-none z-10" />

      {/* ── 3D Interactive Parallax Stage ──────────────────────────────────── */}
      <motion.div
        animate={{
          rotateY: mousePos.x * 1.5,
          rotateX: -mousePos.y * 1.5,
          scale: phase >= 2 ? 1 : 0.98
        }}
        transition={{
          type: 'spring',
          damping: 32,
          stiffness: 160,
          mass: 0.8
        }}
        className="relative w-full h-full flex items-center justify-center transform-gpu"
      >
        {/* Central Floating Laptop Assembly */}
        <div className="relative w-full max-w-[530px] sm:max-w-[560px] aspect-[868/598] flex items-center justify-center">
          {/* Subtle Grounding Shadow beneath floating laptop */}
          <div className="absolute -bottom-2 left-[12%] right-[12%] h-5 bg-black/60 rounded-full blur-lg pointer-events-none" />

          {/* ── Laptop Screen Canvas (Fit within bezel boundaries) ─────────────── */}
          <div
            className="absolute overflow-hidden rounded-[3px] bg-white z-0 shadow-inner"
            style={{
              left: '13.13%',
              top: '4.18%',
              width: '73.73%',
              height: '62.71%'
            }}
          >
            {/* The Authentic Alex Rivera Resume Document */}
            <AlexRiveraLaptopResume
              profile={profile}
              cleanName={cleanName}
              atsScore={atsScore}
            />

            {/* Scanning Light Beam (Phase 3 animation across the document) */}
            {phase >= 3 && phase < 6 && (
              <motion.div
                initial={{ top: '0%', opacity: 0 }}
                animate={{ top: ['0%', '100%', '30%'], opacity: [0, 0.65, 0] }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.6)] pointer-events-none z-20"
              />
            )}

            {/* Subtle Realistic Glass Surface Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />
          </div>

          {/* ── Transparent Laptop Chassis Overlay (Cutout screen reveals document) ─ */}
          <motion.img
            src="/assets/candidate/laptop_transparent.png"
            alt="Candidate Career Workspace Laptop"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
            loading="eager"
          />
        </div>
      </motion.div>
    </div>
  );
};
