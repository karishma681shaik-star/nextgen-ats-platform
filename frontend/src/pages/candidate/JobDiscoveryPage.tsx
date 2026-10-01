import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Filter,
  CheckCircle2,
  Send,
  Building,
  ArrowRight
} from 'lucide-react';
import { jobService, candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, Resume, EmploymentType, ExperienceLevel } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatFullDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedExp, setSelectedExp] = useState<string>('All');
  const [minMatch, setMinMatch] = useState<number>(0);

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, resumesData, savedData] = await Promise.all([
        jobService.getJobs(),
        candidateService.getResumes(),
        candidateService.getSavedJobs()
      ]);
      setJobs(jobsData);
      setResumes(resumesData);
      setSavedJobIds(savedData.map((j) => j.id));
      if (resumesData.length > 0) {
        const primary = resumesData.find((r) => r.isPrimary) || resumesData[0];
        setSelectedResumeId(primary.id);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string) => {
    try {
      const isSaved = await candidateService.toggleSaveJob(jobId);
      setSavedJobIds((prev) =>
        isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)
      );
      showToast({
        type: isSaved ? 'success' : 'info',
        title: isSaved ? 'Job Bookmarked' : 'Job Removed',
        message: isSaved ? 'Added to your saved jobs list.' : 'Removed from saved jobs.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to bookmark job.' });
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    try {
      setIsSubmitting(true);
      const resumeIdToSend = selectedResumeId && selectedResumeId !== 'profile' ? selectedResumeId : undefined;
      await candidateService.applyForJob(applyingJob.id, resumeIdToSend);

      // Immediately mark this job as applied in UI state
      setJobs((prev) =>
        prev.map((j) => (j.id === applyingJob.id ? { ...j, applied: true } : j))
      );

      showToast({
        type: 'success',
        title: 'Application Submitted! 🎉',
        message: `Successfully applied to ${applyingJob.title} at ${applyingJob.company}.`
      });
      setApplyingJob(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Application Status',
        message: err.message || 'Could not submit application.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter((job) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    if (selectedType !== 'All' && job.type !== selectedType) return false;
    if (selectedExp !== 'All' && job.experienceLevel !== selectedExp) return false;
    if (minMatch > 0 && (job.matchScore || 0) < minMatch) return false;

    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Semantic Job Matching</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore & Recommended Jobs</h1>
        <p className="text-xs text-slate-400">
          Discover high-fit engineering positions ranked automatically according to your verified technical skills and ATS score.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <Card glass className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by job title, company, or tech stack (e.g. React, Spring Boot, AWS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700/80 px-3.5 py-2.5"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700/80 px-3.5 py-2.5"
            >
              <option value="All">All Experience Levels</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Lead">Lead / Staff</option>
            </select>
          </div>
        </div>

        {/* Extra Match Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Min AI Match:</span>
            <button
              onClick={() => setMinMatch(0)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${minMatch === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              Any
            </button>
            <button
              onClick={() => setMinMatch(80)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${minMatch === 80 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              80%+
            </button>
            <button
              onClick={() => setMinMatch(90)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${minMatch === 90 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              90%+ (High Match)
            </button>
          </div>

          <span className="text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredJobs.length}</span> positions
          </span>
        </div>
      </Card>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card glass className="p-12 text-center text-xs text-slate-400 space-y-2">
          <Briefcase className="w-10 h-10 text-indigo-400 mx-auto" />
          <p className="text-sm font-bold text-white">No matching jobs found</p>
          <p>Try broadening your search keywords or adjusting your filters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <Card key={job.id} glass hoverEffect className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Job Left Side Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-sm"
                    />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          to={`/candidate/jobs/${job.id}`}
                          className="text-base font-bold text-white hover:text-indigo-400 transition-colors"
                        >
                          {job.title}
                        </Link>
                        {job.matchScore && (
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                        <span>{job.company}</span>
                        {job.verifiedRecruiter !== false && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Recruiter
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {job.location}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {job.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {job.experienceLevel}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-semibold font-mono">
                          {formatCurrency(job.salary.min, job.salary.currency)} - {formatCurrency(job.salary.max, job.salary.currency)} / yr
                        </span>
                      </div>

                      {/* Required Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Job Right Side Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(job.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <Link to={`/candidate/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>

                      {job.applied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Applied
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => setApplyingJob(job)}
                        >
                          Easy Apply
                        </Button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Posted on {formatFullDate(job.postedDate)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
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
                Candidate: <span className="text-white font-semibold">{user?.name || 'Karishma Shaik'}</span> • Role:{' '}
                <span className="text-white font-semibold">Senior Java Full Stack Engineer</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                {applyingJob.matchScore ? (
                  <span className="font-semibold text-emerald-400">Match Score: {applyingJob.matchScore}%</span>
                ) : (
                  <span className="font-semibold text-indigo-400">Match: Profile Driven</span>
                )}
                <span className="text-slate-400">• Verified ATS Compatible</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Resume / Submission Credentials
              </label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 p-2.5"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {r.isPrimary ? '(Primary Active)' : ''}
                    </option>
                  ))}
                  <option value="profile">Submit with Verified Candidate Profile</option>
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified Profile & Technical Skills Credential</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">Profile Attached</span>
                </div>
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
