import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  TrendingUp,
  Target,
  Layers,
  Sparkles,
  Check,
  FileCode,
  FileCheck2,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { FeatureCard } from './FeatureCard';

export const FeatureSection: React.FC = () => {
  const [activeFormat, setActiveFormat] = useState<'pdf' | 'docx'>('pdf');
  const [pipelineStage, setPipelineStage] = useState<number>(2);

  return (
    <section id="features" className="py-16 space-y-12 relative">
      {/* Background ambient orbs */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-3 max-w-3xl mx-auto px-4"
      >
        <Badge variant="primary" className="shadow-glow">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
          Core Platform Capabilities
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Engineered for High-Precision Recruitment
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Four interconnected intelligence modules that eliminate manual resume screening and empower hiring teams.
        </p>
      </motion.div>

      {/* Grid of 4 Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          
          {/* Card 1: AI Resume Parsing */}
          <FeatureCard
            icon={FileSearch}
            badge="Multi-Format OCR & NLP"
            badgeColor="indigo"
            title="AI Resume Parsing & Entity Extraction"
            description="Extract skills, chronology, academic qualifications, and project scopes automatically from PDF & DOCX resumes in under 250ms."
            highlights={[
              'Multi-column layout & non-standard format resilience',
              'Contextual seniority and experience duration calculation',
              'Auto-syncs directly into Candidate profile vectors',
            ]}
          >
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFormat('pdf')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      activeFormat === 'pdf'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 bg-slate-900 hover:text-white'
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    onClick={() => setActiveFormat('docx')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      activeFormat === 'docx'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 bg-slate-900 hover:text-white'
                    }`}
                  >
                    DOCX Document
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">100% Parsed</span>
              </div>

              {/* Extraction Chips Preview */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Skills Identified</span>
                  <span className="text-white font-bold font-mono">24 Tags</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Total Experience</span>
                  <span className="text-white font-bold font-mono">6.5 Yrs</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Education</span>
                  <span className="text-white font-bold">B.S. CompSci</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Certifications</span>
                  <span className="text-white font-bold">AWS Solutions</span>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Card 2: ATS Intelligence & Scoring */}
          <FeatureCard
            icon={TrendingUp}
            badge="5-Vector Diagnostic Engine"
            badgeColor="purple"
            title="Semantic ATS Score & Optimization"
            description="Detailed diagnosis of keyword alignment, hard skills coverage, experience depth, and formatting readability against target job descriptions."
            highlights={[
              '0–100 Objective ATS Compatibility Index',
              'Missing keywords and high-priority optimization suggestions',
              'Instant before-and-after score recalculation',
            ]}
          >
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-base">
                    92
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ATS Compatibility Score</h4>
                    <p className="text-[10px] text-slate-400">Matched to: Senior Backend Engineer</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Apply
                </span>
              </div>

              {/* Mini Vector Bars */}
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Keyword Density (19/20)</span>
                    <span className="text-indigo-400 font-mono">94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Experience Duration Match</span>
                    <span className="text-purple-400 font-mono">89%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[89%]" />
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Card 3: Intelligent Job Matching */}
          <FeatureCard
            icon={Target}
            badge="Vector Match Engine"
            badgeColor="cyan"
            title="Intelligent Candidate & Job Matching"
            description="Deep embeddings compare candidate competency graphs with open job requisitions to identify the top 1% qualified candidates instantaneously."
            highlights={[
              'Contextual competency matching beyond simple keyword search',
              'Automated salary and experience tier alignment',
              'Personalized job recommendations with match breakdowns',
            ]}
          >
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-semibold">
                    Top Recommended Role
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    Senior Software Engineer (Cloud)
                  </h4>
                  <p className="text-[10px] text-slate-400">Enterprise Core Team • $145k–$175k</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-cyan-300 font-mono">94.8%</span>
                  <p className="text-[9px] text-emerald-400 font-semibold">STRONG FIT</p>
                </div>
              </div>

              {/* Skills matched tag preview */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Java 21', 'Spring Boot', 'React', 'PostgreSQL', 'Docker'].map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* Card 4: Recruiter Kanban Pipeline */}
          <FeatureCard
            icon={Layers}
            badge="Full-Cycle Hiring Pipeline"
            badgeColor="emerald"
            title="Recruiter Kanban & Applicant Orchestration"
            description="Manage candidates across 5 intuitive hiring stages with 1-click status transitions, AI ranked applicant sorting, and audit logs."
            highlights={[
              'Interactive multi-stage Kanban (Applied → Screening → Interview)',
              'Live candidate score ranking in every column',
              'Direct status updates with automated candidate feedback',
            ]}
          >
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Requisition Pipeline Stages:</span>
                <span className="text-indigo-400 text-[11px] font-mono">5 Active Applicants</span>
              </div>

              {/* Mini Pipeline Kanban Bar */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { name: 'Applied', count: 12 },
                  { name: 'Screen', count: 6 },
                  { name: 'Shortlist', count: 3 },
                  { name: 'Interview', count: 2 },
                  { name: 'Offer', count: 1 },
                ].map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPipelineStage(idx)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      pipelineStage === idx
                        ? 'bg-emerald-600/25 border border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] block font-semibold truncate">{col.name}</span>
                    <span className="text-xs font-mono font-bold">{col.count}</span>
                  </button>
                ))}
              </div>

              {/* Active candidate card in mini pipeline */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    KS
                  </div>
                  <div>
                    <span className="text-white font-semibold block text-[11px]">Karishma Shaik</span>
                    <span className="text-[9px] text-slate-400">Score: 98 • Java Full Stack</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready for Interview
                </span>
              </div>
            </div>
          </FeatureCard>

        </motion.div>
      </div>
    </section>
  );
};
