import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  X,
  ArrowRight,
  Eye,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Job } from '../../types';
import { formatCurrency, formatSalaryRange } from '../../utils/formatters';

export interface JobPublishSuccessModalProps {
  isOpen: boolean;
  job: Job | null;
  onClose: () => void;
  onPostAnotherJob?: () => void;
}

export const JobPublishSuccessModal: React.FC<JobPublishSuccessModalProps> = ({
  isOpen,
  job,
  onClose,
  onPostAnotherJob,
}) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Auto-dismiss countdown state
  const [isHovered, setIsHovered] = useState(false);
  const [countdown, setCountdown] = useState(7);

  // Status message and theme mapping based on real backend job status
  const statusConfig = useMemo(() => {
    if (!job) {
      return {
        title: 'JOB SUBMITTED',
        message: 'Your job requisition has been processed.',
        badgeLabel: 'PROCESSED',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        ringColor: '#10b981',
        iconBg: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        accentGradient: 'from-emerald-400 via-teal-300 to-cyan-400',
        glowColor: 'rgba(16, 185, 129, 0.3)',
      };
    }

    const s = (job.status || '').toLowerCase();
    if (s === 'active' || s === 'published') {
      return {
        title: 'JOB PUBLISHED SUCCESSFULLY!',
        message: 'Your new opportunity is live and ready to reach eligible candidates.',
        badgeLabel: 'PUBLISHED · ACTIVE',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        ringColor: '#10b981',
        iconBg: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        accentGradient: 'from-emerald-400 via-teal-300 to-cyan-400',
        glowColor: 'rgba(16, 185, 129, 0.35)',
      };
    }

    if (s === 'pending_approval') {
      return {
        title: 'JOB SUBMITTED FOR APPROVAL',
        message: 'Your requisition has been submitted and is awaiting administrator review before going live.',
        badgeLabel: 'PENDING APPROVAL',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        ringColor: '#f59e0b',
        iconBg: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
        accentGradient: 'from-amber-400 via-orange-300 to-amber-200',
        glowColor: 'rgba(245, 158, 11, 0.35)',
      };
    }

    if (s === 'draft') {
      return {
        title: 'JOB DRAFT SAVED',
        message: 'Your job draft has been saved. You can edit and publish it at any time.',
        badgeLabel: 'DRAFT SAVED',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
        ringColor: '#06b6d4',
        iconBg: 'from-cyan-500/20 to-indigo-500/20 border-cyan-500/30',
        accentGradient: 'from-cyan-400 via-indigo-300 to-purple-400',
        glowColor: 'rgba(6, 182, 212, 0.35)',
      };
    }

    return {
      title: 'JOB REQUISITION SAVED',
      message: `Your job requisition has been saved with status: ${job.status.toUpperCase()}.`,
      badgeLabel: job.status.toUpperCase(),
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      ringColor: '#6366f1',
      iconBg: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
      accentGradient: 'from-indigo-400 via-purple-300 to-cyan-400',
      glowColor: 'rgba(99, 102, 241, 0.35)',
    };
  }, [job]);

  // Action: Navigate to Job Postings list
  const handleViewJobPostings = useCallback(() => {
    onClose();
    navigate('/recruiter/jobs');
  }, [onClose, navigate]);

  // Action: Navigate to Published Job Details view
  const handleViewPublishedJob = useCallback(() => {
    if (!job?.id) return;
    onClose();
    // Navigate to job details view (or recruiter edit view)
    navigate(`/jobs/${job.id}`);
  }, [job, onClose, navigate]);

  // Action: Reset and Post Another Job
  const handlePostAnother = useCallback(() => {
    onClose();
    if (onPostAnotherJob) {
      onPostAnotherJob();
    } else {
      navigate('/recruiter/jobs/new');
    }
  }, [onClose, onPostAnotherJob, navigate]);

  // Countdown timer with pause on hover
  useEffect(() => {
    if (!isOpen) {
      setCountdown(7);
      return;
    }

    if (isHovered) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleViewJobPostings();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isHovered, handleViewJobPostings]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleViewJobPostings();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleViewJobPostings]);

  if (!isOpen || !job) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-success-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Dim backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleViewJobPostings}
          className="fixed inset-0 bg-[#040814]/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 24 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full max-w-xl bg-[#0a1024] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 z-10 text-slate-100 overflow-hidden"
          style={{
            boxShadow: `0 24px 60px -15px ${statusConfig.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.08)`,
          }}
        >
          {/* Subtle light sweep animation across card */}
          {!prefersReducedMotion && (
            <motion.div
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '250%', opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.2, delay: 0.15, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -skew-x-12 pointer-events-none"
            />
          )}

          {/* Close Button & Countdown */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {isHovered ? (
                  <span className="text-amber-400 font-semibold">Paused</span>
                ) : (
                  <span>Auto-closing in {countdown}s</span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={handleViewJobPostings}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close success dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Animated Success Icon with Circular Stroke Animation */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex items-center justify-center">
              {/* Outer pulsing ring */}
              {!prefersReducedMotion && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.35, 1.15], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-400/40 pointer-events-none"
                />
              )}

              {/* SVG Checkmark with Path Drawing Animation */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${statusConfig.iconBg} border flex items-center justify-center shadow-lg relative`}>
                <svg width="60" height="60" viewBox="0 0 80 80" className="overflow-visible">
                  {/* Circular drawing ring */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke={statusConfig.ringColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: prefersReducedMotion ? 1 : 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {/* Drawing checkmark */}
                  <motion.path
                    d="M 26 41 L 36 51 L 55 30"
                    fill="none"
                    stroke={statusConfig.ringColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: prefersReducedMotion ? 1 : 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
                  />
                </svg>
              </div>
            </div>

            {/* Main Heading */}
            <motion.h2
              id="publish-success-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display uppercase"
            >
              {statusConfig.title}
            </motion.h2>

            {/* Subtle Gradient Accent Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className={`w-32 h-[2px] bg-gradient-to-r ${statusConfig.accentGradient} my-2.5 rounded-full`}
            />

            {/* Supporting Message */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed"
            >
              {statusConfig.message}
            </motion.p>
          </div>

          {/* Actual Job Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3.5 relative overflow-hidden"
          >
            {/* Top Row: Title & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate" title={job.title}>
                    {job.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  {job.department && (
                    <span className="text-indigo-400 font-semibold">{job.department}</span>
                  )}
                  {job.department && job.location && <span>•</span>}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                  )}
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shrink-0 ${statusConfig.badgeClass}`}>
                {statusConfig.badgeLabel}
              </span>
            </div>

            {/* Grid of Key Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {job.type && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-400 font-medium">Employment:</span>
                  <span className="font-semibold text-white">{job.type}</span>
                </div>
              )}

              {job.experienceLevel && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-400 font-medium">Experience Level:</span>
                  <span className="font-semibold text-white">{job.experienceLevel}</span>
                </div>
              )}

              {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                <div className="flex items-center gap-2 text-slate-300 sm:col-span-2">
                  <span className="text-slate-400 font-medium">Salary:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency || 'INR', job.salary.period)}
                  </span>
                </div>
              )}

              {job.id && (
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono sm:col-span-2 pt-1 border-t border-slate-800/60">
                  <span>Requisition ID:</span>
                  <span className="text-slate-300 font-bold select-all">{job.id}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-6 flex flex-col sm:flex-row items-center gap-3"
          >
            {/* BUTTON 1: View Job Postings (Primary) */}
            <button
              type="button"
              onClick={handleViewJobPostings}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 border border-indigo-400/30 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Briefcase className="w-4 h-4" />
              <span>View Job Postings</span>
            </button>

            {/* BUTTON 2: View Published Job (Secondary) */}
            <button
              type="button"
              onClick={handleViewPublishedJob}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>View Published Job</span>
            </button>
          </motion.div>

          {/* OPTIONAL SECONDARY ACTION: Post Another Job */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mt-4 text-center"
          >
            <button
              type="button"
              onClick={handlePostAnother}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Another Job</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
