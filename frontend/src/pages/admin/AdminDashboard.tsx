import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  Layers,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Server,
  BarChart3,
  Clock,
  UserX,
  UserCheck,
  ShieldAlert,
  RefreshCw,
  Eye,
  FileText,
  ChevronRight,
  Check,
  X,
  Ban,
  ArrowUpRight,
  Filter,
  TrendingUp,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';
import { adminService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  AdminStats,
  SystemActivityLog,
  SecurityAlert,
  RecruitmentAnalytics
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatFullDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // State: Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics | null>(null);
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Activity Stream Filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'accounts' | 'verification' | 'security'>('all');

  // Recruiter Trust & Risk Management View Tab
  const [trustTab, setTrustTab] = useState<'recruiter' | 'company' | 'jobSafety' | 'riskReview'>('recruiter');

  // Modals
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [reviewingAlert, setReviewingAlert] = useState<SecurityAlert | null>(null);
  const [alertReviewDecision, setAlertReviewDecision] = useState<'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE'>('DISMISSED');
  const [alertReviewAction, setAlertReviewAction] = useState<'RESOLVED' | 'SUSPEND_ACCOUNT' | 'DISMISSED'>('RESOLVED');
  const [alertReviewNote, setAlertReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [statsData, analyticsData, logsData, alertsData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecruitmentAnalytics().catch(() => null),
        adminService.getActivityLogs().catch(() => []),
        adminService.getSecurityAlerts().catch(() => [])
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setLogs(logsData || []);
      setAlerts(alertsData || []);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load admin command center data:', err);
      setError(err?.message || 'Failed to connect to PostgreSQL backend service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered activity stream
  const filteredLogs = useMemo(() => {
    if (activityFilter === 'all') return logs;
    const filterTerm = activityFilter.toLowerCase();
    return logs.filter((log) => {
      const action = (log.action || '').toLowerCase();
      if (filterTerm === 'accounts') return action.includes('user') || action.includes('account') || action.includes('deletion');
      if (filterTerm === 'verification') return action.includes('recruiter') || action.includes('verif');
      if (filterTerm === 'security') return action.includes('suspicious') || action.includes('security') || action.includes('status') || action.includes('suspended');
      return true;
    });
  }, [logs, activityFilter]);

  // Handle Security Alert Review
  const handleConfirmAlertReview = async () => {
    if (!reviewingAlert) return;

    try {
      setIsSubmittingReview(true);
      await adminService.reviewSecurityAlert(reviewingAlert.id, {
        decision: alertReviewDecision,
        action: alertReviewAction,
        note: alertReviewNote || undefined
      });

      showToast({
        type: 'success',
        title: 'Review Recorded',
        message: `Security alert marked as ${alertReviewDecision}.`
      });

      setReviewingAlert(null);
      setAlertReviewNote('');
      await loadDashboardData(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Review Failed',
        message: err?.message || 'Failed to submit security alert decision.'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filtered audit modal logs
  const filteredAuditLogs = useMemo(() => {
    if (!auditSearchTerm.trim()) return logs;
    const q = auditSearchTerm.toLowerCase().trim();
    return logs.filter(
      (l) =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.target || '').toLowerCase().includes(q) ||
        (l.actorName || '').toLowerCase().includes(q) ||
        (l.ipAddress || '').toLowerCase().includes(q)
    );
  }, [logs, auditSearchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3.5 w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Platform Operations Center Unavailable</h2>
          <p className="text-xs text-rose-300 leading-relaxed">
            {error || 'Unable to retrieve real-time governance and recruitment analytics from the PostgreSQL database.'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => loadDashboardData()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const adminName = user?.name || 'Marcus Vance';
  const adminEmail = user?.email || 'admin@ai-ats.internal';
  const pendingAlertsCount = alerts.filter((a) => a.reviewStatus === 'PENDING').length;
  const totalPersistedAccounts = (stats.totalCandidates || 0) + (stats.totalRecruiters || 0);

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-slate-100">
      {/* 1. PROFESSIONAL ADMIN COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
            <span>Administrator</span>
            <span className="text-slate-600">/</span>
            <span className="text-violet-400">System Overview</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Platform Operations Center
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor recruitment activity, account governance, job publishing, and platform integrity from one centralized workspace.
          </p>
        </div>

        {/* Right Action Bar & Administrator Profile */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Identity Pill */}
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-[10px]">
              {adminName[0]}
            </div>
            <div>
              <p className="font-bold text-white leading-tight">{adminName}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">{adminEmail}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-violet-500/15 text-violet-300 border border-violet-500/20">
              GOVERNOR
            </span>
          </div>

          {/* Refresh Dashboard */}
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all duration-200"
            title={lastRefreshedAt ? `Last synchronized: ${lastRefreshedAt.toLocaleTimeString()}` : 'Synchronize live records'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* View Audit Log */}
          <Link
            to="/admin/audit"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all duration-200"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit & Security</span>
          </Link>

          {/* Manage Users */}
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-violet-950/40"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* 2. OPERATIONAL STATUS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2.5 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Database Engine</span>
            <span className="font-bold text-slate-200">PostgreSQL Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Security Perimeter</span>
            <span className="font-bold text-slate-200">Single-Admin Enforced</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              stats.pendingVerifications > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Recruiter Review Queue</span>
            <span className={`font-bold ${stats.pendingVerifications > 0 ? 'text-amber-300' : 'text-slate-200'}`}>
              {stats.pendingVerifications === 0 ? 'Queue Clear' : `${stats.pendingVerifications} Pending`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Job Moderation</span>
            <span className="font-bold text-cyan-300">{stats.activeJobs} Active Requisitions</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 flex items-center gap-2.5 px-2 border-l border-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              pendingAlertsCount > 0 ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Security Anomalies</span>
            <span className={`font-bold ${pendingAlertsCount > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {pendingAlertsCount === 0 ? 'Zero Flags' : `${pendingAlertsCount} Unresolved`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. INTELLIGENT OVERVIEW METRICS (GRID) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Registered Accounts */}
        <Link
          to="/admin/users"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{totalPersistedAccounts}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-blue-400 group-hover:underline inline-flex items-center gap-0.5">
              Manage accounts <ArrowRight className="w-3 h-3" />
            </span>
            <span>{stats.activeUsers} active</span>
          </div>
        </Link>

        {/* Card 2: Candidates */}
        <Link
          to="/admin/users?role=candidate"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidates</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-300 tracking-tight">{stats.totalCandidates}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-sky-400 group-hover:underline inline-flex items-center gap-0.5">
              Candidate directory <ArrowRight className="w-3 h-3" />
            </span>
            <span>Job seeker pool</span>
          </div>
        </Link>

        {/* Card 3: Recruiters */}
        <Link
          to="/admin/users?role=recruiter"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recruiters</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-300 tracking-tight">{stats.totalRecruiters}</div>
          <div className="mt-2 text-[10px] text-slate-400 truncate">
            <span className="text-emerald-400 font-semibold">{stats.verifiedRecruiters} verified</span> ·{' '}
            <span className="text-amber-400 font-semibold">{stats.pendingVerifications} pending</span> ·{' '}
            <span className="text-rose-400 font-semibold">{stats.rejectedRecruiters} rejected</span>
          </div>
        </Link>

        {/* Card 4: Pending Verification */}
        <Link
          to="/admin/recruiters"
          className={`p-4 rounded-2xl border transition-all duration-200 group block ${
            stats.pendingVerifications > 0
              ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 tracking-tight">{stats.pendingVerifications}</span>
            {stats.pendingVerifications > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                ACTION REQ
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-amber-400 group-hover:underline inline-flex items-center gap-0.5">
            Open review queue <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Card 5: Verified Employers */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Recruiters</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300 tracking-tight">{stats.verifiedRecruiters}</div>
          <p className="mt-2 text-[11px] text-slate-400">Authorized to publish requisitions</p>
        </div>

        {/* Card 6: Active Job Postings */}
        <Link
          to="/admin/jobs"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Job Postings</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 tracking-tight">{stats.activeJobs}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-cyan-400 group-hover:underline inline-flex items-center gap-0.5">
              Moderate postings <ArrowRight className="w-3 h-3" />
            </span>
            <span>{stats.totalJobs} total</span>
          </div>
        </Link>

        {/* Card 7: Total Applications */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-violet-300 tracking-tight">
            {analytics?.totalApplications ?? stats.totalApplications}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{analytics?.shortlisted ?? stats.shortlistedCount} shortlisted</span>
            <span className="text-emerald-400 font-semibold">{analytics?.successfulHires ?? stats.selectedCount} hires</span>
          </div>
        </div>

        {/* Card 8: Suspended Accounts */}
        <Link
          to="/admin/users?status=suspended"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspended Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-300 tracking-tight">{stats.suspendedAccounts}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-rose-400 group-hover:underline inline-flex items-center gap-0.5">
              Inspect restricted <ArrowRight className="w-3 h-3" />
            </span>
            <span>{stats.suspendedAccounts === 0 ? 'Perimeter clean' : 'Access blocked'}</span>
          </div>
        </Link>
      </div>

      {/* ─── 3.5 DEDICATED RECRUITER TRUST & RISK MANAGEMENT SECTION ─── */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Recruiter Trust & Risk Management</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  GOVERNANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evidence-based recruiter vetting, company authenticity checks, job safety moderation, and AI-assisted risk monitoring.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/recruiters"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-950/40"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Verification Queue</span>
            </Link>
            <Link
              to="/admin/jobs"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Job Moderation</span>
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
          <button
            onClick={() => setTrustTab('recruiter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              trustTab === 'recruiter'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>A. Recruiter Verification</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900/60 font-mono">
              {stats.totalRecruiters}
            </span>
          </button>

          <button
            onClick={() => setTrustTab('company')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              trustTab === 'company'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B. Company Verification</span>
            {(stats.companiesAwaitingReview ?? 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setTrustTab('jobSafety')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              trustTab === 'jobSafety'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>C. Job Safety Moderation</span>
            {(stats.jobsPendingModeration ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {stats.jobsPendingModeration}
              </span>
            )}
          </button>

          <button
            onClick={() => setTrustTab('riskReview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              trustTab === 'riskReview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>D. Risk Review & Signals</span>
            {(stats.highPriorityRiskCases ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono">
                {stats.highPriorityRiskCases} High
              </span>
            )}
          </button>
        </div>

        {/* VIEW A: RECRUITER VERIFICATION OVERVIEW */}
        {trustTab === 'recruiter' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered Recruiters</span>
                <div className="text-xl font-black text-white">{stats.totalRecruiters}</div>
                <p className="text-[10px] text-slate-400">Total accounts with recruiter role</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Review</span>
                <div className="text-xl font-black text-amber-300">{stats.pendingVerifications}</div>
                <p className="text-[10px] text-amber-200/70">Awaiting initial evaluation</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Verified Recruiters</span>
                <div className="text-xl font-black text-emerald-300">{stats.verifiedRecruiters}</div>
                <p className="text-[10px] text-emerald-200/70">Authorized job posters</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rejected Applications</span>
                <div className="text-xl font-black text-rose-300">{stats.rejectedRecruiters}</div>
                <p className="text-[10px] text-rose-200/70">Declined verification requests</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Suspended Recruiters</span>
                <div className="text-xl font-black text-rose-400">{stats.suspendedRecruiters}</div>
                <p className="text-[10px] text-slate-400">Restricted for compliance review</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Additional Evidence Req.</span>
                <div className="text-xl font-black text-cyan-300">{stats.additionalEvidenceRequiredRecruiters ?? 0}</div>
                <p className="text-[10px] text-cyan-200/70">Guidance sent to recruiter</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verification requires independent admin review. Registration alone never grants publishing privileges.</span>
              </span>
              <Link to="/admin/recruiters" className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                Open Workspace <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* VIEW B: COMPANY VERIFICATION OVERVIEW */}
        {trustTab === 'company' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Awaiting Review</span>
                <div className="text-xl font-black text-amber-300">{stats.companiesAwaitingReview ?? 0}</div>
                <p className="text-[10px] text-amber-200/70">Entities with unverified profile</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Verified Identities</span>
                <div className="text-xl font-black text-emerald-300">{stats.companiesVerified ?? 0}</div>
                <p className="text-[10px] text-emerald-200/70">Authenticity checks confirmed</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Association Pending</span>
                <div className="text-xl font-black text-indigo-300">{stats.companyAssociationChecksPending ?? 0}</div>
                <p className="text-[10px] text-indigo-200/70">Representative checks ongoing</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Verification Discrepancies</span>
                <div className="text-xl font-black text-rose-300">{stats.companyDiscrepanciesCount ?? 0}</div>
                <p className="text-[10px] text-rose-200/70">Website or registry mismatch</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Re-verification Required</span>
                <div className="text-xl font-black text-white">{stats.companiesReverificationRequired ?? 0}</div>
                <p className="text-[10px] text-slate-400">Changes requiring re-audit</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Company authenticity reviews verify business registration numbers, tax IDs, and official domain emails.</span>
              </span>
              <Link to="/admin/recruiters" className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                Inspect Company Checks <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* VIEW C: JOB SAFETY OVERVIEW */}
        {trustTab === 'jobSafety' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Moderation</span>
                <div className="text-xl font-black text-amber-300">{stats.jobsPendingModeration ?? 0}</div>
                <p className="text-[10px] text-amber-200/70">Submitted awaiting approval</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Published Jobs</span>
                <div className="text-xl font-black text-emerald-300">{stats.jobsPublished ?? stats.activeJobs}</div>
                <p className="text-[10px] text-emerald-200/70">Live in candidate discovery</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rejected Jobs</span>
                <div className="text-xl font-black text-rose-300">{stats.jobsRejected ?? 0}</div>
                <p className="text-[10px] text-rose-200/70">Requisition feedback returned</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Flagged Suspicious</span>
                <div className="text-xl font-black text-rose-300">{stats.jobsFlaggedSuspicious ?? 0}</div>
                <p className="text-[10px] text-rose-200/70">Safety rule alerts triggered</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Candidate Reported</span>
                <div className="text-xl font-black text-indigo-300">{stats.jobsCandidateReported ?? 0}</div>
                <p className="text-[10px] text-indigo-200/70">Active complaints submitted</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unpublished / Investigation</span>
                <div className="text-xl font-black text-white">{stats.jobsUnpublishedForInvestigation ?? 0}</div>
                <p className="text-[10px] text-slate-400">Withdrawn from discovery</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Jobs remain hidden from candidates until approved by an administrator and associated with an active verified recruiter.</span>
              </span>
              <Link to="/admin/jobs" className="text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                Go to Moderation Console <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* VIEW D: RISK REVIEW OVERVIEW */}
        {trustTab === 'riskReview' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-950/25 border border-rose-500/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">High-Priority Cases</span>
                <div className="text-xl font-black text-rose-300">{stats.highPriorityRiskCases ?? 0}</div>
                <p className="text-[10px] text-rose-200/70">Requires urgent decision</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Duplicate Profiles</span>
                <div className="text-xl font-black text-white">{stats.duplicateRecruiterProfilesCount ?? 0}</div>
                <p className="text-[10px] text-slate-400">Shared phone or identity records</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Info Mismatches</span>
                <div className="text-xl font-black text-amber-300">{stats.companyInfoMismatchesCount ?? 0}</div>
                <p className="text-[10px] text-slate-400">Email vs company website domain</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unresolved Checks</span>
                <div className="text-xl font-black text-cyan-300">{stats.unresolvedAssociationChecksCount ?? 0}</div>
                <p className="text-[10px] text-slate-400">Pending employer authorization</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Moderation Violations</span>
                <div className="text-xl font-black text-rose-400">{stats.repeatedModerationViolationsCount ?? 0}</div>
                <p className="text-[10px] text-slate-400">Repeat rejections on requisitions</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Open Complaints</span>
                <div className="text-xl font-black text-amber-300">{stats.openCandidateComplaintsCount ?? 0}</div>
                <p className="text-[10px] text-amber-200/70">Candidate reports awaiting review</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Explainable AI heuristics assist administrator review. AI never automatically approves, rejects, or suspends accounts.</span>
              </span>
              <Link to="/admin/audit" className="text-rose-400 hover:underline font-semibold flex items-center gap-1">
                View Risk & Security Logs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. RECRUITMENT OPERATIONS PIPELINE */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Recruitment Operations Lifecycle</span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time pipeline progression derived directly from candidate application statuses in PostgreSQL.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Overall Placement Rate:{' '}
            <strong className="text-emerald-400 font-bold">
              {analytics?.overallPlacementRate ? `${analytics.overallPlacementRate}%` : stats.placementRate ? `${stats.placementRate}%` : 'Not available yet'}
            </strong>
          </div>
        </div>

        {/* Pipeline Stage Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
          {/* Stage 1: Active Jobs */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Active Jobs</span>
            <div className="text-xl font-black text-cyan-300">{stats.activeJobs}</div>
            <p className="text-[10px] text-slate-400">Published open</p>
          </div>

          {/* Stage 2: Applied */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">2. Applied</span>
            <div className="text-xl font-black text-white">{analytics?.totalApplications ?? stats.totalApplications}</div>
            <p className="text-[10px] text-slate-400">Submissions</p>
          </div>

          {/* Stage 3: Under Review */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">3. In Review</span>
            <div className="text-xl font-black text-amber-300">{analytics?.awaitingReview ?? stats.pendingApplications}</div>
            <p className="text-[10px] text-slate-400">Screening queue</p>
          </div>

          {/* Stage 4: Shortlisted */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">4. Shortlisted</span>
            <div className="text-xl font-black text-indigo-300">{analytics?.shortlisted ?? stats.shortlistedCount}</div>
            <p className="text-[10px] text-slate-400">
              {analytics?.applicationToShortlistRate ? `${analytics.applicationToShortlistRate}% rate` : 'Qualified'}
            </p>
          </div>

          {/* Stage 5: Interviewing */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">5. Interview</span>
            <div className="text-xl font-black text-violet-300">{analytics?.interviewsScheduled ?? 0}</div>
            <p className="text-[10px] text-slate-400">
              {analytics?.shortlistToInterviewRate ? `${analytics.shortlistToInterviewRate}% advanced` : 'Evaluations'}
            </p>
          </div>

          {/* Stage 6: Selected / Hired */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 relative group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">6. Hired</span>
            <div className="text-xl font-black text-emerald-400">{analytics?.successfulHires ?? stats.selectedCount}</div>
            <p className="text-[10px] text-emerald-400/80 font-semibold">Placement verified</p>
          </div>
        </div>
      </div>

      {/* 5. PARTICIPATION & PERFORMANCE (SPLIT PANELS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel A: Candidate Activity */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Candidate Pool Dynamics</h3>
                <p className="text-[11px] text-slate-400">Registered job seekers & engagement</p>
              </div>
            </div>
            <Link to="/admin/users?role=candidate" className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold">
              <span>View pool</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Candidates</span>
              <p className="text-lg font-black text-white">{stats.totalCandidates}</p>
              <p className="text-[10px] text-slate-400">Registered platform profiles</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Applications</span>
              <p className="text-lg font-black text-sky-300">{analytics?.totalApplications ?? stats.totalApplications}</p>
              <p className="text-[10px] text-slate-400">Submitted submissions</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Interviews Scheduled</span>
              <p className="text-lg font-black text-violet-300">{analytics?.interviewsScheduled ?? 0}</p>
              <p className="text-[10px] text-slate-400">Employer interview invites</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Successful Hires</span>
              <p className="text-lg font-black text-emerald-300">{analytics?.successfulHires ?? stats.selectedCount}</p>
              <p className="text-[10px] text-emerald-400/80 font-medium">Offers & confirmed hires</p>
            </div>
          </div>
        </div>

        {/* Panel B: Recruiter Activity */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Recruiter & Employer Operations</h3>
                <p className="text-[11px] text-slate-400">Company verification & job publishing</p>
              </div>
            </div>
            <Link to="/admin/recruiters" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold">
              <span>Verifications</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Recruiters</span>
              <p className="text-lg font-black text-white">{stats.totalRecruiters}</p>
              <p className="text-[10px] text-slate-400">Employer accounts in DB</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Verified Recruiters</span>
              <p className="text-lg font-black text-emerald-300">{stats.verifiedRecruiters}</p>
              <p className="text-[10px] text-slate-400">Authorized hiring managers</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Published Requisitions</span>
              <p className="text-lg font-black text-cyan-300">{stats.totalJobs}</p>
              <p className="text-[10px] text-slate-400">{stats.activeJobs} currently active</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Pending Review</span>
              <p className="text-lg font-black text-amber-300">{stats.pendingVerifications}</p>
              <p className="text-[10px] text-slate-400">Employer verification queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ADMINISTRATOR TASK CENTER ("REQUIRES YOUR ATTENTION") */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Requires Your Attention</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Urgent Administrative Tasks</span>
        </div>

        {stats.pendingVerifications === 0 && pendingAlertsCount === 0 && stats.suspendedAccounts === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white">All caught up — Platform in full compliance & optimal standing</p>
            <p className="text-xs text-slate-400">No pending employer verification requests or security violations require action.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Task 1: Recruiter Verifications */}
            {stats.pendingVerifications > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Recruiter Verification</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {stats.pendingVerifications} Recruiter {stats.pendingVerifications === 1 ? 'Application' : 'Applications'} Awaiting Review
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unverified recruiters cannot publish active job requisitions until administrator approval is granted.
                  </p>
                </div>
                <Link
                  to="/admin/recruiters"
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition-colors block shadow-md shadow-amber-950/50"
                >
                  Review Credentials
                </Link>
              </div>
            )}

            {/* Task 2: Security & Risk Alerts */}
            {pendingAlertsCount > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/15 border border-rose-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Security Anomaly</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                      SECURITY REVIEW
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {pendingAlertsCount} Unresolved Security {pendingAlertsCount === 1 ? 'Alert' : 'Alerts'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Risk indicators logged by automated detection rules (duplicate registration, impersonation, or unverified publishing attempts).
                  </p>
                </div>
                <button
                  onClick={() => alerts.length > 0 && setReviewingAlert(alerts[0])}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center transition-colors block shadow-md shadow-rose-950/50"
                >
                  Inspect Security Alerts
                </button>
              </div>
            )}

            {/* Task 3: Suspended Accounts */}
            {stats.suspendedAccounts > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Governance</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      GOVERNANCE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {stats.suspendedAccounts} Suspended {stats.suspendedAccounts === 1 ? 'Account' : 'Accounts'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    User accounts currently restricted by moderation. Review for reactivation or permanent removal.
                  </p>
                </div>
                <Link
                  to="/admin/users?status=suspended"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center transition-colors block border border-slate-700"
                >
                  Manage Suspended Accounts
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. PLATFORM INTEGRITY & SECURITY ALERTS */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Platform Integrity & Security Alerts</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Automated Anomaly Detection</span>
        </div>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs italic">
            Zero security violations or suspicious account attempts detected. Single-administrator perimeter intact.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {alerts.slice(0, 5).map((al) => (
              <div key={al.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        al.riskLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : al.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {al.riskLevel} RISK
                    </span>
                    <span className="font-bold text-white">{al.riskCategory}</span>
                    <span className="text-slate-500 text-[10px] font-mono">{al.accountEmail}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{al.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      al.reviewStatus === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : al.reviewStatus === 'CONFIRMED'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {al.reviewStatus}
                  </span>
                  {al.reviewStatus === 'PENDING' && (
                    <button
                      onClick={() => setReviewingAlert(al)}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-semibold transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. RECENT PLATFORM ACTIVITY STREAM & QUICK ACTIONS (SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Administrative Actions */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-white tracking-tight">Quick Administrative Actions</h3>
          <div className="space-y-2.5">
            <Link
              to="/admin/recruiters"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Review Recruiter Verifications</h4>
                  <p className="text-[10px] text-slate-400">{stats.pendingVerifications} in queue</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/users"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Identity & Access Governance</h4>
                  <p className="text-[10px] text-slate-400">Manage candidates & recruiters</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/jobs"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Moderate Job Postings</h4>
                  <p className="text-[10px] text-slate-400">{stats.activeJobs} active requisitions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/audit"
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Audit & Security Center</h4>
                  <p className="text-[10px] text-slate-400">Enterprise telemetry & audit trail</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Recent Platform Activity Stream</h3>
              <p className="text-xs text-slate-500">Chronological PostgreSQL Audit Trail</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activityFilter === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityFilter('accounts')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activityFilter === 'accounts' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Accounts
              </button>
              <button
                onClick={() => setActivityFilter('verification')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activityFilter === 'verification' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Verification
              </button>
              <button
                onClick={() => setActivityFilter('security')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activityFilter === 'security' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security
              </button>
            </div>
          </div>

          <Card glass className="p-4 divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic">
                No activity records found for the selected filter.
              </div>
            ) : (
              filteredLogs.slice(0, 10).map((log) => {
                const roleUpper = (log.actorRole || '').toUpperCase();
                return (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.actorName}</span>
                        <Badge variant={roleUpper === 'ADMIN' ? 'warning' : 'primary'} size="sm">
                          {roleUpper || 'USER'}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-[11px] truncate">
                        <span className="font-bold text-violet-300">{log.action}: </span>
                        <span>{log.target}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>

      {/* 9. MODAL: SYSTEM ACTIVITY & AUDIT LOG */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="SYSTEM ACTIVITY & AUDIT LOG"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Persisted audit events from PostgreSQL database.</p>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No activity records matched your audit search.</div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-slate-900/50 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-300">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp ? formatFullDate(log.timestamp) : ''}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.target}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Actor: <strong className="text-slate-400">{log.actorName}</strong> ({log.actorRole})</span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsAuditModalOpen(false)}>
              Close Audit Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. MODAL: SECURITY ALERT REVIEW */}
      <Modal
        isOpen={!!reviewingAlert}
        onClose={() => !isSubmittingReview && setReviewingAlert(null)}
        title="SECURITY ALERT MODERATION"
        maxWidth="md"
      >
        {reviewingAlert && (
          <div className="space-y-4 text-xs text-left">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Risk Anomaly: {reviewingAlert.riskCategory}</span>
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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
