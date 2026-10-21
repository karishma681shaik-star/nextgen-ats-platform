import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bookmark,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, Resume, Application } from '../../types';
import { Button } from '../../components/ui/Button';
import { EasyApplyModal } from '../../components/candidate/EasyApplyModal';
import { SavedJobsCareerScene } from '../../components/candidate/SavedJobsCareerScene';
import { SavedJobsInfoModal } from '../../components/candidate/SavedJobsInfoModal';
import { SavedJobCard } from '../../components/candidate/SavedJobCard';
import { SavedJobsSkeleton } from '../../components/candidate/SavedJobsSkeleton';
import { SavedJobsExecutiveDesk } from '../../components/candidate/SavedJobsExecutiveDesk';

export const SavedJobsPage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const [jobsData, appsData, resumesData] = await Promise.all([
        candidateService.getSavedJobs(),
        candidateService.getApplications().catch(() => [] as Application[]),
        candidateService.getResumes().catch(() => [] as Resume[])
      ]);

      setSavedJobs(jobsData || []);
      setApplications(appsData || []);
      setResumes(resumesData || []);
    } catch (err: any) {
      console.error('Failed to load saved jobs', err);
      setLoadError(
        err?.message || 'We couldn\'t load your saved jobs. Check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (jobId: string) => {
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
        title: 'Removal Error',
        message: 'Could not remove job from your saved list. Please try again.'
      });
    }
  };

  // Applied job IDs set for fast O(1) lookup
  const appliedJobIds = new Set(applications.map((app) => app.jobId));

  // Calculated count label
  const countLabel = isLoading
    ? 'Checking saved opportunities...'
    : savedJobs.length === 0
    ? 'No saved opportunities'
    : savedJobs.length === 1
    ? '1 saved opportunity'
    : `${savedJobs.length} saved opportunities`;

  return (
    <div className="space-y-7 select-none font-sans text-slate-100">
      {/* ── 1. REFINED PAGE HEADER ────────────────────────────────────── */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.05]"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
              <Bookmark className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Saved & Bookmarked Jobs
                </h1>
                {!isLoading && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      savedJobs.length > 0
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                    }`}
                  >
                    {countLabel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep track of the opportunities you want to explore and apply for.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action: Explore Jobs */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/candidate/jobs">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Compass className="w-3.5 h-3.5 text-indigo-400" />}
            >
              Explore Jobs
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── 2. MAIN CONTENT AREA (LOADING / ERROR / EMPTY / CARDS) ─────── */}
      {isLoading ? (
        <SavedJobsSkeleton />
      ) : loadError ? (
        /* Error State Panel */
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-aura-outer-luminous rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">We couldn't load your saved jobs.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check your connection and try again. If the issue persists, our servers may be syncing.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadData}
            >
              Retry
            </Button>
          </div>
        </motion.div>
      ) : savedJobs.length === 0 ? (
        /* ── 3. EMPTY STATE COMPOSITION ──────────────────────────────── */
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="card-aura-outer-luminous rounded-2xl p-6 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: 3D Studio Career Scene */}
            <div className="lg:col-span-6 flex justify-center">
              <SavedJobsCareerScene />
            </div>

            {/* Right Column: Thoughtful Empty State Message */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Career Opportunities Hub</span>
              </div>

              <div className="space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Your next opportunity starts here
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto lg:mx-0">
                  Save interesting roles while exploring jobs. Your bookmarked opportunities will stay
                  here so you can compare them and return when you're ready.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                <Link to="/candidate/jobs" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                  >
                    Explore Jobs
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>How saved jobs work</span>
                </button>
              </div>

              {/* Subtle feature reassurance points */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06] text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Private to your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Real-time status updates</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── 4. REAL SAVED JOBS & EXECUTIVE CAREER SHOWCASE ───────────── */
        <div className="space-y-5">
          {/* Executive Career Desk Showcase with 3D Realistic Objects & Live Metrics */}
          <SavedJobsExecutiveDesk
            savedJobs={savedJobs}
            appliedCount={appliedJobIds.size}
          />

          {/* Saved Job Cards with Specular Border Sweep & Sapphire Clasp */}
          <div className="space-y-4">
            {savedJobs.map((job, idx) => (
              <SavedJobCard
                key={job.id}
                job={job}
                index={idx}
                isApplied={appliedJobIds.has(job.id) || !!job.applied}
                onApply={(targetJob) => setApplyingJob(targetJob)}
                onRemove={handleRemoveBookmark}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 5. EASY APPLY MODAL (REAL APPLICATION SUBMISSION) ─────────── */}
      <EasyApplyModal
        job={applyingJob}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        onSuccess={(jobId) => {
          // Immediately record application state
          setApplications((prev) => [
            ...prev,
            { jobId, status: 'Applied', id: `temp-${Date.now()}` } as Application
          ]);
          setSavedJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j))
          );
        }}
      />

      {/* ── 6. ACCESSIBLE INFORMATION MODAL ───────────────────────────── */}
      <SavedJobsInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};

export default SavedJobsPage;
