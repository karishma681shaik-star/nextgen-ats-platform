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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DiagonallyRotatedHeroResume } from './DiagonallyRotatedHeroResume';
import { KineticTelemetryTicker } from './KineticTelemetryTicker';

const ROTATING_WORDS = [
  { text: 'Recruiters', color: 'from-indigo-400 via-purple-300 to-pink-400' },
  { text: 'Hiring Teams', color: 'from-cyan-400 via-blue-400 to-indigo-400' },
  { text: 'Top Engineers', color: 'from-purple-400 via-fuchsia-400 to-indigo-400' },
  { text: 'Job Seekers', color: 'from-emerald-400 via-teal-400 to-cyan-400' },
];

const WordRotator: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const word = ROTATING_WORDS[index];

  return (
    <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom min-w-[200px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block bg-gradient-to-r ${word.color} bg-clip-text text-transparent font-black`}
        >
          {word.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export const ThreeDHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [, setMousePos] = useState({ x: 0, y: 0 });

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.04]"
      aria-label="ThreeDHero Section"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headlines & CTA (7 Columns) — 100% Protected Clean Dark Zone */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7">
          
          {/* Professional Product Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07111F] border border-[#55DDF5]/25 text-[#B6C2D2] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#55DDF5]" />
              <span>Enterprise AI Recruitment Engine</span>
            </div>
          </motion.div>

          {/* Premium High-Contrast Heading — Outstanding Readability */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-[4.25rem] font-extrabold tracking-tight leading-[1.08] text-[#F8FAFC] font-display"
          >
            Where Talent Meets{' '}
            <span className="bg-gradient-to-r from-[#55DDF5] to-[#8B5CF6] bg-clip-text text-transparent">
              Intelligence.
            </span>
          </motion.h1>

          {/* Dynamic Audience Rotator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-400"
          >
            <span>Platform built for</span>
            <WordRotator />
          </motion.div>

          {/* Live AI Engine Telemetry Stream (Scrambled Kinetic Text) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="w-full max-w-xl"
          >
            <KineticTelemetryTicker />
          </motion.div>

          {/* Description — Readable Neutral Text with Comfortable Spacing */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-[#B6C2D2] max-w-xl leading-relaxed font-normal"
          >
            Transform recruitment with intelligent resume analysis, ATS insights, and smarter candidate-job matching.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto"
          >
            <Link to="/candidate/resumes" data-cursor-label="Create">
              <Button
                variant="glow"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-[0_0_20px_rgba(99,102,241,0.4)] font-bold text-sm sm:text-base px-8 py-4 w-full sm:w-auto hover:scale-102 active:scale-98 transition-all"
              >
                Create Resume
              </Button>
            </Link>
            <Link to="/candidate/resume-analysis" data-cursor-label="Analyze">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<FileSearch className="w-4 h-4 text-indigo-400" />}
                className="font-bold text-sm sm:text-base border-slate-700/80 hover:border-indigo-500/50 hover:bg-indigo-950/20 w-full sm:w-auto"
              >
                Analyze My Resume
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="grid grid-cols-3 gap-6 pt-5 border-t border-white/[0.06] w-full max-w-lg text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>5-Vector</span>
              </div>
              <p className="text-[11px] text-slate-400">Semantic scoring engine</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Safe</span>
              </div>
              <p className="text-[11px] text-slate-400">Recruiter approved formats</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Direct Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">Recruiter command center</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Diagonally Rotated Resume & Company Marquee (5 Columns) */}
        <div className="lg:col-span-5 relative flex flex-col justify-center items-center">
          <DiagonallyRotatedHeroResume />
        </div>
      </div>

      {/* Volumetric ambient glow footer fading to obsidian background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, transparent, #030712)',
        }}
        aria-hidden
      />
    </section>
  );
};

export default ThreeDHero;
