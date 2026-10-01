import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, JobStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatFullDate, getStatusBadgeStyle } from '../../utils/formatters';

export const JobManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleToggleStatus = async (job: Job) => {
    const newStatus: JobStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const updated = await jobService.toggleJobStatus(job.id, newStatus);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      showToast({
        type: 'info',
        title: `Job ${newStatus === 'active' ? 'Activated' : 'Closed'}`,
        message: `${job.title} is now ${newStatus}.`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update job status.' });
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
            </select>
          </div>
        </div>
      </Card>

      {/* Job Requisitions Table / Cards */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card glass className="p-12 text-center text-xs text-slate-400 space-y-3">
          <Briefcase className="w-10 h-10 text-indigo-400 mx-auto" />
          <p className="text-sm font-bold text-white">No job postings found</p>
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="sm">Create First Job Posting</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const badge = getStatusBadgeStyle(job.status);
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
                      <span>{formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} / yr</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400">{job.applicantCount} Applicants</span>
                      <span>•</span>
                      <span>Deadline: {formatFullDate(job.deadline)}</span>
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

                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`p-2 rounded-xl border transition-colors ${
                        job.status === 'active'
                          ? 'bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                      title={job.status === 'active' ? 'Deactivate Requisition' : 'Activate Requisition'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteJobId(job.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Requisition"
        message="Are you sure you want to delete this job posting and its associated application queue? This action cannot be undone."
        confirmText="Delete Requisition"
      />
    </div>
  );
};
