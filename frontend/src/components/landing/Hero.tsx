import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  FileSearch,
  CheckCircle2,
  Cpu,
  Target,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
  Search,
  Bot,
} from 'lucide-react';
import { Button } from '../ui/Button';

/* ============================================================
   ROTATING WORDS
   ============================================================ */
const ROTATING_WORDS = [
  { text: 'Job Seekers', color: 'from-indigo-400 via-purple-300 to-pink-400' },
  { text: 'Engineers', color: 'from-cyan-400 via-blue-400 to-indigo-400' },
  { text: 'Recruiters', color: 'from-purple-400 via-fuchsia-400 to-indigo-400' },
  { text: 'Students', color: 'from-emerald-400 via-teal-400 to-cyan-400' },
  { text: 'Hiring Teams', color: 'from-violet-400 via-indigo-400 to-purple-400' },
];

const WordRotator: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const word = ROTATING_WORDS[index];

  return (
    <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom min-w-[240px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block bg-gradient-to-r ${word.color} bg-clip-text text-transparent`}
        >
          {word.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/* ============================================================
   FLOATING PARTICLES
   ============================================================ */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: 5 + Math.random() * 5,
  delay: Math.random() * 4,
  opacity: 0.2 + Math.random() * 0.4,
  color: i % 3 === 0 ? '#818cf8' : i % 3 === 1 ? '#a78bfa' : '#38bdf8',
}));

const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {PARTICLES.map((p) => (
      <div
        key={p.id}
        className="particle-dot"
        style={{
          width: p.size,
          height: p.size,
          left: `${p.x}%`,
          top: `${p.y}%`,
          background: p.color,
          opacity: p.opacity,
          '--dur': `${p.duration}s`,
          '--delay': `${p.delay}s`,
          '--px': `${(Math.random() - 0.5) * 50}px`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

/* ============================================================
   CINEMATIC FLOATING RESUME & LIVE AI SCANNER (NO LAPTOP)
   ============================================================ */
const CinematicFloatingResume: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'keywords' | 'rewrite'>('scan');

  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto select-none">
      {/* Background radial glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

      {/* Floating Badge 1: Top Right - ATS Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.8, delay: 0.3 },
        }}
        className="absolute -top-5 -right-3 sm:-right-6 z-30 glass-card-elevated px-4 py-2.5 rounded-2xl border border-indigo-500/40 shadow-glow flex items-center gap-3 backdrop-blur-xl"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          94
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white">ATS Compatibility</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">
            ★ Top 3% Candidate Match
          </span>
        </div>
      </motion.div>

      {/* Floating Badge 2: Bottom Left - AI Bullet Rewrite */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          opacity: { duration: 0.8, delay: 0.6 },
        }}
        className="absolute -bottom-6 -left-3 sm:-left-6 z-30 glass-card-elevated p-3 rounded-2xl border border-cyan-500/40 shadow-glow hidden sm:flex items-center gap-3 max-w-[280px] backdrop-blur-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
            <span>AI Bullet Optimizer</span>
            <span className="text-cyan-400 font-mono">+14% Score</span>
          </div>
          <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
            STAR rewrite: "Architected microservices..."
          </p>
        </div>
      </motion.div>

      {/* Floating Badge 3: Right Center - Real-Time Match */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: [0, 6, 0] }}
        transition={{
          x: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          opacity: { duration: 0.8, delay: 0.8 },
        }}
        className="absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-30 glass-card-elevated px-3.5 py-2 rounded-xl border border-purple-500/40 shadow-glow hidden md:flex items-center gap-2.5 backdrop-blur-xl"
      >
        <Target className="w-4 h-4 text-purple-400" />
        <div>
          <p className="text-[10px] font-bold text-white">94.8% JD Alignment</p>
          <p className="text-[9px] text-purple-300">Senior Full Stack Lead</p>
        </div>
      </motion.div>

      {/* Main Document Body */}
      <div
        data-cursor-hero-scanner="true"
        className="relative rounded-2xl glass-card-elevated border border-indigo-500/30 shadow-2xl overflow-hidden backdrop-blur-2xl transition-all hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
      >
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0f1d]/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-slate-400 ml-2 font-medium">
              Alex_Rivera_Resume.pdf
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              AI ATS Verified
            </span>
          </div>
        </div>

        {/* Interactive Mode Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('scan')}
            data-cursor-label="Scan"
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live ATS Scan
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            data-cursor-label="Keywords"
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'keywords'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Keywords (19/20)
          </button>
          <button
            onClick={() => setActiveTab('rewrite')}
            data-cursor-label="Optimize"
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === 'rewrite'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Suggestions
          </button>
        </div>

        {/* Realistic Resume Content Container */}
        <div className="relative p-5 sm:p-6 bg-[#060a16]/90 text-slate-200 space-y-4 min-h-[380px] overflow-hidden font-sans">
          {/* Animated Laser Scanning Beam */}
          {activeTab === 'scan' && (
            <motion.div
              animate={{ top: ['-5%', '105%', '-5%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-20"
            />
          )}

          {/* Resume Header */}
          <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Karishma Shaik
              </h3>
              <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                Senior Java Full Stack Engineer
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                karishma681shaik@gmail.com · github.com/karishma681shaik-star
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Java Backend & Cloud
            </span>
          </div>

          {/* Extracted Core Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
              <span>Verified Technical Skills</span>
              <span className="text-emerald-400">98% Parse Quality</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Java 21', match: true },
                { name: 'Spring Boot', match: true },
                { name: 'React 19', match: true },
                { name: 'PostgreSQL', match: true },
                { name: 'AWS ECS', match: true },
                { name: 'Docker / K8s', match: true },
                { name: 'Redis Cache', match: false, missing: true },
                { name: 'GraphQL', match: true },
              ].map((skill, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium flex items-center gap-1 border ${
                    skill.missing
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30'
                  }`}
                >
                  {skill.missing ? '⚠️ Missing: ' : '✓ '}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience Section with AI Highlights */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Senior Software Engineer · CloudScale AI</span>
              <span className="text-[10px] text-slate-400 font-mono">2022 – Present</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">●</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Architected event-driven microservices</strong> handling <span className="text-indigo-300 font-semibold">10M+ daily events</span> with Java 21 & Spring Boot, reducing p99 latency by <span className="text-emerald-400 font-bold font-mono">38%</span>.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                <span className="text-indigo-400 font-bold mt-0.5">●</span>
                <p className="leading-relaxed">
                  Led migration to AWS containerized infrastructure (ECS/Fargate), slashing deployment overhead by <span className="text-emerald-400 font-bold font-mono">55%</span> across 14 agile teams.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics Strip */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Keywords: 19/20 Matched</span>
            <span className="text-indigo-300 font-bold">Format: 100% ATS Safe</span>
            <span className="text-emerald-400 font-bold">Status: SHORTLISTED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN HERO COMPONENT
   ============================================================ */
export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero section"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 30% 20%, rgba(99,102,241,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 75% 30%, rgba(168,85,247,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 50% 80%, rgba(56,189,248,0.12) 0%, transparent 65%)
          `,
          transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 10}px)`,
          transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
        aria-hidden
      />

      {/* Tech grid overlay */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" aria-hidden />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main Grid Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headlines & CTAs (7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Gen AI Resume & Recruitment Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Exact Headline: "Your Resume. Your Skills. Your Next Opportunity." */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black tracking-tight leading-[1.08] text-white font-display"
          >
            Your Resume. <br />
            Your Skills. <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Your Next Opportunity.
            </span>
          </motion.h1>

          {/* Target Audience Rotator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 text-base sm:text-xl font-bold text-slate-300"
          >
            <span>Intelligence built for</span>
            <WordRotator />
          </motion.div>

          {/* Exact Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal"
          >
            Build an ATS-ready resume, understand your compatibility, improve your profile with AI, and connect your skills with the right opportunities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full sm:w-auto"
          >
            <Link to="/candidate/resumes" data-cursor-label="Build">
              <Button
                variant="glow"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-glow font-bold text-sm sm:text-base px-7 py-3.5 w-full sm:w-auto"
              >
                Build My Resume
              </Button>
            </Link>
            <Link to="/candidate/resume-analysis" data-cursor-label="Analyze">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<FileSearch className="w-4 h-4 text-indigo-400" />}
                className="font-bold text-sm sm:text-base border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-950/30 w-full sm:w-auto"
              >
                Analyze My Resume
              </Button>
            </Link>
          </motion.div>

          {/* Trust Value Indicators (No fake stats) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 w-full max-w-lg text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>5-Vector</span>
              </div>
              <p className="text-[11px] text-slate-400">ATS Scoring Engine</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Safe</span>
              </div>
              <p className="text-[11px] text-slate-400">ATS Formats</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Live Fit</span>
              </div>
              <p className="text-[11px] text-slate-400">Recruiter Sync</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Cinematic Floating Resume AI Transformation Story (5 Cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative"
        >
          <CinematicFloatingResume />
        </motion.div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #040711)' }}
        aria-hidden
      />
    </section>
  );
};