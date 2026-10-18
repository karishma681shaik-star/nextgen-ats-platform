import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  Star,
  Trophy,
  ChevronRight,
  Layers,
  Upload,
  MapPin,
  Building,
  UserCheck,
  Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { candidateService, CandidateDashboardData } from '../../services';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { AIAssistantEmblem, AIAudioWaveform } from '../../components/common/AIAssistantEmblem';
import { Job, Application } from '../../types';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { formatSalaryRange } from '../../utils/formatters';
import { DepthCard } from '../../components/ui/DepthCard';
import { useToast } from '../../context/ToastContext';
import { CreateResumeModal } from '../../components/candidate/CreateResumeModal';

// ─── Stat Metric Card ────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  linkTo?: string;
  linkLabel?: string;
  badgeText?: string;
  badgeColor?: string;
  onActionClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  linkTo,
  linkLabel,
  badgeText,
  badgeColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  onActionClick
}) => (
  <DepthCard hoverEffect={true} glass={true} className="p-5 flex flex-col justify-between h-full">
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={cn('p-2 rounded-xl shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-xl sm:text-2xl font-black text-white truncate max-w-full" title={String(value)}>
          {value}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed truncate">{subtitle}</p>
    </div>
    <div className="pt-3 border-t border-white/[0.04] mt-3 flex items-center justify-between">
      {badgeText && (
        <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-md', badgeColor)}>
          {badgeText}
        </span>
      )}
      {linkTo ? (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-auto"
        >
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      ) : onActionClick ? (
        <button
          type="button"
          onClick={onActionClick}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-auto cursor-pointer"
        >
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </button>
      ) : null}
    </div>
  </DepthCard>
);

// ─── Main Candidate Dashboard Component ──────────────────────────────────────
export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState<CandidateDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'choice' | 'upload'>('choice');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load candidate dashboard', err);
      // Graceful fallback without hardcoded fake scores
      setDashboardData({
        candidateName: user?.name || 'Candidate',
        candidateEmail: user?.email || '',
        candidateTitle: 'Candidate',
        profileCompletion: 0,
        atsScore: null,
        atsStatus: 'NO_RESUME',
        hasPrimaryResume: false,
        totalApplicationsCount: 0,
        activeApplicationsCount: 0,
        shortlistedCount: 0,
        interviewsCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        savedJobsCount: 0,
        checklist: {},
        recommendedJobs: [],
        recentApplications: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUpload = () => {
    setCreateModalMode('upload');
    setCreateModalOpen(true);
  };

  const handleListenGreeting = () => {
    const nameToSpeak = user?.name || dashboardData?.candidateName || 'Candidate';
    setIsAiSpeaking(true);
    soundEffectService.playActionChime();
    voiceAssistantService.welcomeUser({ name: nameToSpeak, role: 'candidate' }, 'candidate');
    setTimeout(() => setIsAiSpeaking(false), 3200);
  };

  // Normalizer for application status pill styling
  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'SELECTED' || s === 'OFFER') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Offer
        </span>
      );
    }
    if (s === 'INTERVIEW') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Interview
        </span>
      );
    }
    if (s === 'SHORTLISTED') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          Shortlisted
        </span>
      );
    }
    if (s === 'UNDER_REVIEW' || s === 'UNDER REVIEW') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          Under Review
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          Not Selected
        </span>
      );
    }
    if (s === 'WITHDRAWN') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          Withdrawn
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
        Submitted
      </span>
    );
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 w-full rounded-3xl bg-slate-800/40 border border-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-white/5" />
          ))}
        </div>
        <div className="h-80 w-full rounded-2xl bg-slate-800/40 border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-64 rounded-2xl bg-slate-800/40 border border-white/5" />
          <div className="lg:col-span-5 h-64 rounded-2xl bg-slate-800/40 border border-white/5" />
        </div>
      </div>
    );
  }

  const displayName = user?.name || dashboardData.candidateName || 'Candidate';
  const cleanName = voiceAssistantService.sanitizeDisplayName(displayName);
  const profileCompletion = dashboardData.profileCompletion;

  return (
    <div className="space-y-7 pb-12">
      {/* ── SECTION 1 — WELCOME HEADER ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-indigo-500/20 p-6 sm:p-7 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(20,24,48,0.85) 0%, rgba(13,18,34,0.95) 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back{cleanName ? `, ${cleanName}` : ''}! 👋
              </h1>
              <p className="text-sm text-slate-300/85 mt-1 leading-relaxed">
                Your next career opportunity starts here.
              </p>
            </div>

            {/* Profile Completion Indicator (Separate from ATS score) */}
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">
                  Profile completion: <span className="text-white font-bold">{profileCompletion}%</span>
                </span>
                <Link
                  to="/candidate/profile"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1"
                >
                  Complete profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete your profile to help recruiters understand your background.
              </p>
            </div>
          </div>

          {/* Action Hub & Voice Emblem */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Ambient Voice Assistant Trigger */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 backdrop-blur-md">
              <AIAssistantEmblem size="sm" isSpeaking={isAiSpeaking} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-300">Nexus AI</span>
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Voice Assistant
                </span>
              </div>
              <AIAudioWaveform isSpeaking={isAiSpeaking} />
              <button
                type="button"
                onClick={handleListenGreeting}
                title="Listen to personalized greeting"
                aria-label="Listen to personalized greeting"
                className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="glow"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={handleOpenUpload}
            >
              Upload / Update Resume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Briefcase className="w-4 h-4" />}
              onClick={() => navigate('/candidate/jobs')}
            >
              Explore Jobs
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── SECTION 2 — CAREER SNAPSHOT ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Resume Status"
          value={dashboardData.hasPrimaryResume ? (dashboardData.primaryResumeFileName || 'Active') : 'No Resume'}
          subtitle={dashboardData.hasPrimaryResume ? 'Parsed & evaluated' : 'Upload to start matching'}
          icon={<FileText className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-indigo-500/10"
          badgeText={dashboardData.hasPrimaryResume ? 'Active' : 'Action Required'}
          badgeColor={dashboardData.hasPrimaryResume ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}
          linkTo={dashboardData.hasPrimaryResume ? '/candidate/resumes' : undefined}
          linkLabel={dashboardData.hasPrimaryResume ? 'Manage resume' : 'Upload resume'}
          onActionClick={!dashboardData.hasPrimaryResume ? handleOpenUpload : undefined}
        />

        <StatCard
          title="Active Applications"
          value={dashboardData.activeApplicationsCount}
          subtitle="In review with hiring teams"
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10"
          badgeText={dashboardData.activeApplicationsCount > 0 ? `${dashboardData.activeApplicationsCount} active` : 'None pending'}
          badgeColor="bg-blue-500/15 text-blue-300 border-blue-500/30"
          linkTo="/candidate/applications"
          linkLabel="Track status"
        />

        <StatCard
          title="Shortlisted"
          value={dashboardData.shortlistedCount}
          subtitle="Advanced to candidate shortlist"
          icon={<Star className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10"
          badgeText={dashboardData.shortlistedCount > 0 ? 'Shortlisted' : 'None yet'}
          badgeColor="bg-purple-500/15 text-purple-300 border-purple-500/30"
          linkTo="/candidate/applications"
          linkLabel="View shortlisted"
        />

        <StatCard
          title="Interviews & Offers"
          value={dashboardData.interviewsCount + dashboardData.selectedCount}
          subtitle={`${dashboardData.interviewsCount} interview · ${dashboardData.selectedCount} offer`}
          icon={<Trophy className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          badgeText={dashboardData.selectedCount > 0 ? 'Selected Offer' : dashboardData.interviewsCount > 0 ? 'Interview Stage' : 'Ready'}
          badgeColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          linkTo="/candidate/applications"
          linkLabel="View stages"
        />
      </motion.div>

      {/* ── SECTION 3 — RECRUITER REQUISITIONS (FULL WIDTH) ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <DepthCard hoverEffect={false} glass={true} className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Recruiter Requisitions</h2>
                <p className="text-[11px] text-slate-400">Real opportunities posted by verified employers</p>
              </div>
            </div>
            <Link
              to="/candidate/jobs"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Browse all jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {dashboardData.recommendedJobs && dashboardData.recommendedJobs.length > 0 ? (
              dashboardData.recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <p className="text-sm font-bold text-white hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </p>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                      {job.type && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-slate-300">
                          {job.type}
                        </span>
                      )}
                      {/* Job-specific ATS Match Score ONLY if genuinely calculated */}
                      {typeof job.matchScore === 'number' && job.matchScore > 0 && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold">
                          {job.matchScore}% ATS Match
                        </span>
                      )}
                      {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                        <span className="text-xs font-semibold text-emerald-400">
                          {formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency || 'INR', job.salary.period)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2.5 opacity-60" />
                <p className="text-sm font-semibold text-slate-300">No New Open Requisitions</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  You have applied to all current positions or recruiters have not posted new requisitions yet.
                </p>
                <Link to="/candidate/jobs" className="inline-block mt-4">
                  <Button variant="secondary" size="sm">
                    Check Career Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DepthCard>
      </motion.div>

      {/* ── SECTION 4 — PIPELINE & PROFILE READINESS ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* ── Left: My Active Applications ─────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col">
          <DepthCard hoverEffect={false} glass={true} className="overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">My Active Applications</h2>
                  <p className="text-[11px] text-slate-400">Live submission pipeline status</p>
                </div>
              </div>
              <Link
                to="/candidate/applications"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                All applications ({dashboardData.totalApplicationsCount}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04] flex-1">
              {dashboardData.recentApplications && dashboardData.recentApplications.length > 0 ? (
                dashboardData.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{app.jobTitle}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {app.company} · Applied {app.appliedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {renderStatusBadge(app.status)}
                      <Link to="/candidate/applications" className="text-slate-500 hover:text-slate-300 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center flex-1 flex flex-col items-center justify-center">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-slate-400">You haven't submitted any job applications yet.</p>
                  <Link to="/candidate/jobs" className="inline-block mt-3">
                    <Button variant="secondary" size="sm">
                      Explore Open Jobs
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DepthCard>
        </div>

        {/* ── Right: Profile Readiness & Portal Shortcuts ──────────────────── */}
        <div className="lg:col-span-5 flex flex-col">
          <DepthCard hoverEffect={false} glass={true} className="overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Profile Readiness</h2>
                  <p className="text-[11px] text-slate-400">Independent candidate completeness</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {profileCompletion}%
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Profile completeness</span>
                  <span className="font-bold text-emerald-400">{profileCompletion}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  Keep your background and skill proficiencies up to date for better recruiter discovery.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <Link
                  to="/candidate/profile"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Edit Profile & Skills</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  to="/candidate/resumes"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Manage All Resumes</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  to="/candidate/saved-jobs"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Saved Jobs ({dashboardData.savedJobsCount})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </DepthCard>
        </div>
      </motion.div>

      {/* Resume Creation / Upload Modal */}
      <CreateResumeModal
        isOpen={createModalOpen}
        initialMode={createModalMode}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadData();
          showToast({
            type: 'success',
            title: 'Resume uploaded and parsed successfully!'
          });
        }}
      />
    </div>
  );
};
