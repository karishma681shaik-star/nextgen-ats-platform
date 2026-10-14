import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  PlusCircle,
  Sparkles,
  Zap,
  ChevronRight,
  Eye,
  Activity,
  Flame,
  Filter,
  ExternalLink,
  ShieldCheck,
  Check,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Building,
  GraduationCap,
  Edit2,
  Trash2,
  Search,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  UserCheck,
  Bell,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { recruiterService, jobService, notificationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  RecruiterStats,
  Job,
  Application,
  ApplicationStatus,
  Company,
  RecruiterVerificationDetail,
  AppNotification
} from '../../types';
import { Button } from '../../components/ui/Button';
import { DepthCard } from '../../components/ui/DepthCard';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/cn';
import { getStatusBadgeStyle } from '../../utils/formatters';

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab for Main Work Area
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs' | 'interviews' | 'activity'>('candidates');

  // Candidate Filters
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'under_review' | 'shortlisted' | 'interview'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'name'>('score');

  // Modal States
  const [viewingProfile, setViewingProfile] = useState<Application | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Application | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Computed Verification Helpers
  const verificationStatus = (user?.verificationStatus || verificationDetail?.verificationStatus || 'PENDING').toLowerCase();
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending' || verificationStatus === 'in_review';
  const isEvidenceRequired = verificationStatus === 'additional_evidence_required';
  const isResubmitted = verificationStatus === 'resubmitted';
  const isRejected = verificationStatus === 'rejected';
  const isSuspended = verificationStatus === 'suspended';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [statsData, postedJobs, allApplicants, companyData, vDetail, notifs] = await Promise.all([
        recruiterService.getStats().catch(() => null),
        recruiterService.getPostedJobs().catch(() => [] as Job[]),
        recruiterService.getAllApplicants().catch(() => [] as Application[]),
        recruiterService.getCompanyProfile().catch(() => null),
        recruiterService.getVerificationDetail().catch(() => null),
        notificationService.getNotifications().catch(() => [] as AppNotification[])
      ]);

      const resolvedJobs = postedJobs || [];
      const resolvedApplicants = allApplicants || [];

      setJobs(resolvedJobs);
      setApplicants(resolvedApplicants);
      setCompany(companyData);
      setVerificationDetail(vDetail);
      setNotifications(notifs || []);

      // Calculate real PostgreSQL metrics
      setStats({
        activeJobs: resolvedJobs.filter((j) => j.status?.toLowerCase() === 'active').length,
        totalApplicants: resolvedApplicants.length,
        shortlisted: resolvedApplicants.filter((a) => a.status === 'Shortlisted').length,
        interviewsScheduled: resolvedApplicants.filter((a) => a.status === 'Interview').length,
        hiresThisMonth: resolvedApplicants.filter((a) => a.status === 'Selected').length,
        averageTimeToHireDays: statsData?.averageTimeToHireDays || 0
      });
    } catch (err) {
      console.error('Failed to load recruiter command center:', err);
      showToast({
        type: 'error',
        title: 'Data Load Error',
        message: 'Could not fetch recruiter metrics. Please check network connectivity.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
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
        message: `Candidate stage updated to "${newStatus}".`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Failed to update applicant stage.'
      });
    }
  };

  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeleting(true);
      await recruiterService.deleteApplicant(candidateToDelete.id);
      setApplicants((prev) => prev.filter((a) => a.id !== candidateToDelete.id));
      if (viewingProfile?.id === candidateToDelete.id) {
        setViewingProfile(null);
      }
      showToast({
        type: 'info',
        title: 'Candidate Removed',
        message: `${candidateToDelete.candidateName} application removed.`
      });
      setCandidateToDelete(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete applicant record.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      await jobService.deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      showToast({
        type: 'info',
        title: 'Requisition Removed',
        message: `Requisition "${jobToDelete.title}" has been deleted.`
      });
      setJobToDelete(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete requisition.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe navigation to career portal
  const publicCareerPortalUrl = company?.id ? `/careers/${company.id}` : `/careers/${user?.companyName || user?.id || 'default'}`;

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (candidateFilter === 'under_review') {
      return app.status === 'Applied' || app.status === 'Under Review';
    }
    if (candidateFilter === 'shortlisted') {
      return app.status === 'Shortlisted';
    }
    if (candidateFilter === 'interview') {
      return app.status === 'Interview';
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return (b.atsScore || 0) - (a.atsScore || 0);
    if (sortBy === 'name') return a.candidateName.localeCompare(b.candidateName);
    return new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime();
  });

  // Candidates requiring review: status is Applied or Under Review
  const candidatesRequiringReview = applicants.filter(
    (a) => a.status === 'Applied' || a.status === 'Under Review'
  );

  // Candidates scheduled for interview
  const upcomingInterviews = applicants.filter((a) => a.status === 'Interview');

  // Pipeline Stage Aggregation
  const pipelineCounts = {
    applied: applicants.filter((a) => a.status === 'Applied').length,
    underReview: applicants.filter((a) => a.status === 'Under Review').length,
    shortlisted: applicants.filter((a) => a.status === 'Shortlisted').length,
    interview: applicants.filter((a) => a.status === 'Interview').length,
    hired: applicants.filter((a) => a.status === 'Selected').length,
    rejected: applicants.filter((a) => a.status === 'Rejected').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. COMPACT ENTERPRISE HEADER & CONTEXTUAL PRIMARY ACTION (SECTION 4)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-400/25 px-2.5 py-0.5 rounded-full">
                Recruitment Command Center
              </span>

              {/* Status Badge */}
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Recruiter</span>
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verification Pending</span>
                </span>
              )}
              {isEvidenceRequired && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-xs font-bold animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Additional Evidence Required</span>
                </span>
              )}
              {isResubmitted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Resubmitted for Review</span>
                </span>
              )}
              {(isRejected || isSuspended) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isSuspended ? 'Account Suspended' : 'Verification Rejected'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Recruiter'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Managing recruitment for{' '}
              <span className="text-white font-bold">{company?.name || user?.companyName || 'Corporate Partner'}</span>.
              Tracking <span className="text-cyan-300 font-bold">{stats?.activeJobs || 0} active openings</span> and{' '}
              <span className="text-indigo-300 font-bold">{stats?.totalApplicants || 0} candidate evaluations</span>.
            </p>
          </div>

          {/* Action Group */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Public Career Portal Action (Requirement 1 & 12) */}
            <Link to={publicCareerPortalUrl}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<ExternalLink className="w-4 h-4 text-cyan-400" />}
                className="border-white/10 hover:border-cyan-400/40 bg-white/[0.04]"
              >
                View Public Career Portal
              </Button>
            </Link>

            {/* Primary Contextual Action based on Verification Status */}
            {isVerified ? (
              <Link to="/recruiter/jobs/new">
                <Button
                  variant="glow"
                  size="md"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Post a New Job
                </Button>
              </Link>
            ) : isEvidenceRequired ? (
              <Link to="/recruiter/verification">
                <Button
                  variant="glow"
                  size="md"
                  leftIcon={<AlertCircle className="w-4 h-4 text-amber-300" />}
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Review Required Actions
                </Button>
              </Link>
            ) : isPending || isResubmitted ? (
              <Link to="/recruiter/verification">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-cyan-300" />}
                  className="border-amber-400/40 text-amber-200"
                >
                  Complete Verification
                </Button>
              </Link>
            ) : (
              <Link to="/recruiter/verification">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<AlertCircle className="w-4 h-4 text-rose-300" />}
                  className="border-rose-400/40 text-rose-200"
                >
                  View Verification Status
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. VERIFICATION STATUS & NEXT STEPS COMPONENT (SECTION 5)
      ══════════════════════════════════════════════════════════════════════════ */}
      {!isVerified && (
        <div
          className={cn(
            'p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all',
            isEvidenceRequired
              ? 'bg-amber-500/10 border-amber-500/30'
              : isRejected || isSuspended
              ? 'bg-rose-500/10 border-rose-500/30'
              : isResubmitted
              ? 'bg-cyan-500/10 border-cyan-500/30'
              : 'bg-indigo-950/40 border-indigo-500/25'
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/[0.05] shrink-0 mt-0.5">
              {isEvidenceRequired ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : isRejected || isSuspended ? (
                <XCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Clock className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isEvidenceRequired
                    ? 'Additional Evidence Required by Administrator'
                    : isRejected
                    ? 'Recruiter Verification Declined'
                    : isSuspended
                    ? 'Recruiter Account Suspended by Administration'
                    : isResubmitted
                    ? 'Updated Evidence Under Active Compliance Review'
                    : 'Account Verification In Progress'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {verificationStatus.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {isEvidenceRequired ? (
                  verificationDetail?.rejectionReason ||
                  user?.rejectionReason ||
                  'The administrator has requested additional corporate credentials or authorization documents to verify your affiliation with this organization.'
                ) : isRejected ? (
                  verificationDetail?.rejectionReason ||
                  user?.rejectionReason ||
                  'Your recruiter verification could not be approved based on the submitted evidence. Review feedback in the Verification Center.'
                ) : isSuspended ? (
                  verificationDetail?.rejectionReason ||
                  user?.rejectionReason ||
                  'Your recruiter privileges are temporarily suspended. Contact compliance administration for resolution.'
                ) : isResubmitted ? (
                  'Your resubmitted business registration and company authorization documents have been sent to the review queue.'
                ) : (
                  'Your recruiter profile is awaiting administrator verification. You may complete your company profile, but job publishing remains restricted until approval.'
                )}
              </p>

              {/* Progress of mandatory checks */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Email Verified
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Profile Created
                </span>
                <span className="flex items-center gap-1">
                  {company?.businessRegistrationNumber ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  Corporate Registration
                </span>
                <span className="flex items-center gap-1">
                  {company?.associationVerified ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  Recruiter Authorization
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link to="/recruiter/verification">
              <Button
                variant={isEvidenceRequired ? 'glow' : 'secondary'}
                size="sm"
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                {isEvidenceRequired ? 'Submit Evidence' : 'Verification Center'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          3. KEY RECRUITMENT METRICS SECTION (SECTION 6)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            title: 'Active Jobs',
            value: stats?.activeJobs ?? 0,
            sub: 'Published Openings',
            icon: <Briefcase className="w-4 h-4 text-cyan-400" />,
            link: '/recruiter/jobs',
            borderColor: 'hover:border-cyan-400/40'
          },
          {
            title: 'Total Applicants',
            value: stats?.totalApplicants ?? 0,
            sub: 'Received Across Jobs',
            icon: <Users className="w-4 h-4 text-indigo-400" />,
            link: '/recruiter/applicants',
            borderColor: 'hover:border-indigo-400/40'
          },
          {
            title: 'Under Review',
            value: candidatesRequiringReview.length,
            sub: 'Awaiting Evaluation',
            icon: <Clock className="w-4 h-4 text-amber-400" />,
            link: '/recruiter/applicants?status=Under+Review',
            borderColor: 'hover:border-amber-400/40'
          },
          {
            title: 'Shortlisted',
            value: stats?.shortlisted ?? 0,
            sub: 'Top Tier Talent',
            icon: <Target className="w-4 h-4 text-violet-400" />,
            link: '/recruiter/applicants?status=Shortlisted',
            borderColor: 'hover:border-violet-400/40'
          },
          {
            title: 'Interviews',
            value: stats?.interviewsScheduled ?? 0,
            sub: 'Active Rounds',
            icon: <UserCheck className="w-4 h-4 text-teal-400" />,
            link: '/recruiter/applicants?status=Interview',
            borderColor: 'hover:border-teal-400/40'
          },
          {
            title: 'Recorded Hires',
            value: stats?.hiresThisMonth ?? 0,
            sub: 'Offers Finalized',
            icon: <Award className="w-4 h-4 text-emerald-400" />,
            link: '/recruiter/applicants?status=Selected',
            borderColor: 'hover:border-emerald-400/40'
          }
        ].map((metric, idx) => (
          <Link
            key={idx}
            to={metric.link}
            className={cn(
              'p-4 rounded-2xl bg-[#090F1E] border border-white/[0.08] transition-all duration-200 hover:-translate-y-0.5 group block shadow-md',
              metric.borderColor
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {metric.title}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform">
                {metric.icon}
              </div>
            </div>

            <div className="text-2xl font-black text-white tracking-tight">
              {metric.value}
            </div>

            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] text-slate-400 truncate">{metric.sub}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. CLEAR QUICK ACTIONS BAR (SECTION 7)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-[#080D1A] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Quick Actions
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Post Job Action */}
          {isVerified ? (
            <Link to="/recruiter/jobs/new">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Post a New Job
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5 text-slate-400" />}
              onClick={() => setShowVerificationModal(true)}
              className="opacity-75 border-amber-500/30 text-amber-300"
            >
              Post Job (Verification Required)
            </Button>
          )}

          <Link to="/recruiter/jobs">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Briefcase className="w-3.5 h-3.5 text-indigo-400" />}
            >
              My Jobs ({jobs.length})
            </Button>
          </Link>

          <Link to="/recruiter/applicants">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Users className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Applicant Pipeline ({applicants.length})
            </Button>
          </Link>

          <Link to="/recruiter/company">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Building className="w-3.5 h-3.5 text-teal-400" />}
            >
              Company Profile
            </Button>
          </Link>

          <Link to="/recruiter/verification">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            >
              Verification Center
            </Button>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. RECRUITMENT PIPELINE OVERVIEW FUNNEL (SECTION 8)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Application Pipeline Funnel
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Aggregating {applicants.length} total applications across all requisitions</span>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No applications received yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When candidates apply to your approved published job openings, they will flow through this funnel automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                stage: '1. Applied',
                count: pipelineCounts.applied,
                statusParam: 'Applied',
                color: 'border-blue-500/30 text-blue-300'
              },
              {
                stage: '2. Under Review',
                count: pipelineCounts.underReview,
                statusParam: 'Under+Review',
                color: 'border-cyan-500/30 text-cyan-300'
              },
              {
                stage: '3. Shortlisted',
                count: pipelineCounts.shortlisted,
                statusParam: 'Shortlisted',
                color: 'border-violet-500/30 text-violet-300'
              },
              {
                stage: '4. Interview',
                count: pipelineCounts.interview,
                statusParam: 'Interview',
                color: 'border-amber-500/30 text-amber-300'
              },
              {
                stage: '5. Selected',
                count: pipelineCounts.hired,
                statusParam: 'Selected',
                color: 'border-emerald-500/30 text-emerald-300'
              },
              {
                stage: '6. Rejected',
                count: pipelineCounts.rejected,
                statusParam: 'Rejected',
                color: 'border-rose-500/30 text-rose-300'
              }
            ].map((step, sIdx) => (
              <Link
                key={sIdx}
                to={`/recruiter/applicants?status=${step.statusParam}`}
                className={cn(
                  'p-3.5 rounded-2xl bg-white/[0.02] border hover:bg-white/[0.05] transition-all group block shadow-sm',
                  step.color
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {step.stage}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-xl font-black text-white">{step.count}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {applicants.length > 0 ? `${Math.round((step.count / applicants.length) * 100)}% of pipeline` : '0%'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          6. CANDIDATES REQUIRING REVIEW & UPCOMING INTERVIEWS (SECTION 11)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel A: Candidates Requiring Review */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Candidates Requiring Review ({candidatesRequiringReview.length})
              </h2>
            </div>
            <Link
              to="/recruiter/applicants?status=Applied"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All
            </Link>
          </div>

          {candidatesRequiringReview.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">All Candidates Evaluated</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No applicants are currently waiting in the initial review queue.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidatesRequiringReview.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-[#080D1A] border border-white/[0.06] hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md">
                      {app.candidateName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{app.candidateName}</p>
                        <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-400/25">
                          {app.atsScore || 85}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingProfile(app)}
                      className="text-xs py-1 px-2.5 h-auto"
                    >
                      <Eye className="w-3 h-3 text-cyan-400 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                      className="text-xs py-1 px-2.5 h-auto border-violet-400/30 text-violet-300 hover:bg-violet-500/20"
                    >
                      Shortlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel B: Upcoming Interviews */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Ready for Interview ({upcomingInterviews.length})
              </h2>
            </div>
            <Link
              to="/recruiter/applicants?status=Interview"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Manage Pipeline
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No Interviews In Progress</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Promote qualified candidates to &ldquo;Interview&rdquo; to schedule screening loops.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-[#080D1A] border border-white/[0.06] hover:border-teal-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md">
                      {app.candidateName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{app.candidateName}</p>
                        <span className="text-[9px] font-black text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-400/25">
                          Loop Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingProfile(app)}
                      className="text-xs py-1 px-2.5 h-auto"
                    >
                      <Eye className="w-3 h-3 text-cyan-400 mr-1" />
                      Dossier
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(app.id, 'Selected')}
                      className="text-xs py-1 px-2.5 h-auto border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          7. MY JOB POSTINGS OVERVIEW (SECTION 10)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              My Job Postings ({jobs.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Manage All Jobs
            </Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="py-10 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Job Requisitions Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create your first job requisition to attract verified candidates and activate automated semantic ATS scoring.
            </p>
            {isVerified ? (
              <Link to="/recruiter/jobs/new">
                <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Create First Opening
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVerificationModal(true)}
              >
                Complete Verification to Post Jobs
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => {
              const statusLower = (job.status || 'active').toLowerCase();
              const isJobActive = statusLower === 'active';
              const isJobPending = statusLower === 'pending_approval' || statusLower === 'draft';
              const isJobRejected = statusLower === 'rejected';

              return (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl bg-[#080D1A] border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between group shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {job.department && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/25">
                            {job.department}
                          </span>
                        )}
                        <h3 className="text-sm font-black text-white mt-1.5 group-hover:text-cyan-300 transition-colors">
                          {job.title}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      {isJobActive ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full shrink-0">
                          Published
                        </span>
                      ) : isJobPending ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full shrink-0">
                          Awaiting Moderation
                        </span>
                      ) : isJobRejected ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-400/30 px-2 py-0.5 rounded-full shrink-0">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-500/15 border border-slate-400/30 px-2 py-0.5 rounded-full shrink-0">
                          {job.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {job.applicantCount || 0} applicants
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link to={`/recruiter/jobs/${job.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs py-1 px-2.5 h-auto">
                          <Edit2 className="w-3 h-3 text-indigo-300 mr-1" />
                          Edit
                        </Button>
                      </Link>

                      <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs py-1 px-2.5 h-auto text-cyan-300 border-cyan-400/30">
                          Applicants
                        </Button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setJobToDelete(job)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          8. RECENT RECRUITER ACTIVITY FEED (SECTION 9)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#090F1E] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Recent Recruiter Activity & Governance Notifications
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {notifications.length} events logged
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="py-6 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
            <Activity className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-white">No Recent Activity</p>
            <p className="text-[11px] text-slate-400">
              Audit events such as candidate applications, job moderation approvals, and verification updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-[#080D1A] border border-white/[0.05] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{n.title}</p>
                    <p className="text-slate-400 text-[11px] truncate">{n.message}</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 shrink-0">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          CANDIDATE DOSSIER MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {viewingProfile && (
        <Modal
          isOpen={Boolean(viewingProfile)}
          onClose={() => setViewingProfile(null)}
          title="Candidate Profile & ATS Dossier"
          size="4xl"
        >
          <div className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
            {/* Header */}
            <div className="p-5 rounded-2xl bg-[#090F1E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg">
                  {viewingProfile.candidateName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {viewingProfile.candidateName}
                  </h2>
                  <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                    {viewingProfile.candidateTitle || 'Candidate Profile'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {viewingProfile.candidateLocation || 'Remote'}
                    </span>
                    <span>•</span>
                    <span>{viewingProfile.experienceYears || 5} Years Exp</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 px-4 py-2.5 rounded-2xl bg-[#060A14] border border-cyan-400/30">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  ATS Match Score
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  {viewingProfile.atsScore || 88}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </p>
              </div>
            </div>

            {/* Position Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                <p className="text-xs text-white font-medium truncate mt-0.5">{viewingProfile.candidateEmail}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Applied Requisition</p>
                <p className="text-xs text-white font-medium truncate mt-0.5">{viewingProfile.jobTitle}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Pipeline Stage</p>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5', getStatusBadgeStyle(viewingProfile.status))}>
                  {viewingProfile.status}
                </span>
              </div>
            </div>

            {/* Verified Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Extracted Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(viewingProfile.skills || ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS']).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/25 text-cyan-200 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Move Stage:</span>
                {(['Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as ApplicationStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(viewingProfile.id, st)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      viewingProfile.status === st
                        ? 'bg-cyan-500 text-black font-black'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
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
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white">
              Administrator Verification Required
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              To protect candidates from fraudulent listings, only recruiters with verified corporate affiliation can publish job requisitions.
            </p>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left text-xs space-y-1.5">
              <p className="font-bold text-slate-200">Current Status: <span className="text-amber-400 uppercase">{verificationStatus}</span></p>
              <p className="text-slate-400">
                Submit your official corporate email domain, business registration details, or representative authorization in the Verification Center.
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
                >
                  Open Verification Center
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleConfirmDeleteCandidate}
        title="Delete Candidate Application"
        message={`Are you sure you want to remove ${candidateToDelete?.candidateName || 'this candidate'} from applications? This action cannot be undone.`}
        confirmText="Delete Candidate"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDeleteJob}
        title="Delete Job Requisition"
        message={`Are you sure you want to delete requisition "${jobToDelete?.title || ''}"? This will permanently remove the requisition.`}
        confirmText="Delete Requisition"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RecruiterDashboard;
