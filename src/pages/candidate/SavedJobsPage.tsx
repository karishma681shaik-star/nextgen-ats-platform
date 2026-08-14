import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Briefcase, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    await candidateService.toggleSaveJob(jobId);
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    showToast({
      type: 'info',
      title: 'Job Removed',
      message: 'Position removed from your saved list.'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved & Bookmarked Jobs</h1>
        <p className="text-xs text-slate-400">
          Positions you've bookmarked for later review and application submission.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : savedJobs.length === 0 ? (
        <Card glass className="p-12 text-center text-xs text-slate-400 space-y-3">
          <Bookmark className="w-10 h-10 text-indigo-400 mx-auto" />
          <p className="text-sm font-bold text-white">No saved jobs yet</p>
          <p>Explore recommended positions and bookmark jobs that match your career goals.</p>
          <Link to="/candidate/jobs">
            <Button variant="primary" size="sm">
              Discover Jobs
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <Card key={job.id} glass hoverEffect className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/candidate/jobs/${job.id}`} className="text-base font-bold text-white hover:text-indigo-400">
                        {job.title}
                      </Link>
                      {job.matchScore && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{job.company} • <span className="text-slate-400 font-normal">{job.location}</span></p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{job.type}</span>
                      <span>•</span>
                      <span className="text-slate-200 font-medium">{formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link to={`/candidate/jobs/${job.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View & Apply
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
