import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Share2,
  Video,
  RefreshCw,
  Compass,
  Radio,
  ExternalLink,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  Download,
  FileText,
  Building,
  GraduationCap,
  Edit2,
  Trash2,
  Edit3,
  Sliders,
  UserCheck,
  Search,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  BarChart3,
  Crosshair,
  Copy
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RecruiterStats, Job, Application, ApplicationStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { DepthCard } from '../../components/ui/DepthCard';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/cn';
import { getStatusBadgeStyle } from '../../utils/formatters';
import { INITIAL_JOBS } from '../../data/mockData';


// ─── Main Recruiter Dashboard Component ────────────────────────────────────────
export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'talent' | 'jobs' | 'schedule'>('talent');

  // Filter tabs for live candidate stream
  const [candidateFilter, setCandidateFilter] = useState<'all' | 'top' | 'shortlist' | 'interview'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'name'>('score');

  // Candidate Profile Modal state
  const [viewingProfile, setViewingProfile] = useState<Application | null>(null);

  // Candidate and Requisition Delete Modal state
  const [candidateToDelete, setCandidateToDelete] = useState<Application | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStageTitle = (stage: string) => {
    if (stage === 'Interview') return 'Ready for Interview';
    return stage;
  };

  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeleting(true);
      await recruiterService.deleteApplicant(candidateToDelete.id).catch(() => null);
      setApplicants((prev) => prev.filter((a) => a.id !== candidateToDelete.id));
      if (viewingProfile?.id === candidateToDelete.id) {
        setViewingProfile(null);
      }
      showToast({
        type: 'info',
        title: 'Candidate Removed',
        message: `${candidateToDelete.candidateName} removed from applications.`
      });
      setCandidateToDelete(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete candidate.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      await jobService.deleteJob(jobToDelete.id).catch(() => null);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper to identify legacy seeded default/mock jobs
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

  const isDummyOrSimulated = (a: Application) => {
    if (!a) return true;
    const name = (a.candidateName || '').trim().toLowerCase();
    const id = (a.id || '').toLowerCase();
    return (
      id.startsWith('sim-') ||
      id.startsWith('mock-') ||
      id.startsWith('app-man-') ||
      id.startsWith('app-priya') ||
      id.startsWith('app-david') ||
      id.startsWith('app-elena') ||
      id.startsWith('app-marcus') ||
      id.startsWith('app-alex') ||
      id.startsWith('app-carlos') ||
      id.startsWith('app-liam') ||
      name === 'elena gilbert' ||
      name === 'dr. kimberly vance' ||
      name === 'kimberly vance' ||
      name === 'aditya narayan' ||
      name === 'alex rivera' ||
      name === 'candidate' ||
      name === 'test candidate' ||
      name === 'priya sharma' ||
      name === 'david chen' ||
      name === 'elena rostova' ||
      name === 'marcus johnson' ||
      name === 'aisha patel' ||
      name === 'liang wei' ||
      name === 'sofia martínez' ||
      name === 'oliver schmidt' ||
      name === 'yuki tanaka' ||
      name === 'carlos mendez' ||
      name === "liam o'connor"
    );
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Scrub local storage of any legacy simulated/dummy candidates
      try {
        const stored = localStorage.getItem('ai_ats_applications_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((a) => !isDummyOrSimulated(a));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ai_ats_applications_v1', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

      const [statsData, postedJobs, allApplicants] = await Promise.all([
        recruiterService.getStats().catch(() => null),
        recruiterService.getPostedJobs().catch(() => [] as Job[]),
        recruiterService.getAllApplicants().catch(() => [] as Application[])
      ]);

      // Only use real posted jobs manually created by recruiter — NO default seeded jobs
      const resolvedJobs = (postedJobs || []).filter((j) => !isDefaultJob(j.title));

      // Only genuine candidate applicants who applied to recruiter-posted jobs
      const realApplicants = (allApplicants || []).filter((a) => !isDummyOrSimulated(a));

      setJobs(resolvedJobs);
      setApplicants(realApplicants);

      // Stats reflect actual pipeline — 0 values shown truthfully when no one has applied
      setStats({
        activeJobs: resolvedJobs.length,
        totalApplicants: realApplicants.length,
        shortlisted: realApplicants.filter((a) => a.status === 'Shortlisted').length,
        interviewsScheduled: realApplicants.filter((a) => a.status === 'Interview').length,
        hiresThisMonth: realApplicants.filter((a) => a.status === 'Selected').length,
        averageTimeToHireDays: statsData?.averageTimeToHireDays || 0
      });
    } catch (err) {
      console.error('Failed to load recruiter dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy candidate application portal URL
  const handleCopyPortalLink = () => {
    const url = window.location.origin + '/jobs';
    navigator.clipboard?.writeText(url);
    showToast({
      type: 'success',
      title: 'Career Link Copied',
      message: 'Candidate application portal URL copied to clipboard!'
    });
  };

  // Update candidate status directly
  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    if (viewingProfile && viewingProfile.id === appId) {
      setViewingProfile((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast({
      type: 'success',
      title: 'Stage Updated',
      message: `Candidate moved to "${newStatus}".`
    });
  };

  // Filtered and sorted candidate stream
  const filteredApplicants = applicants
    .filter((app) => {
      if (candidateFilter === 'top' && (app.atsScore || 0) < 90) return false;
      if (candidateFilter === 'shortlist' && app.status !== 'Shortlisted') return false;
      if (candidateFilter === 'interview' && app.status !== 'Interview') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (app.candidateName || '').toLowerCase().includes(q);
        const matchesRole = (app.jobTitle || '').toLowerCase().includes(q);
        const matchesSkill = (app.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesSkill) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.atsScore || 0) - (a.atsScore || 0);
      if (sortBy === 'name') return (a.candidateName || '').localeCompare(b.candidateName || '');
      return 0;
    });

  if (isLoading || !stats) {
    return (
      <div className="space-y-7 animate-in fade-in duration-300">
        <div className="h-44 w-full rounded-3xl bg-slate-800/40 animate-pulse border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/40 animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-7 pb-16">
      {/* ── Content Container ──────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-7">

        {/* ── Top Unified Command Header ───────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl border border-cyan-500/25 p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,25,55,0.88) 0%, rgba(10,15,30,0.95) 55%, rgba(30,16,60,0.75) 100%)'
          }}
        >
          {/* Subtle Ambient Light Gradients */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>Neural ATS Engine v3.4 Active</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Recruitment Command Center 🚀
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Welcome back, <span className="font-extrabold text-white">{user?.name || 'Recruiter'}</span>. Tracking{' '}
                <span className="font-bold text-cyan-300">{stats.activeJobs} active requisitions</span> and{' '}
                <span className="font-bold text-emerald-300">{stats.totalApplicants} candidate evaluations</span> in real time.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/recruiter/jobs/new">
                <Button
                  variant="glow"
                  size="md"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  className="shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)]"
                >
                  Post New Opening
                </Button>
              </Link>

              <Link to="/recruiter/applicants">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Users className="w-4 h-4 text-cyan-300" />}
                  className="border-white/15 hover:border-cyan-400/50"
                >
                  Applicant Pipeline
                </Button>
              </Link>
            </div>
          </div>

          {/* Integrated Live Pipeline Stream Bar */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Inbound Ingestion Live</span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate">
                AI ATS Ingestion Engine active &bull; Listening for candidate submissions across {jobs.length} posted {jobs.length === 1 ? 'requisition' : 'requisitions'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Copy className="w-3.5 h-3.5 text-cyan-300" />}
                onClick={handleCopyPortalLink}
              >
                Copy Career Portal Link
              </Button>
              <Link to="/jobs">
                <Button
                  variant="glow"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Public Career Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3 Crisp, Focused Executive Metric Tiles ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
             {
              title: 'Active Requisitions',
              value: stats.activeJobs,
              sub: 'Live Openings',
              trend: '● Accepting Talent',
              icon: <Briefcase className="w-5 h-5 text-indigo-300" />,
              border: 'hover:border-indigo-400/40',
              link: '/recruiter/jobs'
            },
            {
              title: 'Total Candidates',
              value: stats.totalApplicants,
              sub: 'Evaluated Profiles',
              trend: '🔥 100% Parsed',
              icon: <Users className="w-5 h-5 text-cyan-300" />,
              border: 'hover:border-cyan-400/40',
              link: '/recruiter/applicants'
            },
            {
              title: 'Ready for Interview',
              value: applicants.filter((a) => a.status === 'Interview').length,
              sub: 'Qualified Pool',
              trend: 'Screening Passed',
              icon: <UserCheck className="w-5 h-5 text-amber-300" />,
              border: 'hover:border-amber-400/40',
              link: '/recruiter/applicants'
            }
          ].map((card, idx) => (
            <DepthCard
              key={idx}
              hoverEffect={true}
              glass={true}
              className={cn(
                'p-5 relative overflow-hidden group border border-white/[0.08] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]',
                card.border
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  {card.icon}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1.5">
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {card.value}
                </p>
                <span className="text-xs text-slate-400 font-medium">{card.sub}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                  {card.trend}
                </span>
                {card.link && (
                  <Link
                    to={card.link}
                    className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </DepthCard>
          ))}
        </div>

        {/* ── Interactive Pipeline Conversion & Velocity Bar ────────────────── */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900/85 via-indigo-950/70 to-slate-900/85 border border-cyan-500/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Recruitment Funnel & Velocity Health
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                ⚡ Velocity: 100% SLA On-Track
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Avg 3.2d / stage</span>
            </div>
          </div>

          {/* 5-Stage Interactive Funnel Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              {
                label: '1. Applied',
                count: stats.totalApplicants,
                rate: '100% Ingested',
                color: 'from-blue-500/15 to-cyan-500/15 border-cyan-500/30 text-cyan-300',
                action: () => { setActiveTab('talent'); setCandidateFilter('all'); }
              },
              {
                label: '2. AI Screened',
                count: stats.totalApplicants,
                rate: '100% Parsed',
                color: 'from-cyan-500/15 to-teal-500/15 border-teal-500/30 text-teal-300',
                action: () => { setActiveTab('talent'); setCandidateFilter('all'); }
              },
              {
                label: '3. Shortlisted',
                count: stats.shortlisted,
                rate: stats.totalApplicants > 0 ? `${Math.round((stats.shortlisted / stats.totalApplicants) * 100)}% Match` : 'Top Match',
                color: 'from-indigo-500/15 to-purple-500/15 border-indigo-500/30 text-indigo-300',
                action: () => { setActiveTab('talent'); setCandidateFilter('shortlist'); }
              },
              {
                label: '4. Interview Loop',
                count: stats.interviewsScheduled,
                rate: 'Active Rounds',
                color: 'from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-300',
                action: () => { setActiveTab('talent'); setCandidateFilter('interview'); }
              },
              {
                label: '5. Selected / Hired',
                count: stats.hiresThisMonth,
                rate: 'Finalized',
                color: 'from-emerald-500/15 to-green-500/15 border-emerald-500/30 text-emerald-300',
                action: () => { setActiveTab('talent'); }
              }
            ].map((step, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={step.action}
                className={cn(
                  'flex flex-col p-2.5 rounded-xl border bg-gradient-to-br transition-all hover:scale-[1.02] text-left cursor-pointer group shadow-sm',
                  step.color
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{step.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xl font-black text-white tracking-tight">{step.count}</p>
                <span className="text-[10px] font-medium text-slate-300 mt-0.5">{step.rate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Clean Section Navigation Tabs ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'talent', label: `Candidate Pipeline (${applicants.length})`, icon: Users },
              { id: 'jobs', label: `Active Requisitions (${jobs.length})`, icon: Briefcase },
              {
                id: 'schedule',
                label: `Ready for Interview (${applicants.filter((a) => a.status === 'Interview').length})`,
                icon: UserCheck
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06]'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-300' : 'text-slate-400')} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Link
            to="/recruiter/applicants"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Kanban Pipeline Board <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── TAB 1: CANDIDATE PIPELINE ────────────────────────────────────────── */}
        {activeTab === 'talent' && (
          <div className="space-y-4">
            {/* Filter & Instant Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.08] backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter:
                </span>
                {[
                  { id: 'all', label: `All Candidates (${applicants.length})` },
                  { id: 'top', label: '🔥 90%+ ATS Match' },
                  { id: 'shortlist', label: 'Shortlisted' },
                  { id: 'interview', label: 'Ready for Interview' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setCandidateFilter(chip.id as any)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                      candidateFilter === chip.id
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07]'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Instant Search Input & Pipeline Sort */}
              <div className="flex items-center gap-2">
                <div className="relative min-w-[180px] sm:min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate, role, skill..."
                    className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 font-bold focus:outline-none focus:border-cyan-400/60 cursor-pointer"
                >
                  <option value="score">Sort: ATS Match</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {/* Candidate Profile Cards / Inbound Requisition Gateway */}
            <div className="space-y-4">
              {filteredApplicants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 gap-6 text-center rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden">
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

                  {/* High-tech pulsing beacon */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-indigo-600/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                      <Radio className="w-8 h-8 text-cyan-300 animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_#34d399] animate-ping" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  </div>

                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
                      <span>Inbound Candidate Ingestion Active</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Awaiting Inbound Candidates for Posted Openings
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Your pipeline is connected to the live Career Portal. When applicants submit resumes for your posted requisitions, our AI ATS Engine parses work history, computes qualification scores, and routes them directly into this dashboard.
                    </p>
                  </div>

                  {/* Active Requisitions Inbound Hub */}
                  {jobs.length > 0 ? (
                    <div className="w-full max-w-3xl space-y-3 text-left">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                          Live Openings Ingestion Status ({jobs.length})
                        </span>
                        <Link to="/jobs" className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1">
                          View Candidate Portal <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {jobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-400/30 transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  ● Ingestion Live
                                </span>
                                <span className="text-[11px] font-bold text-slate-400">
                                  {job.applicantCount || 0} Applied
                                </span>
                              </div>
                              <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
                                {job.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">
                                {job.department || 'Engineering'} &bull; {job.location || 'Remote'} &bull; {job.type || 'Full-time'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Copy className="w-3 h-3 text-cyan-300" />}
                                onClick={handleCopyPortalLink}
                                className="text-[11px] py-1 px-2.5 h-auto"
                              >
                                Copy Apply Link
                              </Button>

                              <Link to="/jobs">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  leftIcon={<ExternalLink className="w-3 h-3 text-indigo-300" />}
                                  className="text-[11px] py-1 px-2.5 h-auto border-white/10"
                                >
                                  Preview Job
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] max-w-md">
                      <p className="text-xs text-slate-300 mb-3">
                        No active requisitions posted yet. Publish a job opening to publish it to the Career Portal and activate inbound applicant ingestion.
                      </p>
                      <Link to="/recruiter/jobs/new">
                        <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                          Post Your First Requisition
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* AI ATS Autonomous Screening Features Blueprint */}
                  <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2 border-t border-white/[0.06]">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px] font-extrabold text-white">Instant Resume Parsing</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Incoming PDF resumes are automatically tokenized, extracting skills, work history, and education.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-extrabold text-white">Neural ATS Scoring</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Computes keyword resonance against the target requisition and auto-ranks applicants with an ATS match score.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-extrabold text-white">Automated Pipeline Loop</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        High-scoring applicants are automatically queued for recruiter screening and interview scheduling.
                      </p>
                    </div>
                  </div>

                  {/* Fast Action Shortcuts */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Copy className="w-3.5 h-3.5 text-cyan-300" />}
                      onClick={handleCopyPortalLink}
                    >
                      Copy Career Portal Link
                    </Button>

                    <Link to="/jobs">
                      <Button
                        variant="glow"
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Open Public Career Portal
                      </Button>
                    </Link>

                    <Link to="/recruiter/jobs/new">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Briefcase className="w-3.5 h-3.5 text-indigo-300" />}
                      >
                        Post New Opening
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApplicants.map((app) => {
                const badge = getStatusBadgeStyle(app.status);
                const score = app.atsScore || 88;
                const isElite = score >= 90;

                return (

                  <DepthCard
                    key={app.id}
                    hoverEffect={true}
                    glass={true}
                    className="p-5 border border-white/[0.08] hover:border-cyan-400/40 rounded-3xl transition-all shadow-[0_4px_25px_rgba(0,0,0,0.3)] flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Avatar, Name, Target Role, Score Dial */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            {app.candidateAvatar ? (
                              <img
                                src={app.candidateAvatar}
                                alt={app.candidateName}
                                className="w-13 h-13 rounded-2xl object-cover border border-white/15 shadow-md group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-lg font-black text-white border border-white/15 shadow-md group-hover:scale-105 transition-transform">
                                {app.candidateName?.[0]?.toUpperCase() || 'C'}
                              </div>
                            )}
                            {isElite && (
                              <div
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                                title="Top 5% Elite Match"
                              >
                                <Flame className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                                {app.candidateName}
                              </h3>
                              <span
                                className={cn(
                                  'text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0',
                                  badge
                                )}
                              >
                                {app.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                              Applied for:{' '}
                              <span className="text-cyan-300 font-bold">{app.jobTitle}</span>
                            </p>

                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{app.candidateLocation}</span>
                              <span>•</span>
                              <span>{app.experienceYears || 5} yrs exp</span>
                            </p>
                          </div>
                        </div>

                        {/* ATS Match Score Dial */}
                        <div className="text-right shrink-0 px-3 py-1.5 rounded-2xl bg-[#090f28] border border-white/10 shadow-inner">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                            ATS Fit
                          </p>
                          <p
                            className={cn(
                              'text-lg font-black',
                              score >= 90 ? 'text-emerald-400' : 'text-cyan-400'
                            )}
                          >
                            {score}%
                          </p>
                        </div>
                      </div>

                      {/* Key Verified Skill Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                        {(app.skills || ['React', 'TypeScript', 'Java', 'Spring Boot']).slice(0, 5).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 text-[11px] font-semibold border border-white/[0.08]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* AI Evaluation Quote */}
                      <p className="text-xs text-slate-300/90 italic mt-3 line-clamp-2 bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                        💡 &ldquo;{app.notes?.[0] || 'Strong candidate alignment with modern enterprise architecture & agile delivery.'}&rdquo;
                      </p>
                    </div>

                    {/* Bottom Action Bar: View Profile, Edit ATS, Schedule & Delete */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => setViewingProfile(app)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-xs font-bold text-cyan-200 transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-300" />
                        View Profile
                      </button>

                      <Link to={`/recruiter/applicants?search=${encodeURIComponent(app.candidateName)}`}>
                        <button
                          type="button"
                          className="flex items-center gap-1 py-2 px-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 text-xs font-bold text-indigo-200 transition-colors cursor-pointer"
                          title="Edit ATS Score & Pipeline Status"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                        </button>
                      </Link>

                      {app.status === 'Interview' ? (
                        <span
                          className="flex items-center gap-1 py-2 px-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs font-bold text-emerald-300"
                          title="Candidate is Ready for Interview"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, 'Interview')}
                          className="flex items-center gap-1 py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-xs font-bold text-amber-200 transition-colors cursor-pointer"
                          title="Mark Ready for Interview"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setCandidateToDelete(app)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </DepthCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

        {/* ── TAB 2: ACTIVE REQUISITIONS ───────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <DepthCard
                hoverEffect={false}
                glass={true}
                className="p-10 text-center rounded-3xl border border-white/[0.08] shadow-2xl space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-white">No Active Requisitions Posted Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You haven&apos;t posted any job requisitions yet. Post a requisition manually to start receiving genuine candidates and evaluating ATS neural match scores.
                  </p>
                </div>
                <Link
                  to="/recruiter/jobs/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post New Opening
                </Link>
              </DepthCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                <DepthCard
                  key={job.id}
                  hoverEffect={true}
                  glass={true}
                  className="p-5 border border-white/[0.08] hover:border-cyan-400/40 rounded-3xl transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                        {job.department}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1.5">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.location} • {job.type}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                    <span className="text-xs font-bold text-slate-300">
                      {job.applicantCount} applicants
                    </span>

                    <div className="flex items-center gap-2">
                      <Link to={`/recruiter/jobs/${job.id}`}>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 hover:bg-indigo-500/25 transition-colors cursor-pointer"
                          title="Edit Requisition"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setJobToDelete(job)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                        >
                          Pipeline <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </DepthCard>
              ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: READY FOR INTERVIEW POOL & FUNNEL ───────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidates Ready for Interview List */}
            <DepthCard
              hoverEffect={false}
              glass={true}
              className="p-6 border border-white/[0.08] shadow-2xl rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Candidates Ready for Interview</h3>
                    <p className="text-xs text-slate-400">Pre-screened & qualified talent ready for interview loop</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  {applicants.filter((a) => a.status === 'Interview').length} Ready
                </span>
              </div>

              {applicants.filter((a) => a.status === 'Interview').length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No candidates currently ready for interview</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Screen applicants from your active candidate pool and mark qualified talent as &ldquo;Ready for Interview&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('talent')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" /> View Candidate Pipeline
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicants
                    .filter((a) => a.status === 'Interview')
                    .map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-4 rounded-2xl bg-[#090f28]/80 border border-white/[0.08] flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md">
                            {candidate.candidateName?.[0] || 'C'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-extrabold text-white truncate">{candidate.candidateName}</p>
                              <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-400/30 shrink-0">
                                {candidate.atsScore || 88}% Match
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{candidate.jobTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingProfile(candidate)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-300" />
                            View
                          </button>
                          <Link
                            to={`/recruiter/applicants?search=${encodeURIComponent(candidate.candidateName)}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-xs font-bold text-cyan-200 transition-colors"
                          >
                            Pipeline <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </DepthCard>

            {/* Recruitment Funnel Progress */}
            <DepthCard
              hoverEffect={false}
              glass={true}
              className="p-6 border border-white/[0.08] shadow-2xl rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Pipeline Conversion Funnel</h3>
                    <p className="text-xs text-slate-400">Total volume advancing across stages</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { label: 'Applied', count: applicants.length, pct: 100, color: '#6366f1' },
                  {
                    label: 'Screened & Evaluated',
                    count: applicants.filter((a) => a.status !== 'Applied').length,
                    pct: applicants.length > 0 ? Math.round((applicants.filter((a) => a.status !== 'Applied').length / applicants.length) * 100) : 0,
                    color: '#8b5cf6'
                  },
                  {
                    label: 'Shortlisted',
                    count: applicants.filter((a) => a.status === 'Shortlisted').length,
                    pct: applicants.length > 0 ? Math.round((applicants.filter((a) => a.status === 'Shortlisted').length / applicants.length) * 100) : 0,
                    color: '#06b6d4'
                  },
                  {
                    label: 'Ready for Interview',
                    count: applicants.filter((a) => a.status === 'Interview').length,
                    pct: applicants.length > 0 ? Math.round((applicants.filter((a) => a.status === 'Interview').length / applicants.length) * 100) : 0,
                    color: '#f59e0b'
                  },
                  {
                    label: 'Offer / Selected',
                    count: applicants.filter((a) => a.status === 'Selected').length,
                    pct: applicants.length > 0 ? Math.round((applicants.filter((a) => a.status === 'Selected').length / applicants.length) * 100) : 0,
                    color: '#10b981'
                  }
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">{f.label}</span>
                      <span className="font-extrabold text-white">{f.count} candidates</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(f.pct, 4)}%`, backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/recruiter/applicants"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all"
              >
                Open Full Kanban Board <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </DepthCard>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          CANDIDATE PROFILE MODAL: Clear, Simple & Understandable to Anyone!
      ══════════════════════════════════════════════════════════════════════════ */}
      {viewingProfile && (
        <Modal
          isOpen={Boolean(viewingProfile)}
          onClose={() => setViewingProfile(null)}
          title="Candidate Profile & ATS Dossier"
          size="4xl"
        >
          <div className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
            {/* 1. Header Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewingProfile.candidateAvatar}
                  alt={viewingProfile.candidateName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/40 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {viewingProfile.candidateName}
                    </h2>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verified Candidate
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                    {viewingProfile.candidateTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {viewingProfile.candidateLocation}
                    </span>
                    <span>•</span>
                    <span>{viewingProfile.experienceYears || 6} Years Professional Experience</span>
                  </p>
                </div>
              </div>

              {/* Overall Score Dial */}
              <div className="text-right shrink-0 px-4 py-3 rounded-2xl bg-[#080d22] border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ATS Match Score
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  {viewingProfile.atsScore || 93}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </p>
              </div>
            </div>

            {/* 2. Contact & Position Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                  <p className="text-xs text-white font-medium truncate">{viewingProfile.candidateEmail}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-indigo-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Applied Requisition</p>
                  <p className="text-xs text-white font-medium truncate">{viewingProfile.jobTitle}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-purple-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Pipeline Stage</p>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5', getStatusBadgeStyle(viewingProfile.status))}>
                    {viewingProfile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. ATS Neural Match Dimensions */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                ATS Semantic Evaluation Breakdown
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Technical Alignment', score: 96, color: '#10b981' },
                  { label: 'Experience Relevance', score: 94, color: '#06b6d4' },
                  { label: 'Keywords Match', score: 92, color: '#6366f1' },
                  { label: 'Resume Formatting', score: 98, color: '#a855f7' }
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-[#090e24] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
                      <span className="text-xs font-black text-white">{item.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Verified Skills Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Verified Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(viewingProfile.skills || ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS']).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-xs font-semibold shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. AI Evaluation & Recruiter Notes */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Recruiter Assessment
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {viewingProfile.notes?.[0] ||
                  'Candidate exhibits outstanding proficiency in scalable systems design, automated testing, and cloud infrastructure. Strong candidate fit for team leadership.'}
              </p>
            </div>

            {/* 6. Quick Stage Advancement Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Move Stage:</span>
                {(['Under Review', 'Shortlisted', 'Interview', 'Selected'] as ApplicationStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(viewingProfile.id, st)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      viewingProfile.status === st
                        ? 'bg-cyan-500 text-black font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                    )}
                  >
                    {getStageTitle(st)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {viewingProfile.status !== 'Interview' ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(viewingProfile.id, 'Interview');
                      setViewingProfile({ ...viewingProfile, status: 'Interview' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                    Mark Ready for Interview
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" /> Ready for Interview
                  </span>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingProfile(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}



      {/* ── CONFIRM DELETE CANDIDATE DIALOG ──────────────────────────────────── */}
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

      {/* ── CONFIRM DELETE REQUISITION DIALOG ────────────────────────────────── */}
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
