import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminStats } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';

export const PlatformAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
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
        <Skeleton className="h-40" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const inDemandSkills = [
    { name: 'React & Next.js', count: 184, percentage: 92 },
    { name: 'TypeScript', count: 172, percentage: 86 },
    { name: 'Java & Spring Boot', count: 156, percentage: 78 },
    { name: 'PostgreSQL & SQL Tuning', count: 148, percentage: 74 },
    { name: 'Docker & Kubernetes', count: 132, percentage: 66 },
    { name: 'AWS & Cloud Architecture', count: 120, percentage: 60 },
    { name: 'Apache Kafka & Event Streaming', count: 98, percentage: 49 },
    { name: 'AI / LLM Fine-Tuning & Vector DBs', count: 85, percentage: 42 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Intelligence & Market Trends</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Analytics & Hiring Velocity</h1>
        <p className="text-xs text-slate-400">
          Aggregated insights on candidate supply, recruitment funnel conversion, and skill market demands.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-5">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Submissions</span>
          <p className="text-2xl font-extrabold text-white">{stats.totalApplications.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +14.2% this month
          </span>
        </Card>

        <Card glass className="p-5">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Shortlisted Pool</span>
          <p className="text-2xl font-extrabold text-indigo-400">{stats.shortlistedCount}</p>
          <span className="text-[11px] text-slate-400 block mt-1">20.4% conversion rate</span>
        </Card>

        <Card glass className="p-5">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Offers Extended</span>
          <p className="text-2xl font-extrabold text-emerald-400">{stats.selectedCount}</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> 7.4% offer rate
          </span>
        </Card>

        <Card glass className="p-5">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Placement Efficiency</span>
          <p className="text-2xl font-extrabold text-purple-400">{stats.placementRate}%</p>
          <span className="text-[11px] text-slate-400 block mt-1">15.2 days avg turnaround</span>
        </Card>
      </div>

      {/* Split Section: Application Funnel vs Top In-Demand Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Pipeline Funnel */}
        <Card glass className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Applicant Progression Funnel
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">1. Applications Received</span>
                <span className="text-white font-mono">{stats.totalApplications} (100%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-600 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">2. Automated ATS Screened</span>
                <span className="text-white font-mono">3,240 (77.3%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-purple-600 rounded-full w-[77.3%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">3. Shortlisted for Recruiter Review</span>
                <span className="text-white font-mono">{stats.shortlistedCount} (20.1%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-blue-600 rounded-full w-[20.1%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">4. Final Offers & Selected</span>
                <span className="text-emerald-400 font-mono">{stats.selectedCount} (7.4%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full w-[7.4%]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Top In-Demand Skills */}
        <Card glass className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Most In-Demand Engineering Skills
          </h3>

          <div className="space-y-3 pt-2">
            {inDemandSkills.map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{skill.name}</span>
                  <span className="text-slate-400">{skill.count} requisitions ({skill.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
