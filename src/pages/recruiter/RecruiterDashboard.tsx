import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Award,
  TrendingUp,
  PlusCircle,
  Building2,
  ArrowRight,
  Sparkles,
  Clock,
  Eye
} from 'lucide-react';
import { recruiterService } from '../../services';
import { RecruiterStats, Job, Application } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';

export const RecruiterDashboard: React.FC = () => {
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, jobsData, applicantsData] = await Promise.all([
        recruiterService.getStats(),
        recruiterService.getPostedJobs(),
        recruiterService.getAllApplicants()
      ]);
      setStats(statsData);
      setRecentJobs(jobsData.slice(0, 4));
      setRecentApplicants(applicantsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load recruiter dashboard', err);
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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recruitment Operations & Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recruiter Command Center 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You have <span className="font-bold text-white">{stats.activeJobs} active job requisitions</span> and{' '}
              <span className="font-bold text-emerald-400">{stats.totalApplicants} candidate submissions</span> in your pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/recruiter/jobs/new">
              <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Post New Opening
              </Button>
            </Link>
            <Link to="/recruiter/applicants">
              <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                Applicant Pipeline
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.activeJobs}</p>
          <Link to="/recruiter/jobs" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-2 inline-flex items-center gap-1">
            <span>Manage listings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalApplicants}</p>
          <Link to="/recruiter/applicants" className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold mt-2 inline-flex items-center gap-1">
            <span>Open pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Interview</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{stats.interviewsScheduled}</p>
          <p className="text-[11px] text-slate-400 mt-2">{stats.shortlisted} candidates shortlisted</p>
        </Card>

        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hires This Month</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{stats.hiresThisMonth}</p>
          <p className="text-[11px] text-slate-400 mt-2">Avg {stats.averageTimeToHireDays} days to offer</p>
        </Card>
      </div>

      {/* Split Section: Active Job Postings & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Job Requisitions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Active Job Postings</h3>
            <Link to="/recruiter/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View all ({recentJobs.length})
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Card key={job.id} glass hoverEffect className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{job.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{job.department} • {job.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="primary" size="sm">{job.type}</Badge>
                      <span className="text-xs text-emerald-400 font-semibold">{job.applicantCount} applicants</span>
                    </div>
                  </div>
                  <Link to={`/recruiter/applicants?jobId=${job.id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Review
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Applicant Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Applicant Submissions</h3>
            <Link to="/recruiter/applicants" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Pipeline ({recentApplicants.length})
            </Link>
          </div>

          <div className="space-y-3">
            {recentApplicants.map((app) => {
              const badge = getStatusBadgeStyle(app.status);
              return (
                <Card key={app.id} glass hoverEffect className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={app.candidateAvatar}
                        alt={app.candidateName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{app.candidateName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{app.jobTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">ATS Match</span>
                        <span className="text-xs font-extrabold text-emerald-400">{app.atsScore}/100</span>
                      </div>
                      <Link to="/recruiter/applicants">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
