import React, { useState, useEffect } from 'react';
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
  BarChart3
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminStats, SystemActivityLog } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatFullDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, logsData] = await Promise.all([
        adminService.getStats(),
        adminService.getActivityLogs()
      ]);
      setStats(statsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>{stats.systemHealth}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Governance & Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoring <span className="font-bold text-white">{stats.totalCandidates.toLocaleString()} candidates</span>,{' '}
              <span className="font-bold text-white">{stats.totalRecruiters} verified recruiters</span>, and{' '}
              <span className="font-bold text-emerald-400">{stats.activeJobs} active requisitions</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin/analytics">
              <Button variant="glow" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Platform Analytics
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidates</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalCandidates.toLocaleString()}</p>
          <Link to="/admin/users" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-2 inline-flex items-center gap-1">
            <span>User directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recruiters</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalRecruiters}</p>
          <Link to="/admin/recruiters" className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold mt-2 inline-flex items-center gap-1">
            <span>Verification queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{stats.activeJobs}</p>
          <Link to="/admin/jobs" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold mt-2 inline-flex items-center gap-1">
            <span>Moderate requisitions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Rate</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{stats.placementRate}%</p>
          <p className="text-[11px] text-slate-400 mt-2">{stats.selectedCount} hires recorded</p>
        </Card>
      </div>

      {/* Split Section: Quick Links & Live System Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance Controls */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight">Administrative Modules</h3>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">User Management</h4>
                  <p className="text-[11px] text-slate-400">Manage candidate & recruiter accounts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/recruiters"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Recruiter Verification</h4>
                  <p className="text-[11px] text-slate-400">Review company employer credentials</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/admin/jobs"
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Job Moderation</h4>
                  <p className="text-[11px] text-slate-400">Approve or flag job requisitions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Platform Activity Stream</h3>
            <span className="text-xs text-slate-500">Live Event Log</span>
          </div>

          <Card glass className="p-4 divide-y divide-slate-800/60">
            {logs.map((log) => (
              <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.actorName}</span>
                    <Badge variant={log.actorRole === 'candidate' ? 'primary' : log.actorRole === 'recruiter' ? 'info' : 'warning'} size="sm">
                      {log.actorRole}
                    </Badge>
                  </div>
                  <p className="text-slate-300">
                    {log.action}: <span className="font-semibold text-slate-100">{log.target}</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
