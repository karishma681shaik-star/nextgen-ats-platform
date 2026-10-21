import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu,
  Compass,
  Radio,
  Lock,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Job } from '../../types';

interface SavedJobsExecutiveDeskProps {
  savedJobs: Job[];
  appliedCount: number;
}

export const SavedJobsExecutiveDesk: React.FC<SavedJobsExecutiveDeskProps> = ({
  savedJobs,
  appliedCount
}) => {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth interactive 3D perspective tilt
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

  const tiltX = prefersReduced ? 0 : -mousePos.y * 5;
  const tiltY = prefersReduced ? 0 : mousePos.x * 5;

  const totalCount = savedJobs.length;
  const activeCount = savedJobs.filter((j) => j.status !== 'closed').length;
  const avgMatch = totalCount > 0
    ? Math.round(
        savedJobs.reduce((acc, curr) => acc + (curr.matchScore || 75), 0) / totalCount
      )
    : 88;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="w-full relative select-none mb-6"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: isHovered ? 1.01 : 1
        }}
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 180,
          mass: 0.6
        }}
        className="card-ultra-shine rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_-4px_rgba(99,102,241,0.30)]"
      >
        {/* Specular Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column (7 cols): Header Telemetry & Live Opportunity Metrics */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Telemetry Tag */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  OPPORTUNITY TELEMETRY & VAULT MATRIX
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.10]">
                  REAL-TIME v2026.4
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Synchronized candidate opportunity ledger. Neural alignment matches your qualifications against real-time recruiter requisition parameters.
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/25 shadow-sm">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bookmarked</p>
                <p className="text-xl font-black text-white mt-0.5 flex items-baseline gap-1">
                  {totalCount} <span className="text-xs font-normal text-slate-400">{totalCount === 1 ? 'Role' : 'Roles'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/25 shadow-sm">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Open Positions</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5 flex items-baseline gap-1">
                  {activeCount} <span className="text-xs font-normal text-slate-400">Active</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/25 shadow-sm">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Avg ATS Match</p>
                <p className="text-xl font-black text-cyan-300 mt-0.5 flex items-baseline gap-1">
                  {avgMatch}% <span className="text-xs font-normal text-slate-400">Match</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/25 shadow-sm">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dispatched</p>
                <p className="text-xl font-black text-indigo-300 mt-0.5 flex items-baseline gap-1">
                  {appliedCount} <span className="text-xs font-normal text-slate-400">Applied</span>
                </p>
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LEDGER: SYNCHRONIZED</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>DIRECT RECRUITER PIPELINE</span>
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Unique Animated 3D Quantum Beacon & Holographic Core */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#070c1d]/90 to-[#040816]/95 border border-cyan-500/30 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.18)] relative min-h-[220px]">
            {/* Background Radar Grid Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <div className="h-full w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent absolute" />
            </div>

            {/* Stage Motion Container */}
            <motion.div
              animate={prefersReduced ? {} : { y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center"
            >
              {/* Outer Orbital Dashed Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/40 animate-[spin_24s_linear_infinite]" />

              {/* Middle Precision Segment Ring */}
              <div className="absolute inset-3 rounded-full border border-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.25)] animate-[spin_14s_linear_infinite_reverse]" />

              {/* Sweeping Conic Radar Beam */}
              {!prefersReduced && (
                <div
                  className="absolute inset-3 rounded-full pointer-events-none animate-[spin_5s_linear_infinite]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(56, 189, 248, 0.15) 50deg, rgba(129, 140, 248, 0.50) 85deg, transparent 90deg)'
                  }}
                />
              )}

              {/* Inner Pulse Wave */}
              <div className="absolute inset-9 rounded-full border border-cyan-400/50 animate-ping opacity-25 pointer-events-none" />
              <div className="absolute inset-11 rounded-full bg-gradient-to-tr from-indigo-600/30 via-cyan-500/25 to-purple-600/30 blur-sm" />

              {/* Orbiting Satellite Telemetry Chips */}
              <motion.div
                animate={prefersReduced ? {} : { rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Satellite 1: Top Right */}
                <div className="absolute -top-1 right-2 px-2 py-0.5 rounded-md bg-[#0a1330]/95 border border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                  <span className="font-mono text-[8px] font-bold text-cyan-200">98% SYNC</span>
                </div>

                {/* Satellite 2: Bottom Left */}
                <div className="absolute -bottom-1 left-2 px-2 py-0.5 rounded-md bg-[#0d0f28]/95 border border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                  <span className="font-mono text-[8px] font-bold text-indigo-200">PRIORITY</span>
                </div>
              </motion.div>

              {/* Central Levitating 3D Prismatic Core */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-[#05091a] border border-cyan-300/70 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.65),inset_0_1px_2px_rgba(255,255,255,0.5)] transition-all duration-300 group-hover:scale-105">
                <Bookmark className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]" />

                {/* Micro Spark on Corner */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                </span>
              </div>
            </motion.div>

            {/* Caption beneath object */}
            <div className="text-center pt-2 relative z-10">
              <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase flex items-center justify-center gap-1.5">
                <span>NEURAL OPPORTUNITY BEACON</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Real-time active qualification tracking
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
