import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Zap,
  TrendingUp,
  FileCheck,
  Award,
  Layers,
  Search,
} from 'lucide-react';
import { FloatingInsight } from './FloatingInsight';

export const HeroAtsPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'skills' | 'ai-insights'>('metrics');
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 8, y: y * 8 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto lg:max-w-none perspective-1000 select-none"
    >
      {/* Ambient background glow behind ATS card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-cyan-500/25 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

      {/* Floating Badge 1: Top Right */}
      <div className="absolute -top-6 -right-2 sm:-right-6 hidden sm:block z-30">
        <FloatingInsight
          icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          title="98% AI Match"
          subtitle="Senior Java Full Stack"
          badge="High Fit"
          badgeColor="cyan"
          delay={0.2}
          duration={5.5}
          yOffset={10}
        />
      </div>

      {/* Floating Badge 2: Bottom Left */}
      <div className="absolute -bottom-8 -left-3 sm:-left-8 hidden sm:block z-30">
        <FloatingInsight
          icon={<Cpu className="w-4 h-4 text-indigo-400" />}
          title="Spring Boot ✓ + AWS"
          subtitle="Key Strengths Verified"
          badge="Top 3%"
          badgeColor="indigo"
          delay={0.6}
          duration={6.2}
          yOffset={8}
        />
      </div>

      {/* Floating Badge 3: Center Right */}
      <div className="absolute top-1/2 -right-4 sm:-right-10 -translate-y-1/2 hidden md:block z-30">
        <FloatingInsight
          icon={<Zap className="w-4 h-4 text-emerald-400" />}
          title="Parsed in 240ms"
          subtitle="Semantic ATS Engine"
          badge="Instant"
          badgeColor="emerald"
          delay={0.9}
          duration={4.8}
          yOffset={6}
        />
      </div>

      {/* Main ATS Card Frame */}
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.5 }}
        className="relative rounded-2xl glass-card-elevated border border-indigo-500/30 shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Animated Scanning Beam Line */}
        <motion.div
          animate={{
            top: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-0 right-0 h-1 scanline-beam pointer-events-none z-20 opacity-80"
        />

        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600/30 via-indigo-500/20 to-purple-600/30 border border-indigo-500/40 flex flex-col items-center justify-center text-indigo-300 shadow-glow">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">94</span>
                  <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-bold mt-0.5">SCORE</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Karishma_Shaik_Resume_2026.pdf
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ATS Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>Target Role:</span>
                  <span className="text-slate-200 font-semibold">Senior Java Full Stack Engineer</span>
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30 shadow-inner">
                Match Score: 94.8%
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">⭐ Recommended Candidate</span>
            </div>
          </div>

          {/* Interactive Navigation Pills inside Card */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'metrics'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              Core Vectors
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'skills'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              Extracted Skills (6)
            </button>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ai-insights'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              AI Recommendation
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 bg-slate-950/60 min-h-[220px]">
          {activeTab === 'metrics' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-3.5"
            >
              {/* Technical Score */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 transition-colors group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Technical Score</span>
                  <span className="text-emerald-400 font-mono font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-emerald-400 h-full rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">Strong Java, Spring & React alignment</p>
              </div>

              {/* Keywords Match */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/40 transition-colors group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Keyword Density</span>
                  <span className="text-indigo-400 font-mono font-bold">95%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className="bg-indigo-400 h-full rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">19 of 20 core keywords present</p>
              </div>

              {/* Experience Depth */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/40 transition-colors group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Experience Depth</span>
                  <span className="text-purple-400 font-mono font-bold">89%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '89%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="bg-purple-400 h-full rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">6.5+ years progressive growth</p>
              </div>

              {/* Formatting & Parsing */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-400/40 transition-colors group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Formatting Cleanliness</span>
                  <span className="text-cyan-400 font-mono font-bold">98%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="bg-cyan-400 h-full rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">Clean ATS column structure</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Semantic Skill Extraction</span>
                <span className="text-emerald-400 text-[11px]">✓ 100% Parsed</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { name: 'Java', match: '98%', highlight: true },
                  { name: 'Spring Boot', match: '96%', highlight: true },
                  { name: 'React 19', match: '94%', highlight: true },
                  { name: 'PostgreSQL', match: '92%', highlight: false },
                  { name: 'AWS Lambda', match: '89%', highlight: false },
                  { name: 'Docker / K8s', match: '91%', highlight: false },
                  { name: 'GraphQL', match: '87%', highlight: false },
                  { name: 'Redis Cache', match: '85%', highlight: false },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      skill.highlight
                        ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-0.5">{skill.match}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI verified against 48 role taxonomy benchmarks</span>
              </p>
            </motion.div>
          )}

          {activeTab === 'ai-insights' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Top 3% Candidate Match</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Alex demonstrates exceptionally high backend and cloud competency matching the technical requirements for the Senior Engineering opening.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-medium">Suggested Pipeline Move:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Fast-track to Interview
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Card Footer Banner */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-mono text-[10px]">REAL-TIME ATS STREAM</span>
          </div>
          <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">
            Simulate New Parse →
          </span>
        </div>
      </motion.div>
    </div>
  );
};
