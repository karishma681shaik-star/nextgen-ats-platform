import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  UserCheck,
  Bookmark,
  FileText,
  Briefcase,
  ChevronRight,
  Award
} from 'lucide-react';
import type { CandidateDashboardData } from '../../services';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

interface CandidateSkillRoadmapSectionProps {
  dashboardData: CandidateDashboardData;
}

export const CandidateSkillRoadmapSection: React.FC<CandidateSkillRoadmapSectionProps> = ({
  dashboardData
}) => {
  const { profileCompletion, savedJobsCount } = dashboardData;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-emerald-500/25 bg-gradient-to-br from-[#0b1329]/95 via-[#070c1c]/95 to-[#050814]/98 p-6 sm:p-8 lg:p-10 card-top-illumination-hero card-shine-all-sides transition-all duration-300 group"
    >
      {/* ── 4-Side Perimeter Light Rims & Inward Reflection ───────────────────── */}
      <CardReflectiveShine variant="emerald" intensity="hero" rounded="rounded-3xl" topIllumination={true} hasHoverSweep={true} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Editorial 3D Interview Readiness Visual */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/img bg-slate-900">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none z-10" />

            <img
              src="/assets/candidate/interview_workspace_3d.jpg"
              alt="Professional Interview Workspace & Career Milestones"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04] transition-transform duration-700 group-hover/img:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#050814]/70 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-white">
                Interview Readiness & Career Trajectory
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Readiness & Action Shortcuts */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Interview Preparation & Career Readiness
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Move toward your next career milestone
            </h2>
            <p className="text-sm text-slate-300/85 leading-relaxed">
              Maintain an up-to-date skills dossier, expand your portfolio achievements, and align your qualifications
              with current technical requirements evaluated by hiring teams.
            </p>
          </div>

          {/* Profile Progress Box with Subtle Sheen */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Dossier Completeness
              </span>
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {profileCompletion}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Profiles with complete skills, projects, and work histories receive 3.4x higher recruiter interview invites.
            </p>
          </div>

          {/* Quick Action Navigation Grid with Shining Sheen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <Link
              to="/candidate/profile"
              className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-emerald-400/35 transition-all group/nav shadow-sm hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/nav:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />

              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover/nav:text-white transition-colors">
                  Edit Profile & Skills
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/nav:text-white group-hover/nav:translate-x-0.5 transition-all relative z-10" />
            </Link>

            <Link
              to="/candidate/resumes"
              className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-indigo-400/35 transition-all group/nav shadow-sm hover:shadow-[0_4px_20px_rgba(99,102,241,0.12)]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/nav:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />

              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover/nav:text-white transition-colors">
                  Manage All Resumes
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/nav:text-white group-hover/nav:translate-x-0.5 transition-all relative z-10" />
            </Link>

            <Link
              to="/candidate/saved-jobs"
              className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-purple-400/35 transition-all group/nav shadow-sm hover:shadow-[0_4px_20px_rgba(168,85,247,0.12)]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/nav:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />

              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-inner">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover/nav:text-white transition-colors">
                  Saved Openings ({savedJobsCount})
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/nav:text-white group-hover/nav:translate-x-0.5 transition-all relative z-10" />
            </Link>

            <Link
              to="/candidate/jobs"
              className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.07] hover:border-cyan-400/35 transition-all group/nav shadow-sm hover:shadow-[0_4px_20px_rgba(56,189,248,0.12)]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/nav:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />

              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover/nav:text-white transition-colors">
                  Explore Tech Jobs
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/nav:text-white group-hover/nav:translate-x-0.5 transition-all relative z-10" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
