import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Building,
  DollarSign,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Archive,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  User,
  Calendar,
  Sparkles,
  Check,
  X,
  FileText
} from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import { useToast } from '../../context/ToastContext';
import { Job, JobStatus, CandidateReport } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatFullDate } from '../../utils/formatters';

export const JobModerationPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'active' | 'rejected' | 'archived' | 'reports'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Safety Reports state
  const [reports, setReports] = useState<CandidateReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CandidateReport | null>(null);
  const [reportStatus, setReportStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [reportAction, setReportAction] = useState<string>('NONE');
  const [reportDecision, setReportDecision] = useState<string>('Moderation review completed');
  const [reportAdminNotes, setReportAdminNotes] = useState<string>('');
  const [isReviewingReport, setIsReviewingReport] = useState<boolean>(false);

  // Modals state
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [rejectingJob, setRejectingJob] = useState<Job | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Always fetch reports count
      const [jobsData, reportsData] = await Promise.all([
        adminApi.getJobsForModeration(selectedTab === 'pending' ? 'pending_approval' : selectedTab === 'all' || selectedTab === 'reports' ? undefined : selectedTab),
        adminApi.getCandidateReports().catch(() => [])
      ]);
      setJobs(jobsData);
      setReports(reportsData);
    } catch (err: any) {
      console.error('Failed to load moderation data', err);
      showToast({ type: 'error', title: 'Error', message: 'Failed to load moderation queue.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewReport = async () => {
    if (!selectedReport) return;
    try {
      setIsReviewingReport(true);
      const updated = await adminApi.reviewCandidateReport(selectedReport.id, {
        status: reportStatus,
        actionTaken: reportAction,
        adminDecision: reportDecision,
        adminNotes: reportAdminNotes
      });
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast({
        type: 'success',
        title: 'Report Review Recorded',
        message: `Candidate report #${selectedReport.id.substring(0, 8)} updated with action: ${reportAction}.`
      });
      setSelectedReport(null);
      // Reload jobs in case action unpublished a job or changed status
      loadData();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Review Failed',
        message: err?.message || 'Could not save candidate report review.'
      });
    } finally {
      setIsReviewingReport(false);
    }
  };

  const handleApprove = async (job: Job) => {
    try {
      setIsProcessing(job.id);
      const updated = await adminApi.approveJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      showToast({
        type: 'success',
        title: 'Requisition Approved 🎉',
        message: `"${job.title}" has been approved and published to candidate discovery.`
      });
      if (selectedJobForDetails?.id === job.id) {
        setSelectedJobForDetails(updated);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Approval Failed',
        message: err?.message || 'Could not approve job requisition.'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleOpenReject = (job: Job) => {
    setRejectingJob(job);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingJob) return;
    if (!rejectionReason.trim()) {
      showToast({ type: 'warning', title: 'Reason Required', message: 'Please provide feedback explaining the required changes.' });
      return;
    }

    try {
      setIsProcessing(rejectingJob.id);
      const updated = await adminApi.rejectJob(rejectingJob.id, rejectionReason.trim());
      setJobs((prev) => prev.map((j) => (j.id === rejectingJob.id ? updated : j)));
      showToast({
        type: 'info',
        title: 'Requisition Rejected ⚠️',
        message: `Feedback sent to recruiter for "${rejectingJob.title}".`
      });
      setRejectingJob(null);
      if (selectedJobForDetails?.id === rejectingJob.id) {
        setSelectedJobForDetails(updated);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Rejection Failed',
        message: err?.message || 'Could not submit rejection feedback.'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleArchive = async (job: Job) => {
    try {
      setIsProcessing(job.id);
      const updated = await adminApi.archiveJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      showToast({
        type: 'info',
        title: 'Requisition Unpublished',
        message: `"${job.title}" has been archived from public candidate discovery.`
      });
      if (selectedJobForDetails?.id === job.id) {
        setSelectedJobForDetails(updated);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Archive Failed',
        message: err?.message || 'Could not archive job requisition.'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingJob) return;

    try {
      setIsProcessing(deletingJob.id);
      await adminApi.deleteJob(deletingJob.id);
      setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
      showToast({
        type: 'success',
        title: 'Requisition Deleted',
        message: `"${deletingJob.title}" was permanently removed from PostgreSQL.`
      });
      setDeletingJob(null);
      if (selectedJobForDetails?.id === deletingJob.id) {
        setSelectedJobForDetails(null);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: err?.message || 'Could not delete requisition. Check if candidate applications exist.'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Metrics for tabs
  const pendingCount = jobs.filter((j) => j.status === 'pending_approval').length;
  const activeCount = jobs.filter((j) => j.status === 'active').length;
  const rejectedCount = jobs.filter((j) => j.status === 'rejected').length;
  const archivedCount = jobs.filter((j) => j.status === 'archived').length;

  const filtered = jobs.filter((j) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      j.title.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term) ||
      (j.recruiterName && j.recruiterName.toLowerCase().includes(term)) ||
      (j.location && j.location.toLowerCase().includes(term)) ||
      (j.skills && j.skills.some((s) => s.toLowerCase().includes(term)));

    if (!matchesSearch) return false;

    if (selectedTab === 'pending') return j.status === 'pending_approval';
    if (selectedTab === 'active') return j.status === 'active';
    if (selectedTab === 'rejected') return j.status === 'rejected';
    if (selectedTab === 'archived') return j.status === 'archived';
    return true;
  });

  const quickReasons = [
    'Compensation or salary band requires clear specification for transparency.',
    'Job description requires more detailed day-to-day responsibilities and deliverables.',
    'Technical requirements do not match the specified experience level.',
    'Organization identity or verified corporate email requires clarification.'
  ];

  return (
    <div className="space-y-7">
      {/* ── Header & Governance Title ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recruiter Governance & Requisition Moderation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Job Requisition Moderation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review, verify recruiter credentials, approve for candidate discovery, or return with structured revision feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Status Metric Tabs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'All Jobs', count: jobs.length, color: 'text-slate-300', bg: 'bg-slate-800/40' },
          { key: 'pending', label: 'Pending Approval', count: pendingCount, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'active', label: 'Published / Active', count: activeCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { key: 'rejected', label: 'Changes Required', count: rejectedCount, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { key: 'archived', label: 'Archived', count: archivedCount, color: 'text-slate-400', bg: 'bg-slate-500/10' },
          { key: 'reports', label: 'Candidate Reports', count: reports.filter((r) => r.status === 'PENDING').length, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedTab === tab.key
                ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tab.label}</span>
              <span className={`text-base font-black ${tab.color}`}>{tab.count}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <Card glass className="p-4">
        <Input
          placeholder={
            selectedTab === 'reports'
              ? 'Filter reports by candidate, job, recruiter, category, or evidence description...'
              : 'Filter requisitions by title, employer name, recruiter, location, or skills...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* ── Main Content Area (Reports vs Jobs) ────────────────────────────── */}
      {selectedTab === 'reports' ? (
        isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : (() => {
          const filteredReports = reports.filter((r) => {
            const term = searchTerm.toLowerCase();
            return (
              (r.jobTitle && r.jobTitle.toLowerCase().includes(term)) ||
              (r.category && r.category.toLowerCase().includes(term)) ||
              (r.reporterName && r.reporterName.toLowerCase().includes(term)) ||
              (r.reporterEmail && r.reporterEmail.toLowerCase().includes(term)) ||
              (r.recruiterName && r.recruiterName.toLowerCase().includes(term)) ||
              (r.description && r.description.toLowerCase().includes(term))
            );
          });

          if (filteredReports.length === 0) {
            return (
              <Card glass className="p-12 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Candidate Reports</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchTerm
                    ? `No candidate reports match "${searchTerm}".`
                    : 'All job postings and recruiters have clean trust records. No pending safety flags.'}
                </p>
              </Card>
            );
          }

          return (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  glass
                  className={`p-6 border transition-all ${
                    report.status === 'PENDING'
                      ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/[0.04] to-transparent'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300">
                          {report.category}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            report.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : report.status === 'RESOLVED'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                          }`}
                        >
                          {report.status}
                        </span>
                        {report.actionTaken && report.actionTaken !== 'NONE' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Action: {report.actionTaken}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 ml-auto">
                          Submitted {formatFullDate(report.createdAt)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white">
                          Target Job: <span className="text-indigo-300 font-semibold">{report.jobTitle}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Recruiter: <strong className="text-slate-200">{report.recruiterName || 'Unknown Recruiter'}</strong> • 
                          Reporter: <span className="text-slate-300">{report.reporterName}</span> (<code className="text-slate-400 text-[11px]">{report.reporterEmail}</code>)
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Candidate Statement & Evidence:</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{report.description}</p>
                      </div>

                      {report.adminDecision && (
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                          <span className="font-bold text-indigo-200">Admin Decision: </span>
                          <span>{report.adminDecision}</span>
                          {report.adminNotes && (
                            <p className="text-[11px] text-slate-400 mt-1">Notes: {report.adminNotes}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center lg:flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<ShieldAlert className="w-4 h-4 text-rose-300" />}
                        onClick={() => {
                          setSelectedReport(report);
                          setReportStatus(report.status === 'PENDING' || report.status === 'IN_REVIEW' ? 'RESOLVED' : report.status as any);
                          setReportAction(report.actionTaken || 'NONE');
                          setReportDecision(report.adminDecision || 'Moderation investigation concluded.');
                          setReportAdminNotes(report.adminNotes || '');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold whitespace-nowrap"
                      >
                        {report.status === 'PENDING' ? 'Take Action / Moderate' : 'Update Review'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          );
        })()
      ) : (
        /* ── Job Requisition Cards ─────────────────────────────────────────── */
        isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : filtered.length === 0 ? (
          <Card glass className="p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No job requisitions found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchTerm
                ? `No job requisitions match "${searchTerm}" in the ${selectedTab} view.`
                : `There are currently no job requisitions in the ${selectedTab} moderation queue.`}
            </p>
          </Card>
        ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const isPending = job.status === 'pending_approval';
            const isActive = job.status === 'active';
            const isRejected = job.status === 'rejected';
            const isArchived = job.status === 'archived';

            return (
              <Card
                key={job.id}
                glass
                className={`p-6 border transition-all ${
                  isPending
                    ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/[0.03] to-transparent'
                    : isRejected
                    ? 'border-rose-500/20 bg-gradient-to-r from-rose-500/[0.02] to-transparent'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Column: Job & Recruiter Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'}
                      alt={job.company}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 shrink-0 bg-slate-900 shadow-md"
                    />
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer" onClick={() => setSelectedJobForDetails(job)}>
                          {job.title}
                        </h3>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <Clock className="w-3 h-3 animate-pulse" /> Pending Moderation
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                            <Check className="w-3 h-3" /> Live & Published
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                            <X className="w-3 h-3" /> Changes Required
                          </span>
                        )}
                        {isArchived && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/15 border border-slate-400/30 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                            <Archive className="w-3 h-3" /> Archived
                          </span>
                        )}
                      </div>

                      {/* Employer & Recruiter Attribution */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="text-indigo-400 font-bold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {job.company}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{job.location} ({job.type})</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300 font-semibold">{job.experienceLevel}</span>

                        {job.recruiterName && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="inline-flex items-center gap-1.5 text-slate-300">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{job.recruiterName}</span>
                              {job.verifiedRecruiter ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" /> Verified Recruiter
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  <ShieldAlert className="w-3 h-3" /> Verification Pending
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Skills Tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px]"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-[10px] text-slate-500">+{job.skills.length - 5} more</span>
                          )}
                        </div>
                      )}

                      {/* Meta Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="text-emerald-400 font-bold font-mono">
                          {formatCurrency(job.salary?.min || 0)} - {formatCurrency(job.salary?.max || 0)}
                        </span>
                        <span>•</span>
                        <span>Posted {job.postedDate ? formatFullDate(job.postedDate) : 'Recently'}</span>
                        {job.approvedBy && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              Approved by <strong className="text-white">{job.approvedBy}</strong>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rejection Feedback Banner */}
                      {isRejected && job.rejectionReason && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Administrator Rejection Feedback:</span>
                          </div>
                          <p className="text-slate-300 pl-5">{job.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Moderation Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-stretch justify-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 min-w-[170px]">
                    {/* View Details */}
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedJobForDetails(job)}
                    >
                      View Details
                    </Button>

                    {/* Pending Actions */}
                    {isPending && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isProcessing === job.id}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handleApprove(job)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Approve & Publish
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenReject(job)}
                        >
                          Request Changes
                        </Button>
                      </>
                    )}

                    {/* Active Actions */}
                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={isProcessing === job.id}
                        leftIcon={<Archive className="w-3.5 h-3.5 text-amber-400" />}
                        onClick={() => handleArchive(job)}
                        className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      >
                        Unpublish / Archive
                      </Button>
                    )}

                    {/* Rejected Actions */}
                    {isRejected && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isProcessing === job.id}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          onClick={() => handleApprove(job)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                        >
                          Re-approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => setDeletingJob(job)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    {/* Archived Actions */}
                    {isArchived && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isProcessing === job.id}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => handleApprove(job)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Restore & Publish
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => setDeletingJob(job)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ))}

      {/* ── REJECTION & FEEDBACK MODAL ─────────────────────────────────────── */}
      {rejectingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Requisition Moderation Feedback
                </span>
                <h3 className="text-lg font-bold text-white">Return for Changes: {rejectingJob.title}</h3>
                <p className="text-xs text-slate-400">
                  Provide specific reasons and instructions so the recruiter can correct and resubmit this requisition.
                </p>
              </div>
              <button
                onClick={() => setRejectingJob(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reason Suggestions */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Feedback Templates:
              </label>
              <div className="space-y-1.5">
                {quickReasons.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(qr)}
                    className="w-full text-left text-xs p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-colors"
                  >
                    • {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Reason Textarea */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Detailed Rejection Reason & Instructions: *
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain clearly what requirements, compensation, or descriptions need correction..."
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRejectingJob(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessing === rejectingJob.id}
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Rejection & Send Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── JOB DETAILS MODAL ──────────────────────────────────────────────── */}
      {selectedJobForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedJobForDetails.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedJobForDetails.company}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedJobForDetails.title}</h3>
                  <p className="text-xs text-indigo-400 font-bold">{selectedJobForDetails.company} • {selectedJobForDetails.location}</p>
                  <p className="text-[11px] text-slate-400 mt-1">ID: <code className="text-slate-300 font-mono">{selectedJobForDetails.id}</code></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recruiter Attribution Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Submitted By Recruiter</span>
                <p className="text-xs font-bold text-white">{selectedJobForDetails.recruiterName || 'Enterprise Partner'}</p>
                <p className="text-[11px] text-slate-400">{selectedJobForDetails.recruiterEmail || 'recruiter@enterprise.com'}</p>
              </div>
              <div>
                {selectedJobForDetails.verifiedRecruiter ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl">
                    <ShieldCheck className="w-4 h-4" /> Verified Partner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl">
                    <ShieldAlert className="w-4 h-4" /> Unverified Recruiter
                  </span>
                )}
              </div>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Compensation</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {formatCurrency(selectedJobForDetails.salary?.min || 0)} - {formatCurrency(selectedJobForDetails.salary?.max || 0)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Employment</span>
                <span className="text-xs font-bold text-slate-200">{selectedJobForDetails.type}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Experience</span>
                <span className="text-xs font-bold text-slate-200">{selectedJobForDetails.experienceLevel}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Application Deadline</span>
                <span className="text-xs font-bold text-slate-200">{selectedJobForDetails.deadline || 'None'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                {selectedJobForDetails.description}
              </p>
            </div>

            {/* Responsibilities */}
            {selectedJobForDetails.responsibilities && selectedJobForDetails.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Responsibilities</h4>
                <ul className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  {selectedJobForDetails.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {selectedJobForDetails.requirements && selectedJobForDetails.requirements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirements & Qualifications</h4>
                <ul className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  {selectedJobForDetails.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="text-xs text-slate-400">
                Current Status: <span className="font-bold text-white uppercase">{selectedJobForDetails.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedJobForDetails.status === 'pending_approval' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        handleOpenReject(selectedJobForDetails);
                      }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(selectedJobForDetails)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Approve & Publish
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedJobForDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CANDIDATE REPORT MODERATION MODAL ────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  Candidate Trust & Safety Moderation
                </div>
                <h3 className="text-lg font-bold text-white">Moderate Candidate Safety Report</h3>
                <p className="text-xs text-slate-400">
                  Report ID: <code className="text-slate-300 font-mono">{selectedReport.id}</code>
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Job & Reporter Metadata */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Requisition:</span>
                <span className="font-bold text-indigo-300">{selectedReport.jobTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Employer / Recruiter:</span>
                <span className="font-semibold text-slate-200">{selectedReport.recruiterName || 'Unknown Recruiter'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reporter:</span>
                <span className="text-slate-200">{selectedReport.reporterName} ({selectedReport.reporterEmail})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Violation Category:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase text-[10px]">
                  {selectedReport.category}
                </span>
              </div>
            </div>

            {/* Candidate Statement */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Candidate Statement & Evidence:
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                {selectedReport.description}
              </div>
            </div>

            {/* Review Status & Enforcement Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Investigation Status:
                </label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="RESOLVED">RESOLVED (Action applied / Investigation complete)</option>
                  <option value="DISMISSED">DISMISSED (Unsubstantiated / False alarm)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enforcement Action:
                </label>
                <select
                  value={reportAction}
                  onChange={(e) => setReportAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="NONE">NONE (No restrictions applied)</option>
                  <option value="JOB_UNPUBLISHED">JOB_UNPUBLISHED (Archive & Unpublish Requisition)</option>
                  <option value="REOPEN_VERIFICATION">REOPEN_VERIFICATION (Reopen Recruiter Verification for Audit)</option>
                  <option value="SUSPEND_RECRUITER">SUSPEND_RECRUITER (Immediately Suspend Recruiter Account)</option>
                </select>
              </div>
            </div>

            {/* Admin Decision Summary */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Admin Decision Summary:
              </label>
              <input
                type="text"
                value={reportDecision}
                onChange={(e) => setReportDecision(e.target.value)}
                placeholder="e.g. Evidence verified; job archived for policy non-compliance."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Admin Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Internal Audit Documentation & Notes:
              </label>
              <textarea
                rows={3}
                value={reportAdminNotes}
                onChange={(e) => setReportAdminNotes(e.target.value)}
                placeholder="Enter internal reasoning for platform governance and audit log retention..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isReviewingReport}
                onClick={handleReviewReport}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save & Apply Governance Action
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMANENT DELETE CONFIRMATION MODAL ─────────────────────────────── */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Permanently Delete Requisition?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This operation will permanently erase <strong className="text-white">"{deletingJob.title}"</strong> from PostgreSQL.
                If candidate applications have already been submitted, the system will prevent deletion to preserve candidate history.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingJob(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessing === deletingJob.id}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobModerationPage;
