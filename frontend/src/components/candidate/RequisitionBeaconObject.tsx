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
  Lock
} from 'lucide-react';

interface RequisitionBeaconObjectProps {
  jobCount?: number;
  skillCount?: number;
}

export const RequisitionBeaconObject: React.FC<RequisitionBeaconObjectProps> = ({
  jobCount = 2,
  skillCount = 9
}) => {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth 3D perspective tilt calculation
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

  const tiltX = prefersReduced ? 0 : -mousePos.y * 6;
  const tiltY = prefersReduced ? 0 : mousePos.x * 6;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="w-full lg:max-w-md relative select-none"
      style={{ perspective: '1200px' }}
    >
      {/* ── 3D Interactive Card Shell ──────────────────────────────────────── */}
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: isHovered ? 1.015 : 1
        }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 180,
          mass: 0.7
        }}
        className="relative rounded-2xl bg-gradient-to-br from-[#0c142e]/98 via-[#080d22]/98 to-[#050816]/98 border border-indigo-400/40 p-5 overflow-hidden shadow-[0_0_35px_-4px_rgba(99,102,241,0.28),0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.25)] transition-shadow duration-300 hover:shadow-[0_0_45px_-2px_rgba(56,189,248,0.35),0_25px_60px_rgba(0,0,0,0.95)]"
      >
        {/* Top Specular Rim Light */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none z-20" />
        
        {/* Ambient Corner Atmosphere Glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        {/* ── HEADER TELEMETRY ROW ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-300">
              REQUISITION TELEMETRY HUB
            </span>
          </div>

          <span className="font-mono text-[10px] text-slate-300 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.10]">
            RADAR-v2026.4
          </span>
        </div>

        {/* ── CENTERPIECE: 3D ANIMATED OPPORTUNITY RADAR BEACON ───────────────── */}
        <div className="py-4 relative flex flex-col items-center justify-center min-h-[175px]">
          {/* Subtle Background Target Grid Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="h-full w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent absolute" />
          </div>

          {/* Radar Stage Motion Container */}
          <motion.div
            animate={
              prefersReduced
                ? {}
                : {
                    y: [0, -6, 0]
                  }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center my-1"
          >
            {/* Outer Orbital Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/35 animate-[spin_24s_linear_infinite]" />

            {/* Middle Rotating Segment Ring */}
            <div className="absolute inset-2.5 rounded-full border border-cyan-500/25 shadow-[0_0_15px_rgba(56,189,248,0.15)]" />

            {/* Sweeping Conic Radar Beam */}
            {!prefersReduced && (
              <div
                className="absolute inset-2.5 rounded-full pointer-events-none animate-[spin_6s_linear_infinite]"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(56, 189, 248, 0.22) 55deg, rgba(129, 140, 248, 0.45) 85deg, transparent 90deg)'
                }}
              />
            )}

            {/* Inner Concentric Pulse Waves */}
            <div className="absolute inset-8 rounded-full border border-cyan-400/40 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-indigo-600/30 via-cyan-500/25 to-purple-600/30 blur-sm" />

            {/* Orbiting Telemetry Chips (Satellite Pings) */}
            <motion.div
              animate={prefersReduced ? {} : { rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Satellite 1: Top Right */}
              <div className="absolute -top-1.5 right-2 px-1.5 py-0.5 rounded-md bg-indigo-950/90 border border-indigo-400/50 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                <span className="font-mono text-[8px] font-bold text-indigo-200">Java 21</span>
              </div>

              {/* Satellite 2: Bottom Left */}
              <div className="absolute -bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-400/50 shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                <span className="font-mono text-[8px] font-bold text-cyan-200">Spring Boot</span>
              </div>
            </motion.div>

            {/* Central Levitating 3D Prismatic Core */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-[#070b1a] border border-cyan-400/60 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.45),inset_0_1px_2px_rgba(255,255,255,0.4)] group-hover:border-cyan-300 transition-colors">
              <Cpu className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

              {/* Center Micro Spark */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              </span>
            </div>
          </motion.div>

          {/* Subtext beneath radar */}
          <div className="text-center pt-1 relative z-10">
            <p className="font-mono text-[11px] font-bold text-white tracking-wider flex items-center justify-center gap-1.5">
              <span>ACTIVE OPPORTUNITY MATCHING</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Continuous neural alignment of candidate profile competencies
            </p>
          </div>
        </div>

        {/* ── METRICS TELEMETRY GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.08] text-[11px] relative z-10">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Verified Stream</span>
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Real-Time Pings
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Direct Dispatch</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> &lt; 24h Recruiter SLA
            </span>
          </div>
        </div>

        {/* ── BOTTOM SECURITY & INTEGRITY FOOTER ──────────────────────────────── */}
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono relative z-10">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            GOVERNANCE: SYNCHRONIZED
          </span>
          <span className="text-slate-500 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-slate-500" />
            AES-256 ATS
          </span>
        </div>
      </motion.div>
    </div>
  );
};
