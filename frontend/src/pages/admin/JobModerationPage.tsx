import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Building,
  DollarSign
} from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatFullDate } from '../../utils/formatters';

export const JobModerationPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getJobsForModeration();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load moderation jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (jobId: string, action: 'approve' | 'reject' | 'remove') => {
    try {
      await adminService.moderateJob(jobId, action);
      if (action === 'remove' || action === 'reject') {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
      showToast({
        type: action === 'approve' ? 'success' : 'info',
        title: `Job ${action === 'approve' ? 'Approved' : 'Removed'}`,
        message: `Moderation action performed.`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to perform moderation action.' });
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Job Requisition Moderation</h1>
        <p className="text-xs text-slate-400">
          Review, approve, and remove job requisitions published across the platform.
        </p>
      </div>

      <Card glass className="p-4">
        <Input
          placeholder="Filter requisitions by title or employer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : filtered.length === 0 ? (
        <Card glass className="p-12 text-center text-xs text-slate-400">
          No requisitions in moderation queue.
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Card key={job.id} glass className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{job.company} • {job.location}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}</span>
                      <span>•</span>
                      <span>Posted {formatFullDate(job.postedDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => handleModerate(job.id, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleModerate(job.id, 'remove')}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
