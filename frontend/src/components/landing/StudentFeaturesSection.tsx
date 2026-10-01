import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileSearch,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Check,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const StudentFeaturesSection: React.FC = () => {
  const [activeBuilderTab, setActiveBuilderTab] = useState<'preview' | 'ats-check'>('ats-check');
  const [suggestionState, setSuggestionState] = useState<'before' | 'after'>('after');

  return (
    <section id="students" className="scroll-mt-24 py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>For Students & Job Seekers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            Built to get you noticed, shortlisted, and hired.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Clear, actionable tools designed specifically for job seekers to master applicant tracking systems and stand out in competitive applicant pools.
          </p>
        </motion.div>

        {/* 4 Cards Grid with Real Mini UI Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: AI Resume Builder */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/30 flex flex-col justify-between space-y-6 hover:border-indigo-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-glow">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  ATS Standard Layouts
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                AI Resume Builder
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Create a professional ATS-friendly resume with clean typography, optimal column hierarchy, and zero parsing errors.
              </p>
            </div>

            {/* Meaningful Mini UI Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveBuilderTab('preview')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      activeBuilderTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
                    }`}
                  >
                    Editor View
                  </button>
                  <button
                    onClick={() => setActiveBuilderTab('ats-check')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      activeBuilderTab === 'ats-check' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
                    }`}
                  >
                    ATS Safety Check
                  </button>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">100% ATS Compliant</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Single-Column Hierarchy</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Machine-Readable Font & Margins</span>
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Export Formats</span>
                  <span className="text-indigo-300 font-mono font-bold">PDF · DOCX · TXT</span>
                </div>
              </div>
            </div>

            <Link to="/candidate/resumes" data-cursor-label="Build">
              <Button variant="glow" size="sm" className="w-full font-bold shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Build My Resume
              </Button>
            </Link>
          </motion.div>

          {/* Card 2: ATS Resume Analyzer */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-purple-500/30 flex flex-col justify-between space-y-6 hover:border-purple-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-glow">
                  <FileSearch className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  5-Vector Diagnostic
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                ATS Resume Analyzer
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                See your exact resume score, missing keywords, and specific improvement areas calculated against target roles.
              </p>
            </div>

            {/* Meaningful Mini UI Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center font-black text-lg">
                    94
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ATS Compatibility Score</h4>
                    <p className="text-[10px] text-slate-400">Target: Senior Backend Engineer</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready to Apply
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Keyword Density Match</span>
                    <span className="text-purple-400 font-mono font-bold">95%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[95%]" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono">Missing:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                    + Redis Cache
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                    + Docker
                  </span>
                </div>
              </div>
            </div>

            <Link to="/candidate/resume-analysis" data-cursor-label="Analyze">
              <Button variant="secondary" size="sm" className="w-full font-bold hover:border-purple-500/60" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Analyze My Resume
              </Button>
            </Link>
          </motion.div>

          {/* Card 3: AI Resume Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col justify-between space-y-6 hover:border-cyan-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-glow">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  STAR Impact Rewriter
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                AI Resume Suggestions
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Turn weak, passive resume statements into stronger, quantified professional content tailored specifically for hiring managers.
              </p>
            </div>

            {/* Meaningful Mini UI Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSuggestionState('before')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      suggestionState === 'before' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setSuggestionState('after')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      suggestionState === 'after' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
                    }`}
                  >
                    AI Rewrite (+14 Pts)
                  </button>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">STAR Formatted</span>
              </div>

              {suggestionState === 'before' ? (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-[11px] text-slate-400 italic leading-relaxed">
                  "Responsible for managing backend APIs and writing Java code for our team."
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-200 leading-relaxed">
                  "Architected high-throughput Spring Boot microservices, cutting p99 API latency by 38% for 10M+ daily events."
                </div>
              )}
            </div>

            <Link to="/candidate/resume-analysis" data-cursor-label="Optimize">
              <Button variant="secondary" size="sm" className="w-full font-bold hover:border-cyan-500/60" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Improve My Bullet Points
              </Button>
            </Link>
          </motion.div>

          {/* Card 4: Job Match */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col justify-between space-y-6 hover:border-emerald-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-glow">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Vector Match Engine
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                Job Match
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Discover curated opportunities that accurately match your verified skills, experience depth, and career preferences.
              </p>
            </div>

            {/* Meaningful Mini UI Preview */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">#1 MATCHING ROLE</span>
                  <h4 className="text-xs font-bold text-white">Lead Full Stack Engineer</h4>
                  <p className="text-[10px] text-slate-400">CloudScale Labs · $150k–$180k</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 font-mono">94.8%</span>
                  <span className="text-[9px] text-emerald-300 block font-bold">STRONG FIT</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['Java 21', 'Spring Boot', 'React', 'AWS', 'PostgreSQL'].map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            <Link to="/candidate/jobs" data-cursor-label="Match">
              <Button variant="glow" size="sm" className="w-full font-bold shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Matched Jobs
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
