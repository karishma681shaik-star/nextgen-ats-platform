import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Target,
  Bot,
  FileText,
  AlertCircle,
  Award
} from 'lucide-react';

interface FloatingResumeProps {
  activeStep?: number; // 0 to 5 matching the transformation pipeline steps
  interactive?: boolean;
}

export const FloatingResume: React.FC<FloatingResumeProps> = ({
  activeStep = 0,
  interactive = true,
}) => {
  const [tab, setTab] = useState<'scan' | 'keywords' | 'rewrite' | 'shortlist'>('scan');

  // Synchronize internal tab with external activeStep from scroll/progress
  useEffect(() => {
    if (activeStep === 0 || activeStep === 1) setTab('scan');
    else if (activeStep === 2) setTab('keywords');
    else if (activeStep === 3 || activeStep === 4) setTab('rewrite');
    else if (activeStep === 5) setTab('shortlist');
  }, [activeStep]);

  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto select-none perspective-1000">
      {/* Background soft purple/indigo glow */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-600/20 via-purple-650/15 to-cyan-500/15 rounded-3xl blur-3xl opacity-75 pointer-events-none" />

      {/* 3D FLOATING BADGES */}
      {/* Badge 1: Top Right - ATS Score */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotateX: [0, 5, 0],
          rotateY: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-6 -right-4 z-30 glass-card-elevated px-4 py-2.5 rounded-2xl border border-indigo-500/40 shadow-[0_10px_30px_rgba(99,102,241,0.25)] flex items-center gap-3 backdrop-blur-xl"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          {activeStep >= 3 ? '94' : '64'}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-white">ATS Score</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            {activeStep >= 3 ? '★ Top 3% Candidate' : '⚠️ Missing keywords'}
          </span>
        </div>
      </motion.div>

      {/* Badge 2: Bottom Left - AI Suggestion */}
      <motion.div
        animate={{
          y: [0, 6, 0],
          rotateX: [0, -5, 0],
          rotateY: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        className="absolute -bottom-6 -left-4 z-30 glass-card-elevated p-3 rounded-2xl border border-cyan-500/40 shadow-[0_10px_30px_rgba(34,211,238,0.25)] hidden sm:flex items-center gap-3 max-w-[280px] backdrop-blur-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <Bot className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 gap-4">
            <span>AI Bullet Optimizer</span>
            <span className="text-cyan-400 font-mono">{activeStep >= 4 ? '+14 Pts' : 'Optimize Now'}</span>
          </div>
          <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
            {activeStep >= 4 ? 'STAR bullet: "Architected microservices..."' : 'Awaiting bullet optimization'}
          </p>
        </div>
      </motion.div>

      {/* Badge 3: Right Center - Match Alignment */}
      <motion.div
        animate={{
          x: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-1/2 -right-6 -translate-y-1/2 z-30 glass-card-elevated px-3 py-2 rounded-xl border border-purple-500/40 shadow-md hidden md:flex items-center gap-2 backdrop-blur-xl"
      >
        <Target className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
        <div>
          <p className="text-[10px] font-bold text-white">
            {activeStep >= 5 ? '96.2% Match' : '88.5% Match'}
          </p>
          <p className="text-[9px] text-purple-300">Senior Java Software Engineer</p>
        </div>
      </motion.div>

      {/* MAIN DOCUMENT WRAPPER */}
      <div
        data-cursor-hero-scanner="true"
        className="relative rounded-2xl glass-card-elevated border border-indigo-500/30 shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#070b15]/95 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="text-[10px] font-mono text-slate-400 ml-2">
              Karishma_Shaik_Resume.pdf
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              {activeStep >= 5 ? 'SHORTLISTED' : 'ATS OPTIMIZED'}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/60 border-b border-white/[0.04] text-[10px]">
          {['scan', 'keywords', 'rewrite', 'shortlist'].map((t) => (
            <button
              key={t}
              onClick={() => interactive && setTab(t as any)}
              disabled={!interactive}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer capitalize font-bold ${
                tab === t
                  ? 'bg-indigo-650 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'scan' ? 'Live Scan' : t === 'rewrite' ? 'STAR Rewrite' : t}
            </button>
          ))}
        </div>

        {/* Document Content Canvas */}
        <div className="relative p-5 sm:p-6 bg-[#040712]/95 text-slate-200 space-y-4 min-h-[360px] overflow-hidden">
          
          {/* Live Scanner Beam */}
          {tab === 'scan' && (
            <motion.div
              animate={{ top: ['-2%', '102%', '-2%'] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] pointer-events-none z-10"
            />
          )}

          {/* Profile Basic Info */}
          <div className="border-b border-white/[0.06] pb-3 flex items-start justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                Karishma Shaik
              </h4>
              <p className="text-[11px] font-bold text-indigo-400 mt-0.5">
                Java Full Stack Developer & Microservices Engineer
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">
                karishma681shaik@gmail.com · Bengaluru, India · Full Stack Software Engineer
              </p>
            </div>
            {activeStep >= 5 && (
              <motion.div
                initial={{ scale: 2.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                className="px-2.5 py-1 rounded border-2 border-emerald-400 text-emerald-400 text-[10px] font-black tracking-widest uppercase stamp-glow-anim shadow-sm pointer-events-none"
              >
                SHORTLISTED
              </motion.div>
            )}
          </div>

          {/* NLP / Skills Tagging Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-450 uppercase">
              <span>Technical Skills Vector</span>
              <span className="text-emerald-400">98% Match Parse</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { name: 'Java 21', match: true },
                { name: 'Spring Boot', match: true },
                { name: 'React 19', match: true },
                { name: 'PostgreSQL', match: true },
                { name: 'AWS ECS', match: true },
                { name: 'Docker / K8s', match: true },
                { name: 'Redis Cache', match: activeStep >= 2, missing: activeStep < 2 },
              ].map((skill, i) => (
                <span
                  key={i}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 border ${
                    skill.missing
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20'
                  }`}
                >
                  {skill.missing ? '⚠️ Gap: ' : '✓ '}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Highlights Section */}
          <div className="space-y-2.5 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white">Java Full Stack Engineer · Enterprise Platform</span>
              <span className="text-[9px] text-slate-400 font-mono">2022 – Present</span>
            </div>

            <div className="space-y-2 text-[10px] text-slate-300 leading-relaxed">
              {activeStep >= 4 ? (
                /* Post-optimized Suggestion */
                <div className="p-2 rounded-lg bg-emerald-950/15 border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold mr-1">✓ AI Suggestion Applied:</span>
                  "Architected high-throughput event-driven microservices using Java 21 & Spring Boot, reducing p99 API latency by <span className="text-emerald-400 font-bold font-mono">38%</span> and managing <span className="text-indigo-300 font-bold">10M+ daily events</span>."
                </div>
              ) : (
                /* Pre-optimized Suggestion */
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                  <span className="text-indigo-400 font-bold mr-1">● Original Bullet:</span>
                  "Worked on backend Java services and helped the team make the platform faster."
                  {activeStep >= 1 && (
                    <div className="mt-1.5 text-[9px] text-amber-350 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>Low quantitative impact. Add action verbs & metrics.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-slate-450 font-mono">
            <span>Keywords: {activeStep >= 2 ? '20/20' : '19/20'}</span>
            <span className="text-indigo-300 font-bold">Format: 100% ATS Ready</span>
            <span className={activeStep >= 5 ? 'text-emerald-450 font-bold' : 'text-slate-400'}>
              Status: {activeStep >= 5 ? 'Shortlisted' : 'Analyzing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FloatingResume;
