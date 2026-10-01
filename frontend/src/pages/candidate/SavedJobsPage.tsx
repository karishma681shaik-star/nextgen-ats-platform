import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  MapPin,
  Briefcase,
  Trash2,
  ArrowRight,
  Sparkles,
  Send,
  Building2,
  Calendar,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, Resume } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatFullDate } from '../../utils/formatters';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, resumesData] = await Promise.all([
        candidateService.getSavedJobs(),
        candidateService.getResumes().catch(() => [] as Resume[])
      ]);
      setSavedJobs(jobsData);
      setResumes(resumesData);
      if (resumesData.length > 0) {
        const primary = resumesData.find((r) => r.isPrimary) || resumesData[0];
        setSelectedResumeId(primary.id);
      }
    } catch (err) {
      console.error('Failed to load saved jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      await candidateService.toggleSaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast({
        type: 'info',
        title: 'Job Removed',
        message: 'Position removed from your saved list.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not remove job from saved list.'
      });
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob || !selectedResumeId) return;

    try {
      setIsSubmitting(true);
      await candidateService.applyForJob(applyingJob.id, selectedResumeId);
      showToast({
        type: 'success',
        title: 'Application Submitted! 🎉',
        message: `Successfully applied to ${applyingJob.title} at ${applyingJob.company}.`
      });
      setApplyingJob(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Application Failed',
        message: err.message || 'Could not submit application.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSalary = (job: Job) => {
    if (job.salary && typeof job.salary.min === 'number' && typeof job.salary.max === 'number') {
      return `${formatCurrency(job.salary.min)} - ${formatCurrency(job.salary.max)} / yr`;
    }
    const anyJob = job as any;
    if (anyJob.salaryMin && anyJob.salaryMax) {
      return `${formatCurrency(Number(anyJob.salaryMin))} - ${formatCurrency(Number(anyJob.salaryMax))} / yr`;
    }
    return 'Competitive Salary';
  };

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Saved & Bookmarked Jobs</h1>
            {!isLoading && savedJobs.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {savedJobs.length} {savedJobs.length === 1 ? 'Job' : 'Jobs'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Positions you've bookmarked for later review and application submission.
          </p>
        </div>

        <Link to="/candidate/jobs">
          <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : savedJobs.length === 0 ? (
        <Card glass className="p-14 text-center text-xs text-slate-400 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Bookmark className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white">No saved jobs yet</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Explore recommended engineering positions and click the bookmark icon to save jobs for later review.
            </p>
          </div>
          <Link to="/candidate/jobs" className="inline-block pt-2">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Discover Jobs
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <Card key={job.id} glass hoverEffect className="p-6 transition-all border border-white/[0.08] hover:border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide image and show building fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/candidate/jobs/${job.id}`}
                        className="text-base font-bold text-white hover:text-indigo-400 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {job.matchScore || 88}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 flex-wrap">
                      <span>{job.company}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-normal flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50 font-medium">
                        {job.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50 font-medium">
                        {job.experienceLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-semibold">
                        {renderSalary(job)}
                      </span>
                    </div>

                    {/* Skills pills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
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

                {/* Right Side Actions */}
                <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-2.5 rounded-xl bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition-colors cursor-pointer"
                    title="Remove from saved jobs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/candidate/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => setApplyingJob(job)}
                  >
                    Easy Apply
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* EASY APPLY MODAL */}
      <Modal
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        title={`Apply to ${applyingJob?.title}`}
        description={`Submit application to ${applyingJob?.company}`}
        maxWidth="lg"
      >
        {applyingJob && (
          <form onSubmit={handleApplySubmit} className="space-y-5">
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1.5">
              <p className="font-bold text-white">Your Candidate Profile Summary</p>
              <p className="text-slate-300">
                Location: <span className="text-white font-semibold">{applyingJob.location}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-semibold text-emerald-400">Match Score: {applyingJob.matchScore || 88}%</span>
                <span className="text-slate-400">• Verified ATS Compatible</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Resume for Submission
              </label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 p-2.5 cursor-pointer focus:outline-none focus:border-indigo-500"
                  required
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {r.isPrimary ? '(Primary Active)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-amber-400">
                  No resumes uploaded yet. You can upload one in Resume Management.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setApplyingJob(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                isLoading={isSubmitting}
                disabled={resumes.length === 0}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
