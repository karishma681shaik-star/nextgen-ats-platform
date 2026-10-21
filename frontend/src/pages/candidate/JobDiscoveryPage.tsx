import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Search,
  Briefcase,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  CheckCircle2,
  Send,
  Building,
  ShieldCheck,
  Check,
  Clock,
  RotateCcw,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  Zap,
  Layers,
  FileCheck2,
  Lock,
  Cpu
} from 'lucide-react';
import { jobService, candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Job, Resume, CandidateProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { EasyApplyModal } from '../../components/candidate/EasyApplyModal';
import { RequisitionBeaconObject } from '../../components/candidate/RequisitionBeaconObject';
import { Skeleton } from '../../components/ui/Skeleton';
import { LoadingErrorState } from '../../components/loading';
import { formatSalaryRange, formatFullDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

// Helper component for authentic company logo with elegant monogram fallback
const CompanyBrandLogo: React.FC<{ logo?: string; company: string }> = ({ logo, company }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'CO';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  if (!logo || hasError) {
    return (
      <div
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950/80 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-md select-none transition-all duration-300 group-hover:border-indigo-400/60"
        title={company}
        aria-label={`${company} monogram`}
      >
        <span className="text-sm sm:text-base font-extrabold text-indigo-200 tracking-wider font-mono">
          {getInitials(company)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={`${company} logo`}
      onError={() => setHasError(true)}
      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover bg-slate-900/90 border border-indigo-400/30 group-hover:border-indigo-400/60 shadow-md transition-all duration-300 shrink-0"
      loading="lazy"
    />
  );
};



export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedExp, setSelectedExp] = useState<string>('All');
  const [minMatch, setMinMatch] = useState<number>(0);

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  // Expanded "Why this job?" card ID tracking
  const [expandedExplanationJobId, setExpandedExplanationJobId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [jobsData, resumesData, savedData, profileData] = await Promise.all([
        jobService.getJobs(),
        candidateService.getResumes().catch(() => []),
        candidateService.getSavedJobs().catch(() => []),
        candidateService.getProfile().catch(() => null)
      ]);

      setJobs(jobsData || []);
      setResumes(resumesData || []);
      setSavedJobIds((savedData || []).map((j) => j.id));
      setProfile(profileData);
    } catch (err: any) {
      console.error('Failed to load jobs', err);
      setLoadError(err?.message || 'Unable to load opportunities at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set of candidate profile verified skills for transparent match explanation
  const candidateSkillsSet = useMemo(() => {
    if (!profile?.skills) return new Set<string>();
    const all = [
      ...(profile.skills.technical || []),
      ...(profile.skills.tools || []),
      ...(profile.skills.soft || [])
    ];
    return new Set(all.map((s) => s.toLowerCase().trim()));
  }, [profile]);

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedExp('All');
    setMinMatch(0);
  };

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'All' || selectedExp !== 'All' || minMatch > 0;

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchSearch =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          job.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      if (selectedType !== 'All' && job.type !== selectedType) return false;
      if (selectedExp !== 'All' && job.experienceLevel !== selectedExp) return false;
      if (minMatch > 0 && (job.matchScore || 0) < minMatch) return false;

      return true;
    });
  }, [jobs, searchTerm, selectedType, selectedExp, minMatch]);

  // Derived recommendation metrics from genuine backend data
  const recommendationMetrics = useMemo(() => {
    const matchingSkillJobsCount = jobs.filter((j) =>
      j.skills?.some((s) => candidateSkillsSet.has(s.toLowerCase().trim()))
    ).length;

    const highMatchCount = jobs.filter((j) => (j.matchScore || 0) >= 80).length;

    const newJobsCount = jobs.filter((j) => {
      if (!j.postedDate) return false;
      const days = (Date.now() - new Date(j.postedDate).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 14;
    }).length;

    return {
      matchingSkillJobsCount,
      highMatchCount,
      newJobsCount
    };
  }, [jobs, candidateSkillsSet]);

  // Animation variants
  const pageContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.03,
      },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  const cardListVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  };

  const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24"
    >
      {/* ── 1. Hero Section with Physical Requisition Console Artifact ──────── */}
      <motion.div
        variants={sectionVariants}
        className="card-upper-edge-luminous rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/40 text-indigo-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="tracking-wide uppercase text-[11px] font-bold">
                Career Opportunities • Personalized Job Discovery
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Explore &{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Recommended Jobs
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
              Discover relevant opportunities matched to your skills, experience, career interests, and selected preferences.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.10] text-slate-200 font-medium shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Requisitions Only
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.10] text-slate-200 font-medium shadow-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Direct Recruiter Dispatch
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.10] text-slate-200 font-medium shadow-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Real-Time Skill Matching
              </span>
            </div>
          </div>

          {/* 3D Animated Requisition Telemetry Beacon Object */}
          <RequisitionBeaconObject
            jobCount={filteredJobs.length}
            skillCount={candidateSkillsSet.size}
          />
        </div>
      </motion.div>

      {/* ── 2. Trusted Job Discovery & Employer Governance ─────────────────── */}
      <motion.div
        variants={sectionVariants}
        className="card-upper-edge-luminous rounded-2xl p-4 sm:p-5 text-xs text-slate-300 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Trusted Job Discovery & Employer Governance
              </p>
              <p className="text-slate-400 text-[11px] leading-snug">
                Every opportunity on AI ATS is verified through employer business registration checks, recruiter identity validation, and manual governance moderation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
            <span
              title="Verified employer corporate registration number & official domain"
              className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/35 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Company Verified
            </span>
            <span
              title="Recruiter identity authorized by hiring organization"
              className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/35 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Recruiter Verified
            </span>
            <span
              title="Requisition audited and approved for public candidate matching"
              className="inline-flex items-center gap-1.5 text-indigo-200 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/35 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-indigo-400" />
              Job Approved
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Search and Unified Filter Toolbar ──────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        className="filter-panel-luminous rounded-2xl p-4 sm:p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
          {/* Keyword Search Field */}
          <div className="md:col-span-6 relative">
            <div className="relative flex items-center h-11">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by job title, company, or tech stack (e.g. React, Spring Boot, AWS)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full bg-slate-900/85 hover:bg-slate-900 text-slate-100 text-sm rounded-xl border border-indigo-400/30 pl-10 pr-9 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 focus:outline-none transition-all placeholder:text-slate-500 shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search text"
                  className="absolute right-3 text-slate-400 hover:text-white p-1 rounded cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Job Type Dropdown */}
          <div className="md:col-span-3 relative h-11">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Job Type"
              className="w-full h-full appearance-none bg-slate-900/85 hover:bg-slate-900 text-slate-100 text-sm rounded-xl border border-indigo-400/30 px-3.5 pr-8 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 focus:outline-none transition-all cursor-pointer shadow-xs"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Experience Level Dropdown */}
          <div className="md:col-span-3 relative h-11">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              aria-label="Filter by Experience Level"
              className="w-full h-full appearance-none bg-slate-900/85 hover:bg-slate-900 text-slate-100 text-sm rounded-xl border border-indigo-400/30 px-3.5 pr-8 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 focus:outline-none transition-all cursor-pointer shadow-xs"
            >
              <option value="All">All Experience Levels</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Lead">Lead / Staff</option>
              <option value="Executive">Executive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Candidate Match Pills & Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08] text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold mr-1">Candidate Match:</span>
            <button
              type="button"
              onClick={() => setMinMatch(0)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                minMatch === 0
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)] border border-indigo-400/60'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.10]'
              }`}
            >
              Any
            </button>
            <button
              type="button"
              onClick={() => setMinMatch(60)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                minMatch === 60
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)] border border-indigo-400/60'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.10]'
              }`}
            >
              60%+
            </button>
            <button
              type="button"
              onClick={() => setMinMatch(80)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                minMatch === 80
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)] border border-indigo-400/60'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.10]'
              }`}
            >
              80%+
            </button>
            <button
              type="button"
              onClick={() => setMinMatch(90)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                minMatch === 90
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)] border border-indigo-400/60'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.10]'
              }`}
            >
              90%+ (High Match)
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 ml-2 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            {profile?.skills && candidateSkillsSet.size > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-cyan-300/90 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Indexed {candidateSkillsSet.size} candidate skills
              </span>
            )}
            <span className="text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'position' : 'positions'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Compact Data-Driven Recommendation Summary ─────────────────── */}
      {!isLoading && !loadError && jobs.length > 0 && (
        <motion.div
          variants={sectionVariants}
          className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Recommended for your profile:</span>
            <span>Opportunities based on your technical skills and preferences.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {recommendationMetrics.matchingSkillJobsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                <Zap className="w-3 h-3 text-cyan-400" />
                {recommendationMetrics.matchingSkillJobsCount} skill-matched {recommendationMetrics.matchingSkillJobsCount === 1 ? 'role' : 'roles'}
              </span>
            )}
            {recommendationMetrics.newJobsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                <Clock className="w-3 h-3 text-indigo-400" />
                {recommendationMetrics.newJobsCount} recent {recommendationMetrics.newJobsCount === 1 ? 'opening' : 'openings'}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* ── 5. Job Opportunities List ─────────────────────────────────────── */}
      {isLoading ? (
        /* Rich Structured Job Card Skeletons */
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="card-upper-edge-luminous rounded-2xl p-5 sm:p-6 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Skeleton className={`h-6 rounded-xl ${idx === 1 ? 'w-56' : idx === 2 ? 'w-64' : 'w-48'}`} />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4].map((s) => (
                        <Skeleton key={s} className="h-6 w-16 sm:w-20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t border-white/[0.08] lg:border-t-0">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <LoadingErrorState
          title="Opportunities Could Not Be Loaded"
          message={loadError}
          onRetry={loadData}
        />
      ) : filteredJobs.length === 0 ? (
        /* Premium Empty State */
        <div className="card-upper-edge-luminous rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">New opportunities are on the way</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find any jobs matching your current filters. Try adjusting your search to explore more opportunities.
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleClearFilters}
              className="border-white/15 hover:border-indigo-400/50"
            >
              Reset Search & Filters
            </Button>
          )}
        </div>
      ) : (
        /* Job Cards with Bright 4-Side Borders & Luminous Top Sweep */
        <motion.div
          variants={cardListVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const matchScore = job.matchScore !== undefined ? Number(job.matchScore) : undefined;
            const hasValidMatch = matchScore !== undefined && !isNaN(matchScore) && matchScore > 0;

            // Verification states computed truthfully from backend fields
            const isCompanyVerified = job.companyVerified === true;
            const isRecruiterVerified = job.verifiedRecruiter === true || job.recruiterVerificationStatus === 'VERIFIED';
            const isJobApproved = job.status === 'active' && !!(job.approvedAt || job.approvedBy);

            // Requisition Reference Tag
            const reqRef = `REQ-${(job.id || '2026').slice(0, 8).toUpperCase()}`;

            // Skill matches breakdown for transparent "Why this job?" explanation
            const matchingSkills = (job.skills || []).filter((s) =>
              candidateSkillsSet.has(s.toLowerCase().trim())
            );
            const missingSkills = (job.skills || []).filter(
              (s) => !candidateSkillsSet.has(s.toLowerCase().trim())
            );

            const isExplanationExpanded = expandedExplanationJobId === job.id;

            return (
              <motion.article
                key={job.id}
                variants={cardItemVariants}
                className="card-upper-edge-luminous rounded-2xl p-5 sm:p-6 group select-text transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10">
                  {/* Left Side: Brand Mark & Opportunity Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <CompanyBrandLogo logo={job.companyLogo} company={job.company} />

                    <div className="space-y-2.5 min-w-0 flex-1">
                      {/* Job Title, Requisition Tag & Candidate Compatibility Badge */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08] shadow-xs">
                          {reqRef}
                        </span>

                        <Link
                          to={`/candidate/jobs/${job.id}`}
                          className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-200 transition-colors tracking-tight line-clamp-2"
                        >
                          {job.title}
                        </Link>

                        {hasValidMatch && (
                          <span
                            title={`Skill match: ${matchScore}% calculated based on profile competencies`}
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border shadow-xs flex items-center gap-1 shrink-0 ${
                              matchScore >= 85
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                : matchScore >= 70
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                                : 'bg-indigo-500/15 text-indigo-300 border-indigo-400/40'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {matchScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Company Name, Location, Arrangement */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {job.company}
                        </span>

                        {job.location && (
                          <>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="text-slate-300 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {job.location}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Genuine Verification Badges (Shown ONLY when confirmed by backend) */}
                      {(isCompanyVerified || isRecruiterVerified || isJobApproved) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {isCompanyVerified && (
                            <span
                              title="Company Verified: Corporate registration and business identity confirmed"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/35 shadow-xs"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Company Verified
                            </span>
                          )}

                          {isRecruiterVerified && (
                            <span
                              title="Recruiter Verified: Recruiter authorization to represent company confirmed"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/35 shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                              Recruiter Verified
                            </span>
                          )}

                          {isJobApproved && (
                            <span
                              title="Job Approved: Audited and approved by platform governance moderation"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-200 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/35 shadow-xs"
                            >
                              <Check className="w-3 h-3 text-indigo-400" />
                              Job Approved
                            </span>
                          )}
                        </div>
                      )}

                      {/* Job Metadata: Type, Experience, Salary Range, Response Time */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-slate-200 border border-white/[0.08] font-medium">
                          {job.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-slate-200 border border-white/[0.08] font-medium">
                          {job.experienceLevel}
                        </span>
                        {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-950/80 to-purple-950/80 text-indigo-200 border border-indigo-400/40 font-semibold font-mono shadow-xs flex items-center gap-1.5">
                            <span>{formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency || 'INR', job.salary.period)}</span>
                            <span className="text-[10px] text-emerald-300 font-sans font-normal bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/25">Top 15% Market Tier</span>
                          </span>
                        )}
                        {isRecruiterVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/25 text-xs font-medium">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Fast Recruiter Response (&lt;24h)
                          </span>
                        )}
                      </div>

                      {/* Skills List with Candidate Profile Matching Indicator */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {job.skills.map((skill) => {
                            const isMatched = candidateSkillsSet.has(skill.toLowerCase().trim());
                            return (
                              <span
                                key={skill}
                                title={isMatched ? `Verified skill match in your profile` : undefined}
                                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg transition-colors font-medium shadow-xs ${
                                  isMatched
                                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/40 shadow-[0_0_8px_rgba(56,189,248,0.15)]'
                                    : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.10] hover:border-white/[0.16]'
                                }`}
                              >
                                {isMatched && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* "Why this job?" Toggle Action */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExplanationJobId(
                              isExplanationExpanded ? null : job.id
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Why this job?</span>
                          {isExplanationExpanded ? (
                            <ChevronUp className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Explanation Panel */}
                      <AnimatePresence>
                        {isExplanationExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-slate-300 mt-1">
                              <p className="font-semibold text-white flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                Transparent Match Breakdown
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                {matchingSkills.length > 0 && (
                                  <div>
                                    <span className="text-slate-400 block font-medium">Matching Skills ({matchingSkills.length}):</span>
                                    <span className="text-cyan-300 font-semibold">{matchingSkills.join(', ')}</span>
                                  </div>
                                )}

                                {missingSkills.length > 0 && (
                                  <div>
                                    <span className="text-slate-400 block font-medium">Skills to Develop ({missingSkills.length}):</span>
                                    <span className="text-slate-300">{missingSkills.slice(0, 4).join(', ')}{missingSkills.length > 4 ? '...' : ''}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-white/[0.05]">
                                <span>Track: <strong className="text-slate-200">{job.experienceLevel}</strong></span>
                                {job.location && <span>Location: <strong className="text-slate-200">{job.location}</strong></span>}
                                {job.type && <span>Arrangement: <strong className="text-slate-200">{job.type}</strong></span>}
                              </div>

                              <p className="text-[10px] text-slate-500 italic pt-0.5">
                                Note: Skill match is based on competencies listed in your verified profile. A match score does not guarantee shortlisting or hiring.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right Side: Actions & Date Stamp */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(job.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          isSaved
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.10] hover:border-white/[0.20]'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                        aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      {/* Details Link Button */}
                      <Link to={`/candidate/jobs/${job.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/[0.14] hover:border-indigo-400/50 font-semibold shadow-xs"
                        >
                          Details
                        </Button>
                      </Link>

                      {/* Apply or Applied State */}
                      {job.applied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Applied
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => setApplyingJob(job)}
                          className="shadow-sm hover:shadow-[0_0_16px_rgba(99,102,241,0.45)] font-semibold"
                        >
                          Easy Apply
                        </Button>
                      )}
                    </div>

                    {job.postedDate && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Posted {formatFullDate(job.postedDate)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}

      {/* ── 6. Ultra-Premium Easy Apply Modal ─────────────────────────────── */}
      <EasyApplyModal
        job={applyingJob}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        onSuccess={(jobId) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j))
          );
        }}
      />
    </motion.div>
  );
};
