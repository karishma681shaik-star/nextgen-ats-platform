import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Building2,
  Bookmark,
  Trash2,
  ExternalLink,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
  Briefcase,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { Job } from '../../types';
import { Button } from '../ui/Button';
import { formatSalaryRange, formatFullDate } from '../../utils/formatters';

interface SavedJobCardProps {
  job: Job;
  isApplied: boolean;
  onApply: (job: Job) => void;
  onRemove: (jobId: string) => Promise<void>;
  index?: number;
}

export const SavedJobCard: React.FC<SavedJobCardProps> = ({
  job,
  isApplied,
  onApply,
  onRemove,
  index = 0
}) => {
  const prefersReduced = useReducedMotion();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const isClosed = job.status === 'closed';

  const renderSalary = () => {
    const anyJob = job as any;
    const min = job.salary?.min ?? anyJob.salaryMin;
    const max = job.salary?.max ?? anyJob.salaryMax;
    const currency = job.salary?.currency ?? anyJob.currency ?? 'INR';
    const period = job.salary?.period ?? anyJob.salaryPeriod ?? 'yearly';
    return formatSalaryRange(min, max, currency, period, 'Competitive Salary');
  };

  const getCompanyInitials = (name: string) => {
    if (!name) return 'CO';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleConfirmRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(job.id);
    } finally {
      setIsRemoving(false);
      setShowConfirmRemove(false);
    }
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.25), ease: 'easeOut' }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className="card-ultra-shine rounded-2xl p-5 sm:p-6 relative group overflow-hidden transition-all duration-300"
    >
      {/* Specular Ambient Glow inside the card - subtle and elegant */}
      <div
        className="absolute top-0 right-1/4 w-80 h-28 bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-transparent blur-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-60 opacity-20 -z-10"
        aria-hidden="true"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Company Identity & Job Details */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company Logo with Refined Border */}
          <div className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-2xl overflow-hidden border border-white/[0.12] bg-slate-900/80 shrink-0 flex items-center justify-center text-slate-200 font-bold text-sm shadow-sm relative group-hover:border-indigo-400/40 transition-colors p-2.5">
            {job.companyLogo && !logoError ? (
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-950/60 text-indigo-300 font-extrabold tracking-wider">
                {getCompanyInitials(job.company)}
              </div>
            )}
            {/* Subtle gloss highlight on logo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Job Information */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/candidate/jobs/${job.id}`}
                className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors tracking-tight focus:outline-none focus:underline"
              >
                {job.title}
              </Link>

              {/* Status or Match Score with Realistic Material Pill */}
              {isClosed ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Position closed
                </span>
              ) : job.matchScore ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  {job.matchScore}% Match
                </span>
              ) : null}

              {isApplied && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(14,165,233,0.25)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Application Submitted
                </span>
              )}

              {/* Verified Requisition Badge */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/35 text-[10px] text-cyan-300 font-semibold shadow-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                </span>
                <span>Verified Direct Requisition</span>
              </div>
            </div>

            {/* Company & Location Metadata */}
            <p className="text-xs text-slate-300 font-medium flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                {job.company}
              </span>
              {job.location && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 flex items-center gap-1 font-normal">
                    <MapPin className="w-3 h-3 text-cyan-400/90 shrink-0" />
                    {job.location}
                  </span>
                </>
              )}
              {job.postedDate && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px]">
                    Posted {formatFullDate(job.postedDate)}
                  </span>
                </>
              )}
            </p>

            {/* Attributes row with polished high-contrast tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              {job.type && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-200 border border-white/10 font-medium text-[11px] shadow-xs">
                  {job.type}
                </span>
              )}
              {job.experienceLevel && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-200 border border-white/10 font-medium text-[11px] shadow-xs">
                  {job.experienceLevel}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-950/80 to-purple-950/80 text-cyan-300 border border-cyan-500/40 font-semibold text-[11px] shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                {renderSalary()}
              </span>
            </div>

            {/* Key Skills Pills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {job.skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-white/[0.08]"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 6 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{job.skills.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
          {/* Bookmark Removal Action with Accessible Confirmation */}
          <div className="relative">
            <button
              onClick={() => setShowConfirmRemove(true)}
              disabled={isRemoving}
              aria-label="Remove job from bookmarks"
              title="Remove Saved Job"
              className="p-2.5 rounded-xl bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Confirmation Popover */}
            {showConfirmRemove && (
              <div
                role="alertdialog"
                aria-label="Confirm bookmark removal"
                className="absolute right-0 bottom-full mb-2 w-64 p-3.5 rounded-xl bg-[#0d142b] border border-rose-500/40 shadow-[0_16px_36px_rgba(0,0,0,0.95)] z-30 text-xs space-y-2.5 text-left"
              >
                <p className="text-white font-semibold">Remove this bookmark?</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  This opportunity will be removed from your saved list. Your submitted applications will not be affected.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowConfirmRemove(false)}
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRemove}
                    disabled={isRemoving}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action: View Job */}
          <Link to={`/candidate/jobs/${job.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
            >
              View Job
            </Button>
          </Link>

          {/* Secondary Action: Apply Now / Applied / Closed */}
          {isClosed ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="opacity-60 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500"
            >
              Position Closed
            </Button>
          ) : isApplied ? (
            <Link to="/candidate/applications">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                className="border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/60 shadow-[0_0_14px_rgba(6,182,212,0.25)]"
              >
                Application Submitted
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => onApply(job)}
              className="shadow-[0_0_20px_rgba(99,102,241,0.45)] hover:shadow-[0_0_28px_rgba(56,189,248,0.6)]"
            >
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
