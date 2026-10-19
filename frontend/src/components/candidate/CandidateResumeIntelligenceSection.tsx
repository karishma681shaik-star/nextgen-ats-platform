import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Search,
  Briefcase,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { CandidateDashboardData } from '../../services';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

interface CandidateResumeIntelligenceSectionProps {
  dashboardData: CandidateDashboardData;
  onOpenUpload?: () => void;
}

export const CandidateResumeIntelligenceSection: React.FC<CandidateResumeIntelligenceSectionProps> = ({
  dashboardData,
  onOpenUpload
}) => {
  const atsScore = dashboardData.atsScore;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-cyan-500/25 bg-gradient-to-br from-[#0c142b]/95 via-[#070b19]/95 to-[#050814]/98 p-6 sm:p-8 lg:p-10 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] card-shine-all-sides transition-all duration-300 group"
    >
      {/* ── 4-Side Perimeter Light Rims & Inward Reflection ───────────────────── */}
      <CardReflectiveShine variant="cyan" rounded="rounded-3xl" hasHoverSweep={true} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Editorial 3D Visual of Resume Intelligence */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/img bg-slate-900">
            {/* Top glass sheen on image frame */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none z-10" />

            <img
              src="/assets/candidate/resume_analysis_3d.jpg"
              alt="Intelligent Resume Document Analysis"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04] transition-transform duration-700 group-hover/img:scale-105"
              loading="lazy"
            />
            {/* Ambient Lighting Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#050814]/60 via-transparent to-transparent pointer-events-none" />

            {/* In-visual badge */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-white">
                {atsScore !== null && atsScore !== undefined ? `ATS Benchmark: ${atsScore}%` : 'Evaluation Engine Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Narrative, Status, & Direct Actions */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Resume Intelligence & ATS Optimization
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Build a stronger, ATS-ready resume
            </h2>
            <p className="text-sm text-slate-300/85 leading-relaxed">
              Every job opening uses applicant tracking algorithms. Nexus AI analyzes your document structure,
              quantifiable metrics, and keyword density to ensure your qualifications reach hiring managers.
            </p>
          </div>

          {/* Three Feature Highlights with Shining Hover Sheen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-cyan-500/30 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_8px_24px_rgba(56,189,248,0.12)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Search className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Keyword Matching</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Aligns competencies with verified recruiter requirements.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-indigo-500/30 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">ATS Scoring</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Real-time feedback on formatting, parseability, and clarity.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-emerald-500/30 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Direct Export</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ready to submit instantly across all active job postings.
                </p>
              </div>
            </div>
          </div>

          {/* AI ATS Diagnostic & Career Optimization Engine Feature Strip */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-[#0a1026]/70 to-cyan-950/50 border border-cyan-500/25 hover:border-cyan-400/50 transition-all duration-300 card-shine-all-sides group/featureBar space-y-3">
            <CardReflectiveShine variant="cyan" rounded="rounded-2xl" hasHoverSweep={true} />

            {/* Header: AI Telemetry & Status Badges */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white tracking-wide truncate">
                    AI Heuristic Diagnostic & Skill Telemetry
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Real-time keyword indexing & ATS compliance
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-bold text-cyan-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live Engine
              </span>
            </div>

            {/* Telemetry Pills + Action Buttons in balanced row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06] relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  98% Parseability
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Keyword Density
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/candidate/profile">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Sparkles className="w-3 h-3 text-cyan-400" />}
                    className="text-xs py-1.5 px-3 bg-white/[0.04] border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 font-semibold"
                  >
                    Skill Audit
                  </Button>
                </Link>
                <Link to="/candidate/jobs">
                  <Button
                    variant="glow"
                    size="sm"
                    leftIcon={<Briefcase className="w-3 h-3" />}
                    className="text-xs py-1.5 px-3 shadow-md shadow-indigo-500/20 font-semibold"
                  >
                    Match Roles <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
