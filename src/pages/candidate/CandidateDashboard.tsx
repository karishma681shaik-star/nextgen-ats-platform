import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Gauge,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateService, jobService } from '../../services';
import { CandidateProfile, Resume, ATSAnalysis, Job, Application } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStatusBadgeStyle, formatCurrency } from '../../utils/formatters';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [profData, resData, atsData, jobsData, appsData] = await Promise.all([
          candidateService.getProfile(),
          candidateService.getResumes(),
          candidateService.getATSAnalysis(),
          jobService.getRecommendedJobs(3),
          candidateService.getApplications()
        ]);
        setProfile(profData);
        setResumes(resData);
        setAtsAnalysis(atsData);
        setRecommendedJobs(jobsData);
        setApplications(appsData);
      } catch (err) {
        console.error('Failed to load candidate dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950/70 border border-indigo-500/30 p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Intelligence Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.name || user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your profile is optimized. Your primary resume currently holds an ATS benchmark score of{' '}
              <span className="font-bold text-emerald-400">{atsAnalysis?.overallScore || 86}/100</span> with 3 active job applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/candidate/resume-parser">
              <Button variant="glow" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                AI Resume Parser
              </Button>
            </Link>
            <Link to="/candidate/jobs">
              <Button variant="secondary" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
                Explore Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ATS Score Card */}
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATS Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{atsAnalysis?.overallScore || 86}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <Badge variant="success" size="sm" className="ml-auto">Top 10%</Badge>
          </div>
          <Link
            to="/candidate/resume-analysis"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-flex items-center gap-1"
          >
            <span>View analysis breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Profile Completion */}
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Status</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{profile?.profileCompletion || 88}% Complete</span>
              <span className="text-[11px] text-slate-400">Level 4</span>
            </div>
            <ProgressBar value={profile?.profileCompletion || 88} showPercentage={false} size="sm" />
          </div>
          <Link
            to="/candidate/profile"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-flex items-center gap-1"
          >
            <span>Update profile sections</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Active Resumes */}
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Resume</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-bold text-white truncate">{primaryResume?.fileName || 'Resume_2026.pdf'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{resumes.length} document(s) uploaded</p>
          <Link
            to="/candidate/resumes"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-flex items-center gap-1"
          >
            <span>Manage resume files</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Applications Summary */}
        <Card glass hoverEffect className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applications</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{applications.length}</span>
            <span className="text-xs text-slate-400">Active</span>
            <span className="ml-auto text-xs font-semibold text-emerald-400">1 in Interview</span>
          </div>
          <Link
            to="/candidate/applications"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-flex items-center gap-1"
          >
            <span>Track application pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/candidate/resumes"
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Upload Resume</h4>
            <p className="text-[10px] text-slate-400">PDF or DOCX</p>
          </div>
        </Link>

        <Link
          to="/candidate/resume-parser"
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Parse Resume</h4>
            <p className="text-[10px] text-slate-400">Extract skills & info</p>
          </div>
        </Link>

        <Link
          to="/candidate/resume-analysis"
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">ATS Analysis</h4>
            <p className="text-[10px] text-slate-400">Keywords & advice</p>
          </div>
        </Link>

        <Link
          to="/candidate/jobs"
          className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Explore Jobs</h4>
            <p className="text-[10px] text-slate-400">AI-ranked positions</p>
          </div>
        </Link>
      </div>

      {/* Main Split Section: Recommended Jobs & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Top Matched Job Recommendations</h3>
              <p className="text-xs text-slate-400">Positions matching your skills and experience</p>
            </div>
            <Link to="/candidate/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View all ({recommendedJobs.length + 2})
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <Card key={job.id} glass hoverEffect className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700/80 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/candidate/jobs/${job.id}`} className="font-bold text-sm text-white hover:text-indigo-400 transition-colors">
                          {job.title}
                        </Link>
                        {job.matchScore && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.company} • <span className="text-slate-300">{job.location}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {job.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                        </span>
                        {job.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <Button variant="primary" size="sm">
                        View & Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Applications Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Applications</h3>
              <p className="text-xs text-slate-400">Live recruitment status</p>
            </div>
            <Link to="/candidate/applications" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Details
            </Link>
          </div>

          <Card glass className="p-4 divide-y divide-slate-800/60">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No applications submitted yet.</p>
            ) : (
              applications.map((app) => {
                const badge = getStatusBadgeStyle(app.status);
                return (
                  <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{app.jobTitle}</p>
                        <p className="text-[11px] text-slate-400 truncate">{app.company}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-semibold text-emerald-400">{app.atsScore}/100 ATS</span>
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {/* Quick AI Tip Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>ATS Optimization Insight</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Adding <span className="text-indigo-200 font-semibold">"Kubernetes"</span> and <span className="text-indigo-200 font-semibold">"Kafka"</span> to your experience highlights could increase your interview selection rate by up to 18%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
