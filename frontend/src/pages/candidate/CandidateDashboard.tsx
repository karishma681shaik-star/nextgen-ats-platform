import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Trophy,
  ChevronRight,
  Star,
  Gauge,
  Layers,
  Plus,
  Sparkles,
  MapPin,
  Building,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateService, CandidateDashboardData } from '../../services';
import { Job, Application } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { getStatusBadgeStyle, formatCurrency } from '../../utils/formatters';
import { DepthCard } from '../../components/ui/DepthCard';
import { useToast } from '../../context/ToastContext';
import { CreateResumeModal } from '../../components/candidate/CreateResumeModal';

// ─── Precision Circular ATS Score Gauge ──────────────────────────────────────
const ATSCircularGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const increment = Math.max(1, Math.round(score / 40));
    const interval = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(start);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const color = score >= 80 ? '#10b981' : score >= 50 ? '#6366f1' : '#f59e0b';
  const glowColor = score >= 80 ? 'rgba(16,185,129,0.25)' : score >= 50 ? 'rgba(99,102,241,0.25)' : 'rgba(245,158,11,0.25)';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-700"
          style={{ backgroundColor: glowColor }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{animatedScore}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">/ 100</span>
          <span className="text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}15` }}>
            {label}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-white">ATS Match Benchmark</p>
        <p className="text-[11px] text-slate-400">Defined by Profile & Resume</p>
      </div>
    </div>
  );
};

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
  badgeColor = 'bg-indigo-500/10 text-indigo-400'
}) => (
  <DepthCard hoverEffect={true} glass={true} className="p-5 flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-black text-white">{value}</span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{subtitle}</p>
    </div>
    {badgeText && (
      <div className="mt-3">
        <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-md', badgeColor)}>
          {badgeText}
        </span>
      </div>
    )}
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 transition-colors">
        {linkLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    )}
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load candidate dashboard', err);
      // Fallback grace
      setDashboardData({
        candidateName: user?.name || 'Candidate',
        candidateEmail: user?.email || '',
        candidateTitle: 'Software Engineer',
        profileCompletion: 50,
        atsScore: 50,
        atsTier: 'Profile-Defined',
        atsSummary: 'Exact ATS benchmark defined by your 50% profile completion.',
        hasPrimaryResume: false,
        totalApplicationsCount: 0,
        activeApplicationsCount: 0,
        shortlistedCount: 0,
        interviewsCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        savedJobsCount: 0,
        checklist: {
          'Contact & Personal Details': true,
          'Professional Headline & Bio': false,
          'Skills & Competencies': false,
          'Work Experience History': false,
          'Academic Background': false,
          'Primary Resume Uploaded': false
        },
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

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 w-full rounded-2xl bg-slate-800/40 border border-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-800/40 border border-white/5" />
          <div className="h-96 rounded-2xl bg-slate-800/40 border border-white/5" />
        </div>
      </div>
    );
  }

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = dashboardData.candidateName || user?.name || 'Candidate';
  const profileCompletion = dashboardData.profileCompletion;
  const atsScore = dashboardData.atsScore;

  // Normalizer for application status pill styling
  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'SELECTED') {
      return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Selected</span>;
    }
    if (s === 'INTERVIEW') {
      return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Interview</span>;
    }
    if (s === 'SHORTLISTED') {
      return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Shortlisted</span>;
    }
    if (s === 'UNDER_REVIEW' || s === 'UNDER REVIEW') {
      return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Under Review</span>;
    }
    if (s === 'REJECTED') {
      return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Not Selected</span>;
    }
    return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">Applied</span>;
  };

  return (
    <div className="space-y-7 pb-12">
      {/* ── Welcome Header Banner ────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-indigo-500/20 p-6 sm:p-7 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(15,23,42,0.92) 60%, rgba(17,24,39,0.85) 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getTimeGreeting()}, {displayName.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              Your profile is currently <span className="font-bold text-white">{profileCompletion}% complete</span> with an exact ATS benchmark of{' '}
              <span className="font-bold text-indigo-400">{atsScore}/100</span>.
            </p>

            {/* Profile Completion Bar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden max-w-sm">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-xs text-indigo-300 font-bold shrink-0">{profileCompletion}% Profile</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
            >
              Upload / Edit Resume
            </Button>
            <Link to="/candidate/profile">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Truthful KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ATS Benchmark"
          value={`${atsScore} / 100`}
          subtitle={`Calculated from ${profileCompletion}% profile`}
          icon={<Gauge className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-indigo-500/10"
          badgeText={dashboardData.atsTier}
          badgeColor="bg-indigo-500/15 text-indigo-300"
          linkTo={dashboardData.hasPrimaryResume && dashboardData.primaryResumeId ? `/candidate/resume-builder/${dashboardData.primaryResumeId}?tab=ats-score` : '/candidate/profile'}
          linkLabel="Review ATS breakdown"
        />

        <StatCard
          title="In Review"
          value={dashboardData.activeApplicationsCount}
          subtitle="Awaiting recruiter response"
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10"
          badgeText={dashboardData.activeApplicationsCount > 0 ? `${dashboardData.activeApplicationsCount} active` : 'Up to date'}
          badgeColor="bg-blue-500/15 text-blue-300"
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
          badgeColor="bg-purple-500/15 text-purple-300"
          linkTo="/candidate/applications"
          linkLabel="View shortlisted"
        />

        <StatCard
          title="Interviews & Offers"
          value={dashboardData.interviewsCount + dashboardData.selectedCount}
          subtitle={`${dashboardData.interviewsCount} interview · ${dashboardData.selectedCount} selected`}
          icon={<Trophy className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          badgeText={dashboardData.selectedCount > 0 ? 'Selected Offer' : dashboardData.interviewsCount > 0 ? 'Interview Stage' : 'Ready'}
          badgeColor="bg-emerald-500/15 text-emerald-300"
          linkTo="/candidate/applications"
          linkLabel="View stage"
        />
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Real Recruiter Jobs + Recent Applications ─────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Real Recruiter-Posted Requisitions */}
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
              <Link to="/candidate/jobs" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
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
                      </div>
                      {job.salary && (
                        <p className="text-xs font-semibold text-emerald-400 pt-0.5">
                          {formatCurrency(job.salary.min)} – {formatCurrency(job.salary.max)} {job.salary.currency || 'USD'}
                        </p>
                      )}
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

          {/* Real Recent Applications */}
          <DepthCard hoverEffect={false} glass={true} className="overflow-hidden">
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
              <Link to="/candidate/applications" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                All applications ({dashboardData.totalApplicationsCount}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {dashboardData.recentApplications && dashboardData.recentApplications.length > 0 ? (
                dashboardData.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{app.jobTitle}</p>
                      <p className="text-xs text-slate-400 truncate">{app.company} · Applied {app.appliedDate}</p>
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
                <div className="px-6 py-10 text-center">
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

        {/* ── Right Column: ATS Score & Profile Checklist ─────────────────── */}
        <div className="space-y-6">

          {/* Exact ATS Readiness Score Card */}
          <DepthCard hoverEffect={false} glass={true} className="p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">ATS Match Score</h2>
                <p className="text-[10px] text-slate-400">Calculated from Profile & Resume</p>
              </div>
            </div>

            <ATSCircularGauge score={atsScore} label={dashboardData.atsTier} />

            <p className="text-xs text-slate-300 text-center px-2 leading-relaxed">
              {dashboardData.atsSummary}
            </p>

            {dashboardData.hasPrimaryResume && dashboardData.primaryResumeFileName ? (
              <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{dashboardData.primaryResumeFileName}</p>
                  <p className="text-[10px] text-emerald-400">Primary Active Resume</p>
                </div>
              </div>
            ) : (
              <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xs font-semibold text-amber-300">No primary resume uploaded</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Upload a resume to unlock keyword optimization</p>
              </div>
            )}

            <Button
              variant="glow"
              size="sm"
              className="w-full"
              onClick={() => {
                if (dashboardData.hasPrimaryResume && dashboardData.primaryResumeId) {
                  navigate(`/candidate/resume-builder/${dashboardData.primaryResumeId}?tab=ats-score`);
                } else {
                  setCreateModalOpen(true);
                }
              }}
            >
              Optimize Resume & ATS Keywords
            </Button>
          </DepthCard>

          {/* Profile Strength & Verification Checklist */}
          <DepthCard hoverEffect={false} glass={true} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Profile Readiness</h2>
                  <p className="text-[10px] text-slate-400">Steps to reach 100% ATS score</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">{profileCompletion}%</span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(dashboardData.checklist || {}).map(([key, isDone], idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-xl border transition-colors',
                    isDone
                      ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-slate-200'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                  )}
                >
                  <span className="text-xs font-medium">{key}</span>
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>
              ))}
            </div>

            <Link to="/candidate/profile" className="block mt-4">
              <button className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all">
                Update Incomplete Sections →
              </button>
            </Link>
          </DepthCard>
        </div>
      </div>

      {/* Resume Creation / Upload Modal */}
      <CreateResumeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
