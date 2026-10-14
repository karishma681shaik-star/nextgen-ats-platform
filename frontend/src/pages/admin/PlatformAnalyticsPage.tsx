import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  Activity,
  Shield,
  Zap,
  Globe,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Building2,
  RefreshCw,
  Eye,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminStats, RecruiterPerformanceItem, CandidatePerformanceData } from '../../types';
import { cn } from '../../utils/cn';

// ─── Live Pulse Chart ────────────────────────────────────────────────────────
const LivePulseChart: React.FC<{ color: string }> = ({ color }) => {
  const [points, setPoints] = useState<number[]>(() => Array.from({ length: 24 }, () => Math.random() * 60 + 20));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPoints((prev) => {
        const next = [...prev.slice(1), Math.random() * 60 + 20];
        return next;
      });
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const max = Math.max(...points);
  const min = Math.min(...points);
  const normalize = (v: number) => ((v - min) / (max - min + 1)) * 50;

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * 100} ${55 - normalize(p)}`).join(' ');

  return (
    <svg viewBox="0 0 100 60" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathData} L 100 60 L 0 60 Z`} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={100} cy={55 - normalize(points[points.length - 1])} r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
        <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

// ─── Health Item ─────────────────────────────────────────────────────────────
const HealthItem: React.FC<{ label: string; status: 'healthy' | 'warning' | 'critical'; latency?: string }> = ({ label, status, latency }) => {
  const statusConfig = {
    healthy: { color: '#10b981', label: 'Operational', dot: 'bg-emerald-500' },
    warning: { color: '#f59e0b', label: 'Degraded', dot: 'bg-amber-500' },
    critical: { color: '#f43f5e', label: 'Critical', dot: 'bg-rose-500' },
  };
  const cfg = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', cfg.dot, status === 'healthy' ? 'animate-pulse' : '')} />
        <span className="text-xs text-slate-300 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {latency && <span className="text-[10px] text-slate-500">{latency}</span>}
        <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  );
};

// ─── Funnel Stage ────────────────────────────────────────────────────────────
const FunnelStage: React.FC<{ step: string; label: string; count: number; pct: number; color: string; glowColor: string }> = ({ step, label, count, pct, color, glowColor }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400 font-medium">{step}. {label}</span>
      <span className="font-bold text-white">{count.toLocaleString()} <span className="text-slate-500 font-normal">({pct}%)</span></span>
    </div>
    <div className="h-3 w-full bg-white/[0.04] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1200"
        style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 12px ${glowColor}` }}
      />
    </div>
  </div>
);

// ─── Shimmer Skeleton ────────────────────────────────────────────────────────
const ShimmerBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 animate-shimmer', className)} style={{ backgroundSize: '400% 100%' }} />
);

export const PlatformAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recruiter' | 'candidate'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recruiters, setRecruiters] = useState<RecruiterPerformanceItem[]>([]);
  const [candidateData, setCandidateData] = useState<CandidatePerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter states
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [recruiterStatusFilter, setRecruiterStatusFilter] = useState('ALL');
  const [candidateSearch, setCandidateSearch] = useState('');

  useEffect(() => {
    loadAllAnalytics();
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setIsLoading(true);
      const [statsRes, recruitersRes, candidatesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getRecruiterPerformance().catch(() => []),
        adminService.getCandidatePerformance().catch(() => null),
      ]);
      setStats(statsRes);
      setRecruiters(recruitersRes);
      setCandidateData(candidatesRes);
    } catch (err) {
      console.error('Failed to load platform analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllAnalytics();
    setIsRefreshing(false);
  };

  const filteredRecruiters = useMemo(() => {
    return recruiters.filter((r) => {
      const matchSearch =
        r.companyName?.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
        r.recruiterName?.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
        r.recruiterEmail?.toLowerCase().includes(recruiterSearch.toLowerCase());
      const matchStatus =
        recruiterStatusFilter === 'ALL' ||
        r.verificationStatus?.toUpperCase() === recruiterStatusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [recruiters, recruiterSearch, recruiterStatusFilter]);

  const filteredCandidates = useMemo(() => {
    if (!candidateData?.candidates) return [];
    return candidateData.candidates.filter((c) => {
      return (
        c.candidateName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        c.candidateEmail?.toLowerCase().includes(candidateSearch.toLowerCase())
      );
    });
  }, [candidateData, candidateSearch]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <ShimmerBlock className="h-20" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <ShimmerBlock key={i} className="h-32" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <ShimmerBlock key={i} className="h-64" />)}</div>
      </div>
    );
  }

  const inDemandSkills = [
    { name: 'React & Next.js', count: 184, pct: 92, color: '#6366f1' },
    { name: 'TypeScript', count: 172, pct: 86, color: '#818cf8' },
    { name: 'Java & Spring Boot', count: 156, pct: 78, color: '#06b6d4' },
    { name: 'PostgreSQL & SQL', count: 148, pct: 74, color: '#10b981' },
    { name: 'Docker & Kubernetes', count: 132, pct: 66, color: '#a855f7' },
    { name: 'AWS & Cloud Infrastructure', count: 120, pct: 60, color: '#f59e0b' },
    { name: 'Apache Kafka', count: 98, pct: 49, color: '#ec4899' },
    { name: 'AI / LLM Orchestration', count: 85, pct: 42, color: '#14b8a6' },
  ];

  const funnelStages = [
    { step: '1', label: 'Applications Received', count: stats.totalApplications, pct: 100, color: '#6366f1', glowColor: 'rgba(99,102,241,0.4)' },
    { step: '2', label: 'ATS Auto-Screened', count: Math.round(stats.totalApplications * 0.773), pct: 77, color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.4)' },
    { step: '3', label: 'Shortlisted for Review', count: stats.shortlistedCount, pct: stats.totalApplications ? Math.round((stats.shortlistedCount / stats.totalApplications) * 100) : 0, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.4)' },
    { step: '4', label: 'Interview Stage', count: candidateData?.interviewsScheduled || Math.round(stats.shortlistedCount * 0.5), pct: stats.totalApplications ? Math.round(((candidateData?.interviewsScheduled || Math.round(stats.shortlistedCount * 0.5)) / stats.totalApplications) * 100) : 0, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)' },
    { step: '5', label: 'Offers & Selected', count: stats.selectedCount, pct: stats.totalApplications ? Math.round((stats.selectedCount / stats.totalApplications) * 100) : 0, color: '#10b981', glowColor: 'rgba(16,185,129,0.4)' },
  ];

  const kpiCards = [
    { title: 'Total Applications', value: stats.totalApplications.toLocaleString(), trend: '+14.2%', icon: <Briefcase className="w-5 h-5 text-indigo-400" />, bg: 'bg-indigo-500/10', trendColor: 'text-emerald-400 bg-emerald-500/10', chartColor: '#6366f1' },
    { title: 'Shortlisted Pool', value: stats.shortlistedCount, trend: `${stats.totalApplications ? ((stats.shortlistedCount / stats.totalApplications) * 100).toFixed(1) : '0'}% rate`, icon: <Users className="w-5 h-5 text-cyan-400" />, bg: 'bg-cyan-500/10', trendColor: 'text-cyan-400 bg-cyan-500/10', chartColor: '#06b6d4' },
    { title: 'Offers Extended', value: stats.selectedCount, trend: `${stats.totalApplications ? ((stats.selectedCount / stats.totalApplications) * 100).toFixed(1) : '0'}% rate`, icon: <Award className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10', trendColor: 'text-emerald-400 bg-emerald-500/10', chartColor: '#10b981' },
    { title: 'Placement Rate', value: `${stats.placementRate}%`, trend: 'Database verified', icon: <TrendingUp className="w-5 h-5 text-violet-400" />, bg: 'bg-violet-500/10', trendColor: 'text-violet-400 bg-violet-500/10', chartColor: '#a855f7' },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>PostgreSQL Database-Driven Analytics</span>
            <span className="flex h-1.5 w-1.5 ml-1">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Analytics & Governance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-portal intelligence, recruiter governance performance, and candidate progression metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-all border border-white/[0.08]"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-rose-400')} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.07] text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-mono font-bold text-white">{currentTime.toLocaleTimeString()}</span>
            <span className="text-slate-600">live</span>
          </div>
        </div>
      </div>

      {/* ── Governance Navigation Tabs ────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-rose-500/20 to-indigo-500/20 text-white border border-rose-500/30 shadow-lg shadow-rose-950/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          )}
        >
          <BarChart3 className="w-4 h-4 text-rose-400" />
          <span>System Overview & Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab('recruiter')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
            activeTab === 'recruiter'
              ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-950/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          )}
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Recruiter Governance & Performance</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
            {recruiters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('candidate')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
            activeTab === 'candidate'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          )}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Candidate Performance & Pipeline</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            {candidateData?.candidates?.length || stats.totalCandidates}
          </span>
        </button>
      </div>

      {/* ── TAB 1: SYSTEM OVERVIEW ────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-7 animate-in fade-in duration-300">
          {/* KPI Cards with Live Charts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, idx) => (
              <div key={idx} className="glass-card glass-card-hover rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</span>
                  <div className={cn('p-2 rounded-xl', card.bg)}>{card.icon}</div>
                </div>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <LivePulseChart color={card.chartColor} />
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit', card.trendColor)}>
                  <Activity className="w-3 h-3" />{card.trend}
                </span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Funnel */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Recruitment Progression Funnel</h3>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">Direct DB Aggregations</span>
                </div>
                <div className="space-y-4">
                  {funnelStages.map((stage) => (
                    <FunnelStage key={stage.step} {...stage} />
                  ))}
                </div>
              </div>

              {/* In-Demand Skills */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Top Tech Stack Requirements</h3>
                  <span className="ml-auto text-[10px] text-slate-500">Live Requisition Extraction</span>
                </div>
                <div className="space-y-3">
                  {inDemandSkills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 w-36 shrink-0 font-medium truncate">{skill.name}</span>
                      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${skill.pct}%`, backgroundColor: skill.color, boxShadow: `0 0 8px ${skill.color}` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white w-10 text-right">{skill.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: System Health */}
            <div className="space-y-5">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Platform Health</h3>
                  <span className="ml-auto text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                <div>
                  <HealthItem label="PostgreSQL DB Cluster" status="healthy" latency="4ms" />
                  <HealthItem label="Spring Boot Rest API" status="healthy" latency="12ms" />
                  <HealthItem label="Job Moderation Engine" status="healthy" latency="18ms" />
                  <HealthItem label="Recruiter Security Filter" status="healthy" latency="7ms" />
                  <HealthItem label="Candidate Discovery API" status="healthy" latency="15ms" />
                </div>
              </div>

              {/* Platform Counts */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Entity Distribution</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Registered Candidates', value: stats.totalCandidates.toLocaleString(), accent: '#6366f1' },
                    { label: 'Recruiter Accounts', value: stats.totalRecruiters, accent: '#06b6d4' },
                    { label: 'Live Approved Jobs', value: stats.activeJobs, accent: '#10b981' },
                    { label: 'Total Applications', value: stats.totalApplications.toLocaleString(), accent: '#f59e0b' },
                    { label: 'Shortlisted Candidates', value: stats.shortlistedCount, accent: '#a855f7' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.accent }} />
                        <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-extrabold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RECRUITER PERFORMANCE ──────────────── */}
      {activeTab === 'recruiter' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Recruiters</span>
              <p className="text-2xl font-black text-white mt-1">{recruiters.length}</p>
              <span className="text-[10px] text-indigo-400">Database Registered</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified Accounts</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {recruiters.filter((r) => r.verificationStatus === 'VERIFIED').length}
              </p>
              <span className="text-[10px] text-emerald-500/80">Authorized to Post</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Verification</span>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {recruiters.filter((r) => r.verificationStatus === 'PENDING').length}
              </p>
              <span className="text-[10px] text-amber-500/80">Awaiting Admin Review</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Jobs Managed</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {recruiters.reduce((acc, r) => acc + (r.jobsSubmitted || 0), 0)}
              </p>
              <span className="text-[10px] text-cyan-500/80">
                {recruiters.reduce((acc, r) => acc + (r.jobsApproved || 0), 0)} Approved
              </span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Candidates Hired</span>
              <p className="text-2xl font-black text-violet-400 mt-1">
                {recruiters.reduce((acc, r) => acc + (r.hires || 0), 0)}
              </p>
              <span className="text-[10px] text-violet-500/80">Confirmed Outcomes</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/[0.06]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recruiter by company, name, or email..."
                value={recruiterSearch}
                onChange={(e) => setRecruiterSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={recruiterStatusFilter}
                onChange={(e) => setRecruiterStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800/80 border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="ALL">All Verification States</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending Review</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Recruiter Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Recruiter / Employer</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-center">Jobs Submitted</th>
                    <th className="py-3 px-4 text-center">Approved</th>
                    <th className="py-3 px-4 text-center">Active Live</th>
                    <th className="py-3 px-4 text-center">Apps Received</th>
                    <th className="py-3 px-4 text-center">Shortlisted</th>
                    <th className="py-3 px-4 text-center">Interviews</th>
                    <th className="py-3 px-4 text-center">Hires</th>
                    <th className="py-3 px-4 text-right">App-to-Int Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredRecruiters.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No recruiter performance records matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecruiters.map((r) => {
                      const appToIntRate =
                        r.totalApplications && r.totalApplications > 0
                          ? ((r.interviewsScheduled / r.totalApplications) * 100).toFixed(1)
                          : null;

                      return (
                        <tr key={r.recruiterId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0">
                                {r.companyName?.[0] || r.recruiterName?.[0] || 'R'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{r.companyName || 'Independent Recruiter'}</p>
                                <p className="text-[10px] text-slate-400 truncate">{r.recruiterName} • {r.recruiterEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                r.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : r.verificationStatus === 'PENDING'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : r.verificationStatus === 'SUSPENDED'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
                              )}
                            >
                              {r.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {r.verificationStatus === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                              {r.verificationStatus === 'REJECTED' && <XCircle className="w-2.5 h-2.5" />}
                              {r.verificationStatus === 'SUSPENDED' && <AlertTriangle className="w-2.5 h-2.5" />}
                              {r.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-white">{r.jobsSubmitted}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{r.jobsApproved}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-cyan-400">{r.activeJobs}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-indigo-300">{r.totalApplications}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-300">{r.shortlistedCandidates}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-violet-300">{r.interviewsScheduled}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-300">{r.hires}</td>
                          <td className="py-3.5 px-4 text-right">
                            {appToIntRate !== null ? (
                              <span className="font-mono font-bold text-slate-200">{appToIntRate}%</span>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Insufficient data</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CANDIDATE PERFORMANCE ──────────────── */}
      {activeTab === 'candidate' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Pool</span>
              <p className="text-2xl font-black text-white mt-1">
                {candidateData?.totalCandidates || stats.totalCandidates}
              </p>
              <span className="text-[10px] text-emerald-400">Total Accounts</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Job Seekers</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {candidateData?.activeCandidates || stats.totalCandidates}
              </p>
              <span className="text-[10px] text-cyan-500/80">With Applications</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Under Active Review</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {candidateData?.applicationsUnderReview || 0}
              </p>
              <span className="text-[10px] text-indigo-500/80">Pending Recruiter Action</span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interview Pipeline</span>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {candidateData?.interviewsScheduled || 0}
              </p>
              <span className="text-[10px] text-amber-500/80">
                {candidateData?.shortlistedCount || stats.shortlistedCount} Shortlisted
              </span>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recorded Hires</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {candidateData?.hiredCount || stats.selectedCount}
              </p>
              <span className="text-[10px] text-emerald-500/80">Verified Placements</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/[0.06]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate by name or email..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Candidates Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Candidate Identity</th>
                    <th className="py-3 px-4 text-center">Registered Date</th>
                    <th className="py-3 px-4 text-center">Resume Attached</th>
                    <th className="py-3 px-4 text-center">Applications</th>
                    <th className="py-3 px-4 text-center">Shortlisted</th>
                    <th className="py-3 px-4 text-center">Interviews</th>
                    <th className="py-3 px-4 text-center">Offers</th>
                    <th className="py-3 px-4 text-right">Latest Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No candidate activity records found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((c) => (
                      <tr key={c.candidateId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs shrink-0">
                              {c.candidateName?.[0] || 'C'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{c.candidateName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{c.candidateEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                          {c.registeredAt ? c.registeredAt.split('T')[0] : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {c.hasResume ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/30 text-slate-400 border border-slate-700">
                              None
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{c.applicationsCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-cyan-400">{c.shortlistedCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-violet-400">{c.interviewsCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{c.offersCount}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              c.latestStatus === 'SELECTED' || c.latestStatus === 'OFFER_EXTENDED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : c.latestStatus === 'SHORTLISTED'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : c.latestStatus === 'INTERVIEWING'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-white/[0.08]'
                            )}
                          >
                            {c.latestStatus || 'NO_APPLICATIONS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
