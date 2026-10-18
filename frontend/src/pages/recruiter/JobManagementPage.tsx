import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Users,
  Eye,
  Trash2,
  Power,
  Edit2,
  Calendar,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { actionFeedbackService } from '../../services/feedback/actionFeedbackService';
import { useToast } from '../../context/ToastContext';
import { Job, JobStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatSalaryRange, formatFullDate, getStatusBadgeStyle } from '../../utils/formatters';
import { JobPublishSuccessModal } from '../../components/recruiter/JobPublishSuccessModal';

interface StatusConfirmState {
  job: Job;
  targetStatus: 'active' | 'closed';
}

export const JobManagementPage: React.FC = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Status toggle confirmation and loading states
  const [statusConfirm, setStatusConfirm] = useState<StatusConfirmState | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});

  // Success modal state from navigation state
  const [successJob, setSuccessJob] = useState<Job | null>(() => {
    return (location.state as any)?.publishedJob || null;
  });

  useEffect(() => {
    if ((location.state as any)?.publishedJob) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Deletion confirm
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await recruiterService.getPostedJobs();
      const isDefaultJob = (title?: string) => {
        const t = (title || '').trim().toLowerCase();
        return (
          t === 'senior full stack engineer (java + react)' ||
          t === 'lead ai/ml platform architect' ||
          t === 'senior ai platform engineer' ||
          t === 'senior full stack software engineer' ||
          t === 'backend java / distributed systems engineer' ||
          t === 'ai / ml research scientist' ||
          t === 'devops & cloud infrastructure lead'
        );
      };
      setJobs((data || []).filter((j) => !isDefaultJob(j.title)));
    } catch (err) {
      console.error('Failed to load posted jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isDeadlineExpired = (deadline?: string): boolean => {
    if (!deadline) return false;
    try {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) return false;
      // Deadline is valid until end of the given date
      d.setHours(23, 59, 59, 999);
      return new Date().getTime() > d.getTime();
    } catch {
      return false;
    }
  };

  const handleInitiateToggle = (job: Job) => {
    if (job.status === 'pending_approval') {
      showToast({
        type: 'warning',
        title: 'Pending Approval',
        message: 'This job is awaiting administrator approval. It cannot be activated manually.'
      });
      return;
    }
    if (job.status === 'rejected') {
      showToast({
        type: 'error',
        title: 'Job Rejected',
        message: 'This job was rejected during moderation and cannot be activated.'
      });
      return;
    }
    const targetStatus: 'active' | 'closed' = job.status === 'active' ? 'closed' : 'active';
    setStatusConfirm({ job, targetStatus });
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirm) return;
    const { job, targetStatus } = statusConfirm;
    try {
      setIsUpdatingStatus((prev) => ({ ...prev, [job.id]: true }));
      const updated = await jobService.toggleJobStatus(job.id, targetStatus);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      setStatusConfirm(null);
      showToast({
        type: 'success',
        title: targetStatus === 'closed' ? 'Job Closed' : 'Job Reopened',
        message:
          targetStatus === 'closed'
            ? 'Job closed successfully. New applications are now disabled.'
            : 'Job reopened successfully. Applications are now enabled.'
      });

      if (targetStatus === 'closed') {
        actionFeedbackService.jobClosed({ id: job.id, title: job.title });
      } else {
        actionFeedbackService.jobReopened({ id: job.id, title: job.title });
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update job status.';
      showToast({
        type: 'error',
        title: 'Action Denied',
        message: errorMsg
      });
      // Do not update frontend optimistically
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    try {
      await jobService.deleteJob(deleteJobId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteJobId));
      setDeleteJobId(null);
      showToast({
        type: 'info',
        title: 'Job Deleted',
        message: 'Requisition removed from the platform.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not delete job.' });
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'All' && job.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Job Requisition Management</h1>
          <p className="text-xs text-slate-400">
            Create, monitor, and manage open positions and applicant pools.
          </p>
        </div>

        <Link to="/recruiter/jobs/new">
          <Button variant="glow" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post New Job Opening
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card glass className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search requisitions by title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700/80 p-2"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed Only</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="draft">Draft Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs Listing */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card glass className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Job Requisitions Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'All'
              ? 'No requisitions match your filter criteria.'
              : 'You have not posted any active job requisitions yet. Launch your first posting today.'}
          </p>
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Requisition
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const badge = getStatusBadgeStyle(job.status);
            const expired = isDeadlineExpired(job.deadline);
            const isUpdating = !!isUpdatingStatus[job.id];

            return (
              <Card key={job.id} glass hoverEffect className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">{job.title}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                        {job.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">({job.type})</span>
                    </div>

                    <p className="text-xs text-indigo-400 font-semibold">
                      {job.department} • <span className="text-slate-300 font-normal">{job.location}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                      <span className="font-medium text-emerald-400/90">{formatSalaryRange(job.salary?.min, job.salary?.max, job.salary?.currency || 'INR', job.salary?.period)}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400">{job.applicantCount} Applicants</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deadline: {formatFullDate(job.deadline)}</span>
                        {expired && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">
                            <Clock className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {expired && (
                          <Link
                            to={`/recruiter/jobs/${job.id}`}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1"
                            title="Update application deadline to reopen requisition"
                          >
                            Update Deadline
                          </Link>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                      <Button variant="primary" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                        Applicants ({job.applicantCount})
                      </Button>
                    </Link>

                    <Link to={`/recruiter/jobs/${job.id}`}>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 hover:text-white hover:bg-indigo-500/25 border border-indigo-400/30 text-xs font-bold transition-all cursor-pointer"
                        title="Edit this job posting"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </Link>

                    {/* Compact Power Button with Confirmation Dialog */}
                    <button
                      type="button"
                      onClick={() => handleInitiateToggle(job)}
                      disabled={isUpdating}
                      className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                        job.status === 'active'
                          ? 'bg-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 border-slate-700'
                          : job.status === 'closed'
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        job.status === 'active'
                          ? 'Close job'
                          : job.status === 'closed'
                          ? 'Reopen job'
                          : job.status === 'pending_approval'
                          ? 'Awaiting administrator approval'
                          : 'Job status cannot be toggled'
                      }
                      aria-label={
                        job.status === 'active'
                          ? 'Close job'
                          : job.status === 'closed'
                          ? 'Reopen job'
                          : 'Job status locked'
                      }
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteJobId(job.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Requisition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        isOpen={!!statusConfirm}
        onClose={() => {
          if (!statusConfirm || !isUpdatingStatus[statusConfirm.job.id]) {
            setStatusConfirm(null);
          }
        }}
        onConfirm={handleConfirmStatusToggle}
        title={statusConfirm?.targetStatus === 'closed' ? 'Close this job?' : 'Reopen this job?'}
        message={
          statusConfirm?.targetStatus === 'closed'
            ? `Closing "${statusConfirm.job.title}" will stop new applications. Existing applications and candidate records will remain available in your recruitment pipeline.`
            : `Reopening "${statusConfirm?.job.title}" will allow new applications if the job is approved, eligible for publication, and its application deadline has not passed.`
        }
        confirmText={statusConfirm?.targetStatus === 'closed' ? 'Close Job' : 'Reopen Job'}
        cancelText="Cancel"
        variant={statusConfirm?.targetStatus === 'closed' ? 'danger' : 'primary'}
        isLoading={statusConfirm ? !!isUpdatingStatus[statusConfirm.job.id] : false}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Requisition"
        message="Are you sure you want to delete this job posting and its associated application queue? This action cannot be undone."
        confirmText="Delete Requisition"
      />

      {/* Cinematic Job Publish Success Modal */}
      <JobPublishSuccessModal
        isOpen={!!successJob}
        job={successJob}
        onClose={() => setSuccessJob(null)}
        onPostAnotherJob={() => {
          setSuccessJob(null);
        }}
      />
    </div>
  );
};
