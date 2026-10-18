import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  UserCheck,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  Calendar,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  MapPin,
  RotateCcw,
  Eye,
  Trash2
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  RecruiterStats,
  Job,
  Application,
  ApplicationStatus,
  Company,
  RecruiterVerificationDetail,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/cn';
import {
  formatSalaryRange,
  formatRelativeTime,
  isDeadlinePassed,
  isDeadlineApproaching,
  formatDeadlineLabel,
  getStatusBadgeStyle
} from '../../utils/formatters';

interface CandidateActivityItem {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  jobId: string;
  description: string;
  timestamp: string;
  status: ApplicationStatus;
  application: Application;
}

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Core Data States
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [verificationDetail, setVerificationDetail] = useState<RecruiterVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [viewingProfile, setViewingProfile] = useState<Application | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeletingJob, setIsDeletingJob] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Verification Helpers
  const verificationStatus = (
    user?.verificationStatus ||
    verificationDetail?.verificationStatus ||
    'PENDING'
  ).toLowerCase();
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending' || verificationStatus === 'in_review';
  const isEvidenceRequired = verificationStatus === 'additional_evidence_required';
  const isResubmitted = verificationStatus === 'resubmitted';
  const isRejected = verificationStatus === 'rejected';
  const isSuspended = verificationStatus === 'suspended';

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Display recruiter name
  const recruiterDisplayName = useMemo(() => {
    const raw = user?.name || verificationDetail?.recruiterName;
    const sanitized = voiceAssistantService.sanitizeDisplayName(raw);
    if (sanitized && sanitized.toLowerCase() !== 'first') {
      return sanitized;
    }
    return 'Recruiter';
  }, [user, verificationDetail]);

  const companyDisplayName = useMemo(() => {
    return company?.name || user?.companyName || 'your organization';
  }, [company, user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      const [statsData, postedJobs, allApplicants, companyData, vDetail] = await Promise.all([
        recruiterService.getStats().catch(() => null),
        recruiterService.getPostedJobs().catch(() => [] as Job[]),
        recruiterService.getAllApplicants().catch(() => [] as Application[]),
        recruiterService.getCompanyProfile().catch(() => null),
        recruiterService.getVerificationDetail().catch(() => null),
      ]);

      const resolvedJobs = postedJobs || [];
      const resolvedApplicants = allApplicants || [];

      setJobs(resolvedJobs);
      setApplicants(resolvedApplicants);
      setCompany(companyData);
      setVerificationDetail(vDetail);

      // Derive metrics from real database records
      const activeJobsCount = resolvedJobs.filter(
        (j) => j.status?.toLowerCase() === 'active' && !isDeadlinePassed(j.deadline)
      ).length;

      const needsReviewCount = resolvedApplicants.filter(
        (a) => a.status === 'Applied' || a.status === 'Under Review'
      ).length;

      const interviewsCount = resolvedApplicants.filter(
        (a) => a.status === 'Interview'
      ).length;

      setStats({
        activeJobs: activeJobsCount,
        totalApplicants: resolvedApplicants.length,
        needsReview: needsReviewCount,
        interviewsScheduled: interviewsCount,
        shortlisted: resolvedApplicants.filter((a) => a.status === 'Shortlisted').length,
        hiresThisMonth: resolvedApplicants.filter((a) => a.status === 'Selected').length,
        averageTimeToHireDays: statsData?.averageTimeToHireDays || 15
      });
    } catch (err: any) {
      console.error('Failed to load recruiter dashboard:', err);
      setHasError(true);
      setErrorMessage(err?.message || 'Unable to connect to the recruitment platform. Please check your connection.');
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not fetch your recruitment pipeline data.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Metric Values
  const activeJobsList = useMemo(() => {
    return jobs.filter((j) => j.status?.toLowerCase() === 'active' && !isDeadlinePassed(j.deadline));
  }, [jobs]);

  const candidatesNeedingReview = useMemo(() => {
    return applicants.filter((a) => a.status === 'Applied' || a.status === 'Under Review');
  }, [applicants]);

  const interviewCandidates = useMemo(() => {
    return applicants.filter((a) => a.status === 'Interview');
  }, [applicants]);

  // Next Best Action (Deterministic logic with strict priority)
  const nextBestAction = useMemo(() => {
    // Scenario A: Candidates awaiting review (Highest Priority)
    if (candidatesNeedingReview.length > 0) {
      return {
        type: 'REVIEW_APPLICANTS',
        badge: 'ACTION REQUIRED',
        badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
        headline: 'Your candidates are waiting',
        description: `${candidatesNeedingReview.length} application${
          candidatesNeedingReview.length > 1 ? 's' : ''
        } need your attention in the review queue.`,
        actionLabel: 'Review Applications',
        actionLink: '/recruiter/applicants?status=Under+Review',
        icon: Clock,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10 border-amber-500/20'
      };
    }

    // Scenario D: Interview round in progress
    if (interviewCandidates.length > 0) {
      const topInterview = interviewCandidates[0];
      return {
        type: 'VIEW_INTERVIEW',
        badge: 'INTERVIEW STAGE',
        badgeClass: 'text-teal-300 bg-teal-500/15 border-teal-400/30',
        headline: 'Interview loop in progress',
        description: `Review candidate dossier and screening notes for ${topInterview.candidateName} (${topInterview.jobTitle}).`,
        actionLabel: 'View Interview',
        actionLink: '/recruiter/applicants?status=Interview',
        icon: UserCheck,
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/10 border-teal-500/20'
      };
    }

    // Scenario B: Active job approaching closing deadline
    const approachingJob = jobs.find(
      (j) => j.status?.toLowerCase() === 'active' && isDeadlineApproaching(j.deadline, 7)
    );
    if (approachingJob) {
      return {
        type: 'JOB_DEADLINE',
        badge: 'DEADLINE APPROACHING',
        badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
        headline: 'Your job deadline is approaching',
        description: `Review your "${approachingJob.title}" opening before its closing date (${approachingJob.deadline}).`,
        actionLabel: 'View Job',
        actionLink: `/recruiter/jobs/${approachingJob.id}`,
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10 border-amber-500/20'
      };
    }

    // Scenario C: Job reached deadline / expired
    const expiredJob = jobs.find(
      (j) =>
        (j.status?.toLowerCase() === 'closed' && j.closedReason === 'DEADLINE_EXPIRED') ||
        (j.status?.toLowerCase() === 'active' && isDeadlinePassed(j.deadline))
    );
    if (expiredJob) {
      return {
        type: 'JOB_EXPIRED',
        badge: 'DEADLINE REACHED',
        badgeClass: 'text-rose-300 bg-rose-500/15 border-rose-400/30',
        headline: 'This job has reached its deadline',
        description: `"${expiredJob.title}" has passed its closing date. Review status and decide whether to close or reopen with an extended deadline.`,
        actionLabel: 'Manage Job',
        actionLink: `/recruiter/jobs/${expiredJob.id}`,
        icon: AlertCircle,
        iconColor: 'text-rose-400',
        iconBg: 'bg-rose-500/10 border-rose-500/20'
      };
    }

    // Scenario E: No jobs exist
    if (jobs.length === 0) {
      return {
        type: 'CREATE_FIRST_JOB',
        badge: 'GET STARTED',
        badgeClass: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
        headline: 'Start building your recruitment pipeline',
        description: 'Create your first job opening to begin receiving verified applications and automated ATS scoring.',
        actionLabel: 'Post Your First Job',
        actionLink: '/recruiter/jobs/new',
        icon: PlusCircle,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/10 border-purple-500/20'
      };
    }

    // Scenario F: All caught up
    return {
      type: 'ALL_CAUGHT_UP',
      badge: 'ALL CAUGHT UP',
      badgeClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
      headline: "You're all caught up",
      description: "There's nothing requiring immediate attention. All applicant reviews and requisitions are up to date.",
      actionLabel: 'View Pipeline',
      actionLink: '/recruiter/applicants',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20'
    };
  }, [candidatesNeedingReview, interviewCandidates, jobs]);

  // Synthesize recent candidate activity from actual applications and their timelines
  const candidateActivities = useMemo<CandidateActivityItem[]>(() => {
    const events: CandidateActivityItem[] = [];

    applicants.forEach((app) => {
      // 1. Initial application event
      if (app.appliedDate) {
        events.push({
          id: `${app.id}-applied`,
          candidateName: app.candidateName,
          candidateAvatar: app.candidateAvatar,
          jobTitle: app.jobTitle,
          jobId: app.jobId,
          description: 'Candidate application received',
          timestamp: app.appliedDate,
          status: 'Applied',
          application: app
        });
      }

      // 2. Timeline stage transitions if available
      if (app.timeline && app.timeline.length > 0) {
        app.timeline.forEach((tl, idx) => {
          if (tl.status && tl.status !== 'Applied') {
            let desc = `Application moved to ${tl.status}`;
            if (tl.status === 'Shortlisted') desc = 'Candidate shortlisted for interview loop';
            if (tl.status === 'Interview') desc = 'Candidate scheduled for interview';
            if (tl.status === 'Selected') desc = 'Candidate marked as selected for offer';
            if (tl.status === 'Rejected') desc = 'Application review completed';

            events.push({
              id: `${app.id}-tl-${idx}`,
              candidateName: app.candidateName,
              candidateAvatar: app.candidateAvatar,
              jobTitle: app.jobTitle,
              jobId: app.jobId,
              description: desc,
              timestamp: tl.date || app.appliedDate,
              status: tl.status,
              application: app
            });
          }
        });
      } else if (app.status && app.status !== 'Applied') {
        // If no explicit timeline array but app is in advanced stage
        events.push({
          id: `${app.id}-${app.status}`,
          candidateName: app.candidateName,
          candidateAvatar: app.candidateAvatar,
          jobTitle: app.jobTitle,
          jobId: app.jobId,
          description: `Application progressed to ${app.status}`,
          timestamp: app.appliedDate,
          status: app.status,
          application: app
        });
      }
    });

    // Sort descending by timestamp
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [applicants]);

  // Status stage updater for candidate dossier
  const handleUpdateApplicantStage = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await recruiterService.updateApplicantStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      if (viewingProfile && viewingProfile.id === appId) {
        setViewingProfile((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast({
        type: 'success',
        title: 'Stage Updated',
        message: `Candidate stage moved to "${newStatus}".`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update applicant stage.'
      });
    }
  };

  // Delete Job Requisition
  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeletingJob(true);
      await jobService.deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      showToast({
        type: 'info',
        title: 'Requisition Removed',
        message: `Requisition "${jobToDelete.title}" has been deleted.`
      });
      setJobToDelete(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.message || 'Failed to remove job requisition.'
      });
    } finally {
      setIsDeletingJob(false);
    }
  };

  const handlePostJobClick = (e: React.MouseEvent) => {
    if (!isVerified) {
      e.preventDefault();
      setShowVerificationModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ══════════════════════════════════════════════════════════════════════════
          A. WELCOME HEADER (SECTION 3)
      ══════════════════════════════════════════════════════════════════════════ */}
      <header className="p-6 rounded-2xl bg-[#090F1E] border border-white/[0.08] shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-400/20 px-2.5 py-0.5 rounded-full">
                Recruitment Overview
              </span>

              {/* Verified badge only when confirmed by backend */}
              {isVerified && (
                <span
                  id="recruiter-verified-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Organization</span>
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verification Pending</span>
                </span>
              )}
              {isEvidenceRequired && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Evidence Required</span>
                </span>
              )}
              {isResubmitted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resubmission Under Review</span>
                </span>
              )}
              {(isRejected || isSuspended) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isSuspended ? 'Account Suspended' : 'Verification Declined'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {recruiterDisplayName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Recruiting for <span className="text-white font-semibold">{companyDisplayName}</span>. Here&apos;s the latest activity across your recruitment pipeline.
            </p>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
            <Link to="/recruiter/jobs" id="btn-view-my-jobs">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Briefcase className="w-4 h-4 text-slate-300" />}
                className="border-white/10 hover:border-white/20 bg-white/[0.04] text-xs font-semibold"
              >
                View My Jobs
              </Button>
            </Link>

            <Link
              to="/recruiter/jobs/new"
              id="btn-post-job-primary"
              onClick={handlePostJobClick}
            >
              <Button
                variant="glow"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4 text-purple-200" />}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-purple-500/25"
              >
                + Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Unverified Recruiter Banner */}
      {!isVerified && !isLoading && (
        <div
          role="region"
          aria-label="Verification Status Notice"
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {isEvidenceRequired
                  ? 'Additional credentials required to verify your corporate affiliation'
                  : isResubmitted
                  ? 'Your verification application is currently under administrative compliance review'
                  : isRejected
                  ? 'Your recruiter verification was not approved. Review details in Verification Center'
                  : 'Organization verification pending approval'}
              </p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Job requisitions cannot accept public applicants until verification completes.
              </p>
            </div>
          </div>
          <Link
            to="/recruiter/verification"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-400/30 transition-colors"
          >
            Verification Center →
          </Link>
        </div>
      )}

      {/* API Error Retry Banner */}
      {hasError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs text-rose-200"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage || 'Failed to fetch recruitment metrics.'}</span>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 text-rose-100 font-bold border border-rose-400/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          B. RECRUITMENT PERFORMANCE SUMMARY (SECTION 4 - 4 COMPACT CARDS)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="metrics-summary-heading">
        <h2 id="metrics-summary-heading" className="sr-only">
          Recruitment Performance Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: ACTIVE JOBS */}
          <Link
            to="/recruiter/jobs"
            id="metric-active-jobs"
            className="p-4 rounded-xl bg-[#090F1E] border border-white/[0.08] hover:border-cyan-400/40 hover:-translate-y-0.5 transition-all duration-200 group block shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Jobs
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-14 bg-white/[0.05] rounded animate-pulse my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeJobsList.length}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 truncate">
                Accepting applications
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors" />
            </div>
          </Link>

          {/* Card 2: TOTAL APPLICANTS */}
          <Link
            to="/recruiter/applicants"
            id="metric-total-applicants"
            className="p-4 rounded-xl bg-[#090F1E] border border-white/[0.08] hover:border-purple-400/40 hover:-translate-y-0.5 transition-all duration-200 group block shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Applicants
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-14 bg-white/[0.05] rounded animate-pulse my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {applicants.length}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 truncate">
                Across all job openings
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 transition-colors" />
            </div>
          </Link>

          {/* Card 3: NEEDS REVIEW */}
          <Link
            to="/recruiter/applicants?status=Under+Review"
            id="metric-needs-review"
            className="p-4 rounded-xl bg-[#090F1E] border border-white/[0.08] hover:border-amber-400/40 hover:-translate-y-0.5 transition-all duration-200 group block shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Needs Review
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-14 bg-white/[0.05] rounded animate-pulse my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {candidatesNeedingReview.length}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 truncate">
                Awaiting evaluation
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-colors" />
            </div>
          </Link>

          {/* Card 4: INTERVIEWS */}
          <Link
            to="/recruiter/applicants?status=Interview"
            id="metric-interviews"
            className="p-4 rounded-xl bg-[#090F1E] border border-white/[0.08] hover:border-teal-400/40 hover:-translate-y-0.5 transition-all duration-200 group block shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Interviews
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-14 bg-white/[0.05] rounded animate-pulse my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {interviewCandidates.length}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 truncate">
                Active screening rounds
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-300 transition-colors" />
            </div>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          C. RECOMMENDED NEXT ACTION (SECTION 5 - "YOUR NEXT BEST ACTION")
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        id="section-next-best-action"
        aria-labelledby="heading-next-best-action"
        className="p-5 rounded-2xl bg-gradient-to-r from-[#090F1E] via-[#0D152A] to-[#090F1E] border border-purple-500/25 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5',
                nextBestAction.iconBg
              )}
            >
              <nextBestAction.icon className={cn('w-5 h-5', nextBestAction.iconColor)} />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  YOUR NEXT BEST ACTION
                </span>
                <span
                  className={cn(
                    'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border',
                    nextBestAction.badgeClass
                  )}
                >
                  {nextBestAction.badge}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {nextBestAction.headline}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {nextBestAction.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center pt-2 sm:pt-0">
            <Link to={nextBestAction.actionLink} id="btn-next-best-action">
              <Button
                variant="glow"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                {nextBestAction.actionLabel}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          D. MY JOB OPENINGS (SECTION 6)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        id="section-my-job-openings"
        aria-labelledby="heading-job-openings"
        className="p-5 sm:p-6 rounded-2xl bg-[#090F1E] border border-white/[0.08] shadow-md space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <h2 id="heading-job-openings" className="text-sm font-bold uppercase tracking-wider text-white">
              MY JOB OPENINGS
            </h2>
          </div>

          <Link
            to="/recruiter/jobs"
            id="link-view-all-jobs"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-white">No Job Openings Created</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Post your first job opening to receive real candidates and automatic ATS match scoring.
            </p>
            <div className="pt-1">
              <Link to="/recruiter/jobs/new" onClick={handlePostJobClick}>
                <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  + Post a Job
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 pl-2">Job Requisition</th>
                  <th className="pb-2.5">Compensation (INR)</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Applicants</th>
                  <th className="pb-2.5">Deadline</th>
                  <th className="pb-2.5 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {jobs.slice(0, 5).map((job) => {
                  const statusLower = (job.status || 'active').toLowerCase();
                  const isExpired =
                    statusLower === 'closed' && job.closedReason === 'DEADLINE_EXPIRED'
                      ? true
                      : isDeadlinePassed(job.deadline);

                  const statusDisplay = isExpired
                    ? 'Expired'
                    : statusLower === 'active'
                    ? 'Active'
                    : statusLower === 'pending_approval'
                    ? 'Pending Approval'
                    : statusLower === 'draft'
                    ? 'Draft'
                    : 'Closed';

                  const badgeClass = isExpired
                    ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                    : statusLower === 'active'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : statusLower === 'pending_approval'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                    : 'bg-slate-500/15 text-slate-300 border-slate-400/30';

                  const salaryDisplay = formatSalaryRange(
                    job.salary?.min,
                    job.salary?.max,
                    job.salary?.currency || 'INR',
                    job.salary?.period || 'yearly',
                    'Competitive'
                  );

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Job Title & Dept */}
                      <td className="py-3 pl-2 pr-3">
                        <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{job.department || 'General'}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {job.location}
                          </span>
                          <span>·</span>
                          <span>{job.type}</span>
                        </p>
                      </td>

                      {/* INR Salary */}
                      <td className="py-3 pr-3 text-slate-300 font-medium">
                        {salaryDisplay}
                      </td>

                      {/* Status */}
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            badgeClass
                          )}
                        >
                          {statusDisplay}
                        </span>
                      </td>

                      {/* Applicant Count */}
                      <td className="py-3 pr-3 font-semibold text-slate-200">
                        {job.applicantCount || 0} applicants
                      </td>

                      {/* Deadline */}
                      <td className="py-3 pr-3 text-[11px] text-slate-400">
                        {formatDeadlineLabel(job.deadline)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs py-1 px-2.5 h-auto text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/10"
                            >
                              View Applicants
                            </Button>
                          </Link>
                          <Link to={`/recruiter/jobs/${job.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs py-1 px-2.5 h-auto text-slate-300 hover:text-white"
                            >
                              Manage Job
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Stacked Card View */}
            <div className="space-y-3 sm:hidden">
              {jobs.slice(0, 5).map((job) => {
                const statusLower = (job.status || 'active').toLowerCase();
                const isExpired =
                  statusLower === 'closed' && job.closedReason === 'DEADLINE_EXPIRED'
                    ? true
                    : isDeadlinePassed(job.deadline);

                const statusDisplay = isExpired
                  ? 'Expired'
                  : statusLower === 'active'
                  ? 'Active'
                  : statusLower === 'pending_approval'
                  ? 'Pending Approval'
                  : 'Closed';

                const badgeClass = isExpired
                  ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                  : statusLower === 'active'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-400/30';

                return (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{job.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          {job.department} · {job.location} · {job.type}
                        </p>
                      </div>
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', badgeClass)}>
                        {statusDisplay}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/[0.04]">
                      <span>{formatSalaryRange(job.salary?.min, job.salary?.max, 'INR', job.salary?.period)}</span>
                      <span>{job.applicantCount || 0} applicants</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <span className="text-[10px] text-slate-400">{formatDeadlineLabel(job.deadline)}</span>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 px-2 h-auto text-cyan-300">
                            Applicants
                          </Button>
                        </Link>
                        <Link to={`/recruiter/jobs/${job.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 px-2 h-auto">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          E & F. CANDIDATE ACTIVITY & UPCOMING INTERVIEWS (2-COLUMN GRID)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION E: RECENT CANDIDATE ACTIVITY */}
        <section
          id="section-recent-candidate-activity"
          aria-labelledby="heading-candidate-activity"
          className="p-5 rounded-2xl bg-[#090F1E] border border-white/[0.08] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 id="heading-candidate-activity" className="text-sm font-bold uppercase tracking-wider text-white">
                RECENT CANDIDATE ACTIVITY
              </h2>
            </div>
            <Link
              to="/recruiter/applicants"
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-0.5"
            >
              <span>Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : candidateActivities.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
              <Users className="w-7 h-7 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No recent candidate activity yet.</p>
              <p className="text-[11px] text-slate-400">
                New candidate submissions and pipeline updates will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {candidateActivities.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                      {item.candidateName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate">{item.candidateName}</p>
                        <span className="text-[9px] font-semibold text-slate-400 truncate hidden sm:inline">
                          · {item.jobTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description} · <span className="text-slate-500">{formatRelativeTime(item.timestamp)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingProfile(item.application)}
                      className="text-xs py-1 px-2.5 h-auto text-purple-300 border-purple-400/30 hover:bg-purple-500/10"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION F: UPCOMING INTERVIEWS */}
        <section
          id="section-upcoming-interviews"
          aria-labelledby="heading-upcoming-interviews"
          className="p-5 rounded-2xl bg-[#090F1E] border border-white/[0.08] shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <h2 id="heading-upcoming-interviews" className="text-sm font-bold uppercase tracking-wider text-white">
                UPCOMING INTERVIEWS
              </h2>
            </div>
            <Link
              to="/recruiter/applicants?status=Interview"
              className="text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-0.5"
            >
              <span>Manage Rounds</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : interviewCandidates.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
              <Calendar className="w-7 h-7 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No upcoming interviews scheduled.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Promote qualified candidates to the &ldquo;Interview&rdquo; stage in your applicant pipeline to schedule screening loops.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {interviewCandidates.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-teal-500/30 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-400/30 flex items-center justify-center font-bold text-teal-300 text-xs shrink-0">
                      {app.candidateName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate">{app.candidateName}</p>
                        <span className="text-[9px] font-bold text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-400/20">
                          Interview Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {app.jobTitle} · {app.notes?.[0] || 'Technical Screening & Interview Loop'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingProfile(app)}
                      className="text-xs py-1 px-2.5 h-auto text-teal-300 border-teal-400/30 hover:bg-teal-500/10"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Interview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          CANDIDATE DOSSIER MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {viewingProfile && (
        <Modal
          isOpen={Boolean(viewingProfile)}
          onClose={() => setViewingProfile(null)}
          title="Candidate Dossier & Evaluation"
          size="4xl"
        >
          <div className="space-y-5 max-h-[76vh] overflow-y-auto pr-1 text-xs">
            {/* Header Card */}
            <div className="p-4 rounded-xl bg-[#090F1E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-black text-white shrink-0 shadow-md">
                  {viewingProfile.candidateName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {viewingProfile.candidateName}
                  </h3>
                  <p className="text-xs text-purple-300 font-medium">
                    {viewingProfile.candidateTitle || 'Applicant'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{viewingProfile.candidateLocation || 'Location not specified'}</span>
                    <span>·</span>
                    <span>{viewingProfile.experienceYears || 0} Years Experience</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 px-3 py-2 rounded-xl bg-[#060A14] border border-purple-400/20">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  ATS Match Score
                </p>
                <p className="text-xl font-extrabold text-emerald-400">
                  {viewingProfile.atsScore || 85}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </p>
              </div>
            </div>

            {/* Position & Stage Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                <p className="text-xs text-white font-medium truncate mt-0.5">{viewingProfile.candidateEmail}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Applied Requisition</p>
                <p className="text-xs text-white font-medium truncate mt-0.5">{viewingProfile.jobTitle}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Current Stage</p>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded border inline-block mt-0.5', getStatusBadgeStyle(viewingProfile.status).badgeClass)}>
                  {viewingProfile.status}
                </span>
              </div>
            </div>

            {/* Skills */}
            {viewingProfile.skills && viewingProfile.skills.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-400/25 text-purple-200 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stage Actions */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Move Candidate:</span>
                {(['Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as ApplicationStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateApplicantStage(viewingProfile.id, st)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      viewingProfile.status === st
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingProfile(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VERIFICATION REQUIRED MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showVerificationModal && (
        <Modal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          title="Recruiter Verification Required"
          size="md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Administrator Verification Required
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              To protect candidates from fraudulent listings, only recruiters with verified corporate credentials can publish job openings.
            </p>

            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-left text-xs space-y-1">
              <p className="font-semibold text-slate-200">
                Current Status: <span className="text-amber-400 uppercase font-bold">{verificationStatus}</span>
              </p>
              <p className="text-slate-400 text-[11px]">
                Submit your official corporate domain or representative credentials in the Verification Center for review.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVerificationModal(false)}
              >
                Cancel
              </Button>
              <Link to="/recruiter/verification">
                <Button
                  variant="glow"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => setShowVerificationModal(false)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Open Verification Center
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Job Dialog */}
      <ConfirmDialog
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDeleteJob}
        title="Delete Job Requisition"
        message={`Are you sure you want to delete requisition "${jobToDelete?.title || ''}"? This action cannot be undone.`}
        confirmText="Delete Requisition"
        variant="danger"
        isLoading={isDeletingJob}
      />
    </div>
  );
};

export default RecruiterDashboard;
