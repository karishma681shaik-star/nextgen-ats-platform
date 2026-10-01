import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  Sparkles,
  ArrowUpRight,
  Activity,
  Shield,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminStats } from '../../types';
import { cn } from '../../utils/cn';

// ─── Live Pulse Chart (Simulated) ────────────────────────────────────────────
const LivePulseChart: React.FC<{ color: string }> = ({ color }) => {
  const [points, setPoints] = useState<number[]>(() => Array.from({ length: 24 }, () => Math.random() * 60 + 20));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPoints((prev) => {
        const next = [...prev.slice(1), Math.random() * 60 + 20];
        return next;
      });
    }, 1500);
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
      {/* Last dot */}
      <circle cx={100} cy={55 - normalize(points[points.length - 1])} r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
        <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

// ─── System Health Indicator ─────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export const PlatformAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAnalytics();
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

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
    { name: 'AWS & Cloud', count: 120, pct: 60, color: '#f59e0b' },
    { name: 'Apache Kafka', count: 98, pct: 49, color: '#ec4899' },
    { name: 'AI / LLM Fine-Tuning', count: 85, pct: 42, color: '#14b8a6' },
  ];

  const funnelStages = [
    { step: '1', label: 'Applications Received', count: stats.totalApplications, pct: 100, color: '#6366f1', glowColor: 'rgba(99,102,241,0.4)' },
    { step: '2', label: 'ATS Auto-Screened', count: Math.round(stats.totalApplications * 0.773), pct: 77, color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.4)' },
    { step: '3', label: 'Shortlisted for Review', count: stats.shortlistedCount, pct: 20, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.4)' },
    { step: '4', label: 'Interview Stage', count: Math.round(stats.shortlistedCount * 0.6), pct: 12, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)' },
    { step: '5', label: 'Offers & Selected', count: stats.selectedCount, pct: 7, color: '#10b981', glowColor: 'rgba(16,185,129,0.4)' },
  ];

  const kpiCards = [
    { title: 'Total Applications', value: stats.totalApplications.toLocaleString(), trend: '+14.2%', icon: <Briefcase className="w-5 h-5 text-indigo-400" />, bg: 'bg-indigo-500/10', trendColor: 'text-emerald-400 bg-emerald-500/10', chartColor: '#6366f1' },
    { title: 'Shortlisted Pool', value: stats.shortlistedCount, trend: '20.4% rate', icon: <Users className="w-5 h-5 text-cyan-400" />, bg: 'bg-cyan-500/10', trendColor: 'text-cyan-400 bg-cyan-500/10', chartColor: '#06b6d4' },
    { title: 'Offers Extended', value: stats.selectedCount, trend: '7.4% rate', icon: <Award className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10', trendColor: 'text-emerald-400 bg-emerald-500/10', chartColor: '#10b981' },
    { title: 'Placement Rate', value: `${stats.placementRate}%`, trend: '15.2 day avg', icon: <TrendingUp className="w-5 h-5 text-violet-400" />, bg: 'bg-violet-500/10', trendColor: 'text-violet-400 bg-violet-500/10', chartColor: '#a855f7' },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Live System Intelligence</span>
            <span className="flex h-1.5 w-1.5 ml-1">
              <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time recruitment intelligence, funnel metrics, and market skill insights.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.07] text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-mono font-bold text-white">{currentTime.toLocaleTimeString()}</span>
          <span className="text-slate-600">live feed</span>
        </div>
      </div>

      {/* ── KPI Cards with Live Charts ────────────────── */}
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
              <ArrowUpRight className="w-3 h-3" />{card.trend}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Funnel + Skills (left 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recruitment Funnel */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Applicant Progression Funnel</h3>
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
              <h3 className="text-sm font-bold text-white">Most In-Demand Skills</h3>
              <span className="ml-auto text-[10px] text-slate-500">This Quarter</span>
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
          {/* System Health */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white">System Health</h3>
              <span className="ml-auto text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            </div>
            <div>
              <HealthItem label="AI Parser Workers" status="healthy" latency="42ms" />
              <HealthItem label="API Gateway" status="healthy" latency="12ms" />
              <HealthItem label="Database Cluster" status="healthy" latency="8ms" />
              <HealthItem label="Search Index (Elastic)" status="healthy" latency="24ms" />
              <HealthItem label="Email Notifications" status="warning" />
              <HealthItem label="CDN & Asset Delivery" status="healthy" latency="6ms" />
            </div>
          </div>

          {/* Global Platform Stats */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Globe className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Platform Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Candidates', value: stats.totalCandidates?.toLocaleString() || '12,847', accent: '#6366f1' },
                { label: 'Active Recruiters', value: stats.totalRecruiters || '384', accent: '#06b6d4' },
                { label: 'Live Job Postings', value: stats.activeJobs || '1,204', accent: '#10b981' },
                { label: 'Resumes Parsed (Today)', value: '247', accent: '#f59e0b' },
                { label: 'AI ATS Checks Run', value: '1,832', accent: '#a855f7' },
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

          {/* Security Audit Log */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Security Audit</h3>
            </div>
            <div className="space-y-2">
              {[
                { event: 'New recruiter verified', time: '2m ago', color: 'text-emerald-400' },
                { event: 'Job flagged for review', time: '8m ago', color: 'text-amber-400' },
                { event: 'Mass apply attempt blocked', time: '15m ago', color: 'text-rose-400' },
                { event: 'Admin login from new IP', time: '1h ago', color: 'text-violet-400' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                  <p className={cn('text-[11px] font-medium', log.color)}>{log.event}</p>
                  <span className="text-[10px] text-slate-600 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
