import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  Calendar,
  Trophy,
  ArrowRight,
  ChevronRight,
  Send,
  Eye,
  Star
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { CandidateDashboardData } from '../../services';
import type { Application } from '../../types';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

interface CandidateApplicationJourneySectionProps {
  dashboardData: CandidateDashboardData;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export const CandidateApplicationJourneySection: React.FC<CandidateApplicationJourneySectionProps> = ({
  dashboardData,
  renderStatusBadge
}) => {
  const {
    totalApplicationsCount,
    activeApplicationsCount,
    shortlistedCount,
    interviewsCount,
    selectedCount,
    recentApplications
  } = dashboardData;

  const stages = [
    {
      id: 'submitted',
      label: 'Submitted',
      count: totalApplicationsCount,
      icon: Send,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20 hover:border-indigo-400/50',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'review',
      label: 'Under Review',
      count: activeApplicationsCount,
      icon: Eye,
      color: 'text-blue-400',
      border: 'border-blue-500/20 hover:border-blue-400/50',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'shortlist',
      label: 'Shortlisted',
      count: shortlistedCount,
      icon: Star,
      color: 'text-purple-400',
      border: 'border-purple-500/20 hover:border-purple-400/50',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'interview',
      label: 'Interview',
      count: interviewsCount,
      icon: Calendar,
      color: 'text-amber-400',
      border: 'border-amber-500/20 hover:border-amber-400/50',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'offer',
      label: 'Offer',
      count: selectedCount,
      icon: Trophy,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-400/50',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-blue-500/25 bg-gradient-to-br from-[#0b1227]/95 via-[#070b18]/95 to-[#050814]/98 p-6 sm:p-8 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] card-shine-all-sides transition-all duration-300 space-y-6 group"
    >
      {/* ── 4-Side Perimeter Light Rims & Inward Reflection ───────────────────── */}
      <CardReflectiveShine variant="blue" rounded="rounded-3xl" hasHoverSweep={true} />

      {/* Header and Narrative */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Application Journey & Progression Pipeline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Track your recruitment milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-xl">
            Live transparency across every stage of your job applications from initial submission to final offer.
          </p>
        </div>

        <Link
          to="/candidate/applications"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors self-start md:self-auto shrink-0"
        >
          View all submissions ({totalApplicationsCount}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5-Stage Interactive Milestone Bar with Shining Sheen */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border ${stage.border} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group/stage`}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/stage:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg ${stage.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                  <Icon className={`w-3.5 h-3.5 ${stage.color}`} />
                </div>
                <span className="text-xs font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {stage.count}
                </span>
              </div>
              <p className="relative z-10 text-xs font-semibold text-slate-200">{stage.label}</p>
              <p className="relative z-10 text-[10px] text-slate-400 mt-0.5">
                {stage.count === 1 ? '1 application' : `${stage.count} applications`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two-Column Display: Realistic Pipeline Visual + Live Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Visual of Application Pipeline */}
        <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto rounded-2xl overflow-hidden border border-white/10 shadow-xl group/pipe bg-slate-900 min-h-[220px]">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none z-10" />

          <img
            src="/assets/candidate/progression_pipeline_3d.jpg"
            alt="Recruitment Progression Pipeline"
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.05] transition-transform duration-700 group-hover/pipe:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060917]/90 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real-time submission pipeline
            </span>
            <Link
              to="/candidate/applications"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live Applications Feed with Crystalline Rim */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden relative shadow-sm">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none" />

          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Application Updates
            </span>
            <span className="text-[11px] text-slate-400">
              {recentApplications?.length || 0} recent submissions
            </span>
          </div>

          <div className="divide-y divide-white/[0.04] flex-1">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.slice(0, 4).map((app: Application) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors relative group/row"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-white truncate group-hover/row:text-indigo-300 transition-colors">
                      {app.jobTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {app.company} · Applied {app.appliedDate || 'Recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {renderStatusBadge(app.status)}
                    <Link
                      to="/candidate/applications"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View application"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-2">
                <Layers className="w-8 h-8 text-slate-600 opacity-60" />
                <p className="text-xs font-semibold text-slate-300">No applications submitted yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Discover verified tech openings and submit your ATS-ready resume in one click.
                </p>
                <Link to="/candidate/jobs" className="pt-2">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Explore Openings
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
