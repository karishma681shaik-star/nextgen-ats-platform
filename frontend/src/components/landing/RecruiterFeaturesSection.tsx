import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Layers,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Target,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const RecruiterFeaturesSection: React.FC = () => {
  const [activePipelineCol, setActivePipelineCol] = useState(2); // Shortlisted

  return (
    <section id="recruiters" className="scroll-mt-24 py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-950/40">
      {/* Background ambient orbs */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-glow">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>For Recruiters & Talent Acquisition Teams</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            From hundreds of applications to the right candidates.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Eliminate manual resume triage. Use AI candidate ranking, requisition matching, and high-velocity Kanban pipelines to close engineering roles faster.
          </p>
        </motion.div>

        {/* 4 Cards Grid with Realistic Miniature Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: AI Candidate Screening */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-purple-500/30 flex flex-col justify-between space-y-6 hover:border-purple-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-glow">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Cohort Ranking #1
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                AI Candidate Screening
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Automatically analyze and rank candidates by verified technical score, experience chronology, and specific role readiness.
              </p>
            </div>

            {/* Realistic Mini Dashboard: Ranked Applicant Leaderboard */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-1 border-b border-slate-800">
                <span>APPLICANT LEADERBOARD</span>
                <span className="text-purple-400 font-bold">48 Total Candidates</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { name: 'Karishma Shaik', role: 'Java Full Stack Engineer', score: '98%', rank: '#1', status: 'Top Fit', highlight: true },
                  { name: 'Sarah Chen', role: 'Backend Systems Lead', score: '94%', rank: '#2', status: 'High Fit', highlight: false },
                  { name: 'David Kumar', role: 'Cloud Platform Architect', score: '91%', rank: '#3', status: 'Qualified', highlight: false },
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs border ${
                      c.highlight
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                        : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-purple-600/30 font-mono font-bold text-[10px] flex items-center justify-center text-purple-300">
                        {c.rank}
                      </span>
                      <div>
                        <span className="font-bold text-white block text-[11px]">{c.name}</span>
                        <span className="text-[9px] text-slate-400">{c.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-purple-300">{c.score}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/recruiter" data-cursor-label="Screen">
              <Button variant="glow" size="sm" className="w-full font-bold shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Recruiter Screening
              </Button>
            </Link>
          </motion.div>

          {/* Card 2: Intelligent Candidate Matching */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/30 flex flex-col justify-between space-y-6 hover:border-indigo-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-glow">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Vector Match Engine
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                Intelligent Candidate Matching
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Match candidates against complex job requirements and skills taxonomies with multidimensional compatibility scoring.
              </p>
            </div>

            {/* Realistic Mini Dashboard: Requisition Matching Radar */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold">REQUISITION #REQ-204</span>
                  <h4 className="text-xs font-bold text-white">Senior Java Full Stack Engineer</h4>
                  <p className="text-[10px] text-slate-400">Enterprise Engineering · 6 Required Skills</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono">94.8% Match</span>
                  <span className="text-[9px] text-emerald-300 block font-bold">TOP 1% FIT</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Core Tech Stack (Java, Spring Boot, React)</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Fit</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Cloud Infrastructure (AWS ECS, Docker)</span>
                  <span className="text-indigo-400 font-mono font-bold">95% Fit</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Seniority & Years of Experience</span>
                  <span className="text-purple-400 font-mono font-bold">6.5 / 5+ Yrs</span>
                </div>
              </div>
            </div>

            <Link to="/recruiter/jobs" data-cursor-label="Match">
              <Button variant="secondary" size="sm" className="w-full font-bold hover:border-indigo-500/60" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Open Requisitions
              </Button>
            </Link>
          </motion.div>

          {/* Card 3: Candidate Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col justify-between space-y-6 hover:border-emerald-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-glow">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  5-Stage Workflow
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                Candidate Pipeline
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Track candidates across 5 intuitive hiring stages with 1-click status transitions and automated feedback notifications.
              </p>
            </div>

            {/* Realistic Mini Dashboard: Interactive 5-Stage Kanban */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { name: 'Applied', count: 18 },
                  { name: 'Screening', count: 8 },
                  { name: 'Shortlisted', count: 4 },
                  { name: 'Interview', count: 2 },
                  { name: 'Hired', count: 1 },
                ].map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePipelineCol(idx)}
                    className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                      activePipelineCol === idx
                        ? 'bg-emerald-600/25 border border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[9px] block font-semibold truncate">{col.name}</span>
                    <span className="text-xs font-mono font-bold">{col.count}</span>
                  </button>
                ))}
              </div>

              {/* Active candidate card in mini pipeline */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    KS
                  </div>
                  <div>
                    <span className="text-white font-semibold block text-[11px]">Karishma Shaik</span>
                    <span className="text-[9px] text-slate-400">Score: 98% · Java Full Stack</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready for Interview
                </span>
              </div>
            </div>

            <Link to="/recruiter/applicants" data-cursor-label="Pipeline">
              <Button variant="secondary" size="sm" className="w-full font-bold hover:border-emerald-500/60" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Hiring Pipeline
              </Button>
            </Link>
          </motion.div>

          {/* Card 4: Recruiter Insights */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col justify-between space-y-6 hover:border-cyan-500/60 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-glow">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  AI Fit Indicators
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                Recruiter Insights
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Understand candidate fit with transparent compatibility indicators, salary alignment, and fast-track recommendations.
              </p>
            </div>

            {/* Realistic Mini Dashboard: Candidate Fit Diagnostic */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white">AI Verdict: Strong Technical Fit</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    Exceeds backend latency requirements; strong architectural background with 6.5+ years of verified growth.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Recruiter Action Recommendation:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  ✓ Fast-track to Stage 4 (Interview)
                </span>
              </div>
            </div>

            <Link to="/recruiter" data-cursor-label="Hire">
              <Button variant="glow" size="sm" className="w-full font-bold shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Hiring Talent
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
