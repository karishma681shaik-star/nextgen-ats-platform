import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Briefcase,
  FileText,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Activity,
  Check,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { adminService } from '../../services';
import { voiceAssistantService, WorkspaceContext } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { AIAssistantEmblem, AIAudioWaveform } from '../../components/common/AIAssistantEmblem';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  AdminStats,
  SystemActivityLog,
  SecurityAlert,
  RecruitmentAnalytics,
  PlatformHealthResponse,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { AdminDashboardSkeleton } from '../../components/loading';

function formatTimestamp(ts?: string): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // State: Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics | null>(null);
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [health, setHealth] = useState<PlatformHealthResponse | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Security Alert Review Modal
  const [reviewingAlert, setReviewingAlert] = useState<SecurityAlert | null>(null);
  const [alertReviewDecision, setAlertReviewDecision] = useState<'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE'>('DISMISSED');
  const [alertReviewAction, setAlertReviewAction] = useState<'RESOLVED' | 'SUSPEND_ACCOUNT' | 'DISMISSED'>('RESOLVED');
  const [alertReviewNote, setAlertReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Subscribe to real-time speech synthesis state
  useEffect(() => {
    return voiceAssistantService.subscribe((speaking) => {
      setIsAiSpeaking(speaking);
    });
  }, []);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [statsData, analyticsData, logsData, alertsData, healthData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecruitmentAnalytics().catch(() => null),
        adminService.getActivityLogs().catch(() => []),
        adminService.getSecurityAlerts().catch(() => []),
        adminService.getPlatformHealth().catch(() => null),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setLogs(logsData || []);
      setAlerts(alertsData || []);
      setHealth(healthData);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load admin overview data:', err);
      setError(err?.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Determine actual database connection status from backend health or stats response
  const dbStatus = useMemo<'Connected' | 'Degraded' | 'Unavailable' | 'Unknown'>(() => {
    if (!stats) return 'Unknown';
    if (health?.services) {
      const dbService = health.services.find(
        (s) => s.category?.toLowerCase() === 'database' || s.serviceName?.toLowerCase().includes('database') || s.serviceName?.toLowerCase().includes('postgresql')
      );
      if (dbService) {
        if (dbService.status === 'OPERATIONAL') return 'Connected';
        if (dbService.status === 'DEGRADED') return 'Degraded';
        return 'Unavailable';
      }
    }
    // If stats loaded successfully from PostgreSQL, database is confirmed connected
    return 'Connected';
  }, [stats, health]);

  const pendingAlertsCount = useMemo(() => {
    return alerts.filter((a) => a.reviewStatus === 'PENDING').length;
  }, [alerts]);

  // Automatic full-length welcome speech trigger on login
  useEffect(() => {
    if (!isLoading && user) {
      const userIdKey = user?.id || 'admin_session';
      const welcomeKey = `ai_ats_voice_welcome_done_${userIdKey}`;
      const isPending = sessionStorage.getItem('ai_ats_pending_voice_welcome') === 'true';
      const alreadySpoken = sessionStorage.getItem(welcomeKey) === 'true';

      if (isPending && !alreadySpoken && !voiceAssistantService.isSpeaking()) {
        sessionStorage.setItem(welcomeKey, 'true');
        sessionStorage.removeItem('ai_ats_pending_voice_welcome');
        const context: WorkspaceContext = {
          pendingRecruiterCount: stats?.pendingVerifications || 0,
          flaggedAccountsCount: pendingAlertsCount || 0,
          systemAlertsCount: health?.incidents && health.incidents.length > 0 ? health.incidents.length : 0,
        };
        voiceAssistantService.welcomeUser(
          user,
          'admin',
          context
        );
      }
    }
  }, [isLoading, user, stats?.pendingVerifications, pendingAlertsCount, health?.incidents?.length]);

  // Handle Security Alert Review submission
  const handleConfirmAlertReview = async () => {
    if (!reviewingAlert) return;

    try {
      setIsSubmittingReview(true);
      await adminService.reviewSecurityAlert(reviewingAlert.id, {
        decision: alertReviewDecision,
        action: alertReviewAction,
        note: alertReviewNote || undefined,
      });

      showToast({
        type: 'success',
        title: 'Review Recorded',
        message: `Security alert marked as ${alertReviewDecision}.`,
      });

      setReviewingAlert(null);
      setAlertReviewNote('');
      await loadDashboardData(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Review Failed',
        message: err?.message || 'Failed to submit security alert decision.',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Items requiring attention — only included when real pending records exist
  const attentionItems = useMemo(() => {
    if (!stats) return [];
    const items: Array<{
      id: string;
      title: string;
      count: number;
      description: string;
      actionLabel: string;
      actionUrl?: string;
      onAction?: () => void;
    }> = [];

    // 1. Recruiter Verification
    if (stats.pendingVerifications > 0) {
      items.push({
        id: 'recruiter-verification',
        title: 'Recruiter Verification',
        count: stats.pendingVerifications,
        description: `${stats.pendingVerifications} ${
          stats.pendingVerifications === 1 ? 'application is' : 'applications are'
        } waiting for review.`,
        actionLabel: 'Review Applications',
        actionUrl: '/admin/recruiters',
      });
    }

    // 2. Job Moderation
    if ((stats.jobsPendingModeration ?? 0) > 0) {
      const count = stats.jobsPendingModeration!;
      items.push({
        id: 'job-moderation',
        title: 'Job Moderation',
        count,
        description: `${count} ${count === 1 ? 'job requires' : 'jobs require'} review.`,
        actionLabel: 'Review Jobs',
        actionUrl: '/admin/jobs',
      });
    }

    // 3. Security Alerts
    if (pendingAlertsCount > 0) {
      items.push({
        id: 'security-alerts',
        title: 'Security Alerts',
        count: pendingAlertsCount,
        description: `${pendingAlertsCount} security ${
          pendingAlertsCount === 1 ? 'alert requires' : 'alerts require'
        } investigation.`,
        actionLabel: 'Inspect Alerts',
        onAction: () => {
          const firstPending = alerts.find((a) => a.reviewStatus === 'PENDING') || alerts[0];
          if (firstPending) setReviewingAlert(firstPending);
        },
      });
    }

    // 4. Suspended Accounts
    if ((stats.suspendedAccounts ?? 0) > 0) {
      const count = stats.suspendedAccounts;
      items.push({
        id: 'suspended-accounts',
        title: 'Suspended Accounts',
        count,
        description: `${count} ${
          count === 1 ? 'account is suspended and requires' : 'accounts are suspended and require'
        } review.`,
        actionLabel: 'Review Accounts',
        actionUrl: '/admin/users?status=suspended',
      });
    }

    return items;
  }, [stats, pendingAlertsCount, alerts]);

  // Loading Skeleton State
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Error State with Retry
  if (error || (!stats && !isLoading)) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-16">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white">Unable to load dashboard data. Please try again.</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'Unable to connect to backend services. Please check database connectivity and retry.'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => loadDashboardData()}
          className="bg-violet-600 hover:bg-violet-500 text-white"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const cleanAdminName = voiceAssistantService.resolveFullName(user);
  const adminName = cleanAdminName || 'Administrator';

  const handleListenGreeting = () => {
    soundEffectService.playActionChime();
    const context: WorkspaceContext = {
      pendingRecruiterCount: stats?.pendingVerifications || 0,
      flaggedAccountsCount: pendingAlertsCount || 0,
      systemAlertsCount: health?.incidents && health.incidents.length > 0 ? health.incidents.length : 0,
    };
    if (voiceAssistantService.isSpeaking()) {
      voiceAssistantService.stop();
    } else if (voiceAssistantService.isAutoplayBlocked()) {
      voiceAssistantService.retryBlockedSpeech();
    } else {
      voiceAssistantService.welcomeUser(
        user || { name: adminName, role: 'admin' },
        'admin',
        context,
        { force: true }
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* ==================================================
          1. SIMPLIFIED PAGE HEADER
          ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor accounts, recruiter verification, and recruitment activity from one place.
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Ambient Voice Assistant Trigger */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/20 backdrop-blur-md">
            <AIAssistantEmblem size="sm" isSpeaking={isAiSpeaking} />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-300">Nexus AI</span>
              <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                {isAiSpeaking ? 'Speaking...' : voiceAssistantService.isAutoplayBlocked() ? 'Tap to play' : 'Voice Assistant'}
              </span>
            </div>
            <AIAudioWaveform isSpeaking={isAiSpeaking} />
            <button
              type="button"
              onClick={handleListenGreeting}
              title={isAiSpeaking ? 'Stop voice assistant' : voiceAssistantService.isAutoplayBlocked() ? 'Enable voice welcome' : 'Listen to personalized greeting'}
              aria-label={isAiSpeaking ? 'Stop voice assistant' : 'Listen to personalized greeting'}
              className="ml-1 p-1 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current administrator's identity */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <div className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-white">{adminName}</span>
          </div>

          {/* Optional link to Audit & Security */}
          <Link
            to="/admin/audit"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit & Security</span>
          </Link>

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title={lastRefreshedAt ? `Last refreshed: ${lastRefreshedAt.toLocaleTimeString()}` : 'Refresh data'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-violet-400' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ==================================================
          2. COMPACT PLATFORM STATUS STRIP
          ================================================== */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
        {/* Database Connection Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === 'Connected'
                ? 'bg-emerald-400'
                : dbStatus === 'Degraded'
                ? 'bg-amber-400'
                : dbStatus === 'Unavailable'
                ? 'bg-rose-400'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-slate-400">Database:</span>
          <span className="font-semibold text-white">{dbStatus}</span>
        </div>

        <span className="hidden sm:inline text-slate-700">|</span>

        {/* Recruiter Verification Queue Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              stats.pendingVerifications > 0
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-400">Recruiter Reviews:</span>
          <span className={`font-semibold ${stats.pendingVerifications > 0 ? 'text-amber-300' : 'text-white'}`}>
            {stats.pendingVerifications > 0 ? `${stats.pendingVerifications} Pending` : 'Up to date'}
          </span>
        </div>

        <span className="hidden sm:inline text-slate-700">|</span>

        {/* Platform Alerts */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              pendingAlertsCount > 0
                ? 'bg-rose-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-400">Security Alerts:</span>
          <span className={`font-semibold ${pendingAlertsCount > 0 ? 'text-rose-300' : 'text-white'}`}>
            {pendingAlertsCount > 0 ? `${pendingAlertsCount} Open` : '0 Open'}
          </span>
        </div>
      </div>

      {/* ==================================================
          3. FOUR PRIMARY SUMMARY CARDS (GRID)
          ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: REGISTERED USERS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalUsers ?? (stats.totalCandidates + stats.totalRecruiters)}
              <span className="text-sm font-normal text-slate-400 ml-1.5">total</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{stats.totalCandidates}</span> Candidates
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-slate-300 font-medium">{stats.totalRecruiters}</span> Recruiters
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2: RECRUITER VERIFICATION */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recruiter Verification</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {stats.pendingVerifications}
              <span className="text-sm font-normal text-amber-300 ml-1.5">Pending</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{stats.verifiedRecruiters}</span> Verified
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-slate-400 font-medium">{stats.rejectedRecruiters ?? 0}</span> Rejected
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <Link
              to="/admin/recruiters"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>Review Applications</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* CARD 3: JOB POSTINGS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Postings</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {stats.activeJobs}
              <span className="text-sm font-normal text-cyan-300 ml-1.5">Active</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{stats.jobsPendingModeration ?? 0}</span> Pending Moderation
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-slate-400 font-medium">{stats.totalJobs}</span> Total
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <Link
              to="/admin/jobs"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>Manage Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* CARD 4: CANDIDATE APPLICATIONS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Applications</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {analytics?.totalApplications ?? stats.totalApplications}
              <span className="text-sm font-normal text-slate-400 ml-1.5">Total</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <span className="text-amber-300 font-medium">{analytics?.awaitingReview ?? stats.pendingApplications ?? 0}</span> In Review
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-indigo-300 font-medium">{analytics?.shortlisted ?? stats.shortlistedCount ?? 0}</span> Shortlisted
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <Link
              to="/admin/jobs"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>View Recruitment Activity</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================
          4. REQUIRES ATTENTION SECTION
          ================================================== */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Requires Attention</h2>
          </div>
          {attentionItems.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {attentionItems.length} {attentionItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {attentionItems.length === 0 ? (
          <div className="py-6 flex items-center justify-center gap-3 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span>You're all caught up. No pending actions require attention.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 flex flex-col justify-between transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {item.count} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  {item.onAction ? (
                    <button
                      onClick={item.onAction}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs text-center transition-colors"
                    >
                      {item.actionLabel}
                    </button>
                  ) : (
                    <Link
                      to={item.actionUrl || '#'}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs text-center transition-colors block"
                    >
                      {item.actionLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================
          5. RECENT ACTIVITY SECTION
          ================================================== */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-400">Latest administrator actions and platform events.</p>
          </div>
          <Link
            to="/admin/audit"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All in Audit & Security</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No recent activity is available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-medium">Action</th>
                  <th className="pb-2.5 font-medium">Actor</th>
                  <th className="pb-2.5 font-medium">Target / Resource</th>
                  <th className="pb-2.5 font-medium">Date & Time</th>
                  <th className="pb-2.5 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.slice(0, 8).map((log) => {
                  const isSuccess = !log.result || log.result.toUpperCase() === 'SUCCESS';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-semibold text-white max-w-[200px] truncate pr-3">
                        {log.action}
                      </td>
                      <td className="py-3 text-slate-300 pr-3 whitespace-nowrap">
                        <span>{log.actorName}</span>
                        {log.actorRole && (
                          <span className="text-[10px] text-slate-500 uppercase ml-1.5 font-mono">
                            ({log.actorRole})
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-400 max-w-[280px] truncate pr-3 font-mono text-[11px]" title={log.target}>
                        {log.target}
                      </td>
                      <td className="py-3 text-slate-400 whitespace-nowrap pr-3 font-mono text-[11px]">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {log.result ? log.result.toUpperCase() : 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          6. MODAL: SECURITY ALERT REVIEW
          ================================================== */}
      <Modal
        isOpen={!!reviewingAlert}
        onClose={() => !isSubmittingReview && setReviewingAlert(null)}
        title="Security Alert Review"
        maxWidth="md"
      >
        {reviewingAlert && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Anomaly: {reviewingAlert.riskCategory}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{reviewingAlert.description}</p>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Account Email:</span>
                <span className="text-indigo-300 font-mono">{reviewingAlert.accountEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Role:</span>
                <span className="text-purple-300 uppercase font-bold">{reviewingAlert.accountRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Risk Level:</span>
                <span className="text-rose-400 font-bold">{reviewingAlert.riskLevel}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">Administrative Decision:</label>
              <select
                value={alertReviewDecision}
                onChange={(e) => setAlertReviewDecision(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-violet-500"
              >
                <option value="DISMISSED">Dismiss Alert (Benign)</option>
                <option value="FALSE_POSITIVE">Mark False Positive</option>
                <option value="CONFIRMED">Confirm Security Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">Action to Take:</label>
              <select
                value={alertReviewAction}
                onChange={(e) => setAlertReviewAction(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-violet-500"
              >
                <option value="RESOLVED">Resolve Without Suspension</option>
                <option value="SUSPEND_ACCOUNT">Suspend Associated Account</option>
                <option value="DISMISSED">Dismiss Without Action</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">Administrative Note (Optional):</label>
              <input
                type="text"
                placeholder="Enter review notes..."
                value={alertReviewNote}
                onChange={(e) => setAlertReviewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewingAlert(null)}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAlertReview}
                isLoading={isSubmittingReview}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                Submit Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
